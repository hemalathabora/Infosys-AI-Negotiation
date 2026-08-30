const resultStyles = {
  Agreement: "bg-[#0d2d28] text-[#9af0c4] border border-[#1d4d48]",
  "In Progress": "bg-[#102534] text-[#bfe7ff] border border-[#204a67]",
  Deadlock: "bg-[#2d1a10] text-[#f6c26b] border border-[#4d3020]",
};

export default function RecentNegotiations({ rows }) {
  return (
    <div className="rounded-2xl border border-[#1d374d] bg-[#0b1d2d] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-black text-white">Recent Negotiations</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b border-[#1d374d] text-[11px] uppercase tracking-[0.18em] text-[#7fa7c0]">
              <th className="pb-3 pr-4 font-semibold">Scenario</th>
              <th className="pb-3 pr-4 font-semibold">Agents</th>
              <th className="pb-3 pr-4 font-semibold">Mode</th>
              <th className="pb-3 pr-4 font-semibold">Rounds</th>
              <th className="pb-3 pr-4 font-semibold">Result</th>
              <th className="pb-3 pr-4 font-semibold">Date</th>
              <th className="pb-3 pr-4 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.scenario}-${row.date}-${row.rounds}`} className="border-b border-[#112d3d] text-sm text-[#dfeaf5]">
                <td className="py-3 pr-4 font-medium text-white">{row.scenario}</td>
                <td className="py-3 pr-4">{row.agents}</td>
                <td className="py-3 pr-4">{row.mode}</td>
                <td className="py-3 pr-4">{row.rounds}</td>
                <td className="py-3 pr-4">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${resultStyles[row.result] || resultStyles["In Progress"]}`}>
                    {row.result}
                  </span>
                </td>
                <td className="py-3 pr-4 text-[#8ca6bb]">{row.date}</td>
                <td className="py-3 pr-4">
                  <button className="text-[#c4ff3a] hover:text-[#dcff7b]">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
