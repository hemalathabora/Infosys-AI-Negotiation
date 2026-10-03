import pytest
from unittest.mock import patch, AsyncMock
from fastapi.testclient import TestClient
from urllib.parse import urlparse, parse_qs, unquote
from app.main import app
from app.database import SessionLocal
from app.services import auth_service
from app.models.user import User

from app.config import settings

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_google_oauth_settings():
    settings.GOOGLE_CLIENT_ID = "8565267080-0id89fmrmju7ik3qpna2nac9vriv3bem.apps.googleusercontent.com"
    settings.GOOGLE_CLIENT_SECRET = "mock_secret_for_tests"
    settings.GOOGLE_REDIRECT_URI = "http://localhost:8000/api/auth/google/callback"

@pytest.fixture
def db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def test_oauth_state_generation_and_validation():
    state = auth_service.generate_oauth_state("google")
    assert isinstance(state, str)
    assert len(state) >= 32

    # Validation should succeed once
    assert auth_service.validate_oauth_state(state, "google") is True

    # Single-use: Second validation must fail
    assert auth_service.validate_oauth_state(state, "google") is False

def test_oauth_state_invalid_and_expired():
    assert auth_service.validate_oauth_state("invalid_state_xyz", "google") is False
    state = auth_service.generate_oauth_state("google")
    assert auth_service.validate_oauth_state(state, "github") is False

def test_google_login_endpoint():
    response = client.get("/api/auth/google/login")
    assert response.status_code == 200
    data = response.json()

    assert "url" in data
    assert "state" in data
    assert "client_id" in data
    assert "redirect_uri" in data

    url = data["url"]
    assert "https://accounts.google.com/o/oauth2/v2/auth" in url
    assert "8565267080-0id89fmrmju7ik3qpna2nac9vriv3bem.apps.googleusercontent.com" in url
    assert "http://localhost:8000/api/auth/google/callback" in unquote(url)
    assert "response_type=code" in url
    assert "scope=openid%20email%20profile" in url or "scope=openid" in url
    assert data["state"] in url

def test_google_login_redirect_flag():
    response = client.get("/api/auth/google/login?redirect=true", follow_redirects=False)
    assert response.status_code == 307
    location = response.headers["location"]
    assert location.startswith("https://accounts.google.com/o/oauth2/v2/auth")

def test_google_callback_invalid_state():
    response = client.get("/api/auth/google/callback?code=mock_code&state=invalid_state", follow_redirects=False)
    assert response.status_code == 307
    location = response.headers["location"]
    assert "error=" in location
    assert "Invalid" in unquote(location)

def test_google_callback_missing_code():
    state = auth_service.generate_oauth_state("google")
    response = client.get(f"/api/auth/google/callback?state={state}", follow_redirects=False)
    assert response.status_code == 307
    location = response.headers["location"]
    assert "error=" in location
    assert "code" in unquote(location)

def test_google_callback_google_error():
    response = client.get("/api/auth/google/callback?error=access_denied&error_description=User+cancelled", follow_redirects=False)
    assert response.status_code == 307
    location = response.headers["location"]
    assert "error=" in location
    assert "User" in unquote(location)

@pytest.mark.asyncio
async def test_google_callback_new_user_creation(db_session):
    mock_profile = {
        "sub": "google_sub_10001",
        "email": "newgoogleuser@example.com",
        "full_name": "New Google User",
        "avatar_url": "https://lh3.googleusercontent.com/avatar.jpg",
        "verified": True
    }

    state = auth_service.generate_oauth_state("google")

    with patch("app.services.auth_service.verify_google_oauth_token", new_callable=AsyncMock) as mock_verify:
        mock_verify.return_value = mock_profile

        response = client.get(f"/api/auth/google/callback?code=auth_code_123&state={state}", follow_redirects=False)
        assert response.status_code == 307

        location = response.headers["location"]
        assert "token=" in location

        # Extract token from redirect URL
        parsed = urlparse(location)
        query = parse_qs(parsed.query)
        token = query["token"][0]

        # Verify current user endpoint using token
        me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert me_res.status_code == 200
        me_data = me_res.json()

        assert me_data["email"] == "newgoogleuser@example.com"
        assert me_data["full_name"] == "New Google User"
        assert me_data["auth_provider"] == "google"
        assert me_data["provider_user_id"] == "google_sub_10001"
        assert me_data["is_verified"] is True

@pytest.mark.asyncio
async def test_google_callback_existing_google_user(db_session):
    # Pre-create Google User in DB if not already present
    existing_user = db_session.query(User).filter(User.email == "existinggoogle@example.com").first()
    if not existing_user:
        existing_user = User(
            email="existinggoogle@example.com",
            full_name="Existing Google User",
            hashed_password=None,
            auth_provider="google",
            provider_user_id="google_sub_20002",
            is_verified=True,
            avatar_url="https://lh3.googleusercontent.com/avatar.jpg"
        )
        db_session.add(existing_user)
        db_session.commit()

    mock_profile = {
        "sub": "google_sub_20002",
        "email": "existinggoogle@example.com",
        "full_name": "Existing Google User",
        "avatar_url": "https://lh3.googleusercontent.com/avatar.jpg",
        "verified": True
    }

    state = auth_service.generate_oauth_state("google")

    with patch("app.services.auth_service.verify_google_oauth_token", new_callable=AsyncMock) as mock_verify:
        mock_verify.return_value = mock_profile

        response = client.get(f"/api/auth/google/callback?code=auth_code_456&state={state}", follow_redirects=False)
        assert response.status_code == 307
        location = response.headers["location"]
        assert "token=" in location

        parsed = urlparse(location)
        query = parse_qs(parsed.query)
        token = query["token"][0]

        me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert me_res.status_code == 200
        me_data = me_res.json()
        assert me_data["email"] == "existinggoogle@example.com"
        assert me_data["provider_user_id"] == "google_sub_20002"

@pytest.mark.asyncio
async def test_google_callback_duplicate_email_account_linking(db_session):
    # Pre-create local user with email/password if not already present
    local_user = db_session.query(User).filter(User.email == "localuser@example.com").first()
    if not local_user:
        local_user = User(
            email="localuser@example.com",
            full_name="Local Password User",
            hashed_password="stored_hash_123:456",
            auth_provider="email",
            provider_user_id=None,
            is_verified=False
        )
        db_session.add(local_user)
        db_session.commit()

    mock_profile = {
        "sub": "google_sub_30003",
        "email": "localuser@example.com",
        "full_name": "Local Password User",
        "avatar_url": "https://lh3.googleusercontent.com/avatar.jpg",
        "verified": True
    }

    state = auth_service.generate_oauth_state("google")

    with patch("app.services.auth_service.verify_google_oauth_token", new_callable=AsyncMock) as mock_verify:
        mock_verify.return_value = mock_profile

        response = client.get(f"/api/auth/google/callback?code=auth_code_789&state={state}", follow_redirects=False)
        assert response.status_code == 307
        location = response.headers["location"]
        assert "token=" in location

        # Check DB state
        db_user = db_session.query(User).filter(User.email == "localuser@example.com").first()
        assert db_user is not None
        # Must preserve hashed password
        assert db_user.hashed_password == "stored_hash_123:456"
        # Must link provider_user_id
        assert db_user.provider_user_id == "google_sub_30003"
        # Must mark verified
        assert db_user.is_verified is True

def test_unauthorized_requests():
    # Header missing
    res1 = client.get("/api/auth/me")
    assert res1.status_code == 401

    # Invalid token format
    res2 = client.get("/api/auth/me", headers={"Authorization": "Bearer invalid_token_format"})
    assert res2.status_code == 401
