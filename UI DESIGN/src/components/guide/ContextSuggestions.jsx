export default function ContextSuggestions({ suggestions = [] }) {
  if (!suggestions.length) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion}
          type="button"
          className="rounded-full border border-[#214a69] bg-[#10293d] px-2.5 py-1.5 text-[11px] font-medium text-[#dfeaf5] transition hover:border-[#4dd0ff]/80 hover:text-[#7dd3fc]"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}
