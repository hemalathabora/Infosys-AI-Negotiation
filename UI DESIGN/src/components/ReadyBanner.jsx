// Designed by TEAM 4
export default function ReadyBanner({ isValid, agentCount }) {
  return (
    <div className="relative flex items-center gap-4 overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-r from-primary/10 via-card to-card px-5 py-4">
      <span
        className="glow-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/40 bg-primary/10 text-primary"
        aria-hidden="true"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 2l7 3.5v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9v-5L12 2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          {isValid && <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />}
        </svg>
      </span>
      <div className="relative z-10">
        <p className="font-semibold text-primaryBright">
          {isValid
            ? "Both agents are configured and ready."
            : `${agentCount} of 2 agents configured.`}
        </p>
        <p className="text-sm text-textSecondary">
          You can review or modify their personalities before starting the negotiation.
        </p>
      </div>

      <svg
        className="pointer-events-none absolute -right-4 bottom-0 top-0 hidden w-64 opacity-40 sm:block"
        viewBox="0 0 260 100"
        fill="none"
        aria-hidden="true"
      >
        <g stroke="#38BDF8" strokeWidth="1">
          <path d="M10 70L60 40L110 60L160 20L210 55L250 30" opacity="0.5" />
          <path d="M20 30L70 60L130 25L180 65L230 45" opacity="0.35" />
        </g>
        <g fill="#38BDF8">
          <circle cx="10" cy="70" r="2.5" />
          <circle cx="60" cy="40" r="2.5" />
          <circle cx="110" cy="60" r="2.5" />
          <circle cx="160" cy="20" r="2.5" />
          <circle cx="210" cy="55" r="2.5" />
          <circle cx="250" cy="30" r="2.5" />
          <circle cx="70" cy="60" r="2" opacity="0.6" />
          <circle cx="130" cy="25" r="2" opacity="0.6" />
          <circle cx="180" cy="65" r="2" opacity="0.6" />
        </g>
      </svg>
    </div>
  );
}
// Designed by TEAM 4
// Designed by TEAM 4

