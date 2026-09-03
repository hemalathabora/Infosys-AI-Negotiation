function formatValue(value) {
  if (value === null || value === undefined) return "N/A";
  return `$${Math.round(value).toLocaleString()}`;
}

function ReportSection({ eyebrow, title, children }) {
  return (
    <section className="rounded-2xl border border-border/80 bg-card/90 p-5 sm:p-6 backdrop-blur-md space-y-4">
      <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-400">
        {eyebrow}
      </p>
      <h2 className="text-lg font-bold text-textPrimary font-sans">{title}</h2>
      <div>{children}</div>
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
        <div className="mx-auto max-w-5xl rounded-2xl border border-border/80 bg-card p-10 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
          </div>
          <h1 className="text-2xl font-bold text-textPrimary font-sans">
            No Report Available
          </h1>
          <p className="text-sm text-textSecondary max-w-md mx-auto">
            Complete a negotiation session to generate an executive report.
          </p>
          <button
            type="button"
            onClick={() => onNavigate("Configure Agents")}
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-azure px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-glowSm hover:shadow-glow transition-all"
          >
            Start A Negotiation
          </button>
        </div>
      </main>
    );
  }

  const { state, timeline, concessionTotals } = negotiation;
  const isAgreement = state.status === "agreement";
  const finalOffer = state.current_offer?.value;
  const openingOffer = state.history[0]?.value;

  return (
    <main
      data-guide="reports-panel"
      className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8 animate-fadeIn"
    >
      <div className="mx-auto max-w-6xl space-y-6">

        {/* HEADER */}
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border/60 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              <p className="text-xs font-mono font-semibold uppercase tracking-widest text-indigo-400">
                EXECUTIVE SUMMARY & AUDIT REPORT
              </p>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-textPrimary font-sans">
              {scenario.scenario_name || scenario.name}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-textSecondary font-body">
              Official audit documentation of party mandates, offer progressions, and deal outcomes.
            </p>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl border border-indigo-500/40 bg-indigo-500/10 px-4 py-2.5 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/20 transition-all font-sans"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>
            Print Executive PDF
          </button>
        </header>


        {/* EXECUTIVE OUTCOME BANNER */}
        <section
          className={`rounded-2xl border p-5 sm:p-6 backdrop-blur-md ${
            isAgreement
              ? "border-emerald-500/40 bg-emerald-500/10 shadow-successGlow"
              : "border-amber-500/40 bg-amber-500/10"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-textMuted">
                Final Negotiation Result
              </p>
              <h2
                className={`mt-1 text-2xl font-extrabold font-sans ${
                  isAgreement ? "text-emerald-400" : "text-amber-400"
                }`}
              >
                {isAgreement
                  ? "Agreement Successfully Executed"
                  : "Negotiation Concluded in Deadlock"}
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-textSecondary font-body">
                {isAgreement
                  ? `Both agents converged on final mutually agreed terms at ${formatValue(finalOffer)}.`
                  : "The agents were unable to resolve constraint gaps within the round threshold."}
              </p>
            </div>

            <div className="flex items-center gap-6 font-mono">
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider text-textMuted">Rounds</p>
                <p className="mt-0.5 text-xl font-extrabold text-textPrimary">{state.current_round}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider text-textMuted">Offers Exchanged</p>
                <p className="mt-0.5 text-xl font-extrabold text-indigo-400">{state.history.length}</p>
              </div>
            </div>
          </div>
        </section>


        {/* REPORT SECTIONS */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          <ReportSection eyebrow="01 / CONTEXT" title="Scenario Executive Brief">
            <p className="text-xs sm:text-sm leading-relaxed text-textSecondary font-body">
              {scenario.description}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 font-mono">
              <div className="rounded-xl border border-border/80 bg-cardAlt/60 p-3">
                <p className="text-[10px] uppercase tracking-wider text-textMuted">Opening Anchor</p>
                <p className="mt-1 font-extrabold text-blue-400">{formatValue(openingOffer)}</p>
              </div>
              <div className="rounded-xl border border-border/80 bg-cardAlt/60 p-3">
                <p className="text-[10px] uppercase tracking-wider text-textMuted">Final Settlement</p>
                <p className="mt-1 font-extrabold text-emerald-400">{formatValue(finalOffer)}</p>
              </div>
            </div>
          </ReportSection>

          <ReportSection eyebrow="02 / PARTIES" title="Agent Strategic Mandates">
            <div className="space-y-3">
              {scenario.agents.map((agent) => (
                <div key={agent.id} className="rounded-xl border border-border/80 bg-cardAlt/60 p-3.5 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-textPrimary font-sans">{agent.name}</p>
                    <span className="font-mono text-[10px] font-bold text-indigo-400 uppercase bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                      {agent.personality}
                    </span>
                  </div>
                  <p className="text-xs text-textSecondary font-body">Role: {agent.role}</p>
                  <p className="text-xs text-textMuted font-body italic">Goal: {agent.goal}</p>
                </div>
              ))}
            </div>
          </ReportSection>

        </div>


        {/* AUDIT LOG TABLE */}
        <ReportSection eyebrow="03 / AUDIT TRAIL" title="Complete Turn-by-Turn Audit Transcript">
          <div className="overflow-x-auto rounded-xl border border-border/60">
            <table className="w-full text-left text-xs font-body">
              <thead>
                <tr className="border-b border-border/80 bg-slate-900/60 font-mono text-[11px] uppercase tracking-wider text-textMuted">
                  <th className="px-4 py-3">Round</th>
                  <th className="px-4 py-3">Acting Party</th>
                  <th className="px-4 py-3">Offer Position</th>
                  <th className="px-4 py-3">Decision Logic & Reasoning</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {state.history.map((offer, idx) => {
                  const agent = scenario.agents.find((a) => a.id === offer.agent_id);
                  return (
                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 font-mono text-textMuted font-semibold">R{offer.round}</td>
                      <td className="px-4 py-3 font-semibold text-textPrimary">{agent?.name || offer.agent_id}</td>
                      <td className="px-4 py-3 font-mono font-extrabold text-indigo-400">{formatValue(offer.value)}</td>
                      <td className="px-4 py-3 text-textSecondary leading-relaxed">{offer.reason}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </ReportSection>

      </div>
    </main>
  );
}
