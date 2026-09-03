function formatValue(value) {
  if (value === null || value === undefined) return "N/A";
  return `$${Math.round(value).toLocaleString()}`;
}

function ReportSection({ eyebrow, title, children }) {
  return (
    <section className="rounded-2xl border border-[#214a69] bg-[#0b1b2a] p-5 sm:p-6">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#4dd0ff]">
        {eyebrow}
      </p>
      <h2 className="mt-1 text-lg font-extrabold text-white">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default function Reports({ scenario, negotiation, onNavigate }) {
  if (!scenario || !negotiation.state) {
    return (
      <main
        data-guide="reports-panel"
        className="flex-1 px-4 py-8 sm:px-6 lg:px-10"
      >
        <div className="mx-auto max-w-5xl rounded-2xl border border-[#214a69] bg-[#0b1b2a] p-10 text-center">
          <h1 className="text-2xl font-black text-white">
            No report available
          </h1>
          <p className="mt-2 text-sm text-[#8ca6bb]">
            Complete a negotiation before generating a full report.
          </p>
          <button
            type="button"
            onClick={() => onNavigate("Configure Agents")}
            className="mt-6 rounded-lg bg-[#4dd0ff] px-5 py-2.5 text-sm font-bold text-[#061018]"
          >
            Start a negotiation
          </button>
        </div>
      </main>
    );
  }

  const { state, timeline, concessionTotals } = negotiation;
  const isAgreement = state.status === "agreement";
  const finalOffer = state.current_offer?.value;
  const openingOffer = state.history[0]?.value;
  const totalConcessions = Object.values(concessionTotals).reduce(
    (sum, value) => sum + value,
    0,
  );

  return (
    <main
      data-guide="reports-panel"
      className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8"
    >
      <div className="mx-auto max-w-[1200px]">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#4dd0ff]">
              Final negotiation report
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
              {scenario.scenario_name}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#8ca6bb]">
              A complete record of the negotiation, including the business
              context, agent mandates, offers exchanged, decision logic, and
              final result.
            </p>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-lg border border-[#4dd0ff]/50 bg-[#4dd0ff]/10 px-4 py-2.5 text-xs font-bold text-[#4dd0ff]"
          >
            Print report
          </button>
        </header>

        <section
          className={`mb-5 rounded-2xl border p-5 sm:p-6 ${isAgreement ? "border-[#c4ff3a]/40 bg-[#172515]" : "border-[#ff8d8d]/40 bg-[#2a1519]"}`}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8ca6bb]">
                Executive outcome
              </p>
              <h2
                className={`mt-1 text-2xl font-black ${isAgreement ? "text-[#c4ff3a]" : "text-[#ff8d8d]"}`}
              >
                {isAgreement
                  ? "Agreement reached"
                  : "Negotiation ended in deadlock"}
              </h2>
              <p className="mt-2 text-sm text-[#dfeaf5]">
                {isAgreement
                  ? `Both agents accepted the final position at ${formatValue(finalOffer)}.`
                  : "The agents did not reach a position accepted by both parties."}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6 text-right">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#8ca6bb]">
                  Rounds
                </p>
                <p className="mt-1 text-xl font-black text-white">
                  {state.current_round}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#8ca6bb]">
                  Offers
                </p>
                <p className="mt-1 text-xl font-black text-white">
                  {state.history.length}
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <ReportSection eyebrow="01 / Context" title="Scenario brief">
            <p className="text-sm leading-7 text-[#dfeaf5]">
              {scenario.description}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-[#1d374d] bg-[#091521] p-3">
                <p className="text-[10px] uppercase tracking-wider text-[#66849a]">
                  Opening position
                </p>
                <p className="mt-1 font-bold text-[#4dd0ff]">
                  {formatValue(openingOffer)}
                </p>
              </div>
              <div className="rounded-xl border border-[#1d374d] bg-[#091521] p-3">
                <p className="text-[10px] uppercase tracking-wider text-[#66849a]">
                  Final position
                </p>
                <p className="mt-1 font-bold text-[#c4ff3a]">
                  {formatValue(finalOffer)}
                </p>
              </div>
            </div>
          </ReportSection>

          <ReportSection eyebrow="02 / Parties" title="Agent mandates">
            <div className="space-y-4">
              {scenario.agents.map((agent) => (
                <div
                  key={agent.id}
                  className="rounded-xl border border-[#1d374d] bg-[#091521] p-4"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-extrabold text-white">{agent.name}</h3>
                    <span className="text-xs font-semibold text-[#4dd0ff]">
                      {agent.personality}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#8ca6bb]">{agent.role}</p>
                  <p className="mt-3 text-sm text-[#dfeaf5]">
                    <span className="font-bold text-[#8ca6bb]">Goal:</span>{" "}
                    {agent.goal}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {agent.constraints.map((constraint, index) => (
                      <span
                        key={index}
                        className="rounded-md border border-[#315168] px-2 py-1 text-xs text-[#8ca6bb]"
                      >
                        {typeof constraint === "string"
                          ? constraint
                          : constraint.text}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ReportSection>
        </div>

        <ReportSection
          eyebrow="03 / Decision record"
          title="Offer chronology"
          className="mt-5"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#315168] text-[10px] uppercase tracking-wider text-[#66849a]">
                  <th className="pb-3 pr-4">Round</th>
                  <th className="pb-3 pr-4">Agent</th>
                  <th className="pb-3 pr-4">Position</th>
                  <th className="pb-3">Reasoning recorded by the engine</th>
                </tr>
              </thead>
              <tbody>
                {state.history.map((offer, index) => (
                  <tr
                    key={`${offer.agent_id}-${offer.round}-${index}`}
                    className="border-b border-white/10 last:border-0"
                  >
                    <td className="py-3 pr-4 text-[#8ca6bb]">{offer.round}</td>
                    <td className="py-3 pr-4 font-bold text-white">
                      {scenario.agents.find(
                        (agent) => agent.id === offer.agent_id,
                      )?.name ?? offer.agent_id}
                    </td>
                    <td className="py-3 pr-4 font-bold text-[#4dd0ff]">
                      {formatValue(offer.value)}
                    </td>
                    <td className="py-3 text-[#8ca6bb]">{offer.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ReportSection>

        <ReportSection
          eyebrow="04 / Findings"
          title="Agent flexibility and findings"
          className="mt-5"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {scenario.agents.map((agent) => {
              const entries = timeline[agent.id] ?? [];
              const total = concessionTotals[agent.id] ?? 0;
              return (
                <div
                  key={agent.id}
                  className="rounded-xl border border-[#1d374d] bg-[#091521] p-4"
                >
                  <div className="flex justify-between gap-3">
                    <span className="font-bold text-white">{agent.name}</span>
                    <span className="font-black text-[#c4ff3a]">
                      {formatValue(total)} moved
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-[#8ca6bb]">
                    Made {entries.length} offer{entries.length === 1 ? "" : "s"}{" "}
                    and contributed{" "}
                    {totalConcessions
                      ? Math.round((total / totalConcessions) * 100)
                      : 0}
                    % of total movement.
                  </p>
                </div>
              );
            })}
          </div>
          <div className="mt-5 rounded-xl border border-[#315168] bg-[#0e2338] p-4 text-sm leading-relaxed text-[#dfeaf5]">
            {isAgreement
              ? `The negotiation converged after ${state.history.length} recorded offers. The final accepted position was ${formatValue(finalOffer)}, with ${formatValue(totalConcessions)} of combined movement from the opening positions.`
              : `The negotiation ended without agreement after ${state.history.length} recorded offers. The gap between the parties remained unresolved under their configured constraints.`}
          </div>
        </ReportSection>

        <div className="mt-5 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={() => onNavigate("Analytics")}
            className="rounded-lg border border-[#4dd0ff]/40 px-4 py-2.5 text-xs font-bold text-[#4dd0ff]"
          >
            View analytics
          </button>
          <button
            type="button"
            onClick={() => onNavigate("Negotiation Arena")}
            className="rounded-lg bg-[#4dd0ff] px-4 py-2.5 text-xs font-bold text-[#061018]"
          >
            Return to arena
          </button>
        </div>
      </div>
    </main>
  );
}
