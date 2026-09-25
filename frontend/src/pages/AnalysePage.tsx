import { useState, useEffect } from "react";
import {
  Users,
  Cpu,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Pill,
  Heart,
  FlaskConical,
  Activity,
  Sparkles,
  AlertOctagon,
  UserCheck,
  ArrowLeft
} from "lucide-react";
import { api, type AnalysisResponse } from "../api/client";
import { PatientSelector } from "../components/PatientSelector";
import { RiskMeter } from "../components/RiskMeter";
import { AlertCard } from "../components/AlertCard";

interface AnalysePageProps {
  initialAbhaId?: string | null;
  onBackToDoctorPortal?: () => void;
}

export function AnalysePage({ initialAbhaId, onBackToDoctorPortal }: AnalysePageProps) {
  const [selectedId, setSelectedId] = useState<string | null>(initialAbhaId || null);
  const [useNer, setUseNer] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const targetId = initialAbhaId || selectedId || "JR-2026-PM001";
    handleAnalyse(targetId);
  }, [initialAbhaId]);

  async function handleAnalyse(abhaId: string, nerOverride?: boolean) {
    const currentNer = nerOverride !== undefined ? nerOverride : useNer;
    setSelectedId(abhaId);
    setLoading(true);
    setError(null);
    try {
      const data = await api.analysePatient(abhaId, currentNer);
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  const totalAlerts = result
    ? result.drug_drug_alerts.length + result.disease_drug_alerts.length
    : 0;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div className="page-eyebrow" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Activity size={14} style={{ color: "var(--accent)" }} />
            Clinical Decision Support System
          </div>
          <h1 className="page-title">Patient Safety Analysis</h1>
          <p className="page-subtitle">
            Select a patient to execute the JeevanRaksha AI safety pipeline — combining Biomedical NER
            (d4data/biomedical-ner-all) with automated drug–drug interaction and disease contraindication detection.
          </p>
        </div>
        {onBackToDoctorPortal && (
          <button
            onClick={onBackToDoctorPortal}
            className="secondary-btn"
            style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, flexShrink: 0 }}
          >
            <ArrowLeft size={16} /> Back to Doctor Portal
          </button>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 20, alignItems: "start" }}>

        {/* ── Left Sidebar: Patient Selector & AI Settings ─────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card">
            <div className="card-header">
              <div className="card-icon" style={{ background: "#e0f2fe", color: "#0284c7" }}>
                <Users size={18} />
              </div>
              <div>
                <div className="card-title">Patient Directory</div>
                <div className="card-subtitle">Select patient to run safety diagnostic</div>
              </div>
            </div>
            <div className="card-body">
              <PatientSelector onSelect={handleAnalyse} selectedId={selectedId} />
            </div>
          </div>

          {/* AI-NER Toggle Card */}
          <div className="card" style={{ background: useNer ? "#faf5ff" : "#ffffff", borderColor: useNer ? "#e9d5ff" : "var(--border)", transition: "all 0.2s ease" }}>
            <div className="card-body" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: useNer ? "#f3e8ff" : "#f1f5f9",
                  color: useNer ? "#7e22ce" : "#64748b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}>
                  <Cpu size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: 6 }}>
                    Biomedical AI-NER
                    <span style={{ fontSize: 10, background: "#f3e8ff", color: "#6b21a8", padding: "1px 6px", borderRadius: 4, fontWeight: 700 }}>
                      NLP Active
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 2, lineHeight: 1.4 }}>
                    Extract entities using <code>d4data/biomedical-ner-all</code> Transformer model.
                  </div>
                </div>
              </div>

              <label style={{ position: "relative", display: "inline-block", width: 42, height: 24, flexShrink: 0, cursor: "pointer" }}>
                <input
                  id="ner-toggle"
                  type="checkbox"
                  checked={useNer}
                  onChange={(e) => {
                    const nextVal = e.target.checked;
                    setUseNer(nextVal);
                    if (selectedId) {
                      handleAnalyse(selectedId, nextVal);
                    }
                  }}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 999,
                    background: useNer ? "#7e22ce" : "#cbd5e1",
                    transition: "background 200ms ease",
                  }}
                >
                  <span style={{
                    position: "absolute",
                    top: 3,
                    left: useNer ? 21 : 3,
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: "#ffffff",
                    transition: "left 200ms ease",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                  }} />
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* ── Right Content: Diagnostic Results ────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Loading View */}
          {loading && (
            <div className="card">
              <div className="loading-center" style={{ padding: "80px 24px" }}>
                <div className="spinner" />
                <div style={{ textAlign: "center", marginTop: 12 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Analyzing Clinical Profile…</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                    {useNer ? "Running Transformer NER & cross-referencing contraindications" : "Executing cross-reference rules"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error View */}
          {error && (
            <div className="card" style={{ borderColor: "#fecaca", background: "#fef2f2" }}>
              <div className="card-body" style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <AlertOctagon size={20} style={{ color: "#dc2626", flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ color: "#dc2626", fontWeight: 700, fontSize: 14 }}>Diagnostic Execution Failed</div>
                  <div style={{ color: "#7f1d1d", fontSize: 13, marginTop: 2 }}>{error}</div>
                </div>
              </div>
            </div>
          )}

          {/* Initial / Empty Selection View */}
          {!loading && !result && !error && (
            <div className="card">
              <div className="empty-state" style={{ padding: "72px 24px" }}>
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "#e0f2fe",
                  color: "#0284c7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 8
                }}>
                  <UserCheck size={28} />
                </div>
                <div className="empty-state-title" style={{ fontSize: 16 }}>Select a Patient to Analyze</div>
                <div className="empty-state-desc" style={{ fontSize: 13, maxWidth: 360 }}>
                  Choose any patient from the left directory sidebar to trigger the automated clinical safety audit.
                </div>
              </div>
            </div>
          )}

          {/* Diagnostic Results Dashboard */}
          {result && !loading && (
            <>
              {/* Header Info & Overall Risk Meter */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 240px", gap: 16 }}>
                {/* Patient Summary Card */}
                <div className="card">
                  <div className="card-header" style={{ justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div className="card-icon" style={{ background: "#e0f2fe", color: "#0284c7" }}>
                        <UserCheck size={18} />
                      </div>
                      <div>
                        <div className="card-title" style={{ fontSize: 16 }}>{result.patient.name}</div>
                        <div className="card-subtitle" style={{ fontSize: 12 }}>
                          ABHA ID: <strong style={{ color: "#0f172a" }}>{result.patient.abha_id}</strong> · {result.patient.hospital_name}
                        </div>
                      </div>
                    </div>
                    {result.ner_used && (
                      <span className="ner-badge">
                        <Sparkles size={12} /> AI-NER Active
                      </span>
                    )}
                  </div>

                  <div className="card-body">
                    <div className="grid-4" style={{ gap: 12, marginBottom: 16 }}>
                      {[
                        ["Age / Gender", `${result.patient.age}y · ${result.patient.gender}`],
                        ["Blood Group", result.patient.blood_group],
                        ["Patient ID", result.patient.patient_id],
                        ["Hospital", result.patient.hospital_name],
                      ].map(([label, val]) => (
                        <div key={label} style={{ background: "#f8fafc", padding: "8px 12px", borderRadius: 6, border: "1px solid #e2e8f0" }}>
                          <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>{label}</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginTop: 2 }}>{val}</div>
                        </div>
                      ))}
                    </div>

                    {/* Stats bar */}
                    <div className="grid-4" style={{ gap: 10 }}>
                      <div className="stat-card">
                        <div className="stat-label">Allergies</div>
                        <div className="stat-value" style={{ color: result.allergies.length ? "#dc2626" : "#15803d" }}>
                          {result.allergies.length}
                        </div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-label">Conditions</div>
                        <div className="stat-value" style={{ color: "#0f172a" }}>
                          {result.conditions.length}
                        </div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-label">Active Prescriptions</div>
                        <div className="stat-value" style={{ color: "#0284c7" }}>
                          {result.prescriptions.length}
                        </div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-label">Safety Alerts</div>
                        <div className="stat-value" style={{ color: totalAlerts ? "#dc2626" : "#15803d" }}>
                          {totalAlerts}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Overall Risk Score Card */}
                <div className="card" style={{ display: "flex", flexDirection: "column" }}>
                  <div className="card-header">
                    <div className="card-icon" style={{ background: "#fef3c7", color: "#d97706" }}>
                      <ShieldAlert size={18} />
                    </div>
                    <div>
                      <div className="card-title">Overall Risk</div>
                      <div className="card-subtitle">Engine Score</div>
                    </div>
                  </div>
                  <div className="card-body" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <RiskMeter risk={result.overall_risk} alertCount={totalAlerts} />
                  </div>
                </div>
              </div>

              {/* Known Allergies Warning */}
              {result.allergies.length > 0 && (
                <div className="card" style={{ borderColor: "#fecaca", background: "#fff5f5" }}>
                  <div className="card-header" style={{ background: "#fef2f2" }}>
                    <div className="card-icon" style={{ background: "#fee2e2", color: "#dc2626" }}>
                      <AlertTriangle size={18} />
                    </div>
                    <div>
                      <div className="card-title" style={{ color: "#991b1b" }}>Severe Allergies Identified</div>
                      <div className="card-subtitle" style={{ color: "#b91c1c" }}>Contraindicated substance list for clinical reference</div>
                    </div>
                  </div>
                  <div className="card-body" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {result.allergies.map((a) => (
                      <span key={a.allergy_id} className="pill danger" style={{ padding: "4px 10px", fontSize: "12px" }}>
                        ⚠️ {a.substance} ({a.severity} Severity)
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Active Prescriptions Table */}
              <div className="card">
                <div className="card-header" style={{ justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div className="card-icon" style={{ background: "#e0f2fe", color: "#0284c7" }}>
                      <Pill size={18} />
                    </div>
                    <div>
                      <div className="card-title">Active Medications ({result.prescriptions.length})</div>
                      <div className="card-subtitle">
                        NER Extracted: {result.extracted_drugs.length > 0 ? result.extracted_drugs.join(", ") : "None detected"}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card-body table-wrap" style={{ padding: 0 }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Medication</th>
                        <th>Dosage</th>
                        <th>Frequency</th>
                        <th>Start Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.prescriptions.map((rx) => (
                        <tr key={rx.prescription_id}>
                          <td style={{ fontWeight: 700, color: "#0f172a" }}>{rx.drug}</td>
                          <td>{rx.dose}</td>
                          <td>{rx.frequency}</td>
                          <td>{rx.start_date}</td>
                          <td><span className="sev-badge sev-SAFE">{rx.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Medical Conditions */}
              <div className="card">
                <div className="card-header">
                  <div className="card-icon" style={{ background: "#fce7f3", color: "#db2777" }}>
                    <Heart size={18} />
                  </div>
                  <div>
                    <div className="card-title">Diagnosed Conditions</div>
                    <div className="card-subtitle">
                      NER Extracted: {result.extracted_diseases.length > 0 ? result.extracted_diseases.join(", ") : "None detected"}
                    </div>
                  </div>
                </div>
                <div className="card-body" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {result.conditions.map((c) => (
                    <span key={c.condition_id} className={`pill ${c.chronic === "Yes" ? "warn" : ""}`} style={{ padding: "4px 10px", fontSize: "12px" }}>
                      {c.condition}{c.chronic === "Yes" ? " (Chronic)" : ""}
                    </span>
                  ))}
                </div>
              </div>

              {/* Clinical Safety Alerts Section */}
              <div className="card">
                <div className="card-header" style={{ justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div className="card-icon" style={{ background: "#fee2e2", color: "#dc2626" }}>
                      <ShieldAlert size={18} />
                    </div>
                    <div>
                      <div className="card-title">Safety & Interaction Alerts ({totalAlerts})</div>
                      <div className="card-subtitle">
                        {result.drug_drug_alerts.length} Drug–Drug interactions · {result.disease_drug_alerts.length} Disease contraindications
                      </div>
                    </div>
                  </div>
                  <span className={`risk-badge risk-${result.overall_risk}`}>
                    {result.overall_risk} RISK LEVEL
                  </span>
                </div>
                <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {totalAlerts === 0 ? (
                    <div className="empty-state" style={{ padding: "32px 16px" }}>
                      <CheckCircle2 size={36} style={{ color: "#16a34a" }} />
                      <div className="empty-state-title" style={{ fontSize: 15, color: "#16a34a" }}>No Safety Alerts Identified</div>
                      <div className="empty-state-desc" style={{ fontSize: 12 }}>
                        Cross-referencing finished with zero detected drug interactions or disease contraindications for this patient.
                      </div>
                    </div>
                  ) : (
                    [...result.drug_drug_alerts, ...result.disease_drug_alerts]
                      .sort((a, b) => {
                        const s = { HIGH: 3, MEDIUM: 2, LOW: 1 };
                        return (s[b.severity] ?? 0) - (s[a.severity] ?? 0);
                      })
                      .map((alert, i) => (
                        <AlertCard key={i} alert={alert} index={i} />
                      ))
                  )}
                </div>
              </div>

              {/* Lab Reports */}
              {result.lab_reports.length > 0 && (
                <div className="card">
                  <div className="card-header">
                    <div className="card-icon" style={{ background: "#f0fdf4", color: "#16a34a" }}>
                      <FlaskConical size={18} />
                    </div>
                    <div>
                      <div className="card-title">Laboratory Diagnostics</div>
                      <div className="card-subtitle">Recent lab panels and biomarker levels</div>
                    </div>
                  </div>
                  <div className="card-body table-wrap" style={{ padding: 0 }}>
                    <table>
                      <thead>
                        <tr>
                          <th>Test Panel</th>
                          <th>Result Value</th>
                          <th>Unit</th>
                          <th>Date</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.lab_reports.map((lr) => (
                          <tr key={lr.report_id}>
                            <td style={{ fontWeight: 700, color: "#0f172a" }}>{lr.test_name}</td>
                            <td className={lr.is_abnormal ? "highlight" : ""}>{lr.result}</td>
                            <td>{lr.unit}</td>
                            <td>{lr.test_date}</td>
                            <td>
                              <span className={`sev-badge ${lr.is_abnormal ? "sev-HIGH" : "sev-SAFE"}`}>
                                {lr.status || (lr.is_abnormal ? "Abnormal" : "Normal")}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
