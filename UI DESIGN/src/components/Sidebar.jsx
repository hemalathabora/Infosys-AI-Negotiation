const NAV_ITEMS = [
  { label: "Dashboard", icon: "grid", desc: "Overview & live metrics" },
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
    stroke: active ? "#FFFFFF" : "currentColor",
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

export default function Sidebar({
  isOpen,
  onClose,
  activePage,
  onNavigate,
  stats = { totalSimulations: 0, agreementRate: 0, deadlocksCount: 0, avgRounds: "0.0" },
  onClearHistory,
  onReplayIntro
}) {
  return (
    <>
      {/* Pop-Out Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/75 backdrop-blur-md transition-opacity duration-300 animate-fadeIn"
          aria-hidden="true"
        />
      )}

      {/* Pop-Out Dashboard Drawer (Slides out when 3 lines menu is clicked) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-80 sm:w-96 flex-col border-r border-[#2B2A36] bg-[#121117]/95 p-5 backdrop-blur-xl shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Pop-Out Drawer Header */}
        <div className="flex items-center justify-between border-b border-[#292834] pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white font-sans tracking-tight">
                Dashboard & Telemetry
              </h2>
              <p className="text-[10px] font-mono text-slate-400">
                Pop-Out Quick Control Hub
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close pop-out drawer"
            className="rounded-xl border border-[#302F3B] bg-[#1C1B24] p-2 text-slate-400 hover:border-slate-200 hover:text-white transition"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-1">

          {/* Section 1: Main Navigation Links */}
          <div className="space-y-2">
            <p className="px-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Main Navigation
            </p>
            <nav aria-label="Primary Navigation" className="flex flex-col gap-1.5">
              {NAV_ITEMS.map((item) => {
                const active = activePage === item.label;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      onNavigate(item.label);
                      onClose();
                    }}
                    className={`group relative flex items-center justify-between rounded-xl px-4 py-3 text-left text-sm transition-all duration-150 ${
                      active
                        ? "bg-[#252431] text-white font-bold border-l-4 border-emerald-400 shadow-md"
                        : "text-slate-300 hover:bg-[#1A1922] hover:text-white border-l-4 border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`transition-transform group-hover:scale-110 ${active ? "text-emerald-400" : "text-slate-400"}`}>
                        <NavIcon name={item.icon} active={active} />
                      </div>
                      <div>
                        <p className="font-sans font-semibold text-xs sm:text-sm">{item.label}</p>
                        <p className="text-[10px] text-slate-400 font-normal">{item.desc}</p>
                      </div>
                    </div>
                    {active && (
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Section 2: Pop-Out Dashboard Stat Cards */}
          <div className="space-y-3 pt-2 border-t border-[#292834]">
            <p className="px-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Dashboard Live Metrics
            </p>

            <div className="grid grid-cols-2 gap-2.5 font-mono text-xs">
              <div className="rounded-xl border border-[#2D2C3A] bg-[#1A1922] p-3 space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Simulations</p>
                <p className="text-lg font-extrabold text-white">{stats.totalSimulations}</p>
              </div>

              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 space-y-1">
                <p className="text-[10px] text-emerald-400 font-bold uppercase">Agreement %</p>
                <p className="text-lg font-extrabold text-emerald-300">{stats.agreementRate}%</p>
              </div>

              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 space-y-1">
                <p className="text-[10px] text-amber-400 font-bold uppercase">Deadlocks</p>
                <p className="text-lg font-extrabold text-amber-300">{stats.deadlocksCount}</p>
              </div>

              <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-3 space-y-1">
                <p className="text-[10px] text-blue-400 font-bold uppercase">Avg Turns</p>
                <p className="text-lg font-extrabold text-blue-300">{stats.avgRounds} rds</p>
              </div>
            </div>
          </div>

          {/* Section 3: Quick Action Buttons */}
          <div className="space-y-2 pt-2 border-t border-[#292834]">
            <p className="px-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Quick Actions
            </p>

            <button
              type="button"
              onClick={() => {
                onNavigate("Configure Agents");
                onClose();
              }}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 hover:bg-white text-slate-950 px-4 py-2.5 text-xs font-bold shadow-md transition font-sans"
            >
              <span className="text-base font-bold">+</span>
              Configure New Session
            </button>

            {onClearHistory && (
              <button
                type="button"
                onClick={() => {
                  onClearHistory();
                  onClose();
                }}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[#522026] bg-[#35161B] px-4 py-2 text-xs font-medium text-[#F87171] hover:bg-[#451B21] transition font-sans"
              >
                Reset Engine History
              </button>
            )}

            {onReplayIntro && (
              <button
                type="button"
                onClick={() => {
                  onReplayIntro();
                  onClose();
                }}
                className="w-full text-center font-mono text-[11px] text-slate-400 hover:text-white transition py-1"
              >
                Replay Intro Animation
              </button>
            )}
          </div>

        </div>
      </aside>
    </>
  );
}
