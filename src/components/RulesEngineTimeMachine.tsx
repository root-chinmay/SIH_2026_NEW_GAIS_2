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
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-900/60 text-indigo-300 border border-indigo-700/60">
              Regulatory Core
            </span>
            <span className="text-[11px] font-mono text-teal-400 bg-teal-950/60 px-2 py-0.5 rounded border border-teal-800/60">
              Bi-Directional Rulebook
            </span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
            <History className="w-6 h-6 text-indigo-400" />
            Regulatory Rules Engine &amp; Time Machine
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Version-controlled statutory AICTE rulebook with retroactive compliance simulation and historical re-evaluation.
          </p>
        </div>

        <div className="text-right">
          <div className="text-xs text-slate-400">Current Statutory Version:</div>
          <div className="text-sm font-bold text-teal-400 font-mono">APH 2026-27 v2.1 (Active)</div>
        </div>
      </div>

      {/* Versioned Rules List & Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rules Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider px-2">
            Configured Statutory Rules ({rules.length})
          </h3>

          <div className="space-y-2">
            {rules.map((r) => {
              const isSelected = activeRule.id === r.id;
              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedRuleId(r.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-950/70 border-indigo-500 shadow-md'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono text-slate-400 font-semibold">{r.ruleCode}</span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono">
                      v{r.version}
                    </span>
                  </div>
                  <div className="font-semibold text-white text-xs">{r.name}</div>
                  <div className="text-[11px] text-teal-400 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{r.testCasesCount} Automated Unit Tests</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rule Detail View */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-start justify-between pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-indigo-900/60 text-indigo-300 border border-indigo-700/60">
                  {activeRule.ruleCode}
                </span>
                <span className="text-xs text-slate-400 font-mono">v{activeRule.version}</span>
              </div>
              <h2 className="text-lg font-bold text-white mt-1">{activeRule.name}</h2>
            </div>
            <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-1 rounded-lg font-semibold">
              {activeRule.status}
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <div className="text-slate-400 uppercase font-semibold text-[10px]">
                Plain Language Regulatory Mandate:
              </div>
              <p className="text-slate-200 leading-relaxed text-sm">
                {activeRule.plainLanguage}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div className="text-slate-400 text-[11px]">Statutory Authority Source:</div>
                <div className="text-white font-medium mt-0.5">{activeRule.authoritativeSource}</div>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div className="text-slate-400 text-[11px]">Authorized Sign-Off:</div>
                <div className="text-white font-medium mt-0.5">
                  {activeRule.authorizedBy} ({activeRule.effectiveAcademicYear})
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Regulatory Time Machine Section (Section 17) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-bold text-white">
                Regulatory Time Machine Replay
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Re-evaluates synthetic historical student cohorts under a previous or new regulatory rule version to inspect variance.
            </p>
          </div>

          {/* Version Selector for Replay */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400">Replay Under Rule Version:</label>
            <select
              value={targetVersion}
              onChange={(e) => setTargetVersion(e.target.value as any)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
            >
              <option value="v1.0">APH 2025-26 (v1.0 — Advisory Mode)</option>
              <option value="v2.1">APH 2026-27 (v2.1 — Strict Mandate)</option>
            </select>
            <button
              onClick={handleRunTimeMachineReplay}
              disabled={isReplaying}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
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
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                <div className="text-xs text-slate-400">Records Evaluated</div>
                <div className="text-2xl font-extrabold text-white mt-1">
                  {replayedResults.totalReplayed}
                </div>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                <div className="text-xs text-slate-400">Passed Historical Rules</div>
                <div className="text-2xl font-extrabold text-emerald-400 mt-1">
                  {replayedResults.passedEarlier}
                </div>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                <div className="text-xs text-slate-400">Variance Status Discrepancies</div>
                <div className="text-2xl font-extrabold text-amber-400 mt-1">
                  {replayedResults.failedUnderNew}
                </div>
              </div>
            </div>

            {replayedResults.changedRecords.length > 0 && (
              <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden text-xs">
                <table className="w-full text-left text-slate-300">
                  <thead className="bg-slate-900 text-slate-400">
                    <tr>
                      <th className="p-3">Student &amp; APAAR</th>
                      <th className="p-3">Historical Decision ({targetVersion})</th>
                      <th className="p-3">Active Mandate Decision (v2.1)</th>
                      <th className="p-3">Regulatory Impact Rationale</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {replayedResults.changedRecords.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-900/50">
                        <td className="p-3">
                          <div className="font-semibold text-white">{r.studentName}</div>
                          <div className="text-[11px] font-mono text-slate-400">{r.apaarId}</div>
                        </td>
                        <td className="p-3 font-mono text-emerald-400">{r.historicalDecision}</td>
                        <td className="p-3 font-mono text-rose-400">{r.replayedDecision}</td>
                        <td className="p-3 text-slate-300">{r.impactReason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* AI Rule Drafter Simulation (Section 17 - Prompt to draft proposal) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <FileCode className="w-5 h-5 text-teal-400" />
          <h2 className="text-sm font-bold text-white">
            AI-Assisted Regulatory Rule Proposal Sandbox
          </h2>
        </div>
        <p className="text-xs text-slate-400">
          Draft new proposed amendments in natural language. The system treats all AI outputs as unapproved proposals requiring human sign-off before activation.
        </p>

        <div className="flex gap-2">
          <input
            type="text"
            value={aiDraftPrompt}
            onChange={(e) => setAiDraftPrompt(e.target.value)}
            placeholder="e.g., Introduce a 10% supernumerary quota for sports excellence candidates..."
            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
          />
          <button
            onClick={handleAiRuleDraft}
            disabled={isAiDrafting}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold shrink-0"
          >
            {isAiDrafting ? 'Drafting...' : 'Draft Rule Proposal'}
          </button>
        </div>

        {aiRuleDraft && (
          <div className="p-4 rounded-xl bg-slate-950 border border-teal-800/80 space-y-2 text-xs">
            <div className="flex items-center justify-between text-teal-300 font-bold">
              <span>Proposal: {aiRuleDraft.ruleCode}</span>
              <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded">
                Unapproved Proposal (Human Sign-Off Required)
              </span>
            </div>
            <div className="text-slate-200 font-semibold">{aiRuleDraft.name}</div>
            <p className="text-slate-400">{aiRuleDraft.plainLanguage}</p>
          </div>
        )}
      </div>
    </div>
  );
};
