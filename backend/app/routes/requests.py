import json
import random
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from ..database import get_db
from ..models import row_to_request_dict, row_to_professional_dict
from ..schemas import ServiceRequestCreate, ServiceRequestStatusUpdate, ServiceRequestResponse

router = APIRouter(prefix="/api/requests", tags=["Service Requests"])

STATUS_FLOW = [
    "REQUESTED",
    "SEARCHING",
    "ACCEPTED",
    "ON_THE_WAY",
    "ARRIVED",
    "IN_PROGRESS",
    "COMPLETED"
]

def _fetch_request_with_prof(cursor, req_id: str):
    cursor.execute("SELECT * FROM service_requests WHERE id = ?", (req_id,))
    req_row = cursor.fetchone()
    if not req_row:
        return None
    
    prof_dict = None
    if req_row["assigned_professional_id"]:
        cursor.execute("SELECT * FROM professionals WHERE id = ?", (req_row["assigned_professional_id"],))
        p_row = cursor.fetchone()
        if p_row:
            prof_dict = row_to_professional_dict(p_row)

    return row_to_request_dict(req_row, prof_dict)

@router.post("", response_model=ServiceRequestResponse)
def create_service_request(payload: ServiceRequestCreate):
    random_digits = random.randint(1000, 9999)
    req_id = f"SOS-2026-{random_digits}"
    now_str = datetime.now(timezone.utc).strftime("%I:%M %p")
    iso_now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")

    initial_timeline = [
        {"time": now_str, "event": f"Voice/text request submitted by {payload.customer_name}"},
        {"time": now_str, "event": f"AI identified {payload.category} ({payload.urgency})"}
    ]

    initial_status = "REQUESTED"
    if payload.assigned_professional_id:
        initial_status = "ACCEPTED"
        initial_timeline.append({"time": now_str, "event": f"Technician selected: {payload.assigned_professional_id}"})

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO service_requests (
            id, problem_description, raw_transcript, category, urgency,
            symptoms, safety_concerns, immediate_guidance, customer_location,
            customer_name, customer_phone, preferred_time, estimated_complexity,
            technician_briefing, assigned_professional_id, status,
            price_estimate_min, price_estimate_max, timeline, notes,
            created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            req_id,
            payload.problem_description,
            payload.raw_transcript,
            payload.category,
            payload.urgency,
            json.dumps(payload.symptoms),
            payload.safety_concerns,
            payload.immediate_guidance,
            payload.customer_location,
            payload.customer_name or "Priya Sharma",
            payload.customer_phone or "+91 98765 43210",
            payload.preferred_time or "Immediate",
            payload.estimated_complexity or "Medium",
            payload.technician_briefing,
            payload.assigned_professional_id,
            initial_status,
            payload.price_estimate_min or 350,
            payload.price_estimate_max or 750,
            json.dumps(initial_timeline),
            payload.notes,
            iso_now,
            iso_now
        ))
        conn.commit()
        return _fetch_request_with_prof(cursor, req_id)

@router.get("", response_model=List[ServiceRequestResponse])
def list_service_requests(status: Optional[str] = Query(None, description="Filter by status")):
    with get_db() as conn:
        cursor = conn.cursor()
        if status:
            cursor.execute("SELECT id FROM service_requests WHERE status = ? ORDER BY created_at DESC", (status.upper(),))
        else:
            cursor.execute("SELECT id FROM service_requests ORDER BY created_at DESC")
        req_ids = [r["id"] for r in cursor.fetchall()]
        return [_fetch_request_with_prof(cursor, r_id) for r_id in req_ids]

@router.get("/{request_id}", response_model=ServiceRequestResponse)
def get_service_request(request_id: str):
    with get_db() as conn:
        cursor = conn.cursor()
        result = _fetch_request_with_prof(cursor, request_id)
        if not result:
            raise HTTPException(status_code=404, detail="Service request not found")
        return result

@router.patch("/{request_id}/status", response_model=ServiceRequestResponse)
def update_request_status(request_id: str, payload: ServiceRequestStatusUpdate):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM service_requests WHERE id = ?", (request_id,))
        req_row = cursor.fetchone()
        if not req_row:
            raise HTTPException(status_code=404, detail="Service request not found")

        new_status = payload.status.upper()
        now_str = datetime.now(timezone.utc).strftime("%I:%M %p")
        iso_now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")

        # Parse timeline
        try:
            timeline = json.loads(req_row["timeline"]) if req_row["timeline"] else []
        except Exception:
            timeline = []

        status_events = {
            "SEARCHING": "AI Dispatcher pinging nearby available technicians",
            "ACCEPTED": "Technician confirmed service request dispatch",
            "ON_THE_WAY": "Technician has departed and is en route via Bengaluru transit",
            "ARRIVED": "Technician arrived at customer premises with diagnostic kit",
            "IN_PROGRESS": "Work in progress: Inspection, parts fitting & diagnostics",
            "COMPLETED": "Service completed successfully. Quality check verified.",
            "CANCELLED": "Request cancelled by customer before technician arrival."
        }
        event_desc = status_events.get(new_status, f"Status updated to {new_status}")
        if payload.notes:
            event_desc += f" ({payload.notes})"

        timeline.append({"time": now_str, "event": event_desc})

        # Calculate final amount
        final_amt = req_row["final_amount"]
        if payload.final_amount is not None:
            final_amt = payload.final_amount
        elif new_status == "COMPLETED" and not final_amt:
            final_amt = int((req_row["price_estimate_min"] + req_row["price_estimate_max"]) / 2)

        assigned_prof_id = payload.assigned_professional_id or req_row["assigned_professional_id"]
        notes = payload.notes or req_row["notes"]

        cursor.execute("""
        UPDATE service_requests
        SET status = ?, timeline = ?, final_amount = ?, assigned_professional_id = ?, notes = ?, updated_at = ?
        WHERE id = ?
        """, (new_status, json.dumps(timeline), final_amt, assigned_prof_id, notes, iso_now, request_id))
        conn.commit()

        return _fetch_request_with_prof(cursor, request_id)

@router.post("/{request_id}/simulate-step", response_model=ServiceRequestResponse)
def simulate_next_step(request_id: str):
    """
    Demo simulation helper: Steps through the workflow:
    REQUESTED -> SEARCHING -> ACCEPTED -> ON_THE_WAY -> ARRIVED -> IN_PROGRESS -> COMPLETED
    """
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM service_requests WHERE id = ?", (request_id,))
        req = cursor.fetchone()
        if not req:
            raise HTTPException(status_code=404, detail="Service request not found")

        if req["status"] == "CANCELLED":
            raise HTTPException(status_code=400, detail="Cannot advance a cancelled request")

        if req["status"] == "COMPLETED":
            return _fetch_request_with_prof(cursor, request_id)

        assigned_prof_id = req["assigned_professional_id"]
        if not assigned_prof_id:
            cursor.execute("SELECT id FROM professionals WHERE category LIKE ? LIMIT 1", (f"%{req['category']}%",))
            p_row = cursor.fetchone()
            if not p_row:
                cursor.execute("SELECT id FROM professionals LIMIT 1")
                p_row = cursor.fetchone()
            if p_row:
                assigned_prof_id = p_row["id"]

        try:
            current_idx = STATUS_FLOW.index(req["status"])
            next_status = STATUS_FLOW[min(current_idx + 1, len(STATUS_FLOW) - 1)]
        except ValueError:
            next_status = "ACCEPTED"

    return update_request_status(
        request_id=request_id,
        payload=ServiceRequestStatusUpdate(
            status=next_status,
            assigned_professional_id=assigned_prof_id
        )
    )
