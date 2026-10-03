import hashlib
import os
import random
import datetime
import secrets
import logging
import httpx
from typing import Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session
from app.models.user import User, OTPToken
from app.services import email_service
from app.config import settings

logger = logging.getLogger("auth_service")

# Password Hashing Utilities using hashlib pbkdf2_hmac
def hash_password(password: str) -> str:
    salt = os.urandom(16)
    pwd_hash = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100000)
    return salt.hex() + ":" + pwd_hash.hex()

def verify_password(password: str, stored_password_hash: str) -> bool:
    if not stored_password_hash or ":" not in stored_password_hash:
        return False
    try:
        salt_hex, hash_hex = stored_password_hash.split(":", 1)
        salt = bytes.fromhex(salt_hex)
        pwd_hash = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100000)
        return pwd_hash.hex() == hash_hex
    except Exception as e:
        logger.error(f"Error verifying password: {e}")
        return False

# Token Generation & Helper Utilities
def generate_session_token(user_id: int, email: str) -> str:
    random_str = secrets.token_urlsafe(32)
    return f"nego_token_{user_id}_{random_str}"

def extract_token_from_header(authorization_header: Optional[str]) -> Optional[str]:
    if not authorization_header:
        return None
    header_parts = authorization_header.strip().split()
    if len(header_parts) == 2 and header_parts[0].lower() == "bearer":
        return header_parts[1]
    if len(header_parts) == 1:
        return header_parts[0]
    return None

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    if not token or not isinstance(token, str):
        return None
    if token.startswith("nego_token_"):
        parts = token.split("_")
        if len(parts) >= 3:
            return {"sub": parts[2], "user_id": parts[2]}
    return {"sub": token}

# OTP Generation & Dispatch
def create_otp_for_email(db: Session, email: str, purpose: str = "signup", name: str = "User") -> Tuple[str, bool]:
    # Generate 6-digit OTP code
    code = f"{random.randint(100000, 999999)}"
    expires_at = datetime.datetime.utcnow() + datetime.timedelta(minutes=10)

    # Invalidate previous unused OTPs for this email
    db.query(OTPToken).filter(
        OTPToken.email == email,
        OTPToken.is_used == False
    ).update({"is_used": True})

    otp_entry = OTPToken(
        email=email,
        code=code,
        purpose=purpose,
        expires_at=expires_at,
        is_used=False
    )
    db.add(otp_entry)
    db.commit()
    db.refresh(otp_entry)

    logger.info(f"Generated OTP for {email} ({purpose}): [{code}] - Expires at {expires_at}")
    print(f"\n==========================================")
    print(f" [OTP NOTIFICATION] Code for {email}: {code}")
    print(f"==========================================\n")

    # Dispatch via Vercel Mail Service (with SMTP fallback)
    email_sent, email_msg = email_service.send_otp_email(to_email=email, otp_code=code, name=name)


    return code, email_sent

def verify_otp_code(db: Session, email: str, code: str) -> Tuple[bool, str]:
    cleaned_code = code.strip()
    otp_record = db.query(OTPToken).filter(
        OTPToken.email == email,
        OTPToken.code == cleaned_code,
        OTPToken.is_used == False
    ).order_by(OTPToken.created_at.desc()).first()

    if not otp_record:
        return False, "Invalid or expired OTP code."

    now = datetime.datetime.utcnow()
    if otp_record.expires_at < now:
        otp_record.is_used = True
        db.commit()
        return False, "OTP code has expired. Please request a new one."

    # Mark as used
    otp_record.is_used = True
    db.commit()
    return True, "OTP verified successfully."

import time

_oauth_states: Dict[str, Dict[str, Any]] = {}

def generate_oauth_state(provider: str = "google") -> str:
    """
    Generates a cryptographically secure OAuth state parameter and stores it with a 15-minute TTL.
    """
    state = secrets.token_urlsafe(32)
    now = time.time()
    # Prune expired states (> 15 mins)
    expired_keys = [k for k, v in _oauth_states.items() if now - v.get("created_at", 0) > 900]
    for k in expired_keys:
        _oauth_states.pop(k, None)

    _oauth_states[state] = {"created_at": now, "provider": provider}
    return state

def validate_oauth_state(state: str, provider: str = "google") -> bool:
    """
    Validates and consumes an OAuth state parameter (one-time use).
    """
    if not state or not isinstance(state, str):
        return False
    state_entry = _oauth_states.pop(state, None)
    if not state_entry:
        return False
    if time.time() - state_entry.get("created_at", 0) > 900:
        return False
    if state_entry.get("provider") != provider:
        return False
    return True

# Real Google OAuth Token & Code Verification
async def verify_google_oauth_token(id_token_or_access_token: str, redirect_uri: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """
    Verifies a Google ID Token, Access Token, or Authorization Code directly with Google's official OAuth servers.
    """
    if not id_token_or_access_token:
        return None

    token = id_token_or_access_token.strip()

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            # 1. Try Google ID Token Info Endpoint
            tokeninfo_url = f"https://oauth2.googleapis.com/tokeninfo?id_token={token}"
            res = await client.get(tokeninfo_url)

            if res.status_code == 200:
                data = res.json()
                email = data.get("email")
                if email:
                    return {
                        "sub": data.get("sub"),
                        "email": email,
                        "full_name": data.get("name") or data.get("given_name") or email.split("@")[0],
                        "avatar_url": data.get("picture"),
                        "verified": data.get("email_verified") in [True, "true", "True", 1]
                    }

            # 2. Try Google UserInfo Access Token Endpoint
            userinfo_url = "https://www.googleapis.com/oauth2/v3/userinfo"
            res2 = await client.get(userinfo_url, headers={"Authorization": f"Bearer {token}"})
            if res2.status_code == 200:
                data2 = res2.json()
                email2 = data2.get("email")
                if email2:
                    return {
                        "sub": data2.get("sub"),
                        "email": email2,
                        "full_name": data2.get("name") or email2.split("@")[0],
                        "avatar_url": data2.get("picture"),
                        "verified": data2.get("email_verified") in [True, "true", "True", 1]
                    }

            # 3. If token is a Google authorization code and Client credentials exist
            if settings.GOOGLE_CLIENT_ID and settings.GOOGLE_CLIENT_SECRET:
                token_exchange_url = "https://oauth2.googleapis.com/token"
                exchange_data = {
                    "code": token,
                    "client_id": settings.GOOGLE_CLIENT_ID,
                    "client_secret": settings.GOOGLE_CLIENT_SECRET,
                    "grant_type": "authorization_code",
                    "redirect_uri": redirect_uri or settings.GOOGLE_REDIRECT_URI
                }
                res3 = await client.post(token_exchange_url, data=exchange_data)
                if res3.status_code == 200:
                    tok_res = res3.json()
                    access_tok = tok_res.get("access_token")
                    id_tok = tok_res.get("id_token")
                    if id_tok:
                        return await verify_google_oauth_token(id_tok, redirect_uri or settings.GOOGLE_REDIRECT_URI)
                    elif access_tok:
                        return await verify_google_oauth_token(access_tok, redirect_uri or settings.GOOGLE_REDIRECT_URI)
    except Exception as exc:
        logger.error(f"Google OAuth token verification failed: {exc}")

    return None

# Real GitHub OAuth Code & Token Exchange
async def exchange_github_oauth_code(code_or_token: str, redirect_uri: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """
    Exchanges GitHub OAuth 'code' for access token (or uses access token directly) and fetches authenticated GitHub user profile & primary email.
    """
    if not code_or_token:
        return None

    cleaned = code_or_token.strip()

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            access_token = None

            # Check if it's already a GitHub access token or PAT
            if cleaned.startswith("ghp_") or cleaned.startswith("gho_") or cleaned.startswith("github_pat_"):
                access_token = cleaned
            elif settings.GITHUB_CLIENT_ID and settings.GITHUB_CLIENT_SECRET:
                # Exchange code for token
                token_url = "https://github.com/login/oauth/access_token"
                payload = {
                    "client_id": settings.GITHUB_CLIENT_ID,
                    "client_secret": settings.GITHUB_CLIENT_SECRET,
                    "code": cleaned,
                }
                if redirect_uri:
                    payload["redirect_uri"] = redirect_uri

                headers = {"Accept": "application/json"}
                res = await client.post(token_url, json=payload, headers=headers)

                if res.status_code == 200:
                    token_data = res.json()
                    access_token = token_data.get("access_token")
                else:
                    logger.error(f"GitHub token exchange returned status {res.status_code}: {res.text}")

            if not access_token:
                access_token = cleaned

            # Fetch User Profile from GitHub API
            auth_header = {"Authorization": f"Bearer {access_token}", "Accept": "application/vnd.github.v3+json"}
            user_res = await client.get("https://api.github.com/user", headers=auth_header)
            if user_res.status_code != 200:
                logger.error(f"GitHub user profile fetch returned status {user_res.status_code}: {user_res.text}")
                return None

            github_user = user_res.json()
            email = github_user.get("email")

            # If primary email is private in GitHub profile, fetch from /user/emails endpoint
            if not email:
                email_res = await client.get("https://api.github.com/user/emails", headers=auth_header)
                if email_res.status_code == 200:
                    emails = email_res.json()
                    primary_email_obj = next((e for e in emails if e.get("primary") and e.get("verified")), None)
                    if not primary_email_obj and emails:
                        primary_email_obj = emails[0]
                    if primary_email_obj:
                        email = primary_email_obj.get("email")

            if email:
                return {
                    "sub": str(github_user.get("id")) if github_user.get("id") else None,
                    "email": email,
                    "full_name": github_user.get("name") or github_user.get("login"),
                    "avatar_url": github_user.get("avatar_url"),
                    "verified": True
                }
    except Exception as exc:
        logger.error(f"GitHub OAuth code exchange failed: {exc}")

    return None

AVATAR_STYLES = [
    "bottts",
    "avataaars",
    "lorelei",
    "micah",
    "adventurer",
    "fun-emoji",
    "personas",
    "big-smile",
    "big-ears"
]

def generate_random_avatar(seed_text: Optional[str] = None) -> str:
    """
    Generates a random SVG avatar URL using Dicebear 7.x API with a variety of vector styles.
    """
    style = random.choice(AVATAR_STYLES)
    random_id = secrets.token_hex(4)
    seed = f"{seed_text or 'user'}_{random_id}".replace(" ", "_")
    return f"https://api.dicebear.com/7.x/{style}/svg?seed={seed}"

# User Operations
def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email.strip().lower()).first()

def get_user_by_provider_id(db: Session, provider: str, provider_user_id: str) -> Optional[User]:
    return db.query(User).filter(
        User.auth_provider == provider.lower(),
        User.provider_user_id == provider_user_id
    ).first()

def create_unverified_user(db: Session, full_name: str, email: str, password: str) -> User:
    email_clean = email.strip().lower()
    existing = get_user_by_email(db, email_clean)
    pwd_hash = hash_password(password)

    if existing:
        if existing.is_verified:
            raise ValueError("An account with this email already exists and is verified. Please Sign In instead.")
        # Update existing unverified user credentials
        existing.full_name = full_name.strip()
        existing.hashed_password = pwd_hash
        existing.auth_provider = "email"
        if not existing.avatar_url:
            existing.avatar_url = generate_random_avatar(full_name)
        db.commit()
        db.refresh(existing)
        return existing

    user = User(
        email=email_clean,
        full_name=full_name.strip(),
        hashed_password=pwd_hash,
        auth_provider="email",
        is_verified=False,
        avatar_url=generate_random_avatar(full_name)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def mark_user_verified(db: Session, user: User) -> User:
    user.is_verified = True
    user.last_login = datetime.datetime.utcnow()
    db.commit()
    db.refresh(user)
    return user

def authenticate_or_create_oauth_user(
    db: Session,
    provider: str,
    email: str,
    full_name: Optional[str] = None,
    avatar_url: Optional[str] = None,
    provider_user_id: Optional[str] = None
) -> User:
    email_clean = email.strip().lower()
    provider_clean = provider.lower()

    user = None
    if provider_user_id:
        user = get_user_by_provider_id(db, provider_clean, provider_user_id)

    if not user:
        user = get_user_by_email(db, email_clean)

    name = full_name.strip() if full_name else email_clean.split("@")[0].capitalize()
    avatar = avatar_url or generate_random_avatar(name)

    if user:
        # Safe Account Linking: link provider_user_id if not present
        if provider_user_id and not user.provider_user_id:
            user.provider_user_id = provider_user_id

        # Update last login & verified status (OAuth emails are auto-verified)
        user.is_verified = True
        user.last_login = datetime.datetime.utcnow()

        if not user.avatar_url:
            user.avatar_url = avatar

        db.commit()
        db.refresh(user)
        return user

    user = User(
        email=email_clean,
        full_name=name,
        hashed_password=None,
        auth_provider=provider_clean,
        provider_user_id=provider_user_id,
        is_verified=True,
        avatar_url=avatar
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
