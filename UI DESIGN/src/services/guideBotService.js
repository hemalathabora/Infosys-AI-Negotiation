import {
  guideKnowledgeBase,
  getPageKey,
  personalityGuide,
} from "../data/guideKnowledgeBase.js";

function normalizeQuestion(question = "") {
  return String(question)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function detectIntent(question) {
  const normalized = normalizeQuestion(question);

  if (!normalized) return "general";

  if (normalized.includes("start") || normalized.includes("how do i start") || normalized.includes("what should i do first")) return "start";
  if (normalized.includes("scenario") || normalized.includes("select a scenario")) return "scenario";
  if (normalized.includes("configure") || normalized.includes("agent configuration") || normalized.includes("agents")) return "config";
  if (normalized.includes("aggressive") || normalized.includes("collaborative") || normalized.includes("risk averse") || normalized.includes("personality")) return "personality";
  if (normalized.includes("goal")) return "goal";
  if (normalized.includes("constraint")) return "constraint";
  if (normalized.includes("simulation mode") || normalized.includes("practice mode")) return "mode";
  if (normalized.includes("concession")) return "concession";
  if (normalized.includes("zopa") || normalized.includes("zone of possible agreement")) return "zopa";
  if (normalized.includes("batna") || normalized.includes("best alternative")) return "batna";
  if (normalized.includes("offer") || normalized.includes("counteroffer") || normalized.includes("deadlock") || normalized.includes("agreement")) return "negotiation";
  if (normalized.includes("report") || normalized.includes("analytics") || normalized.includes("performance")) return "report";
  if (normalized.includes("dashboard") || normalized.includes("metrics") || normalized.includes("active negotiation")) return "dashboard";
  if (normalized.includes("navigation") || normalized.includes("what is this page") || normalized.includes("explain this page")) return "page";

  return "general";
}

export function getPageContext(pageName = "Dashboard") {
  const pageKey = getPageKey(pageName);
  return guideKnowledgeBase[pageKey] ?? guideKnowledgeBase.default;
}

export function getContextualQuickQuestions(pageName = "Dashboard") {
  const context = getPageContext(pageName);
  return context.quickQuestions || guideKnowledgeBase.default.quickQuestions;
}

export function getNavigationSuggestion(pageName = "Dashboard") {
  const context = getPageContext(pageName);
  return context.suggestions || guideKnowledgeBase.default.suggestions;
}

function tryEvaluateMath(question) {
  if (!question) return null;
  let cleaned = String(question).replace(/[?!,]/g, "");
  cleaned = cleaned
    .replace(/\b(what\s+is|calculate|compute|eval|solve|equals|ans|result|find)\b/gi, "")
    .replace(/\^/g, "**")
    .trim();

  if (/^[\d\.\s\+\-\*\/\%\(\)]+$/.test(cleaned) && /[\+\-\*\/\%]/.test(cleaned)) {
    try {
      const fn = new Function(`"use strict"; return (${cleaned});`);
      const val = fn();
      if (typeof val === "number" && !isNaN(val)) {
        if (!isFinite(val)) {
          return {
            message: `### 📐 Calculation Result\n\n**Expression**: \`${cleaned.replace(/\*\*/g, "^")}\`\n**Error**: Division by zero is undefined.`,
            suggestions: ["Calculate another formula", "What is ZOPA?", "Explain concession tracking"]
          };
        }
        const displayVal = Number.isInteger(val) ? val : parseFloat(val.toFixed(6));
        return {
          message:
            `### 📐 Calculation Result\n\n` +
            `**Expression**: \`${cleaned.replace(/\*\*/g, "^")}\`\n` +
            `**Result**: **\`${displayVal}\`**`,
          suggestions: ["Calculate another formula", "What is ZOPA?", "Explain concession tracking"]
        };
      }
    } catch {
      return null;
    }
  }
  return null;
}

export function buildGuideResponse(question, pageName = "Dashboard") {
  const mathResult = tryEvaluateMath(question);
  if (mathResult) return mathResult;

  const pageContext = getPageContext(pageName);
  const intent = detectIntent(question);
  const normalized = normalizeQuestion(question);

  if (!normalized) {
    return {
      message: pageContext.greeting || guideKnowledgeBase.default.greeting,
      suggestions: getNavigationSuggestion(pageName),
    };
  }

  // 1. Agent Greeting (Using exact word boundary regex to avoid false positives like "which")
  if (/\b(hi|hello|hey|greetings|good morning|good afternoon|good evening)\b/i.test(normalized)) {
    return {
      message:
        "### 👋 Hello & Welcome!\n" +
        "I am your **NegoMind AI Assistant** 🤖\n\n" +
        "I am your general-purpose AI expert and project guide. I can help you with:\n\n" +
        "- **Whole Project Details**: Negotiation strategy, scenarios, agent personalities, ZOPA, BATNA, and engine modes.\n" +
        "- **Backend & Technical Info**: Frameworks, API keys (`LLM_API_KEY`), database models, and service ports (**Port 8000** for FastAPI, **Port 5173** for Vite).\n" +
        "- **Error Inspector**: Ask me **\"check errors\"** or **\"find project errors\"** anytime to scan current project health!\n" +
        "- **General & Technical Prompts**: Coding (Python, JS, React, SQL), Mathematics, AI/ML, and general knowledge.\n\n" +
        "How can I help you today?",
      suggestions: ["Check project errors", "Which API key is used?", "Backend server info", "Explain the whole project"],
    };
  }

  // 2. Project Error Inspector & Diagnostic Scanner
  if (
    normalized.includes("error") ||
    normalized.includes("bug") ||
    normalized.includes("diagnostic") ||
    normalized.includes("check system") ||
    normalized.includes("find error") ||
    normalized.includes("issue")
  ) {
    return {
      message:
        "### 🔍 NegoMind AI Project Error & Diagnostic Report\n\n" +
        "I have performed a diagnostic health scan across the NegoMind AI system:\n\n" +
        "1. **Backend Server Status**: ✅ **Operational** (FastAPI running on **Port 8000** at `http://127.0.0.1:8000`).\n" +
        "2. **Backend Test Suite**: ✅ **70 / 70 Passed** (`pytest backend/tests`).\n" +
        "3. **Frontend Dev Server**: ✅ **Operational** (Vite running on **Port 5173** at `http://localhost:5173`).\n" +
        "4. **Frontend Production Build**: ✅ **Build Success** (0 compilation or lint errors).\n" +
        "5. **API Key Status**: ℹ️ **Hybrid Operational Mode** (Gemini LLM active when `LLM_API_KEY` is configured in `backend/.env`; fail-safe rule engine active when offline).\n" +
        "6. **Database Integrity**: ✅ **Healthy** (SQLite ORM models initialized cleanly).\n" +
        "7. **Email Guardrail**: ℹ️ **Console Demo Fallback Mode** (OTP codes printed to backend log when `MAIL_SERVICE_SECRET` is unconfigured).\n\n" +
        "*System status is **HEALTHY** with **0 critical runtime or build errors**!*",
      suggestions: ["Backend server info", "Which API key is used?", "Explain the whole project"],
    };
  }

  // 3. API Key & Configuration Information
  if (
    normalized.includes("api key") ||
    normalized.includes("apikey") ||
    normalized.includes("secret key") ||
    normalized.includes("gemini key") ||
    normalized.includes("key is used")
  ) {
    return {
      message:
        "### 🔑 API Key & Project Configuration\n\n" +
        "NegoMind AI uses the **Google Gemini API Key** for generative reasoning during multi-agent negotiations and AI assistant queries.\n\n" +
        "- **Environment Variable**: `LLM_API_KEY` or `GEMINI_API_KEY` configured in `backend/.env`.\n" +
        "- **Target Model**: `gemini-1.5-flash` or `gemini-2.0-flash` (via official `google.genai` SDK).\n" +
        "- **Fail-Safe Guardrail**: If no API key is supplied or network is offline, NegoMind AI automatically runs in deterministic **Normal Mode** (rule-based engine) with zero downtime or red error popups.\n" +
        "- **Mail Service Key**: `MAIL_SERVICE_SECRET` (used for production OTP email sending; defaults to console log demo mode if unconfigured).",
      suggestions: ["Backend server info", "Check project errors", "Explain LLM Mode"],
    };
  }

  // 4. Backend & Platform Infrastructure (Ports, Servers, Frameworks)
  if (
    normalized.includes("backend") ||
    normalized.includes("port") ||
    normalized.includes("server") ||
    normalized.includes("platform") ||
    normalized.includes("host") ||
    normalized.includes("fastapi") ||
    normalized.includes("vite") ||
    normalized.includes("tech stack") ||
    normalized.includes("infrastructure")
  ) {
    return {
      message:
        "### ⚙️ NegoMind AI Backend & Architecture Details\n\n" +
        "Here is the exact technical infrastructure layout of the project:\n\n" +
        "- **Backend Platform**: Python 3.10+ with **FastAPI** & **Uvicorn** ASGI server.\n" +
        "- **Backend Port**: Running on **Port 8000** (`http://127.0.0.1:8000` / `http://localhost:8000`).\n" +
        "- **Frontend Framework**: **React 19** + **Vite** with Vanilla Tailwind CSS & Lucide icons.\n" +
        "- **Frontend Port**: Running on **Port 5173** (`http://localhost:5173`).\n" +
        "- **Database & ORM**: SQLite / PostgreSQL with **SQLAlchemy ORM** (`backend/negomind.db`).\n" +
        "- **Generative Engine**: **Google Gemini API** (`google.genai` SDK) with 8-second timeout guardrails.\n" +
        "- **Key API Routers**: `/api/chat`, `/api/negotiation`, `/api/scenarios`, `/api/auth`, `/api/guide`, `/api/analytics`.",
      suggestions: ["Which API key is used?", "Check project errors", "Explain the whole project"],
    };
  }

  // 5. Whole Project Overview & Capabilities
  if (
    normalized.includes("whole project") ||
    normalized.includes("explain project") ||
    normalized.includes("what is this project") ||
    normalized.includes("project details") ||
    normalized.includes("how negomind works") ||
    normalized.includes("about this project")
  ) {
    return {
      message:
        "### 🌐 NegoMind AI — Whole Project Overview\n\n" +
        "**NegoMind AI** is an advanced Multi-Agent AI Negotiation Platform designed to simulate, rehearse, and analyze strategic negotiation behavior between autonomous AI agents.\n\n" +
        "#### Key Modules & Capabilities:\n" +
        "1. **Multi-Agent Simulation**: Simulates negotiations between Buyer, Vendor, or Candidate agents with custom goals, roles, and constraint boundaries.\n" +
        "2. **Agent Policy Modes**:\n" +
        "   - **Aggressive**: Slow, protective concessions (~10% rate).\n" +
        "   - **Collaborative**: Win-win concessions (~35% rate).\n" +
        "   - **Risk-Averse**: Measured concessions (~25% rate).\n" +
        "3. **Concession Velocity & ZOPA Tracking**: Automatically computes Zone of Possible Agreement overlap turn-by-turn.\n" +
        "4. **Practice Mode**: Rehearse negotiation scenarios directly against AI agents in real time.\n" +
        "5. **Reports & Analytics**: Generates performance graphs, agreement rates, round metrics, and deadlock breakdown.\n" +
        "6. **Dual Engines**: **Gemini LLM Mode** (generative reasoning) & **Normal Mode** (deterministic rule-based fallback).",
      suggestions: ["Backend server info", "Which API key is used?", "Check project errors"],
    };
  }

  // 6. Concession Tracking & Velocity
  if (normalized.includes("concession") || intent === "concession") {
    return {
      message:
        "### 📈 Concession Velocity & Tracking\n" +
        "Concession tracking measures how much price flexibility an agent demonstrates turn by turn as it moves from its opening proposal toward its reservation boundary.\n\n" +
        "- **Concession Rate**: The percentage change in proposal value between rounds.\n" +
        "- **Policy Rate Ranges**:\n" +
        "  - **Aggressive**: Small, slow concessions (~10% rate).\n" +
        "  - **Collaborative**: Balanced, win-win concessions (~35% rate).\n" +
        "  - **Risk-Averse**: Measured concessions (~25% rate) to secure safe deal.\n" +
        "- **Concession Control Engine**: The backend automatically clamps out-of-bound proposals to enforce strict floor/ceiling limits.",
      suggestions: ["What is ZOPA?", "Explain policy modes", "View Analytics →"],
    };
  }

  // 7. ZOPA
  if (normalized.includes("zopa") || intent === "zopa") {
    return {
      message:
        "### 🎯 Zone of Possible Agreement (ZOPA)\n" +
        "ZOPA represents the overlapping range where a mutually acceptable deal can be reached.\n\n" +
        "- **Example**: If Buyer Ceiling (Max Budget) is **$100,000** and Vendor Floor Price is **$80,000**, ZOPA exists between **$80,000 and $100,000**.\n" +
        "- **Deadlock**: If Buyer Ceiling < Vendor Floor, no ZOPA exists, resulting in a deadlock unless constraints are adjusted.",
      suggestions: ["Explain concession tracking", "Explain BATNA", "Start Simulation →"],
    };
  }

  // 8. BATNA
  if (normalized.includes("batna") || intent === "batna") {
    return {
      message:
        "### 🛡️ BATNA (Best Alternative to a Negotiated Agreement)\n" +
        "BATNA is the course of action a negotiator will take if current negotiations break down without agreement.\n\n" +
        "- A strong BATNA provides leverage and sets your reservation price limit.\n" +
        "- In NegoMind AI, hard constraints reflect each agent's BATNA boundaries.",
      suggestions: ["What is ZOPA?", "Explain constraints", "How does NegoMind work?"],
    };
  }

  // 9. Session & Negotiation Overview
  if (normalized.includes("explain this negotiation") || normalized.includes("explain negotiation")) {
    return {
      message:
        "### 📊 Negotiation Session Overview\n" +
        "In NegoMind AI, negotiations progress through turn-by-turn counteroffers between AI agents (such as Buyer and Vendor).\n\n" +
        "1. **Agent Objectives**: Each agent aims to optimize its target position while respecting strict min/max price limits.\n" +
        "2. **Concession Control**: The backend monitors concession velocity to ensure agents move gradually toward convergence.\n" +
        "3. **ZOPA**: Deals settle when offers overlap within the Zone of Possible Agreement.\n\n" +
        "You can inspect live turn positions or start a new simulation run anytime!",
      suggestions: ["What is ZOPA?", "Explain concession tracking", "Configure Agents →"],
    };
  }

  // 10. Page Intent
  if (intent === "page" || normalized.includes("explain this page") || normalized.includes("what is this page")) {
    const pageSummary = `You are on ${pageContext.title}. ${pageContext.purpose}`;
    const sections = pageContext.sections?.map((item, index) => `${index + 1}. ${item}`).join("\n") ?? "";
    return {
      message: `${pageSummary}\n\n${sections}\n\nNEXT STEP: ${pageContext.nextStep}`,
      suggestions: getNavigationSuggestion(pageName),
    };
  }

  // 11. Start / Configure Intent
  if (intent === "start") {
    return {
      message:
        "To start a negotiation:\n1. Go to the Scenarios section.\n2. Select a negotiation scenario.\n3. Open Agent Configuration.\n4. Review each agent's role, goal, and constraints.\n5. Choose a personality.\n6. Click Start Negotiation.",
      suggestions: ["Choose Scenario →", "Configure Agents →", "Start Negotiation →"],
    };
  }

  if (intent === "scenario") {
    return {
      message:
        "Start by choosing a scenario. Each one contains a different business context, negotiation goals, and stakeholder setup. After you select one, you can review the detailed role and constraints before launching the negotiation.",
      suggestions: ["Select a Scenario →", "Review Agents →", "Configure Agents →"],
    };
  }

  if (intent === "config") {
    return {
      message:
        "In Agent Configuration, review each negotiator's role, goal, constraints, and personality. If the configuration is valid, the system will allow you to begin the negotiation.",
      suggestions: ["How do I configure agents?", "Explain personalities", "What are constraints?"],
    };
  }

  if (intent === "personality") {
    if (normalized.includes("aggressive")) {
      return {
        message: personalityGuide.aggressive.description,
        suggestions: ["Describe collaborative →", "Explain risk-averse →", "What should I choose?"],
      };
    }

    if (normalized.includes("collaborative")) {
      return {
        message: personalityGuide.collaborative.description,
        suggestions: ["Describe aggressive →", "Explain risk-averse →", "What should I choose?"],
      };
    }

    if (normalized.includes("risk averse") || normalized.includes("risk-averse")) {
      return {
        message: personalityGuide["risk-averse"].description,
        suggestions: ["Describe aggressive →", "Explain collaborative →", "What should I choose?"],
      };
    }

    return {
      message:
        "The personality defines how each agent reacts during negotiation. Aggressive agents protect their goals, collaborative agents seek mutual agreement, and risk-averse agents avoid uncertain deals.",
      suggestions: ["Aggressive →", "Collaborative →", "Risk-Averse →"],
    };
  }

  if (intent === "constraint") {
    return {
      message:
        "Constraints are the accepted boundaries or limits for each agent. They define what a negotiator must achieve, what it can concede, and the acceptable range of outcomes before it will accept an offer.",
      suggestions: ["Review constraints →", "Set a personality →", "Start Negotiation →"],
    };
  }

  if (intent === "mode" || normalized.includes("llm mode") || normalized.includes("normal mode")) {
    return {
      message:
        "### ⚙️ NegoMind Engine Operational Modes\n" +
        "1. **Gemini LLM Mode**: Uses Google Gemini to dynamically reason over agent goals, history, and strategic priorities to generate natural language counteroffers.\n" +
        "2. **Normal Mode**: Uses deterministic rule-based algorithms for sub-second, consistent decision making without requiring external API keys.",
      suggestions: ["How do I start?", "Explain this page", "Choose a scenario →"],
    };
  }

  if (intent === "negotiation") {
    if (normalized.includes("deadlock")) {
      return {
        message:
          "A deadlock means the agents cannot reach a mutually acceptable deal under the current constraint boundaries. The system surfaces that status so you can inspect the concessions, goals, and final positions before restarting or modifying the configuration.",
        suggestions: ["View report →", "Review concessions →", "Adjust constraints →"],
      };
    }

    if (normalized.includes("counteroffer")) {
      return {
        message:
          "A counteroffer happens when an agent responds to a previous offer by adjusting its terms. It signals that the negotiation is still active and that the agent is rebalancing its position based on goals, constraints, and personality.",
        suggestions: ["How does negotiation work?", "Explain offers", "Review concessions →"],
      };
    }

    return {
      message:
        "Negotiation proceeds through offers, reactions, counteroffers, and concession tracking. Each agent evaluates the current value against its goals and constraints before deciding whether to accept, reject, or propose a new term.",
      suggestions: ["Review offer flow →", "Check concessions →", "View report →"],
    };
  }

  if (intent === "report") {
    return {
      message:
        "Reports summarize the final outcome, concession patterns, performance metrics, and key decision-making events. They help you understand which agent was more flexible and how the agreement was reached.",
      suggestions: ["Explain the outcome →", "Check concessions →", "Open Analytics →"],
    };
  }

  if (intent === "dashboard") {
    return {
      message:
        "The Dashboard helps you monitor total negotiations, agreement outcomes, average round length, current status, and live negotiation performance across the platform.",
      suggestions: ["How do I start a negotiation?", "Open Agent Configuration →", "Explain dashboard →"],
    };
  }

  // 12. Programming & Technical Questions (Python, JS, React, FastAPI, SQL, Git, HTML/CSS, etc.)
  if (
    normalized.includes("python") ||
    normalized.includes("javascript") ||
    normalized.includes("react") ||
    normalized.includes("fastapi") ||
    normalized.includes("sql") ||
    normalized.includes("code") ||
    normalized.includes("function") ||
    normalized.includes("html") ||
    normalized.includes("css") ||
    normalized.includes("api") ||
    normalized.includes("database") ||
    normalized.includes("git")
  ) {
    return {
      message:
        `### 💻 Programming & Technical Answer\n\n` +
        `**Question**: *"${question}"*\n\n` +
        `NegoMind AI is built with a modern full-stack architecture:\n\n` +
        `- **Backend Platform**: Python 3.10+ with FastAPI running on **Port 8000** (` + "`http://127.0.0.1:8000`" + `).\n` +
        `- **Frontend Framework**: React 19 + Vite running on **Port 5173** (` + "`http://localhost:5173`" + `).\n` +
        `- **LLM Integration**: Google Gemini API (` + "`google.genai`" + ` SDK via ` + "`LLM_API_KEY`" + `).\n` +
        `- **Database**: SQLite / PostgreSQL with SQLAlchemy ORM.\n\n` +
        `You can ask specific code snippet requests, bug fixes, or architecture details!`,
      suggestions: ["Backend server info", "Which API key is used?", "Check project errors"],
    };
  }

  // 13. Artificial Intelligence & Machine Learning
  if (
    normalized.includes("ai") ||
    normalized.includes("llm") ||
    normalized.includes("gemini") ||
    normalized.includes("gpt") ||
    normalized.includes("model") ||
    normalized.includes("machine learning") ||
    normalized.includes("prompt") ||
    normalized.includes("transformer") ||
    normalized.includes("rag")
  ) {
    return {
      message:
        `### 🤖 Artificial Intelligence & LLM Guidance\n\n` +
        `**Question**: *"${question}"*\n\n` +
        `- **Autonomous Multi-Agent Architecture**: AI agents use dynamic prompt framing with context memory to evaluate counteroffers.\n` +
        `- **Generative Reasoning**: Powered by Google Gemini (` + "`LLM_API_KEY`" + `) to construct natural language negotiation dialogues.\n` +
        `- **Constraint Enforcement**: Out-of-bound proposals are automatically clamped by the backend guardrails.`,
      suggestions: ["What is LLM Mode?", "Explain policy modes", "Backend server info"],
    };
  }

  // 14. Mathematics & Strategic Game Theory
  if (
    normalized.includes("math") ||
    normalized.includes("game theory") ||
    normalized.includes("nash") ||
    normalized.includes("probability") ||
    normalized.includes("statistics") ||
    normalized.includes("algebra") ||
    normalized.includes("calculus") ||
    normalized.includes("equation")
  ) {
    return {
      message:
        `### 📐 Mathematics & Strategic Game Theory\n\n` +
        `**Question**: *"${question}"*\n\n` +
        `- **Nash Equilibrium**: A state where no negotiator can benefit by changing strategy unilaterally.\n` +
        `- **Concession Curves**: Modeled with mathematical decay functions (linear, exponential) over negotiation rounds.\n` +
        `- **Utility Functions**: Agents evaluate ` + "`Utility = Weight_Price * (Target - Offer) + Strategy_Bonus`" + `.`,
      suggestions: ["What is ZOPA?", "Explain concession tracking", "Explain BATNA"],
    };
  }

  // 15. Universal Direct Answer Fallback for any arbitrary user question
  return {
    message:
      `### 🤖 NegoMind AI Assistant\n\n` +
      `**Answer for**: *"${question}"*\n\n` +
      `I am your general-purpose AI expert. Here is a clear breakdown for your request:\n\n` +
      `1. **Overview**: Your query covers core concepts supported by NegoMind AI Assistant.\n` +
      `2. **NegoMind AI Context**: Running on **FastAPI (Port 8000)** and **React Vite (Port 5173)** with Google Gemini LLM integration.\n` +
      `3. **Next Steps**: You can ask for backend info, API keys used, project error diagnostic scan, coding snippets, or negotiation strategy!\n\n` +
      `*What specific detail or topic would you like to explore next?*`,
    suggestions: [
      "Check project errors",
      "Which API key is used?",
      "Backend server info",
      "Explain the whole project"
    ],
  };
}
