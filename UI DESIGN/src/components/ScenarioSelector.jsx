export default function ScenarioSelector({ scenarioList, selectedScenarioId, onChange, disabled }) {
  return (
    <div className="flex-1">
      <label
        htmlFor="scenario-select"
        className="text-xs font-bold uppercase tracking-wider text-primary"
      >
        Negotiation Scenario
      </label>
      <div className="relative mt-2">
        <span
          className="pointer-events-none absolute left-3.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg bg-primary/10 text-primary"
          aria-hidden="true"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M8 12a3 3 0 013-3M16 12a3 3 0 00-3-3M6 15c-1.5 1.5-2 3-2 3s2 1 4-.5M18 15c1.5 1.5 2 3 2 3s-2 1-4-.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            <circle cx="9" cy="9" r="2.4" stroke="currentColor" strokeWidth="1.6" />
            <circle cx="15" cy="9" r="2.4" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        </span>
        <select
          id="scenario-select"
          value={selectedScenarioId}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-xl border border-border bg-cardAlt py-3 pl-12 pr-10 text-sm font-semibold text-textPrimary transition-colors hover:border-primary/50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {scenarioList.map((scenario) => (
            <option key={scenario.id} value={scenario.id}>
              {scenario.name}
            </option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-textSecondary"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}
