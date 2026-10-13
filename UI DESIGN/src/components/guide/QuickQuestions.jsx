export default function QuickQuestions({ questions = [], onSelect }) {
  if (!questions || questions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {questions.map((question) => (
        <button
          key={question}
          type="button"
          onClick={() => onSelect(question)}
          className="rounded-lg border border-[#1d374d] bg-[#0b1d2c] px-2.5 py-1 text-xs text-[#bfe7ff] transition hover:border-[#38bdf8] hover:bg-[#112d42] hover:text-[#ffffff]"
        >
          💡 {question}
        </button>
      ))}
    </div>
  );
}
