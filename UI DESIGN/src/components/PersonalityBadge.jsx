// Designed by TEAM 4
const OPTIONS = ["Aggressive", "Collaborative", "Risk-averse"];

/**
 * Renders the agent's personality as a select control. Selecting a
 * different value updates local card state only â€” the scenario's
 * source-of-truth persona data lives in data/scenarios.js.
 */
export default function PersonalityBadge({ personality, onChange }) {
  return (
    <div>
      <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
        Personality
      </h4>
      <div className="mt-2 flex items-center gap-2.5">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
          aria-hidden="true"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 3l7 3.5v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9v-5L12 3z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <div className="relative flex-1">
          <select
            aria-label="Personality"
            value={personality}
            onChange={(e) => onChange?.(e.target.value)}
            className="w-full appearance-none rounded-lg border border-border bg-cardAlt py-2 pl-3 pr-9 text-sm font-semibold text-textPrimary transition-colors hover:border-primary/50"
          >
            {OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <svg
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-textSecondary"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M6 9l6 6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
      <p className="sr-only">Current personality: {personality}</p>
    </div>
  );
}
// Designed by TEAM 4
// Designed by TEAM 4
