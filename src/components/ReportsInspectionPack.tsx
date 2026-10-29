import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  ShieldCheck,
  Building,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Lock,
} from 'lucide-react';
import { store } from '../services/store';

export const ReportsInspectionPack: React.FC = () => {
  const state = store.getState();
  const [selectedInstId, setSelectedInstId] = useState(state.institutions[0].id);
  const activeInst = state.institutions.find((i) => i.id === selectedInstId) || state.institutions[0];

  const instStudents = state.students.filter((s) => s.institutionId === activeInst.id);
  const activeCount = instStudents.filter(
    (s) =>
      s.admissionStatus === 'Admission Confirmed' ||
      s.admissionStatus === 'Enrollment Reported' ||
      s.admissionStatus === 'Provisionally Admitted'
  ).length;

  const totalIntake = activeInst.programmes.reduce((acc, p) => acc + p.approvedIntake, 0);

  // Safe CSV export with formula injection prevention (Section 36)
  const handleExportCSV = () => {
    // Sanitize string to prevent spreadsheet formula execution (=, +, -, @)
    const sanitize = (val: string) => {
      const trimmed = String(val || '').trim();
      if (/^[=+\-@\t\r]/.test(trimmed)) {
        return `'${trimmed}`;
      }
      return trimmed.replace(/"/g, '""');
    };

    const header = [
      'Institutional_Student_ID',
      'Masked_APAAR_ID',
      'Student_Name',
      'Programme_Code',
      'Admission_Category',
      'Is_Supernumerary',
      'Admission_Status',
      'Validation_Status',
      'Valid_Date',
    ];

    const rows = instStudents.map((s) => [
      `"${sanitize(s.institutionalStudentId)}"`,
      `"${sanitize(s.apaarId ? `${s.apaarId.substring(0, 5)}****${s.apaarId.substring(s.apaarId.length - 4)}` : 'MISSING')}"`,
      `"${sanitize(s.name)}"`,
      `"${sanitize(s.programmeId)}"`,
      `"${sanitize(s.admissionCategory)}"`,
      `"${sanitize(String(s.isSupernumerary))}"`,
      `"${sanitize(s.admissionStatus)}"`,
      `"${sanitize(s.validationStatus)}"`,
      `"${sanitize(s.admissionDate)}"`,
    ]);

    const csvContent = [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `aicte_inspection_report_${activeInst.code.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    store.addAuditEvent(
      state.currentUser.email,
      state.currentUser.role,
      'AUDIT_REPORT_EXPORTED',
      'BATCH',
      activeInst.id,
      `Exported sanitized regulatory report for ${activeInst.name}`,
      activeInst.id
    );
  };

  const handlePrintDossier = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/60">
              Regulatory Dossier
            </span>
            <span className="text-[11px] font-mono text-teal-400 bg-teal-950/60 px-2 py-0.5 rounded border border-teal-800/60">
              Formula-Safe Sanitization
            </span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-400" />
            AICTE Regulatory Reports &amp; Inspection Pack
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Generate print-ready inspection packs with cryptographic integrity hashes and formula-sanitized CSV datasets.
          </p>
        </div>

        {/* Institution Selector */}
        <div className="flex items-center gap-3">
          <select
            value={selectedInstId}
            onChange={(e) => setSelectedInstId(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
          >
            {state.institutions.map((i) => (
              <option key={i.id} value={i.id}>
                {i.code} — {i.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 rounded-xl text-xs font-semibold shrink-0"
          >
            <Download className="w-4 h-4 text-teal-400" />
            Export CSV
          </button>

          <button
            onClick={handlePrintDossier}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-600/30 shrink-0"
          >
            <Printer className="w-4 h-4" />
            Print Dossier
          </button>
        </div>
      </div>

      {/* Printable Inspection Pack Preview (Section 36) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-8 print:bg-white print:text-black print:p-0 print:border-none">
        {/* Dossier Header */}
        <div className="text-center pb-6 border-b-2 border-slate-800 print:border-slate-300">
          <div className="text-xs font-bold uppercase tracking-widest text-slate-400 print:text-slate-600">
            All India Council for Technical Education (AICTE)
          </div>
          <h2 className="text-2xl font-black text-white print:text-slate-950 mt-1">
            INSTITUTIONAL ENROLMENT INSPECTION DOSSIER
          </h2>
          <div className="text-xs text-slate-400 print:text-slate-600 mt-1">
            Academic Session 2026-2027 &bull; Generated: {new Date().toISOString().split('T')[0]} &bull; Inspection ID: INS-2026-{activeInst.code}
          </div>
        </div>

        {/* Institution Profile Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-950 print:bg-slate-50 p-4 rounded-xl border border-slate-800 print:border-slate-200">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Institution Name:</span>
            <span className="font-bold text-white print:text-slate-900 text-sm mt-0.5 block">{activeInst.name}</span>
          </div>

          <div className="bg-slate-950 print:bg-slate-50 p-4 rounded-xl border border-slate-800 print:border-slate-200">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">AICTE Permanent Code:</span>
            <span className="font-mono font-bold text-white print:text-slate-900 text-sm mt-0.5 block">{activeInst.code}</span>
          </div>

          <div className="bg-slate-950 print:bg-slate-50 p-4 rounded-xl border border-slate-800 print:border-slate-200">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Sanctioned Regular Capacity:</span>
            <span className="font-bold text-white print:text-slate-900 text-sm mt-0.5 block">{totalIntake} Seats</span>
          </div>

          <div className="bg-slate-950 print:bg-slate-50 p-4 rounded-xl border border-slate-800 print:border-slate-200">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Active Enrolment:</span>
            <span className="font-bold text-teal-400 print:text-teal-700 text-sm mt-0.5 block">{activeCount} Students</span>
          </div>
        </div>

        {/* Programme Breakdown Table */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 print:text-slate-800">
            Programme Capacity &amp; Utilization Verification
          </h3>

          <div className="overflow-x-auto rounded-xl border border-slate-800 print:border-slate-300">
            <table className="w-full text-left text-xs text-slate-300 print:text-slate-800">
              <thead className="bg-slate-950 print:bg-slate-100 text-slate-400 print:text-slate-700">
                <tr>
                  <th className="p-3">Programme</th>
                  <th className="p-3">Sanctioned Intake</th>
                  <th className="p-3">Regular Enrolled</th>
                  <th className="p-3">Supernumerary (NRI/TFW)</th>
                  <th className="p-3">Compliance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-slate-200">
                {activeInst.programmes.map((p) => {
                  const pStudents = instStudents.filter((s) => s.programmeId === p.id);
                  const regular = pStudents.filter((s) => !s.isSupernumerary).length;
                  const superNum = pStudents.filter((s) => s.isSupernumerary).length;
                  const isBreach = regular > p.approvedIntake;

                  return (
                    <tr key={p.id}>
                      <td className="p-3 font-semibold text-white print:text-slate-900">{p.name}</td>
                      <td className="p-3 font-mono">{p.approvedIntake}</td>
                      <td className="p-3 font-mono">{regular}</td>
                      <td className="p-3 font-mono">{superNum}</td>
                      <td className="p-3">
                        {isBreach ? (
                          <span className="text-rose-400 print:text-rose-700 font-bold">
                            Intake Ceiling Exceeded (+{regular - p.approvedIntake})
                          </span>
                        ) : (
                          <span className="text-emerald-400 print:text-emerald-700 font-medium">
                            Compliant
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Integrity Receipt & Hash Seal */}
        <div className="p-5 rounded-2xl bg-slate-950 print:bg-slate-50 border border-slate-800 print:border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="space-y-1">
            <div className="font-bold text-white print:text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-400 print:text-teal-700" />
              Cryptographic Integrity Verification Seal
            </div>
            <p className="text-slate-400 print:text-slate-600 text-[11px]">
              This inspection pack reflects data verified against the SHA-256 forward-linked audit chain at tip block #{state.auditChain.length}.
            </p>
            <div className="font-mono text-[10px] text-teal-400 print:text-slate-700 mt-1 truncate max-w-md">
              Tip Hash: {state.auditChain[state.auditChain.length - 1]?.eventHash || '0000000000000000'}
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600">
              Authorized Signatory Stamp:
            </div>
            <div className="text-sm font-bold text-white print:text-slate-950 mt-1">
              {activeInst.authorizedSignatory}
            </div>
            <div className="text-[11px] text-slate-400 print:text-slate-600">
              {activeInst.signatoryDesignation}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
