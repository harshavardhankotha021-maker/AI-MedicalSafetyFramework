/**
 * JeevanRaksha – FirebaseService
 *
 * Implements DataService using Firebase Authentication & Cloud Firestore.
 * Automatically handles Firestore collections for Patients, Prescriptions,
 * Allergies, Conditions, Lab Reports, Emergency Contacts, QR Tokens, Audit Logs,
 * and Health Cards.
 */

import type { DataService } from './DataService';
import type {
  User, UserRole, Patient, Prescription, Allergy, Condition,
  LabReport, EmergencyContact, HealthCard, QRToken, AuditLog,
  EmergencyData, AuditEventType,
} from './types';
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type Auth,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  type Firestore,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDemoConfigKeyForHackathonPlaceholder',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'jeevanraksha-demo.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'jeevanraksha-demo',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'jeevanraksha-demo.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1234567890',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1234567890:web:1234567890',
};

export class FirebaseService implements DataService {
  private app: FirebaseApp;
  private auth: Auth;
  private db: Firestore;
  private isConfigured: boolean = false;
  private currentUserCache: User | null = null;

  constructor() {
    if (!getApps().length) {
      this.app = initializeApp(firebaseConfig);
    } else {
      this.app = getApps()[0];
    }
    this.auth = getAuth(this.app);
    this.db = getFirestore(this.app);
    this.isConfigured = !!import.meta.env.VITE_FIREBASE_API_KEY;

    onAuthStateChanged(this.auth, async (u) => {
      if (!u) {
        this.currentUserCache = null;
      } else {
        const uDoc = await getDoc(doc(this.db, 'users', u.uid));
        if (uDoc.exists()) {
          this.currentUserCache = uDoc.data() as User;
        } else {
          this.currentUserCache = {
            id: u.uid,
            email: u.email || '',
            fullName: u.displayName || u.email?.split('@')[0] || 'User',
            role: 'PATIENT',
            createdAt: new Date().toISOString(),
          };
        }
      }
    });
  }

  public hasCredentials(): boolean {
    return this.isConfigured;
  }

  // ── Auth ─────────────────────────────────────────────────────────────────

  async signIn(email: string, pass: string = 'Demo@2026'): Promise<User> {
    const cred = await signInWithEmailAndPassword(this.auth, email, pass);
    const uDoc = await getDoc(doc(this.db, 'users', cred.user.uid));
    let user: User;
    if (uDoc.exists()) {
      user = uDoc.data() as User;
    } else {
      user = {
        id: cred.user.uid,
        email: cred.user.email || email,
        fullName: cred.user.displayName || email.split('@')[0],
        role: 'PATIENT',
        createdAt: new Date().toISOString(),
      };
    }
    this.currentUserCache = user;
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
    const pass = params.password || 'Demo@2026';
    const cred = await createUserWithEmailAndPassword(this.auth, params.email, pass);
    const uid = cred.user.uid;

    const newUser: User = {
      id: uid,
      email: params.email,
      fullName: params.fullName,
      role: params.role,
      hospitalId: params.hospitalName,
      createdAt: new Date().toISOString(),
    };

    await updateDoc(doc(this.db, 'users', uid), newUser as any).catch(async () => {
      await addDoc(collection(this.db, 'users'), newUser as any);
    });

    if (params.role === 'PATIENT') {
      const patientId = `patient_${Date.now()}`;
      const abhaId = `ABHA-${Math.floor(100 + Math.random() * 900)}`;
      const newPatient: Patient = {
        id: patientId,
        userId: uid,
        abhaId,
        name: params.fullName,
        age: params.age || 30,
        gender: params.gender || 'MALE',
        bloodGroup: params.bloodGroup || 'O+',
        hospitalName: params.hospitalName || 'Apollo Hospital',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await addDoc(collection(this.db, 'patients'), newPatient as any);

      const cardNum = `JR-2026-${Math.floor(10000 + Math.random() * 90000)}`;
      await addDoc(collection(this.db, 'health_cards'), {
        patientId,
        cardNumber: cardNum,
        issuedAt: new Date().toISOString(),
        isActive: true,
      });

      await addDoc(collection(this.db, 'qr_tokens'), {
        patientId,
        token: `jr2026_${patientId}_${Math.random().toString(36).substring(2, 10)}`,
        issuedAt: new Date().toISOString(),
        revoked: false,
        scanCount: 0,
      });
    }

    this.currentUserCache = newUser;
    return newUser;
  }

  async signOut(): Promise<void> {
    await signOut(this.auth);
    this.currentUserCache = null;
  }

  getCurrentUser(): User | null {
    return this.currentUserCache;
  }

  restoreSession(): User | null {
    return this.currentUserCache;
  }

  // ── Patient ──────────────────────────────────────────────────────────────

  async getPatientByUserId(userId: string): Promise<Patient | null> {
    const q = query(collection(this.db, 'patients'), where('userId', '==', userId));
    const snap = await getDocs(q);
    if (!snap.empty) return snap.docs[0].data() as Patient;
    return null;
  }

  async getPatientById(patientId: string): Promise<Patient | null> {
    const pDoc = await getDoc(doc(this.db, 'patients', patientId));
    if (pDoc.exists()) return pDoc.data() as Patient;
    const q = query(collection(this.db, 'patients'), where('abhaId', '==', patientId));
    const snap = await getDocs(q);
    if (!snap.empty) return snap.docs[0].data() as Patient;
    return null;
  }

  async updatePatient(patientId: string, data: Partial<Omit<Patient, 'id' | 'userId' | 'abhaId' | 'createdAt'>>): Promise<void> {
    await updateDoc(doc(this.db, 'patients', patientId), { ...data, updatedAt: new Date().toISOString() });
  }

  async searchPatients(queryStr: string): Promise<Patient[]> {
    const all = await this.getAllPatients();
    const q = queryStr.toLowerCase().trim();
    if (!q) return all;
    return all.filter((p) => p.name.toLowerCase().includes(q) || p.abhaId.toLowerCase().includes(q));
  }

  async getAllPatients(): Promise<Patient[]> {
    const snap = await getDocs(collection(this.db, 'patients'));
    return snap.docs.map((d) => d.data() as Patient);
  }

  // ── Allergies ────────────────────────────────────────────────────────────

  async getAllergies(patientId: string): Promise<Allergy[]> {
    const q = query(collection(this.db, 'allergies'), where('patientId', '==', patientId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Allergy));
  }

  async addAllergy(patientId: string, data: Omit<Allergy, 'id' | 'patientId'>): Promise<Allergy> {
    const ref = await addDoc(collection(this.db, 'allergies'), { patientId, ...data });
    return { id: ref.id, patientId, ...data };
  }

  async deleteAllergy(allergyId: string): Promise<void> {
    await deleteDoc(doc(this.db, 'allergies', allergyId));
  }

  // ── Conditions ───────────────────────────────────────────────────────────

  async getConditions(patientId: string): Promise<Condition[]> {
    const q = query(collection(this.db, 'conditions'), where('patientId', '==', patientId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Condition));
  }

  async addCondition(patientId: string, data: Omit<Condition, 'id' | 'patientId'>): Promise<Condition> {
    const ref = await addDoc(collection(this.db, 'conditions'), { patientId, ...data });
    return { id: ref.id, patientId, ...data };
  }

  async deleteCondition(conditionId: string): Promise<void> {
    await deleteDoc(doc(this.db, 'conditions', conditionId));
  }

  // ── Prescriptions ─────────────────────────────────────────────────────────

  async getPrescriptions(patientId: string, activeOnly = false): Promise<Prescription[]> {
    let q = query(collection(this.db, 'prescriptions'), where('patientId', '==', patientId));
    if (activeOnly) {
      q = query(collection(this.db, 'prescriptions'), where('patientId', '==', patientId), where('status', '==', 'ACTIVE'));
    }
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Prescription));
  }

  async addPrescription(patientId: string, data: Omit<Prescription, 'id' | 'patientId'>): Promise<Prescription> {
    const ref = await addDoc(collection(this.db, 'prescriptions'), { patientId, ...data });
    return { id: ref.id, patientId, ...data };
  }

  async updatePrescription(prescriptionId: string, data: Partial<Prescription>): Promise<void> {
    await updateDoc(doc(this.db, 'prescriptions', prescriptionId), data);
  }

  async deletePrescription(prescriptionId: string): Promise<void> {
    await deleteDoc(doc(this.db, 'prescriptions', prescriptionId));
  }

  // ── Lab Reports ───────────────────────────────────────────────────────────

  async getLabReports(patientId: string): Promise<LabReport[]> {
    const q = query(collection(this.db, 'lab_reports'), where('patientId', '==', patientId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as LabReport));
  }

  async addLabReport(patientId: string, data: Omit<LabReport, 'id' | 'patientId'>): Promise<LabReport> {
    const ref = await addDoc(collection(this.db, 'lab_reports'), { patientId, ...data });
    return { id: ref.id, patientId, ...data };
  }

  // ── Emergency Contacts ────────────────────────────────────────────────────

  async getEmergencyContacts(patientId: string): Promise<EmergencyContact[]> {
    const q = query(collection(this.db, 'emergency_contacts'), where('patientId', '==', patientId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as EmergencyContact));
  }

  async addEmergencyContact(patientId: string, data: Omit<EmergencyContact, 'id' | 'patientId'>): Promise<EmergencyContact> {
    const ref = await addDoc(collection(this.db, 'emergency_contacts'), { patientId, ...data });
    return { id: ref.id, patientId, ...data };
  }

  async deleteEmergencyContact(contactId: string): Promise<void> {
    await deleteDoc(doc(this.db, 'emergency_contacts', contactId));
  }

  // ── Health Card ───────────────────────────────────────────────────────────

  async getHealthCard(patientId: string): Promise<HealthCard | null> {
    const q = query(collection(this.db, 'health_cards'), where('patientId', '==', patientId), where('isActive', '==', true));
    const snap = await getDocs(q);
    if (!snap.empty) return { id: snap.docs[0].id, ...snap.docs[0].data() } as HealthCard;
    return null;
  }

  // ── QR Token ──────────────────────────────────────────────────────────────

  async getActiveQRToken(patientId: string): Promise<QRToken | null> {
    const q = query(collection(this.db, 'qr_tokens'), where('patientId', '==', patientId), where('revoked', '==', false));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as QRToken;
  }

  async generateQRToken(patientId: string): Promise<QRToken> {
    const newTokenData: Omit<QRToken, 'id'> = {
      patientId,
      token: `jr2026_${patientId}_${Math.random().toString(36).substring(2, 12)}`,
      issuedAt: new Date().toISOString(),
      revoked: false,
      scanCount: 0,
    };
    const ref = await addDoc(collection(this.db, 'qr_tokens'), newTokenData);
    return { id: ref.id, ...newTokenData };
  }

  async revokeQRToken(tokenId: string): Promise<void> {
    await updateDoc(doc(this.db, 'qr_tokens', tokenId), { revoked: true });
  }

  // ── Emergency Access ──────────────────────────────────────────────────────

  async getEmergencyData(tokenStr: string): Promise<EmergencyData | null> {
    const q = query(collection(this.db, 'qr_tokens'), where('token', '==', tokenStr), where('revoked', '==', false));
    const snap = await getDocs(q);
    if (snap.empty) return null;

    const qr = snap.docs[0].data() as QRToken;
    const patient = await this.getPatientById(qr.patientId);
    if (!patient) return null;

    const allergies = await this.getAllergies(patient.id);
    const conditions = await this.getConditions(patient.id);
    const prescriptions = await this.getPrescriptions(patient.id, true);
    const contacts = await this.getEmergencyContacts(patient.id);
    const card = await this.getHealthCard(patient.id);

    await this.logAuditEvent({
      patientId: patient.id,
      accessType: 'EMERGENCY_QR_ACCESSED',
      tokenUsed: tokenStr,
      details: 'Firebase emergency QR scan view',
    });

    const severeAllergies = allergies.filter((a) => a.severity === 'SEVERE' || a.severity === 'LIFE_THREATENING');
    const ongoingConditions = conditions.filter((c) => c.status === 'ONGOING');

    return {
      patientName: patient.name,
      age: patient.age,
      gender: patient.gender,
      bloodGroup: patient.bloodGroup,
      photoUrl: patient.photoUrl,
      criticalAllergies: severeAllergies.map((a) => ({ substance: a.substance, severity: a.severity, allergyType: a.allergyType })),
      criticalConditions: ongoingConditions.map((c) => ({ condition: c.condition, chronic: c.chronic, status: c.status })),
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
    await addDoc(collection(this.db, 'audit_logs'), {
      ...event,
      accessedAt: new Date().toISOString(),
    });
  }

  async getAuditLogs(patientId: string): Promise<AuditLog[]> {
    const q = query(collection(this.db, 'audit_logs'), where('patientId', '==', patientId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AuditLog));
  }

  async getAllAuditLogs(): Promise<AuditLog[]> {
    const snap = await getDocs(collection(this.db, 'audit_logs'));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AuditLog));
  }
}
