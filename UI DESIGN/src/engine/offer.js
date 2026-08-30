/**
 * Standard offer structure — every agent (human or AI, in every scenario)
 * produces offers in exactly this shape. See types/negotiation.js for the
 * JSDoc typedef.
 *
 * Fields:
 *  - agent_id:  which agent made the offer
 *  - round:     which round it belongs to
 *  - value:     the numeric term being negotiated (price / salary / budget —
 *               whatever the scenario's single negotiable value is)
 *  - reason:    short natural-language justification (rule-based for now;
 *               an LLM would generate this once that engine is built)
 *  - timestamp: ISO 8601, set at creation time
 *
 * @param {{ agent_id: string, round: number, value: number, reason: string }} params
 * @returns {import('../types/negotiation').Offer}
 */
export function createOffer({ agent_id, round, value, reason }) {
  return {
    agent_id,
    round,
    value: Math.round(value),
    reason,
    timestamp: new Date().toISOString(),
  };
}
