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
    <div className="space-y-2.5">
      <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-textMuted">
        Negotiation Constraints
      </h4>
      <ul className="flex flex-col gap-2.5">
        {constraints.map((constraint, index) => {
          const { label, value, defaultValue } = parseConstraint(constraint);
          const currentValue = value ?? defaultValue ?? 0;

          return (
            <li
              key={`${label}-${index}`}
              className="flex items-center gap-3 rounded-xl border border-border bg-cardAlt px-3.5 py-2.5 transition-colors focus-within:border-primary"
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-textPrimary font-mono font-bold text-xs"
                aria-hidden="true"
              >
                ${index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium tracking-wide text-textSecondary font-sans truncate">
                  {label}
                </p>
                <input
                  type="number"
                  min="0"
                  value={currentValue}
                  onChange={(event) => onChange?.(index, event.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-1.5 font-mono text-sm font-bold text-textPrimary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
