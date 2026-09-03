export default function TopNavigation({
  onMenuToggle,
  theme,
  _onThemeChange,
  _activePage,
}) {
  const isDark = theme === "dark";

  return (
    <header
      className={`sticky top-0 z-30 flex h-16 items-center justify-between border-b px-4 backdrop-blur-xl sm:px-6 transition-colors duration-200 ${
        isDark
          ? "border-border/80 bg-header/90"
          : "border-slate-200 bg-white/90"
      }`}
    >
      {/* Left side - Logo and Project Name */}
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          type="button"
          onClick={onMenuToggle}
          className={`rounded-lg border p-2 transition-colors lg:hidden ${
            isDark
              ? "border-border text-textSecondary hover:border-primary hover:text-textPrimary"
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
            className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 text-xs font-bold text-white shadow-glowSm`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <p
                className={`text-base font-extrabold tracking-tight font-sans ${
                  isDark ? "text-textPrimary" : "text-slate-900"
                }`}
              >
                NEGOTIATION <span className="text-primary font-black">AI</span>
              </p>
            </div>

            <p
              className={`text-[10px] font-semibold tracking-[0.18em] uppercase ${
                isDark ? "text-textMuted" : "text-slate-500"
              }`}
            >
              Enterprise Multi-Agent Platform
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Status & Badges */}
      <div className="flex items-center gap-2.5 sm:gap-3">

        {/* Team Badge */}
        <div
          className={`inline-flex items-center rounded-md border px-2.5 py-1 text-[10px] font-mono font-semibold tracking-wider uppercase ${
            isDark
              ? "border-primary/30 bg-primary/10 text-primaryBright"
              : "border-indigo-200 bg-indigo-50 text-indigo-700"
          }`}
        >
          TEAM 4
        </div>
      </div>
    </header>
  );
}
