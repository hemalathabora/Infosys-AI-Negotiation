// Designed by TEAM 4
/**
 * Shared shape definitions for the Negotiation Simulator.
 * Plain JS project â€” documented via JSDoc typedefs so editors still get
 * autocomplete/type-checking without introducing TypeScript.
 */

/**
 * @typedef {"Aggressive" | "Collaborative" | "Risk-averse"} Personality
 */

/**
 * @typedef {Object} Constraint
 * @property {string} text
 * @property {number} [defaultValue]
 * @property {number} [value]
 */

/**
 * @typedef {Object} Agent
 * @property {string} id
 * @property {string} name
 * @property {string} role
 * @property {string} goal
 * @property {(string|Constraint)[]} constraints
 * @property {Personality} personality
 */

/**
 * @typedef {Object} Scenario
 * @property {string} scenario_id
 * @property {string} scenario_name
 * @property {string} description
 * @property {Agent[]} agents
 */

/**
 * @typedef {Object} NegotiationHandoff
 * @property {string} scenario_id
 * @property {Agent[]} agents
 */

/**
 * Standard offer structure. Every agent â€” human or AI â€” produces offers
 * in this shape so the Orchestrator and decision logic never need to
 * special-case a particular scenario or agent.
 *
 * @typedef {Object} Offer
 * @property {string} agent_id       - Which agent made this offer
 * @property {number} round          - Round number this offer belongs to
 * @property {number} value          - Numeric offer value/terms (e.g. price, salary, budget)
// Implemented by TEAM 4
 * @property {string} reason         - Short natural-language justification
 * @property {string} timestamp      - ISO 8601 timestamp
 */

/**
 * Standard Agent Input structure for passing data to the LLM reasoning engine or decision logic.
 *
 * @typedef {Object} AgentInput
 * @property {string} agent_id              - ID of the active agent
 * @property {Personality} agent_persona    - Personality policy mode (Aggressive, Collaborative, Risk-averse)
 * @property {string} role                 - Agent's organizational or transactional role
 * @property {string} goals                - Strategic objective of the agent
 * @property {(string|Constraint)[]} constraints - Operating boundaries and numeric limits
 * @property {{ round: number, status: NegotiationStatus }} current_negotiation_state - Current round and negotiation status
 * @property {Offer[]} previous_history    - Full ordered log of previous offers and decisions
 * @property {Offer|null} current_opponent_offer - Latest offer received from the opposing agent
 */

/**
 * @typedef {"not_started" | "in_progress" | "agreement" | "rejected" | "deadlock" | "completed"} NegotiationStatus
 */

/**
 * @typedef {"accept" | "reject" | "counteroffer"} Decision
 */

/**
 * The full negotiation session state. One instance exists per session,
 * created the moment Agent Configuration hands off to the negotiation
 * layer, and updated every round by the Orchestrator.
 *
 * @typedef {Object} NegotiationState
 * @property {string} scenario_id
 * @property {number} current_round
 * @property {string} current_agent_turn   - agent_id of whichever agent acts next
 * @property {Offer|null} previous_offer
 * @property {Offer|null} current_offer
 * @property {NegotiationStatus} status
 * @property {Record<string, { goal: string, constraints: string[], personality: Personality }>} agent_profiles
 * @property {Offer[]} history              - every offer made, in order
 */

export const NEGOTIATION_STATUS = {
  NOT_STARTED: "not_started",
  IN_PROGRESS: "in_progress",
  AGREEMENT: "agreement",
  REJECTED: "rejected",
  DEADLOCK: "deadlock",
  BREAKDOWN: "breakdown",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
};

export const DECISIONS = {
  ACCEPT: "accept",
  REJECT: "reject",
  COUNTEROFFER: "counteroffer",
};

export const PERSONALITIES = {
  AGGRESSIVE: "Aggressive",
  COLLABORATIVE: "Collaborative",
  RISK_AVERSE: "Risk-averse",
};

// Exported only for JSDoc â€” no runtime behavior needed for typedefs.
export {};
// Designed by TEAM 4
// Designed by TEAM 4

