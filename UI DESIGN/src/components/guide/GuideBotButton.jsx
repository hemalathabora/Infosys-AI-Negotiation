export default function GuideBotButton({ onClick }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {/* Floating Popup Badge */}
      <button
        type="button"
        onClick={onClick}
        className="group relative flex items-center gap-2 rounded-full border border-[#38bdf8]/50 bg-[#071522]/90 px-3.5 py-1.5 shadow-[0_0_20px_rgba(56,189,248,0.25)] backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-[#7dd3fc]"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#38bdf8] opacity-75"></span>
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#38bdf8]"></span>
        </span>
        <span className="text-[11px] font-bold tracking-wider uppercase text-[#bfe7ff]">
          Ask NegoMind AI ✦
        </span>
      </button>

      {/* Small Circle Floating Action Button */}
      <button
        type="button"
        onClick={onClick}
        aria-label="Open AI Assistant Chatbot"
        className="group relative flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#38bdf8] bg-gradient-to-tr from-[#081827] via-[#0d2a40] to-[#123e5e] text-[#7dd3fc] shadow-[0_0_25px_rgba(56,189,248,0.35)] transition-all duration-300 hover:scale-110 hover:border-[#7dd3fc] hover:shadow-[0_0_35px_rgba(56,189,248,0.5)] active:scale-95"
      >
        {/* Pulsing Green Status Indicator */}
        <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex h-4 w-4 rounded-full border-2 border-[#081827] bg-emerald-400"></span>
        </span>

        {/* AI Chat Bot Icon */}
        <svg
          className="h-6 w-6 text-[#7dd3fc] transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4-4-4z"
          />
        </svg>
      </button>
    </div>
  );
}
