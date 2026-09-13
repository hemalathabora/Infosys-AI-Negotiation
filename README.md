# AI-Driven Multi-Agent Negotiation Training & Simulation Platform

An end-to-end **AI-Driven Multi-Agent Negotiation Training & Simulation Platform** featuring a **Python FastAPI Backend**, **LLM-Powered Reasoning Engine** (Google Gemini & OpenAI), **Role-Aware Concession Analytics Engine**, and a modern **React 19 + Vite Frontend**.

```
[ User / Configuration UI ] ──► [ FastAPI Orchestrator ] ──► [ LLM Reasoning Engine ]
                                            │                            │
                                            ▼                            ▼
[ Outcome Report & Analytics ] ◄── [ SQLite Persistence ] ◄── [ Constraint Enforcement ]
```

---

## 🌟 Features & Completed Components

- **🤖 Autonomous Multi-Agent Orchestration**: Turn-taking negotiation engine (`app/services/orchestrator.py`) supporting full automated runs, step-by-step turn execution, and practice mode (human vs AI).
- **🧠 Context-Aware LLM Reasoning**: LLM integration (`app/services/llm_reasoning.py`) supporting Google Gemini (`google-genai`, `google-generativeai`), OpenAI (`openai`), and a deterministic offline fallback engine.
- **🔒 Strict Constraint Enforcement**: Guardrails enforcing buyer budget ceilings (`maximum_price`) and vendor price floors (`minimum_price`). Invalid LLM counteroffers are safely adjusted, logged, and tracked (`adjusted_due_to_constraint`).
- **📊 Role-Aware Concession Analytics**: Advanced telemetry tracking step concessions, cumulative decay rates, velocity, remaining capacity, ZOPA (Zone of Possible Agreement), and Pareto efficiency curves ([CONCESSION_ANALYTICS.md](file:///c:/Users/shaik/Desktop/Infosys-AI-Negotiation-main/UI%20DESIGN/CONCESSION_ANALYTICS.md)).
- **⚙️ Agent Configuration & Persona Tuning**: Dynamic scenario selection (Vendor Pricing, Job Offer, Project Budget) with customized personality profiles, goals, numeric boundaries, and structured orchestrator handoffs.
- **🏟️ Negotiation Arena & Arena Playback**: Real-time turn visualization, detailed AI reasoning popovers, offer evolution feeds, and interactive decision controls.
- **📈 Dashboard & Report Exporter**: Comprehensive analytics charts, agreement status indicators, session history logs, and outcome report exports.
- **💡 Contextual Guide Assistant**: In-app AI guide bot (`app/services/guide_service.py`) delivering guided tours, tips, and prompt engineering recommendations.

---

## 🛠️ Technology Stack

### Backend
- **Python 3.10+** & **FastAPI** — High-performance REST APIs
- **SQLAlchemy 2.0** & **SQLite** — Database persistence (`negotiation.db`)
- **Pydantic v2** — Schema validation & type safety
- **Google GenAI / OpenAI SDKs** — LLM provider integrations
- **Pytest** — Automated backend test suite

### Frontend
- **React 19** & **Vite** — High-speed modern web application
- **Tailwind CSS** — Modern UI design system
- **Lucide React** — Component icon set
- **Oxlint** — Ultra-fast JavaScript linting

---

## 📁 Project Structure

```
Infosys-AI-Negotiation-main/
├── README.md                                    # Project Root Overview
├── Agile Documents/
│   └── Agile_Updated_Completed_Work_Detailed.xlsm  # Project Agile Deliverables & Work Log
└── UI DESIGN/
    ├── README.md                                # Full-Stack Architecture Documentation
    ├── CONCESSION_ANALYTICS.md                 # Concession Analytics Engine & Math Definitions
    ├── CONCESSION_TRACKING.md                  # Telemetry & Metrics Implementation Guide
    ├── backend/
    │   ├── app/
    │   │   ├── api/                             # FastAPI Routes (agents, negotiations, analytics, guide)
    │   │   ├── models/                          # SQLAlchemy DB Models (agent, negotiation, message)
    │   │   ├── schemas/                         # Pydantic Validation Schemas
    │   │   ├── services/                        # Business Logic & AI Engines
    │   │   │   ├── llm_reasoning.py             # LLM Reasoning & Fallback Engine
    │   │   │   ├── orchestrator.py              # Multi-Agent Turn Engine
    │   │   │   ├── concession_tracking.py       # Concession Analytics & ZOPA Math
    │   │   │   ├── deadlock_detection.py        # Deadlock Resolution Engine
    │   │   │   ├── offer_evaluation.py          # Utility Scoring & Offer Assessment
    │   │   │   ├── analytics_service.py         # Summary Analytics & Aggregations
    │   │   │   └── guide_service.py             # In-App Assistant Logic
    │   │   ├── config.py                        # Environment & Model Configurations
    │   │   ├── database.py                      # SQLAlchemy Engine & Session Setup
    │   │   └── main.py                          # FastAPI Application Entrypoint
    │   ├── tests/                               # Backend Pytest Test Suite (12 Modules)
    │   ├── .env.example                         # Environment Variables Template
    │   └── requirements.txt                     # Python Dependencies
    └── src/
        ├── components/                          # UI Components (Arena, Cards, Charts, Nav, Guide)
        ├── pages/                               # Pages (Dashboard, AgentConfiguration, NegotiationArena, Analytics, Reports)
        ├── services/                            # API Services (`api.js`)
        ├── engine/                              # Client-side Negotiation Engines & Logic
        └── hooks/                               # React Hooks (`useNegotiationEngine.js`)
```

---

## 🚀 Quick Start Guide

### 1. Backend Setup (FastAPI)

```bash
cd "UI DESIGN/backend"

# Create & activate virtual environment (optional)
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables (copy template)
cp .env.example .env

# Start FastAPI dev server
python -m uvicorn app.main:app --reload --port 8000
```
Backend API will be running at `http://localhost:8000`. Interactive API Docs (Swagger UI) are available at `http://localhost:8000/docs`.

### 2. Frontend Setup (React + Vite)

```bash
cd "UI DESIGN"

# Install node dependencies
npm install

# Start Vite development server
npm run dev
```
Frontend Web UI will be running at `http://localhost:5173`.

---

## ⚙️ Environment Variables

Configure `UI DESIGN/backend/.env`:

```env
LLM_PROVIDER=gemini                     # Options: gemini, openai, mock
LLM_API_KEY=your_llm_api_key_here
LLM_MODEL=gemini-2.5-flash              # Options: gemini-2.5-flash, gpt-4o, etc.
DATABASE_URL=sqlite:///./negotiation.db
PORT=8000
HOST=0.0.0.0
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

> **Note**: If `LLM_API_KEY` is omitted or `LLM_PROVIDER=mock`, the system operates seamlessly using a deterministic offline mock reasoning engine.

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/negotiations` | Initialize a new multi-agent negotiation session |
| `GET` | `/api/negotiations/{id}` | Get real-time negotiation state and current turn |
| `POST` | `/api/negotiations/{id}/turn` | Process single active turn using LLM reasoning |
| `POST` | `/api/negotiations/{id}/run` | Execute negotiation session automatically to completion |
| `GET` | `/api/negotiations/{id}/history` | Fetch complete transcript and turn history |
| `GET` | `/api/agents` | List preset and custom agent profiles |
| `POST` | `/api/agents` | Create a new agent profile |
| `GET` | `/api/analytics/{id}` | Retrieve role-aware concession metrics & analytics |
| `POST` | `/api/guide/query` | Submit query to the in-app AI assistant |

---

## 🧪 Automated Testing

The backend includes a comprehensive `pytest` test suite verifying all system components:

```bash
cd "UI DESIGN/backend"
python -m pytest tests -v
```

### Test Coverage Highlights:
- `test_agents.py` — Agent profile creation and validation
- `test_negotiation.py` — Session creation and state transitions
- `test_orchestrator.py` — Turn execution and termination conditions
- `test_reasoning.py` — LLM prompt construction & fallback mock execution
- `test_concession_tracking.py` — Concession amounts, step %, cumulative decay, ZOPA math
- `test_offer_evaluation.py` — Utility scoring, score weighting, and offer rankings
- `test_deadlock_detection.py` — Stagnation detection and concession suggestion rules
- `test_multi_round_vendor_pricing.py` — Multi-round end-to-end simulation between Buyer and Vendor
- `test_practice_mode.py` — Human-in-the-loop decision evaluation & counteroffer validation
- `test_milestone3.py` — Full integration milestone validation

---

## 📄 Project Deliverables & Agile Documentation

- **Agile Work Tracker**: Detailed epic, story, and task completion breakdown available in [`Agile Documents/Agile_Updated_Completed_Work_Detailed.xlsm`](file:///c:/Users/shaik/Desktop/Infosys-AI-Negotiation-main/Agile%20Documents/Agile_Updated_Completed_Work_Detailed.xlsm).
- **Concession Analytics Documentation**: Technical metrics definition and mathematical formulas documented in [`UI DESIGN/CONCESSION_ANALYTICS.md`](file:///c:/Users/shaik/Desktop/Infosys-AI-Negotiation-main/UI%20DESIGN/CONCESSION_ANALYTICS.md).
- **Concession Telemetry Guide**: Practical implementation and tracking details documented in [`UI DESIGN/CONCESSION_TRACKING.md`](file:///c:/Users/shaik/Desktop/Infosys-AI-Negotiation-main/UI%20DESIGN/CONCESSION_TRACKING.md).

---

## 👥 Team 4 Credits

| # | Team Member |
|---|-------------|
| 1 | **Santanu Atta** |
| 2 | **Hemalatha Bora** |
| 3 | **Shaik Mohammed Fawaz** |

---

## 📄 License

This project is developed as part of an academic & professional submission for the Infosys AI Negotiation Platform project.
