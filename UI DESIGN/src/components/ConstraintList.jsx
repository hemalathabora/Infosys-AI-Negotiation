function parseConstraint(constraint) {
  if (typeof constraint === "object" && constraint) {
    const text = constraint.text ?? constraint.label ?? "";
    const rawValue = constraint.defaultValue ?? constraint.value ?? null;
    const numericValue =
      rawValue == null ? null : String(rawValue).replace(/[$,]/g, "");
    const normalizedValue =
      numericValue != null && Number.isFinite(Number(numericValue))
        ? numericValue
        : null;

    return {
      label: text,
      value: normalizedValue,
      defaultValue: normalizedValue,
    };
  }

  const raw = String(constraint ?? "");
  const match = raw.match(/^(.*?)\s*(?:\$)?([\d,]+(?:\.\d+)?)\s*(.*)$/);
  if (!match) {
    return { label: raw.toUpperCase(), value: null, defaultValue: null };
  }

  const [, qualifier, value, suffix] = match;
  const numericValue = value.replace(/,/g, "");
  const label = suffix
    ? `${qualifier.trim()} ${suffix.trim()}`
    : `${qualifier.trim()} Price`;

  return { label, value: numericValue, defaultValue: numericValue };
}

export default function ConstraintList({ constraints, onChange }) {
  return (
    <div>
      <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
        Constraints
      </h4>
      <ul className="mt-2 flex flex-col gap-2">
        {constraints.map((constraint, index) => {
          const { label, value, defaultValue } = parseConstraint(constraint);
          const currentValue = value ?? defaultValue ?? 0;

          return (
            <li
              key={`${label}-${index}`}
              className="flex items-center gap-3 rounded-xl border border-border bg-cardAlt px-3.5 py-2.5"
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
                aria-hidden="true"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 8v8M8 12h8"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              </span>
              <div className="flex-1">
                <p className="text-[11px] font-semibold tracking-wide text-textSecondary">
                  {label}
                </p>
                <input
                  type="number"
                  min="0"
                  value={currentValue}
                  onChange={(event) => onChange?.(index, event.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-card px-2.5 py-1.5 text-sm font-bold text-textPrimary outline-none transition-colors focus:border-primary"
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
