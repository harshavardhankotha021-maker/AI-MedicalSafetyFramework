/**
 * JeevanRaksha – SafetyService
 *
 * Always calls the FastAPI backend regardless of data mode.
 * Components never call the FastAPI backend directly —
 * they go through SafetyService.analysePatient().
 *
 * Data labels enforced by this service:
 *   VERIFIED MEDICAL DATA       → from DataService (Mock or Firebase)
 *   RULE-BASED SAFETY ALERTS    → from /analyse/direct rule checks
 *   AI-GENERATED (NER)          → flagged via nerUsed = true
 */

import type { DataService } from './DataService';
import type { SafetyAnalysisRequest, SafetyAnalysisResult } from './types';

const API_BASE = '/api';

export const SafetyService = {
  /**
   * Run the safety pipeline on provided lists.
   * Calls POST /analyse/direct on the FastAPI backend.
   */
  async analyseFromLists(req: SafetyAnalysisRequest): Promise<SafetyAnalysisResult> {
    const response = await fetch(`${API_BASE}/analyse/direct`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        drugs:      req.drugs,
        conditions: req.conditions,
        allergies:  req.allergies ?? [],
        use_ner:    req.useNer ?? true,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(err.detail ?? 'Safety analysis request failed');
    }

    const data = await response.json();
    return {
      extractedDrugs:    data.extracted_drugs,
      extractedDiseases: data.extracted_diseases,
      drugDrugAlerts:    data.drug_drug_alerts,
      diseaseDrugAlerts: data.disease_drug_alerts,
      overallRisk:       data.overall_risk,
      nerUsed:           data.ner_used,
    };
  },

  /**
   * Convenience: fetch a patient's active prescriptions, conditions, and
   * allergies from the data service, then run safety analysis.
   */
  async analysePatient(
    patientId: string,
    dataService: DataService,
    useNer = true,
  ): Promise<SafetyAnalysisResult> {
    const [prescriptions, conditions, allergies] = await Promise.all([
      dataService.getPrescriptions(patientId, true),
      dataService.getConditions(patientId),
      dataService.getAllergies(patientId),
    ]);

    return SafetyService.analyseFromLists({
      drugs:      prescriptions.map(p => p.drug),
      conditions: conditions.map(c => c.condition),
      allergies:  allergies.map(a => a.substance),
      useNer,
    });
  },

  /** Check if the FastAPI backend is reachable. */
  async ping(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/health`);
      return res.ok;
    } catch {
      return false;
    }
  },
};
