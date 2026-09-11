import os
import json
import logging
import re
from typing import Dict, Any, List, Optional, Tuple
from app.config import settings
from app.schemas.response import LLMStructuredResponse
from app.services.decision_logic import (
    evaluate_offer,
    generate_counteroffer,
    track_concession,
    derive_direction_from_goal,
    derive_limit_from_constraints,
)

logger = logging.getLogger("negotiation_engine")
logger.setLevel(logging.INFO)
logging.getLogger("google_genai").setLevel(logging.ERROR)
logging.getLogger("google_genai.models").setLevel(logging.ERROR)

if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter("[%(asctime)s] %(levelname)s - %(message)s")
    handler.setFormatter(formatter)
    logger.addHandler(handler)

def parse_numeric_constraint(constraints: Any, role: str) -> Tuple[Optional[float], Optional[float], Optional[int]]:
    """
    Extracts maximum_price, minimum_price, and quantity constraints from
    flexible constraints inputs (dict, string list, or dict list).
    """
    max_price = None
    min_price = None
    quantity = None

    if isinstance(constraints, dict):
        max_price = constraints.get("maximum_price") or constraints.get("max_price")
        min_price = constraints.get("minimum_price") or constraints.get("min_price")
        quantity = constraints.get("quantity")
    
    # Handle list of items or strings (e.g. [{'text': 'Maximum $50,000', 'defaultValue': 50000}])
    if isinstance(constraints, list):
        for item in constraints:
            if isinstance(item, dict):
                text = item.get("text", "")
                val = item.get("defaultValue", item.get("value"))
                if val is not None:
                    try:
                        fval = float(val)
                        if "max" in text.lower() or "maximum" in text.lower() or role.lower() in ["buyer", "employer"]:
                            if max_price is None:
                                max_price = fval
                        if "min" in text.lower() or "minimum" in text.lower() or role.lower() in ["vendor", "candidate", "department_head"]:
                            if min_price is None:
                                min_price = fval
                    except (ValueError, TypeError):
                        pass
                # Check dict keys
                if "maximum_price" in item:
                    max_price = float(item["maximum_price"])
                if "minimum_price" in item:
                    min_price = float(item["minimum_price"])
                if "quantity" in item:
                    quantity = int(item["quantity"])
            elif isinstance(item, str):
                # Parse numeric figures out of text strings like "Maximum $50,000" or "Minimum $42,000"
                numbers = re.findall(r"[\d,]+", item)
                if numbers:
                    clean_num = numbers[0].replace(",", "")
                    try:
                        fval = float(clean_num)
                        if "max" in item.lower() or role.lower() in ["buyer", "employer"]:
                            if max_price is None:
                                max_price = fval
                        if "min" in item.lower() or role.lower() in ["vendor", "candidate"]:
                            if min_price is None:
                                min_price = fval
                    except ValueError:
                        pass

    # Role defaults if still None
    if max_price is None and role.lower() in ["buyer"]:
        max_price = 85000.0
    if min_price is None and role.lower() in ["vendor"]:
        min_price = 80000.0

    return max_price, min_price, quantity

def extract_offer_price(offer_input: Any) -> Optional[float]:
    """Extracts a scalar numeric price from various offer formats (dicts, Pydantic objects, numbers)."""
    if offer_input is None:
        return None
    if isinstance(offer_input, (int, float)):
        return float(offer_input)
    # Support Pydantic model objects or class objects with price/value attributes
    if hasattr(offer_input, "price") and getattr(offer_input, "price") is not None:
        try:
            return float(getattr(offer_input, "price"))
        except (ValueError, TypeError):
            pass
    if hasattr(offer_input, "value") and getattr(offer_input, "value") is not None:
        try:
            return float(getattr(offer_input, "value"))
        except (ValueError, TypeError):
            pass
    if isinstance(offer_input, dict):
        if "price" in offer_input and offer_input["price"] is not None:
            try:
                return float(offer_input["price"])
            except (ValueError, TypeError):
                pass
        if "value" in offer_input and offer_input["value"] is not None:
            try:
                return float(offer_input["value"])
            except (ValueError, TypeError):
                pass
    return None

def validate_agent_constraints(
    agent_profile: Dict[str, Any],
    llm_response: LLMStructuredResponse,
    opponent_offer: Optional[Dict[str, Any]] = None,
    negotiation_state: Optional[Dict[str, Any]] = None
) -> Tuple[bool, str, LLMStructuredResponse]:
    """
    Constraint Enforcement Engine (Requirement 6).
    Validates that LLM generated offer respects agent maximum/minimum price & quantity limits,
    and enforces rejection when limit is violated at final round.
    """
    role = str(agent_profile.get("role", "")).lower()
    constraints = agent_profile.get("constraints", {})
    max_price, min_price, target_qty = parse_numeric_constraint(constraints, role)

    decision = llm_response.decision
    proposed_price = extract_offer_price(llm_response.offer)
    opp_price = extract_offer_price(opponent_offer)

    round_num = negotiation_state.get("current_round", 1) if negotiation_state else 1
    max_rounds = negotiation_state.get("max_rounds", 8) if negotiation_state else 8

    # Final round enforcement for unacceptable offers
    if opp_price is not None and round_num >= max_rounds:
        if ("buyer" in role or "employer" in role) and max_price is not None and opp_price > max_price:
            msg = f"Force reject at final round because opponent offer of ₹{opp_price:,.2f} exceeds max budget ₹{max_price:,.2f}"
            adjusted = LLMStructuredResponse(
                decision="reject",
                offer={"price": max_price, "quantity": target_qty or 100},
                reasoning=f"Rejecting proposal because opponent price ₹{opp_price:,.2f} exceeds maximum budget ₹{max_price:,.2f} at final round {round_num}.",
                parameters={"maximum_price": max_price, "force_rejected": True}
            )
            return False, msg, adjusted

        if ("vendor" in role or "candidate" in role) and min_price is not None and opp_price < min_price:
            msg = f"Force reject at final round because opponent offer of ₹{opp_price:,.2f} is below minimum limit ₹{min_price:,.2f}"
            adjusted = LLMStructuredResponse(
                decision="reject",
                offer={"price": min_price, "quantity": target_qty or 100},
                reasoning=f"Rejecting proposal because opponent price ₹{opp_price:,.2f} is below minimum price floor ₹{min_price:,.2f} at final round {round_num}.",
                parameters={"minimum_price": min_price, "force_rejected": True}
            )
            return False, msg, adjusted

    # If decision is accept, verify accepted offer doesn't violate limits
    if decision == "accept" and opp_price is not None:
        if "buyer" in role or "employer" in role:
            if max_price is not None and opp_price > max_price:
                msg = f"Cannot accept offer of ₹{opp_price:,.2f} because it exceeds maximum price limit of ₹{max_price:,.2f}"
                clamped_offer = {"price": max_price, "quantity": target_qty or 100}
                adjusted = LLMStructuredResponse(
                    decision="counter",
                    offer=clamped_offer,
                    reasoning=f"Rejecting acceptance because opponent price ₹{opp_price:,.2f} exceeds maximum budget ₹{max_price:,.2f}. Countering at maximum limit.",
                    parameters={"maximum_price": max_price, "adjusted_due_to_constraint": True}
                )
                return False, msg, adjusted
        elif "vendor" in role or "candidate" in role:
            if min_price is not None and opp_price < min_price:
                msg = f"Cannot accept offer of ₹{opp_price:,.2f} because it is below minimum price limit of ₹{min_price:,.2f}"
                clamped_offer = {"price": min_price, "quantity": target_qty or 100}
                adjusted = LLMStructuredResponse(
                    decision="counter",
                    offer=clamped_offer,
                    reasoning=f"Rejecting acceptance because opponent price ₹{opp_price:,.2f} is below minimum limit ₹{min_price:,.2f}. Countering at minimum floor.",
                    parameters={"minimum_price": min_price, "adjusted_due_to_constraint": True}
                )
                return False, msg, adjusted

    # If decision is counter, validate counteroffer price
    if decision == "counter" and proposed_price is not None:
        if "buyer" in role or "employer" in role:
            if max_price is not None and proposed_price > max_price:
                msg = f"Buyer proposed offer of ₹{proposed_price:,.2f} violates maximum price constraint of ₹{max_price:,.2f}"
                clamped_offer = {"price": max_price, "quantity": target_qty or 100}
                adjusted = LLMStructuredResponse(
                    decision="counter",
                    offer=clamped_offer,
                    reasoning=f"Adjusted counteroffer to maximum budget limit of ₹{max_price:,.2f}.",
                    parameters={"maximum_price": max_price, "original_proposed": proposed_price}
                )
                return False, msg, adjusted
        elif "vendor" in role or "candidate" in role:
            if min_price is not None and proposed_price < min_price:
                msg = f"Vendor proposed offer of ₹{proposed_price:,.2f} violates minimum price constraint of ₹{min_price:,.2f}"
                clamped_offer = {"price": min_price, "quantity": target_qty or 100}
                adjusted = LLMStructuredResponse(
                    decision="counter",
                    offer=clamped_offer,
                    reasoning=f"Adjusted counteroffer to minimum price floor of ₹{min_price:,.2f}.",
                    parameters={"minimum_price": min_price, "original_proposed": proposed_price}
                )
                return False, msg, adjusted

    return True, "Constraints satisfied", llm_response

def mock_llm_reasoning(
    agent_profile: Dict[str, Any],
    negotiation_state: Dict[str, Any],
    conversation_history: List[Dict[str, Any]],
    opponent_offer: Optional[Dict[str, Any]]
) -> LLMStructuredResponse:
    """
    Deterministic negotiation decision engine with Offer Evaluation,
    Personality-based Counteroffer generation, and Concession Tracking.
    """
    role = str(agent_profile.get("role", "")).lower()
    name = agent_profile.get("name", "Agent")
    persona = agent_profile.get("persona", "Collaborative")
    goals = agent_profile.get("goals", [])
    goal_str = goals[0] if goals else ""
    constraints = agent_profile.get("constraints", {})
    max_price, min_price, quantity = parse_numeric_constraint(constraints, role)
    round_num = negotiation_state.get("current_round", 1)
    max_rounds = negotiation_state.get("max_rounds", 8)

    direction = "minimize" if ("buyer" in role or "employer" in role) else "maximize"
    limit = max_price if direction == "minimize" else min_price

    if limit is None:
        limit = 85000.0 if direction == "minimize" else 80000.0

    opp_price = extract_offer_price(opponent_offer)

    own_history = [h for h in conversation_history if h.get("agent_id") == agent_profile.get("id")]
    previous_offers = [extract_offer_price(h.get("proposed_offer")) for h in conversation_history if h.get("proposed_offer")]

    if own_history:
        last_own_price = extract_offer_price(own_history[-1].get("proposed_offer"))
        initial_price = extract_offer_price(own_history[0].get("proposed_offer")) or last_own_price
    else:
        initial_price = (limit * 0.85) if direction == "minimize" else (limit * 1.15)
        last_own_price = initial_price

    # Run Offer Evaluation
    evaluation = evaluate_offer(
        goal=goal_str,
        direction=direction,
        target=last_own_price,
        limit=limit,
        incoming_value=opp_price,
        own_last_value=last_own_price,
        previous_offers=previous_offers,
        round_num=round_num,
        max_rounds=max_rounds,
        constraints=constraints
    )

    # Opening turn logic
    if opp_price is None:
        initial_bid = round(initial_price, 2)
        concession_info = track_concession(initial_price, initial_bid, initial_price, limit, direction)
        return LLMStructuredResponse(
            decision="counter",
            offer={"price": initial_bid, "quantity": quantity or 100},
            reasoning=f"{name} opening anchor bid based on target objectives and {persona} stance.",
            parameters={
                "role": role,
                "evaluation": evaluation,
                "concession": concession_info
            }
        )

    # Track Concession
    concession_info = track_concession(
        initial_value=initial_price,
        current_value=last_own_price,
        previous_value=last_own_price,
        limit=limit,
        direction=direction
    )

    classification = evaluation["classification"]
    within_limit = evaluation["within_limit"]

    # DECISION LOGIC: Accept, Counter, or Reject
    # 1. ACCEPT
    if classification == "very_favorable" or (within_limit and evaluation["close_to_target"]):
        return LLMStructuredResponse(
            decision="accept",
            offer={"price": opp_price, "quantity": quantity or 100},
            reasoning=f"Opponent's offer of ₹{opp_price:,.2f} satisfies {name}'s target objectives and limits. Accepting deal.",
            parameters={"evaluation": evaluation, "concession": concession_info}
        )

    if within_limit and round_num >= max_rounds - 1:
        return LLMStructuredResponse(
            decision="accept",
            offer={"price": opp_price, "quantity": quantity or 100},
            reasoning=f"Opponent's offer of ₹{opp_price:,.2f} is within limit ₹{limit:,.2f} as negotiation reaches final round {round_num}. Accepting deal.",
            parameters={"evaluation": evaluation, "concession": concession_info}
        )

    # 2. REJECT
    if not within_limit:
        # If opponent's offer violates limit, check if we reject or make firm counter
        if round_num >= max_rounds:
            return LLMStructuredResponse(
                decision="reject",
                offer={"price": last_own_price, "quantity": quantity or 100},
                reasoning=f"Rejecting offer of ₹{opp_price:,.2f} as it violates hard constraint limit of ₹{limit:,.2f} at final round {round_num}.",
                parameters={"evaluation": evaluation, "concession": concession_info}
            )

    # 3. COUNTER: Generate strategic counteroffer based on personality & concession tracking
    counter_gen = generate_counteroffer(
        own_last_value=last_own_price,
        incoming_value=opp_price if within_limit else limit,
        limit=limit,
        direction=direction,
        personality=persona,
        round_num=round_num,
        max_rounds=max_rounds
    )

    new_counter_val = counter_gen["counter_value"]

    # Calculate turn concession track
    updated_concession = track_concession(
        initial_value=initial_price,
        current_value=new_counter_val,
        previous_value=last_own_price,
        limit=limit,
        direction=direction
    )

    reason_msg = (
        f"Countering at ₹{new_counter_val:,.2f}. {persona} agent concedes gradually while "
        f"staying strictly within constraint limit ₹{limit:,.2f}."
    )

    return LLMStructuredResponse(
        decision="counter",
        offer={"price": new_counter_val, "quantity": quantity or 100},
        reasoning=reason_msg,
        parameters={
            "evaluation": evaluation,
            "concession": updated_concession,
            "counter_details": counter_gen
        }
    )


_cached_gemini_client = None
_cached_api_key = None

def get_gemini_client(api_key: str):
    global _cached_gemini_client, _cached_api_key
    if _cached_gemini_client is None or _cached_api_key != api_key:
        from google import genai
        _cached_gemini_client = genai.Client(api_key=api_key)
        _cached_api_key = api_key
    return _cached_gemini_client

def build_system_prompt(agent_profile: Dict[str, Any]) -> str:
    """Builds system prompt for the specified agent persona & profile."""
    name = agent_profile.get("name", "Negotiation Agent")
    role = agent_profile.get("role", "Negotiator")
    persona = agent_profile.get("persona", "Professional negotiator")
    goals = agent_profile.get("goals", [])
    constraints = agent_profile.get("constraints", {})
    objectives = agent_profile.get("negotiation_objectives", [])

    return f"""You are acting strictly as {name} (Role: {role}).
Persona/Personality: {persona}

Your Strategic Goals:
{json.dumps(goals, indent=2)}

Your Strict Constraints & Limits:
{json.dumps(constraints, indent=2)}

Your Specific Negotiation Objectives:
{json.dumps(objectives, indent=2)}

CRITICAL INSTRUCTIONS:
1. Negotiate according to your persona, goals, objectives, and constraints.
2. You MUST NOT violate numeric constraints (Buyer must NEVER exceed maximum price limit; Vendor must NEVER drop below minimum price limit).
3. CONVERGENCE RULES: Make active, realistic concessions (~15% to 35% of the gap per turn). If the opponent's offer is within your budget/limit or reasonably close, select 'accept' promptly to complete the negotiation smoothly.
4. REJECTION RULE: If the opponent's offer exceeds your maximum budget or falls below your minimum limit at the final round, select 'reject'.
5. You must output JSON ONLY matching this exact schema:
{{
  "decision": "counter" | "accept" | "reject",
  "offer": {{
    "price": <numeric_value>,
    "quantity": <numeric_quantity>
  }},
  "reasoning": "<concise 1-2 sentence explanation of your move>",
  "parameters": {{
    "target_price": <value>,
    "maximum_price": <value>,
    "minimum_price": <value>
  }}
}}
Do NOT wrap in markdown backticks or add extraneous text."""

async def generate_agent_response(
    agent_profile: Dict[str, Any],
    negotiation_state: Dict[str, Any],
    conversation_history: List[Dict[str, Any]],
    opponent_offer: Optional[Dict[str, Any]] = None
) -> LLMStructuredResponse:
    """
    Requirement 4: Core LLM Reasoning Function.
    Sends full context (profile, persona, state, complete history, opponent offer, offer evaluation, concession tracking)
    to LLM and produces structured output validated against agent constraints.
    """
    logger.info(
        f"Generating turn response for agent '{agent_profile.get('name')}' ({agent_profile.get('role')}), "
        f"Round {negotiation_state.get('current_round')}, Opponent offer: {opponent_offer}"
    )

    api_key = settings.LLM_API_KEY or os.environ.get("LLM_API_KEY", "")
    provider = (settings.LLM_PROVIDER or "gemini").lower()

    # Calculate Offer Evaluation and Concession Tracking for Context
    role = str(agent_profile.get("role", "")).lower()
    goals = agent_profile.get("goals", [])
    goal_str = goals[0] if goals else ""
    constraints = agent_profile.get("constraints", {})
    max_price, min_price, quantity = parse_numeric_constraint(constraints, role)
    round_num = negotiation_state.get("current_round", 1)
    max_rounds = negotiation_state.get("max_rounds", 8)
    direction = "minimize" if ("buyer" in role or "employer" in role) else "maximize"
    limit = max_price if direction == "minimize" else min_price
    if limit is None:
        limit = 85000.0 if direction == "minimize" else 80000.0

    opp_price = extract_offer_price(opponent_offer)
    own_history = [h for h in conversation_history if h.get("agent_id") == agent_profile.get("id")]
    previous_offers = [extract_offer_price(h.get("proposed_offer")) for h in conversation_history if h.get("proposed_offer")]

    if own_history:
        last_own_price = extract_offer_price(own_history[-1].get("proposed_offer"))
        initial_price = extract_offer_price(own_history[0].get("proposed_offer")) or last_own_price
    else:
        initial_price = (limit * 0.85) if direction == "minimize" else (limit * 1.15)
        last_own_price = initial_price

    evaluation = evaluate_offer(
        goal=goal_str,
        direction=direction,
        target=last_own_price,
        limit=limit,
        incoming_value=opp_price,
        own_last_value=last_own_price,
        previous_offers=previous_offers,
        round_num=round_num,
        max_rounds=max_rounds,
        constraints=constraints
    )

    concession_info = track_concession(
        initial_value=initial_price,
        current_value=last_own_price,
        previous_value=last_own_price,
        limit=limit,
        direction=direction
    )

    # If no API key, use deterministic mock LLM fallback
    if not api_key or provider == "mock":
        response = mock_llm_reasoning(agent_profile, negotiation_state, conversation_history, opponent_offer)
        valid, msg, validated_response = validate_agent_constraints(agent_profile, response, opponent_offer, negotiation_state)
        logger.info(f"Mock LLM Response generated. Constraint Check: {msg}. Decision: {validated_response.decision}")
        return validated_response

    # Prepare prompt context
    system_prompt = build_system_prompt(agent_profile)
    user_prompt = f"""Current Negotiation Context:
- Current Round: {negotiation_state.get('current_round')} of {negotiation_state.get('max_rounds', 8)}
- Current Status: {negotiation_state.get('status')}
- Opponent's Latest Offer: {json.dumps(opponent_offer) if opponent_offer else "None (Opening Turn)"}

Offer Evaluation:
- Offer Classification: {evaluation.get('classification')}
- Within Limits: {evaluation.get('within_limit')}
- Target Gap: {evaluation.get('target_gap')}

Concession Tracking:
- Total Concession: {concession_info.get('total_concession')}
- Turn Concession: {concession_info.get('turn_concession')}
- Concession Percentage: {concession_info.get('concession_percentage')}%

Full Conversation History:
{json.dumps(conversation_history, indent=2)}

Generate your strategic structured JSON response now as {agent_profile.get('name')}."""

    raw_response_text = ""

    try:
        if provider == "gemini":
            from google.genai import types
            client = get_gemini_client(api_key)

            configured_model = os.environ.get("LLM_MODEL") or settings.LLM_MODEL or "gemini-3.6-flash"
            valid_models = ["gemini-3.6-flash", "gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"]
            
            if configured_model in valid_models:
                candidate_models = [configured_model] + [m for m in valid_models if m != configured_model]
            else:
                candidate_models = valid_models + [configured_model]

            last_error = None
            for m in candidate_models:
                try:
                    res = client.models.generate_content(
                        model=m,
                        contents=f"{system_prompt}\n\n{user_prompt}",
                        config=types.GenerateContentConfig(
                            response_mime_type="application/json",
                            temperature=0.2
                        )
                    )
                    raw_response_text = res.text
                    last_error = None
                    break
                except Exception as ex:
                    last_error = ex
                    logger.warning(f"Gemini API model '{m}' request failed ({ex}). Trying next candidate...")

            if last_error and not raw_response_text:
                raise last_error

        elif provider == "openai":
            import openai
            client = openai.OpenAI(api_key=api_key)
            res = client.chat.completions.create(
                model=settings.LLM_MODEL or "gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                response_format={"type": "json_object"}
            )
            raw_response_text = res.choices[0].message.content

        # Parse JSON
        cleaned_json = raw_response_text.strip()
        if cleaned_json.startswith("```json"):
            cleaned_json = cleaned_json[7:]
        if cleaned_json.startswith("```"):
            cleaned_json = cleaned_json[3:]
        if cleaned_json.endswith("```"):
            cleaned_json = cleaned_json[:-3]
        cleaned_json = cleaned_json.strip()

        data = json.loads(cleaned_json)
        parsed_response = LLMStructuredResponse(**data)

    except Exception as exc:
        logger.error(f"LLM API call / JSON parsing failed ({exc}). Falling back to mock reasoning engine.")
        parsed_response = mock_llm_reasoning(agent_profile, negotiation_state, conversation_history, opponent_offer)

    # Perform Constraint Validation
    valid, msg, final_response = validate_agent_constraints(agent_profile, parsed_response, opponent_offer, negotiation_state)

    if not valid:
        logger.warning(f"Constraint Enforcement Action Taken: {msg}")

    # Enrich parameters with evaluation and concession info
    if final_response.parameters is None:
        final_response.parameters = {}
    final_response.parameters["evaluation"] = evaluation
    final_response.parameters["concession"] = concession_info

    logger.info(
        f"Final Turn Output - Decision: {final_response.decision}, Offer: {final_response.offer}, "
        f"Reasoning: {final_response.reasoning}"
    )

    return final_response
