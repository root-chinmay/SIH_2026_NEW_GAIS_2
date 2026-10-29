import React, { useState } from 'react';
import {
  Layers,
  ArrowRight,
  Building,
  Building2,
  CheckCircle2,
  Users,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  AlertOctagon,
  Sparkles,
  Search,
} from 'lucide-react';
import { store } from '../services/store';

export const SeatLifecycleLedger: React.FC = () => {
  const state = store.getState();
  const [selectedInstId, setSelectedInstId] = useState(state.institutions[0].id);
  const activeInst = state.institutions.find((i) => i.id === selectedInstId) || state.institutions[0];

  const [selectedProgId, setSelectedProgId] = useState(activeInst.programmes[0]?.id || '');
  const activeProg = activeInst.programmes.find((p) => p.id === selectedProgId) || activeInst.programmes[0];

  // National Vacant-Seat Extension State (Demonstration Only)
  const [vacancyFilterBranch, setVacancyFilterBranch] = useState('ALL');
  const [candidatePercentile, setCandidatePercentile] = useState(88.5);
  const [candidateCategory, setCandidateCategory] = useState('General');
  const [matchedToken, setMatchedToken] = useState<string | null>(null);

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
      <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs text-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-blue-600" />
            Statutory Seat Lifecycle Ledger
          </h1>
          <p className="text-xs text-slate-500 mt-1">
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
            className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:bg-white focus:border-blue-600"
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
            className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:bg-white focus:border-blue-600"
          >
            {activeInst.programmes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Visual Seat State Flow Diagram */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs text-slate-800">
        <h2 className="text-sm font-bold text-slate-900">
          Seat State Progression Flow &mdash; {activeProg.name}
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Step 1: Approved */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center relative shadow-2xs">
            <div className="text-[10px] uppercase font-bold text-blue-700 tracking-wider">
              1. Approved
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              {activeProg.approvedIntake}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Sanctioned APH</div>
          </div>

          {/* Step 2: Available Vacant */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center relative shadow-2xs">
            <div className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">
              2. Available
            </div>
            <div className="text-2xl font-extrabold text-emerald-700 mt-1">
              {availableVacant}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Open Capacity</div>
          </div>

          {/* Step 3: Provisional */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center relative shadow-2xs">
            <div className="text-[10px] uppercase font-bold text-amber-700 tracking-wider">
              3. Provisional
            </div>
            <div className="text-2xl font-extrabold text-amber-700 mt-1">
              {provisionalAdmissions}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Offered / Pending</div>
          </div>

          {/* Step 4: Confirmed */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center relative shadow-2xs">
            <div className="text-[10px] uppercase font-bold text-indigo-700 tracking-wider">
              4. Confirmed
            </div>
            <div className="text-2xl font-extrabold text-indigo-700 mt-1">
              {confirmedAdmissions}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Fees &amp; Verified</div>
          </div>

          {/* Step 5: Reported */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center relative shadow-2xs">
            <div className="text-[10px] uppercase font-bold text-teal-700 tracking-wider">
              5. Reported
            </div>
            <div className="text-2xl font-extrabold text-teal-700 mt-1">
              {reportedEnrolments}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Batch Sign-off</div>
          </div>

          {/* Step 6: Withdrawn / Vacated */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center relative shadow-2xs">
            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              6. Withdrawn
            </div>
            <div className="text-2xl font-extrabold text-slate-700 mt-1">
              {withdrawnAdmissions}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Released Back</div>
          </div>
        </div>

        {/* Overcapacity Warning Banner */}
        {overIntakeDiscrepancy > 0 && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center justify-between text-xs text-rose-800">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0" />
              <span>
                Capacity Integrity Alert: Total active regular admissions ({activeTotalRegular}) exceed sanctioned intake ({activeProg.approvedIntake}) by <strong>{overIntakeDiscrepancy}</strong> seat(s).
              </span>
            </div>
            <span className="font-mono text-[10px] bg-rose-100 px-2 py-1 rounded text-rose-800 border border-rose-200 font-semibold">
              Rule: APH-2026-REG-CAPACITY
            </span>
          </div>
        )}
      </div>

      {/* Supernumerary Ledger Breakdown */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs text-slate-800">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            Supernumerary Quota Segregation (Non-Fungible Allocations)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            AICTE guidelines prohibit supernumerary seats from being merged into regular general quotas.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {/* NRI */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="text-xs font-semibold text-slate-700">NRI Quota (5%)</div>
            <div className="text-xl font-bold text-slate-900 mt-1">
              {superUsed.nri} <span className="text-xs text-slate-500 font-normal">/ {superLimits.nri} max</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-blue-600 h-full"
                style={{ width: `${Math.min(100, (superUsed.nri / (superLimits.nri || 1)) * 100)}%` }}
              />
            </div>
          </div>

          {/* OCI */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="text-xs font-semibold text-slate-700">OCI Quota</div>
            <div className="text-xl font-bold text-slate-900 mt-1">
              {superUsed.oci} <span className="text-xs text-slate-500 font-normal">/ {superLimits.oci} max</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-full"
                style={{ width: `${Math.min(100, (superUsed.oci / (superLimits.oci || 1)) * 100)}%` }}
              />
            </div>
          </div>

          {/* FN */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="text-xs font-semibold text-slate-700">Foreign National (FN)</div>
            <div className="text-xl font-bold text-slate-900 mt-1">
              {superUsed.fn} <span className="text-xs text-slate-500 font-normal">/ {superLimits.fn} max</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-purple-600 h-full"
                style={{ width: `${Math.min(100, (superUsed.fn / (superLimits.fn || 1)) * 100)}%` }}
              />
            </div>
          </div>

          {/* TFW */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="text-xs font-semibold text-slate-700">TFW (Fee Waiver)</div>
            <div className="text-xl font-bold text-slate-900 mt-1">
              {superUsed.tfw} <span className="text-xs text-slate-500 font-normal">/ {superLimits.tfw} max</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-teal-600 h-full"
                style={{ width: `${Math.min(100, (superUsed.tfw / (superLimits.tfw || 1)) * 100)}%` }}
              />
            </div>
          </div>

          {/* EWS */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="text-xs font-semibold text-slate-700">EWS (10% Quota)</div>
            <div className="text-xl font-bold text-slate-900 mt-1">
              {superUsed.ews} <span className="text-xs text-slate-500 font-normal">/ {superLimits.ews} max</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-600 h-full"
                style={{ width: `${Math.min(100, (superUsed.ews / (superLimits.ews || 1)) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* National Vacant-Seat & Eligibility Extension */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-xs text-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-600" />
                National Vacant-Seat &amp; Eligibility Matching Ledger
              </h2>
              <span className="text-[10px] font-mono uppercase bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-semibold">
                Demonstration Extension Only
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
              While the core APAAR integrity platform operates as an independent regulatory clearinghouse, a shared vacant-seat ledger demonstrates how transparent, verifiable intake telemetry could eliminate administrative chaos during institutional spot rounds and stray vacancy counseling.
            </p>
          </div>
        </div>

        {/* Spot-Round Matching Filter */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
          <div>
            <label className="text-slate-600 font-medium block mb-1">
              Branch / Discipline Filter:
            </label>
            <select
              value={vacancyFilterBranch}
              onChange={(e) => setVacancyFilterBranch(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 focus:border-blue-600"
            >
              <option value="ALL">All Engineering Disciplines</option>
              <option value="Computer">Computer Science &amp; AI</option>
              <option value="Mechanical">Mechanical Engineering</option>
              <option value="Electrical">Electrical &amp; Electronics</option>
              <option value="Civil">Civil Engineering</option>
            </select>
          </div>

          <div>
            <label className="text-slate-600 font-medium block mb-1">
              Candidate Entrance Percentile:
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={candidatePercentile}
              onChange={(e) => setCandidatePercentile(parseFloat(e.target.value) || 0)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 font-mono focus:border-blue-600"
            />
          </div>

          <div>
            <label className="text-slate-600 font-medium block mb-1">
              Candidate Quota Category:
            </label>
            <select
              value={candidateCategory}
              onChange={(e) => setCandidateCategory(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 focus:border-blue-600"
            >
              <option value="General">General / Open</option>
              <option value="OBC">OBC-NCL</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
              <option value="EWS">EWS</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                const token = `SPOT-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 899 + 100)}`;
                setMatchedToken(token);
              }}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <Sparkles className="w-4 h-4" />
              Generate Spot Pass
            </button>
          </div>
        </div>

        {/* Issued Spot-Round Pass Badge if generated */}
        {matchedToken && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="font-semibold text-slate-900">
                  Spot-Round Verification Token Issued:
                </span>{' '}
                <span className="font-mono text-emerald-800 font-bold">{matchedToken}</span>
                <span className="text-slate-500 block text-[11px]">
                  Eligible for instant automated admission gate clearance at verified participating institutions.
                </span>
              </div>
            </div>
            <button
              onClick={() => setMatchedToken(null)}
              className="text-xs text-slate-500 hover:text-slate-800 underline ml-3 font-medium"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Multi-Institution Vacant Seat Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-blue-50/70 text-blue-950 border-b border-blue-100 font-semibold">
              <tr>
                <th className="p-3">AICTE Institution</th>
                <th className="p-3">Sanctioned Programme</th>
                <th className="p-3 text-center">Approved Intake</th>
                <th className="p-3 text-center">Enrolled</th>
                <th className="p-3 text-center">Vacant Seats</th>
                <th className="p-3 text-center">Spot Round Eligibility</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {state.institutions.flatMap((inst) =>
                inst.programmes
                  .filter((p) =>
                    vacancyFilterBranch === 'ALL'
                      ? true
                      : p.name.toLowerCase().includes(vacancyFilterBranch.toLowerCase())
                  )
                  .map((prog) => {
                    const confirmed = state.students.filter(
                      (s) =>
                        s.institutionId === inst.id &&
                        s.programmeId === prog.id &&
                        !s.isSupernumerary &&
                        (s.admissionStatus === 'Admission Confirmed' ||
                          s.admissionStatus === 'Enrollment Reported' ||
                          s.admissionStatus === 'Provisionally Admitted')
                    ).length;
                    const vacant = Math.max(0, prog.approvedIntake - confirmed);
                    const cutoff = prog.name.includes('Computer')
                      ? 80.0
                      : prog.name.includes('Mechanical')
                      ? 65.0
                      : 60.0;
                    const isEligible = candidatePercentile >= cutoff && vacant > 0;

                    return (
                      <tr key={`${inst.id}-${prog.id}`} className="hover:bg-blue-50/30 transition-colors">
                        <td className="p-3">
                          <div className="font-semibold text-slate-900">{inst.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {inst.code} &bull; {inst.state}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="font-medium text-slate-900">{prog.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{prog.degree}</div>
                        </td>
                        <td className="p-3 text-center font-mono">{prog.approvedIntake}</td>
                        <td className="p-3 text-center font-mono text-slate-700">{confirmed}</td>
                        <td className="p-3 text-center">
                          <span
                            className={`font-mono font-bold px-2 py-0.5 rounded ${
                              vacant > 0
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-rose-50 text-rose-800 border border-rose-200'
                            }`}
                          >
                            {vacant}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          {isEligible ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                              <CheckCircle2 className="w-3 h-3" />
                              Eligible ({cutoff}% Cutoff)
                            </span>
                          ) : vacant === 0 ? (
                            <span className="text-[11px] text-slate-400 font-medium">Capacity Full</span>
                          ) : (
                            <span className="text-[11px] text-amber-700 font-medium">
                              Below Cutoff ({cutoff}%)
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            disabled={!isEligible}
                            onClick={() => {
                              alert(`Simulated Spot-Round Interest logged for ${inst.code} - ${prog.name}. In production, this issues an immediate Admission Gate token.`);
                            }}
                            className={`text-[11px] font-semibold px-2.5 py-1 rounded transition-colors ${
                              isEligible
                                ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-2xs'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                          >
                            Apply Spot
                          </button>
                        </td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>

        {/* Statutory Guard Notice */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 flex items-center justify-between">
          <span>
            <strong>Statutory Boundary Notice:</strong> This vacant-seat matching ledger is an optional conceptual extension and does not alter institutional admission autonomy or state counseling reservation quotas.
          </span>
          <span className="font-mono text-slate-400 shrink-0 ml-4">
            AICTE Regulatory Extension
          </span>
        </div>
      </div>
    </div>
  );
};
