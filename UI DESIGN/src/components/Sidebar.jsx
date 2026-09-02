// Designed by TEAM 4
const NAV_ITEMS = [
  { label: "Dashboard", icon: "grid" },
  { label: "Configure Agents", icon: "usersActive" },
  { label: "Negotiation Arena", icon: "target" },
  { label: "Analytics", icon: "file" },
  { label: "Reports", icon: "barChart" },
];

function NavIcon({ name }) {
  const common = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (name) {
    case "grid":
      return <svg {...common}><path d="M4 4h7v7H4V4zM4 21a7 7 0 017-7" /><circle cx="17" cy="7" r="4" /><circle cx="17" cy="17" r="4" /></svg>;
    case "usersActive":
      return <svg {...common}><circle cx="9" cy="8" r="3.2" /><path d="M2.5 20a6.5 6.5 0 0113 0" /><circle cx="17.5" cy="9" r="2.6" /><path d="M14.8 20a5 5 0 016.7 0" /></svg>;
    case "target":
      return <svg {...common}><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3.5" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></svg>;
    case "file":
      return <svg {...common}><path d="M6 3h9l5 5v13H6V3z" /><path d="M14 3v5h5" /></svg>;
    case "barChart":
      return <svg {...common}><path d="M4 20V8M10 20V4M16 20v-7M22 20V11" /></svg>;
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
          className="fixed inset-0 z-30 bg-black/70 lg:hidden"
        />
      )}
      <aside
        className={`fixed z-40 flex h-full w-72 shrink-0 flex-col border-r border-border bg-bg p-4 transition-transform lg:sticky lg:top-20 lg:z-0 lg:h-[calc(100vh-5rem)] lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav aria-label="Primary" className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => onNavigate(item.label)}
              aria-current={activePage === item.label ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm transition-colors ${
                activePage === item.label
                  ? "border border-primary/40 bg-primary/10 font-semibold text-primaryBright shadow-glowSm"
                  : "border border-transparent text-textSecondary hover:bg-white/5 hover:text-textPrimary"
              }`}
            >
              <NavIcon name={item.icon} />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
}
// Designed by TEAM 4
// Designed by TEAM 4

