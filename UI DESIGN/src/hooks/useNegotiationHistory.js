import { useState, useEffect, useCallback } from "react";

const INITIAL_HISTORY = [
  {
    id: "session-101",
    scenario: "Vendor Pricing Negotiation",
    scenario_id: "vendor_pricing",
    agents: "Buyer vs Vendor",
    rounds: 6,
    result: "Agreement",
    utility: "88%",
    settlement: "$48,500",
    date: "Today",
    timestamp: Date.now() - 1000 * 60 * 45,
  },
  {
    id: "session-102",
    scenario: "Job Offer Negotiation",
    scenario_id: "job_offer",
    agents: "Candidate vs Employer",
    rounds: 4,
    result: "Agreement",
    utility: "92%",
    settlement: "$102,000",
    date: "Yesterday",
    timestamp: Date.now() - 1000 * 60 * 60 * 24,
  },
  {
    id: "session-103",
    scenario: "Project Budget Allocation",
    scenario_id: "project_budget",
    agents: "Department Head vs Finance Director",
    rounds: 7,
    result: "Deadlock",
    utility: "45%",
    settlement: "N/A",
    date: "Aug 31",
    timestamp: Date.now() - 1000 * 60 * 60 * 48,
  },
  {
    id: "session-104",
    scenario: "Vendor Pricing Negotiation",
    scenario_id: "vendor_pricing",
    agents: "Buyer vs Vendor",
    rounds: 5,
    result: "Agreement",
    utility: "84%",
    settlement: "$46,200",
    date: "Aug 30",
    timestamp: Date.now() - 1000 * 60 * 60 * 72,
  },
];

const STORAGE_KEY = "negotiation_platform_history_v1";

export function useNegotiationHistory() {
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Could not load history from localStorage:", e);
    }
    return INITIAL_HISTORY;
  });

  // Save to localStorage whenever history changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.warn("Could not save history to localStorage:", e);
    }
  }, [history]);

  const addSession = useCallback((newSession) => {
    setHistory((prev) => {
      // Prevent duplicates if already recorded
      if (prev.some((item) => item.id === newSession.id)) {
        return prev;
      }
      return [newSession, ...prev];
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory(INITIAL_HISTORY);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn("Could not clear history:", e);
    }
  }, []);

  // Compute dynamic real-time stats
  const totalSimulations = history.length;
  const agreementsCount = history.filter((item) => item.result === "Agreement").length;
  const deadlocksCount = history.filter((item) => item.result === "Deadlock").length;

  const agreementRate = totalSimulations > 0
    ? Math.round((agreementsCount / totalSimulations) * 100)
    : 0;

  const totalRoundsSum = history.reduce((sum, item) => sum + (item.rounds || 0), 0);
  const avgRounds = totalSimulations > 0
    ? (totalRoundsSum / totalSimulations).toFixed(1)
    : "0.0";

  return {
    history,
    addSession,
    clearHistory,
    stats: {
      totalSimulations,
      agreementsCount,
      deadlocksCount,
      agreementRate,
      avgRounds,
    },
  };
}
