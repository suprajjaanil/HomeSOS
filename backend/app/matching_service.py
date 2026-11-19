import math
from typing import List, Dict, Any
from .seed_data import BENGALURU_LOCALITIES
from .models import row_to_professional_dict

def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate great-circle distance between two GPS coordinates in kilometers."""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)

def resolve_customer_coordinates(location_str: str) -> tuple[float, float]:
    """Find the best matching locality coordinates or default to BTM Layout (Bengaluru central hub for demo)."""
    if not location_str:
        return (12.9166, 77.6101)
    
    clean_loc = location_str.strip().lower()
    for name, coords in BENGALURU_LOCALITIES.items():
        if name.lower() in clean_loc or clean_loc in name.lower():
            return (coords["lat"], coords["lng"])
            
    if "btm" in clean_loc:
        return (12.9166, 77.6101)
    if "jayanagar" in clean_loc:
        return (12.9308, 77.5838)
    if "jp nagar" in clean_loc:
        return (12.9063, 77.5857)
    if "banashankari" in clean_loc:
        return (12.9255, 77.5468)
    if "koramangala" in clean_loc:
        return (12.9352, 77.6245)
    if "hsr" in clean_loc:
        return (12.9121, 77.6446)
    if "indiranagar" in clean_loc:
        return (12.9784, 77.6408)

    return (12.9166, 77.6101)

def match_professionals(
    conn,
    category: str,
    customer_location: str,
    urgency: str = "Urgent",
    limit: int = 5
) -> List[Dict[str, Any]]:
    """
    Ranks professionals based on:
    1. Category match
    2. Proximity distance in km
    3. Availability
    4. ETA factoring Bengaluru traffic
    5. Ratings & job volume
    6. Urgency weighting
    """
    c_lat, c_lng = resolve_customer_coordinates(customer_location)
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM professionals WHERE category LIKE ?", (f"%{category}%",))
    rows = cursor.fetchall()

    if not rows:
        cursor.execute("SELECT * FROM professionals")
        rows = cursor.fetchall()

    scored_results = []
    is_emergency = urgency.upper() in ["EMERGENCY", "URGENT"]

    for row in rows:
        prof = row_to_professional_dict(row)
        dist_km = haversine_km(c_lat, c_lng, prof["latitude"], prof["longitude"])
        traffic_travel_min = int(dist_km * 3.5)
        eta_mins = max(8, prof["response_time_min"] + traffic_travel_min)

        rating_pts = (prof["rating"] / 5.0) * 30
        proximity_pts = max(0, 40 - (dist_km * 4))
        availability_pts = 20 if prof["is_available"] else 0
        exp_pts = min(10, (prof["completed_jobs"] / 50.0))

        if is_emergency:
            eta_penalty = max(0, (eta_mins - 10) * 1.5)
            score = (rating_pts * 0.8) + (proximity_pts * 1.4) + availability_pts + exp_pts - eta_penalty
        else:
            score = rating_pts + proximity_pts + availability_pts + exp_pts

        if dist_km <= 1.8:
            rank_reason = f"Closest nearby technician ({dist_km} km • ETA ~{eta_mins}m)"
        elif prof["rating"] >= 4.9:
            rank_reason = f"Top-rated {prof['category']} expert ({prof['rating']} ★ • {prof['completed_jobs']}+ jobs)"
        elif is_emergency and eta_mins <= 15:
            rank_reason = f"Fastest emergency arrival (~{eta_mins} mins)"
        else:
            rank_reason = f"Recommended specialist in {prof['locality']}"

        scored_results.append({
            **prof,
            "distance_km": dist_km,
            "estimated_arrival_mins": eta_mins,
            "match_score": round(max(10.0, score), 2),
            "rank_reason": rank_reason
        })

    scored_results.sort(key=lambda x: x["match_score"], reverse=True)
    return scored_results[:limit]
