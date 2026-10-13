export const personalityGuide = {
  aggressive: {
    title: "Aggressive",
    description:
      "Makes smaller concessions and strongly protects its objectives. It pushes for outcomes that align closely with its goals and is less willing to compromise.",
  },
  collaborative: {
    title: "Collaborative",
    description:
      "Makes larger concessions and focuses on finding a mutually beneficial agreement. It prioritizes trust, flexibility, and shared outcomes.",
  },
  "risk-averse": {
    title: "Risk-Averse",
    description:
      "Carefully evaluates offers and avoids risky decisions. It prefers security, predictability, and lower uncertainty before accepting a deal.",
  },
};

export const guideKnowledgeBase = {
  default: {
    title: "Platform Overview",
    purpose:
      "The Negotiation AI platform helps you learn, configure, simulate, and analyze multi-agent negotiation behavior.",
    sections: [
      "Dashboard overview",
      "Scenario selection",
      "Agent configuration",
      "Negotiation execution",
      "Outcome and report analysis",
    ],
    quickQuestions: [
      "How do I start?",
      "What should I do first?",
      "Start a guided tour",
      "Explain this page",
    ],
    suggestions: ["Choose Scenario →", "Configure Agents →", "Start Negotiation →"],
    greeting:
      "Hi! I'm your Negotiation Guide. I can help you understand the platform and guide you through each step.",
    nextStep: "Choose a scenario and configure the agents before starting the negotiation.",
  },
  dashboard: {
    title: "Dashboard",
    purpose:
      "You are on the Dashboard. This page gives you an overview of your negotiations, active sessions, recent activity, and performance metrics.",
    sections: [
      "KPI overview",
      "Active negotiation status",
      "Recent negotiation activity",
      "Agent performance monitoring",
      "Workflow and insights",
    ],
    quickQuestions: [
      "How do I start a negotiation?",
      "Explain these metrics",
      "View active negotiations",
      "Go to Agent Configuration",
    ],
    suggestions: ["Choose Scenario →", "Configure Agents →", "Open Agent Configuration"],
    greeting:
      "You're currently on the Dashboard. This page gives you an overview of your negotiations, active sessions, recent activity, and performance metrics.",
    nextStep: "Open Agent Configuration to prepare the agents for the next negotiation.",
  },
  scenarios: {
    title: "Scenarios",
    purpose:
      "Start by choosing a negotiation scenario. Each scenario contains predefined participants, goals, and constraints.",
    sections: [
      "Negotiation scenario cards",
      "Scenario context and description",
      "Participants and stakeholders",
      "Agent preparation flow",
    ],
    quickQuestions: [
      "How do I choose a scenario?",
      "What happens next?",
      "Explain this page",
      "Start a guided tour",
    ],
    suggestions: ["Select a Scenario →", "Review the Agents →", "Configure Agents →"],
    steps: [
      "Choose a scenario.",
      "Review participants and context.",
      "Configure agents.",
      "Start negotiation.",
    ],
    greeting:
      "Start by choosing a negotiation scenario. Each scenario contains predefined participants, goals, and constraints.",
    nextStep: "Review the scenario details and move to Agent Configuration to prepare each negotiator.",
  },
  agents: {
    title: "Agents",
    purpose:
      "Each AI agent represents a stakeholder in the negotiation. Its role defines who it represents, while its goal and constraints determine its negotiation boundaries.",
    sections: [
      "Agent identity",
      "Role and objective",
      "Constraints",
      "Personality and negotiation style",
    ],
    quickQuestions: [
      "What is a role?",
      "What are constraints?",
      "Explain personalities",
      "How do I configure agents?",
    ],
    suggestions: ["Review Agent Roles →", "Adjust Constraints →", "Set Personality →"],
    concepts: {
      role: "Who the agent represents in the negotiation.",
      goal: "The target outcome the agent is trying to achieve.",
      constraints: "The accepted range or limits that shape the agent's decision-making.",
      personality: "The negotiation behavior style used during offers and concessions.",
    },
    greeting:
      "Each AI agent represents a stakeholder in the negotiation. Its role defines who it represents, while its goal and constraints determine its negotiation boundaries.",
    nextStep: "Review the agent details and update constraints or personality before starting the negotiation.",
  },
  agentConfiguration: {
    title: "Agent Configuration",
    purpose:
      "This page is used to prepare both negotiation agents before the negotiation begins.",
    sections: [
      "Scenario selector",
      "Agent cards",
      "Constraints and goals",
      "Personality selection",
      "Start negotiation trigger",
    ],
    quickQuestions: [
      "How do I configure agents?",
      "Explain personalities",
      "What are constraints?",
      "What should I do next?",
    ],
    suggestions: ["Review Both Agents →", "Update Constraints →", "Start Negotiation →"],
    steps: [
      "Select a scenario.",
      "Review a role and objective.",
      "Check constraints.",
      "Choose a personality.",
      "Configure the second agent.",
      "Start negotiation.",
    ],
    greeting:
      "Use this page to review and tune each agent before the negotiation starts.",
    nextStep: "Review both agents, confirm their constraints, and click Start Negotiation when ready.",
  },
  negotiationArena: {
    title: "Negotiation Arena",
    purpose:
      "This is where the negotiation happens. You can observe AI-versus-AI behavior, track offers, and see how decisions evolve over time.",
    sections: [
      "Current negotiation state",
      "Agent offers and counteroffers",
      "Progress timeline",
      "Concession analysis",
    ],
    quickQuestions: [
      "How does negotiation work?",
      "What is this offer?",
      "Why did an agent counteroffer?",
      "What does deadlock mean?",
    ],
    suggestions: ["Study Offer Flow →", "Review Counteroffers →", "Check Concessions →"],
    concepts: [
      "An offer reflects the current value or condition being proposed.",
      "A counteroffer occurs when an agent adjusts a proposal in response to new information.",
      "Deadlock means no agreement is reachable under the current constraints and trade-offs.",
    ],
    greeting:
      "This is where the negotiation happens. You can observe AI conversations, offers, and counteroffers as the session unfolds.",
    nextStep: "Review the offer flow and concessions to understand which agent is moving toward agreement or deadlock.",
  },
  reports: {
    title: "Reports",
    purpose:
      "After a negotiation, review the outcome, concessions, agreement details, and performance analytics.",
    sections: [
      "Outcome summary",
      "Concession analysis",
      "Performance charting",
      "Agreement details",
    ],
    quickQuestions: [
      "Explain the outcome",
      "What is concession analysis?",
      "How is agent performance calculated?",
      "What should I review next?",
    ],
    suggestions: ["Review Outcome →", "Check Concessions →", "Open Analytics →"],
    metrics: [
      "Agreement rate",
      "Average rounds",
      "Concession size by agent",
      "Final outcome summary",
    ],
    greeting:
      "After a negotiation, view the outcome, concessions, agreement details, and performance analysis.",
    nextStep: "Review the report to see which agent made the strongest concessions and what final outcome was reached.",
  },
};

export const guideTourSteps = [
  {
    id: "dashboard",
    title: "Dashboard",
    selector: "[data-guide='dashboard-shell']",
    message: "This is your Dashboard. You can monitor negotiations and view platform activity here.",
  },
  {
    id: "scenarios",
    title: "Scenarios",
    selector: "[data-guide='scenario-selector']",
    message: "Choose a negotiation scenario to begin.",
  },
  {
    id: "agents",
    title: "Agents",
    selector: "[data-guide='agents-panel']",
    message: "Here you can view the available AI negotiation agents and their objectives.",
  },
  {
    id: "agent-configuration",
    title: "Agent Configuration",
    selector: "[data-guide='agent-configuration-shell']",
    message: "Configure agent roles, goals, constraints, and personalities before starting.",
  },
  {
    id: "negotiation-arena",
    title: "Negotiation Arena",
    selector: "[data-guide='negotiation-arena']",
    message: "This is where the negotiation happens. You can observe AI vs AI negotiations or participate in Practice Mode.",
  },
  {
    id: "reports",
    title: "Reports",
    selector: "[data-guide='reports-panel']",
    message: "After a negotiation, review the outcome, concessions, agreement details, and performance analysis.",
  },
];

export function getPageKey(pageName) {
  const normalized = String(pageName ?? "").toLowerCase();

  if (normalized.includes("dashboard")) return "dashboard";
  if (normalized.includes("scenario")) return "scenarios";
  if (normalized.includes("agent") && normalized.includes("config")) return "agentConfiguration";
  if (normalized.includes("agent")) return "agents";
  if (normalized.includes("arena") || normalized.includes("negotiation")) return "negotiationArena";
  if (normalized.includes("report")) return "reports";
  if (normalized.includes("setting")) return "default";

  return "default";
}
