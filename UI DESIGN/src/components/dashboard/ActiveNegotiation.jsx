export default function ActiveNegotiation({ data }) {
  if (!data) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
        <p className="text-xl font-bold text-textPrimary">No active negotiation</p>
        <button
          type="button"
          className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500 px-4 py-2 text-sm font-bold text-white dark:text-slate-950 hover:bg-emerald-600 transition"
        >
          Start New Negotiation
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-textMuted">Active Negotiation</p>
          <h3 className="mt-2 text-2xl font-black text-textPrimary">{data.scenario}</h3>
        </div>
        <div className="flex gap-2">
          <button className="rounded-xl border border-border bg-cardAlt px-3 py-2 text-sm font-semibold text-textSecondary hover:text-textPrimary transition">Continue Negotiation</button>
          <button className="rounded-xl border border-emerald-500/30 bg-emerald-500 px-3 py-2 text-sm font-bold text-white dark:text-slate-950 hover:bg-emerald-600 transition">View Arena</button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {data.agents.map((agent) => (
          <div key={agent.name} className="rounded-xl border border-border bg-cardAlt p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-textMuted">{agent.name}</p>
            <p className="mt-2 text-lg font-bold text-textPrimary">{agent.personality}</p>
            <p className="mt-2 text-sm text-textSecondary">Current Position: {agent.position}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-textMuted">Current Round</p>
          <p className="mt-2 text-xl font-bold text-textPrimary">{data.currentRound}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-textMuted">Negotiation Status</p>
          <p className="mt-2 text-xl font-bold text-emerald-500 dark:text-emerald-400">{data.status}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-textMuted">Mode</p>
          <p className="mt-2 text-xl font-bold text-textPrimary">{data.mode}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-textMuted">Agreement Probability</p>
          <p className="mt-2 text-xl font-bold text-textPrimary">{data.agreementProbability}%</p>
        </div>
      </div>
    </div>
  );
}
