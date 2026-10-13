export default function GoalSection({ goal }) {
  return (
    <div className="space-y-2">
      <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-textMuted">
        Primary Strategic Goal
      </h4>
      <div className="flex items-center gap-3 rounded-xl border border-[#2D2C36] bg-[#1A191E] p-3.5">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#3A3944] bg-[#25242C] text-white"
          aria-hidden="true"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </span>
        <p className="text-xs sm:text-sm font-semibold leading-relaxed text-white font-sans">{goal}</p>
      </div>
    </div>
  );
}
