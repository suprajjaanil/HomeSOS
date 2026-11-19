from fastapi import APIRouter, Query
from typing import List, Optional
from ..database import get_db
from ..models import row_to_request_dict, row_to_professional_dict
from ..schemas import ServiceRequestResponse, HistoryStats

router = APIRouter(prefix="/api/history", tags=["Service History & Memory"])

@router.get("", response_model=List[ServiceRequestResponse])
def get_service_history(customer_id: Optional[str] = Query(None, description="Filter history by customer ID")):
    with get_db() as conn:
        cursor = conn.cursor()
        if customer_id:
            cursor.execute("SELECT id FROM service_requests WHERE customer_id = ? ORDER BY created_at DESC;", (customer_id,))
        else:
            cursor.execute("SELECT id FROM service_requests ORDER BY created_at DESC;")
        req_ids = [r["id"] for r in cursor.fetchall()]
        
        results = []
        for r_id in req_ids:
            cursor.execute("SELECT * FROM service_requests WHERE id = ?", (r_id,))
            req_row = cursor.fetchone()
            prof_dict = None
            if req_row["assigned_professional_id"]:
                cursor.execute("SELECT * FROM professionals WHERE id = ?", (req_row["assigned_professional_id"],))
                p_row = cursor.fetchone()
                if p_row:
                    prof_dict = row_to_professional_dict(p_row)
            results.append(row_to_request_dict(req_row, prof_dict))
        return results

@router.get("/stats", response_model=HistoryStats)
def get_history_stats(customer_id: Optional[str] = Query(None, description="Filter stats by customer ID")):
    with get_db() as conn:
        cursor = conn.cursor()
        if customer_id:
            cursor.execute("SELECT status, urgency, final_amount, assigned_professional_id FROM service_requests WHERE customer_id = ?;", (customer_id,))
        else:
            cursor.execute("SELECT status, urgency, final_amount, assigned_professional_id FROM service_requests;")
        rows = cursor.fetchall()
        
        total = len(rows)
        completed = sum(1 for r in rows if r["status"].upper() == "COMPLETED")
        active = sum(1 for r in rows if r["status"].upper() not in ["COMPLETED", "CANCELLED"])
        emergency = sum(1 for r in rows if r["urgency"] in ["Emergency", "Urgent"])
        total_spent = sum(r["final_amount"] or 0 for r in rows if r["status"].upper() == "COMPLETED")
        
        assigned_ids = set(r["assigned_professional_id"] for r in rows if r["assigned_professional_id"])
        
        return {
            "total_requests": total,
            "completed_requests": completed,
            "active_requests": active,
            "emergency_requests": emergency,
            "saved_technicians": len(assigned_ids),
            "total_spent": total_spent
        }
