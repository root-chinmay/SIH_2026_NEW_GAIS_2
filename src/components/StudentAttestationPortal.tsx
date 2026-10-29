import React, { useState, useEffect, useRef } from 'react';
import {
  GraduationCap,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Building,
  QrCode,
  Download,
  Printer,
  ShieldCheck,
  Send,
  XCircle,
} from 'lucide-react';
import QRCode from 'qrcode';
import { store } from '../services/store';
import { StudentAttestation } from '../types';

export const StudentAttestationPortal: React.FC = () => {
  const state = store.getState();
  const currentStudentId = state.currentUser.studentId || 'STU-DEL-001';
  const student = state.students.find((s) => s.id === currentStudentId) || state.students[0];
  const institution = state.institutions.find((i) => i.id === student.institutionId);
  const programme = institution?.programmes.find((p) => p.id === student.programmeId);

  const [attestation, setAttestation] = useState<StudentAttestation | undefined>(() =>
    state.attestations.find((a) => a.apaarId === student.apaarId)
  );

  const [disputeText, setDisputeText] = useState('');
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  useEffect(() => {
    // Generate QR code for synthetic admission receipt
    const qrPayload = JSON.stringify({
      ref: `RCPT-2026-${student.apaarId.replace('APAAR-DEMO-', '')}`,
      apaar: student.apaarId,
      inst: student.institutionId,
      status: student.admissionStatus,
      hash: student.matchingToken,
    });

    QRCode.toDataURL(qrPayload, { width: 180, margin: 1 })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR error', err));
  }, [student]);

  const handleConfirm = () => {
    const attId = attestation?.id || `ATT-${Date.now().toString().slice(-4)}`;
    store.submitStudentAttestation(attId, 'CONFIRM', 'Student verified admission data as accurate.');
    setAttestation(state.attestations.find((a) => a.apaarId === student.apaarId));
    alert('Thank you! Your admission details have been verified and sealed in the regulatory record.');
  };

  const handleDisputeSubmit = () => {
    if (!disputeText.trim()) return;
    const attId = attestation?.id || `ATT-${Date.now().toString().slice(-4)}`;
    store.submitStudentAttestation(attId, 'DISPUTE', disputeText.trim());
    setShowDisputeModal(false);
    setAttestation(state.attestations.find((a) => a.apaarId === student.apaarId));
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700/60">
              Student-in-the-Loop Architecture
            </span>
            <span className="text-[11px] font-mono text-teal-400 bg-teal-950/60 px-2 py-0.5 rounded border border-teal-800/60">
              Direct Attestation
            </span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-emerald-400" />
            Student Academic Workspace &amp; Attestation
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review the enrolment data officially reported by your institution, verify claims, confirm accuracy, or raise an investigated dispute.
          </p>
        </div>

        <button
          onClick={() => setShowReceiptModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-600/30 shrink-0"
        >
          <QrCode className="w-4 h-4" />
          View Verifiable Receipt
        </button>
      </div>

      {/* Main Student Profile & Attestation Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-start justify-between pb-4 border-b border-slate-800">
            <div>
              <div className="text-xs text-slate-400">Authenticated Student Identity:</div>
              <h2 className="text-2xl font-extrabold text-white mt-0.5">{student.name}</h2>
              <div className="text-xs font-mono text-teal-400 mt-1">
                APAAR ID: <strong>{student.apaarId}</strong> &bull; Roll: {student.institutionalStudentId}
              </div>
            </div>

            <span
              className={`text-xs px-2.5 py-1 rounded-lg font-bold ${
                student.admissionStatus === 'Admission Confirmed'
                  ? 'bg-blue-950 text-blue-300 border border-blue-800'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              {student.admissionStatus}
            </span>
          </div>

          {/* Enrolment Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[11px] block">Reporting Institution:</span>
              <span className="text-sm font-semibold text-white mt-1 block">
                {institution?.name || student.institutionId}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                {institution?.district}, {institution?.state}
              </span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[11px] block">Approved Programme:</span>
              <span className="text-sm font-semibold text-white mt-1 block">
                {programme?.name || student.programmeId}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Session: {student.academicYear} &bull; Category: {student.admissionCategory}
              </span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[11px] block">Admission Valid Date:</span>
              <span className="text-sm font-semibold text-slate-200 mt-1 block font-mono">
                {student.admissionDate}
              </span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[11px] block">Corroborated Fee Receipt:</span>
              <span className="text-sm font-semibold text-teal-300 mt-1 block font-mono">
                {student.corroborationSignals?.feeReceiptReference || 'Institutional System Verified'}
              </span>
            </div>
          </div>

          {/* Attestation Action Box (Section 21) */}
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Student Attestation Status</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Confirm your admission details or trigger an investigated discrepancy.
                </p>
              </div>

              {attestation?.status === 'CONFIRMED' ? (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Confirmed by You
                </span>
              ) : attestation?.status === 'DISPUTED' ? (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 bg-rose-950 px-2.5 py-1 rounded-lg border border-rose-800">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Disputed by You
                </span>
              ) : (
                <span className="text-xs text-amber-400 font-semibold bg-amber-950 px-2.5 py-1 rounded-lg border border-amber-800">
                  Awaiting Response
                </span>
              )}
            </div>

            {attestation?.studentRemarks && (
              <div className="text-xs p-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                <strong>Your recorded statement:</strong> "{attestation.studentRemarks}"
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleConfirm}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30"
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirm These Details Look Correct
              </button>

              <button
                onClick={() => setShowDisputeModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-rose-300 border border-rose-800/60 rounded-xl text-xs font-semibold"
              >
                <XCircle className="w-4 h-4 text-rose-400" />
                I Do Not Recognize This Admission (Dispute)
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Mini Verifiable Receipt Preview */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center text-center space-y-4">
          <div className="text-xs uppercase font-bold text-slate-400 tracking-wider">
            Synthetic Admission Receipt
          </div>

          {qrDataUrl && (
            <div className="bg-white p-3 rounded-xl shadow-md">
              <img src={qrDataUrl} alt="Admission Receipt QR" className="w-36 h-36" />
            </div>
          )}

          <div className="space-y-1 text-xs">
            <div className="font-mono font-bold text-white">
              RCPT-2026-{student.apaarId.replace('APAAR-DEMO-', '')}
            </div>
            <div className="text-slate-400 text-[11px]">
              AICTE Digital Verification Mesh
            </div>
            <div className="text-[10px] text-teal-400 font-mono mt-1">
              SHA-256 Digest Active
            </div>
          </div>

          <button
            onClick={() => setShowReceiptModal(true)}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg"
          >
            Open Printable Receipt
          </button>
        </div>
      </div>

      {/* Dispute Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-800/80 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <AlertTriangle className="w-5 h-5" />
              Report Discrepancy or False Admission
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Submitting a dispute will create an investigation case at AICTE. The institution will be formally requested to provide signed counseling acceptance or fee reconciliation.
            </p>

            <textarea
              value={disputeText}
              onChange={(e) => setDisputeText(e.target.value)}
              placeholder="State your reason (e.g. I never enrolled at this institution or I accepted admission elsewhere)..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-white h-24 focus:outline-none focus:border-rose-500"
            />

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowDisputeModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleDisputeSubmit}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold"
              >
                Submit Formal Dispute
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Verifiable Receipt Modal (Section 22) */}
      {showReceiptModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 print:p-0 print:bg-white">
          <div className="bg-white text-slate-900 rounded-2xl max-w-xl w-full p-8 shadow-2xl space-y-6 relative border-4 border-slate-200 print:border-none print:shadow-none">
            {/* Close button (hidden in print) */}
            <button
              onClick={() => setShowReceiptModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 text-xl font-bold print:hidden"
            >
              &times;
            </button>

            {/* Receipt Header */}
            <div className="text-center pb-4 border-b-2 border-slate-200">
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                AICTE &bull; Ministry of Education Academic Verification
              </div>
              <h2 className="text-xl font-black tracking-tight text-slate-900 mt-1">
                SYNTHETIC ADMISSION RECEIPT
              </h2>
              <div className="text-xs font-mono text-slate-600 mt-0.5">
                Ref: RCPT-2026-{student.apaarId.replace('APAAR-DEMO-', '')}
              </div>
            </div>

            {/* Student Claims Matrix */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Student Name:</span>
                <span className="font-bold text-slate-900 text-sm">{student.name}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Synthetic APAAR ID:</span>
                <span className="font-mono font-bold text-slate-900">{student.apaarId}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Institution:</span>
                <span className="font-semibold text-slate-800">{institution?.name}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Programme:</span>
                <span className="font-semibold text-slate-800">{programme?.name}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Admission Date:</span>
                <span className="font-mono font-semibold">{student.admissionDate}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Enrolment Status:</span>
                <span className="font-bold text-emerald-700">{student.admissionStatus}</span>
              </div>
            </div>

            {/* QR & Security Checksum */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="space-y-1 text-xs">
                <div className="font-bold text-slate-800">Verifiable Academic Seal</div>
                <div className="text-[11px] text-slate-500">
                  Scannable via Authorized Verifier Portal.
                </div>
                <div className="text-[10px] font-mono text-slate-600 mt-1">
                  SHA-256 Digest: {student.matchingToken}
                </div>
              </div>
              {qrDataUrl && (
                <img src={qrDataUrl} alt="Verifiable QR Code" className="w-24 h-24" />
              )}
            </div>

            {/* Disclaimer */}
            <div className="text-[10px] text-slate-500 text-center leading-relaxed">
              SIH PROTOTYPE ARTIFACT — Independent demonstration using synthetic data. Not an official government credential.
            </div>

            {/* Print Action Bar (Hidden in print) */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 print:hidden">
              <button
                onClick={() => setShowReceiptModal(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold"
              >
                Close
              </button>
              <button
                onClick={handlePrintReceipt}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold"
              >
                <Printer className="w-4 h-4" />
                Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
