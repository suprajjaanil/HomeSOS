import sys
from backend.app.database import init_db, get_db
from backend.app.seed_data import seed_database
from backend.app.routes.ai import analyze_endpoint, get_demo_scenarios
from backend.app.routes.professionals import list_professionals, match_professionals_endpoint, get_professional
from backend.app.routes.requests import create_service_request, list_service_requests, get_service_request, simulate_next_step, update_request_status
from backend.app.routes.history import get_service_history, get_history_stats
from backend.app.schemas import AIAnalyzeRequest, ServiceRequestCreate, ServiceRequestStatusUpdate

def run_direct_tests():
    print("=" * 60)
    print("HOMESOS DIRECT ENDPOINT FUNCTION INTEGRATION TESTS")
    print("=" * 60)

    # 1. DB Init & Seed
    init_db()
    with get_db() as conn:
        seed_database(conn)

    # 2. Demo scenarios
    scenarios = get_demo_scenarios()
    print(f"\n[TEST 1] Demo Scenarios fetched: {len(scenarios)}")
    for s in scenarios:
        print(f" - [{s['urgency']}] {s['title']} ({s['category']}) in {s['customer_location']}")
    assert len(scenarios) == 5

    # 3. AI Analyze - Plumbing Emergency
    print("\n[TEST 2] Testing analyze_endpoint for Plumbing...")
    res = analyze_endpoint(AIAnalyzeRequest(
        text="My bathroom pipe has suddenly burst. Water is spreading across the floor. I need a plumber immediately. I'm in BTM Layout.",
        language="en",
        location_hint="BTM Layout"
    ))
    print(f"Category: {res['category']}, Urgency: {res['urgency']}")
    print(f"Symptoms: {res['symptoms']}")
    print(f"Safety Guidance: {res['immediate_guidance']}")
    print(f"Briefing: {res['technician_briefing']}")
    assert res['category'] == "Plumbing"
    assert res['urgency'] == "Emergency"

    # 4. AI Analyze - Electrical Spark
    print("\n[TEST 3] Testing analyze_endpoint for Electrical Hazard...")
    res_elec = analyze_endpoint(AIAnalyzeRequest(
        text="There is a sparking switch in our living room with a burning plastic smell, and our main power just tripped. We are in Koramangala 4th Block.",
        language="en",
        location_hint="Koramangala"
    ))
    print(f"Category: {res_elec['category']}, Urgency: {res_elec['urgency']}")
    print(f"Safety: {res_elec['safety_concerns']}")
    assert res_elec['category'] == "Electrical"
    assert res_elec['urgency'] == "Emergency"

    # 5. Matching Professionals
    print("\n[TEST 4] Testing match_professionals_endpoint...")
    matches = match_professionals_endpoint(category="Plumbing", location="BTM Layout", urgency="Emergency", limit=5)
    print(f"Matched {len(matches)} professionals:")
    for m in matches:
        print(f" - {m['name']} ({m['locality']}) • {m['distance_km']} km • ETA: {m['estimated_arrival_mins']} mins • {m['rating']} ★ • Reason: {m['rank_reason']}")
    assert len(matches) > 0
    top_pro = matches[0]

    # 6. Create Service Request
    print(f"\n[TEST 5] Testing create_service_request with {top_pro['name']}...")
    req = create_service_request(ServiceRequestCreate(
        problem_description=res['problem_description'],
        category=res['category'],
        urgency=res['urgency'],
        symptoms=res['symptoms'],
        safety_concerns=res['safety_concerns'],
        immediate_guidance=res['immediate_guidance'],
        customer_location=res['customer_location'],
        customer_name="Priya Sharma",
        customer_phone="+91 98765 43210",
        preferred_time=res['preferred_time'],
        estimated_complexity=res['estimated_complexity'],
        technician_briefing=res['technician_briefing'],
        assigned_professional_id=top_pro['id'],
        price_estimate_min=350,
        price_estimate_max=750
    ))
    print(f"Created Request ID: {req['id']}, Status: {req['status']}")
    print(f"Assigned Pro: {req['assigned_professional']['name']}")
    req_id = req["id"]
    assert req["status"] == "ACCEPTED"

    # 7. Step through Simulated Workflow
    print("\n[TEST 6] Testing simulate_next_step lifecycle...")
    # Step 1: ACCEPTED -> ON_THE_WAY
    s1 = simulate_next_step(req_id)
    print(f"Step 1: {s1['status']}")
    assert s1["status"] == "ON_THE_WAY"

    # Step 2: ON_THE_WAY -> ARRIVED
    s2 = simulate_next_step(req_id)
    print(f"Step 2: {s2['status']}")
    assert s2["status"] == "ARRIVED"

    # Step 3: ARRIVED -> IN_PROGRESS
    s3 = simulate_next_step(req_id)
    print(f"Step 3: {s3['status']}")
    assert s3["status"] == "IN_PROGRESS"

    # Step 4: IN_PROGRESS -> COMPLETED
    s4 = simulate_next_step(req_id)
    print(f"Step 4: {s4['status']}, Final Amount: ₹{s4['final_amount']}")
    assert s4["status"] == "COMPLETED"
    assert s4["final_amount"] > 0

    # 8. History and Dashboard Stats
    print("\n[TEST 7] Testing get_service_history and get_history_stats...")
    history = get_service_history()
    print(f"Total requests in history: {len(history)}")
    stats = get_history_stats()
    print("Dashboard metrics:", stats)
    assert stats['completed_requests'] >= 1
    assert stats['total_spent'] > 0

    # 9. List All Professionals
    print("\n[TEST 8] Testing list_professionals...")
    all_profs = list_professionals()
    print(f"Total seeded professionals: {len(all_profs)}")
    assert len(all_profs) >= 15

    print("\n" + "=" * 60)
    print("ALL 8 ENDPOINT TESTS COMPLETED WITH 100% SUCCESS!")
    print("=" * 60)

if __name__ == "__main__":
    run_direct_tests()
