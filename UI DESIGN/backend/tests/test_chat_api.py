import pytest
from unittest.mock import patch, AsyncMock
from fastapi.testclient import TestClient
from app.main import app
from app.config import settings

client = TestClient(app)

def test_chat_empty_message_validation():
    """Validates that empty or whitespace-only messages are rejected."""
    res = client.post("/api/chat", json={"message": "   "})
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is False
    assert "cannot be empty" in data["message"].lower()

def test_chat_general_context_question():
    """Tests asking a general context question (e.g. 'What is Python?')."""
    res = client.post("/api/chat", json={"message": "What is Python?"})
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert "conversation_id" in data
    assert data["context_mode"] == "general"
    assert len(data["message"]) > 0

def test_chat_negotiation_context_question():
    """Tests asking a negotiation-specific question."""
    res = client.post("/api/chat", json={"message": "Explain ZOPA in negotiation"})
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["context_mode"] == "negotiation"
    assert "ZOPA" in data["message"] or "Zone of Possible Agreement" in data["message"]

def test_chat_with_negotiation_session():
    """Tests asking a question linked to a live negotiation session."""
    # 1. Create a negotiation session
    neg_res = client.post("/api/negotiations", json={"scenario_id": "vendor_pricing"})
    assert neg_res.status_code in [200, 201]
    neg_id = neg_res.json()["negotiation_id"]

    # 2. Run a turn
    client.post(f"/api/negotiations/{neg_id}/turn")

    # 3. Ask chatbot about the negotiation session
    chat_res = client.post("/api/chat", json={
        "message": "Why did the vendor reject or counter the offer?",
        "negotiation_id": neg_id
    })
    assert chat_res.status_code == 200
    data = chat_res.json()
    assert data["success"] is True
    assert data["context_mode"] == "negotiation"
    assert len(data["message"]) > 0

def test_chat_conversation_history_persistence():
    """Tests multi-turn message history persistence in conversation."""
    # Turn 1
    res1 = client.post("/api/chat", json={"message": "Hello, who are you?"})
    assert res1.status_code == 200
    conv_id = res1.json()["conversation_id"]

    # Turn 2
    res2 = client.post("/api/chat", json={
        "message": "Explain concession velocity.",
        "conversation_id": conv_id
    })
    assert res2.status_code == 200
    data2 = res2.json()
    assert data2["conversation_id"] == conv_id

    # Retrieve conversation detail
    detail_res = client.get(f"/api/chat/conversations/{conv_id}")
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert detail["conversation_id"] == conv_id
    # Should contain user and assistant messages for both turns
    assert len(detail["messages"]) >= 4

def test_chat_user_isolation():
    """Ensures one authenticated user cannot access or delete another user's conversation."""
    token_user_a = "Bearer nego_token_101_user_a_secret"
    token_user_b = "Bearer nego_token_102_user_b_secret"

    # User A creates a conversation
    res_a = client.post(
        "/api/chat",
        json={"message": "Private user A question"},
        headers={"Authorization": token_user_a}
    )
    assert res_a.status_code == 200
    conv_id = res_a.json()["conversation_id"]

    # User B tries to fetch User A's conversation detail
    detail_res_b = client.get(
        f"/api/chat/conversations/{conv_id}",
        headers={"Authorization": token_user_b}
    )
    assert detail_res_b.status_code == 403

    # User B tries to delete User A's conversation
    del_res_b = client.delete(
        f"/api/chat/conversations/{conv_id}",
        headers={"Authorization": token_user_b}
    )
    assert del_res_b.status_code == 403

    # User A can successfully fetch their own conversation
    detail_res_a = client.get(
        f"/api/chat/conversations/{conv_id}",
        headers={"Authorization": token_user_a}
    )
    assert detail_res_a.status_code == 200

    # User A can successfully delete their own conversation
    del_res_a = client.delete(
        f"/api/chat/conversations/{conv_id}",
        headers={"Authorization": token_user_a}
    )
    assert del_res_a.status_code == 200

def test_mocked_gemini_api_call():
    """Tests chatbot flow with a mocked Gemini API response."""
    with patch("app.services.chat_service._is_valid_api_key", return_value=True):
        with patch("importlib.import_module") as mock_import:
            # Setup mock google.genai Client
            mock_client = AsyncMock()
            mock_res = AsyncMock()
            mock_res.text = "Mocked Gemini Response: Python is a high-level programming language."
            mock_client.models.generate_content.return_value = mock_res
            
            mock_genai = AsyncMock()
            mock_genai.Client.return_value = mock_client
            mock_import.return_value = mock_genai

            res = client.post("/api/chat", json={"message": "What is Python?"})
            assert res.status_code == 200
            data = res.json()
            assert data["success"] is True

def test_guide_query_compatibility():
    """Ensures POST /api/guide/query remains fully compatible with existing frontend code."""
    res = client.post("/api/guide/query", json={"query": "How does constraint enforcement work?"})
    assert res.status_code == 200
    data = res.json()
    assert "answer" in data
    assert len(data["answer"]) > 0
    assert "conversation_id" in data
