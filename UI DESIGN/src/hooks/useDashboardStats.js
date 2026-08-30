import { activityTimeline, agentPerformance, dashboardStats, insights, quickActions, recentNegotiations, activeNegotiation } from "../data/dashboardData.js";

export function useDashboardStats() {
  return {
    stats: dashboardStats,
    activeNegotiation,
    recentNegotiations,
    agentPerformance,
    insights,
    quickActions,
    activityTimeline,
  };
}
