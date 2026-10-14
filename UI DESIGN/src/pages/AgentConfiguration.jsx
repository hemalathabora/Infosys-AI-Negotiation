import { useState, useEffect, useMemo } from "react";

// ---------------------------------------------------------------------------
// Helper: extract the primary numeric constraint value from an agent
// ---------------------------------------------------------------------------
function extractConstraintValue(agent) {
  const c = agent?.constraints?.[0];
  if (!c) return null;
  const raw =
    typeof c === "object"
      ? (c.defaultValue ?? c.value ?? null)
      : String(c).replace(/[^0-9.]/g, "");
  const num = Number(raw);
  return Number.isFinite(num) ? num : null;
}

// ---------------------------------------------------------------------------
// Helper: compute ZOPA from the two loaded agents
// ---------------------------------------------------------------------------
function computeZopa(agents) {
  if (!agents || agents.length < 2) return null;
  const a = agents[0];
  const b = agents[1];
  const aVal = extractConstraintValue(a);
  const bVal = extractConstraintValue(b);
  if (aVal === null || bVal === null) return null;

  const aText = ((a.role || "") + " " + (a.constraints?.[0]?.text || "")).toLowerCase();
  const aIsFloor =
    /min|seller|vendor|freelancer|landlord|supplier|candidate|founder|provider|manager|head|worker/.test(aText);

  const floor = aIsFloor ? aVal : bVal;
  const ceiling = aIsFloor ? bVal : aVal;
  const floorAgent = aIsFloor ? a : b;
  const ceilingAgent = aIsFloor ? b : a;

  return { floor, ceiling, gap: ceiling - floor, isPositive: ceiling >= floor, floorAgent, ceilingAgent };
}

// ---------------------------------------------------------------------------
// ZopaVisualizer sub-component
// ---------------------------------------------------------------------------
function ZopaVisualizer({ agents }) {
  const zopa = useMemo(() => computeZopa(agents), [agents]);
  if (!zopa) return null;

  const { floor, ceiling, gap, isPositive, floorAgent, ceilingAgent } = zopa;
  const min = Math.min(floor, ceiling) * 0.85;
  const max = Math.max(floor, ceiling) * 1.15;
  const range = max - min || 1;
  const floorPct = ((floor - min) / range) * 100;
  const ceilPct = ((ceiling - min) / range) * 100;
  const leftPct = Math.min(floorPct, ceilPct);
  const widthPct = Math.abs(ceilPct - floorPct);
  const fmt = (n) => n >= 1000 ? `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : `$${n.toLocaleString()}`;

  return (
    <section aria-label="ZOPA Zone of Possible Agreement" className="rounded-2xl border border-[#302F39] bg-[#1E1D24] p-5 space-y-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <p className="text-xs font-mono font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            ZOPA Pre-flight Analysis
          </p>
          <p className="text-[11px] text-slate-400 font-body mt-0.5">
            Zone of Possible Agreement — checks if an overlap exists before negotiation starts.
          </p>
        </div>
        <span className={`shrink-0 inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 font-mono text-xs font-bold ${
          isPositive ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border-red-500/30 bg-red-500/10 text-red-400"
        }`}>
          {isPositive ? (
            <>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
              ZOPA: +{fmt(gap)} overlap
            </>
          ) : (
            <>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              GAP: {fmt(Math.abs(gap))} apart
            </>
          )}
        </span>
      </div>

      {/* Visual bar */}
      <div className="relative w-full h-8 rounded-full bg-[#2B2A33] overflow-hidden">
        <div
          className={`absolute top-0 h-full rounded-full transition-all duration-500 ${
            isPositive ? "bg-emerald-500/30" : "bg-red-500/30"
          }`}
          style={{ left: `${leftPct}%`, width: `${Math.max(widthPct, 1)}%` }}
        />
        <div className="absolute top-0 h-full w-0.5 bg-sky-400" style={{ left: `${floorPct}%` }} />
        <div className="absolute top-0 h-full w-0.5 bg-purple-400" style={{ left: `${ceilPct}%` }} />
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-[11px] font-mono">
        <div className="flex items-center gap-1.5 text-sky-300">
          <span className="inline-block h-2 w-2 rounded-full bg-sky-400" />
          <span className="font-bold">{floorAgent?.name}</span>
          <span className="text-slate-400">floor {fmt(floor)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-purple-300">
          <span className="text-slate-400">ceiling {fmt(ceiling)}</span>
          <span className="font-bold">{ceilingAgent?.name}</span>
          <span className="inline-block h-2 w-2 rounded-full bg-purple-400" />
        </div>
      </div>

      {/* Warning if no agreement zone */}
      {!isPositive && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-red-400 mt-0.5 shrink-0">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <p className="text-xs text-red-300 font-body">
            <span className="font-bold">No agreement zone detected.</span> The constraint values create a gap of{" "}
            <span className="font-bold">{fmt(Math.abs(gap))}</span> between the floor and ceiling. Adjust agent
            constraints above to create an overlap, or expect a likely deadlock or breakdown.
          </p>
        </div>
      )}
    </section>
  );
}

import ScenarioDescription from "../components/ScenarioDescription";
import AgentCard from "../components/AgentCard";
import StartNegotiationButton from "../components/StartNegotiationButton";
import ReadyBanner from "../components/ReadyBanner";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";
import NegotiationSessionPanel from "../components/NegotiationSessionPanel";

import { useScenarioConfiguration } from "../hooks/useScenarioConfiguration.js";
import { useNegotiationEngine } from "../hooks/useNegotiationEngine.js";
import { scenarioList } from "../data/scenarios.js";

export default function AgentConfiguration({ onNegotiationStart, onNegotiationReset, initialScenario }) {
  const {
    selectedScenarioId,
    selectedScenario,
    agents,
    isLoading,
    error,
    configurationValid,
    selectScenario,
    retry,
    updateAgentConstraint,
    updateAgentPersonality,
  } = useScenarioConfiguration();

  // Sync the scenario from the Scenarios page into this page
  useEffect(() => {
    if (initialScenario) {
      const id = initialScenario.scenario_id || initialScenario.id;
      if (id && id !== selectedScenarioId) {
        selectScenario(id);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialScenario]);

  const negotiation = useNegotiationEngine();
  const [isStarting, setIsStarting] = useState(false);

  // -------------------------------------------------------------------------
  // Milestone 3: Participant Mode & Human Role Selection
  // Auto-saved to localStorage so settings survive navigation
  // -------------------------------------------------------------------------
  const [mode, setMode] = useState(
    () => localStorage.getItem("nego_mode") || "simulation"
  );
  const [humanRole, setHumanRole] = useState(
    () => localStorage.getItem("nego_humanRole") || ""
  );
  const [maxRounds, setMaxRounds] = useState(
    () => Number(localStorage.getItem("nego_maxRounds")) || 5
  );
  const [difficulty, setDifficulty] = useState(
    () => localStorage.getItem("nego_difficulty") || "Intermediate"
  );
  const [aiPersonality, setAiPersonality] = useState(
    () => localStorage.getItem("nego_aiPersonality") || "Collaborative"
  );

  // Persist to localStorage on every change
  useEffect(() => { localStorage.setItem("nego_mode", mode); }, [mode]);
  useEffect(() => { localStorage.setItem("nego_humanRole", humanRole); }, [humanRole]);
  useEffect(() => { localStorage.setItem("nego_maxRounds", String(maxRounds)); }, [maxRounds]);
  useEffect(() => { localStorage.setItem("nego_difficulty", difficulty); }, [difficulty]);
  useEffect(() => { localStorage.setItem("nego_aiPersonality", aiPersonality); }, [aiPersonality]);

  const activeHumanRole = humanRole || (agents[0]?.role || "buyer");

  // -------------------------------------------------------------------------
  // Validation reason — clear human-readable explanation of what is missing
  // -------------------------------------------------------------------------
  const invalidReason = useMemo(() => {
    if (!selectedScenario) return "Select a scenario to continue.";
    if (agents.length === 0) return "Agent configuration is loading.";
    const allReady = agents.every(
      (a) => a.name && a.role && a.goal && a.constraints?.length && a.personality
    );
    if (!allReady) return "Complete the constraint parameters for both agents.";
    if (mode === "practice" && !humanRole) return "Choose your human role to start Practice Mode.";
    return null;
  }, [selectedScenario, agents, mode, humanRole]);

  // -------------------------------------------------------------------------
  // ZOPA — derived live from agents constraints
  // -------------------------------------------------------------------------
  const zopaData = useMemo(() => computeZopa(agents), [agents]);

  async function handleStartNegotiation() {
    if (!configurationValid || !selectedScenario || isStarting) return;
    setIsStarting(true);
    try {
      if (onNegotiationStart) {
        await onNegotiationStart(selectedScenario, mode, activeHumanRole, maxRounds, difficulty, aiPersonality);
      } else {
        await negotiation.start(selectedScenario, mode, activeHumanRole, null, maxRounds, difficulty, aiPersonality);
      }
    } catch (err) {
      console.error("Error starting negotiation session:", err);
    } finally {
      setIsStarting(false);
    }
  }

  function handleScenarioChange(scenarioId) {
    if (onNegotiationReset) {
      onNegotiationReset();
    } else {
      negotiation.reset();
    }
    selectScenario(scenarioId);
    setHumanRole(""); // reset role for new scenario
    localStorage.removeItem("nego_humanRole");
  }

  const agentChecks = agents.map(
    (agent) =>
      Boolean(
        agent.name &&
        agent.role &&
        agent.goal &&
        agent.constraints?.length &&
        agent.personality
      )
  );

  const configuredAgentCount = agentChecks.filter(Boolean).length;

  return (
    <main data-guide="agent-configuration-shell" className="min-h-full flex-1 bg-[#17161B] px-4 py-6 sm:px-8 text-textPrimary animate-fadeIn">
      <div className="mx-auto max-w-[1500px] space-y-8">

        {/* =====================================================
            1. SYMMETRICAL PAGE HEADER & STEPPER CARDS
        ====================================================== */}
        <section className="border-b border-[#292831] pb-6 space-y-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-xs font-semibold uppercase tracking-widest text-emerald-400">
                  ORCHESTRATOR ENGINE CONFIGURATION
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
                Configure Negotiation Session
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-textSecondary font-body">
                Select an economic scenario, choose Simulation or Practice mode, tune parameters, and deploy.
              </p>
            </div>
          </div>

          {/* Pre-selected Scenario Banner (from Scenarios page) */}
          {initialScenario && selectedScenario && (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">Scenario Pre-Selected</p>
                <p className="text-sm font-bold text-white truncate">
                  {selectedScenario.scenario_name || selectedScenario.name}
                </p>
              </div>
              <span className="text-xs text-slate-400 font-body shrink-0">Selected from Scenarios page</span>
            </div>
          )}

          {/* Mode Switcher Banner */}
          <div className="rounded-2xl border border-[#302F39] bg-[#201F25] p-5 shadow-sm space-y-4 font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                  Session Mode Selection
                </p>
                <h3 className="text-base font-bold text-white">Choose How You Negotiate</h3>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 rounded-xl border border-[#3A3944] bg-[#17161B] p-1">
                <button
                  type="button"
                  onClick={() => setMode("simulation")}
                  className={`flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${mode === "simulation"
                      ? "bg-emerald-500 text-slate-950 shadow-md font-extrabold"
                      : "text-slate-300 hover:text-white"
                    }`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                  Simulation Mode (AI ↔ AI)
                </button>

                <button
                  type="button"
                  onClick={() => setMode("practice")}
                  className={`flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${mode === "practice"
                      ? "bg-emerald-500 text-slate-950 shadow-md font-extrabold"
                      : "text-slate-300 hover:text-white"
                    }`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Practice Mode (Human ↔ AI)
                </button>
              </div>
            </div>

            {mode === "practice" && agents.length > 0 && (
              <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#2D2C36] text-xs">
                <span className="font-mono font-bold text-slate-400">Select Your Human Role:</span>
                <div className="flex flex-wrap items-center gap-2">
                  {agents.map((agent) => (
                    <button
                      key={agent.id}
                      type="button"
                      onClick={() => setHumanRole(agent.role)}
                      className={`rounded-xl border px-3 py-1.5 font-bold transition-all cursor-pointer ${activeHumanRole.toLowerCase() === agent.role.toLowerCase()
                          ? "border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-sm"
                          : "border-[#3A3944] bg-[#25242C] text-slate-300 hover:text-white"
                        }`}
                    >
                      Human: {agent.name} ({agent.role})
                    </button>
                  ))}
                </div>
              </div>
            )}

            {mode === "practice" && (
              <div className="space-y-3 pt-3 border-t border-[#2D2C36]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                      Practice Difficulty Level
                    </p>
                    <p className="text-xs text-slate-400 font-body">
                      Calibrates opponent concession magnitude, anchoring, and package complexity.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {[
                      { id: "Beginner", label: "Beginner", desc: "Forgiving concessions" },
                      { id: "Intermediate", label: "Intermediate", desc: "Balanced trade-offs" },
                      { id: "Advanced", label: "Advanced", desc: "Strategic packages" },
                      { id: "Expert", label: "Expert", desc: "Minimal concessions" },
                    ].map((lvl) => (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => setDifficulty(lvl.id)}
                        className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${difficulty === lvl.id
                            ? "border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-sm"
                            : "border-[#3A3944] bg-[#25242C] text-slate-300 hover:text-white"
                          }`}
                        title={lvl.desc}
                      >
                        {lvl.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div>
                    <p className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400">
                      AI Opponent Persona
                    </p>
                    <p className="text-xs text-slate-400 font-body">
                      Select AI negotiation temperament and strategic posture.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {["Aggressive", "Collaborative", "Risk-Averse"].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setAiPersonality(p)}
                        className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${aiPersonality === p
                            ? "border-purple-400 bg-purple-500/20 text-purple-300 shadow-sm"
                            : "border-[#3A3944] bg-[#25242C] text-slate-300 hover:text-white"
                          }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Round Selection */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-[#2D2C36]">
              <div>
                <p className="text-xs font-mono font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  Negotiation Round Limit Selection
                </p>
                <p className="text-xs text-slate-400 font-body mt-0.5">
                  Set maximum turn limit before deadlock triggers if no agreement is reached.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 font-mono">
                {[3, 5, 8, 10, 12].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setMaxRounds(r)}
                    className={`rounded-xl border px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${maxRounds === r
                        ? "border-sky-400 bg-sky-500/20 text-sky-300 shadow-md scale-105"
                        : "border-[#3A3944] bg-[#17161B] text-slate-300 hover:text-white hover:border-slate-500"
                      }`}
                  >
                    {r} Rounds {r === 5 ? "(Default)" : ""}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Symmetrical 3-Step Progress Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="flex items-center gap-3 rounded-2xl border border-white bg-[#25242C] p-4 shadow-sm">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-white text-slate-950 font-black text-xs">
                1
              </span>
              <div>
                <p className="font-bold text-white uppercase font-sans">1. Select Scenario</p>
                <p className="text-[11px] text-slate-400 font-body">Choose business situation</p>
              </div>
            </div>

            <div className={`flex items-center gap-3 rounded-2xl border p-4 transition-all ${selectedScenario
                ? "border-slate-400 bg-[#222129] text-white"
                : "border-[#2A2931] bg-[#1E1D24] text-slate-400"
              }`}>
              <span className={`flex h-7 w-7 items-center justify-center rounded-xl font-black text-xs ${selectedScenario ? "bg-slate-200 text-slate-950" : "bg-[#2A2933] text-slate-400"
                }`}>
                2
              </span>
              <div>
                <p className="font-bold uppercase font-sans">2. Configure Session</p>
                <p className="text-[11px] text-slate-400 font-body">Mode, rounds & difficulty</p>
              </div>
            </div>

            <div className={`flex items-center gap-3 rounded-2xl border p-4 transition-all ${configurationValid
                ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                : "border-[#2A2931] bg-[#1E1D24] text-slate-400"
              }`}>
              <span className={`flex h-7 w-7 items-center justify-center rounded-xl font-black text-xs ${configurationValid ? "bg-emerald-400 text-slate-950" : "bg-[#2A2933] text-slate-400"
                }`}>
                3
              </span>
              <div>
                <p className="font-bold uppercase font-sans">3. Deploy Engine</p>
                <p className="text-[11px] text-slate-400 font-body">Launch simulation</p>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            2. SYMMETRICAL SCENARIO SELECTION GRID
        ====================================================== */}
        <section data-guide="scenario-selector" aria-labelledby="scenario-heading" className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 id="scenario-heading" className="text-lg font-bold text-white font-sans flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-300">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                Negotiation Scenario Selection
              </h2>
              <p className="mt-0.5 text-xs text-textMuted font-body">
                Select the target economic domain for agent simulation.
              </p>
            </div>
          </div>

          {/* Symmetrical 3-Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {scenarioList.map((scenario) => {
              const isActive = scenario.id === selectedScenarioId;
              const indexNum = scenarioList.findIndex((item) => item.id === scenario.id) + 1;

              return (
                <button
                  key={scenario.id}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleScenarioChange(scenario.id)}
                  className={`
                    group relative flex h-full flex-col justify-between rounded-2xl border p-6 text-left transition-all duration-200
                    ${isActive
                      ? "border-2 border-white bg-[#25242C] shadow-lg"
                      : "border-[#2D2C36] bg-[#201F25] hover:border-slate-400 hover:bg-[#25242C]"
                    }
                  `}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        SCENARIO 0{indexNum}
                      </span>

                      {isActive && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1 font-mono text-[10px] font-bold text-white uppercase tracking-wider border border-white/20">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          Selected
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-white font-sans">{scenario.name}</h3>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#2B2A33] flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span>2 Parties Involved</span>
                    <span className="group-hover:translate-x-0.5 transition-transform text-white">Select →</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Symmetrical Scenario Description Banner */}
          {selectedScenario && !isLoading && !error && (
            <div className="rounded-2xl border border-[#302F39] bg-[#222129] p-6 shadow-sm">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#3A3944] bg-[#2A2933] text-white" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </span>
                <ScenarioDescription description={selectedScenario.description} />
              </div>
            </div>
          )}
        </section>

        {/* Loading / Error / Empty States */}
        {isLoading && <LoadingState message="Loading scenario configuration..." />}
        {!isLoading && error && <ErrorState onRetry={retry} />}
        {!isLoading && !error && agents.length === 0 && <EmptyState />}

        {/* =====================================================
            3. AGENT CONFIGURATION CARDS
        ====================================================== */}
        {!isLoading && !error && agents.length > 0 && (
          <section aria-labelledby="agents-heading" className="space-y-5">
            <div className="flex items-center gap-3">
              <div>
                <h2 id="agents-heading" className="text-lg font-bold text-white font-sans flex items-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-400">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  Agent Configuration
                </h2>
                <p className="mt-0.5 text-xs text-textMuted font-body">
                  Review and tune each negotiating agent's goals, constraints, and personality.
                </p>
              </div>
              <div className="ml-auto flex items-center gap-2 rounded-xl border border-[#302F39] bg-[#201F25] px-3 py-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-xs font-bold text-emerald-400">
                  {agents.length} AGENT{agents.length !== 1 ? "S" : ""} LOADED
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              {agents.map((agent, index) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  index={index + 1}
                  onConstraintChange={updateAgentConstraint}
                  onPersonalityChange={updateAgentPersonality}
                />
              ))}
            </div>
          </section>
        )}

        {/* =====================================================
            4. ZOPA PRE-FLIGHT VISUALIZER
        ====================================================== */}
        {!isLoading && !error && agents.length > 0 && zopaData && (
          <ZopaVisualizer agents={agents} />
        )}

        {/* =====================================================
            5. UNIFIED SYMMETRICAL ACTION BAR (READY BANNER + CTA)
        ====================================================== */}
        {!isLoading && !error && agents.length > 0 && (
          <section className="pt-2">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-7 h-full">
                <ReadyBanner
                  isValid={configurationValid}
                  agentCount={configuredAgentCount}
                  invalidReason={invalidReason}
                />
              </div>
              <div className="lg:col-span-5 h-full">
                <StartNegotiationButton
                  disabled={!configurationValid}
                  isStarting={isStarting}
                  onClick={handleStartNegotiation}
                  statusMessage={invalidReason}
                />
              </div>
            </div>
          </section>
        )}

        {/* Live Negotiation Arena Session Panel if active */}
        {negotiation.hasStarted && selectedScenario && (
          <div data-guide="negotiation-arena" className="pt-4">
            <NegotiationSessionPanel
              scenario={selectedScenario}
              state={negotiation.state}
              isRunning={negotiation.isRunning}
              timeline={negotiation.timeline}
              concessionTotals={negotiation.concessionTotals}
              onStep={negotiation.step}
              onRunToCompletion={negotiation.runToCompletion}
              onReset={negotiation.reset}
            />
          </div>
        )}

      </div>
    </main>
  );
}