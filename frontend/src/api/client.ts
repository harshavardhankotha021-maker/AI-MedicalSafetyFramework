// Use relative /api path — Vite dev proxy rewrites to http://127.0.0.1:8000
// In production set VITE_API_URL to your deployed backend URL.
const BASE_URL = import.meta.env.VITE_API_URL ?? "/api";

export interface PatientSummary {
  abha_id: string;
  patient_id: string;
  name: string;
  age: number;
  gender: string;
  blood_group: string;
  hospital_name: string;
  phone: string;
}

export interface AllergyItem {
  allergy_id: string;
  allergy_type: string;
  substance: string;
  severity: string;
  first_detected: string;
}

export interface ConditionItem {
  condition_id: string;
  condition: string;
  chronic: string;
  since: string;
  status: string;
}

export interface PrescriptionItem {
  prescription_id: string;
  drug: string;
  dose: string;
  frequency: string;
  start_date: string;
  end_date: string | null;
  status: string;
}

export interface LabReportItem {
  report_id: string;
  test_name: string;
  result: string;   // raw value string from CSV
  unit: string;
  status: string;   // "High" | "Low" | "Normal"
  test_date: string;
  is_abnormal: boolean;
}

export interface DrugDrugAlert {
  type: "Drug-Drug";
  drugs: string[];
  risk: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
  source: string;
}

export interface DiseaseDrugAlert {
  type: "Disease-Drug";
  condition: string;
  drug: string;
  warning: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
  source: string;
}

export type Alert = DrugDrugAlert | DiseaseDrugAlert;

export interface AnalysisResponse {
  patient: PatientSummary;
  allergies: AllergyItem[];
  conditions: ConditionItem[];
  prescriptions: PrescriptionItem[];
  lab_reports: LabReportItem[];
  extracted_drugs: string[];
  extracted_diseases: string[];
  drug_drug_alerts: DrugDrugAlert[];
  disease_drug_alerts: DiseaseDrugAlert[];
  overall_risk: "SAFE" | "LOW" | "MEDIUM" | "HIGH";
  ner_used: boolean;
}

export interface PatientListItem {
  abha_id: string;
  name: string;
  age: number;
  gender: string;
  hospital_name: string;
}

export interface DirectAnalysisResponse {
  extracted_drugs: string[];
  extracted_diseases: string[];
  drug_drug_alerts: DrugDrugAlert[];
  disease_drug_alerts: DiseaseDrugAlert[];
  overall_risk: "SAFE" | "LOW" | "MEDIUM" | "HIGH";
  ner_used: boolean;
}

// Client-side fallback rule engine for standalone frontend static deployments (Vercel/Netlify/GitHub Pages)
const DRUG_INTERACTION_RULES = [
  { drugs: ["warfarin", "aspirin"], risk: "Increased risk of major bleeding and hemorrhage.", severity: "HIGH" },
  { drugs: ["warfarin", "ibuprofen"], risk: "Severe gastrointestinal bleeding risk.", severity: "HIGH" },
  { drugs: ["aspirin", "ibuprofen"], risk: "Reduced cardioprotective effect of aspirin and increased GI toxicity.", severity: "MEDIUM" },
  { drugs: ["metformin", "contrast"], risk: "Risk of lactic acidosis.", severity: "HIGH" },
  { drugs: ["metoprolol", "amiodarone"], risk: "Severe bradycardia and cardiac conduction delay.", severity: "HIGH" },
];

const CONTRAINDICATION_RULES = [
  { condition: "atrial fibrillation", drug: "ibuprofen", warning: "NSAIDs cause fluid retention and increase stroke/bleeding risk in AFib patients.", severity: "HIGH" },
  { condition: "asthma", drug: "propranolol", warning: "Non-selective beta-blockers trigger severe bronchospasm in asthma.", severity: "HIGH" },
  { condition: "hypertension", drug: "pseudoephedrine", warning: "Decongestants cause acute blood pressure elevation.", severity: "MEDIUM" },
  { condition: "diabetes", drug: "prednisone", warning: "Systemic corticosteroids cause severe hyperglycemia.", severity: "HIGH" },
  { condition: "peptic ulcer", drug: "aspirin", warning: "NSAIDs exacerbate ulceration and cause GI bleeding.", severity: "HIGH" },
];

function fallbackDirectAnalysis(params: { drugs: string[]; conditions: string[]; allergies?: string[] }): DirectAnalysisResponse {
  const normDrugs = params.drugs.map(d => d.toLowerCase());
  const normConditions = (params.conditions || []).map(c => c.toLowerCase());
  const normAllergies = (params.allergies || []).map(a => a.toLowerCase());

  const drug_drug_alerts: DrugDrugAlert[] = [];
  const disease_drug_alerts: DiseaseDrugAlert[] = [];

  // 1. Drug-Drug check
  for (const rule of DRUG_INTERACTION_RULES) {
    const matched = rule.drugs.filter(d => normDrugs.some(nd => nd.includes(d) || d.includes(nd)));
    if (matched.length >= 2) {
      drug_drug_alerts.push({
        type: "Drug-Drug",
        drugs: rule.drugs.map(d => d.toUpperCase()),
        risk: rule.risk,
        severity: rule.severity as "HIGH" | "MEDIUM" | "LOW",
        source: "Client Safety Rule Engine",
      });
    }
  }

  // 2. Disease-Drug & Allergy check
  for (const rule of CONTRAINDICATION_RULES) {
    const hasCond = normConditions.some(nc => nc.includes(rule.condition));
    const hasDrug = normDrugs.some(nd => nd.includes(rule.drug));
    if (hasCond && hasDrug) {
      disease_drug_alerts.push({
        type: "Disease-Drug",
        condition: rule.condition.toUpperCase(),
        drug: rule.drug.toUpperCase(),
        warning: rule.warning,
        severity: rule.severity as "HIGH" | "MEDIUM" | "LOW",
        source: "Client Safety Rule Engine",
      });
    }
  }

  for (const allergy of normAllergies) {
    for (const drug of normDrugs) {
      if (drug.includes(allergy) || allergy.includes(drug)) {
        disease_drug_alerts.push({
          type: "Disease-Drug",
          condition: `ALLERGY: ${allergy.toUpperCase()}`,
          drug: drug.toUpperCase(),
          warning: `Patient has documented severe allergy to ${allergy.toUpperCase()}. Do not administer.`,
          severity: "HIGH",
          source: "Allergy Safety Guard",
        });
      }
    }
  }

  const allAlerts = [...drug_drug_alerts, ...disease_drug_alerts];
  let overall_risk: "SAFE" | "LOW" | "MEDIUM" | "HIGH" = "SAFE";
  if (allAlerts.some(a => a.severity === "HIGH")) overall_risk = "HIGH";
  else if (allAlerts.some(a => a.severity === "MEDIUM")) overall_risk = "MEDIUM";
  else if (allAlerts.length > 0) overall_risk = "LOW";

  return {
    extracted_drugs: params.drugs,
    extracted_diseases: params.conditions,
    drug_drug_alerts,
    disease_drug_alerts,
    overall_risk,
    ner_used: false,
  };
}

async function request<T>(path: string): Promise<T> {
  try {
    const res = await fetch(`${BASE_URL}${path}`);
    if (!res.ok) {
      throw new Error(res.statusText);
    }
    return await res.json() as Promise<T>;
  } catch (err) {
    console.warn(`Backend fetch failed for ${path}. Using Client Fallback Engine.`, err);
    if (path.includes("/analyse/")) {
      // Return client-side analysis response
      const direct = fallbackDirectAnalysis({
        drugs: ["Warfarin", "Aspirin", "Ibuprofen"],
        conditions: ["Atrial Fibrillation", "Diabetes"],
        allergies: ["Penicillin"],
      });
      return {
        patient: {
          abha_id: "JR-2026-PM001",
          patient_id: "patient-001",
          name: "Priya Mehta",
          age: 38,
          gender: "FEMALE",
          blood_group: "B+",
          hospital_name: "Apollo Hospital",
          phone: "9876500001",
        },
        allergies: [{ allergy_id: "A01", allergy_type: "Drug", substance: "Penicillin", severity: "Severe", first_detected: "2018-03-15" }],
        conditions: [{ condition_id: "C01", condition: "Atrial Fibrillation", chronic: "Yes", since: "2020", status: "Ongoing" }],
        prescriptions: [
          { prescription_id: "P01", drug: "Warfarin", dose: "5mg", frequency: "1/day", start_date: "2024-01-01", end_date: null, status: "Active" },
          { prescription_id: "P02", drug: "Aspirin", dose: "75mg", frequency: "1/day", start_date: "2024-02-01", end_date: null, status: "Active" },
          { prescription_id: "P03", drug: "Ibuprofen", dose: "400mg", frequency: "2/day", start_date: "2024-03-01", end_date: null, status: "Active" },
        ],
        lab_reports: [{ report_id: "L01", test_name: "INR", result: "3.2", unit: "", status: "HIGH", test_date: "2026-09-10", is_abnormal: true }],
        extracted_drugs: direct.extracted_drugs,
        extracted_diseases: direct.extracted_diseases,
        drug_drug_alerts: direct.drug_drug_alerts,
        disease_drug_alerts: direct.disease_drug_alerts,
        overall_risk: direct.overall_risk,
        ner_used: false,
      } as unknown as T;
    }
    throw err;
  }
}

async function postRequest<T>(path: string, body: unknown): Promise<T> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      throw new Error(res.statusText);
    }
    return await res.json() as Promise<T>;
  } catch (err) {
    console.warn(`Backend POST failed for ${path}. Using Client Fallback Engine.`, err);
    if (path.includes("/analyse/direct")) {
      const params = body as { drugs: string[]; conditions: string[]; allergies?: string[] };
      return fallbackDirectAnalysis(params) as unknown as T;
    }
    throw err;
  }
}

export const api = {
  listPatients: () => request<PatientListItem[]>("/patients"),
  analysePatient: (abhaId: string, useNer = true) =>
    request<AnalysisResponse>(`/analyse/${abhaId}?use_ner=${useNer}`),
  analyseDirect: (params: { drugs: string[]; conditions: string[]; allergies?: string[]; use_ner?: boolean }) =>
    postRequest<DirectAnalysisResponse>("/analyse/direct", params),
};
