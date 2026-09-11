import re

from typing import List, Dict, Any, Optional, Tuple


CONCESSION_RATE = {
    "Aggressive": 0.10,
    "Collaborative": 0.35,
    "Risk-averse": 0.25,
}

ACCEPTANCE_TOLERANCE = 0.03


def derive_limit_from_constraints(
    constraints: Any
) -> Optional[Dict[str, Any]]:
    """
    Extract negotiation direction ("minimize" | "maximize")
    and limit value from constraints.
    """

    if isinstance(constraints, dict):
        if "maximum_price" in constraints:
            return {
                "direction": "minimize",
                "limit": float(constraints["maximum_price"])
            }

        if "minimum_price" in constraints:
            return {
                "direction": "maximize",
                "limit": float(constraints["minimum_price"])
            }

    c_list = constraints if isinstance(constraints, list) else [constraints]

    for c in c_list:
        text = ""
        def_val = None

        if isinstance(c, str):
            text = c

        elif isinstance(c, dict):
            text = c.get("text", "")
            def_val = c.get(
                "defaultValue",
                c.get("value")
            )

        match = re.search(
            r"^(Maximum|Minimum)\s*\$?([\d,]+)",
            text,
            re.IGNORECASE
        )

        if match:
            qualifier, raw_val = match.groups()

            limit = float(
                def_val
                if def_val is not None
                else raw_val.replace(",", "")
            )

            direction = (
                "minimize"
                if "maximum" in qualifier.lower()
                else "maximize"
            )

            return {
                "direction": direction,
                "limit": limit
            }

    return None


def derive_direction_from_goal(
    goal: str,
    fallback_direction: str = "minimize"
) -> str:
    """
    Derives target direction (minimize vs maximize)
    from agent goal text.
    """

    g = str(goal or "").lower()

    if any(
        k in g
        for k in [
            "reduce",
            "lower",
            "minimize",
            "save",
            "lowest"
        ]
    ):
        return "minimize"

    if any(
        k in g
        for k in [
            "increase",
            "higher",
            "maximize",
            "highest",
            "earn",
            "salary",
            "profit"
        ]
    ):
        return "maximize"

    return fallback_direction


def anchor_offer(
    direction: str,
    limit: float
) -> float:
    """
    Calculates initial opening anchor offer
    based on the limit boundary.
    """

    spread = limit * 0.15

    if direction == "minimize":
        return max(limit - spread, 1.0)

    return limit + spread


def _extract_target_value(
    goal: str,
    fallback_value: float
) -> float:
    """
    Extract a target numeric value from goal text.

    Examples:
        "Target price 42500"
        "Target salary: 60000"
        "Target value = 75000"
    """

    text = str(goal or "")

    patterns = [
        r"target(?:\s+(?:price|salary|value))?\s*[:=]?\s*\$?([\d,]+(?:\.\d+)?)",
        r"target\s+of\s+\$?([\d,]+(?:\.\d+)?)",
    ]

    for pattern in patterns:
        match = re.search(
            pattern,
            text,
            re.IGNORECASE
        )

        if match:
            return float(
                match.group(1).replace(",", "")
            )

    return float(fallback_value)


def evaluate_offer(
    goal: str,
    direction: str,
    target: float,
    limit: float,
    incoming_value: Optional[float],
    own_last_value: Optional[float] = None,
    previous_offers: Optional[List[Any]] = None,
    round_num: int = 1,
    max_rounds: int = 5,
    constraints: Any = None,
) -> Dict[str, Any]:
    """
    Evaluate the opponent's offer before making a decision.

    The evaluation considers:
    - Agent goal
    - Negotiation direction
    - Target value
    - Minimum/maximum acceptable limit
    - Constraints
    - Current negotiation round
    - Previous offers
    - Agent's previous offer
    """
    goal_direction = derive_direction_from_goal(
        goal,
        direction
    )

    constraint_info = None
    if constraints is not None:
        constraint_info = derive_limit_from_constraints(constraints)
        if constraint_info is not None:
            goal_direction = constraint_info["direction"]
            limit = float(constraint_info["limit"])

    target = _extract_target_value(goal, target)

    # Handle opening turn where opponent offer is None
    if incoming_value is None:
        if own_last_value is None:
            own_last_value = target
        return {
            "classification": "opening_turn",
            "within_limit": True,
            "direction": goal_direction,
            "goal": goal,
            "target_value": target,
            "limit": limit,
            "opponent_value": None,
            "own_last_value": float(own_last_value),
            "target_gap": 0.0,
            "current_gap": 0.0,
            "close_to_target": False,
            "round_num": round_num,
            "max_rounds": max_rounds,
            "previous_offers": [],
            "previous_movement": 0.0,
            "constraints": constraint_info,
        }

    incoming_val = float(incoming_value)

    if own_last_value is None:
        own_last_value = target
    own_last_val = float(own_last_value)

    cleaned_prev_offers = []
    if previous_offers:
        for po in previous_offers:
            if isinstance(po, (int, float)):
                cleaned_prev_offers.append(float(po))
            elif isinstance(po, dict):
                v = po.get("price", po.get("value"))
                if v is not None:
                    cleaned_prev_offers.append(float(v))

    within_limit = (
        incoming_val <= limit
        if goal_direction == "minimize"
        else incoming_val >= limit
    )

    target_gap = abs(incoming_val - target)
    current_gap = abs(incoming_val - own_last_val)

    comparison_base = max(
        abs(limit),
        abs(target),
        abs(incoming_val),
        1.0
    )

    close_to_target = (
        target_gap <= comparison_base * ACCEPTANCE_TOLERANCE
    )

    if goal_direction == "minimize":
        if incoming_val <= target:
            classification = "very_favorable"
        elif incoming_val <= limit:
            classification = "negotiable"
        else:
            classification = "unacceptable"
    else:
        if incoming_val >= target:
            classification = "very_favorable"
        elif incoming_val >= limit:
            classification = "negotiable"
        else:
            classification = "unacceptable"

    if within_limit and close_to_target:
        classification = "very_favorable"

    previous_movement = 0.0
    if cleaned_prev_offers:
        previous_movement = incoming_val - cleaned_prev_offers[-1]

    return {
        "classification": classification,
        "within_limit": within_limit,
        "direction": goal_direction,
        "goal": goal,
        "target_value": target,
        "limit": limit,
        "opponent_value": incoming_val,
        "own_last_value": own_last_val,
        "target_gap": round(target_gap, 2),
        "current_gap": round(current_gap, 2),
        "close_to_target": close_to_target,
        "round_num": round_num,
        "max_rounds": max_rounds,
        "previous_offers": cleaned_prev_offers,
        "previous_movement": round(previous_movement, 2),
        "constraints": constraint_info,
    }


def generate_counteroffer(
    own_last_value: float,
    incoming_value: float,
    limit: float,
    direction: str,
    personality: str = "Collaborative",
    round_num: int = 1,
    max_rounds: int = 5,
) -> Dict[str, Any]:
    """
    Generate a counteroffer based on the difference between opponent's offer
    and agent's current position, staying within constraints and using personality.
    """
    rate = CONCESSION_RATE.get(personality, 0.25)
    
    # Adjust concession rate slightly as negotiation progresses
    progress_factor = min(round_num / max(max_rounds, 1), 1.0)
    adjusted_rate = min(rate + 0.10 * progress_factor, 0.50)

    gap = incoming_value - own_last_value
    step = gap * adjusted_rate
    next_val = own_last_value + step

    if direction == "minimize":
        next_val = min(next_val, limit)
    else:
        next_val = max(next_val, limit)

    return {
        "counter_value": round(next_val, 2),
        "concession_rate": round(adjusted_rate, 2),
        "raw_step": round(step, 2),
        "clamped_due_to_limit": (next_val == limit and (own_last_value + step != limit))
    }


def track_concession(
    initial_value: float,
    current_value: float,
    previous_value: Optional[float] = None,
    limit: Optional[float] = None,
    direction: str = "minimize",
    max_allowed_step_pct: float = 0.50
) -> Dict[str, Any]:
    """
    Tracks concession progress from initial position to current position,
    records movement, and checks for excessive concessions.
    """
    initial_val = float(initial_value)
    current_val = float(current_value)
    prev_val = float(previous_value) if previous_value is not None else initial_val

    total_movement = abs(current_val - initial_val)
    turn_movement = abs(current_val - prev_val)

    total_allowed = 0.0
    concession_pct = 0.0
    if limit is not None:
        total_allowed = abs(float(limit) - initial_val)
        if total_allowed > 0:
            concession_pct = min((total_movement / total_allowed) * 100.0, 100.0)

    # Check if movement is in expected concession direction
    concession_valid = True
    if direction == "minimize":
        # Buyer moves UP toward limit
        if current_val < prev_val:
            concession_valid = False
    else:
        # Vendor moves DOWN toward limit
        if current_val > prev_val:
            concession_valid = False

    is_excessive = False
    if total_allowed > 0 and turn_movement > (total_allowed * max_allowed_step_pct):
        is_excessive = True

    return {
        "initial_value": initial_val,
        "current_value": current_val,
        "previous_value": prev_val,
        "total_concession": round(total_movement, 2),
        "turn_concession": round(turn_movement, 2),
        "concession_percentage": round(concession_pct, 2),
        "is_excessive": is_excessive,
        "concession_valid": concession_valid,
    }


def rule_based_decide(
    goal: str,
    direction: str,
    limit: float,
    personality: str,
    own_last_value: float,
    incoming_value: float,
    round_num: int,
    max_rounds: int
) -> Dict[str, Any]:
    """
    Pure rule-based decision fallback engine.
    """
    goal_direction = derive_direction_from_goal(
        goal,
        direction
    )

    evaluation = evaluate_offer(
        goal=goal,
        direction=goal_direction,
        target=own_last_value,
        limit=limit,
        incoming_value=incoming_value,
        own_last_value=own_last_value,
        previous_offers=[own_last_value],
        round_num=round_num,
        max_rounds=max_rounds,
    )

    within_limit = evaluation["within_limit"]
    gap = evaluation["current_gap"]

    comparison_base = max(
        abs(limit),
        abs(incoming_value),
        1.0
    )

    close_enough = (
        gap <= comparison_base * ACCEPTANCE_TOLERANCE
    )

    if within_limit and (close_enough or evaluation["classification"] == "very_favorable"):
        return {
            "decision": "accept",
            "next_value": incoming_value,
            "reasoning": (
                f"Accepted {incoming_value} because it "
                f"satisfies goal '{goal}' and stays within "
                f"constraint limit of {limit}."
            ),
            "evaluation": evaluation,
        }

    if (
        not within_limit
        and round_num >= max_rounds
    ):
        return {
            "decision": "reject",
            "next_value": own_last_value,
            "reasoning": (
                f"Rejected {incoming_value} because it "
                f"violates constraint limit of {limit} "
                f"at final round {round_num}."
            ),
            "evaluation": evaluation,
        }

    counter_res = generate_counteroffer(
        own_last_value=own_last_value,
        incoming_value=incoming_value,
        limit=limit,
        direction=goal_direction,
        personality=personality,
        round_num=round_num,
        max_rounds=max_rounds
    )

    next_value = counter_res["counter_value"]

    return {
        "decision": "counter",
        "next_value": next_value,
        "reasoning": (
            f"Countered at {next_value}. "
            f"Persona '{personality}' concedes toward {incoming_value}."
        ),
        "evaluation": evaluation,
    }