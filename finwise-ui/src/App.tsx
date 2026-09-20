import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { LoginPage } from './components/LoginPage';
import { OverviewDashboard } from './components/OverviewDashboard';
import { DocumentUploadModal } from './components/DocumentUploadModal';
import { ProcessingScreen } from './components/ProcessingScreen';
import { FinancialAnalysisWorkspace } from './components/FinancialAnalysisWorkspace';
import { AnomalyIntelligence } from './components/AnomalyIntelligence';
import { AnomalyInvestigationModal } from './components/AnomalyInvestigationModal';
import { ReportComparison } from './components/ReportComparison';
import { UsersAndAccess } from './components/UsersAndAccess';
import { AuditLogsView } from './components/AuditLogsView';
import { LocalSystemDashboard } from './components/LocalSystemDashboard';
import { SourceEvidenceDrawer } from './components/SourceEvidenceDrawer';
import { GlobalSearchModal } from './components/GlobalSearchModal';

import type {
  DocumentInfo,
  ProcessingMode,
  FinancialMetricItem,
  FinancialSignal,
  SystemHardware
} from './types/doxfin';

import {
  initialHardware,
  sampleDocuments,
  pipelineStages,
  financialMetrics,
  sampleSignals,
  askDoxFinPresetQA,
  comparisonMetricsList,
  sampleUsers,
  sampleAuditLogs
} from './data/doxfinData';

export function App() {
  // Navigation & View State
  const [activeNav, setActiveNav] = useState<string>('overview');
  const [isLoginPageActive, setIsLoginPageActive] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState({
    name: 'Pratham',
    role: 'Lead Financial Analyst',
    email: 'pratham@internal.doxfin'
  });

  // Active Document & Processing Mode
  const [documents, setDocuments] = useState<DocumentInfo[]>(sampleDocuments);
  const [currentDocument, setCurrentDocument] = useState<DocumentInfo>(sampleDocuments[0]);
  const [processingMode, setProcessingMode] = useState<ProcessingMode>('balanced');
  const [hardware] = useState<SystemHardware>(initialHardware);

  // Modals & Drawers
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  const [isEvidenceDrawerOpen, setIsEvidenceDrawerOpen] = useState<boolean>(false);
  const [selectedMetricForEvidence, setSelectedMetricForEvidence] = useState<FinancialMetricItem | null>(null);

  const [isInvestigationModalOpen, setIsInvestigationModalOpen] = useState<boolean>(false);
  const [selectedSignalForInvestigation, setSelectedSignalForInvestigation] = useState<FinancialSignal | null>(null);

  const [workspaceInitialSubTab, setWorkspaceInitialSubTab] = useState<'overview' | 'financials' | 'trends' | 'anomalies' | 'document' | 'ask_doxfin'>('overview');

  // Handlers
  const handleOpenDocumentAnalysis = (doc: DocumentInfo, subTab: 'overview' | 'financials' | 'trends' | 'anomalies' | 'document' | 'ask_doxfin' = 'overview') => {
    setCurrentDocument(doc);
    setWorkspaceInitialSubTab(subTab);
    setActiveNav('financial_analysis');
  };

  const handleStartAnalysis = (newDoc: DocumentInfo) => {
    setDocuments([newDoc, ...documents]);
    setCurrentDocument(newDoc);
    setIsUploadModalOpen(false);
    setActiveNav('processing');
  };

  const handleInspectMetric = (metric: FinancialMetricItem) => {
    setSelectedMetricForEvidence(metric);
    setIsEvidenceDrawerOpen(true);
  };

  const handleInvestigateSignal = (signal: FinancialSignal) => {
    setSelectedSignalForInvestigation(signal);
    setIsInvestigationModalOpen(true);
  };

  const handleNavigateToDocumentPage = () => {
    setWorkspaceInitialSubTab('document');
    setActiveNav('financial_analysis');
  };

  const handleLoginSuccess = (user: { name: string; role: string; email: string }) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    setIsLoginPageActive(false);
  };

  // If viewing the dedicated Login screen
  if (isLoginPageActive) {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onBackToApp={() => setIsLoginPageActive(false)}
      />
    );
  }

  const unreviewedAnomaliesCount = sampleSignals.filter((s) => s.validationStatus === 'Requires Review').length;
  const activeProcessingCount = documents.filter((d) => d.status === 'processing').length;

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-slate-900 flex font-['Inter'] antialiased">
      {/* Fixed Left Sidebar */}
      <Sidebar
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        unreviewedAnomaliesCount={unreviewedAnomaliesCount || 3}
        activeProcessingCount={activeProcessingCount}
        currentUser={currentUser}
        onOpenSettings={() => setActiveNav('system')}
        onSwitchUser={() => setIsLoginPageActive(true)}
      />

      {/* Main Content Area (Offset by Sidebar width 64 = 16rem = 256px) */}
      <div className="flex-1 flex flex-col min-w-0 pl-64">
        {/* Top Header Navigation */}
        <TopNav
          currentDocument={currentDocument}
          allDocuments={documents}
          onSelectDocument={setCurrentDocument}
          processingMode={processingMode}
          onSetProcessingMode={setProcessingMode}
          onOpenUpload={() => setIsUploadModalOpen(true)}
          onOpenSearch={() => setIsSearchModalOpen(true)}
          onOpenLogin={() => setIsLoginPageActive(true)}
          isLoggedIn={isLoggedIn}
        />

        {/* Dynamic Body Router */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
          {/* 1. OVERVIEW / DASHBOARD */}
          {activeNav === 'overview' && (
            <OverviewDashboard
              documents={documents}
              signals={sampleSignals}
              onOpenDocument={(doc) => handleOpenDocumentAnalysis(doc, 'overview')}
              onOpenUpload={() => setIsUploadModalOpen(true)}
              onOpenAnomalies={() => setActiveNav('anomalies')}
              onOpenProcessing={(doc) => {
                if (doc) setCurrentDocument(doc);
                setActiveNav('processing');
              }}
              onOpenCompare={() => setActiveNav('compare_reports')}
            />
          )}

          {/* 2. DOCUMENTS LIBRARY */}
          {activeNav === 'documents' && (
            <div className="space-y-6 max-w-7xl mx-auto pb-12">
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 font-['DM_Sans']">Document Catalog</h1>
                  <p className="text-xs text-slate-500 mt-1">Locally indexed annual reports, statements, and financial PDFs</p>
                </div>
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="btn btn-primary text-xs font-semibold"
                >
                  + Upload New Document
                </button>
              </div>

              <OverviewDashboard
                documents={documents}
                signals={sampleSignals}
                onOpenDocument={(doc) => handleOpenDocumentAnalysis(doc, 'overview')}
                onOpenUpload={() => setIsUploadModalOpen(true)}
                onOpenAnomalies={() => setActiveNav('anomalies')}
                onOpenProcessing={(doc) => {
                  if (doc) setCurrentDocument(doc);
                  setActiveNav('processing');
                }}
                onOpenCompare={() => setActiveNav('compare_reports')}
              />
            </div>
          )}

          {/* 3. FINANCIAL ANALYSIS WORKSPACE */}
          {activeNav === 'financial_analysis' && (
            <FinancialAnalysisWorkspace
              document={currentDocument}
              metrics={financialMetrics}
              signals={sampleSignals}
              qaPresets={askDoxFinPresetQA}
              onInspectMetricEvidence={handleInspectMetric}
              onInvestigateSignal={handleInvestigateSignal}
              initialSubTab={workspaceInitialSubTab}
            />
          )}

          {/* 4. ANOMALIES & FINANCIAL SIGNALS */}
          {activeNav === 'anomalies' && (
            <AnomalyIntelligence
              signals={sampleSignals}
              onInvestigate={handleInvestigateSignal}
            />
          )}

          {/* 5. AI RESEARCH (ASK DOXFIN) */}
          {activeNav === 'ai_research' && (
            <FinancialAnalysisWorkspace
              document={currentDocument}
              metrics={financialMetrics}
              signals={sampleSignals}
              qaPresets={askDoxFinPresetQA}
              onInspectMetricEvidence={handleInspectMetric}
              onInvestigateSignal={handleInvestigateSignal}
              initialSubTab="ask_doxfin"
            />
          )}

          {/* 6. COMPARE REPORTS */}
          {activeNav === 'compare_reports' && (
            <ReportComparison
              comparisonMetrics={comparisonMetricsList}
              companyName={currentDocument.company}
            />
          )}

          {/* 7. PROCESSING PIPELINE SCREEN */}
          {activeNav === 'processing' && (
            <ProcessingScreen
              document={currentDocument}
              pipelineStages={pipelineStages}
              hardware={hardware}
              onViewAnalysis={(doc) => handleOpenDocumentAnalysis(doc, 'overview')}
            />
          )}

          {/* 8. ENTERPRISE AUDIT LOGS */}
          {activeNav === 'audit_logs' && (
            <AuditLogsView logs={sampleAuditLogs} />
          )}

          {/* 9. USERS & ACCESS */}
          {activeNav === 'users_access' && (
            <UsersAndAccess users={sampleUsers} />
          )}

          {/* 10. LOCAL SYSTEM TELEMETRY */}
          {activeNav === 'system' && (
            <LocalSystemDashboard
              hardware={hardware}
              processingMode={processingMode}
              onSetProcessingMode={setProcessingMode}
            />
          )}
        </main>
      </div>

      {/* Upload Document Modal */}
      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onStartAnalysis={handleStartAnalysis}
        hardware={hardware}
      />

      {/* Global Search (Ctrl+K) Modal */}
      <GlobalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        metrics={financialMetrics}
        signals={sampleSignals}
        documents={documents}
        onSelectMetric={(m) => {
          setSelectedMetricForEvidence(m);
          setIsEvidenceDrawerOpen(true);
        }}
        onSelectSignal={(s) => {
          setSelectedSignalForInvestigation(s);
          setIsInvestigationModalOpen(true);
        }}
        onSelectDocument={(d) => {
          setCurrentDocument(d);
          setActiveNav('financial_analysis');
        }}
      />

      {/* Source Evidence Sliding Side Drawer */}
      <SourceEvidenceDrawer
        isOpen={isEvidenceDrawerOpen}
        onClose={() => setIsEvidenceDrawerOpen(false)}
        metric={selectedMetricForEvidence}
        document={currentDocument}
        onNavigateToDocumentPage={handleNavigateToDocumentPage}
      />

      {/* Dedicated Anomaly Investigation Modal */}
      <AnomalyInvestigationModal
        isOpen={isInvestigationModalOpen}
        onClose={() => setIsInvestigationModalOpen(false)}
        signal={selectedSignalForInvestigation}
        onViewEvidencePage={handleNavigateToDocumentPage}
      />
    </div>
  );
}

export default App;
