export default function EmptyState({
  title = "Select a scenario",
  subtitle = "Choose a negotiation scenario to configure the agents.",
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border px-6 py-16 text-center">
      <span className="text-2xl" aria-hidden="true">🗂</span>
      <p className="font-medium text-textPrimary">{title}</p>
      <p className="text-sm text-textSecondary">{subtitle}</p>
    </div>
  );
}
