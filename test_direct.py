import sys
import time
from backend.app.database import init_db, get_db
from backend.app.seed_data import seed_database
from backend.app.routes.auth import register, login, get_me
from backend.app.routes.ai import analyze_endpoint, get_demo_scenarios
from backend.app.routes.professionals import list_professionals, match_professionals_endpoint, get_professional
from backend.app.routes.requests import create_service_request, list_service_requests, get_service_request, simulate_next_step, update_request_status
from backend.app.routes.history import get_service_history, get_history_stats
from backend.app.schemas import (
    AIAnalyzeRequest, ServiceRequestCreate, ServiceRequestStatusUpdate,
    UserLoginRequest, UserRegisterRequest
)

def run_direct_tests():
    print("=" * 60)
    print("HOMESOS VERSION 2 DIRECT INTEGRATION TESTS")
    print("=" * 60)

    # 1. DB Init & Seed
    init_db()
    with get_db() as conn:
        seed_database(conn)

    # 2. Customer Auth Test
    print("\n[TEST 1] Testing Customer Login (Default Demo User)...")
    auth_res = login(UserLoginRequest(email="priya@example.com", password="password123"))
    print(f"Logged in user: {auth_res['user']['name']} ({auth_res['user']['email']})")
    assert auth_res['user']['name'] == "Priya Sharma"
    assert len(auth_res['token']) > 10

    # 3. Demo scenarios
    scenarios = get_demo_scenarios()
    print(f"\n[TEST 2] Demo Scenarios fetched: {len(scenarios)}")
    for s in scenarios:
        print(f" - [{s['urgency']}] {s['title']} ({s['category']}) in {s['customer_location']}")
    assert len(scenarios) == 5

    # 4. AI Analyze - Plumbing Emergency
    print("\n[TEST 3] Testing analyze_endpoint for Plumbing...")
    res = analyze_endpoint(AIAnalyzeRequest(
        text="My bathroom pipe has suddenly burst. Water is spreading across the floor. I need a plumber immediately. I'm in BTM Layout.",
        language="en",
        location_hint="BTM Layout",
        image_url="/uploads/demo_leak.jpg"
    ))
    print(f"Category: {res['category']}, Urgency: {res['urgency']}")
    print(f"Symptoms: {res['symptoms']}")
    print(f"Visual Desc: {res.get('visual_description')}")
    print(f"Safety Guidance: {res['immediate_guidance']}")
    print(f"Briefing: {res['technician_briefing']}")
    assert res['category'] == "Plumbing"
    assert res['urgency'] == "Emergency"

    # 5. AI Analyze - Electrical Spark
    print("\n[TEST 4] Testing analyze_endpoint for Electrical Hazard...")
    res_elec = analyze_endpoint(AIAnalyzeRequest(
        text="There is a sparking switch in our living room with a burning plastic smell, and our main power just tripped. We are in Koramangala 4th Block.",
        language="en",
        location_hint="Koramangala"
    ))
    print(f"Category: {res_elec['category']}, Urgency: {res_elec['urgency']}")
    print(f"Safety: {res_elec['safety_concerns']}")
    assert res_elec['category'] == "Electrical"
    assert res_elec['urgency'] == "Emergency"

    # 6. Matching Professionals
    print("\n[TEST 5] Testing match_professionals_endpoint...")
    matches = match_professionals_endpoint(category="Plumbing", location="BTM Layout", urgency="Emergency", limit=5)
    print(f"Matched {len(matches)} professionals:")
    for m in matches:
        print(f" - {m['name']} ({m['locality']}) • {m['distance_km']} km • ETA: {m['estimated_arrival_mins']} mins • {m['rating']} ★ • Reason: {m['rank_reason']}")
    assert len(matches) > 0
    top_pro = matches[0]

    # 7. Create Service Request with Images and Customer ID
    print(f"\n[TEST 6] Testing create_service_request with {top_pro['name']} and photos...")
    req = create_service_request(ServiceRequestCreate(
        customer_id=auth_res['user']['id'],
        problem_description=res['problem_description'],
        category=res['category'],
        urgency=res['urgency'],
        symptoms=res['symptoms'],
        safety_concerns=res['safety_concerns'],
        immediate_guidance=res['immediate_guidance'],
        customer_location=res['customer_location'],
        customer_name=auth_res['user']['name'],
        customer_phone=auth_res['user']['phone'],
        preferred_time=res['preferred_time'],
        estimated_complexity=res['estimated_complexity'],
        technician_briefing=res['technician_briefing'],
        assigned_professional_id=top_pro['id'],
        price_estimate_min=350,
        price_estimate_max=750,
        images=["/uploads/pipe_burst_preview.jpg"],
        image_analysis="Visible high-pressure flexi-hose spray and floor pooling. Preliminary observation."
    ))
    print(f"Created Request ID: {req['id']}, Status: {req['status']}")
    print(f"Assigned Pro: {req['assigned_professional']['name']}")
    print(f"Attached Images: {req['images']}")
    req_id = req["id"]
    assert req["status"] == "ASSIGNED"
    assert len(req["images"]) == 1

    # 8. Step through Simulated Workflow (9 stages)
    print("\n[TEST 7] Testing simulate_next_step lifecycle...")
    expected_statuses = [
        "ACCEPTED",
        "ON_THE_WAY",
        "ARRIVED",
        "IN_PROGRESS",
        "COMPLETED"
    ]
    current_req = req
    for exp in expected_statuses:
        current_req = simulate_next_step(req_id)
        print(f"Stage -> {current_req['status']}")
        assert current_req['status'] == exp

    print(f"Final Settled Amount: ₹{current_req['final_amount']}")
    assert current_req['final_amount'] > 0

    # 9. History and Dashboard Stats for Customer
    print("\n[TEST 8] Testing get_service_history and get_history_stats...")
    user_history = get_service_history(customer_id=auth_res['user']['id'])
    print(f"Total requests for {auth_res['user']['name']}: {len(user_history)}")
    stats = get_history_stats(customer_id=auth_res['user']['id'])
    print("Customer dashboard metrics:", stats)
    assert stats['completed_requests'] >= 1
    assert stats['total_spent'] > 0

    # 10. List All Professionals
    print("\n[TEST 9] Testing list_professionals...")
    all_profs = list_professionals()
    print(f"Total seeded professionals: {len(all_profs)}")
    assert len(all_profs) >= 15

    print("\n" + "=" * 60)
    print("ALL 9 VERSION 2 INTEGRATION TESTS PASSED WITH 100% SUCCESS!")
    print("=" * 60)

if __name__ == "__main__":
    run_direct_tests()
