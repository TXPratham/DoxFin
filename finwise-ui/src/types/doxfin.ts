export type ProcessingMode = 'lite' | 'balanced' | 'performance';
export type DocumentStatus = 'completed' | 'processing' | 'verification_required' | 'failed';
export type SeverityLevel = 'low' | 'moderate' | 'high';
export type UserRole = 'Administrator' | 'Financial Analyst' | 'Reviewer' | 'Viewer';

export interface DocumentInfo {
  id: string;
  company: string;
  ticker?: string;
  documentName: string;
  documentType: 'Annual Report' | 'Financial Statement' | 'Earnings Report' | 'Quarterly 10-Q';
  financialYear: string;
  pages: number;
  fileSizeMB: number;
  processingMode: ProcessingMode;
  status: DocumentStatus;
  uploadedBy: string;
  date: string;
  confidenceScore: number;
  tablesFound: number;
  chartsFound: number;
  metricsExtracted: number;
}

export interface SystemHardware {
  cpuCores: number;
  cpuModel: string;
  cpuUsagePercent: number;
  ramTotalGB: number;
  ramUsedGB: number;
  gpuModel: string;
  vramTotalGB: number;
  vramUsedGB: number;
  gpuUsagePercent: number;
  diskTotalGB: number;
  diskUsedGB: number;
  rayWorkersActive: number;
  serverIp: string;
  uptime: string;
  status: 'Online' | 'Degraded' | 'Offline';
}

export interface PipelineStage {
  id: string;
  name: string;
  status: 'completed' | 'running' | 'waiting' | 'failed';
  timeTaken?: string;
  description: string;
  toolUsed?: string;
}

export interface FinancialMetricItem {
  id: string;
  key: string;
  name: string;
  category: 'Income Statement' | 'Balance Sheet' | 'Cash Flow' | 'Key Ratios';
  unit: string;
  fy23: number | string;
  fy24: number | string;
  fy25: number | string;
  changeYoY: string;
  cagr3Y?: string;
  isNegativeChange?: boolean;
  sourcePage: number;
  sourceSection: string;
  extractedBy: 'Docling' | 'PyMuPDF' | 'Vision VLM';
  validationStatus: 'Verified' | 'Verification Required' | 'Unverified';
  tableCoordinates?: { x: number; y: number; width: number; height: number };
}

export interface FinancialSignal {
  id: string;
  title: string;
  signalType: 'Cash Flow Signal' | 'Margin Signal' | 'Debt Signal' | 'Working Capital Signal' | 'Revenue & Profit Divergence';
  severity: SeverityLevel;
  primarySummary: string;
  secondarySummary: string;
  metricsInvolved: { name: string; change: string; isAnomaly?: boolean }[];
  period: string;
  evidenceCount: number;
  validationStatus: 'Verified' | 'Requires Review';
  detailedQuestion: string;
  financialPattern: {
    label: string;
    metric: string;
    direction: 'up' | 'down' | 'flat';
    percent: string;
    badgeColor: string;
  }[];
  aiExplanation: string;
  evidenceCards: {
    pageNumber: number;
    section: string;
    title: string;
    snippet: string;
    tool: string;
    validation: string;
  }[];
}

export interface AskDoxFinQA {
  id: string;
  question: string;
  category: string;
  answerSummary: string;
  detailedAnalysis: string[];
  calculations?: {
    label: string;
    items: { title: string; value: string; operation?: '+' | '-' | '=' }[];
    result: { title: string; value: string };
  };
  evidenceCitations: {
    pageNumber: number;
    section: string;
    document: string;
    snippet: string;
    tool: string;
  }[];
  confidence: string;
}

export interface ComparisonMetric {
  metric: string;
  category: string;
  fy24: string;
  fy25: string;
  change: string;
  direction: 'up' | 'down' | 'neutral';
  impact: 'positive' | 'negative' | 'neutral';
  analysisNote: string;
}

export interface LocalUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  documentsCount: number;
  lastActive: string;
  status: 'Active' | 'Invited' | 'Suspended';
  permissions: {
    owner: boolean;
    analyze: boolean;
    read: boolean;
    export: boolean;
    delete: boolean;
  };
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: 'UPLOAD_DOCUMENT' | 'VIEW_ANALYSIS' | 'VERIFY_METRIC' | 'EXPORT_REPORT' | 'RUN_QUERY' | 'CHANGE_SYSTEM_MODE' | 'DELETE_DOCUMENT' | 'USER_LOGIN';
  actionLabel: string;
  document: string;
  ipAddress: string;
  status: 'SUCCESS' | 'WARNING' | 'DENIED';
  details: string;
}
