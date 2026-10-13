import { useState, useEffect, useMemo } from "react";
import { scenarios as predefinedScenariosDict } from "../../data/scenarios";
import {
  fetchCustomScenarios,
  deleteCustomScenario,
  duplicateCustomScenario
} from "../../services/api";
import CustomScenarioBuilder from "./CustomScenarioBuilder";

const CATEGORIES = [
  "All",
  "Purchasing",
  "Employment",
  "Project Management",
  "Real Estate",
  "Consumer",
  "Freelancing",
  "Supply Chain",
  "Housing",
  "Business",
  "Services",
  "Other"
];

function getCategoryColor(cat = "") {
  const c = String(cat).toLowerCase();
  if (c.includes("real")) return "border-blue-500/30 bg-blue-500/10 text-blue-400";
  if (c.includes("consumer") || c.includes("purchasing")) return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
  if (c.includes("employment")) return "border-purple-500/30 bg-purple-500/10 text-purple-400";
  if (c.includes("freelance")) return "border-amber-500/30 bg-amber-500/10 text-amber-400";
  if (c.includes("supply")) return "border-cyan-500/30 bg-cyan-500/10 text-cyan-400";
  if (c.includes("project")) return "border-indigo-500/30 bg-indigo-500/10 text-indigo-400";
  if (c.includes("housing")) return "border-rose-500/30 bg-rose-500/10 text-rose-400";
  if (c.includes("business")) return "border-yellow-500/30 bg-yellow-500/10 text-yellow-400";
  return "border-slate-500/30 bg-slate-500/10 text-slate-300";
}

function ScenarioIcon({ category = "" }) {
  const c = String(category).toLowerCase();
  if (c.includes("real")) return "🏠";
  if (c.includes("consumer")) return "🚗";
  if (c.includes("employment")) return "💼";
  if (c.includes("freelance")) return "💻";
  if (c.includes("supply") || c.includes("purchasing")) return "📦";
  if (c.includes("project")) return "📊";
  if (c.includes("housing")) return "🔑";
  if (c.includes("business")) return "🤝";
  if (c.includes("services")) return "⚙️";
  return "🎯";
}

export default function NegotiationScenariosView({
  onSelectScenario,
  onNavigate,
  userId = null,
  isDark = true
}) {
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'existing', 'more', 'custom'
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("name"); // 'name', 'category'

  // Custom Scenarios State
  const [customScenarios, setCustomScenarios] = useState([]);
  const [isLoadingCustom, setIsLoadingCustom] = useState(false);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingScenario, setEditingScenario] = useState(null);

  // Deletion Modal State
  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch Custom Scenarios on mount or tab change
  const loadCustomScenarios = async () => {
    setIsLoadingCustom(true);
    try {
      const data = await fetchCustomScenarios(userId);
      setCustomScenarios(data || []);
    } catch (err) {
      console.warn("Could not load custom scenarios from backend:", err);
    } finally {
      setIsLoadingCustom(false);
    }
  };

  useEffect(() => {
    loadCustomScenarios();
  }, [userId]);

  // Combine Predefined Scenarios List
  const predefinedList = useMemo(() => {
    return Object.values(predefinedScenariosDict).map((s, idx) => ({
      ...s,
      isPredefined: true,
      isExistingCore: idx < 3,
      participantsStr: s.participants ? s.participants.join(" vs ") : "Buyer vs Vendor"
    }));
  }, []);

  const customListFormatted = useMemo(() => {
    return customScenarios.map((s) => ({
      ...s,
      scenario_id: s.id || s.scenario_id,
      scenario_name: s.name || s.scenario_name || s.title,
      isCustom: true,
      participantsStr: Array.isArray(s.participants)
        ? s.participants.map((p) => (typeof p === "object" ? p.role || p.name : p)).join(" vs ")
        : "Participant 1 vs Participant 2"
    }));
  }, [customScenarios]);

  // Filter & Sort Scenarios
  const filteredExisting = useMemo(() => {
    return predefinedList.filter((s) => s.isExistingCore);
  }, [predefinedList]);

  const filteredMoreScenarios = useMemo(() => {
    return predefinedList.filter((s) => !s.isExistingCore);
  }, [predefinedList]);

  const allDisplayScenarios = useMemo(() => {
    let combined = [...predefinedList, ...customListFormatted];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      combined = combined.filter(
        (s) =>
          s.scenario_name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.category?.toLowerCase().includes(q) ||
          s.participantsStr.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== "All") {
      combined = combined.filter(
        (s) => (s.category || "").toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (sortBy === "name") {
      combined.sort((a, b) => a.scenario_name.localeCompare(b.scenario_name));
    } else if (sortBy === "category") {
      combined.sort((a, b) => (a.category || "").localeCompare(b.category || ""));
    }

    return combined;
  }, [predefinedList, customListFormatted, searchQuery, selectedCategory, sortBy]);

  const handleStartScenario = (scenario) => {
    onSelectScenario?.(scenario);
    if (onNavigate) {
      onNavigate("Configure Agents");
    }
  };

  const handleOpenBuilderCreate = () => {
    setEditingScenario(null);
    setIsBuilderOpen(true);
  };

  const handleOpenBuilderEdit = (scenario) => {
    setEditingScenario(scenario);
    setIsBuilderOpen(true);
  };

  const handleDuplicate = async (scenId) => {
    try {
      await duplicateCustomScenario(scenId);
      await loadCustomScenarios();
    } catch (err) {
      alert("Failed to duplicate scenario: " + err.message);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await deleteCustomScenario(deletingId);
      setDeletingId(null);
      await loadCustomScenarios();
    } catch (err) {
      alert("Failed to delete scenario: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={`min-h-full w-full p-4 sm:p-8 ${isDark ? "bg-[#0C0C0F] text-white" : "bg-slate-50 text-slate-900"}`}>
      {/* Top Banner / Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-emerald-400">
              NegoMind AI Simulation Library
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
            NEGOTIATION SCENARIOS
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Select built-in business negotiations or design custom multi-agent simulation scenarios.
          </p>
        </div>

        {/* Create Custom Button */}
        <button
          onClick={handleOpenBuilderCreate}
          className="flex items-center gap-2 rounded-xl bg-emerald-400 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-black shadow-[0_0_20px_rgba(52,211,153,0.3)] hover:bg-emerald-300 hover:scale-[1.02] transition active:scale-95 cursor-pointer"
        >
          <span>+ Create Custom Scenario</span>
        </button>
      </div>

      {/* Navigation Sub-Tabs & Filters */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Sub-Tabs */}
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-1.5">
          {[
            { id: "all", label: "All Scenarios", count: predefinedList.length + customScenarios.length },
            { id: "existing", label: "Existing Scenarios", count: 3 },
            { id: "more", label: "More Scenarios", count: 9 },
            { id: "custom", label: "My Custom Scenarios", count: customScenarios.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                activeTab === tab.id
                  ? "bg-emerald-500 text-black shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Search scenarios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-xl border border-white/10 bg-[#1A1924] px-3 py-1.5 text-xs text-white focus:outline-none"
          >
            <option value="name">Sort by Name</option>
            <option value="category">Sort by Category</option>
          </select>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="mb-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-full border px-3.5 py-1 text-[11px] font-semibold transition whitespace-nowrap cursor-pointer ${
              selectedCategory === cat
                ? "border-emerald-400 bg-emerald-400/20 text-emerald-300"
                : "border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/20 hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* SECTION 1: Existing Scenarios (Core 3) */}
      {(activeTab === "all" || activeTab === "existing") && !searchQuery && selectedCategory === "All" && (
        <div className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-400">
              CORE BUILT-IN SCENARIOS
            </span>
            <div className="h-[1px] flex-1 bg-white/10" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {filteredExisting.map((s) => (
              <ScenarioCard
                key={s.scenario_id}
                scenario={s}
                onStart={() => handleStartScenario(s)}
                isDark={isDark}
              />
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: More Scenarios (Predefined 4 - 12) */}
      {(activeTab === "all" || activeTab === "more") && !searchQuery && selectedCategory === "All" && (
        <div className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-400">
              PREDEFINED SCENARIOS (MORE)
            </span>
            <div className="h-[1px] flex-1 bg-white/10" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {filteredMoreScenarios.map((s) => (
              <ScenarioCard
                key={s.scenario_id}
                scenario={s}
                onStart={() => handleStartScenario(s)}
                isDark={isDark}
              />
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: Custom Scenarios */}
      {(activeTab === "all" || activeTab === "custom") && (
        <div className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-400">
                MY CUSTOM SCENARIOS
              </span>
              <div className="h-[1px] w-24 bg-white/10" />
            </div>

            <button
              onClick={handleOpenBuilderCreate}
              className="text-xs font-bold text-emerald-400 hover:underline"
            >
              + Add Custom Scenario
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Create Custom Prominent Card */}
            <div
              onClick={handleOpenBuilderCreate}
              className="group flex flex-col items-center justify-center rounded-2xl border border-dashed border-emerald-500/40 bg-emerald-500/[0.03] p-6 text-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-500/[0.08] transition min-h-[200px]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 text-xl font-black group-hover:scale-110 transition">
                +
              </div>
              <h3 className="mt-3 font-bold text-sm text-white">Create Custom Scenario</h3>
              <p className="mt-1 text-xs text-slate-400">
                Build custom roles, objectives, variables, and constraint guardrails.
              </p>
            </div>

            {/* User Custom Scenarios List */}
            {customListFormatted.map((s) => (
              <CustomScenarioCard
                key={s.scenario_id}
                scenario={s}
                onStart={() => handleStartScenario(s)}
                onEdit={() => handleOpenBuilderEdit(s)}
                onDuplicate={() => handleDuplicate(s.scenario_id)}
                onDelete={() => setDeletingId(s.scenario_id)}
                isDark={isDark}
              />
            ))}
          </div>
        </div>
      )}

      {/* Combined Filtered Search Results (When filter active) */}
      {(searchQuery || selectedCategory !== "All") && (
        <div className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-400">
              SEARCH & FILTERED RESULTS ({allDisplayScenarios.length})
            </span>
          </div>

          {allDisplayScenarios.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center text-slate-400">
              No matching negotiation scenarios found for "{searchQuery || selectedCategory}".
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {allDisplayScenarios.map((s) =>
                s.isCustom ? (
                  <CustomScenarioCard
                    key={s.scenario_id}
                    scenario={s}
                    onStart={() => handleStartScenario(s)}
                    onEdit={() => handleOpenBuilderEdit(s)}
                    onDuplicate={() => handleDuplicate(s.scenario_id)}
                    onDelete={() => setDeletingId(s.scenario_id)}
                    isDark={isDark}
                  />
                ) : (
                  <ScenarioCard
                    key={s.scenario_id}
                    scenario={s}
                    onStart={() => handleStartScenario(s)}
                    isDark={isDark}
                  />
                )
              )}
            </div>
          )}
        </div>
      )}

      {/* Custom Scenario Builder Wizard Modal */}
      {isBuilderOpen && (
        <CustomScenarioBuilder
          editingScenario={editingScenario}
          onClose={() => setIsBuilderOpen(false)}
          onSaveSuccess={() => loadCustomScenarios()}
          onStartNegotiation={(scen, mode, humanRole, maxRounds) => {
            loadCustomScenarios();
            onSelectScenario?.(scen);
            if (onNavigate) onNavigate("Configure Agents");
          }}
          isDark={isDark}
        />
      )}

      {/* Deletion Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-rose-500/40 bg-[#121118] p-6 shadow-2xl text-white space-y-4">
            <h3 className="text-lg font-bold text-rose-400">Delete Custom Scenario?</h3>
            <p className="text-xs text-slate-300">
              Are you sure you want to delete this custom scenario? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="rounded-xl bg-rose-500 px-4 py-2 text-xs font-bold text-white hover:bg-rose-600 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete Scenario"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ScenarioCard({ scenario, onStart, isDark }) {
  const catColor = getCategoryColor(scenario.category);
  const icon = ScenarioIcon({ category: scenario.category });

  return (
    <div className={`flex flex-col justify-between rounded-2xl border p-5 transition-all hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(52,211,153,0.15)] ${isDark ? "border-[#1F1E26] bg-[#121117]" : "border-slate-200 bg-white"}`}>
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-2xl">{icon}</span>
          <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wide ${catColor}`}>
            {scenario.category || "General"}
          </span>
        </div>

        <h3 className="text-base font-black tracking-tight text-white mb-1">
          {scenario.scenario_name || scenario.name}
        </h3>

        <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
          {scenario.description}
        </p>

        <div className="mb-4 rounded-xl bg-black/40 p-2.5 border border-white/5 flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px]">Participants:</span>
          <span className="font-mono font-bold text-emerald-400">{scenario.participantsStr || "Buyer vs Vendor"}</span>
        </div>
      </div>

      <button
        onClick={onStart}
        className="w-full rounded-xl bg-emerald-500/10 border border-emerald-500/30 py-2.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500 hover:text-black transition cursor-pointer"
      >
        Start Negotiation →
      </button>
    </div>
  );
}

function CustomScenarioCard({ scenario, onStart, onEdit, onDuplicate, onDelete, isDark }) {
  const catColor = getCategoryColor(scenario.category);
  const icon = ScenarioIcon({ category: scenario.category });

  return (
    <div className={`flex flex-col justify-between rounded-2xl border p-5 transition-all border-emerald-500/40 bg-[#14131D] hover:shadow-[0_0_20px_rgba(52,211,153,0.2)]`}>
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{icon}</span>
            <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 font-mono text-[9px] font-bold uppercase text-emerald-400">
              CUSTOM
            </span>
          </div>
          <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${catColor}`}>
            {scenario.category || "Custom"}
          </span>
        </div>

        <h3 className="text-base font-black tracking-tight text-white mb-1">
          {scenario.scenario_name || scenario.name}
        </h3>

        <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
          {scenario.description}
        </p>

        <div className="mb-4 rounded-xl bg-black/40 p-2.5 border border-white/5 flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px]">Participants:</span>
          <span className="font-mono font-bold text-emerald-400">{scenario.participantsStr}</span>
        </div>
      </div>

      <div className="space-y-2">
        <button
          onClick={onStart}
          className="w-full rounded-xl bg-emerald-400 py-2 text-xs font-black text-black hover:bg-emerald-300 transition cursor-pointer"
        >
          🚀 Start Negotiation
        </button>

        <div className="flex items-center justify-between gap-2 pt-1 text-[11px]">
          <button onClick={onEdit} className="text-slate-300 hover:text-white font-semibold">Edit</button>
          <button onClick={onDuplicate} className="text-slate-300 hover:text-white font-semibold">Duplicate</button>
          <button onClick={onDelete} className="text-rose-400 hover:text-rose-300 font-semibold">Delete</button>
        </div>
      </div>
    </div>
  );
}
