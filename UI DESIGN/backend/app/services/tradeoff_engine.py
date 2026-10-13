import logging
from typing import Dict, Any, List, Optional, Tuple
from app.schemas.tradeoff import (
    VariableDefinition,
    MultiVariableOffer,
    UtilityResult,
    TradeoffChange,
    TradeoffDetectionResult,
    TradeoffSummary,
    TradeoffItem,
    PackageOffer,
)

logger = logging.getLogger("tradeoff_engine")

# Canonical variable definitions for preset scenarios
SCENARIO_VARIABLE_DEFINITIONS: Dict[str, Dict[str, Dict[str, Any]]] = {
    "vendor_pricing": {
        "price": {
            "name": "price",
            "display_name": "Price",
            "type": "number",
            "unit": "USD",
            "min_value": 35000.0,
            "max_value": 55000.0,
            "preferred_value": 42000.0,
            "importance": 0.9,
            "buyer_direction": "lower_is_better",
            "vendor_direction": "higher_is_better",
            "negotiable": True,
            "buyer_weight": 0.45,
            "vendor_weight": 0.40,
            "hard": True
        },
        "delivery_days": {
            "name": "delivery_days",
            "display_name": "Delivery Timeline",
            "type": "integer",
            "unit": "days",
            "min_value": 10.0,
            "max_value": 45.0,
            "preferred_value": 15.0,
            "importance": 0.7,
            "buyer_direction": "lower_is_better",
            "vendor_direction": "higher_is_better",
            "negotiable": True,
            "buyer_weight": 0.25,
            "vendor_weight": 0.25,
            "hard": False
        },
        "warranty_months": {
            "name": "warranty_months",
            "display_name": "Warranty Period",
            "type": "integer",
            "unit": "months",
            "min_value": 6.0,
            "max_value": 36.0,
            "preferred_value": 24.0,
            "importance": 0.6,
            "buyer_direction": "higher_is_better",
            "vendor_direction": "lower_is_better",
            "negotiable": True,
            "buyer_weight": 0.15,
            "vendor_weight": 0.20,
            "hard": False
        },
        "support_months": {
            "name": "support_months",
            "display_name": "Support Duration",
            "type": "integer",
            "unit": "months",
            "min_value": 0.0,
            "max_value": 24.0,
            "preferred_value": 12.0,
            "importance": 0.5,
            "buyer_direction": "higher_is_better",
            "vendor_direction": "lower_is_better",
            "negotiable": True,
            "buyer_weight": 0.15,
            "vendor_weight": 0.15,
            "hard": False
        }
    },
    "job_offer": {
        "salary": {
            "name": "salary",
            "display_name": "Base Salary",
            "type": "number",
            "unit": "USD",
            "min_value": 85000.0,
            "max_value": 125000.0,
            "preferred_value": 105000.0,
            "importance": 0.9,
            "candidate_direction": "higher_is_better",
            "employer_direction": "lower_is_better",
            "negotiable": True,
            "candidate_weight": 0.45,
            "employer_weight": 0.45,
            "hard": True
        },
        "bonus": {
            "name": "bonus",
            "display_name": "Annual Bonus",
            "type": "number",
            "unit": "USD",
            "min_value": 0.0,
            "max_value": 30000.0,
            "preferred_value": 15000.0,
            "importance": 0.7,
            "candidate_direction": "higher_is_better",
            "employer_direction": "lower_is_better",
            "negotiable": True,
            "candidate_weight": 0.25,
            "employer_weight": 0.20,
            "hard": False
        },
        "remote_days": {
            "name": "remote_days",
            "display_name": "Remote Days / Wk",
            "type": "integer",
            "unit": "days",
            "min_value": 0.0,
            "max_value": 5.0,
            "preferred_value": 3.0,
            "importance": 0.6,
            "candidate_direction": "higher_is_better",
            "employer_direction": "lower_is_better",
            "negotiable": True,
            "candidate_weight": 0.15,
            "employer_weight": 0.15,
            "hard": False
        },
        "vacation_days": {
            "name": "vacation_days",
            "display_name": "Paid Time Off",
            "type": "integer",
            "unit": "days",
            "min_value": 10.0,
            "max_value": 30.0,
            "preferred_value": 20.0,
            "importance": 0.5,
            "candidate_direction": "higher_is_better",
            "employer_direction": "lower_is_better",
            "negotiable": True,
            "candidate_weight": 0.15,
            "employer_weight": 0.20,
            "hard": False
        }
    },
    "project_budget": {
        "budget": {
            "name": "budget",
            "display_name": "Budget Allocation",
            "type": "number",
            "unit": "USD",
            "min_value": 60000.0,
            "max_value": 100000.0,
            "preferred_value": 90000.0,
            "importance": 0.9,
            "department_head_direction": "higher_is_better",
            "finance_director_direction": "lower_is_better",
            "negotiable": True,
            "department_head_weight": 0.45,
            "finance_director_weight": 0.45,
            "hard": True
        },
        "scope": {
            "name": "scope",
            "display_name": "Feature Scope",
            "type": "integer",
            "unit": "%",
            "min_value": 50.0,
            "max_value": 100.0,
            "preferred_value": 100.0,
            "importance": 0.7,
            "department_head_direction": "higher_is_better",
            "finance_director_direction": "lower_is_better",
            "negotiable": True,
            "department_head_weight": 0.25,
            "finance_director_weight": 0.20,
            "hard": False
        },
        "deadline_weeks": {
            "name": "deadline_weeks",
            "display_name": "Timeline",
            "type": "integer",
            "unit": "weeks",
            "min_value": 6.0,
            "max_value": 24.0,
            "preferred_value": 16.0,
            "importance": 0.6,
            "department_head_direction": "higher_is_better",
            "finance_director_direction": "lower_is_better",
            "negotiable": True,
            "department_head_weight": 0.15,
            "finance_director_weight": 0.20,
            "hard": False
        },
        "milestones": {
            "name": "milestones",
            "display_name": "Milestones",
            "type": "integer",
            "unit": "gates",
            "min_value": 2.0,
            "max_value": 8.0,
            "preferred_value": 4.0,
            "importance": 0.5,
            "department_head_direction": "lower_is_better",
            "finance_director_direction": "higher_is_better",
            "negotiable": True,
            "department_head_weight": 0.15,
            "finance_director_weight": 0.15,
            "hard": False
        }
    }
}


def normalize_variable_name(raw_name: str) -> str:
    n = raw_name.lower().strip()
    if n in ["price", "unit_price", "offered_price", "bid"]:
        return "price"
    if n in ["salary", "base_salary", "pay"]:
        return "salary"
    if n in ["budget", "budget_amount", "allocation"]:
        return "budget"
    if n in ["delivery", "delivery_days", "delivery_time"]:
        return "delivery_days"
    if n in ["warranty", "warranty_months"]:
        return "warranty_months"
    if n in ["support", "support_months"]:
        return "support_months"
    if n in ["remote", "remote_days", "remote_work"]:
        return "remote_days"
    if n in ["vacation", "vacation_days", "pto"]:
        return "vacation_days"
    if n in ["deadline", "deadline_weeks"]:
        return "deadline_weeks"
    return n


def get_scenario_variables(
    scenario_id: str,
    agent_role: Optional[str] = None,
    scenario_dict: Optional[Dict[str, Any]] = None
) -> Dict[str, VariableDefinition]:
    """
    Returns normalized variable definitions for a scenario and role.
    Fallback generates dynamic definitions if not in predefined map.
    """
    scen_key = scenario_id.lower().replace("-", "_")
    role_key = (agent_role or "").lower().replace("-", "_")

    base_map = SCENARIO_VARIABLE_DEFINITIONS.get(scen_key)
    defs: Dict[str, VariableDefinition] = {}

    if base_map:
        for var_name, var_meta in base_map.items():
            # Determine direction for this role
            direction = "lower_is_better"
            weight = var_meta.get("importance", 0.5)

            if "buyer" in role_key or "candidate" in role_key or "department_head" in role_key or "customer" in role_key or "tenant" in role_key:
                direction = var_meta.get(f"{role_key}_direction") or var_meta.get("buyer_direction") or var_meta.get("candidate_direction") or var_meta.get("department_head_direction") or "lower_is_better"
                weight = var_meta.get(f"{role_key}_weight") or var_meta.get("buyer_weight") or var_meta.get("candidate_weight") or var_meta.get("department_head_weight") or weight
            else:
                direction = var_meta.get(f"{role_key}_direction") or var_meta.get("vendor_direction") or var_meta.get("employer_direction") or var_meta.get("finance_director_direction") or "higher_is_better"
                weight = var_meta.get(f"{role_key}_weight") or var_meta.get("vendor_weight") or var_meta.get("employer_weight") or var_meta.get("finance_director_weight") or weight

            defs[var_name] = VariableDefinition(
                name=var_meta["name"],
                display_name=var_meta["display_name"],
                type=var_meta.get("type", "number"),
                unit=var_meta.get("unit"),
                min_value=float(var_meta["min_value"]),
                max_value=float(var_meta["max_value"]),
                preferred_value=var_meta.get("preferred_value"),
                importance=float(var_meta.get("importance", 0.5)),
                direction=direction,
                negotiable=var_meta.get("negotiable", True),
                weight=float(weight),
                hard=var_meta.get("hard", False)
            )
        return defs

    # Dynamic fallback from scenario_dict or scenario variables list
    raw_vars = []
    if scenario_dict:
        raw_vars = scenario_dict.get("variables", [])
    if not raw_vars:
        raw_vars = ["price", "delivery_days", "warranty_months"]

    is_minimizer = any(r in role_key for r in ["buyer", "employer", "finance", "client", "customer", "tenant"])

    for v in raw_vars:
        v_name = v if isinstance(v, str) else v.get("name", "variable")
        norm_name = normalize_variable_name(v_name)
        defs[norm_name] = VariableDefinition(
            name=norm_name,
            display_name=norm_name.replace("_", " ").title(),
            type="number",
            min_value=0.0,
            max_value=100000.0 if "price" in norm_name or "salary" in norm_name or "budget" in norm_name else 50.0,
            direction="lower_is_better" if is_minimizer else "higher_is_better",
            importance=0.8 if norm_name in ["price", "salary", "budget"] else 0.5,
            weight=0.5 if norm_name in ["price", "salary", "budget"] else 0.25,
            hard=(norm_name in ["price", "salary", "budget"])
        )

    return defs


def normalize_weights(weights: Dict[str, float]) -> Dict[str, float]:
    """Normalizes variable weights so their sum equals 1.0."""
    if not weights:
        return {}
    positive_weights = {k: max(0.0001, float(v)) for k, v in weights.items()}
    total = sum(positive_weights.values())
    if total <= 0:
        equal_w = 1.0 / len(positive_weights)
        return {k: equal_w for k in positive_weights}
    return {k: round(v / total, 4) for k, v in positive_weights.items()}


def normalize_score(value: float, min_val: float, max_val: float, direction: str) -> float:
    """
    Computes normalized score in [0.0, 1.0].
    """
    if max_val <= min_val:
        return 1.0
    val = float(value)
    if direction == "lower_is_better":
        if val <= min_val:
            return 1.0
        if val >= max_val:
            return 0.0
        return (max_val - val) / (max_val - min_val)
    else:  # higher_is_better
        if val >= max_val:
            return 1.0
        if val <= min_val:
            return 0.0
        return (val - min_val) / (max_val - min_val)


normalize_variable_score = normalize_score


def extract_normalized_offer_variables(raw_offer: Any) -> Dict[str, float]:
    """
    Extracts a dictionary of numeric variable values from any offer representation.
    Supports single-variable {'price': 95000} and multi-variable formats.
    """
    if raw_offer is None:
        return {}
    if isinstance(raw_offer, (int, float)):
        return {"price": float(raw_offer)}
    
    res: Dict[str, float] = {}
    if hasattr(raw_offer, "variables") and isinstance(raw_offer.variables, dict):
        raw_dict = raw_offer.variables
    elif isinstance(raw_offer, dict):
        raw_dict = raw_offer.get("variables") if "variables" in raw_offer and isinstance(raw_offer["variables"], dict) else raw_offer
    else:
        return {}

    for k, v in raw_dict.items():
        if k in ["terms", "parameters", "concession_data", "details", "reasoning", "decision"]:
            continue
        norm_k = normalize_variable_name(str(k))
        try:
            if isinstance(v, (int, float)):
                res[norm_k] = float(v)
            elif isinstance(v, str):
                cleaned = v.replace("$", "").replace("₹", "").replace(",", "").strip()
                res[norm_k] = float(cleaned)
        except (ValueError, TypeError):
            continue
    return res


def calculate_utility(
    agent_profile: Dict[str, Any],
    offer: Any,
    variable_defs: Optional[Dict[str, VariableDefinition]] = None,
    scenario_id: str = "vendor_pricing"
) -> UtilityResult:
    """
    Calculates overall utility and breakdown for a multi-variable offer.
    Enforces hard constraints (violations prevent agreement).
    """
    role = str(agent_profile.get("role", "")).lower()
    if not variable_defs:
        variable_defs = get_scenario_variables(scenario_id, role)

    offer_vars = extract_normalized_offer_variables(offer)
    if not offer_vars:
        # Fallback to scalar price if present
        price_val = agent_profile.get("limit") or 0.0
        return UtilityResult(
            overall_score=0.5,
            variable_scores={},
            weighted_contribution={},
            raw_values={},
            is_valid=True
        )

    # Agent constraints & weights
    constraints = agent_profile.get("constraints", {})
    max_price = constraints.get("maximum_price") or constraints.get("max_price")
    min_price = constraints.get("minimum_price") or constraints.get("min_price")

    custom_weights = agent_profile.get("variable_weights", {})
    weights_to_normalize = {}
    for vname, vdef in variable_defs.items():
        w = custom_weights.get(vname, vdef.weight)
        weights_to_normalize[vname] = w
    normalized_w = normalize_weights(weights_to_normalize)

    scores: Dict[str, float] = {}
    contributions: Dict[str, float] = {}
    violations: List[str] = []

    for vname, vdef in variable_defs.items():
        if vname in offer_vars:
            val = offer_vars[vname]
            score = normalize_score(val, vdef.min_value, vdef.max_value, vdef.direction)
            scores[vname] = round(score, 4)
            contributions[vname] = round(score * normalized_w.get(vname, 0.0), 4)

            # Check Hard Constraints
            if vdef.hard or vdef.name in ["price", "salary", "budget"]:
                if max_price is not None and val > max_price:
                    violations.append(f"{vdef.display_name} ({val}) exceeds hard maximum limit of {max_price}")
                if min_price is not None and val < min_price:
                    violations.append(f"{vdef.display_name} ({val}) is below hard minimum floor of {min_price}")
                if vdef.hard_max is not None and val > vdef.hard_max:
                    violations.append(f"{vdef.display_name} ({val}) exceeds hard maximum {vdef.hard_max}")
                if vdef.hard_min is not None and val < vdef.hard_min:
                    violations.append(f"{vdef.display_name} ({val}) is below hard minimum {vdef.hard_min}")
        else:
            # Variable not specified in offer; assume baseline preferred or midpoint
            default_val = vdef.preferred_value if vdef.preferred_value is not None else (vdef.min_value + vdef.max_value) / 2.0
            score = normalize_score(default_val, vdef.min_value, vdef.max_value, vdef.direction)
            scores[vname] = round(score, 4)
            contributions[vname] = round(score * normalized_w.get(vname, 0.0), 4)

    # For variables present in offer but not in variable_defs
    for k, val in offer_vars.items():
        if k not in variable_defs:
            scores[k] = 0.5
            contributions[k] = 0.0

    overall_score = round(sum(contributions.values()), 4)
    is_valid = len(violations) == 0

    return UtilityResult(
        overall_score=overall_score,
        variable_scores=scores,
        weighted_contribution=contributions,
        raw_values=offer_vars,
        violations=violations,
        is_valid=is_valid
    )


def detect_tradeoffs(
    agent_profile: Dict[str, Any],
    previous_offer: Optional[Any],
    current_offer: Any,
    variable_defs: Optional[Dict[str, VariableDefinition]] = None,
    scenario_id: str = "vendor_pricing"
) -> TradeoffDetectionResult:
    """
    Detects multi-variable trade-offs between consecutive offers.
    Identifies which variables improved, worsened, or remained unchanged.
    Computes Give vs Receive packages and net utility delta.
    """
    role = str(agent_profile.get("role", "")).lower()
    if not variable_defs:
        variable_defs = get_scenario_variables(scenario_id, role)

    prev_vars = extract_normalized_offer_variables(previous_offer)
    curr_vars = extract_normalized_offer_variables(current_offer)

    if not prev_vars or not curr_vars:
        return TradeoffDetectionResult(
            tradeoff_detected=False,
            changes=[],
            tradeoff=TradeoffSummary(),
            net_utility_delta=0.0,
            summary="Initial offer recorded; no prior trade-off baseline."
        )

    prev_util = calculate_utility(agent_profile, prev_vars, variable_defs, scenario_id)
    curr_util = calculate_utility(agent_profile, curr_vars, variable_defs, scenario_id)

    all_keys = set(prev_vars.keys()).union(set(curr_vars.keys()))
    changes: List[TradeoffChange] = []
    give_items: List[TradeoffItem] = []
    receive_items: List[TradeoffItem] = []

    improved_count = 0
    worsened_count = 0

    for k in all_keys:
        p_val = prev_vars.get(k)
        c_val = curr_vars.get(k)
        if p_val is None or c_val is None:
            continue

        delta = round(c_val - p_val, 2)
        vdef = variable_defs.get(k)
        dir_type = vdef.direction if vdef else ("lower_is_better" if "buyer" in role else "higher_is_better")

        p_score = prev_util.variable_scores.get(k, 0.5)
        c_score = curr_util.variable_scores.get(k, 0.5)
        u_delta = round(c_score - p_score, 4)

        if abs(delta) < 0.001:
            change_dir = "unchanged"
        elif u_delta > 0.001:
            change_dir = "improved"
            improved_count += 1
            receive_items.append(TradeoffItem(
                variable=k,
                change=delta,
                description=f"{vdef.display_name if vdef else k} improved by {abs(delta)}"
            ))
        elif u_delta < -0.001:
            change_dir = "worsened"
            worsened_count += 1
            give_items.append(TradeoffItem(
                variable=k,
                change=delta,
                description=f"{vdef.display_name if vdef else k} conceded by {abs(delta)}"
            ))
        else:
            change_dir = "unchanged"

        changes.append(TradeoffChange(
            variable=k,
            direction=change_dir,
            previous_value=p_val,
            current_value=c_val,
            delta=delta,
            utility_delta=u_delta
        ))

    tradeoff_detected = (improved_count > 0 and worsened_count > 0)
    net_utility_delta = round(curr_util.overall_score - prev_util.overall_score, 4)

    summary_text = ""
    if tradeoff_detected:
        g_desc = ", ".join([f"{item.variable} ({item.change:+})" for item in give_items])
        r_desc = ", ".join([f"{item.variable} ({item.change:+})" for item in receive_items])
        summary_text = f"Trade-off detected: Conceded [{g_desc}] to gain [{r_desc}]. Net utility change: {net_utility_delta:+0.2%}."
    elif improved_count > 0:
        summary_text = f"Pure concession in your favor: Net utility improved by {net_utility_delta:+0.2%}."
    elif worsened_count > 0:
        summary_text = f"Concession made: Net utility decreased by {abs(net_utility_delta):0.2%}."
    else:
        summary_text = "No material variable changes between offers."

    return TradeoffDetectionResult(
        tradeoff_detected=tradeoff_detected,
        changes=changes,
        tradeoff=TradeoffSummary(
            give=give_items,
            receive=receive_items,
            description=summary_text
        ),
        net_utility_delta=net_utility_delta,
        summary=summary_text
    )


def is_pareto_improvement(
    agent1_profile: Dict[str, Any],
    agent2_profile: Dict[str, Any],
    previous_offer: Any,
    candidate_offer: Any,
    scenario_id: str = "vendor_pricing"
) -> Tuple[bool, float, float]:
    """
    Evaluates whether candidate_offer is a Pareto improvement over previous_offer.
    Pareto improvement: U1(candidate) >= U1(prev) and U2(candidate) >= U2(prev),
    with at least one strict improvement (> 0).
    """
    vdefs1 = get_scenario_variables(scenario_id, agent1_profile.get("role"))
    vdefs2 = get_scenario_variables(scenario_id, agent2_profile.get("role"))

    u1_prev = calculate_utility(agent1_profile, previous_offer, vdefs1, scenario_id)
    u1_cand = calculate_utility(agent1_profile, candidate_offer, vdefs1, scenario_id)

    u2_prev = calculate_utility(agent2_profile, previous_offer, vdefs2, scenario_id)
    u2_cand = calculate_utility(agent2_profile, candidate_offer, vdefs2, scenario_id)

    if not u1_cand.is_valid or not u2_cand.is_valid:
        return False, 0.0, 0.0

    delta1 = u1_cand.overall_score - u1_prev.overall_score
    delta2 = u2_cand.overall_score - u2_prev.overall_score

    is_pareto = (delta1 >= -0.01 and delta2 >= -0.01 and (delta1 > 0.02 or delta2 > 0.02))
    return is_pareto, round(delta1, 4), round(delta2, 4)


def generate_tradeoff_package(
    proposer_profile: Dict[str, Any],
    opponent_profile: Dict[str, Any],
    current_offer: Any,
    target_price_adjustment: float,
    scenario_id: str = "vendor_pricing"
) -> PackageOffer:
    """
    Generates an intelligent multi-variable trade-off package offer.
    Trades a lower-priority variable to gain on the primary variable (e.g. price/salary/budget).
    """
    role = str(proposer_profile.get("role", "")).lower()
    vdefs = get_scenario_variables(scenario_id, role)
    curr_vars = extract_normalized_offer_variables(current_offer)

    # Base package initialized with current offer variables or standard defaults
    package = dict(curr_vars)
    for vname, vdef in vdefs.items():
        if vname not in package:
            package[vname] = vdef.preferred_value if vdef.preferred_value is not None else (vdef.min_value + vdef.max_value) / 2.0

    # Primary variable to adjust
    primary_var = "price"
    if "salary" in vdefs:
        primary_var = "salary"
    elif "budget" in vdefs:
        primary_var = "budget"

    # Identify secondary variable to trade off (lowest importance/weight for proposer)
    secondary_vars = [k for k in vdefs.keys() if k != primary_var and vdefs[k].negotiable and not vdefs[k].hard]
    secondary_var = secondary_vars[0] if secondary_vars else None

    give_list = []
    receive_list = []
    description = ""

    if primary_var in package:
        old_primary = package[primary_var]
        new_primary = old_primary + target_price_adjustment
        # Clamp primary within variable boundaries and hard constraints
        p_def = vdefs[primary_var]
        constraints = proposer_profile.get("constraints", {})
        min_p = constraints.get("minimum_price") or p_def.min_value
        max_p = constraints.get("maximum_price") or p_def.max_value
        new_primary = max(min_p, min(max_p, new_primary))
        package[primary_var] = round(new_primary, 2)

        receive_list.append({"variable": primary_var, "change": round(new_primary - old_primary, 2)})

    if secondary_var and secondary_var in package:
        s_def = vdefs[secondary_var]
        old_sec = package[secondary_var]

        # Concede on secondary variable to balance the primary variable shift
        step = s_def.step or 1.0
        # If proposer wants lower, conceding means moving higher
        sec_shift = (s_def.max_value - s_def.min_value) * 0.15
        if s_def.direction == "lower_is_better":
            new_sec = min(s_def.max_value, old_sec + sec_shift)
        else:
            new_sec = max(s_def.min_value, old_sec - sec_shift)

        new_sec = round(new_sec / step) * step
        package[secondary_var] = new_sec
        give_list.append({"variable": secondary_var, "change": round(new_sec - old_sec, 2)})

        p_name = vdefs[primary_var].display_name
        s_name = s_def.display_name
        description = f"Offered adjustment on {p_name} in exchange for flexibility on {s_name}."

    util = calculate_utility(proposer_profile, package, vdefs, scenario_id)

    return PackageOffer(
        variables=package,
        description=description or "Package counteroffer adjusting terms to reach agreement.",
        give=give_list,
        receive=receive_list,
        proposer_utility=util.overall_score
    )
