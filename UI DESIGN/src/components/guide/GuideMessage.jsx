export default function GuideMessage({ message, isUser = false }) {
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl border px-3 py-2 text-sm leading-relaxed whitespace-pre-line ${
          isUser
            ? "border-[#214a69] bg-[#0d2a3c] text-[#dfeaf5]"
            : "border-[#1d374d] bg-[#0b1d2c] text-[#dfeaf5]"
        }`}
      >
        {message}
      </div>
    </div>
  );
}
