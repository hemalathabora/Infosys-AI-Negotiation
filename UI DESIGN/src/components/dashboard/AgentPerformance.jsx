import AgentPerformanceCard from "./AgentPerformanceCard.jsx";

export default function AgentPerformance({ agents }) {
  return (
    <div className="rounded-2xl border border-[#1d374d] bg-[#0b1d2d] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-black text-white">Agent Performance</h3>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
        {agents.map((agent) => (
          <AgentPerformanceCard key={agent.name} agent={agent} />
        ))}
      </div>
    </div>
  );
}
