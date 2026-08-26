import { useCallback, useEffect, useState } from "react";
import {
  fetchScenarioById,
  isConfigurationValid,
} from "../services/scenarioService";

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
  };
}
