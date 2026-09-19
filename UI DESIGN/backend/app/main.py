import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import settings
from app.database import Base, engine
from app.models.user import User, OTPToken  # Ensure SQLAlchemy registers user & otp models
from app.api import agents, negotiations, scenarios, analytics, guide, auth

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] %(levelname)s - %(name)s - %(message)s"
)
logger = logging.getLogger("negotiation_backend")

from sqlalchemy import inspect, text

# Create database tables on startup & ensure schema migrations
def init_db():
    try:
        Base.metadata.create_all(bind=engine)
        inspector = inspect(engine)
        if "negotiations" in inspector.get_table_names():
            columns = [c["name"] for c in inspector.get_columns("negotiations")]
            with engine.connect() as conn:
                if "mode" not in columns:
                    conn.execute(text("ALTER TABLE negotiations ADD COLUMN mode VARCHAR(50) DEFAULT 'simulation'"))
                if "human_role" not in columns:
                    conn.execute(text("ALTER TABLE negotiations ADD COLUMN human_role VARCHAR(50)"))
                if "user_id" not in columns:
                    conn.execute(text("ALTER TABLE negotiations ADD COLUMN user_id VARCHAR(255)"))
                if "deadlock_info_json" not in columns:
                    conn.execute(text("ALTER TABLE negotiations ADD COLUMN deadlock_info_json TEXT"))
                conn.commit()
    except Exception as e:
        logger.error(f"Database initialization notice (check connection parameters in .env): {e}")


init_db()

app = FastAPI(
    title="AI Negotiation Engine API",
    description="LLM-Powered Multi-Agent Negotiation Backend API",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth.router)
app.include_router(agents.router)
app.include_router(negotiations.router)
app.include_router(scenarios.router)
app.include_router(analytics.router)
app.include_router(analytics.analytics_router)
app.include_router(guide.router)


@app.get("/")
def root():
    return {
        "status": "online",
        "service": "AI Negotiation Engine Backend",
        "version": "1.0.0"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "llm_provider": settings.LLM_PROVIDER,
        "database": settings.DATABASE_URL
    }

@app.get("/api/settings/mode")
def get_engine_mode():
    """Retrieve current engine operational mode (gemini or mock/normal)."""
    return {
        "provider": settings.LLM_PROVIDER,
        "model": settings.LLM_MODEL,
        "is_llm_active": settings.LLM_PROVIDER.lower() == "gemini"
    }

@app.post("/api/settings/mode")
async def set_engine_mode(request: Request):
    """Toggle engine mode dynamically between 'gemini' (Live LLM) and 'mock' (Normal Mode)."""
    body = await request.json()
    new_provider = body.get("provider", "gemini").lower()
    if new_provider in ["gemini", "mock", "openai"]:
        settings.LLM_PROVIDER = new_provider
    if "model" in body and body["model"]:
        settings.LLM_MODEL = body["model"]

    logger.info(f"Engine mode updated dynamically: Provider='{settings.LLM_PROVIDER}', Model='{settings.LLM_MODEL}'")
    return {
        "status": "success",
        "provider": settings.LLM_PROVIDER,
        "model": settings.LLM_MODEL,
        "is_llm_active": settings.LLM_PROVIDER.lower() == "gemini",
        "message": f"Engine switched to {'Gemini Live LLM' if settings.LLM_PROVIDER == 'gemini' else 'Normal Rule Engine'} mode."
    }

@app.get("/api/health/llm")
async def llm_health_check():
    """Live diagnostic check to test LLM API key connectivity."""
    provider = (settings.LLM_PROVIDER or "gemini").lower()
    api_key = settings.LLM_API_KEY
    model = settings.LLM_MODEL or "gemini-3.5-flash-lite"

    if provider == "mock":
        return {
            "connected": True,
            "provider": "mock",
            "status": "active",
            "message": "Operating in Deterministic Mock LLM Mode. Multi-agent engine is ready."
        }

    from app.services.llm_reasoning import _is_valid_api_key
    if not api_key or not _is_valid_api_key(api_key, provider):
        return {
            "connected": False,
            "provider": provider,
            "fallback_mode": "mock",
            "message": "No valid API key configured. Operating in Deterministic Rule Engine / Mock fallback mode."
        }

    try:
        if provider == "gemini":
            try:
                try:
                    from google import genai
                    client = genai.Client(api_key=api_key)
                    res = client.models.generate_content(
                        model=model,
                        contents="Ping test"
                    )
                    return {
                        "connected": True,
                        "provider": provider,
                        "model": model,
                        "message": "Successfully connected to Google Gemini API!",
                        "sample_response": str(res.text).strip() if hasattr(res, 'text') else "Connected"
                    }
                except Exception as e_genai:
                    import google.generativeai as genai_legacy
                    genai_legacy.configure(api_key=api_key)
                    gmodel = genai_legacy.GenerativeModel(model)
                    res = gmodel.generate_content("Ping test")
                    return {
                        "connected": True,
                        "provider": provider,
                        "model": model,
                        "message": "Successfully connected to Google Gemini API!",
                        "sample_response": str(res.text).strip() if hasattr(res, 'text') else "Connected"
                    }
            except Exception as e:
                err_str = str(e)
                hint = "Get a valid key starting with 'AIzaSy...' from https://aistudio.google.com/app/apikey" if "401" in err_str or "UNAUTHENTICATED" in err_str.upper() else ""
                return {
                    "connected": False,
                    "provider": provider,
                    "model": model,
                    "fallback_mode": "mock",
                    "error_type": type(e).__name__,
                    "error_detail": err_str,
                    "hint": hint,
                    "message": f"Gemini API call failed ({type(e).__name__}). System automatically using Mock LLM fallback mode."
                }
        return {
            "connected": True,
            "provider": provider,
            "model": model,
            "message": f"Successfully verified {provider} configuration."
        }
    except Exception as exc:
        return {
            "connected": False,
            "provider": provider,
            "fallback_mode": "mock",
            "error": str(exc),
            "message": f"LLM Connection failed: {exc}"
        }

@app.get("/api/health/llm/models")
async def list_and_test_llm_models():
    """Returns available Gemini models powered by single API key."""
    api_key = settings.LLM_API_KEY
    if not api_key:
        return {"connected": False, "message": "No API key configured."}

    supported_models = [
        {"id": "gemini-3.5-flash-lite", "name": "Gemini 3.5 Flash Lite (Recommended - High Speed)", "status": "active"},
        {"id": "gemini-3.1-flash-lite", "name": "Gemini 3.1 Flash Lite (Ultra-Fast)", "status": "supported"},
        {"id": "gemini-flash-latest", "name": "Gemini Flash Latest (Stable)", "status": "supported"},
        {"id": "gemini-3.6-flash", "name": "Gemini 3.6 Flash (Advanced Reasoning)", "status": "supported"},
        {"id": "gemini-3.7-flash", "name": "Gemini 3.7 Flash (Next-Gen)", "status": "supported"}
    ]

    return {
        "single_api_key_configured": True,
        "active_primary_model": settings.LLM_MODEL or "gemini-3.5-flash-lite",
        "supported_models": supported_models,
        "automatic_failover_enabled": True,
        "message": "Single API Key powering multi-model selection & automatic rate-limit failover."
    }

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception caught on {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred.", "error": str(exc)}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True
    )
