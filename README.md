# HomeSOS 🚨
> **"Speak your problem. Get the right help."**  
> *A Voice-First AI Emergency & On-Demand Home-Service Dispatcher for Bengaluru, India.*  
> **Participating in Hackathon — ECHO Track** (Voice input leading to actionable outcome).  
> **Version: 2.0 (Enhanced Voice, Photo Diagnostics, Customer Auth & 9-Stage Tracking)**

---

## 📌 1. PRODUCT VISION & DIFFERENTIATION

When household disasters strike—a sudden pipe burst flooding the bathroom, a sparking electrical switchboard, or an AC breakdown in peak summer—homeowners are stressed. Traditional home service apps force users to browse multi-tier service catalogs, guess the technical trade required, fill out lengthy booking forms, and repeatedly explain the situation.

**HomeSOS transforms this paradigm with a voice-first AI dispatcher:**
- **Problem-first, not catalog-first**: The user simply speaks their distress in plain language (English, Hindi, or Kannada).
- **Acoustic & Semantic AI Diagnosis**: Identifies the trade category, classifies urgency, detects hazards, provides immediate protective safety guidance, and generates a concise technical brief for the technician.
- **Photo Upload & Cautious Visual Observation**: Capture damage via camera or file picker; HomeSOS attaches previews to the dispatch and produces a cautious initial visual description (explicitly noting that the on-site technician will perform the definitive physical inspection).
- **Customer Account & Service Memory**: Secure authentication (PBKDF2-HMAC-SHA256 password hashing), customizable profile, and dedicated "My Activity" tracking linked to each customer.
- **Smart Locality Matching**: Prioritizes nearby available professionals in Bengaluru (BTM Layout, Koramangala, Jayanagar, JP Nagar, Banashankari, Indiranagar, HSR) factoring in traffic-weighted arrival times and ratings.
- **9-Stage Persistent Lifecycle**: Simulates the full technician lifecycle from request creation to completion with digital invoicing and permanent service memory.

---

## 🏗️ 2. COMPLETE PROJECT STRUCTURE

```text
Hackathon_project/
├── backend/
│   ├── app/
│   │   ├── __init__.py             # Backend package root
│   │   ├── main.py                 # FastAPI app, static uploads mount, lifespan DB init & seeding
│   │   ├── database.py             # SQLite database engine, schema migration & session manager
│   │   ├── auth_util.py            # PBKDF2-HMAC-SHA256 password hashing & token signer
│   │   ├── models.py               # Database schemas & row-to-dict converters
│   │   ├── schemas.py              # Pydantic models for validation, auth, and requests
│   │   ├── ai_service.py           # Gemini 2.5 Flash + Rule-based fallback engine
│   │   ├── matching_service.py     # Bengaluru locality distance & traffic ETA engine
│   │   ├── seed_data.py            # 16 demo Bengaluru professionals & seed customer records
│   │   └── routes/
│   │       ├── __init__.py         # Routes package
│   │       ├── auth.py             # POST /api/auth/register, /login, GET /me, PUT /profile
│   │       ├── uploads.py          # POST /api/uploads/image (photo storage & visual note)
│   │       ├── ai.py               # POST /api/ai/analyze, POST /api/ai/upload-audio, GET /api/ai/scenarios
│   │       ├── professionals.py    # GET /api/professionals, GET /api/professionals/match
│   │       ├── requests.py         # POST /api/requests, PATCH /status, POST /simulate-step
│   │       └── history.py          # GET /api/history, GET /api/history/stats (customer-filtered)
│   ├── uploads/                    # Persisted customer damage photos
│   ├── run.py                      # Standalone backend server launcher
│   ├── requirements.txt            # Python dependencies
│   ├── .env                        # Local environment variables (with GEMINI_API_KEY)
│   └── .env.example                # Sample environment template
│
├── frontend/
│   ├── public/                     # Static assets & icons
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx           # Navigation, user avatar pill, Bengaluru locality selector
│   │   │   ├── VoiceRecorder.tsx    # Feature 1: Speech recognition (EN/HI/KN), audio meter & PhotoUpload
│   │   │   ├── PhotoUpload.tsx      # Feature 2: Camera capture, file upload, previews & visual observation
│   │   │   ├── AuthModal.tsx        # Feature 5: Login, registration, profile editing & 1-click demo login
│   │   │   ├── DemoScenariosBar.tsx # 5 one-click hackathon judge demo situations
│   │   │   ├── AIAnalysisCard.tsx   # Feature 2: Problem synthesis, urgency, safety alert, brief, photo previews
│   │   │   ├── MatchingSection.tsx  # Feature 3: Technician cards + Bengaluru radar locality visualizer
│   │   │   ├── TrackingView.tsx     # Feature 4: 9-stage timeline, technician hero card, photos & simulator
│   │   │   └── DashboardView.tsx    # Feature 5: Customer profile, metrics, filtered history & modal details
│   │   ├── services/
│   │   │   └── api.ts              # API client wrapper with JWT token & image upload support
│   │   ├── types.ts                # TypeScript interfaces for all payloads & models
│   │   ├── App.tsx                 # Core reactive application orchestrator
│   │   ├── index.css               # Tailwind CSS directives & custom keyframes
│   │   └── main.tsx                # React DOM root entry
│   ├── index.html                  # HTML5 boilerplate & web fonts
│   ├── tailwind.config.js          # Design system colors (Deep Navy, Teal, Warm Coral, Off-white)
│   ├── postcss.config.js           # PostCSS configuration
│   ├── package.json                # Frontend dependencies (React 19, Lucide, Confetti)
│   ├── tsconfig.app.json           # TypeScript configuration
│   └── vite.config.ts              # Vite config with API reverse proxy to port 8000
│
├── test_direct.py                  # End-to-end integration test suite (9 test suites)
├── start_all.bat                   # 1-Click launcher for Windows CMD / File Explorer
├── start_all.ps1                   # 1-Click launcher for PowerShell
├── start_backend.bat               # Backend-only launcher
├── start_frontend.bat              # Frontend-only launcher
├── .gitignore                      # Git ignore file (keys, DB, node_modules)
└── README.md                       # Comprehensive documentation
```

---

## 💻 How to Run HomeSOS Locally

Follow these step-by-step instructions to run HomeSOS locally on your computer.

### Prerequisites
Before running the project, make sure the following tools are installed on your machine:
- **Python**: Version 3.10 or higher (tested on Python 3.14)
- **Node.js**: Version 18 or higher (tested on Node.js v24)
- **npm**: Version 9 or higher (bundled automatically with Node.js)
- **Git**: For version control and branch navigation

---

### Step 1: Open the Project Folder in a Terminal
1. Open **Windows PowerShell** or **Command Prompt** (cmd.exe).
2. Navigate to the project root directory where HomeSOS is located:
   ```powershell
   cd C:\Users\JV\Hackathon_project
   ```
   *(Or the directory path where you have cloned/extracted the project repository).*

---

### Step 2: Run the Application Using `start_all.ps1`
We provide an automated startup script `start_all.ps1` located directly in the project root. This script launches both the backend server and frontend development server in dedicated terminal processes:

```powershell
.\start_all.ps1
```

#### If PowerShell Blocks the Script (Execution Policy Restriction)
On Windows, PowerShell may block executing `.ps1` script files by default, displaying an error message such as:
> *File C:\Users\...\start_all.ps1 cannot be loaded because running scripts is disabled on this system.*

To temporarily bypass this restriction for your current terminal process only (without modifying permanent system-wide settings), run:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

Once that command finishes, run the startup script again:
```powershell
.\start_all.ps1
```

> **Alternative via File Explorer or Command Prompt**:
> You can also double-click `start_all.bat` directly in Windows File Explorer, or execute `start_all.bat` from Command Prompt.

---

### Step 3: Open HomeSOS in Your Browser
Once the startup script runs, open your browser (Google Chrome, Microsoft Edge, Firefox, or Brave) and navigate to:

👉 **`http://localhost:5173`**

*(Port `5173` is the frontend port configured in `frontend/vite.config.ts`, which automatically reverse-proxies all `/api` network requests to the backend server running on port `8000`).*

> **⚠️ Important Notice About `localhost`:**
> `http://localhost:5173` is a local loopback network address that refers specifically to the local computer running the application. **It only works on the computer running the application and is not a publicly accessible link.** It cannot be visited over the public internet by other people or remote devices unless an external tunnel (such as ngrok or cloudflare tunnel) is explicitly configured.

---

### Manual Multi-Terminal Startup (Optional)
If you prefer to start each service individually in separate terminal windows:

1. **Terminal 1 — Backend (FastAPI on Port `8000`)**:
   ```cmd
   cd C:\Users\JV\Hackathon_project
   python backend\run.py
   ```
   - Health check: `http://localhost:8000/api/health`
   - Interactive Swagger API docs: `http://localhost:8000/docs`

2. **Terminal 2 — Frontend (React + Vite on Port `5173`)**:
   ```cmd
   cd C:\Users\JV\Hackathon_project\frontend
   npm run dev
   ```
   - Application URL: `http://localhost:5173`

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

## 🌟 5. CORE FEATURES IMPLEMENTATION (VERSION 2)

### Feature 1: Voice-First AI Problem Reporting
- **Live Web Speech Transcription**: Real-time speech-to-text recognition in English (`en-IN`), Hindi (`hi-IN`), and Kannada (`kn-IN`).
- **MediaRecorder Audio Capture**: In-browser microphone audio recording with dynamic soundwave meter.
- **Recording Timer & Visual Ripple**: Concentric expanding rings and live duration counter with Stop & Analyze controls.
- **Audio File Upload & Fallback**: Support for `.wav`, `.mp3`, `.m4a`, and `.webm` files, plus direct text prompt input.
- **Editable AI Review**: Customer can inspect and edit the recognized problem description, locality, or category prior to dispatch.

### Feature 2: Photo Upload & Multimodal Visual Observation
- **Camera Capture & File Picker**: Directly capture photos from a mobile/laptop camera (`capture="environment"`) or select from gallery.
- **Thumbnail Gallery & Retake/Remove**: View uploaded photos, replace, or remove with single-click actions.
- **Cautious AI Visual Description**: Generates preliminary visual observations (e.g., active water pooling, scorched switch plate, dislodged roller track) using Gemini multimodal or heuristic rules.
- **Explicit Physical Diagnostic Disclaimer**: The interface explicitly highlights that visual notes are preliminary observations and the technician will conduct the definitive on-site physical inspection.
- **Persistent Storage**: Uploaded damage photos are saved in `backend/uploads/` and linked permanently to the booking.

### Feature 3: Smart Nearby Professional Matching & Bengaluru Radar
- **Locality Proximity Calculation**: Accurate geospatial distance calculations centered on South Bengaluru localities (BTM Layout, Koramangala, Jayanagar, JP Nagar, Banashankari, HSR Layout, Indiranagar).
- **Traffic-Weighted Arrival Times**: Factors in realistic peak Bengaluru traffic multipliers (~3.5 mins/km) + technician dispatch readiness.
- **16 Realistic Demo Professionals**: Seeded master plumbers, electricians, AC technicians, locksmiths, and carpenters with ratings, completed jobs, and verified badges.
- **Bengaluru Proximity Radar**: Visual radar showing customer coordinates and relative technician pins.
- **Clear Demo Disclaimers**: Explicit notices indicating that technician profiles and radar coordinates represent realistic prototype seed data without live GPS telematics.

### Feature 4: 9-Stage Persistent Request Lifecycle
- **Canonical 9-Stage Pipeline**:
  `REQUEST_CREATED` → `AI_ANALYSED` → `MATCHED` → `ASSIGNED` → `ACCEPTED` → `ON_THE_WAY` → `ARRIVED` → `IN_PROGRESS` → `COMPLETED` (+ `CANCELLED`).
- **Real-Time Audit Trail**: Chronological event timeline recording exact timestamps and stage changes in SQLite.
- **Assigned Specialist Hero Card**: Specialist photo, rating, verified badge, tools carried, and simulated phone call modal.
- **Hackathon Demo Accelerator**: One-click "Advance Next Stage" button for rapid evaluation of all lifecycle phases.
- **Celebration Confetti & Invoice**: Interactive celebration and digital invoice settlement on completion.

### Feature 5: Customer Account & "My Activity" Dashboard
- **Secure Authentication**: Customer registration, login, and session token authentication using PBKDF2-HMAC-SHA256 password hashing.
- **Customer Profile**: Customizable name, phone, email, and Bengaluru residential address.
- **1-Click Demo Login**: Pre-configured demo login as *Priya Sharma* (`priya@example.com` / `password123`) with existing service history.
- **Filtered History View**: Toggle between *All Requests*, *Active / In Progress*, and *Completed*.
- **Permanent Service Memory**: Full audit trail of past household repairs, attached damage photos, technician briefs, and final paid receipts.

### Feature 6: Polished Emergency-Responsive UI/UX
- **Design System**: Warm off-white canvas (`#F7F9FC`), deep navy text and surfaces (`#14233B`), emerald/teal trust accents, and restrained emergency coral/red alerts.
- **Responsive & Accessible**: Optimized for mobile and desktop screens with seamless transitions and accessible touch targets.

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

---

## 🌿 9. VERSION HISTORY & GITHUB TRACKING

HomeSOS is managed with Git version control. Version 1 (V1) and later versions can be viewed and explored through the repository's commit history, release tags, and branches:

- **Viewing Commit History**:
  To view the full chronological timeline of commits from the initial working baseline to current iterations, run:
  ```bash
  git log --oneline --graph --decorate
  ```

- **Exploring Version 1 (Initial Working Baseline)**:
  Version 1 represents the initial working version of the HomeSOS voice-first dispatcher. You can inspect or checkout Version 1 directly via commit hash `37eb5f9`:
  ```bash
  git checkout 37eb5f9
  ```

- **Switching Between Branches**:
  Different development tracks, upgrades (such as live Gemini AI integration), and milestones are organized into dedicated branches (e.g., `main`, `upgrade-ai-live`). You can list and switch between branches anytime:
  ```bash
  # List all local and remote branches
  git branch -a

  # Switch to a specific branch
  git checkout <branch-name>
  ```

- **GitHub Web Interface**:
  If this repository is hosted on GitHub, you can navigate across Version 1 and subsequent versions using the **Commits**, **Tags**, and **Branches** dropdowns in the GitHub web interface.
