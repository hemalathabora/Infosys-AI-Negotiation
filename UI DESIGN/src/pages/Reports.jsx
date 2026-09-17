import { buildNegotiationReportData, formatCurrency, safeText } from "../services/negotiationReport.js";

function decisionClass(decision) {
  if (decision === "ACCEPT") return "border-emerald-500/40 bg-emerald-500/10 text-emerald-400";
  if (decision === "REJECT") return "border-rose-500/40 bg-rose-500/10 text-rose-400";
  return "border-sky-500/40 bg-sky-500/10 text-sky-300";
}

export default function Reports({ scenario, negotiation, onNavigate }) {
  const report = buildNegotiationReportData(negotiation?.state, scenario, negotiation?.timeline);
  const overview = [
    ["Final Agreement", report.finalAgreement],
    ["Rounds Elapsed", report.rounds ?? "N/A"],
    ["Total Recorded Turns", report.turns],
    ["Negotiation Mode", report.mode],
  ];

  return (
    <main data-guide="reports-panel" className="min-h-full flex-1 bg-[#17161B] px-4 py-6 sm:px-8 text-textPrimary print:bg-white print:px-0">
      <div className="mx-auto max-w-[1500px] space-y-6 print:max-w-none">
        <header className="border-b border-[#292831] pb-6 print:border-slate-900">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-base font-extrabold text-white print:text-slate-900">NEGOMIND AI</p>
              <p className="mt-1 text-xs text-textSecondary print:text-slate-600">AI-Driven Multi-Agent Negotiation Training & Simulation Platform</p>
              <p className="mt-5 text-[11px] font-mono font-bold uppercase tracking-widest text-slate-400">NEGOTIATION SUMMARY REPORT</p>
              <h1 className="mt-1 text-2xl font-extrabold text-white print:text-slate-900">{report.scenarioName}</h1>
              <p className="mt-1 text-xs text-textSecondary print:text-slate-600">Mode: {report.mode} · Generated: {report.generatedAt}</p>
              <span className="mt-3 inline-flex rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-mono font-bold uppercase text-emerald-400">{report.statusLabel}</span>
            </div>
            <div className="flex gap-2 print:hidden">
              <button type="button" onClick={() => window.print()} className="rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-950">Download PDF</button>
              <button type="button" onClick={() => onNavigate("Configure Agents")} className="rounded-xl border border-[#2D2C36] bg-[#201F25] px-4 py-2.5 text-xs font-bold text-white">New Negotiation</button>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4 print:grid-cols-4">
          {overview.map(([label, value]) => <div key={label} className="rounded-xl border border-[#2D2C36] bg-[#201F25] p-4 print:border-slate-300 print:bg-white"><p className="text-[10px] font-mono font-bold uppercase text-slate-400">{label}</p><p className="mt-1 break-words text-lg font-extrabold text-white print:text-slate-900">{safeText(value)}</p></div>)}
        </section>

        <section className="rounded-2xl border border-[#2D2C36] bg-[#201F25] p-6 print:border-slate-300 print:bg-white">
          <h2 className="text-lg font-bold text-white print:text-slate-900">Agreement Summary</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3"><div><p className="label">Final agreement value</p><p className="value text-emerald-400">{report.finalAgreement}</p></div><div><p className="label">Final status</p><p className="value text-white print:text-slate-900">{report.statusLabel}</p></div><div><p className="label">Settlement / terms</p><p className="value text-white print:text-slate-900">{report.finalTerms}</p></div></div>
          <p className="mt-4 text-sm text-textSecondary print:text-slate-600">{report.outcomeSummary}</p>
        </section>

        <section className="rounded-2xl border border-[#2D2C36] bg-[#201F25] p-6 print:border-slate-300 print:bg-white">
          <h2 className="text-lg font-bold text-white print:text-slate-900">Agent Objectives & Satisfaction</h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {report.agents.length === 0 ? <p className="text-sm text-slate-400">N/A</p> : report.agents.map((agent) => <article key={agent.id} className="rounded-xl border border-[#2D2C36] bg-[#1A191E] p-5 print:border-slate-300 print:bg-white"><div className="flex justify-between gap-3 border-b border-[#2B2A33] pb-3"><div><h3 className="font-bold text-white print:text-slate-900">{agent.name}</h3><p className="mt-1 text-xs text-slate-400">{agent.role} · {agent.personality}</p></div><div className="text-right"><p className="label">Satisfaction</p><p className="value text-sky-400">{agent.satisfaction}</p></div></div><p className="mt-4 text-sm text-slate-200 print:text-slate-700"><span className="label">Objective</span>{agent.objective}</p><p className="mt-3 text-sm text-emerald-400"><span className="label">Final position</span>{agent.finalPositionLabel}</p><div className="mt-4 border-t border-[#2B2A33] pt-3"><p className="label">Concession timeline</p><div className="mt-2 space-y-1">{agent.timeline.length === 0 ? <p className="text-xs text-slate-500">N/A</p> : agent.timeline.map((item, index) => <div key={`${agent.id}-${index}`} className="grid grid-cols-[42px_1fr_auto] gap-2 rounded-lg border border-[#3A3944] px-3 py-2 text-xs font-mono print:border-slate-300"><span className="text-slate-400">R{safeText(item.round)}</span><strong className="text-slate-200 print:text-slate-900">{formatCurrency(item.value)}</strong><span className="text-slate-400">Movement: {formatCurrency(item.delta ?? 0)}</span></div>)}</div></div></article>)}
          </div>
        </section>

        <section className="rounded-2xl border border-[#2D2C36] bg-[#201F25] p-6 print:border-slate-300 print:bg-white"><h2 className="text-lg font-bold text-white print:text-slate-900">Concession Timeline</h2><div className="mt-4 grid gap-4 lg:grid-cols-2">{report.agents.map((agent) => <div key={agent.id} className="overflow-x-auto"><p className="mb-2 font-bold text-white print:text-slate-900">{agent.name}</p><div className="flex min-w-max gap-1">{agent.timeline.map((item, index) => <div key={`${agent.id}-timeline-${index}`} className="flex items-start"><div className="min-w-[92px] rounded-lg border border-[#3A3944] bg-[#1A191E] p-3 text-center print:border-slate-300 print:bg-white"><p className="text-[10px] text-slate-400">R{safeText(item.round)}</p><p className="mt-1 font-mono font-bold text-emerald-400">{formatCurrency(item.value)}</p><p className="mt-1 text-[10px] text-slate-400">{formatCurrency(item.delta ?? 0)}</p></div>{index < agent.timeline.length - 1 && <span className="px-1 pt-7 text-slate-500">→</span>}</div>)}</div></div>)}</div></section>

        <section className="rounded-2xl border border-[#2D2C36] bg-[#201F25] p-6 print:border-slate-300 print:bg-white"><h2 className="text-lg font-bold text-white print:text-slate-900">Complete Negotiation Transcript</h2><div className="mt-4 overflow-x-auto rounded-xl border border-[#2D2C36] print:border-slate-300"><table className="w-full min-w-[950px] text-left text-xs"><thead className="bg-[#17161B] font-mono text-[10px] uppercase text-slate-400 print:bg-slate-100"><tr><th className="px-3 py-3">Turn</th><th className="px-3 py-3">Round</th><th className="px-3 py-3">Agent</th><th className="px-3 py-3">Decision</th><th className="px-3 py-3">Offer</th><th className="px-3 py-3">Concession</th><th className="px-3 py-3">Reasoning</th></tr></thead><tbody className="divide-y divide-[#2B2A33]">{report.transcript.length === 0 ? <tr><td colSpan="7" className="px-3 py-4 text-slate-500">N/A</td></tr> : report.transcript.map((entry) => <tr key={entry.turn} className="align-top"><td className="px-3 py-3 text-slate-400">{entry.turn}</td><td className="px-3 py-3 text-slate-400">R{safeText(entry.round)}</td><td className="px-3 py-3 font-semibold text-white print:text-slate-900">{entry.agent}</td><td className="px-3 py-3"><span className={`inline-flex rounded-md border px-2 py-1 font-mono text-[10px] font-bold ${decisionClass(entry.decision)}`}>{entry.decision}</span></td><td className="px-3 py-3 font-mono font-bold text-emerald-400">{entry.offer}</td><td className="px-3 py-3 font-mono text-slate-300 print:text-slate-700">{entry.concession}</td><td className="max-w-[420px] whitespace-normal break-words px-3 py-3 leading-relaxed text-slate-300 print:text-slate-700">{entry.reasoning}</td></tr>)}</tbody></table></div></section>
      </div>
    </main>
  );
}
