// Designed by TEAM 4
import { useState } from "react";
import TopNavigation from "./components/TopNavigation";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import AgentConfiguration from "./pages/AgentConfiguration";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [activePage, setActivePage] = useState("Dashboard");

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
            <AgentConfiguration />
          </div>
        );
      case "Negotiation Arena":
        return (
          <div data-guide="negotiation-arena" className="flex-1 bg-[#04070D] p-6 text-white">
            Negotiation arena placeholder
          </div>
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

