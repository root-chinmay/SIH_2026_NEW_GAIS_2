import React, { useState } from 'react';
import {
  ShieldAlert,
  UserCheck,
  RotateCcw,
  Globe,
  Bot,
  Search,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Lock,
} from 'lucide-react';
import { store, DEMO_USERS } from '../services/store';
import { Language, Role } from '../types';
import { TRANSLATIONS } from '../locales/translations';

interface HeaderProps {
  onOpenCopilot: () => void;
  activeView: string;
  setActiveView: (view: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCopilot, activeView, setActiveView }) => {
  const state = store.getState();
  const t = TRANSLATIONS[state.language] || TRANSLATIONS.en;

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const handleRoleSelect = (role: Role, institutionId?: string) => {
    store.switchRole(role, institutionId);
    setShowRoleModal(false);
  };

  const handleReset = () => {
    store.resetDemoData();
    setShowResetModal(false);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    store.setLanguage(e.target.value as Language);
  };

  return (
    <>
      {/* Top Banner: Mandatory AICTE SIH Demo Notice */}
      <div className="bg-slate-900 text-slate-200 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 font-semibold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/80">
            <ShieldAlert className="w-3.5 h-3.5" />
            {t.demoMode}
          </span>
          <span className="hidden sm:inline text-slate-300">{t.sihNotice}</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400 text-xs">
          <span>AICTE Problem Statement: SIH-2026-APAAR</span>
          <span className="hidden md:inline">|</span>
          <span className="hidden md:inline text-teal-400 font-mono">SHA-256 Audit Chain Active</span>
        </div>
      </div>

      {/* Main Header Bar */}
      <header className="bg-slate-950/95 backdrop-blur border-b border-slate-800 text-white px-4 lg:px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <div
            onClick={() => setActiveView('landing')}
            className="cursor-pointer flex items-center gap-2.5 group"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-blue-700 via-indigo-600 to-teal-500 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              AIM
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base lg:text-lg tracking-tight text-white group-hover:text-blue-300 transition-colors">
                  APAAR Integrity Mesh
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/50">
                  AICTE Edition
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                {t.tagline}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Language Selector */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-300">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={state.language}
              onChange={handleLanguageChange}
              className="bg-transparent border-none text-xs text-slate-200 focus:outline-none cursor-pointer"
              aria-label="Select Language"
            >
              <option value="en" className="bg-slate-900 text-white">English</option>
              <option value="hi" className="bg-slate-900 text-white">हिंदी (Hindi)</option>
              <option value="mr" className="bg-slate-900 text-white">मराठी (Marathi)</option>
            </select>
          </div>

          {/* AI Regulatory Copilot Trigger */}
          <button
            onClick={onOpenCopilot}
            className="flex items-center gap-1.5 bg-indigo-950/70 hover:bg-indigo-900/80 text-indigo-300 hover:text-white border border-indigo-800/80 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm"
            title="Open Regulatory AI Copilot"
          >
            <Bot className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span className="hidden md:inline">AI Copilot</span>
          </button>

          {/* Role Switcher Pill */}
          <button
            onClick={() => setShowRoleModal(true)}
            className="flex items-center gap-2 bg-blue-950/70 hover:bg-blue-900/80 text-blue-200 border border-blue-800/80 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            title="Switch Simulated Role"
          >
            <UserCheck className="w-4 h-4 text-blue-400" />
            <div className="text-left hidden sm:block">
              <div className="font-semibold text-slate-100 leading-none">
                {state.currentUser.role.replace('_', ' ')}
              </div>
              <div className="text-[10px] text-blue-300/80 leading-tight">
                {state.currentUser.institutionName ? state.currentUser.institutionName.split(' ')[0] : 'Regulatory Hub'}
              </div>
            </div>
            <span className="text-[10px] bg-blue-800/60 text-blue-200 px-1.5 py-0.5 rounded ml-1">
              Switch
            </span>
          </button>

          {/* Reset Demo Data Button */}
          <button
            onClick={() => setShowResetModal(true)}
            className="flex items-center gap-1 text-slate-400 hover:text-amber-400 bg-slate-900/80 hover:bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-lg text-xs transition-colors"
            title="Reset to clean baseline synthetic dataset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">{t.resetDemoData}</span>
          </button>
        </div>
      </header>

      {/* Role Selection Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-blue-400" />
                  Select SIH Demonstration Role
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Explore end-to-end workflows from the perspective of different stakeholders.
                </p>
              </div>
              <button
                onClick={() => setShowRoleModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 max-h-[60vh] overflow-y-auto pr-1">
              {/* Role A: Institution Admin - DTU */}
              <div
                onClick={() => handleRoleSelect('INSTITUTION_ADMIN', 'INST-DEL-01')}
                className={`p-3.5 rounded-lg border text-left cursor-pointer transition-all ${
                  state.currentUser.role === 'INSTITUTION_ADMIN' && state.currentUser.institutionId === 'INST-DEL-01'
                    ? 'bg-blue-950/70 border-blue-500 text-white'
                    : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="font-semibold text-sm text-white flex items-center justify-between">
                  <span>Institution Admin</span>
                  <span className="text-[10px] bg-blue-900/60 text-blue-300 px-1.5 py-0.5 rounded">DTU Delhi</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Manages approved intake, oversees submissions, views capacity metrics.
                </p>
              </div>

              {/* Role B: Institution Data Operator - DTU */}
              <div
                onClick={() => handleRoleSelect('INSTITUTION_OPERATOR', 'INST-DEL-01')}
                className={`p-3.5 rounded-lg border text-left cursor-pointer transition-all ${
                  state.currentUser.role === 'INSTITUTION_OPERATOR'
                    ? 'bg-blue-950/70 border-blue-500 text-white'
                    : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="font-semibold text-sm text-white flex items-center justify-between">
                  <span>Institution Data Operator</span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">DTU Delhi</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Uploads student records, maps CSV headers, prepares corrections.
                </p>
              </div>

              {/* Role C: Institution Signatory - DTU */}
              <div
                onClick={() => handleRoleSelect('INSTITUTION_SIGNATORY', 'INST-DEL-01')}
                className={`p-3.5 rounded-lg border text-left cursor-pointer transition-all ${
                  state.currentUser.role === 'INSTITUTION_SIGNATORY'
                    ? 'bg-blue-950/70 border-blue-500 text-white'
                    : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="font-semibold text-sm text-white flex items-center justify-between">
                  <span>Institution Signatory</span>
                  <span className="text-[10px] bg-teal-900/60 text-teal-300 px-1.5 py-0.5 rounded">DTU Delhi</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Certifies and signs batch submissions before national submission.
                </p>
              </div>

              {/* Role D: AICTE Regulatory Administrator */}
              <div
                onClick={() => handleRoleSelect('AICTE_ADMIN')}
                className={`p-3.5 rounded-lg border text-left cursor-pointer transition-all ${
                  state.currentUser.role === 'AICTE_ADMIN'
                    ? 'bg-indigo-950/70 border-indigo-500 text-white'
                    : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="font-semibold text-sm text-white flex items-center justify-between">
                  <span>AICTE Regulatory Admin</span>
                  <span className="text-[10px] bg-indigo-900/60 text-indigo-300 px-1.5 py-0.5 rounded">National Hub</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Cross-institution duplicate investigation, intake ceiling enforcement, digital twin.
                </p>
              </div>

              {/* Role E: AICTE Auditor / Inspector */}
              <div
                onClick={() => handleRoleSelect('AICTE_AUDITOR')}
                className={`p-3.5 rounded-lg border text-left cursor-pointer transition-all ${
                  state.currentUser.role === 'AICTE_AUDITOR'
                    ? 'bg-indigo-950/70 border-indigo-500 text-white'
                    : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="font-semibold text-sm text-white flex items-center justify-between">
                  <span>AICTE Auditor / Inspector</span>
                  <span className="text-[10px] bg-purple-900/60 text-purple-300 px-1.5 py-0.5 rounded">Read-Only</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Historical time machine, bi-temporal audit, immutable chain inspection.
                </p>
              </div>

              {/* Role F: Student Workspace */}
              <div
                onClick={() => handleRoleSelect('STUDENT')}
                className={`p-3.5 rounded-lg border text-left cursor-pointer transition-all ${
                  state.currentUser.role === 'STUDENT'
                    ? 'bg-emerald-950/70 border-emerald-500 text-white'
                    : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="font-semibold text-sm text-white flex items-center justify-between">
                  <span>Student Workspace</span>
                  <span className="text-[10px] bg-emerald-900/60 text-emerald-300 px-1.5 py-0.5 rounded">Aarav Sharma</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Student-in-the-loop attestation, admission receipt download, dispute raising.
                </p>
              </div>

              {/* Role G: Authorized Verifier */}
              <div
                onClick={() => handleRoleSelect('AUTHORIZED_VERIFIER')}
                className={`p-3.5 rounded-lg border text-left cursor-pointer transition-all ${
                  state.currentUser.role === 'AUTHORIZED_VERIFIER'
                    ? 'bg-amber-950/70 border-amber-500 text-white'
                    : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="font-semibold text-sm text-white flex items-center justify-between">
                  <span>Authorized Verifier</span>
                  <span className="text-[10px] bg-amber-900/60 text-amber-300 px-1.5 py-0.5 rounded">Employer/Univ</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Verifies cryptographic credential signatures & minimal privacy claims via QR.
                </p>
              </div>

              {/* Role H: Security Administrator */}
              <div
                onClick={() => handleRoleSelect('SECURITY_ADMIN')}
                className={`p-3.5 rounded-lg border text-left cursor-pointer transition-all ${
                  state.currentUser.role === 'SECURITY_ADMIN'
                    ? 'bg-rose-950/70 border-rose-500 text-white'
                    : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="font-semibold text-sm text-white flex items-center justify-between">
                  <span>Security Administrator</span>
                  <span className="text-[10px] bg-rose-900/60 text-rose-300 px-1.5 py-0.5 rounded">CISO Cell</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Audit chain verification, tampering simulation sandbox, access event logs.
                </p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowRoleModal(false)}
                className="bg-slate-800 hover:bg-slate-700 text-white text-xs px-4 py-2 rounded-lg font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-400 mb-3">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">Reset Demo Dataset?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              This will restore the application to the initial baseline containing 4 institutions, 100+ synthetic student records, all 15 pre-seeded edge cases, and the verified cryptographic audit chain.
            </p>
            <div className="mt-5 flex justify-end gap-2.5">
              <button
                onClick={() => setShowResetModal(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3.5 py-2 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="bg-amber-600 hover:bg-amber-500 text-white text-xs px-4 py-2 rounded-lg font-semibold shadow-lg shadow-amber-600/30"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
