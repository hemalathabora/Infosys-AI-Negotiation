import { useState } from "react";
import TopNavigation from "./components/TopNavigation";
import Sidebar from "./components/Sidebar";
import AgentConfiguration from "./pages/AgentConfiguration";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg text-textPrimary">
      <TopNavigation onMenuToggle={() => setSidebarOpen((v) => !v)} />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <AgentConfiguration />
      </div>
    </div>
  );
}
