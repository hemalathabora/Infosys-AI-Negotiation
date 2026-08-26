export const scenarios = {
  vendor_pricing: {
    scenario_id: "vendor_pricing",
    scenario_name: "Vendor Pricing Negotiation",
    description:
      "A buyer and vendor negotiate the price of a bulk components order while balancing budget, profit, and acceptable terms.",
    isConfigured: true,
    agents: [
      {
        id: "buyer",
        name: "Buyer",
        role: "Procurement Manager",
        goal: "Get the lowest possible unit price while maintaining product quality.",
        constraints: [
          "Maximum budget of $50,000",
          "Must meet required quality standards",
        ],
        personality: "Risk-averse",
      },
      {
        id: "vendor",
        name: "Vendor",
        role: "Sales Representative",
        goal: "Maximize profit while securing the bulk order.",
        constraints: [
          "Minimum acceptable deal value of $42,000",
          "Must maintain a profitable margin",
        ],
        personality: "Aggressive",
      },
    ],
  },

  job_offer: {
    scenario_id: "job_offer",
    scenario_name: "Job Offer Negotiation",
    description:
      "A job candidate and employer negotiate salary, benefits, and employment terms.",
    isConfigured: true,
    agents: [
      {
        id: "candidate",
        name: "Candidate",
        role: "Job Candidate",
        goal: "Secure the best possible salary and benefits package.",
        constraints: [
          "Minimum acceptable annual salary of $70,000",
          "Requires health benefits and career growth opportunities",
        ],
        personality: "Collaborative",
      },
      {
        id: "employer",
        name: "Employer",
        role: "Hiring Manager",
        goal: "Hire the candidate within the approved company budget.",
        constraints: [
          "Maximum salary budget of $85,000",
          "Must follow company compensation policies",
        ],
        personality: "Risk-averse",
      },
    ],
  },

  project_budget: {
    scenario_id: "project_budget",
    scenario_name: "Project Budget Allocation",
    description:
      "A project manager and finance manager negotiate the allocation of funds for a project.",
    isConfigured: true,
    agents: [
      {
        id: "project_manager",
        name: "Project Manager",
        role: "Project Manager",
        goal: "Secure enough budget and resources to successfully complete the project.",
        constraints: [
          "Minimum required budget of $200,000",
          "Project scope and quality requirements must be maintained",
        ],
        personality: "Aggressive",
      },
      {
        id: "finance_manager",
        name: "Finance Manager",
        role: "Finance Manager",
        goal: "Allocate the available budget efficiently while controlling organizational spending.",
        constraints: [
          "Total available budget is limited to $250,000",
          "Funding must follow financial policies and priorities",
        ],
        personality: "Risk-averse",
      },
    ],
  },
};

export const scenarioList = Object.values(scenarios).map((scenario) => ({
  id: scenario.scenario_id,
  name: scenario.scenario_name,
  isConfigured: scenario.isConfigured,
}));