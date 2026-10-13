// Designed by TEAM 4

import { DECISIONS } from "../types/negotiation.js";

/**
 * Personality controls how aggressively an agent moves
 * toward the other agent's offer.
 */
const CONCESSION_RATE = {
  Aggressive: 0.1,
  Collaborative: 0.35,
  "Risk-averse": 0.25,
};

/**
 * Extract negotiation direction and hard limit
 * from the agent's constraints.
 *
 * Maximum $X -> agent wants the value as LOW as possible.
 * Minimum $X -> agent wants the value as HIGH as possible.
 *
 * @param {(string|Object)[]} constraints
 * @returns {{ direction: "minimize"|"maximize", limit: number } | null}
 */
export function deriveLimitFromConstraints(constraints = []) {
  for (const constraint of constraints) {
    const rawConstraint =
      typeof constraint === "string"
        ? constraint
        : constraint?.text ?? "";

    const rawDefaultValue =
      typeof constraint === "object" && constraint
        ? constraint.defaultValue ?? constraint.value
        : null;

    const match = rawConstraint.match(
      /^(Maximum|Minimum)\s*\$([\d,]+)/i,
    );

    if (!match) continue;

    const [, qualifier, rawValue] = match;

    const limit = Number(
      rawDefaultValue ?? rawValue.replace(/,/g, ""),
    );

    return {
      direction: /maximum/i.test(qualifier)
        ? "minimize"
        : "maximize",
      limit,
    };
  }

  return null;
}

/**
 * Determines negotiation direction from the agent's goal.
 *
 * This makes the decision layer explicitly use the agent goal,
 * while the constraint remains the hard boundary.
 */
export function deriveDirectionFromGoal(goal, fallbackDirection) {
  const normalizedGoal = String(goal ?? "").toLowerCase();

  if (
    normalizedGoal.includes("reduce") ||
    normalizedGoal.includes("lower") ||
    normalizedGoal.includes("minimize") ||
    normalizedGoal.includes("save") ||
    normalizedGoal.includes("lowest")
  ) {
    return "minimize";
  }

  if (
    normalizedGoal.includes("increase") ||
    normalizedGoal.includes("higher") ||
    normalizedGoal.includes("maximize") ||
    normalizedGoal.includes("highest") ||
    normalizedGoal.includes("earn") ||
    normalizedGoal.includes("salary")
  ) {
    return "maximize";
  }

  return fallbackDirection;
}

/**
 * Creates the opening anchor offer.
 *
 * @param {"minimize"|"maximize"} direction
 * @param {number} limit
 * @returns {number}
 */
export function anchorOffer(direction, limit) {
  const spread = limit * 0.15;

  return direction === "minimize"
    ? limit - spread
    : limit + spread;
}

/**
 * Core rule-based negotiation decision.
 *
 * Decision is based on:
 * - Agent goal
 * - Agent constraint
 * - Agent personality
 * - Previous offer
 * - Incoming offer
 * - Current round
 *
 * Possible decisions:
 * ACCEPT
 * REJECT
 * COUNTEROFFER
 *
 * @param {Object} params
 * @param {string} params.goal
 * @param {"minimize"|"maximize"} params.direction
 * @param {number} params.limit
 * @param {string} params.personality
 * @param {number} params.ownLastValue
 * @param {number} params.incomingValue
 * @param {number} params.round
 * @param {number} params.maxRounds
 *
 * @returns {{
 *   decision: import("../types/negotiation").Decision,
 *   nextValue?: number,
 *   reason: string
 * }}
 */
export function decide({
  goal,
  direction,
  limit,
  personality,
  ownLastValue,
  incomingValue,
  round,
  maxRounds,
}) {
  const goalDirection = deriveDirectionFromGoal(
    goal,
    direction,
  );

  /**
   * Hard constraint check.
   *
   * Minimize -> incoming value cannot exceed maximum.
   * Maximize -> incoming value cannot fall below minimum.
   */
  const withinOwnLimit =
    goalDirection === "minimize"
      ? incomingValue <= limit
      : incomingValue >= limit;

  /**
   * Determine how close the incoming offer is
   * to the agent's previous position.
   */
  const gap = Math.abs(
    ownLastValue - incomingValue,
  );

  const comparisonBase = Math.max(
    Math.abs(limit),
    Math.abs(incomingValue),
    1,
  );

  const isTightGap = gap <= comparisonBase * 0.005 || gap <= 10;
  const isCloseGap = gap <= comparisonBase * 0.035;

  /**
   * ACCEPT
   *
   * The offer satisfies the hard constraint and either:
   * 1. Gap is virtually zero (tight gap <= 0.5% or <= $10), OR
   * 2. After at least 3 bargaining rounds, offers have converged (gap <= 3.5%), OR
   * 3. Final round (round >= maxRounds) reached and offer satisfies hard limit.
   */
  if (
    withinOwnLimit &&
    (isTightGap || (round >= 4 && isCloseGap) || round >= (maxRounds || 5))
  ) {
    return {
      decision: DECISIONS.ACCEPT,
      reason:
        `Accepted ${incomingValue} in Round ${round} because it satisfies ` +
        `the goal "${goal}" and stays within the ` +
        `${goalDirection === "minimize" ? "maximum" : "minimum"} ` +
        `constraint of ${limit}.`,
    };
  }

  /**
   * REJECT
   *
   * If the negotiation has reached the final round
   * and the offer still violates the hard constraint,
   * the agent rejects it.
   */
  if (!withinOwnLimit && round >= (maxRounds || 5)) {
    return {
      decision: DECISIONS.REJECT,
      reason:
        `Rejected ${incomingValue} because it still violates ` +
        `the ${goalDirection === "minimize" ? "maximum" : "minimum"} ` +
        `constraint of ${limit} after ${round} rounds.`,
    };
  }

  /**
   * COUNTEROFFER
   *
   * Personality determines how much of the remaining
   * gap the agent is willing to concede.
   */
  const rate =
    CONCESSION_RATE[personality] ?? 0.25;

  let nextValue =
    ownLastValue +
    rate * (incomingValue - ownLastValue);

  // Guarantee a minimum step to ensure continuous offer evolution across rounds
  const minStep = Math.max(comparisonBase * 0.01, 100);
  if (Math.abs(nextValue - ownLastValue) < minStep) {
    if (goalDirection === "minimize") {
      nextValue = Math.min(ownLastValue + minStep, incomingValue);
    } else {
      nextValue = Math.max(ownLastValue - minStep, incomingValue);
    }
  }

  /**
   * Never cross the agent's hard constraint.
   */
  if (goalDirection === "minimize") {
    nextValue = Math.min(Math.round(nextValue), limit);
  } else {
    nextValue = Math.max(Math.round(nextValue), limit);
  }

  return {
    decision: DECISIONS.COUNTEROFFER,
    nextValue,
    reason:
      `Countered at ${nextValue} in Round ${round}. The ${personality} ` +
      `personality concedes ${(rate * 100).toFixed(0)}% ` +
      `of the gap toward ${incomingValue}, while pursuing ` +
      `the goal "${goal}" and respecting the constraint limit of ${limit}.`,
  };
}