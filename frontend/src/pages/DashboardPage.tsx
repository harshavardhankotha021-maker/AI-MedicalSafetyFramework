export function DashboardPage() {
  const stats = [
    { label: "Patients Monitored", value: "11", sub: "Across 6 hospitals", icon: "👤", color: "var(--accent)" },
    { label: "Drug Interactions", value: "8", sub: "Rules in knowledge base", icon: "💊", color: "var(--medium)" },
    { label: "Contraindications", value: "12", sub: "Disease-drug rules", icon: "⚠", color: "var(--low)" },
    { label: "Model Accuracy", value: "~97%", sub: "NER confidence avg", icon: "🧠", color: "var(--safe)" },
  ];

  const pipeline = [
    { step: "01", title: "Load Patient Data", desc: "CSV files: patients, allergies, conditions, prescriptions, labs", icon: "📂" },
    { step: "02", title: "Medical Text Construction", desc: "Converts structured CSV into natural language for the NER model", icon: "📝" },
    { step: "03", title: "AI-NER Extraction", desc: "d4data/biomedical-ner-all extracts drugs (Chemical) and diseases", icon: "🧠" },
    { step: "04", title: "Drug–Drug Interaction Check", desc: "O(n²) pair checking against drug_interactions.csv knowledge base", icon: "💊" },
    { step: "05", title: "Disease–Drug Contraindication", desc: "O(m×n) cross-check against disease_contra.csv rules", icon: "🫀" },
    { step: "06", title: "Risk Aggregation & Report", desc: "Severity scoring (LOW→MEDIUM→HIGH) + clinical summary generation", icon: "📋" },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-eyebrow">JeevanRaksha AI</div>
        <h1 className="page-title">Clinical Decision Support System</h1>
        <p className="page-subtitle">
          Hybrid AI-NER + Rule-Based Medical Safety Engine.{" "}
          <strong style={{ color: "var(--text-primary)" }}>
            AI understands language. Rules ensure safety.
          </strong>
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div style={{ fontSize: 26, marginBottom: 8 }}>{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Architecture banner */}
      <div className="card" style={{ marginBottom: 24, background: "linear-gradient(135deg, rgba(79,142,247,0.08) 0%, rgba(124,58,237,0.06) 100%)", borderColor: "var(--border-bright)" }}>
        <div className="card-body">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Core Principle</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", marginTop: 4 }}>
                "AI understands language. Rules ensure safety."
              </div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 6 }}>
                The system <strong>never</strong> allows AI to make medical decisions. All safety determinations come from verified CSV rules maintained by medical professionals.
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
              <div style={{ textAlign: "center", padding: "14px 20px", background: "var(--accent-subtle)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-bright)" }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: "var(--accent)" }}>10%</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>AI (NER)</div>
              </div>
              <div style={{ textAlign: "center", padding: "14px 20px", background: "rgba(16,185,129,0.08)", borderRadius: "var(--radius-md)", border: "1px solid rgba(16,185,129,0.2)" }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: "var(--safe)" }}>90%</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>Rules</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline steps */}
      <div className="card">
        <div className="card-header">
          <div className="card-icon">⚙️</div>
          <div>
            <div className="card-title">System Pipeline</div>
            <div className="card-subtitle">How JeevanRaksha analyses a patient</div>
          </div>
        </div>
        <div className="card-body">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {pipeline.map((s, i) => (
              <div
                key={s.step}
                style={{
                  display: "flex", alignItems: "flex-start", gap: 14,
                  padding: "14px 16px", borderRadius: "var(--radius-md)",
                  background: "var(--bg-surface)", border: "1px solid var(--border)",
                  animation: `fadeSlideIn 300ms ${i * 60}ms both ease`,
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                  background: "var(--accent-subtle)", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18,
                }}>
                  {s.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--accent)", fontWeight: 600 }}>STEP {s.step}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{s.title}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 3, lineHeight: 1.5 }}>{s.desc}</div>
                </div>
                {i < pipeline.length - 1 && (
                  <div style={{ alignSelf: "center", color: "var(--text-muted)", fontSize: 18 }}>→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Knowledge base */}
      <div className="grid-2" style={{ marginTop: 20 }}>
        <div className="card">
          <div className="card-header">
            <div className="card-icon">💊</div>
            <div>
              <div className="card-title">Drug Interaction Rules</div>
              <div className="card-subtitle">drug_interactions.csv</div>
            </div>
          </div>
          <div className="card-body">
            {[
              ["Warfarin + Aspirin", "Severely increases bleeding risk", "HIGH"],
              ["Warfarin + Ibuprofen", "GI bleeding risk", "HIGH"],
              ["Aspirin + Clopidogrel", "Excessive bleeding", "HIGH"],
              ["Aspirin + Ibuprofen", "Reduces cardioprotective effect", "LOW"],
            ].map(([pair, risk, sev]) => (
              <div key={pair} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>{pair}</div>
                  <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{risk}</div>
                </div>
                <span className={`sev-badge sev-${sev}`}>{sev}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-icon">🫀</div>
            <div>
              <div className="card-title">Contraindication Rules</div>
              <div className="card-subtitle">disease_contra.csv</div>
            </div>
          </div>
          <div className="card-body">
            {[
              ["Heart Disease + Ibuprofen", "↑ heart attack & stroke risk", "HIGH"],
              ["Asthma + Aspirin", "Triggers severe asthma attacks", "HIGH"],
              ["Hypertension + Ibuprofen", "Increases blood pressure", "MEDIUM"],
              ["Diabetes + Aspirin", "Affects blood sugar regulation", "MEDIUM"],
            ].map(([pair, warn, sev]) => (
              <div key={pair} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>{pair}</div>
                  <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{warn}</div>
                </div>
                <span className={`sev-badge sev-${sev}`}>{sev}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
