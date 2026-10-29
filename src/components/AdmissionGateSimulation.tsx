import React, { useState } from 'react';
import {
  DoorOpen,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  Building,
  Key,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { store, AdmissionGateDecision, AdmissionGateRequest } from '../services/store';

export const AdmissionGateSimulation: React.FC = () => {
  const state = store.getState();
  const institutions = state.institutions;

  const [selectedInstId, setSelectedInstId] = useState(institutions[0].id);
  const activeInst = institutions.find((i) => i.id === selectedInstId) || institutions[0];

  const [selectedProgId, setSelectedProgId] = useState(activeInst.programmes[0]?.id || '');
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [apaarId, setApaarId] = useState('APAAR-DEMO-0401');
  const [studentName, setStudentName] = useState('Nandini Sen');
  const [rollNumber, setRollNumber] = useState('DTU/2026/CSE/401');
  const [admissionCategory, setAdmissionCategory] = useState('General');
  const [isSupernumerary, setIsSupernumerary] = useState(false);
  const [supernumeraryType, setSupernumeraryType] = useState<'NRI' | 'OCI' | 'FN' | 'TFW' | 'EWS'>('NRI');
  const [proposedDate, setProposedDate] = useState('2026-08-01');
  const [idempotencyKey, setIdempotencyKey] = useState(`GATE-IDEM-${Date.now().toString().slice(-6)}`);

  const [isEvaluating, setIsEvaluating] = useState(false);
  const [gateResult, setGateResult] = useState<AdmissionGateDecision | null>(null);

  // Dual-Override Modal states
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideReason, setOverrideReason] = useState('Special State Counseling Allotment Order CS-2026-88');
  const [aicteOfficer, setAicteOfficer] = useState('Dr. Anita Roy (AICTE Member Secretary)');

  const handleExecuteOverride = () => {
    if (!gateResult) return;
    const updated = store.executeGateOverride(
      idempotencyKey,
      overrideReason,
      aicteOfficer
    );
    if (updated) {
      setGateResult({ ...updated });
    }
    setShowOverrideModal(false);
  };

  const handleTestGate = () => {
    setIsEvaluating(true);
    setTimeout(() => {
      const req: AdmissionGateRequest = {
        idempotencyKey,
        institutionId: selectedInstId,
        programmeId: selectedProgId,
        academicYear,
        apaarId,
        studentName,
        institutionalStudentId: rollNumber,
        admissionCategory,
        isSupernumerary,
        supernumeraryType: isSupernumerary ? supernumeraryType : undefined,
        proposedAdmissionDate: proposedDate,
        seatCategory: isSupernumerary ? supernumeraryType : 'Regular',
      };

      const decision = store.evaluateAdmissionGate(req);
      setGateResult(decision);
      setIsEvaluating(false);
    }, 400);
  };

  const handleGenerateNewKey = () => {
    setIdempotencyKey(`GATE-IDEM-${Date.now().toString().slice(-6)}`);
  };

  // Preset scenarios to let SIH evaluators test edge cases with one click
  const loadScenario = (type: 'VALID' | 'CAPACITY_FULL' | 'DUAL_CONFLICT') => {
    handleGenerateNewKey();
    if (type === 'VALID') {
      setSelectedInstId('INST-MAH-02');
      setSelectedProgId('PROG-MAH-MECH');
      setApaarId('APAAR-DEMO-0402');
      setStudentName('Aditya Deshmukh');
      setRollNumber('MIT/2026/MECH/402');
      setIsSupernumerary(false);
    } else if (type === 'CAPACITY_FULL') {
      setSelectedInstId('INST-DEL-01');
      setSelectedProgId('PROG-DEL-CSE');
      setApaarId('APAAR-DEMO-0403');
      setStudentName('Overcapacity Test Student');
      setRollNumber('DTU/2026/CSE/OVER');
      setIsSupernumerary(false);
    } else if (type === 'DUAL_CONFLICT') {
      setSelectedInstId('INST-KAR-03');
      setSelectedProgId('PROG-KAR-ISE');
      setApaarId('APAAR-DEMO-0099');
      setStudentName('Sameer Singhania (Dual Conflict)');
      setRollNumber('BCE/2026/ISE/990');
      setIsSupernumerary(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs text-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
              Regulatory Core Innovation
            </span>
            <span className="text-[11px] font-mono text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 font-semibold">
              Idempotent Verification Gate
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-2">
            <DoorOpen className="w-6 h-6 text-blue-600" />
            AICTE Pre-Admission Gate Simulation
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Validates proposed student allotment in real-time against sanctioned programme capacity, active cross-institution enrollments, and statutory supernumerary quotas before an admission is finalized.
          </p>
        </div>

        {/* Quick Test Scenarios for Evaluators */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">Presets:</span>
          <button
            onClick={() => loadScenario('VALID')}
            className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
          >
            Eligible Student
          </button>
          <button
            onClick={() => loadScenario('CAPACITY_FULL')}
            className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
          >
            Intake Full Breach
          </button>
          <button
            onClick={() => loadScenario('DUAL_CONFLICT')}
            className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
          >
            Dual Conflict
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs text-slate-800">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Key className="w-4 h-4 text-blue-600" />
              Proposed Admission Allotment Payload
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
              <span>Key:</span>
              <span className="text-slate-800 font-medium">{idempotencyKey}</span>
              <button
                onClick={handleGenerateNewKey}
                title="Generate fresh idempotency key"
                className="text-slate-400 hover:text-slate-700"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Institution */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Institution:</label>
              <select
                value={selectedInstId}
                onChange={(e) => {
                  setSelectedInstId(e.target.value);
                  const inst = institutions.find((i) => i.id === e.target.value);
                  if (inst && inst.programmes[0]) setSelectedProgId(inst.programmes[0].id);
                }}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-600"
              >
                {institutions.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.code} — {i.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Programme */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Approved Programme:</label>
              <select
                value={selectedProgId}
                onChange={(e) => setSelectedProgId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-600"
              >
                {activeInst.programmes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Cap: {p.approvedIntake})
                  </option>
                ))}
              </select>
            </div>

            {/* Student Name */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Student Full Name:</label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-600"
              />
            </div>

            {/* APAAR Identifier */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Synthetic APAAR ID:</label>
              <input
                type="text"
                value={apaarId}
                onChange={(e) => setApaarId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-mono focus:bg-white focus:border-blue-600"
              />
            </div>

            {/* Roll Number */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Institutional Roll Number:</label>
              <input
                type="text"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-mono focus:bg-white focus:border-blue-600"
              />
            </div>

            {/* Proposed Admission Date */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Proposed Admission Date:</label>
              <input
                type="date"
                value={proposedDate}
                onChange={(e) => setProposedDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-mono focus:bg-white focus:border-blue-600"
              />
            </div>

            {/* Admission Quota */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Admission Category:</label>
              <select
                value={admissionCategory}
                onChange={(e) => setAdmissionCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-600"
              >
                <option value="General">General</option>
                <option value="OBC-NCL">OBC-NCL</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="EWS">EWS</option>
                <option value="TFW">TFW</option>
                <option value="NRI">NRI</option>
              </select>
            </div>

            {/* Supernumerary Toggle */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Seat Classification:</label>
              <div className="flex items-center gap-3 pt-1">
                <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="superQuota"
                    checked={!isSupernumerary}
                    onChange={() => setIsSupernumerary(false)}
                  />
                  <span>Regular Sanctioned</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="superQuota"
                    checked={isSupernumerary}
                    onChange={() => setIsSupernumerary(true)}
                  />
                  <span>Supernumerary</span>
                </label>
              </div>
            </div>
          </div>

          {isSupernumerary && (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <label className="font-semibold text-teal-800 block mb-1">
                Supernumerary Quota Classification:
              </label>
              <select
                value={supernumeraryType}
                onChange={(e) => setSupernumeraryType(e.target.value as any)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800"
              >
                <option value="NRI">NRI (Non-Resident Indian)</option>
                <option value="OCI">OCI (Overseas Citizen of India)</option>
                <option value="FN">FN (Foreign National)</option>
                <option value="TFW">TFW (Tuition Fee Waiver)</option>
                <option value="EWS">EWS (Economically Weaker Section)</option>
              </select>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={handleTestGate}
              disabled={isEvaluating}
              className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
            >
              {isEvaluating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Evaluating Regulatory Rules...
                </>
              ) : (
                <>
                  <DoorOpen className="w-4 h-4" />
                  Execute Admission Gate Evaluation
                </>
              )}
            </button>
          </div>
        </div>

        {/* Structured Gate Decision Output */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between shadow-xs text-slate-800">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                Gate Decision &amp; Verification Rationale
              </h2>
              {gateResult?.idempotencyCached && (
                <span className="text-[10px] font-mono bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-200 font-medium">
                  Idempotent Cache Hit
                </span>
              )}
            </div>

            {!gateResult ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
                <DoorOpen className="w-10 h-10 stroke-1 text-slate-300" />
                <p className="text-xs">
                  Awaiting payload submission. Select a preset or customize parameters and click "Execute Admission Gate Evaluation".
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Decision Badge Card */}
                <div
                  className={`p-4 rounded-xl border ${
                    gateResult.status === 'Eligible to Proceed'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : gateResult.status === 'Warning — Review Required'
                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {gateResult.eligible ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    )}
                    <span>{gateResult.status}</span>
                  </div>

                  {gateResult.reservationId && (
                    <div className="text-xs mt-2 font-mono text-emerald-800 font-semibold">
                      Temporary Reservation ID: <strong>{gateResult.reservationId}</strong>
                    </div>
                  )}
                </div>

                {/* Capacity Breakdown */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <h4 className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
                    Intake Capacity Inspection
                  </h4>
                  <div className="grid grid-cols-3 gap-2 text-center pt-1">
                    <div className="bg-white border border-slate-200 p-2 rounded-lg">
                      <div className="text-slate-500 text-[10px]">Sanctioned</div>
                      <div className="text-base font-bold text-slate-900 mt-0.5">
                        {gateResult.capacityCheck.approvedIntake}
                      </div>
                    </div>
                    <div className="bg-white border border-slate-200 p-2 rounded-lg">
                      <div className="text-slate-500 text-[10px]">Occupied</div>
                      <div className="text-base font-bold text-slate-800 mt-0.5">
                        {gateResult.capacityCheck.currentEnrolled}
                      </div>
                    </div>
                    <div className="bg-white border border-slate-200 p-2 rounded-lg">
                      <div className="text-slate-500 text-[10px]">Available</div>
                      <div className={`text-base font-bold mt-0.5 ${gateResult.capacityCheck.availableSeats > 0 ? 'text-teal-700' : 'text-rose-600'}`}>
                        {gateResult.capacityCheck.availableSeats}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reasons List */}
                <div className="space-y-1.5">
                  <h4 className="font-semibold text-slate-700 text-xs">
                    Regulatory Reasons &amp; Findings:
                  </h4>
                  <ul className="space-y-1 text-xs text-slate-600">
                    {gateResult.reasons.map((r, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                        <span className="text-blue-600 font-bold">&bull;</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Dual Override Action */}
                {!gateResult.eligible && (
                  <div className="pt-2">
                    <button
                      onClick={() => setShowOverrideModal(true)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition-all shadow-2xs"
                    >
                      <ShieldAlert className="w-4 h-4 text-amber-600" />
                      Initiate Dual-Approval Regulatory Override Workflow
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400">
            Audit Trail: All admission gate queries are cryptographically logged with caller email and SHA-256 state digest.
          </div>
        </div>
      </div>

      {/* Dual Override Modal */}
      {showOverrideModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
                Emergency Regulatory Override (Dual Approval)
              </h2>
              <button
                onClick={() => setShowOverrideModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Section 14 of the AICTE framework permits emergency exceptions (e.g. court/state counseling directives) requiring verified reasons and two independent authorizations. This does <strong>not</strong> silently alter statutory intake.
            </p>

            <div className="space-y-3 pt-2 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  1. Institutional Signatory / Dean Justification:
                </label>
                <textarea
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 h-20 focus:bg-white focus:border-blue-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  2. AICTE Regulatory Officer Authorization:
                </label>
                <input
                  type="text"
                  value={aicteOfficer}
                  onChange={(e) => setAicteOfficer(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-600"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200">
              <button
                onClick={() => setShowOverrideModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteOverride}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-xs"
              >
                Execute Dual Override
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
