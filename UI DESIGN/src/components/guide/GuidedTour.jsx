export default function GuidedTour({
  isActive,
  step,
  stepIndex,
  totalSteps,
  highlightStyle,
  onNext,
  onPrev,
  onSkip,
  onClose,
}) {
  if (!isActive || !step) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-[#020812]/70" />

      {highlightStyle && (
        <div
          className="fixed z-50 rounded-2xl border-2 border-[#7dd3fc] bg-transparent shadow-[0_0_0_9999px_rgba(2,8,18,0.72)]"
          style={{
            top: highlightStyle.top,
            left: highlightStyle.left,
            width: highlightStyle.width,
            height: highlightStyle.height,
          }}
        />
      )}

      <div className="fixed inset-x-0 bottom-6 z-[60] mx-auto w-[min(420px,calc(100vw-24px))] rounded-2xl border border-[#214a69] bg-[#09141f]/95 p-4 shadow-[0_0_35px_rgba(56,189,248,0.15)] backdrop-blur-md">
        <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-[#7fa7c0]">
          <button type="button" onClick={onClose} className="hover:text-[#dfeaf5]">Exit</button>
          <span>
            Step {stepIndex + 1} of {totalSteps}
          </span>
          <button type="button" onClick={onSkip} className="hover:text-[#dfeaf5]">Skip Tour</button>
        </div>

        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#4dd0ff]/60 bg-[#112d3d] text-[#7dd3fc]">
            ✦
          </div>
          <div>
            <div className="text-lg font-bold text-[#dfeaf5]">{step.title}</div>
            <div className="text-xs uppercase tracking-[0.15em] text-[#7fa7c0]">Platform walkthrough</div>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-[#dfeaf5]">{step.message}</p>

        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onPrev}
            disabled={stepIndex === 0}
            className="rounded-xl border border-[#1d374d] bg-[#0d1d2e] px-3 py-2 text-sm text-[#dfeaf5] disabled:cursor-not-allowed disabled:opacity-40"
          >
            ← Back
          </button>

          <button
            type="button"
            onClick={onNext}
            className="rounded-xl border border-[#4dd0ff]/70 bg-[#10293d] px-3 py-2 text-sm font-semibold text-[#dfeaf5]"
          >
            {stepIndex === totalSteps - 1 ? "Finish" : "Next →"}
          </button>
        </div>
      </div>
    </>
  );
}
