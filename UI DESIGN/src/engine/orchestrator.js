// Designed by TEAM 4
import { NEGOTIATION_STATUS, DECISIONS } from "../types/negotiation.js";
import { createNegotiationState, applyOffer } from "./negotiationState.js";
import { createOffer } from "./offer.js";
import { deriveLimitFromConstraints, anchorOffer, decide } from "./decisionLogic.js";

const MAX_ROUNDS = 8;

/**
 * The Orchestrator's job, per the project spec, is to:
 *  - know whose turn it is
 *  - know the current round
 *  - hold the negotiation history
 *  - know the current negotiation state
 *  - know which agent acts next
 *
 * It does NOT reason about offers itself â€” that's delegated to an
 * "agent brain" function passed in per agent. Today that brain is the
 * rule-based decisionLogic module (see engine/decisionLogic.js). Swapping
 * in an LLM-powered reasoning engine later means replacing `agentBrains`
 * below with a different implementation of the exact same interface:
 *
 *   (context) => { decision: "accept"|"reject"|"counteroffer", nextValue?, reason }
 *
 * Nothing else in the Orchestrator, state model, or UI needs to change.
 */
export class Orchestrator {
  /**
   * @param {import('../types/negotiation').Scenario} scenario
   */
  constructor(scenario) {
    this.scenario = scenario;
    this.state = createNegotiationState(scenario);

    /** @type {Record<string, { direction: "minimize"|"maximize", limit: number }>} */
    this.positions = {};
    for (const agent of scenario.agents) {
      const derived = deriveLimitFromConstraints(agent.constraints);
      this.positions[agent.id] = derived ?? { direction: "minimize", limit: 0 };
    }

    this.agentOrder = scenario.agents.map((a) => a.id);
  }

  /** @returns {import('../types/negotiation').NegotiationState} */
  getState() {
    return this.state;
  }

  getCurrentRound() {
    return this.state.current_round;
  }

  getCurrentTurn() {
    return this.state.current_agent_turn;
  }

  getHistory() {
    return this.state.history;
  }

  getNextAgent(currentAgentId) {
    const idx = this.agentOrder.indexOf(currentAgentId);
    return this.agentOrder[(idx + 1) % this.agentOrder.length];
  }

  /**
   * Advances the negotiation by exactly one offer: the current agent
   * either opens (round 1) or responds to the previous offer, and the
   * resulting state transition is applied and returned.
   *
   * @returns {import('../types/negotiation').NegotiationState}
   */
  step() {
    if (
      this.state.status === NEGOTIATION_STATUS.AGREEMENT ||
      this.state.status === NEGOTIATION_STATUS.DEADLOCK ||
      this.state.status === NEGOTIATION_STATUS.COMPLETED
// Implemented by TEAM 4
    ) {
      return this.state;
    }

    const agentId = this.state.current_agent_turn;
    const position = this.positions[agentId];
    const round = this.state.current_round + 1;

    // Opening move: no offer exists yet, agent anchors.
    if (!this.state.current_offer) {
      const value = anchorOffer(position.direction, position.limit);
      const offer = createOffer({
        agent_id: agentId,
        round,
        value,
        reason: `Opening anchor offer (${this.scenario.agents.find((a) => a.id === agentId)?.personality}).`,
      });
      const nextAgent = this.getNextAgent(agentId);
      this.state = applyOffer(this.state, offer, nextAgent, NEGOTIATION_STATUS.IN_PROGRESS);
      return this.state;
    }

    // Response move: evaluate the other agent's last offer.
    const incoming = this.state.current_offer;
    const personality = this.scenario.agents.find((a) => a.id === agentId)?.personality;
    const ownLastOffer = [...this.state.history].reverse().find((o) => o.agent_id === agentId);
    const ownLastValue = ownLastOffer ? ownLastOffer.value : anchorOffer(position.direction, position.limit);

    const result = decide({
      direction: position.direction,
      limit: position.limit,
      personality,
      ownLastValue,
      incomingValue: incoming.value,
      round,
      maxRounds: MAX_ROUNDS,
    });

    if (result.decision === DECISIONS.ACCEPT) {
      const offer = createOffer({ agent_id: agentId, round, value: incoming.value, reason: result.reason });
      this.state = applyOffer(this.state, offer, agentId, NEGOTIATION_STATUS.AGREEMENT);
      return this.state;
    }

    if (result.decision === DECISIONS.REJECT) {
      const offer = createOffer({ agent_id: agentId, round, value: ownLastValue, reason: result.reason });
      this.state = applyOffer(this.state, offer, agentId, NEGOTIATION_STATUS.DEADLOCK);
      return this.state;
    }

    // Counteroffer
    const offer = createOffer({ agent_id: agentId, round, value: result.nextValue, reason: result.reason });
    const nextAgent = this.getNextAgent(agentId);
    this.state = applyOffer(this.state, offer, nextAgent, NEGOTIATION_STATUS.IN_PROGRESS);
    return this.state;
  }

  /**
   * Runs rounds until agreement, deadlock, or the round cap is hit â€”
   * used by the demo panel to play out a full session for inspection.
   * @returns {import('../types/negotiation').NegotiationState}
   */
  runToCompletion() {
    let guard = 0;
    while (
      this.state.status !== NEGOTIATION_STATUS.AGREEMENT &&
      this.state.status !== NEGOTIATION_STATUS.DEADLOCK &&
      guard < MAX_ROUNDS * 2
    ) {
      this.step();
      guard += 1;
    }
    return this.state;
  }
}

export { MAX_ROUNDS };
// Designed by TEAM 4
// Designed by TEAM 4

