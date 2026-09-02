// Designed by TEAM 4

const STATUS_META = {
  not_started: {
    label: "Not Started",
    classes: "bg-white/5 text-textSecondary border-border",
  },

  in_progress: {
    label: "In Progress",
    classes: "bg-primary/15 text-primaryBright border-primary/30",
  },

  agreement: {
    label: "Agreement",
    classes: "bg-success/15 text-success border-success/30",
  },

  rejected: {
    label: "Rejected",
    classes: "bg-warning/15 text-warning border-warning/30",
  },

  deadlock: {
    label: "Deadlock",
    classes: "bg-warning/15 text-warning border-warning/30",
  },

  completed: {
    label: "Completed",
    classes: "bg-primary/15 text-primaryBright border-primary/30",
  },
};


/* ============================================================
   STATUS BADGE
============================================================ */

function StatusBadge({ status }) {
  const meta =
    STATUS_META[status] ?? STATUS_META.not_started;

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-1.5
        rounded-full
        border
        px-3
        py-1
        text-xs
        font-semibold
        ${meta.classes}
      `}
    >
      {meta.label}
    </span>
  );
}


/* ============================================================
   FORMAT MONEY VALUE
============================================================ */

function formatValue(value) {
  if (value === null || value === undefined) {
    return "N/A";
  }

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
            Round-based simulation powered by the rule-based
            Orchestrator.
          </p>

        </div>


        <StatusBadge status={state.status} />

      </div>



      {/* ======================================================
          STATE SUMMARY
      ======================================================= */}

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">

        {/* Round */}
        <div
          className="
            rounded-xl
            border
            border-border
            bg-cardAlt
            px-3.5
            py-3
          "
        >

          <p className="text-[10px] font-bold uppercase tracking-wider text-textSecondary">
            Round
          </p>

          <p className="mt-1 text-xl font-bold text-textPrimary">
            {state.current_round}
          </p>

        </div>


        {/* Turn */}
        <div
          className="
            rounded-xl
            border
            border-border
            bg-cardAlt
            px-3.5
            py-3
          "
        >

          <p className="text-[10px] font-bold uppercase tracking-wider text-textSecondary">
            Turn
          </p>

          <p className="mt-1 truncate text-sm font-bold text-textPrimary">
            {isDone
              ? "Finished"
              : agentLabel(
                  scenario?.agents || [],
                  state.current_agent_turn
                )}
          </p>

        </div>


        {/* Previous Offer */}
        <div
          className="
            rounded-xl
            border
            border-border
            bg-cardAlt
            px-3.5
            py-3
          "
        >

          <p className="text-[10px] font-bold uppercase tracking-wider text-textSecondary">
            Previous Offer
          </p>

          <p className="mt-1 text-sm font-bold text-textPrimary">
            {formatValue(state.previous_offer?.value)}
          </p>

        </div>


        {/* Current Offer */}
        <div
          className="
            rounded-xl
            border
            border-border
            bg-cardAlt
            px-3.5
            py-3
          "
        >

          <p className="text-[10px] font-bold uppercase tracking-wider text-textSecondary">
            Current Offer
          </p>

          <p className="mt-1 text-sm font-bold text-primary">
            {formatValue(state.current_offer?.value)}
          </p>

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
          {isRunning
            ? "Running..."
            : "Run To Completion"}
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



      {/* ======================================================
          OFFER HISTORY
      ======================================================= */}

      {state.history?.length > 0 && (

        <div className="mb-6">

          <div className="mb-3 flex items-center justify-between">

            <div>

              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                Negotiation History
              </p>

              <p className="mt-1 text-xs text-textSecondary">
                Offers exchanged during the negotiation.
              </p>

            </div>

            <span className="rounded-full border border-border bg-cardAlt px-2.5 py-1 text-[10px] font-semibold text-textSecondary">
              {state.history.length} Rounds
            </span>

          </div>


          <div className="overflow-x-auto rounded-xl border border-border">

            <table className="w-full min-w-[600px] text-left text-xs">

              <thead>

                <tr className="border-b border-border bg-cardAlt">

                  <th className="px-4 py-3 font-bold uppercase tracking-wider text-textSecondary">
                    Round
                  </th>

                  <th className="px-4 py-3 font-bold uppercase tracking-wider text-textSecondary">
                    Agent
                  </th>

                  <th className="px-4 py-3 font-bold uppercase tracking-wider text-textSecondary">
                    Offer
                  </th>

                  <th className="px-4 py-3 font-bold uppercase tracking-wider text-textSecondary">
                    Reason
                  </th>

                </tr>

              </thead>


              <tbody>

                {state.history.map((offer, index) => (

                  <tr
                    key={`${offer.round}-${offer.agent_id}-${index}`}
                    className="
                      border-b
                      border-border/60
                      transition
                      last:border-0
                      hover:bg-cardAlt/50
                    "
                  >

                    {/* Round */}
                    <td className="px-4 py-3 text-textSecondary">
                      {offer.round}
                    </td>


                    {/* Agent */}
                    <td className="px-4 py-3 font-semibold text-textPrimary">
                      {agentLabel(
                        scenario?.agents || [],
                        offer.agent_id
                      )}
                    </td>


                    {/* Offer */}
                    <td className="px-4 py-3 font-bold text-primary">
                      {formatValue(offer.value)}
                    </td>


                    {/* Reason */}
                    <td className="max-w-xl px-4 py-3 leading-5 text-textSecondary">
                      {offer.reason || "No reason provided"}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

      )}



      {/* ======================================================
          CONCESSION TRACKING
      ======================================================= */}

      {timeline &&
        Object.keys(timeline).length > 0 && (

          <div>

            <div className="mb-3">

              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                Concession Tracking
              </p>

              <p className="mt-1 text-xs text-textSecondary">
                Track how much each agent has moved from their
                original position.
              </p>

            </div>


            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

              {Object.entries(timeline).map(
                ([agentId, entries]) => (

                  <div
                    key={agentId}
                    className="
                      rounded-xl
                      border
                      border-border
                      bg-cardAlt
                      p-4
                    "
                  >

                    {/* Agent Header */}
                    <div className="mb-3 flex items-start justify-between gap-3">

                      <div>

                        <p className="text-sm font-bold text-textPrimary">
                          {agentLabel(
                            scenario?.agents || [],
                            agentId
                          )}
                        </p>

                        <p className="mt-1 text-[10px] uppercase tracking-wider text-textMuted">
                          Concession History
                        </p>

                      </div>


                      <div className="text-right">

                        <p className="text-[10px] uppercase tracking-wider text-textMuted">
                          Total Moved
                        </p>

                        <p className="mt-1 text-xs font-bold text-primary">
                          {formatValue(
                            concessionTotals?.[agentId]
                          )}
                        </p>

                      </div>

                    </div>


                    {/* Rounds */}
                    <ol className="flex flex-wrap gap-1.5">

                      {entries.map((entry) => (

                        <li
                          key={entry.round}
                          className="
                            rounded-md
                            border
                            border-border
                            bg-bg
                            px-2
                            py-1.5
                            text-[10px]
                            text-textSecondary
                          "
                        >

                          <span className="font-semibold text-textPrimary">
                            R{entry.round}
                          </span>

                          <span className="mx-1">
                            :
                          </span>

                          {formatValue(entry.value)}


                          {entry.delta !== null &&
                            entry.delta !== undefined && (

                              <span
                                className={
                                  entry.delta === 0
                                    ? "ml-1 text-textSecondary"
                                    : "ml-1 text-primary"
                                }
                              >
                                (
                                {entry.delta > 0
                                  ? "+"
                                  : ""}
                                {Math.round(
                                  entry.delta
                                ).toLocaleString()}
                                )
                              </span>

                            )}

                        </li>

                      ))}

                    </ol>

                  </div>

                )
              )}

            </div>

          </div>

        )}

    </div>
  );
}