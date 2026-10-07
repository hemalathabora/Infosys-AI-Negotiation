import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import UserProfileDropdown from "./UserProfileDropdown";

const navLinks = [
  { label: "Product", href: "#product" },
  { label: "Method", href: "#method" },
  { label: "Practice", href: "#practice" },
  { label: "About", href: "#about" },
];

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
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (e, href) => {
    e.preventDefault();
    if (activePage !== "Landing") {
      if (onNavigate) onNavigate("Landing");
      setTimeout(() => {
        const element = document.querySelector(href);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 120);
    } else {
      const element = document.querySelector(href);
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
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => onNavigate && onNavigate(isAuthenticated ? "Dashboard" : "Landing")}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white p-1 shadow-md border border-white/10 overflow-hidden group-hover:scale-105 transition-transform">
            <img src="/logo-icon.png" alt="NegoMind AI" className="h-full w-full object-contain" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <p className={`text-base font-black tracking-tight font-sans ${isDark ? "text-white" : "text-slate-900"}`}>
                NegoMind <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 font-black">Ai</span>
              </p>
            </div>
            <p className={`text-[10px] font-semibold tracking-wider hidden md:block ${isDark ? "text-[#71707E]" : "text-slate-500"}`}>
              THINK • NEGOTIATE • GROW
            </p>
          </div>
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="relative py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#AAA79E] transition-colors after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-[#E8E3D8] after:transition-all hover:text-[#E8E3D8] hover:after:w-full"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right Section / Controls */}
        <div className="hidden items-center gap-5 lg:flex">
          {/* Dashboard Menu Toggle for Logged In User */}
          {isAuthenticated && onMenuToggle && (
            <button
              type="button"
              onClick={onMenuToggle}
              className={`group inline-flex items-center gap-2 border px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] transition-all duration-200 cursor-pointer ${
                isMenuOpen
                  ? "border-[#E8E3D8] bg-[#E8E3D8] text-[#191A1C]"
                  : "border-[#4B4A45] bg-[#222326] text-[#AAA79E] hover:border-[#E8E3D8] hover:text-[#E8E3D8]"
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

          {/* Gemini LLM Toggle Status Badge */}
          {isAuthenticated && <LlmStatusBadge />}

          {/* User Profile or Sign In */}
          {isAuthenticated ? (
            <UserProfileDropdown isDark={true} />
          ) : (
            <button
              type="button"
              onClick={handleSignInClick}
              className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#AAA79E] transition-colors hover:text-[#E8E3D8] cursor-pointer"
            >
              Sign in
            </button>
          )}

          {/* Workspace Button */}
          <button
            type="button"
            onClick={handleWorkspaceClick}
            className="group inline-flex items-center justify-center gap-3 border border-[#E8E3D8] bg-[#E8E3D8] px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#191A1C] transition-all duration-300 hover:bg-[#FFFFFF] active:translate-y-px cursor-pointer"
          >
            <span>Enter the workspace</span>
            <span className="inline-block text-base leading-none transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
              ↗
            </span>
          </button>
        </div>

        {/* Mobile Navigation Toggle */}
        <div className="flex items-center gap-3 lg:hidden">
          {isAuthenticated && <UserProfileDropdown isDark={true} />}
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((value) => !value)}
            className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 border border-[#4B4A45] bg-[#191A1C]"
          >
            <span className="h-px w-4 bg-[#E8E3D8]" />
            <span className="h-px w-4 bg-[#E8E3D8]" />
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="border-t border-[#3B3B39] bg-[#191A1C] px-5 py-5 lg:hidden">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  handleNavClick(e, link.href);
                }}
                className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#AAA79E] hover:text-[#E8E3D8]"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="mt-5 flex flex-col gap-4 border-t border-[#3B3B39] pt-4">
            {isAuthenticated && (
              <div className="flex items-center justify-between gap-3">
                {onMenuToggle && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onMenuToggle();
                    }}
                    className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#AAA79E] hover:text-[#E8E3D8]"
                  >
                    <span>Dashboard Menu</span>
                  </button>
                )}
                <LlmStatusBadge />
              </div>
            )}

            <div className="flex items-center justify-between gap-4">
              {!isAuthenticated && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignInClick();
                  }}
                  className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#AAA79E] hover:text-[#E8E3D8]"
                >
                  Sign in
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleWorkspaceClick();
                }}
                className="group inline-flex items-center justify-center gap-3 border border-[#E8E3D8] bg-[#E8E3D8] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#191A1C]"
              >
                <span>Enter workspace</span>
                <span>↗</span>
              </button>
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
      <div className="inline-flex items-center gap-2 border border-[#4B4A45] bg-[#222326] px-3 py-1.5 text-[10px] font-mono font-bold text-[#AAA79E]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#AAA79E] animate-pulse" />
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
      className={`group inline-flex items-center gap-2 border px-3 py-1.5 text-[10px] font-mono font-bold transition-all cursor-pointer ${
        isOn
          ? "border-emerald-500/50 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/50"
          : "border-[#4B4A45] bg-[#222326] text-[#AAA79E] hover:border-[#8E8B83] hover:text-[#E8E3D8]"
      }`}
    >
      <span className={`h-2 w-2 rounded-full ${isOn ? "bg-emerald-400 animate-pulse" : "bg-[#8E8B83]"}`} />
      <span className="uppercase tracking-[0.14em]">{isOn ? "Gemini LLM" : "Normal Mode"}</span>
    </button>
  );
}

