import {
  AdmissionStatus,
  Institution,
  Programme,
  StudentRecord,
  ValidationError,
  ValidationSummary,
} from '../types';

export const SYNTHETIC_APAAR_REGEX = /^APAAR-DEMO-\d{4}$/;

export function validateSingleRecord(
  record: Partial<StudentRecord>,
  context: {
    institution: Institution;
    programme: Programme;
    existingStudentsInSameBatch: Partial<StudentRecord>[];
    allExistingStudentsInSystem: StudentRecord[];
  }
): {
  isValid: boolean;
  hasWarnings: boolean;
  status: 'VALID' | 'WARNING' | 'INVALID';
  errors: ValidationError[];
} {
  const errors: ValidationError[] = [];

  // STAGE 1: Field Validation
  if (!record.name || record.name.trim().length === 0) {
    errors.push({
      stage: 1,
      stageName: 'Field Validation',
      field: 'name',
      ruleId: 'RULE-FLD-01',
      severity: 'CRITICAL',
      message: 'Student full name is required.',
      explanation: 'Every institutional record must contain a valid student legal name.',
      recommendedAction: 'Provide legal name as per secondary school certificate.',
    });
  }

  if (!record.institutionalStudentId || record.institutionalStudentId.trim().length === 0) {
    errors.push({
      stage: 1,
      stageName: 'Field Validation',
      field: 'institutionalStudentId',
      ruleId: 'RULE-FLD-02',
      severity: 'CRITICAL',
      message: 'Institutional Roll/Registration number is required.',
      explanation: 'Primary internal institutional identifier is mandatory for local reconciliation.',
      recommendedAction: 'Input university/college student registration number.',
    });
  }

  if (!record.admissionDate) {
    errors.push({
      stage: 1,
      stageName: 'Field Validation',
      field: 'admissionDate',
      ruleId: 'RULE-FLD-03',
      severity: 'CRITICAL',
      message: 'Admission date is missing.',
      explanation: 'Admission date anchors the valid-time dimension for regulatory tracking.',
      recommendedAction: 'Specify official admission/allotment letter date (YYYY-MM-DD).',
    });
  } else {
    const admDate = new Date(record.admissionDate);
    if (isNaN(admDate.getTime())) {
      errors.push({
        stage: 1,
        stageName: 'Field Validation',
        field: 'admissionDate',
        ruleId: 'RULE-FLD-04',
        severity: 'CRITICAL',
        message: 'Invalid admission date format.',
        explanation: 'Date could not be parsed into a standard Gregorian calendar date.',
        recommendedAction: 'Format date as YYYY-MM-DD.',
      });
    }
  }

  if (!record.admissionCategory) {
    errors.push({
      stage: 1,
      stageName: 'Field Validation',
      field: 'admissionCategory',
      ruleId: 'RULE-FLD-05',
      severity: 'CRITICAL',
      message: 'Admission category is mandatory.',
      explanation: 'Category is required for seat quota reconciliation against AICTE handbook.',
      recommendedAction: 'Select a valid category: General, OBC-NCL, SC, ST, EWS, TFW, NRI, OCI, FN.',
    });
  }

  // STAGE 2: Identifier-Format Validation
  if (!record.apaarId || record.apaarId.trim().length === 0) {
    errors.push({
      stage: 2,
      stageName: 'Identifier Validation',
      field: 'apaarId',
      ruleId: 'RULE-APAAR-01',
      severity: 'CRITICAL',
      message: 'Synthetic APAAR ID is missing.',
      explanation: 'Platform requires an APAAR ID as the primary cross-institutional academic identifier.',
      recommendedAction: 'Map student to a valid synthetic APAAR ID (e.g. APAAR-DEMO-0001).',
    });
  } else {
    const cleanId = record.apaarId.trim().toUpperCase();
    if (!SYNTHETIC_APAAR_REGEX.test(cleanId)) {
      errors.push({
        stage: 2,
        stageName: 'Identifier Validation',
        field: 'apaarId',
        ruleId: 'RULE-APAAR-02',
        severity: 'CRITICAL',
        message: `Malformed APAAR ID format: '${record.apaarId}'`,
        explanation: 'Synthetic APAAR ID must conform to regex pattern ^APAAR-DEMO-\\d{4}$.',
        recommendedAction: 'Verify and correct identifier pattern to match APAAR-DEMO-XXXX.',
      });
    }
  }

  // STAGE 3: Internal Duplicate Detection
  const apaar = record.apaarId?.trim().toUpperCase();
  if (apaar) {
    // Check inside current upload batch
    const duplicatesInBatch = context.existingStudentsInSameBatch.filter(
      (s) => s !== record && s.apaarId?.trim().toUpperCase() === apaar
    );
    if (duplicatesInBatch.length > 0) {
      errors.push({
        stage: 3,
        stageName: 'Internal Duplicate Check',
        field: 'apaarId',
        ruleId: 'RULE-DUP-01',
        severity: 'CRITICAL',
        message: `Duplicate APAAR ID within submission batch: '${apaar}'`,
        explanation: `This identifier appears ${duplicatesInBatch.length + 1} times within the current upload payload.`,
        recommendedAction: 'Remove redundant row from batch before submitting.',
      });
    }

    // Check inside same institution existing database
    const sameInstDuplicates = context.allExistingStudentsInSystem.filter(
      (s) =>
        s.id !== record.id &&
        s.institutionId === context.institution.id &&
        s.programmeId === context.programme.id &&
        s.academicYear === context.programme.academicYear &&
        s.apaarId.trim().toUpperCase() === apaar &&
        s.admissionStatus !== 'Admission Cancelled' &&
        s.admissionStatus !== 'Withdrawal Approved'
    );
    if (sameInstDuplicates.length > 0) {
      errors.push({
        stage: 3,
        stageName: 'Internal Duplicate Check',
        field: 'apaarId',
        ruleId: 'RULE-DUP-02',
        severity: 'CRITICAL',
        message: `Active admission already exists for APAAR '${apaar}' in this programme.`,
        explanation: 'An institution cannot register multiple concurrent active admissions for the same student in the same programme.',
        recommendedAction: 'Review existing enrolment record or initiate withdrawal first.',
      });
    }
  }

  // STAGE 4: Cross-Institution Reconciliation
  if (apaar) {
    const crossInstRecords = context.allExistingStudentsInSystem.filter(
      (s) =>
        s.id !== record.id &&
        s.institutionId !== context.institution.id &&
        s.apaarId.trim().toUpperCase() === apaar
    );

    for (const other of crossInstRecords) {
      const isOtherActive =
        other.admissionStatus === 'Provisionally Admitted' ||
        other.admissionStatus === 'Admission Confirmed' ||
        other.admissionStatus === 'Enrollment Reported';

      const isCurrentActive =
        !record.admissionStatus ||
        record.admissionStatus === 'Provisionally Admitted' ||
        record.admissionStatus === 'Admission Confirmed' ||
        record.admissionStatus === 'Enrollment Reported';

      if (isOtherActive && isCurrentActive) {
        errors.push({
          stage: 4,
          stageName: 'Cross-Institution Reconciliation',
          field: 'apaarId',
          ruleId: 'RULE-CROSS-01',
          severity: 'CRITICAL',
          message: `Cross-Institution Conflict: Concurrent active admission detected at Institution Code ${other.institutionId}.`,
          explanation: `Student holds active admission status at another institution (${other.institutionId}). AICTE guidelines prohibit simultaneous full-time regular enrollment.`,
          recommendedAction: 'Require formal transfer certificate or withdrawal clearance from previous institution.',
        });
      } else if (
        other.admissionStatus === 'Withdrawal Approved' ||
        other.admissionStatus === 'Transfer Completed'
      ) {
        errors.push({
          stage: 4,
          stageName: 'Cross-Institution Reconciliation',
          field: 'apaarId',
          ruleId: 'RULE-CROSS-02',
          severity: 'INFO',
          message: `Prior enrollment found at ${other.institutionId} (Status: ${other.admissionStatus}). Verified legitimate transfer candidate.`,
          explanation: 'Previous institution has recorded official withdrawal/transfer approval.',
          recommendedAction: 'Ensure transfer certificate reference is recorded in student file.',
        });
      }
    }
  }

  // STAGE 5: Admission and Category Validation
  if (record.isSupernumerary) {
    if (!record.supernumeraryType) {
      errors.push({
        stage: 5,
        stageName: 'Category & Quota Validation',
        field: 'supernumeraryType',
        ruleId: 'RULE-CAT-01',
        severity: 'CRITICAL',
        message: 'Supernumerary admission selected but supernumerary type is missing.',
        explanation: 'Must specify category: NRI, OCI, FN, TFW, or EWS.',
        recommendedAction: 'Select applicable supernumerary quota classification.',
      });
    }
  }

  // STAGE 6: Intake Reconciliation
  // Calculate current intake utilization
  const activeSameProgStudents = context.allExistingStudentsInSystem.filter(
    (s) =>
      s.id !== record.id &&
      s.institutionId === context.institution.id &&
      s.programmeId === context.programme.id &&
      s.academicYear === context.programme.academicYear &&
      (s.admissionStatus === 'Admission Confirmed' ||
        s.admissionStatus === 'Enrollment Reported' ||
        s.admissionStatus === 'Provisionally Admitted')
  );

  const regularActive = activeSameProgStudents.filter((s) => !s.isSupernumerary);
  const isIncomingRegular = !record.isSupernumerary;

  if (isIncomingRegular && regularActive.length >= context.programme.approvedIntake) {
    errors.push({
      stage: 6,
      stageName: 'Intake Reconciliation',
      field: 'programmeId',
      ruleId: 'RULE-INTAKE-01',
      severity: 'CRITICAL',
      message: `Approved regular intake exceeded (${regularActive.length + 1} / ${context.programme.approvedIntake}).`,
      explanation: `AICTE Approved Process Handbook prohibits admissions beyond sanctioned regular capacity of ${context.programme.approvedIntake}.`,
      recommendedAction: 'Admit under supernumerary quota if eligible or reject over-capacity admission.',
    });
  }

  if (record.isSupernumerary && record.supernumeraryType) {
    const sType = record.supernumeraryType.toLowerCase() as keyof typeof context.programme.supernumeraryLimits;
    const limit = context.programme.supernumeraryLimits[sType] || 0;
    const currentSuperCount = activeSameProgStudents.filter(
      (s) => s.isSupernumerary && s.supernumeraryType?.toLowerCase() === sType
    ).length;

    if (currentSuperCount >= limit) {
      errors.push({
        stage: 6,
        stageName: 'Intake Reconciliation',
        field: 'supernumeraryType',
        ruleId: 'RULE-INTAKE-02',
        severity: 'CRITICAL',
        message: `Supernumerary limit exceeded for ${record.supernumeraryType} (${currentSuperCount + 1} / ${limit}).`,
        explanation: `Approved AICTE supernumerary quota for ${record.supernumeraryType} in ${context.programme.name} is ${limit} seats.`,
        recommendedAction: 'Cannot exceed statutory supernumerary ceiling.',
      });
    }
  }

  // STAGE 7: External Verification Status (Mock Adapter)
  // Non-blocking, flags external readiness
  const hasCritical = errors.some((e) => e.severity === 'CRITICAL');
  const hasWarnings = errors.some((e) => e.severity === 'WARNING');

  return {
    isValid: !hasCritical,
    hasWarnings,
    status: hasCritical ? 'INVALID' : hasWarnings ? 'WARNING' : 'VALID',
    errors,
  };
}

export function validateBatch(
  records: Partial<StudentRecord>[],
  institution: Institution,
  programme: Programme,
  allExistingStudentsInSystem: StudentRecord[]
): {
  summaries: ValidationSummary[];
  totalRecords: number;
  validCount: number;
  warningCount: number;
  invalidCount: number;
} {
  const summaries: ValidationSummary[] = [];
  let validCount = 0;
  let warningCount = 0;
  let invalidCount = 0;

  for (let i = 0; i < records.length; i++) {
    const rec = records[i];
    const res = validateSingleRecord(rec, {
      institution,
      programme,
      existingStudentsInSameBatch: records,
      allExistingStudentsInSystem,
    });

    if (res.status === 'VALID') validCount++;
    else if (res.status === 'WARNING') warningCount++;
    else invalidCount++;

    summaries.push({
      recordId: rec.id || `REC-${i + 1}`,
      apaarId: rec.apaarId || 'MISSING',
      studentName: rec.name || 'Unnamed Record',
      isValid: res.isValid,
      hasWarnings: res.hasWarnings,
      errors: res.errors,
    });
  }

  return {
    summaries,
    totalRecords: records.length,
    validCount,
    warningCount,
    invalidCount,
  };
}

// Transfer vs Duplicate Temporal Classifier
export function classifyTransferVsDuplicate(
  recordsForSameApaar: StudentRecord[]
): {
  classification:
    | 'Likely Duplicate Submission'
    | 'Potential Overlapping Active Admissions'
    | 'Potentially Legitimate Transfer'
    | 'Historical Withdrawn Admission'
    | 'Conflicting Timeline'
    | 'Single Valid Record';
  explanation: string;
  evidencePoints: string[];
  recommendation: string;
} {
  if (recordsForSameApaar.length <= 1) {
    return {
      classification: 'Single Valid Record',
      explanation: 'No cross-institutional or duplicate records found for this synthetic identifier.',
      evidencePoints: ['Single enrolment instance detected in national registry.'],
      recommendation: 'Standard validation applies.',
    };
  }

  // Sort chronologically by admission date
  const sorted = [...recordsForSameApaar].sort(
    (a, b) => new Date(a.admissionDate).getTime() - new Date(b.admissionDate).getTime()
  );

  const distinctInstitutions = new Set(sorted.map((r) => r.institutionId));
  const activeStates: AdmissionStatus[] = [
    'Provisionally Admitted',
    'Admission Confirmed',
    'Enrollment Reported',
  ];

  const activeAdmissions = sorted.filter((r) => activeStates.includes(r.admissionStatus));

  // Case 1: Same institution duplicate
  if (distinctInstitutions.size === 1) {
    return {
      classification: 'Likely Duplicate Submission',
      explanation: `Multiple admissions (${sorted.length}) found within the same institution (${sorted[0].institutionId}).`,
      evidencePoints: [
        `All ${sorted.length} records originate from institution ${sorted[0].institutionId}.`,
        'Possible redundant upload or batch re-submission without prior record purge.',
      ],
      recommendation: 'Request data operator to merge redundant submissions.',
    };
  }

  // Case 2: Overlapping active admissions across 2+ institutions
  if (activeAdmissions.length >= 2) {
    const instNames = activeAdmissions.map((r) => r.institutionId).join(' and ');
    return {
      classification: 'Potential Overlapping Active Admissions',
      explanation: `Identical APAAR identifier has concurrent active enrolment status across ${instNames}.`,
      evidencePoints: [
        `Active status at ${activeAdmissions[0].institutionId} since ${activeAdmissions[0].admissionDate}.`,
        `Active status at ${activeAdmissions[1].institutionId} since ${activeAdmissions[1].admissionDate}.`,
        'No withdrawal timestamp recorded by the prior institution.',
      ],
      recommendation: 'AICTE investigation case opened. Request dual-institution clearance and student attestation.',
    };
  }

  // Case 3: Legitimate sequential transfer
  const first = sorted[0];
  const second = sorted[1];
  const firstWithdrawn =
    first.admissionStatus === 'Withdrawal Approved' ||
    first.admissionStatus === 'Transfer Completed' ||
    Boolean(first.withdrawalDate);

  if (firstWithdrawn) {
    const withdrawalDate = first.withdrawalDate || first.updatedAt;
    const secondAdmissionDate = second.admissionDate;

    if (new Date(withdrawalDate) <= new Date(secondAdmissionDate)) {
      return {
        classification: 'Potentially Legitimate Transfer',
        explanation: `Student lawfully withdrew from ${first.institutionId} on ${withdrawalDate} before admission to ${second.institutionId} on ${secondAdmissionDate}.`,
        evidencePoints: [
          `Prior admission at ${first.institutionId} was closed with status '${first.admissionStatus}'.`,
          `Withdrawal date (${withdrawalDate}) precedes or matches subsequent admission date (${secondAdmissionDate}).`,
          'Temporal continuity is preserved without active overlap.',
        ],
        recommendation: 'Verify transfer certificate reference and approve transition.',
      };
    } else {
      return {
        classification: 'Conflicting Timeline',
        explanation: `Backdated withdrawal reported after the subsequent admission occurred.`,
        evidencePoints: [
          `Withdrawal recorded on ${withdrawalDate}, but second admission started earlier on ${secondAdmissionDate}.`,
          'Temporal ordering anomaly requires documentary review.',
        ],
        recommendation: 'Request institutional signatory to provide certified date stamps.',
      };
    }
  }

  return {
    classification: 'Historical Withdrawn Admission',
    explanation: 'Prior historical admission found with superseded or cancelled status.',
    evidencePoints: [`Prior status: ${first.admissionStatus}`],
    recommendation: 'No regulatory blockage.',
  };
}
