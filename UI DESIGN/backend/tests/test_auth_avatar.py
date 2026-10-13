import pytest
from app.database import SessionLocal, Base, engine
from app.services import auth_service

@pytest.fixture
def db_session():
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()

def test_generate_random_avatar():
    avatar_url = auth_service.generate_random_avatar("Test User")
    assert avatar_url is not None
    assert avatar_url.startswith("https://api.dicebear.com/7.x/")
    assert "seed=" in avatar_url

def test_create_unverified_user_has_avatar(db_session):
    user = auth_service.create_unverified_user(
        db=db_session,
        full_name="Avatar Test User",
        email="avatar_test_rand@example.com",
        password="Password123!"
    )
    assert user.avatar_url is not None
    assert "https://api.dicebear.com/7.x/" in user.avatar_url

def test_oauth_user_creation_fallback_avatar(db_session):
    user = auth_service.authenticate_or_create_oauth_user(
        db=db_session,
        provider="google",
        email="oauth_avatar_rand@example.com",
        full_name="OAuth User No Pic",
        avatar_url=None
    )
    assert user.avatar_url is not None
    assert "https://api.dicebear.com/7.x/" in user.avatar_url
