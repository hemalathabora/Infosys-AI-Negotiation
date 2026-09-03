// Designed by TEAM 4

const STATUS_META = {
  not_started: { label: "Not Started", classes: "bg-white/5 text-textSecondary border-border" },
  in_progress: { label: "In Progress", classes: "bg-primary/15 text-primaryBright border-primary/30" },
  agreement: { label: "Agreement", classes: "bg-success/15 text-success border-success/30" },
  rejected: { label: "Rejected", classes: "bg-warning/15 text-warning border-warning/30" },
  deadlock: { label: "Deadlock", classes: "bg-warning/15 text-warning border-warning/30" },
  completed: { label: "Completed", classes: "bg-primary/15 text-primaryBright border-primary/30" },
};


/* ============================================================
   STATUS BADGE
============================================================ */

function StatusBadge({ status }) {
  const meta =
    STATUS_META[status] ?? STATUS_META.not_started;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${meta.classes}`}>
      {meta.label}
    </span>
  );
}


/* ============================================================
   FORMAT MONEY VALUE
============================================================ */

function formatValue(value) {
  if (value === null || value === undefined) return "â€”";
  return `$${Math.round(value).toLocaleString()}`;
}


/* ============================================================
   FIND AGENT NAME
============================================================ */

function agentLabel(agents, agentId) {
  return (
    agents.find((agent) => agent.id === agentId)?.name ??
    agentId
  );
}


/* ============================================================
   MAIN COMPONENT
============================================================ */

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
  if (!state) {
    return null;
  }


  const isDone =
    state.status === "agreement" ||
    state.status === "deadlock";


  return (
    <div
      className="
        mt-6
        rounded-2xl
        border
        border-primary/25
        bg-card
        p-5
        shadow-card
        sm:p-6
      "
    >

      {/* ======================================================
          HEADER
      ======================================================= */}

      <div
        className="
          mb-5
          flex
          flex-wrap
          items-center
          justify-between
          gap-3
        "
      >

        <div>

          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
            Negotiation Session
          </p>

          <h3 className="mt-1 text-xl font-bold text-textPrimary">
            {scenario?.name || "Negotiation"}
          </h3>

          <p className="mt-1 text-sm text-textSecondary">
            Round-based simulation driven by the rule-based Orchestrator prototype â€” no LLM involved yet.
          </p>

        </div>


        <StatusBadge status={state.status} />

      </div>



      {/* ======================================================
          STATE SUMMARY
      ======================================================= */}

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-cardAlt px-3.5 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-textSecondary">Round</p>
          <p className="mt-1 text-lg font-bold text-textPrimary">{state.current_round}</p>
        </div>
        <div className="rounded-xl border border-border bg-cardAlt px-3.5 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-textSecondary">Turn</p>
          <p className="mt-1 text-sm font-bold text-textPrimary">
            {isDone ? "â€”" : agentLabel(scenario.agents, state.current_agent_turn)}
          </p>

        </div>
        <div className="rounded-xl border border-border bg-cardAlt px-3.5 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-textSecondary">Previous Offer</p>
          <p className="mt-1 text-sm font-bold text-textPrimary">{formatValue(state.previous_offer?.value)}</p>
        </div>
        <div className="rounded-xl border border-border bg-cardAlt px-3.5 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-textSecondary">Current Offer</p>
          <p className="mt-1 text-sm font-bold text-textPrimary">{formatValue(state.current_offer?.value)}</p>
        </div>
      </div>



      {/* ======================================================
          CONTROLS
      ======================================================= */}

      <div className="mb-5 flex flex-wrap gap-2.5">

        {/* Step */}
        <button
          type="button"
          onClick={onStep}
          disabled={isRunning || isDone}
          className="
            rounded-lg
            border
            border-border
            bg-cardAlt
            px-3.5
            py-2
            text-xs
            font-semibold
            text-textPrimary
            transition
            hover:border-primary/50
            hover:text-primary
            disabled:cursor-not-allowed
            disabled:opacity-40
          "
        >
          Step One Round
        </button>


        {/* Run */}
        <button
          type="button"
          onClick={onRunToCompletion}
          disabled={isRunning || isDone}
          className="
            rounded-lg
            border
            border-primary/40
            bg-primary/10
            px-3.5
            py-2
            text-xs
            font-semibold
            text-primary
            transition
            hover:bg-primary/20
            disabled:cursor-not-allowed
            disabled:opacity-40
          "
        >
          {isRunning ? "Runningâ€¦" : "Run to completion"}
        </button>


        {/* Reset */}
        <button
          type="button"
          onClick={onReset}
          className="
            rounded-lg
            border
            border-border
            bg-cardAlt
            px-3.5
            py-2
            text-xs
            font-semibold
            text-textSecondary
            transition
            hover:border-warning/40
            hover:text-warning
          "
        >
          Reset Session
        </button>

      </div>

      {/* Offer history / transcript */}
      {state.history.length > 0 && (
        <div className="mb-5 overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[520px] text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-cardAlt text-textSecondary">
                <th className="px-3 py-2 font-semibold">Round</th>
                <th className="px-3 py-2 font-semibold">Agent</th>
                <th className="px-3 py-2 font-semibold">Offer</th>
                <th className="px-3 py-2 font-semibold">Reason</th>
              </tr>
            </thead>
            <tbody>
              {state.history.map((offer, i) => (
                <tr key={i} className="border-b border-border/60 last:border-0">
                  <td className="px-3 py-2 text-textSecondary">{offer.round}</td>
                  <td className="px-3 py-2 font-semibold text-textPrimary">
                    {agentLabel(scenario.agents, offer.agent_id)}
                  </td>
                  <td className="px-3 py-2 font-semibold text-primaryBright">
                    {formatValue(offer.value)}
                  </td>
                  <td className="px-3 py-2 text-textSecondary">{offer.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Concession tracking */}
      {Object.keys(timeline).length > 0 && (
        <div>
          <h4 className="mb-2.5 text-[11px] font-bold uppercase tracking-wide text-textSecondary">
            Concession Tracking
          </h4>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {Object.entries(timeline).map(([agentId, entries]) => (
              <div key={agentId} className="rounded-xl border border-border bg-cardAlt p-3.5">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold text-textPrimary">
                    {agentLabel(scenario.agents, agentId)}
                  </p>
                  <p className="text-xs text-textSecondary">
                    total moved: {formatValue(concessionTotals[agentId])}
                  </p>
                </div>
                <ol className="flex flex-wrap gap-1.5 text-[11px]">
                  {entries.map((e) => (
                    <li
                      key={e.round}
                      className="rounded-md border border-border bg-bg px-2 py-1 text-textSecondary"
                    >
                      R{e.round}: {formatValue(e.value)}
                      {e.delta !== null && (
                        <span className={e.delta === 0 ? "text-textSecondary" : "text-primaryBright"}>
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

        )}

    </div>
  );
}
// Designed by TEAM 4
// Designed by TEAM 4

