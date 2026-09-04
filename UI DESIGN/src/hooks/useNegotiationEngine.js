// Designed by TEAM 4

import { useCallback, useState } from "react";

import { Orchestrator } from "../engine/orchestrator.js";

import {
  buildConcessionTimeline,
  totalConcessionByAgent,
} from "../engine/concessionTracking.js";

import { NEGOTIATION_STATUS } from "../types/negotiation.js";

/*
 * Connects Agent Configuration with the Negotiation Engine.
 *
 * Flow:
 *
 * Scenario Selection
 *       |
 *       v
 * Agent Configuration
 *       |
 *       v
 * Start Negotiation
 *       |
 *       v
 * Negotiation State
 *       |
 *       v
 * Turn-by-turn Offers
 *       |
 *       v
 * Accept / Reject / Counteroffer
 *       |
 *       v
 * Agreement / Rejected / Deadlock
 */

export function useNegotiationEngine() {
  const [orchestrator, setOrchestrator] = useState(null);

  const [state, setState] = useState(null);

  const [isRunning, setIsRunning] = useState(false);

  const [hasStarted, setHasStarted] = useState(false);

  /* ============================================================
     START NEGOTIATION
  ============================================================ */

  const start = useCallback((scenario) => {
    if (!scenario) {
      console.error(
        "Cannot start negotiation: scenario is missing.",
      );
      return;
    }

    try {
      const orch = new Orchestrator(scenario);

      const initialState = orch.getState();

      setOrchestrator(orch);
      setState(initialState);
      setHasStarted(true);
      setIsRunning(false);

      console.log("Negotiation started.");
      console.log("Initial state:", initialState);
    } catch (error) {
      console.error(
        "Failed to start negotiation:",
        error,
      );

      setOrchestrator(null);
      setState(null);
      setHasStarted(false);
      setIsRunning(false);
    }
  }, []);

  /* ============================================================
     STEP ONE AGENT TURN
  ============================================================ */

  const step = useCallback(() => {
    if (!orchestrator) {
      console.warn(
        "Cannot perform step: negotiation has not started.",
      );
      return;
    }

    try {
      const nextState = orchestrator.step();

      setState({
        ...nextState,
      });
    } catch (error) {
      console.error(
        "Negotiation step failed:",
        error,
      );
    }
  }, [orchestrator]);

  /* ============================================================
     CHECK TERMINAL STATUS
  ============================================================ */

  const isTerminalStatus = useCallback(
    (negotiationState) => {
      if (!negotiationState) {
        return false;
      }

      return (
        negotiationState.status ===
          NEGOTIATION_STATUS.AGREEMENT ||
        negotiationState.status ===
          NEGOTIATION_STATUS.REJECTED ||
        negotiationState.status ===
          NEGOTIATION_STATUS.DEADLOCK ||
        negotiationState.status ===
          NEGOTIATION_STATUS.COMPLETED
      );
    },
    [],
  );

  /* ============================================================
     RUN TO COMPLETION
  ============================================================ */

  const runToCompletion = useCallback(async () => {
    if (!orchestrator) {
      console.warn(
        "Cannot run negotiation: negotiation has not started.",
      );
      return;
    }

    setIsRunning(true);

    try {
      while (true) {
        const currentState =
          orchestrator.getState();

        /*
         * Stop if negotiation has already reached
         * a terminal state.
         */
        if (isTerminalStatus(currentState)) {
          break;
        }

        /*
         * Perform exactly ONE agent turn.
         *
         * The Orchestrator controls:
         * - current agent
         * - current round
         * - offer
         * - decision
         * - next agent
         * - final status
         */
        const nextState =
          orchestrator.step();

        setState({
          ...nextState,
        });

        /*
         * Stop immediately after the latest step
         * reaches a terminal state.
         */
        if (isTerminalStatus(nextState)) {
          break;
        }

        /*
         * Small delay so the negotiation looks
         * like a live turn-by-turn simulation.
         */
        await new Promise((resolve) =>
          setTimeout(resolve, 220),
        );
      }
    } catch (error) {
      console.error(
        "Negotiation execution failed:",
        error,
      );
    } finally {
      setIsRunning(false);
    }
  }, [orchestrator, isTerminalStatus]);

  /* ============================================================
     RESET NEGOTIATION
  ============================================================ */

  const reset = useCallback(() => {
    setOrchestrator(null);
    setState(null);
    setHasStarted(false);
    setIsRunning(false);
  }, []);

  /* ============================================================
     CONCESSION TRACKING
  ============================================================ */

  const timeline = state
    ? buildConcessionTimeline(
        state.history || [],
      )
    : {};

  const concessionTotals = state
    ? totalConcessionByAgent(timeline)
    : {};

  /* ============================================================
     RETURN API
  ============================================================ */

  return {
    state,

    isRunning,

    hasStarted,

    timeline,

    concessionTotals,

    start,

    step,

    runToCompletion,

    reset,
  };
}

// Designed by TEAM 4