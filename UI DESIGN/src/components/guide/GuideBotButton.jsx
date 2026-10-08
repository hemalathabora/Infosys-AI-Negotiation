export default function GuideBotButton({ onClick }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Assistant label */}
      <button
        type="button"
        onClick={onClick}
        className="group flex items-center gap-2 rounded-full border border-[#A8C686]/70 bg-[#344A30]/95 px-4 py-2 shadow-[0_12px_35px_rgba(0,0,0,0.35)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[#C4DEA5] hover:bg-[#405A38]"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#B9D98F] opacity-60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#C4E59D]" />
        </span>

        <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-[#EAF4DD]">
          Ask NegoMind AI
        </span>

        <span className="text-sm text-[#C4E59D] transition-transform duration-300 group-hover:translate-x-0.5">
          ✦
        </span>
      </button>

      {/* Robot button */}
      <button
        type="button"
        onClick={onClick}
        aria-label="Open NegoMind AI assistant"
        className="group relative flex h-16 w-16 items-center justify-center rounded-[22px] border border-[#B6D58F] bg-gradient-to-br from-[#607D4F] via-[#4A683D] to-[#36532F] text-[#F0F6E8] shadow-[0_16px_45px_rgba(0,0,0,0.45),0_0_28px_rgba(182,213,143,0.24)] transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:border-[#D7EBC0] hover:shadow-[0_18px_50px_rgba(0,0,0,0.5),0_0_34px_rgba(196,229,157,0.38)] active:translate-y-0 active:scale-95"
      >
        {/* Outer glow */}
        <span className="absolute inset-0 rounded-[22px] bg-[#B6D58F]/15 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />

        {/* Robot icon */}
        <svg
          aria-hidden="true"
          viewBox="0 0 64 64"
          className="relative h-9 w-9 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:rotate-3"
          fill="none"
        >
          {/* Antenna */}
          <path
            d="M32 14V8"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="3"
          />

          <circle
            cx="32"
            cy="6"
            r="2.5"
            className="fill-[#D1EBAE] stroke-[#D1EBAE]"
          />

          {/* Robot head */}
          <rect
            x="13"
            y="15"
            width="38"
            height="31"
            rx="9"
            className="fill-[#4E6D41] stroke-current"
            strokeWidth="2.5"
          />

          {/* Ear pieces */}
          <path
            d="M13 27H9.5C8.67 27 8 27.67 8 28.5V33.5C8 34.33 8.67 35 9.5 35H13M51 27H54.5C55.33 27 56 27.67 56 28.5V33.5C56 34.33 55.33 35 54.5 35H51"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="2.5"
          />

          {/* Eyes */}
          <circle cx="24" cy="29" r="3" className="fill-[#D1EBAE]" />
          <circle cx="40" cy="29" r="3" className="fill-[#D1EBAE]" />

          {/* Mouth */}
          <path
            d="M24 38C27.5 40.5 36.5 40.5 40 38"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="2.5"
          />

          {/* Chest/body */}
          <path
            d="M22 46V51C22 53.21 23.79 55 26 55H38C40.21 55 42 53.21 42 51V46"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="2.5"
          />

          <circle cx="32" cy="50" r="2" className="fill-[#D1EBAE]" />
        </svg>

        {/* Status indicator */}
        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-[#191A1C] bg-[#D1EBAE]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#4A683D]" />
        </span>
      </button>
    </div>
  );
}