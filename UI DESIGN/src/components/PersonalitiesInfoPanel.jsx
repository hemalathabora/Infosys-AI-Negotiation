const PERSONALITIES = [
  {
    label: "Aggressive",
    description: "Pushes hard for own benefit",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
        <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" fill="currentColor" fillOpacity="0.2" />
      </svg>
    ),
  },
  {
    label: "Collaborative",
    description: "Seeks mutual benefit",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
        <circle cx="8" cy="9" r="2.6" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="16" cy="9" r="2.6" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3 19a5 5 0 0110 0M11 19a5 5 0 0110 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Risk-averse",
    description: "Prioritizes safe outcomes",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
        <path d="M12 2l7 3.5v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9v-5L12 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function PersonalitiesInfoPanel() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
        About Personalities
      </h3>
      <ul className="mt-4 flex flex-col gap-4">
        {PERSONALITIES.map((p) => (
          <li key={p.label} className="flex items-start gap-3">
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
              aria-hidden="true"
            >
              {p.icon}
            </span>
            <div>
              <p className="text-sm font-semibold text-textPrimary">{p.label}</p>
              <p className="text-xs text-textSecondary">{p.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
