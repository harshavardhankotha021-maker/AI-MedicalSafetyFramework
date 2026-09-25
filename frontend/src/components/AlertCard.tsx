import type { Alert } from "../api/client";

interface AlertCardProps {
  alert: Alert;
  index: number;
}

const SEV_COLOR: Record<string, string> = {
  HIGH: "var(--high)",
  MEDIUM: "var(--medium)",
  LOW: "var(--low)",
};

export function AlertCard({ alert, index }: AlertCardProps) {
  const color = SEV_COLOR[alert.severity] ?? "var(--text-secondary)";

  return (
    <div
      className={`alert-card ${alert.severity}`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="alert-card-header">
        <div>
          {alert.type === "Drug-Drug" ? (
            <div className="alert-card-drugs">
              💊 {alert.drugs.join(" ↔ ")}
            </div>
          ) : (
            <div className="alert-card-drugs">
              🫀 {alert.condition} + {alert.drug}
            </div>
          )}
          <div className="alert-card-type">{alert.type === "Drug-Drug" ? "Drug Interaction" : "Contraindication"}</div>
        </div>
        <span className={`sev-badge sev-${alert.severity}`}>{alert.severity}</span>
      </div>

      <div className="alert-card-risk" style={{ borderLeft: `2px solid ${color}`, paddingLeft: 10 }}>
        {alert.type === "Drug-Drug" ? alert.risk : alert.warning}
      </div>

      <div className="alert-card-source">📁 Source: {alert.source}</div>
    </div>
  );
}
