import { useRef, useEffect } from "react";
import QuickQuestions from "./QuickQuestions.jsx";
import GuideMessage from "./GuideMessage.jsx";
import ContextSuggestions from "./ContextSuggestions.jsx";

function RobotIcon({ className = "h-6 w-6" }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 64 64"
      fill="none"
      className={className}
    >
      <path
        d="M32 14V8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="3"
      />

      <circle cx="32" cy="6" r="2.5" fill="#A5B4FC" />

      <rect
        x="13"
        y="15"
        width="38"
        height="31"
        rx="9"
        fill="#242330"
        stroke="currentColor"
        strokeWidth="2.5"
      />

      <path
        d="M13 27H9.5C8.67 27 8 27.67 8 28.5V33.5C8 34.33 8.67 35 9.5 35H13M51 27H54.5C55.33 27 56 27.67 56 28.5V33.5C56 34.33 55.33 35 54.5 35H51"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.5"
      />

      <circle cx="24" cy="29" r="3" fill="#A5B4FC" />
      <circle cx="40" cy="29" r="3" fill="#A5B4FC" />

      <path
        d="M24 38C27.5 40.5 36.5 40.5 40 38"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.5"
      />

      <path
        d="M22 46V51C22 53.21 23.79 55 26 55H38C40.21 55 42 53.21 42 51V46"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.5"
      />

      <circle cx="32" cy="50" r="2" fill="#A5B4FC" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4"
    >
      <path
        d="M22 2 11 13"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m22 2-7 20-4-9-9-4 20-7Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4"
    >
      <path
        d="m6 6 12 12M18 6 6 18"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function GuideChatPanel({
  isOpen,
  onClose,
  messages,
  input,
  onInputChange,
  onSubmit,
  isLoading,
  error,
  onRetry,
  onNewChat,
  onClearMessages,
  quickQuestions,
  suggestions,
  onQuickQuestion,
}) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isLoading, error, isOpen]);

  if (!isOpen) return null;

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="fixed bottom-24 right-5 z-50 flex h-[min(680px,calc(100vh-120px))] w-[min(460px,calc(100vw-24px))] flex-col overflow-hidden rounded-2xl border border-[#302F39] bg-[#17161B] text-slate-200 shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
      {/* Header */}
      <header className="border-b border-[#292831] bg-[#1E1D24] px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-indigo-500/40 bg-indigo-500/10 text-indigo-300">
              <span className="absolute inset-0 rounded-xl bg-indigo-500/10 blur-md" />
              <RobotIcon className="relative h-7 w-7" />

              <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-[#1E1D24] bg-emerald-400">
                <span className="h-1 w-1 rounded-full bg-emerald-950" />
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="truncate text-sm font-bold text-slate-100">
                  NegoMind AI Assistant
                </h2>

                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-emerald-400">
                  Online
                </span>
              </div>

              <p className="mt-1 truncate font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">
                General & session AI expert
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close assistant"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#302F39] bg-[#25242D] text-slate-400 transition hover:border-indigo-400/60 hover:bg-indigo-500/10 hover:text-indigo-300"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-[#292831] pt-3">
          <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-slate-500">
            Conversation workspace
          </span>

          <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-emerald-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            System ready
          </span>
        </div>
      </header>

      {/* Header controls */}
      {(onNewChat || onClearMessages) && (
        <div className="flex items-center justify-end gap-2 border-b border-[#292831] bg-[#1A191E] px-4 py-2.5">
          {onNewChat && (
            <button
              type="button"
              onClick={onNewChat}
              className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-indigo-300 transition hover:border-indigo-400/60 hover:bg-indigo-500/20"
            >
              + New Chat
            </button>
          )}

          {onClearMessages && (
            <button
              type="button"
              onClick={onClearMessages}
              className="rounded-lg border border-[#302F39] bg-[#25242D] px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-slate-400 transition hover:border-slate-500 hover:text-slate-200"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* Message stream */}
      <div className="flex-1 space-y-4 overflow-y-auto bg-[#17161B] p-4 scrollbar-thin scrollbar-thumb-[#3A3945] scrollbar-track-[#201F25]">
        {messages.map((message) => (
          <GuideMessage
            key={message.id}
            message={message.text}
            isUser={message.sender === "user"}
            timestamp={message.timestamp}
            provider={message.provider}
            model={message.model}
          />
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-center gap-3 rounded-xl border border-indigo-500/20 bg-indigo-500/5 px-3 py-2.5">
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-400 [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-400 [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-400" />
            </div>

            <span className="font-mono text-[10px] uppercase tracking-[0.13em] text-indigo-300">
              NegoMind is thinking
            </span>
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-200">
            <div className="flex items-start gap-2">
              <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-rose-400" />

              <div>
                <p className="leading-5">{error}</p>

                {onRetry && (
                  <button
                    type="button"
                    onClick={onRetry}
                    className="mt-3 rounded-lg border border-rose-400/40 bg-rose-500/10 px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-rose-200 transition hover:bg-rose-500/20"
                  >
                    Retry Last Question
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Starter prompts */}
        <div className="border-t border-[#292831] pt-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
              Starter & session prompts
            </p>

            <span className="font-mono text-[9px] uppercase tracking-wider text-indigo-400">
              Suggested
            </span>
          </div>

          <QuickQuestions
            questions={quickQuestions}
            onSelect={onQuickQuestion}
          />
        </div>

        {suggestions?.length > 0 && (
          <div className="border-t border-[#292831] pt-3">
            <ContextSuggestions suggestions={suggestions} />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
        className="border-t border-[#292831] bg-[#1E1D24] p-4"
      >
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(event) => onInputChange(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder="Ask about negotiation, strategy, coding, or math..."
            rows={2}
            className="w-full resize-none rounded-xl border border-[#302F39] bg-[#17161B] p-3 text-xs leading-5 text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="flex h-10 items-center justify-center gap-2 rounded-xl border border-indigo-400/60 bg-indigo-500/15 px-4 text-[10px] font-bold uppercase tracking-wider text-indigo-200 shadow-[0_0_15px_rgba(99,102,241,0.12)] transition hover:border-indigo-300 hover:bg-indigo-500/25 hover:text-indigo-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Send
            <SendIcon />
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-slate-600">
            Enter to send
          </span>

          <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-slate-600">
            Shift + Enter for newline
          </span>
        </div>
      </form>
    </div>
  );
}