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
    incoming_value: float,
    own_last_value: Optional[float] = None,
    previous_offers: Optional[List[float]] = None,
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

    Returns an evaluation object that can later be passed
    to the decision engine and LLM reasoning engine.
    """

    goal_direction = derive_direction_from_goal(
        goal,
        direction
    )

    # If constraints are explicitly supplied, use them
    # to determine the hard negotiation boundary.
    constraint_info = None

    if constraints is not None:
        constraint_info = derive_limit_from_constraints(
            constraints
        )

        if constraint_info is not None:
            goal_direction = constraint_info["direction"]
            limit = float(constraint_info["limit"])

    target = _extract_target_value(
        goal,
        target
    )

    incoming_value = float(incoming_value)

    if own_last_value is None:
        own_last_value = target

    own_last_value = float(own_last_value)

    previous_offers = (
        [float(value) for value in previous_offers]
        if previous_offers
        else []
    )

    # Check whether the opponent's offer violates
    # the agent's hard constraint.
    within_limit = (
        incoming_value <= limit
        if goal_direction == "minimize"
        else incoming_value >= limit
    )

    # Difference between opponent offer and target.
    target_gap = abs(
        incoming_value - target
    )

    # Difference between current own position
    # and opponent's offer.
    current_gap = abs(
        incoming_value - own_last_value
    )

    comparison_base = max(
        abs(limit),
        abs(target),
        abs(incoming_value),
        1.0
    )

    close_to_target = (
        target_gap
        <= comparison_base * ACCEPTANCE_TOLERANCE
    )

    # Determine how favorable the opponent offer is.
    if goal_direction == "minimize":

        if incoming_value <= target:
            classification = "very_favorable"

        elif incoming_value <= limit:
            classification = "negotiable"

        else:
            classification = "unacceptable"

    else:

        if incoming_value >= target:
            classification = "very_favorable"

        elif incoming_value >= limit:
            classification = "negotiable"

        else:
            classification = "unacceptable"

    # If the offer is very close to the target,
    # make the evaluation explicit.
    if within_limit and close_to_target:
        classification = "very_favorable"

    # Calculate previous movement.
    previous_movement = 0.0

    if previous_offers:
        previous_movement = (
            incoming_value - previous_offers[-1]
        )

    return {
        "classification": classification,
        "within_limit": within_limit,
        "direction": goal_direction,
        "goal": goal,
        "target_value": target,
        "limit": limit,
        "opponent_value": incoming_value,
        "own_last_value": own_last_value,
        "target_gap": round(target_gap, 2),
        "current_gap": round(current_gap, 2),
        "close_to_target": close_to_target,
        "round_num": round_num,
        "max_rounds": max_rounds,
        "previous_offers": previous_offers,
        "previous_movement": round(previous_movement, 2),
        "constraints": constraint_info,
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

    This function keeps the existing decision behavior
    while using the offer evaluation logic.
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

    if within_limit and close_enough:
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

    rate = CONCESSION_RATE.get(
        personality,
        0.20
    )

    next_value = (
        own_last_value
        + rate * (
            incoming_value
            - own_last_value
        )
    )

    if goal_direction == "minimize":
        next_value = min(
            next_value,
            limit
        )
    else:
        next_value = max(
            next_value,
            limit
        )

    return {
        "decision": "counter",
        "next_value": round(next_value, 2),
        "reasoning": (
            f"Countered at {round(next_value, 2)}. "
            f"Persona '{personality}' concedes "
            f"{int(rate * 100)}% of gap toward "
            f"{incoming_value}."
        ),
        "evaluation": evaluation,
    }