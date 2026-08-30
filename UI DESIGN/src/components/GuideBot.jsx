import { useMemo } from "react";
import GuideBotButton from "./guide/GuideBotButton.jsx";
import GuideChatPanel from "./guide/GuideChatPanel.jsx";
import GuidedTour from "./guide/GuidedTour.jsx";
import { getNavigationSuggestion } from "../services/guideBotService.js";
import { useGuideBot } from "../hooks/useGuideBot.js";
import { useGuidedTour } from "../hooks/useGuidedTour.js";

export default function GuideBot({ currentPage = "Dashboard" }) {
  const { isOpen, setIsOpen, messages, input, setInput, submitPrompt, quickQuestions } = useGuideBot(currentPage);
  const { isTourActive, currentStep, stepIndex, totalSteps, highlightStyle, startTour, nextStep, prevStep, skipTour, closeTour } = useGuidedTour(currentPage);

  const suggestions = useMemo(
    () => getNavigationSuggestion(currentPage),
    [currentPage]
  );

  const handleQuickQuestion = (question) => {
    setInput(question);
    submitPrompt(question);
  };

  return (
    <>
      <GuideBotButton onClick={() => setIsOpen(true)} />

      <GuideChatPanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        messages={messages}
        input={input}
        onInputChange={setInput}
        onSubmit={() => submitPrompt(input)}
        quickQuestions={quickQuestions}
        suggestions={suggestions}
        onQuickQuestion={handleQuickQuestion}
      />

      <GuidedTour
        isActive={isTourActive}
        step={currentStep}
        stepIndex={stepIndex}
        totalSteps={totalSteps}
        highlightStyle={highlightStyle}
        onNext={() => {
          if (stepIndex === totalSteps - 1) {
            closeTour();
            return;
          }
          nextStep();
        }}
        onPrev={prevStep}
        onSkip={skipTour}
        onClose={closeTour}
      />

      <div className="fixed bottom-5 right-32 z-40 hidden md:flex">
        <button
          type="button"
          onClick={startTour}
          className="rounded-full border border-[#214a69] bg-[#0a1a2a]/80 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#dfeaf5] shadow-[0_0_20px_rgba(56,189,248,0.12)] hover:border-[#4dd0ff]/70"
        >
          Start Guided Tour
        </button>
      </div>
    </>
  );
}
