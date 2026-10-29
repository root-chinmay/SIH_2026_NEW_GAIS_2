import React, { useState } from 'react';
import {
  Cpu,
  RotateCcw,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  Sliders,
  Layers,
} from 'lucide-react';
import { store, WhatIfScenario } from '../services/store';

export const DigitalTwinSimulator: React.FC = () => {
  const state = store.getState();
  const institutions = state.institutions;

  const [selectedInstId, setSelectedInstId] = useState(institutions[0].id);
  const activeInst = institutions.find((i) => i.id === selectedInstId) || institutions[0];

  const [selectedProgId, setSelectedProgId] = useState(activeInst.programmes[0]?.id || '');
  const activeProg = activeInst.programmes.find((p) => p.id === selectedProgId) || activeInst.programmes[0];

  // Simulation Sliders
  const [additionalAdmissions, setAdditionalAdmissions] = useState(0);
  const [projectedWithdrawals, setProjectedWithdrawals] = useState(0);
  const [supernumeraryAdjustments, setSupernumeraryAdjustments] = useState(0);

  const scenario: WhatIfScenario = {
    institutionId: selectedInstId,
    programmeId: selectedProgId,
    additionalAdmissions,
    projectedWithdrawals,
    supernumeraryAdjustments,
  };

  const simResult = store.runWhatIfSimulation(scenario);

  const handleResetSimulation = () => {
    setAdditionalAdmissions(0);
    setProjectedWithdrawals(0);
    setSupernumeraryAdjustments(0);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs text-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
              Regulatory Innovation
            </span>
            <span className="text-[11px] font-mono text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 font-semibold">
              Isolated Twin Sandbox
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-2">
            <Cpu className="w-6 h-6 text-blue-600" />
            Enrolment Digital Twin &amp; What-If Simulator
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Simulate hypothetical admission rounds, mass transfers, and quota reallocations in real-time without modifying committed institutional data.
          </p>
        </div>

        <button
          onClick={handleResetSimulation}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-all shrink-0 shadow-2xs"
        >
          <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
          Reset Simulation
        </button>
      </div>

      {/* Institution and Programme Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white border border-slate-200 p-4 rounded-xl shadow-xs text-slate-800">
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Institution under Simulation:
          </label>
          <select
            value={selectedInstId}
            onChange={(e) => {
              setSelectedInstId(e.target.value);
              const inst = institutions.find((i) => i.id === e.target.value);
              if (inst && inst.programmes[0]) setSelectedProgId(inst.programmes[0].id);
            }}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-blue-600"
          >
            {institutions.map((i) => (
              <option key={i.id} value={i.id}>
                {i.code} — {i.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Programme under Simulation:
          </label>
          <select
            value={selectedProgId}
            onChange={(e) => setSelectedProgId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-blue-600"
          >
            {activeInst.programmes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (Approved Intake: {p.approvedIntake})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Sandbox Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sliders Panel */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-xs text-slate-800">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Sliders className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">Scenario Parameters</h2>
          </div>

          {/* Slider 1: Additional Proposed Admissions */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">
                Additional Admissions:
              </span>
              <span className="font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                +{additionalAdmissions} seats
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              value={additionalAdmissions}
              onChange={(e) => setAdditionalAdmissions(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0 (None)</span>
              <span>+10 seats</span>
              <span>+20 seats</span>
            </div>
          </div>

          {/* Slider 2: Projected Withdrawals */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">
                Projected Withdrawals / Leaves:
              </span>
              <span className="font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                -{projectedWithdrawals} seats
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              value={projectedWithdrawals}
              onChange={(e) => setProjectedWithdrawals(Number(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0 (None)</span>
              <span>-7 seats</span>
              <span>-15 seats</span>
            </div>
          </div>

          {/* Slider 3: Supernumerary Expansion */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">
                Supernumerary Quota Adjustments:
              </span>
              <span className="font-mono font-bold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                +{supernumeraryAdjustments}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={supernumeraryAdjustments}
              onChange={(e) => setSupernumeraryAdjustments(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0</span>
              <span>+5</span>
              <span>+10</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
            <strong>Regulatory Notice:</strong> Simulations allow AICTE auditors and institutional planners to test seat fulfillment scenarios against statutory limits prior to counseling cutoffs.
          </div>
        </div>

        {/* Side-by-Side Comparison Panel */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-xs text-slate-800">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Side-by-Side Impact Matrix
            </h2>
            <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
              Current vs. Simulated
            </span>
          </div>

          {/* Comparison Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Sanctioned Intake */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
              <div className="text-xs text-slate-500 font-medium">Approved Ceiling</div>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">
                {simResult.approvedCapacity}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Fixed Sanction</div>
            </div>

            {/* Current Active */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
              <div className="text-xs text-slate-500 font-medium">Current Enrolment</div>
              <div className="text-2xl font-extrabold text-slate-800 mt-1">
                {simResult.currentReported}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {simResult.currentUtilizationPct}% Utilized
              </div>
            </div>

            {/* Simulated Projected Active */}
            <div className={`p-4 rounded-xl border text-center ${
              simResult.intakeDiscrepancy > 0
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : 'bg-teal-50 border-teal-200 text-teal-900'
            }`}>
              <div className="text-xs font-semibold">Simulated Enrolment</div>
              <div className="text-2xl font-extrabold mt-1">
                {simResult.projectedActive}
              </div>
              <div className="text-[11px] mt-0.5 font-medium">
                {simResult.projectedUtilizationPct}% Projected
              </div>
            </div>
          </div>

          {/* Delta Breakdown Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden text-xs">
            <table className="w-full text-left text-slate-700">
              <thead className="bg-blue-50/70 text-blue-950 border-b border-blue-100 font-semibold">
                <tr>
                  <th className="p-3">Metric</th>
                  <th className="p-3">Recorded Baseline</th>
                  <th className="p-3">Simulated Twin</th>
                  <th className="p-3">Net Variance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-3 font-medium text-slate-900">Active Regular Students</td>
                  <td className="p-3">{simResult.currentReported}</td>
                  <td className="p-3 font-semibold text-slate-900">{simResult.projectedActive}</td>
                  <td className="p-3 font-mono">
                    {simResult.projectedActive - simResult.currentReported >= 0 ? '+' : ''}
                    {simResult.projectedActive - simResult.currentReported}
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-900">Vacant Regular Seats</td>
                  <td className="p-3">{simResult.currentVacancies}</td>
                  <td className="p-3 font-semibold text-slate-900">{simResult.projectedVacancies}</td>
                  <td className="p-3 font-mono">
                    {simResult.projectedVacancies - simResult.currentVacancies >= 0 ? '+' : ''}
                    {simResult.projectedVacancies - simResult.currentVacancies}
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-900">Statutory Capacity Breach</td>
                  <td className="p-3">
                    {simResult.currentReported > simResult.approvedCapacity ? (
                      <span className="text-rose-600 font-bold">Yes (Breached)</span>
                    ) : (
                      <span className="text-emerald-700 font-medium">None</span>
                    )}
                  </td>
                  <td className="p-3">
                    {simResult.intakeDiscrepancy > 0 ? (
                      <span className="text-rose-600 font-bold">
                        +{simResult.intakeDiscrepancy} Excess Seats
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-medium">Within Sanction</span>
                    )}
                  </td>
                  <td className="p-3 font-mono">
                    {simResult.intakeDiscrepancy > 0 ? 'FAIL' : 'PASS'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Generated Alerts */}
          {simResult.projectedAlerts.length > 0 ? (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                <AlertOctagon className="w-4 h-4 text-rose-600" />
                Simulated Regulatory Exceptions ({simResult.projectedAlerts.length})
              </h4>
              <div className="space-y-2">
                {simResult.projectedAlerts.map((a, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2"
                  >
                    <span className="font-mono text-[10px] bg-rose-100 px-1.5 py-0.5 rounded text-rose-900 border border-rose-200 font-semibold shrink-0">
                      {a.ruleId}
                    </span>
                    <span>{a.message}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Scenario satisfies all statutory capacity rules. Zero intake infractions projected.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
