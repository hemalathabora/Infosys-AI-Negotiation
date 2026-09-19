import { useState, useEffect, useCallback } from "react";
import { fetchNegotiationsList } from "../services/api.js";

const STORAGE_KEY = "negotiation_platform_history_v1";

export function useNegotiationHistory(userId = null) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFromBackend = useCallback(async () => {
    setLoading(true);
    if (!userId) {
      setHistory([]);
      setLoading(false);
      return;
    }
    try {
      const dbList = await fetchNegotiationsList(userId);
      if (Array.isArray(dbList) && dbList.length > 0) {
        const formatted = dbList.map((item) => ({
          id: item.negotiation_id,
          scenario: item.scenario_name,
          scenario_id: item.scenario_id,
          agents: item.agents_summary,
          rounds: item.current_round,
          mode: (item.mode || "simulation").toUpperCase(),
          result: item.status === "accepted" || item.status === "agreement" || item.status === "completed" 
            ? "Agreement" 
            : item.status === "deadlock" || item.status === "rejected" || item.status === "breakdown" 
            ? "Deadlock" 
            : "In Progress",
          settlement: "N/A",
          date: item.created_at ? new Date(item.created_at).toLocaleDateString() : "Recent",
          timestamp: item.created_at ? new Date(item.created_at).getTime() : Date.now(),
        }));
        setHistory(formatted);
      } else {
        setHistory([]);
      }
    } catch (e) {
      console.warn("Could not fetch negotiation history from DB backend:", e);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadFromBackend();
  }, [loadFromBackend]);


  const addSession = useCallback((newSession) => {
    setHistory((prev) => {
      if (prev.some((item) => item.id === newSession.id)) {
        return prev;
      }
      return [newSession, ...prev];
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn("Could not clear history:", e);
    }
  }, []);

  // Compute dynamic real-time stats from database records
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
    loading,
    refreshHistory: loadFromBackend,
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

