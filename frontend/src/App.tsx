import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LoginPage } from './pages/LoginPage';
import { PatientDashboardPage } from './pages/PatientDashboardPage';
import { HealthCard } from './components/HealthCard';
import { DoctorDashboardPage } from './pages/DoctorDashboardPage';
import { AnalysePage } from './pages/AnalysePage';
import { EmergencyScanPage } from './pages/EmergencyScanPage';
import { getDataService, type User, type Patient } from './services';

export function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('patient-dashboard');
  const [emergencyToken, setEmergencyToken] = useState<string | undefined>(undefined);
  const [patientProfile, setPatientProfile] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initApp();

    const handleUrlRouting = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;

      if (path.includes('/emergency/')) {
        const parts = path.split('/emergency/');
        if (parts.length > 1 && parts[1].trim()) {
          setEmergencyToken(parts[1].trim());
        }
        setActiveTab('emergency');
        return;
      }

      if (hash.startsWith('#emergency')) {
        const parts = hash.split('-');
        if (parts.length > 1 && parts[1].trim()) {
          setEmergencyToken(parts.slice(1).join('-'));
        }
        setActiveTab('emergency');
        return;
      }
    };

    handleUrlRouting();
    window.addEventListener('hashchange', handleUrlRouting);
    window.addEventListener('popstate', handleUrlRouting);
    return () => {
      window.removeEventListener('hashchange', handleUrlRouting);
      window.removeEventListener('popstate', handleUrlRouting);
    };
  }, []);

  const initApp = async () => {
    setLoading(true);
    try {
      const service = getDataService();
      const u = service.getCurrentUser() || service.restoreSession();
      setCurrentUser(u);
      if (u) {
        if (u.role === 'DOCTOR') setActiveTab('doctor-dashboard');
        else setActiveTab('patient-dashboard');
        loadPatientInfo(u);
      } else {
        setActiveTab('login');
      }
    } catch (err) {
      console.error('Failed to init app user state:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPatientInfo = async (u: User) => {
    try {
      const service = getDataService();
      const p = await service.getPatientByUserId(u.id) || await service.getPatientById('patient-001');
      setPatientProfile(p);
    } catch (err) {
      console.error('Failed to load patient info for health card', err);
    }
  };

  const handleUserChange = (u: User | null) => {
    setCurrentUser(u);
    if (u) {
      loadPatientInfo(u);
      if (u.role === 'DOCTOR') setActiveTab('doctor-dashboard');
      else setActiveTab('patient-dashboard');
    } else {
      setActiveTab('login');
    }
  };

  const [selectedAnalysisAbhaId, setSelectedAnalysisAbhaId] = useState<string | null>(null);

  const handleDoctorSelectAnalysis = (abhaId: string) => {
    setSelectedAnalysisAbhaId(abhaId);
    setActiveTab('analyse');
  };

  if (loading) {
    return (
      <div style={{ background: 'var(--bg-base)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 16px auto' }} />
          <div style={{ fontSize: '14px', fontWeight: 600 }}>Loading JeevanRaksha Safety System…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Header
        currentUser={currentUser}
        onUserChange={handleUserChange}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main style={{ padding: '24px 16px' }}>
        {activeTab === 'login' && <LoginPage onLoginSuccess={handleUserChange} />}

        {activeTab === 'patient-dashboard' && (
          currentUser ? (
            <PatientDashboardPage currentUser={currentUser} onNavigateTab={setActiveTab} />
          ) : (
            <LoginPage onLoginSuccess={handleUserChange} />
          )
        )}

        {activeTab === 'health-card' && (
          patientProfile ? (
            <HealthCard patient={patientProfile} />
          ) : (
            <div className="card" style={{ padding: 40, textAlign: 'center', maxWidth: 600, margin: '20px auto' }}>
              <h3>No Health Card Profile Found</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 8 }}>Please sign in with a patient account.</p>
              <button className="primary-btn" style={{ marginTop: 16 }} onClick={() => setActiveTab('login')}>Sign In</button>
            </div>
          )
        )}

        {activeTab === 'doctor-dashboard' && (
          currentUser?.role === 'DOCTOR' || currentUser?.role === 'ADMIN' ? (
            <DoctorDashboardPage
              currentUser={currentUser}
              onSelectPatientForAnalysis={handleDoctorSelectAnalysis}
            />
          ) : (
            <div className="card" style={{ padding: 40, textAlign: 'center', maxWidth: 540, margin: '30px auto', borderColor: '#bae6fd', background: '#f0f9ff' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🩺</div>
              <h3 style={{ color: '#0369a1', fontSize: 18, fontWeight: 700 }}>Doctor Portal Access Restricted</h3>
              <p style={{ color: '#475569', fontSize: 13, marginTop: 8, lineHeight: 1.5 }}>
                You are currently signed in as a <strong>PATIENT ({currentUser?.fullName})</strong>. The Doctor Roster and Clinical Decision Support portal are restricted to verified medical practitioners.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 20 }}>
                <button className="secondary-btn" onClick={() => setActiveTab('patient-dashboard')}>Return to My Health Record</button>
                <button className="primary-btn" onClick={() => setActiveTab('login')}>Switch Account</button>
              </div>
            </div>
          )
        )}

        {activeTab === 'analyse' && (
          currentUser?.role === 'DOCTOR' || currentUser?.role === 'ADMIN' ? (
            <AnalysePage
              initialAbhaId={selectedAnalysisAbhaId}
              onBackToDoctorPortal={() => setActiveTab('doctor-dashboard')}
            />
          ) : (
            <div className="card" style={{ padding: 40, textAlign: 'center', maxWidth: 540, margin: '30px auto', borderColor: '#bae6fd', background: '#f0f9ff' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🧠</div>
              <h3 style={{ color: '#0369a1', fontSize: 18, fontWeight: 700 }}>Clinical Safety Engine Restricted</h3>
              <p style={{ color: '#475569', fontSize: 13, marginTop: 8, lineHeight: 1.5 }}>
                The AI-NER Clinical Safety Engine requires clinical credentials (DOCTOR or ADMIN role).
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 20 }}>
                <button className="secondary-btn" onClick={() => setActiveTab('patient-dashboard')}>Return to My Health Record</button>
                <button className="primary-btn" onClick={() => setActiveTab('login')}>Switch to Doctor Persona</button>
              </div>
            </div>
          )
        )}

        {activeTab === 'emergency' && (
          <EmergencyScanPage
            tokenStr={emergencyToken}
            onBack={() => setActiveTab(currentUser ? (currentUser.role === 'DOCTOR' ? 'doctor-dashboard' : 'patient-dashboard') : 'login')}
          />
        )}
      </main>
    </div>
  );
}

export default App;
