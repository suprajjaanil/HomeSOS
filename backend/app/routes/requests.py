import json
import random
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from ..database import get_db
from ..models import row_to_request_dict, row_to_professional_dict
from ..schemas import ServiceRequestCreate, ServiceRequestStatusUpdate, ServiceRequestResponse

router = APIRouter(prefix="/api/requests", tags=["Service Requests"])

# Version 2 Canonical Lifecycle Statuses
STATUS_FLOW = [
    "REQUEST_CREATED",
    "AI_ANALYSED",
    "MATCHED",
    "ASSIGNED",
    "ACCEPTED",
    "ON_THE_WAY",
    "ARRIVED",
    "IN_PROGRESS",
    "COMPLETED"
]

# Legacy normalization mapping
STATUS_ALIASES = {
    "REQUESTED": "REQUEST_CREATED",
    "SEARCHING": "MATCHED",
}

def normalize_status(status: str) -> str:
    s = status.upper().strip()
    return STATUS_ALIASES.get(s, s)

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
        {"time": now_str, "event": f"Request Created: Spoken/typed problem submitted by {payload.customer_name}"},
        {"time": now_str, "event": f"AI Analysed: Diagnosed as {payload.category} ({payload.urgency} urgency)"}
    ]

    initial_status = "REQUEST_CREATED"
    if payload.assigned_professional_id:
        initial_status = "ASSIGNED"
        initial_timeline.append({"time": now_str, "event": f"Assigned to provider ID: {payload.assigned_professional_id}"})

    customer_id = payload.customer_id or "user-demo"
    images_json = json.dumps(payload.images or [])

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO service_requests (
            id, customer_id, problem_description, raw_transcript, category, urgency,
            symptoms, safety_concerns, immediate_guidance, customer_location,
            customer_name, customer_phone, preferred_time, estimated_complexity,
            technician_briefing, assigned_professional_id, status,
            price_estimate_min, price_estimate_max, timeline, notes,
            images, image_analysis, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            req_id,
            customer_id,
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
            images_json,
            payload.image_analysis,
            iso_now,
            iso_now
        ))
        conn.commit()
        return _fetch_request_with_prof(cursor, req_id)

@router.get("", response_model=List[ServiceRequestResponse])
def list_service_requests(
    status: Optional[str] = Query(None, description="Filter by status"),
    customer_id: Optional[str] = Query(None, description="Filter by customer account ID")
):
    with get_db() as conn:
        cursor = conn.cursor()
        query = "SELECT id FROM service_requests WHERE 1=1"
        params = []
        if status:
            query += " AND (status = ? OR status = ?)"
            params.extend([status.upper(), normalize_status(status)])
        if customer_id:
            query += " AND customer_id = ?"
            params.append(customer_id)
        query += " ORDER BY created_at DESC"
        
        cursor.execute(query, tuple(params))
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

        new_status = normalize_status(payload.status)
        now_str = datetime.now(timezone.utc).strftime("%I:%M %p")
        iso_now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")

        # Parse timeline
        try:
            timeline = json.loads(req_row["timeline"]) if req_row["timeline"] else []
        except Exception:
            timeline = []

        status_events = {
            "REQUEST_CREATED": "Request created and registered in HomeSOS queue",
            "AI_ANALYSED": "AI Analysed: Problem classified and technician brief generated",
            "MATCHED": "Professionals Matched: Proximity engine identified suitable nearby technicians",
            "ASSIGNED": "Assigned: Technician assigned to booking",
            "ACCEPTED": "Accepted: [Simulated] Technician confirmed availability and dispatch",
            "ON_THE_WAY": "On The Way: [Simulated] Technician departed in transit across Bengaluru",
            "ARRIVED": "Arrived: [Simulated] Technician reached customer premises with equipment",
            "IN_PROGRESS": "Work in Progress: Active inspection, diagnostics and repair",
            "COMPLETED": "Completed: Service verified, test passed, and bill finalized",
            "CANCELLED": "Cancelled: Request cancelled before technician arrival"
        }
        event_desc = status_events.get(new_status, f"Status updated to {new_status}")
        if payload.notes:
            event_desc += f" ({payload.notes})"

        timeline.append({"time": now_str, "event": event_desc})

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
    Demo simulation helper: Steps through the full 9-stage lifecycle:
    REQUEST_CREATED -> AI_ANALYSED -> MATCHED -> ASSIGNED -> ACCEPTED -> ON_THE_WAY -> ARRIVED -> IN_PROGRESS -> COMPLETED
    """
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM service_requests WHERE id = ?", (request_id,))
        req = cursor.fetchone()
        if not req:
            raise HTTPException(status_code=404, detail="Service request not found")

        current_status = normalize_status(req["status"])
        if current_status == "CANCELLED":
            raise HTTPException(status_code=400, detail="Cannot advance a cancelled request")

        if current_status == "COMPLETED":
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
            current_idx = STATUS_FLOW.index(current_status)
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
