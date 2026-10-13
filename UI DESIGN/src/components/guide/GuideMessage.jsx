import { useState } from "react";
import MarkdownRenderer from "./MarkdownRenderer.jsx";

export default function GuideMessage({ message, isUser = false, timestamp = "", provider = "", model = "" }) {
  const [copied, setCopied] = useState(false);

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} space-y-1`}>
      <div
        className={`relative max-w-[88%] rounded-2xl border px-3.5 py-2.5 shadow-sm transition ${
          isUser
            ? "rounded-br-xs border-[#214a69] bg-[#0d2a3c] text-[#dfeaf5]"
            : "rounded-bl-xs border-[#1d374d] bg-[#091a29]/95 text-[#dfeaf5]"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#dfeaf5]">{message}</p>
        ) : (
          <MarkdownRenderer content={message} />
        )}
      </div>

      {/* Message Metadata / Timestamp & Copy Button */}
      <div className={`flex items-center gap-2 text-[10px] text-[#6b8395] px-1 ${isUser ? "justify-end" : "justify-start"}`}>
        {timestamp && <span>{formatTime(timestamp)}</span>}
        {!isUser && (
          <>
            {provider && (
              <span className="rounded bg-[#0c2333] px-1.5 py-0.2 font-mono text-[9px] uppercase tracking-wider text-[#7dd3fc] border border-[#1b3b52]">
                {provider === "gemini" ? `Gemini AI (${model || "3.5-flash"})` : `Fallback Engine`}
              </span>
            )}
            <button
              type="button"
              onClick={handleCopyMessage}
              className="rounded px-1.5 py-0.5 text-[9px] font-medium text-[#7fa7c0] hover:bg-[#122e44] hover:text-[#7dd3fc]"
              title="Copy response text"
            >
              {copied ? "✓ Copied" : "📋 Copy"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function formatTime(isoString) {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return "";
  }
}
