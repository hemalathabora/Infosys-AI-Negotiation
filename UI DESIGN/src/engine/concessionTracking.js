/**
 * Builds a per-agent concession timeline from the offer history:
 * for each agent, their sequence of offered values across rounds and the
 * round-over-round delta (direction + size of concession).
 *
 * @param {import('../types/negotiation').Offer[]} history
 * @returns {Record<string, { round: number, value: number, delta: number | null, direction: "concession" | "hold" | "opening" }[]>}
 */
export function buildConcessionTimeline(history) {
  /** @type {Record<string, import('../types/negotiation').Offer[]>} */
  const byAgent = {};
  for (const offer of history) {
    (byAgent[offer.agent_id] ??= []).push(offer);
  }

  /** @type {Record<string, any[]>} */
  const timeline = {};
  for (const [agentId, offers] of Object.entries(byAgent)) {
    const sorted = [...offers].sort((a, b) => a.round - b.round);
    timeline[agentId] = sorted.map((offer, i) => {
      if (i === 0) {
        return { round: offer.round, value: offer.value, delta: null, direction: "opening" };
      }
      const delta = offer.value - sorted[i - 1].value;
      return {
        round: offer.round,
        value: offer.value,
        delta,
        direction: delta === 0 ? "hold" : "concession",
      };
    });
  }
  return timeline;
}

/**
 * Total concession size (sum of absolute round-over-round moves) per agent —
 * a quick summary metric for the outcome report.
 *
 * @param {ReturnType<typeof buildConcessionTimeline>} timeline
 * @returns {Record<string, number>}
 */
export function totalConcessionByAgent(timeline) {
  const totals = {};
  for (const [agentId, entries] of Object.entries(timeline)) {
    totals[agentId] = entries.reduce((sum, e) => sum + Math.abs(e.delta ?? 0), 0);
  }
  return totals;
}
