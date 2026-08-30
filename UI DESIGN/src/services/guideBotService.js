import {
  guideKnowledgeBase,
  getPageKey,
  personalityGuide,
} from "../data/guideKnowledgeBase.js";

function normalizeQuestion(question = "") {
  return String(question)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function detectIntent(question) {
  const normalized = normalizeQuestion(question);

  if (!normalized) return "general";

  if (normalized.includes("start") || normalized.includes("how do i start") || normalized.includes("what should i do first")) return "start";
  if (normalized.includes("scenario") || normalized.includes("select a scenario")) return "scenario";
  if (normalized.includes("configure") || normalized.includes("agent configuration") || normalized.includes("agents")) return "config";
  if (normalized.includes("aggressive") || normalized.includes("collaborative") || normalized.includes("risk averse") || normalized.includes("personality")) return "personality";
  if (normalized.includes("goal")) return "goal";
  if (normalized.includes("constraint")) return "constraint";
  if (normalized.includes("simulation mode") || normalized.includes("practice mode")) return "mode";
  if (normalized.includes("offer") || normalized.includes("counteroffer") || normalized.includes("deadlock") || normalized.includes("agreement")) return "negotiation";
  if (normalized.includes("report") || normalized.includes("analytics") || normalized.includes("performance")) return "report";
  if (normalized.includes("dashboard") || normalized.includes("metrics") || normalized.includes("active negotiation")) return "dashboard";
  if (normalized.includes("navigation") || normalized.includes("what is this page") || normalized.includes("explain this page")) return "page";

  return "general";
}

export function getPageContext(pageName = "Dashboard") {
  const pageKey = getPageKey(pageName);
  return guideKnowledgeBase[pageKey] ?? guideKnowledgeBase.default;
}

export function getContextualQuickQuestions(pageName = "Dashboard") {
  const context = getPageContext(pageName);
  return context.quickQuestions || guideKnowledgeBase.default.quickQuestions;
}

export function getNavigationSuggestion(pageName = "Dashboard") {
  const context = getPageContext(pageName);
  return context.suggestions || guideKnowledgeBase.default.suggestions;
}

export function buildGuideResponse(question, pageName = "Dashboard") {
  const pageContext = getPageContext(pageName);
  const intent = detectIntent(question);
  const normalized = normalizeQuestion(question);

  if (!normalized) {
    return {
      message: pageContext.greeting || guideKnowledgeBase.default.greeting,
      suggestions: getNavigationSuggestion(pageName),
    };
  }

  if (intent === "page") {
    const pageSummary = `You are on ${pageContext.title}. ${pageContext.purpose}`;
    const sections = pageContext.sections?.map((item, index) => `${index + 1}. ${item}`).join("\n") ?? "";
    return {
      message: `${pageSummary}\n\n${sections}\n\nNEXT STEP: ${pageContext.nextStep}`,
      suggestions: getNavigationSuggestion(pageName),
    };
  }

  if (intent === "start") {
    return {
      message:
        "To start a negotiation:\n1. Go to the Scenarios section.\n2. Select a negotiation scenario.\n3. Open Agent Configuration.\n4. Review each agent's role, goal, and constraints.\n5. Choose a personality.\n6. Click Start Negotiation.",
      suggestions: ["Choose Scenario →", "Configure Agents →", "Start Negotiation →"],
    };
  }

  if (intent === "scenario") {
    return {
      message:
        "Start by choosing a scenario. Each one contains a different business context, negotiation goals, and stakeholder setup. After you select one, you can review the detailed role and constraints before launching the negotiation.",
      suggestions: ["Select a Scenario →", "Review Agents →", "Configure Agents →"],
    };
  }

  if (intent === "config") {
    return {
      message:
        "In Agent Configuration, review each negotiator's role, goal, constraints, and personality. If the configuration is valid, the system will allow you to begin the negotiation.",
      suggestions: ["How do I configure agents?", "Explain personalities", "What are constraints?"],
    };
  }

  if (intent === "personality") {
    if (normalized.includes("aggressive")) {
      return {
        message: personalityGuide.aggressive.description,
        suggestions: ["Describe collaborative →", "Explain risk-averse →", "What should I choose?"],
      };
    }

    if (normalized.includes("collaborative")) {
      return {
        message: personalityGuide.collaborative.description,
        suggestions: ["Describe aggressive →", "Explain risk-averse →", "What should I choose?"],
      };
    }

    if (normalized.includes("risk averse") || normalized.includes("risk-averse")) {
      return {
        message: personalityGuide["risk-averse"].description,
        suggestions: ["Describe aggressive →", "Explain collaborative →", "What should I choose?"],
      };
    }

    return {
      message:
        "The personality defines how each agent reacts during negotiation. Aggressive agents protect their goals, collaborative agents seek mutual agreement, and risk-averse agents avoid uncertain deals.",
      suggestions: ["Aggressive →", "Collaborative →", "Risk-Averse →"],
    };
  }

  if (intent === "constraint") {
    return {
      message:
        "Constraints are the accepted boundaries or limits for each agent. They define what a negotiator must achieve, what it can concede, and the acceptable range of outcomes before it will accept an offer.",
      suggestions: ["Review constraints →", "Set a personality →", "Start Negotiation →"],
    };
  }

  if (intent === "mode") {
    return {
      message:
        "Simulation Mode lets you test negotiation logic and observe AI behavior in the platform. Practice Mode is used for interactive negotiation rehearsal and decision-making guidance before a full simulation run.",
      suggestions: ["How do I start?", "Explain this page", "Choose a scenario →"],
    };
  }

  if (intent === "negotiation") {
    if (normalized.includes("deadlock")) {
      return {
        message:
          "A deadlock means the agents cannot reach a mutually acceptable deal under the current constraint boundaries. The system surfaces that status so you can inspect the concessions, goals, and final positions before restarting or modifying the configuration.",
        suggestions: ["View report →", "Review concessions →", "Adjust constraints →"],
      };
    }

    if (normalized.includes("counteroffer")) {
      return {
        message:
          "A counteroffer happens when an agent responds to a previous offer by adjusting its terms. It signals that the negotiation is still active and that the agent is rebalancing its position based on goals, constraints, and personality.",
        suggestions: ["How does negotiation work?", "Explain offers", "Review concessions →"],
      };
    }

    return {
      message:
        "Negotiation proceeds through offers, reactions, counteroffers, and concession tracking. Each agent evaluates the current value against its goals and constraints before deciding whether to accept, reject, or propose a new term.",
      suggestions: ["Review offer flow →", "Check concessions →", "View report →"],
    };
  }

  if (intent === "report") {
    return {
      message:
        "Reports summarize the final outcome, concession patterns, performance metrics, and key decision-making events. They help you understand which agent was more flexible and how the agreement was reached.",
      suggestions: ["Explain the outcome →", "Check concessions →", "Open Analytics →"],
    };
  }

  if (intent === "dashboard") {
    return {
      message:
        "The Dashboard helps you monitor total negotiations, agreement outcomes, average round length, current status, and live negotiation performance across the platform.",
      suggestions: ["How do I start a negotiation?", "Open Agent Configuration →", "Explain dashboard →"],
    };
  }

  return {
    message:
      `For this page, the most useful next step is: ${pageContext.nextStep}\n\nYou can also ask: "How do I start a negotiation?", "How do I configure agents?", or "Explain this page."`,
    suggestions: getNavigationSuggestion(pageName),
  };
}
