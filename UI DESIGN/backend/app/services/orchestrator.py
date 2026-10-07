import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, Tuple
from app.services.llm_reasoning import generate_agent_response, extract_offer_price
from app.config import settings
from app.services.concession_tracking import (
    calculate_concession,
    get_agent_initial_position,
    get_agent_previous_position
)
from app.services.deadlock_detection import detect_deadlock, attempt_deadlock_resolution
from app.services.tradeoff_engine import (
    get_scenario_variables,
    calculate_utility,
    detect_tradeoffs,
    extract_normalized_offer_variables,
)
from app.services.practice_service import (
    calculate_ai_stance,
    generate_strategy_coaching,
    calculate_negotiation_scorecard,
)

logger = logging.getLogger("negotiation_engine")

class NegotiationOrchestrator:
    def __init__(
        self,
        negotiation_id: str,
        scenario_id: str,
        agents: List[Dict[str, Any]],
        max_rounds: int = 5,
        current_round: int = 0,
        current_agent_turn: Optional[str] = None,
        status: str = "active",
        mode: str = "simulation",  # "simulation" | "practice"
        human_role: Optional[str] = None,
        user_id: Optional[str] = None,
        difficulty: Optional[str] = "Intermediate",
        current_offer: Optional[Dict[str, Any]] = None,
        previous_offer: Optional[Dict[str, Any]] = None,
        history: Optional[List[Dict[str, Any]]] = None,
        deadlock_info: Optional[Dict[str, Any]] = None
    ):
        self.negotiation_id = negotiation_id
        self.scenario_id = scenario_id
        self.mode = mode
        self.human_role = human_role
        self.user_id = user_id
        self.difficulty = difficulty or "Intermediate"
        self.max_rounds = max_rounds
        self.current_round = current_round

        self.status = status
        self.current_offer = current_offer
        self.previous_offer = previous_offer
        self.history = history or []
        self.deadlock_info = deadlock_info or {}
        self.resolution_attempts = self.deadlock_info.get("resolution", {}).get("attempt_number", 0)

        # Set participant_type on agents
        self.agents = []
        for a in agents:
            agent_copy = dict(a)
            if mode == "practice" and human_role and agent_copy.get("role", "").lower() == human_role.lower():
                agent_copy["participant_type"] = "human"
            elif mode == "practice" and not human_role and a == agents[0]:
                agent_copy["participant_type"] = "human"
            else:
                agent_copy["participant_type"] = "ai"
            self.agents.append(agent_copy)

        self.agent_map = {a["id"]: a for a in self.agents}
        self.agent_order = [a["id"] for a in self.agents]
        self.current_agent_turn = current_agent_turn or (self.agent_order[0] if self.agent_order else None)

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
        if self.current_round >= self.max_rounds and self.current_agent_turn == self.agent_order[-1]:
            return True, "completed"
        return False, "active"

    async def run_turn(self) -> Dict[str, Any]:
        """
        Executes one turn of negotiation according to the Orchestrator flow.
        """
        if self.status in ["accepted", "agreement", "rejected", "completed", "deadlock", "breakdown", "cancelled"]:
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
            "scenario_id": self.scenario_id,
            "difficulty": getattr(self, "difficulty", "Intermediate"),
            "current_round": self.current_round,
            "max_rounds": self.max_rounds,
            "status": self.status,
            "history": self.history
        }
        history_context = list(self.history)
        opponent_offer = self.current_offer

        # Lookup agent's initial position and previous offer position from history
        init_pos = get_agent_initial_position(history_context, agent_id)
        prev_pos = get_agent_previous_position(history_context, agent_id)

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

        curr_scalar = price_scalar if price_scalar is not None else extract_offer_price(proposed_offer)

        # Calculate Concession Metrics
        concession_info = calculate_concession(
            agent_profile=agent,
            previous_offer=prev_pos,
            current_offer=curr_scalar,
            negotiation_state=state_context,
            initial_position=init_pos
        )

        params["concession_tracking"] = concession_info

        # Multi-variable utility and trade-off calculation
        vdefs = get_scenario_variables(self.scenario_id, agent.get("role"))
        tradeoff_info = detect_tradeoffs(agent, self.current_offer, proposed_offer, vdefs, self.scenario_id)
        utility_info = calculate_utility(agent, proposed_offer, vdefs, self.scenario_id)

        # Step 9: Save History with dynamic agent round number
        agent_round = sum(1 for h in self.history if h.get("agent_id") == agent_id) + 1
        self.current_round = max(self.current_round, agent_round)

        history_item = {
            "agent_id": agent_id,
            "round": agent_round,
            "decision": decision,
            "proposed_offer": proposed_offer,
            "value": curr_scalar,
            "reasoning": reasoning,
            "parameters": params,
            "concession_data": concession_info,
            "tradeoff_data": tradeoff_info.model_dump(),
            "utility_data": utility_info.model_dump(),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        self.history.append(history_item)

        # Update previous and current offer
        self.previous_offer = self.current_offer
        self.current_offer = proposed_offer

        # Step 8: Termination & Deadlock check
        is_terminated, final_status = self.check_termination(decision)

        if is_terminated:
            self.status = final_status
            self.current_agent_turn = None
        else:
            # Check Deadlock Status
            d_eval = detect_deadlock(
                negotiation_state=self.get_state_dict(),
                history=self.history,
                agents=self.agents,
                scenario_id=self.scenario_id,
                max_rounds=self.max_rounds
            )

            if d_eval["is_deadlock"]:
                logger.info(f"DEADLOCK_DETECTED - Reason: {d_eval['reason']}")

                # Case A: Infeasible deadlock or max rounds reached or explicit breakdown requested
                if not d_eval["resolution_possible"] or d_eval["suggested_action"] == "declare_breakdown" or self.current_round >= self.max_rounds or self.resolution_attempts >= 1:
                    self.status = "breakdown" if not d_eval["resolution_possible"] else "deadlock"
                    self.deadlock_info = {
                        **d_eval,
                        "resolution": {
                            "attempted": self.resolution_attempts > 0,
                            "feasible": d_eval["resolution_possible"],
                            "result": "breakdown",
                            "reason": d_eval["reason"]
                        }
                    }
                    logger.info(f"NEGOTIATION_BREAKDOWN - Final status: {self.status}, Reason: {d_eval['reason']}")
                    self.current_agent_turn = None

                # Case B: Feasible deadlock and resolution attempt allowed
                elif d_eval["suggested_action"] == "attempt_resolution" and self.resolution_attempts < 1:
                    self.resolution_attempts += 1
                    logger.info(f"RESOLUTION_STARTED - Attempt #{self.resolution_attempts}")

                    res_success, proposal, exp, meta = attempt_deadlock_resolution(
                        agents=self.agents,
                        history=self.history,
                        current_offer=self.current_offer,
                        scenario_id=self.scenario_id,
                        proposer_agent=agent
                    )

                    # Step 7: Validate Resolution Offer
                    proposal_price = extract_offer_price(proposal) if proposal else None
                    lower_bound = meta.get("lower_bound")
                    upper_bound = meta.get("upper_bound")

                    is_valid_proposal = (
                        res_success and 
                        proposal is not None and 
                        proposal_price is not None and 
                        (lower_bound is None or proposal_price >= lower_bound) and 
                        (upper_bound is None or proposal_price <= upper_bound)
                    )

                    if not is_valid_proposal:
                        logger.info(f"RESOLUTION_FAILED - Invalid proposal generated or bounds exceeded.")
                        self.status = "breakdown"
                        self.deadlock_info = {
                            **d_eval,
                            "resolution": {
                                "attempted": True,
                                "feasible": True,
                                "result": "failed",
                                "reason": meta.get("reason", "Resolution proposal failed validation against constraints.")
                            }
                        }
                        self.current_agent_turn = None
                    else:
                        logger.info(f"RESOLUTION_PROPOSAL_GENERATED - Price: ${proposal_price:,.2f}")
                        logger.info(f"RESOLUTION_PROPOSAL_VALIDATED - Within bounds [${lower_bound} - ${upper_bound}]")

                        # Step 6 & Step 13: Make Resolution Proposal a REAL Offer & Track Concession
                        opponent_id = self.switch_turn()
                        opponent_agent = self.agent_map.get(opponent_id) if opponent_id else None

                        init_pos_res = get_agent_initial_position(self.history, agent_id)
                        prev_pos_res = get_agent_previous_position(self.history, agent_id)

                        concession_info_res = calculate_concession(
                            agent_profile=agent,
                            previous_offer=prev_pos_res,
                            current_offer=proposal_price,
                            negotiation_state=state_context,
                            initial_position=init_pos_res
                        )

                        # Step 8: Record in Negotiation History
                        res_round = sum(1 for h in self.history if h.get("agent_id") == agent_id) + 1
                        res_history_item = {
                            "agent_id": agent_id,
                            "round": res_round,
                            "decision": "counter",
                            "proposed_offer": proposal,
                            "value": proposal_price,
                            "reasoning": exp,
                            "parameters": {
                                "concession_tracking": concession_info_res,
                                "is_resolution_offer": True,
                                "resolution_attempt": self.resolution_attempts
                            },
                            "concession_data": concession_info_res,
                            "timestamp": datetime.now(timezone.utc).isoformat()
                        }
                        self.history.append(res_history_item)

                        # Step 9: Update Negotiation State
                        self.previous_offer = self.current_offer
                        self.current_offer = proposal
                        self.deadlock_info = {
                            **d_eval,
                            "resolution": {
                                "attempted": True,
                                "feasible": True,
                                "proposal": proposal,
                                "attempt_number": self.resolution_attempts,
                                "result": "pending_evaluation"
                            }
                        }

                        # Step 10: Evaluate Resolution Proposal by Opponent
                        if opponent_agent and opponent_agent.get("participant_type") == "ai":
                            opp_state_context = {
                                "negotiation_id": self.negotiation_id,
                                "current_round": self.current_round,
                                "max_rounds": self.max_rounds,
                                "status": "resolving",
                                "history": self.history
                            }
                            opp_response = await generate_agent_response(
                                agent_profile=opponent_agent,
                                negotiation_state=opp_state_context,
                                conversation_history=self.history,
                                opponent_offer=proposal
                            )

                            opp_decision = opp_response.decision
                            opp_offer_val = opp_response.offer
                            opp_reasoning = opp_response.reasoning
                            opp_params = opp_response.parameters or {}

                            opp_price_scalar = extract_offer_price(opp_offer_val)
                            if hasattr(opp_offer_val, "model_dump"):
                                opp_proposed_offer = opp_offer_val.model_dump(exclude_none=True)
                            elif isinstance(opp_offer_val, dict):
                                opp_proposed_offer = opp_offer_val
                            elif opp_price_scalar is not None:
                                opp_proposed_offer = {"price": opp_price_scalar}
                            else:
                                opp_proposed_offer = {"price": proposal_price}

                            opp_curr_scalar = opp_price_scalar if opp_price_scalar is not None else proposal_price

                            opp_init_pos = get_agent_initial_position(self.history, opponent_id)
                            opp_prev_pos = get_agent_previous_position(self.history, opponent_id)
                            opp_concession_info = calculate_concession(
                                agent_profile=opponent_agent,
                                previous_offer=opp_prev_pos,
                                current_offer=opp_curr_scalar,
                                negotiation_state=opp_state_context,
                                initial_position=opp_init_pos
                            )
                            opp_params["concession_tracking"] = opp_concession_info

                            opp_round = sum(1 for h in self.history if h.get("agent_id") == opponent_id) + 1
                            opp_history_item = {
                                "agent_id": opponent_id,
                                "round": opp_round,
                                "decision": opp_decision,
                                "proposed_offer": opp_proposed_offer,
                                "value": opp_curr_scalar,
                                "reasoning": opp_reasoning,
                                "parameters": opp_params,
                                "concession_data": opp_concession_info,
                                "timestamp": datetime.now(timezone.utc).isoformat()
                            }
                            self.history.append(opp_history_item)

                            if opp_decision == "accept":
                                logger.info("RESOLUTION_ACCEPTED - Opponent accepted resolution proposal.")
                                self.status = "accepted"
                                self.deadlock_info["resolution"]["result"] = "accepted"
                                self.current_agent_turn = None
                            elif opp_decision == "reject":
                                logger.info("RESOLUTION_REJECTED - Opponent rejected resolution proposal.")
                                self.status = "breakdown"
                                self.deadlock_info["resolution"]["result"] = "rejected"
                                self.current_agent_turn = None
                            else:  # counter
                                logger.info("RESOLUTION_COUNTERED - Maximum resolution attempts reached. Terminating as breakdown.")
                                self.status = "breakdown"
                                self.deadlock_info["resolution"]["result"] = "breakdown"
                                self.current_agent_turn = None
                        else:
                            # Practice Mode: Awaiting Human evaluation turn
                            self.status = "active"
                            self.current_agent_turn = opponent_id
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

    async def run_human_turn(
        self,
        human_offer: Dict[str, Any],
        message: Optional[str] = None,
        decision: str = "counter"
    ) -> Dict[str, Any]:
        """
        Processes a Human participant's turn in Practice Mode.
        Validates input, records human turn, updates state, and runs AI agent's counter-turn.
        """
        if self.status in ["accepted", "agreement", "rejected", "completed", "deadlock", "cancelled"]:
            raise ValueError(f"Negotiation session has already concluded with status '{self.status}'.")

        current_agent = self.get_current_agent()
        if not current_agent or current_agent.get("participant_type") != "human":
            # Find human participant ID
            human_agent = next((a for a in self.agents if a.get("participant_type") == "human"), self.agents[0])
            agent_id = human_agent["id"]
        else:
            agent_id = current_agent["id"]

        human_agent = self.agent_map[agent_id]

        if self.current_round == 0 or agent_id == self.agent_order[0]:
            self.current_round += 1

        price_val = extract_offer_price(human_offer)
        if price_val is None:
            norm_vars = extract_normalized_offer_variables(human_offer)
            for k in ["price", "salary", "budget", "amount", "unit_price", "base_salary", "project_fee", "vehicle_price", "property_price", "monthly_rent", "investment_amount", "service_price"]:
                if k in norm_vars:
                    price_val = norm_vars[k]
                    break
            if price_val is None and norm_vars:
                price_val = next(iter(norm_vars.values()))

        if price_val is None or price_val <= 0:
            raise ValueError("Human offer must contain a valid positive numeric price value greater than 0.")

        # Validate multi-variable constraints and calculate utility
        vdefs = get_scenario_variables(self.scenario_id, human_agent.get("role"))
        human_util = calculate_utility(human_agent, human_offer, vdefs, self.scenario_id)

        if decision == "accept" and not human_util.is_valid:
            viol_str = "; ".join(human_util.violations)
            raise ValueError(f"Cannot accept offer: violates hard constraint(s): {viol_str}")

        state_context = {
            "negotiation_id": self.negotiation_id,
            "scenario_id": self.scenario_id,
            "difficulty": getattr(self, "difficulty", "Intermediate"),
            "current_round": self.current_round,
            "max_rounds": self.max_rounds,
            "status": self.status,
            "history": self.history
        }

        init_pos = get_agent_initial_position(self.history, agent_id)
        prev_pos = get_agent_previous_position(self.history, agent_id)

        concession_info = calculate_concession(
            agent_profile=human_agent,
            previous_offer=prev_pos,
            current_offer=price_val,
            negotiation_state=state_context,
            initial_position=init_pos
        )

        tradeoff_info = detect_tradeoffs(human_agent, self.current_offer, human_offer, vdefs, self.scenario_id)
        prev_human_turn = next((h for h in reversed(self.history) if h.get("agent_id") == agent_id), None)
        coaching = generate_strategy_coaching(
            user_turn={"concession_data": concession_info},
            previous_turn=prev_human_turn,
            user_profile=human_agent,
            tradeoff_result=tradeoff_info,
            utility_result=human_util
        )

        reason_text = message or f"Human submitted offer of ${price_val:,.2f}."

        history_item = {
            "agent_id": agent_id,
            "round": self.current_round,
            "decision": decision,
            "proposed_offer": human_offer,
            "value": price_val,
            "reasoning": reason_text,
            "parameters": {"concession_tracking": concession_info, "is_human": True},
            "concession_data": concession_info,
            "tradeoff_data": tradeoff_info.model_dump(),
            "utility_data": human_util.model_dump(),
            "strategy_feedback": coaching,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        self.history.append(history_item)

        self.previous_offer = self.current_offer
        self.current_offer = human_offer

        is_terminated, final_status = self.check_termination(decision)
        if is_terminated:
            self.status = final_status
            if self.resolution_attempts >= 1 and self.deadlock_info.get("resolution"):
                self.deadlock_info["resolution"]["result"] = "accepted" if final_status in ["accepted", "agreement"] else "rejected"
            self.current_agent_turn = None
            return self.get_state_dict()

        if self.resolution_attempts >= 1:
            logger.info("RESOLUTION_COUNTERED - Human responded to resolution proposal with counter. Terminating bounded resolution attempt as breakdown.")
            self.status = "breakdown"
            if self.deadlock_info.get("resolution"):
                self.deadlock_info["resolution"]["result"] = "breakdown"
            self.current_agent_turn = None
            return self.get_state_dict()

        # Switch turn to AI agent
        self.current_agent_turn = self.switch_turn()

        # Automatically execute AI agent's counter-turn
        if self.current_agent_turn and self.status in ["active", "in_progress"]:
            await self.run_turn()

        return self.get_state_dict()

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

    def get_live_metrics(self) -> Dict[str, Any]:
        """Calculates live round telemetry, utility scores, and trade-off metrics."""
        agents = self.agents or []
        human_agent = next((a for a in agents if a.get("participant_type") == "human"), agents[0] if agents else {})
        ai_agent = next((a for a in agents if a.get("id") != human_agent.get("id")), agents[-1] if agents else {})

        vdefs_h = get_scenario_variables(self.scenario_id, human_agent.get("role"))
        vdefs_ai = get_scenario_variables(self.scenario_id, ai_agent.get("role"))

        h_util = calculate_utility(human_agent, self.current_offer, vdefs_h, self.scenario_id)
        ai_util = calculate_utility(ai_agent, self.current_offer, vdefs_ai, self.scenario_id)

        ai_stance = calculate_ai_stance(ai_agent, self.history, ai_util.overall_score)

        tradeoffs_count = sum(1 for h in self.history if h.get("tradeoff_data", {}).get("tradeoff_detected"))
        concessions_count = sum(1 for h in self.history if float(h.get("concession_data", {}).get("concession_amount", 0.0)) > 0)

        # Gap calculation
        h_hist = [h for h in self.history if h.get("agent_id") == human_agent.get("id")]
        ai_hist = [h for h in self.history if h.get("agent_id") == ai_agent.get("id")]

        h_open = h_hist[0].get("value") if h_hist else None
        ai_open = ai_hist[0].get("value") if ai_hist else None
        open_gap = abs(h_open - ai_open) if (h_open is not None and ai_open is not None) else None

        h_latest = h_hist[-1].get("value") if h_hist else None
        ai_latest = ai_hist[-1].get("value") if ai_hist else None
        curr_gap = abs(h_latest - ai_latest) if (h_latest is not None and ai_latest is not None) else None

        conv_pct = None
        if open_gap and open_gap > 0 and curr_gap is not None:
            conv_pct = max(0.0, min(100.0, round((1.0 - (curr_gap / open_gap)) * 100.0, 1)))

        return {
            "human_utility_pct": round(h_util.overall_score * 100, 1),
            "ai_utility_pct": round(ai_util.overall_score * 100, 1),
            "ai_stance": ai_stance,
            "opening_gap": open_gap,
            "current_gap": curr_gap,
            "convergence_pct": conv_pct,
            "tradeoffs_detected": tradeoffs_count,
            "concessions_count": concessions_count,
            "zopa_status": "Active" if not self.deadlock_info.get("is_deadlock") else "Constrained",
            "agreement_likelihood": "High" if (conv_pct or 0) > 60 else "Moderate" if (conv_pct or 0) > 25 else "Low"
        }

    def get_state_dict(self) -> Dict[str, Any]:
        mode_label = "LLM Mode" if settings.LLM_PROVIDER.lower() in ["gemini", "openai"] else "Normal Mode"
        vdefs = get_scenario_variables(self.scenario_id, self.human_role)
        return {
            "negotiation_id": self.negotiation_id,
            "scenario_id": self.scenario_id,
            "mode": self.mode,
            "human_role": self.human_role,
            "difficulty": getattr(self, "difficulty", "Intermediate"),
            "user_id": self.user_id,
            "current_round": self.current_round,
            "max_rounds": self.max_rounds,
            "current_agent_turn": self.current_agent_turn,
            "status": self.status,
            "execution_mode": mode_label,
            "previous_offer": self.previous_offer,
            "current_offer": self.current_offer,
            "participating_agents": self.agents,
            "history": self.history,
            "deadlock_info": self.deadlock_info,
            "variables": {k: v.model_dump() for k, v in vdefs.items()},
            "live_metrics": self.get_live_metrics()
        }

    to_dict = get_state_dict


