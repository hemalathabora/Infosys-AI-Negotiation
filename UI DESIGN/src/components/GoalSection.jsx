// Designed by TEAM 4
export default function GoalSection({ goal }) {
  return (
    <div>
      <h4 className="text-xs font-bold uppercase tracking-wider text-primary">Goal</h4>
      <div className="mt-2 flex items-center gap-2.5">
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary"
          aria-hidden="true"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" />
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        </span>
        <p className="text-sm font-medium leading-relaxed text-textPrimary">{goal}</p>
      </div>
    </div>
  );
}
// Designed by TEAM 4
// Designed by TEAM 4

