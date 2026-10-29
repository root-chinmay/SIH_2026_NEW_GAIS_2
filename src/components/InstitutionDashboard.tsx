import React, { useState } from 'react';
import {
  Users,
  CheckCircle,
  AlertTriangle,
  FileCheck,
  Building2,
  TrendingUp,
  AlertOctagon,
  ArrowRight,
  ShieldCheck,
  Layers,
  FileSpreadsheet,
  Clock,
  Sparkles,
} from 'lucide-react';
import { store } from '../services/store';
import { Institution, StudentRecord } from '../types';

interface InstitutionDashboardProps {
  onNavigate: (view: string, filter?: string) => void;
}

export const InstitutionDashboard: React.FC<InstitutionDashboardProps> = ({ onNavigate }) => {
  const state = store.getState();
  const currentInstId = state.currentUser.institutionId || 'INST-DEL-01';

  const [selectedInstId, setSelectedInstId] = useState<string>(currentInstId);
  const activeInstitution = state.institutions.find((i) => i.id === selectedInstId) || state.institutions[0];

  // Filter students for this institution
  const instStudents = state.students.filter((s) => s.institutionId === activeInstitution.id);
  const activeAdmissions = instStudents.filter(
    (s) =>
      s.admissionStatus === 'Admission Confirmed' ||
      s.admissionStatus === 'Enrollment Reported' ||
      s.admissionStatus === 'Provisionally Admitted'
  );

  // Compute metrics
  const totalApprovedIntake = activeInstitution.programmes.reduce((acc, p) => acc + p.approvedIntake, 0);
  const totalReportedEnrolment = activeAdmissions.length;
  const seatUtilizationPct = totalApprovedIntake > 0 ? Math.round((totalReportedEnrolment / totalApprovedIntake) * 100) : 0;

  const validRecords = instStudents.filter((s) => s.validationStatus === 'VALID').length;
  const warningRecords = instStudents.filter((s) => s.validationStatus === 'WARNING').length;
  const invalidRecords = instStudents.filter((s) => s.validationStatus === 'INVALID').length;

  const missingOrMalformedApaar = instStudents.filter(
    (s) => !s.apaarId || s.apaarId.includes('MALFORMED') || s.apaarId === ''
  ).length;

  // Cross institution duplicate flags
  const crossDuplicates = instStudents.filter((s) => {
    if (!s.apaarId) return false;
    return state.students.some(
      (other) =>
        other.id !== s.id &&
        other.institutionId !== s.institutionId &&
        other.apaarId === s.apaarId &&
        (other.admissionStatus === 'Admission Confirmed' ||
          other.admissionStatus === 'Enrollment Reported' ||
          other.admissionStatus === 'Provisionally Admitted')
    );
  }).length;

  const pendingSignatoryBatches = state.batches.filter(
    (b) => b.institutionId === activeInstitution.id && b.status === 'PENDING_APPROVAL'
  ).length;

  const pendingCorrections = state.corrections.filter(
    (c) => c.institutionId === activeInstitution.id && c.status === 'PENDING_SIGNATORY'
  ).length;

  const outstandingDisputes = state.attestations.filter(
    (a) => a.institutionId === activeInstitution.id && a.status === 'DISPUTED'
  ).length;

  // Category breakdown
  const categoryCounts: Record<string, number> = {};
  instStudents.forEach((s) => {
    const cat = s.admissionCategory || 'General';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      {/* Header bar with Institution Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-900/60 border border-blue-700/50 flex items-center justify-center text-blue-300">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">
                {activeInstitution.name}
              </h1>
              <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                {activeInstitution.code}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {activeInstitution.district}, {activeInstitution.state} &bull; Type: {activeInstitution.type} &bull; Signatory: {activeInstitution.authorizedSignatory}
            </p>
          </div>
        </div>

        {/* Institution selector for evaluation demo */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400">View Institution:</label>
          <select
            value={selectedInstId}
            onChange={(e) => setSelectedInstId(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            {state.institutions.map((inst) => (
              <option key={inst.id} value={inst.id}>
                {inst.code} — {inst.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Approved Intake */}
        <div
          onClick={() => onNavigate('ledger')}
          className="cursor-pointer bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-blue-500 rounded-xl p-4 transition-all"
        >
          <div className="text-xs text-slate-400">Approved Intake</div>
          <div className="text-2xl font-bold text-white mt-1">{totalApprovedIntake}</div>
          <div className="text-[11px] text-blue-400 mt-1 flex items-center gap-1">
            <span>{activeInstitution.programmes.length} Programmes</span>
          </div>
        </div>

        {/* Reported Enrolment */}
        <div
          onClick={() => onNavigate('students')}
          className="cursor-pointer bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500 rounded-xl p-4 transition-all"
        >
          <div className="text-xs text-slate-400">Reported Enrolment</div>
          <div className="text-2xl font-bold text-indigo-300 mt-1">{totalReportedEnrolment}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Utilization: <strong className={seatUtilizationPct > 100 ? 'text-rose-400' : 'text-emerald-400'}>{seatUtilizationPct}%</strong>
          </div>
        </div>

        {/* Passed Local Validation */}
        <div
          onClick={() => onNavigate('students')}
          className="cursor-pointer bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500 rounded-xl p-4 transition-all"
        >
          <div className="text-xs text-slate-400">Valid Records</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{validRecords}</div>
          <div className="text-[11px] text-emerald-400/80 mt-1 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            <span>Passed 7 Stages</span>
          </div>
        </div>

        {/* Potential Duplicates */}
        <div
          onClick={() => onNavigate('discrepancies')}
          className="cursor-pointer bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-rose-500 rounded-xl p-4 transition-all"
        >
          <div className="text-xs text-slate-400">Duplicate Conflicts</div>
          <div className="text-2xl font-bold text-rose-400 mt-1">{crossDuplicates}</div>
          <div className="text-[11px] text-rose-400/80 mt-1 flex items-center gap-1">
            <AlertOctagon className="w-3 h-3" />
            <span>Cross-Inst Alert</span>
          </div>
        </div>

        {/* Malformed / Missing APAAR */}
        <div
          onClick={() => onNavigate('students')}
          className="cursor-pointer bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-amber-500 rounded-xl p-4 transition-all"
        >
          <div className="text-xs text-slate-400">Missing/Malformed</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">{missingOrMalformedApaar}</div>
          <div className="text-[11px] text-amber-400/80 mt-1 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            <span>Format Error</span>
          </div>
        </div>

        {/* Awaiting Signatory / Review */}
        <div
          onClick={() => onNavigate('upload')}
          className="cursor-pointer bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-purple-500 rounded-xl p-4 transition-all"
        >
          <div className="text-xs text-slate-400">Awaiting Signatory</div>
          <div className="text-2xl font-bold text-purple-300 mt-1">{pendingSignatoryBatches}</div>
          <div className="text-[11px] text-purple-400 mt-1">Batches Pending</div>
        </div>
      </div>

      {/* Two Column Layout: Programme Capacity & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Programme-wise Enrolment Bars */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                Programme-Wise Approved Intake vs Enrolment
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Monitoring seat capacity and regular vs supernumerary admissions
              </p>
            </div>
            <button
              onClick={() => onNavigate('ledger')}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
            >
              View Full Ledger &rarr;
            </button>
          </div>

          <div className="space-y-5">
            {activeInstitution.programmes.map((prog) => {
              const progStudents = instStudents.filter(
                (s) =>
                  s.programmeId === prog.id &&
                  (s.admissionStatus === 'Admission Confirmed' ||
                    s.admissionStatus === 'Enrollment Reported' ||
                    s.admissionStatus === 'Provisionally Admitted')
              );
              const regularCount = progStudents.filter((s) => !s.isSupernumerary).length;
              const superCount = progStudents.filter((s) => s.isSupernumerary).length;
              const isOverIntake = regularCount > prog.approvedIntake;
              const pct = Math.round((regularCount / prog.approvedIntake) * 100);

              return (
                <div key={prog.id} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                    <div>
                      <div className="text-sm font-semibold text-white flex items-center gap-2">
                        <span>{prog.name}</span>
                        <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                          {prog.code}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Sanctioned Regular Intake: <strong className="text-slate-200">{prog.approvedIntake}</strong> &bull; Supernumerary Cap: {prog.supernumeraryLimits.nri + prog.supernumeraryLimits.tfw + prog.supernumeraryLimits.ews}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">
                        <span className={isOverIntake ? 'text-rose-400' : 'text-slate-200'}>
                          {regularCount}
                        </span>
                        <span className="text-slate-500"> / {prog.approvedIntake} seats</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {superCount > 0 && <span className="text-teal-400 font-medium">+{superCount} Supernumerary &bull; </span>}
                        <span className={isOverIntake ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                          {pct}% utilized
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isOverIntake ? 'bg-rose-500' : pct > 90 ? 'bg-amber-400' : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                    {superCount > 0 && (
                      <div
                        className="h-full bg-teal-400 transition-all duration-500"
                        style={{ width: `${Math.min(25, (superCount / prog.approvedIntake) * 100)}%` }}
                        title={`${superCount} Supernumerary seats`}
                      />
                    )}
                  </div>

                  {isOverIntake && (
                    <div className="mt-2.5 flex items-center justify-between text-xs text-rose-300 bg-rose-950/40 border border-rose-900/60 px-2.5 py-1.5 rounded-lg">
                      <div className="flex items-center gap-1.5">
                        <AlertOctagon className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span>Intake Capacity Exceeded: {regularCount - prog.approvedIntake} excess regular admission recorded.</span>
                      </div>
                      <button
                        onClick={() => onNavigate('discrepancies')}
                        className="underline text-[11px] hover:text-white shrink-0 ml-2"
                      >
                        Investigate
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Sidebar: Categories & Fast Actions */}
        <div className="space-y-6">
          {/* Admission Category Distribution */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-3">Admission Quotas &amp; Categories</h3>
            <div className="space-y-2">
              {Object.entries(categoryCounts).map(([cat, count]) => {
                const total = instStudents.length || 1;
                const catPct = Math.round((count / total) * 100);
                return (
                  <div key={cat} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60">
                    <span className="text-slate-300 font-medium">{cat}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">{catPct}%</span>
                      <span className="w-8 text-right font-semibold text-white">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Outstanding Corrections & Actions */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-3">Institutional Action Center</h3>
            <div className="space-y-2.5">
              <button
                onClick={() => onNavigate('upload')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 text-blue-300 text-xs font-semibold transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-blue-400" />
                  <span>Upload New Batch Data</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onNavigate('gate')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition-colors"
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-400" />
                  <span>Test Admission Gate API</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onNavigate('digital-twin')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-teal-600/10 hover:bg-teal-600/20 border border-teal-500/30 text-teal-300 text-xs font-semibold transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-400" />
                  <span>Enrolment Digital Twin</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
