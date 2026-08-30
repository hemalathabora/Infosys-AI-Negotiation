import { DECISIONS } from "../types/negotiation.js";

/**
 * Concession rate per personality — the fraction of the remaining gap
 * an agent is willing to close in a single counteroffer. This is the
 * only place personality affects behavior in the rule-based prototype;
 * an LLM-based agent would replace this whole module later but should
 * still respect the same Offer/Decision contract.
 */
const CONCESSION_RATE = {
  Aggressive: 0.1, // gives up ground slowly
  Collaborative: 0.35, // gives up ground generously to reach agreement
  "Risk-averse": 0.25, // moderate — prioritizes a safe, non-deadlocked outcome
};

/** How close two offers need to be (as a fraction of the negotiation range) to count as "close enough" to accept. */
const ACCEPTANCE_TOLERANCE = 0.03;

/**
 * Extracts a negotiation "limit" and "direction" from a constraint string.
 * "Maximum $X ..." → this agent must not go above X, so it wants the
 * negotiated value to be as LOW as possible ("minimize").
 * "Minimum $X ..." → this agent must not go below X, so it wants the
 * negotiated value to be as HIGH as possible ("maximize").
 *
 * @param {string[]} constraints
 * @returns {{ direction: "minimize" | "maximize", limit: number } | null}
 */
export function deriveLimitFromConstraints(constraints) {
  for (const constraint of constraints) {
    const rawConstraint = typeof constraint === "string" ? constraint : constraint?.text ?? "";
    const rawDefaultValue = typeof constraint === "object" && constraint ? constraint.defaultValue ?? constraint.value : null;

    const match = rawConstraint.match(/^(Maximum|Minimum)\s*\$([\d,]+)/i);
    if (!match) continue;
    const [, qualifier, rawValue] = match;
    const limit = Number(rawDefaultValue ?? rawValue.replace(/,/g, ""));
    return {
      direction: /maximum/i.test(qualifier) ? "minimize" : "maximize",
      limit,
    };
  }
  return null;
}

/**
 * An agent's opening anchor offer — favorable to them, on the far side of
 * their own limit, per the classic anchor-then-concede pattern.
 *
 * @param {"minimize"|"maximize"} direction
 * @param {number} limit
 * @returns {number}
 */
export function anchorOffer(direction, limit) {
  const spread = limit * 0.15;
  return direction === "minimize" ? limit - spread : limit + spread;
}

/**
 * Core rule-based decision: given an agent's own negotiating position and
 * the incoming offer from the other side, decide accept / reject /
 * counteroffer, and (if countering) what value to propose next.
 *
 * @param {Object} params
 * @param {"minimize"|"maximize"} params.direction - which way this agent wants the value to move
 * @param {number} params.limit - this agent's hard constraint (ceiling if minimize, floor if maximize)
 * @param {string} params.personality
 * @param {number} params.ownLastValue - the value this agent last offered (or their anchor, if first turn)
 * @param {number} params.incomingValue - the value just offered by the other agent
 * @param {number} params.round
 * @param {number} params.maxRounds - round at which an unresolved negotiation is declared a deadlock
 * @returns {{ decision: import('../types/negotiation').Decision, nextValue?: number, reason: string }}
 */
export function decide({
  direction,
  limit,
  personality,
  ownLastValue,
  incomingValue,
  round,
  maxRounds,
}) {
  const withinOwnLimit =
    direction === "minimize" ? incomingValue <= limit : incomingValue >= limit;
  const gap = Math.abs(ownLastValue - incomingValue);
  const closeEnough = gap <= Math.max(limit, incomingValue) * ACCEPTANCE_TOLERANCE;

  if (withinOwnLimit && closeEnough) {
    return {
      decision: DECISIONS.ACCEPT,
      reason: `Offer of ${incomingValue} is within constraint (${direction === "minimize" ? "≤" : "≥"} ${limit}) and close to my last position.`,
    };
  }

  if (!withinOwnLimit && round >= maxRounds) {
    return {
      decision: DECISIONS.REJECT,
      reason: `After ${round} rounds, offer of ${incomingValue} still violates my constraint (${direction === "minimize" ? "≤" : "≥"} ${limit}).`,
    };
  }

  // Counteroffer: move a personality-driven step from my last position
  // toward theirs, but never cross my own hard limit.
  const rate = CONCESSION_RATE[personality] ?? 0.2;
  let nextValue = ownLastValue + rate * (incomingValue - ownLastValue);
  nextValue = direction === "minimize" ? Math.min(nextValue, limit) : Math.max(nextValue, limit);

  return {
    decision: DECISIONS.COUNTEROFFER,
    nextValue,
    reason: `Conceding ${(rate * 100).toFixed(0)}% of the gap toward ${incomingValue} (${personality} concession rate), staying within my constraint.`,
  };
}
