import NegotiationSessionPanel from "../components/NegotiationSessionPanel";

function AgentPanel({ agent, isTurn, side }) {
  const isLeft = side === "left";
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-5 transition-all duration-200 backdrop-blur-md ${
        isTurn
          ? isLeft
            ? "border-azure/60 bg-card/95 shadow-glowSm ring-1 ring-azure/30"
            : "border-indigo-500/60 bg-card/95 shadow-glowSm ring-1 ring-indigo-500/30"
          : "border-border/80 bg-card/70"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-11 w-11 items-center justify-center rounded-xl font-bold font-mono text-sm shadow-sm ${
              isLeft
                ? "bg-gradient-to-br from-blue-600 to-azure text-white"
                : "bg-gradient-to-br from-indigo-600 to-indigo-500 text-white"
            }`}
            aria-hidden="true"
          >
            {isLeft ? "BA" : "VA"}
          </span>
          <div>
            <p className="text-base font-bold text-textPrimary font-sans">{agent.name}</p>
            <p className="text-xs text-textMuted font-mono">{agent.role}</p>
          </div>
        </div>

        {isTurn && (
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider ${
            isLeft ? "border-azure/40 bg-azure/10 text-azureBright" : "border-indigo-500/40 bg-indigo-500/10 text-indigo-300"
          }`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
            Thinking...
          </span>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-4 text-xs font-body">
        <span className="text-textMuted font-mono">Strategy Preset</span>
        <span className="font-semibold text-textPrimary">{agent.personality}</span>
      </div>
    </div>
  );
}

function PhaseFlow({ status, round }) {
  const phases = ["Positioning", "Bargaining & Concessions", "Final Agreement"];
  const current =
    status === "not_started"
      ? 0
      : status === "in_progress"
        ? round > 3
          ? 1
          : 0
        : 2;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {phases.map((phase, index) => (
        <div key={phase} className="flex items-center gap-2">
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold font-mono ${
              index < current
                ? "bg-emerald-500 text-slate-950 font-extrabold"
                : index === current
                  ? "bg-indigo-600 text-white shadow-glowSm"
                  : "border border-border/80 bg-cardAlt text-textMuted"
            }`}
          >
            {index < current ? "✓" : index + 1}
          </span>
          <span
            className={`text-xs font-semibold ${
              index === current ? "text-textPrimary" : "text-textMuted"
            }`}
          >
            {phase}
          </span>
          {index < phases.length - 1 && (
            <span className="mx-1 h-px w-6 bg-border/80" />
          )}
        </div>
      ))}
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
        className="flex-1 px-4 py-8 sm:px-6 lg:px-10"
      >
        <div className="mx-auto max-w-5xl rounded-2xl border border-border/80 bg-card p-10 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          </div>
          <h1 className="text-2xl font-bold text-textPrimary font-sans">
            No Active Negotiation Session
          </h1>
          <p className="text-sm text-textSecondary max-w-md mx-auto">
            Configure agent rules, goals, and scenario settings before launching the simulation arena.
          </p>
          <button
            type="button"
            onClick={() => onNavigate("Configure Agents")}
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-azure px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-glowSm transition-all hover:shadow-glow"
          >
            Configure Agents & Scenario
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
      className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8 animate-fadeIn"
    >
      <div className="mx-auto max-w-7xl space-y-6">

        {/* HEADER */}
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border/60 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
              <p className="text-xs font-mono font-semibold uppercase tracking-widest text-indigo-400">
                LIVE SIMULATION ARENA
              </p>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-textPrimary font-sans">
              {scenario.scenario_name || scenario.name}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-textSecondary font-body">
              Multi-agent turn iteration, constraint satisfaction, and bid convergence feed.
            </p>
          </div>

          <div className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-mono font-semibold ${
            isDone
              ? "border-border bg-cardAlt text-textMuted"
              : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-successGlow"
          }`}>
            <span className={isDone ? "h-2 w-2 rounded-full bg-slate-500" : "breathing-dot"} />
            {isDone ? "SESSION COMPLETE" : "SIMULATION ACTIVE"}
          </div>
        </header>


        {/* PHASE BAR */}
        <section className="rounded-2xl border border-border/80 bg-card/90 p-4 sm:p-5 backdrop-blur-md">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-textMuted">
                Negotiation Progress
              </p>
              <p className="mt-0.5 text-sm font-semibold text-textPrimary font-sans">
                {isDone
                  ? "Decision reached"
                  : currentAgent
                    ? `${currentAgent.name}'s Turn`
                    : "Initializing agents..."}
              </p>
            </div>
            <span className="font-mono text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              Round {state.current_round} of 8
            </span>
          </div>
          <PhaseFlow status={state.status} round={state.current_round} />
        </section>


        {/* AGENTS COMPARISON GRID */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_240px_1fr]">
          <AgentPanel
            agent={scenario.agents[0]}
            isTurn={
              state.current_agent_turn === scenario.agents[0].id && !isDone
            }
            side="left"
          />

          {/* Offer Badge in center */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border/80 bg-card/90 p-5 text-center shadow-card backdrop-blur-md">
            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-textMuted">
              Current Offer Value
            </p>
            <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-indigo-400 font-mono tracking-tight">
              {state.current_offer
                ? `$${Math.round(state.current_offer.value).toLocaleString()}`
                : "—"}
            </p>
            <span className={`mt-3 rounded-full border px-3 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${
              state.status === "agreement"
                ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-400"
                : state.status === "deadlock"
                  ? "border-amber-500/40 bg-amber-500/15 text-amber-400"
                  : "border-border bg-cardAlt text-textSecondary"
            }`}>
              {state.status.replace("_", " ")}
            </span>
          </div>

          <AgentPanel
            agent={scenario.agents[1]}
            isTurn={
              state.current_agent_turn === scenario.agents[1].id && !isDone
            }
            side="right"
          />
        </section>


        {/* SESSION PANEL */}
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
          <div className="mt-4 flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => onNavigate("Analytics")}
              className="rounded-xl border border-indigo-500/40 bg-indigo-500/10 px-5 py-2.5 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/20 transition-all font-sans"
            >
              View Analytics
            </button>
            <button
              type="button"
              onClick={() => onNavigate("Reports")}
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-azure px-5 py-2.5 text-xs font-semibold text-white shadow-glowSm hover:shadow-glow transition-all font-sans"
            >
              Open Full Report →
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
