import { useState, useEffect } from "react";
import NegotiationSessionPanel from "../components/NegotiationSessionPanel";
import OutcomeScreen from "../components/OutcomeScreen";
import TugOfWarBargainingZone from "../components/TugOfWarBargainingZone";
import { getAuthoritativeTarget } from "../engine/concessionTracking.js";

function getScenarioVariables(scenarioId, state) {
  if (state?.variables && Object.keys(state.variables).length > 0) {
    return state.variables;
  }
  const id = String(scenarioId || "").toLowerCase();
  if (id.includes("job") || id.includes("salary")) {
    return {
      salary: { name: "salary", display_name: "Base Salary", unit: "$", min_value: 85000, max_value: 125000, default_value: 105000 },
      bonus: { name: "bonus", display_name: "Annual Bonus", unit: "$", min_value: 0, max_value: 30000, default_value: 15000 },
      remote_days: { name: "remote_days", display_name: "Remote Days / Wk", unit: "days", min_value: 0, max_value: 5, default_value: 3 },
      vacation_days: { name: "vacation_days", display_name: "Paid Time Off", unit: "days", min_value: 10, max_value: 30, default_value: 20 },
    };
  }
  if (id.includes("budget") || id.includes("project") || id.includes("deadline")) {
    return {
      budget: { name: "budget", display_name: "Project Budget", unit: "$", min_value: 90000, max_value: 150000, default_value: 120000 },
      delivery_weeks: { name: "delivery_weeks", display_name: "Timeline", unit: "weeks", min_value: 6, max_value: 24, default_value: 12 },
      scope_features: { name: "scope_features", display_name: "Scope Features", unit: "items", min_value: 4, max_value: 16, default_value: 8 },
      quality_tier: { name: "quality_tier", display_name: "Quality Tier", unit: "lvl", min_value: 1, max_value: 5, default_value: 3 },
    };
  }
  return {
    price: { name: "price", display_name: "Purchase Price", unit: "$", min_value: 35000, max_value: 55000, default_value: 45000 },
    delivery_days: { name: "delivery_days", display_name: "Delivery Timeline", unit: "days", min_value: 10, max_value: 45, default_value: 20 },
    warranty_months: { name: "warranty_months", display_name: "Warranty Period", unit: "months", min_value: 6, max_value: 36, default_value: 12 },
    support_months: { name: "support_months", display_name: "Tech Support", unit: "months", min_value: 1, max_value: 24, default_value: 6 },
  };
}

function formatCurrency(val) {
  const num = Number(val);
  if (!Number.isFinite(num)) return "—";
  return `$${Math.round(num).toLocaleString()}`;
}

function extractPrice(val) {
  if (val === null || val === undefined) return null;
  if (typeof val === "number") return val;
  if (typeof val === "object") {
    if (val.price !== undefined && val.price !== null) return Number(val.price);
    if (val.value !== undefined && val.value !== null) return Number(val.value);
  }
  return null;
}

function deriveStanceBadge(agent, history = [], state = {}) {
  const status = String(state?.status || "").toLowerCase();
  const agentId = agent?.id ?? agent;
  const agentHistory = (history || []).filter((h) => h.agent_id === agentId);
  const lastTurn = agentHistory[agentHistory.length - 1];
  const lastDecision = String(lastTurn?.decision || "").toLowerCase();

  if (status === "agreement" || status === "accepted" || lastDecision === "accept") {
    return { label: "Cooperative", classes: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" };
  }
  if (status === "rejected" || lastDecision === "reject") {
    return { label: "Aggressive", classes: "border-rose-500/40 bg-rose-500/10 text-rose-400" };
  }
  if (status === "deadlock" || status === "breakdown") {
    return { label: "Firm", classes: "border-amber-500/40 bg-amber-500/10 text-amber-300" };
  }

  if (lastTurn) {
    const concData = lastTurn.concession_data || lastTurn.parameters?.concession_tracking || {};
    const isConc = Boolean(concData.is_concession) || (concData.concession_amount ?? concData.concession ?? 0) > 0;
    const concAmt = Number(concData.concession_amount ?? concData.concession ?? 0);
    const concPct = Number(concData.concession_percentage ?? 0);
    const concDir = String(concData.concession_direction || "");

    if (isConc || concAmt > 0) {
      if (concPct >= 4 || concDir === "toward_target") {
        return { label: "Flexible", classes: "border-emerald-400/50 bg-emerald-500/20 text-emerald-300" };
      }
      return { label: "Neutral", classes: "border-sky-500/40 bg-sky-500/10 text-sky-300" };
    } else {
      if (concDir === "away_from_target" || agent?.personality === "Aggressive" || agent?.persona === "Aggressive") {
        return { label: "Aggressive", classes: "border-rose-500/40 bg-rose-500/10 text-rose-400" };
      }
      return { label: "Firm", classes: "border-indigo-500/40 bg-indigo-500/10 text-indigo-300" };
    }
  }

  const persona = agent?.personality || agent?.persona || "Collaborative";
  if (persona === "Aggressive") {
    return { label: "Firm", classes: "border-indigo-500/40 bg-indigo-500/10 text-indigo-300" };
  } else if (persona === "Collaborative") {
    return { label: "Neutral", classes: "border-sky-500/40 bg-sky-500/10 text-sky-300" };
  }
  return { label: "Firm", classes: "border-indigo-500/40 bg-indigo-500/10 text-indigo-300" };
}

function ActionBadge({ decision }) {
  const d = String(decision || "counter").toLowerCase();
  switch (d) {
    case "accept":
      return (
        <span className="rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-mono font-extrabold uppercase text-emerald-400">
          ACCEPT
        </span>
      );
    case "reject":
      return (
        <span className="rounded-lg border border-rose-500/40 bg-rose-500/15 px-2.5 py-0.5 text-[10px] font-mono font-extrabold uppercase text-rose-400">
          REJECT
        </span>
      );
    case "offer":
      return (
        <span className="rounded-lg border border-sky-500/40 bg-sky-500/15 px-2.5 py-0.5 text-[10px] font-mono font-extrabold uppercase text-sky-400">
          OFFER
        </span>
      );
    default:
      return (
        <span className="rounded-lg border border-indigo-500/40 bg-indigo-500/15 px-2.5 py-0.5 text-[10px] font-mono font-extrabold uppercase text-indigo-300">
          COUNTEROFFER
        </span>
      );
  }
}

export default function NegotiationArena({
  scenario,
  negotiation,
  onNavigate,
}) {
  const { state, isRunning, timeline, concessionTotals } = negotiation;
  const history = state?.history || [];
  const agents = state?.participating_agents || scenario?.agents || [];
  const maxRounds = state?.max_rounds || 5;

  const scenarioVars = getScenarioVariables(scenario?.id || scenario?.scenario_id, state);
  const [variableInputs, setVariableInputs] = useState({});
  const [inputMode, setInputMode] = useState("structured"); // "structured" | "natural"
  const [naturalText, setNaturalText] = useState("");
  const [isParsingNl, setIsParsingNl] = useState(false);
  const [nlSuccessNotice, setNlSuccessNotice] = useState("");
  const [coachEnabled, setCoachEnabled] = useState(true);
  const [activeHint, setActiveHint] = useState(null);
  const [isFetchingHint, setIsFetchingHint] = useState(false);
  const [isEndingSession, setIsEndingSession] = useState(false);
  const [humanMessageInput, setHumanMessageInput] = useState("");
  const [humanTermsInput, setHumanTermsInput] = useState("");
  const [inputError, setInputError] = useState("");

  // Populate initial values from scenario definition or incoming state
  useEffect(() => {
    if (!scenarioVars) return;
    setVariableInputs((prev) => {
      const updated = { ...prev };
      const currentVars = state?.current_offer?.variables || (state?.current_offer && typeof state.current_offer === "object" ? state.current_offer : {});
      for (const [key, meta] of Object.entries(scenarioVars)) {
        if (updated[key] === undefined || updated[key] === "") {
          if (currentVars[key] !== undefined && currentVars[key] !== null) {
            updated[key] = currentVars[key];
          } else {
            updated[key] = meta.default_value ?? meta.preferred_value ?? meta.min_value ?? 0;
          }
        }
      }
      return updated;
    });
  }, [scenarioVars, state?.current_offer]);

  if (scenario && !negotiation.state) {
    if (!negotiation.hasStarted) {
      negotiation.start(scenario);
    }
    return (
      <main
        data-guide="negotiation-arena"
        className="min-h-full flex-1 bg-[#17161B] px-4 py-8 sm:px-8 text-textPrimary animate-fadeIn flex items-center justify-center"
      >
        <div className="mx-auto max-w-md rounded-2xl border border-[#2D2C36] bg-[#201F25] p-10 text-center space-y-4 shadow-xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-950">
            <svg className="h-6 w-6 animate-spin text-slate-950" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.2" />
              <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white font-sans">
            Initializing Simulation Engine...
          </h1>
          <p className="text-xs text-textSecondary font-body">
            Connecting agent profiles and preparing negotiation state telemetry.
          </p>
        </div>
      </main>
    );
  }

  if (!scenario || !negotiation.state) {
    return (
      <main
        data-guide="negotiation-arena"
        className="min-h-full flex-1 bg-[#17161B] px-4 py-8 sm:px-8 text-textPrimary animate-fadeIn"
      >
        <div className="mx-auto max-w-4xl rounded-2xl border border-[#2D2C36] bg-[#201F25] p-10 text-center space-y-4 shadow-xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#3A3944] bg-[#25242C] text-white">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white font-sans">
            No Active Negotiation Session
          </h1>
          <p className="text-xs sm:text-sm text-textSecondary max-w-md mx-auto font-body">
            Configure agent rules, goals, and scenario parameters before launching the live simulation arena.
          </p>
          <button
            type="button"
            onClick={() => onNavigate("Configure Agents")}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-100 hover:bg-white text-slate-950 px-6 py-3 text-xs sm:text-sm font-extrabold border border-slate-200 shadow-md transition-all active:scale-95 cursor-pointer"
          >
            Configure Agents & Scenario →
          </button>
        </div>
      </main>
    );
  }

  const isDone =
    state.status === "agreement" ||
    state.status === "accepted" ||
    state.status === "rejected" ||
    state.status === "deadlock" ||
    state.status === "breakdown" ||
    state.status === "cancelled" ||
    state.status === "completed" ||
    state.status === "finished";

  const isPracticeMode = state.mode === "practice";
  const currentAgentObj = agents.find((a) => a.id === state.current_agent_turn);
  const isHumanTurn = isPracticeMode && !isDone && currentAgentObj?.participant_type === "human";

  // Calculate live gap metrics from actual negotiation turn history
  const agent1Id = agents[0]?.id;
  const agent2Id = agents[1]?.id;

  const agent1History = history.filter((h) => h.agent_id === agent1Id);
  const agent2History = history.filter((h) => h.agent_id === agent2Id);

  const agent1Opening = agent1History[0] ? extractPrice(agent1History[0].proposed_offer ?? agent1History[0].value) : null;
  const agent2Opening = agent2History[0] ? extractPrice(agent2History[0].proposed_offer ?? agent2History[0].value) : null;
  const openingGap = (agent1Opening !== null && agent2Opening !== null) ? Math.abs(agent1Opening - agent2Opening) : null;

  const agent1Latest = agent1History.length > 0 ? extractPrice(agent1History[agent1History.length - 1].proposed_offer ?? agent1History[agent1History.length - 1].value) : null;
  const agent2Latest = agent2History.length > 0 ? extractPrice(agent2History[agent2History.length - 1].proposed_offer ?? agent2History[agent2History.length - 1].value) : null;
  const currentGap = (agent1Latest !== null && agent2Latest !== null) ? Math.abs(agent1Latest - agent2Latest) : null;

  const convergencePct = (openingGap !== null && openingGap > 0 && currentGap !== null)
    ? Math.max(0, Math.min(100, Math.round((1 - currentGap / openingGap) * 100)))
    : null;

  // Turn metrics
  const offersCount = history.filter((h) => (extractPrice(h.proposed_offer) ?? h.value) !== null).length;
  const counteroffersCount = history.filter((h) => {
    const d = String(h.decision || "").toLowerCase();
    return d === "counter" || d === "counteroffer";
  }).length;
  const concessionsCount = history.filter((h) => {
    const cd = h.concession_data || h.parameters?.concession_tracking || {};
    return Boolean(cd.is_concession) || (cd.concession_amount ?? cd.concession ?? 0) > 0;
  }).length;

  // Multi-variable & Natural language submission handler
  const handleHumanSubmit = async (decision = "counter") => {
    setInputError("");
    setNlSuccessNotice("");
    if (isDone) {
      setInputError("Negotiation session has already ended.");
      return;
    }

    // Build payload with all scenario variables
    const varsPayload = {};
    for (const [k, v] of Object.entries(variableInputs)) {
      const num = Number(v);
      varsPayload[k] = Number.isFinite(num) ? num : v;
    }

    // Ensure price/scalar exists for backward compatibility
    let primaryPrice = varsPayload.price ?? varsPayload.salary ?? varsPayload.budget ?? 0;
    if (!primaryPrice) {
      const firstNum = Object.values(varsPayload).find((x) => typeof x === "number" && x > 100);
      primaryPrice = firstNum || 1000;
    }

    const offerPayload = {
      price: primaryPrice,
      ...varsPayload,
      variables: varsPayload,
      terms: humanTermsInput ? { details: humanTermsInput } : {}
    };

    try {
      await negotiation.submitHumanTurn(offerPayload, humanMessageInput, decision);
      setHumanMessageInput("");
      setHumanTermsInput("");
    } catch (err) {
      setInputError(err.message || "Failed to submit offer. Please check backend connection.");
    }
  };

  // Natural Language Offer Parser
  const handleParseNaturalLanguage = async () => {
    if (!naturalText.trim()) {
      setInputError("Please enter your offer description in words.");
      return;
    }
    setInputError("");
    setIsParsingNl(true);
    setNlSuccessNotice("");
    try {
      const parsed = await negotiation.parseMessage(naturalText);
      if (parsed && parsed.variables && Object.keys(parsed.variables).length > 0) {
        setVariableInputs((prev) => ({
          ...prev,
          ...parsed.variables
        }));
        setNlSuccessNotice(
          `Extracted terms: ${Object.entries(parsed.variables)
            .map(([k, v]) => `${k.replace("_", " ")}: ${v}`)
            .join(" • ")}`
        );
        setInputMode("structured"); // Switch back so user reviews and confirms!
      } else {
        setInputError("Could not automatically extract numerical terms. Please adjust the fields below manually.");
      }
    } catch (err) {
      setInputError(err.message || "Failed to parse natural language proposal.");
    } finally {
      setIsParsingNl(false);
    }
  };

  // Get AI Hint
  const handleGetHint = async () => {
    setIsFetchingHint(true);
    setInputError("");
    try {
      const hintRes = await negotiation.getHint();
      if (hintRes) {
        setActiveHint(hintRes);
      }
    } catch (err) {
      console.warn("Hint error:", err);
    } finally {
      setIsFetchingHint(false);
    }
  };

  // End Practice Session
  const handleEndPracticeSession = async () => {
    if (window.confirm("End practice negotiation session now and calculate your scorecard?")) {
      setIsEndingSession(true);
      try {
        await negotiation.endSession("manual_end");
      } catch (err) {
        setInputError(err.message || "Failed to end session.");
      } finally {
        setIsEndingSession(false);
      }
    }
  };

  return (
    <main
      data-guide="negotiation-arena"
      className="min-h-full flex-1 bg-[#17161B] px-4 py-6 sm:px-8 text-textPrimary animate-fadeIn"
    >
      <div className="mx-auto max-w-[1500px] space-y-6">

        {/* =====================================================
            1. ARENA HEADER BAR
        ====================================================== */}
        <header className="border-b border-[#292831] pb-5 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-xs font-mono font-semibold uppercase tracking-widest text-emerald-400">
                  {isPracticeMode ? "HUMAN PRACTICE ARENA" : "LIVE SIMULATION ARENA"}
                </p>
                <span className="rounded-lg border border-[#3A3944] bg-[#222129] px-2.5 py-0.5 text-[10px] font-mono font-bold text-slate-300">
                  {state.execution_mode || "Normal Mode"}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
                {scenario.scenario_name || scenario.name}
              </h1>
              <p className="mt-0.5 text-xs sm:text-sm text-textSecondary font-body">
                {isPracticeMode
                  ? "Participate directly as one party while the AI agent evaluates and responds in real time."
                  : "Real-time multi-agent turn iteration, rule evaluation, and bid convergence feed."}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold text-white bg-[#222129] px-3.5 py-2 rounded-xl border border-[#302F39]">
                Round {state.current_round} of {maxRounds}
              </span>

              <div className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-mono font-bold ${
                isDone
                  ? state.status === "agreement" || state.status === "accepted"
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                    : state.status === "rejected"
                    ? "border-rose-500/40 bg-rose-500/10 text-rose-400"
                    : state.status === "deadlock" || state.status === "breakdown"
                    ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
                    : "border-[#302F39] bg-[#222129] text-slate-400"
                  : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-sm"
              }`}>
                <span className={`h-2 w-2 rounded-full ${
                  !isDone
                    ? "bg-emerald-400 animate-pulse"
                    : state.status === "agreement" || state.status === "accepted"
                    ? "bg-emerald-400"
                    : state.status === "rejected"
                    ? "bg-rose-400"
                    : state.status === "deadlock" || state.status === "breakdown"
                    ? "bg-amber-400"
                    : "bg-slate-400"
                }`} />
                {isDone ? `STATUS: ${state.status.toUpperCase()}` : "NEGOTIATING"}
              </div>
            </div>
          </div>
        </header>

        {/* =====================================================
            2. DEADLOCK / BREAKDOWN WARNING BANNER
        ====================================================== */}
        {(state.status === "deadlock" || state.status === "breakdown") && (
          <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-5 text-amber-200 space-y-3 font-sans shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 font-bold">
                  ⚠
                </span>
                <div>
                  <h3 className="font-extrabold text-amber-300 text-base">
                    {state.status === "breakdown" ? "Negotiation Breakdown Detected" : "Negotiation Stalled / Deadlock Detected"}
                  </h3>
                  <p className="text-xs text-amber-200/90 font-body">
                    {state.deadlock_info?.reason || "No meaningful movement detected within participants' limits."}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onNavigate("Analytics")}
                  className="rounded-xl border border-amber-500/30 bg-amber-500/20 px-3.5 py-1.5 text-xs font-bold text-amber-100 hover:bg-amber-500/30 transition cursor-pointer"
                >
                  View Analysis
                </button>
                <button
                  type="button"
                  onClick={() => {
                    negotiation.reset();
                    onNavigate("Configure Agents");
                  }}
                  className="rounded-xl bg-amber-400 text-slate-950 px-3.5 py-1.5 text-xs font-black shadow-md hover:bg-amber-300 transition cursor-pointer"
                >
                  Start New Session
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
            3. "TUG-OF-WAR" BARGAINING ZONE PHYSICS SLIDER
        ====================================================== */}
        <TugOfWarBargainingZone
          scenario={scenario}
          negotiationState={state}
        />

        {/* =====================================================
            4. MAIN WORKSPACE GRID (LEFT: METRICS vs RIGHT: TRANSCRIPT)
        ====================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* LEFT PANEL: Live Negotiation Metrics & Agent Stance */}
          <div className="lg:col-span-4 space-y-6">

            {/* Live Metrics Summary */}
            <div className="rounded-2xl border border-[#2D2C36] bg-[#201F25] p-5 space-y-4 shadow-md font-mono">
              <div className="flex items-center justify-between border-b border-[#2D2C36] pb-3">
                <h3 className="text-sm font-bold text-white font-sans uppercase tracking-wider text-slate-300">
                  Live Round Metrics
                </h3>
                <span className="text-[11px] font-bold text-emerald-400">
                  {concessionsCount} Concession{concessionsCount !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-[#2D2C36] bg-[#1A191E] p-3 space-y-0.5">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Opening Gap</p>
                  <p className="text-base font-extrabold text-white">{openingGap !== null ? formatCurrency(openingGap) : "—"}</p>
                </div>

                <div className="rounded-xl border border-[#2D2C36] bg-[#1A191E] p-3 space-y-0.5">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Current Gap</p>
                  <p className="text-base font-extrabold text-emerald-400">{currentGap !== null ? formatCurrency(currentGap) : "—"}</p>
                </div>

                <div className="rounded-xl border border-[#2D2C36] bg-[#1A191E] p-3 space-y-0.5">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Convergence</p>
                  <p className="text-base font-extrabold text-sky-400">{convergencePct !== null ? `${convergencePct}%` : "—"}</p>
                </div>

                <div className="rounded-xl border border-[#2D2C36] bg-[#1A191E] p-3 space-y-0.5">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Deadlock Risk</p>
                  <p className={`text-base font-extrabold ${
                    state.deadlock_info?.is_deadlock || state.status === "deadlock" || state.status === "breakdown"
                      ? "text-amber-400"
                      : state.current_round >= 6 && convergencePct !== null && convergencePct < 40
                      ? "text-amber-300"
                      : "text-emerald-400"
                  }`}>
                    {state.deadlock_info?.is_deadlock || state.status === "deadlock" || state.status === "breakdown" ? "High" : state.current_round >= 6 && convergencePct !== null && convergencePct < 40 ? "Medium" : "Low"}
                  </p>
                </div>

                <div className="rounded-xl border border-[#2D2C36] bg-[#1A191E] p-3 space-y-0.5">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Total Offers</p>
                  <p className="text-base font-extrabold text-slate-200">{offersCount}</p>
                </div>

                <div className="rounded-xl border border-[#2D2C36] bg-[#1A191E] p-3 space-y-0.5">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Counteroffers</p>
                  <p className="text-base font-extrabold text-indigo-300">{counteroffersCount}</p>
                </div>
              </div>
            </div>

            {/* Compact Trade-off Analysis Panel (TASK 1.12) */}
            <div className="rounded-2xl border border-purple-500/30 bg-[#201D28] p-5 space-y-3 font-mono">
              <div className="flex items-center justify-between border-b border-[#302D3B] pb-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                  <span>⚡</span> Trade-off Engine Telemetry
                </h3>
                <span className="rounded bg-purple-500/20 px-2 py-0.5 text-[10px] font-bold text-purple-300">
                  {history.filter((h) => h.tradeoff_data?.tradeoff_detected || h.parameters?.tradeoff_data?.tradeoff_detected).length} Detected
                </span>
              </div>

              {/* Net Utility & Stance Metrics */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl border border-[#322F3E] bg-[#181620] p-2.5 space-y-0.5">
                  <p className="text-[10px] text-slate-400 uppercase">Human Utility</p>
                  <p className="text-sm font-extrabold text-emerald-400">
                    {state.live_metrics?.user_utility !== undefined
                      ? `${Math.round(state.live_metrics.user_utility * 100)}%`
                      : state.live_metrics?.current_offer_utility !== undefined
                      ? `${Math.round(state.live_metrics.current_offer_utility * 100)}%`
                      : "78%"}
                  </p>
                </div>
                <div className="rounded-xl border border-[#322F3E] bg-[#181620] p-2.5 space-y-0.5">
                  <p className="text-[10px] text-slate-400 uppercase">AI Utility</p>
                  <p className="text-sm font-extrabold text-sky-400">
                    {state.live_metrics?.ai_utility !== undefined
                      ? `${Math.round(state.live_metrics.ai_utility * 100)}%`
                      : "72%"}
                  </p>
                </div>
                <div className="rounded-xl border border-[#322F3E] bg-[#181620] p-2.5 space-y-0.5">
                  <p className="text-[10px] text-slate-400 uppercase">ZOPA Status</p>
                  <p className="text-sm font-extrabold text-emerald-300 uppercase">
                    {state.live_metrics?.zopa_status || (state.status === "deadlock" ? "Disputed" : "Active")}
                  </p>
                </div>
                <div className="rounded-xl border border-[#322F3E] bg-[#181620] p-2.5 space-y-0.5">
                  <p className="text-[10px] text-slate-400 uppercase">Concession Cap</p>
                  <p className="text-sm font-extrabold text-indigo-300">
                    {state.live_metrics?.concession_capacity !== undefined
                      ? `${Math.round(state.live_metrics.concession_capacity * 100)}%`
                      : "65%"}
                  </p>
                </div>
              </div>

              {/* Latest trade-off item */}
              {(() => {
                const lastTradeoffTurn = [...history].reverse().find(
                  (h) => h.tradeoff_data?.tradeoff_detected || h.parameters?.tradeoff_data?.tradeoff_detected
                );
                const td = lastTradeoffTurn?.tradeoff_data || lastTradeoffTurn?.parameters?.tradeoff_data;
                if (!td) {
                  return (
                    <p className="text-[11px] text-slate-400 font-body italic pt-1">
                      Propose multi-variable counteroffers to detect active economic trade-offs.
                    </p>
                  );
                }
                return (
                  <div className="space-y-1.5 pt-1 border-t border-[#302D3B]">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 uppercase">Latest Trade-off:</span>
                      <span className="text-emerald-400 font-bold">
                        {td.changes?.length || 0} variables shifted
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {td.changes?.map((ch, i) => (
                        <span
                          key={i}
                          className={`px-2 py-0.5 rounded text-[10px] border ${
                            ch.direction === "improved"
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                              : "border-amber-500/30 bg-amber-500/10 text-amber-300"
                          }`}
                        >
                          {ch.direction === "improved" ? "↓" : "↑"} {ch.variable.replace("_", " ")} ({ch.delta > 0 ? `+${ch.delta}` : ch.delta})
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Practice Mode Action & Coaching Tools (TASK 2.12, 2.13, 2.14) */}
            {isPracticeMode && (
              <div className="rounded-2xl border border-emerald-500/30 bg-[#1A221E] p-5 space-y-3 font-mono">
                <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <span>🎓</span> Practice Coaching Tools
                  </h3>
                  <button
                    type="button"
                    onClick={() => setCoachEnabled(!coachEnabled)}
                    className={`rounded-lg px-2 py-0.5 text-[10px] font-bold border transition ${
                      coachEnabled
                        ? "border-emerald-400 bg-emerald-500/20 text-emerald-300"
                        : "border-[#3A3944] bg-[#201F25] text-slate-400"
                    }`}
                  >
                    Coach: {coachEnabled ? "ON" : "OFF"}
                  </button>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={handleGetHint}
                    disabled={isFetchingHint || isDone}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-sky-500/40 bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 py-2.5 text-xs font-bold transition disabled:opacity-40 cursor-pointer"
                  >
                    {isFetchingHint ? (
                      <span className="flex items-center gap-2">
                        <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" />
                        </svg>
                        Analyzing Opponent...
                      </span>
                    ) : (
                      <span>💡 Get Tactical Hint</span>
                    )}
                  </button>

                  {activeHint && (
                    <div className="rounded-xl border border-sky-500/30 bg-[#151D24] p-3 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sky-400 text-[11px] uppercase">Advisor Guidance:</span>
                        <button
                          type="button"
                          onClick={() => setActiveHint(null)}
                          className="text-slate-400 hover:text-white text-[11px] cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                      <p className="text-slate-200 font-body leading-relaxed">
                        {activeHint.hint}
                      </p>
                      {activeHint.suggested_move && (
                        <p className="text-[10px] text-sky-300/90 font-mono">
                          Suggested move: {activeHint.suggested_move}
                        </p>
                      )}
                    </div>
                  )}

                  {!isDone && (
                    <button
                      type="button"
                      onClick={handleEndPracticeSession}
                      disabled={isEndingSession}
                      className="w-full rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 py-2 text-xs font-bold transition disabled:opacity-40 cursor-pointer"
                    >
                      {isEndingSession ? "Ending Session..." : "End Practice & Score"}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Agent Stance Cards */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white font-sans uppercase tracking-wider text-slate-300 px-1">
                Participant Stance Indicators
              </h3>

              {agents.map((agent) => {
                const isTurn = state.current_agent_turn === agent.id && !isDone;
                const stance = deriveStanceBadge(agent, history, state);
                const totalConcession = concessionTotals[agent.id] || 0;

                return (
                  <div
                    key={agent.id}
                    className={`rounded-2xl border p-5 space-y-3 transition-all ${
                      isTurn ? "border-emerald-400 bg-[#24232C] shadow-lg" : "border-[#2D2C36] bg-[#201F25]"
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-[#2B2A33] pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white font-sans text-sm">{agent.name}</h4>
                          {isTurn && (
                            <span className="rounded-md bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-mono font-bold text-emerald-300">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 font-body uppercase tracking-wider">{agent.role}</p>
                      </div>

                      <span className={`rounded-xl border px-3 py-1 font-mono text-xs font-bold ${stance.classes}`}>
                        ● {stance.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-400 uppercase">Policy</span>
                        <p className="font-bold text-white truncate">{agent.personality || agent.persona || "Collaborative"}</p>
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-400 uppercase">Target</span>
                        <p className="font-bold text-sky-400">{formatCurrency(getAuthoritativeTarget(agent))}</p>
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-400 uppercase">Conceded</span>
                        <p className="font-bold text-emerald-400">{formatCurrency(totalConcession)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT PANEL: Negotiation Transcript */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between border-b border-[#2D2C36] pb-3">
              <h2 className="text-base font-bold text-white font-sans flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="text-emerald-400">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Negotiation Transcript Feed
              </h2>
              <span className="font-mono text-xs text-slate-400">{history.length} Total Turns</span>
            </div>

            {history.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#302F39] bg-[#1A191E] p-10 text-center space-y-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#25242C] text-slate-400 font-mono text-sm">
                  💬
                </div>
                <h3 className="text-base font-bold text-white">Negotiation Ready</h3>
                <p className="text-xs text-textSecondary max-w-sm mx-auto">
                  {isPracticeMode
                    ? "Enter your initial offer below or click a control button to step the simulation."
                    : "Click 'Step Agent Turn' or 'Run To Completion' to begin the simulation."}
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={negotiation.step}
                    disabled={isRunning}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2.5 text-xs font-extrabold shadow-md transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    Step Agent Turn
                  </button>

                  <button
                    type="button"
                    onClick={negotiation.runToCompletion}
                    disabled={isRunning}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#3A3944] bg-[#25242C] hover:bg-[#2F2E38] text-white px-4 py-2.5 text-xs font-bold transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polygon points="13 19 22 12 13 5 13 19" />
                      <polygon points="2 19 11 12 2 5 2 19" />
                    </svg>
                    Run To Completion
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                {history.map((turn, idx) => {
                  const agent = agents.find((a) => a.id === turn.agent_id) || { id: turn.agent_id, name: turn.agent_id, role: turn.agent_id };
                  const turnHist = history.slice(0, idx + 1);
                  const stance = deriveStanceBadge(agent, turnHist, { ...state, status: idx === history.length - 1 ? state.status : "in_progress" });
                  const isHuman = turn.parameters?.is_human || agent.participant_type === "human";
                  const turnVal = extractPrice(turn.proposed_offer) ?? turn.value ?? 0;
                  const concData = turn.concession_data || turn.parameters?.concession_tracking || {};
                  const turnConcAmt = Number(concData.concession_amount ?? concData.concession ?? 0);

                  return (
                    <div
                      key={`turn-${idx}`}
                      className={`rounded-2xl border p-5 transition-all shadow-md space-y-3 ${
                        isHuman
                          ? "border-emerald-500/40 bg-[#1E2622]"
                          : "border-[#2D2C36] bg-[#201F25]"
                      }`}
                    >
                      {/* Card Top Info */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2B2A33] pb-3">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-9 w-9 items-center justify-center rounded-xl font-mono text-xs font-bold ${
                            isHuman ? "bg-emerald-400 text-slate-950" : "bg-[#25242C] text-white border border-[#3A3944]"
                          }`}>
                            {isHuman ? "YOU" : agent.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-white font-sans text-sm">{isHuman ? "Human Negotiator" : agent.name}</h4>
                              {isHuman && (
                                <span className="rounded-md bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-mono font-bold text-emerald-300">
                                  HUMAN
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 font-body uppercase tracking-wider">{agent.role}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <ActionBadge decision={turn.decision} />
                          <span className="font-mono text-xs text-slate-400 font-bold">R{turn.round}</span>
                        </div>
                      </div>

                      {/* Card Content: Offer Value & Reasoning */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                        <div className="space-y-1">
                          <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Offer Value</p>
                          <p className="text-2xl font-extrabold text-emerald-400 font-mono tracking-tight">
                            {formatCurrency(turnVal)}
                          </p>
                        </div>

                        <div className="md:col-span-2 space-y-2">
                          <div>
                            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Reasoning Summary</p>
                            <p className="text-xs text-slate-200 font-body leading-relaxed">
                              "{turn.reasoning || turn.reason || "Offer submitted based on strategy."}"
                            </p>
                          </div>

                          {/* Multi-Variable Package Breakdown (TASK 1.12) */}
                          {(() => {
                            const turnVars =
                              turn.variables ||
                              turn.tradeoff_data?.variables ||
                              turn.proposed_offer?.variables ||
                              (typeof turn.proposed_offer === "object" && turn.proposed_offer !== null
                                ? turn.proposed_offer
                                : null);
                            if (!turnVars || typeof turnVars !== "object") return null;
                            const entries = Object.entries(turnVars).filter(
                              ([k]) => k !== "price" && k !== "value" && k !== "terms" && k !== "variables"
                            );
                            if (entries.length === 0) return null;
                            return (
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {entries.map(([vk, vv]) => (
                                  <span
                                    key={vk}
                                    className="rounded-lg border border-[#3A3944] bg-[#17161D] px-2 py-0.5 text-[10px] font-mono"
                                  >
                                    <span className="text-slate-400 capitalize">{vk.replace("_", " ")}: </span>
                                    <span className="font-bold text-sky-300">
                                      {typeof vv === "number" &&
                                      (vk.includes("salary") || vk.includes("budget") || vk.includes("bonus"))
                                        ? formatCurrency(vv)
                                        : `${vv}`}
                                    </span>
                                  </span>
                                ))}
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Trade-off Detected Indicator (TASK 1.4 & 1.12) */}
                      {(() => {
                        const td = turn.tradeoff_data || turn.parameters?.tradeoff_data;
                        if (!td || !td.tradeoff_detected) return null;
                        return (
                          <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-3 space-y-1.5 font-mono text-xs">
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1.5 font-bold text-purple-300 text-[11px] uppercase tracking-wide">
                                <span>⚡</span> Trade-off Detected
                              </span>
                              {td.pareto_improving && (
                                <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-extrabold text-emerald-300">
                                  PARETO IMPROVING
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-1.5 text-[10px]">
                              {td.changes?.map((ch, cidx) => (
                                <span
                                  key={cidx}
                                  className={`px-2 py-0.5 rounded border ${
                                    ch.direction === "improved"
                                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                                      : "border-amber-500/30 bg-amber-500/10 text-amber-300"
                                  }`}
                                >
                                  {ch.direction === "improved" ? "↓" : "↑"} {ch.variable.replace("_", " ")}: {ch.direction} (
                                  {ch.delta > 0 ? `+${ch.delta}` : ch.delta})
                                </span>
                              ))}
                            </div>
                            {td.description && (
                              <p className="text-[11px] text-slate-300 font-body italic pt-0.5">
                                "{td.description}"
                              </p>
                            )}
                          </div>
                        );
                      })()}

                      {/* Coaching Feedback Banner (TASK 2.12) */}
                      {coachEnabled && (turn.strategy_feedback || turn.parameters?.strategy_feedback) && (
                        <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-3 space-y-1 font-body text-xs text-sky-200">
                          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-sky-400">
                            🎓 AI Negotiation Coach Feedback
                          </span>
                          <p>{turn.strategy_feedback || turn.parameters.strategy_feedback}</p>
                        </div>
                      )}

                      {/* Card Footer: Concession & Stance */}
                      <div className="flex items-center justify-between pt-2 border-t border-[#2B2A33] text-xs font-mono">
                        <div className="flex items-center gap-2 text-slate-400">
                          <span>Concession:</span>
                          <span className="font-bold text-emerald-400">
                            {turnConcAmt > 0 ? `+${formatCurrency(turnConcAmt)}` : "$0"}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400 text-[11px]">Stance:</span>
                          <span className={`rounded-lg border px-2.5 py-0.5 font-bold ${stance.classes}`}>
                            {stance.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* PRACTICE MODE DYNAMIC MULTI-VARIABLE INPUT INTERFACE (TASK 2.4 & 2.5) */}
            {isHumanTurn && (
              <div className="rounded-2xl border border-emerald-500/40 bg-[#1A231E] p-5 space-y-4 shadow-xl font-sans mt-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-500/20 pb-3">
                  <div>
                    <span className="font-mono text-xs font-extrabold text-emerald-400 uppercase tracking-wider">
                      Your Turn (Practice Mode)
                    </span>
                    <h3 className="text-lg font-extrabold text-white">Interactive Offer Composer</h3>
                  </div>

                  {/* Input Mode Selector: Structured vs Natural Language */}
                  <div className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-[#131A16] p-1 font-mono text-xs">
                    <button
                      type="button"
                      onClick={() => setInputMode("structured")}
                      className={`rounded-lg px-3 py-1 font-bold transition cursor-pointer ${
                        inputMode === "structured"
                          ? "bg-emerald-500 text-slate-950 shadow-sm"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Variables Form
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputMode("natural")}
                      className={`rounded-lg px-3 py-1 font-bold transition cursor-pointer ${
                        inputMode === "natural"
                          ? "bg-emerald-500 text-slate-950 shadow-sm"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Natural Language AI
                    </button>
                  </div>
                </div>

                {inputError && (
                  <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300 font-medium">
                    ⚠ {inputError}
                  </div>
                )}

                {nlSuccessNotice && (
                  <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs text-emerald-300 font-medium">
                    ✓ {nlSuccessNotice}
                  </div>
                )}

                {/* Natural Language Input Mode */}
                {inputMode === "natural" && (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-bold uppercase text-slate-300">
                        Type your proposal in plain English:
                      </label>
                      <textarea
                        rows={3}
                        placeholder="e.g. I can offer 95,000 if you can deliver within 20 days and provide 12 months warranty."
                        value={naturalText}
                        onChange={(e) => {
                          setInputError("");
                          setNaturalText(e.target.value);
                        }}
                        disabled={isRunning || isDone || isParsingNl}
                        className="w-full rounded-xl border border-[#302F39] bg-[#141318] px-4 py-2.5 text-sm font-body text-white focus:border-emerald-400 focus:outline-none resize-none disabled:opacity-50"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] text-slate-400 font-body">
                        The AI parser extracts structured parameters and populates the variable fields for review.
                      </p>
                      <button
                        type="button"
                        onClick={handleParseNaturalLanguage}
                        disabled={isParsingNl || !naturalText.trim()}
                        className="inline-flex items-center gap-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 px-4 py-2 text-xs font-extrabold shadow-md transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
                      >
                        {isParsingNl ? (
                          <span className="flex items-center gap-1.5">
                            <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3"/></svg>
                            Parsing Offer...
                          </span>
                        ) : (
                          <span>⚡ Parse with AI →</span>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Dynamic Multi-Variable Inputs Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleHumanSubmit("counter");
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {Object.entries(scenarioVars).map(([vname, vdef]) => {
                      const val = variableInputs[vname] !== undefined ? variableInputs[vname] : "";
                      return (
                        <div key={vname} className="space-y-1 rounded-xl border border-[#2D2C36] bg-[#141318] p-3">
                          <label className="text-[11px] font-mono font-bold uppercase text-slate-300 block">
                            {vdef.display_name || vname.replace("_", " ")}
                            {vdef.unit ? ` (${vdef.unit})` : ""}
                            {vdef.hard && <span className="text-rose-400 ml-1">*</span>}
                          </label>
                          <input
                            type="number"
                            step={vdef.step || (vdef.type === "integer" ? "1" : "0.01")}
                            min={vdef.min_value}
                            max={vdef.max_value}
                            value={val}
                            onChange={(e) => {
                              setInputError("");
                              setVariableInputs((prev) => ({
                                ...prev,
                                [vname]: e.target.value
                              }));
                            }}
                            disabled={isRunning || isDone}
                            className="w-full rounded-lg border border-[#302F39] bg-[#1B1A22] px-3 py-1.5 text-sm font-mono font-bold text-white focus:border-emerald-400 focus:outline-none disabled:opacity-50"
                            required={vdef.hard}
                          />
                          <p className="text-[10px] text-slate-500 font-mono">
                            Range: {vdef.min_value} - {vdef.max_value}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold uppercase text-slate-300">
                      Strategic Message / Rationale (Optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Explain your trade-off or commercial rationale (e.g. trading timeline for price)..."
                      value={humanMessageInput}
                      onChange={(e) => setHumanMessageInput(e.target.value)}
                      disabled={isRunning || isDone}
                      className="w-full rounded-xl border border-[#302F39] bg-[#141318] px-4 py-2 text-sm font-body text-white focus:border-emerald-400 focus:outline-none resize-none disabled:opacity-50"
                    />
                  </div>

                  {isRunning && (
                    <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-mono text-emerald-300">
                      <svg className="h-4 w-4 animate-spin text-emerald-400" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" />
                      </svg>
                      <span>AI is evaluating your multi-variable offer...</span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => handleHumanSubmit("reject")}
                      disabled={isRunning || isDone}
                      className="rounded-xl border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 px-4 py-2.5 text-xs font-bold transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
                    >
                      Reject Offer
                    </button>

                    <button
                      type="button"
                      onClick={() => handleHumanSubmit("accept")}
                      disabled={isRunning || isDone}
                      className="rounded-xl border border-emerald-500/40 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 px-4 py-2.5 text-xs font-extrabold transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
                    >
                      Accept Offer
                    </button>

                    <button
                      type="submit"
                      disabled={isRunning || isDone}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 px-6 py-2.5 text-xs font-extrabold border border-emerald-300 shadow-md transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
                    >
                      Submit Counteroffer →
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* =====================================================
            4. SESSION CONTROL & HISTORICAL TIMELINE PANEL
        ====================================================== */}
        <NegotiationSessionPanel
          scenario={scenario}
          state={state}
          isRunning={isRunning}
          timeline={timeline}
          concessionTotals={concessionTotals}
          onStep={negotiation.step}
          onRunToCompletion={negotiation.runToCompletion}
          onReset={() => {
            negotiation.reset();
            onNavigate("Configure Agents");
          }}
        />

        {isDone && (
          <OutcomeScreen
            scenario={scenario}
            state={state}
            timeline={timeline}
            onDownloadReport={() => {
              onNavigate("Reports");
              window.setTimeout(() => window.print(), 150);
            }}
          />
        )}

        {isDone && (
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => onNavigate("Analytics")}
              className="rounded-xl border border-[#302F39] bg-[#222129] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#2A2933] transition cursor-pointer"
            >
              View System Analytics
            </button>
            <button
              type="button"
              onClick={() => onNavigate("Reports")}
              className="rounded-xl bg-slate-100 hover:bg-white text-slate-950 px-5 py-2.5 text-xs font-bold border border-slate-200 shadow-md transition cursor-pointer"
            >
              Open Full Audit Report →
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
