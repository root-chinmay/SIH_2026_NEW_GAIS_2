import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Users,
  FileSpreadsheet,
  Cpu,
  Layers,
  ArrowRight,
  Lock,
  Building,
  GraduationCap,
  Sparkles,
  Server,
  Key,
} from 'lucide-react';
import { store, DEMO_USERS } from '../services/store';
import { Role } from '../types';

interface LandingPageProps {
  onEnterDemo: (view: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterDemo }) => {
  const state = store.getState();

  const handleRoleStart = (role: Role, institutionId?: string) => {
    store.switchRole(role, institutionId);
    if (role === 'AICTE_ADMIN') onEnterDemo('aicte-central');
    else if (role === 'STUDENT') onEnterDemo('student-portal');
    else if (role === 'AUTHORIZED_VERIFIER') onEnterDemo('verifier');
    else if (role === 'SECURITY_ADMIN') onEnterDemo('security');
    else onEnterDemo('dashboard');
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 border border-slate-800 p-8 md:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/40 border border-blue-700/60 text-blue-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            Smart India Hackathon (SIH 2026) Prototype
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            From Admission Data to Accountable,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-teal-300 to-indigo-300">
              Verifiable Academic Records
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            A centralized, privacy-aware student data management, admission reconciliation, regulatory monitoring, and academic record verification platform for AICTE-approved institutions powered by synthetic <strong>APAAR ID</strong>.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onEnterDemo('dashboard')}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02]"
            >
              Enter Demo Workspace
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onEnterDemo('aicte-central')}
              className="flex items-center gap-2 bg-slate-800/90 hover:bg-slate-800 text-slate-200 border border-slate-700 px-5 py-3 rounded-xl font-semibold text-sm transition-all"
            >
              <Building className="w-4 h-4 text-indigo-400" />
              AICTE Central Regulatory Hub
            </button>

            <button
              onClick={() => onEnterDemo('audit-chain')}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-teal-300 border border-teal-800/60 px-4 py-3 rounded-xl font-medium text-xs transition-all"
            >
              <Lock className="w-3.5 h-3.5 text-teal-400" />
              SHA-256 Audit Chain
            </button>
          </div>
        </div>

        {/* Live Synthetic Metrics Preview Card */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10 pt-8 border-t border-slate-800/80">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
            <div className="text-xs text-slate-400">Institutions In Registry</div>
            <div className="text-2xl font-bold text-white mt-1">4</div>
            <div className="text-[11px] text-teal-400 mt-0.5">Delhi, MH, KA, GUJ</div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
            <div className="text-xs text-slate-400">Synthetic Students</div>
            <div className="text-2xl font-bold text-white mt-1">{state.students.length}</div>
            <div className="text-[11px] text-blue-400 mt-0.5">15 Seed Edge Cases</div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
            <div className="text-xs text-slate-400">Cryptographic Audit Chain</div>
            <div className="text-2xl font-bold text-teal-300 mt-1">{state.auditChain.length}</div>
            <div className="text-[11px] text-teal-400 mt-0.5">SHA-256 Verified</div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
            <div className="text-xs text-slate-400">Active Rulebook</div>
            <div className="text-2xl font-bold text-indigo-300 mt-1">APH v2.1</div>
            <div className="text-[11px] text-indigo-400 mt-0.5">Time Machine Active</div>
          </div>
        </div>
      </div>

      {/* Visual End-to-End Workflow Pipeline */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <div className="max-w-2xl">
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-400" />
            End-to-End Regulatory &amp; Integrity Pipeline
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            How APAAR Integrity Mesh reconciles data from local institutional submission to public verifiability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-900/60 text-blue-300 font-bold flex items-center justify-center text-xs">
              01
            </div>
            <h4 className="text-sm font-semibold text-white">Intake &amp; Upload</h4>
            <p className="text-xs text-slate-400">
              Approved programme quotas configured. CSV/Excel student data uploaded with column auto-mapping.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-900/60 text-indigo-300 font-bold flex items-center justify-center text-xs">
              02
            </div>
            <h4 className="text-sm font-semibold text-white">7-Stage Validation</h4>
            <p className="text-xs text-slate-400">
              Format, internal duplicate, cross-institution conflict, intake ceiling, and supernumerary quota checks.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-teal-900/60 text-teal-300 font-bold flex items-center justify-center text-xs">
              03
            </div>
            <h4 className="text-sm font-semibold text-white">Signatory &amp; Ledger</h4>
            <p className="text-xs text-slate-400">
              Dual-role review, correction workflows, immutable SHA-256 audit chaining, and seat lifecycle ledger.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-purple-900/60 text-purple-300 font-bold flex items-center justify-center text-xs">
              04
            </div>
            <h4 className="text-sm font-semibold text-white">Verification &amp; AI</h4>
            <p className="text-xs text-slate-400">
              Student attestation, QR-based verifier portal, national regulatory dashboard, and AI copilot.
            </p>
          </div>
        </div>
      </div>

      {/* Role-Based Quick Entry Cards */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white">
            Explore Demonstration by Stakeholder Role
          </h2>
          <p className="text-xs text-slate-400">
            Click any persona to log in instantly with appropriate permissions and tenant isolation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => handleRoleStart('INSTITUTION_ADMIN', 'INST-DEL-01')}
            className="group cursor-pointer bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-blue-500 rounded-xl p-5 transition-all shadow-md"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-900/50 text-blue-300 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Building className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-white group-hover:text-blue-300 transition-colors">
              Institution Administrator
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Oversee DTU Delhi, inspect approved intake capacity, review validation reports.
            </p>
            <div className="mt-3 flex items-center text-xs text-blue-400 font-medium">
              Launch Dashboard &rarr;
            </div>
          </div>

          <div
            onClick={() => handleRoleStart('INSTITUTION_OPERATOR', 'INST-DEL-01')}
            className="group cursor-pointer bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-teal-500 rounded-xl p-5 transition-all shadow-md"
          >
            <div className="w-10 h-10 rounded-lg bg-teal-900/50 text-teal-300 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-white group-hover:text-teal-300 transition-colors">
              Data Entry Operator
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Upload CSV batches, map headers, preview row errors, submit corrections.
            </p>
            <div className="mt-3 flex items-center text-xs text-teal-400 font-medium">
              Upload Records &rarr;
            </div>
          </div>

          <div
            onClick={() => handleRoleStart('AICTE_ADMIN')}
            className="group cursor-pointer bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500 rounded-xl p-5 transition-all shadow-md"
          >
            <div className="w-10 h-10 rounded-lg bg-indigo-900/50 text-indigo-300 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-white group-hover:text-indigo-300 transition-colors">
              AICTE Regulatory Officer
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Cross-institution duplicate classifier, Digital Twin simulation, risk engine.
            </p>
            <div className="mt-3 flex items-center text-xs text-indigo-400 font-medium">
              National Oversight &rarr;
            </div>
          </div>

          <div
            onClick={() => handleRoleStart('STUDENT')}
            className="group cursor-pointer bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500 rounded-xl p-5 transition-all shadow-md"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-900/50 text-emerald-300 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-white group-hover:text-emerald-300 transition-colors">
              Student Workspace
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Review reported admission, confirm details, raise dispute, download verified receipt.
            </p>
            <div className="mt-3 flex items-center text-xs text-emerald-400 font-medium">
              Student Portal &rarr;
            </div>
          </div>
        </div>
      </div>

      {/* Security & Regulatory Tenets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm">
            <Lock className="w-4 h-4" />
            Privacy-Preserving Matching
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Raw student identifiers are protected using server-side HMAC-SHA256 pseudonymous tokens. Identifiers are masked across logs and exports.
          </p>
        </div>

        <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-teal-400 font-semibold text-sm">
            <ShieldCheck className="w-4 h-4" />
            Tamper-Evident SHA-256 Ledger
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Forward-linked cryptographic event chain where every batch upload, signatory approval, and correction links to its prior hash. Includes an interactive tampering simulator.
          </p>
        </div>

        <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
            <Key className="w-4 h-4" />
            Zero-Hallucination Regulatory Rules
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Statutory calculations are computed strictly by deterministic rules. AI assists by explaining findings, without inventing policies or making autonomous decisions.
          </p>
        </div>
      </div>
    </div>
  );
};
