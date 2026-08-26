import { scenarios, scenarioList } from "../data/scenarios";

// Simulated network latency so loading states are visible/testable.
// Swap the bodies of these functions for real fetch() calls once a
// backend endpoint exists — callers don't need to change.
const SIMULATED_LATENCY_MS = 350;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchScenarioList() {
  await delay(SIMULATED_LATENCY_MS);
  return scenarioList;
}

/**
 * @param {string} scenarioId
 * @returns {Promise<import('../types/negotiation').Scenario & { isConfigured: boolean }>}
 */
export async function fetchScenarioById(scenarioId) {
  await delay(SIMULATED_LATENCY_MS);
  const scenario = scenarios[scenarioId];
  if (!scenario) {
    throw new Error(`Unknown scenario: ${scenarioId}`);
  }
  return scenario;
}

/**
 * Validates a scenario's configuration is complete enough to negotiate.
 * @param {import('../types/negotiation').Scenario} scenario
 */
export function isConfigurationValid(scenario) {
  if (!scenario || !Array.isArray(scenario.agents)) return false;
  if (scenario.agents.length !== 2) return false;
  return scenario.agents.every(
    (agent) =>
      agent.name &&
      agent.role &&
      agent.goal &&
      Array.isArray(agent.constraints) &&
      agent.constraints.length > 0 &&
      agent.personality
  );
}

/**
 * Builds the structured handoff object passed to the Orchestrator.
 * The UI never calls an LLM or negotiation logic directly — this is
 * the boundary object that crosses into that layer.
 * @param {import('../types/negotiation').Scenario} scenario
 * @returns {import('../types/negotiation').NegotiationHandoff}
 */
export function buildOrchestratorHandoff(scenario) {
  return {
    scenario_id: scenario.scenario_id,
    agents: scenario.agents.map((agent) => ({
      id: agent.id,
      name: agent.name,
      role: agent.role,
      goal: agent.goal,
      constraints: agent.constraints,
      personality: agent.personality,
    })),
  };
}
