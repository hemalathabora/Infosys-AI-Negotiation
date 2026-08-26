/**
 * Scenario data store.
 *
 * Only "vendor_pricing" ships with approved persona data. The other two
 * scenarios are intentionally structured but left without agent data —
 * per the spec we do not invent persona values the team hasn't supplied.
 * `agents: []` + `isConfigured: false` lets the UI render a clean
 * "not yet available" state instead of fake content.
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
        name: "Buyer",
        role: "Procurement Manager",
        goal: "Lowest possible unit price",
        constraints: ["Maximum $50,000"],
        personality: "Risk-averse",
      },
      {
        id: "vendor",
        name: "Vendor",
        role: "Sales Representative",
        goal: "Maximize profit margin",
        constraints: ["Minimum $42,000"],
        personality: "Aggressive",
      },
    ],
  },
  job_offer: {
    scenario_id: "job_offer",
    scenario_name: "Job Offer Negotiation",
    description:
      "Persona data for this scenario has not been finalized by the team yet.",
    isConfigured: false,
    agents: [],
  },
  project_budget: {
    scenario_id: "project_budget",
    scenario_name: "Project Budget Allocation",
    description:
      "Persona data for this scenario has not been finalized by the team yet.",
    isConfigured: false,
    agents: [],
  },
};

export const scenarioList = Object.values(scenarios).map((s) => ({
  id: s.scenario_id,
  name: s.scenario_name,
  isConfigured: s.isConfigured,
}));
