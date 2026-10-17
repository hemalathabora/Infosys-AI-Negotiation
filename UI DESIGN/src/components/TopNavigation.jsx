import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import UserProfileDropdown from "./UserProfileDropdown";
import NegoMindLogo from "./NegoMindLogo";
import DownloadAppButton from "./DownloadAppButton";
import PwaInstallModal from "./PwaInstallModal";
import ThemeToggle from "./ThemeToggle";
import { usePwaInstall } from "../hooks/usePwaInstall";

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
  onThemeChange: _onThemeChange,
  activePage,
  onNavigate,
  onReplayIntro: _onReplayIntro,
  onOpenAuthModal,
}) {
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { isInstalled, promptInstall } = usePwaInstall();
  const [pwaModalOpen, setPwaModalOpen] = useState(false);
  const [pwaModalState, setPwaModalState] = useState("prompt_unavailable");

  const handleDownloadAppClick = async () => {
    const res = await promptInstall();
    if (res?.status === "accepted") {
      setPwaModalState("accepted");
      setPwaModalOpen(true);
    } else if (res?.status === "already_installed") {
      setPwaModalState("already_installed");
      setPwaModalOpen(true);
    } else if (res?.status === "ios_safari") {
      setPwaModalState("ios_safari");
      setPwaModalOpen(true);
    } else if (res?.status === "dismissed") {
      // User closed native prompt
    } else {
      setPwaModalState("prompt_unavailable");
      setPwaModalOpen(true);
    }
  };

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
    <header className="sticky top-0 z-50 flex flex-col border-b border-border bg-header/90 text-textPrimary backdrop-blur-md transition-colors duration-200 print:hidden">
      {/* Top Navbar Main Header */}
      <div className="relative z-20 mx-auto flex w-full max-w-[1500px] items-center justify-between px-5 py-3.5 sm:px-8 lg:px-12">
        {/* Left Side - Brand / Logo */}
        <div className="flex items-center gap-4">
          <NegoMindLogo size={44} onClick={handleLogoClick} onNavigate={onNavigate} />
        </div>

        {/* Center Navigation Links & Download App Button - ONLY shown when NOT logged in */}
        {!isAuthenticated && (
          <nav className="hidden items-center gap-6 xl:gap-8 lg:flex">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.page ? "#" : link.href}
                onClick={(e) => handleNavClick(e, link)}
                className="relative py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-textSecondary transition-colors after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-textPrimary after:transition-all hover:text-textPrimary hover:after:w-full"
              >
                {link.label}
              </a>
            ))}
            <DownloadAppButton
              variant="navbar"
              onClick={handleDownloadAppClick}
              isInstalled={isInstalled}
            />
          </nav>
        )}

        {/* Right Section / Controls */}
        <div className="hidden items-center gap-3 lg:flex">
          {/* Theme Selector */}
          <ThemeToggle />

          {/* Gemini LLM Toggle Status Badge */}
          {isAuthenticated && <LlmStatusBadge />}

          {/* User Profile or Sign In */}
          {isAuthenticated ? (
            <UserProfileDropdown />
          ) : (
            <button
              type="button"
              onClick={handleSignInClick}
              className="text-[11px] font-bold uppercase tracking-[0.14em] text-textSecondary transition-colors hover:text-textPrimary cursor-pointer px-2 py-1"
            >
              Sign in
            </button>
          )}

          {/* Workspace Button - ONLY shown when NOT logged in */}
          {!isAuthenticated && (
            <button
              type="button"
              onClick={handleWorkspaceClick}
              className="group inline-flex items-center justify-center gap-3 border border-border bg-primaryBright text-primary px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.16em] dark:text-slate-950 dark:bg-slate-100 transition-all duration-300 hover:shadow-[0_0_20px_rgba(99,102,241,0.25)] active:translate-y-px cursor-pointer rounded-xl"
            >
              <span>Enter the workspace</span>
              <span className="inline-block text-base leading-none transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
                ↗
              </span>
            </button>
          )}
        </div>

        {/* Mobile Navigation Toggle & Compact Download Button */}
        <div className="flex items-center gap-2.5 lg:hidden">
          {/* Mobile Theme Toggle */}
          <ThemeToggle compact />

          {!isAuthenticated && (
            <DownloadAppButton
              variant="headerCompact"
              onClick={handleDownloadAppClick}
              isInstalled={isInstalled}
            />
          )}
          {isAuthenticated && <UserProfileDropdown />}
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((value) => !value)}
            className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 border border-border bg-card rounded-xl text-textPrimary"
          >
            <span className="h-0.5 w-4 bg-current" />
            <span className="h-0.5 w-4 bg-current" />
          </button>
        </div>
      </div>

      {/* Sub-Navbar Breadcrumb & Menu Bar (Below Main Navbar for Logged In Users) */}
      {isAuthenticated && (
        <div className="relative z-10 border-t border-border bg-card/90 px-5 sm:px-8 lg:px-12 text-textPrimary transition-colors duration-200">
          <div className="mx-auto flex h-11 max-w-[1500px] items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Menu Toggle Button */}
              {onMenuToggle && (
                <button
                  type="button"
                  onClick={onMenuToggle}
                  className={`group inline-flex items-center gap-2 border px-3 py-1 rounded-xl text-[11px] font-bold uppercase tracking-[0.14em] transition-all duration-200 cursor-pointer ${isMenuOpen
                      ? "border-primaryBright bg-primaryBright/10 text-primaryBright"
                      : "border-border bg-cardAlt text-textSecondary hover:border-borderGlow hover:text-textPrimary"
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
              <div className="flex items-center gap-2 font-mono text-[11px] text-textSecondary">
                <span>NegoMind</span>
                <span className="text-textMuted">/</span>
                <span className="font-bold text-textPrimary uppercase tracking-wider">
                  {activePage || "Dashboard"}
                </span>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-textMuted">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>System Control Hub</span>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-card px-5 py-5 lg:hidden text-textPrimary shadow-xl animate-in fade-in duration-150">
          {!isAuthenticated && (
            <nav className="flex flex-col gap-4 mb-5 border-b border-border pb-4">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.page ? "#" : link.href}
                  onClick={(e) => {
                    setMobileMenuOpen(false);
                    handleNavClick(e, link);
                  }}
                  className="text-[11px] font-bold uppercase tracking-[0.16em] text-textSecondary hover:text-textPrimary"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-2">
                <DownloadAppButton
                  variant="mobile"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleDownloadAppClick();
                  }}
                  isInstalled={isInstalled}
                />
              </div>
            </nav>
          )}

          <div className="flex flex-col gap-4">
            {isAuthenticated && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                  {onMenuToggle && (
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onMenuToggle();
                      }}
                      className="flex items-center gap-2 border border-border bg-cardAlt px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-textPrimary rounded-lg"
                    >
                      <span>Dashboard Menu</span>
                    </button>
                  )}
                  <LlmStatusBadge />
                </div>
                {!isInstalled && (
                  <DownloadAppButton
                    variant="mobile"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleDownloadAppClick();
                    }}
                    isInstalled={isInstalled}
                  />
                )}
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
                    className="text-[11px] font-bold uppercase tracking-[0.14em] text-textSecondary hover:text-textPrimary cursor-pointer"
                  >
                    Sign in
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleWorkspaceClick();
                    }}
                    className="group inline-flex items-center justify-center gap-3 border border-border bg-primaryBright text-primary dark:text-slate-950 dark:bg-slate-100 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] cursor-pointer rounded-xl"
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

      {/* PWA Installation Guidance Modal */}
      <PwaInstallModal
        isOpen={pwaModalOpen}
        onClose={() => setPwaModalOpen(false)}
        modalState={pwaModalState}
      />
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
  // checkLlm is defined in component scope and stable — intentionally omitted
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <div className="inline-flex items-center rounded-xl gap-2 border border-border bg-card px-3 py-1.5 text-[10px] font-mono font-bold text-textMuted">
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
      className={`group inline-flex items-center rounded-xl gap-2.5 border px-3 py-1.5 text-[10px] font-mono font-bold transition-all cursor-pointer shadow-sm ${isOn
          ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-500/25"
          : "border-border bg-card text-textSecondary hover:border-borderGlow hover:text-textPrimary"
        }`}
    >
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${isOn ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
        <span className="font-sans font-bold uppercase tracking-[0.14em]">
          {isOn ? "Gemini LLM" : "Normal Mode"}
        </span>
      </div>

      <div className={`relative inline-flex h-4 w-7 shrink-0 items-center rounded-full p-0.5 transition-colors duration-200 ${isOn ? "bg-emerald-500" : "bg-borderGlow"
        }`}>
        <span className={`inline-block h-3 w-3 transform rounded-full bg-white shadow-md transition-transform duration-200 ${isOn ? "translate-x-3" : "translate-x-0"
          }`} />
      </div>

      <span className={`font-mono text-[9px] uppercase font-bold tracking-wider ${isOn ? "text-emerald-600 dark:text-emerald-400" : "text-textMuted"
        }`}>
        {isOn ? "ON" : "OFF"}
      </span>
    </button>
  );
}


