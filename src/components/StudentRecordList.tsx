import React, { useState } from 'react';
import {
  Users,
  Search,
  Eye,
  EyeOff,
  Filter,
  Plus,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileEdit,
  Award,
  Building,
} from 'lucide-react';
import { store } from '../services/store';
import { StudentRecord, AdmissionCategory, AdmissionStatus } from '../types';
import { maskApaarId } from '../services/cryptoEngine';
import { AdmissionTimelineModal } from './AdmissionTimelineModal';

export const StudentRecordList: React.FC = () => {
  const state = store.getState();
  const currentInstId = state.currentUser.institutionId;

  const [searchTerm, setSearchTerm] = useState('');
  const [filterInst, setFilterInst] = useState<string>(currentInstId || 'ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [maskId, setMaskId] = useState(true);

  // Selected student for timeline modal
  const [timelineStudent, setTimelineStudent] = useState<StudentRecord | null>(null);

  // Correction Modal State
  const [correctionTarget, setCorrectionTarget] = useState<StudentRecord | null>(null);
  const [proposedApaar, setProposedApaar] = useState('');
  const [proposedCategory, setProposedCategory] = useState<AdmissionCategory>('General');
  const [correctionEvidence, setCorrectionEvidence] = useState('');
  const [correctionJustification, setCorrectionJustification] = useState('');

  // Add Manual Student Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudent, setNewStudent] = useState<Partial<StudentRecord>>({
    name: '',
    apaarId: '',
    institutionalStudentId: '',
    admissionCategory: 'General',
    isSupernumerary: false,
    admissionDate: new Date().toISOString().split('T')[0],
    admissionStatus: 'Admission Confirmed',
  });

  // Filter logic
  const filteredStudents = state.students.filter((s) => {
    if (filterInst !== 'ALL' && s.institutionId !== filterInst) return false;
    if (filterStatus !== 'ALL' && s.validationStatus !== filterStatus) return false;

    if (searchTerm.trim().length > 0) {
      const q = searchTerm.toLowerCase();
      const matchName = s.name.toLowerCase().includes(q);
      const matchApaar = s.apaarId.toLowerCase().includes(q);
      const matchRoll = s.institutionalStudentId.toLowerCase().includes(q);
      if (!matchName && !matchApaar && !matchRoll) return false;
    }
    return true;
  });

  const handleOpenCorrection = (student: StudentRecord) => {
    setCorrectionTarget(student);
    setProposedApaar(student.apaarId);
    setProposedCategory(student.admissionCategory);
    setCorrectionEvidence('Attested Government Secondary Certificate');
    setCorrectionJustification('Correction of student identifier/quota record.');
  };

  const handleSubmitCorrection = () => {
    if (!correctionTarget) return;
    store.submitCorrectionRequest(
      correctionTarget.id,
      {
        apaarId: proposedApaar,
        admissionCategory: proposedCategory,
      },
      correctionEvidence,
      correctionJustification
    );
    setCorrectionTarget(null);
  };

  const handleIssueCredential = (studentId: string) => {
    store.issueCredential(studentId);
    alert('Verifiable signed credential issued successfully! You can verify it in the Authorized Verifier portal.');
  };

  const handleAddManualStudent = () => {
    if (!newStudent.name || !newStudent.apaarId) {
      alert('Please provide name and synthetic APAAR ID');
      return;
    }

    const targetInstId = filterInst !== 'ALL' ? filterInst : 'INST-DEL-01';
    const inst = state.institutions.find((i) => i.id === targetInstId)!;
    const prog = inst.programmes[0];

    store.commitBatch({
      institutionId: inst.id,
      programmeId: prog.id,
      academicYear: '2026-2027',
      records: [newStudent],
    });

    setShowAddModal(false);
    setNewStudent({
      name: '',
      apaarId: '',
      institutionalStudentId: '',
      admissionCategory: 'General',
      isSupernumerary: false,
      admissionDate: new Date().toISOString().split('T')[0],
      admissionStatus: 'Admission Confirmed',
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-400" />
            Central Student Enrolment Repository
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Canonical student-level database with privacy-preserving matching tokens and cross-institution lifecycle tracking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setMaskId(!maskId)}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-2 rounded-xl text-xs font-medium transition-colors"
          >
            {maskId ? <Eye className="w-4 h-4 text-teal-400" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
            <span>{maskId ? 'Unmask Identifiers' : 'Mask Identifiers'}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-md shadow-blue-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Student
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, APAAR, or roll number..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Building className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={filterInst}
            onChange={(e) => setFilterInst(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Institutions (National)</option>
            {state.institutions.map((i) => (
              <option key={i.id} value={i.id}>
                {i.code} — {i.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Validation Statuses</option>
            <option value="VALID">Valid Records Only</option>
            <option value="WARNING">Warnings Only</option>
            <option value="INVALID">Invalid / Errors Only</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-xs text-slate-400 flex items-center justify-between">
        <span>Showing {filteredStudents.length} of {state.students.length} student records</span>
        <span className="font-mono text-teal-400">HMAC Matching Tokens Active</span>
      </div>

      {/* Main Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 sticky top-0 border-b border-slate-800 z-10">
              <tr>
                <th className="p-3.5">Student / Roll</th>
                <th className="p-3.5">APAAR ID</th>
                <th className="p-3.5">Institution &amp; Programme</th>
                <th className="p-3.5">Category &amp; Quota</th>
                <th className="p-3.5">Validation</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredStudents.map((s) => {
                const inst = state.institutions.find((i) => i.id === s.institutionId);
                const prog = inst?.programmes.find((p) => p.id === s.programmeId);

                return (
                  <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Name and Roll */}
                    <td className="p-3.5">
                      <div className="font-semibold text-white text-sm">{s.name}</div>
                      <div className="text-slate-400 font-mono text-[11px] mt-0.5">
                        {s.institutionalStudentId} &bull; {s.gender}
                      </div>
                    </td>

                    {/* APAAR Identifier with Masking */}
                    <td className="p-3.5">
                      <div className="font-mono font-medium text-slate-200">
                        {maskId ? maskApaarId(s.apaarId) : s.apaarId || (
                          <span className="text-rose-400 font-semibold">[MISSING]</span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono truncate max-w-[130px]">
                        {s.matchingToken}
                      </div>
                    </td>

                    {/* Institution and Programme */}
                    <td className="p-3.5">
                      <div className="font-medium text-white">{inst?.code || s.institutionId}</div>
                      <div className="text-slate-400 text-[11px] truncate max-w-[200px]">
                        {prog?.name || s.programmeId}
                      </div>
                    </td>

                    {/* Category & Status */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                          {s.admissionCategory}
                        </span>
                        {s.isSupernumerary && (
                          <span className="px-1.5 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800 text-[10px] font-semibold">
                            {s.supernumeraryType || 'Super'}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Status: <span className="text-slate-300">{s.admissionStatus}</span>
                      </div>
                    </td>

                    {/* Validation Badge */}
                    <td className="p-3.5">
                      {s.validationStatus === 'VALID' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Valid
                        </span>
                      ) : s.validationStatus === 'WARNING' ? (
                        <span className="inline-flex items-center gap-1 text-amber-400 font-semibold bg-amber-950/60 border border-amber-800/80 px-2 py-0.5 rounded text-[11px]">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Warning
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-400 font-semibold bg-rose-950/60 border border-rose-800/80 px-2 py-0.5 rounded text-[11px]">
                          <XCircle className="w-3.5 h-3.5" />
                          Error
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-right space-x-1">
                      <button
                        onClick={() => setTimelineStudent(s)}
                        className="inline-flex items-center gap-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-blue-300 hover:text-white px-2.5 py-1 rounded transition-colors"
                        title="View Multi-Institution Admission Timeline"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        Timeline
                      </button>

                      <button
                        onClick={() => handleOpenCorrection(s)}
                        className="inline-flex items-center gap-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2 py-1 rounded transition-colors"
                        title="Submit Data Correction"
                      >
                        <FileEdit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleIssueCredential(s.id)}
                        className="inline-flex items-center gap-1 text-[11px] bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-800 px-2 py-1 rounded transition-colors"
                        title="Issue Signed Verifiable Credential"
                      >
                        <Award className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Timeline Modal */}
      {timelineStudent && (
        <AdmissionTimelineModal
          apaarId={timelineStudent.apaarId}
          studentName={timelineStudent.name}
          onClose={() => setTimelineStudent(null)}
        />
      )}

      {/* Correction Request Modal */}
      {correctionTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileEdit className="w-5 h-5 text-blue-400" />
              Submit Student Data Correction
            </h3>
            <p className="text-xs text-slate-400">
              Student: <strong>{correctionTarget.name}</strong> ({correctionTarget.institutionalStudentId})
            </p>

            <div className="space-y-3 pt-2">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Proposed APAAR ID:
                </label>
                <input
                  type="text"
                  value={proposedApaar}
                  onChange={(e) => setProposedApaar(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  placeholder="APAAR-DEMO-XXXX"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Proposed Admission Category:
                </label>
                <select
                  value={proposedCategory}
                  onChange={(e) => setProposedCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                >
                  <option value="General">General</option>
                  <option value="OBC-NCL">OBC-NCL</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                  <option value="EWS">EWS</option>
                  <option value="TFW">TFW</option>
                  <option value="NRI">NRI</option>
                  <option value="OCI">OCI</option>
                  <option value="FN">FN</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Supporting Evidence Reference:
                </label>
                <input
                  type="text"
                  value={correctionEvidence}
                  onChange={(e) => setCorrectionEvidence(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  placeholder="Certificate / DigiLocker Ref..."
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Reason / Justification:
                </label>
                <textarea
                  value={correctionJustification}
                  onChange={(e) => setCorrectionJustification(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white h-20"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                onClick={() => setCorrectionTarget(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitCorrection}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
              >
                Submit for Signatory Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Single Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-400" />
              Manually Add Synthetic Student Record
            </h3>

            <div className="space-y-3 pt-2">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Full Legal Name:
                </label>
                <input
                  type="text"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  placeholder="e.g. Siddharth Nair"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Synthetic APAAR ID:
                </label>
                <input
                  type="text"
                  value={newStudent.apaarId}
                  onChange={(e) => setNewStudent({ ...newStudent, apaarId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  placeholder="APAAR-DEMO-0301"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Institutional Roll Number:
                </label>
                <input
                  type="text"
                  value={newStudent.institutionalStudentId}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, institutionalStudentId: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  placeholder="DTU/2026/CSE/301"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Admission Category:
                  </label>
                  <select
                    value={newStudent.admissionCategory}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, admissionCategory: e.target.value as any })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
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

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Supernumerary Quota:
                  </label>
                  <select
                    value={newStudent.isSupernumerary ? 'true' : 'false'}
                    onChange={(e) =>
                      setNewStudent({
                        ...newStudent,
                        isSupernumerary: e.target.value === 'true',
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    <option value="false">Regular Seat</option>
                    <option value="true">Supernumerary</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleAddManualStudent}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
              >
                Validate &amp; Add Student
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
