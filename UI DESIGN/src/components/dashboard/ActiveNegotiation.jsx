export default function ActiveNegotiation({ data }) {
  if (!data) {
    return (
      <div className="rounded-2xl border border-[#1d374d] bg-[#0b1d2d] p-6 text-center">
        <p className="text-xl font-bold text-white">No active negotiation</p>
        <button
          type="button"
          className="mt-4 rounded-xl border border-[#c4ff3a]/70 bg-[#c4ff3a] px-4 py-2 text-sm font-bold text-[#061018]"
        >
          Start New Negotiation
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#1d374d] bg-[#0b1d2d] p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7fa7c0]">Active Negotiation</p>
          <h3 className="mt-2 text-2xl font-black text-white">{data.scenario}</h3>
        </div>
        <div className="flex gap-2">
          <button className="rounded-xl border border-[#2a4d66] bg-[#112d3d] px-3 py-2 text-sm font-semibold text-[#dfeaf5]">Continue Negotiation</button>
          <button className="rounded-xl border border-[#c4ff3a]/70 bg-[#c4ff3a] px-3 py-2 text-sm font-bold text-[#061018]">View Arena</button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {data.agents.map((agent) => (
          <div key={agent.name} className="rounded-xl border border-[#1d374d] bg-[#0e2338] p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#7fa7c0]">{agent.name}</p>
            <p className="mt-2 text-lg font-bold text-white">{agent.personality}</p>
            <p className="mt-2 text-sm text-[#8ca6bb]">Current Position: {agent.position}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#7fa7c0]">Current Round</p>
          <p className="mt-2 text-xl font-bold text-white">{data.currentRound}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#7fa7c0]">Negotiation Status</p>
          <p className="mt-2 text-xl font-bold text-[#c4ff3a]">{data.status}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#7fa7c0]">Mode</p>
          <p className="mt-2 text-xl font-bold text-white">{data.mode}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#7fa7c0]">Agreement Probability</p>
          <p className="mt-2 text-xl font-bold text-white">{data.agreementProbability}%</p>
        </div>
      </div>
    </div>
  );
}
