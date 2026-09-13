import { useState } from "react";

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

function ViewToggle({ view, onChange }) {
  return (
    <div className="flex items-center gap-1 rounded-xl border border-[#302F39] bg-[#1E1D24] p-1">
      {/* Grid View */}
      <button
        type="button"
        aria-label="Grid view"
        aria-pressed={view === "grid"}
        onClick={() => onChange("grid")}
        className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
          view === "grid" ? "bg-[#2A2933] text-white" : "text-[#71707E] hover:text-white"
        }`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
          <rect x="13" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
          <rect x="3" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
          <rect x="13" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      </button>

      {/* List View */}
      <button
        type="button"
        aria-label="List view"
        aria-pressed={view === "list"}
        onClick={() => onChange("list")}
        className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
          view === "list" ? "bg-[#2A2933] text-white" : "text-[#71707E] hover:text-white"
        }`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

export default function AgentConfiguration({ onNegotiationStart, onNegotiationReset }) {
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

  const negotiation = useNegotiationEngine();
  const [view, setView] = useState("grid");
  const [isStarting, setIsStarting] = useState(false);

  // Milestone 3: Participant Mode ("simulation" | "practice") & Human Role Selection
  const [mode, setMode] = useState("simulation"); 
  const [humanRole, setHumanRole] = useState("");

  const activeHumanRole = humanRole || (agents[0]?.role || "buyer");

  async function handleStartNegotiation() {
    if (!configurationValid || !selectedScenario || isStarting) return;
    setIsStarting(true);
    try {
      if (onNegotiationStart) {
        await onNegotiationStart(selectedScenario, mode, activeHumanRole);
      } else {
        await negotiation.start(selectedScenario, mode, activeHumanRole);
      }
    } catch (err) {
      console.error("Error starting negotiation session:", err);
    } finally {
      setIsStarting(false);
    }
  }

  function handleConstraintChange(agentId, constraintIndex, nextValue) {
    updateAgentConstraint(agentId, constraintIndex, nextValue);
  }

  function handlePersonalityChange(agentId, nextPersonality) {
    updateAgentPersonality(agentId, nextPersonality);
  }

  function handleScenarioChange(scenarioId) {
    if (onNegotiationReset) {
      onNegotiationReset();
    } else {
      negotiation.reset();
    }
    selectScenario(scenarioId);
    setHumanRole(""); // reset role for scenario
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

          {/* Mode Switcher Banner */}
          <div className="rounded-2xl border border-[#302F39] bg-[#201F25] p-5 shadow-sm space-y-4 font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                  Session Mode Selection
                </p>
                <h3 className="text-base font-bold text-white">Choose How You Negotiate</h3>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-[#3A3944] bg-[#17161B] p-1">
                <button
                  type="button"
                  onClick={() => setMode("simulation")}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                    mode === "simulation"
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
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                    mode === "practice"
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
              <div className="flex items-center gap-3 pt-2 border-t border-[#2D2C36] text-xs">
                <span className="font-mono font-bold text-slate-400">Select Your Human Role:</span>
                <div className="flex items-center gap-2">
                  {agents.map((agent) => (
                    <button
                      key={agent.id}
                      type="button"
                      onClick={() => setHumanRole(agent.role)}
                      className={`rounded-xl border px-3 py-1.5 font-bold transition-all cursor-pointer ${
                        activeHumanRole.toLowerCase() === agent.role.toLowerCase()
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

            <div className={`flex items-center gap-3 rounded-2xl border p-4 transition-all ${
              selectedScenario
                ? "border-slate-400 bg-[#222129] text-white"
                : "border-[#2A2931] bg-[#1E1D24] text-slate-400"
            }`}>
              <span className={`flex h-7 w-7 items-center justify-center rounded-xl font-black text-xs ${
                selectedScenario ? "bg-slate-200 text-slate-950" : "bg-[#2A2933] text-slate-400"
              }`}>
                2
              </span>
              <div>
                <p className="font-bold uppercase font-sans">2. Tune Personas</p>
                <p className="text-[11px] text-slate-400 font-body">Set goals & constraints</p>
              </div>
            </div>

            <div className={`flex items-center gap-3 rounded-2xl border p-4 transition-all ${
              configurationValid
                ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                : "border-[#2A2931] bg-[#1E1D24] text-slate-400"
            }`}>
              <span className={`flex h-7 w-7 items-center justify-center rounded-xl font-black text-xs ${
                configurationValid ? "bg-emerald-400 text-slate-950" : "bg-[#2A2933] text-slate-400"
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
                    ${
                      isActive
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

        {/* =====================================================
            3. SYMMETRICAL AGENTS GRID (PARTY A & PARTY B)
        ====================================================== */}
        <section data-guide="agents-panel" aria-labelledby="parties-heading" className="space-y-5 pt-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 id="parties-heading" className="text-lg font-bold text-white font-sans flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-300">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                Participating AI Agent Personas
              </h2>
              <p className="mt-0.5 text-xs text-textMuted font-body">
                Fine-tune constraints and behavioral policies for both Party 01 and Party 02.
              </p>
            </div>

            <ViewToggle view={view} onChange={setView} />
          </div>

          {/* Loading / Error / Empty States */}
          {isLoading && <LoadingState message="Loading agent personas..." />}
          {!isLoading && error && <ErrorState onRetry={retry} />}
          {!isLoading && !error && agents.length === 0 && <EmptyState />}

          {/* Symmetrical Equal-Height Cards Grid */}
          {!isLoading && !error && agents.length > 0 && (
            <div className={`grid grid-cols-1 gap-6 items-stretch ${view === "grid" ? "lg:grid-cols-2" : ""}`}>
              {agents.map((agent, index) => (
                <div key={agent.id} className="h-full">
                  <AgentCard
                    agent={agent}
                    index={index + 1}
                    onConstraintChange={handleConstraintChange}
                    onPersonalityChange={handlePersonalityChange}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* =====================================================
            4. UNIFIED SYMMETRICAL ACTION BAR (READY BANNER + CTA)
        ====================================================== */}
        {!isLoading && !error && agents.length > 0 && (
          <section className="pt-2">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-7 h-full">
                <ReadyBanner isValid={configurationValid} agentCount={configuredAgentCount} />
              </div>
              <div className="lg:col-span-5 h-full">
                <StartNegotiationButton
                  disabled={!configurationValid}
                  isStarting={isStarting}
                  onClick={handleStartNegotiation}
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