// Designed by TEAM 4
export default function Dashboard({ onNavigate }) {
  return (
    <main data-guide="dashboard-shell" className="flex-1 bg-[#04070D] px-4 py-6 sm:px-6 lg:px-8 flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-[#c4ff3a] mb-4">Welcome to NEGOTIATE</h1>
        <p className="text-[#F1F5F9] text-lg mb-8">AI-Driven Multi-Agent Negotiation Platform</p>
        <button
          onClick={() => onNavigate("Configure Agents")}
          className="px-8 py-3 bg-[#c4ff3a] text-[#04070D] font-semibold rounded-lg hover:bg-[#b0e639] transition-colors duration-200"
        >
          Click here to Configure Agents
        </button>
      </div>
    </main>
  );
}
// Designed by TEAM 4
// Designed by TEAM 4

