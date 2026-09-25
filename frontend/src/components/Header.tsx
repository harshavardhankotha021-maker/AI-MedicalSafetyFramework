import React, { useState, useEffect } from 'react';
import { Shield, Sparkles, User as UserIcon, RefreshCw, AlertTriangle, Stethoscope, HeartPulse } from 'lucide-react';
import { getDataService, getDataMode, setDataMode, isFirebaseConfigured, type User } from '../services';

interface HeaderProps {
  currentUser: User | null;
  onUserChange: (user: User | null) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentUser, onUserChange, activeTab, setActiveTab }) => {
  const [dataMode, setMode] = useState<'MOCK' | 'FIREBASE'>(getDataMode());
  const [showDemoMenu, setShowDemoMenu] = useState(false);

  useEffect(() => {
    const handleModeChange = (e: CustomEvent<'MOCK' | 'FIREBASE'>) => {
      setMode(e.detail);
    };
    window.addEventListener('jr-mode-change', handleModeChange as EventListener);
    return () => window.removeEventListener('jr-mode-change', handleModeChange as EventListener);
  }, []);

  const handleToggleMode = () => {
    const nextMode = dataMode === 'MOCK' ? 'FIREBASE' : 'MOCK';
    if (nextMode === 'FIREBASE' && !isFirebaseConfigured()) {
      alert(
        'Note: Firebase environment variables are not set. The system will use Firebase SDK with project fallback. Switch to Mock Mode anytime for synthetic demo data!'
      );
    }
    setDataMode(nextMode);
    setMode(nextMode);
  };

  const handleQuickLogin = async (email: string) => {
    const service = getDataService();
    const u = await service.signIn(email, 'Demo@2026');
    onUserChange(u);
    setShowDemoMenu(false);
    if (u.role === 'PATIENT') setActiveTab('patient-dashboard');
    else if (u.role === 'DOCTOR') setActiveTab('doctor-dashboard');
    else setActiveTab('patient-dashboard');
  };

  return (
    <header className="navbar-header">
      {/* Brand */}
      <div 
        onClick={() => setActiveTab(currentUser?.role === 'DOCTOR' ? 'doctor-dashboard' : 'patient-dashboard')}
        style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
      >
        <div style={{
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)',
        }}>
          <Shield style={{ width: '20px', height: '20px', color: '#ffffff' }} />
        </div>
        <div>
          <div style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '6px' }}>
            JeevanRaksha <span style={{ fontSize: '10px', fontWeight: 700, background: '#e0f2fe', color: '#0284c7', padding: '2px 6px', borderRadius: '4px', border: '1px solid #bae6fd' }}>Medical Safety</span>
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>Clinical Safety & Emergency Network</div>
        </div>
      </div>

      {/* Nav Links */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {currentUser?.role === 'PATIENT' && (
          <>
            <button
              onClick={() => setActiveTab('patient-dashboard')}
              className={`nav-btn ${activeTab === 'patient-dashboard' ? 'active' : ''}`}
            >
              <HeartPulse size={16} /> My Health Record
            </button>
            <button
              onClick={() => setActiveTab('health-card')}
              className={`nav-btn ${activeTab === 'health-card' ? 'active' : ''}`}
            >
              <Shield size={16} /> Digital Health Card
            </button>
          </>
        )}

        {currentUser?.role === 'DOCTOR' && (
          <>
            <button
              onClick={() => setActiveTab('doctor-dashboard')}
              className={`nav-btn ${activeTab === 'doctor-dashboard' ? 'active' : ''}`}
            >
              <Stethoscope size={16} /> Doctor Portal
            </button>
            <button
              onClick={() => setActiveTab('analyse')}
              className={`nav-btn ${activeTab === 'analyse' ? 'active' : ''}`}
            >
              <Sparkles size={16} /> Clinical Safety Engine
            </button>
          </>
        )}

        {/* Emergency Simulator button */}
        <button
          onClick={() => setActiveTab('emergency')}
          style={{
            background: '#fef2f2',
            color: '#dc2626',
            border: '1px solid #fecaca',
            padding: '6px 14px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <AlertTriangle size={15} /> Emergency QR Scan (Public)
        </button>
      </nav>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Mode Switcher Toggle */}
        <div
          onClick={handleToggleMode}
          title="Click to toggle between Synthetic Mock Data and Firebase Firestore"
          style={{
            background: dataMode === 'MOCK' ? '#f0f9ff' : '#fffbeb',
            border: `1px solid ${dataMode === 'MOCK' ? '#bae6fd' : '#fef3c7'}`,
            color: dataMode === 'MOCK' ? '#0284c7' : '#b45309',
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            userSelect: 'none',
          }}
        >
          <RefreshCw size={13} />
          {dataMode === 'MOCK' ? '🧪 Mock Mode' : '🔥 Firebase Mode'}
        </div>

        {/* User Account / Persona Switcher */}
        {currentUser ? (
          <div style={{ position: 'relative' }}>
            <div
              onClick={() => setShowDemoMenu(!showDemoMenu)}
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                padding: '4px 12px 4px 6px',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
              }}
            >
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: currentUser.role === 'DOCTOR' ? '#0284c7' : '#16a34a',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {currentUser.fullName ? currentUser.fullName.charAt(0) : 'U'}
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', lineHeight: 1.1 }}>{currentUser.fullName}</div>
                <div style={{ fontSize: '10px', color: '#64748b' }}>{currentUser.role}</div>
              </div>
            </div>

            {/* Dropdown for quick persona switching */}
            {showDemoMenu && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: '44px',
                width: '270px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '12px',
                padding: '8px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                zIndex: 1000,
              }}>
                <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, padding: '4px 8px' }}>
                  Switch Demo Persona
                </div>
                <div 
                  onClick={() => handleQuickLogin('patient@demo.jr')}
                  className="demo-item"
                >
                  <div className="demo-dot red" />
                  <div>
                    <div style={{ fontSize: '13px', color: '#0f172a', fontWeight: 600 }}>Priya Mehta</div>
                    <div style={{ fontSize: '11px', color: '#dc2626' }}>Patient · HIGH Risk (Warfarin)</div>
                  </div>
                </div>

                <div 
                  onClick={() => handleQuickLogin('patient2@demo.jr')}
                  className="demo-item"
                >
                  <div className="demo-dot yellow" />
                  <div>
                    <div style={{ fontSize: '13px', color: '#0f172a', fontWeight: 600 }}>Arjun Singh</div>
                    <div style={{ fontSize: '11px', color: '#b45309' }}>Patient · MEDIUM Risk</div>
                  </div>
                </div>

                <div 
                  onClick={() => handleQuickLogin('patient3@demo.jr')}
                  className="demo-item"
                >
                  <div className="demo-dot green" />
                  <div>
                    <div style={{ fontSize: '13px', color: '#0f172a', fontWeight: 600 }}>Sunita Patel</div>
                    <div style={{ fontSize: '11px', color: '#15803d' }}>Patient · SAFE</div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #e2e8f0', margin: '6px 0' }} />

                <div 
                  onClick={() => handleQuickLogin('doctor@demo.jr')}
                  className="demo-item"
                >
                  <UserIcon size={14} style={{ color: '#0284c7' }} />
                  <div>
                    <div style={{ fontSize: '13px', color: '#0f172a', fontWeight: 600 }}>Dr. Arjun Sharma</div>
                    <div style={{ fontSize: '11px', color: '#0284c7' }}>Doctor · Apollo Hospital</div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #e2e8f0', margin: '6px 0' }} />

                <button
                  onClick={async () => {
                    const service = getDataService();
                    await service.signOut();
                    onUserChange(null);
                    setShowDemoMenu(false);
                    setActiveTab('login');
                  }}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid #fecaca',
                    background: '#fef2f2',
                    color: '#dc2626',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setActiveTab('login')}
            className="primary-btn"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};
