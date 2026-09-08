const OPTIONS = ["Aggressive", "Collaborative", "Risk-averse"];

export default function PersonalityBadge({ personality, onChange }) {
  return (
    <div className="space-y-2">
      <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-textMuted">
        Persona Mode & Behavioral Policy
      </h4>
      <div className="flex items-center gap-2.5">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#3A3944] bg-[#25242C] text-white"
          aria-hidden="true"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </span>
        <div className="relative flex-1">
          <select
            aria-label="Personality"
            value={personality}
            onChange={(e) => onChange?.(e.target.value)}
            className="w-full appearance-none rounded-xl border border-[#3A3944] bg-[#1A191E] py-2 pl-3.5 pr-9 text-sm font-semibold text-white transition-colors hover:border-slate-400 focus:border-white focus:outline-none"
          >
            {OPTIONS.map((opt) => (
              <option key={opt} value={opt} className="bg-[#1A191E] text-white">
                {opt}
              </option>
            ))}
          </select>
          <svg
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}
