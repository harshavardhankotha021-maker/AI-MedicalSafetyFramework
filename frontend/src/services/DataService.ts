/**
 * JeevanRaksha – DataService interface
 *
 * Both MockService and FirebaseService implement this contract.
 * Components interact with data through this interface only —
 * never directly with Firebase or mock arrays.
 */

import type {
  User, UserRole, Patient, Allergy, Condition, Prescription, LabReport,
  EmergencyContact, HealthCard, QRToken, AuditLog, EmergencyData,
  AuditEventType,
} from './types';

export interface DataService {
  // ── Auth ────────────────────────────────────────────────────────────────────
  signIn(email: string, password?: string): Promise<User>;
  signUp(params: {
    email: string;
    password?: string;
    fullName: string;
    role: UserRole;
    age?: number;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
    bloodGroup?: string;
    hospitalName?: string;
  }): Promise<User>;
  signOut(): Promise<void>;
  getCurrentUser(): User | null;
  /** Restore session from storage (call on app mount) */
  restoreSession(): User | null;

  // ── Patient ─────────────────────────────────────────────────────────────────
  getPatientByUserId(userId: string): Promise<Patient | null>;
  getPatientById(patientId: string): Promise<Patient | null>;
  updatePatient(
    patientId: string,
    data: Partial<Omit<Patient, 'id' | 'userId' | 'abhaId' | 'createdAt'>>
  ): Promise<void>;

  /** Doctor: search patients by name or ABHA ID */
  searchPatients(query: string): Promise<Patient[]>;
  /** Admin: get all patients */
  getAllPatients(): Promise<Patient[]>;

  // ── Allergies ───────────────────────────────────────────────────────────────
  getAllergies(patientId: string): Promise<Allergy[]>;
  addAllergy(patientId: string, data: Omit<Allergy, 'id' | 'patientId'>): Promise<Allergy>;
  deleteAllergy(allergyId: string): Promise<void>;

  // ── Conditions ──────────────────────────────────────────────────────────────
  getConditions(patientId: string): Promise<Condition[]>;
  addCondition(patientId: string, data: Omit<Condition, 'id' | 'patientId'>): Promise<Condition>;
  deleteCondition(conditionId: string): Promise<void>;

  // ── Prescriptions ────────────────────────────────────────────────────────────
  getPrescriptions(patientId: string, activeOnly?: boolean): Promise<Prescription[]>;
  addPrescription(patientId: string, data: Omit<Prescription, 'id' | 'patientId'>): Promise<Prescription>;
  updatePrescription(prescriptionId: string, data: Partial<Prescription>): Promise<void>;
  deletePrescription(prescriptionId: string): Promise<void>;

  // ── Lab Reports ──────────────────────────────────────────────────────────────
  getLabReports(patientId: string): Promise<LabReport[]>;
  addLabReport(patientId: string, data: Omit<LabReport, 'id' | 'patientId'>): Promise<LabReport>;

  // ── Emergency Contacts ───────────────────────────────────────────────────────
  getEmergencyContacts(patientId: string): Promise<EmergencyContact[]>;
  addEmergencyContact(patientId: string, data: Omit<EmergencyContact, 'id' | 'patientId'>): Promise<EmergencyContact>;
  deleteEmergencyContact(contactId: string): Promise<void>;

  // ── Health Card ──────────────────────────────────────────────────────────────
  getHealthCard(patientId: string): Promise<HealthCard | null>;

  // ── QR Token ─────────────────────────────────────────────────────────────────
  getActiveQRToken(patientId: string): Promise<QRToken | null>;
  generateQRToken(patientId: string): Promise<QRToken>;
  revokeQRToken(tokenId: string): Promise<void>;

  // ── Emergency access (public — no auth required) ─────────────────────────────
  getEmergencyData(token: string): Promise<EmergencyData | null>;

  // ── Audit ────────────────────────────────────────────────────────────────────
  logAuditEvent(event: {
    patientId: string;
    accessedBy?: string;
    accessorName?: string;
    accessorRole?: string;
    accessType: AuditEventType;
    tokenUsed?: string;
    details?: string;
  }): Promise<void>;
  getAuditLogs(patientId: string): Promise<AuditLog[]>;
  getAllAuditLogs(): Promise<AuditLog[]>;
}
