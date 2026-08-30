export default function AgentPerformanceCard({ agent }) {
  return (
    <div className="rounded-2xl border border-[#1d374d] bg-[#0b1d2d] p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#7fa7c0]">{agent.name}</p>
          <p className="mt-2 text-xl font-black text-white">{agent.role}</p>
        </div>
        <span className="rounded-full border border-[#2a4d66] bg-[#112d3d] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#c4ff3a]">
          {agent.personality}
        </span>
      </div>

      <div className="mt-5 space-y-3 text-sm text-[#dfeaf5]">
        <div className="flex items-center justify-between">
          <span className="text-[#8ca6bb]">Total negotiations</span>
          <span className="font-semibold text-white">{agent.totalNegotiations}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#8ca6bb]">Success rate</span>
          <span className="font-semibold text-white">{agent.successRate}%</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#8ca6bb]">Average concession</span>
          <span className="font-semibold text-white">{agent.averageConcession}%</span>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-[#1d374d] bg-[#0d1d2e] px-3 py-2 text-xs font-semibold text-[#c4ff3a]">
        {agent.style}
      </div>

      <button className="mt-5 w-full rounded-xl border border-[#2a4d66] bg-[#112d3d] px-3 py-2 text-sm font-semibold text-[#dfeaf5]">
        View Agent Details
      </button>
    </div>
  );
}
