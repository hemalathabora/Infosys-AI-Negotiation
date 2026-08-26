import { useState } from "react";
import ScenarioSelector from "../components/ScenarioSelector";
import ScenarioDescription from "../components/ScenarioDescription";
import AgentCard from "../components/AgentCard";
import ConfigurationStatus from "../components/ConfigurationStatus";
import PersonalitiesInfoPanel from "../components/PersonalitiesInfoPanel";
import StartNegotiationButton from "../components/StartNegotiationButton";
import ReadyBanner from "../components/ReadyBanner";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";
import { useScenarioConfiguration } from "../hooks/useScenarioConfiguration";
import { scenarioList } from "../data/scenarios";
import { buildOrchestratorHandoff } from "../services/scenarioService";

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
    isStarting,
    setIsStarting,
    configurationValid,
    selectScenario,
    retry,
  } = useScenarioConfiguration();

  const [handoffPreview, setHandoffPreview] = useState(null);
  const [view, setView] = useState("grid");

  async function handleStartNegotiation() {
    if (!configurationValid || !selectedScenario) return;
    setIsStarting(true);
    setHandoffPreview(null);
    try {
      const handoff = buildOrchestratorHandoff(selectedScenario);

      // No Negotiation Arena route exists in this repo yet, so we surface
      // the structured handoff object instead of navigating — swap this
      // for a router push once that module lands.
      await new Promise((resolve) => setTimeout(resolve, 500));
      setHandoffPreview(handoff);
    } finally {
      setIsStarting(false);
    }
  }

  const agentChecks = agents.map(
    (a) => Boolean(a.name && a.role && a.goal && a.constraints?.length && a.personality)
  );
  const configuredAgentCount = agentChecks.filter(Boolean).length;

  return (
    <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-6 xl:flex-row xl:items-start">
        {/* Main column */}
        <div className="min-w-0 flex-1">
          <header className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight text-textPrimary">
              Agent Configuration
            </h1>
            <p className="mt-1.5 text-sm text-textSecondary">
              Configure the negotiating agents before starting the session.
            </p>
          </header>

          <section
            aria-labelledby="scenario-heading"
            className="mb-6 flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-end"
          >
            <h2 id="scenario-heading" className="sr-only">
              Scenario selection
            </h2>
            <ScenarioSelector
              scenarioList={scenarioList}
              selectedScenarioId={selectedScenarioId}
              onChange={selectScenario}
              disabled={isLoading}
            />
            {selectedScenario && !isLoading && !error && (
              <ScenarioDescription description={selectedScenario.description} />
            )}
          </section>

          <section aria-labelledby="parties-heading" className="mb-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary"
                  aria-hidden="true"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="9" cy="8" r="2.6" stroke="currentColor" strokeWidth="1.6" />
                    <circle cx="17" cy="9" r="2.2" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M3 19a6 6 0 0112 0M14.5 19a4.5 4.5 0 019 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </span>
                <div>
                  <h2 id="parties-heading" className="text-sm font-bold uppercase tracking-wider text-primary">
                    Negotiating Parties
                  </h2>
                  <p className="text-xs text-textSecondary">
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
                  <AgentCard key={agent.id} agent={agent} index={i + 1} />
                ))}
              </div>
            )}
          </section>

          {!isLoading && !error && agents.length > 0 && (
            <ReadyBanner isValid={configurationValid} agentCount={configuredAgentCount} />
          )}

          {handoffPreview && (
            <div className="mt-6 rounded-2xl border border-border bg-card p-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-primary">
                Orchestrator handoff prepared
              </p>
              <pre className="max-w-full overflow-x-auto text-xs text-textSecondary">
                {JSON.stringify(handoffPreview, null, 2)}
              </pre>
              <p className="mt-2 text-xs text-textSecondary">
                The Negotiation Arena route isn't wired up yet — this is the object it will receive.
              </p>
            </div>
          )}
        </div>

        {/* Right rail */}
        {!isLoading && !error && (
          <aside className="flex w-full flex-col gap-5 xl:w-80 xl:shrink-0">
            <ConfigurationStatus
              scenarioSelected={Boolean(selectedScenario)}
              agentChecks={agentChecks}
              isValid={configurationValid}
            />
            <PersonalitiesInfoPanel />
            <StartNegotiationButton
              disabled={!configurationValid}
              isStarting={isStarting}
              onClick={handleStartNegotiation}
            />
          </aside>
        )}
      </div>
    </main>
  );
}
