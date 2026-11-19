import os
import json
import re
from typing import Dict, Any, Optional

# Check for GEMINI_API_KEY
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()

# Rich Demo Scenarios for instantaneous demoing
PRESET_DEMO_SCENARIOS = {
    "plumbing_leak": {
        "id": "plumbing_leak",
        "title": "Burst Bathroom Pipe & Spreading Water",
        "sample_input": "My bathroom pipe has suddenly burst. Water is spreading across the floor. I need a plumber immediately. I'm in BTM Layout.",
        "category": "Plumbing",
        "urgency": "Emergency",
        "symptoms": ["Pipe burst", "Active water flooding", "Spreading across bathroom floor"],
        "safety_concerns": "Slipping hazard, possible electrical contact if water reaches bedroom switchboards",
        "immediate_guidance": "⚠️ Turn off the main water valve near the overhead tank or bathroom inlet immediately. Keep children away from standing water.",
        "customer_location": "BTM Layout",
        "preferred_time": "Immediate (within 15-20 mins)",
        "estimated_complexity": "Medium",
        "missing_information": [],
        "clarification_question": None,
        "technician_briefing": "URGENT PLUMBING: Bathroom mainline/flexi pipe rupture with active flooding. Customer located in BTM Layout. Bring high-pressure pipe clamp and 1/2-inch CPVC fittings.",
        "indicative_price_range": "₹350 - ₹750"
    },
    "electrical_spark": {
        "id": "electrical_spark",
        "title": "Sparking Switchboard & Tripped Main Power",
        "sample_input": "There is a sparking switch in our living room with a burning plastic smell, and our main power just tripped. We are in Koramangala 4th Block.",
        "category": "Electrical",
        "urgency": "Emergency",
        "symptoms": ["Sparking switchboard", "Burnt plastic odor", "Main power tripping", "Short circuit risk"],
        "safety_concerns": "HIGH FIRE HAZARD & ELECTROCUTION RISK. Do not touch the switchboard with wet hands or bare skin.",
        "immediate_guidance": "🚨 DANGER: Do not attempt to reset the tripped breaker until inspected. Keep the main MCB switched OFF. Avoid touching metal appliances.",
        "customer_location": "Koramangala 4th Block",
        "preferred_time": "Immediate emergency response",
        "estimated_complexity": "High",
        "missing_information": [],
        "clarification_question": "Is there any visible smoke or flame coming from behind the wall plate?",
        "technician_briefing": "EMERGENCY ELECTRICAL: Active arcing / sparking switchboard with burning smell and tripping MCB in Koramangala. Requires immediate insulation check and breaker isolation.",
        "indicative_price_range": "₹450 - ₹950"
    },
    "ac_not_cooling": {
        "id": "ac_not_cooling",
        "title": "AC Not Cooling in Peak Heat",
        "sample_input": "My master bedroom split AC is blowing warm air only. The outdoor unit makes a clicking sound. I am at 4th Block Jayanagar.",
        "category": "AC Repair",
        "urgency": "Urgent",
        "symptoms": ["AC blowing room temperature air", "Outdoor condenser clicking", "Compressor not kicking in"],
        "safety_concerns": "Potential motor capacitor overheat if left turned on",
        "immediate_guidance": "Turn off the AC via remote and switch off the dedicated AC MCB to prevent compressor burnout.",
        "customer_location": "Jayanagar",
        "preferred_time": "Today within 1-2 hours",
        "estimated_complexity": "Medium",
        "missing_information": ["AC brand and tonnage (e.g. 1.5 Ton Split)"],
        "clarification_question": "What brand is your air conditioner (e.g., Daikin, LG, Voltas, Blue Star)?",
        "technician_briefing": "AC REPAIR: Split AC cooling failure, compressor fails to engage with clicking relay in Jayanagar. Test run capacitor and refrigerant pressure.",
        "indicative_price_range": "₹499 - ₹1,200"
    },
    "broken_lock": {
        "id": "broken_lock",
        "title": "Jammed Main Door Lock & Trapped Outside",
        "sample_input": "Our main door key snapped half inside the lock cylinder and we are locked outside with groceries. Please send a locksmith to JP Nagar 2nd Phase.",
        "category": "Locksmith",
        "urgency": "Emergency",
        "symptoms": ["Key snapped inside lock", "Main door deadbolt jammed", "Customer locked outside"],
        "safety_concerns": "Security vulnerability, customer stranded outside residence",
        "immediate_guidance": "Do not insert screwdrivers or pins into the keyway, as it may push the broken key fragment deeper.",
        "customer_location": "JP Nagar 2nd Phase",
        "preferred_time": "Immediate (under 15 mins)",
        "estimated_complexity": "Medium",
        "missing_information": [],
        "clarification_question": None,
        "technician_briefing": "EMERGENCY LOCKSMITH: Snapped key extraction and cylinder reset for main entrance deadbolt in JP Nagar. Bring spiral extractor and replacement euro-cylinders.",
        "indicative_price_range": "₹400 - ₹850"
    },
    "carpentry_furniture": {
        "id": "carpentry_furniture",
        "title": "Broken Wardrobe Door & Loose Chair",
        "sample_input": "The heavy sliding door of our wardrobe came off its upper track and is leaning dangerously. Also have a loose dining chair leg. Banashankari.",
        "category": "Carpentry",
        "urgency": "Routine",
        "symptoms": ["Wardrobe slider derailed", "Heavy wooden panel leaning", "Dining chair joint wobble"],
        "safety_concerns": "Wardrobe door may fall and cause injury if bumped",
        "immediate_guidance": "Gently secure the leaning wardrobe door or rest it flat against a wall so it cannot tip over.",
        "customer_location": "Banashankari",
        "preferred_time": "Flexible (Today or tomorrow morning)",
        "estimated_complexity": "Low",
        "missing_information": [],
        "clarification_question": None,
        "technician_briefing": "CARPENTRY: Heavy sliding wardrobe door track realignment / replacement wheel hardware + dining chair wood glue joint tightening in Banashankari.",
        "indicative_price_range": "₹350 - ₹750"
    }
}

def analyze_with_rule_engine(text: str, location_hint: Optional[str] = None) -> Dict[str, Any]:
    """Smart fallback NLP parser when Gemini API is offline or key is unconfigured."""
    t_lower = text.lower()

    # Detect preset match first
    for key, scenario in PRESET_DEMO_SCENARIOS.items():
        if scenario["sample_input"].lower() in t_lower or t_lower in scenario["sample_input"].lower():
            res = dict(scenario)
            res["problem_description"] = scenario.get("problem_description", scenario.get("sample_input", text))
            res["visual_description"] = scenario.get("visual_description", None)
            res["is_demo_fallback"] = True
            res["ai_confidence"] = 0.98
            return res

    # 1. Category Detection
    category = "General Maintenance"
    if any(k in t_lower for k in ["pipe", "leak", "water", "tap", "sink", "drain", "flush", "plumb", "basin", "geyser", "tank", "valve", "clog"]):
        category = "Plumbing"
    elif any(k in t_lower for k in ["spark", "wire", "electric", "mcb", "fuse", "power", "switch", "short circuit", "light", "shock", "current"]):
        category = "Electrical"
    elif any(k in t_lower for k in ["ac", "air condition", "cooling", "compressor", "filter", "chilled", "blow warm"]):
        category = "AC Repair"
    elif any(k in t_lower for k in ["lock", "key", "deadbolt", "locked", "cylinder", "latch"]):
        category = "Locksmith"
    elif any(k in t_lower for k in ["wood", "door", "hinge", "chair", "table", "wardrobe", "carpenter", "cabinet", "shelf", "furniture"]):
        category = "Carpentry"
    elif any(k in t_lower for k in ["washing machine", "fridge", "refrigerator", "microwave", "oven", "ro water", "purifier", "appliance"]):
        category = "Appliance Repair"
    elif any(k in t_lower for k in ["paint", "wall", "seepage", "damp", "peeling"]):
        category = "Painting"
    elif any(k in t_lower for k in ["clean", "sanitize", "spill", "mud", "deep clean"]):
        category = "Cleaning"

    # 2. Urgency Detection
    urgency = "Routine"
    if any(k in t_lower for k in ["immediately", "emergency", "urgent", "burst", "spark", "fire", "shock", "flooding", "locked out", "asap", "fast", "danger", "smoke"]):
        urgency = "Emergency"
    elif any(k in t_lower for k in ["soon", "today", "leaking", "not working", "quick", "need someone"]):
        urgency = "Urgent"

    # 3. Location Detection
    location = location_hint or "BTM Layout"
    localities = ["BTM Layout", "BTM", "Jayanagar", "JP Nagar", "Banashankari", "Koramangala", "HSR Layout", "Indiranagar", "Electronic City", "Whitefield"]
    for loc in localities:
        if loc.lower() in t_lower:
            location = loc
            break

    # 4. Symptoms Extraction
    symptoms = []
    if "burst" in t_lower or "leak" in t_lower:
        symptoms.append("Active leakage / liquid emission")
    if "spark" in t_lower or "burn" in t_lower:
        symptoms.append("Electrical arcing or overheating")
    if "trip" in t_lower or "power" in t_lower:
        symptoms.append("Circuit interruption / power failure")
    if "not cooling" in t_lower or "warm" in t_lower:
        symptoms.append("Inadequate thermal cooling")
    if "lock" in t_lower or "key" in t_lower:
        symptoms.append("Access mechanism failure")
    if not symptoms:
        symptoms.append(f"Reported issue with {category.lower()} installation")

    # 5. Safety Concerns & Immediate Guidance
    safety_concerns = None
    immediate_guidance = None
    if category == "Electrical" or "spark" in t_lower or "shock" in t_lower or "smoke" in t_lower:
        safety_concerns = "High risk of electrical shock or localized ignition."
        immediate_guidance = "🚨 Please turn off the main circuit breaker / MCB immediately. Do not touch appliances or switchboards."
    elif category == "Plumbing" and urgency in ["Emergency", "Urgent"]:
        safety_concerns = "Floor flooding risk and potential water damage to flooring or adjacent rooms."
        immediate_guidance = "⚠️ Shut off the main water isolation stopcock or overhead tank supply valve."
    elif category == "Locksmith" and "outside" in t_lower:
        safety_concerns = "Customer stranded outside residence."
        immediate_guidance = "Stay in a secure, well-lit area while the emergency locksmith is dispatched."

    # 6. Clarification Question
    clarification_question = None
    missing_information = []
    if len(text.strip().split()) < 5:
        missing_information.append("Specific location or room details")
        clarification_question = f"Could you specify which room the {category.lower()} problem is located in, and if it is actively getting worse?"

    # 7. Technician Briefing
    technician_briefing = f"{urgency.upper()} {category.upper()}: {text[:100].strip()}. Location: {location}. Customer requests prompt dispatch."

    # 8. Indicative price
    price_map = {
        "Plumbing": "₹350 - ₹750",
        "Electrical": "₹400 - ₹850",
        "AC Repair": "₹499 - ₹1,200",
        "Locksmith": "₹400 - ₹850",
        "Carpentry": "₹350 - ₹800",
        "Appliance Repair": "₹399 - ₹900",
        "Painting": "₹500 - ₹1,500",
        "Cleaning": "₹450 - ₹1,200",
        "General Maintenance": "₹300 - ₹600"
    }

    return {
        "problem_description": text.strip(),
        "category": category,
        "symptoms": symptoms,
        "urgency": urgency,
        "safety_concerns": safety_concerns,
        "immediate_guidance": immediate_guidance,
        "customer_location": location,
        "preferred_time": "Immediate" if urgency == "Emergency" else "Within 2 hours",
        "estimated_complexity": "High" if urgency == "Emergency" else "Medium",
        "missing_information": missing_information,
        "clarification_question": clarification_question,
        "technician_briefing": technician_briefing,
        "indicative_price_range": price_map.get(category, "₹350 - ₹750"),
        "visual_description": None,
        "is_demo_fallback": True,
        "ai_confidence": 0.88
    }

def analyze_problem(text: str, language: str = "auto", location_hint: Optional[str] = None) -> Dict[str, Any]:
    """
    Main AI dispatcher: Uses Gemini API if configured with valid key,
    otherwise smoothly falls back to rich rule-based extractor.
    """
    if not text or not text.strip():
        return analyze_with_rule_engine("Pipe leaking water in BTM Layout", location_hint)

    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key or api_key.startswith("your_"):
        # Graceful fallback to deterministic rule engine
        return analyze_with_rule_engine(text, location_hint)

    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=api_key)

        prompt = f"""
You are HomeSOS AI, an intelligent emergency and on-demand home service dispatcher in Bengaluru, India.
Analyze the user's spoken or typed home maintenance request and output a STRICT JSON object.

User Request: "{text}"
User Language: "{language}"
Optional Location Hint: "{location_hint or 'Bengaluru'}"

Supported categories:
- Plumbing
- Electrical
- AC Repair
- Locksmith
- Carpentry
- Appliance Repair
- Painting
- Cleaning
- General Maintenance

Urgency levels:
- Emergency (active leaks, bursts, electrical sparks, gas smell, locked out of house, immediate safety danger)
- Urgent (needs fixing today, dysfunctional essentials like AC in heat, broken toilet flush)
- Routine (can be scheduled, cosmetic woodwork, non-critical touchup)

Return ONLY valid JSON matching this schema:
{{
  "problem_description": "Clean concise summary of what is broken",
  "category": "One of the supported categories above",
  "symptoms": ["Specific symptom 1", "Specific symptom 2"],
  "urgency": "Emergency" | "Urgent" | "Routine",
  "safety_concerns": "Any hazard or safety risk to inhabitants (or null if none)",
  "immediate_guidance": "Immediate protective steps customer should take right now before technician arrives (e.g. shut main valve, flip MCB off)",
  "customer_location": "Locality extracted from text or Bengaluru area (e.g. BTM Layout, Koramangala, Jayanagar, JP Nagar)",
  "preferred_time": "Customer's time preference or reasonable dispatch SLA",
  "estimated_complexity": "Low" | "Medium" | "High",
  "missing_information": ["Any crucial missing detail"],
  "clarification_question": "A polite follow-up question if vital detail is missing, else null",
  "technician_briefing": "Professional 1-2 sentence brief informing the technician of the exact issue, tools needed, and customer state",
  "indicative_price_range": "e.g. ₹350 - ₹750"
}}
"""
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.2
            )
        )

        raw_json = response.text
        parsed = json.loads(raw_json)
        parsed["is_demo_fallback"] = False
        parsed["ai_confidence"] = 0.99
        return parsed

    except Exception as e:
        print(f"[HomeSOS AI] Gemini API call exception: {e}. Falling back to Rule Engine.")
        result = analyze_with_rule_engine(text, location_hint)
        result["is_demo_fallback"] = True
        return result
