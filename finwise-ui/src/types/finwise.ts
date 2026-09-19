export type ProcessingMode = 'lite' | 'balanced' | 'performance';
export type DeploymentType = 'saas' | 'enterprise_local' | 'private_cloud';
export type PageCategory = 'text' | 'table' | 'chart' | 'irrelevant';
export type ExtractionTool = 'PyMuPDF' | 'Docling' | 'Vision VLM' | 'Skip';

export interface ReportDocument {
  id: string;
  name: string;
  totalPages: number;
  fileSizeMB: number;
  uploadDate: string;
  status: 'uploading' | 'routing' | 'extracting' | 'calculating' | 'indexed' | 'ready';
  processingMode: ProcessingMode;
  deployment: DeploymentType;
  classifiedPages: {
    textPages: number;
    tablePages: number;
    chartPages: number;
    skippedPages: number;
  };
}

export interface PageClassification {
  pageNumber: number;
  category: PageCategory;
  tool: ExtractionTool;
  score: number;
  keywordsFound: string[];
  hasCaption: boolean;
  hasTableStructure: boolean;
}

export interface FinancialRatio {
  key: string;
  name: string;
  category: 'Growth' | 'Margin' | 'Return' | 'Solvency' | 'Liquidity' | 'Per Share';
  val2024: number;
  val2025: number;
  unit: string;
  formula: string;
  changePercent: number;
  status: 'normal' | 'anomaly' | 'warning';
  confidenceScore: number;
  sourceReference: string;
}

export interface Anomaly {
  id: string;
  title: string;
  type: string;
  severity: 'high' | 'medium' | 'low';
  metric1: { name: string; change: string };
  metric2: { name: string; change: string };
  description: string;
  ragEvidenceSnippet: string;
  managementExplanation: string;
  sourceDocument: string;
  sourcePage: number;
  sourceSection: string;
  confidence: number;
  reviewStatus: 'unreviewed' | 'approved' | 'corrected' | 'overridden';
  tableVsTextConflict?: {
    tableValue: string;
    textValue: string;
    tableSource: string;
    textSource: string;
  };
}

export interface RagChunk {
  id: string;
  documentId: string;
  pageNumber: number;
  section: string;
  textSnippet: string;
  similarityScore: number;
  tableReference?: string;
  chartReference?: string;
  verifiedStatus: 'verified' | 'conflict' | 'unverified';
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  details: string;
  ipAddress: string;
  status: 'SUCCESS' | 'WARNING' | 'DENIED';
}

export interface EnterpriseLicense {
  customer: string;
  product: string;
  plan: 'standard' | 'enterprise' | 'custom';
  max_users: number;
  expires: string;
  features: string[];
  signature: string;
  isValid: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'finwise_llm';
  text: string;
  timestamp: string;
  citations?: {
    pageNumber: number;
    section: string;
    document: string;
    snippet: string;
  }[];
}
