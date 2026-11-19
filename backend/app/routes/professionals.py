from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional
from ..database import get_db
from ..matching_service import match_professionals
from ..models import row_to_professional_dict
from ..schemas import ProfessionalBase, MatchedProfessional

router = APIRouter(prefix="/api/professionals", tags=["Service Professionals"])

@router.get("", response_model=List[ProfessionalBase])
def list_professionals(category: Optional[str] = None):
    with get_db() as conn:
        cursor = conn.cursor()
        if category and not hasattr(category, "default"):
            cursor.execute("SELECT * FROM professionals WHERE category LIKE ?", (f"%{category}%",))
        else:
            cursor.execute("SELECT * FROM professionals")
        rows = cursor.fetchall()
        return [row_to_professional_dict(r) for r in rows]

@router.get("/match", response_model=List[MatchedProfessional])
def match_professionals_endpoint(
    category: str = Query(..., description="Target service category"),
    location: str = Query("BTM Layout", description="Customer Bengaluru locality"),
    urgency: str = Query("Urgent", description="Emergency, Urgent, or Routine"),
    limit: int = Query(5, ge=1, le=10)
):
    with get_db() as conn:
        results = match_professionals(
            conn=conn,
            category=category,
            customer_location=location,
            urgency=urgency,
            limit=limit
        )
        return results

@router.get("/{prof_id}", response_model=ProfessionalBase)
def get_professional(prof_id: str):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM professionals WHERE id = ?", (prof_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Professional not found")
        return row_to_professional_dict(row)
