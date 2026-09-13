import pytest
from app.config import settings

@pytest.fixture(autouse=True)
def mock_llm_provider(monkeypatch):
    monkeypatch.setattr(settings, "LLM_PROVIDER", "mock")
