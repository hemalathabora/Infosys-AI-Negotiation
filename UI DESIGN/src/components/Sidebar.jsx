const NAV_ITEMS = [
  { label: "Dashboard", icon: "grid", desc: "Overview & metrics" },
  { label: "Configure Agents", icon: "usersActive", desc: "Agent strategies & rules" },
  { label: "Negotiation Arena", icon: "target", desc: "Live simulation feed" },
  { label: "Analytics", icon: "barChart", desc: "Performance insights" },
  { label: "Reports", icon: "file", desc: "Audit logs & summaries" },
];

function NavIcon({ name, active }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: active ? "#818CF8" : "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
  switch (name) {
    case "grid":
      return <svg {...common}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /></svg>;
    case "usersActive":
      return <svg {...common}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
    case "target":
      return <svg {...common}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>;
    case "file":
      return <svg {...common}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>;
    case "barChart":
      return <svg {...common}><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>;
    default:
      return null;
  }
}

export default function Sidebar({ isOpen, onClose, activePage, onNavigate }) {
  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close menu overlay"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}
      <aside
        className={`fixed z-40 flex h-full w-64 shrink-0 flex-col border-r border-border/80 bg-sidebar/95 p-3.5 transition-transform duration-200 lg:sticky lg:top-16 lg:z-0 lg:h-[calc(100vh-4rem)] lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-3 px-3 pt-2">
          <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-textMuted">
            Main Menu
          </p>
        </div>

        <nav aria-label="Primary" className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = activePage === item.label;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  onNavigate(item.label);
                  if (isOpen) onClose();
                }}
                aria-current={active ? "page" : undefined}
                className={`group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm transition-all duration-150 ${
                  active
                    ? "bg-gradient-to-r from-indigo-500/15 via-indigo-500/5 to-transparent text-textPrimary font-semibold border-l-2 border-indigo-500 shadow-glowSm"
                    : "text-textSecondary hover:bg-white/[0.04] hover:text-textPrimary border-l-2 border-transparent"
                }`}
              >
                <div className={`transition-transform group-hover:scale-110 ${active ? "text-primaryBright" : "text-textMuted group-hover:text-textSecondary"}`}>
                  <NavIcon name={item.icon} active={active} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="truncate font-sans font-medium text-xs sm:text-sm">
                    {item.label}
                  </span>
                </div>
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}


