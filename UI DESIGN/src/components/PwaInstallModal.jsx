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
        className="relative w-full max-w-md rounded-2xl border border-[#2D2C36] bg-[#14131A] p-6 text-white shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition cursor-pointer"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="h-10 w-10 shrink-0">
            <NegoMindLogo size={40} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                PWA Application
              </span>
            </div>
            <h3 id="pwa-modal-title" className="text-lg font-black tracking-tight text-white">
              Install NegoMind AI
            </h3>
          </div>
        </div>

        {/* Modal Content Switch */}
        <div className="mt-5 space-y-4 text-sm font-sans">
          {state === "ios_safari" && (
            <>
              <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-3 text-xs text-sky-200">
                <p className="font-bold">iOS / iPadOS Safari Installation Guide</p>
                <p className="mt-1 text-slate-300">
                  Apple Safari requires adding web applications to your Home Screen manually:
                </p>
              </div>

              <ol className="space-y-3 font-body text-xs text-slate-300">
                <li className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-400/20 font-mono font-bold text-emerald-300 text-xs">
                    1
                  </span>
                  <div>
                    <p className="font-bold text-white">Tap the Share button</p>
                    <p className="text-slate-400 mt-0.5">
                      At the bottom of your Safari screen, tap the square Share icon (
                      <span className="font-mono text-emerald-400 font-bold">⎋</span>
                      ).
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-400/20 font-mono font-bold text-emerald-300 text-xs">
                    2
                  </span>
                  <div>
                    <p className="font-bold text-white">Select "Add to Home Screen"</p>
                    <p className="text-slate-400 mt-0.5">
                      Scroll through the share sheet options and tap{" "}
                      <strong className="text-white">"Add to Home Screen"</strong> (
                      <span className="font-mono text-emerald-400 font-bold">⊞</span>
                      ).
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-400/20 font-mono font-bold text-emerald-300 text-xs">
                    3
                  </span>
                  <div>
                    <p className="font-bold text-white">Confirm by tapping "Add"</p>
                    <p className="text-slate-400 mt-0.5">
                      Tap <strong className="text-emerald-400">Add</strong> in the top-right corner. NegoMind AI will appear on your Home Screen as a standalone app!
                    </p>
                  </div>
                </li>
              </ol>
            </>
          )}

          {state === "already_installed" && (
            <div className="py-2 text-center space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 text-2xl">
                ✓
              </div>
              <h4 className="text-base font-bold text-white">Already Installed</h4>
              <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                NegoMind AI is already installed on this device and running in standalone Progressive Web App mode with optimized hardware acceleration.
              </p>
            </div>
          )}

          {state === "accepted" && (
            <div className="py-2 text-center space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 text-2xl">
                🚀
              </div>
              <h4 className="text-base font-bold text-white">Installation Starting</h4>
              <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                NegoMind AI is being added to your application library. You can launch it directly from your device home screen or app launcher anytime.
              </p>
            </div>
          )}

          {state === "prompt_unavailable" && (
            <>
              <p className="text-xs text-slate-300 leading-relaxed">
                You can install <strong className="text-white">NegoMind AI</strong> directly to your mobile device or desktop for a fullscreen app experience.
              </p>

              <div className="space-y-2.5 rounded-xl border border-white/5 bg-white/[0.02] p-3.5 text-xs text-slate-300">
                <div className="flex items-center gap-2 text-emerald-400 font-bold font-mono">
                  <span>📱</span> On Mobile (Android / Chrome / Edge):
                </div>
                <p className="pl-6 text-slate-400">
                  Tap your browser menu (<strong className="text-white">⋮</strong>) in the top-right corner, then select{" "}
                  <strong className="text-white">"Install app"</strong> or{" "}
                  <strong className="text-white">"Add to Home screen"</strong>.
                </p>

                <div className="flex items-center gap-2 text-sky-400 font-bold font-mono pt-2 border-t border-white/5">
                  <span>💻</span> On Desktop (Chrome / Edge / Brave):
                </div>
                <p className="pl-6 text-slate-400">
                  Click the install icon (<strong className="text-white">⊕</strong> or{" "}
                  <strong className="text-white">computer icon</strong>) directly in your browser's address bar.
                </p>
              </div>

              <p className="text-[11px] font-mono text-slate-400">
                • Fast offline shell &bull; Standalone window &bull; No app store download required
              </p>
            </>
          )}
        </div>

        {/* Modal Actions */}
        <div className="mt-6 flex justify-end gap-3 border-t border-white/10 pt-4">
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
