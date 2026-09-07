// Designed by TEAM 4

import { decide } from "./decisionLogic.js";

/**
 * Builds the standard agent input payload for the LLM reasoning engine.
 *
 * Task 3: Agent Input Structure
 * Standard input format containing:
 * - Agent persona
 * - Role
 * - Goals
 * - Constraints
 * - Current negotiation state
 * - Previous conversation/history
 * - Current opponent offer
 *
 * @param {import("../types/negotiation.js").Agent} agent
 * @param {import("../types/negotiation.js").Scenario} scenario
 * @param {import("../types/negotiation.js").NegotiationState} state
 * @returns {import("../types/negotiation.js").AgentInput}
 */
export function buildAgentInput(agent, scenario, state) {
  return {
    agent_id: agent.id,
    agent_persona: agent.personality ?? "Unknown",
    role: agent.role ?? "",
    goals: agent.goal ?? "",
    constraints: agent.constraints ?? [],
    current_negotiation_state: {
      round: state.current_round,
      status: state.status,
    },
    previous_history: [...(state.history ?? [])],
    current_opponent_offer: state.current_offer ?? null,
  };
}

/**
 * Prepared LLM Integration Interface.
 *
 * Task 4: LLM Integration Interface
 * Accepts the standard AgentInput and negotiation parameters, and produces
 * the agent's decision (ACCEPT, REJECT, COUNTEROFFER).
 *
 * Currently returns a mock / rule-based response via `decide()`.
 * Keep this interface ready for connecting the LLM reasoning engine later.
 *
 * @param {import("../types/negotiation.js").AgentInput} agentInput
 * @param {Object} decisionParams
 * @param {"minimize"|"maximize"} decisionParams.direction
 * @param {number} decisionParams.limit
 * @param {number} decisionParams.ownLastValue
 * @param {number} decisionParams.round
 * @param {number} decisionParams.maxRounds
 *
 * @returns {Promise<{ decision: import("../types/negotiation.js").Decision, nextValue?: number, reason: string }> | { decision: import("../types/negotiation.js").Decision, nextValue?: number, reason: string }}
 */
export function generate_agent_response(agentInput, decisionParams) {
  const incomingValue = agentInput.current_opponent_offer
    ? agentInput.current_opponent_offer.value
    : decisionParams.ownLastValue;

  // Delegate to the decision logic engine.
  // When LLM integration is ready, this function can call the LLM API endpoint asynchronously.
  return decide({
    goal: agentInput.goals,
    direction: decisionParams.direction,
    limit: decisionParams.limit,
    personality: agentInput.agent_persona,
    ownLastValue: decisionParams.ownLastValue,
    incomingValue,
    round: decisionParams.round,
    maxRounds: decisionParams.maxRounds,
  });
}
