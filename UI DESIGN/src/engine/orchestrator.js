import {
  NEGOTIATION_STATUS,
  DECISIONS,
} from "../types/negotiation.js";

import {
  createNegotiationState,
  applyOffer,
} from "./negotiationState.js";

import { createOffer } from "./offer.js";

import {
  deriveLimitFromConstraints,
  anchorOffer,
} from "./decisionLogic.js";

import {
  generate_agent_response,
} from "./agentInterface.js";

import {
  calculateConcession,
  getAgentInitialPosition,
  getAgentPreviousPosition,
} from "./concessionTracking.js";

/**
 * Maximum number of complete negotiation rounds.
 * One complete round contains both agent turns.
 */
const MAX_ROUNDS = 5;

export class Orchestrator {
  /**
   * @param {import("../types/negotiation").Scenario} scenario
   */
  constructor(scenario, mode = "simulation", humanRole = null) {
    this.scenario = scenario;
    this.mode = mode;
    this.humanRole = humanRole;

    // Create the initial negotiation state.
    this.state = createNegotiationState(scenario);

    /**
     * Store the effective negotiation position of every agent.
     */
    this.positions = {};

    for (const agent of scenario.agents) {
      const derived = deriveLimitFromConstraints(agent.constraints);

      this.positions[agent.id] =
        derived ?? {
          direction: "minimize",
          limit: 0,
        };
    }

    // Store the order in which agents take turns.
    this.agentOrder = scenario.agents.map((agent) => agent.id);

    if (mode === "practice") {
      for (const agent of scenario.agents) {
        agent.participant_type = humanRole && agent.role?.toLowerCase() === humanRole.toLowerCase()
          ? "human"
          : "ai";
      }
    }

    // The first agent starts every new round.
    this.firstAgentId = this.agentOrder[0] ?? null;
  }

  /**
   * Returns the complete current negotiation state.
   */
  getState() {
    return this.state;
  }

  /**
   * Safely updates the internal negotiation state.
   */
  updateState(newState) {
    this.state = newState;
    return this.state;
  }

  /**
   * Returns the current negotiation round.
   */
  getCurrentRound() {
    return this.state.current_round;
  }

  /**
   * Returns the agent whose turn it currently is.
   */
  getCurrentTurn() {
    return this.state.current_agent_turn;
  }

  /**
   * Returns the complete negotiation history.
   */
  getHistory() {
    return this.state.history;
  }

  /**
   * Returns the next agent after the supplied agent.
   */
  getNextAgent(currentAgentId) {
    const index = this.agentOrder.indexOf(currentAgentId);

    if (index === -1 || this.agentOrder.length === 0) {
      return null;
    }

    return this.agentOrder[(index + 1) % this.agentOrder.length];
  }

  /**
   * Determines which negotiation round the current agent belongs to.
   */
  getRoundForCurrentTurn(agentId) {
    if (this.state.current_round === 0) {
      return 1;
    }

    if (agentId === this.firstAgentId) {
      return this.state.current_round + 1;
    }

    return this.state.current_round;
  }

  /**
   * Checks whether the current agent is starting a new round.
   */
  isStartingNewRound(agentId) {
    return (
      this.state.current_round === 0 ||
      agentId === this.firstAgentId
    );
  }

  /**
   * Advances the negotiation by exactly ONE agent turn.
   *
   * Task 5 Implementation Flow:
   * Orchestrator
   * → Get Current Agent
   * → Load Agent Profile
   * → Load Negotiation State
   * → Pass Conversation History
   * → Send Opponent Offer to LLM
   * → Generate Agent Response
   * → Update Negotiation State
   * → Pass Turn to Next Agent
   *
   * @returns {Promise<import("../types/negotiation").NegotiationState>}
   */
  async step() {
    if (
      this.state.status === NEGOTIATION_STATUS.AGREEMENT ||
      this.state.status === NEGOTIATION_STATUS.REJECTED ||
      this.state.status === NEGOTIATION_STATUS.DEADLOCK ||
      this.state.status === NEGOTIATION_STATUS.COMPLETED
    ) {
      return this.state;
    }

    // Step 1: Get Current Agent
    const agentId = this.state.current_agent_turn;
    if (!agentId) return this.state;

    const position = this.positions[agentId];
    if (!position) return this.state;

    // Step 2: Load Agent Profile
    const agent = this.scenario.agents.find((item) => item.id === agentId);
    if (!agent) return this.state;

    const agentProfile = {
      id: agent.id,
      name: agent.name,
      role: agent.role,
      personality: agent.personality ?? "Collaborative",
      goal: agent.goal,
      constraints: agent.constraints,
      negotiation_objectives: agent.goal,
      direction: position.direction,
      limit: position.limit,
    };

    const round = this.getRoundForCurrentTurn(agentId);

    // Safety check for MAX_ROUNDS
    if (round > MAX_ROUNDS) {
      this.state = {
        ...this.state,
        status: NEGOTIATION_STATUS.DEADLOCK,
        current_agent_turn: null,
      };
      return this.state;
    }

    // OPENING MOVE (No incoming opponent offer)
    if (!this.state.current_offer) {
      const value = anchorOffer(position.direction, position.limit);
      const personality = agent.personality ?? "Unknown";
      const negotiationState = {
        current_round: round,
        max_rounds: MAX_ROUNDS,
        status: this.state.status,
        history: this.state.history ?? [],
      };

      const concession_data = calculateConcession(
        agentProfile,
        null,
        value,
        negotiationState,
        value
      );

      const offer = createOffer({
        agent_id: agentId,
        round,
        value,
        reason: `Opening anchor offer as ${agent.role} with ${personality} persona, pursuing goal: "${agent.goal}".`,
        decision: DECISIONS.COUNTEROFFER,
        parameters: {
          anchor_value: value,
          limit: position.limit,
          direction: position.direction,
          concession_data,
        },
      });

      const nextAgent = this.getNextAgent(agentId);

      this.state = applyOffer(
        this.state,
        offer,
        nextAgent,
        NEGOTIATION_STATUS.IN_PROGRESS,
      );

      return this.state;
    }

    // Step 3: Load Negotiation State & Step 4: Pass Conversation History & Step 5: Send Opponent Offer to LLM
    const opponentOffer = this.state.current_offer;
    const conversationHistory = [...(this.state.history ?? [])];

    const negotiationState = {
      current_round: round,
      max_rounds: MAX_ROUNDS,
      status: this.state.status,
    };

    const initPos = getAgentInitialPosition(conversationHistory, agentId);
    const prevPos = getAgentPreviousPosition(conversationHistory, agentId);

    // Step 6: Generate Agent Response via LLM Reasoning Engine
    const llmResponse = await generate_agent_response(
      agentProfile,
      negotiationState,
      conversationHistory,
      opponentOffer,
    );

    const decision = llmResponse.decision;
    const reasoning = llmResponse.reasoning || llmResponse.reason;
    const parameters = llmResponse.negotiation_parameters || {};

    // Step 7: Update Negotiation State based on LLM Decision
    if (decision === DECISIONS.ACCEPT) {
      const concession_data = calculateConcession(
        agentProfile,
        prevPos,
        opponentOffer.value,
        negotiationState,
        initPos
      );
      parameters.concession_data = concession_data;

      const offer = createOffer({
        agent_id: agentId,
        round,
        value: opponentOffer.value,
        reason: reasoning,
        decision: DECISIONS.ACCEPT,
        parameters,
      });

      this.state = applyOffer(
        this.state,
        offer,
        null,
        NEGOTIATION_STATUS.AGREEMENT,
      );

      return this.state;
    }

    if (decision === DECISIONS.REJECT) {
      const ownLastOffer = [...conversationHistory]
        .reverse()
        .find((o) => o.agent_id === agentId);
      const ownLastValue = ownLastOffer
        ? ownLastOffer.value
        : position.limit;

      const concession_data = calculateConcession(
        agentProfile,
        prevPos,
        ownLastValue,
        negotiationState,
        initPos
      );
      parameters.concession_data = concession_data;

      const offer = createOffer({
        agent_id: agentId,
        round,
        value: ownLastValue,
        reason: reasoning,
        decision: DECISIONS.REJECT,
        parameters,
      });

      this.state = applyOffer(
        this.state,
        offer,
        null,
        NEGOTIATION_STATUS.REJECTED,
      );

      return this.state;
    }

    // COUNTEROFFER
    const proposedOffer =
      llmResponse.proposed_offer !== undefined
        ? llmResponse.proposed_offer
        : llmResponse.nextValue !== undefined
        ? llmResponse.nextValue
        : opponentOffer.value;

    const concession_data = calculateConcession(
      agentProfile,
      prevPos,
      proposedOffer,
      negotiationState,
      initPos
    );
    parameters.concession_data = concession_data;

    const offer = createOffer({
      agent_id: agentId,
      round,
      value: proposedOffer,
      reason: reasoning,
      decision: DECISIONS.COUNTEROFFER,
      parameters,
    });

    // Step 8: Pass Turn to Next Agent
    const nextAgent = this.getNextAgent(agentId);

    this.state = applyOffer(
      this.state,
      offer,
      nextAgent,
      NEGOTIATION_STATUS.IN_PROGRESS,
    );

    return this.state;
  }

  /**
   * Runs the complete negotiation automatically.
   *
   * @returns {Promise<import("../types/negotiation").NegotiationState>}
   */
  async runToCompletion() {
    let guard = 0;
    const MAX_STEPS = MAX_ROUNDS * this.agentOrder.length;

    while (
      this.state.status !== NEGOTIATION_STATUS.AGREEMENT &&
      this.state.status !== NEGOTIATION_STATUS.REJECTED &&
      this.state.status !== NEGOTIATION_STATUS.DEADLOCK &&
      this.state.status !== NEGOTIATION_STATUS.COMPLETED &&
      guard < MAX_STEPS
    ) {
      await this.step();
      guard += 1;
    }

    if (
      guard >= MAX_STEPS &&
      this.state.status === NEGOTIATION_STATUS.IN_PROGRESS
    ) {
      this.state = {
        ...this.state,
        status: NEGOTIATION_STATUS.DEADLOCK,
        current_agent_turn: null,
      };
    }

    return this.state;
  }
}

export { MAX_ROUNDS };