// Designed by TEAM 4

const resultStyles = {
  Agreement:
    "border border-primary/25 bg-primary/10 text-primary",

  "In Progress":
    "border border-primary/20 bg-cardAlt text-primary",

  Deadlock:
    "border border-warning/25 bg-warning/10 text-warning",
};

export default function RecentNegotiations({ rows }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6">

      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
            History
          </p>

          <h3 className="mt-1 text-xl font-bold tracking-tight text-textPrimary">
            Recent Negotiations
          </h3>

          <p className="mt-1 text-sm text-textSecondary">
            Latest negotiation sessions and their outcomes.
          </p>
        </div>

        <span className="hidden rounded-full border border-border bg-cardAlt px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-textSecondary sm:inline-flex">
          {rows.length} Recent
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

              <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-[0.15em] text-textSecondary">
                Action
              </th>

            </tr>
          </thead>

          <tbody>
            {rows.map((row, index) => (
              <tr
                key={`${row.scenario}-${row.date}-${row.rounds}-${index}`}
                className="border-b border-border/70 last:border-0 transition-colors hover:bg-cardAlt/60"
              >

                {/* Scenario */}
                <td className="px-4 py-4">
                  <p className="text-sm font-semibold text-textPrimary">
                    {row.scenario}
                  </p>

                  <p className="mt-1 text-xs text-textMuted">
                    {row.mode}
                  </p>
                </td>

                {/* Agents */}
                <td className="px-4 py-4 text-sm text-textSecondary">
                  {row.agents}
                </td>

                {/* Rounds */}
                <td className="px-4 py-4">
                  <span className="font-mono text-sm text-textPrimary">
                    {row.rounds}
                  </span>
                </td>

                {/* Result */}
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${resultStyles[row.result] || resultStyles["In Progress"]}`}
                  >
                    {row.result}
                  </span>
                </td>

                {/* Date */}
                <td className="px-4 py-4 text-xs text-textSecondary">
                  {row.date}
                </td>

                {/* Action */}
                <td className="px-4 py-4 text-right">
                  <button
                    type="button"
                    className="text-xs font-semibold text-primary transition hover:text-primaryBright"
                  >
                    View
                  </button>
                </td>

              </tr>
            ))}
          </tbody>

        </table>
      </div>

    </section>
  );
}