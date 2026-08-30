export default function NegotiationInsights({ insights }) {
  return (
    <div className="rounded-2xl border border-[#1d374d] bg-[#0b1d2d] p-5">
      <h3 className="text-xl font-black text-white">Negotiation Insights</h3>
      <div className="mt-5 space-y-4">
        <div className="rounded-xl border border-[#1d374d] bg-[#0d1d2e] p-3">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#7fa7c0]">Most Successful Strategy</p>
          <p className="mt-2 text-xl font-bold text-white">{insights.bestStrategy}</p>
        </div>
        <div className="rounded-xl border border-[#1d374d] bg-[#0d1d2e] p-3">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#7fa7c0]">Average Agreement Rate</p>
          <p className="mt-2 text-xl font-bold text-white">{insights.avgAgreementRate}%</p>
        </div>
        <div className="rounded-xl border border-[#1d374d] bg-[#0d1d2e] p-3">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#7fa7c0]">Average Rounds</p>
          <p className="mt-2 text-xl font-bold text-white">{insights.avgRounds}</p>
        </div>
        <div className="rounded-xl border border-[#1d374d] bg-[#0d1d2e] p-3">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#7fa7c0]">Most Active Scenario</p>
          <p className="mt-2 text-xl font-bold text-white">{insights.mostActiveScenario}</p>
        </div>
      </div>
    </div>
  );
}
