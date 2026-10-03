/**
 * Backend API Client Service for AI Negotiation Engine FastAPI Server
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

/**
 * Creates and starts a new negotiation session on the backend.
 * @param {import('../types/negotiation').Scenario} scenario
 */
export async function createNegotiationSession(scenario, mode = "simulation", humanRole = null, userId = null, maxRounds = 5) {
  const payload = {
    scenario_id: scenario.scenario_id,
    scenario_name: scenario.scenario_name || scenario.name,
    description: scenario.description,
    mode: mode,
    human_role: humanRole,
    user_id: userId,
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
    max_rounds: maxRounds
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
 * Submits a human participant turn in Practice Mode.
 * @param {string} negotiationId
 * @param {Object} offer
 * @param {string} [message]
 * @param {string} [decision]
 */
export async function submitPracticeTurn(negotiationId, offer, message = "", decision = "counter") {
  const response = await fetch(`${API_BASE_URL}/negotiations/${negotiationId}/practice-turn`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      participant_id: "human",
      offer,
      message,
      decision
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to submit human practice turn: ${errText}`);
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

/**
 * Fetches preset scenarios from the backend API.
 */
export async function fetchBackendScenarios() {
  const response = await fetch(`${API_BASE_URL}/scenarios`);
  if (!response.ok) {
    throw new Error("Failed to fetch scenarios from backend.");
  }
  return await response.json();
}

/**
 * Fetches negotiation analytics, concession timeline, and totals from the backend.
 * @param {string} negotiationId
 */
export async function getBackendAnalytics(negotiationId) {
  const response = await fetch(`${API_BASE_URL}/negotiations/${negotiationId}/analytics`);
  if (!response.ok) {
    throw new Error("Failed to fetch negotiation analytics from backend.");
  }
  return await response.json();
}

/**
 * Helper to get Auth Header
 */
function getAuthHeaders() {
  const token = localStorage.getItem("nego_auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Sends message to backend General AI Chatbot endpoint.
 * @param {string} message
 * @param {string} [conversationId]
 * @param {string} [negotiationId]
 * @param {any} [context]
 */
export async function sendChatMessage(message, conversationId = null, negotiationId = null, context = null) {
  const payload = {
    message,
    conversation_id: conversationId,
    negotiation_id: negotiationId,
    context
  };

  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders()
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.warn("Backend chat endpoint fetch error, proceeding to intelligent fallback:", err);
  }

  return null;
}

/**
 * Fetches user's active conversations.
 */
export async function fetchConversations() {
  const response = await fetch(`${API_BASE_URL}/chat/conversations`, {
    headers: { ...getAuthHeaders() }
  });
  if (!response.ok) {
    throw new Error("Failed to fetch chat conversations.");
  }
  return await response.json();
}

/**
 * Fetches message history for a specific conversation.
 * @param {string} conversationId
 */
export async function fetchConversationDetail(conversationId) {
  const response = await fetch(`${API_BASE_URL}/chat/conversations/${conversationId}`, {
    headers: { ...getAuthHeaders() }
  });
  if (!response.ok) {
    throw new Error("Failed to fetch conversation history.");
  }
  return await response.json();
}

/**
 * Deletes a conversation.
 * @param {string} conversationId
 */
export async function deleteConversation(conversationId) {
  const response = await fetch(`${API_BASE_URL}/chat/conversations/${conversationId}`, {
    method: "DELETE",
    headers: { ...getAuthHeaders() }
  });
  if (!response.ok) {
    throw new Error("Failed to delete conversation.");
  }
  return await response.json();
}

/**
 * Queries the AI Guide Bot assistant backend endpoint.
 * @param {string} query
 * @param {string} [scenarioId]
 */
export async function queryBackendGuideBot(query, scenarioId = "vendor_pricing") {
  return await sendChatMessage(query, null, null, `Scenario: ${scenarioId}`);
}

/**
 * Fetches dashboard analytics dynamically calculated from DB for a specific user.
 * @param {string} [userId]
 */
export async function fetchDashboardAnalytics(userId = null) {
  const url = userId
    ? `${API_BASE_URL}/analytics/dashboard?user_id=${encodeURIComponent(userId)}`
    : `${API_BASE_URL}/analytics/dashboard`;

  const response = await fetch(url);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Dashboard API error:", response.status, errorText);
    throw new Error("Failed to fetch dashboard analytics.");
  }

  const data = await response.json();
  console.log("Dashboard analytics:", data);

  return data;
}

/**
 * Fetches list of negotiation history from database.
 * @param {string} [userId]
 */
export async function fetchNegotiationsList(userId = null) {
  const url = userId ? `${API_BASE_URL}/negotiations?user_id=${encodeURIComponent(userId)}` : `${API_BASE_URL}/negotiations`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch negotiations list from DB.");
  }
  return await response.json();
}

/**
 * Custom Scenarios API helper functions
 */
export async function fetchCustomScenarios(userId = null) {
  const url = userId ? `${API_BASE_URL}/custom-scenarios?user_id=${encodeURIComponent(userId)}` : `${API_BASE_URL}/custom-scenarios`;
  const response = await fetch(url, { headers: { ...getAuthHeaders() } });
  if (!response.ok) throw new Error("Failed to fetch custom scenarios.");
  return await response.json();
}

export async function createCustomScenario(scenarioData) {
  const response = await fetch(`${API_BASE_URL}/custom-scenarios`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(scenarioData)
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to create custom scenario: ${errText}`);
  }
  return await response.json();
}

export async function updateCustomScenario(id, scenarioData) {
  const response = await fetch(`${API_BASE_URL}/custom-scenarios/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(scenarioData)
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to update custom scenario: ${errText}`);
  }
  return await response.json();
}

export async function duplicateCustomScenario(id) {
  const response = await fetch(`${API_BASE_URL}/custom-scenarios/${id}/duplicate`, {
    method: "POST",
    headers: { ...getAuthHeaders() }
  });
  if (!response.ok) throw new Error("Failed to duplicate custom scenario.");
  return await response.json();
}

export async function deleteCustomScenario(id) {
  const response = await fetch(`${API_BASE_URL}/custom-scenarios/${id}`, {
    method: "DELETE",
    headers: { ...getAuthHeaders() }
  });
  if (!response.ok) throw new Error("Failed to delete custom scenario.");
  return await response.json();
}

