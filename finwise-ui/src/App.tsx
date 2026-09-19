import { useState } from 'react';
import { Header } from './components/Header';
import { DocumentPipeline } from './components/DocumentPipeline';
import { FinancialEngine } from './components/FinancialEngine';
import { AnomalyDetector } from './components/AnomalyDetector';
import { RagEvidenceViewer } from './components/RagEvidenceViewer';
import { HumanInTheLoop } from './components/HumanInTheLoop';
import { SecurityLicenseManager } from './components/SecurityLicenseManager';
import { AiAnalystChat } from './components/AiAnalystChat';

import type {
  ProcessingMode,
  DeploymentType,
  ReportDocument,
  FinancialRatio,
  Anomaly,
  RagChunk,
  AuditLogItem,
  EnterpriseLicense,
  ChatMessage
} from './types/finwise';

import {
  initialDocument,
  sampleClassifiedPages,
  initialRatios,
  sampleAnomalies,
  sampleRagChunks,
  sampleAuditLogs,
  sampleLicense,
  sampleChatMessages
} from './data/sampleReports';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('pipeline');
  const [processingMode, setProcessingMode] = useState<ProcessingMode>('balanced');
  const [deployment, setDeployment] = useState<DeploymentType>('enterprise_local');

  const [document, setDocument] = useState<ReportDocument>(initialDocument);
  const [ratios] = useState<FinancialRatio[]>(initialRatios);
  const [anomalies, setAnomalies] = useState<Anomaly[]>(sampleAnomalies);
  const [ragChunks] = useState<RagChunk[]>(sampleRagChunks);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(sampleAuditLogs);
  const [license] = useState<EnterpriseLicense>(sampleLicense);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(sampleChatMessages);
  const [targetEvidencePage, setTargetEvidencePage] = useState<number>(126);

  // Unreviewed anomaly counter
  const unreviewedCount = anomalies.filter(a => a.reviewStatus === 'unreviewed').length;

  const handleSimulateUpload = (fileName: string, totalPages: number) => {
    const textPages = Math.floor(totalPages * 0.45);
    const tablePages = Math.floor(totalPages * 0.30);
    const chartPages = Math.floor(totalPages * 0.10);
    const skippedPages = totalPages - (textPages + tablePages + chartPages);

    const newDoc: ReportDocument = {
      id: `doc-${Date.now()}`,
      name: fileName,
      totalPages: totalPages,
      fileSizeMB: Number((totalPages * 0.1).toFixed(1)),
      uploadDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: 'ready',
      processingMode: processingMode,
      deployment: deployment,
      classifiedPages: {
        textPages,
        tablePages,
        chartPages,
        skippedPages
      }
    };

    setDocument(newDoc);

    // Add Audit Log
    const newLog: AuditLogItem = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user: 'analyst.priya@finwise.internal',
      role: 'Senior Financial Analyst',
      action: 'DOCUMENT_UPLOAD',
      details: `Uploaded ${fileName} (${totalPages} pages). Pipeline router assigned PyMuPDF (${textPages} pgs), Docling (${tablePages} pgs), Vision VLM (${chartPages} pgs).`,
      ipAddress: '10.240.12.88',
      status: 'SUCCESS'
    };
    setAuditLogs([newLog, ...auditLogs]);
  };

  const handleInspectEvidence = (pageNumber: number) => {
    setTargetEvidencePage(pageNumber);
    setActiveTab('rag_evidence');
  };

  const handleUpdateAnomalyStatus = (id: string, newStatus: 'approved' | 'corrected' | 'overridden' | 'unreviewed') => {
    setAnomalies(anomalies.map(a => a.id === id ? { ...a, reviewStatus: newStatus } : a));

    // Audit log
    const newLog: AuditLogItem = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user: 'analyst.priya@finwise.internal',
      role: 'Senior Financial Analyst',
      action: 'ANOMALY_REVIEW',
      details: `Changed review status for anomaly ${id} to ${newStatus.toUpperCase()}`,
      ipAddress: '10.240.12.88',
      status: 'SUCCESS'
    };
    setAuditLogs([newLog, ...auditLogs]);
  };

  const handleSendMessage = (text: string) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const isProfitQuestion = text.toLowerCase().includes('profit') || text.toLowerCase().includes('margin');
    const isCashFlowQuestion = text.toLowerCase().includes('cash') || text.toLowerCase().includes('fcf');

    let botResponseText = 'FinWise RAG Vector Engine processed your question against 486 report pages and 8 deterministic ratios:\n\n1. **Extracted Fact**: Verified across P&L and Balance Sheet tables.\n2. **Python Calculation**: No arithmetic hallucination detected.\n3. **Management Context**: Retrieved from MD&A section.';
    let citations = [
      {
        pageNumber: 126,
        section: 'Consolidated Statement of Profit & Loss',
        document: document.name,
        snippet: 'Revenue from operations reached ₹1,200 Cr while total expenses expanded to ₹1,038.5 Cr.'
      }
    ];

    if (isProfitQuestion) {
      botResponseText = `Based on Python deterministic metric calculations and RAG evidence:\n\n• **Revenue Growth**: +20.0% (₹1,000 Cr → ₹1,200 Cr)\n• **Net Profit Margin**: Dropped from 18.5% to 13.5% (-27% YoY)\n• **Root Cause**: Raw semiconductor input tariffs rose 38% alongside a ₹24 Cr one-time employee restructuring severance.`;
      citations = [
        {
          pageNumber: 126,
          section: 'Consolidated Statement of Profit & Loss',
          document: document.name,
          snippet: 'Revenue from operations stood at ₹1,200.5 Cr compared to ₹1,000.0 Cr.'
        },
        {
          pageNumber: 89,
          section: 'MD&A - Operating Expense Analysis',
          document: document.name,
          snippet: 'Gross margins contracted by 500 bps owing to semiconductor price spikes.'
        }
      ];
    } else if (isCashFlowQuestion) {
      botResponseText = `Free Cash Flow analysis from Page 198:\n\n• **Operating Cash Flow**: ₹224 Cr (down 41% from ₹380 Cr)\n• **CapEx Spending**: ₹44 Cr\n• **Calculated FCF**: ₹180 Cr (vs ₹340 Cr in FY24)\n• **Primary Factor**: Trade receivables expanded as credit terms were extended to 90 days for tier-1 partners.`;
      citations = [
        {
          pageNumber: 198,
          section: 'Consolidated Cash Flow Statement',
          document: document.name,
          snippet: 'Net cash generated from operating activities = ₹224 Cr.'
        }
      ];
    }

    const botMsg: ChatMessage = {
      id: `msg-${Date.now() + 1}`,
      sender: 'finwise_llm',
      text: botResponseText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      citations
    };

    setChatMessages(prev => [...prev, userMsg, botMsg]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-gray-100 flex flex-col">
      {/* Top Header Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        processingMode={processingMode}
        setProcessingMode={setProcessingMode}
        deployment={deployment}
        setDeployment={setDeployment}
        anomaliesCount={anomalies.length}
        unreviewedCount={unreviewedCount}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'pipeline' && (
          <DocumentPipeline
            document={document}
            classifiedPages={sampleClassifiedPages}
            processingMode={processingMode}
            onSimulateUpload={handleSimulateUpload}
          />
        )}

        {activeTab === 'engine' && (
          <FinancialEngine ratios={ratios} />
        )}

        {activeTab === 'anomalies' && (
          <AnomalyDetector
            anomalies={anomalies}
            onInspectEvidence={handleInspectEvidence}
          />
        )}

        {activeTab === 'rag_evidence' && (
          <RagEvidenceViewer
            chunks={ragChunks}
            initialPage={targetEvidencePage}
          />
        )}

        {activeTab === 'human_loop' && (
          <HumanInTheLoop
            anomalies={anomalies}
            onUpdateStatus={handleUpdateAnomalyStatus}
          />
        )}

        {activeTab === 'security' && (
          <SecurityLicenseManager
            auditLogs={auditLogs}
            license={license}
          />
        )}

        {activeTab === 'chat' && (
          <AiAnalystChat
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            onInspectPage={handleInspectEvidence}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-900 bg-slate-950 py-4 text-center text-xs text-gray-500">
        <p>
          FinWise Multimodal Financial Document Intelligence Platform • Privacy-First Financial RAG Architecture
        </p>
      </footer>
    </div>
  );
}

export default App;
