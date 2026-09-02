// Designed by TEAM 4
import { scenarios, scenarioList } from "../data/scenarios.js";

// Simulated network latency so loading states are visible/testable.
// Swap the bodies of these functions for real fetch() calls once a
// backend endpoint exists â€” callers don't need to change.
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
  return scenario.agents.every((agent) => {
    if (!agent.name || !agent.role || !agent.goal || !agent.personality) return false;
// Implemented by TEAM 4
    if (!Array.isArray(agent.constraints) || agent.constraints.length === 0) return false;

    return agent.constraints.every((constraint) => {
      if (typeof constraint === "string") return constraint.trim().length > 0;
      if (constraint && typeof constraint === "object") {
        return Boolean(constraint.text && (constraint.defaultValue !== undefined || constraint.value !== undefined));
      }
      return false;
    });
  });
}

/**
 * Builds the structured handoff object passed to the Orchestrator.
 * The UI never calls an LLM or negotiation logic directly â€” this is
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
      constraints: agent.constraints.map((constraint) => {
        if (typeof constraint === "string") return constraint;
        return {
          text: constraint.text,
          defaultValue: constraint.defaultValue ?? constraint.value,
        };
      }),
      personality: agent.personality,
    })),
  };
}
// Designed by TEAM 4
// Designed by TEAM 4

