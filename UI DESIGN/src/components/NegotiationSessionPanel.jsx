// Designed by TEAM 4

const STATUS_META = {
  not_started: {
    label: "Not Started",
    classes:
      "bg-slate-800/60 text-textMuted border-border",
  },

  in_progress: {
    label: "In Progress",
    classes:
      "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  },

  agreement: {
    label: "Agreement",
    classes:
      "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  },

  rejected: {
    label: "Rejected",
    classes:
      "bg-rose-500/15 text-rose-400 border-rose-500/30",
  },

  deadlock: {
    label: "Deadlock",
    classes:
      "bg-amber-500/15 text-amber-400 border-amber-500/30",
  },

  completed: {
    label: "Completed",
    classes:
      "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  },
};

/* ============================================================
   STATUS BADGE
============================================================ */

function StatusBadge({ status }) {
  const meta =
    STATUS_META[status] ??
    STATUS_META.not_started;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-xs font-semibold ${meta.classes}`}
    >
      {meta.label}
    </span>
  );
}

/* ============================================================
   FORMAT MONEY VALUE
============================================================ */

function formatValue(value) {
  if (
    value === null ||
    value === undefined ||
    Number.isNaN(Number(value))
  ) {
    return "—";
  }

  return `$${Math.round(value).toLocaleString()}`;
}

/* ============================================================
   FIND AGENT NAME
============================================================ */

function agentLabel(agents = [], agentId) {
  if (!agentId) {
    return "No active turn";
  }

  const agent = agents.find(
    (item) => item.id === agentId,
  );

  return (
    agent?.name ??
    agent?.role ??
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

  const agents = scenario?.agents ?? [];

  /*
   * All terminal negotiation states.
   *
   * Agreement  -> successful negotiation
   * Rejected   -> agent explicitly rejected
   * Deadlock   -> maximum rounds reached
   * Completed  -> negotiation lifecycle completed
   */
  const isDone =
    state.status === "agreement" ||
    state.status === "rejected" ||
    state.status === "deadlock" ||
    state.status === "completed";

  /*
   * Current turn is only meaningful while
   * the negotiation is active.
   */
  const currentTurn = state.current_agent_turn
    ? agentLabel(
        agents,
        state.current_agent_turn,
      )
    : isDone
      ? "No active turn"
      : "Waiting...";

  /*
   * Helpful text for the current negotiation state.
   */
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
    <div className="mt-6 space-y-6 rounded-2xl border border-border/80 bg-card/90 p-5 shadow-card backdrop-blur-md sm:p-6">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div>
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-400">
            SESSION CONTROL & HISTORICAL TIMELINE
          </p>

          <h3 className="mt-0.5 font-sans text-lg font-bold text-textPrimary">
            {scenario?.name ||
              scenario?.scenario_name ||
              "Negotiation Session"}
          </h3>

          <p className="mt-0.5 font-body text-xs text-textSecondary">
            Simulated turn execution with concession
            tracking and rule-based decision evaluation.
          </p>
        </div>

        <StatusBadge status={state.status} />
      </div>

      {/* ======================================================
          STATUS MESSAGE
      ====================================================== */}

      <div className="rounded-xl border border-border/60 bg-cardAlt/50 px-4 py-3">
        <p className="text-xs font-body text-textSecondary">
          {statusMessage}
        </p>
      </div>

      {/* ======================================================
          METRICS ROW
      ====================================================== */}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

        {/* CURRENT ROUND */}

        <div className="rounded-xl border border-border/80 bg-cardAlt/70 px-3.5 py-3">
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-textMuted">
            Current Round
          </p>

          <p className="mt-1 font-mono text-xl font-extrabold text-textPrimary">
            {state.current_round ?? 0}
          </p>
        </div>

        {/* CURRENT TURN */}

        <div className="rounded-xl border border-border/80 bg-cardAlt/70 px-3.5 py-3">
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-textMuted">
            Current Turn
          </p>

          <p
            className={`mt-1 truncate text-xs font-semibold sm:text-sm ${
              state.current_agent_turn
                ? "text-indigo-400"
                : "text-textMuted"
            }`}
            title={currentTurn}
          >
            {currentTurn}
          </p>
        </div>

        {/* PREVIOUS OFFER */}

        <div className="rounded-xl border border-border/80 bg-cardAlt/70 px-3.5 py-3">
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-textMuted">
            Previous Offer
          </p>

          <p className="mt-1 font-mono text-sm font-bold text-textPrimary">
            {formatValue(
              state.previous_offer?.value,
            )}
          </p>
        </div>

        {/* LATEST OFFER */}

        <div className="rounded-xl border border-border/80 bg-cardAlt/70 px-3.5 py-3">
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-textMuted">
            Latest Offer
          </p>

          <p className="mt-1 font-mono text-sm font-bold text-emerald-400">
            {formatValue(
              state.current_offer?.value,
            )}
          </p>
        </div>
      </div>

      {/* ======================================================
          CURRENT TURN DETAILS
      ====================================================== */}

      {!isDone && state.current_agent_turn && (
        <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-textMuted">
                Agent Action Required
              </p>

              <p className="mt-1 font-sans text-sm font-bold text-indigo-300">
                {currentTurn}
              </p>
            </div>

            <span className="rounded-lg border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-1 font-mono text-[11px] text-indigo-300">
              Round {state.current_round}
            </span>
          </div>
        </div>
      )}

      {/* ======================================================
          ACTION CONTROLS
      ====================================================== */}

      <div className="flex flex-wrap gap-2.5 pt-1">

        {/* STEP */}

        <button
          type="button"
          onClick={onStep}
          disabled={isRunning || isDone}
          className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-cardAlt px-4 py-2 font-sans text-xs font-semibold text-textPrimary transition hover:border-indigo-500/50 hover:text-indigo-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>

          Step Agent Turn
        </button>

        {/* RUN TO COMPLETION */}

        <button
          type="button"
          onClick={onRunToCompletion}
          disabled={isRunning || isDone}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-azure px-4 py-2 font-sans text-xs font-semibold text-white shadow-glowSm transition hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isRunning ? (
            <>
              <svg
                className="h-3.5 w-3.5 animate-spin text-white"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                  opacity="0.25"
                />

                <path
                  d="M12 2a10 10 0 0 1 10 10"
                  stroke="currentColor"
                  strokeWidth="3"
                />
              </svg>

              Executing Simulation...
            </>
          ) : (
            <>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>

              Run To Completion
            </>
          )}
        </button>

        {/* RESET */}

        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-cardAlt px-4 py-2 font-sans text-xs font-semibold text-textMuted transition hover:border-amber-500/40 hover:text-amber-400"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>

          Reset Session
        </button>
      </div>

      {/* ======================================================
          OFFER HISTORY TABLE
      ====================================================== */}

      {state.history?.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-textMuted">
            Round-By-Round Offer Log
          </p>

          <div className="overflow-x-auto rounded-xl border border-border/60">
            <table className="w-full min-w-[540px] text-left font-body text-xs">
              <thead>
                <tr className="border-b border-border/80 bg-slate-900/60 font-mono text-[11px] uppercase tracking-wider text-textMuted">
                  <th className="px-4 py-2.5">
                    Round
                  </th>

                  <th className="px-4 py-2.5">
                    Agent
                  </th>

                  <th className="px-4 py-2.5">
                    Offer Value
                  </th>

                  <th className="px-4 py-2.5">
                    Strategic Rationale
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border/40">
                {state.history.map(
                  (offer, index) => (
                    <tr
                      key={`${offer.agent_id}-${offer.round}-${index}`}
                      className="transition-colors hover:bg-white/[0.02]"
                    >
                      <td className="px-4 py-3 font-mono font-semibold text-textMuted">
                        R{offer.round}
                      </td>

                      <td className="px-4 py-3 font-semibold text-textPrimary">
                        {agentLabel(
                          agents,
                          offer.agent_id,
                        )}
                      </td>

                      <td className="px-4 py-3 font-mono font-extrabold text-indigo-400">
                        {formatValue(
                          offer.value,
                        )}
                      </td>

                      <td className="px-4 py-3 text-textSecondary">
                        {offer.reason ||
                          "No rationale provided."}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================
          CONCESSION TRACKING
      ====================================================== */}

      {Object.keys(timeline ?? {}).length > 0 && (
        <div className="space-y-3">
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-textMuted">
            Agent Concession Velocity
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {Object.entries(timeline).map(
              ([agentId, entries]) => (
                <div
                  key={agentId}
                  className="space-y-2 rounded-xl border border-border/80 bg-cardAlt/50 p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-sans text-xs font-semibold text-textPrimary">
                      {agentLabel(
                        agents,
                        agentId,
                      )}
                    </p>

                    <p className="font-mono text-[11px] text-indigo-400">
                      Moved:{" "}
                      {formatValue(
                        concessionTotals?.[
                          agentId
                        ],
                      )}
                    </p>
                  </div>

                  <ol className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                    {entries.map((entry, index) => (
                      <li
                        key={`${entry.round}-${index}`}
                        className="rounded-md border border-border/60 bg-bg px-2 py-1 text-textSecondary"
                      >
                        R{entry.round}:{" "}
                        {formatValue(
                          entry.value,
                        )}

                        {entry.delta !== null &&
                          entry.delta !==
                            undefined && (
                            <span
                              className={
                                entry.delta === 0
                                  ? "text-textMuted"
                                  : "text-emerald-400"
                              }
                            >
                              {" "}
                              (
                              {entry.delta > 0
                                ? "+"
                                : ""}
                              {Math.round(
                                entry.delta,
                              ).toLocaleString()}
                              )
                            </span>
                          )}
                      </li>
                    ))}
                  </ol>
                </div>
              ),
            )}
          </div>
        </div>
      )}

      {/* ======================================================
          FINAL RESULT
      ====================================================== */}

      {isDone && (
        <div className="rounded-xl border border-border/70 bg-cardAlt/60 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-textMuted">
                Final Negotiation Result
              </p>

              <p className="mt-1 text-sm font-bold text-textPrimary">
                {state.status === "agreement" &&
                  "Agreement reached successfully."}

                {state.status === "rejected" &&
                  "The negotiation was rejected by an agent."}

                {state.status === "deadlock" &&
                  "Negotiation ended in deadlock."}

                {state.status === "completed" &&
                  "Negotiation completed."}
              </p>
            </div>

            <StatusBadge status={state.status} />
          </div>
        </div>
      )}
    </div>
  );
}