// Designed by TEAM 4

import { NEGOTIATION_STATUS } from "../types/negotiation.js";

/**
 * Creates the initial NegotiationState for a session.
 *
 * Round definition:
 * - One negotiation round contains one turn from each agent.
 * - Round starts when the first agent makes an offer.
 * - The second agent responds within the same round.
 * - The next round starts when the first agent acts again.
 *
 * @param {import("../types/negotiation").Scenario} scenario
 * @returns {import("../types/negotiation").NegotiationState}
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

    // 0 means the negotiation has not started yet.
    // The first offer changes this to Round 1.
    current_round: 0,

    // The first configured agent starts the negotiation.
    current_agent_turn: scenario.agents[0]?.id ?? null,

    previous_offer: null,
    current_offer: null,

    status: NEGOTIATION_STATUS.NOT_STARTED,

    // Stores the goals, constraints and personality of every agent.
    agent_profiles,

    // Every offer/response is stored here.
    history: [],
  };
}

/**
 * Applies one offer to the negotiation state.
 *
 * IMPORTANT:
 * `offer.round` is now the actual negotiation round.
 *
 * Example:
 *
 * Round 1:
 *   Candidate -> offer
 *   Employer  -> response
 *
 * Round 2:
 *   Candidate -> offer
 *   Employer  -> response
 *
 * @param {import("../types/negotiation").NegotiationState} state
 * @param {import("../types/negotiation").Offer} offer
 * @param {string|null} nextAgentId
 * @param {import("../types/negotiation").NegotiationStatus} status
 * @returns {import("../types/negotiation").NegotiationState}
 */
export function applyOffer(state, offer, nextAgentId, status) {
  return {
    ...state,

    // Do NOT increment the round here.
    // The Orchestrator decides which round the offer belongs to.
    current_round: offer.round,

    // Move control to the next agent.
    // For Agreement/Reject/Deadlock this can be null.
    current_agent_turn: nextAgentId,

    // The previous current offer becomes the previous offer.
    previous_offer: state.current_offer,

    // Store the newly created offer.
    current_offer: offer,

    status,

    // Keep complete negotiation history.
    history: [...state.history, offer],
  };
}