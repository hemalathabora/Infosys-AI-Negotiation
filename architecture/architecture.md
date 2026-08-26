# Architecture Specification

## 1. Architecture Overview

The proposed system follows a layered architecture for a multi-agent negotiation platform.

### End-to-end flow

```text
User
  ↓
Scenario Selection
  ↓
Agent Configuration
  ↓
Orchestrator
  ↓
AI Agents
  ↓
Negotiation Engine
  ↓
Outcome & Reporting
```

The user selects a negotiation scenario and configures the participating agents. The orchestrator initializes the session and controls the sequence of turns. AI agents generate offers and responses according to their goals, constraints, and personalities. The negotiation engine processes the exchange and maintains the current state. When the negotiation ends, the reporting module produces the final outcome and useful metrics.

---

## 2. Major Components

### 2.1 Frontend / User Interface

Responsibilities:
- Select a negotiation scenario.
- Configure agent roles and personalities.
- Start and observe negotiations.
- Display offers, counteroffers, and current state.
- Show the final outcome and report.

The UI does not directly control the internal negotiation logic. It communicates with the backend/orchestrator layer.

### 2.2 Scenario Manager

Responsibilities:
- Load the selected scenario.
- Store scenario-specific objectives.
- Define rules and constraints.
- Provide initial context to the agents.

Example scenarios:
- Vendor Pricing Negotiation
- Job Offer Negotiation
- Project Budget Allocation

### 2.3 Agent Manager

Responsibilities:
- Initialize negotiating agents.
- Assign roles.
- Apply goals and constraints.
- Apply personality configuration.

Supported personality examples:

| Personality | Typical behaviour |
|---|---|
| Aggressive | Firm demands, strong anchoring, low willingness to concede |
| Collaborative | Seeks mutually beneficial outcomes and is more flexible |
| Risk-averse | Prioritizes safe outcomes and avoids uncertain concessions |

Personality should influence decision-making, not replace the agent's underlying objective.

### 2.4 Orchestrator

The orchestrator is the central controller.

Responsibilities:
- Start and stop negotiation sessions.
- Decide whose turn it is.
- Maintain the negotiation sequence.
- Enforce round/time limits.
- Coordinate agents and supporting modules.
- Maintain session state.
- Trigger the final outcome process.

The orchestrator should not be treated as an AI agent. It is the control layer that manages the agents.

### 2.5 AI Agents

Each agent represents one negotiating party.

An agent contains:
- Role
- Goal
- Constraints
- Personality
- Current negotiation state
- Strategy / decision policy

Example:

```text
Agent A
 ├── Role: Buyer
 ├── Goal: Minimize purchase price
 ├── Constraint: Maximum acceptable price
 └── Personality: Risk-averse
```

The second agent can represent the seller, employer, employee, project team, or another party depending on the scenario.

### 2.6 Message Manager

Responsibilities:
- Route messages between agents.
- Preserve message history.
- Validate message structure.
- Associate messages with negotiation rounds.

Typical messages include:
- Offer
- Counteroffer
- Acceptance
- Rejection
- Clarification

### 2.7 Negotiation Engine

Responsibilities:
- Process proposals and counterproposals.
- Apply scenario rules.
- Detect agreement.
- Detect rejection.
- Track concessions.
- Enforce stopping conditions.

A simplified loop is:

```text
Generate Offer
      ↓
Evaluate Offer
      ↓
Accept / Reject / Counter
      ↓
Update State
      ↓
Next Round
```

### 2.8 Evaluator

The evaluator checks an offer against the agent's goals and constraints.

It can determine:
- Whether an offer is acceptable.
- How much utility/value the offer provides.
- Whether a concession is reasonable.
- Whether the current proposal is better or worse than previous proposals.

### 2.9 State Manager

Maintains the current state of the negotiation, including:
- Current round
- Active agent
- Latest offer
- Previous offers
- Concessions
- Agreement status
- Remaining rounds/time
- Agent-specific state

A centralized state model prevents different components from having inconsistent views of the negotiation.

### 2.10 Outcome & Reporting Module

After the negotiation ends, this module generates:
- Final agreement or failure status
- Final negotiated terms
- Agent outcomes
- Utility / score metrics where applicable
- Number of rounds
- Concession history
- Summary and insights

---

## 3. Negotiation Lifecycle

```text
1. Scenario selected
        ↓
2. Agents configured
        ↓
3. Orchestrator initializes session
        ↓
4. Agent A proposes
        ↓
5. Agent B evaluates
        ↓
6. Agent B accepts, rejects, or counteroffers
        ↓
7. State is updated
        ↓
8. Orchestrator starts next round
        ↓
9. Repeat until:
      • Agreement
      • Rejection
      • Maximum rounds
      • Timeout / other stopping condition
        ↓
10. Outcome report generated
```

---

## 4. Simulation Mode

Simulation Mode is designed for automated experimentation.

```text
AI Agent A ↔ AI Agent B
```

The system controls both negotiating parties.

Use cases:
- Test different personalities.
- Compare strategies.
- Run repeated negotiations.
- Analyze outcomes.
- Test scenario rules.

Example:

```text
Aggressive Buyer
        ↕
Collaborative Seller
        ↓
Negotiation
        ↓
Outcome + Metrics
```

---

## 5. Practice Mode

Practice Mode places the user on one side of the negotiation.

```text
User ↔ AI Agent
```

The user makes the decisions for one negotiating party while the AI controls the other side.

Use cases:
- Learn negotiation techniques.
- Practice responding to offers.
- Experiment with different approaches.
- Receive feedback after negotiation.

The core negotiation engine remains the same as Simulation Mode.

---

## 6. Simulation vs Practice

| Feature | Simulation Mode | Practice Mode |
|---|---|---|
| Human participant | No | Yes |
| AI participants | Two or more | At least one |
| Main purpose | Experimentation | Training |
| Decision control | AI | User + AI |
| Negotiation engine | Shared | Shared |
| Outcome reporting | Yes | Yes |

---

## 7. Data Flow

```text
Frontend
   │
   ↓
Backend/API
   │
   ↓
Orchestrator
   ├──→ Scenario Manager
   ├──→ Agent Manager
   ├──→ Message Manager
   ├──→ Evaluator
   └──→ State Manager
             │
             ↓
          AI Agents
             │
             ↓
    Negotiation Engine
             │
             ↓
       Outcome Module
             │
             ↓
          Frontend
```

Persistent information such as scenarios, agent configurations, and negotiation history can be stored in a database or equivalent persistence layer.

---

## 8. External AI / LLM Layer

The AI agents may use an LLM provider for generating reasoning-supported responses, proposals, and counteroffers.

Conceptually:

```text
Agent
  ↓
Agent Prompt / Context
  ↓
LLM Provider
  ↓
Generated Decision / Response
  ↓
Negotiation Engine
```

The architecture should keep the LLM provider behind an abstraction layer so the system can change providers without redesigning the whole application.

---

## 9. State and Storage

The system should persist, where required:

- Scenario definitions
- Agent profiles
- Agent configuration
- Negotiation sessions
- Message history
- Offers and counteroffers
- Final outcomes
- Evaluation metrics

This makes negotiations reproducible and allows later analysis.

---

## 10. Extensibility

The architecture is designed so additional capabilities can be added without changing the entire system.

Potential future extensions:
- More than two negotiating agents.
- Additional negotiation scenarios.
- Additional personalities.
- Different LLM providers.
- Voice-based negotiation.
- Advanced analytics.
- Human-vs-human practice.
- Custom negotiation strategies.
- Tournament / batch simulation.

---

## 11. Non-Functional Considerations

### Reliability
The orchestrator should handle invalid agent responses and unexpected termination safely.

### Consistency
All agents and modules should operate on a consistent negotiation state.

### Observability
Each negotiation should produce logs sufficient to understand what happened in every round.

### Security
Authentication and authorization should be applied to user-facing APIs where required.

### Scalability
The architecture should allow multiple independent negotiation sessions to run concurrently.

---

## 12. Architecture Boundary

This document defines the **proposed system architecture**. It does not imply that every component must be implemented by the architecture task owner.

Implementation responsibilities can be distributed across the team while preserving the interfaces and flow defined here.
