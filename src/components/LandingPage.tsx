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
    <div className="space-y-10 pb-16">
      {/* Hero Section (Light with Blue Theme Accents) */}
      <div className="relative rounded-2xl overflow-hidden bg-white border border-blue-100 p-8 md:p-12 shadow-sm">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100/40 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl relative z-10 space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Smart India Hackathon (SIH 2026) Prototype
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            From Admission Data to Accountable,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-600 to-teal-600">
              Verifiable Academic Records
            </span>
          </h1>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            A centralized, privacy-aware student data management, admission reconciliation, regulatory monitoring, and academic record verification platform for AICTE-approved institutions powered by synthetic <strong>APAAR ID</strong>.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onEnterDemo('dashboard')}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-sm transition-all hover:scale-[1.01]"
            >
              Enter Demo Workspace
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onEnterDemo('aicte-central')}
              className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-5 py-3 rounded-xl font-semibold text-sm transition-all shadow-2xs"
            >
              <Building className="w-4 h-4 text-blue-600" />
              AICTE Central Regulatory Hub
            </button>

            <button
              onClick={() => onEnterDemo('audit-chain')}
              className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-4 py-3 rounded-xl font-medium text-xs transition-all shadow-2xs"
            >
              <Lock className="w-3.5 h-3.5 text-blue-600" />
              SHA-256 Audit Chain
            </button>
          </div>
        </div>

        {/* Live Synthetic Metrics Preview Card */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
            <div className="text-xs text-slate-500 font-medium">Institutions In Registry</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">4</div>
            <div className="text-[11px] text-blue-700 mt-0.5 font-medium">Delhi, MH, KA, GUJ</div>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
            <div className="text-xs text-slate-500 font-medium">Synthetic Students</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{state.students.length}</div>
            <div className="text-[11px] text-blue-700 mt-0.5 font-medium">15 Seed Edge Cases</div>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
            <div className="text-xs text-slate-500 font-medium">Cryptographic Audit Chain</div>
            <div className="text-2xl font-bold text-teal-700 mt-1">{state.auditChain.length}</div>
            <div className="text-[11px] text-teal-700 mt-0.5 font-medium">SHA-256 Verified</div>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
            <div className="text-xs text-slate-500 font-medium">Active Rulebook</div>
            <div className="text-2xl font-bold text-indigo-700 mt-1">APH v2.1</div>
            <div className="text-[11px] text-indigo-700 mt-0.5 font-medium">Time Machine Active</div>
          </div>
        </div>
      </div>

      {/* Visual End-to-End Workflow Pipeline */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="max-w-2xl">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            End-to-End Regulatory &amp; Integrity Pipeline
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            How APAAR Integrity Mesh reconciles data from local institutional submission to public verifiability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
              01
            </div>
            <h4 className="text-sm font-semibold text-slate-900">Intake &amp; Upload</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Approved programme quotas configured. CSV/Excel student data uploaded with column auto-mapping.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
              02
            </div>
            <h4 className="text-sm font-semibold text-slate-900">7-Stage Validation</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Format, internal duplicate, cross-institution conflict, intake ceiling, and supernumerary quota checks.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 font-bold flex items-center justify-center text-xs">
              03
            </div>
            <h4 className="text-sm font-semibold text-slate-900">Signatory &amp; Ledger</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Dual-role review, correction workflows, immutable SHA-256 audit chaining, and seat lifecycle ledger.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs">
              04
            </div>
            <h4 className="text-sm font-semibold text-slate-900">Verification &amp; AI</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Student attestation, QR-based verifier portal, national regulatory dashboard, and AI copilot.
            </p>
          </div>
        </div>
      </div>

      {/* Role-Based Quick Entry Cards */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Explore Demonstration by Stakeholder Role
          </h2>
          <p className="text-xs text-slate-500">
            Click any persona to log in instantly with appropriate permissions and tenant isolation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => handleRoleStart('INSTITUTION_ADMIN', 'INST-DEL-01')}
            className="group cursor-pointer bg-white hover:bg-blue-50/40 border border-slate-200 hover:border-blue-400 rounded-xl p-5 transition-all shadow-xs"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Building className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-slate-900 group-hover:text-blue-700 transition-colors">
              Institution Administrator
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Oversee DTU Delhi, inspect approved intake capacity, review validation reports.
            </p>
            <div className="mt-3 flex items-center text-xs text-blue-700 font-semibold">
              Launch Dashboard &rarr;
            </div>
          </div>

          <div
            onClick={() => handleRoleStart('INSTITUTION_OPERATOR', 'INST-DEL-01')}
            className="group cursor-pointer bg-white hover:bg-teal-50/40 border border-slate-200 hover:border-teal-400 rounded-xl p-5 transition-all shadow-xs"
          >
            <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-slate-900 group-hover:text-teal-700 transition-colors">
              Data Entry Operator
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Upload CSV batches, map headers, preview row errors, submit corrections.
            </p>
            <div className="mt-3 flex items-center text-xs text-teal-700 font-semibold">
              Upload Records &rarr;
            </div>
          </div>

          <div
            onClick={() => handleRoleStart('AICTE_ADMIN')}
            className="group cursor-pointer bg-white hover:bg-indigo-50/40 border border-slate-200 hover:border-indigo-400 rounded-xl p-5 transition-all shadow-xs"
          >
            <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-slate-900 group-hover:text-indigo-700 transition-colors">
              AICTE Regulatory Officer
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Cross-institution duplicate classifier, Digital Twin simulation, risk engine.
            </p>
            <div className="mt-3 flex items-center text-xs text-indigo-700 font-semibold">
              National Oversight &rarr;
            </div>
          </div>

          <div
            onClick={() => handleRoleStart('STUDENT')}
            className="group cursor-pointer bg-white hover:bg-emerald-50/40 border border-slate-200 hover:border-emerald-400 rounded-xl p-5 transition-all shadow-xs"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
              Student Workspace
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Review reported admission, confirm details, raise dispute, download verified receipt.
            </p>
            <div className="mt-3 flex items-center text-xs text-emerald-700 font-semibold">
              Student Portal &rarr;
            </div>
          </div>
        </div>
      </div>

      {/* Security & Regulatory Tenets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2 shadow-xs">
          <div className="flex items-center gap-2 text-blue-700 font-semibold text-sm">
            <Lock className="w-4 h-4" />
            Privacy-Preserving Matching
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Raw student identifiers are protected using server-side HMAC-SHA256 pseudonymous tokens. Identifiers are masked across logs and exports.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2 shadow-xs">
          <div className="flex items-center gap-2 text-teal-700 font-semibold text-sm">
            <ShieldCheck className="w-4 h-4" />
            Tamper-Evident SHA-256 Ledger
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Forward-linked cryptographic event chain where every batch upload, signatory approval, and correction links to its prior hash. Includes an interactive tampering simulator.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2 shadow-xs">
          <div className="flex items-center gap-2 text-indigo-700 font-semibold text-sm">
            <Key className="w-4 h-4" />
            Zero-Hallucination Regulatory Rules
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Statutory calculations are computed strictly by deterministic rules. AI assists by explaining findings, without inventing policies or making autonomous decisions.
          </p>
        </div>
      </div>
    </div>
  );
};
