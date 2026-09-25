/**
 * JeevanRaksha – Shared TypeScript types
 * Used by both Mock Mode and Firebase Mode.
 */

// ── Auth / User ───────────────────────────────────────────────────────────────

export type UserRole = 'PATIENT' | 'DOCTOR' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  hospitalId?: string;
  createdAt: string;
}

// ── Patient ───────────────────────────────────────────────────────────────────

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface Patient {
  id: string;
  userId?: string;
  abhaId: string;          // JR-YYYY-XXXXX format
  name: string;
  age: number;
  gender: Gender;
  bloodGroup: string;
  phone?: string;          // Only returned to account owner — never to doctor/emergency
  photoUrl?: string;
  hospitalName?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Allergy ───────────────────────────────────────────────────────────────────

export type AllergySeverity = 'MILD' | 'MODERATE' | 'SEVERE' | 'LIFE_THREATENING';
export type AllergyType     = 'Drug' | 'Food' | 'Environmental' | 'Other';

export interface Allergy {
  id: string;
  patientId: string;
  allergyType: AllergyType;
  substance: string;
  severity: AllergySeverity;
  firstDetected?: string;
  notes?: string;
}

// ── Condition ─────────────────────────────────────────────────────────────────

export type ConditionStatus = 'ONGOING' | 'RESOLVED' | 'MANAGED';

export interface Condition {
  id: string;
  patientId: string;
  condition: string;
  chronic: boolean;
  diagnosedSince?: string;
  status: ConditionStatus;
}

// ── Prescription ──────────────────────────────────────────────────────────────

export type PrescriptionStatus = 'ACTIVE' | 'COMPLETED' | 'TEMPORARY' | 'DISCONTINUED';

export interface Prescription {
  id: string;
  patientId: string;
  drug: string;
  dose: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  status: PrescriptionStatus;
  prescribedBy?: string;
}

// ── Lab Report ────────────────────────────────────────────────────────────────

export type LabStatus = 'NORMAL' | 'HIGH' | 'LOW' | 'CRITICAL' | 'PENDING';

export interface LabReport {
  id: string;
  patientId: string;
  testName: string;
  value: string;
  unit: string;
  status: LabStatus;
  testDate: string;
  reportDate?: string;
  notes?: string;
  isAbnormal: boolean;
}

// ── Emergency Contact ─────────────────────────────────────────────────────────

export interface EmergencyContact {
  id: string;
  patientId: string;
  name: string;
  relationship: string;
  phone: string;
  priority: number;  // 1 = primary
}

// ── Health Card ───────────────────────────────────────────────────────────────

export interface HealthCard {
  id: string;
  patientId: string;
  cardNumber: string;   // e.g. JR-2026-00001
  issuedAt: string;
  isActive: boolean;
}

// ── QR Token ──────────────────────────────────────────────────────────────────

export interface QRToken {
  id: string;
  patientId: string;
  token: string;           // Opaque non-guessable string
  issuedAt: string;
  expiresAt?: string;
  revoked: boolean;
  lastScannedAt?: string;
  scanCount: number;
}

// ── Hospital ──────────────────────────────────────────────────────────────────

export interface Hospital {
  id: string;
  name: string;
  city: string;
  registrationNo?: string;
}

// ── Audit Log ─────────────────────────────────────────────────────────────────

export type AuditEventType =
  | 'PATIENT_UPDATED_PROFILE'
  | 'DOCTOR_VIEWED_PATIENT'
  | 'DOCTOR_RAN_SAFETY_ANALYSIS'
  | 'EMERGENCY_QR_ACCESSED'
  | 'ADMIN_VIEWED_RECORD'
  | 'PATIENT_VIEWED_OWN_RECORD'
  | 'QR_GENERATED'
  | 'QR_REVOKED';

export interface AuditLog {
  id: string;
  patientId: string;
  accessedBy?: string;       // User ID or undefined for anonymous emergency
  accessorName?: string;
  accessorRole?: UserRole;
  accessType: AuditEventType;
  tokenUsed?: string;
  accessedAt: string;
  details?: string;
}

// ── Emergency Data (minimal — only permitted emergency info) ──────────────────

export interface EmergencyData {
  patientName: string;
  age: number;
  gender: Gender;
  bloodGroup: string;
  photoUrl?: string;
  /** Only SEVERE / LIFE_THREATENING allergies shown */
  criticalAllergies: Array<{
    substance: string;
    severity: AllergySeverity;
    allergyType: AllergyType;
  }>;
  /** Only ONGOING / chronic conditions */
  criticalConditions: Array<{
    condition: string;
    chronic: boolean;
    status: ConditionStatus;
  }>;
  /** Only ACTIVE prescriptions */
  criticalMedications: Array<{
    drug: string;
    dose: string;
    frequency: string;
  }>;
  primaryEmergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  healthCardNumber: string;
  abhaId: string;
  lastUpdated: string;
}

// ── Safety Engine types (wraps FastAPI response) ──────────────────────────────

export type RiskLevel = 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH';

export interface SafetyAnalysisRequest {
  drugs: string[];
  conditions: string[];
  allergies?: string[];
  useNer?: boolean;
}

export interface DrugDrugAlert {
  type: 'Drug-Drug';
  drugs: string[];
  risk: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  source: string;
}

export interface DiseaseDrugAlert {
  type: 'Disease-Drug';
  condition: string;
  drug: string;
  warning: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  source: string;
}

export type SafetyAlert = DrugDrugAlert | DiseaseDrugAlert;

export interface SafetyAnalysisResult {
  extractedDrugs: string[];
  extractedDiseases: string[];
  drugDrugAlerts: DrugDrugAlert[];
  diseaseDrugAlerts: DiseaseDrugAlert[];
  overallRisk: RiskLevel;
  nerUsed: boolean;
}

// ── Demo accounts (Mock Mode UI) ──────────────────────────────────────────────

export interface DemoAccount {
  email: string;
  password: string;
  role: UserRole;
  label: string;
  description: string;
}
