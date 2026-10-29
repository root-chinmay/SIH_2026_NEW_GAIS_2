import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateSingleRecord,
  classifyTransferVsDuplicate,
  SYNTHETIC_APAAR_REGEX,
} from './validationEngine';
import {
  computeSha256,
  computeEventHash,
  verifyAuditChain,
  simulateTampering,
  generateMatchingToken,
} from './cryptoEngine';
import { Institution, Programme, StudentRecord, AuditEvent } from '../types';
import { store } from './store';

const mockProgramme: Programme = {
  id: 'PROG-CSE',
  code: 'CSE-101',
  name: 'B.Tech Computer Science & Engineering',
  degree: 'B.Tech',
  department: 'Computer Science',
  durationYears: 4,
  approvedIntake: 2, // Low for easy intake violation test
  supernumeraryLimits: {
    nri: 1,
    oci: 1,
    fn: 1,
    tfw: 1,
    ews: 1,
  },
  academicYear: '2026-2027',
};

const mockInstitutionA: Institution = {
  id: 'INST-DEL-01',
  code: 'DTU-01',
  name: 'Delhi Institute of Technology',
  type: 'State University',
  state: 'Delhi',
  district: 'North Delhi',
  address: 'Bawana Road, Delhi',
  contactEmail: 'admin@dit.ac.in',
  authorizedSignatory: 'Dr. Ramesh Sharma',
  signatoryDesignation: 'Registrar',
  reportingStatus: 'Submitted',
  lastSubmissionTimestamp: '2026-10-28T10:00:00Z',
  programmes: [mockProgramme],
  complianceScore: 92,
  dataQualityScore: 95,
};

test('Identifier Regex correctly validates synthetic APAAR pattern', () => {
  assert.equal(SYNTHETIC_APAAR_REGEX.test('APAAR-DEMO-0001'), true);
  assert.equal(SYNTHETIC_APAAR_REGEX.test('APAAR-DEMO-9999'), true);
  assert.equal(SYNTHETIC_APAAR_REGEX.test('APAAR-DEMO-123'), false); // Only 3 digits
  assert.equal(SYNTHETIC_APAAR_REGEX.test('AADHAAR-1234-5678'), false); // Not APAAR demo
});

test('Validation engine approves valid student record within capacity', () => {
  const student: Partial<StudentRecord> = {
    id: 'STU-01',
    apaarId: 'APAAR-DEMO-0001',
    name: 'Aarav Sharma',
    institutionalStudentId: 'DTU/2026/CSE/001',
    admissionDate: '2026-08-01',
    enrolmentStartDate: '2026-08-16',
    admissionCategory: 'General',
    isSupernumerary: false,
    admissionStatus: 'Admission Confirmed',
  };

  const result = validateSingleRecord(student, {
    institution: mockInstitutionA,
    programme: mockProgramme,
    existingStudentsInSameBatch: [student],
    allExistingStudentsInSystem: [],
  });

  assert.equal(result.isValid, true);
  assert.equal(result.status, 'VALID');
  assert.equal(result.errors.length, 0);
});

test('Validation engine rejects malformed APAAR ID', () => {
  const student: Partial<StudentRecord> = {
    id: 'STU-02',
    apaarId: 'INVALID_ID_99',
    name: 'Diya Patel',
    institutionalStudentId: 'DTU/2026/CSE/002',
    admissionDate: '2026-08-01',
    admissionCategory: 'General',
    isSupernumerary: false,
  };

  const result = validateSingleRecord(student, {
    institution: mockInstitutionA,
    programme: mockProgramme,
    existingStudentsInSameBatch: [student],
    allExistingStudentsInSystem: [],
  });

  assert.equal(result.isValid, false);
  const err = result.errors.find((e) => e.ruleId === 'RULE-APAAR-02');
  assert.ok(err, 'Expected RULE-APAAR-02 for malformed identifier');
});

test('Validation engine catches intake limit breach', () => {
  // Existing students in system already fill 2 seats
  const existingRecords: StudentRecord[] = [
    {
      id: 'EX-1',
      apaarId: 'APAAR-DEMO-0002',
      matchingToken: 'HMAC-0002',
      institutionalStudentId: 'DTU/2026/CSE/002',
      name: 'Existing Student 1',
      dob: '2005-01-01',
      gender: 'Male',
      institutionId: 'INST-DEL-01',
      programmeId: 'PROG-CSE',
      academicYear: '2026-2027',
      admissionDate: '2026-08-01',
      enrolmentStartDate: '2026-08-16',
      admissionCategory: 'General',
      isSupernumerary: false,
      admissionStatus: 'Admission Confirmed',
      validationStatus: 'VALID',
      externalVerificationStatus: 'Format Checked',
      recordVersion: 1,
      createdAt: '2026-08-01',
      updatedAt: '2026-08-01',
      validFrom: '2026-08-01',
    },
    {
      id: 'EX-2',
      apaarId: 'APAAR-DEMO-0003',
      matchingToken: 'HMAC-0003',
      institutionalStudentId: 'DTU/2026/CSE/003',
      name: 'Existing Student 2',
      dob: '2005-02-02',
      gender: 'Female',
      institutionId: 'INST-DEL-01',
      programmeId: 'PROG-CSE',
      academicYear: '2026-2027',
      admissionDate: '2026-08-01',
      enrolmentStartDate: '2026-08-16',
      admissionCategory: 'OBC-NCL',
      isSupernumerary: false,
      admissionStatus: 'Admission Confirmed',
      validationStatus: 'VALID',
      externalVerificationStatus: 'Format Checked',
      recordVersion: 1,
      createdAt: '2026-08-01',
      updatedAt: '2026-08-01',
      validFrom: '2026-08-01',
    },
  ];

  const incomingStudent: Partial<StudentRecord> = {
    id: 'STU-03',
    apaarId: 'APAAR-DEMO-0004',
    name: 'Third Student',
    institutionalStudentId: 'DTU/2026/CSE/004',
    admissionDate: '2026-08-02',
    admissionCategory: 'General',
    isSupernumerary: false,
  };

  const result = validateSingleRecord(incomingStudent, {
    institution: mockInstitutionA,
    programme: mockProgramme,
    existingStudentsInSameBatch: [incomingStudent],
    allExistingStudentsInSystem: existingRecords,
  });

  assert.equal(result.isValid, false);
  const intakeErr = result.errors.find((e) => e.ruleId === 'RULE-INTAKE-01');
  assert.ok(intakeErr, 'Should detect intake capacity exceeded');
});

test('Transfer vs Duplicate classifier differentiates legitimate transfer from active overlap', () => {
  const overlappingRecords: StudentRecord[] = [
    {
      id: 'REC-A',
      apaarId: 'APAAR-DEMO-0005',
      matchingToken: 'TOKEN-1',
      institutionalStudentId: 'ROLL-A',
      name: 'Rohan Gupta',
      dob: '2004-05-10',
      gender: 'Male',
      institutionId: 'INST-A',
      programmeId: 'PROG-CSE',
      academicYear: '2026-2027',
      admissionDate: '2026-07-20',
      enrolmentStartDate: '2026-08-01',
      admissionCategory: 'General',
      isSupernumerary: false,
      admissionStatus: 'Admission Confirmed',
      validationStatus: 'VALID',
      externalVerificationStatus: 'Format Checked',
      recordVersion: 1,
      createdAt: '2026-07-20',
      updatedAt: '2026-07-20',
      validFrom: '2026-07-20',
    },
    {
      id: 'REC-B',
      apaarId: 'APAAR-DEMO-0005',
      matchingToken: 'TOKEN-1',
      institutionalStudentId: 'ROLL-B',
      name: 'Rohan Gupta',
      dob: '2004-05-10',
      gender: 'Male',
      institutionId: 'INST-B',
      programmeId: 'PROG-CSE',
      academicYear: '2026-2027',
      admissionDate: '2026-08-10',
      enrolmentStartDate: '2026-08-15',
      admissionCategory: 'General',
      isSupernumerary: false,
      admissionStatus: 'Admission Confirmed',
      validationStatus: 'VALID',
      externalVerificationStatus: 'Format Checked',
      recordVersion: 1,
      createdAt: '2026-08-10',
      updatedAt: '2026-08-10',
      validFrom: '2026-08-10',
    },
  ];

  const overlapClass = classifyTransferVsDuplicate(overlappingRecords);
  assert.equal(overlapClass.classification, 'Potential Overlapping Active Admissions');

  // Now simulate legitimate transfer: Institution A recorded withdrawal on 2026-08-05
  overlappingRecords[0].admissionStatus = 'Withdrawal Approved';
  overlappingRecords[0].withdrawalDate = '2026-08-05';

  const transferClass = classifyTransferVsDuplicate(overlappingRecords);
  assert.equal(transferClass.classification, 'Potentially Legitimate Transfer');
});

test('Cryptographic Audit Chain verifies valid chain and catches tampered logs', () => {
  const genesisHash = 'GENESIS_00000000000000000000000000000000';
  const event1Data = {
    sequenceNumber: 1,
    timestamp: '2026-08-01T10:00:00Z',
    actor: 'admin@dit.ac.in',
    role: 'INSTITUTION_ADMIN' as const,
    action: 'INIT_BATCH_UPLOAD',
    entityType: 'BATCH' as const,
    entityId: 'BATCH-2026-001',
    institutionId: 'INST-DEL-01',
    details: 'Initial enrolment batch upload for CSE',
    previousHash: genesisHash,
  };
  const event1Hash = computeEventHash(event1Data);
  const event1: AuditEvent = { ...event1Data, id: 'AUD-001', eventHash: event1Hash };

  const event2Data = {
    sequenceNumber: 2,
    timestamp: '2026-08-01T10:05:00Z',
    actor: 'signatory@dit.ac.in',
    role: 'INSTITUTION_SIGNATORY' as const,
    action: 'SIGNATORY_BATCH_APPROVED',
    entityType: 'BATCH' as const,
    entityId: 'BATCH-2026-001',
    institutionId: 'INST-DEL-01',
    details: 'Batch approved after local validation check',
    previousHash: event1Hash,
  };
  const event2Hash = computeEventHash(event2Data);
  const event2: AuditEvent = { ...event2Data, id: 'AUD-002', eventHash: event2Hash };

  const chain: AuditEvent[] = [event1, event2];

  // 1. Valid chain test
  const verification = verifyAuditChain(chain);
  assert.equal(verification.isValid, true);
  assert.equal(verification.totalEvents, 2);

  // 2. Tampering test
  const tamperingTest = simulateTampering(chain, 0);
  assert.equal(tamperingTest.verificationResult.isValid, false);
  assert.ok(tamperingTest.verificationResult.diagnostic.includes('tampered'));
});

test('HMAC matching token is pseudonymous and deterministic', () => {
  const token1 = generateMatchingToken('APAAR-DEMO-0001');
  const token2 = generateMatchingToken('APAAR-DEMO-0001');
  const tokenOther = generateMatchingToken('APAAR-DEMO-0002');

  assert.equal(token1, token2);
  assert.notEqual(token1, tokenOther);
  assert.ok(token1.startsWith('HMAC-'));
});

test('Tenant Isolation Guard enforces strict institutional boundaries', () => {
  const instUser = {
    id: 'USR-INST-01',
    name: 'Operator Delhi',
    email: 'operator@dtu.ac.in',
    role: 'INSTITUTION_OPERATOR' as const,
    institutionId: 'INST-DEL-01',
  };

  const aicteAdmin = {
    id: 'USR-AICTE-01',
    name: 'AICTE Director',
    email: 'director@aicte.gov.in',
    role: 'AICTE_ADMIN' as const,
  };

  // Institutional operator can only access their own institution
  assert.equal(store.canUserAccessInstitution(instUser, 'INST-DEL-01'), true);
  assert.equal(store.canUserAccessInstitution(instUser, 'INST-MAH-02'), false);
  assert.equal(store.canUserAccessInstitution(instUser, 'INST-BLR-03'), false);

  // AICTE Admin has national oversight across all institutions
  assert.equal(store.canUserAccessInstitution(aicteAdmin, 'INST-DEL-01'), true);
  assert.equal(store.canUserAccessInstitution(aicteAdmin, 'INST-MAH-02'), true);
  assert.equal(store.canUserAccessInstitution(aicteAdmin, 'INST-BLR-03'), true);
});

test('Admission Gate rejects over-capacity and supports emergency dual-override', () => {
  const gateReq = {
    idempotencyKey: 'IDEM-TEST-OVER-01',
    institutionId: 'INST-DEL-01',
    programmeId: 'PROG-DEL-CSE',
    academicYear: '2026-2027',
    apaarId: 'APAAR-DEMO-9911',
    studentName: 'Test Overcapacity Candidate',
    institutionalStudentId: 'DTU/2026/CSE/9911',
    admissionCategory: 'General',
    isSupernumerary: false,
    proposedAdmissionDate: '2026-08-01',
    seatCategory: 'Regular',
  };

  // In seed data, PROG-DEL-CSE has 20 approved seats and 21 confirmed students (over capacity)
  const decision = store.evaluateAdmissionGate(gateReq);
  assert.equal(decision.eligible, false);
  assert.equal(decision.status, 'Blocked — Configured Rule Failed');
  assert.ok(decision.reasons?.some((r: string) => r.includes('Intake capacity full')));

  // Execute dual-approval emergency override
  const overridden = store.executeGateOverride(
    gateReq.idempotencyKey,
    'State Counseling Order SC-2026-99',
    'Dr. Anita Roy (AICTE Secretary)'
  );

  assert.ok(overridden);
  assert.equal(overridden.eligible, true);
  assert.equal(overridden.status, 'Eligible to Proceed');
  assert.ok(overridden.reservationId?.startsWith('OVR-RES-'));
  assert.ok(overridden.reasons[0].includes('EMERGENCY STATUTORY DUAL-OVERRIDE'));
});

test('Digital Twin Simulator computes impact without mutating committed data', () => {
  const preState = store.getState();
  const dtu = preState.institutions.find((i: any) => i.id === 'INST-DEL-01');
  const dtuCse = dtu?.programmes.find((p: any) => p.id === 'PROG-DEL-CSE');
  const baselineIntake = dtuCse?.approvedIntake;

  // Run simulation adding admissions
  const simResult = store.runWhatIfSimulation({
    institutionId: 'INST-DEL-01',
    programmeId: 'PROG-DEL-CSE',
    additionalAdmissions: 5,
    projectedWithdrawals: 1,
    supernumeraryAdjustments: 0,
  });

  assert.ok(simResult.projectedActive > simResult.currentReported);
  assert.ok(simResult.intakeDiscrepancy > 0);
  assert.ok(simResult.projectedAlerts.length > 0);

  // Assert that committed store state remains strictly unchanged
  const postState = store.getState();
  const postDtuCse = postState.institutions.find((i: any) => i.id === 'INST-DEL-01')?.programmes.find((p: any) => p.id === 'PROG-DEL-CSE');
  assert.equal(postDtuCse?.approvedIntake, baselineIntake);
});

