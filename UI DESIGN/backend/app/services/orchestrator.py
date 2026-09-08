import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, Tuple
from app.services.llm_reasoning import generate_agent_response, extract_offer_price

logger = logging.getLogger("negotiation_engine")

class NegotiationOrchestrator:
    def __init__(
        self,
        negotiation_id: str,
        scenario_id: str,
        agents: List[Dict[str, Any]],
        max_rounds: int = 8,
        current_round: int = 0,
        current_agent_turn: Optional[str] = None,
        status: str = "active",
        current_offer: Optional[Dict[str, Any]] = None,
        previous_offer: Optional[Dict[str, Any]] = None,
        history: Optional[List[Dict[str, Any]]] = None
    ):
        self.negotiation_id = negotiation_id
        self.scenario_id = scenario_id
        self.agents = agents
        self.agent_map = {a["id"]: a for a in agents}
        self.agent_order = [a["id"] for a in agents]
        self.max_rounds = max_rounds
        self.current_round = current_round
        self.current_agent_turn = current_agent_turn or (self.agent_order[0] if self.agent_order else None)
        self.status = status
        self.current_offer = current_offer
        self.previous_offer = previous_offer
        self.history = history or []

    def get_current_agent(self) -> Optional[Dict[str, Any]]:
        if not self.current_agent_turn:
            return None
        return self.agent_map.get(self.current_agent_turn)

    def switch_turn(self) -> Optional[str]:
        if not self.current_agent_turn or len(self.agent_order) < 2:
            return None
        idx = self.agent_order.index(self.current_agent_turn)
        next_idx = (idx + 1) % len(self.agent_order)
        return self.agent_order[next_idx]

    def check_termination(self, decision: str) -> Tuple[bool, str]:
        """
        Requirement 8: Check termination rules.
        """
        if decision == "accept":
            return True, "accepted"
        if decision == "reject":
            return True, "rejected"
        if self.current_round >= self.max_rounds:
            return True, "completed"
        return False, "active"

    async def run_turn(self) -> Dict[str, Any]:
        """
        Executes one turn of negotiation according to the Orchestrator flow.
        """
        if self.status in ["accepted", "agreement", "rejected", "completed", "deadlock", "cancelled"]:
            logger.info(f"Negotiation {self.negotiation_id} is already in terminal state '{self.status}'. No turn run.")
            return self.get_state_dict()

        # Step 1: Get Current Agent
        agent = self.get_current_agent()
        if not agent:
            raise ValueError(f"No active agent turn found for negotiation {self.negotiation_id}")

        agent_id = agent["id"]

        # Determine round
        if self.current_round == 0 or agent_id == self.agent_order[0]:
            self.current_round += 1

        # Check round limit before turn
        if self.current_round > self.max_rounds:
            self.status = "completed"
            self.current_agent_turn = None
            return self.get_state_dict()

        # Load state & context
        state_context = {
            "negotiation_id": self.negotiation_id,
            "current_round": self.current_round,
            "max_rounds": self.max_rounds,
            "status": self.status
        }
        history_context = list(self.history)
        opponent_offer = self.current_offer

        # Step 6: Generate Agent Response via LLM Engine
        llm_response = await generate_agent_response(
            agent_profile=agent,
            negotiation_state=state_context,
            conversation_history=history_context,
            opponent_offer=opponent_offer
        )

        decision = llm_response.decision
        offer_val = llm_response.offer
        reasoning = llm_response.reasoning
        params = llm_response.parameters or {}

        # Format proposed offer dictionary
        price_scalar = extract_offer_price(offer_val)
        if hasattr(offer_val, "model_dump"):
            proposed_offer = offer_val.model_dump(exclude_none=True)
        elif isinstance(offer_val, dict):
            proposed_offer = offer_val
        elif price_scalar is not None:
            proposed_offer = {"price": price_scalar}
        else:
            proposed_offer = {"price": extract_offer_price(opponent_offer) or 0.0}

        # Step 9: Save History
        history_item = {
            "agent_id": agent_id,
            "round": self.current_round,
            "decision": decision,
            "proposed_offer": proposed_offer,
            "value": price_scalar if price_scalar is not None else extract_offer_price(proposed_offer),
            "reasoning": reasoning,
            "parameters": params,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        self.history.append(history_item)

        # Update previous and current offer
        self.previous_offer = self.current_offer
        self.current_offer = proposed_offer

        # Step 8: Termination check
        is_terminated, final_status = self.check_termination(decision)

        if is_terminated:
            self.status = final_status
            self.current_agent_turn = None
        else:
            self.status = "active"
            self.current_agent_turn = self.switch_turn()

        logger.info(
            f"Negotiation {self.negotiation_id} Turn Completed - Round: {self.current_round}, "
            f"Agent: {agent_id}, Decision: {decision}, New Status: {self.status}, Next Agent: {self.current_agent_turn}"
        )

        return {
            "turn_log": history_item,
            "state": self.get_state_dict()
        }

    async def run_to_completion(self) -> Dict[str, Any]:
        """Runs negotiation automatically until a terminal state is reached."""
        max_steps = self.max_rounds * len(self.agent_order)
        steps = 0
        while self.status in ["active", "in_progress"] and steps < max_steps:
            await self.run_turn()
            steps += 1
        
        if self.status in ["active", "in_progress"]:
            self.status = "completed"
            self.current_agent_turn = None
            
        return self.get_state_dict()

    def get_state_dict(self) -> Dict[str, Any]:
        return {
            "negotiation_id": self.negotiation_id,
            "scenario_id": self.scenario_id,
            "current_round": self.current_round,
            "max_rounds": self.max_rounds,
            "current_agent_turn": self.current_agent_turn,
            "status": self.status,
            "previous_offer": self.previous_offer,
            "current_offer": self.current_offer,
            "participating_agents": self.agents,
            "history": self.history
        }
