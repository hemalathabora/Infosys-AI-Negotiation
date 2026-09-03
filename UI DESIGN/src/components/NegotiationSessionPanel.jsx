const STATUS_META = {
  not_started: { label: "Not Started", classes: "bg-slate-800/60 text-textMuted border-border" },
  in_progress: { label: "In Progress", classes: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30" },
  agreement: { label: "Agreement", classes: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  rejected: { label: "Rejected", classes: "bg-rose-500/15 text-rose-400 border-rose-500/30" },
  deadlock: { label: "Deadlock", classes: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  completed: { label: "Completed", classes: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30" },
};

function StatusBadge({ status }) {
  const meta = STATUS_META[status] ?? STATUS_META.not_started;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-xs font-semibold ${meta.classes}`}>
      {meta.label}
    </span>
  );
}

function formatValue(value) {
  if (value === null || value === undefined) return "—";
  return `$${Math.round(value).toLocaleString()}`;
}

function agentLabel(agents, agentId) {
  return (
    agents.find((agent) => agent.id === agentId)?.name ??
    agentId
  );
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

  const isDone =
    state.status === "agreement" ||
    state.status === "deadlock";

  return (
    <div className="mt-6 rounded-2xl border border-border/80 bg-card/90 p-5 shadow-card backdrop-blur-md sm:p-6 space-y-6">

      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div>
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-400">
            SESSION CONTROL & HISTORICAL TIMELINE
          </p>
          <h3 className="mt-0.5 text-lg font-bold text-textPrimary font-sans">
            {scenario?.name || scenario?.scenario_name || "Negotiation Session"}
          </h3>
          <p className="mt-0.5 text-xs text-textSecondary font-body">
            Simulated turn execution with concession tracking and utility evaluation.
          </p>
        </div>

        <StatusBadge status={state.status} />
      </div>


      {/* METRICS ROW */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border/80 bg-cardAlt/70 px-3.5 py-3">
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-textMuted">Current Round</p>
          <p className="mt-1 text-xl font-extrabold text-textPrimary font-mono">{state.current_round}</p>
        </div>
        <div className="rounded-xl border border-border/80 bg-cardAlt/70 px-3.5 py-3">
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-textMuted">Current Turn</p>
          <p className="mt-1 text-xs sm:text-sm font-semibold text-indigo-400 truncate">
            {isDone ? "—" : agentLabel(scenario.agents, state.current_agent_turn)}
          </p>
        </div>
        <div className="rounded-xl border border-border/80 bg-cardAlt/70 px-3.5 py-3">
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-textMuted">Previous Offer</p>
          <p className="mt-1 text-sm font-bold text-textPrimary font-mono">{formatValue(state.previous_offer?.value)}</p>
        </div>
        <div className="rounded-xl border border-border/80 bg-cardAlt/70 px-3.5 py-3">
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-textMuted">Latest Offer</p>
          <p className="mt-1 text-sm font-bold text-emerald-400 font-mono">{formatValue(state.current_offer?.value)}</p>
        </div>
      </div>


      {/* ACTION CONTROLS */}
      <div className="flex flex-wrap gap-2.5 pt-1">
        <button
          type="button"
          onClick={onStep}
          disabled={isRunning || isDone}
          className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-cardAlt px-4 py-2 text-xs font-semibold text-textPrimary transition hover:border-indigo-500/50 hover:text-indigo-300 disabled:cursor-not-allowed disabled:opacity-40 font-sans"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3" /></svg>
          Step Single Round
        </button>

        <button
          type="button"
          onClick={onRunToCompletion}
          disabled={isRunning || isDone}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-azure px-4 py-2 text-xs font-semibold text-white shadow-glowSm transition hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-40 font-sans"
        >
          {isRunning ? (
            <>
              <svg className="h-3.5 w-3.5 animate-spin text-white" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" /><path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" /></svg>
              Executing Simulation...
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
              Run To Completion
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-cardAlt px-4 py-2 text-xs font-semibold text-textMuted hover:text-amber-400 hover:border-amber-500/40 transition font-sans"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
          Reset Session
        </button>
      </div>


      {/* OFFER HISTORY TABLE */}
      {state.history.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-textMuted">
            Round-By-Round Offer Log
          </p>
          <div className="overflow-x-auto rounded-xl border border-border/60">
            <table className="w-full min-w-[540px] text-left text-xs font-body">
              <thead>
                <tr className="border-b border-border/80 bg-slate-900/60 font-mono text-[11px] uppercase tracking-wider text-textMuted">
                  <th className="px-4 py-2.5">Round</th>
                  <th className="px-4 py-2.5">Agent</th>
                  <th className="px-4 py-2.5">Offer Value</th>
                  <th className="px-4 py-2.5">Strategic Rationale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {state.history.map((offer, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 font-mono text-textMuted font-semibold">R{offer.round}</td>
                    <td className="px-4 py-3 font-semibold text-textPrimary">
                      {agentLabel(scenario.agents, offer.agent_id)}
                    </td>
                    <td className="px-4 py-3 font-mono font-extrabold text-indigo-400">
                      {formatValue(offer.value)}
                    </td>
                    <td className="px-4 py-3 text-textSecondary">{offer.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}


      {/* CONCESSION TRACKING */}
      {Object.keys(timeline).length > 0 && (
        <div className="space-y-3">
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-textMuted">
            Agent Concession Velocity
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {Object.entries(timeline).map(([agentId, entries]) => (
              <div key={agentId} className="rounded-xl border border-border/80 bg-cardAlt/50 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-textPrimary font-sans">
                    {agentLabel(scenario.agents, agentId)}
                  </p>
                  <p className="text-[11px] font-mono text-indigo-400">
                    Moved: {formatValue(concessionTotals[agentId])}
                  </p>
                </div>
                <ol className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                  {entries.map((e) => (
                    <li
                      key={e.round}
                      className="rounded-md border border-border/60 bg-bg px-2 py-1 text-textSecondary"
                    >
                      R{e.round}: {formatValue(e.value)}
                      {e.delta !== null && (
                        <span className={e.delta === 0 ? "text-textMuted" : "text-emerald-400"}>
                          {" "}
                          ({e.delta > 0 ? "+" : ""}
                          {Math.round(e.delta).toLocaleString()})
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
