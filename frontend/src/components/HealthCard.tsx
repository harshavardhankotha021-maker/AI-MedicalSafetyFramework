import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Shield,
  Printer,
  RefreshCw,
  Phone,
  AlertTriangle,
  CheckCircle2,
  Heart,
  Pill,
  Copy,
  Check
} from 'lucide-react';
import {
  getDataService,
  type Patient,
  type Allergy,
  type Condition,
  type Prescription,
  type EmergencyContact,
  type QRToken,
  type HealthCard as HealthCardType
} from '../services';

interface HealthCardProps {
  patient: Patient;
  onRefresh?: () => void;
}

export const HealthCard: React.FC<HealthCardProps> = ({ patient, onRefresh }) => {
  const [qrToken, setQrToken] = useState<QRToken | null>(null);
  const [healthCard, setHealthCard] = useState<HealthCardType | null>(null);
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadCardData();
  }, [patient.id]);

  const loadCardData = async () => {
    setLoading(true);
    try {
      const service = getDataService();
      const [token, card, algs, cnds, rxs, cnts] = await Promise.all([
        service.getActiveQRToken(patient.id),
        service.getHealthCard(patient.id),
        service.getAllergies(patient.id),
        service.getConditions(patient.id),
        service.getPrescriptions(patient.id, true),
        service.getEmergencyContacts(patient.id),
      ]);
      setQrToken(token);
      setHealthCard(card);
      setAllergies(algs);
      setConditions(cnds);
      setPrescriptions(rxs);
      setContacts(cnts);
    } catch (err) {
      console.error('Error loading health card data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateToken = async () => {
    setRegenerating(true);
    try {
      const service = getDataService();
      const newToken = await service.generateQRToken(patient.id);
      setQrToken(newToken);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to regenerate token', err);
    } finally {
      setRegenerating(false);
    }
  };

  const handleCopyLink = () => {
    const url = qrToken ? `${window.location.origin}/#emergency-${qrToken.token}` : window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const emergencyUrl = qrToken
    ? `${window.location.origin}/emergency/${qrToken.token}`
    : `${window.location.origin}/emergency`;

  const initials = patient.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  if (loading) {
    return (
      <div className="card" style={{ padding: '48px', textAlign: 'center', maxWidth: '680px', margin: '0 auto' }}>
        <div className="spinner" style={{ margin: '0 auto 16px auto' }} />
        <div style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 600 }}>Loading Digital Health Card…</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '720px', margin: '0 auto' }}>
      
      {/* Top Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="no-print">
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Digital Health Card</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
            Official patient emergency medical identity with secure tokenized QR
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={handleCopyLink}
            className="secondary-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
          >
            {copied ? <Check size={14} style={{ color: '#16a34a' }} /> : <Copy size={14} />}
            {copied ? 'Link Copied!' : 'Copy Share Link'}
          </button>
          <button
            onClick={handleRegenerateToken}
            disabled={regenerating}
            className="secondary-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
          >
            <RefreshCw size={14} className={regenerating ? 'spin' : ''} />
            Regenerate QR
          </button>
          <button
            onClick={handlePrint}
            className="primary-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
          >
            <Printer size={15} /> Print / Save PDF
          </button>
        </div>
      </div>

      {/* Main Physical Health Card Container */}
      <div
        id="printable-health-card"
        style={{
          background: '#ffffff',
          border: '2px solid #0284c7',
          borderRadius: '18px',
          padding: '28px',
          boxShadow: '0 8px 24px rgba(2, 132, 199, 0.12)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative Top Accent Bar */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '6px',
          background: 'linear-gradient(90deg, #0284c7 0%, #38bdf8 50%, #0369a1 100%)'
        }} />

        {/* Header Branding Banner */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              background: '#0284c7',
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)'
            }}>
              <Shield style={{ width: '22px', height: '22px', color: '#ffffff' }} />
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', letterSpacing: '0.04em', lineHeight: 1.1 }}>
                JEEVANRAKSHA
              </div>
              <div style={{ fontSize: '9.5px', color: '#0284c7', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.08em', marginTop: 2 }}>
                NATIONAL DIGITAL HEALTH & SAFETY NETWORK
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#0284c7', letterSpacing: '0.02em' }}>
              CARD NO: {healthCard?.cardNumber || 'JR-2026-90418'}
            </div>
            <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, marginTop: 2 }}>
              ABHA ID: <span style={{ color: '#0f172a' }}>{patient.abhaId}</span>
            </div>
          </div>
        </div>

        {/* Card Body Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 145px', gap: '24px', alignItems: 'start' }}>
          
          {/* Left Side: Patient Identity & Medical Summary */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                background: '#e0f2fe',
                color: '#0369a1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: 800,
                border: '2px solid #bae6fd'
              }}>
                {initials}
              </div>
              <div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
                  {patient.name}
                </div>
                <div style={{ display: 'flex', gap: '10px', color: '#475569', fontSize: '12.5px', fontWeight: 600, marginTop: 3 }}>
                  <span>{patient.age} Yrs / {patient.gender}</span>
                  <span>•</span>
                  <span style={{ color: '#dc2626', fontWeight: 800, background: '#fef2f2', padding: '1px 6px', borderRadius: 4, border: '1px solid #fecaca' }}>
                    Blood Group: {patient.bloodGroup}
                  </span>
                </div>
              </div>
            </div>

            {/* Severe Allergies Warning */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertTriangle size={13} /> Severe Allergies & Sensitivities
              </div>
              {allergies.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {allergies.map((a) => (
                    <span
                      key={a.id}
                      style={{
                        background: a.severity === 'SEVERE' || a.severity === 'LIFE_THREATENING' ? '#fef2f2' : '#fffbeb',
                        border: `1px solid ${a.severity === 'SEVERE' || a.severity === 'LIFE_THREATENING' ? '#fecaca' : '#fef3c7'}`,
                        color: a.severity === 'SEVERE' || a.severity === 'LIFE_THREATENING' ? '#dc2626' : '#b45309',
                        padding: '3px 8px',
                        borderRadius: '5px',
                        fontSize: '11px',
                        fontWeight: 700,
                      }}
                    >
                      ⚠ {a.substance} ({a.severity})
                    </span>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '11.5px', color: '#15803d', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={14} /> No Known Drug Allergies
                </div>
              )}
            </div>

            {/* Important Ongoing Conditions */}
            {conditions.length > 0 && (
              <div style={{ marginBottom: '14px' }}>
                <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Heart size={12} style={{ color: '#db2777' }} /> Diagnosed Conditions
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {conditions.map((c) => (
                    <span key={c.id} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '2px 8px', borderRadius: 4, fontSize: '11px', fontWeight: 600, color: '#334155' }}>
                      {c.condition} {c.chronic ? '(Chronic)' : ''}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Active Medications Summary */}
            {prescriptions.length > 0 && (
              <div style={{ marginBottom: '14px' }}>
                <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Pill size={12} style={{ color: '#0284c7' }} /> Active Medications
                </div>
                <div style={{ fontSize: '12px', color: '#0f172a', fontWeight: 600 }}>
                  {prescriptions.map(p => `${p.drug} ${p.dose}`).join(' · ')}
                </div>
              </div>
            )}

            {/* Primary Emergency Contact */}
            {contacts.length > 0 && (
              <div>
                <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                  Primary Emergency Contact
                </div>
                <div style={{ fontSize: '12.5px', color: '#0f172a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={13} style={{ color: '#16a34a' }} />
                  {contacts[0].name} ({contacts[0].relationship}) — <a href={`tel:${contacts[0].phone}`} style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 800 }}>{contacts[0].phone}</a>
                </div>
              </div>
            )}
          </div>

          {/* Right Side: High-Density Emergency QR Code */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div
              style={{
                background: '#ffffff',
                padding: '10px',
                borderRadius: '12px',
                border: '1.5px solid #0284c7',
                boxShadow: '0 4px 10px rgba(2, 132, 199, 0.1)',
              }}
            >
              <QRCodeSVG value={emergencyUrl} size={125} level="H" />
            </div>
            <div style={{ fontSize: '9px', color: '#0369a1', marginTop: '8px', textAlign: 'center', fontWeight: 800, letterSpacing: '0.05em' }}>
              SCAN FOR EMERGENCY PARAMEDIC ACCESS
            </div>
            <div style={{ fontSize: '8.5px', color: '#94a3b8', marginTop: 2, textAlign: 'center' }}>
              Opaque Secure Token Protected
            </div>
          </div>
        </div>

        {/* Card Footer */}
        <div style={{ marginTop: '20px', paddingTop: '12px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: '#64748b' }}>
          <div>Issued: {new Date(patient.createdAt).toLocaleDateString()}</div>
          <div>Hospital: <strong>{patient.hospitalName || 'Apollo Hospital'}</strong></div>
          <div>JeevanRaksha Emergency Network</div>
        </div>
      </div>
    </div>
  );
};
