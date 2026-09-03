// Designed by TEAM 4

export default function TopNavigation({
  onMenuToggle,
  theme,
  _onThemeChange,
  _activePage,
}) {
  const isDark = theme === "dark";

  return (
    <header
      className={`sticky top-0 z-30 flex h-20 items-center justify-between border-b px-4 backdrop-blur sm:px-6 ${
        isDark
          ? "border-border bg-header/95"
          : "border-slate-200 bg-slate-50/95"
      }`}
    >
      {/* Left side - Logo and Project Name */}
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          type="button"
          onClick={onMenuToggle}
          className={`rounded-lg border p-2 lg:hidden ${
            isDark
              ? "border-border text-textSecondary hover:border-primary hover:text-primary"
              : "border-slate-300 text-slate-600 hover:text-slate-900"
          }`}
          aria-label="Toggle navigation menu"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M3 6h18M3 12h18M3 18h18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* Logo + Project Name */}
        <div className="flex items-center gap-3">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl border text-sm font-extrabold ${
              isDark
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-sky-300 bg-sky-100 text-sky-700"
            }`}
          >
            AI
          </div>

          <div>
            <p
              className={`text-lg font-bold leading-tight tracking-tight ${
                isDark ? "text-textPrimary" : "text-slate-900"
              }`}
            >
              NEGOTIATION AI
            </p>

            <p
              className={`text-[10px] font-semibold tracking-[0.15em] ${
                isDark ? "text-primary" : "text-sky-700"
              }`}
            >
              Multi-Agent Training Platform
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Status */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Live Status */}
        <div
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold ${
            isDark
              ? "border-border bg-card text-textPrimary"
              : "border-slate-300 bg-white text-slate-700"
          }`}
        >
          <span className="breathing-dot" aria-hidden="true" />

          <span
            className={isDark ? "text-primary" : "text-sky-700"}
          >
            Live
          </span>
        </div>

        {/* Team */}
        <div
          className={`inline-flex items-center rounded-full border px-2.5 py-1.5 text-[10px] font-bold tracking-[0.18em] uppercase ${
            isDark
              ? "border-primary/30 bg-primary/10 text-primary"
              : "border-sky-300 bg-sky-50 text-sky-700"
          }`}
        >
          TEAM 4
        </div>
      </div>
    </header>
  );
}