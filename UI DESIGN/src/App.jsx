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
          <div
            data-guide="agent-configuration-shell"
            className="min-h-0 flex-1"
          >
            <AgentConfiguration />
          </div>
        );


      case "Negotiation Arena":
        return (
          <main
            data-guide="negotiation-arena"
            className="
              min-h-0
              flex-1
              overflow-y-auto
              bg-[#04070D]
              p-6
              text-white
            "
          >
            <div className="mx-auto max-w-[1500px]">

              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#4DD0FF]">
                  Negotiation Arena
                </p>

                <h1 className="mt-2 text-3xl font-bold">
                  Negotiation Arena
                </h1>

                <p className="mt-2 text-sm text-[#8CA6BB]">
                  Run and monitor AI-powered negotiation sessions.
                </p>
              </div>

              <div className="
                rounded-2xl
                border
                border-[#1D374D]
                bg-[#0E2338]
                p-6
              ">
                <p className="text-sm text-[#8CA6BB]">
                  Select a negotiation from the configuration
                  page to begin a session.
                </p>
              </div>

            </div>
          </main>
        );


      case "Analytics":
        return (
          <main
            data-guide="analytics-panel"
            className="
              min-h-0
              flex-1
              overflow-y-auto
              bg-[#04070D]
              p-6
              text-white
            "
          >
            <div className="mx-auto max-w-[1500px]">

              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#4DD0FF]">
                Analytics
              </p>

              <h1 className="mt-2 text-3xl font-bold">
                Analytics
              </h1>

              <p className="mt-2 text-sm text-[#8CA6BB]">
                Analyze negotiation performance and outcomes.
              </p>

            </div>
          </main>
        );


      case "Reports":
        return (
          <main
            data-guide="reports-panel"
            className="
              min-h-0
              flex-1
              overflow-y-auto
              bg-[#04070D]
              p-6
              text-white
            "
          >
            <div className="mx-auto max-w-[1500px]">

              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#4DD0FF]">
                Reports
              </p>

              <h1 className="mt-2 text-3xl font-bold">
                Reports
              </h1>

              <p className="mt-2 text-sm text-[#8CA6BB]">
                View negotiation summaries and generated reports.
              </p>

            </div>
          </main>
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