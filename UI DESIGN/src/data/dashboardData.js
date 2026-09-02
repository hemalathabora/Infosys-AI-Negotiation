// Designed by TEAM 4
import { scenarios } from "./scenarios.js";

export const dashboardStats = {
  totalNegotiations: 24,
  agreements: 18,
  deadlocks: 4,
  inProgress: 2,
  averageRounds: 5.8,
  successRate: 75,
};

export const activeNegotiation = {
  scenario: "Vendor Pricing Negotiation",
  mode: "Simulation",
  status: "In Progress",
  currentRound: 4,
  agreementProbability: 72,
  agents: [
    {
      name: "Buyer",
      personality: "Risk-Averse",
      position: "$48,000",
    },
    {
      name: "Vendor",
      personality: "Aggressive",
      position: "$52,000",
    },
  ],
};

export const recentNegotiations = [
  {
    scenario: "Vendor Pricing",
    agents: "Buyer vs Vendor",
    mode: "Simulation",
    rounds: 6,
    result: "Agreement",
    date: "Today",
  },
  {
    scenario: "Job Offer",
    agents: "Candidate vs Employer",
    mode: "Practice",
    rounds: 8,
    result: "Agreement",
    date: "Yesterday",
  },
  {
    scenario: "Project Budget",
    agents: "Department Head vs Finance Director",
    mode: "Simulation",
    rounds: 8,
    result: "Deadlock",
    date: "2 days ago",
  },
  {
    scenario: "Vendor Pricing",
    agents: "Buyer vs Vendor",
    mode: "Simulation",
    rounds: 5,
    result: "In Progress",
    date: "Today",
  },
];

export const agentPerformance = [
  {
    name: "Buyer",
    role: "Procurement Manager",
    personality: "Risk-Averse",
    totalNegotiations: 16,
    successRate: 78,
    averageConcession: 12,
    style: "Budget-first",
  },
  {
    name: "Vendor",
// Implemented by TEAM 4
    role: "Sales Representative",
    personality: "Aggressive",
    totalNegotiations: 14,
    successRate: 68,
    averageConcession: 18,
    style: "Anchor-led",
  },
  {
    name: "Candidate",
    role: "Job Candidate",
    personality: "Collaborative",
    totalNegotiations: 12,
    successRate: 82,
    averageConcession: 15,
    style: "Value-focused",
  },
  {
    name: "Employer",
    role: "Hiring Manager",
    personality: "Risk-Averse",
    totalNegotiations: 11,
    successRate: 74,
    averageConcession: 9,
    style: "Structured",
  },
].map((entry) => ({
  ...entry,
  scenario: scenarios.vendor_pricing?.scenario_name ?? "Negotiation",
}));

export const insights = {
  bestStrategy: "Collaborative",
  avgAgreementRate: 76,
  avgRounds: 5.8,
  mostActiveScenario: "Vendor Pricing",
  totalConcessions: 142,
};

export const quickActions = [
  {
    title: "Start New Negotiation",
    description: "Configure agents and launch a new simulation.",
    action: "configure-agents",
  },
  {
    title: "Configure Agents",
    description: "Modify agent goals, constraints, and personalities.",
    action: "configure-agents",
  },
  {
    title: "Practice Negotiation",
    description: "Negotiate directly against an AI agent.",
    action: "negotiation-arena",
  },
  {
    title: "View Analytics",
    description: "Analyze negotiation history and agent performance.",
    action: "analytics",
  },
];

export const activityTimeline = [
  {
    title: "Negotiation #24 completed",
    detail: "Vendor Pricing",
    subDetail: "Agreement reached at $48,500",
    time: "5 minutes ago",
  },
  {
    title: "Agent configuration updated",
    detail: "Buyer personality changed to Risk-Averse",
    time: "1 hour ago",
  },
  {
    title: "New scenario selected",
    detail: "Job Offer Negotiation",
    time: "2 hours ago",
  },
];
// Designed by TEAM 4
// Designed by TEAM 4

