export default function GuideBotButton({ onClick }) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2">
      <div className="rounded-full border border-[#38BDF8]/60 bg-[#09141f]/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#bfe7ff] shadow-[0_0_20px_rgba(56,189,248,0.2)] backdrop-blur-sm">
        Need Help?
        <div className="mt-1 text-[9px] tracking-[0.12em] text-[#8ea9c0]">Ask the AI Guide</div>
      </div>
      <button
        type="button"
        onClick={onClick}
        aria-label="Open Negotiation Guide"
        className="group flex h-16 w-16 items-center justify-center rounded-2xl border border-[#4dd0ff]/70 bg-[#0b1b2a]/90 text-xl font-black text-[#7dd3fc] shadow-[0_0_22px_rgba(56,189,248,0.18)] transition duration-200 hover:-translate-y-0.5 hover:border-[#7dd3fc] hover:shadow-[0_0_26px_rgba(56,189,248,0.25)]"
      >
        <span className="inline-flex flex-col items-center leading-none">
          <span className="text-[10px] font-bold uppercase tracking-[0.14em]">AI</span>
          <span className="text-[10px] font-bold uppercase tracking-[0.14em]">GUIDE</span>
        </span>
      </button>
    </div>
  );
}
