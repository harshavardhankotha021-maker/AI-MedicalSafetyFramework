/**
 * JeevanRaksha – MockService
 *
 * Full in-memory implementation of DataService using synthetic mock data.
 * Persists modifications in localStorage so additions/updates persist across page reloads.
 */

import type { DataService } from '../DataService';
import type {
  User, UserRole, Patient, Prescription, Allergy, Condition,
  LabReport, EmergencyContact, HealthCard, QRToken, AuditLog,
  EmergencyData, AuditEventType,
} from '../types';
import {
  MOCK_USERS, MOCK_PATIENTS, MOCK_PRESCRIPTIONS,
  MOCK_ALLERGIES, MOCK_CONDITIONS, MOCK_LAB_REPORTS,
  MOCK_EMERGENCY_CONTACTS, MOCK_HEALTH_CARDS, MOCK_QR_TOKENS, MOCK_AUDIT_LOGS,
} from './mockData';

const STORAGE_KEYS = {
  CURRENT_USER: 'jr_mock_current_user',
  PATIENTS: 'jr_mock_patients',
  PRESCRIPTIONS: 'jr_mock_prescriptions',
  ALLERGIES: 'jr_mock_allergies',
  CONDITIONS: 'jr_mock_conditions',
  LAB_REPORTS: 'jr_mock_lab_reports',
  EMERGENCY_CONTACTS: 'jr_mock_emergency_contacts',
  HEALTH_CARDS: 'jr_mock_health_cards',
  QR_TOKENS: 'jr_mock_qr_tokens',
  AUDIT_LOGS: 'jr_mock_audit_logs',
};

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn('Failed to save to localStorage', err);
  }
}

export class MockService implements DataService {
  private currentUser: User | null = null;
  private patients: Patient[] = [];
  private prescriptions: Prescription[] = [];
  private allergies: Allergy[] = [];
  private conditions: Condition[] = [];
  private labReports: LabReport[] = [];
  private emergencyContacts: EmergencyContact[] = [];
  private healthCards: HealthCard[] = [];
  private qrTokens: QRToken[] = [];
  private auditLogs: AuditLog[] = [];

  constructor() {
    this.currentUser = loadStorage<User | null>(STORAGE_KEYS.CURRENT_USER, MOCK_USERS[0]);
    const storedPatients = loadStorage<Patient[]>(STORAGE_KEYS.PATIENTS, MOCK_PATIENTS);
    if (storedPatients.length < MOCK_PATIENTS.length) {
      this.patients = MOCK_PATIENTS;
      this.healthCards = MOCK_HEALTH_CARDS;
      this.qrTokens = MOCK_QR_TOKENS;
      saveStorage(STORAGE_KEYS.PATIENTS, MOCK_PATIENTS);
      saveStorage(STORAGE_KEYS.HEALTH_CARDS, MOCK_HEALTH_CARDS);
      saveStorage(STORAGE_KEYS.QR_TOKENS, MOCK_QR_TOKENS);
    } else {
      this.patients = storedPatients;
      this.healthCards = loadStorage<HealthCard[]>(STORAGE_KEYS.HEALTH_CARDS, MOCK_HEALTH_CARDS);
      this.qrTokens = loadStorage<QRToken[]>(STORAGE_KEYS.QR_TOKENS, MOCK_QR_TOKENS);
    }
    this.prescriptions = loadStorage<Prescription[]>(STORAGE_KEYS.PRESCRIPTIONS, MOCK_PRESCRIPTIONS);
    this.allergies = loadStorage<Allergy[]>(STORAGE_KEYS.ALLERGIES, MOCK_ALLERGIES);
    this.conditions = loadStorage<Condition[]>(STORAGE_KEYS.CONDITIONS, MOCK_CONDITIONS);
    this.labReports = loadStorage<LabReport[]>(STORAGE_KEYS.LAB_REPORTS, MOCK_LAB_REPORTS);
    this.emergencyContacts = loadStorage<EmergencyContact[]>(STORAGE_KEYS.EMERGENCY_CONTACTS, MOCK_EMERGENCY_CONTACTS);
    this.auditLogs = loadStorage<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, MOCK_AUDIT_LOGS);
  }

  private persist() {
    saveStorage(STORAGE_KEYS.PATIENTS, this.patients);
    saveStorage(STORAGE_KEYS.PRESCRIPTIONS, this.prescriptions);
    saveStorage(STORAGE_KEYS.ALLERGIES, this.allergies);
    saveStorage(STORAGE_KEYS.CONDITIONS, this.conditions);
    saveStorage(STORAGE_KEYS.LAB_REPORTS, this.labReports);
    saveStorage(STORAGE_KEYS.EMERGENCY_CONTACTS, this.emergencyContacts);
    saveStorage(STORAGE_KEYS.HEALTH_CARDS, this.healthCards);
    saveStorage(STORAGE_KEYS.QR_TOKENS, this.qrTokens);
    saveStorage(STORAGE_KEYS.AUDIT_LOGS, this.auditLogs);
  }

  // ── Auth ─────────────────────────────────────────────────────────────────

  async signIn(email: string): Promise<User> {
    const user = MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      const newUser: User = {
        id: `user_${Date.now()}`,
        email,
        fullName: email.split('@')[0],
        role: 'PATIENT',
        createdAt: new Date().toISOString(),
      };
      this.currentUser = newUser;
      saveStorage(STORAGE_KEYS.CURRENT_USER, newUser);
      return newUser;
    }
    this.currentUser = user;
    saveStorage(STORAGE_KEYS.CURRENT_USER, user);
    return user;
  }

  async signUp(params: {
    email: string;
    password?: string;
    fullName: string;
    role: UserRole;
    age?: number;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
    bloodGroup?: string;
    hospitalName?: string;
  }): Promise<User> {
    const existing = MOCK_USERS.find((u) => u.email.toLowerCase() === params.email.toLowerCase());
    if (existing) {
      this.currentUser = existing;
      saveStorage(STORAGE_KEYS.CURRENT_USER, existing);
      return existing;
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      email: params.email,
      fullName: params.fullName,
      role: params.role,
      hospitalId: params.hospitalName,
      createdAt: new Date().toISOString(),
    };

    if (params.role === 'PATIENT') {
      const patientId = `patient_${Date.now()}`;
      const abhaId = `ABHA-${Math.floor(100 + Math.random() * 900)}`;
      const newPatient: Patient = {
        id: patientId,
        userId: newUser.id,
        abhaId,
        name: params.fullName,
        age: params.age || 35,
        gender: params.gender || 'MALE',
        bloodGroup: params.bloodGroup || 'O+',
        hospitalName: params.hospitalName || 'Apollo Hospital',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.patients.unshift(newPatient);

      const cardNum = `JR-2026-${Math.floor(10000 + Math.random() * 90000)}`;
      this.healthCards.push({
        id: `hc_${Date.now()}`,
        patientId,
        cardNumber: cardNum,
        issuedAt: new Date().toISOString(),
        isActive: true,
      });

      this.qrTokens.push({
        id: `qrt_${Date.now()}`,
        patientId,
        token: `jr2026_${patientId}_${Math.random().toString(36).substring(2, 10)}`,
        issuedAt: new Date().toISOString(),
        revoked: false,
        scanCount: 0,
      });
    }

    MOCK_USERS.push(newUser);
    this.currentUser = newUser;
    saveStorage(STORAGE_KEYS.CURRENT_USER, newUser);
    this.persist();
    return newUser;
  }

  async signOut(): Promise<void> {
    this.currentUser = null;
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  restoreSession(): User | null {
    this.currentUser = loadStorage<User | null>(STORAGE_KEYS.CURRENT_USER, MOCK_USERS[0]);
    return this.currentUser;
  }

  // ── Patient ──────────────────────────────────────────────────────────────

  async getPatientByUserId(userId: string): Promise<Patient | null> {
    return this.patients.find((p) => p.userId === userId) || null;
  }

  async getPatientById(patientId: string): Promise<Patient | null> {
    return this.patients.find((p) => p.id === patientId || p.abhaId === patientId) || null;
  }

  async updatePatient(patientId: string, data: Partial<Omit<Patient, 'id' | 'userId' | 'abhaId' | 'createdAt'>>): Promise<void> {
    const idx = this.patients.findIndex((p) => p.id === patientId);
    if (idx !== -1) {
      this.patients[idx] = { ...this.patients[idx], ...data, updatedAt: new Date().toISOString() };
      this.persist();
    }
  }

  async searchPatients(query: string): Promise<Patient[]> {
    let q = query.toLowerCase().trim();
    if (!q) return [...this.patients];

    if (q.includes('/emergency/')) {
      q = q.split('/emergency/')[1].split('/')[0].split('?')[0].trim();
    } else if (q.includes('#emergency-')) {
      q = q.split('#emergency-')[1].trim();
    }

    return this.patients.filter((p) => {
      const matchName = p.name.toLowerCase().includes(q);
      const matchAbha = p.abhaId.toLowerCase().includes(q);
      const matchId = p.id.toLowerCase().includes(q);
      const matchHospital = (p.hospitalName || '').toLowerCase().includes(q);
      
      const card = this.healthCards.find((h) => h.patientId === p.id);
      const matchCard = card ? card.cardNumber.toLowerCase().includes(q) : false;

      const qrToken = this.qrTokens.find((t) => t.patientId === p.id && !t.revoked);
      const matchQR = qrToken ? qrToken.token.toLowerCase().includes(q) : false;

      return matchName || matchAbha || matchId || matchHospital || matchCard || matchQR;
    });
  }

  async getAllPatients(): Promise<Patient[]> {
    return [...this.patients];
  }

  // ── Allergies ────────────────────────────────────────────────────────────

  async getAllergies(patientId: string): Promise<Allergy[]> {
    return this.allergies.filter((a) => a.patientId === patientId);
  }

  async addAllergy(patientId: string, data: Omit<Allergy, 'id' | 'patientId'>): Promise<Allergy> {
    const newA: Allergy = { id: `alg_${Date.now()}`, patientId, ...data };
    this.allergies.push(newA);
    this.persist();
    return newA;
  }

  async deleteAllergy(allergyId: string): Promise<void> {
    this.allergies = this.allergies.filter((a) => a.id !== allergyId);
    this.persist();
  }

  // ── Conditions ───────────────────────────────────────────────────────────

  async getConditions(patientId: string): Promise<Condition[]> {
    return this.conditions.filter((c) => c.patientId === patientId);
  }

  async addCondition(patientId: string, data: Omit<Condition, 'id' | 'patientId'>): Promise<Condition> {
    const newC: Condition = { id: `cnd_${Date.now()}`, patientId, ...data };
    this.conditions.push(newC);
    this.persist();
    return newC;
  }

  async deleteCondition(conditionId: string): Promise<void> {
    this.conditions = this.conditions.filter((c) => c.id !== conditionId);
    this.persist();
  }

  // ── Prescriptions ─────────────────────────────────────────────────────────

  async getPrescriptions(patientId: string, activeOnly = false): Promise<Prescription[]> {
    let res = this.prescriptions.filter((p) => p.patientId === patientId);
    if (activeOnly) res = res.filter((p) => p.status === 'ACTIVE');
    return res;
  }

  async addPrescription(patientId: string, data: Omit<Prescription, 'id' | 'patientId'>): Promise<Prescription> {
    const newRx: Prescription = { id: `rx_${Date.now()}`, patientId, ...data };
    this.prescriptions.push(newRx);
    this.persist();
    return newRx;
  }

  async updatePrescription(prescriptionId: string, data: Partial<Prescription>): Promise<void> {
    const idx = this.prescriptions.findIndex((p) => p.id === prescriptionId);
    if (idx !== -1) {
      this.prescriptions[idx] = { ...this.prescriptions[idx], ...data };
      this.persist();
    }
  }

  async deletePrescription(prescriptionId: string): Promise<void> {
    this.prescriptions = this.prescriptions.filter((p) => p.id !== prescriptionId);
    this.persist();
  }

  // ── Lab Reports ───────────────────────────────────────────────────────────

  async getLabReports(patientId: string): Promise<LabReport[]> {
    return this.labReports.filter((l) => l.patientId === patientId);
  }

  async addLabReport(patientId: string, data: Omit<LabReport, 'id' | 'patientId'>): Promise<LabReport> {
    const newLab: LabReport = { id: `lab_${Date.now()}`, patientId, ...data };
    this.labReports.push(newLab);
    this.persist();
    return newLab;
  }

  // ── Emergency Contacts ────────────────────────────────────────────────────

  async getEmergencyContacts(patientId: string): Promise<EmergencyContact[]> {
    return this.emergencyContacts.filter((e) => e.patientId === patientId).sort((a, b) => a.priority - b.priority);
  }

  async addEmergencyContact(patientId: string, data: Omit<EmergencyContact, 'id' | 'patientId'>): Promise<EmergencyContact> {
    const newE: EmergencyContact = { id: `ec_${Date.now()}`, patientId, ...data };
    this.emergencyContacts.push(newE);
    this.persist();
    return newE;
  }

  async deleteEmergencyContact(contactId: string): Promise<void> {
    this.emergencyContacts = this.emergencyContacts.filter((e) => e.id !== contactId);
    this.persist();
  }

  // ── Health Card ───────────────────────────────────────────────────────────

  async getHealthCard(patientId: string): Promise<HealthCard | null> {
    return this.healthCards.find((h) => h.patientId === patientId && h.isActive) || null;
  }

  // ── QR Token ──────────────────────────────────────────────────────────────

  async getActiveQRToken(patientId: string): Promise<QRToken | null> {
    return this.qrTokens.find((t) => t.patientId === patientId && !t.revoked) || null;
  }

  async generateQRToken(patientId: string): Promise<QRToken> {
    this.qrTokens.forEach((t) => {
      if (t.patientId === patientId) t.revoked = true;
    });
    const newToken: QRToken = {
      id: `qrt_${Date.now()}`,
      patientId,
      token: `jr2026_${patientId}_${Math.random().toString(36).substring(2, 12)}`,
      issuedAt: new Date().toISOString(),
      revoked: false,
      scanCount: 0,
    };
    this.qrTokens.push(newToken);
    this.persist();
    return newToken;
  }

  async revokeQRToken(tokenId: string): Promise<void> {
    const tok = this.qrTokens.find((t) => t.id === tokenId);
    if (tok) {
      tok.revoked = true;
      this.persist();
    }
  }

  // ── Emergency Access ──────────────────────────────────────────────────────

  async getEmergencyData(tokenStr: string): Promise<EmergencyData | null> {
    let cleanToken = tokenStr.trim().toLowerCase();
    
    // Extract token if full URL or hash path was passed (e.g. http://localhost:5173/emergency/jr2026pm...)
    if (cleanToken.includes('/emergency/')) {
      cleanToken = cleanToken.split('/emergency/')[1].split('/')[0].split('?')[0].trim();
    } else if (cleanToken.includes('#emergency-')) {
      cleanToken = cleanToken.split('#emergency-')[1].trim();
    }
    
    // 1. Exact match
    let qr = this.qrTokens.find((t) => t.token.toLowerCase() === cleanToken && !t.revoked);
    
    // 2. Flexible match by patientId, abhaId, healthCard, or demo string
    if (!qr) {
      const cardMatch = this.healthCards.find((h) => h.cardNumber.toLowerCase() === cleanToken);
      const matchedPatient = this.patients.find((p) =>
        p.id.toLowerCase() === cleanToken ||
        p.abhaId.toLowerCase() === cleanToken ||
        p.abhaId.toLowerCase().includes(cleanToken) ||
        (cardMatch && cardMatch.patientId === p.id) ||
        cleanToken.includes(p.id.toLowerCase()) ||
        cleanToken.includes(p.abhaId.toLowerCase().replace(/[^a-z0-9]/g, '')) ||
        cleanToken.includes('pm001') ||
        cleanToken.includes('patient-001') ||
        cleanToken.includes('demo')
      );
      if (matchedPatient) {
        qr = this.qrTokens.find((t) => t.patientId === matchedPatient.id && !t.revoked) || this.qrTokens[0];
      }
    }

    if (!qr) return null;

    const patient = this.patients.find((p) => p.id === qr.patientId);
    if (!patient) return null;

    qr.scanCount += 1;
    qr.lastScannedAt = new Date().toISOString();

    const allergies = this.allergies.filter((a) => a.patientId === patient.id && (a.severity === 'SEVERE' || a.severity === 'LIFE_THREATENING'));
    const conditions = this.conditions.filter((c) => c.patientId === patient.id && c.status === 'ONGOING');
    const prescriptions = this.prescriptions.filter((p) => p.patientId === patient.id && p.status === 'ACTIVE');
    const contacts = this.emergencyContacts.filter((e) => e.patientId === patient.id).sort((a, b) => a.priority - b.priority);
    const card = this.healthCards.find((h) => h.patientId === patient.id);

    // Audit log
    this.logAuditEvent({
      patientId: patient.id,
      accessType: 'EMERGENCY_QR_ACCESSED',
      tokenUsed: tokenStr,
      details: 'Public emergency scan view',
    });

    return {
      patientName: patient.name,
      age: patient.age,
      gender: patient.gender,
      bloodGroup: patient.bloodGroup,
      photoUrl: patient.photoUrl,
      criticalAllergies: allergies.map((a) => ({ substance: a.substance, severity: a.severity, allergyType: a.allergyType })),
      criticalConditions: conditions.map((c) => ({ condition: c.condition, chronic: c.chronic, status: c.status })),
      criticalMedications: prescriptions.map((p) => ({ drug: p.drug, dose: p.dose, frequency: p.frequency })),
      primaryEmergencyContact: contacts.length > 0 ? { name: contacts[0].name, relationship: contacts[0].relationship, phone: contacts[0].phone } : undefined,
      healthCardNumber: card ? card.cardNumber : 'JR-2026-00000',
      abhaId: patient.abhaId,
      lastUpdated: patient.updatedAt,
    };
  }

  // ── Audit ─────────────────────────────────────────────────────────────────

  async logAuditEvent(event: {
    patientId: string;
    accessedBy?: string;
    accessorName?: string;
    accessorRole?: any;
    accessType: AuditEventType;
    tokenUsed?: string;
    details?: string;
  }): Promise<void> {
    const newLog: AuditLog = {
      id: `log_${Date.now()}`,
      patientId: event.patientId,
      accessedBy: event.accessedBy,
      accessorName: event.accessorName,
      accessorRole: event.accessorRole,
      accessType: event.accessType,
      tokenUsed: event.tokenUsed,
      accessedAt: new Date().toISOString(),
      details: event.details,
    };
    this.auditLogs.unshift(newLog);
    this.persist();
  }

  async getAuditLogs(patientId: string): Promise<AuditLog[]> {
    return this.auditLogs.filter((l) => l.patientId === patientId);
  }

  async getAllAuditLogs(): Promise<AuditLog[]> {
    return [...this.auditLogs];
  }
}
