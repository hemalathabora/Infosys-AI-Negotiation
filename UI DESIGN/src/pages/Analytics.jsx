function formatValue(value) {
  if (value === null || value === undefined) return "N/A";
  return `$${Math.round(value).toLocaleString()}`;
}

function Metric({ label, value, detail, accent = "azure" }) {
  const colorClass =
    accent === "emerald"
      ? "text-emerald-400 font-mono"
      : accent === "rose"
        ? "text-rose-400 font-mono"
        : "text-indigo-400 font-mono";

  return (
    <div className="rounded-2xl border border-border/80 bg-card/90 p-5 backdrop-blur-md transition-all hover:border-borderGlow">
      <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-textMuted">
        {label}
      </p>
      <p className={`mt-2 text-2xl font-extrabold ${colorClass}`}>{value}</p>
      <p className="mt-1 text-xs text-textSecondary font-body">{detail}</p>
    </div>
  );
}

function OfferBar({ offer, maxValue, agent, index }) {
  const width = maxValue ? Math.max(8, (offer.value / maxValue) * 100) : 8;
  const isFirst = index === 0;

  return (
    <div className="grid grid-cols-[100px_1fr_92px] items-center gap-3 text-xs sm:grid-cols-[140px_1fr_110px]">
      <div className="truncate font-medium text-textPrimary font-sans">
        R{offer.round} · {agent?.name || "Agent"}
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-900 border border-border/60">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isFirst
              ? "bg-slate-500"
              : agent?.id === "buyer" || agent?.id === "candidate"
                ? "bg-gradient-to-r from-blue-600 to-azure"
                : "bg-gradient-to-r from-indigo-600 to-indigo-400"
          }`}
          style={{ width: `${width}%` }}
        />
      </div>
      <div className="text-right font-mono font-bold text-textPrimary">
        {formatValue(offer.value)}
      </div>
    </div>
  );
}

export default function Analytics({ scenario, negotiation, onNavigate }) {
  if (!scenario || !negotiation.state) {
    return (
      <main
        data-guide="reports-panel"
        className="flex-1 px-4 py-8 sm:px-6 lg:px-10"
      >
        <div className="mx-auto max-w-5xl rounded-2xl border border-border/80 bg-card p-10 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
          </div>
          <h1 className="text-2xl font-bold text-textPrimary font-sans">
            No Analytics Data Available
          </h1>
          <p className="text-sm text-textSecondary max-w-md mx-auto">
            Execute a negotiation session in the Arena to view performance graphs and strategy breakdowns.
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
  const maxValue = Math.max(...state.history.map((offer) => offer.value), 1);
  const firstOffer = state.history[0]?.value;
  const finalOffer = state.current_offer?.value;
  const totalMovement = Object.values(concessionTotals).reduce(
    (sum, value) => sum + value,
    0,
  );

  return (
    <main
      data-guide="reports-panel"
      className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8 animate-fadeIn"
    >
      <div className="mx-auto max-w-7xl space-y-6">

        {/* HEADER */}
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border/60 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              <p className="text-xs font-mono font-semibold uppercase tracking-widest text-indigo-400">
                PERFORMANCE ANALYTICS
              </p>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-textPrimary font-sans">
              {scenario.scenario_name || scenario.name}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-textSecondary font-body">
              Quantitative breakdown of offer trajectories, utility convergence, and concession rates.
            </p>
          </div>

          <span
            className={`rounded-full border px-3.5 py-1.5 font-mono text-xs font-semibold uppercase tracking-wider ${
              isAgreement
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 shadow-successGlow"
                : "border-amber-500/40 bg-amber-500/10 text-amber-400"
            }`}
          >
            {isAgreement ? "Agreement Reached" : "Session Deadlock"}
          </span>
        </header>


        {/* METRICS CARDS */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric
            label="Outcome Result"
            value={isAgreement ? "Agreement" : "Deadlock"}
            detail={
              isAgreement
                ? `Settled at ${formatValue(finalOffer)}`
                : "No mutually acceptable terms"
            }
            accent={isAgreement ? "emerald" : "rose"}
          />
          <Metric
            label="Rounds Completed"
            value={state.current_round}
            detail={`${state.history.length} total offers exchanged`}
          />
          <Metric
            label="Opening Position"
            value={formatValue(firstOffer)}
            detail="Initial anchor value in session"
          />
          <Metric
            label="Total Movement"
            value={formatValue(totalMovement)}
            detail="Combined concession sum"
            accent="emerald"
          />
        </section>


        {/* DETAILED CARDS GRID */}
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_1fr]">

          {/* OFFER TRAJECTORY BARS */}
          <div className="rounded-2xl border border-border/80 bg-card/90 p-5 sm:p-6 backdrop-blur-md space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border/60 pb-3">
              <div>
                <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-400">
                  POSITION PROGRESSION
                </p>
                <h2 className="mt-0.5 text-lg font-bold text-textPrimary font-sans">
                  Offer Trajectory Sequence
                </h2>
              </div>
              <span className="text-xs text-textMuted font-mono">
                Horizontal scale represents value magnitude
              </span>
            </div>

            <div className="space-y-3.5 pt-2">
              {state.history.map((offer, idx) => {
                const agent = scenario.agents.find((a) => a.id === offer.agent_id);
                return (
                  <OfferBar
                    key={idx}
                    offer={offer}
                    maxValue={maxValue}
                    agent={agent}
                    index={idx}
                  />
                );
              })}
            </div>
          </div>


          {/* AGENT SUMMARY COMPARISON */}
          <div className="rounded-2xl border border-border/80 bg-card/90 p-5 sm:p-6 backdrop-blur-md space-y-5 flex flex-col justify-between">
            <div>
              <div className="border-b border-border/60 pb-3">
                <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-400">
                  CONCESSION ANALYSIS
                </p>
                <h2 className="mt-0.5 text-lg font-bold text-textPrimary font-sans">
                  Agent Flexibility Metrics
                </h2>
              </div>

              <div className="mt-5 space-y-4">
                {scenario.agents.map((agent) => {
                  const moved = concessionTotals[agent.id] ?? 0;
                  return (
                    <div key={agent.id} className="rounded-xl border border-border/80 bg-cardAlt/70 p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-textPrimary font-sans">{agent.name}</span>
                        <span className="font-mono text-xs text-indigo-400 font-bold">
                          Moved {formatValue(moved)}
                        </span>
                      </div>
                      <p className="text-xs text-textSecondary font-body">Role: {agent.role} ({agent.personality})</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate("Reports")}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-azure px-4 py-2.5 text-xs font-semibold text-white shadow-glowSm hover:shadow-glow transition-all font-sans text-center"
            >
              Generate Executive Report →
            </button>

          </div>

        </section>

      </div>
    </main>
  );
}
