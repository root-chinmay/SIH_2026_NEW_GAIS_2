import {
  AcademicCredential,
  AuditEvent,
  DiscrepancyCase,
  Institution,
  Programme,
  RegulatoryRule,
  SecurityEvent,
  StudentAttestation,
  StudentRecord,
  SubmissionBatch,
} from '../types';
import {
  computeEventHash,
  generateMatchingToken,
  signAcademicCredential,
} from '../services/cryptoEngine';

export const SEED_PROGRAMMES: Record<string, Programme[]> = {
  'INST-DEL-01': [
    {
      id: 'PROG-DEL-CSE',
      code: 'CSE-101',
      name: 'B.Tech Computer Science & Engineering',
      degree: 'B.Tech',
      department: 'Computer Science',
      durationYears: 4,
      approvedIntake: 20, // Sanctioned intake
      supernumeraryLimits: { nri: 3, oci: 2, fn: 2, tfw: 2, ews: 2 },
      academicYear: '2026-2027',
    },
    {
      id: 'PROG-DEL-ECE',
      code: 'ECE-102',
      name: 'B.Tech Electronics & Communication',
      degree: 'B.Tech',
      department: 'Electronics',
      durationYears: 4,
      approvedIntake: 18,
      supernumeraryLimits: { nri: 2, oci: 1, fn: 1, tfw: 1, ews: 2 },
      academicYear: '2026-2027',
    },
  ],
  'INST-MAH-02': [
    {
      id: 'PROG-MAH-AI',
      code: 'AI-201',
      name: 'B.Tech Artificial Intelligence & Data Science',
      degree: 'B.Tech',
      department: 'Computer Science',
      durationYears: 4,
      approvedIntake: 25,
      supernumeraryLimits: { nri: 4, oci: 2, fn: 2, tfw: 2, ews: 3 },
      academicYear: '2026-2027',
    },
    {
      id: 'PROG-MAH-MECH',
      code: 'MECH-202',
      name: 'B.Tech Mechanical Engineering',
      degree: 'B.Tech',
      department: 'Mechanical',
      durationYears: 4,
      approvedIntake: 30,
      supernumeraryLimits: { nri: 3, oci: 2, fn: 2, tfw: 3, ews: 3 },
      academicYear: '2026-2027',
    },
  ],
  'INST-KAR-03': [
    {
      id: 'PROG-KAR-ISE',
      code: 'ISE-301',
      name: 'B.Tech Information Science & Engineering',
      degree: 'B.Tech',
      department: 'Information Science',
      durationYears: 4,
      approvedIntake: 22,
      supernumeraryLimits: { nri: 3, oci: 2, fn: 2, tfw: 2, ews: 2 },
      academicYear: '2026-2027',
    },
  ],
  'INST-GUJ-04': [
    {
      id: 'PROG-GUJ-CHEM',
      code: 'CHEM-401',
      name: 'B.Tech Chemical Engineering',
      degree: 'B.Tech',
      department: 'Chemical Engineering',
      durationYears: 4,
      approvedIntake: 20,
      supernumeraryLimits: { nri: 2, oci: 1, fn: 1, tfw: 2, ews: 2 },
      academicYear: '2026-2027',
    },
  ],
};

export const SEED_INSTITUTIONS: Institution[] = [
  {
    id: 'INST-DEL-01',
    code: 'DTU-01',
    name: 'Delhi Technological University',
    type: 'State University',
    state: 'Delhi',
    district: 'North Delhi',
    address: 'Shahbad Daulatpur, Bawana Road, Delhi 110042',
    contactEmail: 'registrar@dtu.ac.in',
    authorizedSignatory: 'Prof. Ramesh K. Sharma',
    signatoryDesignation: 'Dean of Academic Affairs',
    reportingStatus: 'Submitted',
    lastSubmissionTimestamp: '2026-10-25T11:45:00Z',
    programmes: SEED_PROGRAMMES['INST-DEL-01'],
    complianceScore: 89,
    dataQualityScore: 91,
  },
  {
    id: 'INST-MAH-02',
    code: 'MIT-02',
    name: 'Maharashtra Institute of Technology',
    type: 'Affiliated Autonomous College',
    state: 'Maharashtra',
    district: 'Pune',
    address: 'S.No. 124, Paud Road, Kothrud, Pune 411038',
    contactEmail: 'director.acad@mitpune.edu.in',
    authorizedSignatory: 'Dr. Sunita Deshmukh',
    signatoryDesignation: 'Principal & Signatory',
    reportingStatus: 'Verified',
    lastSubmissionTimestamp: '2026-10-24T16:20:00Z',
    programmes: SEED_PROGRAMMES['INST-MAH-02'],
    complianceScore: 96,
    dataQualityScore: 98,
  },
  {
    id: 'INST-KAR-03',
    code: 'BCE-03',
    name: 'Bangalore College of Engineering',
    type: 'Private Institute',
    state: 'Karnataka',
    district: 'Bengaluru Urban',
    address: 'Outer Ring Road, Marathahalli, Bengaluru 560037',
    contactEmail: 'admissions@bce.ac.in',
    authorizedSignatory: 'Dr. Anand Murthy',
    signatoryDesignation: 'Registrar',
    reportingStatus: 'Under Review',
    lastSubmissionTimestamp: '2026-10-26T09:15:00Z',
    programmes: SEED_PROGRAMMES['INST-KAR-03'],
    complianceScore: 78,
    dataQualityScore: 82,
  },
  {
    id: 'INST-GUJ-04',
    code: 'GTI-04',
    name: 'Gujarat Technological Institute',
    type: 'State University',
    state: 'Gujarat',
    district: 'Ahmedabad',
    address: 'Near Visat Three Roads, Sabarmati-Koba Highway, Ahmedabad 382424',
    contactEmail: 'academics@gti.ac.in',
    authorizedSignatory: 'Prof. Bhavesh Patel',
    signatoryDesignation: 'Academic Dean',
    reportingStatus: 'Submitted',
    lastSubmissionTimestamp: '2026-10-22T14:30:00Z',
    programmes: SEED_PROGRAMMES['INST-GUJ-04'],
    complianceScore: 94,
    dataQualityScore: 93,
  },
];

// Names for generating authentic synthetic student profiles
const FIRST_NAMES = [
  'Aarav', 'Diya', 'Vivaan', 'Ananya', 'Rohan', 'Aditi', 'Kabir', 'Isha', 'Reyansh', 'Saanvi',
  'Arjun', 'Meera', 'Karan', 'Pooja', 'Dev', 'Neha', 'Aditya', 'Riya', 'Kunal', 'Tanvi',
  'Aryan', 'Sneha', 'Nikhil', 'Priyanka', 'Varun', 'Shreya', 'Siddharth', 'Nisha', 'Vikram', 'Kavya'
];

const LAST_NAMES = [
  'Sharma', 'Verma', 'Patel', 'Deshmukh', 'Gupta', 'Iyer', 'Reddy', 'Singh', 'Nair', 'Chopra',
  'Joshi', 'Mehta', 'Kulkarni', 'Bose', 'Rao', 'Bhat', 'Banerjee', 'Mishra', 'Pandey', 'Saxena'
];

export function generateSeedStudents(): StudentRecord[] {
  const students: StudentRecord[] = [];
  let idCounter = 1;

  // 1. Generate core valid students for DTU CSE (21 students to trigger intentional intake warning of 20)
  for (let i = 1; i <= 21; i++) {
    const fn = FIRST_NAMES[(i - 1) % FIRST_NAMES.length];
    const ln = LAST_NAMES[(i - 1) % LAST_NAMES.length];
    const apaar = `APAAR-DEMO-${String(i).padStart(4, '0')}`;
    const isSuper = i === 19 || i === 20; // 2 supernumerary
    const isOverLimit = i === 21; // 21st regular will trigger intake breach

    students.push({
      id: `STU-DEL-${String(i).padStart(3, '0')}`,
      apaarId: apaar,
      matchingToken: generateMatchingToken(apaar),
      institutionalStudentId: `DTU/2026/CSE/${String(i).padStart(3, '0')}`,
      name: `${fn} ${ln}`,
      dob: `2005-0${(i % 9) + 1}-15`,
      gender: i % 2 === 0 ? 'Female' : 'Male',
      institutionId: 'INST-DEL-01',
      programmeId: 'PROG-DEL-CSE',
      academicYear: '2026-2027',
      admissionDate: `2026-08-0${(i % 8) + 1}`,
      enrolmentStartDate: '2026-08-16',
      admissionCategory: isSuper ? 'NRI' : i % 3 === 0 ? 'OBC-NCL' : i % 5 === 0 ? 'SC' : 'General',
      isSupernumerary: isSuper,
      supernumeraryType: isSuper ? 'NRI' : undefined,
      admissionStatus: 'Admission Confirmed',
      validationStatus: isOverLimit ? 'INVALID' : 'VALID',
      externalVerificationStatus: 'Format Checked',
      recordVersion: 1,
      createdAt: '2026-08-01T09:00:00Z',
      updatedAt: '2026-08-01T09:00:00Z',
      validFrom: '2026-08-01',
      corroborationSignals: {
        examRegistration: true,
        feeReceiptReference: `REC-DTU-2026-${1000 + i}`,
        hostelAllocation: i % 2 === 0,
        scholarshipReference: i % 5 === 0 ? `SCH-NSP-2026-${500 + i}` : undefined,
        lastSignalDate: '2026-09-10',
      },
    });
  }

  // 2. DTU ECE students (12 students - all valid)
  for (let i = 1; i <= 12; i++) {
    const idx = 21 + i;
    const fn = FIRST_NAMES[idx % FIRST_NAMES.length];
    const ln = LAST_NAMES[idx % LAST_NAMES.length];
    const apaar = `APAAR-DEMO-${String(idx).padStart(4, '0')}`;

    students.push({
      id: `STU-DEL-ECE-${String(i).padStart(3, '0')}`,
      apaarId: apaar,
      matchingToken: generateMatchingToken(apaar),
      institutionalStudentId: `DTU/2026/ECE/${String(i).padStart(3, '0')}`,
      name: `${fn} ${ln}`,
      dob: `2005-0${(i % 9) + 1}-20`,
      gender: i % 2 === 0 ? 'Female' : 'Male',
      institutionId: 'INST-DEL-01',
      programmeId: 'PROG-DEL-ECE',
      academicYear: '2026-2027',
      admissionDate: `2026-08-0${(i % 8) + 1}`,
      enrolmentStartDate: '2026-08-16',
      admissionCategory: i % 4 === 0 ? 'EWS' : 'General',
      isSupernumerary: false,
      admissionStatus: 'Enrollment Reported',
      validationStatus: 'VALID',
      externalVerificationStatus: 'Format Checked',
      recordVersion: 1,
      createdAt: '2026-08-02T10:00:00Z',
      updatedAt: '2026-08-02T10:00:00Z',
      validFrom: '2026-08-02',
      corroborationSignals: {
        examRegistration: true,
        feeReceiptReference: `REC-DTU-ECE-${2000 + i}`,
        lastSignalDate: '2026-09-12',
      },
    });
  }

  // 3. MIT Pune AI & Data Science (18 students)
  for (let i = 1; i <= 18; i++) {
    const idx = 33 + i;
    const fn = FIRST_NAMES[idx % FIRST_NAMES.length];
    const ln = LAST_NAMES[idx % LAST_NAMES.length];
    const apaar = `APAAR-DEMO-${String(idx).padStart(4, '0')}`;

    students.push({
      id: `STU-MAH-AI-${String(i).padStart(3, '0')}`,
      apaarId: apaar,
      matchingToken: generateMatchingToken(apaar),
      institutionalStudentId: `MIT/2026/AI/${String(i).padStart(3, '0')}`,
      name: `${fn} ${ln}`,
      dob: `2005-0${(i % 9) + 1}-10`,
      gender: i % 2 === 0 ? 'Female' : 'Male',
      institutionId: 'INST-MAH-02',
      programmeId: 'PROG-MAH-AI',
      academicYear: '2026-2027',
      admissionDate: `2026-08-0${(i % 8) + 2}`,
      enrolmentStartDate: '2026-08-16',
      admissionCategory: i % 5 === 0 ? 'TFW' : 'General',
      isSupernumerary: i % 5 === 0,
      supernumeraryType: i % 5 === 0 ? 'TFW' : undefined,
      admissionStatus: 'Admission Confirmed',
      validationStatus: 'VALID',
      externalVerificationStatus: 'Externally Verified (MOCK)',
      recordVersion: 1,
      createdAt: '2026-08-03T11:00:00Z',
      updatedAt: '2026-08-03T11:00:00Z',
      validFrom: '2026-08-03',
      corroborationSignals: {
        examRegistration: true,
        feeReceiptReference: `REC-MIT-AI-${3000 + i}`,
        hostelAllocation: true,
        lastSignalDate: '2026-09-15',
      },
    });
  }

  // 4. MIT Pune Mechanical (15 students)
  for (let i = 1; i <= 15; i++) {
    const idx = 51 + i;
    const fn = FIRST_NAMES[idx % FIRST_NAMES.length];
    const ln = LAST_NAMES[idx % LAST_NAMES.length];
    const apaar = `APAAR-DEMO-${String(idx).padStart(4, '0')}`;

    students.push({
      id: `STU-MAH-MECH-${String(i).padStart(3, '0')}`,
      apaarId: apaar,
      matchingToken: generateMatchingToken(apaar),
      institutionalStudentId: `MIT/2026/MECH/${String(i).padStart(3, '0')}`,
      name: `${fn} ${ln}`,
      dob: `2004-11-${String((i % 25) + 1).padStart(2, '0')}`,
      gender: 'Male',
      institutionId: 'INST-MAH-02',
      programmeId: 'PROG-MAH-MECH',
      academicYear: '2026-2027',
      admissionDate: `2026-08-0${(i % 8) + 1}`,
      enrolmentStartDate: '2026-08-16',
      admissionCategory: 'General',
      isSupernumerary: false,
      admissionStatus: 'Enrollment Reported',
      validationStatus: 'VALID',
      externalVerificationStatus: 'Format Checked',
      recordVersion: 1,
      createdAt: '2026-08-03T12:00:00Z',
      updatedAt: '2026-08-03T12:00:00Z',
      validFrom: '2026-08-03',
    });
  }

  // 5. Bangalore College of Engineering (14 students)
  for (let i = 1; i <= 14; i++) {
    const idx = 66 + i;
    const fn = FIRST_NAMES[idx % FIRST_NAMES.length];
    const ln = LAST_NAMES[idx % LAST_NAMES.length];
    const apaar = `APAAR-DEMO-${String(idx).padStart(4, '0')}`;

    students.push({
      id: `STU-KAR-ISE-${String(i).padStart(3, '0')}`,
      apaarId: apaar,
      matchingToken: generateMatchingToken(apaar),
      institutionalStudentId: `BCE/2026/ISE/${String(i).padStart(3, '0')}`,
      name: `${fn} ${ln}`,
      dob: `2005-03-${String((i % 20) + 1).padStart(2, '0')}`,
      gender: i % 2 === 0 ? 'Female' : 'Male',
      institutionId: 'INST-KAR-03',
      programmeId: 'PROG-KAR-ISE',
      academicYear: '2026-2027',
      admissionDate: `2026-08-05`,
      enrolmentStartDate: '2026-08-18',
      admissionCategory: 'General',
      isSupernumerary: false,
      admissionStatus: 'Admission Confirmed',
      validationStatus: 'VALID',
      externalVerificationStatus: 'Format Checked',
      recordVersion: 1,
      createdAt: '2026-08-05T14:00:00Z',
      updatedAt: '2026-08-05T14:00:00Z',
      validFrom: '2026-08-05',
    });
  }

  // 6. Gujarat Technological Institute (12 students)
  for (let i = 1; i <= 12; i++) {
    const idx = 80 + i;
    const fn = FIRST_NAMES[idx % FIRST_NAMES.length];
    const ln = LAST_NAMES[idx % LAST_NAMES.length];
    const apaar = `APAAR-DEMO-${String(idx).padStart(4, '0')}`;

    students.push({
      id: `STU-GUJ-CHEM-${String(i).padStart(3, '0')}`,
      apaarId: apaar,
      matchingToken: generateMatchingToken(apaar),
      institutionalStudentId: `GTI/2026/CHEM/${String(i).padStart(3, '0')}`,
      name: `${fn} ${ln}`,
      dob: `2005-04-${String((i % 20) + 1).padStart(2, '0')}`,
      gender: i % 2 === 0 ? 'Female' : 'Male',
      institutionId: 'INST-GUJ-04',
      programmeId: 'PROG-GUJ-CHEM',
      academicYear: '2026-2027',
      admissionDate: `2026-08-06`,
      enrolmentStartDate: '2026-08-20',
      admissionCategory: 'General',
      isSupernumerary: false,
      admissionStatus: 'Admission Confirmed',
      validationStatus: 'VALID',
      externalVerificationStatus: 'Format Checked',
      recordVersion: 1,
      createdAt: '2026-08-06T15:00:00Z',
      updatedAt: '2026-08-06T15:00:00Z',
      validFrom: '2026-08-06',
    });
  }

  // =========================================================================
  // INTENTIONAL SEED EDGE CASES (Prompt Section 39)
  // =========================================================================

  // Edge Case 1: Missing synthetic APAAR ID
  students.push({
    id: 'EDGE-MISSING-APAAR',
    apaarId: '',
    matchingToken: 'HMAC-MISSING-001',
    institutionalStudentId: 'DTU/2026/CSE/991',
    name: 'Suresh Kumar (Missing APAAR)',
    dob: '2005-06-12',
    gender: 'Male',
    institutionId: 'INST-DEL-01',
    programmeId: 'PROG-DEL-CSE',
    academicYear: '2026-2027',
    admissionDate: '2026-08-04',
    enrolmentStartDate: '2026-08-16',
    admissionCategory: 'General',
    isSupernumerary: false,
    admissionStatus: 'Provisionally Admitted',
    validationStatus: 'INVALID',
    externalVerificationStatus: 'Unable to Verify',
    recordVersion: 1,
    createdAt: '2026-08-04T10:00:00Z',
    updatedAt: '2026-08-04T10:00:00Z',
    validFrom: '2026-08-04',
  });

  // Edge Case 2: Malformed synthetic identifier
  students.push({
    id: 'EDGE-MALFORMED-APAAR',
    apaarId: 'APAAR-MALFORMED-99',
    matchingToken: generateMatchingToken('APAAR-MALFORMED-99'),
    institutionalStudentId: 'DTU/2026/CSE/992',
    name: 'Tanya Sengupta (Malformed ID)',
    dob: '2005-07-18',
    gender: 'Female',
    institutionId: 'INST-DEL-01',
    programmeId: 'PROG-DEL-CSE',
    academicYear: '2026-2027',
    admissionDate: '2026-08-04',
    enrolmentStartDate: '2026-08-16',
    admissionCategory: 'General',
    isSupernumerary: false,
    admissionStatus: 'Provisionally Admitted',
    validationStatus: 'INVALID',
    externalVerificationStatus: 'External Verification Failed (MOCK)',
    recordVersion: 1,
    createdAt: '2026-08-04T10:15:00Z',
    updatedAt: '2026-08-04T10:15:00Z',
    validFrom: '2026-08-04',
  });

  // Edge Case 4: Overlapping active admissions across TWO institutions (Same APAAR: APAAR-DEMO-0099)
  // Admitted at DTU and also actively admitted at MIT Pune!
  const duplicateApaar = 'APAAR-DEMO-0099';
  students.push({
    id: 'EDGE-CROSS-DTU',
    apaarId: duplicateApaar,
    matchingToken: generateMatchingToken(duplicateApaar),
    institutionalStudentId: 'DTU/2026/CSE/888',
    name: 'Sameer Singhania (Dual Enrollment)',
    dob: '2004-12-05',
    gender: 'Male',
    institutionId: 'INST-DEL-01',
    programmeId: 'PROG-DEL-CSE',
    academicYear: '2026-2027',
    admissionDate: '2026-07-25',
    enrolmentStartDate: '2026-08-01',
    admissionCategory: 'General',
    isSupernumerary: false,
    admissionStatus: 'Admission Confirmed',
    validationStatus: 'INVALID',
    externalVerificationStatus: 'Internal Match Checked',
    recordVersion: 1,
    createdAt: '2026-07-25T11:00:00Z',
    updatedAt: '2026-07-25T11:00:00Z',
    validFrom: '2026-07-25',
  });

  students.push({
    id: 'EDGE-CROSS-MIT',
    apaarId: duplicateApaar,
    matchingToken: generateMatchingToken(duplicateApaar),
    institutionalStudentId: 'MIT/2026/AI/888',
    name: 'Sameer Singhania (Dual Enrollment)',
    dob: '2004-12-05',
    gender: 'Male',
    institutionId: 'INST-MAH-02',
    programmeId: 'PROG-MAH-AI',
    academicYear: '2026-2027',
    admissionDate: '2026-08-05',
    enrolmentStartDate: '2026-08-16',
    admissionCategory: 'General',
    isSupernumerary: false,
    admissionStatus: 'Admission Confirmed',
    validationStatus: 'INVALID',
    externalVerificationStatus: 'Internal Match Checked',
    recordVersion: 1,
    createdAt: '2026-08-05T12:00:00Z',
    updatedAt: '2026-08-05T12:00:00Z',
    validFrom: '2026-08-05',
  });

  // Edge Case 5: Legitimate Transfer (Same student APAAR-DEMO-0098 moved from BCE to MIT Pune)
  const transferApaar = 'APAAR-DEMO-0098';
  students.push({
    id: 'EDGE-TRANSFER-BCE',
    apaarId: transferApaar,
    matchingToken: generateMatchingToken(transferApaar),
    institutionalStudentId: 'BCE/2026/ISE/777',
    name: 'Pooja Raghavan (Legitimate Transfer)',
    dob: '2005-02-14',
    gender: 'Female',
    institutionId: 'INST-KAR-03',
    programmeId: 'PROG-KAR-ISE',
    academicYear: '2026-2027',
    admissionDate: '2026-07-15',
    enrolmentStartDate: '2026-07-20',
    withdrawalDate: '2026-08-02',
    admissionCategory: 'General',
    isSupernumerary: false,
    admissionStatus: 'Withdrawal Approved',
    validationStatus: 'VALID',
    externalVerificationStatus: 'Format Checked',
    recordVersion: 2,
    createdAt: '2026-07-15T10:00:00Z',
    updatedAt: '2026-08-02T16:00:00Z',
    validFrom: '2026-07-15',
    validTo: '2026-08-02',
  });

  students.push({
    id: 'EDGE-TRANSFER-MIT',
    apaarId: transferApaar,
    matchingToken: generateMatchingToken(transferApaar),
    institutionalStudentId: 'MIT/2026/AI/777',
    name: 'Pooja Raghavan (Legitimate Transfer)',
    dob: '2005-02-14',
    gender: 'Female',
    institutionId: 'INST-MAH-02',
    programmeId: 'PROG-MAH-AI',
    academicYear: '2026-2027',
    admissionDate: '2026-08-06',
    enrolmentStartDate: '2026-08-16',
    admissionCategory: 'General',
    isSupernumerary: false,
    admissionStatus: 'Admission Confirmed',
    validationStatus: 'VALID',
    externalVerificationStatus: 'Format Checked',
    recordVersion: 1,
    createdAt: '2026-08-06T11:00:00Z',
    updatedAt: '2026-08-06T11:00:00Z',
    validFrom: '2026-08-06',
  });

  // Edge Case 13: Student Disputed Admission (APAAR-DEMO-0097)
  const disputedApaar = 'APAAR-DEMO-0097';
  students.push({
    id: 'EDGE-DISPUTED-STU',
    apaarId: disputedApaar,
    matchingToken: generateMatchingToken(disputedApaar),
    institutionalStudentId: 'BCE/2026/ISE/999',
    name: 'Vikramaditya Rao (Disputed)',
    dob: '2004-09-22',
    gender: 'Male',
    institutionId: 'INST-KAR-03',
    programmeId: 'PROG-KAR-ISE',
    academicYear: '2026-2027',
    admissionDate: '2026-08-08',
    enrolmentStartDate: '2026-08-20',
    admissionCategory: 'General',
    isSupernumerary: false,
    admissionStatus: 'Provisionally Admitted',
    validationStatus: 'WARNING',
    externalVerificationStatus: 'External Verification Pending',
    recordVersion: 1,
    createdAt: '2026-08-08T12:00:00Z',
    updatedAt: '2026-08-08T12:00:00Z',
    validFrom: '2026-08-08',
  });

  return students;
}

export const SEED_RULES: RegulatoryRule[] = [
  {
    id: 'RULE-REG-01',
    ruleCode: 'APH-2026-REG-CAPACITY',
    name: 'Approved Sanctioned Intake Ceiling',
    version: '2.1',
    plainLanguage: 'Institutions cannot admit regular students exceeding the AICTE approved intake for the relevant programme.',
    effectiveAcademicYear: '2026-2027',
    effectiveFrom: '2026-04-01',
    authoritativeSource: 'AICTE Approval Process Handbook (APH 2026-27), Chapter II, Clause 2.4',
    status: 'ACTIVE',
    authorizedBy: 'AICTE Member Secretary',
    activatedAt: '2026-04-01T00:00:00Z',
    category: 'INTAKE',
    testCasesCount: 14,
  },
  {
    id: 'RULE-REG-02',
    ruleCode: 'APH-2026-SUPERNUMERARY',
    name: 'Supernumerary Quota Ceiling (NRI/OCI/FN/TFW)',
    version: '2.0',
    plainLanguage: 'Supernumerary seats must strictly adhere to statutory caps (NRI 5%, FN 5%, TFW 5%, EWS 10%) without encroaching regular quota.',
    effectiveAcademicYear: '2026-2027',
    effectiveFrom: '2026-04-01',
    authoritativeSource: 'AICTE Approval Process Handbook (APH 2026-27), Chapter III, Clause 3.12',
    status: 'ACTIVE',
    authorizedBy: 'AICTE Regulatory Council',
    activatedAt: '2026-04-01T00:00:00Z',
    category: 'SUPERNUMERARY',
    testCasesCount: 18,
  },
  {
    id: 'RULE-REG-03',
    ruleCode: 'APH-2026-APAAR-MANDATE',
    name: 'Mandatory Primary Academic Identifier (APAAR)',
    version: '1.2',
    plainLanguage: 'All admitted student profiles must be mapped to a valid APAAR ID format prior to regulatory enrolment sign-off.',
    effectiveAcademicYear: '2026-2027',
    effectiveFrom: '2026-06-01',
    authoritativeSource: 'Ministry of Education & AICTE Joint Circular MoE/HE/2026/APAAR-09',
    status: 'ACTIVE',
    authorizedBy: 'Chief Information Officer, AICTE',
    activatedAt: '2026-06-01T00:00:00Z',
    category: 'IDENTIFIER',
    testCasesCount: 22,
  },
  {
    id: 'RULE-REG-04',
    ruleCode: 'APH-2026-DUAL-ENROLMENT',
    name: 'Prohibition of Concurrent Full-Time Admissions',
    version: '1.0',
    plainLanguage: 'A student cannot hold active confirmed admission in two AICTE-approved institutions concurrently.',
    effectiveAcademicYear: '2026-2027',
    effectiveFrom: '2026-04-01',
    authoritativeSource: 'AICTE Norms for Admission Standards, Gazette Notification Pt. 4',
    status: 'ACTIVE',
    authorizedBy: 'AICTE Standards Committee',
    activatedAt: '2026-04-01T00:00:00Z',
    category: 'SUBMISSION',
    testCasesCount: 16,
  },
];

export const SEED_DISCREPANCIES: DiscrepancyCase[] = [
  {
    id: 'CASE-2026-001',
    apaarId: 'APAAR-DEMO-0099',
    studentName: 'Sameer Singhania',
    issueType: 'DUPLICATE_ACTIVE_ENROLLMENT',
    severity: 'CRITICAL',
    involvedInstitutions: ['INST-DEL-01', 'INST-MAH-02'],
    programmeId: 'PROG-DEL-CSE',
    academicYear: '2026-2027',
    status: 'UNDER_REVIEW',
    riskScore: 88,
    riskFormulaBreakdown: [
      { factor: 'Concurrent Active State Overlap', weight: 40, points: 40, explanation: 'Both institutions reported active admission without withdrawal timestamp.' },
      { factor: 'Different Geographies (Delhi vs Pune)', weight: 25, points: 25, explanation: 'Physical attendance at both locations is physically impossible.' },
      { factor: 'Institutional Signatory Status', weight: 20, points: 15, explanation: 'One institution has finalized batch, second is in draft.' },
      { factor: 'Fee Receipt Corroboration', weight: 15, points: 8, explanation: 'Fee transaction recorded at DTU only.' },
    ],
    findingsClassification: 'Potential Overlapping Active Admissions',
    createdAt: '2026-08-06T10:00:00Z',
    updatedAt: '2026-08-07T14:30:00Z',
    evidenceNotes: [
      'Automated reconciliation flagged active status in DTU (admitted 2026-07-25) and MIT (admitted 2026-08-05).',
      'AICTE inquiry notice sent to both registrars requesting seat clearance statement.',
    ],
  },
  {
    id: 'CASE-2026-002',
    apaarId: 'APAAR-DEMO-0021',
    studentName: 'Vikram Mishra',
    issueType: 'INTAKE_CAPACITY_EXCEEDED',
    severity: 'HIGH',
    involvedInstitutions: ['INST-DEL-01'],
    programmeId: 'PROG-DEL-CSE',
    academicYear: '2026-2027',
    status: 'EVIDENCE_REQUESTED',
    riskScore: 75,
    riskFormulaBreakdown: [
      { factor: 'Capacity Ceiling Breach', weight: 50, points: 50, explanation: '21 regular admissions reported against sanctioned limit of 20.' },
      { factor: 'Supernumerary Quota Unused', weight: 30, points: 15, explanation: 'Unused NRI/EWS capacity available; reclassification possible.' },
      { factor: 'Institutional Audit Rating', weight: 20, points: 10, explanation: 'DTU holds A++ NAAC accreditation.' },
    ],
    findingsClassification: 'Data Quality Error',
    createdAt: '2026-08-02T11:00:00Z',
    updatedAt: '2026-08-03T09:15:00Z',
    evidenceNotes: [
      'Reported regular intake exceeded sanctioned capacity by 1 seat in B.Tech CSE.',
      'Institution informed to verify whether candidate was admitted under EWS/TFW quota.',
    ],
  },
  {
    id: 'CASE-2026-003',
    apaarId: 'APAAR-DEMO-0097',
    studentName: 'Vikramaditya Rao',
    issueType: 'STUDENT_DISPUTE',
    severity: 'HIGH',
    involvedInstitutions: ['INST-KAR-03'],
    programmeId: 'PROG-KAR-ISE',
    academicYear: '2026-2027',
    status: 'NEW',
    riskScore: 68,
    riskFormulaBreakdown: [
      { factor: 'Direct Student Dispute Raised', weight: 45, points: 45, explanation: 'Student explicitly flagged "I do not recognize this admission".' },
      { factor: 'Missing Fee Receipt Reference', weight: 35, points: 23, explanation: 'No institutional fee receipt corroborated.' },
    ],
    findingsClassification: 'Data Quality Error',
    createdAt: '2026-08-09T08:00:00Z',
    updatedAt: '2026-08-09T08:00:00Z',
    evidenceNotes: [
      'Student logged into student portal and raised dispute stating they never attended counseling at BCE Bangalore.',
    ],
  },
];

export const SEED_ATTESTATIONS: StudentAttestation[] = [
  {
    id: 'ATT-2026-001',
    apaarId: 'APAAR-DEMO-0001',
    studentId: 'STU-DEL-001',
    institutionId: 'INST-DEL-01',
    programmeId: 'PROG-DEL-CSE',
    academicYear: '2026-2027',
    admissionDate: '2026-08-01',
    status: 'CONFIRMED',
    responseTimestamp: '2026-08-10T12:30:00Z',
    studentRemarks: 'Admission details confirmed. Fee receipt verified.',
  },
  {
    id: 'ATT-2026-002',
    apaarId: 'APAAR-DEMO-0097',
    studentId: 'EDGE-DISPUTED-STU',
    institutionId: 'INST-KAR-03',
    programmeId: 'PROG-KAR-ISE',
    academicYear: '2026-2027',
    admissionDate: '2026-08-08',
    status: 'DISPUTED',
    responseTimestamp: '2026-08-09T08:00:00Z',
    disputeReason: 'I never accepted or reported admission at BCE Bangalore. I am studying elsewhere.',
    studentRemarks: 'Please rectify the central database to remove this false enrollment record.',
  },
  {
    id: 'ATT-2026-003',
    apaarId: 'APAAR-DEMO-0002',
    studentId: 'STU-DEL-002',
    institutionId: 'INST-DEL-01',
    programmeId: 'PROG-DEL-CSE',
    academicYear: '2026-2027',
    admissionDate: '2026-08-01',
    status: 'PENDING',
  },
];

export function generateSeedAuditChain(): AuditEvent[] {
  const genesisHash = 'GENESIS_00000000000000000000000000000000';
  const events: AuditEvent[] = [];

  const rawEvents = [
    {
      actor: 'system@aicte-india.org',
      role: 'SECURITY_ADMIN' as const,
      action: 'INIT_SYSTEM_LEDGER',
      entityType: 'RULE' as const,
      entityId: 'GENESIS-BLOCK',
      institutionId: undefined,
      details: 'APAAR Integrity Mesh initial ledger initialized with APH 2026-27 statutory rules.',
    },
    {
      actor: 'registrar@dtu.ac.in',
      role: 'INSTITUTION_ADMIN' as const,
      action: 'CONFIGURE_PROGRAMME_CAPACITY',
      entityType: 'STUDENT' as const,
      entityId: 'PROG-DEL-CSE',
      institutionId: 'INST-DEL-01',
      details: 'Approved intake configured: Regular 20, NRI 3, OCI 2, FN 2, TFW 2, EWS 2.',
    },
    {
      actor: 'operator@dtu.ac.in',
      role: 'INSTITUTION_OPERATOR' as const,
      action: 'BATCH_UPLOAD_COMMITTED',
      entityType: 'BATCH' as const,
      entityId: 'BATCH-DTU-2026-01',
      institutionId: 'INST-DEL-01',
      details: 'Uploaded batch of 21 students for B.Tech Computer Science & Engineering.',
    },
    {
      actor: 'system@aicte-india.org',
      role: 'AICTE_ADMIN' as const,
      action: 'AUTO_VALIDATION_EXECUTED',
      entityType: 'BATCH' as const,
      entityId: 'BATCH-DTU-2026-01',
      institutionId: 'INST-DEL-01',
      details: 'Multi-stage validation executed: 19 Valid, 1 Warning, 1 Intake Capacity Violation.',
    },
    {
      actor: 'registrar@dtu.ac.in',
      role: 'INSTITUTION_SIGNATORY' as const,
      action: 'SIGNATORY_SUBMISSION_APPROVED',
      entityType: 'BATCH' as const,
      entityId: 'BATCH-DTU-2026-01',
      institutionId: 'INST-DEL-01',
      details: 'Institutional signatory signed off on batch with exception note for investigation.',
    },
    {
      actor: 'director.acad@mitpune.edu.in',
      role: 'INSTITUTION_ADMIN' as const,
      action: 'BATCH_UPLOAD_COMMITTED',
      entityType: 'BATCH' as const,
      entityId: 'BATCH-MIT-2026-01',
      institutionId: 'INST-MAH-02',
      details: 'Uploaded 18 student records for B.Tech AI & Data Science.',
    },
    {
      actor: 'system@aicte-india.org',
      role: 'AICTE_ADMIN' as const,
      action: 'CROSS_INSTITUTION_CONFLICT_FLAGGED',
      entityType: 'STUDENT' as const,
      entityId: 'EDGE-CROSS-DTU',
      institutionId: 'INST-DEL-01',
      details: 'Cross-institution conflict flagged for APAAR-DEMO-0099 (DTU and MIT dual active admission).',
    },
    {
      actor: 'admissions@bce.ac.in',
      role: 'INSTITUTION_OPERATOR' as const,
      action: 'RECORD_WITHDRAWAL_APPROVED',
      entityType: 'STUDENT' as const,
      entityId: 'EDGE-TRANSFER-BCE',
      institutionId: 'INST-KAR-03',
      details: 'Withdrawal approved for student APAAR-DEMO-0098 (Transfer to MIT Pune).',
    },
  ];

  let prevHash = genesisHash;
  for (let i = 0; i < rawEvents.length; i++) {
    const raw = rawEvents[i];
    const seq = i + 1;
    const ts = new Date(Date.now() - (rawEvents.length - i) * 3600000 * 4).toISOString();
    const eventHash = computeEventHash({
      sequenceNumber: seq,
      timestamp: ts,
      actor: raw.actor,
      role: raw.role,
      action: raw.action,
      entityType: raw.entityType,
      entityId: raw.entityId,
      institutionId: raw.institutionId,
      details: raw.details,
      previousHash: prevHash,
    });

    const event: AuditEvent = {
      id: `AUD-EVT-${String(seq).padStart(4, '0')}`,
      sequenceNumber: seq,
      timestamp: ts,
      actor: raw.actor,
      role: raw.role,
      action: raw.action,
      entityType: raw.entityType,
      entityId: raw.entityId,
      institutionId: raw.institutionId,
      details: raw.details,
      previousHash: prevHash,
      eventHash,
    };

    events.push(event);
    prevHash = eventHash;
  }

  return events;
}

export function generateSeedCredentials(students: StudentRecord[]): AcademicCredential[] {
  const creds: AcademicCredential[] = [];

  // Generate verified credentials for student 1 and student 33
  const targetStudents = students.filter(
    (s) => s.apaarId === 'APAAR-DEMO-0001' || s.apaarId === 'APAAR-DEMO-0034'
  );

  for (const s of targetStudents) {
    const claims = {
      iss: s.institutionId === 'INST-DEL-01' ? 'Delhi Technological University' : 'Maharashtra Institute of Technology',
      sub: s.apaarId,
      aud: 'AICTE-NATIONAL-CREDENTIAL-REGISTRY',
      expYear: '2030',
      prog: s.programmeId,
      status: 'VERIFIED_ENROLLED',
    };

    const signatureData = signAcademicCredential(claims);

    const credential: AcademicCredential = {
      id: `CRED-${s.id}`,
      credentialNumber: `AICTE-CRED-2026-${s.apaarId.replace('APAAR-DEMO-', '')}`,
      receiptNumber: `RCPT-2026-${s.apaarId.replace('APAAR-DEMO-', '')}`,
      studentApaarId: s.apaarId,
      studentName: s.name,
      institutionalStudentId: s.institutionalStudentId,
      institutionId: s.institutionId,
      institutionName: claims.iss,
      programmeName: s.programmeId === 'PROG-DEL-CSE' ? 'B.Tech Computer Science & Engineering' : 'B.Tech Artificial Intelligence & Data Science',
      academicYear: s.academicYear,
      admissionStatus: s.admissionStatus,
      issuedAt: '2026-08-15T10:00:00Z',
      status: 'ACTIVE',
      signatureAlgorithm: signatureData.signatureAlgorithm,
      digitalSignature: signatureData.signature,
      signedClaims: claims,
      qrPayload: JSON.stringify({
        ref: `AICTE-CRED-2026-${s.apaarId.replace('APAAR-DEMO-', '')}`,
        apaar: s.apaarId,
        inst: s.institutionId,
        sig: signatureData.signature,
      }),
    };

    creds.push(credential);
  }

  return creds;
}

export const SEED_SECURITY_EVENTS: SecurityEvent[] = [
  {
    id: 'SEC-001',
    timestamp: '2026-10-28T09:12:00Z',
    eventType: 'AUTH_SUCCESS',
    actor: 'registrar@dtu.ac.in',
    ipAddress: '14.139.224.2',
    severity: 'LOW',
    details: 'MFA authenticated login session initiated for Institution Administrator.',
    blocked: false,
  },
  {
    id: 'SEC-002',
    timestamp: '2026-10-28T10:45:00Z',
    eventType: 'CROSS_TENANT_BLOCKED',
    actor: 'operator@dtu.ac.in',
    ipAddress: '14.139.224.2',
    severity: 'HIGH',
    details: 'Tenant isolation enforced: Attempt to query records of INST-MAH-02 was blocked at API route.',
    blocked: true,
  },
  {
    id: 'SEC-003',
    timestamp: '2026-10-28T11:20:00Z',
    eventType: 'HMAC_TOKEN_GENERATED',
    actor: 'system@aicte-india.org',
    ipAddress: '127.0.0.1',
    severity: 'LOW',
    details: 'Privacy-preserving HMAC matching token generated for cross-institution duplicate index.',
    blocked: false,
  },
  {
    id: 'SEC-004',
    timestamp: '2026-10-28T14:05:00Z',
    eventType: 'BULK_DATA_EXPORT',
    actor: 'admin@aicte-india.org',
    ipAddress: '164.100.158.45',
    severity: 'MEDIUM',
    details: 'National regulatory summary export generated in CSV format (Masked Identifiers enforced).',
    blocked: false,
  },
  {
    id: 'SEC-005',
    timestamp: '2026-10-29T08:00:00Z',
    eventType: 'AUDIT_INTEGRITY_CHECK',
    actor: 'system@aicte-india.org',
    ipAddress: '127.0.0.1',
    severity: 'LOW',
    details: 'Automated cryptographic check: All 8 audit events verified with unbroken SHA-256 chain.',
    blocked: false,
  },
];
