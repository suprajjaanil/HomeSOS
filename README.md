# HomeSOS 🚨
> **"Speak your problem. Get the right help."**  
> *A Voice-First AI Emergency & On-Demand Home-Service Dispatcher for Bengaluru, India.*  
> **Participating in Hackathon — ECHO Track** (Voice input leading to actionable outcome).

---

## 📌 1. PRODUCT VISION & DIFFERENTIATION

When household disasters strike—a sudden pipe burst flooding the bathroom, a sparking electrical switchboard, or an AC breakdown in peak summer—homeowners are stressed. Traditional home service apps force users to browse multi-tier service catalogs, guess the technical trade required, fill out lengthy booking forms, and repeatedly explain the situation.

**HomeSOS transforms this paradigm with a voice-first AI dispatcher:**
- **Problem-first, not catalog-first**: The user simply speaks their distress in plain language (English, Hindi, or Kannada).
- **Acoustic & Semantic AI Diagnosis**: Identifies the trade category, classifies urgency, detects hazards, provides immediate protective safety guidance, and generates a concise technical brief for the technician.
- **Smart Locality Matching**: Prioritizes nearby available professionals in Bengaluru (BTM Layout, Koramangala, Jayanagar, JP Nagar, Banashankari, Indiranagar, HSR) factoring in traffic-weighted arrival times and ratings.
- **Instant Request, Acceptance & Live Simulation**: Simulates the full technician lifecycle from dispatch to job completion with digital invoicing and permanent service memory.

---

## 🏗️ 2. COMPLETE PROJECT STRUCTURE

```text
Hackathon_project/
├── backend/
│   ├── app/
│   │   ├── __init__.py             # Backend package root
│   │   ├── main.py                 # FastAPI app, CORS, lifespan DB init & seeding
│   │   ├── database.py             # SQLite database engine & session manager
│   │   ├── models.py               # Database schemas & row-to-dict converters
│   │   ├── schemas.py              # Pydantic models for validation & requests
│   │   ├── ai_service.py           # Gemini 2.5 Flash + Rule-based fallback engine
│   │   ├── matching_service.py     # Bengaluru locality distance & traffic ETA engine
│   │   ├── seed_data.py            # 16 demo Bengaluru professionals & 3 past service records
│   │   └── routes/
│   │       ├── __init__.py         # Routes package
│   │       ├── ai.py               # POST /api/ai/analyze, POST /api/ai/upload-audio, GET /api/ai/scenarios
│   │       ├── professionals.py    # GET /api/professionals, GET /api/professionals/match
│   │       ├── requests.py         # POST /api/requests, PATCH /status, POST /simulate-step
│   │       └── history.py          # GET /api/history, GET /api/history/stats
│   ├── run.py                      # Standalone backend server launcher
│   ├── requirements.txt            # Python dependencies
│   ├── .env                        # Local environment variables (with GEMINI_API_KEY)
│   └── .env.example                # Sample environment template
│
├── frontend/
│   ├── public/                     # Static assets & icons
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx           # Navigation, locality selector, live health pill
│   │   │   ├── VoiceRecorder.tsx    # Feature 1: Animated mic, waveform meter, audio upload & text fallback
│   │   │   ├── DemoScenariosBar.tsx # 5 one-click hackathon judge demo situations
│   │   │   ├── AIAnalysisCard.tsx   # Feature 2: Problem synthesis, urgency pill, safety alert, brief
│   │   │   ├── MatchingSection.tsx  # Feature 3: Technician cards + Bengaluru radar locality visualizer
│   │   │   ├── TrackingView.tsx     # Feature 4: 7-stage timeline, technician hero card, call & simulation
│   │   │   └── DashboardView.tsx    # Feature 5: Customer profile, metrics, service memory & history drawer
│   │   ├── services/
│   │   │   └── api.ts              # API client wrapper for FastAPI backend
│   │   ├── types.ts                # TypeScript interfaces for all payloads & models
│   │   ├── App.tsx                 # Core reactive application orchestrator
│   │   ├── index.css               # Tailwind CSS directives & custom keyframes
│   │   └── main.tsx                # React DOM root entry
│   ├── index.html                  # HTML5 boilerplate & web fonts
│   ├── tailwind.config.js          # Design system colors (Deep Navy, Teal, Warm Coral, Off-white)
│   ├── postcss.config.js           # PostCSS configuration
│   ├── package.json                # Frontend dependencies (React 19, Lucide, Confetti)
│   └── tsconfig.app.json           # TypeScript configuration
│
├── test_direct.py                  # End-to-end integration test suite
├── start_all.bat                   # 1-Click launcher for Windows CMD
├── start_all.ps1                   # 1-Click launcher for PowerShell
├── start_backend.bat               # Backend-only launcher
├── start_frontend.bat              # Frontend-only launcher
├── .gitignore                      # Git ignore file (keys, DB, node_modules)
└── README.md                       # Comprehensive documentation
```

---

## 🚀 3. QUICK START GUIDE

### Prerequisites
- **Python**: 3.10+ (tested on Python 3.14)
- **Node.js**: v18+ (tested on Node.js v24)
- **npm** or **pnpm**

---

### Option A: One-Click Startup (Recommended for Windows)

Simply double-click:
```bat
start_all.bat
```
*(Or in PowerShell: `./start_all.ps1`)*

This starts the backend on port `8000` and the frontend on port `5173`.

---

### Option B: Manual Startup

#### Step 1: Start Backend
```bash
# Navigate to project root
cd Hackathon_project

# Run backend launcher
python backend/run.py
```
- Backend runs at: `http://localhost:8000`
- Interactive Swagger API docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/api/health`

#### Step 2: Start Frontend
```bash
# In a new terminal:
cd Hackathon_project/frontend

# Launch Vite dev server
npm run dev
```
- Frontend runs at: `http://localhost:5173`

---

## 🔑 4. WHERE TO CONFIGURE THE GEMINI API KEY

Open `backend/.env` in any text editor:

```ini
# Add your Google Gemini API Key below:
GEMINI_API_KEY=your_actual_gemini_api_key_here

PORT=8000
HOST=0.0.0.0
DATABASE_PATH=homesos.db
```

> **Zero-Friction Fallback**: If `GEMINI_API_KEY` is not provided or invalid, **HomeSOS automatically switches to its offline deterministic rule engine**. All 5 demo scenarios, keyword-based natural language parsing, safety alerts, technician briefings, and matching will work flawlessly without crashing!

---

## 🌟 5. CORE FEATURES IMPLEMENTATION

### Feature 1: Voice-First AI Problem Reporting
- **Large Pulsing Microphone**: Centered interactive recording button with expanding ripple rings.
- **Real-Time Soundwave Meter**: Live waveform indicators reflecting audio input.
- **Recording Timer & Controls**: Live duration counter with Stop & Analyze controls.
- **Audio File Upload**: Direct support for `.wav`, `.mp3`, `.m4a`, and `.webm` files.
- **Text Fallback**: Full keyboard input for quiet environments.
- **Multilingual Support**: Supports English, Hindi (हिंदी), and Kannada (ಕನ್ನಡ).
- **Clear Error Handling**: Graceful fallback if microphone access is denied.

### Feature 2: AI Problem Diagnosis & Urgency Detection
- **Structured JSON Extraction**: Powered by Gemini 2.5 Flash with fallback to domain-specific NLP rules.
- **Urgency Classification**:
  - `Emergency` (active leaks, electrical sparks, locked out, fire hazard).
  - `Urgent` (AC down in heat, dysfunctional toilet flush).
  - `Routine` (cosmetic woodwork, touchup painting).
- **Inhabitant Safety Guidance**: Explicit, actionable guidance (e.g., *"Shut main quarter-turn isolation valve"* or *"Flip main MCB switch OFF; do not touch metal appliances"*).
- **Concise Technician Brief**: Operational summary transmitted to the technician (tools needed, symptoms, customer address).
- **Interactive Clarification**: Automatically asks follow-up questions if vital details are missing.

### Feature 3: Smart Nearby Professional Matching
- **Bengaluru Locality Proximity**: Accurate distance calculations using GPS coordinates for BTM Layout, Koramangala, Jayanagar, JP Nagar, Banashankari, HSR Layout, and Indiranagar.
- **Traffic-Weighted Arrival Times**: Multiplies distance by average Bengaluru road speeds (~3.5 mins/km) + technician response buffer.
- **16 Realistic Demo Professionals**: ITI-certified master plumbers, grade-A wiremen, HVAC technicians, locksmiths, and carpenters with real avatars, skills, ratings, and phone numbers.
- **Bengaluru Locality Radar**: Visual map display showing the customer pin and nearby technicians with real-time distance rings.

### Feature 4: Instant Request, Acceptance & Tracking
- **7-Stage Workflow**:
  `REQUESTED` → `SEARCHING` → `ACCEPTED` → `ON_THE_WAY` → `ARRIVED` → `IN_PROGRESS` → `COMPLETED`
- **Assigned Technician Card**: Photo, verified badge, rating, direct phone simulation, and tools carried.
- **Hackathon Demo Accelerator**: "Advance Next Stage" button lets judges experience the complete request lifecycle in seconds.
- **Celebration Confetti & Receipt**: Fires confetti when completed and displays a finalized service receipt.
- **Cancellation**: Customers can safely cancel requests before arrival.

### Feature 5: Service Memory & Transparent Estimates
- **Persistent Database**: All requests and status updates are saved to SQLite (`homesos.db`).
- **Customer Dashboard**: Displays key metrics (Total Requests, Completed, Emergency Dispatches, Saved Technicians, Total Spent).
- **Service History Drawer**: Detailed audit trail of past jobs, parts replaced, technician notes, and settlement receipts.
- **Indicative Price Estimates**: Clear price ranges (e.g., `₹350 - ₹750`) explicitly labeled as indicative and subject to technician on-site inspection.

---

## ⚖️ 6. THE 5 PRE-CONFIGURED JUDGE DEMO SCENARIOS

| # | Situation | Locality | Trade | Urgency | Key Safety Action |
|---|-----------|----------|-------|---------|-------------------|
| 1 | **Burst Bathroom Pipe & Spreading Water** | BTM Layout | Plumbing | 🚨 Emergency | Shut main water stopcock; avoid electrical contact |
| 2 | **Sparking Switchboard & Burning Smell** | Koramangala | Electrical | 🚨 Emergency | Flip main MCB OFF immediately; do not touch switch |
| 3 | **Split AC Not Cooling in Peak Heat** | Jayanagar | AC Repair | ⚠️ Urgent | Switch off AC MCB to prevent compressor burnout |
| 4 | **Key Snapped in Main Door Deadbolt** | JP Nagar | Locksmith | 🚨 Emergency | Do not insert pins; wait for spiral key extractor |
| 5 | **Broken Heavy Wardrobe Sliding Door** | Banashankari | Carpentry | ℹ️ Routine | Rest sliding panel flat against wall to avoid tipping |

---

## 🎤 7. HACKATHON DEMO SCRIPT (FOR JUDGES)

**Time required: 2 minutes**

1. **Opening (15 seconds)**:
   > *"Good morning judges! We are presenting **HomeSOS** for the ECHO Track. Tagline: 'Speak your problem. Get the right help.' When a pipe bursts or a switch sparks, nobody wants to browse a catalog of 200 services. You just want to speak your problem and have the right help dispatched."*

2. **Demonstrating Voice Reporting (30 seconds)**:
   > *"Watch this: I click the microphone button or select Scenario 1: 'My bathroom pipe has suddenly burst. Water is spreading across the floor. I need a plumber immediately. I'm in BTM Layout.' We hit submit."*

3. **AI Understanding & Safety (30 seconds)**:
   > *"Instantly, HomeSOS AI detects that this is **Plumbing**, urgency is **Emergency**, and highlights immediate safety instructions: 'Turn off the main water isolation stopcock immediately.' It also crafts a technical brief for the plumber: 'Emergency bathroom pipe burst with active water flooding in BTM Layout; bring 1/2-inch CPVC fittings and high-pressure pipe clamp.' No manual form filling!"*

4. **Matching & Live Simulation (30 seconds)**:
   > *"Next, our proximity engine searches South Bengaluru and finds Ramesh Kumar in BTM Layout, just 0.12 km away with an estimated 12-minute arrival. We click 'Request This Technician'. The request is created in our backend. Notice the live 7-stage tracker. Using our Hackathon Simulator, we advance: Accepted → On The Way → Arrived → In Progress → Completed! Confetti fires and the final bill is settled."*

5. **Customer Memory & Dashboard (15 seconds)**:
   > *"Finally, we jump to 'My Activity'. The entire repair, timeline, technician phone, and cost are stored in the customer's permanent Service Memory. HomeSOS: Voice in, help dispatched."*

---

## 🔒 8. LIMITATIONS & TRANSPARENT DISCLOSURES

- **Demo Network**: Service professionals are realistic seeded profiles based in South Bengaluru to guarantee zero external dependency during evaluation.
- **Estimated Arrival Times**: ETAs factor in real distance calculations and typical Bengaluru road traffic multipliers (~3.5 mins/km), but live GPS tracking of workers is simulated.
- **Pricing**: All price ranges are indicative estimates and subject to physical technician diagnostic inspection.
- **Audio Processing**: If browser microphone permissions are blocked, a real-time text input fallback and audio file uploader are available.
