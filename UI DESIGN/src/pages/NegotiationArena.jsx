import NegotiationSessionPanel from "../components/NegotiationSessionPanel";

function AgentPanel({ agent, isTurn, side }) {
  return (
    <div
      className={`rounded-2xl border p-5 ${isTurn ? "border-[#4dd0ff] bg-[#0d2a3d] shadow-[0_0_24px_rgba(77,208,255,0.12)]" : "border-[#1d374d] bg-[#0b1b2a]"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-11 w-11 items-center justify-center rounded-xl border ${side === "left" ? "border-[#4dd0ff]/50 bg-[#10364b] text-[#4dd0ff]" : "border-[#c4ff3a]/50 bg-[#263b18] text-[#c4ff3a]"}`}
            aria-hidden="true"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle
                cx="12"
                cy="8"
                r="3.2"
                stroke="currentColor"
                strokeWidth="1.7"
              />
              <path
                d="M5 20a7 7 0 0114 0"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <div>
            <p className="text-lg font-extrabold text-white">{agent.name}</p>
            <p className="text-xs text-[#8ca6bb]">{agent.role}</p>
          </div>
        </div>
        {isTurn && (
          <span className="rounded-full border border-[#4dd0ff]/40 bg-[#4dd0ff]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#4dd0ff]">
            Thinking
          </span>
        )}
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-xs">
        <span className="text-[#8ca6bb]">Personality</span>
        <span className="font-semibold text-white">{agent.personality}</span>
      </div>
    </div>
  );
}

function PhaseFlow({ status, round }) {
  const phases = ["Opening positions", "Counteroffers", "Final decision"];
  const current =
    status === "not_started"
      ? 0
      : status === "in_progress"
        ? round > 2
          ? 1
          : 0
        : 2;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {phases.map((phase, index) => (
        <div key={phase} className="flex items-center gap-2">
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold ${index < current ? "border-[#c4ff3a] bg-[#c4ff3a] text-[#08100a]" : index === current ? "border-[#4dd0ff] bg-[#4dd0ff]/15 text-[#4dd0ff]" : "border-[#315168] text-[#66849a]"}`}
          >
            {index < current ? "✓" : index + 1}
          </span>
          <span
            className={`text-xs font-semibold ${index === current ? "text-white" : "text-[#66849a]"}`}
          >
            {phase}
          </span>
          {index < phases.length - 1 && (
            <span className="mx-1 h-px w-5 bg-[#315168]" />
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
        <div className="mx-auto max-w-5xl rounded-2xl border border-[#214a69] bg-[#0b1b2a] p-10 text-center">
          <h1 className="text-2xl font-black text-white">
            No live negotiation yet
          </h1>
          <p className="mt-2 text-sm text-[#8ca6bb]">
            Configure both agents before entering the arena.
          </p>
          <button
            type="button"
            onClick={() => onNavigate("Configure Agents")}
            className="mt-6 rounded-lg bg-[#4dd0ff] px-5 py-2.5 text-sm font-bold text-[#061018]"
          >
            Configure agents
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
      className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8"
    >
      <div className="mx-auto max-w-[1500px]">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#4dd0ff]">
              Live negotiation arena
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
              {scenario.scenario_name}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-[#8ca6bb]">
              Watch both agents evaluate goals, adjust their positions, and work
              toward a deal in real time.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[#c4ff3a]/30 bg-[#c4ff3a]/10 px-3 py-2 text-xs font-bold text-[#c4ff3a]">
            <span className="breathing-dot" />{" "}
            {isDone ? "SESSION ENDED" : "SESSION LIVE"}
          </div>
        </header>

        <section className="mb-5 rounded-2xl border border-[#214a69] bg-[#0b1b2a] p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#8ca6bb]">
                Negotiation phase
              </p>
              <p className="mt-1 text-sm font-bold text-white">
                {isDone
                  ? "Decision reached"
                  : currentAgent
                    ? `${currentAgent.name} is up next`
                    : "Preparing agents"}
              </p>
            </div>
            <span className="text-xs font-semibold text-[#8ca6bb]">
              Round {state.current_round} of 8
            </span>
          </div>
          <PhaseFlow status={state.status} round={state.current_round} />
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_220px_1fr]">
          <AgentPanel
            agent={scenario.agents[0]}
            isTurn={
              state.current_agent_turn === scenario.agents[0].id && !isDone
            }
            side="left"
          />
          <div className="flex flex-col items-center justify-center rounded-2xl border border-[#214a69] bg-[#08131f] p-5 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#66849a]">
              Current offer
            </p>
            <p className="mt-3 text-4xl font-black text-[#4dd0ff]">
              {state.current_offer
                ? `$${Math.round(state.current_offer.value).toLocaleString()}`
                : "--"}
            </p>
            <span className="mt-3 rounded-full border border-[#315168] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#8ca6bb]">
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
          <div className="mt-4 flex justify-end">
            <div className="flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => onNavigate("Analytics")}
                className="rounded-lg border border-[#4dd0ff]/40 px-5 py-3 text-sm font-extrabold text-[#4dd0ff]"
              >
                View analytics
              </button>
              <button
                type="button"
                onClick={() => onNavigate("Reports")}
                className="rounded-lg bg-[#4dd0ff] px-5 py-3 text-sm font-extrabold text-[#061018] shadow-[0_0_22px_rgba(77,208,255,0.18)] transition-transform hover:-translate-y-0.5"
              >
                Open full report
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
