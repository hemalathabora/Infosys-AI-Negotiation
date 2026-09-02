// Designed by TEAM 4
export default function AgentHeader({ index }) {
  return (
    <div className="flex items-start justify-between">
      <span className="rounded-md border border-primary/40 bg-primary/10 px-2.5 py-1 text-xs font-bold tracking-wider text-primary">
        AGENT {String(index).padStart(2, "0")}
      </span>
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primaryBright">
        <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
        AI
      </span>
    </div>
  );
}

export function AgentIdentity({ name, role, headingId }) {
  return (
    <div className="mt-4 flex items-center gap-3.5">

      <div
        className="glow-icon flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary"
        aria-hidden="true"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="8.5" r="3.5" stroke="currentColor" strokeWidth="1.7" />
          <path d="M4.5 20a7.5 7.5 0 0115 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      </div>
      <div>
        <h3 id={headingId} className="text-xl font-bold leading-tight text-textPrimary">
          {name}
        </h3>
        <p className="text-sm text-textSecondary">{role}</p>
      </div>
    </div>
  );
}
// Designed by TEAM 4
// Designed by TEAM 4

