// Designed by TEAM 4

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
  decide,
} from "./decisionLogic.js";

/**
 * Maximum number of complete negotiation rounds.
 *
 * IMPORTANT:
 * One round contains BOTH agents.
 *
 * Example:
 * Round 1:
 *   Agent 1 -> offer
 *   Agent 2 -> response
 *
 * Round 2:
 *   Agent 1 -> offer
 *   Agent 2 -> response
 */
const MAX_ROUNDS = 8;

export class Orchestrator {
  /**
   * @param {import("../types/negotiation").Scenario} scenario
   */
  constructor(scenario) {
    this.scenario = scenario;

    // Create initial negotiation state.
    this.state = createNegotiationState(scenario);

    /**
     * Store the effective position/constraint of every agent.
     *
     * Example:
     * {
     *   candidate: {
     *     direction: "maximize",
     *     limit: 100000
     *   },
     *   employer: {
     *     direction: "minimize",
     *     limit: 95000
     *   }
     * }
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

    // Order in which agents take turns.
    this.agentOrder = scenario.agents.map((agent) => agent.id);

    // First agent starts every new round.
    this.firstAgentId = this.agentOrder[0] ?? null;
  }

  /**
   * Returns the complete current negotiation state.
   *
   * @returns {import("../types/negotiation").NegotiationState}
   */
  getState() {
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
   *
   * Example:
   *
   * Candidate -> Employer
   * Employer  -> Candidate
   *
   * @param {string} currentAgentId
   * @returns {string|null}
   */
  getNextAgent(currentAgentId) {
    const index = this.agentOrder.indexOf(currentAgentId);

    if (index === -1 || this.agentOrder.length === 0) {
      return null;
    }

    return this.agentOrder[
      (index + 1) % this.agentOrder.length
    ];
  }

  /**
   * Determines which negotiation round the current agent belongs to.
   *
   * ROUND RULE:
   *
   * First agent:
   *   - If negotiation hasn't started -> Round 1
   *   - If previous round was completed -> next round
   *
   * Second agent:
   *   - Stays in the SAME round as the first agent.
   *
   * Example:
   *
   * Initial:
   *   Round 0, Candidate
   *
   * Candidate acts:
   *   Round 1, Employer's turn
   *
   * Employer acts:
   *   Round 1, Candidate's turn
   *
   * Candidate acts:
   *   Round 2, Employer's turn
   *
   * Employer acts:
   *   Round 2, Candidate's turn
   *
   * @param {string} agentId
   * @returns {number}
   */
  getRoundForCurrentTurn(agentId) {
    // First move of the entire negotiation.
    if (this.state.current_round === 0) {
      return 1;
    }

    /**
     * When the first agent acts again, a NEW round begins.
     *
     * When the second agent acts, it remains inside
     * the current round.
     */
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
   * Advances the negotiation by exactly ONE AGENT TURN.
   *
   * IMPORTANT:
   * One `step()` = one agent action.
   *
   * But two `step()` calls normally represent ONE complete round.
   *
   * Example:
   *
   * step()
   * Candidate -> Round 1
   *
   * step()
   * Employer -> Round 1
   *
   * step()
   * Candidate -> Round 2
   *
   * step()
   * Employer -> Round 2
   *
   * @returns {import("../types/negotiation").NegotiationState}
   */
  step() {
    // Do nothing if negotiation is already finished.
    if (
      this.state.status === NEGOTIATION_STATUS.AGREEMENT ||
      this.state.status === NEGOTIATION_STATUS.REJECTED ||
      this.state.status === NEGOTIATION_STATUS.DEADLOCK ||
      this.state.status === NEGOTIATION_STATUS.COMPLETED
    ) {
      return this.state;
    }

    const agentId = this.state.current_agent_turn;

    if (!agentId) {
      return this.state;
    }

    const position = this.positions[agentId];

    if (!position) {
      return this.state;
    }

    /**
     * Determine the actual negotiation round.
     *
     * This is the important fix.
     *
     * We no longer do:
     *
     * current_round + 1
     *
     * for every agent.
     */
    const round = this.getRoundForCurrentTurn(agentId);

    // Safety check for maximum rounds.
    if (round > MAX_ROUNDS) {
      this.state = {
        ...this.state,
        status: NEGOTIATION_STATUS.DEADLOCK,
        current_agent_turn: null,
      };

      return this.state;
    }

    /**
     * ---------------------------------------------------------
     * OPENING MOVE
     * ---------------------------------------------------------
     *
     * There is no previous offer.
     *
     * The first agent creates an opening anchor offer.
     */
    if (!this.state.current_offer) {
      const value = anchorOffer(
        position.direction,
        position.limit
      );

      const agent = this.scenario.agents.find(
        (item) => item.id === agentId
      );

      const personality = agent?.personality ?? "Unknown";

      const offer = createOffer({
        agent_id: agentId,
        round,
        value,
        reason: `Opening anchor offer (${personality}).`,
      });

      // The other agent responds in the SAME round.
      const nextAgent = this.getNextAgent(agentId);

      this.state = applyOffer(
        this.state,
        offer,
        nextAgent,
        NEGOTIATION_STATUS.IN_PROGRESS
      );

      return this.state;
    }

    /**
     * ---------------------------------------------------------
     * RESPONSE MOVE
     * ---------------------------------------------------------
     *
     * The current agent evaluates the previous agent's offer.
     */
    const incoming = this.state.current_offer;

    const agent = this.scenario.agents.find(
      (item) => item.id === agentId
    );

    const personality = agent?.personality ?? "Unknown";

    /**
     * Find the current agent's previous offer.
     *
     * This helps the decision logic determine the size/direction
     * of a concession.
     */
    const ownLastOffer = [...this.state.history]
      .reverse()
      .find((offer) => offer.agent_id === agentId);

    const ownLastValue = ownLastOffer
      ? ownLastOffer.value
      : anchorOffer(
          position.direction,
          position.limit
        );

    /**
     * Rule-based decision engine.
     *
     * The decision can be:
     *
     * ACCEPT
     * REJECT
     * COUNTEROFFER
     */
    const result = decide({
      direction: position.direction,
      limit: position.limit,
      personality,
      ownLastValue,
      incomingValue: incoming.value,
      round,
      maxRounds: MAX_ROUNDS,
    });

    /**
     * ---------------------------------------------------------
     * ACCEPT
     * ---------------------------------------------------------
     */
    if (result.decision === DECISIONS.ACCEPT) {
      const offer = createOffer({
        agent_id: agentId,
        round,
        value: incoming.value,
        reason: result.reason,
      });

      /**
       * Negotiation is complete.
       *
       * No next agent is needed.
       */
      this.state = applyOffer(
        this.state,
        offer,
        null,
        NEGOTIATION_STATUS.AGREEMENT
      );

      return this.state;
    }

    /**
     * ---------------------------------------------------------
     * REJECT
     * ---------------------------------------------------------
     */
    if (result.decision === DECISIONS.REJECT) {
      const offer = createOffer({
        agent_id: agentId,
        round,
        value: ownLastValue,
        reason: result.reason,
      });

      /**
       * Negotiation ends in deadlock/rejection.
       */
      this.state = applyOffer(
        this.state,
        offer,
        null,
        NEGOTIATION_STATUS.DEADLOCK
      );

      return this.state;
    }

    /**
     * ---------------------------------------------------------
     * COUNTEROFFER
     * ---------------------------------------------------------
     */
    const offer = createOffer({
      agent_id: agentId,
      round,
      value: result.nextValue,
      reason: result.reason,
    });

    /**
     * The next agent acts.
     *
     * If Employer just acted:
     *
     * Employer -> Candidate
     *
     * Candidate is the first agent, so the NEXT step
     * will automatically start Round + 1.
     *
     * If Candidate just acted:
     *
     * Candidate -> Employer
     *
     * Employer stays in the SAME round.
     */
    const nextAgent = this.getNextAgent(agentId);

    this.state = applyOffer(
      this.state,
      offer,
      nextAgent,
      NEGOTIATION_STATUS.IN_PROGRESS
    );

    return this.state;
  }

  /**
   * Runs the complete negotiation.
   *
   * Since one round contains two agent turns,
   * MAX_ROUNDS * 2 is the maximum number of steps.
   *
   * @returns {import("../types/negotiation").NegotiationState}
   */
  runToCompletion() {
    let guard = 0;

    const MAX_STEPS = MAX_ROUNDS * this.agentOrder.length;

    while (
      this.state.status !== NEGOTIATION_STATUS.AGREEMENT &&
      this.state.status !== NEGOTIATION_STATUS.REJECTED &&
      this.state.status !== NEGOTIATION_STATUS.DEADLOCK &&
      this.state.status !== NEGOTIATION_STATUS.COMPLETED &&
      guard < MAX_STEPS
    ) {
      this.step();
      guard += 1;
    }

    /**
     * If the maximum number of rounds is reached without
     * agreement or rejection, mark it as deadlock.
     */
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