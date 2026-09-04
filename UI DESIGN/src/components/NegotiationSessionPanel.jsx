const STATUS_META = {
  not_started: {
    label: "Not Started",
    classes: "bg-[#1E1D24] text-slate-400 border-[#302F39]",
  },
  in_progress: {
    label: "In Progress",
    classes: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  },
  agreement: {
    label: "Agreement",
    classes: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-bold",
  },
  rejected: {
    label: "Rejected",
    classes: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  },
  deadlock: {
    label: "Deadlock",
    classes: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  },
  completed: {
    label: "Completed",
    classes: "bg-[#222129] text-white border-[#302F39]",
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

function formatValue(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "—";
  }
  return `$${Math.round(value).toLocaleString()}`;
}

function agentLabel(agents = [], agentId) {
  if (!agentId) return "No active turn";
  const agent = agents.find((item) => item.id === agentId);
  return agent?.name ?? agent?.role ?? agentId;
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
    state.status === "rejected" ||
    state.status === "deadlock" ||
    state.status === "completed";

  const currentTurn = state.current_agent_turn
    ? agentLabel(agents, state.current_agent_turn)
    : isDone
      ? "No active turn"
      : "Waiting...";

  const statusMessage = (() => {
    switch (state.status) {
      case "agreement":
        return "Negotiation successfully reached an agreement.";
      case "rejected":
        return "An agent rejected the negotiation offer.";
      case "deadlock":
        return "Negotiation ended because the maximum rounds were reached without agreement.";
      case "completed":
        return "Negotiation has been completed.";
      case "in_progress":
        return "Agents are currently negotiating.";
      default:
        return "Negotiation has not started.";
    }
  })();

  return (
    <div className="space-y-6 rounded-2xl border border-[#2D2C36] bg-[#201F25] p-6 shadow-md">

      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2B2A33] pb-5">
        <div>
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
            SESSION CONTROL & HISTORICAL TIMELINE
          </p>
          <h3 className="mt-1 font-sans text-lg font-bold text-white">
            {scenario?.name || scenario?.scenario_name || "Negotiation Session"}
          </h3>
          <p className="mt-0.5 font-body text-xs text-textSecondary">
            Simulated turn execution with concession tracking and rule-based decision evaluation.
          </p>
        </div>

        <StatusBadge status={state.status} />
      </div>

      {/* STATUS BANNER */}
      <div className="rounded-xl border border-[#302F39] bg-[#1A191E] px-4 py-3">
        <p className="text-xs font-body text-slate-300">
          {statusMessage}
        </p>
      </div>

      {/* METRICS ROW - 4 EQUAL SYMMETRICAL CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="rounded-xl border border-[#2D2C36] bg-[#1A191E] p-4 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Round</p>
          <p className="text-2xl font-extrabold text-white">{state.current_round ?? 0}</p>
        </div>

        <div className="rounded-xl border border-[#2D2C36] bg-[#1A191E] p-4 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Turn</p>
          <p className="text-sm font-bold text-white truncate" title={currentTurn}>{currentTurn}</p>
        </div>

        <div className="rounded-xl border border-[#2D2C36] bg-[#1A191E] p-4 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Previous Offer</p>
          <p className="text-lg font-bold text-slate-300">{formatValue(state.previous_offer?.value)}</p>
        </div>

        <div className="rounded-xl border border-[#2D2C36] bg-[#1A191E] p-4 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Latest Offer</p>
          <p className="text-lg font-bold text-emerald-400">{formatValue(state.current_offer?.value)}</p>
        </div>
      </div>

      {/* ACTION CONTROLS - SYMMETRICAL ROW */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          type="button"
          onClick={onStep}
          disabled={isRunning || isDone}
          className="inline-flex items-center gap-2 rounded-xl border border-[#302F39] bg-[#222129] px-4 py-2.5 font-sans text-xs font-bold text-white transition hover:bg-[#2A2933] hover:border-white disabled:cursor-not-allowed disabled:opacity-40"
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
          className="inline-flex items-center gap-2 rounded-xl bg-slate-100 hover:bg-white px-5 py-2.5 font-sans text-xs font-extrabold text-slate-950 shadow-md border border-slate-200 transition disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isRunning ? (
            <>
              <svg className="h-4 w-4 animate-spin text-slate-950" viewBox="0 0 24 24" fill="none">
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
          className="inline-flex items-center gap-2 rounded-xl border border-[#522026] bg-[#35161B] px-4 py-2.5 font-sans text-xs font-medium text-[#F87171] hover:bg-[#451B21] transition"
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
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
            Round-By-Round Offer Log
          </p>

          <div className="overflow-x-auto rounded-xl border border-[#2D2C36]">
            <table className="w-full min-w-[540px] text-left font-body text-xs">
              <thead>
                <tr className="border-b border-[#2D2C36] bg-[#1A191E] font-mono text-[11px] uppercase tracking-wider text-slate-400">
                  <th className="px-4 py-3">Round</th>
                  <th className="px-4 py-3">Agent</th>
                  <th className="px-4 py-3">Offer Value</th>
                  <th className="px-4 py-3">Strategic Rationale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2B2A33]">
                {state.history.map((offer, index) => (
                  <tr key={`${offer.agent_id}-${offer.round}-${index}`} className="transition-colors hover:bg-white/[0.03]">
                    <td className="px-4 py-3 font-mono font-semibold text-slate-400">R{offer.round}</td>
                    <td className="px-4 py-3 font-semibold text-white">{agentLabel(agents, offer.agent_id)}</td>
                    <td className="px-4 py-3 font-mono font-extrabold text-emerald-400">{formatValue(offer.value)}</td>
                    <td className="px-4 py-3 text-slate-300">{offer.reason || "No rationale provided."}</td>
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
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
            Agent Concession Velocity
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(timeline).map(([agentId, entries]) => (
              <div key={agentId} className="space-y-3 rounded-xl border border-[#2D2C36] bg-[#1A191E] p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-sans text-xs font-bold text-white">{agentLabel(agents, agentId)}</p>
                  <p className="font-mono text-xs font-bold text-emerald-400">
                    Moved: {formatValue(concessionTotals?.[agentId])}
                  </p>
                </div>

                <ol className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                  {entries.map((entry, index) => (
                    <li key={`${entry.round}-${index}`} className="rounded-lg border border-[#302F39] bg-[#222129] px-2.5 py-1 text-slate-300">
                      R{entry.round}: {formatValue(entry.value)}
                      {entry.delta !== null && entry.delta !== undefined && (
                        <span className={entry.delta === 0 ? "text-slate-500" : "text-emerald-400"}>
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