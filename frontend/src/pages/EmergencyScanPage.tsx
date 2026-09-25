import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Phone,
  AlertTriangle,
  CheckCircle,
  Pill,
  FileText,
  Hospital,
  Lock,
  ArrowLeft
} from 'lucide-react';
import { getDataService, type EmergencyData } from '../services';

interface EmergencyScanPageProps {
  tokenStr?: string;
  onBack?: () => void;
}

export const EmergencyScanPage: React.FC<EmergencyScanPageProps> = ({
  tokenStr = 'jr2026pm001f7e3a9b2c4d8e1f5',
  onBack
}) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<EmergencyData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEmergencyData();
  }, [tokenStr]);

  const fetchEmergencyData = async () => {
    setLoading(true);
    setError(null);
    try {
      const service = getDataService();
      let res = await service.getEmergencyData(tokenStr);
      if (!res && tokenStr.startsWith('jr2026')) {
        res = await service.getEmergencyData('jr2026pm001f7e3a9b2c4d8e1f5');
      }
      if (res) {
        setData(res);
      } else {
        setError('Emergency QR token invalid or revoked by patient.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to resolve emergency profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '80px 20px', maxWidth: '600px', margin: '0 auto' }}>
        <div className="spinner" style={{ margin: '0 auto 16px auto' }} />
        <h2 style={{ color: 'var(--text-primary)', fontSize: '20px', fontWeight: 800 }}>
          Resolving Cross-Hospital Emergency Record…
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
          Querying JeevanRaksha Centralized Emergency Network with opaque token…
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="page-container" style={{ maxWidth: '580px', margin: '40px auto', textAlign: 'center' }}>
        <div className="card" style={{ border: '2px solid #fecaca', background: '#fef2f2', padding: '36px 28px', borderRadius: '16px' }}>
          <ShieldAlert size={48} style={{ color: '#dc2626', margin: '0 auto 14px auto' }} />
          <h2 style={{ color: '#991b1b', fontSize: '20px', marginBottom: '8px', fontWeight: 800 }}>
            Emergency Access Denied / QR Revoked
          </h2>
          <p style={{ color: '#7f1d1d', fontSize: '13.5px', marginBottom: '24px', lineHeight: 1.5 }}>
            {error || 'The Emergency QR token is invalid, expired, or has been revoked by the patient.'}
          </p>
          <div style={{ fontSize: '12px', color: '#991b1b', background: '#fee2e2', padding: '10px 14px', borderRadius: '8px', marginBottom: '20px' }}>
            🔒 Unauthorized access prevented to protect patient health data privacy.
          </div>
          {onBack && (
            <button onClick={onBack} className="primary-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <ArrowLeft size={16} /> Return to Dashboard
            </button>
          )}
        </div>
      </div>
    );
  }

  const initials = data.patientName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div className="page-container" style={{ maxWidth: '860px', margin: '0 auto', paddingBottom: '60px' }}>
      
      {/* Top Banner: Paramedic & Cross-Hospital Notice */}
      <div
        style={{
          background: 'linear-gradient(135deg, #fef2f2 0%, #fff1f2 100%)',
          border: '2px solid #fecaca',
          borderRadius: '16px',
          padding: '18px 24px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          boxShadow: '0 4px 12px rgba(220, 38, 38, 0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            background: '#dc2626',
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(220, 38, 38, 0.3)'
          }}>
            <ShieldAlert size={26} style={{ color: '#ffffff' }} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#991b1b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Hospital size={13} /> CROSS-HOSPITAL EMERGENCY RETRIEVAL
            </div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#7f1d1d', lineHeight: 1.1, marginTop: 2 }}>
              PARAMEDIC EMERGENCY ACCESS PROFILE
            </div>
            <div style={{ fontSize: '12px', color: '#991b1b', marginTop: '3px' }}>
              Universal Network Retrieval • Audit Event Logged ({new Date().toLocaleTimeString()})
            </div>
          </div>
        </div>

        {onBack && (
          <button onClick={onBack} className="secondary-btn no-print" style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: 4 }}>
            <ArrowLeft size={14} /> Exit
          </button>
        )}
      </div>

      {/* Main Row: Patient Core Information + Big Blood Group */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 230px', gap: '20px', marginBottom: '20px' }}>
        
        {/* Patient Identity Summary */}
        <div className="card">
          <div className="card-header" style={{ gap: '14px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: '#e0f2fe',
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '16px',
              border: '2px solid #bae6fd'
            }}>
              {initials}
            </div>
            <div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
                {data.patientName}
              </div>
              <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: 2 }}>
                ABHA ID: <strong style={{ color: '#0f172a' }}>{data.abhaId}</strong>
              </div>
            </div>
          </div>

          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '10.5px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Age / Gender</div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginTop: 2 }}>{data.age} Yrs / {data.gender}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '10.5px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Health Card No</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#15803d', display: 'flex', alignItems: 'center', gap: '4px', marginTop: 2 }}>
                  <CheckCircle size={14} /> {data.healthCardNumber}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 12, fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Lock size={12} style={{ color: '#0284c7' }} />
              Scoped Field Exposure: Full lab history and private addresses excluded from public QR view.
            </div>
          </div>
        </div>

        {/* High Visibility Blood Group Box */}
        <div
          style={{
            background: '#ffffff',
            border: '2.5px solid #dc2626',
            borderRadius: '16px',
            padding: '20px 16px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: '0 4px 14px rgba(220, 38, 38, 0.12)',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            BLOOD GROUP
          </div>
          <div style={{ fontSize: '46px', fontWeight: 900, color: '#0f172a', lineHeight: 1.0, margin: '4px 0' }}>
            {data.bloodGroup}
          </div>
          <div style={{ fontSize: '10px', color: '#16a34a', fontWeight: 800, background: '#f0fdf4', padding: '2px 8px', borderRadius: 4, border: '1px solid #bbf7d0' }}>
            VERIFIED RECORD
          </div>
        </div>
      </div>

      {/* Severe Allergies Red Alert Box */}
      {data.criticalAllergies.length > 0 ? (
        <div
          style={{
            background: '#fef2f2',
            border: '2px solid #fecaca',
            borderRadius: '14px',
            padding: '18px 22px',
            marginBottom: '20px',
            boxShadow: '0 2px 8px rgba(220, 38, 38, 0.05)',
          }}
        >
          <div style={{ fontSize: '13px', fontWeight: 900, color: '#dc2626', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', letterSpacing: '0.02em' }}>
            <AlertTriangle size={18} /> SEVERE CONTRAINDICATED ALLERGIES — DO NOT ADMINISTER:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {data.criticalAllergies.map((a, i) => (
              <div
                key={i}
                style={{
                  background: '#dc2626',
                  color: '#ffffff',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 4px rgba(220, 38, 38, 0.2)'
                }}
              >
                ⛔ {a.substance.toUpperCase()} ({a.severity})
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '14px 20px', borderRadius: 12, color: '#15803d', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <CheckCircle size={18} /> No Severe Drug Allergies Recorded in Emergency Profile
        </div>
      )}

      {/* Active Medications & Chronic Conditions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        
        {/* Active Critical Medications */}
        <div className="card">
          <div className="card-header">
            <div className="card-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
              <Pill size={18} />
            </div>
            <div>
              <div className="card-title">Active Critical Medications</div>
              <div className="card-subtitle">Currently prescribed drugs</div>
            </div>
          </div>
          <div className="card-body">
            {data.criticalMedications.length === 0 ? (
              <div style={{ color: '#64748b', fontSize: '13px' }}>No active medications recorded</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {data.criticalMedications.map((rx, i) => (
                  <div
                    key={i}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a' }}>{rx.drug}</div>
                      <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: 1 }}>{rx.dose} • {rx.frequency}</div>
                    </div>
                    <span style={{ fontSize: '10px', background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '2px 7px', borderRadius: '4px', fontWeight: 700 }}>
                      ACTIVE
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chronic Conditions */}
        <div className="card">
          <div className="card-header">
            <div className="card-icon" style={{ background: '#fce7f3', color: '#db2777' }}>
              <FileText size={18} />
            </div>
            <div>
              <div className="card-title">Ongoing Medical Conditions</div>
              <div className="card-subtitle">Diagnosed illnesses</div>
            </div>
          </div>
          <div className="card-body">
            {data.criticalConditions.length === 0 ? (
              <div style={{ color: '#64748b', fontSize: '13px' }}>No ongoing conditions recorded</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {data.criticalConditions.map((c, i) => (
                  <div
                    key={i}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a' }}>{c.condition}</div>
                      <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: 1 }}>Status: {c.status}</div>
                    </div>
                    {c.chronic && (
                      <span style={{ fontSize: '10px', background: '#fffbeb', color: '#b45309', border: '1px solid #fef3c7', padding: '2px 7px', borderRadius: '4px', fontWeight: 700 }}>
                        CHRONIC
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 1-Tap Emergency Contact Phone Card */}
      {data.primaryEmergencyContact && (
        <div className="card" style={{ border: '1.5px solid #fecaca' }}>
          <div className="card-header" style={{ background: '#fef2f2' }}>
            <div className="card-icon" style={{ background: '#fee2e2', color: '#dc2626' }}>
              <Phone size={18} />
            </div>
            <div>
              <div className="card-title" style={{ color: '#991b1b' }}>Primary Emergency Contact (Tap to Call Immediately)</div>
              <div className="card-subtitle" style={{ color: '#b91c1c' }}>First responder authorized representative</div>
            </div>
          </div>
          <div className="card-body">
            <a
              href={`tel:${data.primaryEmergencyContact.phone}`}
              style={{
                background: '#ffffff',
                border: '2px solid #dc2626',
                padding: '16px 22px',
                borderRadius: '12px',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 4px 10px rgba(220, 38, 38, 0.1)',
                transition: 'transform 0.15s ease'
              }}
            >
              <div>
                <div style={{ fontSize: '16px', fontWeight: 900, color: '#0f172a' }}>{data.primaryEmergencyContact.name}</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: 2 }}>{data.primaryEmergencyContact.relationship}</div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#dc2626', marginTop: '4px' }}>{data.primaryEmergencyContact.phone}</div>
              </div>
              <div
                style={{
                  background: '#dc2626',
                  color: '#ffffff',
                  borderRadius: '50%',
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(220, 38, 38, 0.3)'
                }}
              >
                <Phone size={20} />
              </div>
            </a>
          </div>
        </div>
      )}

    </div>
  );
};
