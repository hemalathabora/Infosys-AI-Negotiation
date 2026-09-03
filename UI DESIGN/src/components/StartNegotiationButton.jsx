// Designed by TEAM 4

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
        w-full
        flex-col
        gap-3
        rounded-2xl
        border
        border-primary/40
        bg-gradient-to-b
        from-primary/15
        to-transparent
        p-5
        text-left
        shadow-glowSm
        transition-all
        duration-200
        hover:border-primary/60
        hover:bg-primary/5
        hover:shadow-glow
        disabled:cursor-not-allowed
        disabled:opacity-40
        disabled:hover:border-primary/40
        disabled:hover:shadow-glowSm
      "
    >

      {/* =====================================================
          BUTTON HEADER
      ====================================================== */}

      <div className="flex items-center justify-between gap-4">

        <div className="flex items-center gap-2.5">

          {/* Start Icon / Loading Icon */}

          {isStarting ? (

            <span
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-xl
                bg-primary/15
                text-primary
              "
              aria-hidden="true"
            >
              <svg
                className="h-5 w-5 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  opacity="0.25"
                />

                <path
                  d="M21 12a9 9 0 0 0-9-9"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>

          ) : (

            <span
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-xl
                bg-primary/15
                text-primary
                transition-transform
                duration-200
                group-hover:scale-105
              "
              aria-hidden="true"
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M12 2c3 2 5 6 5 10 0 2-1 4-2 5l-1 4-2-3-2 3-1-4c-1-1-2-3-2-5 0-4 2-8 5-10z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />

                <circle
                  cx="12"
                  cy="9"
                  r="1.6"
                  stroke="currentColor"
                  strokeWidth="1.3"
                />
              </svg>
            </span>

          )}


          {/* Button Title */}

          <span className="text-sm font-extrabold tracking-wide text-primary">
            {isStarting
              ? "Starting..."
              : "Start Negotiation"}
          </span>

        </div>


        {/* Status indicator */}

        {!isStarting && (
          <span
            aria-hidden="true"
            className="
              flex
              h-7
              w-7
              items-center
              justify-center
              rounded-lg
              border
              border-primary/20
              bg-primary/10
              text-xs
              font-bold
              text-primary
              transition-all
              duration-200
              group-hover:border-primary/40
              group-hover:bg-primary/15
            "
          >
            GO
          </span>
        )}

      </div>


      {/* =====================================================
          DESCRIPTION
      ====================================================== */}

      <div className="flex items-center gap-2 text-xs text-textSecondary">

        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className="shrink-0 text-textMuted"
        >
          <rect
            x="5"
            y="10"
            width="14"
            height="10"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.6"
          />

          <path
            d="M8 10V7a4 4 0 018 0v3"
            stroke="currentColor"
            strokeWidth="1.6"
          />
        </svg>

        <span>
          Configuration will be sent to Orchestrator
        </span>

      </div>

    </button>
  );
}

// Designed by TEAM 4