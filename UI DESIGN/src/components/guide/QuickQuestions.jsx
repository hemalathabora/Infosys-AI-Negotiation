export default function QuickQuestions({ questions = [], onSelect }) {
  return (
    <div className="space-y-2">
      {questions.map((question) => (
        <button
          key={question}
          type="button"
          onClick={() => onSelect(question)}
          className="w-full rounded-xl border border-[#1d374d] bg-[#0b1d2c] px-3 py-2 text-left text-sm text-[#dfeaf5] transition hover:border-[#4dd0ff]/70 hover:bg-[#112d3d]"
        >
          {question}
        </button>
      ))}
    </div>
  );
}
