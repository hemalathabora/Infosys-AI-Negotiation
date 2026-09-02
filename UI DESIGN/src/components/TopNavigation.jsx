// Designed by TEAM 4
export default function TopNavigation({ onMenuToggle, theme, onThemeChange, activePage }) {
  const isDark = theme === "dark";
  const navItems = ["Dashboard", "Configure Agents", "Negotiation Arena", "Analytics", "Reports"];

  return (
    <header
      className={`sticky top-0 z-30 flex h-20 items-center justify-between border-b px-4 backdrop-blur sm:px-6 ${
        isDark ? "border-border bg-[#04070D]/90" : "border-slate-200 bg-[#f8fbff]/90"
      }`}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuToggle}
          className={`rounded-lg border p-2 lg:hidden ${
            isDark ? "border-border text-textSecondary hover:text-textPrimary" : "border-slate-300 text-slate-600 hover:text-slate-900"
          }`}
          aria-label="Toggle navigation menu"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <div className="flex items-center gap-3">
          <div
            className={`glow-icon flex h-11 w-11 items-center justify-center rounded-xl border text-sm font-extrabold ${
              isDark
                ? "border-primary/40 bg-gradient-to-br from-primary/25 to-transparent text-primaryBright"
                : "border-sky-300 bg-gradient-to-br from-sky-200 to-transparent text-sky-700"
            }`}
            aria-hidden="true"
          >
            AI
          </div>
          <div>
            <p className={`text-lg font-bold leading-tight tracking-tight ${isDark ? "text-textPrimary" : "text-slate-900"}`}>
              NEGOTIATION AI
            </p>
            <p className={`text-[10px] font-semibold tracking-[0.15em] ${isDark ? "text-primary/80" : "text-sky-700"}`}>
              Multi-Agent Training Platform
            </p>
          </div>
        </div>
      </div>

      <nav className="hidden items-center gap-6 lg:flex">
        {navItems.map((item) => (
          <button
            key={item}
            type="button"
            className={`text-sm font-semibold transition-colors ${
              activePage === item
                ? "text-[#c4ff3a]"
                : isDark ? "text-textSecondary hover:text-textPrimary" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {item}
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-[#0d1d2e] px-3 py-2 text-xs font-semibold text-[#dfeaf5]">
          <span className="breathing-dot" aria-hidden="true" />
          <span className={isDark ? "text-[#c4ff3a]" : "text-sky-700"}>Live</span>
        </div>

        <div className="inline-flex items-center rounded-full border border-[#c4ff3a]/30 bg-[#c4ff3a]/10 px-2.5 py-1.5 text-[10px] font-bold tracking-[0.18em] text-[#c4ff3a] uppercase shadow-[0_0_18px_rgba(196,255,58,0.15)]">
          TEAM 4
        </div>
      </div>
    </header>
  );
}
// Designed by TEAM 4
// Designed by TEAM 4

