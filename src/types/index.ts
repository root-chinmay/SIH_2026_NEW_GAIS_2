export type Role =
  | 'INSTITUTION_ADMIN'
  | 'INSTITUTION_OPERATOR'
  | 'INSTITUTION_SIGNATORY'
  | 'AICTE_ADMIN'
  | 'AICTE_AUDITOR'
  | 'STUDENT'
  | 'AUTHORIZED_VERIFIER'
  | 'SECURITY_ADMIN';

export type Language = 'en' | 'hi' | 'mr';

export interface UserContext {
  id: string;
  name: string;
  email: string;
  role: Role;
  institutionId?: string; // If institutional role
  institutionName?: string;
  studentId?: string; // If student role
}

export type InstitutionType =
  | 'Central University'
  | 'State University'
  | 'Deemed University'
  | 'Affiliated Autonomous College'
  | 'Private Institute';

export interface Programme {
  id: string;
  code: string;
  name: string;
  degree: 'B.Tech' | 'M.Tech' | 'MCA' | 'MBA' | 'B.Pharm';
  department: string;
  durationYears: number;
  approvedIntake: number;
  supernumeraryLimits: {
    nri: number;
    oci: number;
    fn: number;
    tfw: number; // Tuition Fee Waiver
    ews: number; // Economically Weaker Section
  };
  academicYear: string;
}

export interface Institution {
  id: string;
  code: string;
  name: string;
  type: InstitutionType;
  state: string;
  district: string;
  address: string;
  contactEmail: string;
  authorizedSignatory: string;
  signatoryDesignation: string;
  reportingStatus: 'Submitted' | 'Draft' | 'Under Review' | 'Verified';
  lastSubmissionTimestamp: string;
  programmes: Programme[];
  complianceScore: number;
  dataQualityScore: number;
}

export type AdmissionCategory =
  | 'General'
  | 'OBC-NCL'
  | 'SC'
  | 'ST'
  | 'EWS'
  | 'TFW'
  | 'NRI'
  | 'OCI'
  | 'FN';

export type AdmissionStatus =
  | 'Provisionally Admitted'
  | 'Admission Confirmed'
  | 'Enrollment Reported'
  | 'Withdrawal Requested'
  | 'Withdrawal Approved'
  | 'Transfer Initiated'
  | 'Transfer Completed'
  | 'Admission Cancelled';

export interface AdmissionEvent {
  id: string;
  studentId: string;
  apaarId: string;
  eventType: AdmissionStatus;
  institutionId: string;
  programmeId: string;
  academicYear: string;
  eventDate: string; // Valid time
  recordedAt: string; // System time
  supersededAt?: string;
  version: number;
  remarks?: string;
  actor: string;
}

export interface StudentRecord {
  id: string;
  apaarId: string; // Synthetic e.g. APAAR-DEMO-0001
  matchingToken: string; // HMAC pseudonymous token for matching
  institutionalStudentId: string;
  name: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  institutionId: string;
  programmeId: string;
  academicYear: string;
  admissionDate: string;
  enrolmentStartDate: string;
  withdrawalDate?: string;
  transferDate?: string;
  admissionCategory: AdmissionCategory;
  isSupernumerary: boolean;
  supernumeraryType?: 'NRI' | 'OCI' | 'FN' | 'TFW' | 'EWS';
  admissionStatus: AdmissionStatus;
  validationStatus: 'VALID' | 'WARNING' | 'INVALID';
  externalVerificationStatus:
    | 'Format Checked'
    | 'Internal Match Checked'
    | 'External Verification Pending'
    | 'Externally Verified (MOCK)'
    | 'External Verification Failed (MOCK)'
    | 'Unable to Verify';
  batchId?: string;
  recordVersion: number;
  createdAt: string;
  updatedAt: string;
  validFrom: string;
  validTo?: string;
  corroborationSignals?: {
    examRegistration: boolean;
    feeReceiptReference?: string;
    scholarshipReference?: string;
    hostelAllocation?: boolean;
    lastSignalDate?: string;
  };
}

export interface ValidationError {
  stage: number;
  stageName: string;
  field?: string;
  ruleId: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  message: string;
  explanation: string;
  recommendedAction: string;
}

export interface ValidationSummary {
  recordId: string;
  apaarId: string;
  studentName: string;
  isValid: boolean;
  hasWarnings: boolean;
  errors: ValidationError[];
}

export interface SubmissionBatch {
  id: string;
  batchNumber: string;
  institutionId: string;
  programmeId: string;
  academicYear: string;
  uploadedBy: string;
  uploaderRole: Role;
  uploadedAt: string;
  totalRecords: number;
  validRecords: number;
  warningRecords: number;
  invalidRecords: number;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  signatoryApprovedBy?: string;
  signatoryApprovedAt?: string;
  signatoryComments?: string;
  integrityHash: string; // SHA-256 root hash of the batch
  records: StudentRecord[];
}

export interface DiscrepancyCase {
  id: string;
  apaarId: string;
  studentName: string;
  issueType:
    | 'DUPLICATE_ACTIVE_ENROLLMENT'
    | 'INTAKE_CAPACITY_EXCEEDED'
    | 'SUPERNUMERARY_QUOTA_EXCEEDED'
    | 'MALFORMED_IDENTIFIER'
    | 'MISSING_IDENTIFIER'
    | 'DATE_INCONSISTENCY'
    | 'STUDENT_DISPUTE'
    | 'UNRESOLVED_TRANSFER';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  involvedInstitutions: string[]; // IDs
  programmeId: string;
  academicYear: string;
  status: 'NEW' | 'UNDER_REVIEW' | 'EVIDENCE_REQUESTED' | 'RESOLVED' | 'DISMISSED';
  riskScore: number; // 0-100 explainable formula
  riskFormulaBreakdown: {
    factor: string;
    weight: number;
    points: number;
    explanation: string;
  }[];
  findingsClassification:
    | 'Likely Duplicate Submission'
    | 'Potential Overlapping Active Admissions'
    | 'Potentially Legitimate Transfer'
    | 'Historical Withdrawn Admission'
    | 'Conflicting Timeline'
    | 'Data Quality Error';
  createdAt: string;
  updatedAt: string;
  evidenceNotes: string[];
}

export interface CorrectionRequest {
  id: string;
  recordId: string;
  institutionId: string;
  requestedBy: string;
  requestedAt: string;
  originalData: Partial<StudentRecord>;
  proposedData: Partial<StudentRecord>;
  evidenceReference: string;
  justification: string;
  status: 'PENDING_SIGNATORY' | 'APPROVED' | 'REJECTED';
  reviewedBy?: string;
  reviewedAt?: string;
  reviewRemarks?: string;
}

export interface StudentAttestation {
  id: string;
  apaarId: string;
  studentId: string;
  institutionId: string;
  programmeId: string;
  academicYear: string;
  admissionDate: string;
  status: 'PENDING' | 'CONFIRMED' | 'DISPUTED' | 'CORRECTION_REQUESTED';
  responseTimestamp?: string;
  disputeReason?: string;
  studentRemarks?: string;
}

export interface RegulatoryRule {
  id: string;
  ruleCode: string;
  name: string;
  version: string;
  plainLanguage: string;
  effectiveAcademicYear: string;
  effectiveFrom: string;
  effectiveTo?: string;
  authoritativeSource: string;
  status: 'ACTIVE' | 'SUPERSEDED' | 'DRAFT';
  authorizedBy: string;
  activatedAt: string;
  category: 'IDENTIFIER' | 'INTAKE' | 'SUPERNUMERARY' | 'DATES' | 'SUBMISSION';
  testCasesCount: number;
}

export interface AuditEvent {
  id: string;
  sequenceNumber: number;
  timestamp: string;
  actor: string;
  role: Role;
  action: string;
  entityType: 'STUDENT' | 'BATCH' | 'CORRECTION' | 'RULE' | 'GATE' | 'CREDENTIAL';
  entityId: string;
  institutionId?: string;
  details: string;
  previousHash: string;
  eventHash: string; // SHA-256 of canonical representation
}

export interface SecurityEvent {
  id: string;
  timestamp: string;
  eventType:
    | 'AUTH_SUCCESS'
    | 'AUTH_FAILED'
    | 'CROSS_TENANT_BLOCKED'
    | 'UNAUTHORIZED_ACTION'
    | 'BULK_DATA_EXPORT'
    | 'HMAC_TOKEN_GENERATED'
    | 'AUDIT_INTEGRITY_CHECK'
    | 'AUDIT_TAMPERING_DETECTED';
  actor: string;
  ipAddress: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  details: string;
  blocked: boolean;
}

export interface AcademicCredential {
  id: string;
  credentialNumber: string;
  receiptNumber: string;
  studentApaarId: string;
  studentName: string;
  institutionalStudentId: string;
  institutionId: string;
  institutionName: string;
  programmeName: string;
  academicYear: string;
  admissionStatus: AdmissionStatus;
  issuedAt: string;
  status: 'ACTIVE' | 'SUPERSEDED' | 'REVOKED';
  signatureAlgorithm: 'SHA256withRSA-DEMO' | 'HMAC-SHA256';
  digitalSignature: string;
  signedClaims: {
    iss: string;
    sub: string;
    aud: string;
    expYear: string;
    prog: string;
    status: string;
  };
  qrPayload: string;
}
