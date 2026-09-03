export default function Dashboard({
  onNavigate,
  activeScenario,
  negotiation,
  history = [],
  stats = {
    totalSimulations: 0,
    agreementsCount: 0,
    deadlocksCount: 0,
    agreementRate: 0,
    avgRounds: "0.0",
  },
  onClearHistory,
}) {
  const hasActiveSession = Boolean(activeScenario && negotiation?.state);
  const engineState = negotiation?.state;
  const isDone = engineState?.status === "agreement" || engineState?.status === "deadlock";

  // Calculate live values for active negotiation panel
  const scenarioTitle = activeScenario
    ? (activeScenario.scenario_name || activeScenario.name)
    : "Vendor Pricing Negotiation";

  const agent1 = activeScenario?.agents?.[0] || {
    name: "Buyer",
    role: "Procurement Manager",
    personality: "Risk-Averse",
  };

  const agent2 = activeScenario?.agents?.[1] || {
    name: "Vendor",
    role: "Sales Representative",
    personality: "Aggressive",
  };

  // Find latest offer values from engine state or fallback to initial defaults
  const latestOffer = engineState?.current_offer?.value;
  const prevOffer = engineState?.previous_offer?.value;

  const agent1Offer = latestOffer ? `$${Math.round(latestOffer).toLocaleString()}` : "$48,000";
  const agent2Offer = prevOffer ? `$${Math.round(prevOffer).toLocaleString()}` : "$52,000";
  const currentRound = engineState?.current_round ?? 1;

  // Calculate dynamic activity timeline from actual history & current state
  const activityTimeline = [];
  if (hasActiveSession) {
    activityTimeline.push({
      title: `Session "${scenarioTitle}" ${isDone ? "Completed" : "Active"}`,
      detail: `Currently on Round ${currentRound} with status: ${engineState?.status?.replace("_", " ")}.`,
      time: "Just now",
      type: "live",
    });
  }

  history.slice(0, 4).forEach((session) => {
    activityTimeline.push({
      title: `Negotiation: ${session.scenario}`,
      detail: `Outcome: ${session.result} settled in ${session.rounds} rounds (${session.settlement || "N/A"}).`,
      time: session.date || "Recent",
      type: session.result === "Agreement" ? "success" : "warning",
    });
  });

  return (
    <main className="min-h-[calc(100vh-4rem)] flex-1 bg-bg px-4 py-8 sm:px-8 text-textPrimary animate-fadeIn">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* =====================================================
            DASHBOARD HEADER
        ====================================================== */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-6">

          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <span className="font-mono text-xs font-semibold uppercase tracking-widest text-emerald-400">
                EXECUTIVE DASHBOARD & REAL-TIME ENGINE
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-textPrimary font-sans">
              Negotiation Command Center
            </h1>

            <p className="mt-1 text-xs sm:text-sm text-textSecondary font-body">
              Live multi-agent execution telemetry, persistent audit log, and statistical convergence.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate("Configure Agents")}
              className="
                inline-flex items-center gap-2
                rounded-xl
                bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-600
                px-5
                py-2.5
                text-xs sm:text-sm
                font-semibold
                text-white
                shadow-glowSm
                transition-all
                duration-200
                hover:-translate-y-0.5
                hover:shadow-glow
                active:translate-y-0
              "
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Configure New Session
            </button>
          </div>

        </div>


        {/* =====================================================
            DYNAMIC METRIC STATS OVERVIEW (REAL CALCULATED METRICS)
        ====================================================== */}

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

          {/* Total Simulations */}
          <div className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card/90 p-5 backdrop-blur-md transition-all duration-200 hover:border-indigo-500/50 hover:shadow-cardHover">
            <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-indigo-500 to-blue-500" />
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-textMuted font-mono">
                Total Simulations
              </p>
              <span className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
              </span>
            </div>
            <p className="mt-3 text-3xl font-extrabold text-textPrimary font-mono">
              {stats.totalSimulations}
            </p>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400 font-medium font-mono">
              <span>{stats.agreementsCount} Deals Settled</span>
            </div>
          </div>


          {/* Agreement Rate */}
          <div className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card/90 p-5 backdrop-blur-md transition-all duration-200 hover:border-emerald-500/50 hover:shadow-cardHover">
            <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-400" />
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-textMuted font-mono">
                Agreement Rate
              </p>
              <span className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
              </span>
            </div>
            <p className="mt-3 text-3xl font-extrabold text-textPrimary font-mono">
              {stats.agreementRate}.0<span className="text-xl font-normal text-textMuted">%</span>
            </p>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400 font-medium font-mono">
              <span>Calculated from live runs</span>
            </div>
          </div>


          {/* Active Deadlocks */}
          <div className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card/90 p-5 backdrop-blur-md transition-all duration-200 hover:border-amber-500/50 hover:shadow-cardHover">
            <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-amber-500 to-orange-400" />
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-textMuted font-mono">
                Deadlocks Recorded
              </p>
              <span className="rounded-lg bg-amber-500/10 p-2 text-amber-400">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              </span>
            </div>
            <p className="mt-3 text-3xl font-extrabold text-textPrimary font-mono">
              {stats.deadlocksCount}
            </p>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-400 font-medium font-mono">
              <span>Constraint Gap Limit Reached</span>
            </div>
          </div>


          {/* Efficiency Metric */}
          <div className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card/90 p-5 backdrop-blur-md transition-all duration-200 hover:border-blue-500/50 hover:shadow-cardHover">
            <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-blue-500 to-cyan-400" />
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-textMuted font-mono">
                Avg Convergence
              </p>
              <span className="rounded-lg bg-blue-500/10 p-2 text-blue-400">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
              </span>
            </div>
            <p className="mt-3 text-3xl font-extrabold text-textPrimary font-mono">
              {stats.avgRounds} <span className="text-xs font-normal text-textMuted uppercase font-sans">rounds</span>
            </p>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-blue-400 font-medium font-mono">
              <span>Average turn velocity</span>
            </div>
          </div>

        </div>


        {/* =====================================================
            REAL ACTIVE NEGOTIATION / TELEMETRY HIGHLIGHT
        ====================================================== */}

        <div className="grid gap-6 lg:grid-cols-3">

          {/* Active Negotiation Highlight Panel */}
          <div className="rounded-2xl border border-border/80 bg-card/90 p-6 backdrop-blur-md lg:col-span-2 space-y-6">

            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${hasActiveSession ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
                  <p className="text-xs font-semibold font-mono uppercase tracking-wider text-indigo-400">
                    {hasActiveSession ? "LIVE SESSION HIGHLIGHT" : "ENGINE STATUS: READY"}
                  </p>
                </div>
                <h2 className="mt-1 text-xl font-bold text-textPrimary font-sans">
                  {scenarioTitle}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 font-mono text-xs font-semibold text-indigo-300">
                  {hasActiveSession ? `ROUND ${currentRound} / 10` : "READY TO LAUNCH"}
                </span>
                <button
                  type="button"
                  onClick={() => onNavigate(hasActiveSession ? "Negotiation Arena" : "Configure Agents")}
                  className="rounded-xl border border-indigo-500/40 bg-indigo-500/15 px-3.5 py-1.5 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/25 transition-all font-sans"
                >
                  {hasActiveSession ? "Open Arena →" : "Launch Session →"}
                </button>
              </div>
            </div>


            {/* Dual Agent Cards */}
            <div className="grid gap-4 sm:grid-cols-2">

              {/* Agent 1 Card */}
              <div className="rounded-xl border border-blue-500/30 bg-cardAlt/80 p-4 space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 rounded-bl-lg bg-blue-500/20 px-2.5 py-0.5 font-mono text-[10px] font-bold text-blue-400 uppercase">
                  AGENT A
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400 font-bold text-xs font-mono">
                    A1
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-textPrimary font-sans">{agent1.name}</p>
                    <p className="text-[11px] text-textMuted font-mono">{agent1.role} ({agent1.personality})</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-border/50">
                  <p className="text-xs text-textSecondary font-mono">Current Bid Position</p>
                  <p className="text-2xl font-extrabold text-blue-400 font-mono mt-0.5">{agent1Offer}</p>
                </div>
              </div>

              {/* Agent 2 Card */}
              <div className="rounded-xl border border-indigo-500/30 bg-cardAlt/80 p-4 space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 rounded-bl-lg bg-indigo-500/20 px-2.5 py-0.5 font-mono text-[10px] font-bold text-indigo-400 uppercase">
                  AGENT B
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 font-bold text-xs font-mono">
                    A2
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-textPrimary font-sans">{agent2.name}</p>
                    <p className="text-[11px] text-textMuted font-mono">{agent2.role} ({agent2.personality})</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-border/50">
                  <p className="text-xs text-textSecondary font-mono">Current Ask Position</p>
                  <p className="text-2xl font-extrabold text-indigo-400 font-mono mt-0.5">{agent2Offer}</p>
                </div>
              </div>

            </div>


            {/* Convergence Bar */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-textSecondary">Bid-Ask Convergence Progress</span>
                <span className="font-semibold text-emerald-400">
                  {hasActiveSession ? `Round ${currentRound} Active` : "Engine Standby"}
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-900 border border-border/60">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 shadow-glowSm transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(15, currentRound * 14))}%` }}
                />
              </div>
            </div>

          </div>


          {/* System Status & Architecture */}
          <div className="rounded-2xl border border-border/80 bg-card/90 p-6 backdrop-blur-md flex flex-col justify-between space-y-5">

            <div>
              <p className="text-xs font-semibold font-mono uppercase tracking-wider text-textMuted">
                Engine Telemetry
              </p>
              <h2 className="mt-1 text-xl font-bold text-textPrimary font-sans">
                Active Protocol
              </h2>

              <div className="mt-5 space-y-3.5">
                <div className="flex items-center justify-between text-xs rounded-xl border border-border/60 bg-cardAlt/50 p-3">
                  <span className="text-textSecondary font-medium">Orchestrator Mode</span>
                  <span className="font-mono font-semibold text-indigo-400">Turn-Based Rule Engine</span>
                </div>
                <div className="flex items-center justify-between text-xs rounded-xl border border-border/60 bg-cardAlt/50 p-3">
                  <span className="text-textSecondary font-medium">Evaluation Model</span>
                  <span className="font-mono font-semibold text-emerald-400">Utility Weighting</span>
                </div>
                <div className="flex items-center justify-between text-xs rounded-xl border border-border/60 bg-cardAlt/50 p-3">
                  <span className="text-textSecondary font-medium">History State</span>
                  <span className="font-mono font-semibold text-blue-400">{history.length} Runs Logged</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => onNavigate("Analytics")}
                className="w-full rounded-xl border border-border/80 bg-cardAlt px-4 py-2.5 text-xs font-semibold text-textPrimary hover:bg-white/[0.06] transition-all text-center font-sans"
              >
                View System Analytics →
              </button>

              {onClearHistory && (
                <button
                  type="button"
                  onClick={onClearHistory}
                  className="w-full text-center font-mono text-[10px] text-textMuted hover:text-rose-400 transition"
                >
                  Reset History Store
                </button>
              )}
            </div>

          </div>

        </div>


        {/* =====================================================
            REAL NEGOTIATION HISTORY LOG TABLE + TIMELINE
        ====================================================== */}

        <div className="grid gap-6 lg:grid-cols-3">

          {/* Table */}
          <div className="rounded-2xl border border-border/80 bg-card/90 p-6 backdrop-blur-md lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-textPrimary font-sans">
                  Real Session History Log
                </h3>
                <p className="text-xs text-textMuted mt-0.5">
                  Dynamic audit record of completed and active multi-agent negotiation runs.
                </p>
              </div>

              <button
                type="button"
                onClick={() => onNavigate("Reports")}
                className="text-xs font-semibold text-primary hover:text-primaryBright transition font-sans"
              >
                Full Audit Logs →
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-border/60">
              <table className="w-full text-left text-xs font-body">
                <thead className="border-b border-border/80 bg-slate-900/60 font-mono text-[11px] uppercase tracking-wider text-textMuted">
                  <tr>
                    <th className="px-4 py-3">Scenario</th>
                    <th className="px-4 py-3">Parties</th>
                    <th className="px-4 py-3">Rounds</th>
                    <th className="px-4 py-3">Outcome</th>
                    <th className="px-4 py-3">Settlement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {history.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3.5 font-semibold text-textPrimary">{item.scenario}</td>
                      <td className="px-4 py-3.5 text-textSecondary">{item.agents}</td>
                      <td className="px-4 py-3.5 font-mono text-textMuted">{item.rounds}</td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold ${
                          item.result === "Agreement"
                            ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                            : "bg-amber-500/10 border border-amber-500/30 text-amber-400"
                        }`}>
                          {item.result}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-mono font-semibold text-indigo-400">{item.settlement || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>


          {/* Activity Timeline */}
          <div className="rounded-2xl border border-border/80 bg-card/90 p-6 backdrop-blur-md space-y-4">
            <h3 className="text-lg font-bold text-textPrimary font-sans">
              Live System Activity Feed
            </h3>

            <div className="relative space-y-4 pl-4 border-l-2 border-border/80">
              {activityTimeline.map((act, idx) => (
                <div key={idx} className="relative space-y-1">
                  <div className={`absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-card ${
                    act.type === "live" ? "bg-emerald-400 animate-pulse" : "bg-indigo-500"
                  }`} />
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-textPrimary font-sans">{act.title}</p>
                    <span className="font-mono text-[10px] text-textMuted">{act.time}</span>
                  </div>
                  <p className="text-xs text-textSecondary leading-relaxed font-body">{act.detail}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </main>
  );
}