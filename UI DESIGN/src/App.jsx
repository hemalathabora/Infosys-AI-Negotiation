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

  const renderPage = () => {
    switch (activePage) {
      case "Dashboard":
        return (
          <div data-guide="dashboard-shell" className="flex-1">
            <Dashboard onNavigate={setActivePage} />
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
          />
        );
      case "Reports":
        return (
          <Reports
            scenario={activeScenario}
            negotiation={negotiation}
            onNavigate={setActivePage}
          />
        );
      default:
        return (
          <div data-guide="dashboard-shell" className="flex-1">
            <Dashboard onNavigate={setActivePage} />
          </div>
        );
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        isDark ? "bg-[#04070D] text-[#F1F5F9]" : "bg-[#ecf4ff] text-[#0f172a]"
      }`}
    >
      <TopNavigation
        onMenuToggle={() => setSidebarOpen((v) => !v)}
        theme={theme}
        onThemeChange={setTheme}
        activePage={activePage}
      />
      <div className="flex">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activePage={activePage}
          onNavigate={setActivePage}
        />
        {renderPage()}
      </div>
    </div>
  );
}
// Designed by TEAM 4
// Designed by TEAM 4
