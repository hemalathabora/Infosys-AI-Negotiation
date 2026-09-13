# AI-Driven Multi-Agent Negotiation Simulator

An end-to-end **AI-Driven Multi-Agent Negotiation Training & Simulation Platform** powered by a **Python FastAPI Backend**, **LLM-Powered Reasoning Engine**, and a **React 19 + Vite Frontend**.

```
Frontend (React) ↔ FastAPI REST Backend ↔ Negotiation Orchestrator ↔ LLM Reasoning Engine ↔ Constraint Enforcement ↔ SQLite Persistence
```

---

## 🏗️ System Architecture

The platform connects a modern React frontend to a Python FastAPI backend managing the complete negotiation lifecycle:

1. **Agent Profile System**: Defines agent identities, roles, personas, strategic goals, hard constraint limits (`maximum_price`, `minimum_price`, `quantity`), and negotiation objectives.
2. **Negotiation State & Persistence**: SQLite database (via SQLAlchemy) tracking `negotiation_id`, participating agents, active turn, current round, maximum rounds limit, status, current offer, and complete history.
3. **Conversation History**: Persists all turns and provides the LLM with complete negotiation context (previous offers, counteroffers, rationales, and opponent bids).
4. **LLM Reasoning Engine**: Context-aware LLM reasoning module (`app/services/llm_reasoning.py`) that constructs prompt contexts and calls official LLM APIs (`google-genai` / `google-generativeai` / `openai`) or deterministic fallback engines.
5. **Structured LLM Response & Validation**: Strictly validates structured LLM output (`accept`, `counter`, `reject`, `offer`, `reasoning`, `parameters`) using Pydantic models.
6. **Constraint Enforcement**: Validates every generated offer against agent limits (Buyer maximum budget, Vendor minimum floor). Clamps or adjusts invalid responses safely before saving.
7. **Negotiation Orchestrator**: Service managing turn switching, state updates, termination evaluation, and session completion.

---

## 🤖 LLM Reasoning Engine & Prompt Architecture

The `generate_agent_response` function (`app/services/llm_reasoning.py`) is the core engine of the system:

```python
response = await generate_agent_response(
    agent_profile,
    negotiation_state,
    conversation_history,
    opponent_offer
)
```

### Prompt Construction
The engine builds system and user prompts containing:
- **Agent Identity & Role**: e.g., `"You are acting strictly as Buyer Agent (Role: buyer)."`
- **Persona & Personality**: e.g., `"Aggressive but professional negotiator"`.
- **Goals & Objectives**: e.g., `["Get lowest price", "Target price 75,000"]`.
- **Numeric Constraints**: e.g., `{"maximum_price": 85000, "quantity": 100}`.
- **Current Negotiation State**: Current round index, maximum rounds limit, status.
- **Complete Conversation History**: Full log of previous offers and counterparty responses.
- **Opponent's Latest Offer**: Most recent proposed terms.

### Structured Response Schema (Pydantic)
```json
{
  "decision": "counter",
  "offer": {
    "price": 82000,
    "quantity": 100
  },
  "reasoning": "The vendor has reduced their asking price, so I can increase my offer while staying within budget.",
  "parameters": {
    "target_price": 75000,
    "maximum_price": 85000
  }
}
```

---

## 🔒 Constraint Enforcement Rules

To ensure LLMs do not hallucinate invalid or out-of-bounds proposals:
- **Buyer Constraint**: Any counteroffer or accepted price above `maximum_price` (e.g., > ₹85,000) is rejected and clamped to `maximum_price`.
- **Vendor Constraint**: Any counteroffer or accepted price below `minimum_price` (e.g., < ₹80,000) is rejected and clamped to `minimum_price`.
- **Enforcement Log**: All constraint adjustments are logged and saved in the negotiation parameters (`adjusted_due_to_constraint: true`).

---

## 🔄 Negotiation Orchestration Flow

```
Orchestrator
 ├─► 1. Get Current Agent
 ├─► 2. Load Agent Profile
 ├─► 3. Load Negotiation State & Conversation History
 ├─► 4. Fetch Opponent's Latest Offer
 ├─► 5. Send Context to LLM Reasoning Engine
 ├─► 6. Generate Agent Response
 ├─► 7. Validate Constraints
 ├─► 8. Save Response to Conversation History
 ├─► 9. Update Negotiation State
 └─► 10. Switch Turn to Next Agent (or Terminate on Accept/Reject/Max Rounds)
```

---

## 📡 REST API Endpoints

### Negotiations API
- `POST /api/negotiations` — Create and start a negotiation session.
- `GET /api/negotiations/{id}` — Get current negotiation state.
- `POST /api/negotiations/{id}/turn` — Run the current active agent's turn.
- `POST /api/negotiations/{id}/run` — Run negotiation automatically to completion.
- `GET /api/negotiations/{id}/history` — Retrieve complete negotiation history log.

### Agents API
- `GET /api/agents` — List available agent profiles.
- `POST /api/agents` — Create a custom agent profile.
- `GET /api/agents/{id}` — Get specific agent profile details.

### Analytics & Guide API
- `GET /api/analytics/{id}` — Retrieve role-aware concession telemetry, decay rates, and ZOPA metrics.
- `POST /api/guide/query` — Submit user queries to the in-app AI guide assistant.

---

## ⚙️ Environment Configuration

Create `backend/.env` (based on `backend/.env.example`):

```env
LLM_PROVIDER=gemini
LLM_API_KEY=your_api_key_here
LLM_MODEL=gemini-2.5-flash
DATABASE_URL=sqlite:///./negotiation.db
PORT=8000
HOST=0.0.0.0
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

> **Note**: If `LLM_API_KEY` is not provided or `LLM_PROVIDER=mock`, the system automatically uses a deterministic mock reasoning engine for testing and offline development.

---

## 🚀 Running the System

### 1. Start Python FastAPI Backend
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```
Backend API will be live at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

### 2. Start React Frontend
```bash
# In the project root directory
npm install
npm run dev
```
Frontend UI will be live at `http://localhost:5173`.

---

## 🧪 Running Automated Tests

Run the full `pytest` suite in the backend directory:

```bash
cd backend
python -m pytest tests -v
```

### Multi-Round Vendor Pricing Test (`tests/test_multi_round_vendor_pricing.py`)
Simulates a multi-round negotiation between:
- **BUYER**: Persona = Aggressive but professional, Target = ₹75,000, Maximum = ₹85,000
- **VENDOR**: Persona = Firm but flexible, Target = ₹95,000, Minimum = ₹80,000

The test verifies that:
1. Buyer remembers previous Vendor offers.
2. Vendor remembers previous Buyer offers.
3. Offers evolve dynamically based on conversation history.
4. Buyer offer never exceeds ₹85,000.
5. Vendor offer never falls below ₹80,000.
6. Round indices increment correctly and turns switch between agents.
7. Session terminates cleanly with agreement, rejection, or deadlock.

---

## 📁 Project Directory Structure

```
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── agents.py
│   │   │   ├── analytics.py
│   │   │   ├── guide.py
│   │   │   ├── negotiations.py
│   │   │   └── scenarios.py
│   │   ├── models/
│   │   │   ├── agent.py
│   │   │   ├── negotiation.py
│   │   │   └── message.py
│   │   ├── schemas/
│   │   │   ├── agent.py
│   │   │   ├── negotiation.py
│   │   │   └── response.py
│   │   ├── services/
│   │   │   ├── analytics_service.py
│   │   │   ├── concession_tracking.py
│   │   │   ├── deadlock_detection.py
│   │   │   ├── decision_logic.py
│   │   │   ├── guide_service.py
│   │   │   ├── llm_reasoning.py
│   │   │   ├── negotiation_service.py
│   │   │   ├── offer_evaluation.py
│   │   │   └── orchestrator.py
│   │   ├── config.py
│   │   ├── database.py
│   │   └── main.py
│   ├── tests/
│   │   ├── test_agents.py
│   │   ├── test_analytics_and_guide.py
│   │   ├── test_concession_tracking.py
│   │   ├── test_milestone3.py
│   │   ├── test_multi_round_vendor_pricing.py
│   │   ├── test_negotiation.py
│   │   ├── test_offer_evaluation.py
│   │   ├── test_orchestrator.py
│   │   ├── test_practice_mode.py
│   │   └── test_reasoning.py
│   ├── .env.example
│   └── requirements.txt
├── src/
│   ├── components/            # Reusable UI components & arena charts
│   ├── pages/                 # React pages (Dashboard, AgentConfiguration, NegotiationArena, Analytics, Reports)
│   ├── services/              # Frontend API client (api.js)
│   ├── hooks/                 # React state hooks (useNegotiationEngine.js)
│   └── engine/                # Client-side fallback negotiation engine
├── CONCESSION_ANALYTICS.md    # Math & Telemetry Specifications
├── CONCESSION_TRACKING.md     # Tracking System Technical Guide
├── .env.example
├── .gitignore
└── README.md
```
