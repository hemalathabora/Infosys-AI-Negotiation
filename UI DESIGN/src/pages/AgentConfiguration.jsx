import { useState } from "react";
import ScenarioSelector from "../components/ScenarioSelector";
import ScenarioDescription from "../components/ScenarioDescription";
import AgentCard from "../components/AgentCard";
import ConfigurationStatus from "../components/ConfigurationStatus";
import PersonalitiesInfoPanel from "../components/PersonalitiesInfoPanel";
import StartNegotiationButton from "../components/StartNegotiationButton";
import ReadyBanner from "../components/ReadyBanner";
import NegotiationSessionPanel from "../components/NegotiationSessionPanel";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";
import { useScenarioConfiguration } from "../hooks/useScenarioConfiguration.js";
import { useNegotiationEngine } from "../hooks/useNegotiationEngine.js";
import { scenarioList } from "../data/scenarios.js";

function ViewToggle({ view, onChange }) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-border bg-cardAlt p-1">
      <button
        type="button"
        aria-label="Grid view"
        aria-pressed={view === "grid"}
        onClick={() => onChange("grid")}
        className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
          view === "grid" ? "bg-primary/15 text-primary" : "text-textSecondary hover:text-textPrimary"
        }`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
          <rect x="13" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
          <rect x="3" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
          <rect x="13" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      </button>
      <button
        type="button"
        aria-label="List view"
        aria-pressed={view === "list"}
        onClick={() => onChange("list")}
        className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
          view === "list" ? "bg-primary/15 text-primary" : "text-textSecondary hover:text-textPrimary"
        }`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

export default function AgentConfiguration() {
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
    negotiation.start(selectedScenario);
  }

  function handleConstraintChange(agentId, constraintIndex, nextValue) {
    updateAgentConstraint(agentId, constraintIndex, nextValue);
  }

  function handleScenarioChange(scenarioId) {
    negotiation.reset();
    selectScenario(scenarioId);
  }

  const agentChecks = agents.map(
    (a) => Boolean(a.name && a.role && a.goal && a.constraints?.length && a.personality)
  );
  const configuredAgentCount = agentChecks.filter(Boolean).length;

  return (
    <main data-guide="agent-configuration-shell" className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-[1500px]">
        <section
          data-guide="scenario-selector"
          aria-labelledby="scenario-heading"
          className="mb-6"
        >
          <h2 id="scenario-heading" className="text-[2rem] font-black uppercase tracking-[0.05em] text-[#4dd0ff]">
            Negotiation Scenario
          </h2>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            {scenarioList.map((scenario) => {
              const isActive = scenario.id === selectedScenarioId;
              return (
                <button
                  key={scenario.id}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleScenarioChange(scenario.id)}
                  className={`rounded-2xl border p-4 text-left transition-all ${
                    isActive
                      ? "border-[#4dd0ff] bg-[#0c2f45] shadow-card"
                      : "border-[#1d374d] bg-[#0e2338] hover:border-[#4dd0ff]/70 hover:bg-[#142d42]"
                  }`}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7fa7c0]">
                    Scenario {scenarioList.findIndex((item) => item.id === scenario.id) + 1}
                  </p>
                  <p className="mt-2 text-2xl font-extrabold text-white">{scenario.name}</p>
                </button>
              );
            })}
          </div>

          {selectedScenario && !isLoading && !error && (
            <div className="mt-5 rounded-2xl border border-[#214a69] bg-[#0e2338] p-4">
              <div className="flex items-start gap-3">
                <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#4dd0ff] bg-[#112d3d] text-[#4dd0ff]" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M7 4.5h7l5 5V18a2 2 0 01-2 2H7a2 2 0 01-2-2V6.5a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
                    <path d="M14 4.5v5h5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
                  </svg>
                </span>
                <ScenarioDescription description={selectedScenario.description} />
              </div>
            </div>
          )}
        </section>

        <section data-guide="agents-panel" aria-labelledby="parties-heading" className="mb-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#112d3d] text-[#4dd0ff]"
                aria-hidden="true"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="9" cy="8" r="2.6" stroke="currentColor" strokeWidth="1.6" />
                  <circle cx="17" cy="9" r="2.2" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M3 19a6 6 0 0112 0M14.5 19a4.5 4.5 0 019 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </span>
              <div>
                <h2 id="parties-heading" className="text-[2rem] font-black uppercase tracking-[0.05em] text-[#4dd0ff]">
                  Negotiating Parties
                </h2>
                <p className="text-sm text-[#8ca6bb]">
                  Review the predefined roles and negotiation objectives.
                </p>
              </div>
            </div>
            <ViewToggle view={view} onChange={setView} />
          </div>

          {isLoading && <LoadingState message="Loading agent personas..." />}

          {!isLoading && error && <ErrorState onRetry={retry} />}

          {!isLoading && !error && agents.length === 0 && <EmptyState />}

          {!isLoading && !error && agents.length > 0 && (
            <div className={`grid grid-cols-1 gap-5 ${view === "grid" ? "lg:grid-cols-2" : ""}`}>
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

        {!isLoading && !error && agents.length > 0 && (
          <div className="mb-6">
            <ReadyBanner isValid={configurationValid} agentCount={configuredAgentCount} />
          </div>
        )}

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

        {!isLoading && !error && (
          <div className="mt-6 flex justify-end">
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
