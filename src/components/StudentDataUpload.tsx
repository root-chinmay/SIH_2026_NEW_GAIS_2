import React, { useState } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  RefreshCw,
  FileText,
  SlidersHorizontal,
  FileCheck,
} from 'lucide-react';
import { store } from '../services/store';
import { Programme, StudentRecord } from '../types';
import { validateBatch } from '../services/validationEngine';

interface StudentDataUploadProps {
  onSuccess: (batchId: string) => void;
}

export const StudentDataUpload: React.FC<StudentDataUploadProps> = ({ onSuccess }) => {
  const state = store.getState();
  const currentInstId = state.currentUser.institutionId || 'INST-DEL-01';
  const institution = state.institutions.find((i) => i.id === currentInstId) || state.institutions[0];

  const [selectedProgrammeId, setSelectedProgrammeId] = useState<string>(
    institution.programmes[0]?.id || ''
  );
  const selectedProgramme = institution.programmes.find((p) => p.id === selectedProgrammeId) || institution.programmes[0];

  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('');
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({
    apaarId: 'apaar_id',
    institutionalStudentId: 'institutional_student_id',
    name: 'student_name',
    dob: 'date_of_birth',
    gender: 'gender',
    admissionDate: 'admission_date',
    admissionCategory: 'admission_category',
    isSupernumerary: 'is_supernumerary',
    supernumeraryType: 'supernumerary_type',
  });

  const [step, setStep] = useState<'UPLOAD' | 'MAPPING' | 'VALIDATION_PREVIEW' | 'COMMITTED'>('UPLOAD');
  const [validationSummary, setValidationSummary] = useState<any>(null);
  const [normalizedRecords, setNormalizedRecords] = useState<Partial<StudentRecord>[]>([]);
  const [isCommitting, setIsCommitting] = useState(false);

  // Download official CSV template
  const handleDownloadTemplate = () => {
    const templateContent =
      'apaar_id,institutional_student_id,student_name,date_of_birth,gender,admission_date,admission_category,is_supernumerary,supernumerary_type\n' +
      'APAAR-DEMO-0101,DTU/2026/CSE/101,Mihir Rao,2005-05-14,Male,2026-08-01,General,false,\n' +
      'APAAR-DEMO-0102,DTU/2026/CSE/102,Fatima Zahra,2005-08-20,Female,2026-08-02,OBC-NCL,false,\n' +
      'APAAR-DEMO-0103,DTU/2026/CSE/103,Rohan Chhabra,2004-12-11,Male,2026-08-03,NRI,true,NRI\n' +
      'APAAR-DEMO-0104,DTU/2026/CSE/104,Smriti Kulkarni,2005-02-18,Female,2026-08-03,EWS,false,';

    const blob = new Blob([templateContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'aicte_apaar_student_upload_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Load pre-configured sample dataset into upload
  const handleLoadSampleCSV = () => {
    const sampleCSV = [
      {
        apaar_id: 'APAAR-DEMO-0201',
        institutional_student_id: 'DTU/2026/CSE/201',
        student_name: 'Anirudh Varma',
        date_of_birth: '2005-03-12',
        gender: 'Male',
        admission_date: '2026-08-01',
        admission_category: 'General',
        is_supernumerary: 'false',
        supernumerary_type: '',
      },
      {
        apaar_id: 'APAAR-DEMO-0202',
        institutional_student_id: 'DTU/2026/CSE/202',
        student_name: 'Priyanka Sen',
        date_of_birth: '2005-07-22',
        gender: 'Female',
        admission_date: '2026-08-01',
        admission_category: 'OBC-NCL',
        is_supernumerary: 'false',
        supernumerary_type: '',
      },
      {
        apaar_id: 'APAAR-DEMO-0203',
        institutional_student_id: 'DTU/2026/CSE/203',
        student_name: 'Aditya Birla',
        date_of_birth: '2005-01-19',
        gender: 'Male',
        admission_date: '2026-08-02',
        admission_category: 'SC',
        is_supernumerary: 'false',
        supernumerary_type: '',
      },
      {
        apaar_id: 'APAAR-DEMO-0204',
        institutional_student_id: 'DTU/2026/CSE/204',
        student_name: 'Zoya Khan',
        date_of_birth: '2004-11-30',
        gender: 'Female',
        admission_date: '2026-08-02',
        admission_category: 'NRI',
        is_supernumerary: 'true',
        supernumerary_type: 'NRI',
      },
      {
        // INTENTIONAL EDGE CASE: Duplicate APAAR already registered at MIT Pune
        apaar_id: 'APAAR-DEMO-0099',
        institutional_student_id: 'DTU/2026/CSE/999',
        student_name: 'Sameer Singhania',
        date_of_birth: '2005-04-14',
        gender: 'Male',
        admission_date: '2026-08-03',
        admission_category: 'General',
        is_supernumerary: 'false',
        supernumerary_type: '',
      },
      {
        // INTENTIONAL EDGE CASE: Malformed APAAR ID syntax
        apaar_id: 'INVALID-SYNTAX-99',
        institutional_student_id: 'DTU/2026/CSE/888',
        student_name: 'Kunal Deshmukh',
        date_of_birth: '2005-09-09',
        gender: 'Male',
        admission_date: '2026-08-04',
        admission_category: 'General',
        is_supernumerary: 'false',
        supernumerary_type: '',
      },
    ];

    setRawRows(sampleCSV);
    setHeaders(Object.keys(sampleCSV[0]));
    setFileName('sample_dtu_cohort_2026.csv');
    setFileSize('1.8 KB');
    setStep('MAPPING');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setFileName(selected.name);
    setFileSize(`${(selected.size / 1024).toFixed(1)} KB`);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseCSV(text);
    };
    reader.readAsText(selected);
  };

  const parseCSV = (text: string) => {
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) return;

    const rawHeader = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
    setHeaders(rawHeader);

    // Auto smart column mapping
    const detectedMapping: Record<string, string> = { ...columnMapping };
    rawHeader.forEach((h) => {
      const lower = h.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (lower.includes('apaar')) detectedMapping.apaarId = h;
      else if (lower.includes('roll') || lower.includes('reg') || lower.includes('inst')) detectedMapping.institutionalStudentId = h;
      else if (lower.includes('name')) detectedMapping.name = h;
      else if (lower.includes('dob') || lower.includes('birth')) detectedMapping.dob = h;
      else if (lower.includes('gender') || lower.includes('sex')) detectedMapping.gender = h;
      else if (lower.includes('admission') || lower.includes('date')) detectedMapping.admissionDate = h;
      else if (lower.includes('cat')) detectedMapping.admissionCategory = h;
      else if (lower.includes('super')) detectedMapping.isSupernumerary = h;
    });
    setColumnMapping(detectedMapping);

    const rows: Record<string, string>[] = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map((p) => p.trim().replace(/^"|"$/g, ''));
      const rowObj: Record<string, string> = {};
      rawHeader.forEach((h, idx) => {
        rowObj[h] = parts[idx] || '';
      });
      rows.push(rowObj);
    }
    setRawRows(rows);
    setStep('MAPPING');
  };

  // Run schema normalization and pre-commit validation engine
  const handleRunValidation = () => {
    const normalized: Partial<StudentRecord>[] = rawRows.map((r, i) => {
      const isSuper =
        r[columnMapping.isSupernumerary]?.toLowerCase() === 'true' ||
        Boolean(r[columnMapping.supernumeraryType]);

      return {
        id: `UPLOAD-ROW-${i + 1}`,
        apaarId: r[columnMapping.apaarId]?.trim() || '',
        institutionalStudentId: r[columnMapping.institutionalStudentId]?.trim() || '',
        name: r[columnMapping.name]?.trim() || '',
        dob: r[columnMapping.dob]?.trim() || '2005-01-01',
        gender: (r[columnMapping.gender]?.trim() as any) || 'Male',
        admissionDate: r[columnMapping.admissionDate]?.trim() || '2026-08-01',
        enrolmentStartDate: r[columnMapping.admissionDate]?.trim() || '2026-08-01',
        admissionCategory: (r[columnMapping.admissionCategory]?.trim() as any) || 'General',
        isSupernumerary: isSuper,
        supernumeraryType: (r[columnMapping.supernumeraryType]?.trim() as any) || undefined,
        institutionId: institution.id,
        programmeId: selectedProgramme.id,
        academicYear,
        admissionStatus: 'Provisionally Admitted',
      };
    });

    setNormalizedRecords(normalized);

    const res = validateBatch(
      normalized,
      institution,
      selectedProgramme,
      state.students
    );

    setValidationSummary(res);
    setStep('VALIDATION_PREVIEW');
  };

  // Commit batch to state & audit chain
  const handleCommitBatch = () => {
    setIsCommitting(true);
    setTimeout(() => {
      const newBatch = store.commitBatch({
        institutionId: institution.id,
        programmeId: selectedProgramme.id,
        academicYear,
        records: normalizedRecords,
      });
      setIsCommitting(false);
      setStep('COMMITTED');
      onSuccess(newBatch.id);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Instructions */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              Batch Ingestion
            </span>
            <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
              7-Stage Pre-Commit Validation
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-2">
            <UploadCloud className="w-6 h-6 text-blue-600" />
            Student Enrolment Batch Submission
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Upload institutional student cohorts, normalize field schemas, and execute 7-stage APAAR validation before final signatory sign-off.
          </p>
        </div>

        <button
          onClick={handleDownloadTemplate}
          className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all shrink-0"
        >
          <Download className="w-4 h-4 text-blue-600" />
          Download CSV Template
        </button>
      </div>

      {/* Programme & Academic Year Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Target Programme:
          </label>
          <select
            value={selectedProgrammeId}
            onChange={(e) => setSelectedProgrammeId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            {institution.programmes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.code}) — Approved Intake: {p.approvedIntake}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Academic Session / Year:
          </label>
          <input
            type="text"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
            placeholder="2026-2027"
          />
        </div>
      </div>

      {/* STEP 1: Upload Dropzone */}
      {step === 'UPLOAD' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-6 shadow-sm">
          <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-10 transition-colors flex flex-col items-center justify-center cursor-pointer relative bg-blue-50/20">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4 shadow-sm">
              <FileSpreadsheet className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Drag &amp; drop student CSV file here
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Supports CSV with UTF-8 encoding up to 10MB per batch
            </p>
            <div className="mt-4 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm">
              Browse Files
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <span className="text-xs text-slate-500">— or test with pre-built dataset —</span>
            <button
              onClick={handleLoadSampleCSV}
              className="text-xs font-semibold text-blue-700 hover:text-blue-900 underline"
            >
              Load Sample DTU Batch (Includes Intentional Edge Cases)
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Column Mapping */}
      {step === 'MAPPING' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-blue-600" />
                Schema Normalization &amp; Column Mapping
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                File: <strong className="text-slate-800">{fileName}</strong> ({fileSize}, {rawRows.length} rows detected)
              </p>
            </div>

            <button
              onClick={() => setStep('UPLOAD')}
              className="text-xs text-slate-600 hover:text-slate-900 font-medium underline"
            >
              Change File
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(columnMapping).map(([canonicalKey, mappedHeader]) => (
              <div key={canonicalKey} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <label className="text-[11px] font-bold text-blue-900 block mb-1.5 uppercase tracking-wider">
                  {canonicalKey}
                </label>
                <select
                  value={mappedHeader}
                  onChange={(e) =>
                    setColumnMapping({ ...columnMapping, [canonicalKey]: e.target.value })
                  }
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="">-- Ignore Field --</option>
                  {headers.map((h) => (
                    <option key={h} value={h}>
                      CSV: {h}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              onClick={() => setStep('UPLOAD')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
            >
              Back
            </button>
            <button
              onClick={handleRunValidation}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm"
            >
              Run 7-Stage Validation Engine
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Pre-Commit Validation Results Preview */}
      {step === 'VALIDATION_PREVIEW' && validationSummary && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-blue-600" />
                Pre-Commit Validation Results
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluated against statutory rules: Capacity ({selectedProgramme.approvedIntake}), format, duplicate index.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-lg font-semibold">
                {validationSummary.validCount} Valid
              </span>
              <span className="text-xs bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1 rounded-lg font-semibold">
                {validationSummary.invalidCount} Errors
              </span>
            </div>
          </div>

          {/* Row Level Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 max-h-96 overflow-y-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-blue-50/75 text-blue-950 sticky top-0 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">APAAR ID</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Validation Findings &amp; Errors</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {validationSummary.summaries.map((s: any, idx: number) => (
                  <tr key={s.recordId} className={s.isValid ? 'hover:bg-blue-50/30' : 'bg-rose-50/40'}>
                    <td className="p-3 text-slate-500 font-mono">{idx + 1}</td>
                    <td className="p-3 font-mono font-medium text-slate-900">{s.apaarId}</td>
                    <td className="p-3 font-semibold text-slate-900">{s.studentName}</td>
                    <td className="p-3">
                      {s.isValid ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Passed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-700 font-semibold">
                          <XCircle className="w-3.5 h-3.5" />
                          Failed
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      {s.errors.length === 0 ? (
                        <span className="text-slate-500">All checks satisfied.</span>
                      ) : (
                        <div className="space-y-1">
                          {s.errors.map((err: any, errIdx: number) => (
                            <div
                              key={errIdx}
                              className="text-xs text-rose-700 flex items-start gap-1"
                            >
                              <span className="font-mono text-[10px] bg-rose-100 text-rose-800 px-1 py-0.5 rounded shrink-0">
                                {err.ruleId}
                              </span>
                              <span>{err.message}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-200">
            <button
              onClick={() => setStep('MAPPING')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium"
            >
              Modify Mapping
            </button>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">
                Batch will be staged as <strong className="text-slate-800">PENDING_APPROVAL</strong> for institutional signatory.
              </span>
              <button
                onClick={handleCommitBatch}
                disabled={isCommitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20"
              >
                {isCommitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Committing Batch...
                  </>
                ) : (
                  <>
                    Commit Batch to Repository
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: Committed Confirmation */}
      {step === 'COMMITTED' && (
        <div className="bg-white border border-emerald-300 rounded-2xl p-8 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Batch Submission Successfully Committed
          </h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            Records have been staged in the central student repository and appended to the forward-linked SHA-256 audit chain. Institutional Signatory has been alerted for approval.
          </p>
          <div className="pt-4 flex justify-center gap-3">
            <button
              onClick={() => setStep('UPLOAD')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
            >
              Upload Another Batch
            </button>
            <button
              onClick={() => onSuccess('students')}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm"
            >
              View in Student Directory
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
