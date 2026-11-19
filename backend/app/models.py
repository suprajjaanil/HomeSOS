import json
from typing import Dict, Any, Optional

def row_to_user_dict(row) -> Optional[Dict[str, Any]]:
    if not row:
        return None
    return {
        "id": row["id"],
        "name": row["name"],
        "email": row["email"],
        "phone": row["phone"],
        "locality": row["locality"],
        "address": row["address"],
        "created_at": str(row["created_at"]) if "created_at" in row.keys() else None
    }

def row_to_professional_dict(row) -> Optional[Dict[str, Any]]:
    if not row:
        return None
    
    skills_raw = row["skills"]
    try:
        skills = json.loads(skills_raw) if skills_raw else []
    except Exception:
        skills = [s.strip() for s in skills_raw.split(",") if s.strip()]

    return {
        "id": row["id"],
        "name": row["name"],
        "category": row["category"],
        "skills": skills,
        "locality": row["locality"],
        "latitude": float(row["latitude"]),
        "longitude": float(row["longitude"]),
        "rating": float(row["rating"]),
        "completed_jobs": int(row["completed_jobs"]),
        "response_time_min": int(row["response_time_min"]),
        "is_available": bool(row["is_available"]),
        "price_range": row["price_range"],
        "profile_desc": row["profile_desc"],
        "avatar_url": row["avatar_url"],
        "phone": row["phone"],
        "languages": row["languages"],
        "created_at": str(row["created_at"]) if "created_at" in row.keys() else None
    }

def row_to_request_dict(row, assigned_prof: Optional[Dict[str, Any]] = None) -> Optional[Dict[str, Any]]:
    if not row:
        return None

    symptoms_raw = row["symptoms"]
    try:
        symptoms = json.loads(symptoms_raw) if symptoms_raw else []
    except Exception:
        symptoms = [s.strip() for s in symptoms_raw.split(",") if s.strip()]

    timeline_raw = row["timeline"]
    try:
        timeline = json.loads(timeline_raw) if timeline_raw else []
    except Exception:
        timeline = []

    # Version 2: Images support
    images = []
    if "images" in row.keys() and row["images"]:
        try:
            images = json.loads(row["images"]) if isinstance(row["images"], str) else row["images"]
        except Exception:
            images = [row["images"]]

    image_analysis = row["image_analysis"] if "image_analysis" in row.keys() else None
    customer_id = row["customer_id"] if "customer_id" in row.keys() else "user-demo"

    return {
        "id": row["id"],
        "customer_id": customer_id,
        "problem_description": row["problem_description"],
        "raw_transcript": row["raw_transcript"],
        "category": row["category"],
        "urgency": row["urgency"],
        "symptoms": symptoms,
        "safety_concerns": row["safety_concerns"],
        "immediate_guidance": row["immediate_guidance"],
        "customer_location": row["customer_location"],
        "customer_name": row["customer_name"],
        "customer_phone": row["customer_phone"],
        "preferred_time": row["preferred_time"],
        "estimated_complexity": row["estimated_complexity"],
        "technician_briefing": row["technician_briefing"],
        "assigned_professional_id": row["assigned_professional_id"],
        "assigned_professional": assigned_prof,
        "status": row["status"],
        "price_estimate_min": int(row["price_estimate_min"]),
        "price_estimate_max": int(row["price_estimate_max"]),
        "final_amount": int(row["final_amount"]) if row["final_amount"] is not None else None,
        "timeline": timeline,
        "notes": row["notes"],
        "images": images,
        "image_analysis": image_analysis,
        "created_at": str(row["created_at"]) if "created_at" in row.keys() else None,
        "updated_at": str(row["updated_at"]) if "updated_at" in row.keys() else None
    }
