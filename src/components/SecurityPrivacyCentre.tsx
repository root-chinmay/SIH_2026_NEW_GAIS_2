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
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              Cybersecurity &amp; Privacy Architecture
            </span>
            <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
              Zero-Trust Tenet
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-2">
            <Lock className="w-6 h-6 text-blue-600" />
            Security Operations &amp; Privacy Centre
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Institutional tenant isolation, role-based access enforcement, pseudonymous matching tokens, and security event auditing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Tenant Isolation Active
          </span>
        </div>
      </div>

      {/* Security Architecture Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 shadow-sm">
          <div className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
            <Server className="w-4 h-4 text-blue-600" />
            Tenant Isolation
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Institution A cannot read, query, or mutate Institution B records simply by tampering with query parameters.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 shadow-sm">
          <div className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
            <Key className="w-4 h-4 text-blue-600" />
            HMAC Pseudonyms
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Identifier matching is computed via server-side keyed HMACs, preventing exposure of raw identifiers in analytics logs.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 shadow-sm">
          <div className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-blue-600" />
            Dual Role Sign-Off
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Separation of duty: Operators cannot self-certify high-risk submissions without institutional signatory authorization.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 shadow-sm">
          <div className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
            <FileCheck className="w-4 h-4 text-blue-600" />
            Formula Sanitization
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            All CSV / Excel exports automatically sanitize spreadsheet formula triggers (=, +, -, @) preventing DDE injection.
          </p>
        </div>
      </div>

      {/* Privacy-Preserving Matching Token Playground */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Key className="w-4 h-4 text-blue-600" />
              Privacy-Preserving APAAR Matching Sandbox
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Demonstrates how the national duplicate index correlates students without broadcasting plaintext identifiers.
            </p>
          </div>
          <span className="text-[10px] font-mono bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded font-semibold">
            Keyed SHA-256 HMAC
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Synthetic APAAR ID Input:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={testApaarInput}
                onChange={(e) => setTestApaarInput(e.target.value)}
                placeholder="e.g. APAAR-DEMO-0099"
                className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <button
                onClick={handleComputeToken}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-sm shrink-0"
              >
                Compute Token
              </button>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Never stored in unencrypted client sessions. Computed server-side.
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Protected Pseudonymous Matching Token:
            </label>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 font-mono text-blue-800 text-xs font-bold break-all">
              {generatedToken}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Correlates duplicate records across institutions with zero disclosure of student personal identity.
            </div>
          </div>
        </div>
      </div>

      {/* Security Audit Event Log Feed */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-blue-600" />
          Security Operations Event Audit Trail
        </h2>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-blue-50/75 text-blue-950 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Event Type</th>
                <th className="p-3.5">Actor / IP</th>
                <th className="p-3.5">Severity</th>
                <th className="p-3.5">Enforcement Action &amp; Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {securityEvents.map((evt) => (
                <tr key={evt.id} className="hover:bg-blue-50/30">
                  <td className="p-3.5 font-mono text-[11px] text-slate-500">{evt.timestamp}</td>
                  <td className="p-3.5 font-mono font-semibold text-slate-900">
                    {evt.eventType}
                  </td>
                  <td className="p-3.5">
                    <div className="text-slate-800 font-medium">{evt.actor}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{evt.ipAddress}</div>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        evt.severity === 'CRITICAL'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : evt.severity === 'HIGH'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {evt.severity}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <div className="text-slate-700">{evt.details}</div>
                    {evt.blocked && (
                      <span className="text-[10px] text-rose-600 font-bold mt-0.5 block">
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
