import re
from typing import Dict, Any, List, Optional, Tuple
from app.services.tradeoff_engine import (
    get_scenario_variables,
    calculate_utility,
    detect_tradeoffs,
    extract_normalized_offer_variables,
    normalize_variable_name,
    normalize_variable_score
)
from app.schemas.negotiation import NegotiationScorecard, HintResponse

DIFFICULTY_PROFILES = {
    "beginner": {
        "concession_multiplier": 1.5,
        "acceptance_threshold": 0.65,
        "anchoring_strength": 0.7,
        "patience_decay": 1.4,
        "description": "Forgiving AI opponent making larger concessions and offering constructive responses."
    },
    "intermediate": {
        "concession_multiplier": 1.0,
        "acceptance_threshold": 0.75,
        "anchoring_strength": 1.0,
        "patience_decay": 1.0,
        "description": "Balanced, realistic negotiator with moderate concessions and standard trade-offs."
    },
    "advanced": {
        "concession_multiplier": 0.65,
        "acceptance_threshold": 0.82,
        "anchoring_strength": 1.3,
        "patience_decay": 0.8,
        "description": "Tough negotiator with tight concession steps, strong anchoring, and package counteroffers."
    },
    "expert": {
        "concession_multiplier": 0.40,
        "acceptance_threshold": 0.88,
        "anchoring_strength": 1.6,
        "patience_decay": 0.6,
        "description": "Highly strategic, minimal concessions, sophisticated multi-variable trade-offs, firm limits."
    }
}


def get_difficulty_settings(difficulty: Optional[str] = None) -> Dict[str, Any]:
    key = (difficulty or "intermediate").lower().strip()
    return DIFFICULTY_PROFILES.get(key, DIFFICULTY_PROFILES["intermediate"])


def parse_natural_language_offer(text: str, scenario_id: str = "vendor_pricing") -> Tuple[bool, Dict[str, Any], float, str]:
    """
    Parses natural language user messages into a structured multi-variable offer dictionary.
    Supports numbers with currency symbols, days, months, percentages, etc.
    """
    if not text or not text.strip():
        return False, {}, 0.0, "Empty message provided."

    cleaned = text.lower()
    extracted: Dict[str, Any] = {}
    vdefs = get_scenario_variables(scenario_id)

    # 1. Price / Salary / Budget extraction
    price_patterns = [
        r'(?:price|offer|pay|cost|bid|rate|amount|at|for|salary|budget)[\s:]*[\$₹€£]?\s*([\d,]+(?:\.\d+)?)',
        r'[\$₹€£]\s*([\d,]+(?:\.\d+)?)',
        r'(\b\d{4,7}\b)'
    ]
    for pattern in price_patterns:
        m = re.search(pattern, cleaned)
        if m:
            val_str = m.group(1).replace(",", "").strip()
            try:
                num = float(val_str)
                if num > 50:  # Exclude tiny day/month counts
                    if "salary" in vdefs:
                        extracted["salary"] = num
                    elif "budget" in vdefs:
                        extracted["budget"] = num
                    else:
                        extracted["price"] = num
                    break
            except ValueError:
                pass

    # 2. Delivery days
    deliv_match = re.search(r'(\d+)\s*(?:[- ]?day|days|working days|business days)', cleaned)
    if deliv_match and "delivery_days" in vdefs:
        try:
            extracted["delivery_days"] = int(deliv_match.group(1))
        except ValueError:
            pass

    # 3. Warranty months / years
    warr_match = re.search(r'(\d+)\s*(?:[- ]?month|months|mo)[\s-]*(?:warranty|guarantee)?', cleaned)
    if warr_match and "warranty_months" in vdefs:
        try:
            extracted["warranty_months"] = int(warr_match.group(1))
        except ValueError:
            pass
    elif "warranty_months" in vdefs:
        yr_match = re.search(r'(\d+)\s*(?:[- ]?year|years|yr)[\s-]*(?:warranty|guarantee)', cleaned)
        if yr_match:
            try:
                extracted["warranty_months"] = int(yr_match.group(1)) * 12
            except ValueError:
                pass

    # 4. Support months
    supp_match = re.search(r'(\d+)\s*(?:[- ]?month|months)[\s-]*(?:support|maintenance)', cleaned)
    if supp_match and "support_months" in vdefs:
        try:
            extracted["support_months"] = int(supp_match.group(1))
        except ValueError:
            pass

    # 5. Remote days
    remote_match = re.search(r'(\d+)\s*(?:[- ]?day|days)?[\s-]*(?:remote|wfh|work from home)', cleaned)
    if remote_match and "remote_days" in vdefs:
        try:
            extracted["remote_days"] = int(remote_match.group(1))
        except ValueError:
            pass

    # 6. Vacation days
    pto_match = re.search(r'(\d+)\s*(?:[- ]?day|days)?[\s-]*(?:vacation|pto|leave)', cleaned)
    if pto_match and "vacation_days" in vdefs:
        try:
            extracted["vacation_days"] = int(pto_match.group(1))
        except ValueError:
            pass

    # 7. Bonus
    bonus_match = re.search(r'bonus[\s:]*[\$₹€£]?\s*([\d,]+(?:\.\d+)?)', cleaned)
    if bonus_match and "bonus" in vdefs:
        try:
            extracted["bonus"] = float(bonus_match.group(1).replace(",", ""))
        except ValueError:
            pass

    # 8. Scope
    scope_match = re.search(r'(\d+)\s*%\s*(?:scope|features)?', cleaned)
    if scope_match and "scope" in vdefs:
        try:
            extracted["scope"] = int(scope_match.group(1))
        except ValueError:
            pass

    # 9. Milestones
    ms_match = re.search(r'(\d+)\s*(?:milestones|gates|phases)', cleaned)
    if ms_match and "milestones" in vdefs:
        try:
            extracted["milestones"] = int(ms_match.group(1))
        except ValueError:
            pass

    if not extracted:
        # Fallback single generic number
        raw_nums = re.findall(r'[\d,]+', cleaned)
        if raw_nums:
            candidate = float(raw_nums[0].replace(",", ""))
            extracted["price"] = candidate
            return True, extracted, 0.5, f"Extracted single value: {candidate}"
        return False, {}, 0.0, "Could not extract numerical offer terms from your message."

    confidence = min(0.95, 0.4 + (len(extracted) * 0.25))
    return True, extracted, confidence, f"Successfully parsed {len(extracted)} negotiation term(s)."


def calculate_ai_stance(
    agent_profile: Dict[str, Any],
    history: List[Dict[str, Any]],
    current_utility: float,
    remaining_capacity: Optional[float] = None
) -> str:
    """
    Deterministically computes AI negotiator's stance:
    'Firm' | 'Neutral' | 'Flexible' | 'Very Flexible'
    """
    personality = (agent_profile.get("personality") or agent_profile.get("persona") or "Collaborative").lower()
    agent_id = agent_profile.get("id")
    agent_history = [h for h in history if h.get("agent_id") == agent_id]

    if not agent_history:
        if "aggressive" in personality:
            return "Firm"
        if "risk" in personality:
            return "Firm"
        return "Neutral"

    last_turn = agent_history[-1]
    last_decision = str(last_turn.get("decision", "")).lower()
    if last_decision == "accept":
        return "Very Flexible"
    if last_decision == "reject":
        return "Firm"

    # Analyze recent concession
    conc_data = last_turn.get("concession_data") or last_turn.get("parameters", {}).get("concession_tracking") or {}
    conc_amt = float(conc_data.get("concession_amount") or conc_data.get("concession") or 0.0)
    conc_pct = float(conc_data.get("concession_percentage") or 0.0)

    if conc_pct >= 5.0 or conc_amt > 1500:
        return "Very Flexible"
    if conc_pct >= 1.5 or conc_amt > 500:
        return "Flexible"
    if conc_amt > 0:
        return "Neutral"

    if remaining_capacity is not None and remaining_capacity < 15:
        return "Firm"

    if "aggressive" in personality:
        return "Firm"

    return "Neutral"


def generate_strategy_coaching(
    user_turn: Dict[str, Any],
    previous_turn: Optional[Dict[str, Any]],
    user_profile: Dict[str, Any],
    tradeoff_result: Optional[Any],
    utility_result: Optional[Any]
) -> str:
    """
    Generates strategic coaching feedback after human offer submission.
    Educational only; never alters the offer.
    """
    if not previous_turn:
        return "Strong opening position. Watch how your opponent responds before revealing your bottom line."

    conc_data = user_turn.get("concession_data") or user_turn.get("parameters", {}).get("concession_tracking") or {}
    conc_amt = float(conc_data.get("concession_amount") or conc_data.get("concession") or 0.0)
    conc_pct = float(conc_data.get("concession_percentage") or 0.0)

    feedback_parts = []

    # Trade-off evaluation
    if tradeoff_result and getattr(tradeoff_result, "tradeoff_detected", False):
        give_items = tradeoff_result.tradeoff.give
        receive_items = tradeoff_result.tradeoff.receive
        if give_items and receive_items:
            g_names = ", ".join([item.variable for item in give_items])
            r_names = ", ".join([item.variable for item in receive_items])
            feedback_parts.append(f"Effective multi-variable trade-off: you conceded on {g_names} to protect {r_names}.")

    # Concession magnitude
    if conc_pct > 8.0:
        feedback_parts.append("Your concession was substantial (>8%). In future rounds, consider making smaller, incremental adjustments to test your opponent's limits.")
    elif conc_pct > 3.0:
        feedback_parts.append("Balanced concession that signals cooperative intent while maintaining leverage.")
    elif conc_amt == 0:
        feedback_parts.append("Firm stance maintained. Holding your position puts pressure on the opponent to move.")

    # Utility check
    if utility_result:
        u_score = utility_result.overall_score
        if u_score < 0.40:
            feedback_parts.append("Warning: Your current proposal represents a low total utility. Avoid settling too close to your walk-away point.")
        elif u_score >= 0.75:
            feedback_parts.append("High-utility proposal: You are capturing significant value across your key objectives.")

    return " ".join(feedback_parts) if feedback_parts else "Offer evaluated. Maintain awareness of your primary constraints as discussions advance."


def generate_negotiation_hint(
    negotiation_state: Dict[str, Any],
    agents: List[Dict[str, Any]],
    human_role: str,
    scenario_id: str = "vendor_pricing"
) -> HintResponse:
    """
    Generates a context-aware strategic hint based on real negotiation telemetry.
    """
    history = negotiation_state.get("history", [])
    human_agent = next((a for a in agents if str(a.get("role", "")).lower() == human_role.lower() or a.get("participant_type") == "human"), agents[0])
    ai_agent = next((a for a in agents if a.get("id") != human_agent.get("id")), agents[-1])

    ai_id = ai_agent.get("id")
    ai_history = [h for h in history if h.get("agent_id") == ai_id]

    vdefs = get_scenario_variables(scenario_id, human_agent.get("role"))

    # Estimate opponent flexibility
    ai_stance = calculate_ai_stance(ai_agent, history, 0.5)

    # Primary variable
    primary_var = "price"
    if "salary" in vdefs:
        primary_var = "salary"
    elif "budget" in vdefs:
        primary_var = "budget"

    # Secondary negotiable variable
    secondary_vars = [k for k in vdefs.keys() if k != primary_var and vdefs[k].negotiable and not vdefs[k].hard]
    secondary_var = secondary_vars[0] if secondary_vars else "delivery_days"

    current_offer = negotiation_state.get("current_offer") or {}
    curr_vars = extract_normalized_offer_variables(current_offer)

    recommended = dict(curr_vars)
    if secondary_var in vdefs and secondary_var in recommended:
        sdef = vdefs[secondary_var]
        # Recommend small concession on secondary
        step = sdef.step or 1.0
        if sdef.direction == "lower_is_better":
            recommended[secondary_var] = min(sdef.max_value, recommended[secondary_var] + (step * 2))
        else:
            recommended[secondary_var] = max(sdef.min_value, recommended[secondary_var] - (step * 2))

    hint_text = f"Your opponent currently exhibits a {ai_stance.lower()} stance."
    tactical_advice = (
        f"Try proposing a package offer: trade flexibility on {secondary_var.replace('_', ' ')} "
        f"in exchange for your opponent moving closer to your target {primary_var}."
    )

    return HintResponse(
        hint=hint_text,
        tactical_advice=tactical_advice,
        recommended_package=recommended if recommended else None,
        opponent_flexibility=ai_stance,
        zopa_status="Active" if not negotiation_state.get("deadlock_info", {}).get("is_deadlock") else "Constrained"
    )


def calculate_negotiation_scorecard(
    negotiation_state: Dict[str, Any],
    human_agent: Dict[str, Any],
    ai_agent: Dict[str, Any],
    scenario_id: str = "vendor_pricing"
) -> NegotiationScorecard:
    """
    Calculates a deterministic, transparent performance scorecard (0-100).
    Components:
    - objective_achievement: 30%
    - utility_score: 25%
    - tradeoff_quality: 20%
    - constraint_discipline: 15%
    - efficiency: 10%
    """
    history = negotiation_state.get("history", [])
    human_id = human_agent.get("id")
    human_turns = [h for h in history if h.get("agent_id") == human_id or h.get("parameters", {}).get("is_human")]

    final_offer = negotiation_state.get("current_offer") or {}
    vdefs = get_scenario_variables(scenario_id, human_agent.get("role"))

    # 1. Utility score (0-100)
    util = calculate_utility(human_agent, final_offer, vdefs, scenario_id)
    utility_score = round(util.overall_score * 100, 1)

    # 2. Objective achievement
    primary_var = "price"
    if "salary" in vdefs:
        primary_var = "salary"
    elif "budget" in vdefs:
        primary_var = "budget"

    raw_vars = extract_normalized_offer_variables(final_offer)
    final_p = raw_vars.get(primary_var, 0.0)
    p_def = vdefs.get(primary_var)
    if p_def:
        obj_ratio = normalize_variable_score(final_p, p_def.min_value, p_def.max_value, p_def.direction)
        objective_achievement = round(obj_ratio * 100, 1)
    else:
        objective_achievement = utility_score

    # 3. Trade-off quality
    tradeoffs_count = sum(1 for h in human_turns if h.get("tradeoff_data", {}).get("tradeoff_detected"))
    tradeoff_quality = min(100.0, 50.0 + (tradeoffs_count * 25.0))

    # 4. Constraint discipline (100 if no hard violations, 0 if violated)
    constraint_discipline = 100.0 if util.is_valid else 20.0

    # 5. Efficiency (based on rounds vs max_rounds)
    current_round = negotiation_state.get("current_round", 1)
    max_rounds = negotiation_state.get("max_rounds", 8)
    eff_ratio = max(0.2, 1.0 - ((current_round - 1) / max(1, max_rounds * 1.5)))
    efficiency = round(eff_ratio * 100, 1)

    # Deterministic weighted formula
    total_score = round(
        (objective_achievement * 0.30) +
        (utility_score * 0.25) +
        (tradeoff_quality * 0.20) +
        (constraint_discipline * 0.15) +
        (efficiency * 0.10),
        1
    )
    clamped_score = max(0.0, min(100.0, total_score))

    concessions_made = sum(1 for h in human_turns if float(h.get("concession_data", {}).get("concession_amount", 0.0)) > 0)
    status = negotiation_state.get("status", "completed")

    coaching_summary = (
        f"You achieved an overall score of {clamped_score}/100 with {tradeoffs_count} strategic trade-off(s) "
        f"and {concessions_made} measured concession(s). Utility reached {utility_score}% across all negotiated variables."
    )

    return NegotiationScorecard(
        overall_score=clamped_score,
        objective_achievement=objective_achievement,
        utility_score=utility_score,
        tradeoff_quality=tradeoff_quality,
        constraint_discipline=constraint_discipline,
        efficiency=efficiency,
        total_rounds=current_round,
        tradeoffs_detected=tradeoffs_count,
        concessions_made=concessions_made,
        outcome=status.upper(),
        coaching_summary=coaching_summary
    )
