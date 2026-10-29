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
        student_name: 'Arjun Singhal',
        date_of_birth: '2004-11-19',
        gender: 'Male',
        admission_date: '2026-08-02',
        admission_category: 'NRI',
        is_supernumerary: 'true',
        supernumerary_type: 'NRI',
      },
      {
        // Intentional batch-level duplicate to showcase validation engine
        apaar_id: 'APAAR-DEMO-0202',
        institutional_student_id: 'DTU/2026/CSE/204',
        student_name: 'Duplicate Entry Test',
        date_of_birth: '2005-07-22',
        gender: 'Female',
        admission_date: '2026-08-02',
        admission_category: 'General',
        is_supernumerary: 'false',
        supernumerary_type: '',
      },
    ];

    setFileName('sample_admissions_batch_dtu.csv');
    setFileSize('1.4 KB');
    setRawRows(sampleCSV);
    setHeaders(Object.keys(sampleCSV[0]));
    setStep('MAPPING');
  };

  // Parse actual uploaded CSV
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setFileName(selected.name);
      setFileSize(`${(selected.size / 1024).toFixed(1)} KB`);

      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        parseCSVText(text);
      };
      reader.readAsText(selected);
    }
  };

  const parseCSVText = (text: string) => {
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
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <UploadCloud className="w-6 h-6 text-blue-400" />
            Student Enrolment Batch Submission
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Upload institutional student cohorts, normalize field schemas, and execute 7-stage APAAR validation before final signatory sign-off.
          </p>
        </div>

        <button
          onClick={handleDownloadTemplate}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0"
        >
          <Download className="w-4 h-4 text-teal-400" />
          Download CSV Template
        </button>
      </div>

      {/* Programme & Academic Year Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/60 border border-slate-800 p-4 rounded-xl">
        <div>
          <label className="text-xs font-medium text-slate-300 block mb-1">
            Target Programme:
          </label>
          <select
            value={selectedProgrammeId}
            onChange={(e) => setSelectedProgrammeId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            {institution.programmes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.code}) — Approved Intake: {p.approvedIntake}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-300 block mb-1">
            Academic Session / Year:
          </label>
          <input
            type="text"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
            placeholder="2026-2027"
          />
        </div>
      </div>

      {/* STEP 1: Upload Dropzone */}
      {step === 'UPLOAD' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-6">
          <div className="border-2 border-dashed border-slate-700 hover:border-blue-500/80 rounded-2xl p-10 transition-colors flex flex-col items-center justify-center cursor-pointer relative bg-slate-950/40">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="w-16 h-16 rounded-2xl bg-blue-900/40 text-blue-400 flex items-center justify-center mb-4">
              <FileSpreadsheet className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-white">
              Drag &amp; drop student CSV file here
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Supports CSV with UTF-8 encoding up to 10MB per batch
            </p>
            <div className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold">
              Browse Files
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <span className="text-xs text-slate-500">— or test with pre-built dataset —</span>
            <button
              onClick={handleLoadSampleCSV}
              className="text-xs font-semibold text-teal-400 hover:text-teal-300 underline"
            >
              Load Sample DTU Batch (Includes Intentional Edge Cases)
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Column Mapping */}
      {step === 'MAPPING' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-indigo-400" />
                Schema Normalization &amp; Column Mapping
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                File: <strong className="text-slate-200">{fileName}</strong> ({fileSize}, {rawRows.length} rows detected)
              </p>
            </div>

            <button
              onClick={() => setStep('UPLOAD')}
              className="text-xs text-slate-400 hover:text-white"
            >
              Change File
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(columnMapping).map(([canonicalKey, mappedHeader]) => (
              <div key={canonicalKey} className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <label className="text-[11px] font-semibold text-blue-300 block mb-1">
                  {canonicalKey}
                </label>
                <select
                  value={mappedHeader}
                  onChange={(e) =>
                    setColumnMapping({ ...columnMapping, [canonicalKey]: e.target.value })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
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

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              onClick={() => setStep('UPLOAD')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
            >
              Back
            </button>
            <button
              onClick={handleRunValidation}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md"
            >
              Run 7-Stage Validation Engine
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Pre-Commit Validation Results Preview */}
      {step === 'VALIDATION_PREVIEW' && validationSummary && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-teal-400" />
                Pre-Commit Validation Results
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Evaluated against statutory rules: Capacity ({selectedProgramme.approvedIntake}), format, duplicate index.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-800 px-2.5 py-1 rounded-lg font-semibold">
                {validationSummary.validCount} Valid
              </span>
              <span className="text-xs bg-rose-950 text-rose-300 border border-rose-800 px-2.5 py-1 rounded-lg font-semibold">
                {validationSummary.invalidCount} Errors
              </span>
            </div>
          </div>

          {/* Row Level Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800 max-h-96 overflow-y-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 sticky top-0">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">APAAR ID</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Validation Findings &amp; Errors</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {validationSummary.summaries.map((s: any, idx: number) => (
                  <tr key={s.recordId} className={s.isValid ? 'hover:bg-slate-800/40' : 'bg-rose-950/20'}>
                    <td className="p-3 text-slate-500 font-mono">{idx + 1}</td>
                    <td className="p-3 font-mono font-medium text-white">{s.apaarId}</td>
                    <td className="p-3">{s.studentName}</td>
                    <td className="p-3">
                      {s.isValid ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Passed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-400 font-semibold">
                          <XCircle className="w-3.5 h-3.5" />
                          Failed
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      {s.errors.length === 0 ? (
                        <span className="text-slate-400">All checks satisfied.</span>
                      ) : (
                        <div className="space-y-1">
                          {s.errors.map((err: any, errIdx: number) => (
                            <div
                              key={errIdx}
                              className="text-xs text-rose-300 flex items-start gap-1"
                            >
                              <span className="font-mono text-[10px] bg-rose-900/60 px-1 rounded shrink-0">
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

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-800">
            <button
              onClick={() => setStep('MAPPING')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
            >
              Modify Mapping
            </button>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">
                Batch will be staged as <strong>PENDING_APPROVAL</strong> for institutional signatory.
              </span>
              <button
                onClick={handleCommitBatch}
                disabled={isCommitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30"
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
        <div className="bg-slate-900 border border-teal-800/80 rounded-2xl p-8 text-center space-y-4 shadow-xl">
          <div className="w-14 h-14 rounded-full bg-teal-900/50 text-teal-400 flex items-center justify-center mx-auto border border-teal-500/40">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-white">
            Batch Submission Successfully Committed
          </h2>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            Records have been staged in the central student repository and appended to the forward-linked SHA-256 audit chain. Institutional Signatory has been alerted for approval.
          </p>
          <div className="pt-4 flex justify-center gap-3">
            <button
              onClick={() => setStep('UPLOAD')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium"
            >
              Upload Another Batch
            </button>
            <button
              onClick={() => onSuccess('students')}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
            >
              View in Student Directory
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
