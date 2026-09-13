// Designed by TEAM 4
export default function ErrorState({ onRetry }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-2xl border border-warning/30 bg-warning/5 px-6 py-12 text-center"
    >
      <span className="text-2xl" aria-hidden="true">âš </span>
      <p className="font-medium text-textPrimary">
        Unable to load agent configuration.
      </p>
      <p className="text-sm text-textSecondary">Please try again.</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-textPrimary transition-colors hover:border-primary/60 hover:text-primary"
      >
        Retry
      </button>
    </div>
  );
}
// Designed by TEAM 4
// Designed by TEAM 4

