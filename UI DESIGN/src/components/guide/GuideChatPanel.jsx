import QuickQuestions from "./QuickQuestions.jsx";
import GuideMessage from "./GuideMessage.jsx";
import ContextSuggestions from "./ContextSuggestions.jsx";

export default function GuideChatPanel({
  isOpen,
  onClose,
  messages,
  input,
  onInputChange,
  onSubmit,
  quickQuestions,
  suggestions,
  onQuickQuestion,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-5 z-50 w-[min(420px,calc(100vw-24px))] rounded-2xl border border-[#214a69] bg-[#09141f]/95 shadow-[0_0_35px_rgba(56,189,248,0.18)] backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-[#1d374d] px-4 py-3">
        <div>
          <div className="flex items-center gap-2 text-base font-bold text-[#dfeaf5]">
            <span className="text-[#7dd3fc]">✦</span>
            Negotiation Guide
          </div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-[#7fa7c0]">AI Platform Assistant</div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-[#1d374d] bg-[#0d1d2e] px-2 py-1 text-sm text-[#dfeaf5] hover:border-[#4dd0ff]/70"
        >
          ×
        </button>
      </div>

      <div className="max-h-[420px] space-y-3 overflow-y-auto p-4">
        {messages.map((message) => (
          <GuideMessage
            key={message.id}
            message={message.text}
            isUser={message.sender === "user"}
          />
        ))}

        <div className="pt-2">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#7fa7c0]">
            Quick Questions
          </p>
          <QuickQuestions questions={quickQuestions} onSelect={onQuickQuestion} />
        </div>

        {suggestions?.length > 0 && (
          <div className="pt-1">
            <ContextSuggestions suggestions={suggestions} />
          </div>
        )}
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
        className="flex items-center gap-2 border-t border-[#1d374d] p-3"
      >
        <input
          type="text"
          value={input}
          onChange={(event) => onInputChange(event.target.value)}
          placeholder="Ask me anything..."
          className="w-full rounded-xl border border-[#1d374d] bg-[#0b1d2c] px-3 py-2 text-sm text-[#dfeaf5] placeholder:text-[#6b8395] focus:border-[#4dd0ff]/80"
        />
        <button
          type="submit"
          className="rounded-xl border border-[#4dd0ff]/70 bg-[#10293d] px-3 py-2 text-sm font-semibold text-[#dfeaf5] hover:border-[#7dd3fc]"
        >
          Send
        </button>
      </form>
    </div>
  );
}
