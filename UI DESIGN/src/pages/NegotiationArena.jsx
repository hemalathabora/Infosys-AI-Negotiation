import NegotiationSessionPanel from "../components/NegotiationSessionPanel";

function AgentPanel({ agent, isTurn, side }) {
  const isLeft = side === "left";
  return (
    <div
      className={`relative h-full flex flex-col justify-between overflow-hidden rounded-2xl border p-6 transition-all duration-200 shadow-md ${
        isTurn
          ? "border-white bg-[#25242C] shadow-xl"
          : "border-[#2D2C36] bg-[#201F25]"
      }`}
    >
      <div className="space-y-4">
        {/* Header Badge & Turn Status */}
        <div className="flex items-center justify-between">
          <span className="rounded-xl border border-[#3A3944] bg-[#25242C] px-3 py-1 font-mono text-xs font-bold text-white tracking-wider">
            {isLeft ? "PARTY 01 (BUYER)" : "PARTY 02 (VENDOR)"}
          </span>

          {isTurn ? (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-xs font-bold text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              THINKING TURN
            </span>
          ) : (
            <span className="font-mono text-xs text-textMuted">STANDBY</span>
          )}
        </div>

        {/* Identity */}
        <div className="flex items-center gap-3.5 pt-1">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#3A3944] bg-[#25242C] text-white shadow-sm font-mono font-extrabold text-sm"
            aria-hidden="true"
          >
            {isLeft ? "P1" : "P2"}
          </div>
          <div>
            <h3 className="text-lg font-bold leading-tight text-white font-sans">{agent.name}</h3>
            <p className="text-xs text-textSecondary font-body">{agent.role}</p>
          </div>
        </div>

        <div className="h-px w-full bg-[#2B2A33]" />

        {/* Goal */}
        <div className="space-y-1.5">
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-textMuted">Strategic Goal</p>
          <p className="text-xs sm:text-sm font-semibold text-white font-sans">{agent.goal}</p>
        </div>
      </div>

      {/* Personality Badge at bottom */}
      <div className="space-y-3 pt-4 border-t border-[#2B2A33]">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-textMuted">Policy Mode</span>
          <span className="rounded-lg border border-[#3A3944] bg-[#1A191E] px-2.5 py-1 font-bold text-white">
            {agent.personality}
          </span>
        </div>
      </div>
    </div>
  );
}

function PhaseFlow({ status, round }) {
  const phases = [
    { label: "1. Positioning", desc: "Opening bids & bounds" },
    { label: "2. Concession Velocity", desc: "Interactive bargaining" },
    { label: "3. Convergence / Agreement", desc: "Settlement evaluation" },
  ];
  
  const current =
    status === "not_started"
      ? 0
      : status === "in_progress"
        ? round > 3
          ? 1
          : 0
        : 2;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
      {phases.map((phase, index) => {
        const isPassed = index < current;
        const isCurrent = index === current;

        return (
          <div
            key={phase.label}
            className={`flex items-center gap-3 rounded-2xl border p-4 transition-all ${
              isCurrent
                ? "border-white bg-[#25242C] text-white shadow-md font-bold"
                : isPassed
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                  : "border-[#2A2931] bg-[#1E1D24] text-slate-400"
            }`}
          >
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-xl font-black text-xs ${
                isCurrent
                  ? "bg-white text-slate-950"
                  : isPassed
                    ? "bg-emerald-400 text-slate-950"
                    : "bg-[#2A2933] text-slate-400"
              }`}
            >
              {isPassed ? "✓" : index + 1}
            </span>
            <div>
              <p className="font-bold uppercase font-sans">{phase.label}</p>
              <p className="text-[11px] opacity-80 font-body">{phase.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function NegotiationArena({
  scenario,
  negotiation,
  onNavigate,
}) {
  if (!scenario || !negotiation.state) {
    return (
      <main
        data-guide="negotiation-arena"
        className="min-h-full flex-1 bg-[#17161B] px-4 py-8 sm:px-8 text-textPrimary animate-fadeIn"
      >
        <div className="mx-auto max-w-4xl rounded-2xl border border-[#2D2C36] bg-[#201F25] p-10 text-center space-y-4 shadow-xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#3A3944] bg-[#25242C] text-white">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white font-sans">
            No Active Negotiation Session
          </h1>
          <p className="text-xs sm:text-sm text-textSecondary max-w-md mx-auto font-body">
            Configure agent rules, goals, and scenario parameters before launching the live simulation arena.
          </p>
          <button
            type="button"
            onClick={() => onNavigate("Configure Agents")}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-100 hover:bg-white text-slate-950 px-6 py-3 text-xs sm:text-sm font-extrabold border border-slate-200 shadow-md transition-all active:scale-95"
          >
            Configure Agents & Scenario →
          </button>
        </div>
      </main>
    );
  }

  const { state, isRunning, timeline, concessionTotals } = negotiation;
  const currentAgent = scenario.agents.find(
    (agent) => agent.id === state.current_agent_turn,
  );
  const isDone = state.status === "agreement" || state.status === "deadlock";

  return (
    <main
      data-guide="negotiation-arena"
      className="min-h-full flex-1 bg-[#17161B] px-4 py-6 sm:px-8 text-textPrimary animate-fadeIn"
    >
      <div className="mx-auto max-w-[1500px] space-y-8">

        {/* 1. SYMMETRICAL HEADER */}
        <header className="border-b border-[#292831] pb-6 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-xs font-mono font-semibold uppercase tracking-widest text-emerald-400">
                  LIVE SIMULATION ARENA
                </p>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
                {scenario.scenario_name || scenario.name}
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-textSecondary font-body">
                Real-time multi-agent turn iteration, rule evaluation, and bid convergence feed.
              </p>
            </div>

            <div className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-mono font-bold ${
              isDone
                ? "border-[#302F39] bg-[#222129] text-slate-400"
                : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-sm"
            }`}>
              <span className={isDone ? "h-2 w-2 rounded-full bg-slate-500" : "h-2 w-2 rounded-full bg-emerald-400 animate-pulse"} />
              {isDone ? "SESSION COMPLETE" : "SIMULATION ACTIVE"}
            </div>
          </div>
        </header>

        {/* 2. SYMMETRICAL PHASE FLOW STEPPER */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono font-bold uppercase tracking-wider text-textMuted">
              Execution Phase Timeline
            </p>
            <span className="font-mono text-xs font-bold text-white bg-[#222129] px-3 py-1 rounded-xl border border-[#302F39]">
              Round {state.current_round} of 8
            </span>
          </div>
          <PhaseFlow status={state.status} round={state.current_round} />
        </section>

        {/* 3. SYMMETRICAL OFFER TELEMETRY BANNER */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch font-mono">
          {/* Card 1: Round counter */}
          <div className="rounded-2xl border border-[#302F39] bg-[#222129] p-5 shadow-sm space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-textMuted">Round Index</p>
            <p className="text-2xl font-extrabold text-white">Round {state.current_round || 1}</p>
          </div>

          {/* Card 2: Current Offer (Primary Highlight) */}
          <div className="rounded-2xl border-2 border-white bg-[#25242C] p-5 shadow-lg space-y-1 text-center">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Current Offer Value</p>
            <p className="text-3xl font-extrabold text-white tracking-tight">
              {state.current_offer
                ? `$${Math.round(state.current_offer.value).toLocaleString()}`
                : "Pending Start"}
            </p>
          </div>

          {/* Card 3: Status */}
          <div className="rounded-2xl border border-[#302F39] bg-[#222129] p-5 shadow-sm space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-textMuted">Engine Status</p>
            <p className="text-lg font-bold text-white uppercase">{state.status.replace("_", " ")}</p>
          </div>
        </section>

        {/* 4. SYMMETRICAL AGENTS COMPARISON GRID (PARTY 01 & PARTY 02) */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <div className="h-full">
            <AgentPanel
              agent={scenario.agents[0]}
              isTurn={state.current_agent_turn === scenario.agents[0].id && !isDone}
              side="left"
            />
          </div>

          <div className="h-full">
            <AgentPanel
              agent={scenario.agents[1]}
              isTurn={state.current_agent_turn === scenario.agents[1].id && !isDone}
              side="right"
            />
          </div>
        </section>

        {/* 5. SYMMETRICAL SESSION CONTROL & TIMELINE PANEL */}
        <NegotiationSessionPanel
          scenario={scenario}
          state={state}
          isRunning={isRunning}
          timeline={timeline}
          concessionTotals={concessionTotals}
          onStep={negotiation.step}
          onRunToCompletion={negotiation.runToCompletion}
          onReset={() => {
            negotiation.reset();
            onNavigate("Configure Agents");
          }}
        />

        {isDone && (
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => onNavigate("Analytics")}
              className="rounded-xl border border-[#302F39] bg-[#222129] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#2A2933] transition"
            >
              View System Analytics
            </button>
            <button
              type="button"
              onClick={() => onNavigate("Reports")}
              className="rounded-xl bg-slate-100 hover:bg-white text-slate-950 px-5 py-2.5 text-xs font-bold border border-slate-200 shadow-md transition"
            >
              Open Full Audit Report →
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
