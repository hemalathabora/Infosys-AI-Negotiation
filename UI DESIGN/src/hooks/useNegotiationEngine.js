// Designed by TEAM 4
import { useCallback, useState } from "react";
import { Orchestrator } from "../engine/orchestrator.js";
import { buildConcessionTimeline, totalConcessionByAgent } from "../engine/concessionTracking.js";
import { NEGOTIATION_STATUS } from "../types/negotiation.js";

/**
 * Bridges Agent Configuration to the negotiation engine. This is the
 * "Connect the Existing UI" deliverable: Scenario Selection â†’ Agent
 * Configuration â†’ Negotiation State Created â†’ turn-by-turn offers â†’
 * decision â†’ next round, all driven from here.
 *
 * The Orchestrator instance is intentionally NOT exposed directly â€”
 * only plain state + actions, so the UI never needs to know it's backed
 * by a class.
 */
export function useNegotiationEngine() {
  const [orchestrator, setOrchestrator] = useState(null);
  const [state, setState] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const start = useCallback((scenario) => {
    const orch = new Orchestrator(scenario);
    setOrchestrator(orch);
    setState(orch.getState());
  }, []);

  const step = useCallback(() => {
    if (!orchestrator) return;
    setState(orchestrator.step());
  }, [orchestrator]);

  const runToCompletion = useCallback(async () => {
    if (!orchestrator) return;
    setIsRunning(true);
// Implemented by TEAM 4
    // Small artificial delay per round so the transcript feels like a
    // live session rather than an instant dump â€” purely presentational.
    while (
      orchestrator.getState().status !== NEGOTIATION_STATUS.AGREEMENT &&
      orchestrator.getState().status !== NEGOTIATION_STATUS.DEADLOCK &&
      orchestrator.getState().current_round < 20
    ) {
      orchestrator.step();
      setState({ ...orchestrator.getState() });
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => setTimeout(resolve, 220));
    }
    setIsRunning(false);
  }, [orchestrator]);

  const reset = useCallback(() => {
    setOrchestrator(null);
    setState(null);
  }, []);

  const timeline = state ? buildConcessionTimeline(state.history) : {};
  const concessionTotals = state ? totalConcessionByAgent(timeline) : {};

  return {
    state,
    isRunning,
    hasStarted: Boolean(state),
    timeline,
    concessionTotals,
    start,
    step,
    runToCompletion,
    reset,
  };
}
// Designed by TEAM 4
// Designed by TEAM 4

