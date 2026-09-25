import React, { useState, useEffect } from 'react';
import {
  Shield,
  Plus,
  Trash2,
  Pill,
  AlertOctagon,
  Clock,
  Eye,
  Edit3,
  PhoneCall,
  UserCheck,
  Heart,
  X
} from 'lucide-react';
import {
  getDataService,
  type Patient,
  type Prescription,
  type Allergy,
  type Condition,
  type EmergencyContact,
  type AuditLog,
  type User
} from '../services';

interface PatientDashboardProps {
  currentUser: User;
  onNavigateTab: (tab: string) => void;
}

export const PatientDashboardPage: React.FC<PatientDashboardProps> = ({ currentUser, onNavigateTab }) => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [accessLogs, setAccessLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Control States
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showAddRx, setShowAddRx] = useState(false);
  const [showAddAllergy, setShowAddAllergy] = useState(false);
  const [showAddCondition, setShowAddCondition] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);

  // Edit Profile Form State
  const [editName, setEditName] = useState('');
  const [editAge, setEditAge] = useState(30);
  const [editGender, setEditGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [editBloodGroup, setEditBloodGroup] = useState('O+');
  const [editPhone, setEditPhone] = useState('');
  const [editHospital, setEditHospital] = useState('');

  // Form input states
  const [rxDrug, setRxDrug] = useState('');
  const [rxDose, setRxDose] = useState('');
  const [rxFreq, setRxFreq] = useState('');

  const [algSubstance, setAlgSubstance] = useState('');
  const [algType, setAlgType] = useState<Allergy['allergyType']>('Drug');
  const [algSeverity, setAlgSeverity] = useState<Allergy['severity']>('MODERATE');

  const [cndName, setCndName] = useState('');
  const [cndChronic, setCndChronic] = useState(true);
  const [cndStatus, setCndStatus] = useState<Condition['status']>('ONGOING');
  const [cndSince, setCndSince] = useState('');

  const [contactName, setContactName] = useState('');
  const [contactRel, setContactRel] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  useEffect(() => {
    loadPatientData();
  }, [currentUser]);

  const loadPatientData = async () => {
    setLoading(true);
    try {
      const service = getDataService();
      let p = await service.getPatientByUserId(currentUser.id);
      if (!p) {
        p = await service.getPatientById('patient-001');
      }
      if (p) {
        setPatient(p);
        setEditName(p.name);
        setEditAge(p.age);
        setEditGender(p.gender);
        setEditBloodGroup(p.bloodGroup);
        setEditPhone(p.phone || '+91 98765 43210');
        setEditHospital(p.hospitalName || 'Apollo Hospital');

        const [rxs, algs, cnds, ecs, logs] = await Promise.all([
          service.getPrescriptions(p.id),
          service.getAllergies(p.id),
          service.getConditions(p.id),
          service.getEmergencyContacts(p.id),
          service.getAuditLogs(p.id),
        ]);
        setPrescriptions(rxs);
        setAllergies(algs);
        setConditions(cnds);
        setContacts(ecs);
        setAccessLogs(logs);
      }
    } catch (err) {
      console.error('Error loading patient dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  // ── Profile Updates ──────────────────────────────────────────────────────────
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;
    try {
      const service = getDataService();
      await service.updatePatient(patient.id, {
        name: editName,
        age: Number(editAge),
        gender: editGender,
        bloodGroup: editBloodGroup,
        phone: editPhone,
        hospitalName: editHospital,
      });
      await service.logAuditEvent({
        patientId: patient.id,
        accessedBy: currentUser.id,
        accessorName: currentUser.fullName,
        accessorRole: 'PATIENT',
        accessType: 'PATIENT_UPDATED_PROFILE',
        details: 'Patient updated medical profile parameters',
      });
      setShowEditProfile(false);
      loadPatientData();
    } catch (err) {
      console.error('Failed to update patient profile', err);
    }
  };

  // ── Prescriptions ────────────────────────────────────────────────────────────
  const handleAddPrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient || !rxDrug) return;
    try {
      const service = getDataService();
      await service.addPrescription(patient.id, {
        drug: rxDrug,
        dose: rxDose || '1 pill',
        frequency: rxFreq || 'Daily',
        startDate: new Date().toISOString().split('T')[0],
        status: 'ACTIVE',
      });
      setRxDrug('');
      setRxDose('');
      setRxFreq('');
      setShowAddRx(false);
      loadPatientData();
    } catch (err) {
      console.error('Failed to add prescription', err);
    }
  };

  const handleDeletePrescription = async (id: string) => {
    try {
      const service = getDataService();
      await service.deletePrescription(id);
      loadPatientData();
    } catch (err) {
      console.error('Failed to delete prescription', err);
    }
  };

  // ── Allergies ────────────────────────────────────────────────────────────────
  const handleAddAllergy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient || !algSubstance) return;
    try {
      const service = getDataService();
      await service.addAllergy(patient.id, {
        allergyType: algType,
        substance: algSubstance,
        severity: algSeverity,
      });
      setAlgSubstance('');
      setShowAddAllergy(false);
      loadPatientData();
    } catch (err) {
      console.error('Failed to add allergy', err);
    }
  };

  const handleDeleteAllergy = async (id: string) => {
    try {
      const service = getDataService();
      await service.deleteAllergy(id);
      loadPatientData();
    } catch (err) {
      console.error('Failed to delete allergy', err);
    }
  };

  // ── Conditions ───────────────────────────────────────────────────────────────
  const handleAddCondition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient || !cndName) return;
    try {
      const service = getDataService();
      await service.addCondition(patient.id, {
        condition: cndName,
        chronic: cndChronic,
        status: cndStatus,
        diagnosedSince: cndSince || '2025',
      });
      setCndName('');
      setCndSince('');
      setShowAddCondition(false);
      loadPatientData();
    } catch (err) {
      console.error('Failed to add condition', err);
    }
  };

  const handleDeleteCondition = async (id: string) => {
    try {
      const service = getDataService();
      await service.deleteCondition(id);
      loadPatientData();
    } catch (err) {
      console.error('Failed to delete condition', err);
    }
  };

  // ── Emergency Contacts ───────────────────────────────────────────────────────
  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient || !contactName) return;
    try {
      const service = getDataService();
      await service.addEmergencyContact(patient.id, {
        name: contactName,
        relationship: contactRel || 'Family',
        phone: contactPhone || '+91 99999 88888',
        priority: contacts.length + 1,
      });
      setContactName('');
      setContactRel('');
      setContactPhone('');
      setShowAddContact(false);
      loadPatientData();
    } catch (err) {
      console.error('Failed to add emergency contact', err);
    }
  };

  const handleDeleteContact = async (id: string) => {
    try {
      const service = getDataService();
      await service.deleteEmergencyContact(id);
      loadPatientData();
    } catch (err) {
      console.error('Failed to delete emergency contact', err);
    }
  };

  if (loading || !patient) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '60px' }}>
        <div className="spinner" style={{ margin: '0 auto 16px auto' }} />
        <div style={{ color: 'var(--text-muted)' }}>Loading Patient Medical Record…</div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Patient Profile Header Card */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '24px 28px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            color: '#ffffff',
            fontSize: '22px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(2, 132, 199, 0.2)'
          }}>
            {patient.name.charAt(0)}
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 6 }}>
              <UserCheck size={14} /> CENTRALIZED PATIENT HEALTH PROFILE
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', margin: '2px 0 6px 0' }}>
              {patient.name}
            </h1>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
              <span>ABHA ID: <strong style={{ color: 'var(--text-primary)' }}>{patient.abhaId}</strong></span>
              <span>•</span>
              <span>Blood Group: <strong style={{ color: '#dc2626' }}>{patient.bloodGroup}</strong></span>
              <span>•</span>
              <span>Age/Gender: <strong style={{ color: 'var(--text-primary)' }}>{patient.age}y / {patient.gender}</strong></span>
              <span>•</span>
              <span>Primary Hospital: <strong style={{ color: 'var(--text-primary)' }}>{patient.hospitalName || 'Apollo Hospital'}</strong></span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setShowEditProfile(true)}
            className="secondary-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Edit3 size={15} /> Edit Profile
          </button>
          <button
            onClick={() => onNavigateTab('health-card')}
            className="primary-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Shield size={16} /> Digital Health Card
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
        
        {/* Left Column: Prescriptions & Allergies */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Prescriptions (Medications) */}
          <div className="card">
            <div className="card-header" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="card-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
                  <Pill size={18} />
                </div>
                <div>
                  <div className="card-title">Active Medications ({prescriptions.length})</div>
                  <div className="card-subtitle">Prescribed drugs and dosage instructions</div>
                </div>
              </div>
              <button
                onClick={() => setShowAddRx(true)}
                className="secondary-btn"
                style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Plus size={14} /> Add Medication
              </button>
            </div>
            <div className="card-body table-wrap" style={{ padding: 0 }}>
              {prescriptions.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>No active prescriptions recorded</div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Medication</th>
                      <th>Dosage</th>
                      <th>Frequency</th>
                      <th>Start Date</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prescriptions.map((rx) => (
                      <tr key={rx.id}>
                        <td style={{ fontWeight: 700, color: '#0f172a' }}>{rx.drug}</td>
                        <td>{rx.dose}</td>
                        <td>{rx.frequency}</td>
                        <td>{rx.startDate}</td>
                        <td>
                          <span className="sev-badge sev-SAFE">{rx.status}</span>
                        </td>
                        <td>
                          <button
                            onClick={() => handleDeletePrescription(rx.id)}
                            style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: 2 }}
                            title="Remove medication"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Allergies */}
          <div className="card">
            <div className="card-header" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="card-icon" style={{ background: '#fee2e2', color: '#dc2626' }}>
                  <AlertOctagon size={18} />
                </div>
                <div>
                  <div className="card-title">Allergies & Severe Reactions ({allergies.length})</div>
                  <div className="card-subtitle">Critical substance sensitivities for cross-referencing</div>
                </div>
              </div>
              <button
                onClick={() => setShowAddAllergy(true)}
                className="secondary-btn"
                style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Plus size={14} /> Add Allergy
              </button>
            </div>
            <div className="card-body">
              {allergies.length === 0 ? (
                <div style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '13px' }}>No recorded allergies</div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {allergies.map((a) => (
                    <div
                      key={a.id}
                      style={{
                        background: a.severity === 'SEVERE' || a.severity === 'LIFE_THREATENING' ? '#fef2f2' : '#fffbeb',
                        border: `1px solid ${a.severity === 'SEVERE' || a.severity === 'LIFE_THREATENING' ? '#fecaca' : '#fef3c7'}`,
                        borderRadius: '8px',
                        padding: '8px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: a.severity === 'SEVERE' || a.severity === 'LIFE_THREATENING' ? '#dc2626' : '#b45309' }}>
                          ⚠️ {a.substance}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          {a.allergyType || 'Drug'} · {a.severity}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteAllergy(a.id)}
                        style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: 0 }}
                        title="Delete allergy alert"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Conditions, Emergency Contacts & Audit Logs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Medical Conditions */}
          <div className="card">
            <div className="card-header" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="card-icon" style={{ background: '#fce7f3', color: '#db2777' }}>
                  <Heart size={18} />
                </div>
                <div>
                  <div className="card-title">Medical Conditions</div>
                  <div className="card-subtitle">Diagnosed health history</div>
                </div>
              </div>
              <button
                onClick={() => setShowAddCondition(true)}
                className="secondary-btn"
                style={{ padding: '4px 10px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '3px' }}
              >
                <Plus size={13} /> Add
              </button>
            </div>
            <div className="card-body">
              {conditions.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No medical conditions logged</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {conditions.map((c) => (
                    <div key={c.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px 12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{c.condition}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          {c.chronic ? 'Chronic' : 'Resolved'} • Diagnosed: {c.diagnosedSince || 'Ongoing'}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteCondition(c.id)}
                        style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: 0 }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className="card">
            <div className="card-header" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="card-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                  <PhoneCall size={18} />
                </div>
                <div>
                  <div className="card-title">Emergency Contacts</div>
                  <div className="card-subtitle">First responder contacts</div>
                </div>
              </div>
              <button
                onClick={() => setShowAddContact(true)}
                className="secondary-btn"
                style={{ padding: '4px 10px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '3px' }}
              >
                <Plus size={13} /> Add
              </button>
            </div>
            <div className="card-body">
              {contacts.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>No emergency contact specified</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {contacts.map((ec) => (
                    <div key={ec.id} style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px 12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#14532d' }}>{ec.name} ({ec.relationship})</div>
                        <div style={{ fontSize: '12px', color: '#166534', fontWeight: 600 }}>{ec.phone}</div>
                      </div>
                      <button
                        onClick={() => handleDeleteContact(ec.id)}
                        style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: 0 }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Access Audit Trail */}
          <div className="card">
            <div className="card-header">
              <div className="card-icon" style={{ background: '#f0f9ff', color: '#0284c7' }}>
                <Eye size={18} />
              </div>
              <div>
                <div className="card-title">Security Audit Log</div>
                <div className="card-subtitle">Recent emergency scans & record views</div>
              </div>
            </div>
            <div className="card-body">
              {accessLogs.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>No audit activity recorded</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {accessLogs.slice(0, 5).map((log) => (
                    <div key={log.id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#15803d' }}>{log.accessType}</div>
                      <div style={{ fontSize: '11px', color: '#475569' }}>{log.accessorName || 'Emergency First Responder'}</div>
                      <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                        <Clock size={10} style={{ display: 'inline', marginRight: 4 }} />
                        {new Date(log.accessedAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* ── MODAL 1: Edit Profile ───────────────────────────────────────────── */}
      {showEditProfile && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(3px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: '460px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>Edit Patient Profile</h3>
              <button onClick={() => setShowEditProfile(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Full Name</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} required style={{ width: '100%', marginTop: 4 }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Age (Years)</label>
                  <input type="number" value={editAge} onChange={(e) => setEditAge(Number(e.target.value))} required style={{ width: '100%', marginTop: 4 }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Gender</label>
                  <select value={editGender} onChange={(e) => setEditGender(e.target.value as any)} style={{ width: '100%', marginTop: 4 }}>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Blood Group</label>
                  <select value={editBloodGroup} onChange={(e) => setEditBloodGroup(e.target.value)} style={{ width: '100%', marginTop: 4 }}>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Primary Phone</label>
                  <input type="text" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} style={{ width: '100%', marginTop: 4 }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Primary Hospital / Health Provider</label>
                <input type="text" value={editHospital} onChange={(e) => setEditHospital(e.target.value)} style={{ width: '100%', marginTop: 4 }} />
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" onClick={() => setShowEditProfile(false)} className="secondary-btn">Cancel</button>
                <button type="submit" className="primary-btn">Save Profile Updates</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: Add Prescription ───────────────────────────────────────── */}
      {showAddRx && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(3px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: '400px', padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>Add Active Medication</h3>
            <form onSubmit={handleAddPrescription} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Medication Name</label>
                <input type="text" placeholder="e.g. Aspirin, Metformin" value={rxDrug} onChange={(e) => setRxDrug(e.target.value)} required style={{ width: '100%', marginTop: 4 }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Dosage</label>
                <input type="text" placeholder="e.g. 500mg" value={rxDose} onChange={(e) => setRxDose(e.target.value)} style={{ width: '100%', marginTop: 4 }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Frequency</label>
                <input type="text" placeholder="e.g. Twice daily" value={rxFreq} onChange={(e) => setRxFreq(e.target.value)} style={{ width: '100%', marginTop: 4 }} />
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowAddRx(false)} className="secondary-btn">Cancel</button>
                <button type="submit" className="primary-btn">Save Medication</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: Add Allergy ────────────────────────────────────────────── */}
      {showAddAllergy && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(3px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: '420px', padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>Add Allergy Alert</h3>
            <form onSubmit={handleAddAllergy} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Substance / Drug Name</label>
                <input type="text" placeholder="e.g. Penicillin, Sulfa, Peanuts" value={algSubstance} onChange={(e) => setAlgSubstance(e.target.value)} required style={{ width: '100%', marginTop: 4 }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Allergy Category</label>
                <select value={algType} onChange={(e) => setAlgType(e.target.value as any)} style={{ width: '100%', marginTop: 4 }}>
                  <option value="Drug">Drug Allergy</option>
                  <option value="Food">Food Allergy</option>
                  <option value="Environmental">Environmental</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Severity Level</label>
                <select value={algSeverity} onChange={(e) => setAlgSeverity(e.target.value as any)} style={{ width: '100%', marginTop: 4 }}>
                  <option value="MILD">MILD</option>
                  <option value="MODERATE">MODERATE</option>
                  <option value="SEVERE">SEVERE (High Danger)</option>
                  <option value="LIFE_THREATENING">LIFE THREATENING</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowAddAllergy(false)} className="secondary-btn">Cancel</button>
                <button type="submit" className="primary-btn">Save Allergy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 4: Add Condition ──────────────────────────────────────────── */}
      {showAddCondition && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(3px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: '420px', padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>Add Medical Condition</h3>
            <form onSubmit={handleAddCondition} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Condition / Diagnosis Name</label>
                <input type="text" placeholder="e.g. Hypertension, Type 2 Diabetes" value={cndName} onChange={(e) => setCndName(e.target.value)} required style={{ width: '100%', marginTop: 4 }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Diagnosed Since (Year)</label>
                <input type="text" placeholder="e.g. 2021" value={cndSince} onChange={(e) => setCndSince(e.target.value)} style={{ width: '100%', marginTop: 4 }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Condition Status</label>
                <select value={cndStatus} onChange={(e) => setCndStatus(e.target.value as any)} style={{ width: '100%', marginTop: 4 }}>
                  <option value="ONGOING">ONGOING</option>
                  <option value="MANAGED">MANAGED</option>
                  <option value="RESOLVED">RESOLVED</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <input type="checkbox" id="chronic-chk" checked={cndChronic} onChange={(e) => setCndChronic(e.target.checked)} />
                <label htmlFor="chronic-chk" style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>Chronic Condition</label>
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowAddCondition(false)} className="secondary-btn">Cancel</button>
                <button type="submit" className="primary-btn">Save Condition</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 5: Add Emergency Contact ──────────────────────────────────── */}
      {showAddContact && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(3px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: '420px', padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>Add Emergency Contact</h3>
            <form onSubmit={handleAddContact} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Contact Full Name</label>
                <input type="text" placeholder="e.g. Rajesh Mehta" value={contactName} onChange={(e) => setContactName(e.target.value)} required style={{ width: '100%', marginTop: 4 }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Relationship</label>
                <input type="text" placeholder="e.g. Spouse, Father, Guardian" value={contactRel} onChange={(e) => setContactRel(e.target.value)} required style={{ width: '100%', marginTop: 4 }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Phone Number</label>
                <input type="text" placeholder="+91 98765 43210" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} required style={{ width: '100%', marginTop: 4 }} />
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowAddContact(false)} className="secondary-btn">Cancel</button>
                <button type="submit" className="primary-btn">Save Contact</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
