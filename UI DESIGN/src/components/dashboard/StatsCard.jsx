function cardIconMap(icon) {
  const common = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round" };

  switch (icon) {
    case "activity":
      return (
        <svg {...common}>
          <path d="M3 12h4l2.5-6 4 12 2.5-6H21" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <path d="M20 6 9 17l-5-5" />
        </svg>
      );
    case "repeat":
      return (
        <svg {...common}>
          <path d="M3 12a9 9 0 0 1 15.3-6.3L21 7v-4H17l2.8 2.8A10.9 10.9 0 0 0 2 12" />
          <path d="M21 12a9 9 0 0 1-15.3 6.3L3 17v4h4l-2.8-2.8A10.9 10.9 0 0 0 22 12" />
        </svg>
      );
    case "trend":
      return (
        <svg {...common}>
          <path d="M4 16l6-6 4 4 7-9" />
          <path d="M16 5h5v5" />
        </svg>
      );
    default:
      return null;
  }
}

export default function StatsCard({ title, value, description, icon, trend }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-200">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-textMuted">{title}</p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          {cardIconMap(icon)}
        </span>
      </div>
      <div className="mt-5">
        <p className="text-3xl font-black tracking-tight text-textPrimary">{value}</p>
        <p className="mt-2 text-sm text-textSecondary">{description}</p>
      </div>
      {trend && (
        <div className="mt-4 inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
          {trend}
        </div>
      )}
    </div>
  );
}
