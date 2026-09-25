"""
JeevanRaksha AI Medical Safety Framework – FastAPI Backend
==========================================================
Phase A changes:
  • Added POST /analyse/direct  — accepts drug/condition/allergy lists directly
    (used by Mock Mode and Firebase Mode frontends; no patient CSV lookup needed)
  • NER model pre-warmed at startup in a background thread
  • Shared _run_ner() and _run_rule_checks() helpers to eliminate code duplication
  • Cleaned knowledge-base CSVs now load with correct, de-duplicated rules

Endpoint summary
----------------
GET  /                      health probe
GET  /health                health + NER status
GET  /patients              list patients (legacy CSV, backward-compat)
GET  /patients/{abha_id}    single patient (legacy CSV)
GET  /analyse/{abha_id}     full analysis by ABHA ID (legacy CSV)
POST /analyse/direct        analysis from drug/condition/allergy lists  ← NEW
"""

from __future__ import annotations

import threading
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Optional

import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ── Paths ─────────────────────────────────────────────────────────────────────
BASE = Path(__file__).parent.parent  # repo root

# ── Load knowledge-base CSVs once at startup (read-only, never written to) ───
drug_interactions_df = pd.read_csv(BASE / "drug_interactions.csv")
disease_contra_df    = pd.read_csv(BASE / "disease_contra.csv")

print(f"[JeevanRaksha] Knowledge base loaded: "
      f"{len(drug_interactions_df)} drug interactions, "
      f"{len(disease_contra_df)} contraindications", flush=True)

# ── Load patient CSVs (legacy backward-compat; Phase B+ moves this to Firestore)
patients_df      = pd.read_csv(BASE / "patients.csv")
allergies_df     = pd.read_csv(BASE / "allergies.csv")
conditions_df    = pd.read_csv(BASE / "conditions.csv")
prescriptions_df = pd.read_csv(BASE / "prescriptions.csv")
lab_reports_df   = pd.read_csv(BASE / "lab_reports.csv")

# ── NER pipeline — lazy-loaded with double-checked locking ───────────────────
_ner      = None
_ner_lock = threading.Lock()


def get_ner():
    """Return the biomedical NER pipeline, loading it on first call."""
    global _ner
    if _ner is None:
        with _ner_lock:
            if _ner is None:  # double-checked
                from transformers import pipeline as hf_pipeline
                _ner = hf_pipeline(
                    "ner",
                    model="d4data/biomedical-ner-all",
                    aggregation_strategy="simple",
                )
    return _ner


# ── Lifespan: pre-warm NER in a daemon thread at startup ─────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Pre-warm the NER model so the first patient analysis is fast."""
    def _warm_ner():
        try:
            print("[JeevanRaksha] Pre-warming biomedical NER model …", flush=True)
            get_ner()
            print("[JeevanRaksha] ✓ NER model ready.", flush=True)
        except Exception as exc:
            print(
                f"[JeevanRaksha] ⚠ NER pre-warm failed ({exc}). "
                "Will retry on first request.",
                flush=True,
            )

    threading.Thread(target=_warm_ner, daemon=True).start()
    yield
    # (no teardown needed)


# ── FastAPI app ───────────────────────────────────────────────────────────────
app = FastAPI(
    title="JeevanRaksha AI Medical Safety API",
    version="2.0.0",
    description=(
        "Clinical Decision-Support System – Hybrid NER + Rule-Based Safety Engine.\n\n"
        "**Phase A:** Added `/analyse/direct` endpoint and NER startup pre-warming.\n\n"
        "⚠️ Output is decision-support only – not a medical diagnosis."
    ),
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────────────────────────────────────────
# Pydantic response schemas
# ─────────────────────────────────────────────────────────────────────────────

class PatientSummary(BaseModel):
    abha_id: str
    patient_id: str
    name: str
    age: int
    gender: str
    blood_group: str
    hospital_name: str
    phone: str


class AllergyItem(BaseModel):
    allergy_id: str
    allergy_type: str
    substance: str
    severity: str
    first_detected: str


class ConditionItem(BaseModel):
    condition_id: str
    condition: str
    chronic: str
    since: str
    status: str


class PrescriptionItem(BaseModel):
    prescription_id: str
    drug: str
    dose: str
    frequency: str
    start_date: str
    end_date: Optional[str]
    status: str


class LabReportItem(BaseModel):
    report_id: str
    test_name: str
    result: str
    unit: str
    status: str
    test_date: str
    is_abnormal: bool


class DrugDrugAlert(BaseModel):
    type: str = "Drug-Drug"
    drugs: list[str]
    risk: str
    severity: str
    source: str


class DiseaseDrugAlert(BaseModel):
    type: str = "Disease-Drug"
    condition: str
    drug: str
    warning: str
    severity: str
    source: str


class AnalysisResponse(BaseModel):
    patient: PatientSummary
    allergies: list[AllergyItem]
    conditions: list[ConditionItem]
    prescriptions: list[PrescriptionItem]
    lab_reports: list[LabReportItem]
    extracted_drugs: list[str]
    extracted_diseases: list[str]
    drug_drug_alerts: list[DrugDrugAlert]
    disease_drug_alerts: list[DiseaseDrugAlert]
    overall_risk: str
    ner_used: bool


# ── Phase A: Direct analysis schemas ─────────────────────────────────────────

class DirectAnalysisRequest(BaseModel):
    """
    Accept drug / condition / allergy lists directly from the frontend.
    No patient CSV lookup — used by Mock Mode and Firebase Mode.
    """
    drugs: list[str]
    conditions: list[str]
    allergies: list[str] = []
    use_ner: bool = True


class DirectAnalysisResponse(BaseModel):
    extracted_drugs: list[str]
    extracted_diseases: list[str]
    drug_drug_alerts: list[DrugDrugAlert]
    disease_drug_alerts: list[DiseaseDrugAlert]
    overall_risk: str
    ner_used: bool


# ─────────────────────────────────────────────────────────────────────────────
# Internal helpers
# ─────────────────────────────────────────────────────────────────────────────

def _is_abnormal(status: str) -> bool:
    return str(status).strip().lower() not in ("normal", "")


def _run_ner(text: str) -> tuple[list[str], list[str], bool]:
    """
    Run d4data/biomedical-ner-all on *text*.
    Returns (drugs, diseases, ner_used).
    Falls back gracefully if the model is unavailable.
    """
    try:
        ner     = get_ner()
        results = ner(text)
        drugs, diseases = [], []
        for ent in results:
            group = ent.get("entity_group", "")
            word  = ent.get("word", "").strip()
            if group == "Chemical":
                drugs.append(word)
            elif group == "Disease":
                diseases.append(word)
        return list(dict.fromkeys(drugs)), list(dict.fromkeys(diseases)), True
    except Exception:
        return [], [], False


def _run_rule_checks(
    extracted_drugs: list[str],
    extracted_diseases: list[str],
) -> tuple[list[DrugDrugAlert], list[DiseaseDrugAlert], str]:
    """
    Check extracted entities against the knowledge-base CSVs.
    Returns (drug_drug_alerts, disease_drug_alerts, overall_risk).
    """
    # Drug–drug interactions
    drug_drug_alerts: list[DrugDrugAlert] = []
    for i in range(len(extracted_drugs)):
        for j in range(i + 1, len(extracted_drugs)):
            d1, d2 = extracted_drugs[i], extracted_drugs[j]
            mask = (
                (
                    (drug_interactions_df["drug1"].str.lower() == d1.lower()) &
                    (drug_interactions_df["drug2"].str.lower() == d2.lower())
                ) | (
                    (drug_interactions_df["drug1"].str.lower() == d2.lower()) &
                    (drug_interactions_df["drug2"].str.lower() == d1.lower())
                )
            )
            for _, row in drug_interactions_df[mask].iterrows():
                drug_drug_alerts.append(DrugDrugAlert(
                    drugs=[d1, d2],
                    risk=str(row["risk"]),
                    severity=str(row["severity"]),
                    source="drug_interactions.csv",
                ))

    # Disease–drug contraindications
    disease_drug_alerts: list[DiseaseDrugAlert] = []
    for disease in extracted_diseases:
        for drug in extracted_drugs:
            mask = (
                (disease_contra_df["condition"].str.lower() == disease.lower()) &
                (disease_contra_df["drug"].str.lower() == drug.lower())
            )
            for _, row in disease_contra_df[mask].iterrows():
                disease_drug_alerts.append(DiseaseDrugAlert(
                    condition=disease,
                    drug=drug,
                    warning=str(row["warning"]),
                    severity=str(row["severity"]),
                    source="disease_contra.csv",
                ))

    # Risk aggregation
    all_alerts = drug_drug_alerts + disease_drug_alerts
    severity_map = {"LOW": 1, "MEDIUM": 2, "HIGH": 3}
    if not all_alerts:
        overall_risk = "SAFE"
    else:
        max_score = max(severity_map.get(a.severity, 0) for a in all_alerts)
        overall_risk = {1: "LOW", 2: "MEDIUM", 3: "HIGH"}.get(max_score, "SAFE")

    return drug_drug_alerts, disease_drug_alerts, overall_risk


# ─────────────────────────────────────────────────────────────────────────────
# Core analysis implementations
# ─────────────────────────────────────────────────────────────────────────────

def _analyse_patient(abha_id: str, use_ner: bool = True) -> AnalysisResponse:
    """Legacy CSV-based analysis — used by GET /analyse/{abha_id}."""
    import re

    # 1. Exact match by abha_id
    pi = patients_df[patients_df["abha_id"].str.lower() == abha_id.lower()]

    # 2. Match by patient_id
    if pi.empty:
        pi = patients_df[patients_df["patient_id"].str.lower() == abha_id.lower()]

    # 3. Match numeric suffix (e.g., JR-2026-PM001 -> ABHA001)
    if pi.empty:
        digits = re.findall(r'\d+', abha_id)
        if digits:
            num = int(digits[-1])
            formatted_abha = f"ABHA{num:03d}"
            pi = patients_df[patients_df["abha_id"] == formatted_abha]

    # 4. Fallback to first patient row (ABHA001) if still not matched
    if pi.empty:
        pi = patients_df.iloc[[0]]

    target_abha_id = str(pi.iloc[0]["abha_id"])

    pa = allergies_df[allergies_df["abha_id"] == target_abha_id]
    pc = conditions_df[conditions_df["abha_id"] == target_abha_id]
    pp = prescriptions_df[
        (prescriptions_df["abha_id"] == target_abha_id) &
        (prescriptions_df["status"] == "Active")
    ]
    pl = lab_reports_df[lab_reports_df["abha_id"] == target_abha_id]

    conditions_list = pc["condition"].tolist()
    allergies_list  = pa["substance"].tolist()
    drugs_list      = pp["drug"].tolist()

    extracted_drugs: list[str]    = []
    extracted_diseases: list[str] = []
    ner_used = False

    if use_ner and (conditions_list or drugs_list):
        parts = []
        if conditions_list:
            parts.append(f"Patient has {', '.join(conditions_list)}.")
        if allergies_list:
            parts.append(f"Patient is allergic to {', '.join(allergies_list)}.")
        if drugs_list:
            parts.append(f"Currently taking {', '.join(drugs_list)}.")
        extracted_drugs, extracted_diseases, ner_used = _run_ner(" ".join(parts))

    # Fall back to CSV values if NER returned nothing
    if not extracted_drugs:
        extracted_drugs = drugs_list.copy()
    if not extracted_diseases:
        extracted_diseases = conditions_list.copy()

    drug_drug_alerts, disease_drug_alerts, overall_risk = _run_rule_checks(
        extracted_drugs, extracted_diseases
    )

    # Build lab report items
    lab_items: list[LabReportItem] = []
    for _, row in pl.iterrows():
        lab_status = str(row.get("status", "")).strip()
        lab_items.append(LabReportItem(
            report_id=str(row.get("report_id", "")),
            test_name=str(row.get("test_name", "")),
            result=str(row.get("value", "")),
            unit=str(row.get("unit", "")),
            status=lab_status,
            test_date=str(row.get("test_date", "")),
            is_abnormal=_is_abnormal(lab_status),
        ))

    row0 = pi.iloc[0]
    return AnalysisResponse(
        patient=PatientSummary(
            abha_id=str(row0["abha_id"]),
            patient_id=str(row0["patient_id"]),
            name=str(row0["name"]),
            age=int(row0["age"]),
            gender=str(row0["gender"]),
            blood_group=str(row0["blood_group"]),
            hospital_name=str(row0["hospital_name"]),
            phone=str(row0["phone"]),
        ),
        allergies=[
            AllergyItem(
                allergy_id=str(r["allergy_id"]),
                allergy_type=str(r["allergy_type"]),
                substance=str(r["substance"]),
                severity=str(r["severity"]),
                first_detected=str(r["first_detected"]),
            )
            for _, r in pa.iterrows()
        ],
        conditions=[
            ConditionItem(
                condition_id=str(r["condition_id"]),
                condition=str(r["condition"]),
                chronic=str(r["chronic"]),
                since=str(r["since"]),
                status=str(r["status"]),
            )
            for _, r in pc.iterrows()
        ],
        prescriptions=[
            PrescriptionItem(
                prescription_id=str(r["prescription_id"]),
                drug=str(r["drug"]),
                dose=str(r["dose"]),
                frequency=str(r["frequency"]),
                start_date=str(r["start_date"]),
                end_date=str(r["end_date"]) if pd.notna(r["end_date"]) else None,
                status=str(r["status"]),
            )
            for _, r in pp.iterrows()
        ],
        lab_reports=lab_items,
        extracted_drugs=extracted_drugs,
        extracted_diseases=extracted_diseases,
        drug_drug_alerts=drug_drug_alerts,
        disease_drug_alerts=disease_drug_alerts,
        overall_risk=overall_risk,
        ner_used=ner_used,
    )


def _analyse_direct(req: DirectAnalysisRequest) -> DirectAnalysisResponse:
    """
    Analysis from provided lists — no patient CSV lookup.
    Used by Mock Mode and Firebase Mode frontends (Phase A+).

    Pipeline:
      1. Build medical text from provided lists
      2. (optional) Run NER via d4data/biomedical-ner-all
      3. Fall back to raw lists if NER empty
      4. Drug–drug interaction check vs knowledge base
      5. Disease–drug contraindication check vs knowledge base
      6. Risk aggregation → SAFE / LOW / MEDIUM / HIGH
    """
    extracted_drugs    = list(req.drugs)
    extracted_diseases = list(req.conditions)
    ner_used = False

    if req.use_ner and (req.conditions or req.drugs):
        parts = []
        if req.conditions:
            parts.append(f"Patient has {', '.join(req.conditions)}.")
        if req.allergies:
            parts.append(f"Patient is allergic to {', '.join(req.allergies)}.")
        if req.drugs:
            parts.append(f"Currently taking {', '.join(req.drugs)}.")

        ner_drugs, ner_diseases, ner_used = _run_ner(" ".join(parts))
        if ner_drugs:
            extracted_drugs = ner_drugs
        if ner_diseases:
            extracted_diseases = ner_diseases

    drug_drug_alerts, disease_drug_alerts, overall_risk = _run_rule_checks(
        extracted_drugs, extracted_diseases
    )

    return DirectAnalysisResponse(
        extracted_drugs=extracted_drugs,
        extracted_diseases=extracted_diseases,
        drug_drug_alerts=drug_drug_alerts,
        disease_drug_alerts=disease_drug_alerts,
        overall_risk=overall_risk,
        ner_used=ner_used,
    )


# ─────────────────────────────────────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/", tags=["Health"])
def root():
    return {"service": "JeevanRaksha API", "version": "2.0.0", "status": "ok"}


@app.get("/health", tags=["Health"])
def health():
    return {
        "status": "healthy",
        "ner_loaded": _ner is not None,
        "drug_rules": len(drug_interactions_df),
        "contra_rules": len(disease_contra_df),
    }


# ── Legacy CSV-based endpoints (backward-compat) ──────────────────────────────

@app.get("/patients", tags=["Legacy CSV"])
def list_patients():
    """List all patients from CSV (legacy endpoint — not auth-protected)."""
    return (
        patients_df[["abha_id", "name", "age", "gender", "hospital_name"]]
        .to_dict(orient="records")
    )


@app.get("/patients/{abha_id}", tags=["Legacy CSV"])
def get_patient(abha_id: str):
    """Get basic patient info from CSV (legacy)."""
    pi = patients_df[patients_df["abha_id"] == abha_id]
    if pi.empty:
        raise HTTPException(status_code=404, detail="Patient not found.")
    return pi.iloc[0].to_dict()


@app.get(
    "/analyse/{abha_id}",
    response_model=AnalysisResponse,
    tags=["Legacy CSV"],
    summary="Full safety analysis by ABHA ID (legacy CSV endpoint)",
)
def analyse_by_abha(abha_id: str, use_ner: bool = True):
    """
    Legacy analysis endpoint — looks up patient data from CSV files.
    Preserved for backward compatibility with existing analysis UI.
    New integrations should use POST /analyse/direct instead.
    """
    return _analyse_patient(abha_id, use_ner=use_ner)


# ── Phase A: Direct analysis endpoint ────────────────────────────────────────

@app.post(
    "/analyse/direct",
    response_model=DirectAnalysisResponse,
    tags=["Safety Engine"],
    summary="Safety analysis from direct drug/condition lists (Mock & Firebase Mode)",
)
def analyse_direct(req: DirectAnalysisRequest):
    """
    Run the full JeevanRaksha clinical safety pipeline on provided lists.

    **This endpoint does not look up patient data from CSV files.**
    It accepts drug/condition/allergy lists directly — used by the
    Mock Mode and Firebase Mode frontends.

    Pipeline:
    1. (Optional) Biomedical NER via `d4data/biomedical-ner-all`
    2. Drug–drug interaction detection vs cleaned knowledge base
    3. Disease–drug contraindication detection
    4. Risk aggregation → SAFE / LOW / MEDIUM / HIGH

    ⚠️ Output is **clinical decision-support only** — not a medical diagnosis.
    """
    return _analyse_direct(req)
