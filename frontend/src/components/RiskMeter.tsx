import type { AnalysisResponse } from "../api/client";

type Risk = AnalysisResponse["overall_risk"];

const RISK_CONFIG: Record<Risk, { color: string; glow: string; score: number; label: string; icon: string }> = {
  SAFE:   { color: "#10b981", glow: "rgba(16,185,129,0.3)",  score: 0,   label: "No Alerts", icon: "✓" },
  LOW:    { color: "#f59e0b", glow: "rgba(245,158,11,0.3)",  score: 33,  label: "Monitor",   icon: "⚠" },
  MEDIUM: { color: "#f97316", glow: "rgba(249,115,22,0.3)",  score: 66,  label: "Caution",   icon: "⚠" },
  HIGH:   { color: "#ef4444", glow: "rgba(239,68,68,0.35)",  score: 100, label: "DANGER",    icon: "✕" },
};

interface RiskMeterProps {
  risk: Risk;
  alertCount: number;
}

export function RiskMeter({ risk, alertCount }: RiskMeterProps) {
  const cfg = RISK_CONFIG[risk];
  const r = 64, cx = 80, cy = 80;
  const circ = 2 * Math.PI * r;
  const progress = (cfg.score / 100) * circ;

  return (
    <div className="risk-meter-container">
      <div className="risk-ring">
        <svg width="160" height="160" viewBox="0 0 160 160">
          {/* track */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2e8f0" strokeWidth="10" />
          {/* progress */}
          <circle
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={cfg.color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${progress} ${circ}`}
            style={{ filter: `drop-shadow(0 0 8px ${cfg.glow})`, transition: "stroke-dasharray 600ms cubic-bezier(.4,0,.2,1)" }}
          />
        </svg>
        <div className="risk-ring-label" style={{ color: cfg.color }}>
          <span style={{ fontSize: 28 }}>{cfg.icon}</span>
          <span style={{ fontSize: 13, fontWeight: 800, marginTop: 2 }}>{risk}</span>
          <span className="risk-ring-sub">{cfg.label}</span>
        </div>
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
          <strong style={{ color: "var(--text-primary)", fontSize: 18 }}>{alertCount}</strong>{" "}
          active alert{alertCount !== 1 ? "s" : ""} detected
        </div>
      </div>
    </div>
  );
}
