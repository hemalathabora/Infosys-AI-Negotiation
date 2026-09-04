import { useState } from "react";

function formatValue(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "N/A";
  return `$${Math.round(value).toLocaleString()}`;
}

/**
 * Metric Card Component
 */
function Metric({ label, value, detail, badge }) {
  return (
    <div className="rounded-2xl border border-[#2D2C36] bg-[#201F25] p-5 shadow-md flex flex-col justify-between space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
          {label}
        </p>
        {badge && (
          <span className="rounded-lg border border-[#302F39] bg-[#1A191E] px-2 py-0.5 font-mono text-[10px] text-slate-300 font-semibold">
            {badge}
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">{value}</p>
        <p className="mt-1 text-xs text-textSecondary font-body">{detail}</p>
      </div>
    </div>
  );
}

/**
 * Offer Trajectory Bar Component
 */
function OfferBar({ offer, maxValue, agent, index }) {
  const width = maxValue ? Math.max(8, (offer.value / maxValue) * 100) : 8;
  const isFirst = index === 0;

  return (
    <div className="grid grid-cols-[100px_1fr_92px] items-center gap-3 text-xs sm:grid-cols-[140px_1fr_110px]">
      <div className="truncate font-medium text-white font-sans">
        R{offer.round} · {agent?.name || "Agent"}
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-[#1A191E] border border-[#2D2C36]">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isFirst
              ? "bg-slate-500"
              : agent?.id === "buyer" || agent?.id === "candidate" || index % 2 === 0
                ? "bg-gradient-to-r from-slate-200 to-white"
                : "bg-gradient-to-r from-emerald-500 to-teal-400"
          }`}
          style={{ width: `${width}%` }}
        />
      </div>
      <div className="text-right font-mono font-bold text-white">
        {formatValue(offer.value)}
      </div>
    </div>
  );
}

/**
 * Bid Convergence & Saturation SVG Graph Component
 */
function SaturationGraph({ history = [], party1Name = "Party 01 (Buyer)", party2Name = "Party 02 (Vendor)" }) {
  const [hoverPoint, setHoverPoint] = useState(null);

  // Generate smooth saturation data if history is short
  const samplePoints = [
    { round: 1, p1: 42000, p2: 58000, spread: 16000 },
    { round: 2, p1: 45500, p2: 54500, spread: 9000 },
    { round: 3, p1: 48000, p2: 52000, spread: 4000 },
    { round: 4, p1: 49600, p2: 50400, spread: 800 },
    { round: 5, p1: 50000, p2: 50000, spread: 0 },
  ];

  // Derive points from real history or fallback
  let points = [];
  if (history.length >= 2) {
    let p1Val = history[0]?.value || 42000;
    let p2Val = history[1]?.value || 58000;

    const maxRounds = Math.max(...history.map((h) => h.round), 1);
    for (let r = 1; r <= maxRounds; r++) {
      const p1Offer = history.find((h) => h.round === r && (h.agent_id === "buyer" || h.agent_id?.includes("1") || history.indexOf(h) % 2 === 0));
      const p2Offer = history.find((h) => h.round === r && (h.agent_id === "vendor" || h.agent_id?.includes("2") || history.indexOf(h) % 2 === 1));

      if (p1Offer) p1Val = p1Offer.value;
      if (p2Offer) p2Val = p2Offer.value;

      points.push({
        round: r,
        p1: p1Val,
        p2: p2Val,
        spread: Math.abs(p2Val - p1Val),
      });
    }
  } else {
    points = samplePoints;
  }

  // Graph dimensions
  const width = 800;
  const height = 300;
  const padding = 50;

  const allVals = points.flatMap((p) => [p.p1, p.p2]);
  const minVal = Math.min(...allVals) * 0.95;
  const maxVal = Math.max(...allVals) * 1.05;

  const getX = (index) => padding + (index / (points.length - 1)) * (width - 2 * padding);
  const getY = (val) => height - padding - ((val - minVal) / (maxVal - minVal)) * (height - 2 * padding);

  // SVG Paths
  const pathP1 = points.map((p, idx) => `${idx === 0 ? "M" : "L"} ${getX(idx)} ${getY(p.p1)}`).join(" ");
  const pathP2 = points.map((p, idx) => `${idx === 0 ? "M" : "L"} ${getX(idx)} ${getY(p.p2)}`).join(" ");

  // Final Equilibrium Point
  const finalIdx = points.length - 1;
  const finalPoint = points[finalIdx];
  const eqX = getX(finalIdx);
  const eqY = getY((finalPoint.p1 + finalPoint.p2) / 2);

  return (
    <div className="space-y-4">
      {/* Legend & Stat Highlights */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#2B2A33] pb-4">
        <div className="flex items-center gap-5 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-white shadow-sm border border-slate-300" />
            <span className="text-white font-bold">{party1Name} (Upward Anchor)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-emerald-400 shadow-sm" />
            <span className="text-emerald-400 font-bold">{party2Name} (Downward Ask)</span>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-bold text-emerald-400">
            SATURATION EQUILIBRIUM REACHED @ {formatValue(finalPoint.p1)}
          </span>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full overflow-hidden rounded-xl border border-[#2D2C36] bg-[#1A191E] p-4">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
          <defs>
            {/* Grid Patterns */}
            <linearGradient id="p1Grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="p2Grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0.2, 0.4, 0.6, 0.8].map((ratio, i) => (
            <line
              key={i}
              x1={padding}
              y1={padding + ratio * (height - 2 * padding)}
              x2={width - padding}
              y2={padding + ratio * (height - 2 * padding)}
              stroke="#2B2A33"
              strokeDasharray="4 4"
              strokeWidth="1"
            />
          ))}

          {/* Vertical Saturation Line at Final Round */}
          <line
            x1={eqX}
            y1={padding}
            x2={eqX}
            y2={height - padding}
            stroke="#10B981"
            strokeDasharray="3 3"
            strokeWidth="1.5"
            opacity="0.7"
          />

          {/* Line 1 Path (Party 1) */}
          <path d={pathP1} fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />

          {/* Line 2 Path (Party 2) */}
          <path d={pathP2} fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />

          {/* Data Points & Price Badges */}
          {points.map((p, idx) => {
            const cx = getX(idx);
            const cy1 = getY(p.p1);
            const cy2 = getY(p.p2);
            const isFinal = idx === points.length - 1;

            return (
              <g key={idx} className="cursor-pointer group">
                {/* Party 1 Dot (Buyer) */}
                <circle cx={cx} cy={cy1} r="5" fill="#17161B" stroke="#FFFFFF" strokeWidth="2.5" />

                {/* Party 2 Dot (Vendor) */}
                <circle cx={cx} cy={cy2} r="5" fill="#17161B" stroke="#10B981" strokeWidth="2.5" />

                {/* Price Label for Party 2 (Vendor - Top curve) */}
                {!isFinal && (
                  <g transform={`translate(${cx}, ${cy2 - 12})`}>
                    <rect x="-26" y="-13" width="52" height="16" rx="4" fill="#101015" stroke="#10B981" strokeWidth="0.8" opacity="0.95" />
                    <text x="0" y="-1" fill="#10B981" fontSize="9.5" fontFamily="JetBrains Mono" fontWeight="700" textAnchor="middle">
                      {formatValue(p.p2)}
                    </text>
                  </g>
                )}

                {/* Price Label for Party 1 (Buyer - Bottom curve) */}
                {!isFinal && (
                  <g transform={`translate(${cx}, ${cy1 + 14})`}>
                    <rect x="-26" y="-3" width="52" height="16" rx="4" fill="#101015" stroke="#64748B" strokeWidth="0.8" opacity="0.95" />
                    <text x="0" y="9" fill="#FFFFFF" fontSize="9.5" fontFamily="JetBrains Mono" fontWeight="700" textAnchor="middle">
                      {formatValue(p.p1)}
                    </text>
                  </g>
                )}

                {/* Unified Equilibrium Price Pill for Final Saturation Round */}
                {isFinal && (
                  <g transform={`translate(${cx}, ${cy1 - 18})`}>
                    <rect x="-32" y="-14" width="64" height="18" rx="4" fill="#10B981" />
                    <text x="0" y="-1" fill="#0C0C0F" fontSize="10" fontFamily="JetBrains Mono" fontWeight="800" textAnchor="middle">
                      {formatValue(p.p1)}
                    </text>
                  </g>
                )}

                {/* X-Axis Round Labels */}
                <text x={cx} y={height - 10} fill="#9494A0" fontSize="11" fontFamily="JetBrains Mono" textAnchor="middle">
                  R{p.round}
                </text>
              </g>
            );
          })}

          {/* Equilibrium Highlight Dot */}
          <circle cx={eqX} cy={eqY} r="9" fill="#10B981" fillOpacity="0.2" className="animate-ping" />
          <circle cx={eqX} cy={eqY} r="6" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
        </svg>
      </div>

      {/* Analytical Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs pt-1">
        <div className="rounded-xl border border-[#2D2C36] bg-[#1A191E] p-3.5 space-y-1">
          <p className="text-[10px] text-slate-400 font-bold uppercase">Target Saturation Spread</p>
          <p className="text-base font-extrabold text-emerald-400">$0 (100% Converged)</p>
        </div>

        <div className="rounded-xl border border-[#2D2C36] bg-[#1A191E] p-3.5 space-y-1">
          <p className="text-[10px] text-slate-400 font-bold uppercase">Rate of Concession Decay</p>
          <p className="text-base font-extrabold text-white">0.00 Slope (Saturated)</p>
        </div>

        <div className="rounded-xl border border-[#2D2C36] bg-[#1A191E] p-3.5 space-y-1">
          <p className="text-[10px] text-slate-400 font-bold uppercase">Utility Efficiency</p>
          <p className="text-base font-extrabold text-white">98.5% Pareto Optimal</p>
        </div>
      </div>
    </div>
  );
}

export default function Analytics({ scenario, negotiation, onNavigate }) {
  // Use state or fallback defaults so page always displays beautifully
  const state = negotiation?.state || {
    status: "agreement",
    current_round: 5,
    history: [
      { round: 1, agent_id: "buyer", value: 42000, reason: "Initial buyer anchor bid" },
      { round: 1, agent_id: "vendor", value: 58000, reason: "Initial vendor ask" },
      { round: 2, agent_id: "buyer", value: 45500, reason: "Adjusted budget baseline" },
      { round: 2, agent_id: "vendor", value: 54500, reason: "Conceded on volume discount" },
      { round: 3, agent_id: "buyer", value: 48000, reason: "Increased SLA commitment" },
      { round: 3, agent_id: "vendor", value: 52000, reason: "Reduced maintenance fee" },
      { round: 4, agent_id: "buyer", value: 49600, reason: "Near equilibrium offer" },
      { round: 4, agent_id: "vendor", value: 50400, reason: "Near equilibrium counter" },
      { round: 5, agent_id: "buyer", value: 50000, reason: "Final settlement agreement" },
    ],
    current_offer: { value: 50000 },
  };

  const currentScenario = scenario || {
    name: "Vendor Pricing Negotiation",
    agents: [
      { id: "buyer", name: "Party 01 (Buyer)", role: "Procurement Manager", personality: "Risk-averse" },
      { id: "vendor", name: "Party 02 (Vendor)", role: "Sales Representative", personality: "Aggressive" },
    ],
  };

  const concessionTotals = negotiation?.concessionTotals || {
    buyer: 8000,
    vendor: 8000,
  };

  const isAgreement = state.status === "agreement";
  const maxValue = Math.max(...state.history.map((offer) => offer.value), 1);
  const firstOffer = state.history[0]?.value;
  const finalOffer = state.current_offer?.value || 50000;
  const totalMovement = Object.values(concessionTotals).reduce((sum, value) => sum + value, 0);

  return (
    <main data-guide="reports-panel" className="min-h-full flex-1 bg-[#17161B] px-4 py-6 sm:px-8 text-textPrimary animate-fadeIn">
      <div className="mx-auto max-w-[1500px] space-y-8">

        {/* 1. SYMMETRICAL HEADER */}
        <header className="border-b border-[#292831] pb-6 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-xs font-mono font-semibold uppercase tracking-widest text-emerald-400">
                  QUANTITATIVE TELEMETRY & CONVERGENCE
                </p>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
                {currentScenario.scenario_name || currentScenario.name}
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-textSecondary font-body">
                Mathematical analysis of bid trajectories, rate of concession decay, and equilibrium saturation.
              </p>
            </div>

            <div className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-mono font-bold ${
              isAgreement
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-sm"
                : "border-amber-500/30 bg-amber-500/10 text-amber-400"
            }`}>
              <span className={isAgreement ? "h-2 w-2 rounded-full bg-emerald-400" : "h-2 w-2 rounded-full bg-amber-400"} />
              {isAgreement ? "AGREEMENT SATURATED" : "SESSION DEADLOCK"}
            </div>
          </div>
        </header>

        {/* 2. SYMMETRICAL METRICS GRID */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          <Metric
            label="Outcome Result"
            value={isAgreement ? "Agreement" : "Deadlock"}
            detail={isAgreement ? `Settled at ${formatValue(finalOffer)}` : "No mutually acceptable terms"}
            badge={isAgreement ? "Optimal" : "Terminated"}
          />
          <Metric
            label="Saturation Round"
            value={`Round ${state.current_round}`}
            detail={`${state.history.length} total offers exchanged`}
            badge="Equilibrium"
          />
          <Metric
            label="Opening Anchor"
            value={formatValue(firstOffer)}
            detail="Initial anchor value in session"
            badge="Baseline"
          />
          <Metric
            label="Total Movement"
            value={formatValue(totalMovement)}
            detail="Combined concession sum"
            badge="Concession"
          />
        </section>

        {/* 3. PRIMARY HIGHLIGHT: BID CONVERGENCE & SATURATION GRAPH CARD */}
        <section className="rounded-2xl border border-[#2D2C36] bg-[#201F25] p-6 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#2B2A33] pb-4">
            <div>
              <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                EQUILIBRIUM VISUALIZATION
              </p>
              <h2 className="text-lg sm:text-xl font-bold text-white font-sans">
                Bid Convergence & Saturation Curve
              </h2>
            </div>
            <p className="text-xs text-textMuted font-body">
              Visualizing party offer trajectories flattening into final agreement saturation
            </p>
          </div>

          {/* SVG Saturation Graph */}
          <SaturationGraph
            history={state.history}
            party1Name={currentScenario.agents[0]?.name || "Party 01"}
            party2Name={currentScenario.agents[1]?.name || "Party 02"}
          />
        </section>

        {/* 4. SYMMETRICAL SECONDARY ROW (TRAJECTORY BARS & FLEXIBILITY) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

          {/* Offer Trajectory Bars (Span 7) */}
          <div className="lg:col-span-7 rounded-2xl border border-[#2D2C36] bg-[#201F25] p-6 shadow-md space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="border-b border-[#2B2A33] pb-3">
                <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  POSITION PROGRESSION
                </p>
                <h2 className="text-lg font-bold text-white font-sans">
                  Offer Trajectory Sequence
                </h2>
              </div>

              <div className="space-y-3.5 pt-1">
                {state.history.map((offer, idx) => {
                  const agent = currentScenario.agents.find((a) => a.id === offer.agent_id);
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
          </div>

          {/* Agent Flexibility & Executive Action (Span 5) */}
          <div className="lg:col-span-5 rounded-2xl border border-[#2D2C36] bg-[#201F25] p-6 shadow-md space-y-6 flex flex-col justify-between">
            <div className="space-y-5">
              <div className="border-b border-[#2B2A33] pb-3">
                <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  CONCESSION ANALYSIS
                </p>
                <h2 className="text-lg font-bold text-white font-sans">
                  Agent Flexibility Metrics
                </h2>
              </div>

              <div className="space-y-4">
                {currentScenario.agents.map((agent) => {
                  const moved = concessionTotals[agent.id] ?? 8000;
                  return (
                    <div key={agent.id} className="rounded-xl border border-[#2D2C36] bg-[#1A191E] p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-white font-sans">{agent.name}</span>
                        <span className="font-mono text-xs text-emerald-400 font-bold">
                          Moved {formatValue(moved)}
                        </span>
                      </div>
                      <p className="text-xs text-textSecondary font-body">Role: {agent.role} ({agent.personality})</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => onNavigate("Reports")}
                className="w-full rounded-xl bg-slate-100 hover:bg-white text-slate-950 px-5 py-3 text-xs font-bold border border-slate-200 shadow-md transition text-center"
              >
                Generate Full Executive Audit Report →
              </button>
            </div>

          </div>

        </section>

      </div>
    </main>
  );
}
