function formatValue(value) {
  if (value === null || value === undefined) return "N/A";
  return `$${Math.round(value).toLocaleString()}`;
}

function Metric({ label, value, detail, accent = "cyan" }) {
  const color =
    accent === "lime"
      ? "text-[#c4ff3a]"
      : accent === "red"
        ? "text-[#ff8d8d]"
        : "text-[#4dd0ff]";
  return (
    <div className="rounded-2xl border border-[#1d374d] bg-[#0b1b2a] p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#66849a]">
        {label}
      </p>
      <p className={`mt-2 text-2xl font-black ${color}`}>{value}</p>
      <p className="mt-1 text-xs text-[#8ca6bb]">{detail}</p>
    </div>
  );
}

function OfferBar({ offer, maxValue, agent, index }) {
  const width = maxValue ? Math.max(8, (offer.value / maxValue) * 100) : 8;
  const isFirst = index === 0;
  return (
    <div className="grid grid-cols-[100px_1fr_92px] items-center gap-3 text-xs sm:grid-cols-[140px_1fr_110px]">
      <div className="truncate font-semibold text-white">
        R{offer.round} · {agent.name}
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#152d40]">
        <div
          className={`h-full rounded-full ${isFirst ? "bg-[#66849a]" : agent.id === "buyer" || agent.id === "candidate" ? "bg-[#4dd0ff]" : "bg-[#c4ff3a]"}`}
          style={{ width: `${width}%` }}
        />
      </div>
      <div className="text-right font-bold text-[#dfeaf5]">
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
        <div className="mx-auto max-w-5xl rounded-2xl border border-[#214a69] bg-[#0b1b2a] p-10 text-center">
          <h1 className="text-2xl font-black text-white">
            No negotiation data yet
          </h1>
          <p className="mt-2 text-sm text-[#8ca6bb]">
            Complete a negotiation to see its performance analytics.
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
      className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8"
    >
      <div className="mx-auto max-w-[1500px]">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#4dd0ff]">
              Negotiation analytics
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
              {scenario.scenario_name}
            </h1>
            <p className="mt-2 text-sm text-[#8ca6bb]">
              Complete performance analysis from every offer and decision in
              this session.
            </p>
          </div>
          <span
            className={`rounded-full border px-3 py-2 text-xs font-bold uppercase tracking-wider ${isAgreement ? "border-[#c4ff3a]/40 bg-[#c4ff3a]/10 text-[#c4ff3a]" : "border-[#ff8d8d]/40 bg-[#ff8d8d]/10 text-[#ff8d8d]"}`}
          >
            {isAgreement ? "Agreement reached" : "Deadlock"}
          </span>
        </header>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric
            label="Outcome"
            value={isAgreement ? "Agreement" : "Deadlock"}
            detail={
              isAgreement
                ? `Settled at ${formatValue(finalOffer)}`
                : "No mutually acceptable terms"
            }
            accent={isAgreement ? "lime" : "red"}
          />
          <Metric
            label="Rounds played"
            value={state.current_round}
            detail={`${state.history.length} offers exchanged`}
          />
          <Metric
            label="Opening position"
            value={formatValue(firstOffer)}
            detail="First anchor in the session"
          />
          <Metric
            label="Total movement"
            value={formatValue(totalMovement)}
            detail="Combined concession value"
            accent="lime"
          />
        </section>

        <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1.4fr_1fr]">
          <div className="rounded-2xl border border-[#214a69] bg-[#0b1b2a] p-5 sm:p-6">
            <div className="mb-5 flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#4dd0ff]">
                  Offer movement
                </p>
                <h2 className="mt-1 text-lg font-extrabold text-white">
                  Every position in sequence
                </h2>
              </div>
              <span className="text-xs text-[#8ca6bb]">
                Higher bars represent larger values
              </span>
            </div>
            <div className="space-y-4">
              {state.history.map((offer, index) => (
                <OfferBar
                  key={`${offer.agent_id}-${offer.round}-${index}`}
                  offer={offer}
                  maxValue={maxValue}
                  agent={
                    scenario.agents.find(
                      (item) => item.id === offer.agent_id,
                    ) ?? scenario.agents[0]
                  }
                  index={index}
                />
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[#214a69] bg-[#0b1b2a] p-5 sm:p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-[#4dd0ff]">
              Agent performance
            </p>
            <h2 className="mt-1 text-lg font-extrabold text-white">
              Concession breakdown
            </h2>
            <div className="mt-5 space-y-4">
              {scenario.agents.map((agent) => {
                const entries = timeline[agent.id] ?? [];
                const total = concessionTotals[agent.id] ?? 0;
                const share = totalMovement
                  ? Math.round((total / totalMovement) * 100)
                  : 0;
                return (
                  <div
                    key={agent.id}
                    className="border-b border-white/10 pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{agent.name}</span>
                      <span className="text-sm font-black text-[#4dd0ff]">
                        {formatValue(total)}
                      </span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-[#152d40]">
                      <div
                        className="h-full rounded-full bg-[#c4ff3a]"
                        style={{ width: `${share}%` }}
                      />
                    </div>
                    <div className="mt-2 flex justify-between text-xs text-[#8ca6bb]">
                      <span>{agent.personality}</span>
                      <span>
                        {entries.length} offers · {share}% of movement
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mt-5 rounded-2xl border border-[#214a69] bg-[#0b1b2a] p-5 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#4dd0ff]">
                Session transcript
              </p>
              <h2 className="mt-1 text-lg font-extrabold text-white">
                What happened, round by round
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("Negotiation Arena")}
              className="rounded-lg border border-[#4dd0ff]/40 px-3 py-2 text-xs font-bold text-[#4dd0ff]"
            >
              Back to arena
            </button>
          </div>
          <div className="space-y-3">
            {state.history.map((offer, index) => (
              <div
                key={`${offer.agent_id}-${offer.round}-detail`}
                className="flex gap-3 rounded-xl border border-[#1d374d] bg-[#091521] p-3"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#10364b] text-xs font-bold text-[#4dd0ff]">
                  {index + 1}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                    <span className="font-bold text-white">
                      {scenario.agents.find(
                        (agent) => agent.id === offer.agent_id,
                      )?.name ?? offer.agent_id}
                    </span>
                    <span className="text-[#66849a]">Round {offer.round}</span>
                    <span className="font-bold text-[#c4ff3a]">
                      {formatValue(offer.value)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-[#8ca6bb]">
                    {offer.reason}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
