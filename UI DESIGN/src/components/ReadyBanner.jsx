export default function ReadyBanner({ isValid, agentCount }) {
  return (
    <div className="h-full flex items-center justify-between gap-4 overflow-hidden rounded-2xl border border-[#302F39] bg-[#222129] p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
            isValid
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
              : "border-amber-500/40 bg-amber-500/10 text-amber-400"
          }`}
          aria-hidden="true"
        >
          {isValid ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          )}
        </span>
        <div>
          <p className="font-bold text-white font-sans text-sm sm:text-base">
            {isValid
              ? "Both AI Agent Personas Ready for Launch"
              : `${agentCount} of 2 Agent Personas Configured`}
          </p>
          <p className="text-xs text-textSecondary font-body mt-0.5">
            {isValid
              ? "All constraints validated. Ready to send parameters to orchestrator."
              : "Complete the constraint parameters for both Party A and Party B."}
          </p>
        </div>
      </div>

      <div className="hidden sm:block">
        <span className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 font-mono text-xs font-bold ${
          isValid
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
            : "border-amber-500/30 bg-amber-500/10 text-amber-400"
        }`}>
          {isValid ? "STATUS: READY" : "STATUS: PENDING"}
        </span>
      </div>
    </div>
  );
}
