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
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-teal-900/60 text-teal-300 border border-teal-700/60">
              Cybersecurity Tenet
            </span>
            <span className="text-[11px] font-mono text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/60">
              SHA-256 Forward-Linked Chain
            </span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
            <Link2 className="w-6 h-6 text-teal-400" />
            Tamper-Evident Cryptographic Audit Chain
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Every administrative batch upload, signatory sign-off, gate query, and student correction is cryptographically sealed with the hash of the preceding block.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleVerifyChain}
            disabled={isVerifying}
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-teal-600/30"
          >
            <ShieldAlert className="w-4 h-4" />
            {isVerifying ? 'Verifying Hashes...' : 'Re-Verify Chain'}
          </button>
        </div>
      </div>

      {/* Verification Status Banner */}
      {verificationResult && (
        <div
          className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            verificationResult.isValid
              ? 'bg-teal-950/40 border-teal-800 text-teal-200'
              : 'bg-rose-950/40 border-rose-800 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {verificationResult.isValid ? (
              <CheckCircle2 className="w-6 h-6 text-teal-400 shrink-0" />
            ) : (
              <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
            )}
            <div>
              <div className="font-bold text-sm text-white">
                {verificationResult.isValid
                  ? 'Audit Chain Intact & Cryptographically Verified'
                  : 'Chain Tamper Alert Detected!'}
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {verificationResult.diagnostic}
              </p>
            </div>
          </div>

          <div className="text-right font-mono text-xs text-slate-400 shrink-0">
            <div>Total Events: <strong className="text-white">{verificationResult.totalEvents}</strong></div>
            <div className="text-[10px] truncate max-w-[200px]">Tip: {verificationResult.latestHash.substring(0, 16)}...</div>
          </div>
        </div>
      )}

      {/* Interactive Tampering Simulation Sandbox (Section 19) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              Interactive Audit Tampering Demonstration Sandbox
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulates an unauthorized backdated modification on an isolated cloned log to demonstrate mathematical detection.
            </p>
          </div>

          {!tamperingDemoResult ? (
            <button
              onClick={() => handleRunTamperingSimulation(1)}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-amber-600/30"
            >
              <Play className="w-3.5 h-3.5" />
              Simulate Audit Tampering
            </button>
          ) : (
            <button
              onClick={handleClearTamperSandbox}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Tamper Sandbox
            </button>
          )}
        </div>

        {tamperingDemoResult && (
          <div className="bg-rose-950/30 border border-rose-900/80 rounded-xl p-5 space-y-3 text-xs">
            <div className="flex items-center gap-2 font-bold text-sm text-rose-300">
              <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>Integrity Failure Detected: Modified Log Rejected</span>
            </div>

            <p className="text-slate-300 leading-relaxed">
              Target event <strong>#{tamperingDemoResult.tamperedEvent.sequenceNumber}</strong> ({tamperingDemoResult.tamperedEvent.id}) was silently altered in memory. When the SHA-256 verification utility re-calculated the canonical digest, the resulting hash did not match the forward pointer.
            </p>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] space-y-1">
              <div>
                Diagnostic: <span className="text-rose-400">{tamperingDemoResult.verificationResult.diagnostic}</span>
              </div>
              <div>
                Broken Index: Block #{tamperingDemoResult.verificationResult.brokenIndex} &bull; Expected Hash: {tamperingDemoResult.verificationResult.expectedHash?.substring(0, 20)}...
              </div>
            </div>

            <div className="text-[11px] text-slate-400">
              <strong>Technical Distinction:</strong> A hash chain provides <em>tamper-evidence</em>. As mandated by AICTE standards, production durability additionally couples hash chains with off-site write-once storage and trusted periodic notary checkpoints.
            </div>
          </div>
        )}
      </div>

      {/* Live Event Blocks Feed */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-400" />
          Verified Cryptographic Event Chain ({auditChain.length} Blocks)
        </h2>

        <div className="space-y-3 overflow-y-auto max-h-[600px] pr-1">
          {auditChain.map((evt, idx) => (
            <div
              key={evt.id}
              className="bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors space-y-2 text-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-900">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-white text-xs bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    Block #{evt.sequenceNumber}
                  </span>
                  <span className="font-mono text-slate-400">{evt.id}</span>
                  <span className="font-semibold text-blue-300 bg-blue-950/60 px-2 py-0.5 rounded text-[10px] border border-blue-800/60">
                    {evt.action}
                  </span>
                </div>
                <div className="text-slate-500 font-mono text-[11px]">
                  {evt.timestamp}
                </div>
              </div>

              <div className="text-slate-300 leading-relaxed">
                {evt.details}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[10px]">
                <div className="bg-slate-900/60 p-2 rounded truncate text-slate-400 border border-slate-800/60">
                  <span className="text-slate-500 block">Previous Hash (Pointer):</span>
                  <span className="text-slate-300">{evt.previousHash}</span>
                </div>
                <div className="bg-slate-900/60 p-2 rounded truncate text-teal-400 border border-slate-800/60">
                  <span className="text-slate-500 block">Block Hash (SHA-256):</span>
                  <span>{evt.eventHash}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
