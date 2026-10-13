// Designed by TEAM 4
import { DECISIONS } from "../types/negotiation.js";
import { deriveLimitFromConstraints, deriveDirectionFromGoal } from "./decisionLogic.js";

/**
 * Builds standard LLM Prompts from Agent Profile, Negotiation State, History, and Opponent Offer.
 *
 * Task 1: Connect LLM with Agent Profile (role, persona, goals, constraints, objectives, state)
 * Task 2: Pass Complete Negotiation History (previous offers, counteroffers, decisions, round, opponent offer)
 *
 * @param {Object} agentProfile
 * @param {Object} negotiationState
 * @param {Array} conversationHistory
 * @param {Object|null} opponentOffer
 * @returns {{ systemPrompt: string, userPrompt: string }}
 */
export function buildLLMPrompt(agentProfile, negotiationState, conversationHistory, opponentOffer) {
  const systemPrompt = `You are an AI Negotiation Agent representing the role of "${agentProfile.role || agentProfile.name || 'Negotiator'}".
Persona / Personality: "${agentProfile.personality || 'Collaborative'}"
Strategic Goal: "${agentProfile.goal || agentProfile.negotiation_objectives || ''}"
Constraints & Boundaries: ${JSON.stringify(agentProfile.constraints || [])}

RULES & GUARDRAILS:
1. Strict Boundaries: NEVER accept or propose terms violating your defined numeric constraints.
2. Persona Alignment:
   - Aggressive: Makes conservative concessions (~10%), holds firm, maximizes strategic value.
   - Collaborative: Concedes moderately (~35%), seeks win-win convergence.
   - Risk-averse: Concedes safely (~25%), avoids deal-breaking deadlocks while protecting bottom line.
3. History Sensitivity: Analyze previous offers, counteroffers, and opponent concession trends across rounds.
4. Output Requirement: Return JSON strictly conforming to:
{
  "decision": "accept" | "counteroffer" | "reject",
  "proposed_offer": number,
  "reasoning": "Natural language justification incorporating persona, goal, constraints, history, and opponent offer.",
  "negotiation_parameters": {
    "concession_rate": number,
    "target_value": number,
    "distance_to_constraint": number,
    "strategy_notes": string
  }
}`;

  const userPrompt = `
=== CURRENT NEGOTIATION STATE ===
- Agent Role: ${agentProfile.role || agentProfile.name} (ID: ${agentProfile.id})
- Personality: ${agentProfile.personality}
- Strategic Goal: ${agentProfile.goal}
- Constraints: ${JSON.stringify(agentProfile.constraints)}
- Current Round: ${negotiationState.current_round} / ${negotiationState.max_rounds || 8}
- Negotiation Status: ${negotiationState.status}

=== OPPONENT'S LATEST OFFER ===
${opponentOffer ? JSON.stringify(opponentOffer, null, 2) : "Opening Turn (No opponent offer yet)"}

=== COMPLETE NEGOTIATION HISTORY ===
${conversationHistory && conversationHistory.length > 0
  ? JSON.stringify(conversationHistory, null, 2)
  : "No previous offers in history."}

Evaluate the opponent's offer against your goals, constraints, and complete negotiation history. Decide whether to accept, counteroffer, or reject, and calculate your exact proposed offer. Respond in JSON.`;

  return { systemPrompt, userPrompt };
}

/**
 * LLM Reasoning Engine Function.
 *
 * Task 3 & Task 4: Generate Structured Negotiation Responses based on:
 * - Agent Persona
 * - Goals
 * - Constraints
 * - Previous Negotiation History
 * - Opponent's Current Offer
 *
 * @param {Object} agentProfile
 * @param {Object} negotiationState
 * @param {Array} conversationHistory
 * @param {Object|null} opponentOffer
 * @returns {Promise<{ decision: string, proposed_offer: number, reasoning: string, negotiation_parameters: Object }>}
 */
export async function executeLLMReasoning(agentProfile, negotiationState, conversationHistory, opponentOffer) {
  const prompts = buildLLMPrompt(agentProfile, negotiationState, conversationHistory, opponentOffer);
  
  // Check for external LLM API key (e.g. Google Gemini API)
  const apiKey = (typeof process !== "undefined" && (process.env?.GEMINI_API_KEY || process.env?.VITE_GEMINI_API_KEY)) ||
                 (typeof import.meta !== "undefined" && import.meta.env?.VITE_GEMINI_API_KEY);

  const isValidGeminiKey = apiKey && typeof apiKey === "string" && apiKey.startsWith("AIzaSy");

  if (isValidGeminiKey) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout ? AbortSignal.timeout(2500) : undefined,
        body: JSON.stringify({
          contents: [
            { role: "user", parts: [{ text: `${prompts.systemPrompt}\n\n${prompts.userPrompt}` }] }
          ],
          generationConfig: { responseMimeType: "application/json" }
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const parsed = JSON.parse(rawText);
          if (parsed && parsed.decision && parsed.proposed_offer !== undefined) {
            return validateAndNormalizeResponse(parsed, agentProfile, opponentOffer, conversationHistory);
          }
        }
      }
    } catch (err) {
      console.warn("External LLM API call unavailable or timed out, executing context-aware reasoning engine fallback.", err);
    }
  }

  // High-fidelity Context-Aware Fallback Reasoning Engine
  return generateContextAwareFallback(agentProfile, negotiationState, conversationHistory, opponentOffer);
}

/**
 * Context-aware reasoning generator enforcing persona, history trends, goals, and numeric constraint limits.
 */
function generateContextAwareFallback(agentProfile, negotiationState, conversationHistory, opponentOffer) {
  const constraints = agentProfile.constraints || [];
  const derivedLimit = deriveLimitFromConstraints(constraints);
  
  const direction = agentProfile.direction ||
                    (derivedLimit ? derivedLimit.direction : deriveDirectionFromGoal(agentProfile.goal, "minimize"));
  const limit = agentProfile.limit !== undefined
                ? agentProfile.limit
                : (derivedLimit ? derivedLimit.limit : 50000);
                
  const personality = agentProfile.personality || "Collaborative";
  const goal = agentProfile.goal || agentProfile.negotiation_objectives || "Negotiate optimal terms";
  const role = agentProfile.role || agentProfile.name || "Negotiator";
  const round = negotiationState.current_round || 1;
  const maxRounds = negotiationState.max_rounds || 5;

  // History analysis
  const history = conversationHistory || [];
  const ownOffers = history.filter((h) => h.agent_id === agentProfile.id);
  const ownLastOffer = ownOffers.length > 0 ? ownOffers[ownOffers.length - 1] : null;
  const ownLastValue = ownLastOffer
    ? ownLastOffer.value
    : (direction === "minimize" ? limit * 0.85 : limit * 1.15);

  const incomingValue = opponentOffer ? opponentOffer.value : ownLastValue;

  // Hard constraint check
  const withinLimit = direction === "minimize" ? incomingValue <= limit : incomingValue >= limit;
  const gap = Math.abs(ownLastValue - incomingValue);
  const baseVal = Math.max(Math.abs(limit), Math.abs(incomingValue), 1);
  
  const isTightGap = gap <= baseVal * 0.005 || gap <= 10;
  const isCloseGap = gap <= baseVal * 0.035;

  let decision = DECISIONS.COUNTEROFFER;
  let proposed_offer = ownLastValue;
  let reasoning = "";
  let concession_rate = 0.25;

  if (personality === "Aggressive") concession_rate = 0.10;
  else if (personality === "Risk-averse") concession_rate = 0.25;
  else if (personality === "Collaborative") concession_rate = 0.35;

  // Decision logic: ACCEPT (Requires round >= 4 or tight gap <= 0.5% or max rounds reached)
  if (withinLimit && (isTightGap || (round >= 4 && isCloseGap) || round >= maxRounds)) {
    decision = DECISIONS.ACCEPT;
    proposed_offer = incomingValue;
    reasoning = `As ${role} (${personality}), I accept your offer of $${incomingValue.toLocaleString()} in Round ${round}. It satisfies my goal ("${goal}") and remains within my constraint boundary of $${limit.toLocaleString()}.`;
  } 
  // Decision logic: REJECT
  else if (!withinLimit && round >= maxRounds) {
    decision = DECISIONS.REJECT;
    proposed_offer = ownLastValue;
    reasoning = `As ${role} (${personality}), I must reject the offer of $${incomingValue.toLocaleString()} at final Round ${round}. After ${history.length} negotiation moves, the proposal violates my constraint boundary of $${limit.toLocaleString()}.`;
  } 
  // Decision logic: COUNTEROFFER
  else {
    decision = DECISIONS.COUNTEROFFER;
    let rawNext = ownLastValue + concession_rate * (incomingValue - ownLastValue);
    
    // Guarantee minimum step to ensure continuous offer evolution across rounds
    const minStep = Math.max(baseVal * 0.01, 100);
    if (Math.abs(rawNext - ownLastValue) < minStep) {
      if (direction === "minimize") {
        rawNext = Math.min(ownLastValue + minStep, incomingValue);
      } else {
        rawNext = Math.max(ownLastValue - minStep, incomingValue);
      }
    }

    // Strict constraint enforcement: Never cross limit
    if (direction === "minimize") {
      proposed_offer = Math.min(Math.round(rawNext), limit);
    } else {
      proposed_offer = Math.max(Math.round(rawNext), limit);
    }

    const distanceToConstraint = Math.abs(proposed_offer - limit);
    const movesCount = ownOffers.length + 1;
    
    reasoning = `As ${role} with a ${personality} persona, I evaluated your Round ${round} offer of $${incomingValue.toLocaleString()} against my ${history.length} historical moves and goal ("${goal}"). Conceding ${(concession_rate * 100).toFixed(0)}% of the gap on move ${movesCount}, I counter with $${proposed_offer.toLocaleString()}, keeping a $${distanceToConstraint.toLocaleString()} safety margin from my $${limit.toLocaleString()} limit.`;
  }

  const distanceToConstraint = Math.abs(proposed_offer - limit);

  return {
    decision,
    proposed_offer: Math.round(proposed_offer),
    reasoning,
    negotiation_parameters: {
      concession_rate,
      target_value: direction === "minimize" ? Math.round(limit * 0.9) : Math.round(limit * 1.1),
      distance_to_constraint: distanceToConstraint,
      direction,
      limit,
      personality,
      round,
      history_length: history.length,
      strategy_notes: `${personality} persona executing ${(concession_rate * 100).toFixed(0)}% concession velocity in Round ${round}.`
    }
  };
}

function validateAndNormalizeResponse(parsed, agentProfile, opponentOffer) {
  let decision = String(parsed.decision).toLowerCase();
  if (decision === "counter") decision = DECISIONS.COUNTEROFFER;
  if (![DECISIONS.ACCEPT, DECISIONS.COUNTEROFFER, DECISIONS.REJECT].includes(decision)) {
    decision = DECISIONS.COUNTEROFFER;
  }

  const constraints = agentProfile.constraints || [];
  const derived = deriveLimitFromConstraints(constraints);
  const direction = agentProfile.direction || (derived ? derived.direction : deriveDirectionFromGoal(agentProfile.goal, "minimize"));
  const limit = agentProfile.limit !== undefined ? agentProfile.limit : (derived ? derived.limit : (direction === "minimize" ? 50000 : 42000));

  let proposed_offer = Number(parsed.proposed_offer);
  const oppPrice = opponentOffer ? (opponentOffer.price ?? opponentOffer.value ?? null) : null;

  // Hard Constraint Validation for Accept decision
  if (decision === DECISIONS.ACCEPT && oppPrice !== null) {
    if (direction === "minimize" && oppPrice > limit) {
      decision = DECISIONS.COUNTEROFFER;
      proposed_offer = limit;
    } else if (direction === "maximize" && oppPrice < limit) {
      decision = DECISIONS.COUNTEROFFER;
      proposed_offer = limit;
    }
  }

  // Hard Constraint Validation for Counteroffer proposed_offer clamp
  if (decision === DECISIONS.COUNTEROFFER) {
    if (isNaN(proposed_offer)) {
      proposed_offer = oppPrice !== null ? oppPrice : limit;
    }
    if (direction === "minimize" && proposed_offer > limit) {
      proposed_offer = limit;
    } else if (direction === "maximize" && proposed_offer < limit) {
      proposed_offer = limit;
    }
  }

  return {
    decision,
    proposed_offer: Math.round(proposed_offer),
    reasoning: parsed.reasoning || "Context-aware reasoning generated for negotiation agent.",
    negotiation_parameters: parsed.negotiation_parameters || {}
  };
}
