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
 * One complete round contains both agent turns.
 *
 * Example:
 *
 * Round 1:
 *   Agent 1 -> Offer
 *   Agent 2 -> Response
 *
 * Round 2:
 *   Agent 1 -> Offer
 *   Agent 2 -> Response
 */
const MAX_ROUNDS = 8;

export class Orchestrator {
  /**
   * @param {import("../types/negotiation").Scenario} scenario
   */
  constructor(scenario) {
    this.scenario = scenario;

    // Create the initial negotiation state.
    this.state = createNegotiationState(scenario);

    /**
     * Store the effective negotiation position
     * of every agent.
     *
     * Example:
     *
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
      const derived = deriveLimitFromConstraints(
        agent.constraints,
      );

      this.positions[agent.id] =
        derived ?? {
          direction: "minimize",
          limit: 0,
        };
    }

    // Store the order in which agents take turns.
    this.agentOrder = scenario.agents.map(
      (agent) => agent.id,
    );

    // The first agent starts every new round.
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
    const index = this.agentOrder.indexOf(
      currentAgentId,
    );

    if (
      index === -1 ||
      this.agentOrder.length === 0
    ) {
      return null;
    }

    return this.agentOrder[
      (index + 1) % this.agentOrder.length
    ];
  }

  /**
   * Determines which negotiation round
   * the current agent belongs to.
   *
   * Round convention:
   *
   * Initial:
   *   Round 0 -> Agent 1
   *
   * Agent 1 acts:
   *   Round 1 -> Agent 2
   *
   * Agent 2 acts:
   *   Round 1 -> Agent 1
   *
   * Agent 1 acts:
   *   Round 2 -> Agent 2
   *
   * Agent 2 acts:
   *   Round 2 -> Agent 1
   *
   * @param {string} agentId
   * @returns {number}
   */
  getRoundForCurrentTurn(agentId) {
    // First move of the negotiation.
    if (this.state.current_round === 0) {
      return 1;
    }

    /**
     * When the first agent acts again,
     * a new round begins.
     *
     * The second agent stays inside
     * the current round.
     */
    if (agentId === this.firstAgentId) {
      return this.state.current_round + 1;
    }

    return this.state.current_round;
  }

  /**
   * Checks whether the current agent
   * is starting a new round.
   *
   * @param {string} agentId
   * @returns {boolean}
   */
  isStartingNewRound(agentId) {
    return (
      this.state.current_round === 0 ||
      agentId === this.firstAgentId
    );
  }

  /**
   * Advances the negotiation by exactly
   * ONE agent turn.
   *
   * One step() = one agent action.
   *
   * Normally:
   *
   * Step 1 -> Agent 1, Round 1
   * Step 2 -> Agent 2, Round 1
   * Step 3 -> Agent 1, Round 2
   * Step 4 -> Agent 2, Round 2
   *
   * @returns {import("../types/negotiation").NegotiationState}
   */
  step() {
    /**
     * Do nothing if the negotiation
     * has already reached a terminal state.
     */
    if (
      this.state.status ===
        NEGOTIATION_STATUS.AGREEMENT ||
      this.state.status ===
        NEGOTIATION_STATUS.REJECTED ||
      this.state.status ===
        NEGOTIATION_STATUS.DEADLOCK ||
      this.state.status ===
        NEGOTIATION_STATUS.COMPLETED
    ) {
      return this.state;
    }

    const agentId =
      this.state.current_agent_turn;

    if (!agentId) {
      return this.state;
    }

    const position =
      this.positions[agentId];

    if (!position) {
      return this.state;
    }

    const agent = this.scenario.agents.find(
      (item) => item.id === agentId,
    );

    if (!agent) {
      return this.state;
    }

    /**
     * Determine the actual round.
     *
     * Important:
     * We do NOT simply increment the round
     * after every agent action.
     */
    const round =
      this.getRoundForCurrentTurn(agentId);

    /**
     * Safety check.
     *
     * If the calculated round is greater than
     * the maximum allowed rounds, the negotiation
     * ends in deadlock.
     */
    if (round > MAX_ROUNDS) {
      this.state = {
        ...this.state,
        status:
          NEGOTIATION_STATUS.DEADLOCK,
        current_agent_turn: null,
      };

      return this.state;
    }

    /**
     * ---------------------------------------------------------
     * OPENING MOVE
     * ---------------------------------------------------------
     *
     * If there is no current offer, the current agent
     * creates the opening anchor offer.
     */
    if (!this.state.current_offer) {
      const value = anchorOffer(
        position.direction,
        position.limit,
      );

      const personality =
        agent.personality ?? "Unknown";

      const offer = createOffer({
        agent_id: agentId,
        round,
        value,
        reason:
          `Opening anchor offer based on ` +
          `the ${personality} personality.`,
      });

      /**
       * The other agent responds in
       * the SAME negotiation round.
       */
      const nextAgent =
        this.getNextAgent(agentId);

      this.state = applyOffer(
        this.state,
        offer,
        nextAgent,
        NEGOTIATION_STATUS.IN_PROGRESS,
      );

      return this.state;
    }

    /**
     * ---------------------------------------------------------
     * RESPONSE MOVE
     * ---------------------------------------------------------
     *
     * The current agent evaluates the
     * incoming offer.
     */
    const incoming =
      this.state.current_offer;

    const personality =
      agent.personality ?? "Unknown";

    /**
     * Find the current agent's most recent offer.
     *
     * This is used as the agent's previous
     * negotiating position.
     */
    const ownLastOffer =
      [...this.state.history]
        .reverse()
        .find(
          (offer) =>
            offer.agent_id === agentId,
        );

    const ownLastValue = ownLastOffer
      ? ownLastOffer.value
      : anchorOffer(
          position.direction,
          position.limit,
        );

    /**
     * ---------------------------------------------------------
     * RULE-BASED DECISION ENGINE
     * ---------------------------------------------------------
     *
     * The decision is based on:
     *
     * 1. Agent goal
     * 2. Agent constraint
     * 3. Agent personality
     * 4. Previous offer
     * 5. Incoming offer
     * 6. Current round
     *
     * Possible decisions:
     *
     * ACCEPT
     * REJECT
     * COUNTEROFFER
     */
    const result = decide({
      goal: agent.goal,
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
    if (
      result.decision === DECISIONS.ACCEPT
    ) {
      const offer = createOffer({
        agent_id: agentId,
        round,
        value: incoming.value,
        reason: result.reason,
      });

      /**
       * Agreement has been reached.
       *
       * There is no next agent because
       * the negotiation is finished.
       */
      this.state = applyOffer(
        this.state,
        offer,
        null,
        NEGOTIATION_STATUS.AGREEMENT,
      );

      return this.state;
    }

    /**
     * ---------------------------------------------------------
     * REJECT
     * ---------------------------------------------------------
     */
    if (
      result.decision === DECISIONS.REJECT
    ) {
      const offer = createOffer({
        agent_id: agentId,
        round,
        value: ownLastValue,
        reason: result.reason,
      });

      /**
       * IMPORTANT:
       *
       * REJECTED and DEADLOCK are different states.
       *
       * REJECTED:
       *   An agent explicitly rejects the offer.
       *
       * DEADLOCK:
       *   Maximum rounds are reached without
       *   reaching an agreement.
       */
      this.state = applyOffer(
        this.state,
        offer,
        null,
        NEGOTIATION_STATUS.REJECTED,
      );

      return this.state;
    }

    /**
     * ---------------------------------------------------------
     * COUNTEROFFER
     * ---------------------------------------------------------
     */
    const nextValue =
      Number.isFinite(result.nextValue)
        ? result.nextValue
        : incoming.value;

    const offer = createOffer({
      agent_id: agentId,
      round,
      value: nextValue,
      reason: result.reason,
    });

    /**
     * Move to the next agent.
     *
     * Example:
     *
     * Candidate -> Employer
     *
     * Employer -> Candidate
     *
     * When Candidate becomes active again,
     * getRoundForCurrentTurn() starts the
     * next round.
     */
    const nextAgent =
      this.getNextAgent(agentId);

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
   * Since one round contains two agent turns:
   *
   * MAX_ROUNDS * number of agents
   *
   * is the maximum number of steps.
   *
   * @returns {import("../types/negotiation").NegotiationState}
   */
  runToCompletion() {
    let guard = 0;

    const MAX_STEPS =
      MAX_ROUNDS *
      this.agentOrder.length;

    while (
      this.state.status !==
        NEGOTIATION_STATUS.AGREEMENT &&
      this.state.status !==
        NEGOTIATION_STATUS.REJECTED &&
      this.state.status !==
        NEGOTIATION_STATUS.DEADLOCK &&
      this.state.status !==
        NEGOTIATION_STATUS.COMPLETED &&
      guard < MAX_STEPS
    ) {
      this.step();
      guard += 1;
    }

    /**
     * If all allowed steps have been used
     * and the negotiation is still active,
     * mark it as DEADLOCK.
     */
    if (
      guard >= MAX_STEPS &&
      this.state.status ===
        NEGOTIATION_STATUS.IN_PROGRESS
    ) {
      this.state = {
        ...this.state,
        status:
          NEGOTIATION_STATUS.DEADLOCK,
        current_agent_turn: null,
      };
    }

    return this.state;
  }
}

export { MAX_ROUNDS };