from typing import List, Dict, Any
from app.services.concession_tracking import (
    generate_concession_analysis,
    extract_scalar_price
)

def build_concession_timeline(history: List[Dict[str, Any]]) -> Dict[str, List[Dict[str, Any]]]:
    """
    Builds per-agent concession timeline tracking value sequences, deltas, and move directions across rounds.
    """
    by_agent: Dict[str, List[Dict[str, Any]]] = {}
    for offer in history:
        agent_id = offer.get("agent_id")
        if not agent_id:
            continue
        by_agent.setdefault(agent_id, []).append(offer)

    timeline: Dict[str, List[Dict[str, Any]]] = {}
    for agent_id, offers in by_agent.items():
        sorted_offers = sorted(offers, key=lambda x: x.get("round", 0))
        agent_timeline = []
        for i, offer in enumerate(sorted_offers):
            val = offer.get("value")
            if val is None and isinstance(offer.get("proposed_offer"), dict):
                val = offer.get("proposed_offer", {}).get("price") or offer.get("proposed_offer", {}).get("value")
            val = float(val) if val is not None else 0.0

            if i == 0:
                agent_timeline.append({
                    "round": offer.get("round", 1),
                    "value": val,
                    "delta": None,
                    "direction": "opening"
                })
            else:
                prev_val = sorted_offers[i - 1].get("value")
                if prev_val is None and isinstance(sorted_offers[i - 1].get("proposed_offer"), dict):
                    prev_val = sorted_offers[i - 1].get("proposed_offer", {}).get("price")
                prev_val = float(prev_val) if prev_val is not None else val
                delta = val - prev_val
                direction = "hold" if delta == 0 else "concession"
                agent_timeline.append({
                    "round": offer.get("round", i + 1),
                    "value": val,
                    "delta": round(delta, 2),
                    "direction": direction
                })
        timeline[agent_id] = agent_timeline

    return timeline


def calculate_negotiation_analytics(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Steps 10, 13, 14, 15: Comprehensive Analytics Engine.
    Uses real negotiation history and agent profiles to calculate authoritative concession metrics,
    rate of concession decay, convergence rate, and per-agent analysis.
    """
    history = state.get("history", [])
    participating_agents = state.get("participating_agents", [])
    timeline = build_concession_timeline(history)

    # Perform full concession analysis per agent
    agent_analytics: Dict[str, Dict[str, Any]] = {}
    concession_totals: Dict[str, float] = {}

    for agent in participating_agents:
        agent_id = agent.get("id")
        if not agent_id:
            continue
        analysis = generate_concession_analysis(agent, history, state)
        agent_analytics[agent_id] = analysis
        concession_totals[agent_id] = analysis["total_concession"]

    # Fallback for agents in history not explicitly in participating_agents list
    by_agent: Dict[str, List[Dict[str, Any]]] = {}
    for offer in history:
        aid = offer.get("agent_id")
        if aid and aid not in agent_analytics:
            by_agent.setdefault(aid, []).append(offer)

    for aid, offers in by_agent.items():
        role = "buyer" if ("buyer" in aid.lower() or "1" in aid) else "vendor"
        fallback_profile = {"id": aid, "role": role, "persona": "Collaborative"}
        analysis = generate_concession_analysis(fallback_profile, history, state)
        agent_analytics[aid] = analysis
        concession_totals[aid] = analysis["total_concession"]

    # Calculate gap convergence across distinct agents
    agent_offers_map: Dict[str, List[float]] = {}
    for turn in history:
        aid = turn.get("agent_id")
        if not aid:
            continue
        v = extract_scalar_price(turn.get("proposed_offer"))
        if v is None:
            v = turn.get("value")
        if v is not None:
            agent_offers_map.setdefault(aid, []).append(float(v))

    agent_ids = list(agent_offers_map.keys())
    if len(agent_ids) >= 2:
        a1_offers = agent_offers_map[agent_ids[0]]
        a2_offers = agent_offers_map[agent_ids[1]]
        opening_gap = abs(a1_offers[0] - a2_offers[0])
        latest_gap = abs(a1_offers[-1] - a2_offers[-1])
        convergence_rate = round(((opening_gap - latest_gap) / opening_gap * 100), 1) if opening_gap > 0 else 100.0
    else:
        opening_gap = 0.0
        latest_gap = 0.0
        convergence_rate = 0.0

    # Multi-variable & Trade-off Analytics
    distinct_vars = set()
    tradeoffs_detected = 0
    package_offers_count = 0
    pareto_improvements_count = 0
    violations_prevented = 0
    var_concessions: Dict[str, float] = {}
    utility_history: List[float] = []

    for turn in history:
        prop = turn.get("proposed_offer") or {}
        if isinstance(prop, dict):
            vars_in_turn = [k for k in prop.keys() if k not in ["terms", "parameters", "concession_data", "details", "reasoning", "decision"]]
            distinct_vars.update(vars_in_turn)
            if len(vars_in_turn) > 1:
                package_offers_count += 1

        t_data = turn.get("tradeoff_data") or turn.get("parameters", {}).get("tradeoff_analysis") or {}
        if t_data.get("tradeoff_detected"):
            tradeoffs_detected += 1
        if t_data.get("pareto_improvement"):
            pareto_improvements_count += 1

        u_data = turn.get("utility_data") or turn.get("parameters", {}).get("utility_analysis") or {}
        if "overall_score" in u_data:
            utility_history.append(float(u_data["overall_score"]))

        if turn.get("parameters", {}).get("adjusted_due_to_constraint") or turn.get("parameters", {}).get("adjusted_due_to_concession_control"):
            violations_prevented += 1

        # Variable-level concessions from tradeoff changes
        changes = t_data.get("changes") or []
        for ch in changes:
            vname = ch.get("variable")
            delta = abs(float(ch.get("delta") or 0.0))
            if vname:
                var_concessions[vname] = round(var_concessions.get(vname, 0.0) + delta, 2)

    avg_utility = round(sum(utility_history) / len(utility_history) * 100, 1) if utility_history else 75.0
    util_improvement = round((utility_history[-1] - utility_history[0]) * 100, 1) if len(utility_history) >= 2 else 0.0
    most_important_var = max(var_concessions, key=var_concessions.get) if var_concessions else "price"

    tradeoffs_accepted = 1 if (tradeoffs_detected > 0 and state.get("status") in ["accepted", "agreement"]) else 0

    tradeoff_analytics = {
        "variables_negotiated_count": len(distinct_vars) if distinct_vars else 1,
        "distinct_variables": list(distinct_vars),
        "tradeoffs_detected": tradeoffs_detected,
        "tradeoffs_accepted": tradeoffs_accepted,
        "average_utility": avg_utility,
        "utility_improvement": util_improvement,
        "variable_level_concessions": var_concessions,
        "package_offers_count": package_offers_count,
        "pareto_improvements_count": pareto_improvements_count,
        "constraint_violations_prevented": violations_prevented,
        "most_important_negotiated_variable": most_important_var
    }

    return {
        "negotiation_id": state.get("negotiation_id"),
        "scenario_id": state.get("scenario_id"),
        "total_rounds": state.get("current_round", 0),
        "status": state.get("status"),
        "mode": state.get("mode"),
        "timeline": timeline,
        "concession_totals": concession_totals,
        "agent_analytics": agent_analytics,
        "tradeoff_analytics": tradeoff_analytics,
        "opening_gap": round(opening_gap, 2),
        "latest_gap": round(latest_gap, 2),
        "convergence_rate_percent": max(0.0, min(100.0, convergence_rate)),
        "total_turns": len(history)
    }
