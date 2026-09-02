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

