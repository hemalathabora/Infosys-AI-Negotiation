import { useState, useEffect } from "react";

import CinematicLoader from "./components/CinematicLoader";
import TopNavigation from "./components/TopNavigation";
import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import AgentConfiguration from "./pages/AgentConfiguration";
import NegotiationArena from "./pages/NegotiationArena";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import { useNegotiationEngine } from "./hooks/useNegotiationEngine.js";
import { useNegotiationHistory } from "./hooks/useNegotiationHistory.js";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [activePage, setActivePage] = useState("Dashboard");
  const [activeScenario, setActiveScenario] = useState(null);
  const [loaderKey, setLoaderKey] = useState(1);
  const [showLoader, setShowLoader] = useState(true);

  const negotiation = useNegotiationEngine();
  const { history, addSession, stats, clearHistory } = useNegotiationHistory();

  const handleReplayIntro = () => {
    setLoaderKey((prev) => prev + 1);
    setShowLoader(true);
  };

  const isDark = theme === "dark";

  // Auto-record completed session to history when a negotiation completes
  useEffect(() => {
    if (!negotiation.state || !activeScenario) return;

    const { status, current_round, current_offer, history: offerHistory } = negotiation.state;
    if (status === "agreement" || status === "deadlock") {
      const isAgreement = status === "agreement";
      const agentNames = activeScenario.agents.map((a) => a.name).join(" vs ");
      const finalVal = current_offer?.value;
      const settlementStr = finalVal ? `$${Math.round(finalVal).toLocaleString()}` : "N/A";
      const sessionData = {
        id: `session-${Date.now()}`,
        scenario: activeScenario.scenario_name || activeScenario.name,
        scenario_id: activeScenario.scenario_id,
        agents: agentNames,
        rounds: current_round,
        result: isAgreement ? "Agreement" : "Deadlock",
        utility: isAgreement ? "90%" : "40%",
        settlement: settlementStr,
        date: "Just now",
        timestamp: Date.now(),
      };
      addSession(sessionData);
    }
  }, [negotiation.state?.status, activeScenario, addSession]);


  /* ============================================================
     PAGE RENDERING
  ============================================================ */

  const renderPage = () => {
    switch (activePage) {

      case "Dashboard":
        return (
          <div
            data-guide="dashboard-shell"
            className="min-h-0 flex-1"
          >
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
              onNegotiationStart={(scenario) => {
                setActiveScenario(scenario);
                negotiation.start(scenario);
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


      default:
        return (
          <div
            data-guide="dashboard-shell"
            className="min-h-0 flex-1"
          >
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

      <header className="shrink-0">

        <TopNavigation
          onMenuToggle={() =>
            setSidebarOpen((value) => !value)
          }
          theme={theme}
          onThemeChange={setTheme}
          activePage={activePage}
          onReplayIntro={handleReplayIntro}
        />

      </header>


      {/* ======================================================
          SIDEBAR + MAIN CONTENT
      ======================================================= */}

      <div
        className="
          flex
          min-h-0
          flex-1
          overflow-hidden
          bg-[#0C0C0F]
          p-2 sm:p-3 lg:p-4
          gap-2 lg:gap-4
        "
      >

        {/* Sidebar */}

        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activePage={activePage}
          onNavigate={setActivePage}
        />


        {/* Main page area (Elevated rounded container like reference screenshot) */}

        <div
          className="
            min-h-0
            min-w-0
            flex-1
            overflow-y-auto
            overflow-x-hidden
            rounded-2xl lg:rounded-[20px]
            border border-[#27262F]
            bg-[#17161B]
            shadow-2xl
          "
        >
          {renderPage()}
        </div>

      </div>

    </div>
  );
}
