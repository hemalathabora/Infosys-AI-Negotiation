import { useState, useEffect } from "react";

import CinematicLoader from "./components/CinematicLoader";
import TopNavigation from "./components/TopNavigation";
import Sidebar from "./components/Sidebar";
import AuthModal from "./components/AuthModal";
import OAuthCallbackHandler from "./components/OAuthCallbackHandler";
import { AuthProvider, useAuth } from "./context/AuthContext";

import Dashboard from "./pages/Dashboard";
import AgentConfiguration from "./pages/AgentConfiguration";
import NegotiationArena from "./pages/NegotiationArena";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import AuthPage from "./pages/AuthPage";
import LandingPage from "./pages/LandingPage.jsx";
import { useNegotiationEngine } from "./hooks/useNegotiationEngine.js";
import { useNegotiationHistory } from "./hooks/useNegotiationHistory.js";

export default function App() {
  const isOauthCallback = window.location.pathname.includes("/oauth/callback") ||
    (window.opener && (window.location.search.includes("code=") || window.location.hash.includes("access_token")));

  if (isOauthCallback) {
    return <OAuthCallbackHandler />;
  }

  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}

function MainAppContent() {
  const { user, isAuthenticated } = useAuth();
  const userId = user ? String(user.email || user.id) : null;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [activePage, setActivePage] = useState(() => (user ? "Dashboard" : "Landing"));
  const [activeScenario, setActiveScenario] = useState(null);
  const [loaderKey, setLoaderKey] = useState(1);
  const [showLoader, setShowLoader] = useState(true);

  // Auth Page / Mode State
  const [authInitialMode, setAuthInitialMode] = useState("signin");

  const negotiation = useNegotiationEngine();
  const { history, refreshHistory, addSession, stats, clearHistory } = useNegotiationHistory(userId);

  // Sync active page with authentication status
  useEffect(() => {
    if (user) {
      setActivePage((prev) => (prev === "Landing" || prev === "AuthPage" ? "Dashboard" : prev));
    } else {
      setActivePage("Landing");
    }
  }, [user]);

  const handleOpenAuthModal = (mode = "signin") => {
    setAuthInitialMode(mode);
    setActivePage("AuthPage");
  };

  const handleReplayIntro = () => {
    setLoaderKey((prev) => prev + 1);
    setShowLoader(true);
  };

  const isDark = theme === "dark";

  // Auto-record completed session to history when a negotiation completes
  useEffect(() => {
    if (!negotiation.state || !activeScenario) return;

    const { status, current_round, current_offer, mode } = negotiation.state;
    const isDone =
      status === "agreement" ||
      status === "accepted" ||
      status === "rejected" ||
      status === "deadlock" ||
      status === "breakdown" ||
      status === "cancelled" ||
      status === "completed" ||
      status === "finished";

    if (isDone) {
      const isAgreement = status === "agreement" || status === "accepted";
      const agentNames = activeScenario.agents.map((a) => a.name).join(" vs ");
      const finalVal = current_offer ? (current_offer.price ?? current_offer.value ?? null) : null;
      const finalNum = Number(finalVal);
      const settlementStr = Number.isFinite(finalNum) ? `$${Math.round(finalNum).toLocaleString()}` : "N/A";
      const sessionData = {
        id: `session-${Date.now()}`,
        scenario: activeScenario.scenario_name || activeScenario.name,
        scenario_id: activeScenario.scenario_id,
        agents: agentNames,
        rounds: current_round,
        mode: mode || "Normal Mode",
        result: isAgreement ? "Agreement" : status === "rejected" ? "Rejected" : "Deadlock",
        utility: isAgreement ? "90%" : "40%",
        settlement: settlementStr,
        date: "Just now",
        timestamp: Date.now(),
      };
      addSession(sessionData);
      if (refreshHistory) refreshHistory();
    }
  }, [negotiation.state, activeScenario, addSession, refreshHistory]);


  const renderPage = () => {
    switch (activePage) {
      case "Landing":
        return <LandingPage onNavigate={setActivePage} />;

      case "Dashboard":
        return (
          <div data-guide="dashboard-shell" className="min-h-0 flex-1">
            <Dashboard
              onNavigate={setActivePage}
              activeScenario={activeScenario}
              negotiation={negotiation}
              history={history}
              stats={stats}
              onClearHistory={clearHistory}
            />
          </div>
        );

      case "Configure Agents":
        return (
          <div data-guide="agent-configuration-shell" className="flex-1">
            <AgentConfiguration
              onNegotiationStart={async (scenario, mode, humanRole) => {
                setActiveScenario(scenario);
                await negotiation.start(scenario, mode, humanRole, userId);
                setActivePage("Negotiation Arena");
              }}
              onNegotiationReset={negotiation.reset}
            />
          </div>
        );

      case "Negotiation Arena":
        return (
          <NegotiationArena
            scenario={activeScenario}
            negotiation={negotiation}
            onNavigate={setActivePage}
          />
        );

      case "Analytics":
        return (
          <Analytics
            scenario={activeScenario}
            negotiation={negotiation}
            onNavigate={setActivePage}
            history={history}
          />
        );

      case "Reports":
        return (
          <Reports
            scenario={activeScenario}
            negotiation={negotiation}
            onNavigate={setActivePage}
            history={history}
          />
        );

      case "AuthPage":
        return (
          <AuthPage
            onNavigate={setActivePage}
            initialMode={authInitialMode}
          />
        );

      default:
        return isAuthenticated ? (
          <div data-guide="dashboard-shell" className="min-h-0 flex-1">
            <Dashboard
              onNavigate={setActivePage}
              activeScenario={activeScenario}
              negotiation={negotiation}
              history={history}
              stats={stats}
              onClearHistory={clearHistory}
            />
          </div>
        ) : (
          <LandingPage onNavigate={setActivePage} />
        );
    }
  };

  /* ============================================================
     APPLICATION LAYOUT
  ============================================================ */

  return (
    <div
      className={`
        flex
        h-screen
        w-full
        flex-col
        overflow-hidden
        transition-colors
        duration-200
        ${
          isDark
            ? "bg-[#0B0F17] text-[#F8FAFC]"
            : "bg-[#F8FAFC] text-[#0F172A]"
        }
      `}
    >
      {showLoader && (
        <CinematicLoader
          key={loaderKey}
          onComplete={() => setShowLoader(false)}
        />
      )}

      {/* ======================================================
          TOP NAVIGATION
      ======================================================= */}

      <header className="shrink-0 print:hidden">
        <TopNavigation
          onMenuToggle={() => setSidebarOpen((value) => !value)}
          isMenuOpen={sidebarOpen}
          theme={theme}
          onThemeChange={setTheme}
          activePage={activePage}
          onNavigate={setActivePage}
          onReplayIntro={handleReplayIntro}
          onOpenAuthModal={handleOpenAuthModal}
        />
      </header>

      {/* ======================================================
          STAGGERED MENU OVERLAY (FOR LOGGED IN USERS)
      ======================================================= */}

      {isAuthenticated && (
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activePage={activePage}
          onNavigate={setActivePage}
          stats={stats}
          history={history}
          activeScenario={activeScenario}
          negotiation={negotiation}
          onClearHistory={clearHistory}
          onReplayIntro={handleReplayIntro}
        />
      )}

      {/* ======================================================
          MAIN PAGE CONTENT AREA
      ======================================================= */}

      <div className="flex min-h-0 flex-1 overflow-hidden bg-[#0C0C0F]">
        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
          {renderPage()}
        </div>
      </div>
    </div>
  );
}
