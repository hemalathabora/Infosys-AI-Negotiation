import {
  buildConcessionTimeline,
  totalConcessionByAgent,
  getAuthoritativeTarget,
  extractScalarPrice,
} from "../engine/concessionTracking.js";

const STATUS_LABELS = {
  agreement: "Agreement",
  accepted: "Agreement",
  rejected: "Rejected",
  deadlock: "Deadlock",
  breakdown: "Breakdown",
  completed: "Completed",
  finished: "Completed",
};

export function safeText(value, fallback = "N/A") {
  if (value === null || value === undefined || String(value).trim() === "") return fallback;
  return String(value);
}

export function formatNumber(value, fallback = "N/A") {
  const number = Number(value);
  return Number.isFinite(number) ? Math.round(number).toLocaleString() : fallback;
}

export function formatCurrency(value) {
  const number = typeof value === "object" && value !== null
    ? extractScalarPrice(value)
    : Number(value);
  return Number.isFinite(number) ? `$${Math.round(number).toLocaleString()}` : "N/A";
}

export function formatPercentage(value) {
  const number = Number(value);
  return Number.isFinite(number) ? `${Math.round(number)}%` : "N/A";
}

export function safeOffer(offer) {
  if (!offer || typeof offer !== "object") return formatCurrency(offer);
  const value = extractScalarPrice(offer) ?? extractScalarPrice(offer.proposed_offer);
  const terms = offer.terms || offer.proposed_offer?.terms;
  const termText = terms && typeof terms === "object"
    ? Object.entries(terms)
      .filter(([, item]) => item !== null && item !== undefined && String(item).trim() !== "")
      .map(([key, item]) => `${key}: ${item}`)
      .join("; ")
    : "";
  return termText ? `${formatCurrency(value)}; ${termText}` : formatCurrency(value);
}

function getFinalValue(history, agentId) {
  const entries = history.filter((entry) => entry?.agent_id === agentId);
  return entries.length > 0
    ? extractScalarPrice(entries[entries.length - 1]?.proposed_offer) ?? Number(entries[entries.length - 1]?.value)
    : null;
}

function getSatisfaction(agent, finalValue) {
  const target = Number(getAuthoritativeTarget(agent || {}));
  const finalNumber = Number(finalValue);
  if (!Number.isFinite(target) || !Number.isFinite(finalNumber)) return "N/A";
  const distance = Math.abs(finalNumber - target);
  const scale = Math.max(Math.abs(target), Math.abs(finalNumber), 1);
  return formatPercentage(Math.max(0, Math.min(100, (1 - distance / scale) * 100)));
}

function normalizeAgents(state, scenario) {
  return Array.isArray(state?.participating_agents)
    ? state.participating_agents
    : Array.isArray(scenario?.agents) ? scenario.agents : [];
}

export function buildNegotiationReportData(state, scenario, timelineOverride = null) {
  const history = Array.isArray(state?.history) ? state.history : [];
  const agents = normalizeAgents(state, scenario);
  const timeline = timelineOverride || buildConcessionTimeline(history);
  const concessionTotals = totalConcessionByAgent(timeline);
  const statusKey = String(state?.status || "").toLowerCase();
  const currentOffer = state?.current_offer || null;
  const finalValue = extractScalarPrice(currentOffer) ?? extractScalarPrice(currentOffer?.proposed_offer);
  const rounds = Number.isFinite(Number(state?.current_round)) ? Math.max(0, Math.round(Number(state.current_round))) : null;
  const isAgreement = statusKey === "agreement" || statusKey === "accepted";

  return {
    scenarioName: safeText(scenario?.scenario_name || scenario?.name, "Negotiation session"),
    description: safeText(scenario?.description, "No scenario description is available."),
    mode: safeText(state?.mode || state?.execution_mode, "Normal Mode"),
    statusKey,
    statusLabel: safeText(STATUS_LABELS[statusKey], "Completed"),
    generatedAt: new Date().toISOString(),
    finalValue,
    finalAgreement: isAgreement ? formatCurrency(finalValue) : "No agreement reached",
    finalTerms: safeOffer(currentOffer),
    outcomeSummary: isAgreement
      ? `The negotiation reached an agreement after ${rounds ?? "N/A"} rounds.`
      : "No agreement was reached in this negotiation.",
    rounds,
    turns: history.length,
    openingOffer: history.length > 0 ? extractScalarPrice(history[0]?.proposed_offer) ?? Number(history[0]?.value) : null,
    agents: agents.map((agent, index) => {
      const agentId = safeText(agent?.id, `agent-${index}`);
      const finalPosition = getFinalValue(history, agentId);
      return {
        id: agentId,
        name: safeText(agent?.name || agent?.role, agentId),
        role: safeText(agent?.role),
        personality: safeText(agent?.personality || agent?.persona),
        objective: safeText(agent?.goal || agent?.goals),
        satisfaction: getSatisfaction(agent, finalPosition),
        finalPosition,
        finalPositionLabel: formatCurrency(finalPosition),
        concessionTotal: concessionTotals[agentId],
        timeline: Array.isArray(timeline[agentId]) ? timeline[agentId] : [],
      };
    }),
    transcript: history.map((entry, index) => {
      const agent = agents.find((item) => item?.id === entry?.agent_id);
      const concession = entry?.concession_data || entry?.parameters?.concession_tracking || {};
      const amount = Number(concession.concession_amount ?? concession.concession);
      return {
        turn: index + 1,
        round: Number.isFinite(Number(entry?.round)) ? Number(entry.round) : null,
        agent: safeText(agent?.name || agent?.role || entry?.agent_id, "Agent unavailable"),
        decision: safeText(entry?.decision, "N/A").toUpperCase(),
        offer: safeOffer(entry?.proposed_offer || entry),
        reasoning: safeText(entry?.reasoning || entry?.reason, "Offer submitted based on strategy."),
        concession: Number.isFinite(amount) && amount !== 0
          ? `${amount > 0 ? "+" : ""}${formatCurrency(amount)}`
          : "N/A",
        timestamp: safeText(entry?.timestamp),
      };
    }),
  };
}

export function reportDataToText(report) {
  return [
    "NEGOMIND AI",
    "AI-Driven Multi-Agent Negotiation Training & Simulation Platform",
    "NEGOTIATION SUMMARY REPORT",
    "==========================",
    `Scenario: ${report.scenarioName}`,
    `Negotiation mode: ${report.mode}`,
    `Final status: ${report.statusLabel}`,
    `Generated: ${report.generatedAt}`,
    "",
    "NEGOTIATION OVERVIEW",
    `Final agreement: ${report.finalAgreement}`,
    `Rounds elapsed: ${report.rounds ?? "N/A"}`,
    `Total recorded turns: ${report.turns}`,
    `Negotiation mode: ${report.mode}`,
    "",
    "AGENT OBJECTIVES & SATISFACTION",
    ...report.agents.flatMap((agent) => [
      `${agent.name} (${agent.role})`,
      `Personality: ${agent.personality}`,
      `Objective: ${agent.objective}`,
      `Objective satisfaction: ${agent.satisfaction}`,
      `Final position: ${agent.finalPositionLabel}`,
      `Concessions: ${agent.timeline.length > 0 ? agent.timeline.map((item) => `R${item.round} ${formatCurrency(item.value)} movement ${formatCurrency(item.delta)}`).join(", ") : "N/A"}`,
      "",
    ]),
    "COMPLETE NEGOTIATION TRANSCRIPT",
    ...report.transcript.flatMap((entry) => [
      `Turn ${entry.turn} | Round ${entry.round ?? "N/A"} | ${entry.agent}`,
      `Decision: ${entry.decision}`,
      `Offer: ${entry.offer}`,
      `Concession: ${entry.concession}`,
      `Reasoning: ${entry.reasoning}`,
      `Timestamp: ${entry.timestamp}`,
      "",
    ]),
  ].join("\n");
}
