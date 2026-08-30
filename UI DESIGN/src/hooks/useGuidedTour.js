import { useEffect, useMemo, useState } from "react";
import { guideTourSteps } from "../data/guideKnowledgeBase.js";

const STORAGE_KEY = "negotiation-guide-tour";

export function useGuidedTour(currentPage = "Dashboard") {
  const [isTourActive, setIsTourActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [highlightStyle, setHighlightStyle] = useState(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") || {};
    if (typeof stored.completed === "boolean") {
      // Intentionally leaves the tour available to start again if the user chooses.
    }
  }, []);

  const steps = useMemo(() => guideTourSteps, []);
  const currentStep = steps[stepIndex] ?? steps[0];

  useEffect(() => {
    if (!isTourActive || !currentStep?.selector) return;

    const element = document.querySelector(currentStep.selector);

    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });

      const bounds = element.getBoundingClientRect();
      setHighlightStyle({
        top: Math.max(bounds.top - 8, 12),
        left: Math.max(bounds.left - 10, 12),
        width: Math.min(bounds.width + 20, window.innerWidth - 24),
        height: Math.min(bounds.height + 20, window.innerHeight - 24),
      });
    }
  }, [currentStep, isTourActive]);

  const startTour = () => {
    setStepIndex(0);
    setIsTourActive(true);
  };

  const nextStep = () => {
    if (stepIndex < steps.length - 1) {
      setStepIndex((prev) => prev + 1);
      return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify({ completed: true }));
    setIsTourActive(false);
    setStepIndex(0);
  };

  const prevStep = () => {
    if (stepIndex > 0) {
      setStepIndex((prev) => prev - 1);
    }
  };

  const skipTour = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ completed: true }));
    setIsTourActive(false);
    setStepIndex(0);
  };

  const closeTour = () => {
    setIsTourActive(false);
    setStepIndex(0);
  };

  return {
    isTourActive,
    currentStep,
    stepIndex,
    totalSteps: steps.length,
    highlightStyle,
    startTour,
    nextStep,
    prevStep,
    skipTour,
    closeTour,
    currentPage,
  };
}
