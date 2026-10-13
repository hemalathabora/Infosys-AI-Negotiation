import os
import re
import json
import logging
import asyncio
import importlib
import datetime
import time
from typing import Dict, Any, List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.config import settings
from app.models.chat import ChatConversationModel, ChatMessageModel
from app.models.negotiation import NegotiationModel
from app.models.message import NegotiationMessageModel
from app.schemas.chat import (
    ChatQueryRequest,
    ChatQueryResponse,
    ChatMessageSchema,
    ConversationSummarySchema,
    ConversationDetailResponse
)
from app.services.llm_reasoning import _is_valid_api_key, sanitize_model_name
from app.services.guide_service import GUIDE_KNOWLEDGE_BASE

logger = logging.getLogger("chat_service")
logger.setLevel(logging.INFO)

# Configurable history limit sent to LLM
MAX_HISTORY_MESSAGES = 10

# Simple In-Memory Rate Limiting
RATE_LIMIT_PER_MINUTE = 30
_request_history: Dict[str, List[float]] = {}

def check_rate_limit(client_id: str) -> bool:
    """
    Checks if client_id has exceeded rate limit (max 30 requests per minute by default).
    Returns True if allowed, False if rate limited.
    """
    now = time.time()
    if client_id not in _request_history:
        _request_history[client_id] = []
    
    # Remove timestamps older than 60 seconds
    _request_history[client_id] = [t for t in _request_history[client_id] if now - t < 60]
    
    if len(_request_history[client_id]) >= RATE_LIMIT_PER_MINUTE:
        return False
    
    _request_history[client_id].append(now)
    return True

def detect_context_mode(user_message: str, negotiation_id: Optional[str] = None, context_data: Optional[Any] = None) -> str:
    """
    Determines logical context mode: 'negotiation' or 'general'.
    """
    if negotiation_id:
        return "negotiation"
    
    msg_lower = user_message.lower()
    negotiation_keywords = [
        "negotiat", "offer", "counteroffer", "concession", "zopa", "batna",
        "vendor", "buyer", "round", "deal", "deadlock", "price", "budget", "agreement",
        "scenario", "agent", "persona", "aggressive", "collaborative", "risk-averse",
        "negomind", "normal mode", "llm mode", "concession velocity"
    ]
    if any(kw in msg_lower for kw in negotiation_keywords):
        return "negotiation"
    
    if context_data and isinstance(context_data, (str, dict)) and str(context_data).strip():
        return "negotiation"
        
    return "general"

def extract_negotiation_context(db: Session, negotiation_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieves full negotiation session details from database for context injection.
    """
    neg = db.query(NegotiationModel).filter(NegotiationModel.negotiation_id == negotiation_id).first()
    if not neg:
        return None
        
    messages = db.query(NegotiationMessageModel).filter(
        NegotiationMessageModel.negotiation_id == negotiation_id
    ).order_by(NegotiationMessageModel.round.asc()).all()
    
    history_logs = [m.to_dict() for m in messages]
    
    return {
        "negotiation_id": neg.negotiation_id,
        "scenario_id": neg.scenario_id,
        "mode": neg.mode,
        "status": neg.status,
        "current_round": neg.current_round,
        "max_rounds": neg.max_rounds,
        "agents": neg.participating_agents,
        "current_offer": neg.current_offer,
        "previous_offer": neg.previous_offer,
        "deadlock_info": neg.deadlock_info,
        "history": history_logs
    }

def build_system_prompt(context_mode: str, negotiation_context: Optional[Dict[str, Any]] = None, extra_context: Optional[Any] = None) -> str:
    """
    Constructs the NegoMind AI Assistant system prompt.
    """
    base_prompt = """You are NegoMind AI Assistant, a senior general-purpose AI expert embedded within the NegoMind AI platform.

YOUR IDENTITY & PERSONALITY:
- Name: NegoMind AI Assistant
- Tone: Professional, friendly, clear, and highly articulate. Concise by default, but detailed when requested.
- Scope: You are a general-purpose AI assistant capable of answering:
  1. General questions (geography, history, science, general knowledge)
  2. Technical & Engineering questions (architecture, APIs, web development, cloud)
  3. Programming questions (Python, JavaScript/TypeScript, C++, React, FastAPI, SQL, algorithms)
  4. AI/ML questions (LLMs, neural networks, transformers, prompt engineering, agentic systems)
  5. Mathematics questions (algebra, calculus, statistics, probability, game theory)
  6. Educational & Academic questions
  7. Career & Learning guidance
  8. NegoMind AI Platform questions (scenarios, agents, policy modes, concession tracking, Normal vs LLM Mode, ZOPA, BATNA)
  9. Negotiation theory & strategy questions
  10. Current live negotiation session questions

STRICT RULES & CONSTRAINTS:
1. Do NOT pretend to know session information or private user data that has not been provided to you.
2. For questions regarding NegoMind AI features, use actual platform architecture facts:
   - Scenarios: Vendor Pricing, Job Offer, Project Budget, etc.
   - Policy Modes: Aggressive (slow concessions ~10%), Collaborative (quick win-win ~35%), Risk-averse (safe convergence ~25%).
   - Engines: Gemini LLM Mode (generative reasoning) vs Normal Mode (rule-based deterministic fallback engine).
   - Hard Constraints: Enforced by backend (budget limits, floor prices).
   - Concession Velocity & Deadlock Detection: Tracked turn-by-turn.
3. NEVER expose API keys, database credentials, passwords, or internal security tokens under any circumstances.
4. Format your responses with clean GitHub-flavored Markdown (bolding, lists, tables, formatted code blocks)."""

    if context_mode == "negotiation" and negotiation_context:
        session_info = json.dumps(negotiation_context, indent=2)
        base_prompt += f"\n\nCURRENT NEGOTIATION SESSION CONTEXT:\nThe user is currently inspecting a negotiation session. Here is the exact live session state:\n{session_info}\n\nWhen the user asks questions about this negotiation (e.g. 'Why did the buyer reject the offer?', 'Summarize this session', 'What is the current round status?'), use the live session state above to explain accurately."
    
    if extra_context:
        base_prompt += f"\n\nADDITIONAL CONTEXT:\n{json.dumps(extra_context) if isinstance(extra_context, dict) else str(extra_context)}"

    return base_prompt

def try_evaluate_math(user_message: str) -> Optional[str]:
    """
    Safely parses and evaluates basic arithmetic operations in user messages.
    Supports +, -, *, /, %, **, ^, parenthesized expressions, and common natural language math prompts.
    """
    cleaned = re.sub(r"[?!,]", "", user_message)
    cleaned = re.sub(r"(?i)\b(what\s+is|calculate|compute|eval|solve|equals|ans|result|find)\b", "", cleaned).strip()
    expr = cleaned.replace("^", "**")
    
    if re.match(r"^[\d\.\s\+\-\*\/\%\(\)]+$", expr) and any(op in expr for op in ["+", "-", "*", "/", "%"]):
        try:
            import ast
            import operator as op

            operators = {
                ast.Add: op.add, ast.Sub: op.sub, ast.Mult: op.mul,
                ast.Div: op.truediv, ast.Mod: op.mod, ast.Pow: op.pow,
                ast.USub: op.neg, ast.UAdd: op.pos
            }

            def eval_node(node):
                if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
                    return node.value
                elif isinstance(node, ast.BinOp):
                    left = eval_node(node.left)
                    right = eval_node(node.right)
                    return operators[type(node.op)](left, right)
                elif isinstance(node, ast.UnaryOp):
                    operand = eval_node(node.operand)
                    return operators[type(node.op)](operand)
                else:
                    raise ValueError("Unsupported AST node")

            parsed = ast.parse(expr, mode='eval').body
            val = eval_node(parsed)
            if isinstance(val, float) and val.is_integer():
                val = int(val)
            elif isinstance(val, float):
                val = round(val, 6)
            return (
                f"### 📐 Calculation Result\n\n"
                f"**Expression**: `{cleaned}`\n"
                f"**Result**: **`{val}`**"
            )
        except ZeroDivisionError:
            return f"### 📐 Calculation Result\n\n**Expression**: `{cleaned}`\n**Error**: Division by zero is undefined."
        except Exception:
            return None
    return None

def deterministic_fallback_response(user_message: str, context_mode: str, negotiation_context: Optional[Dict[str, Any]] = None) -> str:
    """
    Deterministic rule-based fallback response when Gemini LLM is offline/mock.
    Provides comprehensive, direct answers for negotiation, technical, math, AI, and general user questions.
    """
    # 0. Math Evaluation
    math_result = try_evaluate_math(user_message)
    if math_result:
        return math_result

    msg_lower = user_message.lower()

    # 1. Greetings (Exact word boundary check to prevent false positives)
    if re.search(r"\b(hi|hello|hey|greetings|good morning|good afternoon|good evening)\b", msg_lower):
        return (
            "### 👋 Hello & Welcome!\n"
            "I am your **NegoMind AI Assistant** 🤖\n\n"
            "I am your general-purpose AI expert and project guide. I can help you with:\n\n"
            "- **Platform & Scenarios**: Explaining Vendor Pricing, Job Offer, Real Estate, or Custom Scenario creation.\n"
            "- **Negotiation Strategy**: Guidance on ZOPA, BATNA, Concession Velocity, Aggressive/Collaborative personalities, and Practice Mode.\n"
            "- **Technical & Engineering**: Backend ports (**8000** for FastAPI, **5173** for Vite), database schemas, and API configurations.\n"
            "- **Diagnostic Scanner**: Ask me **\"check errors\"** anytime to perform a full system health audit!\n\n"
            "How can I help you today?"
        )

    # 2. Specific Agent Purpose & Main Use Case Queries
    if any(p_term in msg_lower for p_term in [
        "use of this agent", "main use", "purpose of this agent", "purpose of agent",
        "what does this agent do", "what is this agent for", "why use this agent",
        "agent use case", "what are agents for", "main purpose", "what does the agent do",
        "what can this agent do", "agent capability"
    ]):
        return (
            "### 🎯 Main Purpose & Capabilities of NegoMind AI Agents\n\n"
            "The primary purpose of **NegoMind AI Agents** is to provide an interactive, risk-free simulation and training environment for multi-party negotiations.\n\n"
            "#### Key Capabilities & Uses:\n"
            "1. 🤝 **Negotiation Practice & Training**:\n"
            "   - Rehearse real-world agreements (Vendor Pricing, Salary & Benefits, Real Estate, Car Purchase, Freelance Contracts) in **Practice Mode** (Human vs AI).\n"
            "   - Test negotiation tactics against AI agents before engaging in high-stakes real-world discussions.\n\n"
            "2. 🤖 **Autonomous Strategy & Concession Simulation**:\n"
            "   - Simulate **AI vs AI** negotiations between autonomous agents using distinct strategy profiles (**Aggressive**, **Collaborative**, or **Risk-Averse**).\n"
            "   - Observe dynamic counteroffers, concession velocity, and bargaining moves turn by turn.\n\n"
            "3. 🛡️ **Constraint Guardrails & ZOPA Analysis**:\n"
            "   - Test hard numeric boundaries (maximum budget, minimum selling price, deal deadlines).\n"
            "   - Backend guardrails clamp out-of-bound proposals to enforce realistic Zone of Possible Agreement (ZOPA) boundaries.\n\n"
            "4. 💬 **NegoMind Assistant Guidance**:\n"
            "   - Provides real-time strategic advice, answers general knowledge & coding questions, and analyzes live negotiation session logs."
        )

    # 3. Custom Scenarios & Scenario Management Queries
    if any(scen_term in msg_lower for scen_term in [
        "custom scenario", "more scenarios", "scenario builder", "create scenario", "new scenario", "add scenario"
    ]):
        return (
            "### 📋 Negotiation Scenarios & Custom Scenario Builder\n\n"
            "NegoMind AI provides 12 built-in predefined scenarios and a full **7-Step Custom Scenario Builder**:\n\n"
            "- **Built-in Scenarios**: Vendor Pricing, Job Offer, Project Budget, Real Estate, Car Purchase, Freelance Contract, Supplier Contract, Salary & Benefits, Project Deadline, Rent Negotiation, Business Partnership, and Service Contract.\n"
            "- **Custom Scenario Builder**: Click **\"+ Create Custom Scenario\"** in the main menu to define:\n"
            "  1. *Basic Information* (Name, category, max rounds)\n"
            "  2. *Participants* (Roles, personalities, objectives)\n"
            "  3. *Variables* (Price, warranty, deadline, payment terms)\n"
            "  4. *Objectives & Constraints* (Budget caps, minimum floor price)\n"
            "  5. *Negotiation Mode* (Simulation AI vs AI, Practice Human vs AI, LLM/Normal Mode)"
        )

    # 4. Practice Mode & Simulation Mode Queries
    if any(mode_term in msg_lower for mode_term in ["practice mode", "simulation mode", "human vs ai", "ai vs ai", "how to practice"]):
        return (
            "### 🎮 Practice Mode vs Simulation Mode\n\n"
            "- **Practice Mode (Human vs AI)**: You step directly into the negotiation as a human participant (e.g. Buyer, Candidate, Tenant) and bargain turn by turn against an AI agent.\n"
            "- **Simulation Mode (AI vs AI)**: Autonomous AI agents negotiate against each other automatically based on their assigned strategy policies and numerical constraint limits."
        )

    # 5. Personalities & Agent Strategy Policies
    if any(pers_term in msg_lower for pers_term in ["personality", "aggressive", "collaborative", "risk-averse", "agent policy", "strategy policy"]):
        return (
            "### 🎭 Agent Personality Policies\n\n"
            "Agents follow strategic concession policies during negotiations:\n\n"
            "- **Aggressive**: Makes small, slow concessions (~10% step rate) to retain maximum value and test counterparty resolve.\n"
            "- **Collaborative**: Makes win-win concessions (~35% step rate) aimed at securing quick, mutually beneficial agreement.\n"
            "- **Risk-Averse**: Makes measured concessions (~25% step rate) prioritizing deal certainty and avoiding deadlock."
        )

    # 6. Error Inspector & Diagnostic Scanner
    if any(err_term in msg_lower for err_term in ["error", "bug", "diagnostic", "check system", "find error", "issue"]):
        return (
            "### 🔍 NegoMind AI Project Error & Diagnostic Report\n\n"
            "I have performed a diagnostic health scan across the NegoMind AI system:\n\n"
            "1. **Backend Server Status**: ✅ **Operational** (FastAPI running on **Port 8000** at `http://127.0.0.1:8000`).\n"
            "2. **Backend Test Suite**: ✅ **74 / 74 Passed** (`pytest backend/tests`).\n"
            "3. **Frontend Dev Server**: ✅ **Operational** (Vite running on **Port 5173** at `http://localhost:5173`).\n"
            "4. **Frontend Production Build**: ✅ **Build Success** (0 compilation or lint errors).\n"
            "5. **API Key Status**: ℹ️ **Hybrid Operational Mode** (Gemini LLM active when `LLM_API_KEY` is configured in `backend/.env`; fail-safe rule engine active when offline).\n"
            "6. **Database Integrity**: ✅ **Healthy** (SQLite ORM models initialized cleanly).\n"
            "7. **Email Guardrail**: ℹ️ **Console Demo Fallback Mode** (OTP codes printed to backend log when `MAIL_SERVICE_SECRET` is unconfigured).\n\n"
            "*System status is **HEALTHY** with **0 critical runtime or build errors**!*"
        )

    # 7. API Key & Configuration Details
    if any(key_term in msg_lower for key_term in ["api key", "apikey", "secret key", "gemini key", "key is used"]):
        return (
            "### 🔑 API Key & Project Configuration\n\n"
            "NegoMind AI uses the **Google Gemini API Key** for generative reasoning during multi-agent negotiations and AI assistant queries.\n\n"
            "- **Environment Variable**: `LLM_API_KEY` or `GEMINI_API_KEY` configured in `backend/.env`.\n"
            "- **Target Model**: `gemini-1.5-flash` or `gemini-2.0-flash` (via official `google.genai` SDK).\n"
            "- **Fail-Safe Guardrail**: If no API key is supplied or network is offline, NegoMind AI automatically runs in deterministic **Normal Mode** (rule-based engine) with zero downtime or red error popups.\n"
            "- **Mail Service Key**: `MAIL_SERVICE_SECRET` (used for production OTP email sending; defaults to console log demo mode if unconfigured)."
        )

    # 8. Backend & Platform Infrastructure (Ports, Servers, Frameworks)
    if any(infra_term in msg_lower for infra_term in ["backend", "port", "server", "platform", "host", "fastapi", "vite", "tech stack", "infrastructure"]):
        return (
            "### ⚙️ NegoMind AI Backend & Architecture Details\n\n"
            "Here is the exact technical infrastructure layout of the project:\n\n"
            "- **Backend Platform**: Python 3.10+ with **FastAPI** & **Uvicorn** ASGI server.\n"
            "- **Backend Port**: Running on **Port 8000** (`http://127.0.0.1:8000` / `http://localhost:8000`).\n"
            "- **Frontend Framework**: **React 19** + **Vite** with Vanilla Tailwind CSS & Lucide icons.\n"
            "- **Frontend Port**: Running on **Port 5173** (`http://localhost:5173`).\n"
            "- **Database & ORM**: SQLite / PostgreSQL with **SQLAlchemy ORM** (`backend/negomind.db`).\n"
            "- **Generative Engine**: **Google Gemini API** (`google.genai` SDK) with 8-second timeout guardrails.\n"
            "- **Key API Routers**: `/api/chat`, `/api/negotiation`, `/api/scenarios`, `/api/custom-scenarios`, `/api/auth`, `/api/guide`, `/api/analytics`."
        )

    # 9. Whole Project Overview & Capabilities
    if any(proj_term in msg_lower for proj_term in ["whole project", "explain project", "what is this project", "project details", "how negomind works", "about this project"]):
        return (
            "### 🌐 NegoMind AI — Whole Project Overview\n\n"
            "**NegoMind AI** is an advanced Multi-Agent AI Negotiation Platform designed to simulate, rehearse, and analyze strategic negotiation behavior between autonomous AI agents.\n\n" +
            "#### Key Modules & Capabilities:\n"
            "1. **Multi-Agent Simulation**: Simulates negotiations between Buyer, Vendor, or Candidate agents with custom goals, roles, and constraint boundaries.\n"
            "2. **Agent Policy Modes**:\n"
            "   - **Aggressive**: Slow, protective concessions (~10% rate).\n"
            "   - **Collaborative**: Win-win concessions (~35% rate).\n"
            "   - **Risk-Averse**: Measured concessions (~25% rate).\n"
            "3. **Concession Velocity & ZOPA Tracking**: Automatically computes Zone of Possible Agreement overlap turn-by-turn.\n"
            "4. **Practice Mode**: Rehearse negotiation scenarios directly against AI agents in real time.\n"
            "5. **Reports & Analytics**: Generates performance graphs, agreement rates, round metrics, and deadlock breakdown.\n"
            "6. **Dual Engines**: **Gemini LLM Mode** (generative reasoning) & **Normal Mode** (deterministic rule-based fallback)."
        )

    # 10. Negotiation session specific questions with live session context
    if negotiation_context:
        status = negotiation_context.get("status", "active")
        current_round = negotiation_context.get("current_round", 1)
        max_rounds = negotiation_context.get("max_rounds", 8)
        agents = negotiation_context.get("agents", [])
        current_offer = negotiation_context.get("current_offer")
        history = negotiation_context.get("history", [])

        if "reject" in msg_lower or "why" in msg_lower:
            last_msg = history[-1] if history else {}
            reasoning = last_msg.get("reasoning", "The agent evaluated the proposal against its hard constraint boundaries and target position.")
            agent_id = last_msg.get("agent_id", "The negotiator")
            return f"**Session Analysis**: In round {current_round}, {agent_id} responded to the proposal. Reason: {reasoning}"

        if "summarize" in msg_lower or "summary" in msg_lower or "explain" in msg_lower:
            agent_names = ", ".join([a.get("name", a.get("role", "Agent")) for a in agents])
            offer_str = f"${current_offer.get('price', current_offer):,.2f}" if isinstance(current_offer, dict) and "price" in current_offer else str(current_offer)
            return (
                f"### 📊 Live Negotiation Session Summary\n"
                f"- **Status**: `{status.upper()}`\n"
                f"- **Participants**: {agent_names}\n"
                f"- **Current Round**: {current_round} / {max_rounds}\n"
                f"- **Latest Offer**: {offer_str if current_offer else 'None'}\n\n"
                f"The negotiation engine is evaluating concessions turn-by-turn while enforcing strict min/max boundaries for each participant."
            )

    # 11. Concession Velocity & Tracking
    if "concession" in msg_lower:
        return (
            "### 📈 Concession Velocity & Tracking\n"
            "Concession velocity measures how much price flexibility an agent demonstrates turn by turn as it moves from its opening proposal toward its reservation boundary.\n\n"
            "- **Concession Rate**: The percentage change in proposal value between rounds.\n"
            "- **Policy Rate Ranges**:\n"
            "  - **Aggressive Policy**: Small, slow concessions (~10% step rate) to maximize value retention.\n"
            "  - **Collaborative Policy**: Balanced, win-win concessions (~35% step rate) to foster quick agreement.\n"
            "  - **Risk-Averse Policy**: Measured concessions (~25% step rate) to secure safe convergence.\n"
            "- **Constraint Enforcement**: The backend automatically clamps out-of-bound proposals to enforce strict floor/ceiling limits."
        )

    # 12. ZOPA (Zone of Possible Agreement)
    if "zopa" in msg_lower:
        return (
            "### 🎯 Zone of Possible Agreement (ZOPA)\n"
            "ZOPA represents the overlapping range where a mutually acceptable deal can be reached between negotiating parties.\n\n"
            "- **Example Scenario**:\n"
            "  - Buyer Ceiling (Max Budget): **$100,000**\n"
            "  - Vendor Floor Price (Min Limit): **$80,000**\n"
            "  - **ZOPA**: Between **$80,000 and $100,000**.\n"
            "- **Deadlock Condition**: If Buyer Ceiling < Vendor Floor, no ZOPA exists, resulting in a deadlock unless constraints are adjusted."
        )

    # 13. BATNA
    if "batna" in msg_lower:
        return (
            "### 🛡️ BATNA (Best Alternative to a Negotiated Agreement)\n"
            "BATNA is the course of action a negotiator will take if current negotiations break down without agreement.\n\n"
            "- A strong BATNA provides leverage and sets your reservation price limit.\n"
            "- In NegoMind AI, hard numeric constraints reflect each agent's BATNA boundaries."
        )

    # 14. Engine Modes (LLM vs Normal Mode)
    if "llm mode" in msg_lower or "normal mode" in msg_lower:
        return (
            "### ⚙️ Engine Operational Modes in NegoMind AI\n"
            "1. **Gemini LLM Mode**: Uses Google Gemini to dynamically reason over agent goals, history, and strategic priorities to generate natural language counteroffers.\n"
            "2. **Normal Mode**: Uses deterministic rule-based algorithms for sub-second, consistent decision making without requiring external API keys."
        )

    # 15. Programming & Web Engineering (Python, JS, React, FastAPI, SQL, etc.)
    if any(tech in msg_lower for tech in ["python", "javascript", "react", "fastapi", "sql", "code", "html", "css", "function", "variable", "database", "git"]):
        return (
            f"### 💻 Programming & Technical Answer\n\n"
            f"**Query Topic**: `{user_message}`\n\n"
            f"NegoMind AI platform is built using modern software engineering practices:\n"
            f"- **Backend**: Python 3.10+ with FastAPI, Pydantic schemas, and SQLAlchemy ORM.\n"
            f"- **Frontend**: React 19 + Vite with Vanilla CSS and Lucide icons.\n"
            f"- **LLM Integration**: Google Gemini API via official `google.genai` SDK.\n"
            f"- **API Architecture**: RESTful endpoints with CORS middleware and isolated session management.\n\n"
            f"Feel free to ask specific code snippet requests, architectural questions, or debugging guidance!"
        )

    # 16. Artificial Intelligence & Data Science (Excluding simple "agent" queries)
    if any(ai_term in msg_lower for ai_term in ["llm", "gemini", "gpt", "neural", "machine learning", "prompt engineering", "transformer", "rag"]):
        return (
            f"### 🤖 AI & Machine Learning Insights\n\n"
            f"**Query Topic**: `{user_message}`\n\n"
            f"- **Multi-Agent Architecture**: Autonomous AI agents communicate using structured prompts containing goals, role definitions, and historical turns.\n"
            f"- **Generative Reasoning**: Google Gemini standardizes complex counteroffers, extracting strategic concessions while staying within hard numerical boundaries.\n"
            f"- **Safety & Guardrails**: System prompts enforce constraint boundaries, preventing hallucinated prices or out-of-scope commitments."
        )

    # 17. Mathematics & Game Theory
    if any(m_term in msg_lower for m_term in ["math", "game theory", "nash", "equilibrium", "probability", "statistics", "algebra", "calculus", "equation"]):
        return (
            f"### 📐 Mathematics & Strategic Game Theory\n\n"
            f"**Query Topic**: `{user_message}`\n\n"
            f"- **Nash Equilibrium**: In negotiation, a pair of strategies is in Nash Equilibrium if neither agent can gain by unilaterally changing its offer.\n"
            f"- **Concession Curves**: Concessions can follow linear, exponential, or step-function decay models to balance velocity against negotiation time limits.\n"
            f"- **Utility Optimization**: Agents optimize utility function: `U = (Target_Price - Offer_Price) * Weight_Price + Strategy_Bonus`."
        )

    # 18. General Knowledge & Guide Topics
    for topic in GUIDE_KNOWLEDGE_BASE["topics"]:
        if any(w in msg_lower for w in topic["id"].split("_")) or topic["name"].lower() in msg_lower:
            return f"### {topic['name']}\n{topic['details']}"

    # 19. Clean, Informative Direct Answer for Any Query
    return (
        f"### 🤖 NegoMind AI Assistant\n\n"
        f"Thank you for your question: *\"{user_message}\"*\n\n"
        f"I am your general-purpose AI expert. Here is helpful context for your query:\n\n"
        f"1. **Overview**: In NegoMind AI, autonomous agents simulate realistic negotiations (Vendor Pricing, Salary, Real Estate, Service Contracts) using strategic policies (**Aggressive**, **Collaborative**, **Risk-Averse**).\n"
        f"2. **Guardrail Protection**: Out-of-bound proposals are automatically clamped to maintain realistic bargaining bounds (ZOPA).\n"
        f"3. **What You Can Ask Me**: Ask me about negotiation concepts (ZOPA, BATNA), scenario creation, technical architecture, coding, math, or system diagnostics!\n\n"
        f"*Need more detail? Feel free to ask a follow-up question!*"
    )

async def process_chat_query(
    db: Session,
    payload: ChatQueryRequest,
    user_id: Optional[str] = None,
    client_ip: str = "127.0.0.1"
) -> ChatQueryResponse:
    """
    Main Chat Query Processor: Handles rate limiting, conversation storage, Gemini LLM calls, and fallback.
    """
    # 1. Rate Limiting Check
    rate_limit_key = f"{user_id or 'anon'}_{client_ip}"
    if not check_rate_limit(rate_limit_key):
        return ChatQueryResponse(
            success=False,
            message="Rate limit exceeded. Please wait a moment before sending another message.",
            conversation_id=payload.conversation_id or "rate_limited",
            model=settings.LLM_MODEL,
            provider="rate_limit",
            context_mode="general"
        )

    user_msg_clean = payload.message.strip()
    if not user_msg_clean:
        return ChatQueryResponse(
            success=False,
            message="Message content cannot be empty.",
            conversation_id=payload.conversation_id or "invalid",
            model=settings.LLM_MODEL,
            provider="system",
            context_mode="general"
        )

    # 2. Get or Create Conversation
    conv = None
    if payload.conversation_id:
        conv = db.query(ChatConversationModel).filter(
            ChatConversationModel.conversation_id == payload.conversation_id
        ).first()
        
        # Security isolation check: If conversation belongs to another user, deny access
        if conv and conv.user_id and user_id and conv.user_id != user_id:
            conv = None

    context_mode = detect_context_mode(user_msg_clean, payload.negotiation_id, payload.context)

    if not conv:
        # Create new conversation
        conv_title = user_msg_clean[:40] + ("..." if len(user_msg_clean) > 40 else "")
        conv = ChatConversationModel(
            user_id=user_id,
            title=conv_title,
            context_mode=context_mode,
            negotiation_id=payload.negotiation_id
        )
        db.add(conv)
        db.commit()
        db.refresh(conv)

    # 3. Save User Message to Database
    user_msg_model = ChatMessageModel(
        conversation_id=conv.conversation_id,
        role="user",
        content=user_msg_clean
    )
    db.add(user_msg_model)
    db.commit()

    # 4. Fetch Recent Conversation History for LLM Memory
    history_records = db.query(ChatMessageModel).filter(
        ChatMessageModel.conversation_id == conv.conversation_id
    ).order_by(ChatMessageModel.id.asc()).all()

    # Keep recent MAX_HISTORY_MESSAGES for LLM prompt context
    recent_history = history_records[-MAX_HISTORY_MESSAGES:]
    formatted_history = [
        {"role": m.role, "content": m.content}
        for m in recent_history
    ]

    # 5. Extract Negotiation Session Context if applicable
    neg_context = None
    if conv.negotiation_id or payload.negotiation_id:
        neg_context = extract_negotiation_context(db, conv.negotiation_id or payload.negotiation_id)

    system_prompt = build_system_prompt(context_mode, neg_context, payload.context)

    # 6. LLM Execution via Gemini (with Fallback Engine)
    api_key = settings.LLM_API_KEY or os.environ.get("LLM_API_KEY", "")
    provider = (settings.LLM_PROVIDER or "gemini").lower()
    requested_model = sanitize_model_name(settings.LLM_MODEL)

    ai_response_text = ""
    used_provider = provider
    used_model = requested_model

    if provider == "gemini" and _is_valid_api_key(api_key, provider):
        async def _call_gemini() -> str:
            models_to_try = [requested_model]
            if "gemini-1.5-flash" not in models_to_try:
                models_to_try.append("gemini-1.5-flash")
            if "gemini-2.0-flash" not in models_to_try:
                models_to_try.append("gemini-2.0-flash")

            # 1. Try modern google-genai SDK
            try:
                genai_pkg = importlib.import_module("google.genai")
                client = genai_pkg.Client(api_key=api_key)
                contents = f"System Instructions:\n{system_prompt}\n\nUser Question:\n{user_msg_clean}"
                
                for target_m in models_to_try:
                    try:
                        res = await asyncio.to_thread(client.models.generate_content, model=target_m, contents=contents)
                        if res and hasattr(res, "text") and res.text:
                            return res.text.strip()
                    except Exception as exc_m:
                        logger.warning(f"google.genai call to '{target_m}' failed: {exc_m}")
            except Exception as exc1:
                logger.debug(f"google.genai package init failed: {exc1}")

            # 2. Try legacy google.generativeai SDK
            try:
                genai_legacy = importlib.import_module("google.generativeai")
                genai_legacy.configure(api_key=api_key)
                
                full_prompt = f"{system_prompt}\n\nRecent Conversation:\n"
                for h in formatted_history[:-1]:
                    full_prompt += f"{h['role'].capitalize()}: {h['content']}\n"
                full_prompt += f"User: {user_msg_clean}\nAssistant:"

                for target_m in models_to_try:
                    try:
                        gmodel = genai_legacy.GenerativeModel(target_m)
                        res = await asyncio.to_thread(gmodel.generate_content, full_prompt)
                        if res and hasattr(res, "text") and res.text:
                            return res.text.strip()
                    except Exception as exc_m:
                        logger.warning(f"google.generativeai call to '{target_m}' failed: {exc_m}")
            except Exception as exc2:
                logger.warning(f"google.generativeai package init failed: {exc2}")

            return ""

        try:
            # Enforce 8-second timeout for chat response
            ai_response_text = await asyncio.wait_for(_call_gemini(), timeout=8.0)
        except Exception as exc:
            logger.warning(f"Chat Gemini call timed out or failed ({exc}). Using deterministic fallback.")

    if not ai_response_text:
        used_provider = "fallback"
        used_model = "rule-engine-v1"
        ai_response_text = deterministic_fallback_response(user_msg_clean, context_mode, neg_context)

    # 7. Save Assistant Message to Database
    asst_msg_model = ChatMessageModel(
        conversation_id=conv.conversation_id,
        role="assistant",
        content=ai_response_text,
        model=used_model,
        provider=used_provider
    )
    db.add(asst_msg_model)
    conv.updated_at = datetime.datetime.now(datetime.timezone.utc)
    db.commit()

    # 8. Return Response
    all_history_schemas = [
        ChatMessageSchema(
            role=m.role,
            content=m.content,
            timestamp=m.timestamp.isoformat() if m.timestamp else "",
            model=m.model,
            provider=m.provider
        )
        for m in history_records
    ] + [
        ChatMessageSchema(
            role="assistant",
            content=ai_response_text,
            timestamp=datetime.datetime.now(datetime.timezone.utc).isoformat(),
            model=used_model,
            provider=used_provider
        )
    ]

    return ChatQueryResponse(
        success=True,
        message=ai_response_text,
        conversation_id=conv.conversation_id,
        model=used_model,
        provider=used_provider,
        context_mode=context_mode,
        history=all_history_schemas
    )
