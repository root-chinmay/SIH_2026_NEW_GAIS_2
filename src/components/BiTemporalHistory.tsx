import React, { useState } from 'react';
import {
  Clock,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Building,
  FileText,
  User,
} from 'lucide-react';
import { store } from '../services/store';

export const BiTemporalHistory: React.FC = () => {
  const state = store.getState();

  // Audit scrubber: Select historical system date
  const [scrubberDate, setScrubberDate] = useState('2026-08-01');

  // Synthetic bitemporal demonstration records
  // Example 1: Student admitted on 2026-07-20 (Valid From), but institution recorded it on 2026-08-01 (System Time)
  // Example 2: Withdrawal happened on 2026-08-02 (Valid From), but institution reported withdrawal late on 2026-08-10 (System Time)
  const bitemporalExamples = [
    {
      studentName: 'Pooja Raghavan',
      apaarId: 'APAAR-DEMO-0098',
      institution: 'Bangalore College of Engineering (BCE-03)',
      event: 'Withdrawal Approved (Legitimate Transfer to MIT Pune)',
      validTime: '2026-08-02', // True reality date
      systemTime: '2026-08-10T14:30:00Z', // When college operator entered it into portal
      delayDays: 8,
      effectOnScrubberDate:
        new Date(scrubberDate) < new Date('2026-08-10')
          ? 'On selected date, system still showed ACTIVE enrolment (withdrawal had not yet been recorded into system).'
          : 'On selected date, system correctly reflected WITHDRAWAL.',
    },
    {
      studentName: 'Sameer Singhania',
      apaarId: 'APAAR-DEMO-0099',
      institution: 'Delhi Technological University (DTU-01)',
      event: 'Provisional Admission Confirmed',
      validTime: '2026-07-25',
      systemTime: '2026-08-01T09:00:00Z',
      delayDays: 7,
      effectOnScrubberDate:
        new Date(scrubberDate) < new Date('2026-08-01')
          ? 'Not yet visible in national registry.'
          : 'Visible as active admission at DTU.',
    },
    {
      studentName: 'Tanya Sengupta',
      apaarId: 'APAAR-MALFORMED-99',
      institution: 'Delhi Technological University (DTU-01)',
      event: 'Identifier Syntax Correction Request',
      validTime: '2026-08-04',
      systemTime: '2026-08-05T11:20:00Z',
      delayDays: 1,
      effectOnScrubberDate:
        new Date(scrubberDate) < new Date('2026-08-05')
          ? 'System reflected original malformed identifier error.'
          : 'System showed pending signatory correction.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-purple-900/60 text-purple-300 border border-purple-700/60">
              Audit Dimension
            </span>
            <span className="text-[11px] font-mono text-teal-400 bg-teal-950/60 px-2 py-0.5 rounded border border-teal-800/60">
              Valid Time vs System Time
            </span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
            <Clock className="w-6 h-6 text-purple-400" />
            Bi-Temporal Record History &amp; Inspector Scrubber
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Reconstructs historical states to answer <em>"What did AICTE know on date X?"</em> alongside <em>"When did the institution actually report or backdate this transaction?"</em>
          </p>
        </div>

        {/* Auditor Scrubber Date Picker */}
        <div className="bg-slate-950 border border-slate-700 rounded-xl p-3 flex items-center gap-3 shrink-0">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block">
              Historical Auditor Scrubber:
            </label>
            <input
              type="date"
              value={scrubberDate}
              onChange={(e) => setScrubberDate(e.target.value)}
              className="bg-transparent border-none text-white text-xs font-mono font-bold focus:outline-none cursor-pointer mt-0.5"
            />
          </div>
          <button
            onClick={() => setScrubberDate('2026-08-05')}
            className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded border border-slate-700"
          >
            Mid-Aug
          </button>
          <button
            onClick={() => setScrubberDate('2026-10-29')}
            className="text-[10px] bg-blue-900/60 hover:bg-blue-800 text-blue-300 px-2 py-1 rounded border border-blue-700/60"
          >
            Today
          </button>
        </div>
      </div>

      {/* Explanation Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
            <Calendar className="w-4 h-4" />
            Valid Time (Reality Dimension)
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            The exact calendar date when the student physically enrolled, commenced classes, or obtained an authorized transfer certificate.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-teal-400 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            System Time (Audit Dimension)
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            The cryptographic timestamp when the institutional operator uploaded the record into the AICTE platform and the hash chain registered it.
          </p>
        </div>
      </div>

      {/* Bi-Temporal Scrubber Reconstruction Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            Reconstructed State as of {scrubberDate}
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            Scrubber View: <strong>{scrubberDate}</strong>
          </span>
        </div>

        <div className="space-y-4">
          {bitemporalExamples.map((item, idx) => (
            <div
              key={idx}
              className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <h3 className="text-sm font-bold text-white">{item.studentName}</h3>
                  <div className="text-xs text-slate-400 font-mono">
                    {item.apaarId} &bull; {item.institution}
                  </div>
                </div>
                <span className="text-xs bg-slate-900 border border-slate-700 text-slate-300 px-2 py-0.5 rounded font-mono">
                  Reporting Lag: {item.delayDays} Days
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                <div>
                  <span className="text-slate-400 text-[11px] block">Valid Time (When Event Happened):</span>
                  <span className="text-blue-300 font-bold font-mono text-sm">{item.validTime}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">System Time (When Recorded into AIM):</span>
                  <span className="text-teal-300 font-bold font-mono text-sm">{item.systemTime}</span>
                </div>
              </div>

              <div className="text-xs p-3 rounded-lg bg-indigo-950/30 border border-indigo-900/50 text-indigo-200">
                <strong>What the system showed on {scrubberDate}:</strong> {item.effectOnScrubberDate}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
