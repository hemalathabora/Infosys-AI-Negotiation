import DashboardHeader from "../components/dashboard/DashboardHeader.jsx";
import StatsCard from "../components/dashboard/StatsCard.jsx";
import ActiveNegotiation from "../components/dashboard/ActiveNegotiation.jsx";
import RecentNegotiations from "../components/dashboard/RecentNegotiations.jsx";
import AgentPerformance from "../components/dashboard/AgentPerformance.jsx";
import NegotiationInsights from "../components/dashboard/NegotiationInsights.jsx";
import QuickActions from "../components/dashboard/QuickActions.jsx";
import ActivityTimeline from "../components/dashboard/ActivityTimeline.jsx";
import NegotiationStatusFlow from "../components/dashboard/NegotiationStatusFlow.jsx";
import { useDashboardStats } from "../hooks/useDashboardStats.js";

export default function Dashboard() {
  const { stats, activeNegotiation, recentNegotiations, agentPerformance, insights, quickActions, activityTimeline } = useDashboardStats();

  return (
    <main data-guide="dashboard-shell" className="flex-1 bg-[#04070D] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        <DashboardHeader mode="Simulation Mode" status="System Online" onNewNegotiation={() => {}} />

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatsCard title="Total Negotiations" value={stats.totalNegotiations} description="Across all simulation sessions" icon="activity" trend="+12% from previous week" />
          <StatsCard title="Agreements Reached" value={`${stats.agreements}/${stats.totalNegotiations}`} description="Successful outcomes this cycle" icon="check" trend="+8% this month" />
          <StatsCard title="Average Rounds" value={stats.averageRounds} description="Per negotiation cycle" icon="repeat" trend="-1.3 rounds" />
          <StatsCard title="Success Rate" value={`${stats.successRate}%`} description="Agreement success percentage" icon="trend" trend="Strong momentum" />
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_0.8fr]">
          <div className="space-y-6">
            <ActiveNegotiation data={activeNegotiation} />
            <RecentNegotiations rows={recentNegotiations} />
          </div>

          <div className="space-y-6">
            <NegotiationStatusFlow />
            <NegotiationInsights insights={insights} />
          </div>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div>
            <AgentPerformance agents={agentPerformance} />
          </div>
          <div>
            <QuickActions actions={quickActions} />
            <div className="mt-6">
              <ActivityTimeline items={activityTimeline} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
