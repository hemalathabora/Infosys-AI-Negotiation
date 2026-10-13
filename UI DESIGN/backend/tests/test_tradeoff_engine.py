import pytest
from app.services.tradeoff_engine import (
    get_scenario_variables,
    normalize_score,
    normalize_weights,
    calculate_utility,
    detect_tradeoffs,
    is_pareto_improvement,
    generate_tradeoff_package,
    extract_normalized_offer_variables,
    MultiVariableOffer
)
from app.services.practice_service import (
    get_difficulty_settings,
    parse_natural_language_offer,
    calculate_ai_stance,
    generate_strategy_coaching,
    generate_negotiation_hint,
    calculate_negotiation_scorecard
)

# ============================================================
# 1. VARIABLE DEFINITIONS & NORMALIZATION TESTS
# ============================================================

def test_get_scenario_variables_vendor_pricing():
    buyer_vars = get_scenario_variables("vendor_pricing", "buyer")
    assert "price" in buyer_vars
    assert "delivery_days" in buyer_vars
    assert "warranty_months" in buyer_vars
    assert buyer_vars["price"].direction == "lower_is_better"
    assert buyer_vars["delivery_days"].direction == "lower_is_better"
    assert buyer_vars["warranty_months"].direction == "higher_is_better"

    vendor_vars = get_scenario_variables("vendor_pricing", "vendor")
    assert vendor_vars["price"].direction == "higher_is_better"
    assert vendor_vars["delivery_days"].direction == "higher_is_better"
    assert vendor_vars["warranty_months"].direction == "lower_is_better"

def test_get_scenario_variables_job_offer_and_budget():
    job_vars = get_scenario_variables("job_offer", "candidate")
    assert "salary" in job_vars
    assert job_vars["salary"].direction == "higher_is_better"

    budget_vars = get_scenario_variables("project_budget", "department_head")
    assert "budget" in budget_vars
    assert budget_vars["budget"].direction == "higher_is_better"

def test_normalize_score():
    # Lower is better: min=10, max=50
    assert normalize_score(10, 10, 50, "lower_is_better") == 1.0
    assert normalize_score(50, 10, 50, "lower_is_better") == 0.0
    assert normalize_score(30, 10, 50, "lower_is_better") == 0.5
    assert normalize_score(5, 10, 50, "lower_is_better") == 1.0
    assert normalize_score(60, 10, 50, "lower_is_better") == 0.0

    # Higher is better: min=100, max=200
    assert normalize_score(200, 100, 200, "higher_is_better") == 1.0
    assert normalize_score(100, 100, 200, "higher_is_better") == 0.0
    assert normalize_score(150, 100, 200, "higher_is_better") == 0.5

def test_normalize_weights():
    weights = {"price": 50, "delivery": 25, "warranty": 15, "support": 10}
    norm = normalize_weights(weights)
    assert abs(sum(norm.values()) - 1.0) < 0.001
    assert norm["price"] == 0.5

# ============================================================
# 2. MULTI-VARIABLE OFFER EXTRACTION & UTILITY TESTS
# ============================================================

def test_single_variable_offer_backward_compatibility():
    raw_single = {"price": 44000}
    mv = MultiVariableOffer.from_any_offer(raw_single)
    assert mv.get_scalar_price() == 44000.0

    agent = {"role": "buyer", "constraints": {"maximum_price": 50000}}
    util = calculate_utility(agent, raw_single, scenario_id="vendor_pricing")
    assert util.is_valid is True
    assert 0.0 <= util.overall_score <= 1.0
    assert "price" in util.raw_values

def test_multi_variable_offer_utility_calculation():
    offer = {
        "price": 42000,
        "delivery_days": 15,
        "warranty_months": 24,
        "support_months": 12
    }
    buyer = {
        "role": "buyer",
        "constraints": {"maximum_price": 50000},
        "variable_weights": {"price": 0.5, "delivery_days": 0.25, "warranty_months": 0.15, "support_months": 0.1}
    }
    util = calculate_utility(buyer, offer, scenario_id="vendor_pricing")
    assert util.is_valid is True
    assert util.overall_score > 0.6  # Very favorable to buyer
    assert "price" in util.variable_scores
    assert "delivery_days" in util.variable_scores
    assert "warranty_months" in util.variable_scores
    assert sum(util.weighted_contribution.values()) == pytest.approx(util.overall_score, abs=0.01)

# ============================================================
# 3. HARD CONSTRAINTS VS SOFT PREFERENCES
# ============================================================

def test_hard_constraint_violation_flagged():
    buyer = {
        "role": "buyer",
        "constraints": {"maximum_price": 50000}  # Hard ceiling
    }
    # Offer has amazing warranty and delivery, but price exceeds hard budget
    offer = {
        "price": 55000,
        "delivery_days": 10,
        "warranty_months": 36,
        "support_months": 24
    }
    util = calculate_utility(buyer, offer, scenario_id="vendor_pricing")
    assert util.is_valid is False
    assert len(util.violations) >= 1
    assert "exceeds hard maximum" in util.violations[0].lower()

def test_soft_preferences_do_not_invalidate_offer():
    buyer = {
        "role": "buyer",
        "constraints": {"maximum_price": 50000}
    }
    # Delivery is long (worse soft preference), but within bounds and price is good
    offer = {
        "price": 41000,
        "delivery_days": 40,
        "warranty_months": 12
    }
    util = calculate_utility(buyer, offer, scenario_id="vendor_pricing")
    assert util.is_valid is True
    assert util.overall_score > 0.4

# ============================================================
# 4. TRADE-OFF DETECTION
# ============================================================

def test_tradeoff_detection_give_and_receive():
    buyer = {"role": "buyer", "constraints": {"maximum_price": 50000}}
    prev_offer = {"price": 48000, "delivery_days": 15}
    # Buyer receives lower price (-$3,000, improved), but gives longer delivery (+10 days, worsened)
    new_offer = {"price": 45000, "delivery_days": 25}

    tradeoff_res = detect_tradeoffs(buyer, prev_offer, new_offer, scenario_id="vendor_pricing")
    assert tradeoff_res.tradeoff_detected is True
    assert len(tradeoff_res.changes) >= 2

    # Verify changes
    price_change = next(c for c in tradeoff_res.changes if c.variable == "price")
    delivery_change = next(c for c in tradeoff_res.changes if c.variable == "delivery_days")

    assert price_change.direction == "improved"
    assert delivery_change.direction == "worsened"
    assert len(tradeoff_res.tradeoff.give) >= 1
    assert len(tradeoff_res.tradeoff.receive) >= 1

def test_pure_concession_is_not_a_tradeoff():
    buyer = {"role": "buyer", "constraints": {"maximum_price": 50000}}
    prev_offer = {"price": 48000, "delivery_days": 20}
    # Both variables improve for buyer
    new_offer = {"price": 45000, "delivery_days": 15}

    tradeoff_res = detect_tradeoffs(buyer, prev_offer, new_offer, scenario_id="vendor_pricing")
    assert tradeoff_res.tradeoff_detected is False
    assert tradeoff_res.net_utility_delta > 0

# ============================================================
# 5. TRADE-OFF PACKAGE GENERATION & PARETO TESTS
# ============================================================

def test_generate_tradeoff_package():
    vendor = {
        "role": "vendor",
        "constraints": {"minimum_price": 42000}
    }
    buyer = {
        "role": "buyer",
        "constraints": {"maximum_price": 50000}
    }
    current_offer = {"price": 48000, "delivery_days": 20, "warranty_months": 12}
    # Concede $2,000 on price
    package = generate_tradeoff_package(vendor, buyer, current_offer, target_price_adjustment=-2000, scenario_id="vendor_pricing")

    assert "price" in package.variables
    assert package.variables["price"] == 46000.0
    assert len(package.give) >= 1
    assert len(package.receive) >= 1
    assert "delivery" in package.description.lower() or "price" in package.description.lower()

def test_is_pareto_improvement():
    buyer = {"role": "buyer", "constraints": {"maximum_price": 50000}}
    vendor = {"role": "vendor", "constraints": {"minimum_price": 40000}}

    offer1 = {"price": 45000, "delivery_days": 30, "warranty_months": 6}
    # In offer2, price stays same, warranty increases (better for buyer, slightly costly for vendor)
    offer2 = {"price": 45000, "delivery_days": 15, "warranty_months": 24}

    is_pareto, d1, d2 = is_pareto_improvement(buyer, vendor, offer1, offer2, scenario_id="vendor_pricing")
    assert isinstance(is_pareto, bool)
