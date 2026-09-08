import os
import json
import logging
import re
from typing import Dict, Any, List, Optional, Tuple
from app.config import settings
from app.schemas.response import LLMStructuredResponse

logger = logging.getLogger("negotiation_engine")
logger.setLevel(logging.INFO)
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
    opponent_offer: Optional[Dict[str, Any]] = None
) -> Tuple[bool, str, LLMStructuredResponse]:
    """
    Constraint Enforcement Engine (Requirement 6).
    Validates that LLM generated offer respects agent maximum/minimum price & quantity limits.
    """
    role = str(agent_profile.get("role", "")).lower()
    constraints = agent_profile.get("constraints", {})
    max_price, min_price, target_qty = parse_numeric_constraint(constraints, role)

    decision = llm_response.decision
    proposed_price = extract_offer_price(llm_response.offer)

    # If decision is accept, verify accepted offer doesn't violate limits
    if decision == "accept" and opponent_offer:
        opp_price = extract_offer_price(opponent_offer)
        if opp_price is not None:
            if "buyer" in role or "employer" in role:
                if max_price is not None and opp_price > max_price:
                    msg = f"Cannot accept offer of ₹{opp_price:,.2f} because it exceeds maximum price limit of ₹{max_price:,.2f}"
                    # Force counteroffer within maximum price
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
    Deterministic rule-based negotiation reasoning fallback when LLM API key is absent.
    Used for automated CI tests and offline development.
    """
    role = str(agent_profile.get("role", "")).lower()
    name = agent_profile.get("name", "Agent")
    persona = agent_profile.get("persona", "Negotiator")
    constraints = agent_profile.get("constraints", {})
    max_price, min_price, quantity = parse_numeric_constraint(constraints, role)
    round_num = negotiation_state.get("current_round", 1)

    opp_price = extract_offer_price(opponent_offer)

    # Opening turn
    if opp_price is None:
        if "buyer" in role:
            initial = (max_price * 0.85) if max_price else 75000.0
            return LLMStructuredResponse(
                decision="counter",
                offer={"price": round(initial, 2), "quantity": quantity or 100},
                reasoning=f"{name} opening bid based on target objectives.",
                parameters={"maximum_price": max_price, "role": role}
            )
        else:
            initial = (min_price * 1.15) if min_price else 95000.0
            return LLMStructuredResponse(
                decision="counter",
                offer={"price": round(initial, 2), "quantity": quantity or 100},
                reasoning=f"{name} opening asking price establishing anchor.",
                parameters={"minimum_price": min_price, "role": role}
            )

    # Multi-round negotiation logic
    if "buyer" in role:
        # Check if opponent offer is acceptable
        if max_price and opp_price <= max_price:
            # If vendor reduced close to target or budget, accept
            if opp_price <= max_price * 0.95 or round_num >= 4:
                return LLMStructuredResponse(
                    decision="accept",
                    offer={"price": opp_price, "quantity": quantity or 100},
                    reasoning=f"Vendor offer of ₹{opp_price:,.2f} is within buyer budget (max ₹{max_price:,.2f}). Accepting proposal.",
                    parameters={"maximum_price": max_price}
                )
        
        # Concede slightly each round up to max_price
        own_history = [h for h in conversation_history if h.get("agent_id") == agent_profile.get("id")]
        last_own_price = extract_offer_price(own_history[-1].get("proposed_offer")) if own_history else (max_price * 0.85 if max_price else 75000.0)
        
        step = (max_price - last_own_price) * 0.35 if max_price else 2500.0
        new_bid = min(last_own_price + max(step, 1000.0), max_price if max_price else 85000.0)

        return LLMStructuredResponse(
            decision="counter",
            offer={"price": round(new_bid, 2), "quantity": quantity or 100},
            reasoning=f"Increasing offer to ₹{new_bid:,.2f} to work towards agreement while strictly staying within max budget ₹{max_price:,.2f}.",
            parameters={"maximum_price": max_price, "previous_bid": last_own_price}
        )

    else: # Vendor / Seller
        # Check if buyer offer is acceptable
        if min_price and opp_price >= min_price:
            if opp_price >= min_price * 1.05 or round_num >= 4:
                return LLMStructuredResponse(
                    decision="accept",
                    offer={"price": opp_price, "quantity": quantity or 100},
                    reasoning=f"Buyer offer of ₹{opp_price:,.2f} meets minimum price threshold of ₹{min_price:,.2f}. Accepting deal.",
                    parameters={"minimum_price": min_price}
                )

        own_history = [h for h in conversation_history if h.get("agent_id") == agent_profile.get("id")]
        last_own_price = extract_offer_price(own_history[-1].get("proposed_offer")) if own_history else (min_price * 1.15 if min_price else 95000.0)

        step = (last_own_price - min_price) * 0.35 if min_price else 2500.0
        new_ask = max(last_own_price - max(step, 1000.0), min_price if min_price else 80000.0)

        return LLMStructuredResponse(
            decision="counter",
            offer={"price": round(new_ask, 2), "quantity": quantity or 100},
            reasoning=f"Lowering asking price to ₹{new_ask:,.2f} to facilitate deal closure without going below minimum limit ₹{min_price:,.2f}.",
            parameters={"minimum_price": min_price, "previous_ask": last_own_price}
        )

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
1. You must negotiate according to your persona, goals, objectives, and constraints.
2. You MUST NOT violate your numeric constraints (e.g. Buyer must NEVER exceed maximum price; Vendor must NEVER drop below minimum price).
3. You must output JSON ONLY matching this exact schema:
{{
  "decision": "counter" | "accept" | "reject",
  "offer": {{
    "price": <numeric_value>,
    "quantity": <numeric_quantity>
  }},
  "reasoning": "<concise explanation of your move>",
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
    Sends full context (profile, persona, state, complete history, opponent offer) to LLM
    and produces structured output validated against agent constraints.
    """
    logger.info(
        f"Generating turn response for agent '{agent_profile.get('name')}' ({agent_profile.get('role')}), "
        f"Round {negotiation_state.get('current_round')}, Opponent offer: {opponent_offer}"
    )

    api_key = settings.LLM_API_KEY or os.environ.get("LLM_API_KEY", "")
    provider = (settings.LLM_PROVIDER or "gemini").lower()

    # If no API key, use deterministic mock LLM fallback
    if not api_key or provider == "mock":
        response = mock_llm_reasoning(agent_profile, negotiation_state, conversation_history, opponent_offer)
        valid, msg, validated_response = validate_agent_constraints(agent_profile, response, opponent_offer)
        logger.info(f"Mock LLM Response generated. Constraint Check: {msg}. Decision: {validated_response.decision}")
        return validated_response

    # Prepare prompt context
    system_prompt = build_system_prompt(agent_profile)
    user_prompt = f"""Current Negotiation Context:
- Current Round: {negotiation_state.get('current_round')} of {negotiation_state.get('max_rounds', 8)}
- Current Status: {negotiation_state.get('status')}
- Opponent's Latest Offer: {json.dumps(opponent_offer) if opponent_offer else "None (Opening Turn)"}

Full Conversation History:
{json.dumps(conversation_history, indent=2)}

Generate your strategic structured JSON response now as {agent_profile.get('name')}."""

    raw_response_text = ""

    try:
        if provider == "gemini":
            try:
                from google import genai
                client = genai.Client(api_key=api_key)
                res = client.models.generate_content(
                    model=settings.LLM_MODEL or "gemini-2.5-flash",
                    contents=f"{system_prompt}\n\n{user_prompt}"
                )
                raw_response_text = res.text
            except Exception as e1:
                logger.warning(f"google.genai SDK call failed ({e1}), trying google.generativeai fallback...")
                import google.generativeai as genai_legacy
                genai_legacy.configure(api_key=api_key)
                model = genai_legacy.GenerativeModel(settings.LLM_MODEL or "gemini-1.5-flash")
                res = model.generate_content(f"{system_prompt}\n\n{user_prompt}")
                raw_response_text = res.text

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
    valid, msg, final_response = validate_agent_constraints(agent_profile, parsed_response, opponent_offer)

    if not valid:
        logger.warning(f"Constraint Enforcement Action Taken: {msg}")

    logger.info(
        f"Final Turn Output - Decision: {final_response.decision}, Offer: {final_response.offer}, "
        f"Reasoning: {final_response.reasoning}"
    )

    return final_response
