import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from .database import init_db, get_db
from .seed_data import seed_database
from .routes import ai, professionals, requests, history

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables and seed data
    init_db()
    with get_db() as conn:
        seed_database(conn)
        print("[HomeSOS Backend] SQLite database initialized and seeded successfully.")
    yield
    # Shutdown logic if any

app = FastAPI(
    title="HomeSOS API — Voice-First AI Problem-to-Service Dispatcher",
    description="ECHO Track Hackathon Project: Speak your problem. Get the right help.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(ai.router)
app.include_router(professionals.router)
app.include_router(requests.router)
app.include_router(history.router)

@app.get("/api/health", tags=["Health"])
def health_check():
    gemini_key = os.getenv("GEMINI_API_KEY", "").strip()
    ai_status = "Gemini Live API" if (gemini_key and not gemini_key.startswith("your_")) else "Offline Rule Engine Demo"
    return {
        "status": "healthy",
        "service": "HomeSOS Backend",
        "version": "1.0.0",
        "ai_engine": ai_status,
        "region": "Bengaluru, Karnataka, India"
    }
