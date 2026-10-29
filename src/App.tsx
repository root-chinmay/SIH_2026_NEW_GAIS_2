import React, { useState, useEffect } from 'react';
import { store } from './services/store';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './components/LandingPage';
import { InstitutionDashboard } from './components/InstitutionDashboard';
import { StudentDataUpload } from './components/StudentDataUpload';
import { StudentRecordList } from './components/StudentRecordList';
import { AdmissionGateSimulation } from './components/AdmissionGateSimulation';
import { SeatLifecycleLedger } from './components/SeatLifecycleLedger';
import { DigitalTwinSimulator } from './components/DigitalTwinSimulator';
import { DiscrepancyInvestigation } from './components/DiscrepancyInvestigation';
import { RulesEngineTimeMachine } from './components/RulesEngineTimeMachine';
import { BiTemporalHistory } from './components/BiTemporalHistory';
import { AuditChainViewer } from './components/AuditChainViewer';
import { StudentAttestationPortal } from './components/StudentAttestationPortal';
import { AuthorizedVerifierPortal } from './components/AuthorizedVerifierPortal';
import { AicteCentralDashboard } from './components/AicteCentralDashboard';
import { SecurityPrivacyCentre } from './components/SecurityPrivacyCentre';
import { ReportsInspectionPack } from './components/ReportsInspectionPack';
import { DataCopilotDrawer } from './components/DataCopilotDrawer';
import { InstitutionDirectory } from './components/InstitutionDirectory';
import { BatchSignatoryReview } from './components/BatchSignatoryReview';

export default function App() {
  const [, setTick] = useState(0);
  const [activeView, setActiveView] = useState('landing');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  // Subscribe to reactive store changes
  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setTick((prev) => prev + 1);
    });
    return unsubscribe;
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Application Header */}
      <Header
        onOpenCopilot={() => setIsCopilotOpen(true)}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />

        {/* Workspace Content Canvas */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            {activeView === 'landing' && (
              <LandingPage onEnterDemo={(view) => setActiveView(view)} />
            )}

            {activeView === 'dashboard' && (
              <InstitutionDashboard onNavigate={(view) => setActiveView(view)} />
            )}

            {activeView === 'batch-review' && <BatchSignatoryReview />}

            {activeView === 'upload' && (
              <StudentDataUpload onSuccess={() => setActiveView('students')} />
            )}

            {activeView === 'students' && <StudentRecordList />}

            {activeView === 'institution-directory' && <InstitutionDirectory />}

            {activeView === 'gate' && <AdmissionGateSimulation />}

            {activeView === 'ledger' && <SeatLifecycleLedger />}

            {activeView === 'digital-twin' && <DigitalTwinSimulator />}

            {activeView === 'discrepancies' && <DiscrepancyInvestigation />}

            {activeView === 'rules-engine' && <RulesEngineTimeMachine />}

            {activeView === 'bitemporal' && <BiTemporalHistory />}

            {activeView === 'audit-chain' && <AuditChainViewer />}

            {activeView === 'student-portal' && <StudentAttestationPortal />}

            {activeView === 'verifier' && <AuthorizedVerifierPortal />}

            {activeView === 'aicte-central' && (
              <AicteCentralDashboard onNavigate={(view) => setActiveView(view)} />
            )}

            {activeView === 'security' && <SecurityPrivacyCentre />}

            {activeView === 'reports' && <ReportsInspectionPack />}
          </div>
        </main>
      </div>

      {/* AI Regulatory Copilot Slide-Over Drawer */}
      <DataCopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
      />
    </div>
  );
}
