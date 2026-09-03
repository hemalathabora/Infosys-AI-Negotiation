// Designed by TEAM 4

import { useState } from "react";

import TopNavigation from "./components/TopNavigation";
import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import AgentConfiguration from "./pages/AgentConfiguration";
import NegotiationArena from "./pages/NegotiationArena";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import { useNegotiationEngine } from "./hooks/useNegotiationEngine.js";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [theme, setTheme] = useState("dark");

  const [activePage, setActivePage] = useState("Dashboard");
  const [activeScenario, setActiveScenario] = useState(null);
  const negotiation = useNegotiationEngine();

  const isDark = theme === "dark";


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
          <div data-guide="reports-panel" className="flex-1 bg-[#04070D] p-6 text-white">
            Analytics page placeholder
          </div>
        );


      case "Reports":
        return (
          <div data-guide="reports-panel" className="flex-1 bg-[#04070D] p-6 text-white">
            Reports page placeholder
          </div>
        );


      default:
        return (
          <div
            data-guide="dashboard-shell"
            className="min-h-0 flex-1"
          >
            <Dashboard
              onNavigate={setActivePage}
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
            ? "bg-[#04070D] text-[#F1F5F9]"
            : "bg-[#ECF4FF] text-[#0F172A]"
        }
      `}
    >

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
        "
      >

        {/* Sidebar */}

        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activePage={activePage}
          onNavigate={setActivePage}
        />


        {/* Main page area */}

        <div
          className="
            min-h-0
            min-w-0
            flex-1
            overflow-y-auto
            overflow-x-hidden
          "
        >
          {renderPage()}
        </div>

      </div>

    </div>
  );
}


// Designed by TEAM 4

