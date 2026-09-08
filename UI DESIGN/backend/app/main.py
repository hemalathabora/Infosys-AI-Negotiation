import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import settings
from app.database import Base, engine
from app.api import agents, negotiations, scenarios, analytics, guide

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] %(levelname)s - %(name)s - %(message)s"
)
logger = logging.getLogger("negotiation_backend")

# Create database tables on startup
Base.metadata.create_all(bind=engine)

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
app.include_router(agents.router)
app.include_router(negotiations.router)
app.include_router(scenarios.router)
app.include_router(analytics.router)
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
