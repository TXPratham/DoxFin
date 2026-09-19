import type {
  ReportDocument,
  PageClassification,
  FinancialRatio,
  Anomaly,
  RagChunk,
  AuditLogItem,
  EnterpriseLicense,
  ChatMessage
} from '../types/finwise';

export const initialDocument: ReportDocument = {
  id: 'doc-apex-fy25',
  name: 'Apex_Global_Tech_FY2025_Annual_Report.pdf',
  totalPages: 486,
  fileSizeMB: 48.2,
  uploadDate: '2026-09-19 10:32:00',
  status: 'ready',
  processingMode: 'balanced',
  deployment: 'enterprise_local',
  classifiedPages: {
    textPages: 215,
    tablePages: 142,
    chartPages: 45,
    skippedPages: 84
  }
};

export const sampleClassifiedPages: PageClassification[] = [
  { pageNumber: 12, category: 'text', tool: 'PyMuPDF', score: 8, keywordsFound: ['Revenue', 'Segment', 'MD&A'], hasCaption: false, hasTableStructure: false },
  { pageNumber: 45, category: 'table', tool: 'Docling', score: 10, keywordsFound: ['Balance Sheet', 'Assets', 'Liabilities'], hasCaption: true, hasTableStructure: true },
  { pageNumber: 88, category: 'chart', tool: 'Vision VLM', score: 9, keywordsFound: ['Operating Margin', 'Trend', 'EBITDA'], hasCaption: true, hasTableStructure: false },
  { pageNumber: 126, category: 'table', tool: 'Docling', score: 12, keywordsFound: ['Profit and Loss', 'Revenue', 'Tax', 'EPS'], hasCaption: true, hasTableStructure: true },
  { pageNumber: 154, category: 'text', tool: 'PyMuPDF', score: 7, keywordsFound: ['Risk Factors', 'Borrowings', 'Interest'], hasCaption: false, hasTableStructure: false },
  { pageNumber: 198, category: 'chart', tool: 'Vision VLM', score: 9, keywordsFound: ['Cash Flow', 'Capex'], hasCaption: true, hasTableStructure: false },
  { pageNumber: 230, category: 'irrelevant', tool: 'Skip', score: -3, keywordsFound: ['Corporate Social Responsibility Photos'], hasCaption: false, hasTableStructure: false },
  { pageNumber: 310, category: 'table', tool: 'Docling', score: 11, keywordsFound: ['Segment Revenue', 'Geographic Breakdown'], hasCaption: true, hasTableStructure: true }
];

export const initialRatios: FinancialRatio[] = [
  {
    key: 'rev_growth',
    name: 'Revenue Growth',
    category: 'Growth',
    val2024: 1000,
    val2025: 1200,
    unit: '%',
    formula: '((Revenue_2025 - Revenue_2024) / Revenue_2024) * 100',
    changePercent: 20.0,
    status: 'normal',
    confidenceScore: 99.2,
    sourceReference: 'Page 126 (Consolidated P&L Statement)'
  },
  {
    key: 'net_margin',
    name: 'Net Profit Margin',
    category: 'Margin',
    val2024: 18.5,
    val2025: 13.5,
    unit: '%',
    formula: '(Net_Profit / Revenue) * 100',
    changePercent: -27.0,
    status: 'anomaly',
    confidenceScore: 98.4,
    sourceReference: 'Page 126 (Consolidated P&L Statement)'
  },
  {
    key: 'operating_margin',
    name: 'Operating Margin',
    category: 'Margin',
    val2024: 24.2,
    val2025: 18.8,
    unit: '%',
    formula: '(Operating_Income / Revenue) * 100',
    changePercent: -22.3,
    status: 'warning',
    confidenceScore: 97.8,
    sourceReference: 'Page 88 (MD&A Section)'
  },
  {
    key: 'roce',
    name: 'Return on Capital Employed (ROCE)',
    category: 'Return',
    val2024: 21.4,
    val2025: 17.2,
    unit: '%',
    formula: '(EBIT / (Total_Assets - Current_Liabilities)) * 100',
    changePercent: -19.6,
    status: 'normal',
    confidenceScore: 96.5,
    sourceReference: 'Page 130 (Notes to Financial Statements)'
  },
  {
    key: 'debt_to_equity',
    name: 'Debt-to-Equity Ratio',
    category: 'Solvency',
    val2024: 0.35,
    val2025: 0.68,
    unit: 'x',
    formula: 'Total_Borrowings / Shareholders_Equity',
    changePercent: 94.3,
    status: 'anomaly',
    confidenceScore: 95.1,
    sourceReference: 'Page 45 (Consolidated Balance Sheet)'
  },
  {
    key: 'current_ratio',
    name: 'Current Ratio',
    category: 'Liquidity',
    val2024: 2.15,
    val2025: 1.42,
    unit: 'x',
    formula: 'Current_Assets / Current_Liabilities',
    changePercent: -33.9,
    status: 'warning',
    confidenceScore: 98.9,
    sourceReference: 'Page 45 (Consolidated Balance Sheet)'
  },
  {
    key: 'free_cash_flow',
    name: 'Free Cash Flow (FCF)',
    category: 'Growth',
    val2024: 340,
    val2025: 180,
    unit: '₹ Cr',
    formula: 'Cash_Flow_from_Operations - Capital_Expenditures',
    changePercent: -47.0,
    status: 'anomaly',
    confidenceScore: 93.8,
    sourceReference: 'Page 198 (Cash Flow Statement)'
  },
  {
    key: 'eps',
    name: 'Diluted Earnings Per Share (EPS)',
    category: 'Per Share',
    val2024: 42.5,
    val2025: 38.1,
    unit: '₹',
    formula: 'Net_Profit_Attributable / Diluted_Shares_Count',
    changePercent: -10.35,
    status: 'normal',
    confidenceScore: 99.5,
    sourceReference: 'Page 126 (Consolidated P&L Statement)'
  }
];

export const sampleAnomalies: Anomaly[] = [
  {
    id: 'anom-01',
    title: 'Revenue Increase vs Profit & Margin Contraction',
    type: 'Margin & Profit Divergence',
    severity: 'high',
    metric1: { name: 'Revenue', change: '+20.0% (₹1,000 Cr → ₹1,200 Cr)' },
    metric2: { name: 'Net Profit', change: '-13.5% (₹185 Cr → ₹162 Cr)' },
    description: 'Revenue grew steadily by 20%, but Net Profit Margin fell from 18.5% to 13.5%. Python calculation confirms profit margins shrank due to a 34% surge in raw material & logistics costs.',
    ragEvidenceSnippet: 'Management Discussion & Analysis (Page 89): "Input costs for rare semiconductor substrates surged by 38% in H2 FY25 due to global supply chain realignments, alongside non-recurring severance costs of ₹24 Cr during restructuring."',
    managementExplanation: 'Management attributes margin erosion to transitory semiconductor raw material supply shocks and a one-time employee severance payment.',
    sourceDocument: 'Apex_Global_Tech_FY2025_Annual_Report.pdf',
    sourcePage: 89,
    sourceSection: 'Management Discussion & Analysis - Cost Factors',
    confidence: 96.4,
    reviewStatus: 'unreviewed'
  },
  {
    id: 'anom-02',
    title: 'Profit Growth vs Operating Cash Flow Deterioration',
    type: 'Cash Flow Divergence',
    severity: 'high',
    metric1: { name: 'Operating Income', change: '+12.0% (₹242 Cr → ₹271 Cr)' },
    metric2: { name: 'Operating Cash Flow', change: '-41.0% (₹380 Cr → ₹224 Cr)' },
    description: 'Accounting profit rose, but cash flow from operations decreased significantly. RAG retrieval indicates accounts receivable expanded from 45 days to 82 days DSO.',
    ragEvidenceSnippet: 'Notes to Accounts - Note 18 (Page 152): "Trade receivables increased from ₹140 Cr to ₹295 Cr due to extended 90-day credit terms granted to major enterprise clients under multi-year contracts."',
    managementExplanation: 'Credit terms were strategically relaxed for top 5 tier-1 telecom partners to secure long-term binding 5-year contracts.',
    sourceDocument: 'Apex_Global_Tech_FY2025_Annual_Report.pdf',
    sourcePage: 152,
    sourceSection: 'Notes on Trade Receivables & Credit Policies',
    confidence: 94.2,
    reviewStatus: 'unreviewed'
  },
  {
    id: 'anom-03',
    title: 'Extraction Conflict: Long-Term Debt Discrepancy',
    type: 'Source Conflict Flag',
    severity: 'medium',
    metric1: { name: 'Table 4.2 Debt', change: '₹820 Cr Total Debt' },
    metric2: { name: 'Chart Caption Debt', change: '₹280 Cr Net Long-Term Debt' },
    description: 'Docling extracted ₹820 Cr total debt from Balance Sheet Note 14, whereas Vision VLM parsed ₹280 Cr from executive summary chart. System detected conflict between gross debt vs net debt label.',
    ragEvidenceSnippet: 'Balance Sheet Note 14 (Page 48): Total gross borrowings = ₹820 Cr (Long-term ₹280 Cr, Short-term commercial paper ₹540 Cr). Executive Chart refers strictly to Net Long-term debt after cash offset.',
    managementExplanation: 'Requires human analyst verification to confirm whether gross debt or net debt should be reported in financial summary.',
    sourceDocument: 'Apex_Global_Tech_FY2025_Annual_Report.pdf',
    sourcePage: 48,
    sourceSection: 'Note 14 - Borrowings & Capital Structure',
    confidence: 72.0,
    reviewStatus: 'unreviewed',
    tableVsTextConflict: {
      tableValue: '₹820 Cr Total Borrowings (Gross)',
      textValue: '₹280 Cr Long-term Debt (Net of Cash)',
      tableSource: 'Page 48, Table 14.1 (Docling Extraction)',
      textSource: 'Page 14, Executive Summary Chart (Vision VLM)'
    }
  }
];

export const sampleRagChunks: RagChunk[] = [
  {
    id: 'chunk-101',
    documentId: 'doc-apex-fy25',
    pageNumber: 126,
    section: 'Consolidated Statement of Profit & Loss',
    textSnippet: 'Revenue from operations for the year ended March 31, 2025 stood at ₹1,200.50 Crores as compared to ₹1,000.00 Crores in the previous fiscal year, registering a growth of 20.05%. Total expenses increased to ₹1,038.50 Crores.',
    similarityScore: 0.94,
    tableReference: 'Table 3.1 - Income Statement Breakdown',
    verifiedStatus: 'verified'
  },
  {
    id: 'chunk-102',
    documentId: 'doc-apex-fy25',
    pageNumber: 89,
    section: 'MD&A - Operating Expense Analysis',
    textSnippet: 'Gross profit margins contracted by 500 basis points primarily owing to inflationary spikes in semiconductor chip procurement and elevated international freight shipping tariffs during Q3 and Q4.',
    similarityScore: 0.89,
    chartReference: 'Chart 5 - Quarterly Margin Progression',
    verifiedStatus: 'verified'
  },
  {
    id: 'chunk-103',
    documentId: 'doc-apex-fy25',
    pageNumber: 48,
    section: 'Note 14 - Borrowings',
    textSnippet: 'Total borrowings as at March 31, 2025 comprise term loans of ₹280.00 Crores from consortium banks and short-term working capital credit facilities of ₹540.00 Crores.',
    similarityScore: 0.86,
    tableReference: 'Table 14.1 - Capital Structure',
    verifiedStatus: 'conflict'
  }
];

export const sampleAuditLogs: AuditLogItem[] = [
  {
    id: 'log-801',
    timestamp: '2026-09-19 10:30:15',
    user: 'analyst.priya@finwise.internal',
    role: 'Senior Financial Analyst',
    action: 'USER_LOGIN',
    details: 'Authenticated via Azure AD Single Sign-On with MFA',
    ipAddress: '10.240.12.88',
    status: 'SUCCESS'
  },
  {
    id: 'log-802',
    timestamp: '2026-09-19 10:32:00',
    user: 'analyst.priya@finwise.internal',
    role: 'Senior Financial Analyst',
    action: 'DOCUMENT_UPLOAD',
    details: 'Uploaded Apex_Global_Tech_FY2025_Annual_Report.pdf (486 pages, 48.2 MB)',
    ipAddress: '10.240.12.88',
    status: 'SUCCESS'
  },
  {
    id: 'log-803',
    timestamp: '2026-09-19 10:35:12',
    user: 'system.pipeline',
    role: 'Automated Worker',
    action: 'PIPELINE_COMPLETE',
    details: 'Page router: PyMuPDF (215 pgs), Docling (142 pgs), Vision VLM (45 pgs), Skipped (84 pgs). 8 ratios calculated.',
    ipAddress: '127.0.0.1',
    status: 'SUCCESS'
  },
  {
    id: 'log-804',
    timestamp: '2026-09-19 11:02:44',
    user: 'analyst.priya@finwise.internal',
    role: 'Senior Financial Analyst',
    action: 'ANOMALY_REVIEW',
    details: 'Inspected Anomaly "Revenue Increase vs Profit Contraction" on Page 89',
    ipAddress: '10.240.12.88',
    status: 'SUCCESS'
  }
];

export const sampleLicense: EnterpriseLicense = {
  customer: 'Apex Capital Holdings Ltd',
  product: 'FinWise Enterprise Local',
  plan: 'enterprise',
  max_users: 100,
  expires: '2027-12-31',
  features: [
    'rag_evidence_engine',
    'deterministic_financial_calc',
    'anomaly_investigator',
    'multimodal_vision_parser',
    'offline_license_verification',
    'human_in_loop_queue'
  ],
  signature: '3f8a91b2c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f',
  isValid: true
};

export const sampleChatMessages: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'user',
    text: 'Why did net profit margin contract in FY2025 despite 20% revenue growth?',
    timestamp: '11:05 AM'
  },
  {
    id: 'msg-2',
    sender: 'finwise_llm',
    text: 'Based on FinWise deterministic calculation and RAG evidence from Page 89 and Page 126 of the annual report:\n\n1. **Calculated Metric**: Revenue grew from ₹1,000 Cr to ₹1,200 Cr (+20.0%), but Net Margin fell from 18.5% to 13.5%.\n2. **Primary Cause**: Operating expenses rose 34%, driven by a 38% price surge in raw semiconductor chip procurement.\n3. **One-Time Impact**: Management recorded a non-recurring severance payment of ₹24 Cr for organizational restructuring.',
    timestamp: '11:05 AM',
    citations: [
      {
        pageNumber: 126,
        section: 'Consolidated Statement of Profit & Loss',
        document: 'Apex_Global_Tech_FY2025_Annual_Report.pdf',
        snippet: 'Revenue from operations reached ₹1,200 Cr while total expenses expanded to ₹1,038.5 Cr.'
      },
      {
        pageNumber: 89,
        section: 'MD&A - Operating Expense Analysis',
        document: 'Apex_Global_Tech_FY2025_Annual_Report.pdf',
        snippet: 'Input costs for semiconductor substrates surged 38% alongside ₹24 Cr restructuring severance.'
      }
    ]
  }
];
