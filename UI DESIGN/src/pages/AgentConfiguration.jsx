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
    <div className="flex items-center gap-1 rounded-xl border border-border bg-cardAlt p-1">
      {/* Grid */}
      <button
        type="button"
        aria-label="Grid view"
        aria-pressed={view === "grid"}
        onClick={() => onChange("grid")}
        className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
          view === "grid"
            ? "bg-primary/15 text-primary"
            : "text-textSecondary hover:text-textPrimary"
        }`}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
        >
          <rect
            x="3"
            y="3"
            width="8"
            height="8"
            rx="1.5"
            stroke="currentColor"
            strokeWidth="1.8"
          />

          <rect
            x="13"
            y="3"
            width="8"
            height="8"
            rx="1.5"
            stroke="currentColor"
            strokeWidth="1.8"
          />

          <rect
            x="3"
            y="13"
            width="8"
            height="8"
            rx="1.5"
            stroke="currentColor"
            strokeWidth="1.8"
          />

          <rect
            x="13"
            y="13"
            width="8"
            height="8"
            rx="1.5"
            stroke="currentColor"
            strokeWidth="1.8"
          />
        </svg>
      </button>

      {/* List */}
      <button
        type="button"
        aria-label="List view"
        aria-pressed={view === "list"}
        onClick={() => onChange("list")}
        className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
          view === "list"
            ? "bg-primary/15 text-primary"
            : "text-textSecondary hover:text-textPrimary"
        }`}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M4 6h16M4 12h16M4 18h16"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}

export default function AgentConfiguration({
  onNegotiationStart,
  onNegotiationReset,
}) {
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

  /**
   * ------------------------------------------------------------
   * START NEGOTIATION
   * ------------------------------------------------------------
   */
  function handleStartNegotiation() {
    if (!configurationValid || !selectedScenario) {
      return;
    }

    /**
     * selectedScenario is now the SINGLE source of truth.
     *
     * It contains:
     * - agent goals
     * - constraints
     * - personalities
     *
     * and is passed directly to the negotiation engine.
     */
    if (onNegotiationStart) {
      onNegotiationStart(selectedScenario);
    } else {
      negotiation.start(selectedScenario);
    }
  }

  /**
   * ------------------------------------------------------------
   * CONSTRAINT CHANGE
   * ------------------------------------------------------------
   */
  function handleConstraintChange(
    agentId,
    constraintIndex,
    nextValue
  ) {
    updateAgentConstraint(
      agentId,
      constraintIndex,
      nextValue
    );
  }

  /**
   * ------------------------------------------------------------
   * PERSONALITY CHANGE
   * ------------------------------------------------------------
   *
   * This connects AgentCard to the actual scenario state.
   */
  function handlePersonalityChange(
    agentId,
    nextPersonality
  ) {
    updateAgentPersonality(
      agentId,
      nextPersonality
    );
  }

  /**
   * ------------------------------------------------------------
   * SCENARIO CHANGE
   * ------------------------------------------------------------
   */
  function handleScenarioChange(scenarioId) {
    /**
     * Reset any existing negotiation before loading
     * a new scenario.
     */
    if (onNegotiationReset) {
      onNegotiationReset();
    } else {
      negotiation.reset();
    }

    selectScenario(scenarioId);
  }

  /**
   * ------------------------------------------------------------
   * AGENT CONFIGURATION CHECK
   * ------------------------------------------------------------
   */
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


  const configuredAgentCount =
    agentChecks.filter(Boolean).length;


  return (
    <main
      data-guide="agent-configuration-shell"
      className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
    >
      <div className="mx-auto max-w-[1500px]">
        {/* =====================================================
            PAGE HEADER & STEPPER
        ====================================================== */}

        <section className="mb-8">

          <div className="mb-2 flex items-center gap-2">

            <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(77,208,255,0.7)]" />

            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              New Negotiation
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-textPrimary sm:text-4xl">
            Configure Your Negotiation
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-textSecondary sm:text-base">
            Select a negotiation scenario and configure the
            participating AI agents before starting the
            simulation.
          </p>

          {/* Progress */}
          <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 font-semibold text-primary">
              1. Scenario
            </span>

            <span className="text-textMuted">
              →
            </span>

            <span className="rounded-full border border-border bg-card px-3 py-1.5 text-textSecondary">
              2. Agents
            </span>

            <span className="text-textMuted">
              →
            </span>

            <span className="rounded-full border border-border bg-card px-3 py-1.5 text-textSecondary">
              3. Start
            </span>
          </div>
        </section>

        {/* =====================================================
            SCENARIO SELECTION SECTION
        ====================================================== */}

        <section
          data-guide="scenario-selector"
          aria-labelledby="scenario-heading"
          className="mb-8"
        >
          <h2
            id="scenario-heading"
            className="text-[2rem] font-black uppercase tracking-[0.05em] text-[#4dd0ff]"
          >
            Negotiation Scenario
          </h2>

          <p className="mt-1 text-sm text-textSecondary">
            Choose the business situation you want the AI
            agents to negotiate.
          </p>

          {/* Scenario Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {scenarioList.map((scenario) => {
              const isActive =
                scenario.id === selectedScenarioId;

              return (
                <button
                  key={scenario.id}
                  type="button"
                  disabled={isLoading}
                  onClick={() =>
                    handleScenarioChange(
                      scenario.id
                    )
                  }
                  className={`
                    group relative rounded-2xl border p-5 text-left transition-all duration-200
                    ${
                      isActive
                        ? "border-white bg-[#25242C] shadow-lg"
                        : "border-[#2D2C36] bg-[#201F25] hover:border-slate-400 hover:bg-[#25242C]"
                    }
                  `}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7fa7c0]">
                    Scenario{" "}
                    {scenarioList.findIndex(
                      (item) =>
                        item.id === scenario.id
                    ) + 1}
                  </p>

                  <p className="mt-2 text-2xl font-extrabold text-[#F1F5F9]">
                    {scenario.name}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Scenario Description */}
          {selectedScenario &&
            !isLoading &&
            !error && (
              <div className="mt-5 rounded-2xl border border-[#214a69] bg-[#0e2338] p-4">
                <div className="flex items-start gap-3">
                  <span
                    className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#4dd0ff] bg-[#112d3d] text-[#4dd0ff]"
                    aria-hidden="true"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M7 4.5h7l5 5V18a2 2 0 01-2 2H7a2 2 0 01-2-2V6.5a2 2 0 012-2z"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinejoin="round"
                      />

                      <path
                        d="M14 4.5v5h5"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>

                  <ScenarioDescription
                    description={
                      selectedScenario.description
                    }
                  />
                </div>
              </div>
            )}
        </section>

        {/* =====================================================
            AGENTS SECTION
        ====================================================== */}

        <section
          data-guide="agents-panel"
          aria-labelledby="parties-heading"
          className="mb-6"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#112d3d] text-[#4dd0ff]"
                aria-hidden="true"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="9"
                    cy="8"
                    r="2.6"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />

                  <circle
                    cx="17"
                    cy="9"
                    r="2.2"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />

                  <path
                    d="M3 19a6 6 0 0112 0M14.5 19a4.5 4.5 0 019 0"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </span>

              <div>
                <h2
                  id="parties-heading"
                  className="text-[2rem] font-black uppercase tracking-[0.05em] text-[#4dd0ff]"
                >
                  Negotiating Parties
                </h2>

                <p className="mt-1 text-sm text-textSecondary">
                  Review and configure the AI agents
                  participating in this negotiation.
                </p>
              </div>
            </div>


            <ViewToggle
              view={view}
              onChange={setView}
            />

          </div>

          {/* Loading */}
          {isLoading && (
            <LoadingState message="Loading agent personas..." />
          )}

          {/* Error */}
          {!isLoading && error && (
            <ErrorState onRetry={retry} />
          )}

          {/* Empty */}
          {!isLoading &&
            !error &&
            agents.length === 0 && (
              <EmptyState />
            )}

          {/* Agents */}
          {!isLoading &&
            !error &&
            agents.length > 0 && (
              <div
                className={`grid grid-cols-1 gap-5 ${
                  view === "grid"
                    ? "lg:grid-cols-2"
                    : ""
                }`}
              >
                {agents.map((agent, index) => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    index={index + 1}
                    onConstraintChange={
                      handleConstraintChange
                    }
                    onPersonalityChange={
                      handlePersonalityChange
                    }
                  />
                ))}
              </div>
            )}
        </section>

        {/* =====================================================
            READY STATUS
        ====================================================== */}

        {!isLoading &&
          !error &&
          agents.length > 0 && (
            <div className="mb-6">
              <ReadyBanner
                isValid={configurationValid}
                agentCount={
                  configuredAgentCount
                }
              />
            </div>
          )}

        {/* =====================================================
            NEGOTIATION SESSION
        ====================================================== */}

        {negotiation.hasStarted &&
          selectedScenario && (
            <div data-guide="negotiation-arena">
              <NegotiationSessionPanel
                scenario={selectedScenario}
                state={negotiation.state}
                isRunning={
                  negotiation.isRunning
                }
                timeline={
                  negotiation.timeline
                }
                concessionTotals={
                  negotiation.concessionTotals
                }
                onStep={negotiation.step}
                onRunToCompletion={
                  negotiation.runToCompletion
                }
                onReset={negotiation.reset}
              />
            </div>
          )}

        {/* =====================================================
            START BUTTON
        ====================================================== */}

        {!isLoading && !error && (
          <div className="pt-2">
            <StartNegotiationButton
              disabled={!configurationValid}
              isStarting={false}
              onClick={
                handleStartNegotiation
              }
            />
          </div>
        )}
      </div>
    </main>
  );
}