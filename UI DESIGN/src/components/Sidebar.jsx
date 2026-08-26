const NAV_ITEMS = [
  { label: "Dashboard", icon: "grid" },
  { label: "Scenarios", icon: "folder" },
  { label: "Agents", icon: "users" },
  { label: "Agent Configuration", icon: "usersActive", active: true },
  { label: "Negotiation Arena", icon: "target" },
  { label: "Reports", icon: "file" },
  { label: "Settings", icon: "settings" },
];

function NavIcon({ name }) {
  const common = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (name) {
    case "grid":
      return <svg {...common}><path d="M4 4h7v7H4V4zM4 21a7 7 0 017-7" /><circle cx="17" cy="7" r="4" /><circle cx="17" cy="17" r="4" /></svg>;
    case "folder":
      return <svg {...common}><path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" /></svg>;
    case "users":
    case "usersActive":
      return <svg {...common}><circle cx="9" cy="8" r="3.2" /><path d="M2.5 20a6.5 6.5 0 0113 0" /><circle cx="17.5" cy="9" r="2.6" /><path d="M14.8 20a5 5 0 016.7 0" /></svg>;
    case "target":
      return <svg {...common}><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3.5" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></svg>;
    case "file":
      return <svg {...common}><path d="M6 3h9l5 5v13H6V3z" /><path d="M14 3v5h5" /></svg>;
    case "settings":
      return <svg {...common}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 00.3 1.9l.1.1a2 2 0 11-2.9 2.9l-.1-.1a1.7 1.7 0 00-1.9-.3 1.7 1.7 0 00-1 1.6V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1-1.6 1.7 1.7 0 00-1.9.3l-.1.1a2 2 0 11-2.9-2.9l.1-.1a1.7 1.7 0 00.3-1.9 1.7 1.7 0 00-1.6-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.6-1 1.7 1.7 0 00-.3-1.9l-.1-.1a2 2 0 112.9-2.9l.1.1a1.7 1.7 0 001.9.3H9.1A1.7 1.7 0 0010 3.6V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.6 1.7 1.7 0 001.9-.3l.1-.1a2 2 0 112.9 2.9l-.1.1a1.7 1.7 0 00-.3 1.9V9a1.7 1.7 0 001.6 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.6 1z" /></svg>;
    default:
      return null;
  }
}

function UpgradeCard() {
  return (
    <div className="mt-4 flex flex-col items-center gap-3 rounded-2xl border border-primary/25 bg-gradient-to-b from-primary/10 to-transparent p-5 text-center">
      <div className="glow-icon flex h-12 w-12 items-center justify-center rounded-xl border border-primary/40 bg-primary/10 text-primary" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M12 2l2.4 6.5L21 11l-6.6 2.5L12 20l-2.4-6.5L3 11l6.6-2.5L12 2z" stroke="currentColor" strokeWidth="1.3" fill="currentColor" fillOpacity="0.15" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-semibold text-textPrimary">Upgrade to Pro</p>
        <p className="mt-1 text-xs leading-relaxed text-textSecondary">
          Unlock advanced AI agents and analytics.
        </p>
      </div>
      <button
        type="button"
        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-primary/40 bg-primary/10 py-2.5 text-sm font-semibold text-primaryBright transition-colors hover:bg-primary/20"
      >
        Upgrade Now
        <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}

export default function Sidebar({ isOpen, onClose }) {
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
            <a
              key={item.label}
              href="#"
              aria-current={item.active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-colors ${
                item.active
                  ? "border border-primary/40 bg-primary/10 font-semibold text-primaryBright shadow-glowSm"
                  : "border border-transparent text-textSecondary hover:bg-white/5 hover:text-textPrimary"
              }`}
            >
              <NavIcon name={item.icon} />
              {item.label}
            </a>
          ))}
        </nav>
        <UpgradeCard />
      </aside>
    </>
  );
}
