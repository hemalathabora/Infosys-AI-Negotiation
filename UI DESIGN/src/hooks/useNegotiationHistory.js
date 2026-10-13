import { useState, useEffect, useCallback } from "react";
import { fetchNegotiationsList, recordNegotiationSession } from "../services/api.js";

const STORAGE_KEY = "negotiation_platform_history_v1";

function readLocalHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn("Could not read local history cache:", e);
  }
  return [];
}

function writeLocalHistory(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn("Could not write local history cache:", e);
  }
}

export function useNegotiationHistory(userId = null) {
  const [history, setHistory] = useState(() => readLocalHistory());
  const [loading, setLoading] = useState(false);

  const loadFromBackend = useCallback(async () => {
    setLoading(true);
    const localItems = readLocalHistory();

    try {
      const dbList = await fetchNegotiationsList(userId);
      if (Array.isArray(dbList) && dbList.length > 0) {
        const backendFormatted = dbList.map((item) => ({
          id: item.negotiation_id,
          scenario: item.scenario_name,
          scenario_id: item.scenario_id,
          agents: item.agents_summary,
          rounds: item.current_round,
          mode: (item.mode || "simulation").toUpperCase(),
          result:
            item.status === "accepted" || item.status === "agreement" || item.status === "completed"
              ? "Agreement"
              : item.status === "deadlock" || item.status === "rejected" || item.status === "breakdown"
              ? "Deadlock"
              : "In Progress",
          settlement: "N/A",
          date: item.created_at ? new Date(item.created_at).toLocaleDateString() : "Recent",
          timestamp: item.created_at ? new Date(item.created_at).getTime() : Date.now(),
        }));

        // Merge: prioritize backend records, but preserve any local sessions not yet in backend
        const existingIds = new Set(backendFormatted.map((b) => b.id));
        const unsyncedLocals = localItems.filter((loc) => !existingIds.has(loc.id));
        const merged = [...unsyncedLocals, ...backendFormatted];

        setHistory(merged);
        writeLocalHistory(merged);
      } else {
        // Backend returned empty or no user - retain local items
        setHistory(localItems);
      }
    } catch (e) {
      console.warn("Could not fetch negotiation history from DB backend:", e);
      // Preserve local history on backend errors
      setHistory(localItems);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadFromBackend();
  }, [loadFromBackend]);

  const addSession = useCallback((newSession) => {
    setHistory((prev) => {
      const exists = prev.some((item) => item.id === newSession.id);
      const updated = exists ? prev.map((item) => (item.id === newSession.id ? newSession : item)) : [newSession, ...prev];
      writeLocalHistory(updated);
      return updated;
    });

    // Also persist asynchronously to backend database
    recordNegotiationSession(newSession).catch((err) => {
      console.warn("Background persistence to backend failed:", err);
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

  // Compute dynamic real-time stats from records
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
