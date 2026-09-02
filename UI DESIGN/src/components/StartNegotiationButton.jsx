// Designed by TEAM 4
export default function StartNegotiationButton({ disabled, isStarting, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isStarting}
      className="group flex w-full flex-col gap-2 rounded-2xl border border-primary/40 bg-gradient-to-b from-primary/15 to-transparent p-5 text-left shadow-glowSm transition-all hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:shadow-glowSm"
    >
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2.5 text-sm font-extrabold tracking-wide text-primaryBright">
          {isStarting ? (
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
              <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          ) : (
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary"
              aria-hidden="true"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 2c3 2 5 6 5 10 0 2-1 4-2 5l-1 4-2-3-2 3-1-4c-1-1-2-3-2-5 0-4 2-8 5-10z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                <circle cx="12" cy="9" r="1.6" stroke="currentColor" strokeWidth="1.3" />
              </svg>
            </span>
          )}
          {isStarting ? "Startingâ€¦" : "Start Negotiation"}
        </span>
        {!isStarting && (
          <span aria-hidden="true" className="text-primaryBright transition-transform group-hover:translate-x-0.5">
            â†’
          </span>
        )}
      </div>
      <p className="flex items-center gap-1.5 text-xs text-textSecondary">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.6" />
          <path d="M8 10V7a4 4 0 018 0v3" stroke="currentColor" strokeWidth="1.6" />
        </svg>
        Configuration will be sent to Orchestrator
      </p>
    </button>
  );
}
// Designed by TEAM 4
// Designed by TEAM 4

