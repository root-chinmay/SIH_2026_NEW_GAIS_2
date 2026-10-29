import React, { useState } from 'react';
import {
  Link2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Play,
  RotateCcw,
  ShieldAlert,
  Lock,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { store } from '../services/store';
import {
  verifyAuditChain,
  simulateTampering,
  ChainVerificationResult,
} from '../services/cryptoEngine';

export const AuditChainViewer: React.FC = () => {
  const state = store.getState();
  const auditChain = state.auditChain;

  const [verificationResult, setVerificationResult] = useState<ChainVerificationResult | null>(
    () => verifyAuditChain(auditChain)
  );

  const [isVerifying, setIsVerifying] = useState(false);
  const [tamperingDemoResult, setTamperingDemoResult] = useState<any>(null);

  const handleVerifyChain = () => {
    setIsVerifying(true);
    setTimeout(() => {
      const res = verifyAuditChain(auditChain);
      setVerificationResult(res);
      setIsVerifying(false);
    }, 300);
  };

  const handleRunTamperingSimulation = (targetIdx = 1) => {
    const sim = simulateTampering(auditChain, targetIdx);
    setTamperingDemoResult(sim);
  };

  const handleClearTamperSandbox = () => {
    setTamperingDemoResult(null);
    handleVerifyChain();
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              Cybersecurity Tenet
            </span>
            <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
              SHA-256 Forward-Linked Chain
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-2">
            <Link2 className="w-6 h-6 text-blue-600" />
            Tamper-Evident Cryptographic Audit Chain
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Every administrative batch upload, signatory sign-off, gate query, and student correction is cryptographically sealed with the hash of the preceding block.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleVerifyChain}
            disabled={isVerifying}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm"
          >
            <ShieldAlert className="w-4 h-4" />
            {isVerifying ? 'Verifying Hashes...' : 'Re-Verify Chain'}
          </button>
        </div>
      </div>

      {/* Verification Status Banner */}
      {verificationResult && (
        <div
          className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm ${
            verificationResult.isValid
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
              : 'bg-rose-50/70 border-rose-200 text-rose-950'
          }`}
        >
          <div className="flex items-center gap-3">
            {verificationResult.isValid ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            ) : (
              <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
            )}
            <div>
              <div className="font-bold text-sm text-slate-900">
                {verificationResult.isValid
                  ? 'Audit Chain Intact & Cryptographically Verified'
                  : 'Chain Tamper Alert Detected!'}
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {verificationResult.diagnostic}
              </p>
            </div>
          </div>

          <div className="sm:text-right font-mono text-xs text-slate-500 shrink-0">
            <div>Total Events: <strong className="text-slate-900">{verificationResult.totalEvents}</strong></div>
            <div className="text-[10px] truncate max-w-[200px]">Tip: {verificationResult.latestHash.substring(0, 16)}...</div>
          </div>
        </div>
      )}

      {/* Interactive Tampering Simulation Sandbox */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              Interactive Audit Tampering Demonstration Sandbox
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Simulates an unauthorized backdated modification on an isolated cloned log to demonstrate mathematical detection.
            </p>
          </div>

          {!tamperingDemoResult ? (
            <button
              onClick={() => handleRunTamperingSimulation(1)}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-sm"
            >
              <Play className="w-3.5 h-3.5" />
              Simulate Audit Tampering
            </button>
          ) : (
            <button
              onClick={handleClearTamperSandbox}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Tamper Sandbox
            </button>
          )}
        </div>

        {tamperingDemoResult && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-5 space-y-3 text-xs">
            <div className="flex items-center gap-2 font-bold text-sm text-rose-800">
              <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>Integrity Failure Detected: Modified Log Rejected</span>
            </div>

            <p className="text-slate-700 leading-relaxed">
              Target event <strong>#{tamperingDemoResult.tamperedEvent.sequenceNumber}</strong> ({tamperingDemoResult.tamperedEvent.id}) was silently altered in memory. When the SHA-256 verification utility re-calculated the canonical digest, the resulting hash did not match the forward pointer.
            </p>

            <div className="bg-white p-3 rounded-lg border border-rose-200 font-mono text-[11px] space-y-1">
              <div>
                Diagnostic: <span className="text-rose-700 font-semibold">{tamperingDemoResult.verificationResult.diagnostic}</span>
              </div>
              <div className="text-slate-600">
                Broken Index: Block #{tamperingDemoResult.verificationResult.brokenIndex} &bull; Expected Hash: {tamperingDemoResult.verificationResult.expectedHash?.substring(0, 20)}...
              </div>
            </div>

            <div className="text-[11px] text-slate-500">
              <strong className="text-slate-700">Technical Distinction:</strong> A hash chain provides <em>tamper-evidence</em>. As mandated by AICTE standards, production durability additionally couples hash chains with off-site write-once storage and trusted periodic notary checkpoints.
            </div>
          </div>
        )}
      </div>

      {/* Live Event Blocks Feed */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600" />
          Verified Cryptographic Event Chain ({auditChain.length} Blocks)
        </h2>

        <div className="space-y-3 overflow-y-auto max-h-[600px] pr-1">
          {auditChain.map((evt) => (
            <div
              key={evt.id}
              className="bg-slate-50 p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors space-y-2 text-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900 text-xs bg-white px-2 py-0.5 rounded border border-slate-200">
                    Block #{evt.sequenceNumber}
                  </span>
                  <span className="font-mono text-slate-500">{evt.id}</span>
                  <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[10px] border border-blue-200">
                    {evt.action}
                  </span>
                </div>
                <div className="text-slate-500 font-mono text-[11px]">
                  {evt.timestamp}
                </div>
              </div>

              <div className="text-slate-700 leading-relaxed">
                {evt.details}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[10px]">
                <div className="bg-white p-2 rounded truncate text-slate-600 border border-slate-200">
                  <span className="text-slate-400 block font-sans">Previous Hash (Pointer):</span>
                  <span className="text-slate-700">{evt.previousHash}</span>
                </div>
                <div className="bg-white p-2 rounded truncate text-blue-700 border border-slate-200">
                  <span className="text-slate-400 block font-sans">Block Hash (SHA-256):</span>
                  <span className="font-semibold">{evt.eventHash}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
