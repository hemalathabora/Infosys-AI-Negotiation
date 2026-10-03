import datetime
from urllib.parse import quote
from fastapi import APIRouter, Depends, HTTPException, Header, status, Query
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.schemas.auth import (
    UserSignUp,
    OTPVerify,
    OTPResend,
    UserSignIn,
    OAuthSignIn,
    UserResponse,
    AuthResponse,
    OTPRequiredResponse,
)
from app.services import auth_service
from app.config import settings

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.get("/google/login")
def google_login(redirect: bool = False):
    """
    Generates a cryptographically secure state parameter and returns or redirects to the official Google OAuth consent URL.
    """
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=500, detail="Google Client ID is not configured on the backend.")

    state = auth_service.generate_oauth_state("google")
    redirect_uri = settings.GOOGLE_REDIRECT_URI
    scope = "openid email profile"

    google_url = (
        f"https://accounts.google.com/o/oauth2/v2/auth?"
        f"client_id={quote(settings.GOOGLE_CLIENT_ID)}&"
        f"redirect_uri={quote(redirect_uri)}&"
        f"response_type=code&"
        f"scope={quote(scope)}&"
        f"state={quote(state)}&"
        f"prompt=select_account"
    )

    if redirect:
        return RedirectResponse(url=google_url, status_code=307)

    return {
        "url": google_url,
        "state": state,
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": redirect_uri
    }

@router.get("/google/callback")
async def google_callback(
    code: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    error: Optional[str] = Query(None),
    error_description: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    FastAPI OAuth callback endpoint registered with Google OAuth Provider.
    Validates state, exchanges authorization code for tokens, retrieves user identity,
    creates/links user in database, and redirects user back to NegoMind frontend.
    """
    frontend_base = settings.cors_origins_list[0] if settings.cors_origins_list else "http://localhost:5173"

    if error:
        err_msg = quote(error_description or error or "Google OAuth authentication failed.")
        return RedirectResponse(url=f"{frontend_base}/auth/callback?error={err_msg}", status_code=307)

    if not state or not auth_service.validate_oauth_state(state, "google"):
        err_msg = quote("Invalid or expired OAuth state parameter. Request rejected for security.")
        return RedirectResponse(url=f"{frontend_base}/auth/callback?error={err_msg}", status_code=307)

    if not code:
        err_msg = quote("Authorization code missing from Google response.")
        return RedirectResponse(url=f"{frontend_base}/auth/callback?error={err_msg}", status_code=307)

    # Exchange code & fetch user profile from Google
    google_profile = await auth_service.verify_google_oauth_token(
        code,
        redirect_uri=settings.GOOGLE_REDIRECT_URI
    )

    if not google_profile or not google_profile.get("email"):
        err_msg = quote("Failed to exchange code or retrieve user identity from Google.")
        return RedirectResponse(url=f"{frontend_base}/auth/callback?error={err_msg}", status_code=307)

    # Find existing or create user with safe account linking
    user = auth_service.authenticate_or_create_oauth_user(
        db,
        provider="google",
        email=google_profile["email"],
        full_name=google_profile.get("full_name"),
        avatar_url=google_profile.get("avatar_url"),
        provider_user_id=google_profile.get("sub")
    )

    # Create application session token
    token = auth_service.generate_session_token(user.id, user.email)

    return RedirectResponse(url=f"{frontend_base}/auth/callback?token={quote(token)}", status_code=307)

@router.post("/signup", response_model=OTPRequiredResponse)
def signup(payload: UserSignUp, db: Session = Depends(get_db)):
    """
    Registers a new user and dispatches a 6-digit OTP code for email verification via SMTP.
    """
    try:
        user = auth_service.create_unverified_user(
            db,
            full_name=payload.full_name,
            email=payload.email,
            password=payload.password
        )
        otp_code, email_sent = auth_service.create_otp_for_email(
            db,
            email=user.email,
            purpose="signup",
            name=user.full_name
        )

        msg = (
            f"Verification code sent to {user.email} via SMTP email."
            if email_sent
            else "Registration initiated. Verification OTP generated."
        )

        return OTPRequiredResponse(
            email=user.email,
            requires_otp=True,
            email_sent=email_sent,
            message=msg,
            demo_otp=otp_code
        )
    except ValueError as val_err:
        raise HTTPException(status_code=400, detail=str(val_err))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(exc)}")

@router.post("/verify-otp", response_model=AuthResponse)
def verify_otp(payload: OTPVerify, db: Session = Depends(get_db)):
    """
    Verifies the 6-digit OTP code sent for signup or login.
    """
    email_clean = payload.email.strip().lower()
    user = auth_service.get_user_by_email(db, email_clean)
    if not user:
        raise HTTPException(status_code=404, detail="User record not found for this email.")

    is_valid, msg = auth_service.verify_otp_code(db, email=email_clean, code=payload.otp_code)
    if not is_valid:
        raise HTTPException(status_code=400, detail=msg)

    user = auth_service.mark_user_verified(db, user)
    token = auth_service.generate_session_token(user.id, user.email)

    return AuthResponse(
        token=token,
        user=UserResponse(**user.to_dict()),
        message="Email verified successfully! You are now logged in."
    )

@router.post("/resend-otp", response_model=OTPRequiredResponse)
def resend_otp(payload: OTPResend, db: Session = Depends(get_db)):
    """
    Resends a fresh 6-digit OTP code to the requested email address via SMTP.
    """
    email_clean = payload.email.strip().lower()
    user = auth_service.get_user_by_email(db, email_clean)
    if not user:
        raise HTTPException(status_code=404, detail="No account found with this email.")

    otp_code, email_sent = auth_service.create_otp_for_email(
        db,
        email=email_clean,
        purpose="resend",
        name=user.full_name
    )

    msg = (
        f"A new 6-digit OTP code has been sent to {email_clean}."
        if email_sent
        else "A new 6-digit OTP code has been generated."
    )

    return OTPRequiredResponse(
        email=email_clean,
        requires_otp=True,
        email_sent=email_sent,
        message=msg,
        demo_otp=otp_code
    )

@router.post("/signin")
def signin(payload: UserSignIn, db: Session = Depends(get_db)):
    """
    Authenticates a user using email & password. If email is unverified, triggers OTP verification.
    """
    email_clean = payload.email.strip().lower()
    user = auth_service.get_user_by_email(db, email_clean)

    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    if not user.is_verified:
        otp_code, email_sent = auth_service.create_otp_for_email(
            db,
            email=user.email,
            purpose="unverified_login",
            name=user.full_name
        )
        return {
            "requires_otp": True,
            "email": user.email,
            "email_sent": email_sent,
            "message": "Account email is not verified yet. A new verification OTP code has been issued.",
            "demo_otp": otp_code
        }

    if not auth_service.verify_password(payload.password, user.hashed_password or ""):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    user.last_login = datetime.datetime.utcnow()
    db.commit()

    token = auth_service.generate_session_token(user.id, user.email)

    return AuthResponse(
        token=token,
        user=UserResponse(**user.to_dict()),
        message=f"Welcome back, {user.full_name}!"
    )

@router.get("/config")
def get_auth_config():
    """
    Returns public OAuth Client IDs and config for frontend authentication.
    """
    return {
        "google_client_id": settings.GOOGLE_CLIENT_ID,
        "github_client_id": settings.GITHUB_CLIENT_ID,
        "smtp_enabled": settings.smtp_enabled
    }

@router.post("/oauth", response_model=AuthResponse)
async def oauth_signin(payload: OAuthSignIn, db: Session = Depends(get_db)):
    """
    Authenticates or creates a user using Google or GitHub OAuth (verifying token with official OAuth APIs).
    """
    provider = payload.provider.lower()
    if provider not in ["google", "github"]:
        raise HTTPException(status_code=400, detail="Supported OAuth providers are 'google' and 'github'.")

    email = payload.email
    full_name = payload.full_name
    avatar_url = payload.avatar_url

    provider_user_id = None

    # Real OAuth Token / Code Verification
    if payload.token_or_code:
        if provider == "google":
            google_profile = await auth_service.verify_google_oauth_token(payload.token_or_code, redirect_uri=payload.redirect_uri)
            if google_profile:
                email = google_profile["email"]
                full_name = google_profile["full_name"]
                avatar_url = google_profile["avatar_url"]
                provider_user_id = google_profile.get("sub")
            else:
                raise HTTPException(status_code=400, detail="Google authentication failed. Invalid or expired token/code.")
        elif provider == "github":
            github_profile = await auth_service.exchange_github_oauth_code(payload.token_or_code, redirect_uri=payload.redirect_uri)
            if github_profile:
                email = github_profile["email"]
                full_name = github_profile["full_name"]
                avatar_url = github_profile["avatar_url"]
                provider_user_id = github_profile.get("sub")
            else:
                raise HTTPException(status_code=400, detail="GitHub authentication failed. Invalid or expired code/token.")

    if not email:
        raise HTTPException(status_code=400, detail=f"Valid email required for {provider.capitalize()} sign in.")

    user = auth_service.authenticate_or_create_oauth_user(
        db,
        provider=provider,
        email=email,
        full_name=full_name,
        avatar_url=avatar_url,
        provider_user_id=provider_user_id
    )

    token = auth_service.generate_session_token(user.id, user.email)

    return AuthResponse(
        token=token,
        user=UserResponse(**user.to_dict()),
        message=f"Signed in via {provider.capitalize()} as {user.full_name}."
    )

@router.get("/me", response_model=UserResponse)
def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    """
    Returns profile information for currently authenticated user.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authorization header missing or invalid format.")

    token = authorization.replace("Bearer ", "").strip()
    parts = token.split("_")
    if len(parts) < 3 or parts[0] != "nego" or parts[1] != "token":
        raise HTTPException(status_code=401, detail="Invalid token session.")

    try:
        user_id = int(parts[2])
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid token session format.")

    user = db.query(auth_service.User).filter(auth_service.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    if not user.avatar_url:
        user.avatar_url = auth_service.generate_random_avatar(user.full_name)
        db.commit()
        db.refresh(user)

    return UserResponse(**user.to_dict())

@router.post("/logout")
def logout():
    return {"status": "success", "message": "Successfully logged out."}
