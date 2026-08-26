function CheckRow({ label, checked }) {
  return (
    <li className="flex items-center gap-2.5 text-sm">
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
          checked ? "bg-success/20 text-success" : "border border-border text-textSecondary"
        }`}
        aria-hidden="true"
      >
        {checked ? "✓" : ""}
      </span>
      <span className={checked ? "text-textPrimary" : "text-textSecondary"}>{label}</span>
    </li>
  );
}

export default function ConfigurationStatus({ scenarioSelected, agentChecks, isValid }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
        Configuration Status
      </h3>
      <ul role="status" className="mt-4 flex flex-col gap-3">
        <CheckRow label="Scenario selected" checked={scenarioSelected} />
        {agentChecks.map((checked, i) => (
          <CheckRow key={i} label={`Agent ${i + 1} configured`} checked={checked} />
        ))}
      </ul>
      <div className="mt-4 h-px w-full bg-border" />
      <div className="mt-4 flex items-center gap-2.5">
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
            isValid ? "bg-success/15 text-success" : "bg-warning/15 text-warning"
          }`}
          aria-hidden="true"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M12 2l7 3.5v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9v-5L12 2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            {isValid && <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />}
          </svg>
        </span>
        <p className={`text-sm font-semibold ${isValid ? "text-success" : "text-warning"}`}>
          {isValid ? "Configuration ready" : "Configuration incomplete"}
        </p>
      </div>
    </div>
  );
}
