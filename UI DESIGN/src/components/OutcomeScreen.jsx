import { getAuthoritativeTarget, extractScalarPrice } from "../engine/concessionTracking.js";

const TERMINAL_STATUS_LABELS = {
  agreement: "Agreement",
  accepted: "Agreement",
  rejected: "Rejected",
  deadlock: "Deadlock",
  breakdown: "Deadlock",
  completed: "Completed",
  finished: "Completed",
};

function safeText(value, fallback = "—") {
  if (value === null || value === undefined || String(value).trim() === "") return fallback;
  return String(value);
}

function formatCurrency(value) {
  const number = Number(value);
  return Number.isFinite(number) ? `$${Math.round(number).toLocaleString()}` : "—";
}

function getOfferValue(offer) {
  return extractScalarPrice(offer) ?? extractScalarPrice(offer?.proposed_offer);
}

function formatTerms(offer) {
  const terms = offer?.terms || offer?.proposed_offer?.terms;
  if (!terms || typeof terms !== "object") return null;
  const values = Object.entries(terms)
    .filter(([, value]) => value !== null && value !== undefined && String(value).trim() !== "")
    .map(([key, value]) => `${key}: ${value}`);
  return values.length > 0 ? values.join(" • ") : null;
}

function getAgentFinalValue(history, agentId) {
  const entries = (history || []).filter((entry) => entry?.agent_id === agentId);
  return entries.length > 0 ? getOfferValue(entries[entries.length - 1]) : null;
}

function getSatisfaction(agent, finalValue) {
  const target = getAuthoritativeTarget(agent || {});
  const targetNumber = Number(target);
  const finalNumber = Number(finalValue);
  if (!Number.isFinite(targetNumber) || !Number.isFinite(finalNumber)) return "—";

  const distance = Math.abs(finalNumber - targetNumber);
  const scale = Math.max(Math.abs(targetNumber), Math.abs(finalNumber), 1);
  const score = Math.max(0, Math.min(100, Math.round((1 - distance / scale) * 100)));
  return `${score}%`;
}

function statusClasses(status) {
  if (status === "agreement" || status === "accepted") {
    return "border-emerald-500/40 bg-emerald-500/10 text-emerald-400";
  }
  if (status === "rejected") return "border-rose-500/40 bg-rose-500/10 text-rose-400";
  if (status === "deadlock" || status === "breakdown") {
    return "border-amber-500/40 bg-amber-500/10 text-amber-300";
  }
  return "border-[#3A3944] bg-[#222129] text-slate-300";
}

export default function OutcomeScreen({ scenario, state, timeline = {}, onDownloadReport }) {
  if (!state) return null;

  const status = String(state.status || "").toLowerCase();
  const agents = Array.isArray(state.participating_agents)
    ? state.participating_agents
    : Array.isArray(scenario?.agents) ? scenario.agents : [];
  const history = Array.isArray(state.history) ? state.history : [];
  const finalOffer = state.current_offer || null;
  const finalValue = getOfferValue(finalOffer);
  const finalTerms = formatTerms(finalOffer);
  const handleDownload = () => {
    if (onDownloadReport) {
      onDownloadReport();
      return;
    }
    window.print();
  };

  return (
    <section className="space-y-6 rounded-2xl border border-[#2D2C36] bg-[#201F25] p-6 shadow-md" aria-labelledby="outcome-screen-title">
      <div className="flex flex-col gap-4 border-b border-[#2B2A33] pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">NEGOTIATION OUTCOME</p>
          <h2 id="outcome-screen-title" className="mt-1 text-2xl font-extrabold text-white font-sans">Final Session Result</h2>
          <p className="mt-1 text-xs text-textSecondary font-body">{safeText(scenario?.scenario_name || scenario?.name, "Negotiation session")}</p>
        </div>
        <span className={`inline-flex h-fit items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-mono font-bold uppercase ${statusClasses(status)}`}>
          <span className="h-2 w-2 rounded-full bg-current" />
          {safeText(TERMINAL_STATUS_LABELS[status], "Completed")}
        </span>
        <button
          type="button"
          onClick={handleDownload}
          className="inline-flex h-fit items-center gap-2 rounded-xl border border-[#3A3944] bg-[#25242C] px-3.5 py-2 text-xs font-bold text-white transition hover:bg-[#2F2E38]"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M12 3v12" />
            <path d="m7 10 5 5 5-5" />
            <path d="M5 21h14" />
          </svg>
          Download PDF Report
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 font-mono">
        <div className="rounded-xl border border-[#2D2C36] bg-[#1A191E] p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Final Offer / Terms</p>
          <p className="mt-1 text-xl font-extrabold text-emerald-400">{formatCurrency(finalValue)}</p>
          {finalTerms && <p className="mt-2 break-words text-[11px] text-slate-300">{finalTerms}</p>}
        </div>
        <div className="rounded-xl border border-[#2D2C36] bg-[#1A191E] p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Rounds Elapsed</p>
          <p className="mt-1 text-xl font-extrabold text-white">{Number.isFinite(Number(state.current_round)) ? Number(state.current_round) : "—"}</p>
        </div>
        <div className="rounded-xl border border-[#2D2C36] bg-[#1A191E] p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Recorded Turns</p>
          <p className="mt-1 text-xl font-extrabold text-white">{history.length}</p>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">Agent Objectives & Satisfaction</h3>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {agents.length === 0 ? (
            <p className="text-xs text-slate-400">No agent profile data is available.</p>
          ) : agents.map((agent, index) => {
            const agentId = agent?.id || `agent-${index}`;
            const finalAgentValue = getAgentFinalValue(history, agentId);
            const entries = Array.isArray(timeline[agentId]) ? timeline[agentId] : [];
            return (
              <div key={agentId} className="rounded-xl border border-[#2D2C36] bg-[#1A191E] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#2B2A33] pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-white">{safeText(agent?.name || agent?.role, agentId)}</h4>
                    <p className="mt-1 text-[11px] uppercase tracking-wider text-slate-400">{safeText(agent?.personality || agent?.persona, "Personality unavailable")}</p>
                  </div>
                  <div className="text-right font-mono">
                    <p className="text-[10px] uppercase text-slate-400">Objective Satisfaction</p>
                    <p className="text-lg font-extrabold text-sky-400">{getSatisfaction(agent, finalAgentValue)}</p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-xs font-mono">
                  <div>
                    <p className="text-[10px] uppercase text-slate-400">Goal</p>
                    <p className="mt-1 break-words text-slate-200">{safeText(agent?.goal || agent?.goals)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-slate-400">Final Position</p>
                    <p className="mt-1 text-emerald-400">{formatCurrency(finalAgentValue)}</p>
                  </div>
                </div>
                <div className="mt-4 border-t border-[#2B2A33] pt-3">
                  <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Concession Timeline</p>
                  {entries.length === 0 ? (
                    <p className="mt-2 text-xs text-slate-500">No recorded concessions.</p>
                  ) : (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {entries.map((entry, entryIndex) => (
                        <span key={`${agentId}-${entryIndex}`} className="rounded-lg border border-[#3A3944] bg-[#222129] px-2.5 py-1 text-[11px] font-mono text-slate-200">
                          R{safeText(entry?.round, entryIndex + 1)}: {formatCurrency(entry?.value)}
                          {Number.isFinite(Number(entry?.delta)) && Number(entry.delta) !== 0 ? ` (${Number(entry.delta) > 0 ? "+" : ""}${formatCurrency(entry.delta)})` : ""}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
