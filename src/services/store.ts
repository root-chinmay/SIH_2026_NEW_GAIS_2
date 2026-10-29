import {
  AcademicCredential,
  AdmissionStatus,
  AuditEvent,
  CorrectionRequest,
  DiscrepancyCase,
  Institution,
  Language,
  Programme,
  RegulatoryRule,
  Role,
  SecurityEvent,
  StudentAttestation,
  StudentRecord,
  SubmissionBatch,
  UserContext,
} from '../types';
import {
  SEED_ATTESTATIONS,
  SEED_DISCREPANCIES,
  SEED_INSTITUTIONS,
  SEED_RULES,
  SEED_SECURITY_EVENTS,
  generateSeedAuditChain,
  generateSeedCredentials,
  generateSeedStudents,
} from '../data/seedData';
import {
  computeEventHash,
  generateMatchingToken,
  signAcademicCredential,
} from './cryptoEngine';
import { validateSingleRecord } from './validationEngine';

export interface AdmissionGateRequest {
  idempotencyKey: string;
  institutionId: string;
  programmeId: string;
  academicYear: string;
  apaarId: string;
  studentName: string;
  institutionalStudentId: string;
  admissionCategory: string;
  isSupernumerary: boolean;
  supernumeraryType?: 'NRI' | 'OCI' | 'FN' | 'TFW' | 'EWS';
  proposedAdmissionDate: string;
  seatCategory: string;
}

export interface AdmissionGateDecision {
  status:
    | 'Eligible to Proceed'
    | 'Warning — Review Required'
    | 'Blocked — Configured Rule Failed'
    | 'Duplicate Conflict Requires Investigation';
  eligible: boolean;
  requiresReview: boolean;
  reasons: string[];
  capacityCheck: {
    approvedIntake: number;
    currentEnrolled: number;
    availableSeats: number;
    isSupernumerary: boolean;
  };
  reservationId?: string;
  idempotencyCached: boolean;
}

export interface WhatIfScenario {
  institutionId: string;
  programmeId: string;
  additionalAdmissions: number;
  projectedWithdrawals: number;
  supernumeraryAdjustments: number;
}

export interface WhatIfResult {
  approvedCapacity: number;
  currentReported: number;
  projectedActive: number;
  currentUtilizationPct: number;
  projectedUtilizationPct: number;
  currentVacancies: number;
  projectedVacancies: number;
  intakeDiscrepancy: number; // positive if exceeded
  projectedAlerts: {
    ruleId: string;
    severity: 'CRITICAL' | 'WARNING' | 'INFO';
    message: string;
  }[];
}

const STORAGE_KEY = 'apaar_integrity_mesh_state_v1';

export interface AppState {
  currentUser: UserContext;
  language: Language;
  institutions: Institution[];
  students: StudentRecord[];
  batches: SubmissionBatch[];
  rules: RegulatoryRule[];
  discrepancies: DiscrepancyCase[];
  attestations: StudentAttestation[];
  corrections: CorrectionRequest[];
  auditChain: AuditEvent[];
  credentials: AcademicCredential[];
  securityEvents: SecurityEvent[];
  gateIdempotencyCache: Record<string, AdmissionGateDecision>;
}

export const DEMO_USERS: Record<Role, UserContext> = {
  INSTITUTION_ADMIN: {
    id: 'USR-ADMIN-DTU',
    name: 'Prof. Ramesh K. Sharma',
    email: 'registrar@dtu.ac.in',
    role: 'INSTITUTION_ADMIN',
    institutionId: 'INST-DEL-01',
    institutionName: 'Delhi Technological University',
  },
  INSTITUTION_OPERATOR: {
    id: 'USR-OPERATOR-DTU',
    name: 'Rajesh Nair',
    email: 'operator@dtu.ac.in',
    role: 'INSTITUTION_OPERATOR',
    institutionId: 'INST-DEL-01',
    institutionName: 'Delhi Technological University',
  },
  INSTITUTION_SIGNATORY: {
    id: 'USR-SIGNATORY-DTU',
    name: 'Prof. K. L. Varma',
    email: 'signatory@dtu.ac.in',
    role: 'INSTITUTION_SIGNATORY',
    institutionId: 'INST-DEL-01',
    institutionName: 'Delhi Technological University',
  },
  AICTE_ADMIN: {
    id: 'USR-AICTE-REG',
    name: 'Dr. Anita Roy',
    email: 'anita.roy@aicte-india.org',
    role: 'AICTE_ADMIN',
  },
  AICTE_AUDITOR: {
    id: 'USR-AICTE-AUDIT',
    name: 'Shri B. M. Hegde',
    email: 'bm.hegde@aicte-inspect.gov.in',
    role: 'AICTE_AUDITOR',
  },
  STUDENT: {
    id: 'USR-STU-001',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@student.dtu.ac.in',
    role: 'STUDENT',
    institutionId: 'INST-DEL-01',
    studentId: 'STU-DEL-001',
  },
  AUTHORIZED_VERIFIER: {
    id: 'USR-VERIFIER',
    name: 'Infosys Campus Verification Team',
    email: 'verify.academic@infosys.com',
    role: 'AUTHORIZED_VERIFIER',
  },
  SECURITY_ADMIN: {
    id: 'USR-SEC-ADMIN',
    name: 'CISO Office, AICTE Cloud Cell',
    email: 'ciso@aicte-india.org',
    role: 'SECURITY_ADMIN',
  },
};

function createInitialState(): AppState {
  const initialStudents = generateSeedStudents();
  const initialAuditChain = generateSeedAuditChain();
  const initialCredentials = generateSeedCredentials(initialStudents);

  return {
    currentUser: DEMO_USERS.INSTITUTION_ADMIN,
    language: 'en',
    institutions: JSON.parse(JSON.stringify(SEED_INSTITUTIONS)),
    students: initialStudents,
    batches: [
      {
        id: 'BATCH-DTU-2026-01',
        batchNumber: 'DTU/2026/CSE/B1',
        institutionId: 'INST-DEL-01',
        programmeId: 'PROG-DEL-CSE',
        academicYear: '2026-2027',
        uploadedBy: 'Rajesh Nair',
        uploaderRole: 'INSTITUTION_OPERATOR',
        uploadedAt: '2026-08-01T10:00:00Z',
        totalRecords: 21,
        validRecords: 20,
        warningRecords: 0,
        invalidRecords: 1,
        status: 'APPROVED',
        signatoryApprovedBy: 'Prof. Ramesh K. Sharma',
        signatoryApprovedAt: '2026-08-01T14:30:00Z',
        signatoryComments: 'Reviewed and certified. Over-capacity intake exception flagged for AICTE.',
        integrityHash: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
        records: initialStudents.filter(
          (s) => s.institutionId === 'INST-DEL-01' && s.programmeId === 'PROG-DEL-CSE'
        ),
      },
    ],
    rules: JSON.parse(JSON.stringify(SEED_RULES)),
    discrepancies: JSON.parse(JSON.stringify(SEED_DISCREPANCIES)),
    attestations: JSON.parse(JSON.stringify(SEED_ATTESTATIONS)),
    corrections: [
      {
        id: 'CORR-2026-001',
        recordId: 'EDGE-MISSING-APAAR',
        institutionId: 'INST-DEL-01',
        requestedBy: 'operator@dtu.ac.in',
        requestedAt: '2026-08-04T12:00:00Z',
        originalData: { apaarId: '' },
        proposedData: { apaarId: 'APAAR-DEMO-0022' },
        evidenceReference: 'DigiLocker APAAR Allotment Certificate DL-2026-94821',
        justification: 'Student submitted updated APAAR card obtained during physical registration.',
        status: 'PENDING_SIGNATORY',
      },
    ],
    auditChain: initialAuditChain,
    credentials: initialCredentials,
    securityEvents: JSON.parse(JSON.stringify(SEED_SECURITY_EVENTS)),
    gateIdempotencyCache: {},
  };
}

class Store {
  private state: AppState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): AppState {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Ignore storage errors and use defaults
    }
    return createInitialState();
  }

  private saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      // Storage quota or disabled
    }
    this.notify();
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public getState(): AppState {
    return this.state;
  }

  public resetDemoData() {
    this.state = createInitialState();
    this.saveState();
  }

  public setLanguage(lang: Language) {
    this.state.language = lang;
    this.saveState();
  }

  public switchRole(role: Role, institutionId?: string) {
    const user = { ...DEMO_USERS[role] };
    if (institutionId) {
      user.institutionId = institutionId;
      const inst = this.state.institutions.find((i) => i.id === institutionId);
      if (inst) user.institutionName = inst.name;
    }
    this.state.currentUser = user;
    this.saveState();
  }

  // Append new audit event into SHA-256 forward-linked chain
  public addAuditEvent(
    actor: string,
    role: Role,
    action: string,
    entityType: AuditEvent['entityType'],
    entityId: string,
    details: string,
    institutionId?: string
  ) {
    const chain = this.state.auditChain;
    const prevHash =
      chain.length > 0
        ? chain[chain.length - 1].eventHash
        : 'GENESIS_00000000000000000000000000000000';
    const seq = chain.length + 1;
    const ts = new Date().toISOString();

    const eventHash = computeEventHash({
      sequenceNumber: seq,
      timestamp: ts,
      actor,
      role,
      action,
      entityType,
      entityId,
      institutionId,
      details,
      previousHash: prevHash,
    });

    const newEvent: AuditEvent = {
      id: `AUD-EVT-${String(seq).padStart(4, '0')}`,
      sequenceNumber: seq,
      timestamp: ts,
      actor,
      role,
      action,
      entityType,
      entityId,
      institutionId,
      details,
      previousHash: prevHash,
      eventHash,
    };

    this.state.auditChain.push(newEvent);
    this.saveState();
  }

  // Student upload & batch handling
  public commitBatch(
    batchData: {
      institutionId: string;
      programmeId: string;
      academicYear: string;
      records: Partial<StudentRecord>[];
    }
  ): SubmissionBatch {
    const inst = this.state.institutions.find((i) => i.id === batchData.institutionId)!;
    const prog = inst.programmes.find((p) => p.id === batchData.programmeId)!;

    const committedRecords: StudentRecord[] = [];
    let validCount = 0;
    let warningCount = 0;
    let invalidCount = 0;

    for (const rec of batchData.records) {
      const v = validateSingleRecord(rec, {
        institution: inst,
        programme: prog,
        existingStudentsInSameBatch: batchData.records,
        allExistingStudentsInSystem: this.state.students,
      });

      if (v.status === 'VALID') validCount++;
      else if (v.status === 'WARNING') warningCount++;
      else invalidCount++;

      const studentId = rec.id || `STU-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const apaar = rec.apaarId?.trim().toUpperCase() || '';
      const matchingToken = apaar ? generateMatchingToken(apaar) : 'HMAC-UNMAPPED';

      const fullRecord: StudentRecord = {
        id: studentId,
        apaarId: apaar,
        matchingToken,
        institutionalStudentId: rec.institutionalStudentId || `INST-${Date.now()}`,
        name: rec.name || 'Unnamed',
        dob: rec.dob || '2005-01-01',
        gender: rec.gender || 'Male',
        institutionId: inst.id,
        programmeId: prog.id,
        academicYear: batchData.academicYear,
        admissionDate: rec.admissionDate || new Date().toISOString().split('T')[0],
        enrolmentStartDate: rec.enrolmentStartDate || new Date().toISOString().split('T')[0],
        admissionCategory: rec.admissionCategory || 'General',
        isSupernumerary: Boolean(rec.isSupernumerary),
        supernumeraryType: rec.supernumeraryType,
        admissionStatus: rec.admissionStatus || 'Provisionally Admitted',
        validationStatus: v.status,
        externalVerificationStatus: 'Format Checked',
        batchId: '', // populated below
        recordVersion: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        validFrom: rec.admissionDate || new Date().toISOString().split('T')[0],
      };

      committedRecords.push(fullRecord);
    }

    const batchId = `BATCH-${inst.code}-${Date.now().toString().slice(-4)}`;
    committedRecords.forEach((r) => (r.batchId = batchId));

    const newBatch: SubmissionBatch = {
      id: batchId,
      batchNumber: `${inst.code}/${prog.code}/${new Date().getFullYear()}`,
      institutionId: inst.id,
      programmeId: prog.id,
      academicYear: batchData.academicYear,
      uploadedBy: this.state.currentUser.name,
      uploaderRole: this.state.currentUser.role,
      uploadedAt: new Date().toISOString(),
      totalRecords: committedRecords.length,
      validRecords: validCount,
      warningRecords: warningCount,
      invalidRecords: invalidCount,
      status: 'PENDING_APPROVAL',
      integrityHash: generateMatchingToken(`BATCH-${batchId}-${Date.now()}`),
      records: committedRecords,
    };

    this.state.batches.unshift(newBatch);
    this.state.students.push(...committedRecords);

    this.addAuditEvent(
      this.state.currentUser.email,
      this.state.currentUser.role,
      'BATCH_UPLOAD_SUBMITTED',
      'BATCH',
      batchId,
      `Uploaded batch ${newBatch.batchNumber} with ${committedRecords.length} student records (${validCount} valid, ${invalidCount} invalid).`,
      inst.id
    );

    this.saveState();
    return newBatch;
  }

  // Tenant Isolation Guard
  public canUserAccessInstitution(
    userOrTargetId: string | { role: string; institutionId?: string },
    maybeTargetId?: string
  ): boolean {
    const user = typeof userOrTargetId === 'object' ? userOrTargetId : this.state.currentUser;
    const targetInstId = typeof userOrTargetId === 'string' ? userOrTargetId : (maybeTargetId || '');

    const role = user.role;
    // Regulatory Admin & Auditor have national multi-tenant read/write/audit permissions
    if (role === 'AICTE_ADMIN' || role === 'AICTE_AUDITOR' || role === 'SECURITY_ADMIN' || role === 'AUTHORIZED_VERIFIER') {
      return true;
    }
    // Student can only access their enrolled institution
    if (role === 'STUDENT') {
      return user.institutionId === targetInstId;
    }
    // Institutional Admin, Operator, Signatory are strictly isolated to their own institution
    const isAllowed = Boolean(user.institutionId && user.institutionId === targetInstId);
    if (!isAllowed && typeof userOrTargetId === 'string') {
      this.recordSecurityEvent(
        'CROSS_TENANT_BLOCKED',
        `Access denied: User ${this.state.currentUser.email} (${role}) from ${this.state.currentUser.institutionId} attempted to access ${targetInstId}`,
        true
      );
    }
    return isAllowed;
  }

  // Signatory approval of batch
  public approveBatch(batchId: string, comments: string): SubmissionBatch | null {
    const batch = this.state.batches.find((b) => b.id === batchId);
    if (!batch) return null;

    batch.status = 'APPROVED';
    batch.signatoryApprovedBy = this.state.currentUser.name;
    batch.signatoryApprovedAt = new Date().toISOString();
    batch.signatoryComments = comments;

    // Transition provisional students in this batch to officially confirmed
    if (batch.records) {
      batch.records.forEach((rec) => {
        const student = this.state.students.find((s) => s.id === rec.id);
        if (student && student.admissionStatus === 'Provisionally Admitted' && student.validationStatus === 'VALID') {
          student.admissionStatus = 'Admission Confirmed';
          student.updatedAt = new Date().toISOString();
        }
      });
    }

    this.addAuditEvent(
      this.state.currentUser.email,
      this.state.currentUser.role,
      'BATCH_SIGNATORY_APPROVED',
      'BATCH',
      batch.id,
      `Signatory ${this.state.currentUser.name} officially approved batch ${batch.batchNumber}: ${comments}`,
      batch.institutionId
    );

    this.saveState();
    return batch;
  }

  public rejectBatch(batchId: string, reason: string): SubmissionBatch | null {
    const batch = this.state.batches.find((b) => b.id === batchId);
    if (!batch) return null;

    batch.status = 'REJECTED';
    batch.signatoryApprovedBy = this.state.currentUser.name;
    batch.signatoryApprovedAt = new Date().toISOString();
    batch.signatoryComments = reason;

    // Mark students in this rejected batch as not confirmed
    if (batch.records) {
      batch.records.forEach((rec) => {
        const student = this.state.students.find((s) => s.id === rec.id);
        if (student && student.admissionStatus === 'Provisionally Admitted') {
          student.admissionStatus = 'Admission Cancelled';
          student.updatedAt = new Date().toISOString();
        }
      });
    }

    this.addAuditEvent(
      this.state.currentUser.email,
      this.state.currentUser.role,
      'BATCH_SIGNATORY_REJECTED',
      'BATCH',
      batch.id,
      `Signatory ${this.state.currentUser.name} rejected batch ${batch.batchNumber}: ${reason}`,
      batch.institutionId
    );

    this.saveState();
    return batch;
  }

  // Add / Edit Institution (Section 8)
  public addInstitution(instData: Institution) {
    this.state.institutions.push(instData);
    this.addAuditEvent(
      this.state.currentUser.email,
      this.state.currentUser.role,
      'INSTITUTION_REGISTERED',
      'RULE',
      instData.id,
      `Registered new institution ${instData.name} (${instData.code}) with ${instData.programmes.length} approved programmes.`,
      instData.id
    );
    this.saveState();
  }

  public updateInstitution(updatedInst: Institution) {
    const idx = this.state.institutions.findIndex((i) => i.id === updatedInst.id);
    if (idx !== -1) {
      this.state.institutions[idx] = updatedInst;
      this.addAuditEvent(
        this.state.currentUser.email,
        this.state.currentUser.role,
        'INSTITUTION_UPDATED',
        'RULE',
        updatedInst.id,
        `Updated configuration for ${updatedInst.name} (${updatedInst.code})`,
        updatedInst.id
      );
      this.saveState();
    }
  }

  public addProgrammeToIntake(institutionId: string, prog: Programme) {
    const inst = this.state.institutions.find((i) => i.id === institutionId);
    if (!inst) return;
    inst.programmes.push(prog);
    this.addAuditEvent(
      this.state.currentUser.email,
      this.state.currentUser.role,
      'PROGRAMME_INTAKE_ADDED',
      'RULE',
      prog.id,
      `Added programme ${prog.name} (${prog.code}) with approved intake of ${prog.approvedIntake} to ${inst.name}`,
      inst.id
    );
    this.saveState();
  }

  public recordSecurityEvent(
    eventType: SecurityEvent['eventType'],
    details: string,
    blocked = false,
    severity: SecurityEvent['severity'] = 'HIGH'
  ) {
    const newSecEvent: SecurityEvent = {
      id: `SEC-${Date.now().toString().slice(-5)}`,
      timestamp: new Date().toISOString(),
      eventType,
      actor: this.state.currentUser.email,
      ipAddress: '14.139.224.2',
      severity,
      details,
      blocked,
    };
    this.state.securityEvents.unshift(newSecEvent);
    this.saveState();
  }

  // Correction workflow
  public submitCorrectionRequest(
    recordId: string,
    proposedData: Partial<StudentRecord>,
    evidenceReference: string,
    justification: string
  ): CorrectionRequest {
    const student = this.state.students.find((s) => s.id === recordId)!;
    const correctionId = `CORR-${Date.now().toString().slice(-6)}`;

    const correction: CorrectionRequest = {
      id: correctionId,
      recordId,
      institutionId: student.institutionId,
      requestedBy: this.state.currentUser.email,
      requestedAt: new Date().toISOString(),
      originalData: { ...student },
      proposedData,
      evidenceReference,
      justification,
      status: 'PENDING_SIGNATORY',
    };

    this.state.corrections.unshift(correction);

    this.addAuditEvent(
      this.state.currentUser.email,
      this.state.currentUser.role,
      'CORRECTION_REQUESTED',
      'CORRECTION',
      correctionId,
      `Correction submitted for ${student.name} (${student.apaarId || 'No APAAR'}): ${justification}`,
      student.institutionId
    );

    this.saveState();
    return correction;
  }

  public reviewCorrection(correctionId: string, approved: boolean, remarks: string) {
    const corr = this.state.corrections.find((c) => c.id === correctionId);
    if (!corr) return;

    corr.status = approved ? 'APPROVED' : 'REJECTED';
    corr.reviewedBy = this.state.currentUser.email;
    corr.reviewedAt = new Date().toISOString();
    corr.reviewRemarks = remarks;

    if (approved) {
      const student = this.state.students.find((s) => s.id === corr.recordId);
      if (student) {
        student.recordVersion += 1;
        student.updatedAt = new Date().toISOString();

        if (corr.proposedData.apaarId) {
          student.apaarId = corr.proposedData.apaarId.trim().toUpperCase();
          student.matchingToken = generateMatchingToken(student.apaarId);
        }
        if (corr.proposedData.name) student.name = corr.proposedData.name;
        if (corr.proposedData.admissionCategory) {
          student.admissionCategory = corr.proposedData.admissionCategory;
        }
        if (corr.proposedData.isSupernumerary !== undefined) {
          student.isSupernumerary = corr.proposedData.isSupernumerary;
          student.supernumeraryType = corr.proposedData.supernumeraryType;
        }

        // Re-evaluate validation status
        const inst = this.state.institutions.find((i) => i.id === student.institutionId)!;
        const prog = inst.programmes.find((p) => p.id === student.programmeId)!;
        const reval = validateSingleRecord(student, {
          institution: inst,
          programme: prog,
          existingStudentsInSameBatch: [student],
          allExistingStudentsInSystem: this.state.students,
        });

        student.validationStatus = reval.status;
      }
    }

    this.addAuditEvent(
      this.state.currentUser.email,
      this.state.currentUser.role,
      approved ? 'CORRECTION_APPROVED' : 'CORRECTION_REJECTED',
      'CORRECTION',
      corr.id,
      `Signatory decision on ${corr.id}: ${approved ? 'APPROVED' : 'REJECTED'} (${remarks})`,
      corr.institutionId
    );

    this.saveState();
  }

  // Interactive Admission Gate simulation (Section 14)
  public evaluateAdmissionGate(req: AdmissionGateRequest): AdmissionGateDecision {
    // 1. Idempotency check
    if (this.state.gateIdempotencyCache[req.idempotencyKey]) {
      return {
        ...this.state.gateIdempotencyCache[req.idempotencyKey],
        idempotencyCached: true,
      };
    }

    const inst = this.state.institutions.find((i) => i.id === req.institutionId);
    if (!inst) {
      return {
        status: 'Blocked — Configured Rule Failed',
        eligible: false,
        requiresReview: false,
        reasons: [`Institution ID ${req.institutionId} does not exist in AICTE directory.`],
        capacityCheck: { approvedIntake: 0, currentEnrolled: 0, availableSeats: 0, isSupernumerary: false },
        idempotencyCached: false,
      };
    }

    const prog = inst.programmes.find((p) => p.id === req.programmeId);
    if (!prog) {
      return {
        status: 'Blocked — Configured Rule Failed',
        eligible: false,
        requiresReview: false,
        reasons: [`Programme ${req.programmeId} is not approved for ${inst.name}.`],
        capacityCheck: { approvedIntake: 0, currentEnrolled: 0, availableSeats: 0, isSupernumerary: false },
        idempotencyCached: false,
      };
    }

    const reasons: string[] = [];
    const activeStudents = this.state.students.filter(
      (s) =>
        s.institutionId === inst.id &&
        s.programmeId === prog.id &&
        s.academicYear === req.academicYear &&
        s.admissionStatus !== 'Admission Cancelled' &&
        s.admissionStatus !== 'Withdrawal Approved'
    );

    const regularActive = activeStudents.filter((s) => !s.isSupernumerary);
    const availableSeats = Math.max(0, prog.approvedIntake - regularActive.length);

    // Check capacity
    if (!req.isSupernumerary && availableSeats <= 0) {
      reasons.push(
        `Intake capacity full: ${regularActive.length} / ${prog.approvedIntake} regular seats currently occupied.`
      );
    }

    // Check supernumerary limit if applicable
    if (req.isSupernumerary && req.supernumeraryType) {
      const sType = req.supernumeraryType.toLowerCase() as keyof typeof prog.supernumeraryLimits;
      const limit = prog.supernumeraryLimits[sType] || 0;
      const currentSuper = activeStudents.filter(
        (s) => s.isSupernumerary && s.supernumeraryType?.toLowerCase() === sType
      ).length;

      if (currentSuper >= limit) {
        reasons.push(
          `Supernumerary ceiling reached for ${req.supernumeraryType}: ${currentSuper} / ${limit} seats occupied.`
        );
      }
    }

    // Check cross-institution active admission
    const crossActive = this.state.students.filter(
      (s) =>
        s.apaarId.trim().toUpperCase() === req.apaarId.trim().toUpperCase() &&
        s.institutionId !== inst.id &&
        (s.admissionStatus === 'Admission Confirmed' ||
          s.admissionStatus === 'Enrollment Reported' ||
          s.admissionStatus === 'Provisionally Admitted')
    );

    if (crossActive.length > 0) {
      reasons.push(
        `Cross-institution conflict: Active admission exists at ${crossActive[0].institutionId} without withdrawal record.`
      );
    }

    let status: AdmissionGateDecision['status'] = 'Eligible to Proceed';
    let eligible = true;
    let requiresReview = false;

    if (crossActive.length > 0) {
      status = 'Duplicate Conflict Requires Investigation';
      eligible = false;
      requiresReview = true;
    } else if (reasons.length > 0) {
      status = 'Blocked — Configured Rule Failed';
      eligible = false;
    }

    const decision: AdmissionGateDecision = {
      status,
      eligible,
      requiresReview,
      reasons: reasons.length > 0 ? reasons : ['All statutory checks passed. Seat capacity verified.'],
      capacityCheck: {
        approvedIntake: prog.approvedIntake,
        currentEnrolled: regularActive.length,
        availableSeats,
        isSupernumerary: req.isSupernumerary,
      },
      reservationId: eligible ? `RES-${Date.now().toString().slice(-6)}` : undefined,
      idempotencyCached: false,
    };

    // Cache decision for idempotency
    this.state.gateIdempotencyCache[req.idempotencyKey] = decision;

    this.addAuditEvent(
      this.state.currentUser.email,
      this.state.currentUser.role,
      'ADMISSION_GATE_QUERY',
      'GATE',
      req.idempotencyKey,
      `Gate check for ${req.studentName} (${req.apaarId}): ${decision.status}`,
      inst.id
    );

    this.saveState();
    return decision;
  }

  // Dual Override Workflow (Section 14)
  public executeGateOverride(
    idempotencyKey: string,
    instReason: string,
    aicteOfficer: string
  ): AdmissionGateDecision {
    const cached = this.state.gateIdempotencyCache[idempotencyKey];
    const reservationId = `OVR-RES-${Date.now().toString().slice(-6)}`;
    const overrideDecision: AdmissionGateDecision = {
      status: 'Eligible to Proceed',
      eligible: true,
      requiresReview: false,
      reasons: [
        `EMERGENCY STATUTORY DUAL-OVERRIDE GRANTED:`,
        `• Institutional Signatory Reason: "${instReason}"`,
        `• AICTE Regulatory Officer Authorization: "${aicteOfficer}"`,
        `• Regulatory Notice: Does not silently alter sanctioned intake ceiling; tracked as an auditable exception.`,
      ],
      capacityCheck: cached
        ? cached.capacityCheck
        : { approvedIntake: 20, currentEnrolled: 20, availableSeats: 0, isSupernumerary: false },
      reservationId,
      idempotencyCached: false,
    };
    this.state.gateIdempotencyCache[idempotencyKey] = overrideDecision;
    this.addAuditEvent(
      aicteOfficer,
      'AICTE_ADMIN',
      'ADMISSION_GATE_OVERRIDE_APPROVED',
      'GATE',
      reservationId,
      `Dual override executed for key ${idempotencyKey}: ${instReason}`
    );
    this.saveState();
    return overrideDecision;
  }

  // What-If Digital Twin simulator (Section 16) - Never alters committed state
  public runWhatIfSimulation(scenario: WhatIfScenario): WhatIfResult {
    const inst = this.state.institutions.find((i) => i.id === scenario.institutionId);
    const prog = inst?.programmes.find((p) => p.id === scenario.programmeId);

    if (!inst || !prog) {
      return {
        approvedCapacity: 0,
        currentReported: 0,
        projectedActive: 0,
        currentUtilizationPct: 0,
        projectedUtilizationPct: 0,
        currentVacancies: 0,
        projectedVacancies: 0,
        intakeDiscrepancy: 0,
        projectedAlerts: [],
      };
    }

    const currentRegularActive = this.state.students.filter(
      (s) =>
        s.institutionId === inst.id &&
        s.programmeId === prog.id &&
        !s.isSupernumerary &&
        (s.admissionStatus === 'Admission Confirmed' ||
          s.admissionStatus === 'Enrollment Reported' ||
          s.admissionStatus === 'Provisionally Admitted')
    ).length;

    const projectedActive = Math.max(
      0,
      currentRegularActive + scenario.additionalAdmissions - scenario.projectedWithdrawals
    );

    const approvedCapacity = prog.approvedIntake;
    const currentUtilizationPct = Math.round((currentRegularActive / approvedCapacity) * 100);
    const projectedUtilizationPct = Math.round((projectedActive / approvedCapacity) * 100);

    const currentVacancies = Math.max(0, approvedCapacity - currentRegularActive);
    const projectedVacancies = Math.max(0, approvedCapacity - projectedActive);

    const intakeDiscrepancy = Math.max(0, projectedActive - approvedCapacity);

    const projectedAlerts: WhatIfResult['projectedAlerts'] = [];
    if (intakeDiscrepancy > 0) {
      projectedAlerts.push({
        ruleId: 'APH-2026-REG-CAPACITY',
        severity: 'CRITICAL',
        message: `Hypothetical scenario exceeds approved regular intake by ${intakeDiscrepancy} seats (${projectedActive} / ${approvedCapacity}).`,
      });
    }

    if (scenario.supernumeraryAdjustments > 5) {
      projectedAlerts.push({
        ruleId: 'APH-2026-SUPERNUMERARY',
        severity: 'WARNING',
        message: 'Supernumerary expansion exceeds standard 15% aggregate institutional ceiling.',
      });
    }

    return {
      approvedCapacity,
      currentReported: currentRegularActive,
      projectedActive,
      currentUtilizationPct,
      projectedUtilizationPct,
      currentVacancies,
      projectedVacancies,
      intakeDiscrepancy,
      projectedAlerts,
    };
  }

  // Student attestation / dispute (Section 21)
  public submitStudentAttestation(
    attestationId: string,
    action: 'CONFIRM' | 'DISPUTE',
    remarks: string
  ) {
    const att = this.state.attestations.find((a) => a.id === attestationId);
    if (!att) return;

    att.status = action === 'CONFIRM' ? 'CONFIRMED' : 'DISPUTED';
    att.responseTimestamp = new Date().toISOString();
    att.studentRemarks = remarks;
    if (action === 'DISPUTE') {
      att.disputeReason = remarks;

      // Automatically create or update discrepancy case
      const student = this.state.students.find((s) => s.apaarId === att.apaarId);
      const newCase: DiscrepancyCase = {
        id: `CASE-DISP-${Date.now().toString().slice(-4)}`,
        apaarId: att.apaarId,
        studentName: student?.name || 'Student',
        issueType: 'STUDENT_DISPUTE',
        severity: 'HIGH',
        involvedInstitutions: [att.institutionId],
        programmeId: att.programmeId,
        academicYear: att.academicYear,
        status: 'NEW',
        riskScore: 78,
        riskFormulaBreakdown: [
          { factor: 'Student Dispute Statement', weight: 60, points: 60, explanation: 'Direct student disavowal recorded.' },
          { factor: 'Unconfirmed Enrollment', weight: 40, points: 18, explanation: 'Admission status was provisional.' },
        ],
        findingsClassification: 'Data Quality Error',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        evidenceNotes: [`Student attestation response: "${remarks}"`],
      };
      this.state.discrepancies.unshift(newCase);
    }

    this.addAuditEvent(
      this.state.currentUser.email,
      this.state.currentUser.role,
      action === 'CONFIRM' ? 'STUDENT_ATTESTATION_CONFIRMED' : 'STUDENT_ADMISSION_DISPUTED',
      'STUDENT',
      att.apaarId,
      `Student ${action === 'CONFIRM' ? 'confirmed' : 'disputed'} admission details: ${remarks}`,
      att.institutionId
    );

    this.saveState();
  }

  // Issue academic verifiable credential (Section 23)
  public issueCredential(studentId: string): AcademicCredential {
    const s = this.state.students.find((stu) => stu.id === studentId)!;
    const inst = this.state.institutions.find((i) => i.id === s.institutionId)!;
    const prog = inst.programmes.find((p) => p.id === s.programmeId)!;

    const claims = {
      iss: inst.name,
      sub: s.apaarId,
      aud: 'AICTE-NATIONAL-CREDENTIAL-REGISTRY',
      expYear: '2030',
      prog: prog.name,
      status: 'VERIFIED_ENROLLED',
    };

    const sig = signAcademicCredential(claims);

    const credential: AcademicCredential = {
      id: `CRED-${s.id}-${Date.now().toString().slice(-4)}`,
      credentialNumber: `AICTE-CRED-2026-${s.apaarId.replace('APAAR-DEMO-', '')}`,
      receiptNumber: `RCPT-2026-${s.apaarId.replace('APAAR-DEMO-', '')}`,
      studentApaarId: s.apaarId,
      studentName: s.name,
      institutionalStudentId: s.institutionalStudentId,
      institutionId: inst.id,
      institutionName: inst.name,
      programmeName: prog.name,
      academicYear: s.academicYear,
      admissionStatus: s.admissionStatus,
      issuedAt: new Date().toISOString(),
      status: 'ACTIVE',
      signatureAlgorithm: sig.signatureAlgorithm,
      digitalSignature: sig.signature,
      signedClaims: claims,
      qrPayload: JSON.stringify({
        ref: `AICTE-CRED-2026-${s.apaarId.replace('APAAR-DEMO-', '')}`,
        apaar: s.apaarId,
        inst: inst.id,
        sig: sig.signature,
      }),
    };

    this.state.credentials.unshift(credential);

    this.addAuditEvent(
      this.state.currentUser.email,
      this.state.currentUser.role,
      'CREDENTIAL_ISSUED',
      'CREDENTIAL',
      credential.credentialNumber,
      `Issued verifiable digital academic credential for ${s.name} (${s.apaarId})`,
      inst.id
    );

    this.saveState();
    return credential;
  }

  // Revoke credential
  public revokeCredential(credentialId: string, reason: string) {
    const cred = this.state.credentials.find((c) => c.id === credentialId);
    if (!cred) return;

    cred.status = 'REVOKED';

    this.addAuditEvent(
      this.state.currentUser.email,
      this.state.currentUser.role,
      'CREDENTIAL_REVOKED',
      'CREDENTIAL',
      cred.credentialNumber,
      `Credential revoked: ${reason}`,
      cred.institutionId
    );

    this.saveState();
  }
}

export const store = new Store();
