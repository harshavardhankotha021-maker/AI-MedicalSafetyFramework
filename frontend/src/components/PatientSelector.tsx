import { useState, useEffect } from "react";
import { Search, User, ChevronRight, Hospital, AlertCircle, X } from "lucide-react";
import { api, type PatientListItem } from "../api/client";

interface PatientSelectorProps {
  onSelect: (abhaId: string) => void;
  selectedId: string | null;
}

export function PatientSelector({ onSelect, selectedId }: PatientSelectorProps) {
  const [patients, setPatients] = useState<PatientListItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.listPatients()
      .then(setPatients)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.abha_id.toLowerCase().includes(search.toLowerCase()) ||
      p.hospital_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Search Input */}
      <div className="search-wrap" style={{ position: "relative" }}>
        <Search size={16} className="search-icon" style={{ color: "#64748b" }} />
        <input
          id="patient-search"
          type="text"
          className="search-input"
          placeholder="Search by name, ABHA ID, or hospital…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 32px 10px 36px",
            fontSize: "13px",
            borderRadius: "8px",
            border: "1px solid #cbd5e1",
            background: "#ffffff",
            color: "#0f172a",
            outline: "none",
            transition: "all 0.15s ease",
          }}
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            style={{
              position: "absolute",
              right: 10,
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="loading-center" style={{ padding: "32px 16px" }}>
          <div className="spinner" />
          <span style={{ fontSize: "13px", color: "#64748b", marginTop: 8 }}>Loading patient directory…</span>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div style={{ padding: "14px", background: "#fef2f2", borderRadius: "8px", border: "1px solid #fecaca", color: "#dc2626", fontSize: "12px", display: "flex", gap: "8px", alignItems: "flex-start" }}>
          <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <div style={{ fontWeight: 600 }}>Backend Connection Error</div>
            <div style={{ color: "#7f1d1d", marginTop: 2 }}>{error}</div>
            <div style={{ color: "#991b1b", fontSize: "11px", marginTop: 4 }}>
              Ensure FastAPI backend server is active on <code>http://localhost:8000</code>.
            </div>
          </div>
        </div>
      )}

      {/* Patient List */}
      {!loading && !error && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: "460px", overflowY: "auto", paddingRight: 2 }}>
          {filtered.length === 0 ? (
            <div className="empty-state" style={{ padding: "28px 16px", background: "#f8fafc", borderRadius: "8px", border: "1px dashed #cbd5e1" }}>
              <User size={28} style={{ color: "#94a3b8" }} />
              <div className="empty-state-title" style={{ fontSize: "13px", marginTop: 4 }}>No patients match search</div>
              <div className="empty-state-desc" style={{ fontSize: "11px" }}>Try searching by name (e.g. "Ravi"), ABHA ID, or hospital.</div>
            </div>
          ) : (
            filtered.map((p) => {
              const isSelected = selectedId === p.abha_id;
              const initials = p.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();

              return (
                <div
                  key={p.abha_id}
                  className={`patient-row ${isSelected ? "selected" : ""}`}
                  onClick={() => onSelect(p.abha_id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && onSelect(p.abha_id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 14px",
                    borderRadius: "10px",
                    background: isSelected ? "#f0f9ff" : "#ffffff",
                    border: isSelected ? "1.5px solid #0284c7" : "1px solid #e2e8f0",
                    boxShadow: isSelected ? "0 2px 6px rgba(2, 132, 199, 0.12)" : "0 1px 2px rgba(0, 0, 0, 0.03)",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: isSelected ? "#0284c7" : "#e0f2fe",
                      color: isSelected ? "#ffffff" : "#0369a1",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "12px",
                      flexShrink: 0
                    }}>
                      {initials}
                    </div>

                    <div>
                      <div className="patient-name" style={{ fontSize: "13.5px", fontWeight: 700, color: isSelected ? "#0369a1" : "#0f172a" }}>
                        {p.name}
                      </div>
                      <div className="patient-meta" style={{ fontSize: "11px", color: "#64748b", display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                        <span style={{ fontWeight: 600, color: "#334155" }}>{p.abha_id}</span>
                        <span>•</span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                          <Hospital size={11} style={{ color: "#94a3b8" }} />
                          {p.hospital_name}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <span className={`pill ${p.gender.toLowerCase() === "female" ? "female" : ""}`} style={{ fontSize: "10px", padding: "2px 7px", fontWeight: 600 }}>
                      {p.gender}
                    </span>
                    <span className="pill" style={{ background: "#f1f5f9", color: "#475569", borderColor: "#cbd5e1", fontSize: "10px", padding: "2px 7px" }}>
                      {p.age}y
                    </span>
                    <ChevronRight size={14} style={{ color: isSelected ? "#0284c7" : "#cbd5e1", marginLeft: 2 }} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {!loading && !error && (
        <div style={{ fontSize: "11px", color: "#94a3b8", textAlign: "right", paddingRight: 4 }}>
          Showing {filtered.length} of {patients.length} patient records
        </div>
      )}
    </div>
  );
}
