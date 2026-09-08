/**
 * Backend API Client Service for AI Negotiation Engine FastAPI Server
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

/**
 * Creates and starts a new negotiation session on the backend.
 * @param {import('../types/negotiation').Scenario} scenario
 */
export async function createNegotiationSession(scenario) {
  const payload = {
    scenario_id: scenario.scenario_id,
    scenario_name: scenario.scenario_name || scenario.name,
    description: scenario.description,
    agents: scenario.agents.map((agent) => ({
      id: agent.id,
      name: agent.name,
      role: agent.role,
      persona: agent.personality || agent.persona || "Collaborative",
      goals: Array.isArray(agent.goal) ? agent.goal : [agent.goal],
      constraints: agent.constraints.map((c) => {
        if (typeof c === "string") return c;
        return {
          text: c.text,
          defaultValue: c.defaultValue ?? c.value,
          ...(c.text && c.text.toLowerCase().includes("max") ? { maximum_price: c.defaultValue ?? c.value } : {}),
          ...(c.text && c.text.toLowerCase().includes("min") ? { minimum_price: c.defaultValue ?? c.value } : {})
        };
      }),
      negotiation_objectives: [agent.goal]
    })),
    max_rounds: 8
  };

  const response = await fetch(`${API_BASE_URL}/negotiations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to create backend negotiation session: ${errText}`);
  }

  return await response.json();
}

/**
 * Runs one turn of negotiation on the backend.
 * @param {string} negotiationId
 */
export async function stepBackendNegotiation(negotiationId) {
  const response = await fetch(`${API_BASE_URL}/negotiations/${negotiationId}/turn`, {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Backend negotiation turn step failed: ${errText}`);
  }

  return await response.json();
}

/**
 * Runs negotiation automatically to completion on the backend.
 * @param {string} negotiationId
 */
export async function runBackendNegotiationToCompletion(negotiationId) {
  const response = await fetch(`${API_BASE_URL}/negotiations/${negotiationId}/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Backend run to completion failed: ${errText}`);
  }

  return await response.json();
}

/**
 * Fetches the current state of a negotiation from the backend.
 * @param {string} negotiationId
 */
export async function getBackendNegotiationState(negotiationId) {
  const response = await fetch(`${API_BASE_URL}/negotiations/${negotiationId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch backend negotiation state.`);
  }
  return await response.json();
}
