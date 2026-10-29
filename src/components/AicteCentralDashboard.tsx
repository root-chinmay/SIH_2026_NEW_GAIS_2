import React, { useState } from 'react';
import {
  Building,
  TrendingUp,
  AlertOctagon,
  Users,
  ShieldAlert,
  Layers,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { store } from '../services/store';

interface AicteCentralDashboardProps {
  onNavigate: (view: string) => void;
}

export const AicteCentralDashboard: React.FC<AicteCentralDashboardProps> = ({ onNavigate }) => {
  const state = store.getState();
  const [filterState, setFilterState] = useState<string>('ALL');

  // Filter institutions
  const filteredInstitutions = state.institutions.filter((i) => {
    if (filterState !== 'ALL' && i.state !== filterState) return false;
    return true;
  });

  const totalInstitutions = filteredInstitutions.length;
  const totalProgrammes = filteredInstitutions.reduce(
    (acc, inst) => acc + inst.programmes.length,
    0
  );

  const totalSanctionedIntake = filteredInstitutions.reduce(
    (acc, inst) =>
      acc + inst.programmes.reduce((pAcc, p) => pAcc + p.approvedIntake, 0),
    0
  );

  const instIds = new Set(filteredInstitutions.map((i) => i.id));
  const relevantStudents = state.students.filter((s) => instIds.has(s.institutionId));

  const totalActiveAdmissions = relevantStudents.filter(
    (s) =>
      s.admissionStatus === 'Admission Confirmed' ||
      s.admissionStatus === 'Enrollment Reported' ||
      s.admissionStatus === 'Provisionally Admitted'
  ).length;

  const totalVacantSeats = Math.max(0, totalSanctionedIntake - totalActiveAdmissions);
  const totalDiscrepancies = state.discrepancies.length;

  const distinctStates = Array.from(new Set(state.institutions.map((i) => i.state)));

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
              National Monitoring Command
            </span>
            <span className="text-[11px] font-mono text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 font-semibold">
              Multi-Tenant Synthesis
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-2">
            <Building className="w-6 h-6 text-blue-600" />
            AICTE Central Regulatory Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Nationwide monitoring of student enrolments, approved intake compliance, active discrepancies, and institutional data quality metrics.
          </p>
        </div>

        {/* State Filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 font-medium">Jurisdiction / State:</label>
          <select
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600 shadow-2xs"
          >
            <option value="ALL">All States (All India)</option>
            {distinctStates.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* National KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Institutions</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{totalInstitutions}</div>
          <div className="text-[11px] text-blue-700 mt-1 font-medium">Approved Bodies</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Programmes</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{totalProgrammes}</div>
          <div className="text-[11px] text-blue-700 mt-1 font-medium">Active Batches</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Sanctioned Intake</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{totalSanctionedIntake}</div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">Regular Seats</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Reported Enrolment</div>
          <div className="text-2xl font-bold text-teal-700 mt-1">{totalActiveAdmissions}</div>
          <div className="text-[11px] text-teal-700 mt-1 font-medium">
            {Math.round((totalActiveAdmissions / (totalSanctionedIntake || 1)) * 100)}% Filled
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Vacant Seats</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{totalVacantSeats}</div>
          <div className="text-[11px] text-emerald-700 mt-1 font-medium">National Registry</div>
        </div>

        <div
          onClick={() => onNavigate('discrepancies')}
          className="cursor-pointer bg-white hover:bg-rose-50/40 p-4 rounded-xl border border-slate-200 hover:border-rose-400 transition-colors shadow-xs"
        >
          <div className="text-xs text-slate-500 font-medium">Active Exceptions</div>
          <div className="text-2xl font-bold text-rose-600 mt-1">{totalDiscrepancies}</div>
          <div className="text-[11px] text-rose-700 mt-1 font-semibold">Action Required &rarr;</div>
        </div>
      </div>

      {/* Institutions Directory & Compliance Health Ranking */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Institutional Data Quality &amp; Compliance Health Ranking
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Transparent institutional health scoring based on identifier validity, intake compliance, and reporting speed.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-blue-50/70 text-blue-950 font-semibold border-b border-blue-100">
              <tr>
                <th className="p-3.5">Institution Code &amp; Name</th>
                <th className="p-3.5">State &amp; District</th>
                <th className="p-3.5">Programmes</th>
                <th className="p-3.5">Intake Utilization</th>
                <th className="p-3.5">Data Quality Score</th>
                <th className="p-3.5">Reporting Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInstitutions.map((inst) => {
                const instStudents = state.students.filter((s) => s.institutionId === inst.id);
                const activeCount = instStudents.filter(
                  (s) =>
                    s.admissionStatus === 'Admission Confirmed' ||
                    s.admissionStatus === 'Enrollment Reported' ||
                    s.admissionStatus === 'Provisionally Admitted'
                ).length;
                const totalIntake = inst.programmes.reduce((acc, p) => acc + p.approvedIntake, 0);
                const pct = totalIntake > 0 ? Math.round((activeCount / totalIntake) * 100) : 0;

                return (
                  <tr key={inst.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-900 text-sm">{inst.name}</div>
                      <div className="text-slate-500 font-mono text-[11px] mt-0.5">
                        {inst.code} &bull; {inst.type}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <div className="text-slate-800">{inst.state}</div>
                      <div className="text-slate-500 text-[11px]">{inst.district}</div>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-900">
                      {inst.programmes.length} Degrees
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">
                          {activeCount} / {totalIntake}
                        </span>
                        <span className={`text-[11px] font-semibold ${pct > 100 ? 'text-rose-600' : 'text-slate-500'}`}>
                          ({pct}%)
                        </span>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="font-bold text-teal-700 text-sm">
                          {inst.complianceScore}%
                        </span>
                        <span className="text-[10px] text-slate-500">Score</span>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        {inst.reportingStatus}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
