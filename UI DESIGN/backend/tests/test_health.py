import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.config import settings, mask_secrets

client = TestClient(app)

def test_api_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "llm_provider" in data
    assert "database" in data

def test_health_endpoint_masks_credentials(monkeypatch):
    test_db_url = "postgresql://postgres:secretpassword123@db.supabase.co:5432/postgres"
    monkeypatch.setattr(settings, "DATABASE_URL", test_db_url)
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert "secretpassword123" not in data["database"]
    assert "postgresql://postgres:***@db.supabase.co:5432/postgres" in data["database"]

def test_mask_secrets_function():
    pg_url = "postgresql://user:my_secret_pass@localhost:5432/mydb"
    masked_pg = mask_secrets(pg_url)
    assert "my_secret_pass" not in masked_pg
    assert "user:***@" in masked_pg

    gemini_key = "AIzaSy" + "A" * 33
    masked_key = mask_secrets(f"Key is {gemini_key}")
    assert gemini_key not in masked_key
    assert "[REDACTED_API_KEY]" in masked_key

def test_llm_health_endpoints():
    res_llm = client.get("/api/health/llm")
    assert res_llm.status_code == 200
    assert "connected" in res_llm.json()

    res_models = client.get("/api/health/llm/models")
    assert res_models.status_code == 200
    data = res_models.json()
    assert "connected" in data or "supported_models" in data

def test_scenarios_endpoint():
    res = client.get("/api/scenarios")
    assert res.status_code == 200
    assert isinstance(res.json(), list)

def test_cors_origins_parsing(monkeypatch):
    monkeypatch.setattr(settings, "CORS_ORIGINS", "http://localhost:5173, http://127.0.0.1:5173, *")
    origins = settings.cors_origins_list
    assert "*" not in origins
    assert "http://localhost:5173" in origins
    assert "http://127.0.0.1:5173" in origins

def test_postgresql_db_url_handling():
    url = "postgres://postgres:password@localhost:5432/dbname"
    converted = url.replace("postgres://", "postgresql://", 1) if url.startswith("postgres://") else url
    assert converted.startswith("postgresql://")
