# JeevanRaksha — Technical Baseline Audit
> Read-only inspection. No files modified.

---

## 1. Current Tech Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend** | React 19 + TypeScript + Vite 6 | Vanilla CSS design system (no Tailwind, no UI library) |
| **Backend** | FastAPI 0.141 + Uvicorn | Single file: `backend/main.py` (346 lines) |
| **Database** | None — flat CSV files | 7 CSV files loaded into Pandas DataFrames at startup, held in memory |
| **Authentication** | **None** | No login, no session, no token, no user concept of any kind |
| **AI / ML** | HuggingFace `d4data/biomedical-ner-all` | Named Entity Recognition only; loaded lazily on first request |
| **QR system** | **None** | No QR generation, no QR scanning, no QR routes |
| **External APIs** | None | No third-party API calls (no ABHA gateway, no NMC, no Aarogya Setu) |
| **State management** | React `useState` only | No Redux, no Zustand, no context |
| **Routing** | Manual `useState<Page>` | No React Router; two hard-coded views |

---

## 2. Actual Working User Flow

The only real user flow is:

1. User opens `http://localhost:5173`
2. **Dashboard page** loads — static display of pipeline steps and a hardcoded sample of knowledge base entries
3. User clicks **"Analyse Patient"** in the sidebar
4. A list of all 11 patients is fetched from `GET /api/patients` and displayed
5. User clicks a patient row → triggers `GET /api/analyse/{abha_id}?use_ner=true`
6. Backend:
   a. Filters patient data from CSVs
   b. Constructs a medical text string
   c. Runs it through the HuggingFace NER pipeline (or falls back to raw CSV values)
   d. Checks every drug pair against `drug_interactions.csv`
   e. Checks every disease × drug combination against `disease_contra.csv`
   f. Computes SAFE / LOW / MEDIUM / HIGH risk level
   g. Returns a JSON response
7. Frontend renders: patient info, allergies, conditions, prescriptions table, animated risk ring, alert cards sorted by severity, lab results table

**That is the complete flow.** There is no registration, no login, no write operations, no patient creation, no document upload, no QR, no admin panel, no emergency access.

---

## 3. Feature Status Table

| Feature | Status | Notes |
|---|---|---|
| Patient registration / login | **Missing** | No auth system of any kind |
| Medical profile (view) | **Implemented** | Read from CSV; name, age, gender, blood group, hospital, phone |
| Medical profile (edit/create) | **Missing** | All data is read-only from static CSV |
| Digital Health Card | **Missing** | No card generation, no card view |
| Health / ABHA ID | **Partial** | `abha_id` exists as a string field (e.g. "ABHA001"); it is not validated, generated, or linked to a real ABHA gateway |
| QR generation | **Missing** | No library, no route, no component |
| Emergency QR access | **Missing** | No concept of emergency access |
| Emergency information display | **Missing** | No dedicated emergency view |
| Admin panel | **Missing** | No admin role, no separate view |
| Patient search | **Implemented** | Client-side name/ABHA ID/hospital filter in `PatientSelector.tsx` |
| Medical record management | **Missing** | Records are static CSV data; no add/edit/delete |
| Drug–drug interaction check | **Implemented** | Fully working against 52 rules in CSV |
| Disease–drug contraindication check | **Implemented** | Fully working against 53 rules in CSV |
| Allergy alerts | **Implemented** | Displayed as "DO NOT prescribe" pills |
| Lab report display | **Implemented** | Shows value, unit, status, abnormal flag |
| Risk level computation | **Implemented** | SAFE / LOW / MEDIUM / HIGH based on max alert severity |
| AI NER extraction | **Implemented** | `d4data/biomedical-ner-all` with CSV fallback |
| Document / PDF upload | **Missing** | No file upload routes or UI |
| Prescription write / update | **Missing** | Read-only |
| Notifications / alerts to doctors | **Missing** | No notification system |
| Hospital multi-tenancy | **Missing** | All hospitals visible to all users with no separation |
| Report export / print | **Missing** | No PDF export, no print view |
| Audit log | **Missing** | No logging of who accessed what |

---

## 4. Database Structure

There is **no database**. Data lives in 7 CSV files loaded at startup into in-memory Pandas DataFrames. All data is lost/reset on server restart (but the CSVs persist).

| File | Columns | Rows (data) | Purpose |
|---|---|---|---|
| `patients.csv` | `abha_id, patient_id, name, age, gender, blood_group, hospital_name, phone` | 11 | Master patient registry |
| `allergies.csv` | `allergy_id, abha_id, allergy_type, substance, severity, first_detected` | 12 | Patient allergy records |
| `conditions.csv` | `condition_id, abha_id, condition, chronic, since, status` | 16 | Medical conditions |
| `prescriptions.csv` | `prescription_id, abha_id, drug, dose, frequency, start_date, end_date, status` | 17 active + some temporary | Drug prescriptions |
| `lab_reports.csv` | `report_id, abha_id, test_name, value, unit, status, test_date, report_date` | 10 | Lab test results |
| `drug_interactions.csv` | `interaction_id, drug1, drug2, risk, severity, reference` | 52 rules | Knowledge base — drug pairs |
| `disease_contra.csv` | `contra_id, condition, drug, warning, severity, reference` | 53 rules | Knowledge base — contraindications |

**Important notes on data quality:**
- `drug_interactions.csv`: Rows DI021–DI050 are all identical duplicates of `Aspirin + Heparin, Severe bleeding risk, HIGH` — the knowledge base is padded with junk
- `disease_contra.csv`: Rows DC012–DC050 are all identical duplicates of `Hypertension + Decongestants, MEDIUM` — same padding problem
- 3 patients (ABHA008, ABHA010, ABHA011 partial) have no lab reports in `lab_reports.csv`
- ABHA009 and ABHA010 are referenced in prescriptions but only partially in patients.csv (ABHA009 exists; ABHA010 exists)
- Duplicate `prescription_id` values exist (PR013 and PR014 used twice each)

---

## 5. QR System

**Does not exist.** There is no QR code generation, no QR scanning endpoint, no QR library in `package.json`, and no mention of QR in any source file. The concept exists only in the project name and documentation.

---

## 6. Emergency Access

**Does not exist.** There is no emergency access endpoint, no unauthenticated public health card, no time-limited access token, and no concept of an emergency responder role. 

The current `/analyse/{abha_id}` endpoint is completely open (no auth), so technically anyone who knows an ABHA ID can retrieve a patient's full medical profile — but this is not a designed emergency feature; it is a security gap.

---

## 7. AI Functionality

### Implemented (verified in code)
- **Named Entity Recognition (NER):** `d4data/biomedical-ner-all` via HuggingFace `transformers.pipeline`
- **Entity categories used:** `Chemical` → drugs, `Disease` → diseases
- **Fallback:** If NER fails or returns empty lists, the system falls back to raw CSV values
- **Toggle:** The frontend has a working UI toggle to enable/disable NER per analysis run

### Not implemented (not in any file)
- LLM-generated clinical recommendations
- AI-generated prescription suggestions
- Summarisation of patient history
- Image/document analysis (no OCR, no PDF parsing)
- Prediction of future risk
- Any fine-tuned or custom model

---

## 8. Technical and Security Problems (verified from code)

| Problem | Location | Severity |
|---|---|---|
| **No authentication** — any URL hit returns real patient data | `backend/main.py:51-56` CORS `allow_origins=["*"]` + no auth middleware | **Critical** |
| **All patient data exposed to anyone** — `/patients` lists all 11 patients and `/analyse/{id}` returns full medical record with phone number | `backend/main.py:316-341` | **Critical** |
| **Phone numbers in API response** — PII sent to frontend and displayed | `PatientSummary` model, `AnalysePage.tsx` | **High** |
| **Duplicate/junk rows in knowledge base** — DI021–DI050 all identical, DC012–DC050 all identical | `drug_interactions.csv`, `disease_contra.csv` | **High** — inflates alert counts and makes the system appear to find more interactions than it actually knows about |
| **Duplicate primary keys** — `PR013`, `PR014` appear twice in prescriptions; `DI020`, `DC020`–`DC022` duplicated | `prescriptions.csv`, knowledge base CSVs | **Medium** |
| **No input validation** — `abha_id` path param passed directly to Pandas filter; no sanitisation | `backend/main.py:144-148` | **Medium** |
| **All data in memory, lost on server restart** — no writes persist | Startup loading pattern | **Medium** |
| **NER model loaded lazily on first real request** — first patient analysis can take 30–60 seconds | `get_ner()` in `main.py:33-42` | **Medium** (bad UX) |
| **No error boundary in React** — uncaught JS errors crash the entire UI | `App.tsx`, no ErrorBoundary | **Low** |
| **`import json` and `import os` in backend are unused imports** | `backend/main.py:8-9` | **Low** |
| **Dashboard stat cards are hardcoded** — "8 rules", "12 rules", "~97% accuracy" are not computed from actual data | `DashboardPage.tsx:4-6` | **Low** (misleading) |

---

## 9. Missing Features from the JeevanRaksha Concept

Based on what the name and documentation promise vs what is implemented:

| Missing Feature | Impact |
|---|---|
| **QR Code generation** — the core "scan in emergency" concept | The entire emergency use case does not work |
| **Digital Health Card** — a shareable, printable patient card | No card, no view, no export |
| **Authentication / login** — patient, doctor, hospital roles | Entire system is unauthenticated |
| **Patient self-registration** — patients entering their own data | All data is hardcoded CSV |
| **Write operations** — add prescription, update condition, record allergy | Completely read-only |
| **Real ABHA ID integration** — actual ABHA Health ID system | IDs are fake strings, no API connection |
| **Emergency responder view** — limited, read-optimised view for paramedics | Does not exist |
| **Hospital admin panel** — manage doctors, approve records | Does not exist |
| **Notification system** — alert doctors to critical interactions | Does not exist |
| **Document / PDF upload** — scan prescriptions, lab reports | Does not exist |
| **Multi-patient dashboard for doctors** — see all patients with open alerts | Only one-at-a-time analysis |
| **Audit trail** — who accessed a patient record and when | Does not exist |
| **ABHA-09 missing** — patient ABHA009 (Vikram Iyer) has no conditions or allergies in CSV | Data gap |

---

## 10. Overall Assessment

### What is already solid
- The **core safety engine** (drug–drug + disease–drug) works correctly and is architecturally clean — AI for NER, rules for decisions
- The **frontend design** is polished: dark theme, animated SVG risk ring, severity-sorted alert cards
- The **FastAPI backend** is clean, typed with Pydantic, and has correct CORS + Vite proxy setup
- The **NER fallback** is thoughtfully implemented — system degrades gracefully if the model fails
- The **knowledge base structure** (CSV-based rules with source attribution) is appropriate for a hackathon demo

### What needs fixing before anything else
1. **Deduplicate the knowledge base CSVs** — the Aspirin+Heparin and Hypertension+Decongestants padding rows will produce wildly inflated alert counts and embarrass a demo
2. **Remove phone numbers from the API response** — raw PII should not go to the browser
3. **Pre-warm the NER model at startup** — a 60-second wait on first click is a hackathon killer
4. **Fix duplicate prescription IDs** — PR013/PR014 appear twice, causing data confusion

### What needs to be added for hackathon readiness
1. **QR code generation + emergency scan page** — this is the core user story and currently completely absent
2. **Digital Health Card page** — a visually impressive single-page patient summary to display after QR scan
3. **Basic authentication (at minimum a demo login)** — without this, there is no concept of "a patient logging in"
4. **Write capability** — at minimum add a prescription or condition to demonstrate the system is interactive, not just a viewer
5. **Doctor's dashboard** — list all patients with alert counts so a clinician can see which patients are at risk
6. **Printable / exportable report** — judges expect to see output they can hold or share
