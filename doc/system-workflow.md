# System Workflow

## Overview

The system workflow describes how the AI-Driven Multi-Agent Negotiation Platform operates from scenario selection to the generation of the final outcome report.

## Workflow

Scenario Selection
↓
Agent Configuration
↓
Select Mode (Simulation Mode / Practice Mode)
↓
Negotiation Starts
↓
Orchestrator Initializes Negotiation
↓
Orchestrator Selects Agent Turn
↓
Agent Generates Offer / Counteroffer
↓
Other Agent Evaluates the Offer
↓
Accept / Reject / Counteroffer
↓
Continue Negotiation
↓
Check Agreement / Deadlock / Maximum Rounds
↓
Negotiation Ends
↓
Outcome Evaluation
↓
Outcome Report

## Step-by-Step Workflow

### 1. Scenario Selection

The user selects a negotiation scenario from the available templates.

Examples:
- Vendor Pricing Negotiation
- Job Offer Negotiation
- Project Budget Allocation

### 2. Agent Configuration

The system configures the negotiating agents with their role, goal, constraints, and personality.

### 3. Mode Selection

The user selects one of the following modes:

- Simulation Mode: AI agents negotiate with each other.
- Practice Mode: The user negotiates with an AI agent.

### 4. Negotiation Starts

The system creates and initializes a new negotiation session.

### 5. Orchestrator Initializes the Negotiation

The Orchestrator manages the overall negotiation process, including turn order, negotiation state, conversation history, and round count.

### 6. Orchestrator Selects the Agent Turn

The Orchestrator decides which agent should take the next turn.

### 7. Agent Generates an Offer or Counteroffer

The selected agent analyzes its role, goal, constraints, personality, current negotiation state, and previous conversation before generating a response.

### 8. Other Agent Evaluates the Offer

The receiving agent evaluates whether the offer satisfies its objectives and constraints.

### 9. Agent Decision

The agent makes one of the following decisions:

- Accept
- Reject
- Counteroffer

### 10. Negotiation Continues

If no final decision has been reached, the Orchestrator starts the next negotiation round.

### 11. Negotiation End Check

The system checks whether:

- An agreement has been reached.
- A deadlock has occurred.
- The maximum number of rounds has been reached.

### 12. Outcome Evaluation

After the negotiation ends, the system analyzes the negotiation process and evaluates the final outcome.

### 13. Outcome Report

The system generates a final report containing:

- Final agreement or negotiation failure.
- Number of negotiation rounds.
- Concession patterns.
- Agent performance.
- Objective satisfaction scores.