import React, { useState } from 'react';
import {
  ShieldAlert,
  UserCheck,
  RotateCcw,
  Globe,
  Bot,
  AlertTriangle,
} from 'lucide-react';
import { store } from '../services/store';
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
      <div className="bg-slate-100 text-slate-700 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-300">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            {t.demoMode}
          </span>
          <span className="hidden sm:inline text-slate-600">{t.sihNotice}</span>
        </div>
        <div className="flex items-center gap-4 text-slate-500 text-xs">
          <span>AICTE Problem Statement: SIH-2026-APAAR</span>
          <span className="hidden md:inline">|</span>
          <span className="hidden md:inline text-blue-700 font-mono font-medium">SHA-256 Audit Chain Active</span>
        </div>
      </div>

      {/* Main Header Bar (Clean White Background with Blue Accents) */}
      <header className="bg-white border-b border-slate-200 text-slate-800 px-4 lg:px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <div
            onClick={() => setActiveView('landing')}
            className="cursor-pointer flex items-center gap-2.5 group"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-blue-600/20 group-hover:scale-105 transition-transform">
              AIM
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base lg:text-lg tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                  APAAR Integrity Mesh
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  AICTE Edition
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                {t.tagline}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Language Selector */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-700 shadow-2xs">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={state.language}
              onChange={handleLanguageChange}
              className="bg-transparent border-none text-xs text-slate-700 focus:outline-none cursor-pointer"
              aria-label="Select Language"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="mr">मराठी (Marathi)</option>
            </select>
          </div>

          {/* AI Regulatory Copilot Trigger */}
          <button
            onClick={onOpenCopilot}
            className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-2xs"
            title="Open Regulatory AI Copilot"
          >
            <Bot className="w-4 h-4 text-blue-600 animate-pulse" />
            <span className="hidden md:inline">AI Copilot</span>
          </button>

          {/* Role Switcher Pill */}
          <button
            onClick={() => setShowRoleModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-xs"
            title="Switch Simulated Role"
          >
            <UserCheck className="w-4 h-4 text-blue-100" />
            <div className="text-left hidden sm:block">
              <div className="font-semibold leading-none">
                {state.currentUser.role.replace('_', ' ')}
              </div>
              <div className="text-[10px] text-blue-100 leading-tight">
                {state.currentUser.institutionName ? state.currentUser.institutionName.split(' ')[0] : 'Regulatory Hub'}
              </div>
            </div>
            <span className="text-[10px] bg-blue-700 text-white px-1.5 py-0.5 rounded ml-1 font-semibold">
              Switch
            </span>
          </button>

          {/* Reset Demo Data Button */}
          <button
            onClick={() => setShowResetModal(true)}
            className="flex items-center gap-1 text-slate-600 hover:text-amber-700 bg-white hover:bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs transition-colors shadow-2xs"
            title="Reset to clean baseline synthetic dataset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">{t.resetDemoData}</span>
          </button>
        </div>
      </header>

      {/* Role Selection Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-2xl w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-blue-600" />
                  Select SIH Demonstration Role
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Explore end-to-end workflows from the perspective of different stakeholders.
                </p>
              </div>
              <button
                onClick={() => setShowRoleModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold p-1"
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
                    ? 'bg-blue-50 border-blue-400 text-blue-950 shadow-2xs'
                    : 'bg-slate-50/70 border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 text-slate-700'
                }`}
              >
                <div className="font-semibold text-sm text-slate-900 flex items-center justify-between">
                  <span>Institution Admin</span>
                  <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-medium">DTU Delhi</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Manages approved intake, oversees submissions, views capacity metrics.
                </p>
              </div>

              {/* Role B: Institution Data Operator - DTU */}
              <div
                onClick={() => handleRoleSelect('INSTITUTION_OPERATOR', 'INST-DEL-01')}
                className={`p-3.5 rounded-lg border text-left cursor-pointer transition-all ${
                  state.currentUser.role === 'INSTITUTION_OPERATOR'
                    ? 'bg-blue-50 border-blue-400 text-blue-950 shadow-2xs'
                    : 'bg-slate-50/70 border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 text-slate-700'
                }`}
              >
                <div className="font-semibold text-sm text-slate-900 flex items-center justify-between">
                  <span>Institution Data Operator</span>
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-medium">DTU Delhi</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Uploads student records, maps CSV headers, prepares corrections.
                </p>
              </div>

              {/* Role C: Institution Signatory - DTU */}
              <div
                onClick={() => handleRoleSelect('INSTITUTION_SIGNATORY', 'INST-DEL-01')}
                className={`p-3.5 rounded-lg border text-left cursor-pointer transition-all ${
                  state.currentUser.role === 'INSTITUTION_SIGNATORY'
                    ? 'bg-blue-50 border-blue-400 text-blue-950 shadow-2xs'
                    : 'bg-slate-50/70 border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 text-slate-700'
                }`}
              >
                <div className="font-semibold text-sm text-slate-900 flex items-center justify-between">
                  <span>Institution Signatory</span>
                  <span className="text-[10px] bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded font-medium">DTU Delhi</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Certifies and signs batch submissions before national submission.
                </p>
              </div>

              {/* Role D: AICTE Regulatory Administrator */}
              <div
                onClick={() => handleRoleSelect('AICTE_ADMIN')}
                className={`p-3.5 rounded-lg border text-left cursor-pointer transition-all ${
                  state.currentUser.role === 'AICTE_ADMIN'
                    ? 'bg-blue-50 border-blue-400 text-blue-950 shadow-2xs'
                    : 'bg-slate-50/70 border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 text-slate-700'
                }`}
              >
                <div className="font-semibold text-sm text-slate-900 flex items-center justify-between">
                  <span>AICTE Regulatory Admin</span>
                  <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-medium">National Hub</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Cross-institution duplicate investigation, intake ceiling enforcement, digital twin.
                </p>
              </div>

              {/* Role E: AICTE Auditor / Inspector */}
              <div
                onClick={() => handleRoleSelect('AICTE_AUDITOR')}
                className={`p-3.5 rounded-lg border text-left cursor-pointer transition-all ${
                  state.currentUser.role === 'AICTE_AUDITOR'
                    ? 'bg-blue-50 border-blue-400 text-blue-950 shadow-2xs'
                    : 'bg-slate-50/70 border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 text-slate-700'
                }`}
              >
                <div className="font-semibold text-sm text-slate-900 flex items-center justify-between">
                  <span>AICTE Auditor / Inspector</span>
                  <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded font-medium">Read-Only</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Historical time machine, bi-temporal audit, immutable chain inspection.
                </p>
              </div>

              {/* Role F: Student Workspace */}
              <div
                onClick={() => handleRoleSelect('STUDENT')}
                className={`p-3.5 rounded-lg border text-left cursor-pointer transition-all ${
                  state.currentUser.role === 'STUDENT'
                    ? 'bg-blue-50 border-blue-400 text-blue-950 shadow-2xs'
                    : 'bg-slate-50/70 border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 text-slate-700'
                }`}
              >
                <div className="font-semibold text-sm text-slate-900 flex items-center justify-between">
                  <span>Student Workspace</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-medium">Aarav Sharma</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Student-in-the-loop attestation, admission receipt download, dispute raising.
                </p>
              </div>

              {/* Role G: Authorized Verifier */}
              <div
                onClick={() => handleRoleSelect('AUTHORIZED_VERIFIER')}
                className={`p-3.5 rounded-lg border text-left cursor-pointer transition-all ${
                  state.currentUser.role === 'AUTHORIZED_VERIFIER'
                    ? 'bg-blue-50 border-blue-400 text-blue-950 shadow-2xs'
                    : 'bg-slate-50/70 border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 text-slate-700'
                }`}
              >
                <div className="font-semibold text-sm text-slate-900 flex items-center justify-between">
                  <span>Authorized Verifier</span>
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-medium">Employer/Univ</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Verifies cryptographic credential signatures & minimal privacy claims via QR.
                </p>
              </div>

              {/* Role H: Security Administrator */}
              <div
                onClick={() => handleRoleSelect('SECURITY_ADMIN')}
                className={`p-3.5 rounded-lg border text-left cursor-pointer transition-all ${
                  state.currentUser.role === 'SECURITY_ADMIN'
                    ? 'bg-blue-50 border-blue-400 text-blue-950 shadow-2xs'
                    : 'bg-slate-50/70 border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 text-slate-700'
                }`}
              >
                <div className="font-semibold text-sm text-slate-900 flex items-center justify-between">
                  <span>Security Administrator</span>
                  <span className="text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded font-medium">CISO Cell</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Audit chain verification, tampering simulation sandbox, access event logs.
                </p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowRoleModal(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-600 mb-3">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-900">Reset Demo Dataset?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              This will restore the application to the initial baseline containing 4 institutions, 100+ synthetic student records, all 15 pre-seeded edge cases, and the verified cryptographic audit chain.
            </p>
            <div className="mt-5 flex justify-end gap-2.5">
              <button
                onClick={() => setShowResetModal(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-3.5 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs px-4 py-2 rounded-lg font-semibold shadow-md shadow-amber-600/20 transition-colors"
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
