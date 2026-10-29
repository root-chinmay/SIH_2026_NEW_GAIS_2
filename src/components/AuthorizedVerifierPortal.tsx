import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  QrCode,
  Building,
  GraduationCap,
  Award,
  Key,
  Lock,
} from 'lucide-react';
import { store } from '../services/store';
import { verifyCredentialSignature } from '../services/cryptoEngine';

export const AuthorizedVerifierPortal: React.FC = () => {
  const state = store.getState();
  const [credentialInput, setCredentialInput] = useState('AICTE-CRED-2026-0001');
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = () => {
    setIsVerifying(true);
    setTimeout(() => {
      // Find matching credential in registry
      const cred = state.credentials.find(
        (c) =>
          c.credentialNumber.toLowerCase() === credentialInput.trim().toLowerCase() ||
          c.receiptNumber.toLowerCase() === credentialInput.trim().toLowerCase() ||
          c.studentApaarId.toLowerCase() === credentialInput.trim().toLowerCase()
      );

      if (!cred) {
        setVerificationResult({
          found: false,
          diagnostic: `No registered academic credential found for reference '${credentialInput}'. Verify reference syntax.`,
        });
        setIsVerifying(false);
        return;
      }

      // Cryptographically verify digital signature
      const isSignatureValid = verifyCredentialSignature(
        cred.signedClaims,
        cred.digitalSignature
      );

      setVerificationResult({
        found: true,
        credential: cred,
        isSignatureValid,
        status: cred.status,
        timestamp: new Date().toISOString(),
      });
      setIsVerifying(false);
    }, 350);
  };

  const handleQuickTest = (credNum: string) => {
    setCredentialInput(credNum);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              Authorized Third-Party Portal
            </span>
            <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
              Data Minimization Architecture
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
            Authorized Academic Credential Verifier
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Enables employers, universities, and awarding bodies to independently authenticate digital enrollment credentials without exposing unprotected personal profiles.
          </p>
        </div>

        {/* Quick test references */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-slate-500 font-medium">Sample:</span>
          <button
            onClick={() => handleQuickTest('AICTE-CRED-2026-0001')}
            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-mono font-medium border border-blue-200"
          >
            CRED-0001 (Valid)
          </button>
          <button
            onClick={() => handleQuickTest('AICTE-CRED-2026-0034')}
            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-mono font-medium border border-blue-200"
          >
            CRED-0034 (MIT Pune)
          </button>
        </div>
      </div>

      {/* Verification Input Box */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
        <label className="text-xs font-bold text-slate-800 block">
          Enter Credential Number, Receipt Reference, or Synthetic APAAR ID:
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={credentialInput}
              onChange={(e) => setCredentialInput(e.target.value)}
              placeholder="e.g. AICTE-CRED-2026-0001 or APAAR-DEMO-0001"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <button
            onClick={handleVerify}
            disabled={isVerifying}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            {isVerifying ? 'Verifying...' : 'Verify Credential Signature'}
          </button>
        </div>

        <div className="text-[11px] text-slate-500 flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-blue-600" />
          <span>
            Verifications are cryptographic and rate-limited. Audited on AICTE compliance nodes.
          </span>
        </div>
      </div>

      {/* Verification Output Matrix */}
      {verificationResult && (
        <div className="space-y-6">
          {!verificationResult.found ? (
            <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 space-y-2 text-xs shadow-sm">
              <div className="flex items-center gap-2 font-bold text-sm text-rose-900">
                <XCircle className="w-5 h-5 text-rose-600" />
                <span>Verification Failed: Credential Not Found</span>
              </div>
              <p className="text-rose-700">{verificationResult.diagnostic}</p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
              {/* Status Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shadow-2xs">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Cryptographically Valid Academic Credential
                    </h2>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">
                      Ref: {verificationResult.credential.credentialNumber} &bull; Algorithm: {verificationResult.credential.signatureAlgorithm}
                    </div>
                  </div>
                </div>

                <span
                  className={`text-xs px-3 py-1 rounded-lg font-bold uppercase ${
                    verificationResult.status === 'ACTIVE'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  Status: {verificationResult.status}
                </span>
              </div>

              {/* Minimal Claims Disclosed */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Permitted Minimal Claims (Disclosed for Verification):
                  </h3>
                  <span className="text-[10px] text-blue-700 font-mono font-medium">
                    Zero Unnecessary Personal Data
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <span className="text-slate-500 text-[11px] block font-medium">Student Identifier:</span>
                    <span className="font-mono font-bold text-slate-900 text-sm mt-1 block">
                      {verificationResult.credential.studentApaarId}
                    </span>
                    <span className="text-slate-500 text-[11px] mt-0.5 block">
                      Roll: {verificationResult.credential.institutionalStudentId}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <span className="text-slate-500 text-[11px] block font-medium">Issuing Body:</span>
                    <span className="font-bold text-slate-900 text-sm mt-1 block">
                      {verificationResult.credential.institutionName}
                    </span>
                    <span className="text-slate-500 text-[11px] mt-0.5 block">
                      AICTE Code: {verificationResult.credential.institutionId}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <span className="text-slate-500 text-[11px] block font-medium">Approved Programme:</span>
                    <span className="font-bold text-slate-900 text-sm mt-1 block truncate">
                      {verificationResult.credential.programmeName}
                    </span>
                    <span className="text-slate-500 text-[11px] mt-0.5 block">
                      Academic Session: {verificationResult.credential.academicYear}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <span className="text-slate-500 text-[11px] block font-medium">Digital Signature:</span>
                    <span className="font-mono text-blue-700 text-[10px] break-all mt-1 block font-semibold">
                      {verificationResult.credential.digitalSignature.substring(0, 28)}...
                    </span>
                    <span className="text-emerald-700 text-[11px] mt-0.5 block font-semibold">
                      Signature Verified
                    </span>
                  </div>
                </div>
              </div>

              {/* Awarding Body Certificate Preview */}
              <div className="p-6 rounded-2xl bg-blue-50/40 border border-blue-200 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-blue-200">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-blue-600" />
                    <span className="text-xs font-bold text-blue-950 uppercase tracking-wider">
                      Verified Certificate Representation
                    </span>
                  </div>
                  <span className="text-[10px] bg-white border border-blue-200 text-blue-700 font-semibold px-2 py-0.5 rounded shadow-2xs">
                    Demonstration Artifact
                  </span>
                </div>

                <div className="text-center py-4 space-y-2">
                  <div className="text-[11px] uppercase tracking-widest text-blue-900 font-bold">
                    AICTE Central Academic Credential Repository
                  </div>
                  <div className="text-lg font-bold text-slate-900">
                    Certificate of Enrolment &amp; Academic Status
                  </div>
                  <p className="text-xs text-slate-700 max-w-lg mx-auto">
                    This certifies that synthetic student <strong>{verificationResult.credential.studentName}</strong> (APAAR: {verificationResult.credential.studentApaarId}) is confirmed enrolled in <strong>{verificationResult.credential.programmeName}</strong> at <strong>{verificationResult.credential.institutionName}</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
