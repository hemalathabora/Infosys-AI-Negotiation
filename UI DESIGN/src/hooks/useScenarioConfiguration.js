import { useCallback, useEffect, useState } from "react";
import {
  fetchScenarioById,
  isConfigurationValid,
} from "../services/scenarioService.js";

const DEFAULT_SCENARIO_ID = "vendor_pricing";

export function useScenarioConfiguration() {
  const [selectedScenarioId, setSelectedScenarioId] = useState(
    DEFAULT_SCENARIO_ID
  );
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isStarting, setIsStarting] = useState(false);

  const loadScenario = useCallback(async (scenarioId) => {
    setIsLoading(true);
    setError(null);
    try {
      const scenario = await fetchScenarioById(scenarioId);
      setSelectedScenario(scenario);
      setAgents(scenario.agents);
    } catch (err) {
      setError(err.message || "Unable to load agent configuration.");
      setSelectedScenario(null);
      setAgents([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadScenario(selectedScenarioId);
  }, [selectedScenarioId, loadScenario]);

  const selectScenario = useCallback((scenarioId) => {
    setSelectedScenarioId(scenarioId);
  }, []);

  const retry = useCallback(() => {
    loadScenario(selectedScenarioId);
  }, [loadScenario, selectedScenarioId]);

  const updateAgentConstraint = useCallback((agentId, constraintIndex, nextValue) => {
    const numericValue = Number(nextValue);
    if (Number.isNaN(numericValue)) return;

    setAgents((prevAgents) =>
      prevAgents.map((agent) => {
        if (agent.id !== agentId) return agent;

        const nextConstraints = agent.constraints.map((constraint, index) => {
          if (index !== constraintIndex) return constraint;

          if (typeof constraint === "string") {
            const text = constraint.trim();
            const match = text.match(/^(.*?)(\$\s*[\d,]+(?:\.\d+)?)(.*)$/);
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
        });

        return { ...agent, constraints: nextConstraints };
      })
    );

    setSelectedScenario((prevScenario) => {
      if (!prevScenario) return prevScenario;
      return {
        ...prevScenario,
        agents: prevScenario.agents.map((agent) => {
          if (agent.id !== agentId) return agent;

          const nextConstraints = agent.constraints.map((constraint, index) => {
            if (index !== constraintIndex) return constraint;

            if (typeof constraint === "string") {
              const text = constraint.trim();
              const match = text.match(/^(.*?)(\$\s*[\d,]+(?:\.\d+)?)(.*)$/);
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
          });

          return { ...agent, constraints: nextConstraints };
        }),
      };
    });
  }, []);

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
  };
}
