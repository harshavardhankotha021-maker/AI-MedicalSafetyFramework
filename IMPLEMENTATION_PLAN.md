# JeevanRaksha — Hackathon Implementation Plan
> Plan-only document. No code modified. Reviewed before any implementation begins.

---

## 1. Target Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        JEEVANRAKSHA SYSTEM                               │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                        REACT FRONTEND (Vite)                      │   │
│  │                                                                    │   │
│  │  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────────┐ │   │
│  │  │ Patient App │  │ Emergency    │  │ Doctor / Hospital App    │ │   │
│  │  │             │  │ (Public,     │  │                          │ │   │
│  │  │ • Register  │  │  no login)   │  │ • Dashboard              │ │   │
│  │  │ • Profile   │  │             │  │ • Patient search          │ │   │
│  │  │ • Health    │  │ • Blood type │  │ • Safety analysis        │ │   │
│  │  │   Card      │  │ • Allergies  │  │ • Drug interactions      │ │   │
│  │  │ • QR view   │  │ • Conditions │  │ • Allergy alerts         │ │   │
│  │  │ • Access    │  │ • Meds       │  │ • Lab reports            │ │   │
│  │  │   history   │  │ • Emergency  │  │ • AI summary             │ │   │
│  │  │             │  │   contact    │  │                          │ │   │
│  │  └─────────────┘  └──────────────┘  └──────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                              │ HTTP (Vite proxy / HTTPS)                 │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                      FASTAPI BACKEND                              │   │
│  │                                                                    │   │
│  │  ┌───────────────┐  ┌─────────────────┐  ┌────────────────────┐ │   │
│  │  │  Auth Router  │  │  Patient Router │  │  Doctor Router     │ │   │
│  │  │  /auth/*      │  │  /patient/*     │  │  /doctor/*         │ │   │
│  │  │               │  │                 │  │                    │ │   │
│  │  │ • register    │  │ • profile       │  │ • dashboard        │ │   │
│  │  │ • login       │  │ • health-card   │  │ • search patient   │ │   │
│  │  │ • logout      │  │ • qr/generate   │  │ • analyse/:id      │ │   │
│  │  │ • me          │  │ • qr/regenerate │  │ • patient/:id      │ │   │
│  │  │               │  │ • access-log    │  │                    │ │   │
│  │  └───────────────┘  └─────────────────┘  └────────────────────┘ │   │
│  │                                                                    │   │
│  │  ┌───────────────┐  ┌─────────────────┐  ┌────────────────────┐ │   │
│  │  │ Emergency     │  │  Safety Engine  │  │  AI Router         │ │   │
│  │  │ Router        │  │  (EXISTING)     │  │  /ai/*             │ │   │
│  │  │ /emergency/*  │  │                 │  │                    │ │   │
│  │  │               │  │ • NER           │  │ • summarise        │ │   │
│  │  │ • scan/:token │  │ • drug-drug     │  │ • emergency-brief  │ │   │
│  │  │   (public,    │  │ • disease-drug  │  │ • extract-doc      │ │   │
│  │  │    rate-ltd)  │  │ • allergy check │  │                    │ │   │
│  │  │               │  │ • risk score    │  │                    │ │   │
│  │  └───────────────┘  └─────────────────┘  └────────────────────┘ │   │
│  │                                                                    │   │
│  │  ┌──────────────────────────────────────────────────────────────┐ │   │
│  │  │                   MIDDLEWARE LAYER                            │ │   │
│  │  │  JWT Auth  │  Role Guard  │  Rate Limiter  │  Audit Logger   │ │   │
│  │  └──────────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                              │                                            │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                        DATA LAYER                                  │   │
│  │                                                                    │   │
│  │  ┌──────────────────────────┐   ┌────────────────────────────┐   │   │
│  │  │   SQLite (single file)   │   │   CSV Knowledge Bases      │   │   │
│  │  │                          │   │   (read-only at startup)   │   │   │
│  │  │  All user/patient data   │   │                            │   │   │
│  │  │  Prescriptions           │   │  drug_interactions.csv     │   │   │
│  │  │  Conditions / Allergies  │   │  disease_contra.csv        │   │   │
│  │  │  Lab reports             │   │  (deduplicated)            │   │   │
│  │  │  QR tokens               │   │                            │   │   │
│  │  │  Access logs             │   │                            │   │   │
│  │  └──────────────────────────┘   └────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

### Key architectural decisions

| Decision | Choice | Reason |
|---|---|---|
| Database | SQLite (via SQLModel) | Zero infra, single file, works offline, easy migration from CSV, realistic for hackathon |
| Auth | JWT Bearer tokens (python-jose) | Stateless, no Redis needed, industry standard |
| QR tokens | UUID4 stored in DB, not encoded data | Tokens are opaque; server resolves what is permitted |
| AI calls | HuggingFace Inference API (free tier) | No GPU needed, no model download for AI-summary features |
| NER model | Keep existing local `d4data` load | Already working; pre-warm at startup |
| Frontend routing | React Router v7 | Replace manual `useState<Page>` pattern; needed for QR scan deep links |
| Frontend state | React Context (lightweight) | Sufficient for auth state; no Redux overhead |

---

## 2. Target Data Model

### Entity Relationship Diagram

```
User ─────────────── Patient (1:1 optional)
 │                      │
 │ (role: doctor)       ├── Allergy (1:many)
 │                      ├── Condition (1:many)
 │                      ├── Prescription (1:many)
 │                      ├── LabReport (1:many)
 │                      ├── EmergencyContact (1:many, ordered)
 │                      ├── HealthCard (1:1)
 │                      └── QRToken (1:many, one active)
 │
 ├── Hospital (many:1)
 │
AccessLog ──────────── Patient (many:1)
AccessLog ──────────── User (many:1, nullable — emergency access has no user)

Knowledge Bases (read-only, loaded from CSV):
DrugInteraction (static)
DiseaseContraindication (static)
```

### Entity Definitions

#### User
```
id              UUID  PK
email           str   unique, indexed
hashed_password str
role            enum  PATIENT | DOCTOR | ADMIN
full_name       str
hospital_id     UUID  FK → Hospital (nullable, for doctors/admins)
is_active       bool  default True
created_at      datetime
```

#### Patient
```
id              UUID  PK
user_id         UUID  FK → User (nullable — patient can exist before account)
abha_id         str   unique, indexed (e.g. "ABHA001"; user-editable)
name            str
age             int
gender          enum  MALE | FEMALE | OTHER
blood_group     str   (A+, O-, etc.)
phone           str   (stored, NOT sent to frontend except to owner)
photo_url       str   nullable
created_at      datetime
updated_at      datetime
```

#### Allergy
```
id              UUID  PK
patient_id      UUID  FK → Patient
allergy_type    str   (Drug, Food, Environmental)
substance       str
severity        enum  MILD | MODERATE | SEVERE | LIFE_THREATENING
first_detected  date  nullable
notes           str   nullable
```

#### Condition
```
id              UUID  PK
patient_id      UUID  FK → Patient
condition       str
chronic         bool
diagnosed_since str   (year or date string)
status          enum  ONGOING | RESOLVED | MANAGED
```

#### Prescription
```
id              UUID  PK
patient_id      UUID  FK → Patient
drug            str
dose            str
frequency       str
start_date      date
end_date        date  nullable
status          enum  ACTIVE | COMPLETED | TEMPORARY | DISCONTINUED
prescribed_by   str   nullable (doctor name, free text for now)
```

#### LabReport
```
id              UUID  PK
patient_id      UUID  FK → Patient
test_name       str
value           str
unit            str
status          enum  NORMAL | HIGH | LOW | CRITICAL | PENDING
test_date       date
report_date     date  nullable
notes           str   nullable
```

#### EmergencyContact
```
id              UUID  PK
patient_id      UUID  FK → Patient
name            str
relationship    str   (Spouse, Parent, etc.)
phone           str
priority        int   (1 = primary)
```

#### HealthCard
```
id              UUID  PK
patient_id      UUID  FK → Patient (1:1)
card_number     str   unique, human-readable (e.g. "JR-2026-00001")
issued_at       datetime
is_active       bool
```

#### QRToken
```
id              UUID  PK
patient_id      UUID  FK → Patient
token           str   UUID4, unique, indexed
issued_at       datetime
expires_at      datetime  nullable (can be long-lived for hackathon)
revoked         bool  default False
last_scanned_at datetime  nullable
scan_count      int   default 0
```

#### AccessLog
```
id              UUID  PK
patient_id      UUID  FK → Patient
accessed_by     UUID  FK → User  nullable (NULL = emergency/anonymous scan)
access_type     enum  EMERGENCY_QR | DOCTOR_VIEW | OWNER_VIEW | ADMIN_VIEW
token_used      str   nullable (QR token if emergency)
ip_address      str   nullable
accessed_at     datetime
```

#### Hospital
```
id              UUID  PK
name            str
city            str
registration_no str   nullable
```

#### Knowledge Base (read-only at startup, NOT stored in SQLite)
```
DrugInteraction:          interaction_id, drug1, drug2, risk, severity, reference
DiseaseContraindication:  contra_id, condition, drug, warning, severity, reference
```

---

## 3. Feature Roadmap

### MUST HAVE (hackathon demo cannot work without these)

| # | Feature | Why |
|---|---|---|
| M1 | Patient registration + login (JWT) | Everything else requires knowing who you are |
| M2 | Patient medical profile (view + edit) | Core data layer |
| M3 | Add/edit allergies, conditions, prescriptions | System is currently read-only |
| M4 | Digital Health Card page | The deliverable "product" for patients |
| M5 | QR token generation | Core hackathon demo moment |
| M6 | Emergency scan page `/emergency/:token` | The "wow" moment — scan QR, see critical info |
| M7 | Doctor login + search patient | Enables doctor workflow |
| M8 | Doctor runs safety analysis (existing engine) | Already works; needs auth guard + routing |
| M9 | Knowledge base deduplication | Fix junk rows before any demo |
| M10 | SQLite migration (replace CSV patient data) | Required for write operations |
| M11 | Pre-warm NER model at startup | First analysis must not take 60 seconds |
| M12 | Remove open `/patients` and `/analyse` endpoints | Critical security fix |

### SHOULD HAVE (makes the demo significantly stronger)

| # | Feature | Why |
|---|---|---|
| S1 | AI Medical History Summarizer | Strong demo moment; differentiates from basic CRUD |
| S2 | Doctor dashboard with patient list + alert counts | Makes the doctor workflow feel real |
| S3 | Access log for patients (who scanned my QR) | Privacy/trust feature, easy to implement |
| S4 | Emergency contact management | Shown on emergency page; important for realism |
| S5 | QR revocation (regenerate token) | Security feature patients expect |
| S6 | Lab reports abnormal flag in doctor view | Already partially implemented |
| S7 | Print/export health card as PDF | Judges love printable output |
| S8 | NER toggle in doctor analysis (keep existing) | Already works; keep it |

### NICE TO HAVE (only if time allows)

| # | Feature | Why |
|---|---|---|
| N1 | Medical document upload + AI extraction | Impressive but hard to get right |
| N2 | AI Emergency Summary | Concise brief from verified data only |
| N3 | Admin panel | Low priority for demo |
| N4 | QR token expiry / rate limiting | Good security practice |
| N5 | Dark/light mode toggle | Visual polish |
| N6 | Multi-language emergency page (Hindi/English) | Relevant for India context |
| N7 | Photo upload for patient | Makes health card visually complete |

---

## 4. Existing Code Reuse Decisions

| Component | Decision | Action |
|---|---|---|
| `backend/main.py` — safety engine logic (`analyse_patient`, rule checks, NER, risk scoring) | **KEEP + MOVE** | Extract into `backend/services/safety_engine.py`; wire auth guard on the route |
| `backend/main.py` — open `/patients` endpoint | **REMOVE** | Replaced by auth-protected `/doctor/patients` |
| `backend/main.py` — open `/analyse/{abha_id}` endpoint | **MODIFY** | Move to `/doctor/analyse/{patient_id}` with JWT + doctor-role guard |
| `backend/main.py` — open `/health` endpoint | **KEEP** | Harmless health probe |
| `backend/main.py` — CSV loading pattern for knowledge bases | **KEEP** | Knowledge bases stay as CSVs (read-only); patient data moves to SQLite |
| `backend/main.py` — NER lazy-load pattern | **MODIFY** | Move to startup event to pre-warm at boot |
| `frontend/src/index.css` — dark design system | **KEEP** | Solid; only add new CSS tokens for new views |
| `frontend/src/App.tsx` — manual page state | **REPLACE** | React Router v7 needed for `/emergency/:token` deep link |
| `frontend/src/api/client.ts` — typed fetch client | **MODIFY** | Add auth header injection, new endpoint methods |
| `frontend/src/components/RiskMeter.tsx` | **KEEP** | Works perfectly |
| `frontend/src/components/AlertCard.tsx` | **KEEP** | Works perfectly |
| `frontend/src/components/PatientSelector.tsx` | **KEEP + MODIFY** | Keep UI; update to call auth-protected endpoint |
| `frontend/src/pages/AnalysePage.tsx` | **KEEP + MODIFY** | Move into doctor section; add auth guard wrapper |
| `frontend/src/pages/DashboardPage.tsx` | **REPLACE** | Static hardcoded content; replace with real doctor dashboard |
| `patients.csv` | **MIGRATE → SQLite** | Seed into DB; CSV becomes backup |
| `allergies.csv` | **MIGRATE → SQLite** | Same |
| `conditions.csv` | **MIGRATE → SQLite** | Same |
| `prescriptions.csv` | **MIGRATE → SQLite** | Same |
| `lab_reports.csv` | **MIGRATE → SQLite** | Same |
| `drug_interactions.csv` | **DEDUPLICATE + KEEP** | Remove rows DI021–DI050 (all `Aspirin+Heparin` duplicates); keep as CSV |
| `disease_contra.csv` | **DEDUPLICATE + KEEP** | Remove rows DC012–DC050 (all `Hypertension+Decongestants` duplicates); keep as CSV |

---

## 5. Implementation Order

Build in this exact sequence. Each phase produces something testable before moving to the next.

### Phase A — Foundation (do first, everything depends on this)
```
A1. Deduplicate knowledge base CSVs (drug_interactions, disease_contra)
A2. Install SQLModel + python-jose + passlib into backend
A3. Design SQLite schema (SQLModel models matching data model above)
A4. Write DB initialization + seed script from existing CSVs
A5. Add React Router v7 to frontend
A6. Create auth context + protected route wrapper in frontend
```

### Phase B — Authentication
```
B1. POST /auth/register  (patient self-register)
B2. POST /auth/login     (returns JWT)
B3. GET  /auth/me        (returns current user)
B4. Add JWT middleware to FastAPI
B5. Build Login page + Register page in frontend
B6. Build auth-protected layout wrapper
```

### Phase C — Patient Profile (builds on B)
```
C1. GET/PUT /patient/profile
C2. GET/POST/DELETE /patient/allergies
C3. GET/POST/DELETE /patient/conditions
C4. GET/POST/DELETE /patient/prescriptions
C5. GET/POST/DELETE /patient/lab-reports
C6. GET/POST/DELETE /patient/emergency-contacts
C7. Build patient profile pages in frontend
```

### Phase D — Health Card + QR (builds on C)
```
D1. GET /patient/health-card  (returns card data)
D2. POST /patient/qr/generate
D3. POST /patient/qr/revoke
D4. Build Digital Health Card page with QR display
D5. GET /emergency/:token  (PUBLIC, rate-limited)
D6. Build Emergency Access page
```

### Phase E — Doctor Workflow (builds on B)
```
E1. Add doctor role + doctor registration (seeded via script for demo)
E2. GET /doctor/patients  (search, with pagination)
E3. GET /doctor/patient/:id  (full medical profile)
E4. POST /doctor/patient/:id/analyse  (wraps existing safety engine)
E5. Build Doctor Dashboard page
E6. Integrate existing AnalysePage into doctor workflow
```

### Phase F — Safety Engine Integration (builds on E)
```
F1. Extract analyse_patient() into services/safety_engine.py
F2. Pre-warm NER at startup (FastAPI lifespan event)
F3. Add AccessLog write on every /emergency and /doctor view
F4. Wire allergy cross-check into analysis response
F5. Add "VERIFIED DATA" vs "AI-GENERATED" label structure to API responses
```

### Phase G — AI Features (builds on F, do last)
```
G1. Medical history summariser (HuggingFace Inference API, free tier)
G2. Emergency summary from verified data only
G3. Wire into doctor analysis response + emergency page (optional brief)
G4. Add AI disclaimer labels to all AI output
```

### Phase H — Polish + Demo Prep
```
H1. Responsive layout for emergency page (mobile-first)
H2. Health card print CSS
H3. Dashboard stat cards (computed from real DB data)
H4. Remove/guard remaining open endpoints
H5. End-to-end demo run + data seeding for all 5 demo scenarios
```

---

## 6. Recommended Tech Stack

Only technologies that are genuinely necessary.

### Backend additions (to existing FastAPI)

| Package | Purpose | Why needed |
|---|---|---|
| `sqlmodel` | ORM + schema, wraps SQLAlchemy + Pydantic | Single package replaces Pandas for patient data; Pydantic already in use |
| `python-jose[cryptography]` | JWT creation + validation | Auth tokens |
| `passlib[bcrypt]` | Password hashing | Registration/login |
| `slowapi` | Rate limiting on emergency endpoint | One decorator, no Redis needed |
| `aiofiles` | Async file serving (optional, for photo upload) | If photo upload added |

> Do NOT add: PostgreSQL (overkill for hackathon), Redis (overkill), Celery (overkill), Alembic (SQLModel handles this simply).

### Frontend additions (to existing React + Vite)

| Package | Purpose | Why needed |
|---|---|---|
| `react-router-dom` v7 | Client-side routing | Required for `/emergency/:token` deep link |
| `qrcode.react` | QR code rendering in browser | Lightweight, widely used |
| `react-to-print` | Health card print button | Simple print CSS trigger |

> Do NOT add: Redux, Axios (fetch is fine), Tailwind, Radix UI, Framer Motion (existing CSS animations sufficient).

### AI

| Service | Purpose | Cost |
|---|---|---|
| HuggingFace Inference API (free) | Medical history summariser (`facebook/bart-large-cnn` or `google/flan-t5-base`) | Free tier; 30K chars/month |
| Existing local `d4data/biomedical-ner-all` | NER (keep as-is) | Already installed |

> Do NOT add: OpenAI API (cost, key management risk in hackathon), LangChain (overkill), vector DB (overkill).

---

## 7. Hackathon Demo Flow (3–5 minutes)

### Scene 1 — Patient Registration + Profile (45 seconds)
```
Action:   Open app → Register as patient → Create profile
Shows:    Name, age, blood group, allergies, conditions, prescriptions
Message:  "JeevanRaksha stores your complete medical history securely"
```

### Scene 2 — Digital Health Card + QR (45 seconds)
```
Action:   Click "My Health Card" → See card with name, blood group,
          critical allergies, emergency contact, QR code
Action:   Click "Download / Print"
Shows:    A professional, printable health card
Message:  "Every patient gets a verifiable health card with a secure QR"
```

### Scene 3 — Emergency Scenario (60 seconds)
```
Scenario: Patient has been in an accident. Paramedic scans QR from phone.
Action:   Scan QR (or open /emergency/:token on phone) → No login required
Shows:    IMMEDIATELY visible —
          🩸 Blood Group: O-
          ⛔ Allergies: Penicillin (SEVERE), Shellfish
          ❤️ Conditions: Diabetes, Hypertension
          💊 Critical Meds: Warfarin 5mg
          📞 Emergency Contact: [Name] [Phone]
Message:  "Critical information in under 3 seconds. No login. No app needed."
Bonus:    Show access log entry: "QR scanned at 18:04:23 from IP..."
```

### Scene 4 — Doctor Logs In (30 seconds)
```
Action:   Doctor logs in → Doctor dashboard loads
Shows:    Patient list, search bar, alert counts per patient
Action:   Search "Rajesh" → Click patient
Shows:    Full medical profile: allergies, conditions, prescriptions, labs
Message:  "Doctors see a complete, structured medical history"
```

### Scene 5 — Safety Engine (60 seconds)
```
Action:   Click "Run Clinical Safety Analysis"
Shows:    NER badge (AI-NER active)
          ⚠ DRUG INTERACTION: Warfarin ↔ Aspirin — HIGH risk
          ⚠ DRUG INTERACTION: Warfarin ↔ Ibuprofen — HIGH risk
          ⚠ CONTRAINDICATION: Diabetes + Warfarin — MEDIUM
          Risk meter: RED — HIGH DANGER
          Labels: "SYSTEM ALERT (Rule-Based)" — not AI diagnosis
Message:  "AI extracts entities. Rules make safety decisions.
           AI understands language. Rules ensure safety."
```

### Scene 6 — AI Summary (30 seconds)
```
Action:   Click "Generate AI Summary"
Shows:    Concise paragraph:
          "Patient is a 58-year-old male on anticoagulation therapy (Warfarin)
           with concurrent Aspirin and Ibuprofen prescriptions — HIGH bleeding
           risk. Known severe allergy to Penicillin..."
Label:    "⚠ AI-GENERATED SUMMARY — NOT a medical diagnosis"
Message:  "AI helps doctors quickly understand complex histories — with clear
           labelling so no one confuses it for clinical advice"
```

### Scene 7 — Impact Statement (30 seconds)
```
Show:     Architecture diagram
Message:  "JeevanRaksha connects four pillars:
           ✅ Patient owns their health data
           ✅ Emergency access in seconds — no app, no login
           ✅ Doctors get safety alerts before prescribing
           ✅ AI assists — rules protect
           Potential to prevent drug interaction fatalities."
```

---

## 8. Biggest Risks

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| NER model load time (30–60s first call) | **HIGH** | Demo killer | Pre-warm at startup in FastAPI lifespan event |
| SQLite migration breaks existing safety engine | MEDIUM | High | Extract safety engine first, migrate data second; run both in parallel initially |
| QR deep link fails on phone (CORS, localhost) | MEDIUM | Demo killer | Use `ngrok` or `localtunnel` for demo; test on phone before presentation |
| React Router breaks existing page navigation | LOW | Medium | Incremental migration; wrap existing views as routes |
| HuggingFace Inference API rate limit during demo | MEDIUM | Medium | Cache AI responses; have offline fallback text ready |

### Security Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| JWT secret hardcoded in code pushed to GitHub | HIGH | Critical | Use `.env` file; add `.env` to `.gitignore` immediately |
| Open endpoints remain after refactor | MEDIUM | Critical | Audit all routes before demo; remove `/patients` and `/analyse` entirely |
| Emergency endpoint exposes too much data | MEDIUM | High | Emergency response schema defined separately; never returns phone of patient themselves |
| QR token guessable | LOW | High | UUID4 tokens are not guessable; do not use sequential IDs |

### Privacy Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Patient phone number sent to frontend | **CONFIRMED** (exists now) | High | Remove from PatientSummary response; only return to account owner |
| Demo uses real-looking patient names/phones | MEDIUM | Medium | Use clearly fake demo data (e.g. "Demo Patient", phone 9999999999) |
| Access logs store IP addresses | LOW | Low | Acceptable for demo; note it in privacy disclosure |

### AI Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| AI summary sounds like a medical diagnosis | HIGH | Serious | All AI output must carry visible disclaimer label: "AI-GENERATED — NOT a medical diagnosis" |
| NER misses a drug/disease entity | MEDIUM | Medium | Existing fallback to raw CSV values; label NER output as "AI-extracted (may be incomplete)" |
| HuggingFace Inference API returns hallucinated medical information | MEDIUM | High | Only send verified structured data as input; do not send free-text from users into the summariser |

### Demo Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| QR scan on phone fails to open (network) | MEDIUM | Demo killer | Prepare QR that points to deployed URL or ngrok; test before |
| Duplicate knowledge base rows inflate alert count | **CONFIRMED** | Embarrassing | Fix DI021–DI050 and DC012–DC050 duplicates before any demo |
| Safety analysis returns 0 alerts for demo patient | LOW | Awkward | Seed demo patient (Rajesh Gupta, ABHA011) with known HIGH-risk prescription combination |
| React build fails 10 minutes before demo | LOW | Medium | Keep dev server running; do not do `npm build` during demo preparation |

---

## 9. AI Feature Specifications

### Feature A — Medical History Summariser

| Property | Detail |
|---|---|
| **Input** | Structured JSON: patient conditions, allergies, active prescriptions, recent lab values |
| **Model** | `facebook/bart-large-cnn` via HuggingFace Inference API (free) OR local `flan-t5-base` |
| **Output** | 2–4 sentence clinical summary paragraph |
| **Safety limit** | Output always shown with label: "⚠ AI-GENERATED SUMMARY — for reference only, not a clinical diagnosis" |
| **Integration** | Called from `/doctor/patient/:id/summarise` endpoint; result shown in doctor view below patient profile |
| **Fallback** | If API unavailable, show: "AI summary unavailable — please review records manually" |

### Feature B — Emergency Brief

| Property | Detail |
|---|---|
| **Input** | ONLY verified stored data: blood group, severe allergies, chronic conditions, active critical medications |
| **Model** | Template-based generation (no LLM needed) → structured from verified DB fields |
| **Output** | 1 paragraph plain-English emergency brief, e.g. "Patient has Type 2 Diabetes and is on Warfarin — DO NOT administer NSAIDs or Aspirin without specialist review. Severe allergy to Penicillin." |
| **Safety limit** | Label: "BASED ON VERIFIED PATIENT DATA" — not AI-generated in this case |
| **Integration** | Shown at bottom of emergency page under "Quick Brief for Medic" |
| **Note** | This is actually rule-based text templating, not AI. Present it accurately. |

### Feature C — Medical Document Extraction (Nice to Have)

| Property | Detail |
|---|---|
| **Input** | Uploaded image or PDF of lab report or prescription |
| **Model** | HuggingFace `microsoft/trocr-base-handwritten` (OCR) → then NER |
| **Output** | Extracted test names, values, drug names in structured form for user to review and confirm before saving |
| **Safety limit** | "AI-extracted — please verify all values before saving to your profile" — user must confirm each field |
| **Integration** | Optional import flow on lab report page: "Upload Report" → shows extracted fields → user confirms → saves to DB |
| **Risk** | OCR accuracy on medical documents is imperfect; mandatory user confirmation step is non-negotiable |

---

## 10. Data Migration Plan

### Step 1 — Deduplicate knowledge bases (before anything else)
```
drug_interactions.csv:  Keep DI001–DI020 only. Remove DI021–DI050 (all Aspirin+Heparin duplicates).
                        Also fix: DI020 appears twice (Warfarin+Clopidogrel AND Lithium+NSAIDs)
                        — keep both with corrected IDs.
disease_contra.csv:     Keep DC001–DC022 only. Remove DC023–DC050 (all Hypertension+Decongestants).
                        Also fix: DC020–DC022 appear with duplicate IDs — renumber.
```

### Step 2 — Create SQLite DB and seed from cleaned CSVs
```
Migration script (run once):
  patients.csv       → Patient table (generate UUIDs, create User stubs if needed)
  allergies.csv      → Allergy table (link via patient abha_id → patient.id)
  conditions.csv     → Condition table
  prescriptions.csv  → Prescription table (fix duplicate PR013/PR014 IDs)
  lab_reports.csv    → LabReport table
```

### Step 3 — Create demo doctor accounts
```
Seed 2 demo doctor accounts (hashed passwords):
  doctor@apollo.com  / DemoDoc@123  → Hospital: Apollo
  doctor@aiims.com   / DemoDoc@123  → Hospital: AIIMS
```

### Step 4 — Create demo patient account
```
Seed 1 demo patient account (maps to ABHA011 Rajesh Gupta — highest risk):
  patient@demo.com / DemoPatient@123
```

### Step 5 — Generate QR tokens for demo patients
```
Generate QR token for ABHA011 at seed time — stable token for demo.
```

### Step 6 — Keep original CSVs as backup
```
Do NOT delete patients.csv, allergies.csv, etc.
Rename originals to *.csv.bak after successful migration.
Knowledge base CSVs remain as primary source (still loaded at startup).
```

---

*End of plan. No code has been modified. Awaiting approval before implementation begins.*
