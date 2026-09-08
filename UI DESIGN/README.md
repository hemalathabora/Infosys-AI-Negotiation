# AI-Driven Multi-Agent Negotiation Simulator

An end-to-end **AI-Driven Multi-Agent Negotiation Training & Simulation Platform** featuring:
1. **Agent Configuration UI** — Scenario selection, agent persona & constraint setup, validation.
2. **Orchestrator Module** — Turn management, round tracking, session status control.
3. **LLM Reasoning Layer** — Context-aware AI negotiation response generation.

```
USER → SCENARIO SELECTION → AGENT CONFIGURATION → ORCHESTRATOR → LLM REASONING LAYER → MULTI-ROUND NEGOTIATION → OUTCOME REPORT
```

---

## 🤖 LLM Reasoning Layer & Orchestrator Integration

The LLM Reasoning Engine (`src/engine/llmReasoning.js` & `src/engine/agentInterface.js`) enables AI agents to generate context-aware negotiation responses based on complete historical context, agent personas, strategic goals, and hard constraints.

### 1. Information Passed to the LLM
- **Agent Profile**: Role, persona/personality (`Aggressive`, `Collaborative`, `Risk-averse`), strategic goals, negotiation objectives, and hard constraint limits (`Maximum $X` / `Minimum $Y`).
- **Negotiation State**: Current round index, maximum rounds, status (`in_progress`, `agreement`, `rejected`, `deadlock`).
- **Complete Negotiation History**: Full chronological history of previous offers, counteroffers, decisions, and turn rationales.
- **Opponent's Latest Offer**: Most recent bid received from the counterparty.

### 2. Agent Reasoning Function (`generate_agent_response`)
Located in `src/engine/agentInterface.js`:
```js
const result = await generate_agent_response(
  agent_profile,
  negotiation_state,
  conversation_history,
  opponent_offer
);
```

### 3. Structured Negotiation Response Output
The LLM response contains:
- `decision`: `"accept"` | `"counteroffer"` | `"reject"`
- `proposed_offer`: Numeric offer value (e.g. `$46,887`)
- `reasoning`: Natural-language justification incorporating persona, goals, constraints, history length, and opponent move.
- `negotiation_parameters`: Object containing `concession_rate`, `target_value`, `distance_to_constraint`, `round`, and `strategy_notes`.

### 4. Orchestrator Execution Flow
Connected turn-by-turn flow in `src/engine/orchestrator.js`:
```
Orchestrator
 └─> Get Current Agent (Agent ID)
 └─> Load Agent Profile (Role, Persona, Goal, Constraints)
 └─> Load Negotiation State (Round, Max Rounds, Status)
 └─> Pass Conversation History (All previous turns)
 └─> Send Opponent Offer to LLM
 └─> Generate Agent Response (via generate_agent_response)
 └─> Update Negotiation State (apply offer, decision, & parameters)
 └─> Pass Turn to Next Agent
```

---

## 🛠️ Stack

- **React 19 + Vite** — Frontend application interface.
- **Tailwind CSS** — Modern dark UI theme with custom glassmorphism and state indicators.
- **JavaScript (ES Modules)** — Documented via JSDoc typedefs in `src/types/negotiation.js`.
- **Node.js Test Engine** — Automated test suite for multi-round AI negotiations.

---

## 🚀 Running the Project & Test Suite

```bash
# Install dependencies
npm install

# Run Vite development server
npm run dev       # http://localhost:5173

# Run Vendor Pricing Negotiation Test (LLM Reasoning Layer)
node src/engine/testVendorPricing.js

# Production build & preview
npm run build     # production build → dist/
npm run preview   # serve production build
npm run lint      # oxlint code verification
```

---

## 🧪 Vendor Pricing Negotiation Test Results

Running `node src/engine/testVendorPricing.js` executes a 5-round negotiation between:
- **Buyer**: Procurement Manager (Persona: `Risk-averse`, Goal: `"Lowest possible unit price"`, Constraint: `Maximum $50,000`)
- **Vendor**: Sales Representative (Persona: `Aggressive`, Goal: `"Maximize profit margin"`, Constraint: `Minimum $42,000`)

### Output Summary:
- **Round 1**: Buyer anchors at $42,500. Vendor counters at $47,720 (Aggressive 10% concession rate).
- **Round 2**: Buyer counters at $43,805 (Risk-averse 25% concession rate). Vendor counters at $47,329.
- **Round 3**: Buyer counters at $44,686. Vendor counters at $47,065.
- **Round 4**: Buyer counters at $45,281. Vendor counters at $46,887.
- **Round 5**: Buyer receives $46,887, evaluates it against $50,000 maximum constraint limit and accepts the deal!
- **Constraint Enforcement**: 0 violations (Buyer never exceeded $50,000; Vendor never went below $42,000).

---

## 📁 Project Structure

```
src/
  engine/
    llmReasoning.js       # LLM Reasoning Engine & prompt builder
    agentInterface.js     # generate_agent_response interface
    orchestrator.js       # State orchestrator & turn manager
    negotiationState.js   # State transitions & applyOffer
    decisionLogic.js      # Constraint extraction & concession logic
    offer.js              # Standard offer & response shape
    testVendorPricing.js  # Automated multi-round test suite
  components/
    NegotiationSessionPanel.jsx
    ...
  pages/
    NegotiationArena.jsx
    ...
  data/
    scenarios.js          # Scenario definitions & personas
  services/
    scenarioService.js    # Data access & validation
  types/
    negotiation.js        # JSDoc typedefs for negotiation engine
```
