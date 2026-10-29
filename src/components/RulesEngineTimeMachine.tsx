import React, { useState } from 'react';
import {
  History,
  BookOpen,
  Play,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  FileCode,
  ShieldCheck,
} from 'lucide-react';
import { store } from '../services/store';
import { RegulatoryRule } from '../types';

export const RulesEngineTimeMachine: React.FC = () => {
  const state = store.getState();
  const rules = state.rules;

  const [selectedRuleId, setSelectedRuleId] = useState(rules[0]?.id || '');
  const activeRule = rules.find((r) => r.id === selectedRuleId) || rules[0];

  // Time Machine Sandbox State
  const [targetVersion, setTargetVersion] = useState<'v1.0' | 'v2.1'>('v1.0');
  const [replayedResults, setReplayedResults] = useState<{
    totalReplayed: number;
    passedEarlier: number;
    failedUnderNew: number;
    changedRecords: {
      apaarId: string;
      studentName: string;
      institution: string;
      historicalDecision: string;
      replayedDecision: string;
      impactReason: string;
    }[];
  } | null>(null);

  const [isReplaying, setIsReplaying] = useState(false);

  // Gemini AI Rule Drafter Simulation
  const [aiDraftPrompt, setAiDraftPrompt] = useState('');
  const [isAiDrafting, setIsAiDrafting] = useState(false);
  const [aiRuleDraft, setAiRuleDraft] = useState<any>(null);

  const handleRunTimeMachineReplay = () => {
    setIsReplaying(true);
    setTimeout(() => {
      // Replay simulation: Under v1.0, supernumerary EWS quota was strictly 5%, under v2.1 it is 10%
      // or APAAR ID format was optional in v1.0, but mandatory in v2.1
      if (targetVersion === 'v1.0') {
        setReplayedResults({
          totalReplayed: state.students.length,
          passedEarlier: 95,
          failedUnderNew: 5,
          changedRecords: [
            {
              apaarId: 'APAAR-MALFORMED-99',
              studentName: 'Tanya Sengupta',
              institution: 'DTU-01',
              historicalDecision: 'ACCEPTED_UNDER_V1 (Identifier was advisory)',
              replayedDecision: 'REJECTED_UNDER_V2 (Mandatory APAAR Regex Rule)',
              impactReason: 'Circular MoE/HE/2026/APAAR-09 made identifier syntax mandatory.',
            },
            {
              apaarId: 'APAAR-DEMO-0021',
              studentName: 'Vikram Mishra',
              institution: 'DTU-01',
              historicalDecision: 'PROVISIONAL_PASS_V1',
              replayedDecision: 'BREACH_INTAKE_V2',
              impactReason: 'APH 2026-27 Clause 2.4 removed provisional over-allocation waiver.',
            },
          ],
        });
      } else {
        setReplayedResults({
          totalReplayed: state.students.length,
          passedEarlier: 90,
          failedUnderNew: 0,
          changedRecords: [],
        });
      }
      setIsReplaying(false);
    }, 500);
  };

  const handleAiRuleDraft = () => {
    if (!aiDraftPrompt.trim()) return;
    setIsAiDrafting(true);
    setTimeout(() => {
      setAiRuleDraft({
        ruleCode: 'APH-PROPOSAL-AI-2026',
        name: 'Proposed Lateral Entry B.Tech Intake Ceiling',
        plainLanguage: `Admissions via lateral entry (Diploma to B.Tech 2nd Year) shall be strictly capped at 10% of sanctioned regular intake in addition to approved vacancies. Derived from requirement: "${aiDraftPrompt}"`,
        source: 'AI Draft Assistant Proposal (Requires AICTE Regulatory Council Human Sign-Off)',
        status: 'PROPOSAL_ONLY',
      });
      setIsAiDrafting(false);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              Regulatory Core
            </span>
            <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
              Bi-Directional Rulebook
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-2">
            <History className="w-6 h-6 text-blue-600" />
            Regulatory Rules Engine &amp; Time Machine
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Version-controlled statutory AICTE rulebook with retroactive compliance simulation and historical re-evaluation.
          </p>
        </div>

        <div className="sm:text-right">
          <div className="text-xs text-slate-500 font-medium">Current Statutory Version:</div>
          <div className="text-sm font-bold text-blue-700 font-mono">APH 2026-27 v2.1 (Active)</div>
        </div>
      </div>

      {/* Versioned Rules List & Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rules Table */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider px-2">
            Configured Statutory Rules ({rules.length})
          </h3>

          <div className="space-y-2">
            {rules.map((r) => {
              const isSelected = activeRule.id === r.id;
              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedRuleId(r.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-500 shadow-sm'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100/60'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono text-slate-600 font-semibold">{r.ruleCode}</span>
                    <span className="text-[10px] bg-white border border-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono font-semibold">
                      v{r.version}
                    </span>
                  </div>
                  <div className="font-semibold text-slate-900 text-xs">{r.name}</div>
                  <div className="text-[11px] text-blue-700 font-medium mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>{r.testCasesCount} Automated Unit Tests</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rule Detail View */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-sm">
          <div className="flex items-start justify-between pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  {activeRule.ruleCode}
                </span>
                <span className="text-xs text-slate-500 font-mono">v{activeRule.version}</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-1">{activeRule.name}</h2>
            </div>
            <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-lg font-semibold">
              {activeRule.status}
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
              <div className="text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                Plain Language Regulatory Mandate:
              </div>
              <p className="text-slate-800 leading-relaxed text-sm">
                {activeRule.plainLanguage}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="text-slate-500 text-[11px] font-medium">Statutory Authority Source:</div>
                <div className="text-slate-900 font-semibold mt-0.5">{activeRule.authoritativeSource}</div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="text-slate-500 text-[11px] font-medium">Authorized Sign-Off:</div>
                <div className="text-slate-900 font-semibold mt-0.5">
                  {activeRule.authorizedBy} ({activeRule.effectiveAcademicYear})
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Regulatory Time Machine Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">
                Regulatory Time Machine Replay
              </h2>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Re-evaluates synthetic historical student cohorts under a previous or new regulatory rule version to inspect variance.
            </p>
          </div>

          {/* Version Selector for Replay */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-600 font-medium">Replay Under Rule Version:</label>
            <select
              value={targetVersion}
              onChange={(e) => setTargetVersion(e.target.value as any)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="v1.0">APH 2025-26 (v1.0 — Advisory Mode)</option>
              <option value="v2.1">APH 2026-27 (v2.1 — Strict Mandate)</option>
            </select>
            <button
              onClick={handleRunTimeMachineReplay}
              disabled={isReplaying}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm"
            >
              <Play className="w-3.5 h-3.5" />
              {isReplaying ? 'Replaying...' : 'Run Replay'}
            </button>
          </div>
        </div>

        {/* Replay Output Matrix */}
        {replayedResults && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                <div className="text-xs text-slate-500 font-medium">Records Evaluated</div>
                <div className="text-2xl font-extrabold text-slate-900 mt-1">
                  {replayedResults.totalReplayed}
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                <div className="text-xs text-slate-500 font-medium">Passed Historical Rules</div>
                <div className="text-2xl font-extrabold text-emerald-700 mt-1">
                  {replayedResults.passedEarlier}
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                <div className="text-xs text-slate-500 font-medium">Variance Status Discrepancies</div>
                <div className="text-2xl font-extrabold text-amber-600 mt-1">
                  {replayedResults.failedUnderNew}
                </div>
              </div>
            </div>

            {replayedResults.changedRecords.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden text-xs shadow-sm">
                <table className="w-full text-left text-slate-700">
                  <thead className="bg-blue-50/75 text-blue-950 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Student &amp; APAAR</th>
                      <th className="p-3">Historical Decision ({targetVersion})</th>
                      <th className="p-3">Active Mandate Decision (v2.1)</th>
                      <th className="p-3">Regulatory Impact Rationale</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {replayedResults.changedRecords.map((r, i) => (
                      <tr key={i} className="hover:bg-blue-50/30">
                        <td className="p-3">
                          <div className="font-semibold text-slate-900">{r.studentName}</div>
                          <div className="text-[11px] font-mono text-slate-500">{r.apaarId}</div>
                        </td>
                        <td className="p-3 font-mono text-emerald-700 font-semibold">{r.historicalDecision}</td>
                        <td className="p-3 font-mono text-rose-700 font-semibold">{r.replayedDecision}</td>
                        <td className="p-3 text-slate-600">{r.impactReason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* AI Rule Drafter Simulation */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2">
          <FileCode className="w-5 h-5 text-blue-600" />
          <h2 className="text-sm font-bold text-slate-900">
            AI-Assisted Regulatory Rule Proposal Sandbox
          </h2>
        </div>
        <p className="text-xs text-slate-600">
          Draft new proposed amendments in natural language. The system treats all AI outputs as unapproved proposals requiring human sign-off before activation.
        </p>

        <div className="flex gap-2">
          <input
            type="text"
            value={aiDraftPrompt}
            onChange={(e) => setAiDraftPrompt(e.target.value)}
            placeholder="e.g., Introduce a 10% supernumerary quota for sports excellence candidates..."
            className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
          <button
            onClick={handleAiRuleDraft}
            disabled={isAiDrafting}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm shrink-0"
          >
            {isAiDrafting ? 'Drafting...' : 'Draft Rule Proposal'}
          </button>
        </div>

        {aiRuleDraft && (
          <div className="p-4 rounded-xl bg-blue-50/40 border border-blue-200 space-y-2 text-xs">
            <div className="flex items-center justify-between text-blue-900 font-bold">
              <span>Proposal: {aiRuleDraft.ruleCode}</span>
              <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-semibold">
                Unapproved Proposal (Human Sign-Off Required)
              </span>
            </div>
            <div className="text-slate-900 font-semibold">{aiRuleDraft.name}</div>
            <p className="text-slate-600">{aiRuleDraft.plainLanguage}</p>
          </div>
        )}
      </div>
    </div>
  );
};
