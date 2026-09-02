// Designed by TEAM 4
import { activityTimeline, agentPerformance, dashboardStats, insights, quickActions, recentNegotiations, activeNegotiation } from "../data/dashboardData.js";

export function useDashboardStats() {
  return {
    stats: dashboardStats,
    activeNegotiation,
// Implemented by TEAM 4
    recentNegotiations,
    agentPerformance,
    insights,
    quickActions,
    activityTimeline,
  };
}
// Designed by TEAM 4
// Designed by TEAM 4

