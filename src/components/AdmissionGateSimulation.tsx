import React, { useState } from 'react';
import {
  DoorOpen,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
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
      // DTU CSE already has 21 students against 20 regular seats
      setSelectedInstId('INST-DEL-01');
      setSelectedProgId('PROG-DEL-CSE');
      setApaarId('APAAR-DEMO-0403');
      setStudentName('Overcapacity Test Student');
      setRollNumber('DTU/2026/CSE/OVER');
      setIsSupernumerary(false);
    } else if (type === 'DUAL_CONFLICT') {
      // APAAR-DEMO-0099 has active admission at DTU
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
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-900/60 text-indigo-300 border border-indigo-700/60">
              Regulatory Core Innovation
            </span>
            <span className="text-[11px] font-mono text-teal-400 bg-teal-950/60 px-2 py-0.5 rounded border border-teal-800/60">
              Idempotent Verification Gate
            </span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
            <DoorOpen className="w-6 h-6 text-blue-400" />
            AICTE Pre-Admission Gate Simulation
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Validates proposed student allotment in real-time against sanctioned programme capacity, active cross-institution enrollments, and statutory supernumerary quotas before an admission is finalized.
          </p>
        </div>

        {/* Quick Test Scenarios for Evaluators */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-slate-400 hidden sm:inline">Presets:</span>
          <button
            onClick={() => loadScenario('VALID')}
            className="px-2.5 py-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 rounded-lg text-xs font-semibold"
          >
            Eligible Student
          </button>
          <button
            onClick={() => loadScenario('CAPACITY_FULL')}
            className="px-2.5 py-1.5 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-lg text-xs font-semibold"
          >
            Intake Full Breach
          </button>
          <button
            onClick={() => loadScenario('DUAL_CONFLICT')}
            className="px-2.5 py-1.5 bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-800 rounded-lg text-xs font-semibold"
          >
            Dual Enrollment Conflict
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout: Gate Parameters Form & Gate Decision Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-blue-400" />
              Proposed Admission Allotment Payload
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <span>Key:</span>
              <span className="text-slate-200">{idempotencyKey}</span>
              <button
                onClick={handleGenerateNewKey}
                title="Generate fresh idempotency key"
                className="text-slate-400 hover:text-white"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Institution */}
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Institution:</label>
              <select
                value={selectedInstId}
                onChange={(e) => {
                  setSelectedInstId(e.target.value);
                  const inst = institutions.find((i) => i.id === e.target.value);
                  if (inst && inst.programmes[0]) setSelectedProgId(inst.programmes[0].id);
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
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
              <label className="font-semibold text-slate-300 block mb-1">Approved Programme:</label>
              <select
                value={selectedProgId}
                onChange={(e) => setSelectedProgId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
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
              <label className="font-semibold text-slate-300 block mb-1">Student Full Name:</label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>

            {/* APAAR Identifier */}
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Synthetic APAAR ID:</label>
              <input
                type="text"
                value={apaarId}
                onChange={(e) => setApaarId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
              />
            </div>

            {/* Roll Number */}
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Institutional Roll Number:</label>
              <input
                type="text"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
              />
            </div>

            {/* Proposed Admission Date */}
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Proposed Admission Date:</label>
              <input
                type="date"
                value={proposedDate}
                onChange={(e) => setProposedDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
              />
            </div>

            {/* Admission Quota */}
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Admission Category:</label>
              <select
                value={admissionCategory}
                onChange={(e) => setAdmissionCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
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
              <label className="font-semibold text-slate-300 block mb-1">Seat Classification:</label>
              <div className="flex items-center gap-3 pt-1">
                <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="superQuota"
                    checked={!isSupernumerary}
                    onChange={() => setIsSupernumerary(false)}
                  />
                  <span>Regular Sanctioned</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
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
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
              <label className="font-semibold text-teal-300 block mb-1">
                Supernumerary Quota Classification:
              </label>
              <select
                value={supernumeraryType}
                onChange={(e) => setSupernumeraryType(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white"
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
              className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30 transition-all"
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
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                Gate Decision &amp; Verification Rationale
              </h2>
              {gateResult?.idempotencyCached && (
                <span className="text-[10px] font-mono bg-indigo-900/60 text-indigo-300 px-2 py-0.5 rounded border border-indigo-700/60">
                  Idempotent Cache Hit
                </span>
              )}
            </div>

            {!gateResult ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
                <DoorOpen className="w-10 h-10 stroke-1 text-slate-600" />
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
                      ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
                      : gateResult.status === 'Warning — Review Required'
                      ? 'bg-amber-950/40 border-amber-800/80 text-amber-300'
                      : 'bg-rose-950/40 border-rose-800/80 text-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {gateResult.eligible ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                    )}
                    <span>{gateResult.status}</span>
                  </div>

                  {gateResult.reservationId && (
                    <div className="text-xs mt-2 font-mono text-emerald-400">
                      Temporary Reservation ID: <strong>{gateResult.reservationId}</strong>
                    </div>
                  )}
                </div>

                {/* Capacity Breakdown */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <h4 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
                    Intake Capacity Inspection
                  </h4>
                  <div className="grid grid-cols-3 gap-2 text-center pt-1">
                    <div className="bg-slate-900 p-2 rounded-lg">
                      <div className="text-slate-400 text-[10px]">Sanctioned</div>
                      <div className="text-base font-bold text-white mt-0.5">
                        {gateResult.capacityCheck.approvedIntake}
                      </div>
                    </div>
                    <div className="bg-slate-900 p-2 rounded-lg">
                      <div className="text-slate-400 text-[10px]">Occupied</div>
                      <div className="text-base font-bold text-slate-200 mt-0.5">
                        {gateResult.capacityCheck.currentEnrolled}
                      </div>
                    </div>
                    <div className="bg-slate-900 p-2 rounded-lg">
                      <div className="text-slate-400 text-[10px]">Available</div>
                      <div className={`text-base font-bold mt-0.5 ${gateResult.capacityCheck.availableSeats > 0 ? 'text-teal-400' : 'text-rose-400'}`}>
                        {gateResult.capacityCheck.availableSeats}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reasons List */}
                <div className="space-y-1.5">
                  <h4 className="font-semibold text-slate-300 text-xs">
                    Regulatory Reasons &amp; Findings:
                  </h4>
                  <ul className="space-y-1 text-xs text-slate-400">
                    {gateResult.reasons.map((r, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                        <span className="text-blue-400 font-bold">&bull;</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-500">
            Audit Trail: All admission gate queries are cryptographically logged with caller email and SHA-256 state digest.
          </div>
        </div>
      </div>
    </div>
  );
};
