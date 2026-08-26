/**
 * Shared shape definitions for the Agent Configuration UI.
 * Plain JS project — these are documented via JSDoc typedefs so editors
 * still get autocomplete/type-checking without introducing TypeScript.
 */

/**
 * @typedef {"Aggressive" | "Collaborative" | "Risk-averse"} Personality
 */

/**
 * @typedef {Object} Agent
 * @property {string} id
 * @property {string} name
 * @property {string} role
 * @property {string} goal
 * @property {string[]} constraints
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

export const PERSONALITIES = {
  AGGRESSIVE: "Aggressive",
  COLLABORATIVE: "Collaborative",
  RISK_AVERSE: "Risk-averse",
};

// Exported only for JSDoc — no runtime behavior needed for typedefs.
export {};
