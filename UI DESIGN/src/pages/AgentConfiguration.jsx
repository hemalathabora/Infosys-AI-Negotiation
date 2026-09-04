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
      {/* Grid */}
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

      {/* List */}
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
  } = useScenarioConfiguration();

  const negotiation = useNegotiationEngine();
  const [view, setView] = useState("grid");

  function handleStartNegotiation() {
    if (!configurationValid || !selectedScenario) return;
    if (onNegotiationStart) {
      onNegotiationStart(selectedScenario);
    } else {
      negotiation.start(selectedScenario);
    }
  }

  function handleConstraintChange(agentId, constraintIndex, nextValue) {
    updateAgentConstraint(agentId, constraintIndex, nextValue);
  }

  function handleScenarioChange(scenarioId) {
    if (onNegotiationReset) {
      onNegotiationReset();
    } else {
      negotiation.reset();
    }
    selectScenario(scenarioId);
  }

  const agentChecks = agents.map(
    (a) => Boolean(a.name && a.role && a.goal && a.constraints?.length && a.personality)
  );

  const configuredAgentCount = agentChecks.filter(Boolean).length;

  return (
    <main data-guide="agent-configuration-shell" className="min-h-full flex-1 bg-[#17161B] px-4 py-6 sm:px-8 text-textPrimary animate-fadeIn">
      <div className="mx-auto max-w-[1500px] space-y-8">

        {/* =====================================================
            PAGE HEADER & STEPPER
        ====================================================== */}
        <section className="border-b border-[#292831] pb-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <span className="font-mono text-xs font-semibold uppercase tracking-widest text-emerald-400">
              AGENT STRATEGY ORCHESTRATOR
            </span>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
                Configure Negotiation Engine
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-textSecondary font-body">
                Select a business situation and tune participating AI agent personas & boundary constraints.
              </p>
            </div>

            {/* Stepper pills */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="rounded-xl border border-[#302F39] bg-[#222129] px-3.5 py-1.5 font-bold text-white">
                1. Scenario
              </span>
              <span className="text-[#61606E]">→</span>
              <span className="rounded-xl border border-[#2A2931] bg-[#1E1D24] px-3.5 py-1.5 font-medium text-slate-400">
                2. Personas
              </span>
              <span className="text-[#61606E]">→</span>
              <span className="rounded-xl border border-[#2A2931] bg-[#1E1D24] px-3.5 py-1.5 font-medium text-slate-400">
                3. Launch
              </span>
            </div>
          </div>
        </section>

        {/* =====================================================
            SCENARIO SELECTION SECTION
        ====================================================== */}
        <section data-guide="scenario-selector" aria-labelledby="scenario-heading" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 id="scenario-heading" className="text-lg font-bold text-white font-sans flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-300">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                Select Business Scenario
              </h2>
              <p className="mt-0.5 text-xs text-textMuted font-body">
                Choose the economic context for the AI agents to simulate.
              </p>
            </div>
          </div>

          {/* Scenario Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {scenarioList.map((scenario) => {
              const isActive = scenario.id === selectedScenarioId;

              return (
                <button
                  key={scenario.id}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleScenarioChange(scenario.id)}
                  className={`
                    group relative rounded-2xl border p-5 text-left transition-all duration-200
                    ${
                      isActive
                        ? "border-white bg-[#25242C] shadow-lg"
                        : "border-[#2D2C36] bg-[#201F25] hover:border-slate-400 hover:bg-[#25242C]"
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Scenario {scenarioList.findIndex((item) => item.id === scenario.id) + 1}
                    </span>

                    {isActive && (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2 py-0.5 font-mono text-[10px] font-bold text-white uppercase tracking-wider border border-white/20">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Selected
                      </span>
                    )}
                  </div>

                  <p className="mt-3 text-xl font-bold text-white font-sans">{scenario.name}</p>
                </button>
              );
            })}
          </div>

          {/* Scenario Description Banner */}
          {selectedScenario && !isLoading && !error && (
            <div className="rounded-2xl border border-[#302F39] bg-[#222129] p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#3A3944] bg-[#2A2933] text-white" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
            NEGOTIATING PARTIES SECTION
        ====================================================== */}
        <section data-guide="agents-panel" aria-labelledby="parties-heading" className="space-y-4 pt-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 id="parties-heading" className="text-lg font-bold text-white font-sans flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-300">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                Participating AI Agents
              </h2>
              <p className="mt-0.5 text-xs text-textMuted font-body">
                Adjust boundary values and persona strategy modes for Agent A & Agent B.
              </p>
            </div>

            <ViewToggle view={view} onChange={setView} />
          </div>

          {/* Loading / Error / Empty */}
          {isLoading && <LoadingState message="Loading agent personas..." />}
          {!isLoading && error && <ErrorState onRetry={retry} />}
          {!isLoading && !error && agents.length === 0 && <EmptyState />}

          {/* Agent Cards */}
          {!isLoading && !error && agents.length > 0 && (
            <div className={`grid grid-cols-1 gap-6 ${view === "grid" ? "lg:grid-cols-2" : ""}`}>
              {agents.map((agent, i) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  index={i + 1}
                  onConstraintChange={handleConstraintChange}
                />
              ))}
            </div>
          )}
        </section>

        {/* Ready Banner */}
        {!isLoading && !error && agents.length > 0 && (
          <ReadyBanner isValid={configurationValid} agentCount={configuredAgentCount} />
        )}

        {/* Live Simulation Feed if started */}
        {negotiation.hasStarted && selectedScenario && (
          <div data-guide="negotiation-arena">
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

        {/* Start Button */}
        {!isLoading && !error && (
          <div className="pt-2">
            <StartNegotiationButton
              disabled={!configurationValid}
              isStarting={false}
              onClick={handleStartNegotiation}
            />
          </div>
        )}
      </div>
    </main>
  );
}
