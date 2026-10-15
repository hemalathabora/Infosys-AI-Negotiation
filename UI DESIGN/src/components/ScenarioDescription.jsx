export default function ScenarioDescription({ description }) {
  return (
    <div className="flex-1 space-y-1">
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs font-bold uppercase tracking-wider text-textSecondary">
          SCENARIO CONTEXT & OBJECTIVE
        </span>
      </div>
      <p className="text-xs sm:text-sm font-medium leading-relaxed text-textSecondary font-body">
        {description}
      </p>
    </div>
  );
}
