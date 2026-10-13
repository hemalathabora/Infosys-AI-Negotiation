// Designed by TEAM 4

export default function ActivityTimeline({ items }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6">

      {/* Header */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
          Live Feed
        </p>

        <h3 className="mt-1 text-xl font-bold tracking-tight text-textPrimary">
          System Activity
        </h3>

        <p className="mt-1 text-sm text-textSecondary">
          Recent changes across the negotiation system.
        </p>
      </div>

      {/* Timeline */}
      <div className="relative mt-6">

        {/* Vertical line */}
        <div className="absolute left-[5px] top-2 h-[calc(100%-12px)] w-px bg-border" />

        <div className="space-y-6">

          {items.map((item, index) => (
            <div
              key={`${item.title}-${item.time}-${index}`}
              className="relative flex gap-4"
            >

              {/* Timeline dot */}
              <div className="relative z-10 mt-1.5 flex h-3 w-3 shrink-0 items-center justify-center rounded-full border border-primary bg-bg">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              </div>

              {/* Activity */}
              <div className="min-w-0 flex-1">

                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold leading-5 text-textPrimary">
                    {item.title}
                  </p>

                  <span className="shrink-0 text-[10px] text-textMuted">
                    {item.time}
                  </span>
                </div>

                <p className="mt-1 text-xs leading-5 text-textSecondary">
                  {item.detail}
                </p>

                {item.subDetail && (
                  <div className="mt-2 rounded-lg border border-border bg-cardAlt px-3 py-2">
                    <p className="text-[11px] text-textSecondary">
                      {item.subDetail}
                    </p>
                  </div>
                )}

              </div>

            </div>
          ))}

        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 border-t border-border pt-4">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(77,208,255,0.7)]" />
          System monitoring active
        </div>
      </div>

    </section>
  );
}