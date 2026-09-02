// Designed by TEAM 4

import { useState } from "react";

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


/* ============================================================
   VIEW TOGGLE
============================================================ */

function ViewToggle({ view, onChange }) {
  return (
    <div className="flex items-center gap-1 rounded-xl border border-border bg-cardAlt p-1">

      {/* Grid */}
      <button
        type="button"
        aria-label="Grid view"
        aria-pressed={view === "grid"}
        onClick={() => onChange("grid")}
        className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
          view === "grid"
            ? "bg-primary/15 text-primary"
            : "text-textSecondary hover:bg-card hover:text-textPrimary"
        }`}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
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
        className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
          view === "list"
            ? "bg-primary/15 text-primary"
            : "text-textSecondary hover:bg-card hover:text-textPrimary"
        }`}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
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


/* ============================================================
   MAIN PAGE
============================================================ */

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


  /* ============================================================
     START NEGOTIATION
  ============================================================ */

  function handleStartNegotiation() {

    if (!configurationValid || !selectedScenario) {
      return;
    }

    negotiation.start(selectedScenario);
  }


  /* ============================================================
     CONSTRAINT CHANGE
  ============================================================ */

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


  /* ============================================================
     SCENARIO CHANGE
  ============================================================ */

  function handleScenarioChange(scenarioId) {

    negotiation.reset();

    selectScenario(scenarioId);
  }


  /* ============================================================
     AGENT VALIDATION
  ============================================================ */

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
      className="
        min-h-[calc(100vh-5rem)]
        flex-1
        bg-bg
        px-4
        py-6
        text-textPrimary
        sm:px-6
        lg:px-8
        lg:py-8
      "
    >

      <div className="mx-auto max-w-[1500px]">


        {/* =====================================================
            PAGE HEADER
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
            Select a negotiation scenario and configure the participating
            AI agents before starting the simulation.
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
            SCENARIO SECTION
        ====================================================== */}

        <section
          data-guide="scenario-selector"
          aria-labelledby="scenario-heading"
          className="mb-8"
        >

          <div className="mb-4">

            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              Step 1
            </p>

            <h2
              id="scenario-heading"
              className="mt-1 text-2xl font-bold tracking-tight text-textPrimary"
            >
              Negotiation Scenario
            </h2>

            <p className="mt-1 text-sm text-textSecondary">
              Choose the business situation you want the AI agents to negotiate.
            </p>

          </div>



          {/* Scenario Cards */}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

            {scenarioList.map((scenario, index) => {

              const isActive =
                scenario.id === selectedScenarioId;


              return (
                <button
                  key={scenario.id}
                  type="button"
                  disabled={isLoading}
                  onClick={() =>
                    handleScenarioChange(scenario.id)
                  }
                  className={`
                    group
                    rounded-2xl
                    border
                    p-5
                    text-left
                    transition-all
                    duration-200
                    ${
                      isActive
                        ? "border-primary bg-cardAlt shadow-[0_0_20px_rgba(77,208,255,0.08)]"
                        : "border-border bg-card hover:-translate-y-0.5 hover:border-borderGlow hover:bg-cardAlt"
                    }
                  `}
                >

                  {/* Scenario number */}

                  <div className="flex items-center justify-between">

                    <span
                      className={`
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-[0.18em]
                        ${
                          isActive
                            ? "text-primary"
                            : "text-textSecondary"
                        }
                      `}
                    >
                      Scenario {index + 1}
                    </span>


                    {isActive && (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-bg">
                        ✓
                      </span>
                    )}

                  </div>


                  {/* Icon */}

                  <div
                    className={`
                      mt-5
                      flex
                      h-11
                      w-11
                      items-center
                      justify-center
                      rounded-xl
                      border
                      ${
                        isActive
                          ? "border-primary/30 bg-primary/10 text-primary"
                          : "border-border bg-cardAlt text-textSecondary group-hover:text-primary"
                      }
                    `}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
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
                  </div>


                  {/* Name */}

                  <p
                    className={`
                      mt-4
                      text-lg
                      font-bold
                      leading-snug
                      ${
                        isActive
                          ? "text-textPrimary"
                          : "text-textPrimary"
                      }
                    `}
                  >
                    {scenario.name}
                  </p>


                  {/* Selected */}

                  <p
                    className={`
                      mt-3
                      text-xs
                      font-semibold
                      ${
                        isActive
                          ? "text-primary"
                          : "text-textMuted"
                      }
                    `}
                  >
                    {isActive
                      ? "Selected scenario"
                      : "Select this scenario →"}
                  </p>

                </button>
              );

            })}

          </div>



          {/* Scenario Description */}

          {selectedScenario &&
            !isLoading &&
            !error && (
              <div className="mt-5 rounded-2xl border border-border bg-card p-5">

                <div className="flex items-start gap-4">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary">

                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
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

                  </div>


                  <div className="min-w-0">

                    <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                      Scenario Details
                    </p>

                    <ScenarioDescription
                      description={
                        selectedScenario.description
                      }
                    />

                  </div>

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
          className="mb-8"
        >

          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-start gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary">

                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
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

              </div>


              <div>

                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                  Step 2
                </p>

                <h2
                  id="parties-heading"
                  className="mt-1 text-2xl font-bold tracking-tight text-textPrimary"
                >
                  Negotiating Parties
                </h2>

                <p className="mt-1 text-sm text-textSecondary">
                  Review and configure the AI agents participating in this negotiation.
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
            <LoadingState
              message="Loading agent personas..."
            />
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
                className={`
                  grid
                  grid-cols-1
                  gap-5
                  ${
                    view === "grid"
                      ? "lg:grid-cols-2"
                      : ""
                  }
                `}
              >

                {agents.map((agent, index) => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    index={index + 1}
                    onConstraintChange={
                      handleConstraintChange
                    }
                  />
                ))}

              </div>

            )}

        </section>



        {/* =====================================================
            CONFIGURATION STATUS
        ====================================================== */}

        {!isLoading &&
          !error &&
          agents.length > 0 && (

            <section className="mb-8">

              <ReadyBanner
                isValid={configurationValid}
                agentCount={configuredAgentCount}
              />

            </section>

          )}



        {/* =====================================================
            NEGOTIATION SESSION
        ====================================================== */}

        {negotiation.hasStarted &&
          selectedScenario && (

            <section
              data-guide="negotiation-arena"
              className="mb-8"
            >

              <NegotiationSessionPanel
                scenario={selectedScenario}
                state={negotiation.state}
                isRunning={negotiation.isRunning}
                timeline={negotiation.timeline}
                concessionTotals={
                  negotiation.concessionTotals
                }
                onStep={negotiation.step}
                onRunToCompletion={
                  negotiation.runToCompletion
                }
                onReset={negotiation.reset}
              />

            </section>

          )}



        {/* =====================================================
            START NEGOTIATION
        ====================================================== */}

        {!isLoading &&
          !error && (

            <div className="sticky bottom-4 z-20 flex justify-end">

              <div className="rounded-2xl border border-border bg-header/95 p-2 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur">

                <StartNegotiationButton
                  disabled={!configurationValid}
                  isStarting={false}
                  onClick={handleStartNegotiation}
                />

              </div>

            </div>

          )}

      </div>

    </main>
  );
}