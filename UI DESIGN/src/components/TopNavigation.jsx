import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import UserProfileDropdown from "./UserProfileDropdown";
import NegoMindLogo from "./NegoMindLogo";

const navLinks = [
  { label: "Product", href: "#product" },
  { label: "Method", href: "#method" },
  { label: "Practice", href: "#practice" },
  { label: "About", page: "About" },
];

export default function TopNavigation({
  onMenuToggle,
  isMenuOpen,
  theme = "dark",
  onThemeChange,
  activePage,
  onNavigate,
  onReplayIntro,
  onOpenAuthModal,
}) {
  const isDark = theme === "dark" || theme !== "light";
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (e, link) => {
    e.preventDefault();
    if (link.page) {
      if (onNavigate) {
        onNavigate(link.page);
      }

      setMobileMenuOpen(false);
      return;
    }

    if (activePage !== "Landing") {
      if (onNavigate) onNavigate("Landing");
      setTimeout(() => {
        const element = document.querySelector(link.href);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 120);
    } else {
      const element = document.querySelector(link.href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleLogoClick = (e) => {
    e.preventDefault();
    if (isAuthenticated) {
      if (onNavigate) onNavigate("Dashboard");
    } else {
      if (onNavigate) onNavigate("Landing");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleWorkspaceClick = () => {
    if (isAuthenticated) {
      if (onNavigate) onNavigate("Configure Agents");
    } else {
      if (onOpenAuthModal) {
        onOpenAuthModal("signin");
      } else if (onNavigate) {
        onNavigate("AuthPage");
      }
    }
  };

  const handleSignInClick = () => {
    if (onOpenAuthModal) {
      onOpenAuthModal("signin");
    } else if (onNavigate) {
      onNavigate("AuthPage");
    }
  };

  return (
    <header className="sticky top-0 z-50 flex flex-col border-b border-[#26242C] bg-[#0C0C0F]/90 text-[#F8FAFC] backdrop-blur-md">
      {/* Top Navbar Main Header */}
      <div className="mx-auto flex w-full max-w-[1500px] items-center justify-between px-5 py-3.5 sm:px-8 lg:px-12">
        {/* Left Side - Brand / Logo */}
        <div className="flex items-center gap-4">
          <NegoMindLogo size={44} onClick={handleLogoClick} onNavigate={onNavigate} />
        </div>

        {/* Center Navigation Links - ONLY shown when NOT logged in */}
        {!isAuthenticated && (
          <nav className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.page ? "#" : link.href}
                onClick={(e) => handleNavClick(e, link)}
                className="relative py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 transition-colors after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-slate-100 after:transition-all hover:text-slate-100 hover:after:w-full"
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}

        {/* Right Section / Controls */}
        <div className="hidden items-center gap-4 lg:flex">
          {/* Gemini LLM Toggle Status Badge */}
          {isAuthenticated && <LlmStatusBadge />}

          {/* User Profile or Sign In */}
          {isAuthenticated ? (
            <UserProfileDropdown isDark={true} />
          ) : (
            <button
              type="button"
              onClick={handleSignInClick}
              className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 transition-colors hover:text-slate-100 cursor-pointer"
            >
              Sign in
            </button>
          )}

          {/* Workspace Button - ONLY shown when NOT logged in */}
          {!isAuthenticated && (
            <button
              type="button"
              onClick={handleWorkspaceClick}
              className="group inline-flex items-center justify-center gap-3 border border-slate-200 bg-slate-100 px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-950 transition-all duration-300 hover:bg-white hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] active:translate-y-px cursor-pointer"
            >
              <span>Enter the workspace</span>
              <span className="inline-block text-base leading-none transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
                ↗
              </span>
            </button>
          )}
        </div>

        {/* Mobile Navigation Toggle */}
        <div className="flex items-center gap-3 lg:hidden">
          {isAuthenticated && <UserProfileDropdown isDark={true} />}
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((value) => !value)}
            className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 border border-[#302F39] bg-[#16151A]"
          >
            <span className="h-px w-4 bg-slate-200" />
            <span className="h-px w-4 bg-slate-200" />
          </button>
        </div>
      </div>

      {/* Sub-Navbar Breadcrumb & Menu Bar (Below Main Navbar for Logged In Users) */}
      {isAuthenticated && (
        <div className="border-t border-[#26242C] bg-[#121116] px-5 sm:px-8 lg:px-12 text-[#F8FAFC]">
          <div className="mx-auto flex h-11 max-w-[1500px] items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Menu Toggle Button */}
              {onMenuToggle && (
                <button
                  type="button"
                  onClick={onMenuToggle}
                  className={`group inline-flex items-center gap-2 border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] transition-all duration-200 cursor-pointer ${isMenuOpen
                      ? "border-slate-200 bg-slate-100 text-slate-950"
                      : "border-[#302F39] bg-[#1B1A22] text-slate-300 hover:border-[#424050] hover:bg-[#23212C] hover:text-slate-100"
                    }`}
                  title="Toggle Dashboard Navigation Menu"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                  <span>{isMenuOpen ? "Close Menu" : "Menu"}</span>
                </button>
              )}

              {/* Breadcrumb Navigation Path */}
              <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
                <span className="text-slate-400">NegoMind</span>
                <span className="text-slate-600">/</span>
                <span className="font-bold text-slate-100 uppercase tracking-wider">
                  {activePage || "Dashboard"}
                </span>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>System Control Hub</span>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="border-t border-[#26242C] bg-[#121116] px-5 py-5 lg:hidden">
          {!isAuthenticated && (
            <nav className="flex flex-col gap-4 mb-5 border-b border-[#26242C] pb-4">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.page ? "#" : link.href}
                  onClick={(e) => {
                    setMobileMenuOpen(false);
                    handleNavClick(e, link);
                  }}
                  className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400 hover:text-slate-100"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          )}

          <div className="flex flex-col gap-4">
            {isAuthenticated && (
              <div className="flex items-center justify-between gap-3">
                {onMenuToggle && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onMenuToggle();
                    }}
                    className="flex items-center gap-2 border border-[#302F39] bg-[#1B1A22] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-100"
                  >
                    <span>Dashboard Menu</span>
                  </button>
                )}
                <LlmStatusBadge />
              </div>
            )}

            <div className="flex items-center justify-between gap-4">
              {!isAuthenticated && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleSignInClick();
                    }}
                    className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 hover:text-slate-100"
                  >
                    Sign in
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleWorkspaceClick();
                    }}
                    className="group inline-flex items-center justify-center gap-3 border border-slate-200 bg-slate-100 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-950"
                  >
                    <span>Enter workspace</span>
                    <span>↗</span>
                  </button>
                </>
              )}
            </div>
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
      <div className="inline-flex items-center rounded-md gap-2 border border-[#302F39] bg-[#1B1A22] px-3 py-1.5 text-[10px] font-mono font-bold text-slate-400">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-pulse" />
        Engine...
      </div>
    );
  }

  const isOn = status.isLlmActive;

  return (
    <button
      type="button"
      onClick={handleToggle}
      title={isOn ? "Gemini LLM is Active. Click to turn OFF." : "Normal Mode is Active. Click to turn Gemini LLM ON."}
      className={`group inline-flex items-center rounded-md gap-2.5 border px-3 py-1.5 text-[10px] font-mono font-bold transition-all cursor-pointer ${isOn
          ? "border-emerald-500/50 bg-emerald-950/30 text-emerald-300 hover:bg-emerald-900/40"
          : "border-[#302F39] bg-[#1B1A22] text-slate-400 hover:border-[#424050] hover:text-slate-100"
        }`}
    >
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${isOn ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
        <span className="font-sans font-bold uppercase tracking-[0.14em]">
          {isOn ? "Gemini LLM" : "Normal Mode"}
        </span>
      </div>

      <div className={`relative inline-flex h-4 w-7 shrink-0 items-center rounded-full p-0.5 transition-colors duration-200 ${isOn ? "bg-emerald-500" : "bg-[#302F39]"
        }`}>
        <span className={`inline-block h-3 w-3 transform rounded-full bg-white shadow-md transition-transform duration-200 ${isOn ? "translate-x-3" : "translate-x-0"
          }`} />
      </div>

      <span className={`font-mono text-[9px] uppercase font-bold tracking-wider ${isOn ? "text-emerald-400" : "text-slate-400"
        }`}>
        {isOn ? "ON" : "OFF"}
      </span>
    </button>
  );
}


