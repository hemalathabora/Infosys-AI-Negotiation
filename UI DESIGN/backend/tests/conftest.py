import os
import pytest

# Override DATABASE_URL for fast, isolated unit tests
os.environ["DATABASE_URL"] = "sqlite:///./test_negotiation.db"

from app.config import settings

@pytest.fixture(autouse=True)
def mock_llm_provider(monkeypatch):
    monkeypatch.setattr(settings, "LLM_PROVIDER", "mock")

