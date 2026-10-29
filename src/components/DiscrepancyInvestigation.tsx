import React, { useState } from 'react';
import {
  AlertOctagon,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  FileText,
  Calculator,
  MessageSquare,
  Building,
} from 'lucide-react';
import { store } from '../services/store';
import { DiscrepancyCase } from '../types';

export const DiscrepancyInvestigation: React.FC = () => {
  const state = store.getState();
  const [selectedCaseId, setSelectedCaseId] = useState<string>(
    state.discrepancies[0]?.id || ''
  );
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [newNote, setNewNote] = useState('');

  const activeCase =
    state.discrepancies.find((c) => c.id === selectedCaseId) || state.discrepancies[0];

  const filteredCases = state.discrepancies.filter((c) => {
    if (filterSeverity !== 'ALL' && c.severity !== filterSeverity) return false;
    return true;
  });

  const handleStatusChange = (newStatus: DiscrepancyCase['status']) => {
    if (!activeCase) return;
    activeCase.status = newStatus;
    activeCase.updatedAt = new Date().toISOString();
    store.addAuditEvent(
      state.currentUser.email,
      state.currentUser.role,
      'DISCREPANCY_STATUS_UPDATED',
      'STUDENT',
      activeCase.id,
      `Case ${activeCase.id} status transitioned to ${newStatus}`,
      activeCase.involvedInstitutions[0]
    );
    // Force re-render
    setSelectedCaseId(activeCase.id);
  };

  const handleAddNote = () => {
    if (!newNote.trim() || !activeCase) return;
    activeCase.evidenceNotes.push(
      `[${new Date().toISOString().split('T')[0]} - ${state.currentUser.name}]: ${newNote.trim()}`
    );
    activeCase.updatedAt = new Date().toISOString();
    setNewNote('');
    store.addAuditEvent(
      state.currentUser.email,
      state.currentUser.role,
      'DISCREPANCY_NOTE_ADDED',
      'STUDENT',
      activeCase.id,
      `Evidence note added to case ${activeCase.id}`,
      activeCase.involvedInstitutions[0]
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-rose-900/60 text-rose-300 border border-rose-700/60">
              Regulatory Risk Engine
            </span>
            <span className="text-[11px] font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
              Transparent Formula Scoring
            </span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
            <AlertOctagon className="w-6 h-6 text-rose-400" />
            Discrepancy &amp; Anomaly Investigation Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Deterministic risk identification, transparent scoring breakdown, and auditable evidence reconciliation for AICTE regulators.
          </p>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400">Severity Filter:</label>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="HIGH">High Only</option>
            <option value="MEDIUM">Medium Only</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Cases List on Left, Active Case Deep Dive on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cases List */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider px-2 py-1">
            Active Exception Cases ({filteredCases.length})
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[600px] pr-1">
            {filteredCases.map((c) => {
              const isSelected = activeCase?.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCaseId(c.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-950/70 border-blue-500 shadow-md'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono text-slate-400 font-semibold">{c.id}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        c.severity === 'CRITICAL'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : c.severity === 'HIGH'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-blue-950 text-blue-300 border border-blue-800'
                      }`}
                    >
                      {c.severity}
                    </span>
                  </div>

                  <h3 className="font-semibold text-white text-sm">{c.studentName}</h3>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    {c.apaarId}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/80">
                    <span className="font-medium text-slate-300">{c.findingsClassification}</span>
                    <span className="font-mono font-bold text-teal-400">
                      Risk: {c.riskScore}/100
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Deep Dive Panel */}
        {activeCase ? (
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            {/* Case Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {activeCase.id}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    APAAR: <strong className="text-white">{activeCase.apaarId}</strong>
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white mt-1">
                  {activeCase.studentName} &mdash; {activeCase.findingsClassification}
                </h2>
              </div>

              {/* Status Switcher */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Investigation Status:</span>
                <select
                  value={activeCase.status}
                  onChange={(e) => handleStatusChange(e.target.value as any)}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-semibold"
                >
                  <option value="NEW">NEW</option>
                  <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                  <option value="EVIDENCE_REQUESTED">EVIDENCE_REQUESTED</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="DISMISSED">DISMISSED</option>
                </select>
              </div>
            </div>

            {/* Inspectable Transparent Risk Formula (Section 25) */}
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                  <Calculator className="w-4 h-4 text-teal-400" />
                  Inspectable Risk Score Model: {activeCase.riskScore} / 100
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  Zero Black-Box Scoring Tenet
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {activeCase.riskFormulaBreakdown.map((f, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <div className="font-semibold text-slate-200">{f.factor}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{f.explanation}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono text-teal-400 font-bold">
                        +{f.points} pts
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        Weight: {f.weight}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Involved Institutions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="text-slate-400 text-[11px]">Involved Institutions</div>
                <div className="text-sm font-semibold text-white mt-1 flex flex-wrap gap-1.5">
                  {activeCase.involvedInstitutions.map((instId) => (
                    <span key={instId} className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {instId}
                    </span>
                  ))}
                </div>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="text-slate-400 text-[11px]">Issue Classification</div>
                <div className="text-sm font-semibold text-white mt-1">
                  {activeCase.issueType.replace(/_/g, ' ')}
                </div>
              </div>
            </div>

            {/* Evidence Notes & Case Log */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-400" />
                Case Evidence Chronology &amp; Notes
              </h4>

              <div className="space-y-2">
                {activeCase.evidenceNotes.map((note, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed"
                  >
                    {note}
                  </div>
                ))}
              </div>

              {/* Add Note Input */}
              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Attach verifiable evidence note or registrar inquiry comment..."
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={handleAddNote}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shrink-0"
                >
                  Add Note
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 flex items-center justify-center p-12 text-slate-500 text-xs">
            No active exception selected.
          </div>
        )}
      </div>
    </div>
  );
};
