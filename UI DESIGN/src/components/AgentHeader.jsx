export default function AgentHeader({ index }) {
  return (
    <div className="flex items-center justify-between">
      <span className="rounded-xl border border-[#302F39] bg-[#25242C] px-3.5 py-1.5 font-mono text-xs font-bold text-white tracking-wider">
        PARTY {String(index).padStart(2, "0")}
      </span>
      <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-slate-300">
        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
        AI BOT
      </span>
    </div>
  );
}

export function AgentIdentity({ name, role, headingId }) {
  return (
    <div className="flex items-center gap-3.5 pt-1">
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#302F39] bg-[#25242C] text-white shadow-sm"
        aria-hidden="true"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </div>
      <div>
        <h3 id={headingId} className="text-lg font-bold leading-tight text-white font-sans">
          {name}
        </h3>
        <p className="text-xs text-textSecondary font-body">{role}</p>
      </div>
    </div>
  );
}
