// Designed by TEAM 4 - Integrated with FastAPI Python Backend

import { useCallback, useState } from "react";
import { Orchestrator } from "../engine/orchestrator.js";
import {
  buildConcessionTimeline,
  totalConcessionByAgent,
} from "../engine/concessionTracking.js";
import { NEGOTIATION_STATUS } from "../types/negotiation.js";
import {
  createNegotiationSession,
  stepBackendNegotiation,
  runBackendNegotiationToCompletion
} from "../services/api.js";

export function useNegotiationEngine() {
  const [orchestrator, setOrchestrator] = useState(null);
  const [backendSessionId, setBackendSessionId] = useState(null);
  const [state, setState] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  /* ============================================================
     START NEGOTIATION
  ============================================================ */

  const start = useCallback(async (scenario) => {
    if (!scenario) {
      console.error("Cannot start negotiation: scenario is missing.");
      return;
    }

    try {
      // 1. Try starting backend session first
      try {
        const backendRes = await createNegotiationSession(scenario);
        if (backendRes && backendRes.negotiation_id) {
          setBackendSessionId(backendRes.negotiation_id);
          setState(backendRes);
          setHasStarted(true);
          setIsRunning(false);
          console.log("Backend negotiation started successfully:", backendRes);
          return;
        }
      } catch (backendError) {
        console.warn("Backend API unavailable, falling back to local JS Orchestrator:", backendError.message);
      }

      // 2. Fallback to local JS Orchestrator
      const orch = new Orchestrator(scenario);
      const initialState = orch.getState();

      setOrchestrator(orch);
      setState(initialState);
      setHasStarted(true);
      setIsRunning(false);

      console.log("Local JS negotiation started.");
    } catch (error) {
      console.error("Failed to start negotiation:", error);
      setOrchestrator(null);
      setBackendSessionId(null);
      setState(null);
      setHasStarted(false);
      setIsRunning(false);
    }
  }, []);

  /* ============================================================
     STEP ONE AGENT TURN
  ============================================================ */

  const step = useCallback(async () => {
    if (backendSessionId) {
      try {
        const turnRes = await stepBackendNegotiation(backendSessionId);
        if (turnRes && turnRes.state) {
          setState({ ...turnRes.state });
          return;
        }
      } catch (err) {
        console.error("Backend step turn failed:", err);
      }
    }

    if (!orchestrator) {
      console.warn("Cannot perform step: negotiation has not started.");
      return;
    }

    try {
      const nextState = await orchestrator.step();
      setState({ ...nextState });
    } catch (error) {
      console.error("Negotiation step failed:", error);
    }
  }, [backendSessionId, orchestrator]);

  /* ============================================================
     CHECK TERMINAL STATUS
  ============================================================ */

  const isTerminalStatus = useCallback((negotiationState) => {
    if (!negotiationState) return false;
    const s = String(negotiationState.status).toLowerCase();
    return (
      s === NEGOTIATION_STATUS.AGREEMENT ||
      s === NEGOTIATION_STATUS.REJECTED ||
      s === NEGOTIATION_STATUS.DEADLOCK ||
      s === NEGOTIATION_STATUS.COMPLETED ||
      s === "accepted" ||
      s === "completed"
    );
  }, []);

  /* ============================================================
     RUN TO COMPLETION
  ============================================================ */

  const runToCompletion = useCallback(async () => {
    if (backendSessionId) {
      setIsRunning(true);
      try {
        const finalState = await runBackendNegotiationToCompletion(backendSessionId);
        if (finalState) {
          setState({ ...finalState });
        }
      } catch (err) {
        console.error("Backend run to completion failed:", err);
      } finally {
        setIsRunning(false);
      }
      return;
    }

    if (!orchestrator) {
      console.warn("Cannot run negotiation: negotiation has not started.");
      return;
    }

    setIsRunning(true);
    try {
      while (true) {
        const currentState = orchestrator.getState();
        if (isTerminalStatus(currentState)) break;

        const nextState = await orchestrator.step();
        setState({ ...nextState });

        if (isTerminalStatus(nextState)) break;
        await new Promise((resolve) => setTimeout(resolve, 220));
      }
    } catch (error) {
      console.error("Negotiation execution failed:", error);
    } finally {
      setIsRunning(false);
    }
  }, [backendSessionId, orchestrator, isTerminalStatus]);

  /* ============================================================
     RESET NEGOTIATION
  ============================================================ */

  const reset = useCallback(() => {
    setOrchestrator(null);
    setBackendSessionId(null);
    setState(null);
    setHasStarted(false);
    setIsRunning(false);
  }, []);

  /* ============================================================
     CONCESSION TRACKING
  ============================================================ */

  const timeline = state ? buildConcessionTimeline(state.history || []) : {};
  const concessionTotals = state ? totalConcessionByAgent(timeline) : {};

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