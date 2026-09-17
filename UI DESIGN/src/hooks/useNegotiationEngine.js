// Designed by TEAM 4 - Integrated with FastAPI Python Backend

import { useCallback, useState } from "react";
import { Orchestrator } from "../engine/orchestrator.js";
import {
  buildConcessionTimeline,
  totalConcessionByAgent,
  calculateConcession,
  getAgentPreviousPosition,
  getAgentInitialPosition,
} from "../engine/concessionTracking.js";
import { createOffer } from "../engine/offer.js";
import { applyOffer } from "../engine/negotiationState.js";
import { NEGOTIATION_STATUS } from "../types/negotiation.js";
import {
  createNegotiationSession,
  stepBackendNegotiation,
  submitPracticeTurn
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

  const start = useCallback(async (scenario, mode = "simulation", humanRole = null) => {
    if (!scenario) {
      console.error("Cannot start negotiation: scenario is missing.");
      return;
    }

    // Establish a fresh engine boundary before any async session request.
    // This prevents a prior backend ID or local orchestrator from handling
    // turns if a user starts a new negotiation without visiting Reset first.
    setOrchestrator(null);
    setBackendSessionId(null);
    setState(null);
    setHasStarted(false);
    setIsRunning(false);

    try {
      // Determine active engine mode from backend settings
      let engineMode = "Normal Mode";
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 600);
        const modeRes = await fetch("http://localhost:8000/api/settings/mode", { signal: controller.signal });
        clearTimeout(timeoutId);
        if (modeRes.ok) {
          const modeData = await modeRes.json();
          engineMode = modeData.is_llm_active ? "LLM Mode" : "Normal Mode";
        }
      } catch {
        engineMode = "Normal Mode";
      }

      // 1. Try starting backend session first
      try {
        const backendRes = await createNegotiationSession(scenario, mode, humanRole);
        if (backendRes && backendRes.negotiation_id) {
          setBackendSessionId(backendRes.negotiation_id);
          setState({ ...backendRes, execution_mode: backendRes.execution_mode || engineMode });
          setHasStarted(true);
          setIsRunning(false);
          console.log("Backend negotiation started successfully:", backendRes);
          return;
        }
      } catch (backendError) {
        console.warn("Backend API unavailable, falling back to local JS Orchestrator:", backendError.message);
      }

      // 2. Fallback to local JS Orchestrator (Normal Mode)
      const orch = new Orchestrator(scenario, mode, humanRole);
      const initialState = orch.getState();

      setOrchestrator(orch);
      setState({ ...initialState, mode: mode, human_role: humanRole, execution_mode: "Normal Mode" });
      setHasStarted(true);
      setIsRunning(false);

      console.log("Local JS negotiation started in Normal Mode.");
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
     SUBMIT HUMAN PRACTICE TURN
  ============================================================ */

  const submitHumanTurn = useCallback(async (offer, message = "", decision = "counter") => {
    if (!backendSessionId && !orchestrator) {
      console.warn("Negotiation session not active for practice turn.");
      return;
    }

    const submittedPrice = Number(offer?.price ?? offer?.value);
    if (!Number.isFinite(submittedPrice) || submittedPrice <= 0) {
      throw new Error("Offer value must be a finite number greater than 0.");
    }

    setIsRunning(true);
    try {
      if (backendSessionId) {
        const updatedState = await submitPracticeTurn(backendSessionId, offer, message, decision);
        if (updatedState) {
          setState((prev) => ({
            ...updatedState,
            execution_mode: updatedState.execution_mode || prev?.execution_mode || "Normal Mode",
          }));
        }
      } else if (orchestrator) {
        const currentState = orchestrator.getState();
        const currentAgentId = currentState.current_agent_turn;
        const round = orchestrator.getRoundForCurrentTurn(currentAgentId);

        const priceVal = submittedPrice;
        const agentObj = orchestrator.scenario.agents.find((a) => a.id === currentAgentId) || { id: currentAgentId, role: "Human Negotiator" };

        const prevPos = getAgentPreviousPosition(currentState.history || [], currentAgentId);
        const initPos = getAgentInitialPosition(currentState.history || [], currentAgentId);
        const concession_data = calculateConcession(
          agentObj,
          prevPos,
          priceVal,
          { current_round: round, history: currentState.history || [] },
          initPos
        );

        const offerObj = createOffer({
          agent_id: currentAgentId,
          round,
          value: priceVal,
          reason: message || `Human submitted offer of $${priceVal}.`,
          decision: decision,
          parameters: {
            terms: offer?.terms || {},
            concession_data,
            is_human: true,
          },
        });

        const nextAgent = orchestrator.getNextAgent(currentAgentId);
        const nextStatus = decision === "accept"
          ? NEGOTIATION_STATUS.AGREEMENT
          : decision === "reject"
          ? NEGOTIATION_STATUS.REJECTED
          : NEGOTIATION_STATUS.IN_PROGRESS;

        const updatedState = applyOffer(orchestrator.state, offerObj, nextAgent, nextStatus);
        orchestrator.updateState(updatedState);
        setState((prev) => ({
          ...updatedState,
          execution_mode: prev?.execution_mode || "Normal Mode",
        }));

        if (nextStatus === NEGOTIATION_STATUS.IN_PROGRESS && nextAgent) {
          await new Promise((res) => setTimeout(res, 50));
          const aiState = await orchestrator.step();
          setState((prev) => ({
            ...aiState,
            execution_mode: prev?.execution_mode || "Normal Mode",
          }));
        }
      }
    } catch (err) {
      console.error("Practice turn submission failed:", err);
      throw err;
    } finally {
      setIsRunning(false);
    }
  }, [backendSessionId, orchestrator]);

  /* ============================================================
     STEP ONE AGENT TURN
  ============================================================ */

  const step = useCallback(async () => {
    if (backendSessionId) {
      try {
        const turnRes = await stepBackendNegotiation(backendSessionId);
        if (turnRes && turnRes.state) {
          setState((prev) => ({
            ...turnRes.state,
            execution_mode: turnRes.state.execution_mode || prev?.execution_mode || "Normal Mode",
          }));
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
      setState((prev) => ({
        ...nextState,
        execution_mode: prev?.execution_mode || "Normal Mode",
      }));
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
      s === "breakdown" ||
      s === NEGOTIATION_STATUS.COMPLETED ||
      s === "accepted" ||
      s === "completed"
    );
  }, []);

  /* ============================================================
     RUN TO COMPLETION
  ============================================================ */

  const runToCompletion = useCallback(async () => {
    if (!backendSessionId && !orchestrator) {
      console.warn("Cannot run negotiation: negotiation has not started.");
      return;
    }

    setIsRunning(true);
    try {
      if (backendSessionId) {
        let currentBackendState = state;
        while (true) {
          if (isTerminalStatus(currentBackendState)) break;

          const turnRes = await stepBackendNegotiation(backendSessionId);
          if (turnRes && turnRes.state) {
            currentBackendState = turnRes.state;
            setState((prev) => ({
              ...turnRes.state,
              mode: turnRes.state.mode || prev?.mode || "Normal Mode",
            }));
            if (isTerminalStatus(turnRes.state)) break;
          } else {
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, 2200));
        }
      } else if (orchestrator) {
        while (true) {
          const currentState = orchestrator.getState();
          if (isTerminalStatus(currentState)) break;

          const nextState = await orchestrator.step();
          setState((prev) => ({
            ...nextState,
            mode: prev?.mode || "Normal Mode",
          }));

          if (isTerminalStatus(nextState)) break;
          await new Promise((resolve) => setTimeout(resolve, 2200));
        }
      }
    } catch (error) {
      console.error("Negotiation execution failed:", error);
    } finally {
      setIsRunning(false);
    }
  }, [backendSessionId, orchestrator, state, isTerminalStatus]);

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
    submitHumanTurn,
    runToCompletion,
    reset,
  };
}