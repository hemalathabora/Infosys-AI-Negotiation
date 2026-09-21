import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import UserProfileDropdown from "./UserProfileDropdown";

export default function TopNavigation({
  onMenuToggle,
  isMenuOpen,
  theme,
  onThemeChange,
  activePage,
  onNavigate,
  onReplayIntro,
  onOpenAuthModal,
}) {
  const isDark = theme === "dark";
  const { isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex flex-col transition-colors duration-200">
      {/* Top Navbar Main Header */}
      <div
        className={`flex h-16 items-center justify-between border-b px-3 sm:px-6 ${
          isDark
            ? "border-[#1F1E26] bg-[#0C0C0F]"
            : "border-slate-200 bg-white"
        }`}
      >
        {/* Left side - Logo & Project Title */}
        <div
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={() => onNavigate && onNavigate(isAuthenticated ? "Dashboard" : "Landing")}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-950 shadow-md font-bold">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <p className={`text-base font-black tracking-tight font-sans ${isDark ? "text-white" : "text-slate-900"}`}>
                NegoMind <span className="text-slate-200 font-black">AI</span>
              </p>
            </div>
            <p className={`text-[10px] font-semibold tracking-wider hidden md:block ${isDark ? "text-[#71707E]" : "text-slate-500"}`}>
              AI-Driven Multi-Agent Negotiation Training & Simulation Platform
            </p>
          </div>
        </div>

        {/* Right side - Actions & Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isAuthenticated && <LlmStatusBadge isDark={isDark} />}

          {isAuthenticated ? (
            <UserProfileDropdown isDark={isDark} />
          ) : (
            <button
              type="button"
              onClick={() => onOpenAuthModal && onOpenAuthModal("signin")}
              className="flex items-center gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/60 transition shadow-sm active:scale-95 cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              <span>Sign In</span>
            </button>
          )}

          {isAuthenticated && (
            <div
              className={`hidden sm:inline-flex items-center rounded-xl border px-3 py-1.5 text-xs font-mono font-bold tracking-wider uppercase ${
                isDark
                  ? "border-[#3A3944] bg-[#222129] text-slate-200"
                  : "border-slate-300 bg-slate-100 text-slate-800"
              }`}
            >
              TEAM 4
            </div>
          )}
        </div>
      </div>

      {/* Sub-Navbar Breadcrumb & Menu Bar (Below Main Navbar) */}
      {isAuthenticated && (
        <div
          className={`flex h-11 items-center justify-between border-b px-3 sm:px-6 transition-colors duration-200 ${
            isDark
              ? "border-[#1F1E26] bg-[#121117]"
              : "border-slate-200 bg-slate-100"
          }`}
        >
          <div className="flex items-center gap-3">
            {/* Menu Toggle Button */}
            <button
              type="button"
              onClick={onMenuToggle}
              className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 transition-all duration-200 shadow-sm active:scale-95 cursor-pointer text-xs font-bold ${
                isMenuOpen
                  ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-400"
                  : isDark
                  ? "border-[#3A3945] bg-[#1E1D26] text-slate-200 hover:border-slate-300 hover:bg-[#272632]"
                  : "border-slate-300 bg-slate-200 text-slate-800 hover:bg-slate-300"
              }`}
              aria-label="Toggle Navigation Menu"
              title="Toggle Navigation Menu"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-emerald-400"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
              <span>{isMenuOpen ? "Close Menu" : "Menu"}</span>
            </button>

            {/* Breadcrumb Navigation Path */}
            <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
              <span className="text-slate-500">NegoMind</span>
              <span className="text-slate-600">/</span>
              <span className="font-bold text-emerald-400">{activePage || "Dashboard"}</span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 font-mono text-[11px] text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>SYSTEM CONTROL HUB</span>
          </div>
        </div>
      )}
    </header>
  );

}

function LlmStatusBadge() {
  const [status, setStatus] = useState({
    loading: true,
    isLlmActive: true,
    provider: "gemini",
    model: "gemini-3.5-flash-lite",
    message: ""
  });

  const apiBase = import.meta.env.VITE_API_BASE_URL
    ? import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "")
    : "http://localhost:8000/api";

  const checkLlm = async () => {
    try {
      const modeRes = await fetch(`${apiBase}/settings/mode`);
      if (!modeRes.ok) throw new Error("API Offline");
      const modeData = await modeRes.json();

      const healthRes = await fetch(`${apiBase}/health/llm`);
      const healthData = await healthRes.json();

      const isLlm = modeData.is_llm_active;

      setStatus({
        loading: false,
        isLlmActive: isLlm,
        connected: healthData.connected,
        provider: modeData.provider || "gemini",
        model: modeData.model || "gemini-3.5-flash-lite",
        message: healthData.message || ""
      });
    } catch (err) {
      setStatus({
        loading: false,
        isLlmActive: false,
        connected: false,
        provider: "mock",
        model: "rule-engine",
        message: err.message || "Backend Offline"
      });
    }
  };

  useEffect(() => {
    const runCheck = async () => {
      await checkLlm();
    };
    runCheck();
    const interval = setInterval(runCheck, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleToggle = async (e) => {
    e.preventDefault();
    const nextProvider = status.isLlmActive ? "mock" : "gemini";
    try {
      setStatus((prev) => ({ ...prev, loading: true }));
      const res = await fetch(`${apiBase}/settings/mode`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: nextProvider })
      });
      if (res.ok) {
        await checkLlm();
      }
    } catch (err) {
      console.error("Failed to toggle LLM engine mode:", err);
    } finally {
      setStatus((prev) => ({ ...prev, loading: false }));
    }
  };

  if (status.loading) {
    return (
      <div className="inline-flex items-center gap-2 rounded-2xl border border-[#302F39] bg-[#1E1D24] px-3.5 py-1.5 text-xs font-mono font-bold text-slate-400">
        <span className="h-2 w-2 rounded-full bg-slate-400 animate-pulse" />
        Checking Engine...
      </div>
    );
  }

  const isOn = status.isLlmActive;

  return (
    <button
      type="button"
      onClick={handleToggle}
      title={isOn ? "Gemini LLM is Active. Click to turn OFF." : "Normal Mode is Active. Click to turn Gemini LLM ON."}
      className={`group inline-flex items-center gap-3 rounded-2xl border px-3 py-1.5 text-xs font-mono font-bold transition-all cursor-pointer shadow-sm ${
        isOn
          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
          : "border-[#3A3944] bg-[#1E1D24] text-slate-300 hover:border-slate-400 hover:bg-[#25242C]"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${isOn ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
        <span className="font-sans font-extrabold text-white hidden sm:inline">
          {isOn ? "Gemini LLM" : "Normal Mode"}
        </span>
      </div>

      <div className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors duration-200 ${
        isOn ? "bg-emerald-500" : "bg-[#3E3D4A]"
      }`}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
          isOn ? "translate-x-4" : "translate-x-0"
        }`} />
      </div>

      <span className={`font-mono text-[10px] uppercase font-black tracking-wider ${
        isOn ? "text-emerald-400" : "text-slate-400"
      }`}>
        {isOn ? "ON" : "OFF"}
      </span>
    </button>
  );
}
