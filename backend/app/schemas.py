from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# --- AI Schemas ---
class AIAnalyzeRequest(BaseModel):
    text: str = Field(..., description="The user's spoken or typed household issue")
    language: Optional[str] = Field("auto", description="Detected or selected language (en, hi, kn)")
    location_hint: Optional[str] = Field(None, description="Optional GPS or selected locality hint")

class AIAnalyzeResponse(BaseModel):
    problem_description: str
    category: str
    symptoms: List[str]
    urgency: str  # Emergency, Urgent, Routine
    safety_concerns: Optional[str] = None
    immediate_guidance: Optional[str] = None
    customer_location: str
    preferred_time: str
    estimated_complexity: str  # Low, Medium, High
    missing_information: List[str] = []
    clarification_question: Optional[str] = None
    technician_briefing: str
    indicative_price_range: str
    is_demo_fallback: bool = False
    ai_confidence: float = 0.95

# --- Professional Schemas ---
class ProfessionalBase(BaseModel):
    id: str
    name: str
    category: str
    skills: List[str]
    locality: str
    latitude: float
    longitude: float
    rating: float
    completed_jobs: int
    response_time_min: int
    is_available: bool
    price_range: str
    profile_desc: str
    avatar_url: Optional[str] = None
    phone: str
    languages: str

class MatchedProfessional(ProfessionalBase):
    distance_km: float
    estimated_arrival_mins: int
    match_score: float
    rank_reason: str

class MatchRequest(BaseModel):
    category: str
    customer_location: str
    urgency: Optional[str] = "Urgent"

# --- Request Schemas ---
class ServiceRequestCreate(BaseModel):
    problem_description: str
    raw_transcript: Optional[str] = None
    category: str
    urgency: str = "Urgent"
    symptoms: List[str] = []
    safety_concerns: Optional[str] = None
    immediate_guidance: Optional[str] = None
    customer_location: str
    customer_name: Optional[str] = "Priya Sharma"
    customer_phone: Optional[str] = "+91 98765 43210"
    preferred_time: Optional[str] = "Immediate (within 30 mins)"
    estimated_complexity: Optional[str] = "Medium"
    technician_briefing: str
    assigned_professional_id: Optional[str] = None
    price_estimate_min: Optional[int] = 400
    price_estimate_max: Optional[int] = 850
    notes: Optional[str] = None

class ServiceRequestStatusUpdate(BaseModel):
    status: str
    notes: Optional[str] = None
    final_amount: Optional[int] = None
    assigned_professional_id: Optional[str] = None

class ServiceRequestResponse(BaseModel):
    id: str
    problem_description: str
    raw_transcript: Optional[str] = None
    category: str
    urgency: str
    symptoms: List[str]
    safety_concerns: Optional[str] = None
    immediate_guidance: Optional[str] = None
    customer_location: str
    customer_name: str
    customer_phone: str
    preferred_time: str
    estimated_complexity: str
    technician_briefing: str
    assigned_professional_id: Optional[str] = None
    assigned_professional: Optional[ProfessionalBase] = None
    status: str
    price_estimate_min: int
    price_estimate_max: int
    final_amount: Optional[int] = None
    timeline: List[Dict[str, Any]] = []
    notes: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

class HistoryStats(BaseModel):
    total_requests: int
    completed_requests: int
    active_requests: int
    emergency_requests: int
    saved_technicians: int
    total_spent: int
