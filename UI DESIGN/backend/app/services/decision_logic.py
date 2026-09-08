import re
from typing import List, Dict, Any, Optional, Tuple

CONCESSION_RATE = {
    "Aggressive": 0.1,
    "Collaborative": 0.35,
    "Risk-averse": 0.25,
}

ACCEPTANCE_TOLERANCE = 0.03

def derive_limit_from_constraints(constraints: Any) -> Optional[Dict[str, Any]]:
    """
    Extract negotiation direction ("minimize" | "maximize") and limit value from constraints.
    """
    if isinstance(constraints, dict):
        if "maximum_price" in constraints:
            return {"direction": "minimize", "limit": float(constraints["maximum_price"])}
        if "minimum_price" in constraints:
            return {"direction": "maximize", "limit": float(constraints["minimum_price"])}

    c_list = constraints if isinstance(constraints, list) else [constraints]
    for c in c_list:
        text = ""
        def_val = None
        if isinstance(c, str):
            text = c
        elif isinstance(c, dict):
            text = c.get("text", "")
            def_val = c.get("defaultValue", c.get("value"))

        match = re.search(r"^(Maximum|Minimum)\s*\$?([\d,]+)", text, re.IGNORECASE)
        if match:
            qualifier, raw_val = match.groups()
            limit = float(def_val if def_val is not None else raw_val.replace(",", ""))
            direction = "minimize" if "maximum" in qualifier.lower() else "maximize"
            return {"direction": direction, "limit": limit}

    return None

def derive_direction_from_goal(goal: str, fallback_direction: str = "minimize") -> str:
    """Derives target direction (minimize vs maximize) from agent goal text."""
    g = str(goal or "").lower()
    if any(k in g for k in ["reduce", "lower", "minimize", "save", "lowest"]):
        return "minimize"
    if any(k in g for k in ["increase", "higher", "maximize", "highest", "earn", "salary", "profit"]):
        return "maximize"
    return fallback_direction

def anchor_offer(direction: str, limit: float) -> float:
    """Calculates initial opening anchor offer based on limit boundary."""
    spread = limit * 0.15
    if direction == "minimize":
        return max(limit - spread, 1.0)
    else:
        return limit + spread

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
    """Pure rule-based decision fallback engine."""
    goal_direction = derive_direction_from_goal(goal, direction)

    within_limit = (
        incoming_value <= limit if goal_direction == "minimize" else incoming_value >= limit
    )

    gap = abs(own_last_value - incoming_value)
    comparison_base = max(abs(limit), abs(incoming_value), 1.0)
    close_enough = gap <= comparison_base * ACCEPTANCE_TOLERANCE

    if within_limit and close_enough:
        return {
            "decision": "accept",
            "next_value": incoming_value,
            "reasoning": f"Accepted {incoming_value} because it satisfies goal '{goal}' and stays within constraint limit of {limit}."
        }

    if not within_limit and round_num >= max_rounds:
        return {
            "decision": "reject",
            "next_value": own_last_value,
            "reasoning": f"Rejected {incoming_value} because it violates constraint limit of {limit} at final round {round_num}."
        }

    rate = CONCESSION_RATE.get(personality, 0.2)
    next_value = own_last_value + rate * (incoming_value - own_last_value)

    if goal_direction == "minimize":
        next_value = min(next_value, limit)
    else:
        next_value = max(next_value, limit)

    return {
        "decision": "counter",
        "next_value": round(next_value, 2),
        "reasoning": f"Countered at {round(next_value, 2)}. Persona '{personality}' concedes {int(rate*100)}% of gap toward {incoming_value}."
    }
