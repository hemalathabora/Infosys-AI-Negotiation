export default function ScenarioDescription({ description }) {
  return (
    <div className="flex flex-1 items-center gap-3.5 rounded-xl border border-border bg-cardAlt px-4 py-3">
      <span
        className="glow-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/40 bg-primary/10 text-primary"
        aria-hidden="true"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M6 3h9l5 5v13H6V3z" stroke="currentColor" strokeWidth="1.6" />
          <path d="M9 12h6M9 16h6M9 8h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </span>
      <p className="text-sm leading-relaxed text-textSecondary">{description}</p>
    </div>
  );
}
