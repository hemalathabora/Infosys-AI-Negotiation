import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import {
  fetchNegotiationHistory,
  fetchNegotiationDetail,
  downloadNegotiationExport,
  downloadAllNegotiationHistory
} from "../services/api.js";
import NegoMindLogo from "../components/NegoMindLogo";

function outcomeBadgeClass(outcome) {
  const o = String(outcome || "").toLowerCase();
  if (o === "agreement" || o === "accepted" || o === "completed") {
    return "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
  }
  if (o === "deadlock" || o === "breakdown" || o === "rejected") {
    return "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-400";
  }
  return "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400";
}

function modeBadgeClass(mode) {
  const m = String(mode || "").toLowerCase();
  if (m === "practice") {
    return "border-indigo-500/40 bg-indigo-500/10 text-indigo-700 dark:text-indigo-400";
  }
  return "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-400";
}

function decisionBadgeClass(decision) {
  const d = String(decision || "").toUpperCase();
  if (d === "ACCEPT" || d === "AGREEMENT") {
    return "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
  }
  if (d === "REJECT") {
    return "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-400";
  }
  return "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300";
}

const STORAGE_KEY = "negotiation_platform_history_v1";

function readLocalSessions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn("Could not read local sessions:", e);
  }
  return [];
}

function convertLocalToHistoryItem(s) {
  const isAgreed = s.result === "Agreement" || s.status === "accepted" || s.status === "agreement";
  const numPrice = Number(s.final_price ?? (s.current_offer ? s.current_offer.price ?? s.current_offer.value : null));
  return {
    negotiation_id: s.id || s.negotiation_id,
    scenario_id: s.scenario_id || "scenario",
    scenario_name: s.scenario || s.scenario_name || "Negotiation Scenario",
    mode: s.mode || "simulation",
    reasoning_mode: "Normal Mode",
    status: s.status || (isAgreed ? "accepted" : "deadlock"),
    current_round: s.rounds || s.current_round || 1,
    max_rounds: s.max_rounds || 5,
    participant_roles: (s.participating_agents || []).map((a) => a.role || a.name || "Agent"),
    agents_summary: s.agents || "Agents",
    final_agreed_terms: isAgreed ? s.current_offer || null : null,
    final_price: Number.isFinite(numPrice) ? numPrice : null,
    created_at: s.timestamp ? new Date(s.timestamp).toISOString() : new Date().toISOString(),
    user_id: s.user_id || "local-guest",
    is_local: true,
  };
}

export default function NegotiationHistory({ onNavigate }) {
  const { user, isAuthenticated } = useAuth();

  // Filter and pagination states
  const [search, setSearch] = useState("");
  const [modeFilter, setModeFilter] = useState("all");
  const [outcomeFilter, setOutcomeFilter] = useState("all");
  const [dateRangeFilter, setDateRangeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Data states
  const [historyItems, setHistoryItems] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  // Detail Modal state
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);

  // Feedback notifications
  const [feedback, setFeedback] = useState(null);
  const [isExportingAll, setIsExportingAll] = useState(false);
  const [exportingSessionId, setExportingSessionId] = useState(null);

  const showToast = (message, type = "success") => {
    setFeedback({ message, type });
    setTimeout(() => {
      setFeedback(null);
    }, 4500);
  };

  // Convert dateRange preset to ISO start/end
  const dateParams = useMemo(() => {
    if (dateRangeFilter === "all") return { startDate: "", endDate: "" };
    const now = new Date();
    const end = now.toISOString();

    if (dateRangeFilter === "today") {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return { startDate: today.toISOString(), endDate: end };
    }
    if (dateRangeFilter === "7days") {
      const past = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return { startDate: past.toISOString(), endDate: end };
    }
    if (dateRangeFilter === "30days") {
      const past = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return { startDate: past.toISOString(), endDate: end };
    }
    return { startDate: "", endDate: "" };
  }, [dateRangeFilter]);

  // Load history records from backend & local cache
  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);

    const localList = readLocalSessions();
    const clientIds = localList.map((s) => s.id).filter(Boolean).join(",");

    if (!isAuthenticated) {
      let filtered = [...localList];

      if (search.trim()) {
        const q = search.trim().toLowerCase();
        filtered = filtered.filter(
          (s) =>
            (s.scenario || s.scenario_name || "").toLowerCase().includes(q) ||
            (s.agents || "").toLowerCase().includes(q) ||
            (s.scenario_id || "").toLowerCase().includes(q)
        );
      }
      if (modeFilter && modeFilter !== "all") {
        filtered = filtered.filter((s) => (s.mode || "").toLowerCase().includes(modeFilter.toLowerCase()));
      }
      if (outcomeFilter && outcomeFilter !== "all") {
        filtered = filtered.filter((s) => {
          const res = (s.result || s.status || "").toLowerCase();
          if (outcomeFilter === "agreement") return res.includes("agree") || res.includes("accept");
          if (outcomeFilter === "deadlock") return res.includes("deadlock") || res.includes("reject") || res.includes("break");
          if (outcomeFilter === "in_progress") return res.includes("progress") || res.includes("active");
          return true;
        });
      }
      if (dateParams.startDate) {
        const sTime = new Date(dateParams.startDate).getTime();
        filtered = filtered.filter((s) => (s.timestamp || 0) >= sTime);
      }
      if (dateParams.endDate) {
        const eTime = new Date(dateParams.endDate).getTime();
        filtered = filtered.filter((s) => (s.timestamp || 0) <= eTime);
      }

      if (sortBy === "oldest") {
        filtered.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
      } else {
        filtered.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      }

      const total = filtered.length;
      const startIdx = (currentPage - 1) * pageSize;
      const paged = filtered.slice(startIdx, startIdx + pageSize);

      setHistoryItems(paged.map(convertLocalToHistoryItem));
      setTotalCount(total);
      setTotalPages(Math.max(1, Math.ceil(total / pageSize)));
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetchNegotiationHistory({
        search: search.trim(),
        mode: modeFilter,
        outcome: outcomeFilter,
        startDate: dateParams.startDate,
        endDate: dateParams.endDate,
        sortBy,
        page: currentPage,
        pageSize,
        clientIds
      });

      let items = res.items || [];
      const backendIds = new Set(items.map((i) => i.negotiation_id));
      const localUnsynced = localList.filter((loc) => !backendIds.has(loc.id) && !backendIds.has(loc.negotiation_id));

      if (localUnsynced.length > 0) {
        const extraFormatted = localUnsynced.map(convertLocalToHistoryItem);
        items = [...extraFormatted, ...items];
      }

      setHistoryItems(items);
      setTotalCount(res.total ? res.total + localUnsynced.length : items.length);
      setTotalPages(res.total_pages || Math.max(1, Math.ceil(items.length / pageSize)));
    } catch (err) {
      console.warn("Backend history fetch failed, displaying local cache:", err);
      const fallbackFormatted = localList.map(convertLocalToHistoryItem);
      setHistoryItems(fallbackFormatted);
      setTotalCount(fallbackFormatted.length);
      setTotalPages(Math.max(1, Math.ceil(fallbackFormatted.length / pageSize)));
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, search, modeFilter, outcomeFilter, dateParams, sortBy, currentPage, pageSize]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Open detail view with local fallback
  const handleOpenDetail = async (sessionId) => {
    setSelectedSessionId(sessionId);
    setIsDetailLoading(true);
    setDetailError(null);
    setDetailData(null);

    try {
      const data = await fetchNegotiationDetail(sessionId);
      setDetailData(data);
    } catch (err) {
      // Fallback: check local storage sessions
      const localList = readLocalSessions();
      const match = localList.find((s) => s.id === sessionId || s.negotiation_id === sessionId);
      if (match) {
        const isAgreed = match.result === "Agreement" || match.status === "accepted" || match.status === "agreement";
        setDetailData({
          negotiation_id: match.id || match.negotiation_id,
          scenario_id: match.scenario_id || "scenario",
          scenario_name: match.scenario || match.scenario_name || "Negotiation Scenario",
          scenario_description: match.scenario_description || "Recorded negotiation session from active workspace.",
          mode: match.mode || "simulation",
          human_role: match.human_role || null,
          difficulty: match.difficulty || "Intermediate",
          status: match.status || (isAgreed ? "accepted" : "deadlock"),
          current_round: match.rounds || match.current_round || 1,
          max_rounds: match.max_rounds || 5,
          participating_agents: match.participating_agents || [],
          history: (match.history || []).map((h, i) => ({
            id: i + 1,
            round: h.round || i + 1,
            agent_id: h.agent_id || "agent",
            decision: h.decision || "counter",
            reasoning: h.reasoning || "",
            proposed_offer: h.proposed_offer || h.value || null,
            parameters: h.parameters || {}
          })),
          current_offer: match.current_offer || null,
          previous_offer: match.previous_offer || null,
          deadlock_info: match.deadlock_info || null,
          metrics: match.metrics || {},
          created_at: match.timestamp ? new Date(match.timestamp).toISOString() : new Date().toISOString(),
          updated_at: match.timestamp ? new Date(match.timestamp).toISOString() : new Date().toISOString(),
          user_id: match.user_id || "local",
          execution_mode: "Normal Mode"
        });
      } else {
        setDetailError("Session details not found locally or on server.");
      }
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleCloseDetail = () => {
    setSelectedSessionId(null);
    setDetailData(null);
    setDetailError(null);
  };

  // Download single session with local fallback
  const handleDownloadSession = async (sessionId, format) => {
    setExportingSessionId(`${sessionId}-${format}`);
    try {
      const filename = await downloadNegotiationExport(sessionId, format);
      showToast(`Exported ${filename} successfully!`, "success");
    } catch (err) {
      // Local client-side export fallback
      const localList = readLocalSessions();
      const match = localList.find((s) => s.id === sessionId || s.negotiation_id === sessionId);
      if (match) {
        if (format === "json") {
          const blob = new Blob([JSON.stringify(match, null, 2)], { type: "application/json" });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `negomind-${sessionId}.json`;
          a.click();
          window.URL.revokeObjectURL(url);
          showToast(`Exported negomind-${sessionId}.json successfully!`, "success");
        } else {
          // CSV client-side fallback
          const rows = [
            ["Negotiation ID", "Scenario", "Mode", "Status", "Rounds", "Settlement"],
            [match.id, match.scenario || match.scenario_name, match.mode, match.result || match.status, match.rounds, match.settlement || "N/A"]
          ];
          const csvContent = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
          const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `negomind-${sessionId}.csv`;
          a.click();
          window.URL.revokeObjectURL(url);
          showToast(`Exported negomind-${sessionId}.csv successfully!`, "success");
        }
      } else {
        showToast(err.message || `Failed to export ${format.toUpperCase()}`, "error");
      }
    } finally {
      setExportingSessionId(null);
    }
  };

  // Download all history with local fallback
  const handleExportAll = async (format) => {
    setIsExportingAll(true);
    try {
      const filename = await downloadAllNegotiationHistory(format);
      showToast(`Exported complete history as ${filename}!`, "success");
    } catch (err) {
      const localList = readLocalSessions();
      if (localList.length > 0) {
        if (format === "json") {
          const blob = new Blob([JSON.stringify(localList, null, 2)], { type: "application/json" });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `negomind-history-all.json`;
          a.click();
          window.URL.revokeObjectURL(url);
          showToast(`Exported complete history as negomind-history-all.json!`, "success");
        } else {
          const rows = [
            ["Negotiation ID", "Scenario", "Mode", "Status", "Rounds", "Settlement", "Date"],
            ...localList.map((m) => [m.id, m.scenario || m.scenario_name, m.mode, m.result || m.status, m.rounds, m.settlement || "N/A", m.date || "Recent"])
          ];
          const csvContent = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
          const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `negomind-history-all.csv`;
          a.click();
          window.URL.revokeObjectURL(url);
          showToast(`Exported complete history as negomind-history-all.csv!`, "success");
        }
      } else {
        showToast(err.message || `Failed to export all history as ${format.toUpperCase()}`, "error");
      }
    } finally {
      setIsExportingAll(false);
    }
  };


  return (
    <main data-guide="negotiation-history-page" className="min-h-full flex-1 bg-mainPanel px-4 py-6 sm:px-8 text-textPrimary">
      <div className="mx-auto max-w-[1500px] space-y-6">

        {/* Toast Feedback */}
        {feedback && (
          <div
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border px-4 py-3 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-200 ${
              feedback.type === "error"
                ? "border-rose-500/40 bg-rose-950/90 text-rose-200"
                : "border-emerald-500/40 bg-emerald-950/90 text-emerald-200"
            }`}
          >
            <span className="text-sm font-bold">{feedback.message}</span>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="ml-2 text-xs opacity-70 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        )}

        {/* Header Bar */}
        <header className="border-b border-border pb-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="mt-4 text-2xl font-extrabold text-textPrimary">Negotiation History</h1>
              <p className="mt-1 text-xs text-textSecondary">
                Inspect complete session records, view chronological transcripts, and export authenticated reports.
              </p>
            </div>

            {/* Header Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={loadHistory}
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-bold text-textPrimary hover:bg-cardAlt transition cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={isLoading ? "animate-spin" : ""}>
                  <path d="M21 2v6h-6" /><path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M3 22v-6h6" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                </svg>
                Refresh
              </button>

              {/* Export All History Dropdown Buttons */}
              <div className="inline-flex rounded-xl border border-border bg-card p-1">
                <span className="self-center px-2.5 text-[10px] font-bold uppercase tracking-wider text-textMuted">
                  Export All:
                </span>
                <button
                  type="button"
                  onClick={() => handleExportAll("csv")}
                  disabled={isExportingAll || totalCount === 0}
                  className="rounded-lg px-3 py-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-400 hover:bg-indigo-500/15 transition disabled:opacity-40 cursor-pointer"
                >
                  CSV
                </button>
                <button
                  type="button"
                  onClick={() => handleExportAll("json")}
                  disabled={isExportingAll || totalCount === 0}
                  className="rounded-lg px-3 py-1.5 text-xs font-bold text-cyan-700 dark:text-cyan-400 hover:bg-cyan-500/15 transition disabled:opacity-40 cursor-pointer"
                >
                  JSON
                </button>
              </div>

              <button
                type="button"
                onClick={() => onNavigate("Configure Agents")}
                className="rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition cursor-pointer"
              >
                + New Negotiation
              </button>
            </div>
          </div>
        </header>

        {/* Guest Session Notification Banner if not authenticated */}
        {!isAuthenticated && (
          <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-sans">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 font-bold">
                ℹ
              </span>
              <p className="text-textSecondary">
                <strong className="text-textPrimary">Active Browser History:</strong> Showing negotiations recorded in this browser session.{" "}
                <button
                  type="button"
                  onClick={() => onNavigate("AuthPage")}
                  className="text-indigo-700 dark:text-indigo-400 font-bold underline hover:text-indigo-900 dark:hover:text-indigo-300 cursor-pointer"
                >
                  Sign in or create an account
                </button>{" "}
                to sync and preserve your audit logs permanently in the cloud.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("AuthPage")}
              className="shrink-0 rounded-xl bg-card border border-border px-3.5 py-1.5 font-bold text-textPrimary hover:bg-cardAlt transition cursor-pointer"
            >
              Sign In
            </button>
          </div>
        )}

        {/* Search & Filter Toolbar */}
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 rounded-2xl border border-border bg-card p-4">
          {/* Search Box */}
          <div className="relative sm:col-span-2 lg:col-span-2">
            <span className="absolute inset-y-0 left-3 flex items-center text-textMuted">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by scenario name..."
              className="w-full rounded-xl border border-border bg-mainPanel py-2.5 pl-9 pr-3 text-xs text-textPrimary placeholder-textMuted focus:border-indigo-400 focus:outline-none"
            />
          </div>

          {/* Mode Filter */}
          <div>
            <select
              value={modeFilter}
              onChange={(e) => {
                setModeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-border bg-mainPanel py-2.5 px-3 text-xs text-textPrimary focus:border-indigo-400 focus:outline-none cursor-pointer"
            >
              <option value="all">All Modes</option>
              <option value="simulation">Simulation Mode</option>
              <option value="practice">Practice Mode</option>
            </select>
          </div>

          {/* Outcome Filter */}
          <div>
            <select
              value={outcomeFilter}
              onChange={(e) => {
                setOutcomeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-border bg-mainPanel py-2.5 px-3 text-xs text-textPrimary focus:border-indigo-400 focus:outline-none cursor-pointer"
            >
              <option value="all">All Outcomes</option>
              <option value="agreement">Agreement Reached</option>
              <option value="deadlock">Deadlock / Breakdown</option>
              <option value="in_progress">In Progress</option>
            </select>
          </div>

          {/* Date & Sort Controls */}
          <div className="flex gap-2">
            <select
              value={dateRangeFilter}
              onChange={(e) => {
                setDateRangeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="flex-1 rounded-xl border border-border bg-mainPanel py-2.5 px-2 text-xs text-textPrimary focus:border-indigo-400 focus:outline-none cursor-pointer"
            >
              <option value="all">Any Date</option>
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="w-28 rounded-xl border border-border bg-mainPanel py-2.5 px-2 text-xs text-textPrimary focus:border-indigo-400 focus:outline-none cursor-pointer"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </section>

        {/* Content Area */}
        {isLoading ? (
          /* Loading State */
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-border bg-card p-5">
                <div className="flex justify-between gap-4">
                  <div className="space-y-2.5 w-1/2">
                    <div className="h-4 bg-slate-300 dark:bg-slate-700/50 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-700/30 rounded w-1/2" />
                  </div>
                  <div className="h-8 bg-slate-200 dark:bg-slate-700/40 rounded w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : errorMsg ? (
          /* Error State */
          <div className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-8 text-center">
            <p className="text-sm font-bold text-rose-400">{errorMsg}</p>
            <button
              type="button"
              onClick={loadHistory}
              className="mt-4 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-xs font-bold text-rose-300 hover:bg-rose-500/20 transition cursor-pointer"
            >
              Retry Loading Records
            </button>
          </div>
        ) : historyItems.length === 0 ? (
          /* Empty State */
          <div className="rounded-2xl border border-border bg-card p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-cardAlt text-textMuted">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-bold text-textPrimary">No Negotiation Records Found</h3>
            <p className="mt-1 text-xs text-textSecondary max-w-sm mx-auto">
              {search || modeFilter !== "all" || outcomeFilter !== "all" || dateRangeFilter !== "all"
                ? "No sessions match the current search and filter settings. Try adjusting your search query."
                : "You haven't run any negotiation simulations yet. Launch a practice session or simulation to begin building your audit log."}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              {(search || modeFilter !== "all" || outcomeFilter !== "all" || dateRangeFilter !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setModeFilter("all");
                    setOutcomeFilter("all");
                    setDateRangeFilter("all");
                  }}
                  className="rounded-xl border border-border bg-mainPanel px-4 py-2.5 text-xs font-bold text-textPrimary hover:bg-cardAlt transition cursor-pointer"
                >
                  Reset Filters
                </button>
              )}
              <button
                type="button"
                onClick={() => onNavigate("Configure Agents")}
                className="rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition cursor-pointer"
              >
                Launch Negotiation
              </button>
            </div>
          </div>
        ) : (
          /* Table of History Records */
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-2xl border border-border bg-card">
              <table className="w-full min-w-[760px] text-left text-xs">
                <thead className="border-b border-border bg-mainPanel font-mono text-[10px] uppercase text-textMuted">
                  <tr>
                    <th className="px-4 py-3.5">Scenario</th>
                    <th className="px-4 py-3.5">Mode / Engine</th>
                    <th className="px-4 py-3.5">Participants</th>
                    <th className="px-4 py-3.5">Rounds</th>
                    <th className="px-4 py-3.5">Outcome</th>
                    <th className="px-4 py-3.5">Agreed Terms</th>
                    <th className="px-4 py-3.5">Date & Time</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {historyItems.map((item) => {
                    const dateFormatted = item.created_at
                      ? new Date(item.created_at).toLocaleString()
                      : "Recent";
                    const isAgreement =
                      item.status === "accepted" ||
                      item.status === "agreement" ||
                      item.status === "completed";
                    const agreedStr = isAgreement
                      ? item.final_price !== null && item.final_price !== undefined
                        ? `$${Math.round(item.final_price).toLocaleString()}`
                        : "Agreement reached"
                      : "No agreement";

                    return (
                      <tr
                        key={item.negotiation_id}
                        className="transition-colors hover:bg-cardAlt"
                      >
                        {/* Scenario */}
                        <td className="px-4 py-4">
                          <p className="font-bold text-textPrimary">{item.scenario_name}</p>
                          <p className="font-mono text-[10px] text-textMuted mt-0.5">
                            ID: {item.negotiation_id.slice(0, 8)}...
                          </p>
                        </td>

                        {/* Mode & Reasoning */}
                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-1 items-start">
                            <span
                              className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${modeBadgeClass(
                                item.mode
                              )}`}
                            >
                              {item.mode}
                            </span>
                            <span className="text-[10px] font-mono text-textMuted">
                              {item.reasoning_mode}
                            </span>
                          </div>
                        </td>

                        {/* Participants */}
                        <td className="px-4 py-4 text-textSecondary">
                          <p className="font-medium">{item.agents_summary}</p>
                          {item.participant_roles && item.participant_roles.length > 0 && (
                            <p className="font-mono text-[10px] text-textMuted mt-0.5">
                              {item.participant_roles.join(" • ")}
                            </p>
                          )}
                        </td>

                        {/* Rounds */}
                        <td className="px-4 py-4 font-mono">
                          <span className="font-bold text-textPrimary">{item.current_round}</span>
                          <span className="text-textMuted"> / {item.max_rounds}</span>
                        </td>

                        {/* Outcome */}
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${outcomeBadgeClass(
                              item.status
                            )}`}
                          >
                            {item.status}
                          </span>
                        </td>

                        {/* Agreed Terms */}
                        <td className="px-4 py-4 font-mono">
                          <span className={isAgreement ? "font-bold text-emerald-500 dark:text-emerald-400" : "text-textMuted"}>
                            {agreedStr}
                          </span>
                        </td>

                        {/* Date & Time */}
                        <td className="px-4 py-4 text-textMuted font-mono text-[11px] whitespace-nowrap">
                          {dateFormatted}
                        </td>

                        {/* Action Buttons */}
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenDetail(item.negotiation_id)}
                              className="rounded-lg border border-border bg-mainPanel px-2.5 py-1.5 text-xs font-semibold text-textPrimary hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition cursor-pointer"
                              title="Inspect negotiation details"
                            >
                              View
                            </button>

                            {/* Download Buttons */}
                            <button
                              type="button"
                              onClick={() => handleDownloadSession(item.negotiation_id, "pdf")}
                              disabled={exportingSessionId === `${item.negotiation_id}-pdf`}
                              className="rounded-lg border border-border bg-mainPanel px-2 py-1.5 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/40 transition disabled:opacity-40 cursor-pointer"
                              title="Download PDF report"
                            >
                              PDF
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownloadSession(item.negotiation_id, "csv")}
                              disabled={exportingSessionId === `${item.negotiation_id}-csv`}
                              className="rounded-lg border border-border bg-mainPanel px-2 py-1.5 text-xs font-mono font-bold text-indigo-500 dark:text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500/40 transition disabled:opacity-40 cursor-pointer"
                              title="Download CSV table"
                            >
                              CSV
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownloadSession(item.negotiation_id, "json")}
                              disabled={exportingSessionId === `${item.negotiation_id}-json`}
                              className="rounded-lg border border-border bg-mainPanel px-2 py-1.5 text-xs font-mono font-bold text-cyan-500 dark:text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/40 transition disabled:opacity-40 cursor-pointer"
                              title="Download JSON data"
                            >
                              JSON
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-2 pt-2">
              <span className="text-xs text-textMuted">
                Showing <strong className="text-textPrimary">{historyItems.length}</strong> of{" "}
                <strong className="text-textPrimary">{totalCount}</strong> sessions (Page {currentPage} of{" "}
                {totalPages})
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-bold text-textPrimary hover:bg-cardAlt transition disabled:opacity-40 cursor-pointer"
                >
                  ← Previous
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, idx) => idx + 1).slice(
                    Math.max(0, currentPage - 3),
                    Math.min(totalPages, currentPage + 2)
                  ).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`h-8 w-8 rounded-lg text-xs font-bold transition cursor-pointer ${
                        currentPage === pageNum
                          ? "bg-emerald-500 text-slate-950 font-black"
                          : "border border-border bg-card text-textSecondary hover:bg-cardAlt"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-bold text-textPrimary hover:bg-cardAlt transition disabled:opacity-40 cursor-pointer"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ============================================================
          READ-ONLY DETAIL VIEW MODAL (PHASE 3)
      ============================================================ */}
      {selectedSessionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative flex max-h-[92vh] w-full max-w-5xl flex-col rounded-2xl border border-border bg-card shadow-2xl text-textPrimary overflow-hidden">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border bg-mainPanel px-6 py-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400">
                  READ-ONLY SESSION AUDIT
                </span>
                <h2 className="text-xl font-bold text-textPrimary">
                  {detailData ? detailData.scenario_name : "Loading session..."}
                </h2>
                <p className="font-mono text-[11px] text-textMuted">
                  Session ID: {selectedSessionId}
                </p>
              </div>

              {/* Header Actions & Close Button */}
              <div className="flex items-center gap-2">
                {detailData && (
                  <div className="hidden sm:flex items-center gap-1.5 mr-2">
                    <button
                      type="button"
                      onClick={() => handleDownloadSession(selectedSessionId, "pdf")}
                      className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-300 hover:bg-emerald-500/20 transition cursor-pointer"
                    >
                      Download PDF
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadSession(selectedSessionId, "csv")}
                      className="rounded-lg border border-indigo-500/40 bg-indigo-500/10 px-3 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-300 hover:bg-indigo-500/20 transition cursor-pointer"
                    >
                      CSV
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadSession(selectedSessionId, "json")}
                      className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5 text-xs font-bold text-cyan-600 dark:text-cyan-300 hover:bg-cyan-500/20 transition cursor-pointer"
                    >
                      JSON
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleCloseDetail}
                  className="rounded-xl border border-border bg-cardAlt p-2 text-textMuted hover:text-textPrimary transition cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {isDetailLoading ? (
                <div className="space-y-4 py-8 text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
                  <p className="text-xs text-textMuted font-mono">Retrieving immutable audit records...</p>
                </div>
              ) : detailError ? (
                <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-6 text-center">
                  <p className="text-sm font-bold text-rose-400">{detailError}</p>
                </div>
              ) : detailData ? (
                <>
                  {/* Overview Cards */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-xl border border-border bg-mainPanel p-3.5">
                      <p className="text-[10px] font-mono uppercase text-textMuted">Mode</p>
                      <p className="mt-1 font-bold text-textPrimary capitalize">{detailData.mode || "Simulation"}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-mainPanel p-3.5">
                      <p className="text-[10px] font-mono uppercase text-textMuted">Reasoning Engine</p>
                      <p className="mt-1 font-bold text-indigo-500 dark:text-indigo-400">{detailData.execution_mode || "Normal Mode"}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-mainPanel p-3.5">
                      <p className="text-[10px] font-mono uppercase text-textMuted">Rounds Completed</p>
                      <p className="mt-1 font-mono font-bold text-textPrimary">
                        {detailData.current_round} / {detailData.max_rounds}
                      </p>
                    </div>
                    <div className="rounded-xl border border-border bg-mainPanel p-3.5">
                      <p className="text-[10px] font-mono uppercase text-textMuted">Final Outcome</p>
                      <p className="mt-1 font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                        {detailData.status || "Completed"}
                      </p>
                    </div>
                  </div>

                  {/* Scenario Configuration & Final Terms */}
                  <div className="rounded-xl border border-border bg-mainPanel p-5 space-y-3">
                    <h3 className="text-sm font-bold text-textPrimary">Scenario Configuration & Agreement Terms</h3>
                    <p className="text-xs text-textSecondary leading-relaxed">
                      {detailData.scenario_description || "Not available"}
                    </p>
                    <div className="mt-3 pt-3 border-t border-border flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-textMuted">Final Agreed Settlement</span>
                        <p className="text-base font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {detailData.current_offer
                            ? `$${Math.round(detailData.current_offer.price || detailData.current_offer.value || 0).toLocaleString()}`
                            : detailData.status === "deadlock" || detailData.status === "rejected"
                            ? "Deadlock - No agreement concluded"
                            : "Not available"}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-mono uppercase text-textMuted">Recorded Date</span>
                        <p className="text-xs text-textSecondary font-mono">
                          {detailData.created_at ? new Date(detailData.created_at).toLocaleString() : "Not available"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Participant Roles & Objectives */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-textPrimary">Participant Profiles & Roles</h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {detailData.participating_agents && detailData.participating_agents.length > 0 ? (
                        detailData.participating_agents.map((agent, i) => (
                          <div key={agent.id || i} className="rounded-xl border border-border bg-mainPanel p-4 space-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-bold text-textPrimary">{agent.name || agent.id || "Agent"}</h4>
                                <p className="text-xs text-indigo-500 dark:text-indigo-400 font-mono mt-0.5">
                                  Role: {agent.role || "Not available"} &bull; {agent.persona || agent.personality || "Standard"}
                                </p>
                              </div>
                            </div>
                            <div className="text-xs text-textSecondary">
                              <span className="font-semibold text-textMuted">Objectives: </span>
                              {agent.goals
                                ? Array.isArray(agent.goals)
                                  ? agent.goals.join("; ")
                                  : agent.goals
                                : "Not available"}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-textMuted">Not available</p>
                      )}
                    </div>
                  </div>

                  {/* Complete Chronological Transcript */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-textPrimary">Turn-by-Turn Negotiation Transcript</h3>
                      <span className="text-[10px] font-mono text-textMuted">
                        Total turns: {detailData.history ? detailData.history.length : 0}
                      </span>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-border bg-mainPanel">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-cardAlt border-b border-border font-mono text-[10px] uppercase text-textMuted">
                          <tr>
                            <th className="px-3.5 py-3">Turn</th>
                            <th className="px-3.5 py-3">Round</th>
                            <th className="px-3.5 py-3">Agent</th>
                            <th className="px-3.5 py-3">Decision</th>
                            <th className="px-3.5 py-3">Offer Price</th>
                            <th className="px-3.5 py-3">Concession / Movement</th>
                            <th className="px-3.5 py-3">Strategic Reasoning</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {detailData.history && detailData.history.length > 0 ? (
                            detailData.history.map((turn, index) => {
                              const pVal = turn.value || (turn.proposed_offer && (turn.proposed_offer.price || turn.proposed_offer.value));
                              const priceStr = pVal !== null && pVal !== undefined ? `$${Math.round(pVal).toLocaleString()}` : "Not available";
                              const concession = turn.concession_data || (turn.parameters && turn.parameters.concession_tracking);
                              const concessionAmount = concession ? concession.concession_amount || concession.concession : null;

                              return (
                                <tr key={turn.id || index} className="align-top hover:bg-cardAlt">
                                  <td className="px-3.5 py-3 font-mono text-textMuted">{index + 1}</td>
                                  <td className="px-3.5 py-3 font-mono text-textMuted">R{turn.round || 1}</td>
                                  <td className="px-3.5 py-3 font-bold text-textPrimary">{turn.agent_id}</td>
                                  <td className="px-3.5 py-3">
                                    <span className={`inline-flex rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold ${decisionBadgeClass(turn.decision)}`}>
                                      {turn.decision || "N/A"}
                                    </span>
                                  </td>
                                  <td className="px-3.5 py-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">{priceStr}</td>
                                  <td className="px-3.5 py-3 font-mono text-textSecondary">
                                    {concessionAmount !== null && concessionAmount !== undefined
                                      ? `${concessionAmount > 0 ? "+" : ""}$${Math.round(concessionAmount).toLocaleString()}`
                                      : "Not available"}
                                  </td>
                                  <td className="px-3.5 py-3 text-textSecondary leading-relaxed max-w-sm whitespace-normal">
                                    {turn.reasoning || "Not available"}
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan={7} className="px-4 py-8 text-center text-textMuted font-mono">
                                No transcript turns recorded for this session.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-border bg-mainPanel px-6 py-4">
              <span className="text-[10px] font-mono text-textMuted">
                Opening previous sessions is strictly read-only and preserves the original audit records.
              </span>
              <button
                type="button"
                onClick={handleCloseDetail}
                className="rounded-xl border border-border bg-card px-5 py-2 text-xs font-bold text-textPrimary hover:bg-cardAlt transition cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </main>
  );
}
