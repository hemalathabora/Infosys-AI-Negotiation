import { useRef, useEffect } from "react";
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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isLoading, error, isOpen]);

  if (!isOpen) return null;

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="fixed bottom-24 right-5 z-50 flex h-[min(620px,calc(100vh-120px))] w-[min(450px,calc(100vw-24px))] flex-col overflow-hidden rounded-2xl border border-[#214a69] bg-[#07131e]/95 shadow-[0_0_40px_rgba(56,189,248,0.2)] backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1d374d] bg-[#091b2b] px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#38bdf8] opacity-75"></span>
            <span className="relative inline-flex h-3 w-3 rounded-full bg-[#38bdf8]"></span>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-sm font-bold text-[#dfeaf5]">
              NegoMind AI Assistant
            </div>
            <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#7fa7c0]">
              General & Session AI Expert
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {onNewChat && (
            <button
              type="button"
              onClick={onNewChat}
              title="Start New Conversation"
              className="rounded-lg border border-[#1d374d] bg-[#0c2236] px-2.5 py-1 text-xs font-semibold text-[#7dd3fc] hover:border-[#4dd0ff]/80 hover:bg-[#12314d]"
            >
              + New Chat
            </button>
          )}
          {onClearMessages && (
            <button
              type="button"
              onClick={onClearMessages}
              title="Clear Messages"
              className="rounded-lg border border-[#1d374d] bg-[#0c2236] px-2 py-1 text-xs text-[#8ea9c0] hover:border-[#4dd0ff]/70 hover:text-[#dfeaf5]"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Assistant"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#1d374d] bg-[#0c2236] text-sm text-[#dfeaf5] hover:border-[#4dd0ff]/70"
          >
            ×
          </button>
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 space-y-3.5 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-[#1d374d]">
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

        {/* Loading / Typing Indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-[#7dd3fc] pl-1">
            <div className="flex space-x-1">
              <div className="h-2 w-2 animate-bounce rounded-full bg-[#38bdf8] [animation-delay:-0.3s]"></div>
              <div className="h-2 w-2 animate-bounce rounded-full bg-[#38bdf8] [animation-delay:-0.15s]"></div>
              <div className="h-2 w-2 animate-bounce rounded-full bg-[#38bdf8]"></div>
            </div>
            <span className="font-medium text-[11px] text-[#7fa7c0]">NegoMind AI Assistant is thinking...</span>
          </div>
        )}

        {/* Error Display with Retry */}
        {error && (
          <div className="rounded-xl border border-red-500/40 bg-red-950/40 p-3 text-xs text-red-200">
            <p className="font-medium">{error}</p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="mt-2 rounded-lg border border-red-400/50 bg-red-900/50 px-2.5 py-1 text-[11px] font-semibold text-red-100 hover:bg-red-800/60"
              >
                🔄 Retry Last Question
              </button>
            )}
          </div>
        )}

        {/* Starter Prompts */}
        <div className="pt-2 border-t border-[#162c3e]">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#7fa7c0]">
            Starter & Session Prompts
          </p>
          <QuickQuestions questions={quickQuestions} onSelect={onQuickQuestion} />
        </div>

        {suggestions?.length > 0 && (
          <div className="pt-1">
            <ContextSuggestions suggestions={suggestions} />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box & Controls */}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
        className="border-t border-[#1d374d] bg-[#091b2b] p-3"
      >
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(event) => onInputChange(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder="Ask general, technical, math, coding, or negotiation questions... (Enter to send, Shift+Enter for newline)"
            rows={2}
            className="w-full resize-none rounded-xl border border-[#1d374d] bg-[#06121c] p-2.5 text-xs text-[#dfeaf5] placeholder:text-[#5a7488] focus:border-[#38bdf8] focus:outline-none focus:ring-1 focus:ring-[#38bdf8] disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="flex h-10 items-center justify-center rounded-xl border border-[#38bdf8]/80 bg-[#0c2f48] px-4 text-xs font-bold text-[#dfeaf5] shadow-[0_0_15px_rgba(56,189,248,0.2)] transition hover:border-[#7dd3fc] hover:bg-[#123e5e] disabled:opacity-40"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
