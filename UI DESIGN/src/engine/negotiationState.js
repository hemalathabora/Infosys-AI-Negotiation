// Designed by TEAM 4
import { NEGOTIATION_STATUS } from "../types/negotiation.js";

/**
 * Builds the initial NegotiationState for a session, straight from the
 * scenario + agent data that Agent Configuration already validated.
 * This is the object created the moment "Start Negotiation" is pressed â€”
 * see hooks/useScenarioConfiguration.js and pages/AgentConfiguration.jsx
 * for where it gets triggered.
 *
 * @param {import('../types/negotiation').Scenario} scenario
 * @returns {import('../types/negotiation').NegotiationState}
 */
export function createNegotiationState(scenario) {
  /** @type {Record<string, { goal: string, constraints: string[], personality: string }>} */
  const agent_profiles = {};
  for (const agent of scenario.agents) {
    agent_profiles[agent.id] = {
      goal: agent.goal,
      constraints: agent.constraints,
      personality: agent.personality,
    };
  }

  return {
    scenario_id: scenario.scenario_id,
    current_round: 0,
    current_agent_turn: scenario.agents[0]?.id ?? null,
    previous_offer: null,
// Implemented by TEAM 4
    current_offer: null,
    status: NEGOTIATION_STATUS.NOT_STARTED,
    agent_profiles,
    history: [],
  };
}

/**
 * Applies one new offer to the state, immutably. This is the single state
 * transition the Orchestrator calls after an agent (rule-based today, LLM
 * later) produces an offer.
 *
 * @param {import('../types/negotiation').NegotiationState} state
 * @param {import('../types/negotiation').Offer} offer
 * @param {string} nextAgentId - agent_id who acts next
 * @param {import('../types/negotiation').NegotiationStatus} status
 * @returns {import('../types/negotiation').NegotiationState}
 */
export function applyOffer(state, offer, nextAgentId, status) {
  return {
    ...state,
    current_round: offer.round,
    current_agent_turn: nextAgentId,
    previous_offer: state.current_offer,
    current_offer: offer,
    status,
    history: [...state.history, offer],
  };
}
// Designed by TEAM 4
// Designed by TEAM 4

