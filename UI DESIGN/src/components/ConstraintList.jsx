function parseConstraint(constraint) {
  const match = constraint.match(/^(.*?)\s*(\$[\d,]+(?:\.\d+)?)$/);
  if (!match) {
    return { label: constraint.toUpperCase(), value: null };
  }
  const [, qualifier, value] = match;
  const hasPriceWord = /price|budget|amount/i.test(qualifier);
  const label = `${qualifier.trim()}${hasPriceWord ? "" : " Price"}`.toUpperCase();
  return { label, value };
}

export default function ConstraintList({ constraints }) {
  return (
    <div>
      <h4 className="text-xs font-bold uppercase tracking-wider text-primary">Constraints</h4>
      <ul className="mt-2 flex flex-col gap-2">
        {constraints.map((constraint) => {
          const { label, value } = parseConstraint(constraint);
          return (
            <li
              key={constraint}
              className="flex items-center gap-3 rounded-xl border border-border bg-cardAlt px-3.5 py-2.5"
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
                aria-hidden="true"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </span>
              <div>
                <p className="text-[11px] font-semibold tracking-wide text-textSecondary">
                  {label}
                </p>
                {value && (
                  <p className="text-sm font-bold text-textPrimary">{value}</p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
