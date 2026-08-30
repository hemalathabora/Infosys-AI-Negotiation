export default function DashboardHeader({ mode, status, onNewNegotiation }) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">Negotiation Command Center</h1>
        <p className="mt-2 text-sm text-[#8ca6bb] sm:text-base">
          Monitor simulations, configure agents, and analyze negotiation performance.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#1d374d] bg-[#0d1d2e] px-3 py-2 text-xs font-semibold text-[#c4ff3a]">
          <span className="h-2 w-2 rounded-full bg-[#c4ff3a]" aria-hidden="true" />
          {status}
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-[#1d374d] bg-[#0d1d2e] px-3 py-2 text-xs font-semibold text-[#dfeaf5]">
          <span className="text-[#8ca6bb]">Mode</span>
          <span>{mode}</span>
        </div>
        <button
          type="button"
          onClick={onNewNegotiation}
          className="inline-flex items-center gap-2 rounded-xl border border-[#c4ff3a]/70 bg-[#c4ff3a] px-4 py-2.5 text-sm font-bold text-[#061018] transition-opacity hover:opacity-90"
        >
          <span className="text-lg leading-none">+</span>
          New Negotiation
        </button>
      </div>
    </div>
  );
}
