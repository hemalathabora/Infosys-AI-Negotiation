export default function StartNegotiationButton({
  disabled,
  isStarting,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isStarting}
      className="
        group
        flex
        h-full
        w-full
        items-center
        justify-between
        rounded-2xl
        border
        border-slate-200
        bg-slate-100
        hover:bg-white
        p-6
        text-slate-950
        shadow-xl
        transition-all
        duration-200
        hover:scale-[1.005]
        active:scale-[0.995]
        disabled:cursor-not-allowed
        disabled:opacity-40
        disabled:hover:bg-slate-100
        disabled:hover:scale-100
      "
    >
      <div className="flex items-center gap-3.5">
        <span
          className="
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-xl
            bg-slate-950
            text-white
            shadow-md
          "
          aria-hidden="true"
        >
          {isStarting ? (
            <svg className="h-5 w-5 animate-spin text-white" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
              <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          )}
        </span>

        <div className="text-left">
          <p className="text-base font-black tracking-tight text-slate-950 font-sans">
            {isStarting ? "Initializing Engine..." : "Launch Negotiation Simulation"}
          </p>
          <p className="text-xs font-medium text-slate-600 font-body">
            Transmits agent parameters to orchestrator.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="rounded-xl bg-slate-950 px-4 py-2.5 font-mono text-xs font-bold text-white shadow-sm">
          START SIMULATION →
        </span>
      </div>
    </button>
  );
}