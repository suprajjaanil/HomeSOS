import sys
from starlette.testclient import TestClient
from backend.app.main import app
from backend.app.database import init_db, get_db
from backend.app.seed_data import seed_database

def run_inprocess_tests():
    print("=" * 60)
    print("HOMESOS IN-PROCESS END-TO-END VERIFICATION")
    print("=" * 60)

    # Initialize DB
    init_db()
    with get_db() as conn:
        seed_database(conn)

    with TestClient(app) as client:
        # 1. Health check
        print("\n[TEST 1] Testing /api/health...")
        r = client.get("/api/health")
        print("Health response:", r.status_code, r.json())
        assert r.status_code == 200, "Health check failed"

        # 2. Preset Scenarios
        print("\n[TEST 2] Testing /api/ai/scenarios...")
        r = client.get("/api/ai/scenarios")
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
        r = client.post("/api/ai/analyze", json=payload)
        analysis = r.json()
        print("Identified Category:", analysis["category"])
        print("Identified Urgency:", analysis["urgency"])
        print("Symptoms:", analysis["symptoms"])
        print("Safety Guidance:", analysis["immediate_guidance"])
        print("Technician Briefing:", analysis["technician_briefing"])
        assert analysis["category"] == "Plumbing"
        assert analysis["urgency"] == "Emergency"

        # 4. AI Analyze Endpoint (Electrical Hazard Scenario)
        print("\n[TEST 4] Testing /api/ai/analyze (Electrical Spark Hazard)...")
        payload_elec = {
            "text": "There is a sparking switch in our living room with a burning plastic smell, and our main power just tripped. We are in Koramangala 4th Block.",
            "language": "en",
            "location_hint": "Koramangala"
        }
        r = client.post("/api/ai/analyze", json=payload_elec)
        analysis_elec = r.json()
        print("Identified Category:", analysis_elec["category"])
        print("Identified Urgency:", analysis_elec["urgency"])
        print("Safety Concern:", analysis_elec["safety_concerns"])
        print("Clarification Question:", analysis_elec["clarification_question"])
        assert analysis_elec["category"] == "Electrical"
        assert analysis_elec["safety_concerns"] is not None

        # 5. Nearby Professional Matching
        print("\n[TEST 5] Testing /api/professionals/match...")
        params = {
            "category": "Plumbing",
            "location": "BTM Layout",
            "urgency": "Emergency",
            "limit": 5
        }
        r = client.get("/api/professionals/match", params=params)
        matches = r.json()
        print(f"Matched {len(matches)} professionals:")
        for m in matches:
            print(f" - {m['name']} ({m['locality']}) • Distance: {m['distance_km']} km • ETA: {m['estimated_arrival_mins']} mins • Rating: {m['rating']} ★ • Score: {m['match_score']}")
        assert len(matches) > 0
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
        r = client.post("/api/requests", json=req_payload)
        created_req = r.json()
        req_id = created_req["id"]
        print("Created Request ID:", req_id)
        print("Initial Status:", created_req["status"])
        print("Assigned Pro:", created_req["assigned_professional"]["name"] if created_req["assigned_professional"] else "None")
        assert r.status_code == 200

        # 7. Step through Simulated Workflow
        print("\n[TEST 7] Testing POST /api/requests/{id}/simulate-step...")
        # Step 1: ACCEPTED -> ON_THE_WAY
        r = client.post(f"/api/requests/{req_id}/simulate-step")
        step1 = r.json()
        print(f"Step 1 Status: {step1['status']}")

        # Step 2: ON_THE_WAY -> ARRIVED
        r = client.post(f"/api/requests/{req_id}/simulate-step")
        step2 = r.json()
        print(f"Step 2 Status: {step2['status']}")

        # Step 3: ARRIVED -> IN_PROGRESS
        r = client.post(f"/api/requests/{req_id}/simulate-step")
        step3 = r.json()
        print(f"Step 3 Status: {step3['status']}")

        # Step 4: IN_PROGRESS -> COMPLETED
        r = client.post(f"/api/requests/{req_id}/simulate-step")
        step4 = r.json()
        print(f"Step 4 Status: {step4['status']}")
        print(f"Final Settled Amount: ₹{step4['final_amount']}")
        assert step4["status"] == "COMPLETED"
        assert step4["final_amount"] is not None

        # 8. History & Stats Check
        print("\n[TEST 8] Testing /api/history and /api/history/stats...")
        r = client.get("/api/history/stats")
        stats = r.json()
        print("Dashboard Stats:", stats)
        assert stats["completed_requests"] >= 1
        assert stats["total_spent"] > 0

        # 9. List Professionals Endpoint
        print("\n[TEST 9] Testing GET /api/professionals...")
        r = client.get("/api/professionals")
        profs = r.json()
        print(f"Total seeded professionals: {len(profs)}")
        assert len(profs) >= 15

        print("\n" + "=" * 60)
        print("ALL 9 TESTS EXECUTED AND PASSED WITH 100% SUCCESS!")
        print("=" * 60)

if __name__ == "__main__":
    run_inprocess_tests()
