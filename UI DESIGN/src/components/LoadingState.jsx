// Designed by TEAM 4
function SkeletonCard() {
  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6" aria-hidden="true">
      <div className="flex items-center gap-3">
        <div className="skeleton h-11 w-11 animate-shimmer rounded-xl" />
        <div className="flex flex-col gap-2">
          <div className="skeleton h-3 w-16 animate-shimmer rounded" />
          <div className="skeleton h-4 w-28 animate-shimmer rounded" />
        </div>
      </div>
      <div className="skeleton h-px w-full" />
      <div className="skeleton h-3 w-20 animate-shimmer rounded" />
      <div className="skeleton h-4 w-full animate-shimmer rounded" />
      <div className="skeleton h-3 w-24 animate-shimmer rounded" />
      <div className="skeleton h-6 w-32 animate-shimmer rounded-full" />
    </div>
  );
}

export default function LoadingState({ message }) {
  return (
    <div>
      <p role="status" className="mb-4 text-sm text-textSecondary">
        {message}
      </p>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}
// Designed by TEAM 4
// Designed by TEAM 4

