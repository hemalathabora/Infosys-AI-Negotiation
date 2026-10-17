

const STATUS_META = {
  not_started: {
    label: "Not Started",
    classes: "bg-cardAlt text-textMuted border-border",
  },
  in_progress: {
    label: "In Progress",
    classes: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  },
  active: {
    label: "In Progress",
    classes: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  },
  agreement: {
    label: "Agreement",
    classes: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-bold",
  },
  accepted: {
    label: "Agreement",
    classes: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-bold",
  },
  rejected: {
    label: "Rejected",
    classes: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
  },
  deadlock: {
    label: "Deadlock",
    classes: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  },
  breakdown: {
    label: "Breakdown",
    classes: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 font-bold",
  },
  cancelled: {
    label: "Cancelled",
    classes: "bg-slate-500/15 text-textMuted border-border",
  },
  completed: {
    label: "Completed",
    classes: "bg-cardAlt text-textPrimary border-border",
  },
  finished: {
    label: "Completed",
    classes: "bg-cardAlt text-textPrimary border-border",
  },
};

function StatusBadge({ status }) {
  const meta = STATUS_META[status] ?? STATUS_META.not_started;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1 font-mono text-xs font-semibold ${meta.classes}`}>
      {meta.label}
    </span>
  );
}

function formatValue(offer) {
  if (offer === null || offer === undefined) return "—";
  const raw = (typeof offer === "object")
    ? (offer.price ?? offer.value ?? offer.proposed_offer?.price ?? offer.proposed_offer?.value ?? null)
    : offer;
  const num = Number(raw);
  if (!Number.isFinite(num)) return "—";
  return `$${Math.round(num).toLocaleString()}`;
}

function agentLabel(agents = [], agentId) {
  if (!agentId) return "Finish";
  const agent = agents.find((item) => item.id === agentId);
  return agent?.name ?? agent?.role ?? agentId;
}

function getTurnRound(history = [], index = 0) {
  const item = history[index];
  if (!item) return 1;
  const agentId = item.agent_id;
  const sameAgentCount = history.slice(0, index).filter((h) => h.agent_id === agentId).length;
  return sameAgentCount + 1;
}

export default function NegotiationSessionPanel({
  scenario,
  state,
  isRunning,
  timeline,
  concessionTotals,
  onStep,
  onRunToCompletion,
  onReset,
}) {
  if (!state) return null;

  const agents = scenario?.agents ?? [];
  const isDone =
    state.status === "agreement" ||
    state.status === "accepted" ||
    state.status === "rejected" ||
    state.status === "deadlock" ||
    state.status === "breakdown" ||
    state.status === "cancelled" ||
    state.status === "completed" ||
    state.status === "finished";

  const currentTurn = isDone
    ? "Finish"
    : state.current_agent_turn
      ? agentLabel(agents, state.current_agent_turn)
      : "Waiting...";

  const statusMessage = (() => {
    switch (state.status) {
      case "accepted":
      case "agreement":
        return "Negotiation successfully reached an agreement.";
      case "rejected":
        return "An agent rejected the negotiation offer.";
      case "deadlock":
        return "Negotiation ended because the maximum rounds were reached without agreement.";
      case "breakdown":
        return state.deadlock_info?.reason || "Negotiation ended due to non-overlapping constraints (no feasible agreement possible).";
      case "cancelled":
        return "Negotiation session was cancelled.";
      case "completed":
      case "finished":
        return "Negotiation has been completed.";
      case "active":
      case "in_progress":
        return "Agents are currently negotiating.";
      default:
        return "Negotiation has not started.";
    }
  })();

  const modeLabel = state.mode || state.execution_mode || "Normal Mode";
  const isLlmMode = modeLabel === "LLM Mode" || String(modeLabel).toLowerCase().includes("llm");

  return (
    <div className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-md">

      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-5">
        <div>
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-textMuted">
            SESSION CONTROL & HISTORICAL TIMELINE
          </p>
          <h3 className="mt-1 font-sans text-lg font-bold text-textPrimary">
            {scenario?.name || scenario?.scenario_name || "Negotiation Session"}
          </h3>
          <p className="mt-0.5 font-body text-xs text-textSecondary">
            Simulated turn execution with concession tracking and decision evaluation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1 font-mono text-xs font-semibold ${
            isLlmMode
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "border-indigo-500/40 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300"
          }`}>
            Mode: {modeLabel}
          </span>
          <StatusBadge status={state.status} />
        </div>
      </div>

      {/* STATUS BANNER */}
      <div className="rounded-xl border border-border bg-cardAlt px-4 py-3">
        <p className="text-xs font-body text-textSecondary">
          {statusMessage}
        </p>
      </div>

      {/* METRICS ROW - 4 EQUAL SYMMETRICAL CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="rounded-xl border border-border bg-cardAlt p-4 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-textMuted">Current Round</p>
          <p className="text-2xl font-extrabold text-textPrimary">{state.current_round ?? 0}</p>
        </div>

        <div className="rounded-xl border border-border bg-cardAlt p-4 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-textMuted">Active Turn</p>
          <p className="text-sm font-bold text-textPrimary truncate" title={currentTurn}>{currentTurn}</p>
        </div>

        <div className="rounded-xl border border-border bg-cardAlt p-4 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-textMuted">Previous Offer</p>
          <p className="text-lg font-bold text-textSecondary">{formatValue(state.previous_offer)}</p>
        </div>

        <div className="rounded-xl border border-border bg-cardAlt p-4 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-textMuted">Latest Offer</p>
          <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatValue(state.current_offer)}</p>
        </div>
      </div>

      {/* ACTION CONTROLS - SYMMETRICAL ROW */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          type="button"
          onClick={onStep}
          disabled={isRunning || isDone}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-cardAlt px-4 py-2.5 font-sans text-xs font-bold text-textPrimary transition hover:bg-card hover:border-primary disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          Step Agent Turn
        </button>

        <button
          type="button"
          onClick={onRunToCompletion}
          disabled={isRunning || isDone}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white px-5 py-2.5 font-sans text-xs font-extrabold shadow-md border border-slate-700 dark:border-slate-300 transition disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
        >
          {isRunning ? (
            <>
              <svg className="h-4 w-4 animate-spin text-white dark:text-slate-950" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" />
              </svg>
              Executing Simulation...
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              Run To Completion
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 font-sans text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          Reset Session
        </button>
      </div>

      {/* OFFER HISTORY TABLE */}
      {state.history?.length > 0 && (
        <div className="space-y-3 pt-2">
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-textMuted">
            Round-By-Round Offer Log
          </p>

          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[540px] text-left font-body text-xs">
              <thead>
                <tr className="border-b border-border bg-cardAlt font-mono text-[11px] uppercase tracking-wider text-textMuted">
                  <th className="px-4 py-3">Round</th>
                  <th className="px-4 py-3">Agent</th>
                  <th className="px-4 py-3">Offer Value</th>
                  <th className="px-4 py-3">Strategic Rationale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {state.history.map((offer, index) => (
                  <tr key={`${offer.agent_id}-${index}`} className="transition-colors hover:bg-mainPanel/50">
                    <td className="px-4 py-3 font-mono font-semibold text-textMuted">R{getTurnRound(state.history, index)}</td>
                    <td className="px-4 py-3 font-semibold text-textPrimary">{agentLabel(agents, offer.agent_id)}</td>
                    <td className="px-4 py-3 font-mono font-extrabold text-emerald-600 dark:text-emerald-400">{formatValue(offer.value)}</td>
                    <td className="px-4 py-3 text-textSecondary">{offer.reasoning || offer.reason || "No rationale provided."}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONCESSION VELOCITY GRID */}
      {Object.keys(timeline ?? {}).length > 0 && (
        <div className="space-y-3 pt-2">
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-textMuted">
            Agent Concession Velocity
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(timeline).map(([agentId, entries]) => (
              <div key={agentId} className="space-y-3 rounded-xl border border-border bg-cardAlt p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-sans text-xs font-bold text-textPrimary">{agentLabel(agents, agentId)}</p>
                  <p className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    Moved: {formatValue(concessionTotals?.[agentId])}
                  </p>
                </div>

                <ol className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                  {entries.map((entry, index) => (
                    <li key={`${entry.round}-${index}`} className="rounded-lg border border-border bg-card px-2.5 py-1 text-textSecondary">
                      R{entry.round}: {formatValue(entry.value)}
                      {entry.delta !== null && entry.delta !== undefined && (
                        <span className={entry.delta === 0 ? "text-textMuted" : "text-emerald-600 dark:text-emerald-400"}>
                          {" "}({entry.delta > 0 ? "+" : ""}{Math.round(entry.delta).toLocaleString()})
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}