/**
 * JeevanRaksha – Mock data
 *
 * Synthetic demo data for development and hackathon demonstrations.
 * ALL information here is fictional. No real patient data.
 *
 * Demo accounts:
 *   patient@demo.jr / Demo@2026   → Priya Mehta (HIGH risk — best for demo)
 *   doctor@demo.jr  / Demo@2026   → Dr. Arjun Sharma, Apollo Hospital
 *   admin@demo.jr   / Demo@2026   → System Administrator
 */

import type {
  User, Patient, Allergy, Condition, Prescription,
  LabReport, EmergencyContact, HealthCard, QRToken,
  Hospital, AuditLog, DemoAccount,
} from '../types';

// ── Demo accounts ─────────────────────────────────────────────────────────────

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    email: 'patient@demo.jr',
    password: 'Demo@2026',
    role: 'PATIENT',
    label: 'Demo Patient',
    description: 'Priya Mehta · HIGH risk profile · Warfarin + Aspirin + Ibuprofen',
  },
  {
    email: 'doctor@demo.jr',
    password: 'Demo@2026',
    role: 'DOCTOR',
    label: 'Demo Doctor',
    description: 'Dr. Arjun Sharma · Apollo Hospital · Access to all patients',
  },
  {
    email: 'admin@demo.jr',
    password: 'Demo@2026',
    role: 'ADMIN',
    label: 'Demo Admin',
    description: 'System Administrator · Full system access',
  },
];

// ── Users ─────────────────────────────────────────────────────────────────────

export const MOCK_USERS: User[] = [
  {
    id: 'user-patient-001',
    email: 'patient@demo.jr',
    role: 'PATIENT',
    fullName: 'Priya Mehta',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'user-doctor-001',
    email: 'doctor@demo.jr',
    role: 'DOCTOR',
    fullName: 'Dr. Arjun Sharma',
    hospitalId: 'hospital-001',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'user-admin-001',
    email: 'admin@demo.jr',
    role: 'ADMIN',
    fullName: 'System Administrator',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'user-patient-002',
    email: 'patient2@demo.jr',
    role: 'PATIENT',
    fullName: 'Arjun Singh',
    createdAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'user-patient-003',
    email: 'patient3@demo.jr',
    role: 'PATIENT',
    fullName: 'Sunita Patel',
    createdAt: '2026-02-01T00:00:00Z',
  },
];

// Plain-text passwords — only in mock mode, never in Firebase
export const MOCK_PASSWORDS: Record<string, string> = {
  'patient@demo.jr':  'Demo@2026',
  'doctor@demo.jr':   'Demo@2026',
  'admin@demo.jr':    'Demo@2026',
  'patient2@demo.jr': 'Demo@2026',
  'patient3@demo.jr': 'Demo@2026',
};

// ── Hospitals ─────────────────────────────────────────────────────────────────

export const MOCK_HOSPITALS: Hospital[] = [
  { id: 'hospital-001', name: 'Apollo Hospital',  city: 'Delhi' },
  { id: 'hospital-002', name: 'AIIMS',             city: 'Delhi' },
  { id: 'hospital-003', name: 'Fortis Hospital',   city: 'Gurugram' },
];

// ── Patients ──────────────────────────────────────────────────────────────────

export const MOCK_PATIENTS: Patient[] = [
  // Patient 1 — HIGH RISK (main demo patient)
  {
    id: 'patient-001',
    userId: 'user-patient-001',
    abhaId: 'JR-2026-PM001',
    name: 'Priya Mehta',
    age: 38,
    gender: 'FEMALE',
    bloodGroup: 'B+',
    phone: '9876500001',
    hospitalName: 'Apollo Hospital',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-09-20T10:30:00Z',
  },
  // Patient 2 — MEDIUM RISK
  {
    id: 'patient-002',
    userId: 'user-patient-002',
    abhaId: 'JR-2026-AS002',
    name: 'Arjun Singh',
    age: 55,
    gender: 'MALE',
    bloodGroup: 'A+',
    phone: '9876500002',
    hospitalName: 'Fortis Hospital',
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-08-15T00:00:00Z',
  },
  // Patient 3 — SAFE
  {
    id: 'patient-003',
    userId: 'user-patient-003',
    abhaId: 'JR-2026-SP003',
    name: 'Sunita Patel',
    age: 29,
    gender: 'FEMALE',
    bloodGroup: 'O+',
    phone: '9876500003',
    hospitalName: 'AIIMS',
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z',
  },
  // Patient 4 — Apollo Hospital
  {
    id: 'patient-004',
    userId: 'user-patient-004',
    abhaId: 'JR-2026-RK004',
    name: 'Ravi Kumar',
    age: 42,
    gender: 'MALE',
    bloodGroup: 'O+',
    phone: '9876543210',
    hospitalName: 'Apollo Hospital',
    createdAt: '2026-02-10T00:00:00Z',
    updatedAt: '2026-08-20T10:00:00Z',
  },
  // Patient 5 — Apollo Hospital
  {
    id: 'patient-005',
    userId: 'user-patient-005',
    abhaId: 'JR-2026-AS005',
    name: 'Anita Sharma',
    age: 29,
    gender: 'FEMALE',
    bloodGroup: 'B+',
    phone: '9123456780',
    hospitalName: 'Apollo Hospital',
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  // Patient 6 — Fortis Hospital
  {
    id: 'patient-006',
    userId: 'user-patient-006',
    abhaId: 'JR-2026-NV006',
    name: 'Neha Verma',
    age: 35,
    gender: 'FEMALE',
    bloodGroup: 'O-',
    phone: '9012345678',
    hospitalName: 'Fortis Hospital',
    createdAt: '2026-03-15T00:00:00Z',
    updatedAt: '2026-08-30T00:00:00Z',
  },
  // Patient 7 — AIIMS
  {
    id: 'patient-007',
    userId: 'user-patient-007',
    abhaId: 'JR-2026-KS007',
    name: 'Karan Singh',
    age: 60,
    gender: 'MALE',
    bloodGroup: 'B-',
    phone: '9090909090',
    hospitalName: 'AIIMS',
    createdAt: '2026-04-01T00:00:00Z',
    updatedAt: '2026-09-05T00:00:00Z',
  },
  // Patient 8 — Manipal Hospital
  {
    id: 'patient-008',
    userId: 'user-patient-008',
    abhaId: 'JR-2026-MD008',
    name: 'Manoj Das',
    age: 48,
    gender: 'MALE',
    bloodGroup: 'AB+',
    phone: '7777777777',
    hospitalName: 'Manipal Hospital',
    createdAt: '2026-04-12T00:00:00Z',
    updatedAt: '2026-09-12T00:00:00Z',
  },
  // Patient 9 — Manipal Hospital
  {
    id: 'patient-009',
    userId: 'user-patient-009',
    abhaId: 'JR-2026-SR009',
    name: 'Sneha Roy',
    age: 31,
    gender: 'FEMALE',
    bloodGroup: 'O+',
    phone: '6666666666',
    hospitalName: 'Manipal Hospital',
    createdAt: '2026-05-01T00:00:00Z',
    updatedAt: '2026-09-15T00:00:00Z',
  },
  // Patient 10 — Narayana Health
  {
    id: 'patient-010',
    userId: 'user-patient-010',
    abhaId: 'JR-2026-VI010',
    name: 'Vikram Iyer',
    age: 67,
    gender: 'MALE',
    bloodGroup: 'A+',
    phone: '5555555555',
    hospitalName: 'Narayana Health',
    createdAt: '2026-05-15T00:00:00Z',
    updatedAt: '2026-09-18T00:00:00Z',
  },
  // Patient 11 — Max Hospital
  {
    id: 'patient-011',
    userId: 'user-patient-011',
    abhaId: 'JR-2026-RG011',
    name: 'Rajesh Gupta',
    age: 58,
    gender: 'MALE',
    bloodGroup: 'AB-',
    phone: '9998887776',
    hospitalName: 'Max Hospital',
    createdAt: '2026-06-01T00:00:00Z',
    updatedAt: '2026-09-22T00:00:00Z',
  },
];

// ── Allergies ─────────────────────────────────────────────────────────────────

export const MOCK_ALLERGIES: Allergy[] = [
  // Priya Mehta (patient-001)
  {
    id: 'allergy-001',
    patientId: 'patient-001',
    allergyType: 'Drug',
    substance: 'Penicillin',
    severity: 'SEVERE',
    firstDetected: '2018-03-15',
    notes: 'Anaphylactic reaction. Do not administer under any circumstances.',
  },
  {
    id: 'allergy-002',
    patientId: 'patient-001',
    allergyType: 'Drug',
    substance: 'Sulfa Drugs',
    severity: 'MODERATE',
    firstDetected: '2020-07-20',
    notes: 'Causes urticaria and skin rash.',
  },
  {
    id: 'allergy-003',
    patientId: 'patient-001',
    allergyType: 'Food',
    substance: 'Shellfish',
    severity: 'MILD',
    firstDetected: '2015-01-01',
  },
  // Arjun Singh (patient-002)
  {
    id: 'allergy-004',
    patientId: 'patient-002',
    allergyType: 'Environmental',
    substance: 'Dust Mites',
    severity: 'MILD',
  },
  {
    id: 'allergy-005',
    patientId: 'patient-002',
    allergyType: 'Drug',
    substance: 'Codeine',
    severity: 'MODERATE',
    firstDetected: '2019-04-10',
    notes: 'Nausea and vomiting.',
  },
  // Ravi Kumar (patient-004)
  {
    id: 'allergy-006',
    patientId: 'patient-004',
    allergyType: 'Drug',
    substance: 'Penicillin',
    severity: 'SEVERE',
    firstDetected: '2010-06-15',
    notes: 'Severe anaphylaxis history. Cross-reactivity with all penicillins and beta-lactams.',
  },
  {
    id: 'allergy-007',
    patientId: 'patient-004',
    allergyType: 'Food',
    substance: 'Shellfish',
    severity: 'MODERATE',
    firstDetected: '2015-08-20',
  },
  // Anita Sharma (patient-005)
  {
    id: 'allergy-008',
    patientId: 'patient-005',
    allergyType: 'Food',
    substance: 'Peanuts',
    severity: 'MODERATE',
    firstDetected: '2018-03-22',
  },
  // Karan Singh (patient-007)
  {
    id: 'allergy-009',
    patientId: 'patient-007',
    allergyType: 'Food',
    substance: 'Seafood',
    severity: 'SEVERE',
    firstDetected: '1999-07-19',
  },
  // Manoj Das (patient-008)
  {
    id: 'allergy-010',
    patientId: 'patient-008',
    allergyType: 'Drug',
    substance: 'Sulfa Drugs',
    severity: 'SEVERE',
    firstDetected: '2012-08-14',
  },
  {
    id: 'allergy-011',
    patientId: 'patient-008',
    allergyType: 'Drug',
    substance: 'Ibuprofen',
    severity: 'MODERATE',
    firstDetected: '2019-04-11',
    notes: 'Severe gastric mucosal bleeding and hypersensitivity.',
  },
  // Vikram Iyer (patient-010)
  {
    id: 'allergy-012',
    patientId: 'patient-010',
    allergyType: 'Drug',
    substance: 'Warfarin',
    severity: 'SEVERE',
    firstDetected: '2017-04-21',
  },
  // Rajesh Gupta (patient-011)
  {
    id: 'allergy-013',
    patientId: 'patient-011',
    allergyType: 'Drug',
    substance: 'Penicillin',
    severity: 'SEVERE',
    firstDetected: '2015-06-10',
  },
  {
    id: 'allergy-014',
    patientId: 'patient-011',
    allergyType: 'Food',
    substance: 'Shellfish',
    severity: 'MODERATE',
    firstDetected: '2018-09-22',
  },
  {
    id: 'allergy-015',
    patientId: 'patient-011',
    allergyType: 'Drug',
    substance: 'Sulfa Drugs',
    severity: 'SEVERE',
    firstDetected: '2020-03-14',
  },
];

// ── Conditions ────────────────────────────────────────────────────────────────

export const MOCK_CONDITIONS: Condition[] = [
  // Priya Mehta (patient-001)
  {
    id: 'condition-001',
    patientId: 'patient-001',
    condition: 'Type 2 Diabetes',
    chronic: true,
    diagnosedSince: '2019',
    status: 'ONGOING',
  },
  {
    id: 'condition-002',
    patientId: 'patient-001',
    condition: 'Hypertension',
    chronic: true,
    diagnosedSince: '2021',
    status: 'ONGOING',
  },
  {
    id: 'condition-003',
    patientId: 'patient-001',
    condition: 'Atrial Fibrillation',
    chronic: true,
    diagnosedSince: '2022',
    status: 'MANAGED',
  },
  // Arjun Singh (patient-002)
  {
    id: 'condition-004',
    patientId: 'patient-002',
    condition: 'Heart Disease',
    chronic: true,
    diagnosedSince: '2018',
    status: 'MANAGED',
  },
  {
    id: 'condition-005',
    patientId: 'patient-002',
    condition: 'Hypertension',
    chronic: true,
    diagnosedSince: '2015',
    status: 'ONGOING',
  },
  {
    id: 'condition-006',
    patientId: 'patient-002',
    condition: 'Type 2 Diabetes',
    chronic: true,
    diagnosedSince: '2020',
    status: 'ONGOING',
  },
  // Sunita Patel (patient-003)
  {
    id: 'condition-007',
    patientId: 'patient-003',
    condition: 'Asthma',
    chronic: false,
    diagnosedSince: '2023',
    status: 'MANAGED',
  },
  // Ravi Kumar (patient-004)
  {
    id: 'condition-008',
    patientId: 'patient-004',
    condition: 'Type 2 Diabetes',
    chronic: true,
    diagnosedSince: '2019',
    status: 'ONGOING',
  },
  {
    id: 'condition-009',
    patientId: 'patient-004',
    condition: 'Hypertension',
    chronic: true,
    diagnosedSince: '2021',
    status: 'ONGOING',
  },
  // Anita Sharma (patient-005)
  {
    id: 'condition-010',
    patientId: 'patient-005',
    condition: 'Asthma',
    chronic: true,
    diagnosedSince: '2015',
    status: 'ONGOING',
  },
  // Neha Verma (patient-006)
  {
    id: 'condition-011',
    patientId: 'patient-006',
    condition: 'Hypothyroidism',
    chronic: true,
    diagnosedSince: '2020',
    status: 'ONGOING',
  },
  // Karan Singh (patient-007)
  {
    id: 'condition-012',
    patientId: 'patient-007',
    condition: 'Heart Disease',
    chronic: true,
    diagnosedSince: '2010',
    status: 'ONGOING',
  },
  {
    id: 'condition-013',
    patientId: 'patient-007',
    condition: 'High Cholesterol',
    chronic: true,
    diagnosedSince: '2012',
    status: 'ONGOING',
  },
  // Manoj Das (patient-008)
  {
    id: 'condition-014',
    patientId: 'patient-008',
    condition: 'Type 2 Diabetes',
    chronic: true,
    diagnosedSince: '2016',
    status: 'ONGOING',
  },
  // Sneha Roy (patient-009)
  {
    id: 'condition-015',
    patientId: 'patient-009',
    condition: 'Migraine',
    chronic: false,
    diagnosedSince: '2022',
    status: 'MANAGED',
  },
  // Vikram Iyer (patient-010)
  {
    id: 'condition-016',
    patientId: 'patient-010',
    condition: 'Arthritis',
    chronic: true,
    diagnosedSince: '2014',
    status: 'ONGOING',
  },
  // Rajesh Gupta (patient-011)
  {
    id: 'condition-017',
    patientId: 'patient-011',
    condition: 'Heart Disease',
    chronic: true,
    diagnosedSince: '2016',
    status: 'ONGOING',
  },
  {
    id: 'condition-018',
    patientId: 'patient-011',
    condition: 'Hypertension',
    chronic: true,
    diagnosedSince: '2017',
    status: 'ONGOING',
  },
  {
    id: 'condition-019',
    patientId: 'patient-011',
    condition: 'Type 2 Diabetes',
    chronic: true,
    diagnosedSince: '2019',
    status: 'ONGOING',
  },
  {
    id: 'condition-020',
    patientId: 'patient-011',
    condition: 'Asthma',
    chronic: true,
    diagnosedSince: '2020',
    status: 'ONGOING',
  },
];

// ── Prescriptions ─────────────────────────────────────────────────────────────

export const MOCK_PRESCRIPTIONS: Prescription[] = [
  // Priya Mehta (patient-001) — HIGH RISK combination
  {
    id: 'rx-001',
    patientId: 'patient-001',
    drug: 'Warfarin',
    dose: '5mg',
    frequency: '1/day',
    startDate: '2022-06-01',
    status: 'ACTIVE',
    prescribedBy: 'Dr. Arjun Sharma',
  },
  {
    id: 'rx-002',
    patientId: 'patient-001',
    drug: 'Aspirin',
    dose: '100mg',
    frequency: '1/day',
    startDate: '2023-01-15',
    status: 'ACTIVE',
    prescribedBy: 'Dr. Arjun Sharma',
  },
  {
    id: 'rx-003',
    patientId: 'patient-001',
    drug: 'Ibuprofen',
    dose: '400mg',
    frequency: '3/day',
    startDate: '2026-09-15',
    endDate: '2026-10-15',
    status: 'ACTIVE',
    prescribedBy: 'Dr. Sunita Rao',
  },
  {
    id: 'rx-004',
    patientId: 'patient-001',
    drug: 'Metformin',
    dose: '500mg',
    frequency: '2/day',
    startDate: '2019-08-01',
    status: 'ACTIVE',
    prescribedBy: 'Dr. Arjun Sharma',
  },
  {
    id: 'rx-005',
    patientId: 'patient-001',
    drug: 'Amlodipine',
    dose: '5mg',
    frequency: '1/day',
    startDate: '2021-03-10',
    status: 'ACTIVE',
    prescribedBy: 'Dr. Arjun Sharma',
  },
  // Arjun Singh (patient-002)
  {
    id: 'rx-006',
    patientId: 'patient-002',
    drug: 'Warfarin',
    dose: '5mg',
    frequency: '1/day',
    startDate: '2021-05-01',
    status: 'ACTIVE',
    prescribedBy: 'Dr. Priya Rajan',
  },
  {
    id: 'rx-007',
    patientId: 'patient-002',
    drug: 'Aspirin',
    dose: '75mg',
    frequency: '1/day',
    startDate: '2022-01-01',
    status: 'ACTIVE',
    prescribedBy: 'Dr. Priya Rajan',
  },
  {
    id: 'rx-008',
    patientId: 'patient-002',
    drug: 'Atorvastatin',
    dose: '20mg',
    frequency: '1/day',
    startDate: '2018-06-01',
    status: 'ACTIVE',
    prescribedBy: 'Dr. Priya Rajan',
  },
  {
    id: 'rx-009',
    patientId: 'patient-002',
    drug: 'Metoprolol',
    dose: '25mg',
    frequency: '2/day',
    startDate: '2020-01-01',
    status: 'ACTIVE',
    prescribedBy: 'Dr. Priya Rajan',
  },
  {
    id: 'rx-010',
    patientId: 'patient-002',
    drug: 'Amlodipine',
    dose: '5mg',
    frequency: '1/day',
    startDate: '2015-06-01',
    status: 'ACTIVE',
    prescribedBy: 'Dr. Priya Rajan',
  },
  // Sunita Patel (patient-003)
  {
    id: 'rx-011',
    patientId: 'patient-003',
    drug: 'Salbutamol',
    dose: '100mcg',
    frequency: 'As needed',
    startDate: '2023-08-01',
    status: 'ACTIVE',
    prescribedBy: 'Dr. Kavita Mehta',
  },
  {
    id: 'rx-012',
    patientId: 'patient-003',
    drug: 'Montelukast',
    dose: '10mg',
    frequency: '1/day',
    startDate: '2024-01-01',
    status: 'ACTIVE',
    prescribedBy: 'Dr. Kavita Mehta',
  },
  // Ravi Kumar (patient-004) — Prescribed Amoxicillin while allergic to Penicillin!
  {
    id: 'rx-013',
    patientId: 'patient-004',
    drug: 'Metformin',
    dose: '500mg',
    frequency: '2/day',
    startDate: '2025-12-01',
    status: 'ACTIVE',
    prescribedBy: 'Dr. Arjun Sharma',
  },
  {
    id: 'rx-014',
    patientId: 'patient-004',
    drug: 'Amlodipine',
    dose: '5mg',
    frequency: '1/day',
    startDate: '2021-03-10',
    status: 'ACTIVE',
    prescribedBy: 'Dr. Arjun Sharma',
  },
  {
    id: 'rx-015',
    patientId: 'patient-004',
    drug: 'Amoxicillin',
    dose: '250mg',
    frequency: '3/day',
    startDate: '2026-09-10',
    endDate: '2026-09-20',
    status: 'ACTIVE',
    prescribedBy: 'Dr. Arjun Sharma',
  },
  // Anita Sharma (patient-005)
  {
    id: 'rx-016',
    patientId: 'patient-005',
    drug: 'Salbutamol',
    dose: '2 puffs',
    frequency: 'As needed',
    startDate: '2020-01-01',
    status: 'ACTIVE',
    prescribedBy: 'Dr. Arjun Sharma',
  },
  // Neha Verma (patient-006)
  {
    id: 'rx-017',
    patientId: 'patient-006',
    drug: 'Levothyroxine',
    dose: '50mcg',
    frequency: '1/day',
    startDate: '2020-03-01',
    status: 'ACTIVE',
    prescribedBy: 'Dr. Sunita Rao',
  },
  // Karan Singh (patient-007)
  {
    id: 'rx-018',
    patientId: 'patient-007',
    drug: 'Aspirin',
    dose: '75mg',
    frequency: '1/day',
    startDate: '2011-01-01',
    status: 'ACTIVE',
    prescribedBy: 'Dr. Rajesh Khanna',
  },
  {
    id: 'rx-019',
    patientId: 'patient-007',
    drug: 'Atorvastatin',
    dose: '20mg',
    frequency: '1/day',
    startDate: '2012-06-01',
    status: 'ACTIVE',
    prescribedBy: 'Dr. Rajesh Khanna',
  },
  // Manoj Das (patient-008)
  {
    id: 'rx-020',
    patientId: 'patient-008',
    drug: 'Insulin',
    dose: '10 units',
    frequency: '2/day',
    startDate: '2016-06-01',
    status: 'ACTIVE',
    prescribedBy: 'Dr. Manoj Patil',
  },
  {
    id: 'rx-021',
    patientId: 'patient-008',
    drug: 'Metformin',
    dose: '500mg',
    frequency: '2/day',
    startDate: '2018-02-15',
    status: 'ACTIVE',
    prescribedBy: 'Dr. Manoj Patil',
  },
  // Sneha Roy (patient-009)
  {
    id: 'rx-022',
    patientId: 'patient-009',
    drug: 'Sumatriptan',
    dose: '50mg',
    frequency: 'As needed',
    startDate: '2022-08-01',
    status: 'ACTIVE',
    prescribedBy: 'Dr. Manoj Patil',
  },
  // Vikram Iyer (patient-010)
  {
    id: 'rx-023',
    patientId: 'patient-010',
    drug: 'Ibuprofen',
    dose: '400mg',
    frequency: '2/day',
    startDate: '2026-01-05',
    status: 'ACTIVE',
    prescribedBy: 'Dr. Suresh Nair',
  },
  // Rajesh Gupta (patient-011) — MULTIPLE SEVERE INTERACTIONS
  {
    id: 'rx-024',
    patientId: 'patient-011',
    drug: 'Warfarin',
    dose: '5mg',
    frequency: '1/day',
    startDate: '2016-11-01',
    status: 'ACTIVE',
    prescribedBy: 'Dr. Rajiv Anand',
  },
  {
    id: 'rx-025',
    patientId: 'patient-011',
    drug: 'Aspirin',
    dose: '100mg',
    frequency: '1/day',
    startDate: '2017-02-15',
    status: 'ACTIVE',
    prescribedBy: 'Dr. Rajiv Anand',
  },
  {
    id: 'rx-026',
    patientId: 'patient-011',
    drug: 'Ibuprofen',
    dose: '400mg',
    frequency: '3/day',
    startDate: '2025-12-20',
    status: 'ACTIVE',
    prescribedBy: 'Dr. Rajiv Anand',
  },
  {
    id: 'rx-027',
    patientId: 'patient-011',
    drug: 'Clopidogrel',
    dose: '75mg',
    frequency: '1/day',
    startDate: '2018-06-01',
    status: 'ACTIVE',
    prescribedBy: 'Dr. Rajiv Anand',
  },
  {
    id: 'rx-028',
    patientId: 'patient-011',
    drug: 'Metformin',
    dose: '850mg',
    frequency: '2/day',
    startDate: '2019-08-01',
    status: 'ACTIVE',
    prescribedBy: 'Dr. Rajiv Anand',
  },
];

// ── Lab Reports ───────────────────────────────────────────────────────────────

export const MOCK_LAB_REPORTS: LabReport[] = [
  // Priya Mehta (patient-001)
  {
    id: 'lab-001',
    patientId: 'patient-001',
    testName: 'Blood Sugar Fasting',
    value: '186',
    unit: 'mg/dL',
    status: 'HIGH',
    testDate: '2026-09-10',
    reportDate: '2026-09-11',
    isAbnormal: true,
  },
  {
    id: 'lab-002',
    patientId: 'patient-001',
    testName: 'HbA1c',
    value: '8.4',
    unit: '%',
    status: 'HIGH',
    testDate: '2026-09-10',
    reportDate: '2026-09-11',
    isAbnormal: true,
  },
  {
    id: 'lab-003',
    patientId: 'patient-001',
    testName: 'INR (Warfarin Monitoring)',
    value: '3.8',
    unit: '',
    status: 'HIGH',
    testDate: '2026-09-15',
    reportDate: '2026-09-15',
    notes: 'Target INR 2.0–3.0. Currently above therapeutic range — bleeding risk elevated.',
    isAbnormal: true,
  },
  {
    id: 'lab-004',
    patientId: 'patient-001',
    testName: 'Blood Pressure',
    value: '158/96',
    unit: 'mmHg',
    status: 'HIGH',
    testDate: '2026-09-20',
    reportDate: '2026-09-20',
    isAbnormal: true,
  },
  {
    id: 'lab-005',
    patientId: 'patient-001',
    testName: 'Serum Creatinine',
    value: '0.9',
    unit: 'mg/dL',
    status: 'NORMAL',
    testDate: '2026-09-10',
    reportDate: '2026-09-11',
    isAbnormal: false,
  },
  // Arjun Singh (patient-002)
  {
    id: 'lab-006',
    patientId: 'patient-002',
    testName: 'Total Cholesterol',
    value: '248',
    unit: 'mg/dL',
    status: 'HIGH',
    testDate: '2026-08-15',
    isAbnormal: true,
  },
  {
    id: 'lab-007',
    patientId: 'patient-002',
    testName: 'ECG',
    value: 'ST elevation noted',
    unit: '',
    status: 'CRITICAL',
    testDate: '2026-09-01',
    notes: 'Requires urgent cardiology review.',
    isAbnormal: true,
  },
  {
    id: 'lab-008',
    patientId: 'patient-002',
    testName: 'Blood Sugar Fasting',
    value: '142',
    unit: 'mg/dL',
    status: 'HIGH',
    testDate: '2026-08-15',
    isAbnormal: true,
  },
  // Sunita Patel (patient-003)
  {
    id: 'lab-009',
    patientId: 'patient-003',
    testName: 'Peak Flow Rate',
    value: '420',
    unit: 'L/min',
    status: 'NORMAL',
    testDate: '2026-07-01',
    isAbnormal: false,
  },
  // Ravi Kumar (patient-004)
  {
    id: 'lab-010',
    patientId: 'patient-004',
    testName: 'Serum Creatinine',
    value: '2.1',
    unit: 'mg/dL',
    status: 'HIGH',
    testDate: '2026-08-12',
    isAbnormal: true,
  },
  {
    id: 'lab-011',
    patientId: 'patient-004',
    testName: 'Blood Sugar Fasting',
    value: '160',
    unit: 'mg/dL',
    status: 'HIGH',
    testDate: '2026-08-12',
    isAbnormal: true,
  },
  // Anita Sharma (patient-005)
  {
    id: 'lab-012',
    patientId: 'patient-005',
    testName: 'Peak Flow',
    value: '350',
    unit: 'L/min',
    status: 'LOW',
    testDate: '2026-09-01',
    isAbnormal: true,
  },
  // Neha Verma (patient-006)
  {
    id: 'lab-013',
    patientId: 'patient-006',
    testName: 'TSH',
    value: '8.5',
    unit: 'µIU/mL',
    status: 'HIGH',
    testDate: '2026-08-25',
    isAbnormal: true,
  },
  // Karan Singh (patient-007)
  {
    id: 'lab-014',
    patientId: 'patient-007',
    testName: 'ECG',
    value: 'Ischemic ST-T changes',
    unit: '',
    status: 'CRITICAL',
    testDate: '2026-09-05',
    isAbnormal: true,
  },
  {
    id: 'lab-015',
    patientId: 'patient-007',
    testName: 'Total Cholesterol',
    value: '280',
    unit: 'mg/dL',
    status: 'HIGH',
    testDate: '2026-09-05',
    isAbnormal: true,
  },
  // Manoj Das (patient-008)
  {
    id: 'lab-016',
    patientId: 'patient-008',
    testName: 'HbA1c',
    value: '9.2',
    unit: '%',
    status: 'HIGH',
    testDate: '2026-09-12',
    isAbnormal: true,
  },
  // Sneha Roy (patient-009)
  {
    id: 'lab-017',
    patientId: 'patient-009',
    testName: 'Complete Blood Count',
    value: 'Within normal limits',
    unit: '',
    status: 'NORMAL',
    testDate: '2026-09-15',
    isAbnormal: false,
  },
  // Vikram Iyer (patient-010)
  {
    id: 'lab-018',
    patientId: 'patient-010',
    testName: 'C-Reactive Protein (CRP)',
    value: '12',
    unit: 'mg/L',
    status: 'HIGH',
    testDate: '2026-09-18',
    isAbnormal: true,
  },
  // Rajesh Gupta (patient-011)
  {
    id: 'lab-019',
    patientId: 'patient-011',
    testName: 'ECG',
    value: 'Abnormal Q-waves in V1-V3',
    unit: '',
    status: 'CRITICAL',
    testDate: '2026-09-22',
    isAbnormal: true,
  },
  {
    id: 'lab-020',
    patientId: 'patient-011',
    testName: 'INR',
    value: '3.6',
    unit: '',
    status: 'HIGH',
    testDate: '2026-09-22',
    isAbnormal: true,
  },
];

// ── Emergency Contacts ────────────────────────────────────────────────────────

export const MOCK_EMERGENCY_CONTACTS: EmergencyContact[] = [
  // Priya Mehta
  {
    id: 'ec-001',
    patientId: 'patient-001',
    name: 'Rajesh Mehta',
    relationship: 'Husband',
    phone: '9876500010',
    priority: 1,
  },
  {
    id: 'ec-002',
    patientId: 'patient-001',
    name: 'Sunita Mehta',
    relationship: 'Mother',
    phone: '9876500011',
    priority: 2,
  },
  // Arjun Singh
  {
    id: 'ec-003',
    patientId: 'patient-002',
    name: 'Kavita Singh',
    relationship: 'Wife',
    phone: '9876500020',
    priority: 1,
  },
  // Sunita Patel
  {
    id: 'ec-004',
    patientId: 'patient-003',
    name: 'Vikas Patel',
    relationship: 'Husband',
    phone: '9876500030',
    priority: 1,
  },
];

// ── Health Cards ──────────────────────────────────────────────────────────────

export const MOCK_HEALTH_CARDS: HealthCard[] = [
  { id: 'card-001', patientId: 'patient-001', cardNumber: 'JR-2026-00001', issuedAt: '2026-01-01T00:00:00Z', isActive: true },
  { id: 'card-002', patientId: 'patient-002', cardNumber: 'JR-2026-00002', issuedAt: '2026-01-15T00:00:00Z', isActive: true },
  { id: 'card-003', patientId: 'patient-003', cardNumber: 'JR-2026-00003', issuedAt: '2026-02-01T00:00:00Z', isActive: true },
  { id: 'card-004', patientId: 'patient-004', cardNumber: 'JR-2026-00004', issuedAt: '2026-02-10T00:00:00Z', isActive: true },
  { id: 'card-005', patientId: 'patient-005', cardNumber: 'JR-2026-00005', issuedAt: '2026-03-01T00:00:00Z', isActive: true },
  { id: 'card-006', patientId: 'patient-006', cardNumber: 'JR-2026-00006', issuedAt: '2026-03-15T00:00:00Z', isActive: true },
  { id: 'card-007', patientId: 'patient-007', cardNumber: 'JR-2026-00007', issuedAt: '2026-04-01T00:00:00Z', isActive: true },
  { id: 'card-008', patientId: 'patient-008', cardNumber: 'JR-2026-00008', issuedAt: '2026-04-12T00:00:00Z', isActive: true },
  { id: 'card-009', patientId: 'patient-009', cardNumber: 'JR-2026-00009', issuedAt: '2026-05-01T00:00:00Z', isActive: true },
  { id: 'card-010', patientId: 'patient-010', cardNumber: 'JR-2026-00010', issuedAt: '2026-05-15T00:00:00Z', isActive: true },
  { id: 'card-011', patientId: 'patient-011', cardNumber: 'JR-2026-00011', issuedAt: '2026-06-01T00:00:00Z', isActive: true },
];

// ── QR Tokens ─────────────────────────────────────────────────────────────────
// Tokens are opaque — they do not encode any patient information.
// The server resolves permitted emergency data from the token.

export const MOCK_QR_TOKENS: QRToken[] = [
  { id: 'qr-001', patientId: 'patient-001', token: 'jr2026pm001f7e3a9b2c4d8e1f5', issuedAt: '2026-01-01T00:00:00Z', revoked: false, scanCount: 3, lastScannedAt: '2026-09-20T14:30:00Z' },
  { id: 'qr-002', patientId: 'patient-002', token: 'jr2026as002c4d8e1f5a2b6c9d4', issuedAt: '2026-01-15T00:00:00Z', revoked: false, scanCount: 1, lastScannedAt: '2026-08-15T09:00:00Z' },
  { id: 'qr-003', patientId: 'patient-003', token: 'jr2026sp003a2b6c9d4f7e3a9b2', issuedAt: '2026-02-01T00:00:00Z', revoked: false, scanCount: 0 },
  { id: 'qr-004', patientId: 'patient-004', token: 'jr2026rk004b3c4d8e1f5a2b6c9', issuedAt: '2026-02-10T00:00:00Z', revoked: false, scanCount: 0 },
  { id: 'qr-005', patientId: 'patient-005', token: 'jr2026as005c4d8e1f5a2b6c9d4', issuedAt: '2026-03-01T00:00:00Z', revoked: false, scanCount: 0 },
  { id: 'qr-006', patientId: 'patient-006', token: 'jr2026nv006d8e1f5a2b6c9d4f7', issuedAt: '2026-03-15T00:00:00Z', revoked: false, scanCount: 0 },
  { id: 'qr-007', patientId: 'patient-007', token: 'jr2026ks007e1f5a2b6c9d4f7e3', issuedAt: '2026-04-01T00:00:00Z', revoked: false, scanCount: 0 },
  { id: 'qr-008', patientId: 'patient-008', token: 'jr2026md008f5a2b6c9d4f7e3a9', issuedAt: '2026-04-12T00:00:00Z', revoked: false, scanCount: 0 },
  { id: 'qr-009', patientId: 'patient-009', token: 'jr2026sr009a2b6c9d4f7e3a9b2', issuedAt: '2026-05-01T00:00:00Z', revoked: false, scanCount: 0 },
  { id: 'qr-010', patientId: 'patient-010', token: 'jr2026vi010b6c9d4f7e3a9b2c4', issuedAt: '2026-05-15T00:00:00Z', revoked: false, scanCount: 0 },
  { id: 'qr-011', patientId: 'patient-011', token: 'jr2026rg011c9d4f7e3a9b2c4d8', issuedAt: '2026-06-01T00:00:00Z', revoked: false, scanCount: 0 },
];

// ── Audit Logs ────────────────────────────────────────────────────────────────

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'audit-001',
    patientId: 'patient-001',
    accessedBy: 'user-doctor-001',
    accessorName: 'Dr. Arjun Sharma',
    accessorRole: 'DOCTOR',
    accessType: 'DOCTOR_VIEWED_PATIENT',
    accessedAt: '2026-09-20T09:15:00Z',
  },
  {
    id: 'audit-002',
    patientId: 'patient-001',
    accessType: 'EMERGENCY_QR_ACCESSED',
    tokenUsed: 'jr2026pm001f7e3a9b2c4d8e1f5',
    accessedAt: '2026-09-20T14:30:00Z',
    details: 'Emergency QR scanned — paramedic access',
  },
  {
    id: 'audit-003',
    patientId: 'patient-001',
    accessedBy: 'user-doctor-001',
    accessorName: 'Dr. Arjun Sharma',
    accessorRole: 'DOCTOR',
    accessType: 'DOCTOR_RAN_SAFETY_ANALYSIS',
    accessedAt: '2026-09-20T09:20:00Z',
  },
  {
    id: 'audit-004',
    patientId: 'patient-001',
    accessedBy: 'user-patient-001',
    accessorName: 'Priya Mehta',
    accessorRole: 'PATIENT',
    accessType: 'PATIENT_VIEWED_OWN_RECORD',
    accessedAt: '2026-09-22T16:45:00Z',
  },
  {
    id: 'audit-005',
    patientId: 'patient-001',
    accessType: 'EMERGENCY_QR_ACCESSED',
    tokenUsed: 'jr2026pm001f7e3a9b2c4d8e1f5',
    accessedAt: '2026-09-18T08:12:00Z',
    details: 'Emergency QR scanned — hospital admission',
  },
  {
    id: 'audit-006',
    patientId: 'patient-002',
    accessedBy: 'user-doctor-001',
    accessorName: 'Dr. Arjun Sharma',
    accessorRole: 'DOCTOR',
    accessType: 'DOCTOR_VIEWED_PATIENT',
    accessedAt: '2026-09-19T11:00:00Z',
  },
];
