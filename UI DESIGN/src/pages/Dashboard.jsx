// Designed by TEAM 4

export default function Dashboard({ onNavigate }) {
  // Recent negotiation data
  const recentNegotiations = [
    {
      scenario: "Vendor Pricing",
      agents: "Buyer vs Vendor",
      rounds: 6,
      result: "Agreement",
      date: "Today",
    },
    {
      scenario: "Job Offer",
      agents: "Candidate vs Recruiter",
      rounds: 4,
      result: "Agreement",
      date: "Yesterday",
    },
    {
      scenario: "Project Budget",
      agents: "Manager vs Client",
      rounds: 7,
      result: "Deadlock",
      date: "Aug 31",
    },
    {
      scenario: "Contract Renewal",
      agents: "Company vs Supplier",
      rounds: 5,
      result: "Agreement",
      date: "Aug 30",
    },
  ];

  // System activity data
  const activityTimeline = [
    {
      title: "Negotiation #24 started",
      detail: "Vendor Pricing negotiation is currently in progress.",
      time: "2 min ago",
    },
    {
      title: "Agent offer updated",
      detail: "Buyer Agent changed the current offer to $48,000.",
      time: "8 min ago",
    },
    {
      title: "Negotiation round completed",
      detail: "Round 4 completed successfully.",
      time: "14 min ago",
    },
    {
      title: "Agent configuration updated",
      detail: "Risk-Averse Buyer strategy was modified.",
      time: "25 min ago",
    },
  ];

  return (
    <main className="min-h-[calc(100vh-5rem)] flex-1 bg-bg px-6 py-8 text-textPrimary">
      <div className="mx-auto max-w-7xl">

        {/* =====================================================
            DASHBOARD HEADER
        ====================================================== */}

        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(77,208,255,0.7)]" />

              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Dashboard
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-textPrimary">
              Negotiation Command Center
            </h1>

            <p className="mt-2 text-sm text-textSecondary">
              Monitor and manage your AI-powered negotiations.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate("Configure Agents")}
            className="
              rounded-xl
              bg-primary
              px-5
              py-3
              text-sm
              font-bold
              text-bg
              transition
              hover:bg-primaryBright
              hover:shadow-[0_0_20px_rgba(77,208,255,0.2)]
            "
          >
            + New Negotiation
          </button>

        </div>


        {/* =====================================================
            STATISTICS
        ====================================================== */}

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

          {/* Total Negotiations */}
          <div className="rounded-2xl border border-border bg-card p-5 transition hover:border-borderGlow">
            <p className="text-xs font-semibold uppercase tracking-wider text-textSecondary">
              Total Negotiations
            </p>

            <p className="mt-3 text-3xl font-bold text-textPrimary">
              24
            </p>

            <p className="mt-2 text-sm text-primary">
              +12% this month
            </p>
          </div>


          {/* Agreements */}
          <div className="rounded-2xl border border-border bg-card p-5 transition hover:border-borderGlow">
            <p className="text-xs font-semibold uppercase tracking-wider text-textSecondary">
              Agreements
            </p>

            <p className="mt-3 text-3xl font-bold text-textPrimary">
              18
            </p>

            <p className="mt-2 text-sm text-primary">
              75% success rate
            </p>
          </div>


          {/* Deadlocks */}
          <div className="rounded-2xl border border-border bg-card p-5 transition hover:border-borderGlow">
            <p className="text-xs font-semibold uppercase tracking-wider text-textSecondary">
              Deadlocks
            </p>

            <p className="mt-3 text-3xl font-bold text-textPrimary">
              4
            </p>

            <p className="mt-2 text-sm text-textSecondary">
              2 currently active
            </p>
          </div>


          {/* Average Rounds */}
          <div className="rounded-2xl border border-border bg-card p-5 transition hover:border-borderGlow">
            <p className="text-xs font-semibold uppercase tracking-wider text-textSecondary">
              Average Rounds
            </p>

            <p className="mt-3 text-3xl font-bold text-textPrimary">
              5.8
            </p>

            <p className="mt-2 text-sm text-primary">
              Improving efficiency
            </p>
          </div>

        </div>


        {/* =====================================================
            ACTIVE NEGOTIATION + WORKFLOW
        ====================================================== */}

        <div className="mt-6 grid gap-6 lg:grid-cols-3">

          {/* Active Negotiation */}
          <div className="rounded-2xl border border-border bg-card p-6 lg:col-span-2">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Active Negotiation
                </p>

                <h2 className="mt-2 text-xl font-bold text-textPrimary">
                  Vendor Pricing Negotiation
                </h2>
              </div>

              <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                In Progress
              </span>

            </div>


            {/* Agents */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2">

              {/* Buyer */}
              <div className="rounded-xl border border-border bg-cardAlt p-4">

                <p className="text-xs text-textSecondary">
                  Buyer Agent
                </p>

                <p className="mt-2 font-semibold text-textPrimary">
                  Risk-Averse Buyer
                </p>

                <p className="mt-2 text-sm text-textSecondary">
                  Current Offer
                </p>

                <p className="mt-1 text-2xl font-bold text-primary">
                  $48,000
                </p>

              </div>


              {/* Vendor */}
              <div className="rounded-xl border border-border bg-cardAlt p-4">

                <p className="text-xs text-textSecondary">
                  Vendor Agent
                </p>

                <p className="mt-2 font-semibold text-textPrimary">
                  Aggressive Vendor
                </p>

                <p className="mt-2 text-sm text-textSecondary">
                  Current Offer
                </p>

                <p className="mt-1 text-2xl font-bold text-primary">
                  $52,000
                </p>

              </div>

            </div>


            {/* Progress */}
            <div className="mt-6">

              <div className="mb-2 flex justify-between text-xs">

                <span className="text-textSecondary">
                  Negotiation Progress
                </span>

                <span className="font-semibold text-primary">
                  72%
                </span>

              </div>

              <div className="h-2 overflow-hidden rounded-full bg-cardAlt">

                <div className="h-full w-[72%] rounded-full bg-primary shadow-[0_0_10px_rgba(77,208,255,0.35)]" />

              </div>

            </div>

          </div>


          {/* Workflow */}
          <div className="rounded-2xl border border-border bg-card p-6">

            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Workflow
            </p>

            <h2 className="mt-2 text-xl font-bold text-textPrimary">
              Negotiation Status
            </h2>


            <div className="mt-6 space-y-5">

              {/* Step 1 */}
              <div className="flex items-center gap-3">

                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-bg">
                  ✓
                </span>

                <span className="text-sm text-textPrimary">
                  Scenario Selected
                </span>

              </div>


              {/* Step 2 */}
              <div className="flex items-center gap-3">

                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-bg">
                  ✓
                </span>

                <span className="text-sm text-textPrimary">
                  Agents Configured
                </span>

              </div>


              {/* Step 3 */}
              <div className="flex items-center gap-3">

                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-primary bg-primary/10 text-xs font-bold text-primary">
                  3
                </span>

                <span className="text-sm font-semibold text-primary">
                  Negotiation Running
                </span>

              </div>


              {/* Step 4 */}
              <div className="flex items-center gap-3">

                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-xs text-textMuted">
                  4
                </span>

                <span className="text-sm text-textMuted">
                  Outcome Analysis
                </span>

              </div>

            </div>

          </div>

        </div>


        {/* =====================================================
            RECENT NEGOTIATIONS + SYSTEM ACTIVITY
        ====================================================== */}

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">


          {/* =================================================
              RECENT NEGOTIATIONS
          ================================================== */}

          <section className="min-w-0 rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6">

            {/* Section Header */}
            <div className="mb-5 flex items-center justify-between">

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                  History
                </p>

                <h2 className="mt-1 text-xl font-bold tracking-tight text-textPrimary">
                  Recent Negotiations
                </h2>

                <p className="mt-1 text-sm text-textSecondary">
                  Latest negotiation sessions and their outcomes.
                </p>
              </div>

              <span className="hidden rounded-full border border-border bg-cardAlt px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-textSecondary sm:inline-flex">
                {recentNegotiations.length} Recent
              </span>

            </div>


            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-border">

              <table className="min-w-full text-left">

                <thead className="bg-cardAlt">

                  <tr className="border-b border-border">

                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-textSecondary">
                      Scenario
                    </th>

                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-textSecondary">
                      Agents
                    </th>

                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-textSecondary">
                      Rounds
                    </th>

                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-textSecondary">
                      Result
                    </th>

                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-textSecondary">
                      Date
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {recentNegotiations.map((negotiation, index) => (

                    <tr
                      key={index}
                      className="border-b border-border/70 last:border-0 transition hover:bg-cardAlt/60"
                    >

                      {/* Scenario */}
                      <td className="px-4 py-4">

                        <p className="text-sm font-semibold text-textPrimary">
                          {negotiation.scenario}
                        </p>

                      </td>


                      {/* Agents */}
                      <td className="px-4 py-4 text-sm text-textSecondary">
                        {negotiation.agents}
                      </td>


                      {/* Rounds */}
                      <td className="px-4 py-4">

                        <span className="font-mono text-sm text-textPrimary">
                          {negotiation.rounds}
                        </span>

                      </td>


                      {/* Result */}
                      <td className="px-4 py-4">

                        <span
                          className={`
                            inline-flex
                            rounded-full
                            px-2.5
                            py-1
                            text-[10px]
                            font-bold
                            ${
                              negotiation.result === "Agreement"
                                ? "border border-primary/25 bg-primary/10 text-primary"
                                : "border border-warning/25 bg-warning/10 text-warning"
                            }
                          `}
                        >
                          {negotiation.result}
                        </span>

                      </td>


                      {/* Date */}
                      <td className="px-4 py-4 text-xs text-textSecondary">
                        {negotiation.date}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </section>


          {/* =================================================
              SYSTEM ACTIVITY
          ================================================== */}

          <section className="rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6">

            {/* Header */}
            <div>

              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                Live Feed
              </p>

              <h2 className="mt-1 text-xl font-bold tracking-tight text-textPrimary">
                System Activity
              </h2>

              <p className="mt-1 text-sm text-textSecondary">
                Recent changes across the system.
              </p>

            </div>


            {/* Timeline */}
            <div className="relative mt-6">

              {/* Timeline Line */}
              <div className="absolute left-[5px] top-2 h-[calc(100%-12px)] w-px bg-border" />


              <div className="space-y-6">

                {activityTimeline.map((activity, index) => (

                  <div
                    key={index}
                    className="relative flex gap-4"
                  >

                    {/* Dot */}
                    <div className="relative z-10 mt-1.5 flex h-3 w-3 shrink-0 items-center justify-center rounded-full border border-primary bg-bg">

                      <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(77,208,255,0.8)]" />

                    </div>


                    {/* Content */}
                    <div className="min-w-0 flex-1">

                      <div className="flex items-start justify-between gap-3">

                        <p className="text-sm font-semibold leading-5 text-textPrimary">
                          {activity.title}
                        </p>

                        <span className="shrink-0 text-[10px] text-textMuted">
                          {activity.time}
                        </span>

                      </div>

                      <p className="mt-1 text-xs leading-5 text-textSecondary">
                        {activity.detail}
                      </p>

                    </div>

                  </div>

                ))}

              </div>

            </div>


            {/* Footer */}
            <div className="mt-6 border-t border-border pt-4">

              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-primary">

                <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(77,208,255,0.7)]" />

                System monitoring active

              </div>

            </div>

          </section>

        </div>

      </div>
    </main>
  );
}