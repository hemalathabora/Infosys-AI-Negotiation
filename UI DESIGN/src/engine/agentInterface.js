// Designed by TEAM 4

import { executeLLMReasoning } from "./llmReasoning.js";

/**
 * Builds the standard agent input payload for the LLM reasoning engine.
 *
 * Task 1 & Task 2: Pass agent profile and negotiation history.
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
 * Agent Reasoning Function.
 *
 * Task 3: Implement Agent Reasoning Function
 * Accepts agent profile, negotiation state, conversation history, and opponent's offer,
 * and generates structured LLM negotiation responses.
 *
 * Supports two function invocation signatures:
 * 1. Positional Signature: generate_agent_response(agent_profile, negotiation_state, conversation_history, opponent_offer)
 * 2. Input Object Signature: generate_agent_response(agentInput, decisionParams)
 *
 * @param {Object} agentProfileOrInput
 * @param {Object} negotiationStateOrParams
 * @param {Array} [conversationHistory]
 * @param {Object} [opponentOffer]
 *
 * @returns {Promise<{ decision: string, proposed_offer: number, nextValue?: number, reasoning: string, reason?: string, negotiation_parameters: Object }>}
 */
export async function generate_agent_response(
  agentProfileOrInput,
  negotiationStateOrParams,
  conversationHistory,
  opponentOffer
) {
  // Signature 1: (agent_profile, negotiation_state, conversation_history, opponent_offer)
  if (conversationHistory !== undefined || opponentOffer !== undefined) {
    const result = await executeLLMReasoning(
      agentProfileOrInput,
      negotiationStateOrParams,
      conversationHistory || [],
      opponentOffer || null
    );

    return {
      decision: result.decision,
      proposed_offer: result.proposed_offer,
      nextValue: result.proposed_offer,
      reasoning: result.reasoning,
      reason: result.reasoning,
      negotiation_parameters: result.negotiation_parameters,
    };
  }

  // Signature 2: (agentInput, decisionParams)
  if (agentProfileOrInput && agentProfileOrInput.agent_persona && negotiationStateOrParams) {
    const agentProfile = {
      id: agentProfileOrInput.agent_id,
      name: agentProfileOrInput.role || agentProfileOrInput.agent_id,
      role: agentProfileOrInput.role,
      personality: agentProfileOrInput.agent_persona,
      goal: agentProfileOrInput.goals,
      constraints: agentProfileOrInput.constraints,
      negotiation_objectives: agentProfileOrInput.goals,
      direction: negotiationStateOrParams.direction,
      limit: negotiationStateOrParams.limit,
    };

    const negotiationState = {
      current_round: agentProfileOrInput.current_negotiation_state?.round || negotiationStateOrParams.round || 1,
      max_rounds: negotiationStateOrParams.maxRounds || 8,
      status: agentProfileOrInput.current_negotiation_state?.status || "in_progress",
    };

    const history = agentProfileOrInput.previous_history || [];
    const oppOffer = agentProfileOrInput.current_opponent_offer;

    const result = await executeLLMReasoning(agentProfile, negotiationState, history, oppOffer);

    return {
      decision: result.decision,
      proposed_offer: result.proposed_offer,
      nextValue: result.proposed_offer,
      reasoning: result.reasoning,
      reason: result.reasoning,
      negotiation_parameters: result.negotiation_parameters,
    };
  }

  // Fallback signature invocation
  const result = await executeLLMReasoning(
    agentProfileOrInput || {},
    negotiationStateOrParams || {},
    conversationHistory || [],
    opponentOffer || null
  );

  return {
    decision: result.decision,
    proposed_offer: result.proposed_offer,
    nextValue: result.proposed_offer,
    reasoning: result.reasoning,
    reason: result.reasoning,
    negotiation_parameters: result.negotiation_parameters,
  };
}
