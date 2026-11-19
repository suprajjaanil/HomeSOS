import time
import requests
import sys

BASE_URL = "http://127.0.0.1:8000"

def run_tests():
    print("=" * 60)
    print("HOMESOS END-TO-END SYSTEM TEST")
    print("=" * 60)

    # 1. Health check
    print("\n[TEST 1] Testing /api/health...")
    r = requests.get(f"{BASE_URL}/api/health", timeout=5)
    print("Health response:", r.status_code, r.json())
    assert r.status_code == 200, "Health check failed"

    # 2. Preset Scenarios
    print("\n[TEST 2] Testing /api/ai/scenarios...")
    r = requests.get(f"{BASE_URL}/api/ai/scenarios", timeout=5)
    scenarios = r.json()
    print(f"Scenarios count: {len(scenarios)}")
    for s in scenarios:
        print(f" - [{s['urgency']}] {s['title']} ({s['category']}) in {s['customer_location']}")
    assert len(scenarios) == 5, "Expected 5 preset scenarios"

    # 3. AI Analyze Endpoint (Plumbing Emergency Scenario)
    print("\n[TEST 3] Testing /api/ai/analyze (Plumbing Emergency)...")
    payload = {
        "text": "My bathroom pipe has suddenly burst. Water is spreading across the floor. I need a plumber immediately. I'm in BTM Layout.",
        "language": "en",
        "location_hint": "BTM Layout"
    }
    r = requests.post(f"{BASE_URL}/api/ai/analyze", json=payload, timeout=5)
    analysis = r.json()
    print("Identified Category:", analysis["category"])
    print("Identified Urgency:", analysis["urgency"])
    print("Symptoms:", analysis["symptoms"])
    print("Safety Guidance:", analysis["immediate_guidance"])
    print("Technician Briefing:", analysis["technician_briefing"])
    assert analysis["category"] == "Plumbing", f"Expected Plumbing, got {analysis['category']}"
    assert analysis["urgency"] == "Emergency", f"Expected Emergency, got {analysis['urgency']}"

    # 4. AI Analyze Endpoint (Electrical Hazard Scenario)
    print("\n[TEST 4] Testing /api/ai/analyze (Electrical Spark Hazard)...")
    payload_elec = {
        "text": "There is a sparking switch in our living room with a burning plastic smell, and our main power just tripped. We are in Koramangala 4th Block.",
        "language": "en",
        "location_hint": "Koramangala"
    }
    r = requests.post(f"{BASE_URL}/api/ai/analyze", json=payload_elec, timeout=5)
    analysis_elec = r.json()
    print("Identified Category:", analysis_elec["category"])
    print("Identified Urgency:", analysis_elec["urgency"])
    print("Safety Concern:", analysis_elec["safety_concerns"])
    print("Clarification Question:", analysis_elec["clarification_question"])
    assert analysis_elec["category"] == "Electrical"
    assert "FIRE" in (analysis_elec["safety_concerns"] or "").upper() or "SHOCK" in (analysis_elec["safety_concerns"] or "").upper()

    # 5. Nearby Professional Matching
    print("\n[TEST 5] Testing /api/professionals/match...")
    params = {
        "category": "Plumbing",
        "location": "BTM Layout",
        "urgency": "Emergency",
        "limit": 5
    }
    r = requests.get(f"{BASE_URL}/api/professionals/match", params=params, timeout=5)
    matches = r.json()
    print(f"Matched {len(matches)} professionals:")
    for m in matches:
        print(f" - {m['name']} ({m['locality']}) • Distance: {m['distance_km']} km • ETA: {m['estimated_arrival_mins']} mins • Rating: {m['rating']} ★ • Score: {m['match_score']}")
    assert len(matches) > 0, "No professionals matched"
    top_match = matches[0]

    # 6. Create Service Request
    print("\n[TEST 6] Testing POST /api/requests (Dispatching top match)...")
    req_payload = {
        "problem_description": analysis["problem_description"],
        "category": analysis["category"],
        "urgency": analysis["urgency"],
        "symptoms": analysis["symptoms"],
        "safety_concerns": analysis["safety_concerns"],
        "immediate_guidance": analysis["immediate_guidance"],
        "customer_location": analysis["customer_location"],
        "customer_name": "Priya Sharma",
        "customer_phone": "+91 98765 43210",
        "preferred_time": analysis["preferred_time"],
        "estimated_complexity": analysis["estimated_complexity"],
        "technician_briefing": analysis["technician_briefing"],
        "assigned_professional_id": top_match["id"],
        "price_estimate_min": 350,
        "price_estimate_max": 750
    }
    r = requests.post(f"{BASE_URL}/api/requests", json=req_payload, timeout=5)
    created_req = r.json()
    req_id = created_req["id"]
    print("Created Request ID:", req_id)
    print("Initial Status:", created_req["status"])
    print("Assigned Pro:", created_req["assigned_professional"]["name"] if created_req["assigned_professional"] else "None")
    assert r.status_code == 200

    # 7. Step through Simulated Workflow
    print("\n[TEST 7] Testing POST /api/requests/{id}/simulate-step...")
    # Step 1: ACCEPTED -> ON_THE_WAY
    r = requests.post(f"{BASE_URL}/api/requests/{req_id}/simulate-step", timeout=5)
    step1 = r.json()
    print(f"Step 1 Status: {step1['status']}")

    # Step 2: ON_THE_WAY -> ARRIVED
    r = requests.post(f"{BASE_URL}/api/requests/{req_id}/simulate-step", timeout=5)
    step2 = r.json()
    print(f"Step 2 Status: {step2['status']}")

    # Step 3: ARRIVED -> IN_PROGRESS
    r = requests.post(f"{BASE_URL}/api/requests/{req_id}/simulate-step", timeout=5)
    step3 = r.json()
    print(f"Step 3 Status: {step3['status']}")

    # Step 4: IN_PROGRESS -> COMPLETED
    r = requests.post(f"{BASE_URL}/api/requests/{req_id}/simulate-step", timeout=5)
    step4 = r.json()
    print(f"Step 4 Status: {step4['status']}")
    print(f"Final Settled Amount: ₹{step4['final_amount']}")
    assert step4["status"] == "COMPLETED"
    assert step4["final_amount"] is not None

    # 8. History & Stats Check
    print("\n[TEST 8] Testing /api/history and /api/history/stats...")
    r = requests.get(f"{BASE_URL}/api/history/stats", timeout=5)
    stats = r.json()
    print("Dashboard Stats:", stats)
    assert stats["completed_requests"] >= 1
    assert stats["total_spent"] > 0

    print("\n" + "=" * 60)
    print("ALL 8 END-TO-END API TESTS PASSED WITH 100% SUCCESS!")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
