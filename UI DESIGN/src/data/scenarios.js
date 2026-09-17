// Designed by TEAM 4
/**
 * Scenario data store.
 *
 * All three scenarios ship with finalized persona data. Each scenario has
 * exactly two agents, each with a role, goal, one or more constraints, and
 * one of the three supported personalities (Aggressive, Collaborative,
 * Risk-averse). Numeric constraint values double as each agent's initial
 * negotiation anchor for the negotiation-engine prototype in
 * src/engine/.
 *
 * @type {Record<string, import('../types/negotiation').Scenario & { isConfigured: boolean }>}
 */
export const scenarios = {
  vendor_pricing: {
    scenario_id: "vendor_pricing",
    scenario_name: "Vendor Pricing Negotiation",
    description:
      "Buyer and Vendor negotiate the price of a bulk components order while balancing budget, profit, and acceptable terms.",
    isConfigured: true,
    agents: [
      {
        id: "buyer",
        name: "Alex Morgan",
        role: "Buyer Agent",
        goal: "Lowest possible unit price",
        constraints: [{ text: "Maximum $50,000", defaultValue: 50000 }],
        personality: "Risk-averse",
      },
      {
        id: "vendor",
        name: "Daniel Carter",
        role: "Vendor Agent",
        goal: "Maximize profit margin",
        constraints: [{ text: "Minimum $42,000", defaultValue: 42000 }],
        personality: "Aggressive",
      },
    ],
  },
  job_offer: {
    scenario_id: "job_offer",
    scenario_name: "Job Offer Negotiation",
    description:
      "Candidate and Employer negotiate salary and start terms for a new role while balancing compensation expectations against budget limits.",
    isConfigured: true,
    agents: [
      {
        id: "candidate",
        name: "Sarah Mitchell",
        role: "Job Candidate Agent",
        goal: "Maximize total compensation and benefits",
        constraints: [{ text: "Minimum $95,000 base salary", defaultValue: 95000 }],
        personality: "Collaborative",
      },
      {
        id: "employer",
        name: "Michael Anderson",
        role: "Hiring Manager Agent",
        goal: "Secure the candidate within approved budget",
        constraints: [{ text: "Maximum $110,000 base salary", defaultValue: 110000 }],
        personality: "Risk-averse",
      },
    ],
  },
  project_budget: {
    scenario_id: "project_budget",
    scenario_name: "Project Budget Allocation",
    description:
      "Department Head and Finance Manager negotiate how much budget to allocate to a new initiative while balancing departmental needs against company-wide spending limits.",
    isConfigured: true,
    agents: [
      {
        id: "department_head",
        name: "Olivia Bennett",
        role: "Department Head Agent",
        goal: "Secure maximum budget for the initiative",
        constraints: [{ text: "Minimum $75,000 allocation", defaultValue: 75000 }],
        personality: "Aggressive",
      },
      {
        id: "finance_director",
        name: "James Wilson",
        role: "Finance Manager Agent",
        goal: "Control company-wide spending",
        constraints: [{ text: "Maximum $85,000 allocation", defaultValue: 85000 }],
        personality: "Collaborative",
      },
    ],
  },
};

export const scenarioList = Object.values(scenarios).map((s) => ({
  id: s.scenario_id,
  name: s.scenario_name,
  isConfigured: s.isConfigured,
}));
// Designed by TEAM 4
// Designed by TEAM 4

