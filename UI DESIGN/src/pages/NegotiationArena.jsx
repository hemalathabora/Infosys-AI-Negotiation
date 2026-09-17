import { useState } from "react";
import NegotiationSessionPanel from "../components/NegotiationSessionPanel";
import OutcomeScreen from "../components/OutcomeScreen";
import { getAuthoritativeTarget } from "../engine/concessionTracking.js";

function formatCurrency(val) {
  const num = Number(val);
  if (!Number.isFinite(num)) return "—";
  return `$${Math.round(num).toLocaleString()}`;
}function extractPrice(val) {
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
  const [humanPriceInput, setHumanPriceInput] = useState("");
  const [humanMessageInput, setHumanMessageInput] = useState("");
  const [humanTermsInput, setHumanTermsInput] = useState("");
  const [inputError, setInputError] = useState("");

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

  const { state, isRunning, timeline, concessionTotals } = negotiation;
  const history = state.history || [];
  const agents = state.participating_agents || scenario.agents || [];
  const maxRounds = (state.max_rounds && state.max_rounds <= 5) ? state.max_rounds : 5;

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

  // Handle Practice Mode offer submission
  const handleHumanSubmit = async (e) => {
    e.preventDefault();
    setInputError("");

    const normalizedPrice = String(humanPriceInput).trim();
    const priceNum = Number(normalizedPrice);
    if (!normalizedPrice || !Number.isFinite(priceNum) || priceNum <= 0) {
      setInputError("Please enter a valid numeric offer price greater than $0.");
      return;
    }

    try {
      const offerPayload = {
        price: priceNum,
        terms: humanTermsInput ? { details: humanTermsInput } : {}
      };
      await negotiation.submitHumanTurn(offerPayload, humanMessageInput, "counter");
      setHumanPriceInput("");
      setHumanMessageInput("");
      setHumanTermsInput("");
    } catch (err) {
      setInputError(err.message || "Failed to submit offer. Please check backend connection.");
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
            3. MAIN WORKSPACE GRID (LEFT: METRICS vs RIGHT: TRANSCRIPT)
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
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                        <div className="space-y-1">
                          <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Offer Value</p>
                          <p className="text-2xl font-extrabold text-emerald-400 font-mono tracking-tight">
                            {formatCurrency(turnVal)}
                          </p>
                        </div>

                        <div className="md:col-span-2 space-y-1">
                          <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Reasoning Summary</p>
                          <p className="text-xs text-slate-200 font-body leading-relaxed">
                            "{turn.reasoning || turn.reason || "Offer submitted based on strategy."}"
                          </p>
                        </div>
                      </div>

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

            {/* PRACTICE MODE HUMAN INPUT INTERFACE */}
            {isHumanTurn && (
              <div className="rounded-2xl border border-emerald-500/40 bg-[#1A231E] p-5 space-y-4 shadow-xl font-sans mt-4">
                <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
                  <div>
                    <span className="font-mono text-xs font-extrabold text-emerald-400 uppercase tracking-wider">Your Turn (Practice Mode)</span>
                    <h3 className="text-lg font-extrabold text-white">Enter Your Proposal</h3>
                  </div>
                  <span className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-xs font-bold text-emerald-300">
                    Active Party: {currentAgentObj?.name || "Human Negotiator"}
                  </span>
                </div>

                {inputError && (
                  <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300 font-medium">
                    ⚠ {inputError}
                  </div>
                )}

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleHumanSubmit(e);
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-bold uppercase text-slate-300">
                        {String(scenario?.id || "").includes("job")
                          ? "Offered Salary ($)"
                          : String(scenario?.id || "").includes("budget")
                          ? "Budget Allocation ($)"
                          : "Offer Price ($)"}{" "}
                        <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder={
                          String(scenario?.id || "").includes("job")
                            ? "e.g. 62000"
                            : String(scenario?.id || "").includes("budget")
                            ? "e.g. 150000"
                            : "e.g. 44500"
                        }
                        value={humanPriceInput}
                        onChange={(e) => {
                          setInputError("");
                          setHumanPriceInput(e.target.value);
                        }}
                        disabled={isRunning || isDone}
                        className="w-full rounded-xl border border-[#302F39] bg-[#141318] px-4 py-2.5 text-sm font-mono font-bold text-white focus:border-emerald-400 focus:outline-none disabled:opacity-50"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-bold uppercase text-slate-300">Terms / Scope (Optional)</label>
                      <input
                        type="text"
                        placeholder={
                          String(scenario?.id || "").includes("job")
                            ? "e.g. Remote work, 3 weeks PTO"
                            : String(scenario?.id || "").includes("budget")
                            ? "e.g. Phase 1 deliverables"
                            : "e.g. 12 month contract + standard support"
                        }
                        value={humanTermsInput}
                        onChange={(e) => setHumanTermsInput(e.target.value)}
                        disabled={isRunning || isDone}
                        className="w-full rounded-xl border border-[#302F39] bg-[#141318] px-4 py-2.5 text-sm font-body text-white focus:border-emerald-400 focus:outline-none disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold uppercase text-slate-300">Strategic Message / Rationale (Optional)</label>
                    <textarea
                      rows={2}
                      placeholder="Explain the reasoning behind your proposal..."
                      value={humanMessageInput}
                      onChange={(e) => setHumanMessageInput(e.target.value)}
                      disabled={isRunning || isDone}
                      className="w-full rounded-xl border border-[#302F39] bg-[#141318] px-4 py-2.5 text-sm font-body text-white focus:border-emerald-400 focus:outline-none resize-none disabled:opacity-50"
                    />
                  </div>

                  {isRunning && (
                    <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-mono text-emerald-300">
                      <svg className="h-4 w-4 animate-spin text-emerald-400" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" />
                      </svg>
                      <span>AI is evaluating your offer...</span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={async () => {
                        setInputError("");
                        if (isDone) {
                          setInputError("Negotiation session has already ended.");
                          return;
                        }
                        const normalizedPrice = String(humanPriceInput).trim();
                        const priceNum = Number(normalizedPrice);
                        if (!normalizedPrice || !Number.isFinite(priceNum) || priceNum <= 0) {
                          setInputError("Offer value is required. Please enter a valid amount.");
                          return;
                        }
                        try {
                          const offerPayload = { price: priceNum, terms: humanTermsInput ? { details: humanTermsInput } : {} };
                          await negotiation.submitHumanTurn(offerPayload, humanMessageInput, "reject");
                          setHumanPriceInput("");
                          setHumanMessageInput("");
                          setHumanTermsInput("");
                        } catch (err) {
                          setInputError(err.message || "Unable to generate the AI response. Please try again.");
                        }
                      }}
                      disabled={isRunning || isDone}
                      className="rounded-xl border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 px-4 py-2.5 text-xs font-bold transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
                    >
                      Reject Offer
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        setInputError("");
                        if (isDone) {
                          setInputError("Negotiation session has already ended.");
                          return;
                        }
                        const latestOpponentVal = Number(state.current_offer?.price ?? state.current_offer?.value ?? 0);
                        const normalizedPrice = String(humanPriceInput).trim();
                        const parsedPrice = Number(normalizedPrice);
                        const priceNum = Number.isFinite(parsedPrice) && parsedPrice > 0
                          ? parsedPrice
                          : latestOpponentVal > 0 ? latestOpponentVal : 0;

                        if (priceNum <= 0) {
                          setInputError("Offer value is required. Please enter a valid amount.");
                          return;
                        }
                        try {
                          const offerPayload = { price: priceNum, terms: humanTermsInput ? { details: humanTermsInput } : {} };
                          await negotiation.submitHumanTurn(offerPayload, humanMessageInput || "Accepted offer.", "accept");
                          setHumanPriceInput("");
                          setHumanMessageInput("");
                          setHumanTermsInput("");
                        } catch (err) {
                          setInputError(err.message || "Unable to generate the AI response. Please try again.");
                        }
                      }}
                      disabled={isRunning || isDone}
                      className="rounded-xl border border-emerald-500/40 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 px-4 py-2.5 text-xs font-extrabold transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
                    >
                      Accept Offer
                    </button>

                    <button
                      type="submit"
                      disabled={isRunning || isDone || !humanPriceInput}
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
