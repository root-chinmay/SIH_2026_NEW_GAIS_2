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
  const isNationalRole =
    state.currentUser.role === 'AICTE_ADMIN' || state.currentUser.role === 'AICTE_AUDITOR';

  const [selectedInstId, setSelectedInstId] = useState<string>(
    isNationalRole ? currentInstId : currentInstId
  );
  const activeInstitution =
    (isNationalRole
      ? state.institutions.find((i) => i.id === selectedInstId)
      : state.institutions.find((i) => i.id === currentInstId)) || state.institutions[0];

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 shadow-2xs">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                {activeInstitution.name}
              </h1>
              <span className="text-xs font-mono bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-200 font-medium">
                {activeInstitution.code}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {activeInstitution.district}, {activeInstitution.state} &bull; Type: {activeInstitution.type} &bull; Signatory: {activeInstitution.authorizedSignatory}
            </p>
          </div>
        </div>

        {/* Institution selector */}
        {isNationalRole ? (
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 font-medium">View Institution:</label>
            <select
              value={selectedInstId}
              onChange={(e) => setSelectedInstId(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600 cursor-pointer shadow-2xs"
            >
              {state.institutions.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.code} — {inst.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700">
            <span className="font-semibold text-slate-900">{activeInstitution.code}</span>
            <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded border border-blue-200 font-mono font-medium">
              Tenant Scoped
            </span>
          </div>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Approved Intake */}
        <div
          onClick={() => onNavigate('ledger')}
          className="cursor-pointer bg-white hover:bg-blue-50/40 border border-slate-200 hover:border-blue-400 rounded-xl p-4 transition-all shadow-xs"
        >
          <div className="text-xs text-slate-500 font-medium">Approved Intake</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{totalApprovedIntake}</div>
          <div className="text-[11px] text-blue-700 mt-1 flex items-center gap-1 font-medium">
            <span>{activeInstitution.programmes.length} Programmes</span>
          </div>
        </div>

        {/* Reported Enrolment */}
        <div
          onClick={() => onNavigate('students')}
          className="cursor-pointer bg-white hover:bg-indigo-50/40 border border-slate-200 hover:border-indigo-400 rounded-xl p-4 transition-all shadow-xs"
        >
          <div className="text-xs text-slate-500 font-medium">Reported Enrolment</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{totalReportedEnrolment}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Utilization: <strong className={seatUtilizationPct > 100 ? 'text-rose-600' : 'text-emerald-700'}>{seatUtilizationPct}%</strong>
          </div>
        </div>

        {/* Passed Local Validation */}
        <div
          onClick={() => onNavigate('students')}
          className="cursor-pointer bg-white hover:bg-emerald-50/40 border border-slate-200 hover:border-emerald-400 rounded-xl p-4 transition-all shadow-xs"
        >
          <div className="text-xs text-slate-500 font-medium">Valid Records</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{validRecords}</div>
          <div className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle className="w-3 h-3" />
            <span>Passed 7 Stages</span>
          </div>
        </div>

        {/* Potential Duplicates */}
        <div
          onClick={() => onNavigate('discrepancies')}
          className="cursor-pointer bg-white hover:bg-rose-50/40 border border-slate-200 hover:border-rose-400 rounded-xl p-4 transition-all shadow-xs"
        >
          <div className="text-xs text-slate-500 font-medium">Duplicate Conflicts</div>
          <div className="text-2xl font-bold text-rose-600 mt-1">{crossDuplicates}</div>
          <div className="text-[11px] text-rose-700 mt-1 flex items-center gap-1 font-medium">
            <AlertOctagon className="w-3 h-3" />
            <span>Cross-Inst Alert</span>
          </div>
        </div>

        {/* Malformed / Missing APAAR */}
        <div
          onClick={() => onNavigate('students')}
          className="cursor-pointer bg-white hover:bg-amber-50/40 border border-slate-200 hover:border-amber-400 rounded-xl p-4 transition-all shadow-xs"
        >
          <div className="text-xs text-slate-500 font-medium">Missing/Malformed</div>
          <div className="text-2xl font-bold text-amber-700 mt-1">{missingOrMalformedApaar}</div>
          <div className="text-[11px] text-amber-700 mt-1 flex items-center gap-1 font-medium">
            <AlertTriangle className="w-3 h-3" />
            <span>Format Error</span>
          </div>
        </div>

        {/* Awaiting Signatory / Review */}
        <div
          onClick={() => onNavigate('batch-review')}
          className="cursor-pointer bg-white hover:bg-purple-50/40 border border-slate-200 hover:border-purple-400 rounded-xl p-4 transition-all shadow-xs"
        >
          <div className="text-xs text-slate-500 font-medium">Awaiting Signatory</div>
          <div className="text-2xl font-bold text-purple-700 mt-1">{pendingSignatoryBatches}</div>
          <div className="text-[11px] text-purple-700 mt-1 font-medium">Batches Pending</div>
        </div>
      </div>

      {/* Two Column Layout: Programme Capacity & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Programme-wise Enrolment Bars */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                Programme-Wise Approved Intake vs Enrolment
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Monitoring seat capacity and regular vs supernumerary admissions
              </p>
            </div>
            <button
              onClick={() => onNavigate('ledger')}
              className="text-xs text-blue-700 hover:text-blue-800 font-semibold flex items-center gap-1"
            >
              View Full Ledger &rarr;
            </button>
          </div>

          <div className="space-y-4">
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
                <div key={prog.id} className="bg-slate-50/70 border border-slate-200 rounded-xl p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                    <div>
                      <div className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                        <span>{prog.name}</span>
                        <span className="text-[10px] font-mono bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-medium">
                          {prog.code}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Sanctioned Regular Intake: <strong className="text-slate-700">{prog.approvedIntake}</strong> &bull; Supernumerary Cap: {prog.supernumeraryLimits.nri + prog.supernumeraryLimits.tfw + prog.supernumeraryLimits.ews}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">
                        <span className={isOverIntake ? 'text-rose-600' : 'text-slate-800'}>
                          {regularCount}
                        </span>
                        <span className="text-slate-500"> / {prog.approvedIntake} seats</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {superCount > 0 && <span className="text-teal-700 font-semibold">+{superCount} Supernumerary &bull; </span>}
                        <span className={isOverIntake ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                          {pct}% utilized
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isOverIntake ? 'bg-rose-500' : pct > 90 ? 'bg-amber-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                    {superCount > 0 && (
                      <div
                        className="h-full bg-teal-500 transition-all duration-500"
                        style={{ width: `${Math.min(25, (superCount / prog.approvedIntake) * 100)}%` }}
                        title={`${superCount} Supernumerary seats`}
                      />
                    )}
                  </div>

                  {isOverIntake && (
                    <div className="mt-2.5 flex items-center justify-between text-xs text-rose-800 bg-rose-50 border border-rose-200 px-2.5 py-1.5 rounded-lg">
                      <div className="flex items-center gap-1.5 font-medium">
                        <AlertOctagon className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>Intake Capacity Exceeded: {regularCount - prog.approvedIntake} excess regular admission recorded.</span>
                      </div>
                      <button
                        onClick={() => onNavigate('discrepancies')}
                        className="underline text-[11px] hover:text-rose-950 font-bold shrink-0 ml-2"
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
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Admission Quotas &amp; Categories</h3>
            <div className="space-y-2">
              {Object.entries(categoryCounts).map(([cat, count]) => {
                const total = instStudents.length || 1;
                const catPct = Math.round((count / total) * 100);
                return (
                  <div key={cat} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
                    <span className="text-slate-700 font-medium">{cat}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">{catPct}%</span>
                      <span className="w-8 text-right font-semibold text-slate-900">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Outstanding Corrections & Actions */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Institutional Action Center</h3>
            <div className="space-y-2.5">
              <button
                onClick={() => onNavigate('upload')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-xs font-semibold transition-colors shadow-2xs"
              >
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                  <span>Upload New Batch Data</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
              </button>

              <button
                onClick={() => onNavigate('gate')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 text-xs font-semibold transition-colors shadow-2xs"
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  <span>Test Admission Gate API</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-indigo-600" />
              </button>

              <button
                onClick={() => onNavigate('digital-twin')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 text-xs font-semibold transition-colors shadow-2xs"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  <span>Enrolment Digital Twin</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-teal-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
