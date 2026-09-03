// Designed by TEAM 4

import { useCallback, useEffect, useState } from "react";

import {
  fetchScenarioById,
  isConfigurationValid,
} from "../services/scenarioService.js";

const DEFAULT_SCENARIO_ID = "vendor_pricing";

/**
 * Safely converts a constraint into the structure expected by the UI
 * and negotiation engine.
 */
function updateConstraintValue(constraint, numericValue) {
  if (typeof constraint === "string") {
    const text = constraint.trim();

    /*
     * Try to preserve the original constraint wording.
     *
     * Examples:
     * "Maximum budget: $50,000"
     * "Minimum acceptable price: $42,000"
     */
    const match = text.match(
      /^(.*?)(\$[\d,]+(?:\.\d+)?)(.*)$/i
    );

    const sanitizedText = match
      ? `${match[1].trim()} $${numericValue.toLocaleString()} ${match[3].trim()}`.trim()
      : `Custom constraint $${numericValue.toLocaleString()}`;

    return {
      text: sanitizedText,
      defaultValue: numericValue,
      value: numericValue,
    };
  }

  if (constraint && typeof constraint === "object") {
    return {
      ...constraint,
      defaultValue: numericValue,
      value: numericValue,
    };
  }

  return {
    text: `Custom constraint $${numericValue.toLocaleString()}`,
    defaultValue: numericValue,
    value: numericValue,
  };
}

/**
 * Updates one agent inside a scenario.
 *
 * This helper is used for both:
 * - local agents state
 * - selectedScenario.agents
 *
 * Keeping the same update logic prevents the two states from
 * getting out of sync.
 */
function updateAgentById(agents, agentId, updater) {
  return agents.map((agent) => {
    if (agent.id !== agentId) {
      return agent;
    }

    return updater(agent);
  });
}

export function useScenarioConfiguration() {
  const [selectedScenarioId, setSelectedScenarioId] =
    useState(DEFAULT_SCENARIO_ID);

  const [selectedScenario, setSelectedScenario] =
    useState(null);

  const [agents, setAgents] = useState([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  const [isStarting, setIsStarting] =
    useState(false);

  /**
   * Load a scenario from the scenario service.
   */
  const loadScenario = useCallback(async (scenarioId) => {
    setIsLoading(true);
    setError(null);

    try {
      const scenario = await fetchScenarioById(scenarioId);

      setSelectedScenario(scenario);
      setAgents(scenario.agents ?? []);
    } catch (err) {
      setError(
        err?.message ||
          "Unable to load agent configuration."
      );

      setSelectedScenario(null);
      setAgents([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Load the default/current scenario.
   */
  useEffect(() => {
    loadScenario(selectedScenarioId);
  }, [selectedScenarioId, loadScenario]);

  /**
   * Select another scenario.
   */
  const selectScenario = useCallback((scenarioId) => {
    setSelectedScenarioId(scenarioId);
  }, []);

  /**
   * Retry loading the current scenario.
   */
  const retry = useCallback(() => {
    loadScenario(selectedScenarioId);
  }, [loadScenario, selectedScenarioId]);

  /**
   * ------------------------------------------------------------
   * UPDATE CONSTRAINT
   * ------------------------------------------------------------
   *
   * Updates both:
   *
   * agents
   * selectedScenario.agents
   *
   * so they always remain synchronized.
   */
  const updateAgentConstraint = useCallback(
    (agentId, constraintIndex, nextValue) => {
      const numericValue = Number(nextValue);

      if (Number.isNaN(numericValue)) {
        return;
      }

      /**
       * Update the standalone agents state.
       */
      setAgents((previousAgents) =>
        updateAgentById(
          previousAgents,
          agentId,
          (agent) => {
            const nextConstraints = (
              agent.constraints ?? []
            ).map((constraint, index) => {
              if (index !== constraintIndex) {
                return constraint;
              }

              return updateConstraintValue(
                constraint,
                numericValue
              );
            });

            return {
              ...agent,
              constraints: nextConstraints,
            };
          }
        )
      );

      /**
       * Update selectedScenario as well.
       *
       * This is important because selectedScenario is the object
       * eventually passed to the negotiation engine.
       */
      setSelectedScenario((previousScenario) => {
        if (!previousScenario) {
          return previousScenario;
        }

        return {
          ...previousScenario,

          agents: updateAgentById(
            previousScenario.agents ?? [],
            agentId,
            (agent) => {
              const nextConstraints = (
                agent.constraints ?? []
              ).map((constraint, index) => {
                if (index !== constraintIndex) {
                  return constraint;
                }

                return updateConstraintValue(
                  constraint,
                  numericValue
                );
              });

              return {
                ...agent,
                constraints: nextConstraints,
              };
            }
          ),
        };
      });
    },
    []
  );

  /**
   * ------------------------------------------------------------
   * UPDATE PERSONALITY
   * ------------------------------------------------------------
   *
   * This is the important Milestone 1 integration.
   *
   * Previously AgentCard stored personality locally:
   *
   * AgentCard local state
   *
   * That meant the selected personality could remain only in
   * the UI and never reach selectedScenario.
   *
   * Now:
   *
   * AgentCard
   *    ↓
   * updateAgentPersonality()
   *    ↓
   * agents
   *    ↓
   * selectedScenario.agents
   *    ↓
   * NegotiationState
   *    ↓
   * Orchestrator
   */
  const updateAgentPersonality = useCallback(
    (agentId, nextPersonality) => {
      if (!agentId || !nextPersonality) {
        return;
      }

      /**
       * Update agents state.
       */
      setAgents((previousAgents) =>
        updateAgentById(
          previousAgents,
          agentId,
          (agent) => ({
            ...agent,
            personality: nextPersonality,
          })
        )
      );

      /**
       * Update selectedScenario.
       *
       * This is the object used when Start Negotiation
       * is pressed.
       */
      setSelectedScenario((previousScenario) => {
        if (!previousScenario) {
          return previousScenario;
        }

        return {
          ...previousScenario,

          agents: updateAgentById(
            previousScenario.agents ?? [],
            agentId,
            (agent) => ({
              ...agent,
              personality: nextPersonality,
            })
          ),
        };
      });
    },
    []
  );

  /**
   * Validate the CURRENT selected scenario.
   *
   * This means the validation checks the same object that will
   * eventually be passed to the Orchestrator.
   */
  const configurationValid = selectedScenario
    ? isConfigurationValid(selectedScenario)
    : false;

  return {
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

    updateAgentConstraint,

    // New Milestone 1 integration action.
    updateAgentPersonality,
  };
}