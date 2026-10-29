import React from 'react';
import {
  Calendar,
  Building,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  X,
  FileCheck,
} from 'lucide-react';
import { StudentRecord } from '../types';
import { store } from '../services/store';
import { classifyTransferVsDuplicate } from '../services/validationEngine';

interface AdmissionTimelineModalProps {
  apaarId: string;
  studentName: string;
  onClose: () => void;
}

export const AdmissionTimelineModal: React.FC<AdmissionTimelineModalProps> = ({
  apaarId,
  studentName,
  onClose,
}) => {
  const state = store.getState();

  // Find all records matching this synthetic APAAR ID across all institutions
  const relatedRecords = state.students.filter(
    (s) => s.apaarId && s.apaarId.trim().toUpperCase() === apaarId.trim().toUpperCase()
  );

  // Run the Transfer-versus-Duplicate Classifier (Section 26)
  const classification = classifyTransferVsDuplicate(relatedRecords);

  // Sort chronologically
  const sorted = [...relatedRecords].sort(
    (a, b) => new Date(a.admissionDate).getTime() - new Date(b.admissionDate).getTime()
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/50">
                Temporal Identity Engine
              </span>
              <span className="text-xs font-mono text-slate-400">
                APAAR: <strong>{apaarId || 'MISSING_IDENTIFIER'}</strong>
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              Admission Lifecycle Timeline &mdash; {studentName}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Cross-institutional admission sequence reconciliation across all reporting AICTE bodies.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Classifier Decision Banner (Section 26) */}
        <div
          className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            classification.classification === 'Potentially Legitimate Transfer'
              ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
              : classification.classification === 'Potential Overlapping Active Admissions'
              ? 'bg-rose-950/40 border-rose-800/80 text-rose-200'
              : classification.classification === 'Likely Duplicate Submission'
              ? 'bg-amber-950/40 border-amber-800/80 text-amber-200'
              : 'bg-blue-950/40 border-blue-800/80 text-blue-200'
          }`}
        >
          <div>
            <div className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              {classification.classification === 'Potentially Legitimate Transfer' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              )}
              Classification: {classification.classification}
            </div>
            <p className="text-xs mt-1 leading-relaxed opacity-90">
              {classification.explanation}
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[11px] font-mono px-2 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300">
              Deterministic Decision
            </span>
          </div>
        </div>

        {/* Evidence Points */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Corroborated Temporal Evidence:
          </h4>
          <ul className="list-disc list-inside space-y-1 text-xs text-slate-400">
            {classification.evidencePoints.map((pt, idx) => (
              <li key={idx}>{pt}</li>
            ))}
          </ul>
          <div className="pt-2 text-xs text-indigo-400 font-medium">
            Next Action: {classification.recommendation}
          </div>
        </div>

        {/* Visual Timeline of Admissions */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Chronological Admission Records ({sorted.length})
          </h4>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
            {sorted.map((record, index) => {
              const inst = state.institutions.find((i) => i.id === record.institutionId);
              const prog = inst?.programmes.find((p) => p.id === record.programmeId);

              const isActive =
                record.admissionStatus === 'Admission Confirmed' ||
                record.admissionStatus === 'Enrollment Reported' ||
                record.admissionStatus === 'Provisionally Admitted';

              return (
                <div key={record.id} className="relative group">
                  {/* Timeline bullet */}
                  <div
                    className={`absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                      isActive ? 'bg-blue-500' : 'bg-slate-600'
                    }`}
                  />

                  <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="font-semibold text-sm text-white flex items-center gap-2">
                        <Building className="w-4 h-4 text-blue-400" />
                        <span>{inst?.name || record.institutionId}</span>
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-semibold ${
                          isActive
                            ? 'bg-blue-900/60 text-blue-300 border border-blue-700/60'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {record.admissionStatus}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300">
                      Programme: <strong>{prog?.name || record.programmeId}</strong> &bull; Quota: {record.admissionCategory} {record.isSupernumerary && '(Supernumerary)'}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-400 pt-1">
                      <div>
                        Admission Date: <strong className="text-slate-200">{record.admissionDate}</strong>
                      </div>
                      <div>
                        Enrolment Start: <strong className="text-slate-200">{record.enrolmentStartDate}</strong>
                      </div>
                      <div>
                        Withdrawal: <strong className="text-slate-200">{record.withdrawalDate || 'Active'}</strong>
                      </div>
                    </div>

                    {record.corroborationSignals?.feeReceiptReference && (
                      <div className="text-[11px] text-teal-400 flex items-center gap-1.5 pt-1">
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>Fee Receipt: {record.corroborationSignals.feeReceiptReference}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
          >
            Close Timeline
          </button>
        </div>
      </div>
    </div>
  );
};
