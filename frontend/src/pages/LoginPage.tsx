import React, { useState } from 'react';
import { Shield, Sparkles, Stethoscope, ArrowRight } from 'lucide-react';
import { getDataService, type User } from '../services';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState<User['role']>('PATIENT');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const service = getDataService();
      let user: User;
      if (isRegister) {
        user = await service.signUp({
          email,
          password,
          fullName: fullName || email.split('@')[0],
          role,
        });
      } else {
        user = await service.signIn(email, password);
      }
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoPersona = async (demoEmail: string) => {
    setLoading(true);
    setError(null);
    try {
      const service = getDataService();
      const user = await service.signIn(demoEmail, 'Demo@2026');
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '900px', margin: '20px auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#e0f2fe', border: '1px solid #bae6fd', padding: '6px 14px', borderRadius: '20px', color: '#0284c7', fontSize: '12px', fontWeight: 700, marginBottom: '12px' }}>
          <Shield size={15} /> JeevanRaksha Medical Safety System
        </div>
        <h1 style={{ fontSize: '30px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: '4px 0 8px 0' }}>
          Welcome to JeevanRaksha
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '540px', margin: '0 auto' }}>
          Sign in or select a demo persona to experience full clinical safety decision support & emergency QR workflows.
        </p>
      </div>

      {/* Grid: 1-Click Demo Personas / Standard Form */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '24px' }}>
        {/* Left: Hackathon 1-Click Demo Personas */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={16} /> 1-Click Demo Personas
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Persona 1: Priya Mehta (High Risk) */}
            <div
              onClick={() => handleDemoPersona('patient@demo.jr')}
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '10px',
                padding: '16px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#dc2626' }} />
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>Priya Mehta (Patient)</div>
                    <div style={{ fontSize: '12px', color: '#dc2626', fontWeight: 600 }}>JR-2026-PM001 • HIGH Bleeding Risk Scenario</div>
                  </div>
                </div>
                <ArrowRight size={16} style={{ color: '#dc2626' }} />
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
                Prescribed Warfarin 5mg + Aspirin 100mg + Ibuprofen 400mg. Severe Penicillin allergy.
              </div>
            </div>

            {/* Persona 2: Arjun Singh (Medium Risk) */}
            <div
              onClick={() => handleDemoPersona('patient2@demo.jr')}
              style={{
                background: '#fffbeb',
                border: '1px solid #fef3c7',
                borderRadius: '10px',
                padding: '16px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#b45309' }} />
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>Arjun Singh (Patient)</div>
                    <div style={{ fontSize: '12px', color: '#b45309', fontWeight: 600 }}>JR-2026-AS002 • MEDIUM Risk Scenario</div>
                  </div>
                </div>
                <ArrowRight size={16} style={{ color: '#b45309' }} />
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
                Heart Disease + Diabetes. Prescribed Atorvastatin & Metoprolol.
              </div>
            </div>

            {/* Persona 3: Dr. Arjun Sharma (Doctor) */}
            <div
              onClick={() => handleDemoPersona('doctor@demo.jr')}
              style={{
                background: '#f0f9ff',
                border: '1px solid #bae6fd',
                borderRadius: '10px',
                padding: '16px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Stethoscope size={18} style={{ color: '#0284c7' }} />
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>Dr. Arjun Sharma (Doctor)</div>
                    <div style={{ fontSize: '12px', color: '#0284c7', fontWeight: 600 }}>Apollo Hospital • Lead Physician</div>
                  </div>
                </div>
                <ArrowRight size={16} style={{ color: '#0284c7' }} />
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
                Full access to Clinical Safety Engine, NER analysis, and patient records.
              </div>
            </div>
          </div>
        </div>

        {/* Right: Standard Login / Register Form */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>
            {isRegister ? 'Create Account' : 'Account Sign In'}
          </h3>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px', borderRadius: '6px', fontSize: '12px', marginBottom: '14px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {isRegister && (
              <>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Full Name</label>
                  <input
                    type="text"
                    placeholder="Dr. John Doe / Jane Smith"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    style={{ width: '100%', marginTop: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Account Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as User['role'])}
                    style={{ width: '100%', marginTop: '4px' }}
                  >
                    <option value="PATIENT">Patient</option>
                    <option value="DOCTOR">Doctor / Physician</option>
                    <option value="ADMIN">Hospital Admin</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Email Address</label>
              <input
                type="email"
                placeholder="user@demo.jr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: '100%', marginTop: '4px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: '100%', marginTop: '4px' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="primary-btn"
              style={{ width: '100%', marginTop: '6px', padding: '10px' }}
            >
              {loading ? 'Authenticating…' : isRegister ? 'Register' : 'Sign In'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <button
              onClick={() => setIsRegister(!isRegister)}
              style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}
            >
              {isRegister ? 'Already have an account? Sign In' : 'Need an account? Register'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
