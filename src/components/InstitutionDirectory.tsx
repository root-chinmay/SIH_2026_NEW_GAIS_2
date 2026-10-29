import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  CheckCircle2,
  Layers,
  FileCheck,
  ShieldCheck,
  FileText,
  Clock,
  ArrowRight,
  X,
  Edit3,
} from 'lucide-react';
import { store } from '../services/store';
import { Institution, Programme } from '../types';

export const InstitutionDirectory: React.FC = () => {
  const state = store.getState();
  const institutions = state.institutions;
  const isAuthorizedToRegister =
    state.currentUser.role === 'AICTE_ADMIN' || state.currentUser.role === 'INSTITUTION_ADMIN';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);

  // New Institution Modal State
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [newInst, setNewInst] = useState<{
    code: string;
    name: string;
    type: Institution['type'];
    state: string;
    district: string;
    address: string;
    contactEmail: string;
    authorizedSignatory: string;
    signatoryDesignation: string;
    initialProgrammeName: string;
    initialProgrammeCode: string;
    initialIntake: number;
  }>({
    code: 'IIT-DEL-05',
    name: 'Indraprastha Institute of Advanced Engineering',
    type: 'State University',
    state: 'Delhi',
    district: 'South Delhi',
    address: 'Okhla Industrial Estate, Phase III, New Delhi 110020',
    contactEmail: 'registrar@iiae.ac.in',
    authorizedSignatory: 'Prof. Arvind K. Saxena',
    signatoryDesignation: 'Dean of Academics',
    initialProgrammeName: 'B.Tech Robotics & Automation',
    initialProgrammeCode: 'ROBO-101',
    initialIntake: 30,
  });

  const filteredInstitutions = institutions.filter(
    (i) =>
      i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRegisterInstitution = (e: React.FormEvent) => {
    e.preventDefault();
    const instId = `INST-${newInst.state.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-2)}`;
    const progId = `PROG-${newInst.code}-${newInst.initialProgrammeCode}`;

    const prog: Programme = {
      id: progId,
      code: newInst.initialProgrammeCode,
      name: newInst.initialProgrammeName,
      degree: 'B.Tech',
      department: 'Engineering',
      durationYears: 4,
      approvedIntake: Number(newInst.initialIntake),
      supernumeraryLimits: { nri: 3, oci: 1, fn: 1, tfw: 2, ews: 3 },
      academicYear: '2026-2027',
    };

    const created: Institution = {
      id: instId,
      code: newInst.code,
      name: newInst.name,
      type: newInst.type,
      state: newInst.state,
      district: newInst.district,
      address: newInst.address,
      contactEmail: newInst.contactEmail,
      authorizedSignatory: newInst.authorizedSignatory,
      signatoryDesignation: newInst.signatoryDesignation,
      reportingStatus: 'Draft',
      lastSubmissionTimestamp: new Date().toISOString(),
      programmes: [prog],
      complianceScore: 100,
      dataQualityScore: 100,
    };

    store.addInstitution(created);
    setShowRegisterModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
              National Registry
            </span>
            <span className="text-[11px] font-mono text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 font-semibold">
              AICTE Approved Network
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            Institution Directory &amp; Registration
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete institutional directory containing approved programmes, sanctioned capacities, authorized signatories, and reporting compliance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isAuthorizedToRegister && (
            <button
              onClick={() => setShowRegisterModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              Register New Institution
            </button>
          )}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search institutions by name, code, or state..."
          className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 shadow-2xs"
        />
      </div>

      {/* Institutions Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredInstitutions.map((inst) => {
          const totalIntake = inst.programmes.reduce((acc, p) => acc + p.approvedIntake, 0);
          const instStudents = state.students.filter((s) => s.institutionId === inst.id);
          const activeAdmissions = instStudents.filter(
            (s) =>
              s.admissionStatus === 'Admission Confirmed' ||
              s.admissionStatus === 'Enrollment Reported' ||
              s.admissionStatus === 'Provisionally Admitted'
          ).length;

          return (
            <div
              key={inst.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 hover:border-blue-300 transition-colors shadow-xs"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-200">
                      {inst.code}
                    </span>
                    <span className="text-xs text-slate-500">{inst.type}</span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 mt-1.5">{inst.name}</h2>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {inst.district}, {inst.state} &bull; {inst.address}
                  </div>
                </div>

                <span
                  className={`text-[11px] px-2 py-0.5 rounded font-semibold border ${
                    inst.reportingStatus === 'Verified'
                      ? 'bg-teal-50 text-teal-800 border-teal-200'
                      : inst.reportingStatus === 'Submitted'
                      ? 'bg-blue-50 text-blue-800 border border-blue-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  {inst.reportingStatus}
                </span>
              </div>

              {/* Programmes summary */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-700 font-semibold">
                  <span>Approved Programmes ({inst.programmes.length}):</span>
                  <span className="font-mono text-teal-700 font-semibold">
                    {activeAdmissions} / {totalIntake} Seats Enrolled
                  </span>
                </div>
                <div className="space-y-1">
                  {inst.programmes.map((p) => (
                    <div key={p.id} className="flex justify-between text-slate-600 text-[11px]">
                      <span>{p.name} ({p.code})</span>
                      <span className="font-mono text-slate-700 font-medium">Cap: {p.approvedIntake}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Signatory and actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-[11px] text-slate-400 block">Authorized Signatory:</span>
                  <span className="text-slate-800 font-medium">{inst.authorizedSignatory}</span>
                </div>

                <button
                  onClick={() => setSelectedInstitution(inst)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                >
                  View Profile &amp; Audit Trail &rarr;
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Institution Profile Drawer / Modal */}
      {selectedInstitution && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto text-slate-800">
            <div className="flex items-start justify-between pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-200">
                    {selectedInstitution.code}
                  </span>
                  <span className="text-xs text-slate-500">{selectedInstitution.type}</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mt-1">{selectedInstitution.name}</h2>
                <div className="text-xs text-slate-500 mt-0.5">
                  Signatory: {selectedInstitution.authorizedSignatory} ({selectedInstitution.signatoryDesignation})
                </div>
              </div>
              <button
                onClick={() => setSelectedInstitution(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Approved Programmes & Limits Table */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Approved Programme Capacities &amp; Supernumerary Quotas
              </h3>
              <div className="overflow-x-auto rounded-xl border border-slate-200 text-xs">
                <table className="w-full text-left text-slate-700">
                  <thead className="bg-blue-50/70 text-blue-950 font-semibold border-b border-blue-100">
                    <tr>
                      <th className="p-3">Programme</th>
                      <th className="p-3">Regular Cap</th>
                      <th className="p-3">NRI Quota</th>
                      <th className="p-3">TFW Quota</th>
                      <th className="p-3">EWS Quota</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedInstitution.programmes.map((p) => (
                      <tr key={p.id}>
                        <td className="p-3 font-semibold text-slate-900">{p.name}</td>
                        <td className="p-3 font-mono">{p.approvedIntake}</td>
                        <td className="p-3 font-mono">{p.supernumeraryLimits.nri}</td>
                        <td className="p-3 font-mono">{p.supernumeraryLimits.tfw}</td>
                        <td className="p-3 font-mono">{p.supernumeraryLimits.ews}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Institutional Submission Batches */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Submission Batch History
              </h3>
              <div className="space-y-2">
                {state.batches
                  .filter((b) => b.institutionId === selectedInstitution.id)
                  .map((b) => (
                    <div
                      key={b.id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-slate-900">{b.batchNumber}</div>
                        <div className="text-[11px] text-slate-500">
                          {b.totalRecords} records &bull; Uploaded by {b.uploadedBy} on {b.uploadedAt.split('T')[0]}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                        {b.status}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Institutional Audit Trail */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Institutional Cryptographic Audit Trail
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {state.auditChain
                  .filter(
                    (e) => !e.institutionId || e.institutionId === selectedInstitution.id
                  )
                  .map((e) => (
                    <div
                      key={e.id}
                      className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px] space-y-1"
                    >
                      <div className="flex justify-between text-slate-500">
                        <span className="font-mono text-teal-700 font-semibold">{e.action}</span>
                        <span>{e.timestamp.split('T')[0]}</span>
                      </div>
                      <div className="text-slate-800">{e.details}</div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Register New Institution Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleRegisterInstitution}
            className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-slate-800"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Register AICTE Institution (Demo)
              </h2>
              <button
                type="button"
                onClick={() => setShowRegisterModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="font-semibold text-slate-700 block mb-1">
                  Institution Name:
                </label>
                <input
                  type="text"
                  required
                  value={newInst.name}
                  onChange={(e) => setNewInst({ ...newInst, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Permanent AICTE Code:
                </label>
                <input
                  type="text"
                  required
                  value={newInst.code}
                  onChange={(e) => setNewInst({ ...newInst, code: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-mono focus:bg-white focus:border-blue-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Institution Type:</label>
                <select
                  value={newInst.type}
                  onChange={(e) => setNewInst({ ...newInst, type: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-600"
                >
                  <option value="State University">State University</option>
                  <option value="Central University">Central University</option>
                  <option value="Affiliated Autonomous College">Affiliated Autonomous</option>
                  <option value="Private Institute">Private Institute</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">State:</label>
                <input
                  type="text"
                  required
                  value={newInst.state}
                  onChange={(e) => setNewInst({ ...newInst, state: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">District:</label>
                <input
                  type="text"
                  required
                  value={newInst.district}
                  onChange={(e) => setNewInst({ ...newInst, district: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold text-slate-700 block mb-1">
                  Initial Approved Programme:
                </label>
                <input
                  type="text"
                  required
                  value={newInst.initialProgrammeName}
                  onChange={(e) =>
                    setNewInst({ ...newInst, initialProgrammeName: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:border-blue-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Programme Code:</label>
                <input
                  type="text"
                  required
                  value={newInst.initialProgrammeCode}
                  onChange={(e) =>
                    setNewInst({ ...newInst, initialProgrammeCode: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-mono focus:bg-white focus:border-blue-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Approved Intake:</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={newInst.initialIntake}
                  onChange={(e) =>
                    setNewInst({ ...newInst, initialIntake: Number(e.target.value) })
                  }
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-mono focus:bg-white focus:border-blue-600"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowRegisterModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                Complete Registration
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
