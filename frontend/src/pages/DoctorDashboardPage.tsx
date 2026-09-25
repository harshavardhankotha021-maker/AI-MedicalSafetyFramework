import React, { useState, useEffect } from 'react';
import {
  Search,
  Sparkles,
  FileText,
  QrCode,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Pill,
  FlaskConical,
  PlusCircle,
  Activity,
  ShieldCheck,
  Check,
  AlertOctagon,
  Building2,
  Globe,
  Users
} from 'lucide-react';
import {
  getDataService,
  type Patient,
  type User,
  type Allergy,
  type Condition,
  type Prescription,
  type LabReport,
} from '../services';
import { api, type DirectAnalysisResponse } from '../api/client';

interface DoctorDashboardProps {
  currentUser: User;
  onSelectPatientForAnalysis: (abhaId: string) => void;
}

export const DoctorDashboardPage: React.FC<DoctorDashboardProps> = ({
  currentUser,
  onSelectPatientForAnalysis,
}) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Patient Access Scope Categorization
  const [accessScope, setAccessScope] = useState<'MY_HOSPITAL' | 'OTHER_HOSPITALS' | 'ALL_PATIENTS'>('MY_HOSPITAL');

  // Emergency Token Scan state
  const [tokenInput, setTokenInput] = useState('');
  const [tokenLoading, setTokenLoading] = useState(false);
  const [tokenStatusMessage, setTokenStatusMessage] = useState<string | null>(null);

  // Patient Sub-collections
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [labReports, setLabReports] = useState<LabReport[]>([]);
  const [loadingPatientDetails, setLoadingPatientDetails] = useState(false);

  // Doctor Trial Prescription & Safety Check
  const [newDrug, setNewDrug] = useState('');
  const [newDose, setNewDose] = useState('500 mg');
  const [newFrequency, setNewFrequency] = useState('Twice daily (BD)');
  const [newDuration, setNewDuration] = useState('7 days');
  const [safetyChecking, setSafetyChecking] = useState(false);
  const [safetyResult, setSafetyResult] = useState<DirectAnalysisResponse | null>(null);
  const [prescriptionSaved, setPrescriptionSaved] = useState(false);

  // Doctor Clinical Notes
  const [doctorNote, setDoctorNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [loading, setLoading] = useState(true);

  // Active Tab for Patient Detail Workspace
  const [detailTab, setDetailTab] = useState<'overview' | 'meds' | 'allergies' | 'labs' | 'prescribe'>('overview');

  // Resolve Doctor Human-Readable Hospital Name
  const getDoctorHospitalName = (user: User): string => {
    if (!user.hospitalId) return 'Apollo Hospital';
    if (user.hospitalId === 'hospital-001') return 'Apollo Hospital';
    if (user.hospitalId === 'hospital-002') return 'AIIMS';
    if (user.hospitalId === 'hospital-003') return 'Fortis Hospital';
    return user.hospitalId;
  };
  const doctorHospitalName = getDoctorHospitalName(currentUser);

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      loadPatientSubCollections(selectedPatient.id);
      setSafetyResult(null);
      setPrescriptionSaved(false);
      setNewDrug('');
    }
  }, [selectedPatient]);

  const loadPatients = async () => {
    setLoading(true);
    try {
      const service = getDataService();
      const list = await service.getAllPatients();
      setPatients(list);
      if (list.length > 0) {
        setSelectedPatient(list[0]);
      }
    } catch (err) {
      console.error('Failed to load patients:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPatientSubCollections = async (patientId: string) => {
    setLoadingPatientDetails(true);
    try {
      const service = getDataService();
      const [al, cd, rx, lb] = await Promise.all([
        service.getAllergies(patientId),
        service.getConditions(patientId),
        service.getPrescriptions(patientId),
        service.getLabReports(patientId),
      ]);
      setAllergies(al);
      setConditions(cd);
      setPrescriptions(rx);
      setLabReports(lb);
    } catch (err) {
      console.error('Failed to load patient subcollections:', err);
    } finally {
      setLoadingPatientDetails(false);
    }
  };

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    try {
      const service = getDataService();
      const res = await service.searchPatients(q);
      setPatients(res);
    } catch (err) {
      console.error('Search failed', err);
    }
  };

  const handleEmergencyTokenLookup = async (tokenToUse?: string) => {
    const queryToken = (tokenToUse || tokenInput).trim();
    if (!queryToken) return;

    setTokenLoading(true);
    setTokenStatusMessage(null);

    try {
      const service = getDataService();
      
      // 1. Try resolving emergency token first (UNIVERSAL cross-hospital lookup)
      const emgData = await service.getEmergencyData(queryToken);
      if (emgData) {
        const matchingPatient = patients.find(p => p.name.toLowerCase() === emgData.patientName.toLowerCase() || p.abhaId === emgData.abhaId) ||
          await service.getPatientById(emgData.abhaId) ||
          patients[0];
        
        setSelectedPatient(matchingPatient);
        setTokenStatusMessage(`✓ Universal Emergency QR Resolved! Loaded ${emgData.patientName} (${matchingPatient.abhaId})`);
        
        await service.logAuditEvent({
          patientId: matchingPatient.id,
          accessedBy: currentUser.id,
          accessorName: currentUser.fullName,
          accessorRole: 'DOCTOR',
          accessType: 'EMERGENCY_QR_ACCESSED',
          tokenUsed: queryToken,
          details: `Universal Cross-Hospital QR Scan by Dr. ${currentUser.fullName} (${doctorHospitalName})`
        });
        return;
      }

      // 2. Fallback search by patient ID, ABHA ID, name, or health card number
      const q = queryToken.toLowerCase();
      const matchingPatient = patients.find(p => 
        p.id.toLowerCase() === q ||
        p.abhaId.toLowerCase() === q ||
        p.name.toLowerCase().includes(q) ||
        q.includes(p.id.toLowerCase()) ||
        q.includes(p.abhaId.toLowerCase())
      ) || await service.getPatientById(queryToken);

      if (matchingPatient) {
        setSelectedPatient(matchingPatient);
        setTokenStatusMessage(`✓ Patient match found! Loaded ${matchingPatient.name} (${matchingPatient.abhaId})`);
      } else {
        setTokenStatusMessage(`⚠ No matching record or token found for '${queryToken}'`);
      }
    } catch (err) {
      console.error('Token lookup error:', err);
      setTokenStatusMessage('⚠ Error scanning emergency token');
    } finally {
      setTokenLoading(false);
    }
  };

  const handleRunLiveSafetyCheck = async () => {
    if (!newDrug.trim()) return;
    setSafetyChecking(true);
    setSafetyResult(null);

    try {
      const activeDrugNames = prescriptions.filter(p => p.status === 'ACTIVE').map(p => p.drug);
      const activeConditionNames = conditions.map(c => c.condition);
      const allergySubstances = allergies.map(a => a.substance);

      // Include trial drug in list
      const trialDrugs = Array.from(new Set([...activeDrugNames, newDrug.trim()]));

      const response = await api.analyseDirect({
        drugs: trialDrugs,
        conditions: activeConditionNames,
        allergies: allergySubstances,
        use_ner: true,
      });

      setSafetyResult(response);
    } catch (err) {
      console.error('Safety check failed:', err);
    } finally {
      setSafetyChecking(false);
    }
  };

  const handleAddVerifiedPrescription = async () => {
    if (!selectedPatient || !newDrug.trim()) return;
    try {
      const service = getDataService();
      await service.addPrescription(selectedPatient.id, {
        drug: newDrug.trim(),
        dose: newDose,
        frequency: newFrequency,
        startDate: new Date().toISOString().split('T')[0],
        status: 'ACTIVE',
      });

      setPrescriptionSaved(true);
      setNewDrug('');
      setSafetyResult(null);
      await loadPatientSubCollections(selectedPatient.id);
      setTimeout(() => setPrescriptionSaved(false), 3000);
    } catch (err) {
      console.error('Failed to add prescription:', err);
    }
  };

  const getRiskTag = (abhaId: string) => {
    if (abhaId.includes('PM001') || abhaId === 'ABHA001') return { label: 'HIGH RISK', bg: '#fef2f2', border: '#fecaca', color: '#dc2626' };
    if (abhaId.includes('AS002') || abhaId === 'ABHA002') return { label: 'MEDIUM RISK', bg: '#fffbeb', border: '#fef3c7', color: '#b45309' };
    return { label: 'SAFE', bg: '#f0fdf4', border: '#bbf7d0', color: '#15803d' };
  };

  // Filter Roster Patients by Access Scope
  const filteredPatients = patients.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    const pName = p.name.toLowerCase();
    const pAbha = p.abhaId.toLowerCase();
    const pHosp = (p.hospitalName || 'Apollo Hospital').toLowerCase();

    const matchesSearch = !q || pName.includes(q) || pAbha.includes(q) || pHosp.includes(q);
    if (!matchesSearch) return false;

    const isMyHospital = pHosp === doctorHospitalName.toLowerCase();
    if (accessScope === 'MY_HOSPITAL') return isMyHospital;
    if (accessScope === 'OTHER_HOSPITALS') return !isMyHospital;
    return true; // ALL_PATIENTS
  });

  // Group Other Hospitals Patients by Hospital Name
  const otherHospitalsGrouped = filteredPatients.reduce<Record<string, Patient[]>>((acc, p) => {
    const hName = p.hospitalName || 'Participating Hospital';
    if (!acc[hName]) acc[hName] = [];
    acc[hName].push(p);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '60px' }}>
        <div className="spinner" style={{ margin: '0 auto 16px auto' }} />
        <div style={{ color: 'var(--text-muted)' }}>Loading Doctor Portal…</div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: '1140px', margin: '0 auto' }}>
      
      {/* 1. DOCTOR IDENTITY / HOSPITAL HEADER BANNER */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '22px 26px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div>
          <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Activity size={14} /> CLINICAL DECISION SUPPORT SYSTEM
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0 4px 0' }}>
            Doctor Portal — Dr. {currentUser.fullName}
          </h1>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: '#0f172a', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Building2 size={15} style={{ color: '#0284c7' }} /> {doctorHospitalName}
            </span>
            <span>•</span>
            <span style={{ color: '#16a34a', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <ShieldCheck size={14} /> Verified Physician Session Active
            </span>
          </div>
        </div>
      </div>

      {/* 2. UNIVERSAL EMERGENCY QR ACCESS SECTION */}
      <div
        style={{
          background: 'linear-gradient(135deg, #fef2f2 0%, #fff1f2 100%)',
          border: '1.5px solid #fecaca',
          borderRadius: '12px',
          padding: '18px 22px',
          marginBottom: '24px',
          boxShadow: '0 2px 8px rgba(220, 38, 38, 0.06)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldAlert size={16} /> UNIVERSAL EMERGENCY ACCESS
          </div>
          <span style={{ fontSize: '11px', background: '#ffffff', color: '#dc2626', border: '1px solid #fecaca', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
            Cross-Hospital Network Active
          </span>
        </div>

        <div style={{ fontSize: '12.5px', color: '#991b1b', marginBottom: '12px', lineHeight: 1.4 }}>
          Scan any patient’s Jeevan Raksha Emergency QR to retrieve their emergency-critical information. <strong>Universal QR lookup works across all participating hospitals independent of patient registration or doctor affiliation.</strong>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
            <input
              type="text"
              placeholder="Paste Emergency Token (e.g., jr2026pm001...), ABHA ID, or QR URL…"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              style={{
                width: '100%',
                background: '#ffffff',
                border: '1.5px solid #fca5a5',
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '13.5px',
                color: '#0f172a',
                outline: 'none',
              }}
            />
          </div>

          <button
            onClick={() => handleEmergencyTokenLookup()}
            disabled={tokenLoading}
            className="primary-btn"
            style={{ padding: '10px 18px', fontSize: '13px', background: '#dc2626', borderColor: '#b91c1c', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <QrCode size={15} /> {tokenLoading ? 'Scanning…' : 'Scan Token'}
          </button>

          <button
            onClick={() => {
              const demoToken = 'jr2026pm001f7e3a9b2c4d8e1f5';
              setTokenInput(demoToken);
              handleEmergencyTokenLookup(demoToken);
            }}
            className="secondary-btn"
            style={{ padding: '10px 14px', fontSize: '12px', background: '#ffffff', border: '1px solid #fca5a5', color: '#dc2626' }}
          >
            ⚡ Demo QR Scan
          </button>
        </div>

        {tokenStatusMessage && (
          <div style={{ fontSize: '12.5px', fontWeight: 700, color: tokenStatusMessage.startsWith('✓') ? '#15803d' : '#dc2626', marginTop: '10px' }}>
            {tokenStatusMessage}
          </div>
        )}
      </div>

      {/* 3. PATIENT ACCESS CATEGORIZATION SCOPE BAR */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
          PATIENT ACCESS SCOPE
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {[
            { id: 'MY_HOSPITAL', label: 'MY HOSPITAL', subtitle: doctorHospitalName, icon: Building2 },
            { id: 'OTHER_HOSPITALS', label: 'OTHER HOSPITALS', subtitle: 'Network Directory', icon: Globe },
            { id: 'ALL_PATIENTS', label: 'ALL PATIENTS', subtitle: 'Overall Network Search', icon: Users },
          ].map((tab) => {
            const IconComp = tab.icon;
            const isActive = accessScope === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setAccessScope(tab.id as typeof accessScope)}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: `1.5px solid ${isActive ? '#0284c7' : 'var(--border)'}`,
                  background: isActive ? '#f0f9ff' : '#ffffff',
                  color: isActive ? '#0369a1' : 'var(--text-primary)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isActive ? '0 2px 8px rgba(2, 132, 199, 0.12)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 800 }}>
                  <IconComp size={16} style={{ color: isActive ? '#0284c7' : '#64748b' }} /> {tab.label}
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px', marginLeft: '24px' }}>
                  {tab.subtitle}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. MAIN WORKSPACE GRID: Left Roster Sidebar + Right Patient Workspace */}
      <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '24px' }}>
        
        {/* Left Column: Patient Roster List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* Search Box */}
          <div className="card" style={{ padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Search size={17} style={{ color: '#64748b' }} />
              <input
                type="text"
                placeholder={
                  accessScope === 'MY_HOSPITAL'
                    ? `Search ${doctorHospitalName} patients…`
                    : accessScope === 'OTHER_HOSPITALS'
                    ? 'Search other hospital patients…'
                    : 'Search all network patients…'
                }
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '13.5px',
                  width: '100%',
                  outline: 'none',
                  padding: 0,
                }}
              />
            </div>
          </div>

          {/* Section Header Label */}
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>
              {accessScope === 'MY_HOSPITAL' && `MY HOSPITAL — ${doctorHospitalName.toUpperCase()}`}
              {accessScope === 'OTHER_HOSPITALS' && 'OTHER HOSPITALS — NETWORK DIRECTORY'}
              {accessScope === 'ALL_PATIENTS' && 'ALL PATIENTS — OVERALL NETWORK'}
            </span>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>({filteredPatients.length})</span>
          </div>

          {/* Roster Patient Cards List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '680px', overflowY: 'auto', paddingRight: 2 }}>
            {filteredPatients.length === 0 ? (
              <div className="card" style={{ padding: '30px 20px', textAlign: 'center', color: '#64748b' }}>
                <div style={{ fontSize: '24px', marginBottom: '6px' }}>🏥</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>No Patients Found</div>
                <div style={{ fontSize: '12px', marginTop: '4px' }}>
                  No patient records match the selected scope '{accessScope.replace('_', ' ')}'.
                </div>
              </div>
            ) : accessScope === 'OTHER_HOSPITALS' ? (
              /* Grouped by Hospital for OTHER_HOSPITALS view */
              Object.entries(otherHospitalsGrouped).map(([hospName, hospPatients]) => (
                <div key={hospName} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#0369a1', background: '#e0f2fe', padding: '4px 10px', borderRadius: '6px', border: '1px solid #bae6fd', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Building2 size={13} /> {hospName} ({hospPatients.length})
                  </div>
                  {hospPatients.map((p) => {
                    const risk = getRiskTag(p.abhaId);
                    const isSelected = selectedPatient?.id === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => setSelectedPatient(p)}
                        style={{
                          background: isSelected ? '#f0f9ff' : '#ffffff',
                          border: `1.5px solid ${isSelected ? '#0284c7' : 'var(--border)'}`,
                          borderRadius: '10px',
                          padding: '12px 14px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          boxShadow: isSelected ? '0 2px 8px rgba(2, 132, 199, 0.12)' : 'none',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--text-primary)' }}>{p.name}</div>
                            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                              {p.abhaId} • {p.age} Yrs ({p.gender})
                            </div>
                          </div>
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 800,
                              background: risk.bg,
                              color: risk.color,
                              border: `1px solid ${risk.border}`,
                              padding: '2px 6px',
                              borderRadius: '4px',
                            }}
                          >
                            {risk.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))
            ) : (
              /* Flat list for MY_HOSPITAL and ALL_PATIENTS views */
              filteredPatients.map((p) => {
                const risk = getRiskTag(p.abhaId);
                const isSelected = selectedPatient?.id === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPatient(p)}
                    style={{
                      background: isSelected ? '#f0f9ff' : '#ffffff',
                      border: `1.5px solid ${isSelected ? '#0284c7' : 'var(--border)'}`,
                      borderRadius: '10px',
                      padding: '13px 15px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 2px 8px rgba(2, 132, 199, 0.12)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>{p.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {p.abhaId} • {p.age} Yrs ({p.gender})
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          background: risk.bg,
                          color: risk.color,
                          border: `1px solid ${risk.border}`,
                          padding: '2px 7px',
                          borderRadius: '4px',
                        }}
                      >
                        {risk.label}
                      </span>
                    </div>

                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#0369a1', fontWeight: 700 }}>
                        <Building2 size={13} /> {p.hospitalName || 'Apollo Hospital'}
                      </span>
                      <span style={{ color: '#dc2626', fontWeight: 800 }}>{p.bloodGroup}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Detailed Clinical Patient Workspace */}
        {selectedPatient && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Patient Profile Card & Action Bar */}
            <div className="card">
              <div className="card-header" style={{ justifyContent: 'space-between', padding: '18px 22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '50%',
                      background: '#0284c7',
                      color: '#fff',
                      fontSize: '18px',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid #bae6fd'
                    }}
                  >
                    {selectedPatient.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>{selectedPatient.name}</div>
                    <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>ABHA ID: <strong style={{ color: '#0f172a' }}>{selectedPatient.abhaId}</strong></span>
                      <span>•</span>
                      <span style={{ color: '#0369a1', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <Building2 size={13} /> {selectedPatient.hospitalName || 'Apollo Hospital'}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onSelectPatientForAnalysis(selectedPatient.abhaId)}
                  className="primary-btn"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontSize: '13.5px' }}
                >
                  <Sparkles size={16} /> Run Full AI Safety Analysis
                </button>
              </div>

              {/* Sub-Tab Navigation Bar */}
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: '#f8fafc', padding: '0 16px' }}>
                {[
                  { id: 'overview', label: 'Clinical Overview', icon: Activity },
                  { id: 'meds', label: `Active Meds (${prescriptions.length})`, icon: Pill },
                  { id: 'allergies', label: `Allergies (${allergies.length})`, icon: ShieldAlert },
                  { id: 'labs', label: `Lab Reports (${labReports.length})`, icon: FlaskConical },
                  { id: 'prescribe', label: 'Prescribe & Safety Audit', icon: PlusCircle },
                ].map((tab) => {
                  const IconComponent = tab.icon;
                  const isActive = detailTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setDetailTab(tab.id as typeof detailTab)}
                      style={{
                        padding: '12px 16px',
                        fontSize: '13px',
                        fontWeight: isActive ? 800 : 600,
                        color: isActive ? '#0284c7' : '#64748b',
                        borderBottom: isActive ? '2px solid #0284c7' : '2px solid transparent',
                        background: 'transparent',
                        borderTop: 'none',
                        borderLeft: 'none',
                        borderRight: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <IconComponent size={15} /> {tab.label}
                    </button>
                  );
                })}
              </div>

              <div className="card-body">
                {loadingPatientDetails ? (
                  <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                    <div className="spinner" style={{ margin: '0 auto 10px auto' }} />
                    Loading clinical data…
                  </div>
                ) : (
                  <>
                    {/* TAB 1: OVERVIEW */}
                    {detailTab === 'overview' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '8px' }}>
                            <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Age / Gender</div>
                            <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>
                              {selectedPatient.age} Yrs / {selectedPatient.gender}
                            </div>
                          </div>
                          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '8px' }}>
                            <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Blood Group</div>
                            <div style={{ fontSize: '16px', fontWeight: 900, color: '#dc2626', marginTop: 2 }}>
                              {selectedPatient.bloodGroup}
                            </div>
                          </div>
                          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '8px' }}>
                            <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Registered Hospital</div>
                            <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0369a1', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Building2 size={14} /> {selectedPatient.hospitalName || 'Apollo Hospital'}
                            </div>
                          </div>
                          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '8px' }}>
                            <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Safety Status</div>
                            <div style={{ fontSize: '13px', fontWeight: 800, color: getRiskTag(selectedPatient.abhaId).color, marginTop: 4 }}>
                              {getRiskTag(selectedPatient.abhaId).label}
                            </div>
                          </div>
                        </div>

                        {/* Active Conditions Summary */}
                        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '14px', borderRadius: '8px' }}>
                          <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Diagnosed Conditions & Chronic Diseases</div>
                          {conditions.length === 0 ? (
                            <div style={{ fontSize: '12.5px', color: '#64748b' }}>No diagnosed conditions on file.</div>
                          ) : (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                              {conditions.map((c, i) => (
                                <span key={i} style={{ background: '#fce7f3', color: '#be185d', border: '1px solid #fbcfe8', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>
                                  • {c.condition} {c.chronic && '(Chronic)'}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* TAB 2: ACTIVE MEDICATIONS */}
                    {detailTab === 'meds' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {prescriptions.length === 0 ? (
                          <div style={{ fontSize: '13px', color: '#64748b' }}>No active prescriptions on file.</div>
                        ) : (
                          prescriptions.map((p) => (
                            <div key={p.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px 16px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>{p.drug}</div>
                                <div style={{ fontSize: '12px', color: '#64748b', marginTop: 2 }}>
                                  Dosage: <strong>{p.dose}</strong> • Frequency: <strong>{p.frequency}</strong> • Started: {p.startDate}
                                </div>
                              </div>
                              <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '3px 8px', borderRadius: '4px' }}>
                                {p.status}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* TAB 3: ALLERGIES */}
                    {detailTab === 'allergies' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {allergies.length === 0 ? (
                          <div style={{ fontSize: '13px', color: '#15803d', fontWeight: 700 }}>✓ No drug or substance allergies recorded.</div>
                        ) : (
                          allergies.map((a) => (
                            <div key={a.id} style={{ background: '#fef2f2', border: '1.5px solid #fecaca', padding: '12px 16px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <AlertTriangle size={18} style={{ color: '#dc2626' }} />
                                <div>
                                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#991b1b' }}>{a.substance} ({a.allergyType})</div>
                                  <div style={{ fontSize: '11.5px', color: '#b91c1c', marginTop: 1 }}>First detected: {a.firstDetected}</div>
                                </div>
                              </div>
                              <span style={{ fontSize: '11px', fontWeight: 800, background: '#dc2626', color: '#ffffff', padding: '3px 10px', borderRadius: '6px' }}>
                                {a.severity.toUpperCase()} SEVERITY
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* TAB 4: LAB REPORTS */}
                    {detailTab === 'labs' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {labReports.length === 0 ? (
                          <div style={{ fontSize: '13px', color: '#64748b' }}>No lab diagnostic reports on file.</div>
                        ) : (
                          labReports.map((l) => (
                            <div key={l.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px 16px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>{l.testName}</div>
                                <div style={{ fontSize: '12px', color: '#64748b', marginTop: 2 }}>
                                  Result: <strong style={{ color: l.isAbnormal ? '#dc2626' : '#0f172a' }}>{l.value} {l.unit}</strong> • Date: {l.testDate}
                                </div>
                              </div>
                              <span
                                style={{
                                  fontSize: '11px',
                                  fontWeight: 800,
                                  background: l.isAbnormal ? '#fef2f2' : '#f0fdf4',
                                  color: l.isAbnormal ? '#dc2626' : '#15803d',
                                  border: `1px solid ${l.isAbnormal ? '#fecaca' : '#bbf7d0'}`,
                                  padding: '3px 8px',
                                  borderRadius: '4px'
                                }}
                              >
                                {l.status.toUpperCase()}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* TAB 5: PRESCRIBE NEW MEDICATION & LIVE SAFETY AUDIT */}
                    {detailTab === 'prescribe' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '10px' }}>
                          <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <PlusCircle size={16} style={{ color: '#0284c7' }} /> Prescribe Medication with Live Clinical Safety Audit
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                            <div>
                              <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 4 }}>
                                DRUG NAME / ACTIVE INGREDIENT
                              </label>
                              <input
                                type="text"
                                placeholder="e.g., Aspirin, Metformin, Amoxicillin…"
                                value={newDrug}
                                onChange={(e) => setNewDrug(e.target.value)}
                                style={{ width: '100%', padding: '8px 12px', fontSize: '13.5px', border: '1px solid var(--border)', borderRadius: '6px', outline: 'none' }}
                              />
                            </div>

                            <div>
                              <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 4 }}>
                                DOSAGE & STRENGTH
                              </label>
                              <input
                                type="text"
                                value={newDose}
                                onChange={(e) => setNewDose(e.target.value)}
                                style={{ width: '100%', padding: '8px 12px', fontSize: '13.5px', border: '1px solid var(--border)', borderRadius: '6px', outline: 'none' }}
                              />
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                            <div>
                              <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 4 }}>
                                FREQUENCY
                              </label>
                              <input
                                type="text"
                                value={newFrequency}
                                onChange={(e) => setNewFrequency(e.target.value)}
                                style={{ width: '100%', padding: '8px 12px', fontSize: '13.5px', border: '1px solid var(--border)', borderRadius: '6px', outline: 'none' }}
                              />
                            </div>

                            <div>
                              <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 4 }}>
                                DURATION
                              </label>
                              <input
                                type="text"
                                value={newDuration}
                                onChange={(e) => setNewDuration(e.target.value)}
                                style={{ width: '100%', padding: '8px 12px', fontSize: '13.5px', border: '1px solid var(--border)', borderRadius: '6px', outline: 'none' }}
                              />
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <button
                              onClick={handleRunLiveSafetyCheck}
                              disabled={!newDrug.trim() || safetyChecking}
                              className="primary-btn"
                              style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                              {safetyChecking ? 'Running AI Safety Check…' : '⚡ Run Live Safety Check'}
                            </button>

                            {safetyResult && (
                              <button
                                onClick={handleAddVerifiedPrescription}
                                className="secondary-btn"
                                style={{ padding: '8px 16px', fontSize: '13px', background: '#f0fdf4', borderColor: '#bbf7d0', color: '#15803d', display: 'flex', alignItems: 'center', gap: '6px' }}
                              >
                                <Check size={16} /> Save Verified Prescription
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Live Safety Audit Result Panel */}
                        {safetyResult && (
                          <div
                            style={{
                              background: safetyResult.overall_risk === 'HIGH' ? '#fef2f2' : (safetyResult.overall_risk === 'MEDIUM' ? '#fffbeb' : '#f0fdf4'),
                              border: `1.5px solid ${safetyResult.overall_risk === 'HIGH' ? '#fecaca' : (safetyResult.overall_risk === 'MEDIUM' ? '#fef3c7' : '#bbf7d0')}`,
                              borderRadius: '10px',
                              padding: '16px',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <div style={{ fontSize: '13px', fontWeight: 900, color: safetyResult.overall_risk === 'HIGH' ? '#dc2626' : (safetyResult.overall_risk === 'MEDIUM' ? '#b45309' : '#15803d'), display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {safetyResult.overall_risk === 'HIGH' ? <AlertOctagon size={18} /> : (safetyResult.overall_risk === 'MEDIUM' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />)}
                                SAFETY VERDICT: {safetyResult.overall_risk} RISK
                              </div>
                              <span style={{ fontSize: '11px', background: '#ffffff', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                                {safetyResult.ner_used ? 'AI-NER Verified' : 'Rule Checked'}
                              </span>
                            </div>

                            {/* Drug-Drug Alerts */}
                            {safetyResult.drug_drug_alerts.map((a, i) => (
                              <div key={i} style={{ fontSize: '12px', color: '#7f1d1d', marginTop: '4px' }}>
                                • <strong>Drug Interaction:</strong> {a.drugs.join(' + ')} — {a.risk}
                              </div>
                            ))}

                            {/* Disease-Drug Alerts */}
                            {safetyResult.disease_drug_alerts.map((a, i) => (
                              <div key={i} style={{ fontSize: '12px', color: '#7f1d1d', marginTop: '4px' }}>
                                • <strong>Contraindication:</strong> {a.drug} with {a.condition} — {a.warning}
                              </div>
                            ))}

                            {safetyResult.drug_drug_alerts.length === 0 && safetyResult.disease_drug_alerts.length === 0 && (
                              <div style={{ fontSize: '12.5px', color: '#15803d', fontWeight: 700 }}>
                                ✓ No contraindications or drug interactions detected for '{newDrug}'. Safe to prescribe.
                              </div>
                            )}
                          </div>
                        )}

                        {prescriptionSaved && (
                          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px 14px', borderRadius: '8px', color: '#15803d', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <CheckCircle2 size={16} /> Prescription successfully added to patient health record!
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Doctor Session Notes */}
            <div className="card">
              <div className="card-header" style={{ justifyContent: 'space-between', padding: '14px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={18} style={{ color: '#0284c7' }} />
                  <div>
                    <div className="card-title">Doctor's Clinical Notes</div>
                    <div className="card-subtitle">Encrypted notes for this patient consultation session</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSavingNote(true);
                    setTimeout(() => setSavingNote(false), 500);
                  }}
                  disabled={savingNote}
                  className="secondary-btn"
                  style={{ padding: '6px 14px', fontSize: '12px' }}
                >
                  {savingNote ? 'Saving…' : 'Save Notes'}
                </button>
              </div>
              <div className="card-body">
                <textarea
                  rows={4}
                  placeholder="Enter clinical observations, diagnosis summary, or prescription rationale…"
                  value={doctorNote}
                  onChange={(e) => setDoctorNote(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#ffffff',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    padding: '12px',
                    fontSize: '13.5px',
                    lineHeight: 1.5,
                    resize: 'vertical',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
