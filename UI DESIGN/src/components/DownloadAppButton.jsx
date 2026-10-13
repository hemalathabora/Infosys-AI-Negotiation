import React from "react";

/**
 * DownloadAppButton - Triggers PWA install or instruction modal.
 * Matches NegoMind AI design guidelines with high visual polish.
 */
export default function DownloadAppButton({
  onClick,
  variant = "navbar",
  className = "",
  isInstalled = false,
}) {
  const iconSvg = (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 transition-transform duration-200 group-hover:translate-y-0.5"
      aria-hidden="true"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );

  // Desktop Navbar Button (positioned after ABOUT)
  if (variant === "navbar") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label="Download and install NegoMind AI app"
        className={`group relative inline-flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.15)] transition-all duration-200 hover:border-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-200 hover:shadow-[0_0_18px_rgba(52,211,153,0.25)] focus:outline-none focus:ring-2 focus:ring-emerald-400/50 active:scale-95 cursor-pointer ${className}`}
      >
        <span className="flex h-4 w-4 items-center justify-center text-emerald-400">
          {iconSvg}
        </span>
        <span>{isInstalled ? "Open App" : "Download App"}</span>
      </button>
    );
  }

  // Mobile Menu Full-Width Button
  if (variant === "mobile") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label="Download and install NegoMind AI app on mobile"
        className={`group flex w-full items-center justify-center gap-2.5 rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.2)] transition-all duration-200 hover:bg-emerald-500/25 hover:text-emerald-200 active:scale-[0.98] cursor-pointer ${className}`}
      >
        <span className="flex h-5 w-5 items-center justify-center text-emerald-400">
          {iconSvg}
        </span>
        <span>{isInstalled ? "App Installed (Open)" : "Download App"}</span>
        <span className="ml-auto rounded-md bg-emerald-500/20 px-2 py-0.5 font-mono text-[9px] font-extrabold text-emerald-300">
          PWA
        </span>
      </button>
    );
  }

  // Compact Header Button for Mobile / Tablet Navbar Bar
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Download App"
      className={`group inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-300 transition-all hover:bg-emerald-500/20 active:scale-95 cursor-pointer ${className}`}
    >
      {iconSvg}
      <span className="hidden xs:inline">{isInstalled ? "App" : "Download"}</span>
    </button>
  );
}
