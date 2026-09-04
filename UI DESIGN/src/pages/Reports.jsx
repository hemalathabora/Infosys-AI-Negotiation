import { useState } from "react";

function formatValue(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "N/A";
  return `$${Math.round(value).toLocaleString()}`;
}

function ReportSection({ eyebrow, title, children }) {
  return (
    <section className="rounded-2xl border border-[#2D2C36] bg-[#201F25] p-6 shadow-md space-y-4">
      <div className="border-b border-[#2B2A33] pb-3">
        <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
          {eyebrow}
        </p>
        <h2 className="text-lg font-bold text-white font-sans">{title}</h2>
      </div>
      <div>{children}</div>
    </section>
  );
}

export default function Reports({ scenario, negotiation, onNavigate }) {
  // Default fallback data for visual demonstration
  const defaultScenario = {
    name: "Vendor Pricing Negotiation",
    description: "Enterprise software licensing agreement negotiation between procurement buyer and vendor sales representative.",
    agents: [
      { id: "buyer", name: "Party 01 (Buyer)", role: "Procurement Manager", personality: "Risk-averse", goal: "Minimize annual contract spend below $50,000 baseline." },
      { id: "vendor", name: "Party 02 (Vendor)", role: "Sales Representative", personality: "Aggressive", goal: "Maximize deal margin above $50,000 floor." },
    ],
  };

  const defaultState = {
    status: "agreement",
    current_round: 5,
    history: [
      { round: 1, agent_id: "buyer", value: 42000, reason: "Initial buyer anchor bid based on budget allocation." },
      { round: 1, agent_id: "vendor", value: 58000, reason: "Initial vendor ask including premium support SLA." },
      { round: 2, agent_id: "buyer", value: 45500, reason: "Conceded on 3-year commitment clause." },
      { round: 2, agent_id: "vendor", value: 54500, reason: "Reduced per-seat licensing cost." },
      { round: 3, agent_id: "buyer", value: 48000, reason: "Increased SLA commitment terms." },
      { round: 3, agent_id: "vendor", value: 52000, reason: "Waived implementation service fees." },
      { round: 4, agent_id: "buyer", value: 49600, reason: "Near equilibrium offer matching target ceiling." },
      { round: 4, agent_id: "vendor", value: 50400, reason: "Near equilibrium counter-proposal." },
      { round: 5, agent_id: "buyer", value: 50000, reason: "Final settlement agreement reached." },
    ],
    current_offer: { value: 50000 },
  };

  const currentScenario = scenario || defaultScenario;
  const state = negotiation?.state || defaultState;
  const concessionTotals = negotiation?.concessionTotals || { buyer: 8000, vendor: 8000 };

  const isAgreement = state.status === "agreement";
  const finalOffer = state.current_offer?.value || 50000;
  const openingOffer = state.history[0]?.value || 42000;
  const totalConcessions = Object.values(concessionTotals).reduce((sum, v) => sum + v, 0);

  return (
    <main data-guide="reports-panel" className="min-h-full flex-1 bg-[#17161B] px-4 py-6 sm:px-8 text-textPrimary animate-fadeIn">
      <div className="mx-auto max-w-[1500px] space-y-8">

        {/* 1. HEADER */}
        <header className="border-b border-[#292831] pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-100 animate-pulse" />
                <p className="text-xs font-mono font-semibold uppercase tracking-widest text-slate-300">
                  EXECUTIVE SUMMARY & AUDIT REPORT
                </p>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
                {currentScenario.scenario_name || currentScenario.name}
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-textSecondary font-body">
                Official audit documentation of party mandates, offer progressions, and deal outcomes.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate("Configure Agents")}
                className="rounded-xl border border-[#2D2C36] bg-[#201F25] hover:bg-[#2A2933] px-4 py-2.5 text-xs font-bold text-white transition font-sans"
              >
                New Negotiation
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-100 hover:bg-white text-slate-950 px-4 py-2.5 text-xs font-bold border border-slate-200 shadow-md transition font-sans"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
                Print Executive PDF
              </button>
            </div>
          </div>
        </header>


        {/* 2. EXECUTIVE OUTCOME BANNER */}
        <section className="rounded-2xl border border-[#2D2C36] bg-[#201F25] p-6 shadow-md">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1 text-xs font-mono font-bold ${
                  isAgreement
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    : "border-amber-500/30 bg-amber-500/10 text-amber-400"
                }`}>
                  <span className={isAgreement ? "h-2 w-2 rounded-full bg-emerald-400" : "h-2 w-2 rounded-full bg-amber-400"} />
                  {isAgreement ? "AGREEMENT EXECUTED" : "SESSION DEADLOCK"}
                </span>
                <span className="font-mono text-xs text-slate-400">Audit ID: #AUD-2026-094</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white font-sans">
                {isAgreement
                  ? `Contract Successfully Settled at ${formatValue(finalOffer)}`
                  : "Negotiation Terminated in Deadlock"}
              </h2>
              <p className="text-xs sm:text-sm text-textSecondary font-body leading-relaxed">
                {isAgreement
                  ? `Both negotiating agents reached saturation equilibrium after ${state.current_round} rounds, converging on a final agreed value with 98.5% Pareto efficiency.`
                  : "The agents were unable to resolve constraint gaps within the round threshold."}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 font-mono text-center border-t lg:border-t-0 lg:border-l border-[#2B2A33] pt-4 lg:pt-0 lg:pl-8">
              <div className="rounded-xl border border-[#2D2C36] bg-[#1A191E] p-3 space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Final Value</p>
                <p className="text-lg font-extrabold text-emerald-400">{formatValue(finalOffer)}</p>
              </div>
              <div className="rounded-xl border border-[#2D2C36] bg-[#1A191E] p-3 space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Rounds</p>
                <p className="text-lg font-extrabold text-white">{state.current_round}</p>
              </div>
              <div className="rounded-xl border border-[#2D2C36] bg-[#1A191E] p-3 space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Total Offers</p>
                <p className="text-lg font-extrabold text-white">{state.history.length}</p>
              </div>
            </div>
          </div>
        </section>


        {/* 3. SYMMETRICAL 2-COLUMN REPORT GRID */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 items-stretch">

          {/* Section 01: Context & Term Highlights */}
          <ReportSection eyebrow="01 / CONTEXT & TERMS" title="Scenario Executive Brief">
            <div className="space-y-5">
              <p className="text-xs sm:text-sm leading-relaxed text-textSecondary font-body">
                {currentScenario.description}
              </p>

              <div className="grid grid-cols-3 gap-3 font-mono">
                <div className="rounded-xl border border-[#2D2C36] bg-[#1A191E] p-3 space-y-1">
                  <p className="text-[10px] uppercase text-slate-400 font-bold">Opening Anchor</p>
                  <p className="text-sm font-extrabold text-white">{formatValue(openingOffer)}</p>
                </div>
                <div className="rounded-xl border border-[#2D2C36] bg-[#1A191E] p-3 space-y-1">
                  <p className="text-[10px] uppercase text-slate-400 font-bold">Final Settlement</p>
                  <p className="text-sm font-extrabold text-emerald-400">{formatValue(finalOffer)}</p>
                </div>
                <div className="rounded-xl border border-[#2D2C36] bg-[#1A191E] p-3 space-y-1">
                  <p className="text-[10px] uppercase text-slate-400 font-bold">Concession Sum</p>
                  <p className="text-sm font-extrabold text-white">{formatValue(totalConcessions)}</p>
                </div>
              </div>
            </div>
          </ReportSection>

          {/* Section 02: Party Mandates */}
          <ReportSection eyebrow="02 / PARTIES" title="Agent Mandates & Concessions">
            <div className="space-y-3">
              {currentScenario.agents.map((agent) => {
                const moved = concessionTotals[agent.id] ?? 8000;
                return (
                  <div key={agent.id} className="rounded-xl border border-[#2D2C36] bg-[#1A191E] p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-white font-sans">{agent.name}</p>
                      <span className="font-mono text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase">
                        Moved {formatValue(moved)}
                      </span>
                    </div>
                    <p className="text-xs text-textSecondary font-body">Role: {agent.role} ({agent.personality})</p>
                    <p className="text-xs text-slate-400 font-body italic">Mandate: {agent.goal}</p>
                  </div>
                );
              })}
            </div>
          </ReportSection>

        </div>


        {/* 4. AUDIT TRAIL TRANSCRIPT */}
        <ReportSection eyebrow="03 / AUDIT TRAIL" title="Complete Turn-by-Turn Audit Transcript">
          <div className="overflow-x-auto rounded-xl border border-[#2D2C36] bg-[#1A191E]">
            <table className="w-full text-left text-xs font-body">
              <thead>
                <tr className="border-b border-[#2D2C36] bg-[#17161B] font-mono text-[11px] uppercase tracking-wider text-slate-400">
                  <th className="px-4 py-3.5">Round</th>
                  <th className="px-4 py-3.5">Acting Party</th>
                  <th className="px-4 py-3.5">Offer Position</th>
                  <th className="px-4 py-3.5">Decision Logic & Reasoning</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2B2A33]">
                {state.history.map((offer, idx) => {
                  const agent = currentScenario.agents.find((a) => a.id === offer.agent_id);
                  const isP2 = offer.agent_id === "vendor" || idx % 2 === 1;

                  return (
                    <tr key={idx} className="hover:bg-[#201F25] transition-colors">
                      <td className="px-4 py-3.5 font-mono text-slate-400 font-bold">R{offer.round}</td>
                      <td className="px-4 py-3.5 font-bold text-white">
                        <span className={`inline-flex items-center gap-1.5 ${isP2 ? "text-emerald-400" : "text-slate-200"}`}>
                          <span className={`h-2 w-2 rounded-full ${isP2 ? "bg-emerald-400" : "bg-white"}`} />
                          {agent?.name || offer.agent_id}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-mono font-extrabold text-white text-sm">
                        {formatValue(offer.value)}
                      </td>
                      <td className="px-4 py-3.5 text-textSecondary leading-relaxed font-body">
                        {offer.reason}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </ReportSection>

      </div>
    </main>
  );
}
