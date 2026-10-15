import React, { useEffect } from "react";
import NegoMindLogo from "./NegoMindLogo";

export default function PwaInstallModal({ isOpen, onClose, modalState }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const state = modalState || "prompt_unavailable";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pwa-modal-title"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-border bg-mainPanel p-6 text-textPrimary shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-card text-textMuted hover:bg-cardAlt hover:text-textPrimary transition cursor-pointer"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <div className="h-10 w-10 shrink-0">
            <NegoMindLogo size={40} showWordmark={false} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                PWA Application
              </span>
            </div>
            <h3 id="pwa-modal-title" className="text-lg font-black tracking-tight text-textPrimary">
              Install NegoMind AI
            </h3>
          </div>
        </div>

        {/* Modal Content Switch */}
        <div className="mt-5 space-y-4 text-sm font-sans">
          {state === "ios_safari" && (
            <>
              <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-3 text-xs text-sky-700 dark:text-sky-200">
                <p className="font-bold">iOS / iPadOS Safari Installation Guide</p>
                <p className="mt-1 text-textSecondary">
                  Apple Safari requires adding web applications to your Home Screen manually:
                </p>
              </div>

              <ol className="space-y-3 font-body text-xs text-textSecondary">
                <li className="flex items-start gap-3 rounded-xl border border-border bg-cardAlt p-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-400/20 font-mono font-bold text-emerald-600 dark:text-emerald-300 text-xs">
                    1
                  </span>
                  <div>
                    <p className="font-bold text-textPrimary">Tap the Share button</p>
                    <p className="text-textMuted mt-0.5">
                      At the bottom of your Safari screen, tap the square Share icon (
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">⎋</span>
                      ).
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3 rounded-xl border border-border bg-cardAlt p-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-400/20 font-mono font-bold text-emerald-600 dark:text-emerald-300 text-xs">
                    2
                  </span>
                  <div>
                    <p className="font-bold text-textPrimary">Select "Add to Home Screen"</p>
                    <p className="text-textMuted mt-0.5">
                      Scroll through the share sheet options and tap{" "}
                      <strong className="text-textPrimary">"Add to Home Screen"</strong> (
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">⊞</span>
                      ).
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3 rounded-xl border border-border bg-cardAlt p-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-400/20 font-mono font-bold text-emerald-600 dark:text-emerald-300 text-xs">
                    3
                  </span>
                  <div>
                    <p className="font-bold text-textPrimary">Confirm by tapping "Add"</p>
                    <p className="text-textMuted mt-0.5">
                      Tap <strong className="text-emerald-600 dark:text-emerald-400">Add</strong> in the top-right corner. NegoMind AI will appear on your Home Screen as a standalone app!
                    </p>
                  </div>
                </li>
              </ol>
            </>
          )}

          {state === "already_installed" && (
            <div className="py-2 text-center space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-2xl">
                ✓
              </div>
              <h4 className="text-base font-bold text-textPrimary">Already Installed</h4>
              <p className="text-xs text-textSecondary leading-relaxed max-w-sm mx-auto">
                NegoMind AI is already installed on this device and running in standalone Progressive Web App mode with optimized hardware acceleration.
              </p>
            </div>
          )}

          {state === "accepted" && (
            <div className="py-2 text-center space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-2xl">
                🚀
              </div>
              <h4 className="text-base font-bold text-textPrimary">Installation Starting</h4>
              <p className="text-xs text-textSecondary leading-relaxed max-w-sm mx-auto">
                NegoMind AI is being added to your application library. You can launch it directly from your device home screen or app launcher anytime.
              </p>
            </div>
          )}

          {state === "prompt_unavailable" && (
            <>
              <p className="text-xs text-textSecondary leading-relaxed">
                You can install <strong className="text-textPrimary">NegoMind AI</strong> directly to your mobile device or desktop for a fullscreen app experience.
              </p>

              <div className="space-y-2.5 rounded-xl border border-border bg-cardAlt p-3.5 text-xs text-textSecondary">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                  <span>📱</span> On Mobile (Android / Chrome / Edge):
                </div>
                <p className="pl-6 text-textMuted">
                  Tap your browser menu (<strong className="text-textPrimary">⋮</strong>) in the top-right corner, then select{" "}
                  <strong className="text-textPrimary">"Install app"</strong> or{" "}
                  <strong className="text-textPrimary">"Add to Home screen"</strong>.
                </p>

                <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-bold font-mono pt-2 border-t border-border">
                  <span>💻</span> On Desktop (Chrome / Edge / Brave):
                </div>
                <p className="pl-6 text-textMuted">
                  Click the install icon (<strong className="text-textPrimary">⊕</strong> or{" "}
                  <strong className="text-textPrimary">computer icon</strong>) directly in your browser's address bar.
                </p>
              </div>

              <p className="text-[11px] font-mono text-textMuted">
                • Fast offline shell &bull; Standalone window &bull; No app store download required
              </p>
            </>
          )}
        </div>

        {/* Modal Actions */}
        <div className="mt-6 flex justify-end gap-3 border-t border-border pt-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 px-5 py-2.5 text-xs font-black uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(52,211,153,0.3)] cursor-pointer"
          >
            {state === "already_installed" ? "Continue in App" : "Got It"}
          </button>
        </div>
      </div>
    </div>
  );
}
