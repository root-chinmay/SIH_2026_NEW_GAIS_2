import React, { useState } from 'react';
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Download,
  Building,
  Layers,
  ArrowRight,
  ShieldCheck,
  X,
} from 'lucide-react';
import { store } from '../services/store';
import { SubmissionBatch } from '../types';

export const BatchSignatoryReview: React.FC = () => {
  const state = store.getState();
  const currentInstId = state.currentUser.institutionId || 'INST-DEL-01';
  const isSignatory =
    state.currentUser.role === 'INSTITUTION_SIGNATORY' ||
    state.currentUser.role === 'INSTITUTION_ADMIN' ||
    state.currentUser.role === 'AICTE_ADMIN';

  const [selectedBatch, setSelectedBatch] = useState<SubmissionBatch | null>(null);
  const [signatoryComments, setSignatoryComments] = useState(
    'Certified compliance with APH 2026-27 admission guidelines.'
  );
  const [rejectionReason, setRejectionReason] = useState(
    'Intake capacity limit exceeded for regular seats without supernumerary reclassification.'
  );
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Filter batches for user's institution (or all if AICTE)
  const batches = state.batches.filter((b) => {
    if (state.currentUser.role === 'AICTE_ADMIN' || state.currentUser.role === 'AICTE_AUDITOR') return true;
    return b.institutionId === currentInstId;
  });

  const handleOpenAction = (batch: SubmissionBatch, type: 'APPROVE' | 'REJECT') => {
    setSelectedBatch(batch);
    setActionType(type);
    setShowConfirmModal(true);
  };

  const handleExecuteDecision = () => {
    if (!selectedBatch) return;
    if (actionType === 'APPROVE') {
      store.approveBatch(selectedBatch.id, signatoryComments);
    } else {
      store.rejectBatch(selectedBatch.id, rejectionReason);
    }
    setShowConfirmModal(false);
    setSelectedBatch(null);
  };

  const handleDownloadBatchReport = (batch: SubmissionBatch) => {
    const csvRows = [
      ['Student_ID', 'Synthetic_APAAR_ID', 'Name', 'Programme', 'Category', 'Status'],
      ...(batch.records || []).map((r) => [
        r.institutionalStudentId,
        r.apaarId,
        r.name,
        r.programmeId,
        r.admissionCategory,
        r.validationStatus,
      ]),
    ];
    const csvContent = csvRows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `batch_validation_report_${batch.batchNumber.replace(/[\/\\]/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
              Regulatory Gate
            </span>
            <span className="text-[11px] font-mono text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 font-semibold">
              Statutory Sign-Off
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-blue-600" />
            Batch Certification &amp; Signatory Workflow
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Authorizes official submission batches. A batch must receive signatory approval before its records are committed to the central verified repository.
          </p>
        </div>

        <div className="text-right text-xs">
          <span className="text-slate-500">Signatory Role: </span>
          <span className={`font-semibold ${isSignatory ? 'text-teal-700' : 'text-amber-700'}`}>
            {isSignatory ? 'Authorized to Certify' : 'Read-Only Operator Mode'}
          </span>
        </div>
      </div>

      {/* Batches Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">
            Submission Batches Awaiting Signatory Review ({batches.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-blue-50/70 text-blue-950 font-semibold border-b border-blue-100">
              <tr>
                <th className="p-3.5">Batch Reference</th>
                <th className="p-3.5">Institution &amp; Programme</th>
                <th className="p-3.5">Records Breakdown</th>
                <th className="p-3.5">Submission Status</th>
                <th className="p-3.5 text-right">Signatory Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {batches.map((batch) => {
                const inst = state.institutions.find((i) => i.id === batch.institutionId);
                const isPending = batch.status === 'PENDING_APPROVAL';

                return (
                  <tr key={batch.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-3.5">
                      <div className="font-mono font-bold text-slate-900">{batch.batchNumber}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Uploaded by: {batch.uploadedBy} on {batch.uploadedAt.split('T')[0]}
                      </div>
                    </td>

                    <td className="p-3.5">
                      <div className="text-slate-900 font-medium">{inst?.name || batch.institutionId}</div>
                      <div className="text-slate-500 text-[11px]">{batch.programmeId}</div>
                    </td>

                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-700 font-semibold">
                          {batch.validRecords} Valid
                        </span>
                        <span>&bull;</span>
                        <span className={batch.invalidRecords > 0 ? 'text-rose-600 font-semibold' : 'text-slate-500'}>
                          {batch.invalidRecords} Errors
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Total Cohort: {batch.totalRecords}
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${
                          batch.status === 'APPROVED'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : batch.status === 'REJECTED'
                            ? 'bg-rose-50 text-rose-800 border border-rose-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {batch.status}
                      </span>
                    </td>

                    <td className="p-3.5 text-right space-x-1.5">
                      <button
                        onClick={() => handleDownloadBatchReport(batch)}
                        className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs border border-slate-200 shadow-2xs"
                        title="Download CSV Validation Report"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      {isPending && isSignatory && (
                        <>
                          <button
                            onClick={() => handleOpenAction(batch, 'APPROVE')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                          >
                            Approve Batch
                          </button>
                          <button
                            onClick={() => handleOpenAction(batch, 'REJECT')}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Decision Modal */}
      {showConfirmModal && selectedBatch && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                {actionType === 'APPROVE' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-600" />
                )}
                <span>
                  {actionType === 'APPROVE' ? 'Sign & Approve Batch' : 'Reject Batch Submission'}
                </span>
              </h2>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Batch: <strong>{selectedBatch.batchNumber}</strong> ({selectedBatch.totalRecords} records, {selectedBatch.invalidRecords} exceptions).
            </p>

            {actionType === 'APPROVE' ? (
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Institutional Signatory Certification Statement:
                </label>
                <textarea
                  value={signatoryComments}
                  onChange={(e) => setSignatoryComments(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs text-slate-800 h-24 focus:bg-white focus:border-blue-600"
                />
              </div>
            ) : (
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Reason for Batch Rejection (Sent to Operator):
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs text-slate-800 h-24 focus:bg-white focus:border-blue-600"
                />
              </div>
            )}

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteDecision}
                className={`px-5 py-2 text-white rounded-lg text-xs font-bold shadow-xs ${
                  actionType === 'APPROVE'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                Confirm {actionType === 'APPROVE' ? 'Approval' : 'Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
