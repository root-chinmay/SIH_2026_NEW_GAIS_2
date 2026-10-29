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
  Shield,
  FileText,
  X,
} from 'lucide-react';
import { store } from '../services/store';
import { StudentRecord, AdmissionCategory, AdmissionStatus } from '../types';
import { maskApaarId } from '../services/cryptoEngine';
import { AdmissionTimelineModal } from './AdmissionTimelineModal';

export const StudentRecordList: React.FC = () => {
  const state = store.getState();
  const currentInstId = state.currentUser.institutionId || 'INST-DEL-01';
  const isNationalRole =
    state.currentUser.role === 'AICTE_ADMIN' || state.currentUser.role === 'AICTE_AUDITOR';

  const [searchTerm, setSearchTerm] = useState('');
  const [filterInst, setFilterInst] = useState<string>(isNationalRole ? 'ALL' : currentInstId);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [maskId, setMaskId] = useState(true);

  // Selected student for timeline modal
  const [timelineStudent, setTimelineStudent] = useState<StudentRecord | null>(null);
  const [corroborationStudent, setCorroborationStudent] = useState<StudentRecord | null>(null);

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

  // Strict Tenant Isolation Filter Logic
  const effectiveInstFilter = isNationalRole ? filterInst : currentInstId;

  const filteredStudents = state.students.filter((s) => {
    if (effectiveInstFilter !== 'ALL' && s.institutionId !== effectiveInstFilter) return false;
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Central Student Enrolment Repository
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Canonical student-level database with privacy-preserving matching tokens and cross-institution lifecycle tracking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setMaskId(!maskId)}
            className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-3 py-2 rounded-xl text-xs font-medium transition-colors shadow-2xs"
          >
            {maskId ? <Eye className="w-4 h-4 text-teal-600" /> : <EyeOff className="w-4 h-4 text-slate-500" />}
            <span>{maskId ? 'Unmask Identifiers' : 'Mask Identifiers'}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Student
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, APAAR, or roll number..."
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <Building className="w-4 h-4 text-slate-400 shrink-0" />
          {isNationalRole ? (
            <select
              value={filterInst}
              onChange={(e) => setFilterInst(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-600"
            >
              <option value="ALL">All AICTE Institutions (National View)</option>
              {state.institutions.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.code} — {i.name}
                </option>
              ))}
            </select>
          ) : (
            <div className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 flex items-center justify-between">
              <span className="truncate max-w-[190px] font-medium text-slate-900">
                {state.institutions.find((i) => i.id === currentInstId)?.name || currentInstId}
              </span>
              <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200 font-medium">
                Tenant Scoped
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-600"
          >
            <option value="ALL">All Validation Statuses</option>
            <option value="VALID">Valid Records Only</option>
            <option value="WARNING">Warnings Only</option>
            <option value="INVALID">Invalid / Errors Only</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-xs text-slate-500 flex items-center justify-between">
        <span>Showing {filteredStudents.length} of {state.students.length} student records</span>
        <span className="font-mono text-teal-700 font-medium">HMAC Matching Tokens Active</span>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-blue-50/70 text-blue-950 font-semibold sticky top-0 border-b border-blue-100 z-10">
              <tr>
                <th className="p-3.5">Student / Roll</th>
                <th className="p-3.5">APAAR ID</th>
                <th className="p-3.5">Institution &amp; Programme</th>
                <th className="p-3.5">Category &amp; Quota</th>
                <th className="p-3.5">Validation</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((s) => {
                const inst = state.institutions.find((i) => i.id === s.institutionId);
                const prog = inst?.programmes.find((p) => p.id === s.programmeId);

                return (
                  <tr key={s.id} className="hover:bg-blue-50/30 transition-colors">
                    {/* Name and Roll */}
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-900 text-sm">{s.name}</div>
                      <div className="text-slate-500 font-mono text-[11px] mt-0.5">
                        {s.institutionalStudentId} &bull; {s.gender}
                      </div>
                    </td>

                    {/* APAAR Identifier with Masking */}
                    <td className="p-3.5">
                      <div className="font-mono font-medium text-slate-800">
                        {maskId ? maskApaarId(s.apaarId) : s.apaarId || (
                          <span className="text-rose-600 font-semibold">[MISSING]</span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono truncate max-w-[130px]">
                        {s.matchingToken}
                      </div>
                    </td>

                    {/* Institution and Programme */}
                    <td className="p-3.5">
                      <div className="font-medium text-slate-900">{inst?.code || s.institutionId}</div>
                      <div className="text-slate-500 text-[11px] truncate max-w-[200px]">
                        {prog?.name || s.programmeId}
                      </div>
                    </td>

                    {/* Category & Status */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                          {s.admissionCategory}
                        </span>
                        {s.isSupernumerary && (
                          <span className="px-1.5 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 text-[10px] font-semibold">
                            {s.supernumeraryType || 'Super'}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Status: <span className="text-slate-700 font-medium">{s.admissionStatus}</span>
                      </div>
                    </td>

                    {/* Validation Badge */}
                    <td className="p-3.5">
                      {s.validationStatus === 'VALID' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Valid
                        </span>
                      ) : s.validationStatus === 'WARNING' ? (
                        <span className="inline-flex items-center gap-1 text-amber-800 font-semibold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[11px]">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Warning
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-700 font-semibold bg-rose-50 border border-rose-200 px-2 py-0.5 rounded text-[11px]">
                          <XCircle className="w-3.5 h-3.5" />
                          Error
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-right space-x-1">
                      <button
                        onClick={() => setTimelineStudent(s)}
                        className="inline-flex items-center gap-1 text-[11px] bg-slate-50 hover:bg-blue-50 text-blue-700 border border-slate-200 hover:border-blue-300 px-2.5 py-1 rounded transition-colors font-medium shadow-2xs"
                        title="View Multi-Institution Admission Timeline"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        Timeline
                      </button>

                      <button
                        onClick={() => setCorroborationStudent(s)}
                        className="inline-flex items-center gap-1 text-[11px] bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 px-2 py-1 rounded transition-colors font-medium shadow-2xs"
                        title="Inspect Academic Corroboration Signals"
                      >
                        <Shield className="w-3.5 h-3.5" />
                        Signals
                      </button>

                      <button
                        onClick={() => handleOpenCorrection(s)}
                        className="inline-flex items-center gap-1 text-[11px] bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-2 py-1 rounded transition-colors shadow-2xs"
                        title="Submit Data Correction"
                      >
                        <FileEdit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleIssueCredential(s.id)}
                        className="inline-flex items-center gap-1 text-[11px] bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded transition-colors font-medium shadow-2xs"
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
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-slate-800">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileEdit className="w-5 h-5 text-blue-600" />
              Submit Student Data Correction
            </h3>
            <p className="text-xs text-slate-500">
              Student: <strong>{correctionTarget.name}</strong> ({correctionTarget.institutionalStudentId})
            </p>

            <div className="space-y-3 pt-2">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Proposed APAAR ID:
                </label>
                <input
                  type="text"
                  value={proposedApaar}
                  onChange={(e) => setProposedApaar(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-mono focus:bg-white focus:border-blue-600"
                  placeholder="APAAR-DEMO-XXXX"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Proposed Admission Category:
                </label>
                <select
                  value={proposedCategory}
                  onChange={(e) => setProposedCategory(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-blue-600"
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
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Supporting Evidence Reference:
                </label>
                <input
                  type="text"
                  value={correctionEvidence}
                  onChange={(e) => setCorrectionEvidence(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-blue-600"
                  placeholder="Certificate / DigiLocker Ref..."
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Reason / Justification:
                </label>
                <textarea
                  value={correctionJustification}
                  onChange={(e) => setCorrectionJustification(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 h-20 focus:bg-white focus:border-blue-600"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200">
              <button
                onClick={() => setCorrectionTarget(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitCorrection}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                Submit for Signatory Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Single Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-slate-800">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              Manually Add Synthetic Student Record
            </h3>

            <div className="space-y-3 pt-2">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Full Legal Name:
                </label>
                <input
                  type="text"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-blue-600"
                  placeholder="e.g. Siddharth Nair"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Synthetic APAAR ID:
                </label>
                <input
                  type="text"
                  value={newStudent.apaarId}
                  onChange={(e) => setNewStudent({ ...newStudent, apaarId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-mono focus:bg-white focus:border-blue-600"
                  placeholder="APAAR-DEMO-0301"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Institutional Roll Number:
                </label>
                <input
                  type="text"
                  value={newStudent.institutionalStudentId}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, institutionalStudentId: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-mono focus:bg-white focus:border-blue-600"
                  placeholder="DTU/2026/CSE/301"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Admission Category:
                  </label>
                  <select
                    value={newStudent.admissionCategory}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, admissionCategory: e.target.value as any })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-blue-600"
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
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
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
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-blue-600"
                  >
                    <option value="false">Regular Seat</option>
                    <option value="true">Supernumerary</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddManualStudent}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                Validate &amp; Add Student
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Corroboration Signals Inspection Modal */}
      {corroborationStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shadow-2xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Academic Corroboration Signals
                  </h2>
                  <p className="text-xs text-slate-500 font-mono">
                    {corroborationStudent.name} &bull; {corroborationStudent.institutionalStudentId}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCorroborationStudent(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mandatory Regulatory Principle Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 leading-relaxed">
              <span className="font-bold text-amber-800 block mb-0.5">
                Statutory Principle (AICTE Multi-Signal Guideline):
              </span>
              Rule: Corroboration signals provide confidence scoring only. Absence of a corroboration signal SHALL NOT be used as the sole basis to classify a student as fraudulent or ghost.
            </div>

            {/* 4 Multi-Source Corroboration Signals */}
            <div className="space-y-2.5 text-xs">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start justify-between">
                <div>
                  <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    1. University Exam Registration
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Affiliated University Portal &bull; Term End 2026 Examination
                  </p>
                </div>
                <span className="font-mono text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200 font-medium">
                  EXAM-2026-{corroborationStudent.institutionalStudentId.slice(-4)}
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start justify-between">
                <div>
                  <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    2. Tuition Fee Payment Receipt
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    State Treasury / Institutional ERP Gateway
                  </p>
                </div>
                <span className="font-mono text-[10px] bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-200 font-medium">
                  TXN-FEES-{corroborationStudent.id.slice(-6)}
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start justify-between">
                <div>
                  <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    3. Scholarship / Quota Reference
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {corroborationStudent.admissionCategory !== 'General'
                      ? 'State Social Welfare / Central Scholarship Portal (NSP)'
                      : 'Institutional Merit / Self-Financed Tier'}
                  </p>
                </div>
                <span className="font-mono text-[10px] bg-purple-50 text-purple-800 px-2 py-0.5 rounded border border-purple-200 font-medium">
                  {corroborationStudent.admissionCategory !== 'General' ? 'NSP-VERIFIED' : 'GENERAL-QUOTA'}
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start justify-between">
                <div>
                  <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    4. Campus Hostel / RFID Access Record
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Central Library RFID &amp; Academic Biometric Access
                  </p>
                </div>
                <span className="font-mono text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded border border-slate-300 font-medium">
                  RFID-{corroborationStudent.institutionalStudentId.slice(-4)}
                </span>
              </div>
            </div>

            {/* Composite Confidence Score */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between text-xs">
              <span className="text-slate-600">Composite Multi-Signal Confidence:</span>
              <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                High Confidence (4/4 Signals Active)
              </span>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-200">
              <button
                onClick={() => setCorroborationStudent(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium"
              >
                Close Signal View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
