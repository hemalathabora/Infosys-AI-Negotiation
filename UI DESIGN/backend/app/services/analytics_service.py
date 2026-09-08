from typing import List, Dict, Any

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

def total_concession_by_agent(timeline: Dict[str, List[Dict[str, Any]]]) -> Dict[str, float]:
    """Sum of absolute round-over-round moves per agent."""
    totals: Dict[str, float] = {}
    for agent_id, entries in timeline.items():
        total_delta = sum(abs(e.get("delta") or 0.0) for e in entries)
        totals[agent_id] = round(total_delta, 2)
    return totals

def calculate_negotiation_analytics(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Comprehensive Analytics engine calculating concession velocity, convergence index, and performance metrics.
    """
    history = state.get("history", [])
    timeline = build_concession_timeline(history)
    concession_totals = total_concession_by_agent(timeline)

    # Calculate gap convergence
    offers_with_values = []
    for turn in history:
        v = turn.get("value")
        if v is None and isinstance(turn.get("proposed_offer"), dict):
            v = turn.get("proposed_offer", {}).get("price")
        if v is not None:
            offers_with_values.append(float(v))

    opening_gap = abs(offers_with_values[1] - offers_with_values[0]) if len(offers_with_values) >= 2 else 0.0
    latest_gap = abs(offers_with_values[-1] - offers_with_values[-2]) if len(offers_with_values) >= 2 else 0.0
    convergence_rate = round(((opening_gap - latest_gap) / opening_gap * 100), 1) if opening_gap > 0 else 100.0

    return {
        "negotiation_id": state.get("negotiation_id"),
        "total_rounds": state.get("current_round", 0),
        "status": state.get("status"),
        "timeline": timeline,
        "concession_totals": concession_totals,
        "opening_gap": round(opening_gap, 2),
        "latest_gap": round(latest_gap, 2),
        "convergence_rate_percent": max(0.0, min(100.0, convergence_rate)),
        "total_turns": len(history)
    }
