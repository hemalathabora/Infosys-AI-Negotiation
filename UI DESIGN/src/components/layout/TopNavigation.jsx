export default function TopNavigation({
  onMenuToggle,
  theme,
  _onThemeChange,
  _activePage,
  onReplayIntro,
}) {
  const isDark = theme === "dark";

  return (
    <header
      className={`sticky top-0 z-30 flex h-16 items-center justify-between border-b px-4 sm:px-6 transition-colors duration-200 ${
        isDark
          ? "border-[#1F1E26] bg-[#0C0C0F]"
          : "border-slate-200 bg-white"
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
              ? "border-[#302F39] text-[#9494A0] hover:border-white hover:text-white"
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
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-950 shadow-md font-bold"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <p
                className={`text-base font-black tracking-tight font-sans ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                NEGOTIATION <span className="text-slate-200 font-black">AI</span>
              </p>

            </div>

            <p
              className={`text-[10px] font-semibold tracking-[0.16em] uppercase ${
                isDark ? "text-[#71707E]" : "text-slate-500"
              }`}
            >
              Enterprise Multi-Agent Platform
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Actions & Badges */}
      <div className="flex items-center gap-2.5 sm:gap-3">

        {/* Team Badge */}
        <div
          className={`inline-flex items-center rounded-xl border px-3 py-1.5 text-xs font-mono font-bold tracking-wider uppercase ${
            isDark
              ? "border-[#3A3944] bg-[#222129] text-slate-200"
              : "border-slate-300 bg-slate-100 text-slate-800"
          }`}
        >
          TEAM 4
        </div>
      </div>
    </header>
  );
}
