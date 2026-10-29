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
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              Audit Dimension
            </span>
            <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
              Valid Time vs System Time
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-600" />
            Bi-Temporal Record History &amp; Inspector Scrubber
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Reconstructs historical states to answer <em>"What did AICTE know on date X?"</em> alongside <em>"When did the institution actually report or backdate this transaction?"</em>
          </p>
        </div>

        {/* Auditor Scrubber Date Picker */}
        <div className="bg-slate-50 border border-slate-300 rounded-xl p-3 flex items-center gap-3 shrink-0 shadow-sm">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500 block">
              Historical Auditor Scrubber:
            </label>
            <input
              type="date"
              value={scrubberDate}
              onChange={(e) => setScrubberDate(e.target.value)}
              className="bg-transparent border-none text-slate-900 text-xs font-mono font-bold focus:outline-none cursor-pointer mt-0.5"
            />
          </div>
          <button
            onClick={() => setScrubberDate('2026-08-05')}
            className="text-[10px] bg-white hover:bg-slate-100 text-slate-700 px-2.5 py-1 rounded border border-slate-300 font-medium"
          >
            Mid-Aug
          </button>
          <button
            onClick={() => setScrubberDate('2026-10-29')}
            className="text-[10px] bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded font-medium shadow-sm"
          >
            Today
          </button>
        </div>
      </div>

      {/* Explanation Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider">
            <Calendar className="w-4 h-4 text-blue-600" />
            Valid Time (Reality Dimension)
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            The exact calendar date when the student physically enrolled, commenced classes, or obtained an authorized transfer certificate.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            System Time (Audit Dimension)
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            The cryptographic timestamp when the institutional operator uploaded the record into the AICTE platform and the hash chain registered it.
          </p>
        </div>
      </div>

      {/* Bi-Temporal Scrubber Reconstruction Matrix */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            Reconstructed State as of {scrubberDate}
          </h2>
          <span className="text-xs text-slate-500 font-mono">
            Scrubber View: <strong className="text-slate-800">{scrubberDate}</strong>
          </span>
        </div>

        <div className="space-y-4">
          {bitemporalExamples.map((item, idx) => (
            <div
              key={idx}
              className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{item.studentName}</h3>
                  <div className="text-xs text-slate-500 font-mono">
                    {item.apaarId} &bull; {item.institution}
                  </div>
                </div>
                <span className="text-xs bg-white border border-slate-300 text-slate-700 px-2.5 py-0.5 rounded font-mono font-medium shadow-2xs">
                  Reporting Lag: {item.delayDays} Days
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white p-3.5 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-500 text-[11px] block font-medium">Valid Time (When Event Happened):</span>
                  <span className="text-blue-700 font-bold font-mono text-sm">{item.validTime}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block font-medium">System Time (When Recorded into AIM):</span>
                  <span className="text-emerald-700 font-bold font-mono text-sm">{item.systemTime}</span>
                </div>
              </div>

              <div className="text-xs p-3.5 rounded-lg bg-blue-50/70 border border-blue-200 text-blue-950">
                <strong className="text-blue-900">What the system showed on {scrubberDate}:</strong> {item.effectOnScrubberDate}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
