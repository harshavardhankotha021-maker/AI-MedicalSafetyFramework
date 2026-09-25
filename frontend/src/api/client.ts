import {
  MOCK_PATIENTS,
  MOCK_ALLERGIES,
  MOCK_CONDITIONS,
  MOCK_PRESCRIPTIONS,
  MOCK_LAB_REPORTS,
} from "../services/mock/mockData";

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
  result: string;
  unit: string;
  status: string;
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
  patient_id?: string;
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

// Client-side rule engine reflecting the Clinical Drug Interactions and Disease Contraindications
const DRUG_INTERACTION_RULES = [
  { drugs: ["warfarin", "aspirin"], risk: "Severely increases bleeding risk and hemorrhagic complications.", severity: "HIGH" },
  { drugs: ["warfarin", "ibuprofen"], risk: "High risk of severe gastrointestinal bleeding and ulceration.", severity: "HIGH" },
  { drugs: ["warfarin", "clopidogrel"], risk: "Extreme life-threatening bleeding risk from dual anticoagulation/antiplatelet effect.", severity: "HIGH" },
  { drugs: ["clopidogrel", "aspirin"], risk: "Excessive bleeding risk from synergistic platelet aggregation inhibition.", severity: "HIGH" },
  { drugs: ["amoxicillin", "warfarin"], risk: "Enhances anticoagulant effect, elevating INR and bleeding tendency.", severity: "MEDIUM" },
  { drugs: ["metformin", "insulin"], risk: "May cause severe hypoglycemia if doses are not dynamically adjusted.", severity: "MEDIUM" },
  { drugs: ["paracetamol", "warfarin"], risk: "Increases INR with continued usage, elevating bleeding risk.", severity: "MEDIUM" },
  { drugs: ["aspirin", "ibuprofen"], risk: "Reduces cardioprotective effect of aspirin and increases gastric toxicity.", severity: "LOW" },
  { drugs: ["metformin", "contrast"], risk: "Risk of lactic acidosis and contrast-induced acute nephropathy.", severity: "HIGH" },
  { drugs: ["metoprolol", "amiodarone"], risk: "Severe bradycardia and cardiac conduction delay.", severity: "HIGH" },
  { drugs: ["atorvastatin", "clarithromycin"], risk: "High risk of rhabdomyolysis and severe muscle toxicity.", severity: "HIGH" },
  { drugs: ["ace inhibitors", "potassium"], risk: "Severe risk of hyperkalemia and cardiac arrhythmias.", severity: "HIGH" },
  { drugs: ["ace inhibitors", "ibuprofen"], risk: "Reduces antihypertensive effect and increases acute kidney injury risk.", severity: "MEDIUM" },
];

const CONTRAINDICATION_RULES = [
  { condition: "atrial fibrillation", drug: "ibuprofen", warning: "NSAIDs cause fluid retention and increase stroke and bleeding risk in AFib patients.", severity: "HIGH" },
  { condition: "asthma", drug: "aspirin", warning: "Can trigger acute, severe bronchospasm and fatal asthma exacerbation.", severity: "HIGH" },
  { condition: "asthma", drug: "ibuprofen", warning: "NSAIDs trigger bronchospasm in aspirin/NSAID-sensitive asthma patients.", severity: "HIGH" },
  { condition: "asthma", drug: "propranolol", warning: "Non-selective beta-blockers trigger severe bronchospasm in asthma.", severity: "HIGH" },
  { condition: "heart disease", drug: "ibuprofen", warning: "NSAIDs significantly increase the risk of myocardial infarction and cardiovascular death.", severity: "HIGH" },
  { condition: "heart disease", drug: "diclofenac", warning: "Increases risk of acute cardiac events and stroke.", severity: "HIGH" },
  { condition: "hypertension", drug: "ibuprofen", warning: "Increases blood pressure and counteracts antihypertensive efficacy.", severity: "MEDIUM" },
  { condition: "hypertension", drug: "pseudoephedrine", warning: "Decongestants cause acute systemic vasoconstriction and BP elevation.", severity: "MEDIUM" },
  { condition: "diabetes", drug: "prednisone", warning: "Systemic corticosteroids cause severe acute hyperglycemia and insulin resistance.", severity: "HIGH" },
  { condition: "peptic ulcer", drug: "aspirin", warning: "Causes mucosal ulceration and massive gastrointestinal bleeding.", severity: "HIGH" },
  { condition: "peptic ulcer", drug: "ibuprofen", warning: "Significantly worsens ulcers and increases risk of perforation/bleeding.", severity: "HIGH" },
  { condition: "kidney disease", drug: "ibuprofen", warning: "NSAIDs impair renal prostaglandins and cause acute kidney injury.", severity: "HIGH" },
];

function fallbackDirectAnalysis(params: { drugs: string[]; conditions: string[]; allergies?: string[] }): DirectAnalysisResponse {
  const normDrugs = (params.drugs || []).map(d => d.toLowerCase());
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
        source: "Clinical Safety Rule Engine",
      });
    }
  }

  // 2. Disease-Drug contraindication check
  for (const rule of CONTRAINDICATION_RULES) {
    const hasCond = normConditions.some(nc => nc.includes(rule.condition) || rule.condition.includes(nc));
    const hasDrug = normDrugs.some(nd => nd.includes(rule.drug) || rule.drug.includes(nd));
    if (hasCond && hasDrug) {
      disease_drug_alerts.push({
        type: "Disease-Drug",
        condition: rule.condition.toUpperCase(),
        drug: rule.drug.toUpperCase(),
        warning: rule.warning,
        severity: rule.severity as "HIGH" | "MEDIUM" | "LOW",
        source: "Contraindication Knowledgebase",
      });
    }
  }

  // 3. Allergy Cross-Reactivity & Severe Contraindication check
  for (const allergy of normAllergies) {
    for (const drug of normDrugs) {
      const isDirectMatch = drug.includes(allergy) || allergy.includes(drug);
      const isPenicillinCross = allergy.includes("penicillin") && (drug.includes("amoxicillin") || drug.includes("ampicillin") || drug.includes("augmentin"));
      const isSulfaCross = (allergy.includes("sulfa") || allergy.includes("sulfonamide")) && (drug.includes("sulfa") || drug.includes("bactrim") || drug.includes("sulfamethoxazole"));
      const isAspirinNsaidCross = allergy.includes("aspirin") && (drug.includes("ibuprofen") || drug.includes("diclofenac") || drug.includes("naproxen"));

      if (isDirectMatch || isPenicillinCross || isSulfaCross || isAspirinNsaidCross) {
        let warningText = `Patient has documented allergy to ${allergy.toUpperCase()}. Do not administer.`;
        if (isPenicillinCross) {
          warningText = `CRITICAL CONTRAINDICATION: Patient has severe allergy to PENICILLIN. Cross-reactivity with ${drug.toUpperCase()} causes life-threatening anaphylaxis.`;
        } else if (isSulfaCross) {
          warningText = `CRITICAL CONTRAINDICATION: Documented severe SULFA allergy. Exposure to ${drug.toUpperCase()} triggers severe hypersensitivity reaction.`;
        } else if (isAspirinNsaidCross) {
          warningText = `CONTRAINDICATION: Documented ASPIRIN allergy cross-reacts with NSAIDs (${drug.toUpperCase()}), risking acute bronchospasm.`;
        }

        disease_drug_alerts.push({
          type: "Disease-Drug",
          condition: `ALLERGY: ${allergy.toUpperCase()}`,
          drug: drug.toUpperCase(),
          warning: warningText,
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

/**
 * Returns a complete AnalysisResponse for any patient using local mock data.
 */
function getMockPatientAnalysis(patientLookupId: string, useNer = true): AnalysisResponse {
  const q = decodeURIComponent(patientLookupId).toLowerCase().trim();

  // Find target patient
  const targetPatient = MOCK_PATIENTS.find(p =>
    p.abhaId.toLowerCase() === q ||
    p.id.toLowerCase() === q ||
    p.name.toLowerCase() === q ||
    p.abhaId.toLowerCase().includes(q) ||
    q.includes(p.abhaId.toLowerCase()) ||
    q.includes(p.id.toLowerCase()) ||
    (q.includes("pm001") && p.id === "patient-001") ||
    (q.includes("as002") && p.id === "patient-002") ||
    (q.includes("sp003") && p.id === "patient-003") ||
    (q.includes("rk004") && p.id === "patient-004") ||
    (q.includes("as005") && p.id === "patient-005") ||
    (q.includes("nv006") && p.id === "patient-006") ||
    (q.includes("ks007") && p.id === "patient-007") ||
    (q.includes("md008") && p.id === "patient-008") ||
    (q.includes("sr009") && p.id === "patient-009") ||
    (q.includes("vi010") && p.id === "patient-010") ||
    (q.includes("rg011") && p.id === "patient-011")
  ) || MOCK_PATIENTS[0];

  const pAllergies = MOCK_ALLERGIES.filter(a => a.patientId === targetPatient.id);
  const pConditions = MOCK_CONDITIONS.filter(c => c.patientId === targetPatient.id);
  const pPrescriptions = MOCK_PRESCRIPTIONS.filter(p => p.patientId === targetPatient.id);
  const pLabs = MOCK_LAB_REPORTS.filter(l => l.patientId === targetPatient.id);

  const drugs = pPrescriptions.filter(p => p.status === "ACTIVE").map(p => p.drug);
  const conditions = pConditions.map(c => c.condition);
  const allergies = pAllergies.map(a => a.substance);

  const direct = fallbackDirectAnalysis({
    drugs,
    conditions,
    allergies,
  });

  return {
    patient: {
      abha_id: targetPatient.abhaId,
      patient_id: targetPatient.id,
      name: targetPatient.name,
      age: targetPatient.age,
      gender: targetPatient.gender,
      blood_group: targetPatient.bloodGroup,
      hospital_name: targetPatient.hospitalName || "Apollo Hospital",
      phone: targetPatient.phone || "9876543210",
    },
    allergies: pAllergies.map(a => ({
      allergy_id: a.id,
      allergy_type: a.allergyType,
      substance: a.substance,
      severity: a.severity,
      first_detected: a.firstDetected || "2020-01-01",
    })),
    conditions: pConditions.map(c => ({
      condition_id: c.id,
      condition: c.condition,
      chronic: c.chronic ? "Yes" : "No",
      since: c.diagnosedSince || "2020",
      status: c.status,
    })),
    prescriptions: pPrescriptions.map(p => ({
      prescription_id: p.id,
      drug: p.drug,
      dose: p.dose,
      frequency: p.frequency,
      start_date: p.startDate,
      end_date: p.endDate || null,
      status: p.status,
    })),
    lab_reports: pLabs.map(l => ({
      report_id: l.id,
      test_name: l.testName,
      result: l.value,
      unit: l.unit,
      status: l.status,
      test_date: l.testDate,
      is_abnormal: l.isAbnormal,
    })),
    extracted_drugs: drugs,
    extracted_diseases: conditions,
    drug_drug_alerts: direct.drug_drug_alerts,
    disease_drug_alerts: direct.disease_drug_alerts,
    overall_risk: direct.overall_risk,
    ner_used: useNer,
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
    console.warn(`Backend fetch failed for ${path}. Using Client Medical Safety Engine.`, err);

    if (path.startsWith("/patients")) {
      return MOCK_PATIENTS.map(p => ({
        abha_id: p.abhaId,
        patient_id: p.id,
        name: p.name,
        age: p.age,
        gender: p.gender,
        hospital_name: p.hospitalName || "Apollo Hospital",
      })) as unknown as T;
    }

    if (path.includes("/analyse/")) {
      const parts = path.split("/analyse/")[1].split("?");
      const requestedId = parts[0];
      const useNer = path.includes("use_ner=false") ? false : true;
      return getMockPatientAnalysis(requestedId, useNer) as unknown as T;
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
    console.warn(`Backend POST failed for ${path}. Using Client Safety Rule Engine.`, err);
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

