from app.services.decision_logic import (
    evaluate_offer,
    derive_limit_from_constraints,
    derive_direction_from_goal,
    rule_based_decide,
)


def test_evaluate_buyer_very_favorable_offer():
    """
    Buyer wants the lowest possible price.

    Target = 42500
    Maximum acceptable price = 50000
    Opponent offers 40000

    40000 is better than the buyer's target,
    so the offer should be very favorable.
    """

    result = evaluate_offer(
        goal="Lowest possible unit price",
        direction="minimize",
        target=42500,
        limit=50000,
        incoming_value=40000,
        own_last_value=40000,
        previous_offers=[40000],
        round_num=1,
        max_rounds=5,
    )

    assert result["classification"] == "very_favorable"
    assert result["within_limit"] is True
    assert result["opponent_value"] == 40000
    assert result["target_value"] == 42500
    assert result["limit"] == 50000


def test_evaluate_buyer_negotiable_offer():
    """
    Buyer target = 42500
    Buyer maximum = 50000
    Vendor offers 47000.

    The offer is within the buyer's maximum,
    but it is above the target, so it is negotiable.
    """

    result = evaluate_offer(
        goal="Lowest possible unit price",
        direction="minimize",
        target=42500,
        limit=50000,
        incoming_value=47000,
        own_last_value=42500,
        previous_offers=[40000, 42500],
        round_num=2,
        max_rounds=5,
    )

    assert result["classification"] == "negotiable"
    assert result["within_limit"] is True
    assert result["target_gap"] == 4500
    assert result["previous_offers"] == [40000, 42500]


def test_evaluate_buyer_unacceptable_offer():
    """
    Buyer maximum = 50000.
    Vendor offers 55000.

    The offer violates the buyer's hard limit.
    """

    result = evaluate_offer(
        goal="Lowest possible unit price",
        direction="minimize",
        target=42500,
        limit=50000,
        incoming_value=55000,
        own_last_value=42500,
        previous_offers=[40000, 42500],
        round_num=3,
        max_rounds=5,
    )

    assert result["classification"] == "unacceptable"
    assert result["within_limit"] is False
    assert result["opponent_value"] == 55000


def test_evaluate_vendor_negotiable_offer():
    """
    Vendor wants to maximize price.

    Target = 48000
    Minimum acceptable price = 42000
    Buyer offers 45000.

    45000 is above the minimum but below target,
    so it is negotiable.
    """

    result = evaluate_offer(
        goal="Maximize profit margin",
        direction="maximize",
        target=48000,
        limit=42000,
        incoming_value=45000,
        own_last_value=48000,
        previous_offers=[48000],
        round_num=2,
        max_rounds=5,
    )

    assert result["classification"] == "negotiable"
    assert result["within_limit"] is True
    assert result["direction"] == "maximize"


def test_evaluate_offer_uses_constraints():
    """
    Verify that explicit constraints are used
    when evaluating an offer.
    """

    result = evaluate_offer(
        goal="Lowest possible unit price",
        direction="minimize",
        target=42500,
        limit=60000,
        incoming_value=55000,
        own_last_value=42500,
        previous_offers=[40000, 42500],
        round_num=2,
        max_rounds=5,
        constraints={
            "maximum_price": 50000
        },
    )

    assert result["limit"] == 50000
    assert result["within_limit"] is False
    assert result["classification"] == "unacceptable"


def test_evaluate_offer_tracks_previous_movement():
    """
    Verify that previous offers are considered
    during evaluation.
    """

    result = evaluate_offer(
        goal="Lowest possible unit price",
        direction="minimize",
        target=42500,
        limit=50000,
        incoming_value=45000,
        own_last_value=42500,
        previous_offers=[40000, 42500],
        round_num=3,
        max_rounds=5,
    )

    assert result["previous_offers"] == [
        40000,
        42500
    ]

    assert result["previous_movement"] == 2500


def test_derive_limit_from_constraints():
    """
    Verify maximum and minimum price constraints.
    """

    buyer_constraint = derive_limit_from_constraints(
        {
            "maximum_price": 50000
        }
    )

    assert buyer_constraint["direction"] == "minimize"
    assert buyer_constraint["limit"] == 50000

    vendor_constraint = derive_limit_from_constraints(
        {
            "minimum_price": 42000
        }
    )

    assert vendor_constraint["direction"] == "maximize"
    assert vendor_constraint["limit"] == 42000


def test_derive_direction_from_goal():
    """
    Verify goal-based negotiation direction.
    """

    assert (
        derive_direction_from_goal(
            "Lowest possible unit price"
        )
        == "minimize"
    )

    assert (
        derive_direction_from_goal(
            "Maximize profit margin"
        )
        == "maximize"
    )


def test_rule_based_decision_contains_evaluation():
    """
    Verify that the existing rule-based decision
    now contains the offer evaluation result.
    """

    result = rule_based_decide(
        goal="Lowest possible unit price",
        direction="minimize",
        limit=50000,
        personality="Risk-averse",
        own_last_value=42500,
        incoming_value=47000,
        round_num=2,
        max_rounds=5,
    )

    assert result["decision"] in [
        "accept",
        "counter",
        "reject",
    ]

    assert "evaluation" in result

    assert (
        result["evaluation"]["opponent_value"]
        == 47000
    )


def test_generate_counteroffer_personalities():
    """
    Test counteroffer generation across Aggressive, Collaborative, and Risk-averse personalities.
    """
    from app.services.decision_logic import generate_counteroffer

    # Buyer at 42,500 receives vendor offer of 48,000 with limit 50,000
    agg = generate_counteroffer(42500, 48000, 50000, "minimize", "Aggressive", round_num=1)
    collab = generate_counteroffer(42500, 48000, 50000, "minimize", "Collaborative", round_num=1)
    risk = generate_counteroffer(42500, 48000, 50000, "minimize", "Risk-averse", round_num=1)

    # Aggressive makes smaller concession than Collaborative
    assert agg["counter_value"] < collab["counter_value"]
    assert risk["counter_value"] <= collab["counter_value"]
    assert agg["counter_value"] <= 50000.0
    assert collab["counter_value"] <= 50000.0


def test_track_concession_metrics():
    """
    Test concession tracking calculation, movement, and excessive step check.
    """
    from app.services.decision_logic import track_concession

    metrics = track_concession(
        initial_value=42500,
        current_value=45000,
        previous_value=42500,
        limit=50000,
        direction="minimize"
    )

    assert metrics["total_concession"] == 2500.0
    assert metrics["turn_concession"] == 2500.0
    assert metrics["concession_percentage"] == 33.33
    assert metrics["concession_valid"] is True
    assert metrics["is_excessive"] is False


def test_decisions_favorable_negotiable_unacceptable():
    """
    Test Accept, Counter, and Reject decisions based on offer evaluation.
    """
    # 1. Accept favorable offer
    accept_res = rule_based_decide(
        goal="Lowest price",
        direction="minimize",
        limit=50000,
        personality="Collaborative",
        own_last_value=42500,
        incoming_value=41000,
        round_num=1,
        max_rounds=5
    )
    assert accept_res["decision"] == "accept"

    # 2. Counter negotiable offer
    counter_res = rule_based_decide(
        goal="Lowest price",
        direction="minimize",
        limit=50000,
        personality="Collaborative",
        own_last_value=42500,
        incoming_value=47000,
        round_num=2,
        max_rounds=5
    )
    assert counter_res["decision"] == "counter"
    assert counter_res["next_value"] <= 50000.0

    # 3. Reject unacceptable offer at max round
    reject_res = rule_based_decide(
        goal="Lowest price",
        direction="minimize",
        limit=50000,
        personality="Collaborative",
        own_last_value=42500,
        incoming_value=60000,
        round_num=5,
        max_rounds=5
    )
    assert reject_res["decision"] == "reject"