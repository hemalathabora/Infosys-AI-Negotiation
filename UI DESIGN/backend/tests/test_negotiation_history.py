import json
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models.user import User
from app.models.negotiation import NegotiationModel
from app.models.message import NegotiationMessageModel
from app.services.auth_service import generate_session_token

client = TestClient(app)

@pytest.fixture
def test_users_and_tokens():
    db = SessionLocal()
    # Clean up or create test users
    u1 = db.query(User).filter(User.email == "history_user1@example.com").first()
    if not u1:
        u1 = User(
            email="history_user1@example.com",
            full_name="Alice History",
            is_verified=True,
            auth_provider="email"
        )
        db.add(u1)
        db.commit()
        db.refresh(u1)

    u2 = db.query(User).filter(User.email == "history_user2@example.com").first()
    if not u2:
        u2 = User(
            email="history_user2@example.com",
            full_name="Bob History",
            is_verified=True,
            auth_provider="email"
        )
        db.add(u2)
        db.commit()
        db.refresh(u2)

    token1 = generate_session_token(u1.id, u1.email)
    token2 = generate_session_token(u2.id, u2.email)
    headers1 = {"Authorization": f"Bearer {token1}"}
    headers2 = {"Authorization": f"Bearer {token2}"}

    yield {
        "user1": u1,
        "token1": token1,
        "headers1": headers1,
        "user2": u2,
        "token2": token2,
        "headers2": headers2,
        "db": db
    }
    db.close()

def test_1_authenticated_user_can_list_their_own_history(test_users_and_tokens):
    """1. Authenticated user can list their own history."""
    h1 = test_users_and_tokens["headers1"]
    u1 = test_users_and_tokens["user1"]
    db = test_users_and_tokens["db"]

    # Seed a negotiation for user1
    neg1 = NegotiationModel(
        negotiation_id="session-user1-history-001",
        user_id=str(u1.id),
        scenario_id="vendor_pricing",
        mode="simulation",
        status="agreement",
        current_round=3,
        max_rounds=5,
        participating_agents_json=json.dumps([
            {"id": "buyer", "name": "Buyer Alex", "role": "buyer"},
            {"id": "vendor", "name": "Vendor Dan", "role": "vendor"}
        ]),
        current_offer_json=json.dumps({"price": 45000})
    )
    db.merge(neg1)
    db.commit()

    res = client.get("/api/negotiations/history", headers=h1)
    assert res.status_code == 200
    data = res.json()
    assert "items" in data
    assert data["total"] >= 1
    session_ids = [item["negotiation_id"] for item in data["items"]]
    assert "session-user1-history-001" in session_ids

def test_2_user_can_retrieve_their_own_session_detail(test_users_and_tokens):
    """2. User can retrieve their own session detail."""
    h1 = test_users_and_tokens["headers1"]
    u1 = test_users_and_tokens["user1"]
    db = test_users_and_tokens["db"]

    neg_id = "session-user1-detail-002"
    db.query(NegotiationMessageModel).filter(NegotiationMessageModel.negotiation_id == neg_id).delete()
    db.commit()

    neg = NegotiationModel(

        negotiation_id=neg_id,
        user_id=str(u1.id),
        scenario_id="vendor_pricing",
        mode="practice",
        human_role="buyer",
        difficulty="Intermediate",
        status="agreement",
        current_round=2,
        max_rounds=5,
        participating_agents_json=json.dumps([
            {"id": "buyer", "name": "Human Buyer", "role": "buyer"},
            {"id": "vendor", "name": "AI Vendor", "role": "vendor"}
        ]),
        current_offer_json=json.dumps({"price": 46000})
    )
    db.merge(neg)

    # Seed turn messages
    msg1 = NegotiationMessageModel(
        negotiation_id=neg_id,
        round=1,
        agent_id="buyer",
        decision="offer",
        proposed_offer_json=json.dumps({"price": 42000}),
        reasoning="Opening conservative bid"
    )
    msg2 = NegotiationMessageModel(
        negotiation_id=neg_id,
        round=2,
        agent_id="vendor",
        decision="accept",
        proposed_offer_json=json.dumps({"price": 46000}),
        reasoning="Acceptable concession reached"
    )
    db.add(msg1)
    db.add(msg2)
    db.commit()

    res = client.get(f"/api/negotiations/{neg_id}/detail", headers=h1)
    assert res.status_code == 200
    data = res.json()
    assert data["negotiation_id"] == neg_id
    assert data["scenario_id"] == "vendor_pricing"
    assert data["status"] == "agreement"
    assert len(data["history"]) >= 2
    # Verify chronological order
    assert data["history"][0]["round"] == 1
    assert data["history"][1]["round"] == 2

def test_3_user_can_export_their_own_session(test_users_and_tokens):
    """3. User can export their own session in PDF, CSV, and JSON."""
    h1 = test_users_and_tokens["headers1"]
    neg_id = "session-user1-detail-002"

    # PDF Export
    res_pdf = client.get(f"/api/negotiations/{neg_id}/export?format=pdf", headers=h1)
    assert res_pdf.status_code == 200
    assert res_pdf.headers["content-type"] == "application/pdf"
    assert "attachment; filename=" in res_pdf.headers.get("content-disposition", "")
    assert res_pdf.content.startswith(b"%PDF")

    # CSV Export
    res_csv = client.get(f"/api/negotiations/{neg_id}/export?format=csv", headers=h1)
    assert res_csv.status_code == 200
    assert "text/csv" in res_csv.headers["content-type"]
    assert "Session ID" in res_csv.text
    assert "vendor_pricing" in res_csv.text

    # JSON Export
    res_json = client.get(f"/api/negotiations/{neg_id}/export?format=json", headers=h1)
    assert res_json.status_code == 200
    assert "application/json" in res_json.headers["content-type"]
    exported_data = res_json.json()
    assert exported_data["negotiation_id"] == neg_id
    assert "history" in exported_data

def test_4_user_cannot_retrieve_another_users_session(test_users_and_tokens):
    """4. User cannot retrieve another user's session (403 Forbidden)."""
    h2 = test_users_and_tokens["headers2"]
    user1_neg_id = "session-user1-detail-002"

    # User 2 attempts to fetch User 1's detail
    res = client.get(f"/api/negotiations/{user1_neg_id}/detail", headers=h2)
    assert res.status_code == 403
    assert "Access denied" in res.json().get("detail", "")

def test_5_user_cannot_export_another_users_session(test_users_and_tokens):
    """5. User cannot export another user's session (403 Forbidden)."""
    h2 = test_users_and_tokens["headers2"]
    user1_neg_id = "session-user1-detail-002"

    # User 2 attempts to export User 1's session
    for fmt in ["pdf", "csv", "json"]:
        res = client.get(f"/api/negotiations/{user1_neg_id}/export?format={fmt}", headers=h2)
        assert res.status_code == 403

def test_6_unauthenticated_requests_are_rejected(test_users_and_tokens):
    """6. Unauthenticated requests are rejected (401 Unauthorized)."""
    # Without Authorization header
    res_list = client.get("/api/negotiations/history")
    assert res_list.status_code == 401

    res_detail = client.get("/api/negotiations/session-user1-detail-002/detail")
    assert res_detail.status_code == 401

    res_export = client.get("/api/negotiations/session-user1-detail-002/export?format=pdf")
    assert res_export.status_code == 401

    res_all_export = client.get("/api/negotiations/history/export?format=csv")
    assert res_all_export.status_code == 401

def test_7_invalid_export_formats_are_rejected(test_users_and_tokens):
    """7. Invalid export formats are rejected (400 Bad Request)."""
    h1 = test_users_and_tokens["headers1"]
    neg_id = "session-user1-detail-002"

    res = client.get(f"/api/negotiations/{neg_id}/export?format=exe", headers=h1)
    assert res.status_code == 400
    assert "Invalid export format" in res.json().get("detail", "")

    res_all = client.get("/api/negotiations/history/export?format=invalid_format", headers=h1)
    assert res_all.status_code in (400, 422)

def test_8_empty_history_is_handled_correctly(test_users_and_tokens):
    """8. Empty history is handled correctly without crashing."""
    db = test_users_and_tokens["db"]
    # Create user3 with zero negotiations
    u3 = db.query(User).filter(User.email == "empty_user3@example.com").first()
    if not u3:
        u3 = User(
            email="empty_user3@example.com",
            full_name="Empty History User",
            is_verified=True,
            auth_provider="email"
        )
        db.add(u3)
        db.commit()
        db.refresh(u3)

    t3 = generate_session_token(u3.id, u3.email)
    h3 = {"Authorization": f"Bearer {t3}"}

    res = client.get("/api/negotiations/history", headers=h3)
    assert res.status_code == 200
    data = res.json()
    assert data["items"] == []
    assert data["total"] == 0

    res_csv = client.get("/api/negotiations/history/export?format=csv", headers=h3)
    assert res_csv.status_code == 200
    assert "Session ID" in res_csv.text

def test_9_messages_and_offers_preserve_chronological_order(test_users_and_tokens):
    """9. Messages and offers preserve chronological order."""
    h1 = test_users_and_tokens["headers1"]
    u1 = test_users_and_tokens["user1"]
    db = test_users_and_tokens["db"]

    ordered_id = "session-user1-order-003"
    db.query(NegotiationMessageModel).filter(NegotiationMessageModel.negotiation_id == ordered_id).delete()
    db.commit()

    neg = NegotiationModel(

        negotiation_id=ordered_id,
        user_id=str(u1.id),
        scenario_id="job_offer",
        mode="simulation",
        status="completed",
        current_round=3,
        max_rounds=5,
        participating_agents_json=json.dumps([{"id": "candidate"}, {"id": "employer"}])
    )
    db.merge(neg)

    for r in range(1, 4):
        msg = NegotiationMessageModel(
            negotiation_id=ordered_id,
            round=r,
            agent_id="candidate" if r % 2 == 1 else "employer",
            decision="counter" if r < 3 else "accept",
            proposed_offer_json=json.dumps({"salary": 90000 + r * 5000}),
            reasoning=f"Round {r} negotiation step"
        )
        db.add(msg)
    db.commit()

    res = client.get(f"/api/negotiations/{ordered_id}/detail", headers=h1)
    assert res.status_code == 200
    history = res.json()["history"]
    rounds = [m["round"] for m in history]
    assert rounds == sorted(rounds)
    assert rounds == [1, 2, 3]

def test_10_pdf_csv_and_json_responses_have_correct_headers(test_users_and_tokens):
    """10. PDF, CSV, and JSON responses have correct Content-Type and Content-Disposition headers."""
    h1 = test_users_and_tokens["headers1"]
    ordered_id = "session-user1-order-003"

    for fmt, expected_type, ext in [
        ("pdf", "application/pdf", ".pdf"),
        ("csv", "text/csv; charset=utf-8", ".csv"),
        ("json", "application/json", ".json"),
    ]:
        res = client.get(f"/api/negotiations/{ordered_id}/export?format={fmt}", headers=h1)
        assert res.status_code == 200
        assert res.headers["content-type"] == expected_type
        disp = res.headers.get("content-disposition", "")
        assert "attachment" in disp
        assert ext in disp

def test_11_missing_or_incomplete_outcome_data_handled_safely(test_users_and_tokens):
    """11. Missing or incomplete outcome data is handled safely without crashing."""
    h1 = test_users_and_tokens["headers1"]
    u1 = test_users_and_tokens["user1"]
    db = test_users_and_tokens["db"]

    incomplete_id = "session-user1-incomplete-004"
    neg = NegotiationModel(
        negotiation_id=incomplete_id,
        user_id=str(u1.id),
        scenario_id="custom_unknown",
        mode=None,
        status="deadlock",
        current_round=0,
        max_rounds=5,
        participating_agents_json=json.dumps([]),
        current_offer_json=None,

        previous_offer_json=None,
        deadlock_info_json=None,
        metrics_json=None
    )
    db.merge(neg)
    db.commit()

    # Detail view must not crash
    res_det = client.get(f"/api/negotiations/{incomplete_id}/detail", headers=h1)
    assert res_det.status_code == 200
    data = res_det.json()
    assert data["status"] == "deadlock"

    # Export must not claim agreement occurred
    res_pdf = client.get(f"/api/negotiations/{incomplete_id}/export?format=pdf", headers=h1)
    assert res_pdf.status_code == 200
    assert res_pdf.content.startswith(b"%PDF")

    res_csv = client.get(f"/api/negotiations/{incomplete_id}/export?format=csv", headers=h1)
    assert res_csv.status_code == 200

def test_12_exported_files_do_not_contain_secrets(test_users_and_tokens):
    """12. Exported files do not contain passwords, API keys, or tokens."""
    h1 = test_users_and_tokens["headers1"]
    ordered_id = "session-user1-order-003"

    res_json = client.get(f"/api/negotiations/{ordered_id}/export?format=json", headers=h1)
    text_content = res_json.text.lower()
    assert "hashed_password" not in text_content
    assert "password" not in text_content
    assert "secret" not in text_content
    assert "api_key" not in text_content

def test_13_csv_protects_against_formula_injection(test_users_and_tokens):
    """13. CSV export protects against formula injection (=, +, -, @)."""
    h1 = test_users_and_tokens["headers1"]
    u1 = test_users_and_tokens["user1"]
    db = test_users_and_tokens["db"]

    injection_id = "session-user1-injection-005"
    db.query(NegotiationMessageModel).filter(NegotiationMessageModel.negotiation_id == injection_id).delete()
    db.commit()

    neg = NegotiationModel(

        negotiation_id=injection_id,
        user_id=str(u1.id),
        scenario_id="vendor_pricing",
        mode="simulation",
        status="agreement",
        current_round=1,
        max_rounds=5,
        participating_agents_json=json.dumps([{"id": "=cmd|' /C calc'!A0"}])
    )
    db.merge(neg)

    msg = NegotiationMessageModel(
        negotiation_id=injection_id,
        round=1,
        agent_id="@attacker",
        decision="offer",
        proposed_offer_json=json.dumps({"price": 1000}),
        reasoning="=1+1; EXEC calc.exe"
    )
    db.add(msg)
    db.commit()

    res_csv = client.get(f"/api/negotiations/{injection_id}/export?format=csv", headers=h1)
    assert res_csv.status_code == 200
    csv_text = res_csv.text

    # Verify that dangerous formula cells are prepended with single quote
    assert "'=1+1; EXEC calc.exe" in csv_text or "''=1+1" in csv_text
    assert "'@attacker" in csv_text
