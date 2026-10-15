export default function AgentPerformanceCard({ agent }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-200">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-textMuted">{agent.name}</p>
          <p className="mt-2 text-xl font-black text-textPrimary">{agent.role}</p>
        </div>
        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-600 dark:text-emerald-400">
          {agent.personality}
        </span>
      </div>

      <div className="mt-5 space-y-3 text-sm text-textSecondary">
        <div className="flex items-center justify-between">
          <span className="text-textMuted">Total negotiations</span>
          <span className="font-semibold text-textPrimary">{agent.totalNegotiations}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-textMuted">Success rate</span>
          <span className="font-semibold text-textPrimary">{agent.successRate}%</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-textMuted">Average concession</span>
          <span className="font-semibold text-textPrimary">{agent.averageConcession}%</span>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-border bg-cardAlt px-3 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
        {agent.style}
      </div>

      <button className="mt-5 w-full rounded-xl border border-border bg-cardAlt hover:bg-border px-3 py-2 text-sm font-semibold text-textSecondary hover:text-textPrimary transition cursor-pointer">
        View Agent Details
      </button>
    </div>
  );
}
