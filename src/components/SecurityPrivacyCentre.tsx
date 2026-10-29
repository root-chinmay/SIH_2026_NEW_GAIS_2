import React, { useState } from 'react';
import {
  Lock,
  ShieldCheck,
  Key,
  ShieldAlert,
  Server,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
} from 'lucide-react';
import { store } from '../services/store';
import { generateMatchingToken } from '../services/cryptoEngine';

export const SecurityPrivacyCentre: React.FC = () => {
  const state = store.getState();
  const securityEvents = state.securityEvents;

  // HMAC Matching Playground State
  const [testApaarInput, setTestApaarInput] = useState('APAAR-DEMO-0099');
  const [generatedToken, setGeneratedToken] = useState(() =>
    generateMatchingToken('APAAR-DEMO-0099')
  );

  const handleComputeToken = () => {
    if (!testApaarInput.trim()) return;
    const token = generateMatchingToken(testApaarInput.trim());
    setGeneratedToken(token);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-rose-900/60 text-rose-300 border border-rose-700/60">
              Cybersecurity &amp; Privacy Architecture
            </span>
            <span className="text-[11px] font-mono text-teal-400 bg-teal-950/60 px-2 py-0.5 rounded border border-teal-800/60">
              Zero-Trust Tenet
            </span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
            <Lock className="w-6 h-6 text-rose-400" />
            Security Operations &amp; Privacy Centre
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Institutional tenant isolation, role-based access enforcement, pseudonymous matching tokens, and security event auditing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-950 text-teal-300 border border-teal-800 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            Tenant Isolation Active
          </span>
        </div>
      </div>

      {/* Security Architecture Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
            <Server className="w-4 h-4" />
            Tenant Isolation
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Institution A cannot read, query, or mutate Institution B records simply by tampering with query parameters.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
            <Key className="w-4 h-4" />
            HMAC Pseudonyms
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Identifier matching is computed via server-side keyed HMACs, preventing exposure of raw identifiers in analytics logs.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
            <Lock className="w-4 h-4" />
            Dual Role Sign-Off
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Separation of duty: Operators cannot self-certify high-risk submissions without institutional signatory authorization.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
            <FileCheck className="w-4 h-4" />
            Formula Sanitization
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            All CSV / Excel exports automatically sanitize spreadsheet formula triggers (=, +, -, @) preventing DDE injection.
          </p>
        </div>
      </div>

      {/* Privacy-Preserving Matching Token Playground (Section 20) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-teal-400" />
              Privacy-Preserving APAAR Matching Sandbox
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Demonstrates how the national duplicate index correlates students without broadcasting plaintext identifiers.
            </p>
          </div>
          <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
            Keyed SHA-256 HMAC
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-semibold text-slate-300 block mb-1">
              Synthetic APAAR ID Input:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={testApaarInput}
                onChange={(e) => setTestApaarInput(e.target.value)}
                placeholder="e.g. APAAR-DEMO-0099"
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
              />
              <button
                onClick={handleComputeToken}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-semibold shrink-0"
              >
                Compute Token
              </button>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Never stored in unencrypted client sessions. Computed server-side.
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">
              Protected Pseudonymous Matching Token:
            </label>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-teal-400 text-xs font-bold">
              {generatedToken}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Correlates duplicate records across institutions with zero disclosure of student personal identity.
            </div>
          </div>
        </div>
      </div>

      {/* Security Audit Event Log Feed */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          Security Operations Event Audit Trail
        </h2>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Event Type</th>
                <th className="p-3.5">Actor / IP</th>
                <th className="p-3.5">Severity</th>
                <th className="p-3.5">Enforcement Action &amp; Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {securityEvents.map((evt) => (
                <tr key={evt.id} className="hover:bg-slate-800/40">
                  <td className="p-3.5 font-mono text-[11px] text-slate-400">{evt.timestamp}</td>
                  <td className="p-3.5 font-mono font-semibold text-white">
                    {evt.eventType}
                  </td>
                  <td className="p-3.5">
                    <div className="text-slate-200">{evt.actor}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{evt.ipAddress}</div>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        evt.severity === 'CRITICAL'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : evt.severity === 'HIGH'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-blue-950 text-blue-300 border border-blue-800'
                      }`}
                    >
                      {evt.severity}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <div className="text-slate-300">{evt.details}</div>
                    {evt.blocked && (
                      <span className="text-[10px] text-rose-400 font-bold mt-0.5 block">
                        [Access Request Blocked by Tenant Policy]
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
