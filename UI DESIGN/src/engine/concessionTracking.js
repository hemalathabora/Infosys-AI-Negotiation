// Designed by TEAM 4
import { deriveLimitFromConstraints, deriveDirectionFromGoal } from "./decisionLogic.js";

const MAX_STEP_RATIO = {
  Aggressive: 0.15,
  Collaborative: 0.35,
  "Risk-averse": 0.25,
};

/**
 * Extracts a scalar numeric price from various offer formats.
 */
export function extractScalarPrice(offerInput) {
  if (offerInput === null || offerInput === undefined) return null;
  if (typeof offerInput === "number") return offerInput;
  if (typeof offerInput === "object") {
    if (offerInput.price !== undefined && offerInput.price !== null) return Number(offerInput.price);
    if (offerInput.value !== undefined && offerInput.value !== null) return Number(offerInput.value);
  }
  return null;
}

/**
 * Authoritative Target Position Resolver for JS Engine.
 */
export function getAuthoritativeTarget(agentProfile = {}, limit = null, direction = null) {
  const target = agentProfile.target_price ?? agentProfile.target_position ?? agentProfile.target_value;
  if (target !== null && target !== undefined) return Number(target);

  // Extract target from goals or negotiation_objectives text if present
  const objectives = agentProfile.negotiation_objectives || [];
  const goals = agentProfile.goal || agentProfile.goals || [];
  const combined = [
    ...(Array.isArray(objectives) ? objectives : [objectives]),
    ...(Array.isArray(goals) ? goals : [goals])
  ].map(x => String(x));

  for (const item of combined) {
    const match = item.match(/target\s*(?:price|val|cost|amount|allocation|salary)?\s*(?:is|=|:)?\s*\$?([\d,]+)/i);
    if (match) {
      const num = Number(match[1].replace(/,/g, ""));
      if (Number.isFinite(num)) return num;
    }
    const matchNum = item.match(/\$?([\d,]+)/);
    if (matchNum && item.toLowerCase().includes("target")) {
      const num = Number(matchNum[1].replace(/,/g, ""));
      if (Number.isFinite(num)) return num;
    }
  }

  const constraints = agentProfile.constraints || [];
  const derived = deriveLimitFromConstraints(constraints);
  const dir = direction || agentProfile.direction || (derived ? derived.direction : deriveDirectionFromGoal(agentProfile.goal || agentProfile.goals, "minimize"));
  const lim = limit !== null && limit !== undefined ? limit : (derived ? derived.limit : (dir === "minimize" ? 85000 : 80000));

  return dir === "minimize" ? Math.round(lim * 0.85) : Math.round(lim * 1.15);
}

/**
 * Finds the permanent initial offer position for a given agent from history.
 */
export function getAgentInitialPosition(history = [], agentId) {
  for (const entry of history) {
    if (entry.agent_id === agentId) {
      const val = extractScalarPrice(entry.proposed_offer) ?? entry.value;
      if (val !== null && val !== undefined) return Number(val);
    }
  }
  return null;
}

/**
 * Finds the most recent offer position for a given agent from history.
 */
export function getAgentPreviousPosition(history = [], agentId) {
  for (let i = history.length - 1; i >= 0; i--) {
    const entry = history[i];
    if (entry.agent_id === agentId) {
      const val = extractScalarPrice(entry.proposed_offer) ?? entry.value;
      if (val !== null && val !== undefined) return Number(val);
    }
  }
  return null;
}

/**
 * Rate of Concession Decay Calculation (JS Engine).
 */
export function calculateRateOfConcessionDecay(concessionSizes = []) {
  const validSizes = concessionSizes.filter((c) => c !== null && c !== undefined && !Number.isNaN(Number(c)));
  if (validSizes.length < 2) return null;

  const n = validSizes.length;
  const mid = Math.floor(n / 2);
  const early = validSizes.slice(0, mid);
  const recent = validSizes.slice(mid);

  const avgEarly = early.reduce((a, b) => a + b, 0) / early.length;
  const avgRecent = recent.reduce((a, b) => a + b, 0) / recent.length;

  if (avgEarly === 0) return avgRecent === 0 ? 0 : null;

  const decay = ((avgEarly - avgRecent) / avgEarly) * 100;
  return Math.round(decay * 100) / 100;
}

/**
 * Authoritative Concession Calculation Model for JS Engine.
 */
export function calculateConcession(agentProfile = {}, previousOffer = null, currentOffer = null, negotiationState = {}, initialPosition = null) {
  const constraints = agentProfile.constraints || [];
  const derived = deriveLimitFromConstraints(constraints);

  const direction = agentProfile.direction || (derived ? derived.direction : deriveDirectionFromGoal(agentProfile.goal || agentProfile.goals, "minimize"));
  const limit = agentProfile.limit !== undefined ? agentProfile.limit : (derived ? derived.limit : (direction === "minimize" ? 85000 : 80000));
  const targetPos = getAuthoritativeTarget(agentProfile, limit, direction);

  const currVal = extractScalarPrice(currentOffer) ?? (typeof currentOffer === "number" ? currentOffer : 0);
  const prevVal = extractScalarPrice(previousOffer);

  const initPos = initialPosition !== null ? initialPosition : (prevVal !== null ? prevVal : currVal);

  let isConcession = false;
  let concessionAmount = 0;
  let stepPercentage = 0;
  let concessionDir = "no_change";

  if (prevVal !== null && prevVal !== undefined) {
    if (currVal === prevVal) {
      concessionDir = "no_change";
      concessionAmount = 0;
      isConcession = false;
    } else if (direction === "minimize") {
      if (currVal < prevVal) {
        if (prevVal > targetPos) {
          concessionDir = "toward_target";
          concessionAmount = Math.round((prevVal - currVal) * 100) / 100;
          isConcession = true;
        } else {
          concessionDir = "away_from_target";
          concessionAmount = 0;
          isConcession = false;
        }
      } else {
        if (currVal <= limit) {
          concessionDir = "toward_target";
          concessionAmount = Math.round((currVal - prevVal) * 100) / 100;
          isConcession = true;
        } else {
          concessionDir = "away_from_target";
          concessionAmount = 0;
          isConcession = false;
        }
      }
    } else {
      if (currVal > prevVal) {
        if (prevVal < targetPos) {
          concessionDir = "toward_target";
          concessionAmount = Math.round((currVal - prevVal) * 100) / 100;
          isConcession = true;
        } else {
          concessionDir = "away_from_target";
          concessionAmount = 0;
          isConcession = false;
        }
      } else {
        if (currVal >= limit) {
          concessionDir = "toward_target";
          concessionAmount = Math.round((prevVal - currVal) * 100) / 100;
          isConcession = true;
        } else {
          concessionDir = "away_from_target";
          concessionAmount = 0;
          isConcession = false;
        }
      }
    }

    if (isConcession && prevVal !== 0) {
      stepPercentage = Math.round((concessionAmount / Math.abs(prevVal)) * 10000) / 100;
    }
  }

  // Cumulative Concession Sum (True concessions only)
  const agentId = agentProfile.id;
  const history = negotiationState.history || [];
  const trueConcessionSizes = [];

  if (history.length > 0 && agentId) {
    const agentTurns = history.filter((h) => h.agent_id === agentId);
    let runningPrev = null;
    for (const turn of agentTurns) {
      const tVal = extractScalarPrice(turn.proposed_offer) ?? turn.value;
      if (tVal !== null && tVal !== undefined) {
        if (runningPrev !== null) {
          if (direction === "minimize") {
            if (tVal > runningPrev && tVal <= limit) {
              trueConcessionSizes.push(Math.round((tVal - runningPrev) * 100) / 100);
            } else if (tVal < runningPrev && runningPrev > targetPos) {
              trueConcessionSizes.push(Math.round((runningPrev - tVal) * 100) / 100);
            }
          } else if (direction === "maximize") {
            if (tVal < runningPrev && tVal >= limit) {
              trueConcessionSizes.push(Math.round((runningPrev - tVal) * 100) / 100);
            } else if (tVal > runningPrev && runningPrev < targetPos) {
              trueConcessionSizes.push(Math.round((tVal - runningPrev) * 100) / 100);
            }
          }
        }
        runningPrev = Number(tVal);
      }
    }
    if (isConcession) trueConcessionSizes.push(concessionAmount);
  } else if (isConcession) {
    trueConcessionSizes.push(concessionAmount);
  }

  const cumulativeConcession = trueConcessionSizes.length > 0
    ? Math.round(trueConcessionSizes.reduce((a, b) => a + b, 0) * 100) / 100
    : (direction === "minimize"
        ? (initPos && currVal < initPos ? Math.round((initPos - currVal) * 100) / 100 : 0)
        : (initPos && currVal > initPos ? Math.round((currVal - initPos) * 100) / 100 : 0));

  const cumulativePercentage = initPos && initPos !== 0 ? Math.round((cumulativeConcession / Math.abs(initPos)) * 10000) / 100 : 0;
  const decayRate = calculateRateOfConcessionDecay(trueConcessionSizes);
  const currentRound = negotiationState.current_round || 1;
  const velocity = currentRound > 0 ? Math.round((cumulativeConcession / currentRound) * 100) / 100 : 0;

  const remainingCapacity = direction === "minimize"
    ? Math.max(Math.round((limit - currVal) * 100) / 100, 0)
    : Math.max(Math.round((currVal - limit) * 100) / 100, 0);

  const isValid = direction === "minimize" ? currVal <= limit : currVal >= limit;
  const persona = agentProfile.personality || agentProfile.persona || "Collaborative";
  const maxRate = MAX_STEP_RATIO[persona] ?? 0.25;
  const base = Math.max(Math.abs(initPos || currVal || 1), Math.abs(limit), 1);
  const maximumAllowed = Math.round(base * maxRate);

  return {
    initial_position: initPos,
    target_position: targetPos,
    current_position: currVal,
    previous_position: prevVal,
    current_round: currentRound,
    concession_amount: concessionAmount,
    concession_percentage: stepPercentage,
    cumulative_concession: cumulativeConcession,
    cumulative_concession_percentage: cumulativePercentage,
    concession_sum: cumulativeConcession,
    concession_velocity: velocity,
    rate_of_concession_decay: decayRate,
    is_concession: isConcession,
    last_concession: concessionAmount,
    maximum_allowed_concession: maximumAllowed,
    remaining_concession: remainingCapacity,
    remaining_concession_capacity: remainingCapacity,
    concession_direction: concessionDir,
    concession_count: trueConcessionSizes.length,
    is_valid: isValid
  };
}

/**
 * Concession Control Layer (JS Engine).
 */
export function applyConcessionControl(agentProfile, proposedPrice, previousPrice, initialPosition, negotiationState = {}) {
  const constraints = agentProfile.constraints || [];
  const derived = deriveLimitFromConstraints(constraints);

  const direction = agentProfile.direction || (derived ? derived.direction : deriveDirectionFromGoal(agentProfile.goal || agentProfile.goals, "minimize"));
  const limit = agentProfile.limit !== undefined ? agentProfile.limit : (derived ? derived.limit : (direction === "minimize" ? 85000 : 80000));

  const persona = agentProfile.personality || agentProfile.persona || "Collaborative";
  const roundNum = negotiationState.current_round || 1;

  let finalPrice = proposedPrice;
  let wasClamped = false;
  const reasons = [];

  // Hard limit constraint
  if (direction === "minimize" && finalPrice > limit) {
    finalPrice = limit;
    wasClamped = true;
    reasons.push(`Clamped proposed ${proposedPrice} to Buyer maximum limit ${limit}.`);
  } else if (direction === "maximize" && finalPrice < limit) {
    finalPrice = limit;
    wasClamped = true;
    reasons.push(`Clamped proposed ${proposedPrice} to Vendor minimum floor ${limit}.`);
  }

  // Single step concession control
  if (previousPrice !== null && previousPrice !== undefined) {
    const stepMove = Math.abs(finalPrice - previousPrice);
    const maxRatio = MAX_STEP_RATIO[persona] ?? 0.25;

    const remainingDist = Math.abs(limit - previousPrice);
    let maxStep = Math.max(remainingDist * maxRatio, Math.abs(previousPrice) * 0.05, 500);

    if (roundNum <= 2 && remainingDist > 0) {
      maxStep = Math.min(maxStep, remainingDist * 0.30);
    }

    if (stepMove > maxStep) {
      if (direction === "minimize" && finalPrice > previousPrice) {
        const clamped = previousPrice + maxStep;
        if (clamped <= limit) {
          finalPrice = Math.round(clamped);
          wasClamped = true;
          reasons.push(`Gradual concession rule: capped Buyer move to max step $${maxStep}.`);
        }
      } else if (direction === "maximize" && finalPrice < previousPrice) {
        const clamped = previousPrice - maxStep;
        if (clamped >= limit) {
          finalPrice = Math.round(clamped);
          wasClamped = true;
          reasons.push(`Gradual concession rule: capped Vendor move to max step $${maxStep}.`);
        }
      }
    }
  }

  return {
    finalPrice: Math.round(finalPrice),
    wasClamped,
    reason: reasons.length > 0 ? reasons.join(" ") : "Concession within valid boundaries."
  };
}

/**
 * Builds a per-agent concession timeline from the offer history.
 */
export function buildConcessionTimeline(history = []) {
  const byAgent = {};
  for (const offer of history) {
    (byAgent[offer.agent_id] ??= []).push(offer);
  }

  const timeline = {};
  for (const [agentId, offers] of Object.entries(byAgent)) {
    const sorted = [...offers].sort((a, b) => (a.round || 0) - (b.round || 0));
    timeline[agentId] = sorted.map((offer, i) => {
      const val = extractScalarPrice(offer.proposed_offer) ?? offer.value ?? 0;
      if (i === 0) {
        return { round: offer.round || 1, value: val, delta: null, direction: "opening" };
      }
      const prevVal = extractScalarPrice(sorted[i - 1].proposed_offer) ?? sorted[i - 1].value ?? val;
      const delta = Math.round((val - prevVal) * 100) / 100;
      return {
        round: offer.round || i + 1,
        value: val,
        delta,
        direction: delta === 0 ? "hold" : "concession",
      };
    });
  }
  return timeline;
}

/**
 * Total true concession size per agent.
 */
export function totalConcessionByAgent(timeline = {}) {
  const totals = {};
  for (const [agentId, entries] of Object.entries(timeline)) {
    totals[agentId] = entries.reduce((sum, e) => sum + (e.delta ? Math.abs(e.delta) : 0), 0);
  }
  return totals;
}
