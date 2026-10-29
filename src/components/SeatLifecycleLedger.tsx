import React, { useState } from 'react';
import {
  Layers,
  ArrowRight,
  Building,
  CheckCircle2,
  Users,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  AlertOctagon,
} from 'lucide-react';
import { store } from '../services/store';

export const SeatLifecycleLedger: React.FC = () => {
  const state = store.getState();
  const [selectedInstId, setSelectedInstId] = useState(state.institutions[0].id);
  const activeInst = state.institutions.find((i) => i.id === selectedInstId) || state.institutions[0];

  const [selectedProgId, setSelectedProgId] = useState(activeInst.programmes[0]?.id || '');
  const activeProg = activeInst.programmes.find((p) => p.id === selectedProgId) || activeInst.programmes[0];

  // Calculate seat numbers for selected programme
  const progStudents = state.students.filter(
    (s) => s.institutionId === activeInst.id && s.programmeId === activeProg.id
  );

  const regularStudents = progStudents.filter((s) => !s.isSupernumerary);
  const superStudents = progStudents.filter((s) => s.isSupernumerary);

  const confirmedAdmissions = regularStudents.filter(
    (s) => s.admissionStatus === 'Admission Confirmed'
  ).length;

  const reportedEnrolments = regularStudents.filter(
    (s) => s.admissionStatus === 'Enrollment Reported'
  ).length;

  const provisionalAdmissions = regularStudents.filter(
    (s) => s.admissionStatus === 'Provisionally Admitted'
  ).length;

  const withdrawnAdmissions = regularStudents.filter(
    (s) => s.admissionStatus === 'Withdrawal Approved' || s.admissionStatus === 'Transfer Completed'
  ).length;

  const activeTotalRegular = confirmedAdmissions + reportedEnrolments + provisionalAdmissions;
  const availableVacant = Math.max(0, activeProg.approvedIntake - activeTotalRegular);
  const overIntakeDiscrepancy = Math.max(0, activeTotalRegular - activeProg.approvedIntake);

  // Supernumerary quota breakdown
  const superLimits = activeProg.supernumeraryLimits;
  const superUsed = {
    nri: superStudents.filter((s) => s.supernumeraryType === 'NRI').length,
    oci: superStudents.filter((s) => s.supernumeraryType === 'OCI').length,
    fn: superStudents.filter((s) => s.supernumeraryType === 'FN').length,
    tfw: superStudents.filter((s) => s.supernumeraryType === 'TFW').length,
    ews: superStudents.filter((s) => s.supernumeraryType === 'EWS').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-blue-400" />
            Statutory Seat Lifecycle Ledger
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Visual capacity-accounting ledger modeling seat transitions from AICTE sanction to enrolment, withdrawal, and vacation.
          </p>
        </div>

        {/* Institution & Programme Pickers */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedInstId}
            onChange={(e) => {
              setSelectedInstId(e.target.value);
              const inst = state.institutions.find((i) => i.id === e.target.value);
              if (inst && inst.programmes[0]) setSelectedProgId(inst.programmes[0].id);
            }}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
          >
            {state.institutions.map((i) => (
              <option key={i.id} value={i.id}>
                {i.code} — {i.name}
              </option>
            ))}
          </select>

          <select
            value={selectedProgId}
            onChange={(e) => setSelectedProgId(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
          >
            {activeInst.programmes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Visual Seat State Flow Diagram (Section 15) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-white">
          Seat State Progression Flow &mdash; {activeProg.name}
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Step 1: Approved */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center relative">
            <div className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">
              1. Approved
            </div>
            <div className="text-2xl font-extrabold text-white mt-1">
              {activeProg.approvedIntake}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Sanctioned APH</div>
          </div>

          {/* Step 2: Available Vacant */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center relative">
            <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
              2. Available
            </div>
            <div className="text-2xl font-extrabold text-emerald-300 mt-1">
              {availableVacant}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Open Capacity</div>
          </div>

          {/* Step 3: Provisional */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center relative">
            <div className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
              3. Provisional
            </div>
            <div className="text-2xl font-extrabold text-amber-300 mt-1">
              {provisionalAdmissions}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Offered / Pending</div>
          </div>

          {/* Step 4: Confirmed */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center relative">
            <div className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
              4. Confirmed
            </div>
            <div className="text-2xl font-extrabold text-indigo-300 mt-1">
              {confirmedAdmissions}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Fees &amp; Verified</div>
          </div>

          {/* Step 5: Reported */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center relative">
            <div className="text-[10px] uppercase font-bold text-teal-400 tracking-wider">
              5. Reported
            </div>
            <div className="text-2xl font-extrabold text-teal-300 mt-1">
              {reportedEnrolments}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Batch Sign-off</div>
          </div>

          {/* Step 6: Withdrawn / Vacated */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center relative">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              6. Withdrawn
            </div>
            <div className="text-2xl font-extrabold text-slate-300 mt-1">
              {withdrawnAdmissions}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Released Back</div>
          </div>
        </div>

        {/* Overcapacity Warning Banner */}
        {overIntakeDiscrepancy > 0 && (
          <div className="bg-rose-950/40 border border-rose-900/80 rounded-xl p-4 flex items-center justify-between text-xs text-rose-300">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0" />
              <span>
                Capacity Integrity Alert: Total active regular admissions ({activeTotalRegular}) exceed sanctioned intake ({activeProg.approvedIntake}) by <strong>{overIntakeDiscrepancy}</strong> seat(s).
              </span>
            </div>
            <span className="font-mono text-[10px] bg-rose-900/60 px-2 py-1 rounded text-rose-200">
              Rule: APH-2026-REG-CAPACITY
            </span>
          </div>
        )}
      </div>

      {/* Supernumerary Ledger Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div>
          <h2 className="text-sm font-bold text-white">
            Supernumerary Quota Segregation (Non-Fungible Allocations)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            AICTE guidelines prohibit supernumerary seats from being merged into regular general quotas.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {/* NRI */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <div className="text-xs font-semibold text-slate-300">NRI Quota (5%)</div>
            <div className="text-xl font-bold text-white mt-1">
              {superUsed.nri} <span className="text-xs text-slate-400 font-normal">/ {superLimits.nri} max</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-blue-400 h-full"
                style={{ width: `${Math.min(100, (superUsed.nri / (superLimits.nri || 1)) * 100)}%` }}
              />
            </div>
          </div>

          {/* OCI */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <div className="text-xs font-semibold text-slate-300">OCI Quota</div>
            <div className="text-xl font-bold text-white mt-1">
              {superUsed.oci} <span className="text-xs text-slate-400 font-normal">/ {superLimits.oci} max</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-indigo-400 h-full"
                style={{ width: `${Math.min(100, (superUsed.oci / (superLimits.oci || 1)) * 100)}%` }}
              />
            </div>
          </div>

          {/* FN */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <div className="text-xs font-semibold text-slate-300">Foreign National (FN)</div>
            <div className="text-xl font-bold text-white mt-1">
              {superUsed.fn} <span className="text-xs text-slate-400 font-normal">/ {superLimits.fn} max</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-purple-400 h-full"
                style={{ width: `${Math.min(100, (superUsed.fn / (superLimits.fn || 1)) * 100)}%` }}
              />
            </div>
          </div>

          {/* TFW */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <div className="text-xs font-semibold text-slate-300">TFW (Fee Waiver)</div>
            <div className="text-xl font-bold text-white mt-1">
              {superUsed.tfw} <span className="text-xs text-slate-400 font-normal">/ {superLimits.tfw} max</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-teal-400 h-full"
                style={{ width: `${Math.min(100, (superUsed.tfw / (superLimits.tfw || 1)) * 100)}%` }}
              />
            </div>
          </div>

          {/* EWS */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <div className="text-xs font-semibold text-slate-300">EWS (10% Quota)</div>
            <div className="text-xl font-bold text-white mt-1">
              {superUsed.ews} <span className="text-xs text-slate-400 font-normal">/ {superLimits.ews} max</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-400 h-full"
                style={{ width: `${Math.min(100, (superUsed.ews / (superLimits.ews || 1)) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
