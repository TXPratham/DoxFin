import type {
  DocumentInfo,
  SystemHardware,
  PipelineStage,
  FinancialMetricItem,
  FinancialSignal,
  AskDoxFinQA,
  ComparisonMetric,
  LocalUser,
  AuditLog
} from '../types/doxfin';

export const initialHardware: SystemHardware = {
  cpuCores: 8,
  cpuModel: 'AMD Ryzen 7 5800H @ 3.20GHz (8 Cores, 16 Threads)',
  cpuUsagePercent: 62,
  ramTotalGB: 16,
  ramUsedGB: 11.4,
  gpuModel: 'NVIDIA GeForce RTX 3050 (Laptop)',
  vramTotalGB: 4.0,
  vramUsedGB: 3.2,
  gpuUsagePercent: 71,
  diskTotalGB: 1000,
  diskUsedGB: 412,
  rayWorkersActive: 4,
  serverIp: '192.168.1.140:8000',
  uptime: '18 days, 4 hours, 12 mins',
  status: 'Online'
};

export const sampleDocuments: DocumentInfo[] = [
  {
    id: 'doc-abc-2025',
    company: 'ABC Industries Ltd.',
    ticker: 'ABCIND',
    documentName: 'ABC_Industries_Annual_Report_2025.pdf',
    documentType: 'Annual Report',
    financialYear: 'FY 2024-25',
    pages: 428,
    fileSizeMB: 46.8,
    processingMode: 'balanced',
    status: 'completed',
    uploadedBy: 'Pratham (Lead Analyst)',
    date: '18 Sep 2026',
    confidenceScore: 99.4,
    tablesFound: 83,
    chartsFound: 27,
    metricsExtracted: 146
  },
  {
    id: 'doc-tata-2025',
    company: 'Tata Motors Limited',
    ticker: 'TATAMTR',
    documentName: 'Tata_Motors_Annual_Report_FY25.pdf',
    documentType: 'Annual Report',
    financialYear: 'FY 2024-25',
    pages: 384,
    fileSizeMB: 39.2,
    processingMode: 'performance',
    status: 'completed',
    uploadedBy: 'Siddharth V.',
    date: '16 Sep 2026',
    confidenceScore: 98.7,
    tablesFound: 72,
    chartsFound: 31,
    metricsExtracted: 132
  },
  {
    id: 'doc-hdfc-q1',
    company: 'HDFC Bank Limited',
    ticker: 'HDFCBANK',
    documentName: 'HDFC_Bank_Earnings_Report_Q1_FY26.pdf',
    documentType: 'Earnings Report',
    financialYear: 'Q1 FY 2025-26',
    pages: 94,
    fileSizeMB: 12.4,
    processingMode: 'balanced',
    status: 'processing',
    uploadedBy: 'Ananya Sharma',
    date: '19 Sep 2026',
    confidenceScore: 94.1,
    tablesFound: 41,
    chartsFound: 14,
    metricsExtracted: 68
  },
  {
    id: 'doc-rel-2025',
    company: 'Reliance Industries Ltd.',
    ticker: 'RELIANCE',
    documentName: 'RIL_Integrated_Annual_Report_2024_25.pdf',
    documentType: 'Annual Report',
    financialYear: 'FY 2024-25',
    pages: 512,
    fileSizeMB: 58.4,
    processingMode: 'performance',
    status: 'verification_required',
    uploadedBy: 'Pratham (Lead Analyst)',
    date: '14 Sep 2026',
    confidenceScore: 89.2,
    tablesFound: 114,
    chartsFound: 48,
    metricsExtracted: 210
  },
  {
    id: 'doc-infy-2025',
    company: 'Infosys Limited',
    ticker: 'INFY',
    documentName: 'Infosys_Audited_Financial_Statements_FY25.pdf',
    documentType: 'Financial Statement',
    financialYear: 'FY 2024-25',
    pages: 182,
    fileSizeMB: 21.6,
    processingMode: 'lite',
    status: 'completed',
    uploadedBy: 'Rajesh Kumar',
    date: '10 Sep 2026',
    confidenceScore: 99.8,
    tablesFound: 56,
    chartsFound: 18,
    metricsExtracted: 118
  },
  {
    id: 'doc-bharti-2025',
    company: 'Bharti Airtel Limited',
    ticker: 'AIRTEL',
    documentName: 'Bharti_Airtel_Annual_Report_2025_Corrupted.pdf',
    documentType: 'Annual Report',
    financialYear: 'FY 2024-25',
    pages: 310,
    fileSizeMB: 33.1,
    processingMode: 'balanced',
    status: 'failed',
    uploadedBy: 'Kavita Menon',
    date: '08 Sep 2026',
    confidenceScore: 0,
    tablesFound: 0,
    chartsFound: 0,
    metricsExtracted: 0
  }
];

export const pipelineStages: PipelineStage[] = [
  { id: '1', name: 'Document Validation', status: 'completed', timeTaken: '1.2s', description: 'PDF structure verified, encryption checked, OCR raster layer confirmed.', toolUsed: 'PyMuPDF Native Parser' },
  { id: '2', name: 'Page Classification', status: 'completed', timeTaken: '3.4s', description: 'Classified 428 pages: 210 Text, 142 Financial Tables, 48 Charts, 28 Front matter.', toolUsed: 'LayoutLMv3 Fast Classifier' },
  { id: '3', name: 'Text Extraction', status: 'completed', timeTaken: '8.1s', description: 'Parsed raw text streams, notes to accounts, and MD&A sections with boundary tokens.', toolUsed: 'Docling Text Core Engine' },
  { id: '4', name: 'Table Extraction', status: 'completed', timeTaken: '14.5s', description: '83 financial tables converted to structured row/column schemas with header hierarchy.', toolUsed: 'Docling Table Structure Model' },
  { id: '5', name: 'Chart Analysis', status: 'running', timeTaken: 'In progress (71%)', description: 'Extracting data series and trend values from 27 executive financial charts.', toolUsed: 'Qwen3-VL Vision Model (Local)' },
  { id: '6', name: 'Data Validation', status: 'waiting', description: 'Deterministic cross-check between balance sheet notes and cash flow statements.', toolUsed: 'Python Verification Rule Engine' },
  { id: '7', name: 'Financial Calculations', status: 'waiting', description: 'Calculating 42 standard financial ratios, YoY variations, and CAGR projections.', toolUsed: 'Deterministic Financial Math Engine' },
  { id: '8', name: 'Anomaly Detection', status: 'waiting', description: 'Scanning for divergence signals (cash vs profit, debt spikes, DSO elongation).', toolUsed: 'Local Anomaly Heuristic Pipeline' },
  { id: '9', name: 'Embedding & Indexing', status: 'waiting', description: 'Generating dense vector embeddings for localized semantic search across 428 pages.', toolUsed: 'BAAI/bge-m3 + FAISS Vector Store' },
  { id: '10', name: 'Analysis Ready', status: 'waiting', description: 'Synthesizing final executive briefing workspace and verified citation index.', toolUsed: 'DoxFin Local Synthesis Engine' }
];

export const financialMetrics: FinancialMetricItem[] = [
  // Income Statement
  {
    id: 'm-rev',
    key: 'revenue',
    name: 'Revenue from Operations',
    category: 'Income Statement',
    unit: '₹ Cr',
    fy23: 12800,
    fy24: 14600,
    fy25: 16420,
    changeYoY: '+12.4%',
    cagr3Y: '+13.2%',
    isNegativeChange: false,
    sourcePage: 146,
    sourceSection: 'Consolidated Statement of Profit and Loss',
    extractedBy: 'Docling',
    validationStatus: 'Verified',
    tableCoordinates: { x: 42, y: 180, width: 512, height: 28 }
  },
  {
    id: 'm-cogs',
    key: 'cogs',
    name: 'Cost of Materials Consumed',
    category: 'Income Statement',
    unit: '₹ Cr',
    fy23: 6840,
    fy24: 7850,
    fy25: 9120,
    changeYoY: '+16.2%',
    cagr3Y: '+15.4%',
    isNegativeChange: true,
    sourcePage: 146,
    sourceSection: 'Consolidated Statement of Profit and Loss',
    extractedBy: 'Docling',
    validationStatus: 'Verified'
  },
  {
    id: 'm-ebitda',
    key: 'ebitda',
    name: 'Operating Profit (EBITDA)',
    category: 'Income Statement',
    unit: '₹ Cr',
    fy23: 2573,
    fy24: 2862,
    fy25: 3021,
    changeYoY: '+5.6%',
    cagr3Y: '+8.3%',
    isNegativeChange: false,
    sourcePage: 146,
    sourceSection: 'Consolidated Statement of Profit and Loss',
    extractedBy: 'Docling',
    validationStatus: 'Verified'
  },
  {
    id: 'm-op-margin',
    key: 'op_margin',
    name: 'Operating Margin',
    category: 'Income Statement',
    unit: '%',
    fy23: '20.1%',
    fy24: '19.6%',
    fy25: '18.4%',
    changeYoY: '-1.2%',
    cagr3Y: '-0.8%',
    isNegativeChange: true,
    sourcePage: 146,
    sourceSection: 'Consolidated Statement of Profit and Loss',
    extractedBy: 'Docling',
    validationStatus: 'Verified'
  },
  {
    id: 'm-pat',
    key: 'net_profit',
    name: 'Net Profit (PAT)',
    category: 'Income Statement',
    unit: '₹ Cr',
    fy23: 1620,
    fy24: 2005,
    fy25: 2180,
    changeYoY: '+8.7%',
    cagr3Y: '+15.9%',
    isNegativeChange: false,
    sourcePage: 146,
    sourceSection: 'Consolidated Statement of Profit and Loss',
    extractedBy: 'Docling',
    validationStatus: 'Verified',
    tableCoordinates: { x: 42, y: 390, width: 512, height: 28 }
  },
  {
    id: 'm-eps',
    key: 'eps',
    name: 'Diluted Earnings Per Share',
    category: 'Income Statement',
    unit: '₹',
    fy23: 42.10,
    fy24: 51.80,
    fy25: 56.40,
    changeYoY: '+8.9%',
    cagr3Y: '+15.7%',
    isNegativeChange: false,
    sourcePage: 147,
    sourceSection: 'Note 28 - Earnings Per Share Calculation',
    extractedBy: 'Docling',
    validationStatus: 'Verified'
  },

  // Balance Sheet
  {
    id: 'm-networth',
    key: 'networth',
    name: 'Total Shareholders Equity',
    category: 'Balance Sheet',
    unit: '₹ Cr',
    fy23: 9400,
    fy24: 10850,
    fy25: 12240,
    changeYoY: '+12.8%',
    cagr3Y: '+14.1%',
    isNegativeChange: false,
    sourcePage: 148,
    sourceSection: 'Consolidated Balance Sheet - Equity',
    extractedBy: 'Docling',
    validationStatus: 'Verified'
  },
  {
    id: 'm-debt',
    key: 'total_debt',
    name: 'Total Borrowings (Debt)',
    category: 'Balance Sheet',
    unit: '₹ Cr',
    fy23: 3920,
    fy24: 3930,
    fy25: 5140,
    changeYoY: '+30.8%',
    cagr3Y: '+14.5%',
    isNegativeChange: true,
    sourcePage: 148,
    sourceSection: 'Consolidated Balance Sheet - Non-Current Liabilities',
    extractedBy: 'Docling',
    validationStatus: 'Verified'
  },
  {
    id: 'm-receivables',
    key: 'receivables',
    name: 'Trade Receivables (Debtors)',
    category: 'Balance Sheet',
    unit: '₹ Cr',
    fy23: 1680,
    fy24: 1950,
    fy25: 2398,
    changeYoY: '+23.0%',
    cagr3Y: '+19.5%',
    isNegativeChange: true,
    sourcePage: 149,
    sourceSection: 'Note 18 - Trade Receivables Ageing Schedule',
    extractedBy: 'Docling',
    validationStatus: 'Verified'
  },
  {
    id: 'm-inventory',
    key: 'inventory',
    name: 'Inventories',
    category: 'Balance Sheet',
    unit: '₹ Cr',
    fy23: 1840,
    fy24: 2110,
    fy25: 2460,
    changeYoY: '+16.6%',
    cagr3Y: '+15.6%',
    isNegativeChange: false,
    sourcePage: 148,
    sourceSection: 'Note 15 - Inventories Valuation',
    extractedBy: 'Docling',
    validationStatus: 'Verified'
  },
  {
    id: 'm-cash-bal',
    key: 'cash_bank',
    name: 'Cash & Cash Equivalents',
    category: 'Balance Sheet',
    unit: '₹ Cr',
    fy23: 1120,
    fy24: 1480,
    fy25: 1190,
    changeYoY: '-19.6%',
    cagr3Y: '+3.1%',
    isNegativeChange: true,
    sourcePage: 148,
    sourceSection: 'Consolidated Balance Sheet - Current Assets',
    extractedBy: 'Docling',
    validationStatus: 'Verified'
  },

  // Cash Flow
  {
    id: 'm-cfo',
    key: 'cfo',
    name: 'Operating Cash Flow (CFO)',
    category: 'Cash Flow',
    unit: '₹ Cr',
    fy23: 2210,
    fy24: 2540,
    fy25: 2180,
    changeYoY: '-14.2%',
    cagr3Y: '-0.7%',
    isNegativeChange: true,
    sourcePage: 151,
    sourceSection: 'Consolidated Statement of Cash Flows',
    extractedBy: 'Docling',
    validationStatus: 'Verified',
    tableCoordinates: { x: 42, y: 220, width: 512, height: 32 }
  },
  {
    id: 'm-capex',
    key: 'capex',
    name: 'Capital Expenditure (CapEx)',
    category: 'Cash Flow',
    unit: '₹ Cr',
    fy23: 680,
    fy24: 954,
    fy25: 860,
    changeYoY: '-9.9%',
    cagr3Y: '+12.4%',
    isNegativeChange: false,
    sourcePage: 151,
    sourceSection: 'Cash Flows from Investing Activities',
    extractedBy: 'Docling',
    validationStatus: 'Verified'
  },
  {
    id: 'm-fcf',
    key: 'fcf',
    name: 'Free Cash Flow (FCF)',
    category: 'Cash Flow',
    unit: '₹ Cr',
    fy23: 1530,
    fy24: 1586,
    fy25: 1320,
    changeYoY: '-16.8%',
    cagr3Y: '-7.1%',
    isNegativeChange: true,
    sourcePage: 151,
    sourceSection: 'Consolidated Statement of Cash Flows',
    extractedBy: 'Docling',
    validationStatus: 'Verified'
  },

  // Key Ratios
  {
    id: 'm-de-ratio',
    key: 'de_ratio',
    name: 'Debt to Equity Ratio',
    category: 'Key Ratios',
    unit: 'x',
    fy23: '0.41',
    fy24: '0.36',
    fy25: '0.42',
    changeYoY: '+0.06',
    cagr3Y: '+0.01',
    isNegativeChange: false,
    sourcePage: 153,
    sourceSection: 'Financial Highlights & Key Performance Ratios',
    extractedBy: 'Docling',
    validationStatus: 'Verified'
  },
  {
    id: 'm-roe',
    key: 'roe',
    name: 'Return on Equity (ROE)',
    category: 'Key Ratios',
    unit: '%',
    fy23: '17.2%',
    fy24: '18.5%',
    fy25: '17.8%',
    changeYoY: '-0.7%',
    cagr3Y: '+0.3%',
    isNegativeChange: false,
    sourcePage: 153,
    sourceSection: 'Financial Highlights & Key Performance Ratios',
    extractedBy: 'Docling',
    validationStatus: 'Verified'
  },
  {
    id: 'm-roce',
    key: 'roce',
    name: 'Return on Capital Employed (ROCE)',
    category: 'Key Ratios',
    unit: '%',
    fy23: '20.4%',
    fy24: '21.8%',
    fy25: '19.9%',
    changeYoY: '-1.9%',
    cagr3Y: '-0.2%',
    isNegativeChange: true,
    sourcePage: 153,
    sourceSection: 'Financial Highlights & Key Performance Ratios',
    extractedBy: 'Docling',
    validationStatus: 'Verified'
  },
  {
    id: 'm-cur-ratio',
    key: 'current_ratio',
    name: 'Current Ratio',
    category: 'Key Ratios',
    unit: 'x',
    fy23: '1.82',
    fy24: '1.94',
    fy25: '1.76',
    changeYoY: '-0.18',
    cagr3Y: '-0.03',
    isNegativeChange: false,
    sourcePage: 153,
    sourceSection: 'Key Accounting Ratios',
    extractedBy: 'Docling',
    validationStatus: 'Verified'
  }
];

export const sampleSignals: FinancialSignal[] = [
  {
    id: 'sig-cfo-divergence',
    title: 'Operating Cash Flow Divergence',
    signalType: 'Cash Flow Signal',
    severity: 'high',
    primarySummary: 'Profit increased 8.7% while operating cash flow decreased 14.2%.',
    secondarySummary: 'Divergence driven by a 23% expansion in Trade Receivables (DSO grew from 49 to 53 days).',
    metricsInvolved: [
      { name: 'Net Profit (PAT)', change: '+8.7% (₹2,005 Cr → ₹2,180 Cr)' },
      { name: 'Operating Cash Flow (CFO)', change: '-14.2% (₹2,540 Cr → ₹2,180 Cr)', isAnomaly: true },
      { name: 'Trade Receivables', change: '+23.0% (₹1,950 Cr → ₹2,398 Cr)', isAnomaly: true }
    ],
    period: 'FY 2024-25 vs FY 2023-24',
    evidenceCount: 4,
    validationStatus: 'Verified',
    detailedQuestion: 'Why did operating cash flow decline?',
    financialPattern: [
      { label: 'Net Profit', metric: '₹2,180 Cr', direction: 'up', percent: '+8.7%', badgeColor: 'emerald' },
      { label: 'Cash Flow', metric: '₹2,180 Cr', direction: 'down', percent: '-14.2%', badgeColor: 'amber' },
      { label: 'Receivables', metric: '₹2,398 Cr', direction: 'up', percent: '+23.0%', badgeColor: 'rose' }
    ],
    aiExplanation: 'DoxFin found that the decline in operating cash flow coincided with a significant increase in trade receivables from ₹1,950 Cr to ₹2,398 Cr (+23.0%). In the Management Discussion & Analysis (Page 87), the CFO noted that the company extended credit terms to 90 days for tier-1 infrastructure clients to secure multi-year long-term commitments. This delayed cash conversion without impacting recognized accounting revenue.',
    evidenceCards: [
      {
        pageNumber: 87,
        section: 'Management Discussion & Analysis',
        title: 'Working Capital & Client Credit Policy',
        snippet: 'To expand market share in public enterprise infrastructure contracts, the company strategically introduced milestone-based 90-day settlement windows for top 10 clients.',
        tool: 'PyMuPDF Text Core',
        validation: 'Verified from MD&A'
      },
      {
        pageNumber: 146,
        section: 'Income Statement',
        title: 'Consolidated Statement of Profit and Loss',
        snippet: 'Profit for the year attributable to owners of the parent grew to ₹2,180.20 Crores from ₹2,005.10 Crores in the preceding fiscal.',
        tool: 'Docling Table Parser',
        validation: 'Verified Table Data'
      },
      {
        pageNumber: 151,
        section: 'Cash Flow Statement',
        title: 'Net Cash from Operating Activities',
        snippet: 'Operating cash flow before working capital changes was ₹3,021 Cr, adjusted by (₹841 Cr) working capital outflow, resulting in net CFO of ₹2,180 Cr.',
        tool: 'Docling Table Parser',
        validation: 'Verified Table Data'
      },
      {
        pageNumber: 178,
        section: 'Trade Receivables Note',
        title: 'Note 18 - Trade Receivables Ageing Breakdown',
        snippet: 'Undisputed trade receivables considered good with credit terms over 60 days increased from ₹410 Cr in FY24 to ₹920 Cr in FY25.',
        tool: 'Docling Table Parser',
        validation: 'Verified Note Schedule'
      }
    ]
  },
  {
    id: 'sig-margin-erosion',
    title: 'Operating Margin Compression',
    signalType: 'Margin Signal',
    severity: 'moderate',
    primarySummary: 'Revenue increased 12.4% while operating margin decreased from 19.6% to 18.4%.',
    secondarySummary: 'Raw material procurement costs surged 16.2%, outstripping top-line revenue expansion.',
    metricsInvolved: [
      { name: 'Revenue', change: '+12.4% (₹14,600 Cr → ₹16,420 Cr)' },
      { name: 'Operating Margin', change: '-1.2% (19.6% → 18.4%)', isAnomaly: true },
      { name: 'Cost of Materials', change: '+16.2% (₹7,850 Cr → ₹9,120 Cr)', isAnomaly: true }
    ],
    period: 'FY 2024-25 vs FY 2023-24',
    evidenceCount: 3,
    validationStatus: 'Verified',
    detailedQuestion: 'Why did operating margins compress despite 12.4% revenue growth?',
    financialPattern: [
      { label: 'Revenue Growth', metric: '₹16,420 Cr', direction: 'up', percent: '+12.4%', badgeColor: 'emerald' },
      { label: 'Operating Margin', metric: '18.4%', direction: 'down', percent: '-1.2%', badgeColor: 'amber' },
      { label: 'Raw Material Costs', metric: '₹9,120 Cr', direction: 'up', percent: '+16.2%', badgeColor: 'rose' }
    ],
    aiExplanation: 'The 120 bps margin compression from 19.6% to 18.4% is directly attributable to elevated raw input prices. Cost of materials consumed rose 16.2% (from ₹7,850 Cr to ₹9,120 Cr), outpacing the 12.4% revenue increase. As cited in Note 24 (Page 164), specialized alloy procurement costs increased due to global supply disruptions, which could only be partially passed on to end customers with a one-quarter lag.',
    evidenceCards: [
      {
        pageNumber: 146,
        section: 'Income Statement',
        title: 'Consolidated Statement of Profit and Loss',
        snippet: 'Cost of materials consumed stood at ₹9,120.40 Cr compared to ₹7,850.10 Cr in FY 2023-24.',
        tool: 'Docling Table Parser',
        validation: 'Verified P&L Line'
      },
      {
        pageNumber: 92,
        section: 'Management Discussion & Analysis',
        title: 'Input Price Sensitivity & Commodity Inflation',
        snippet: 'Global commodity volatility led to a 14% increase in synthetic polymer and alloy indices across Q2 and Q3.',
        tool: 'PyMuPDF Text Core',
        validation: 'Verified MD&A'
      },
      {
        pageNumber: 164,
        section: 'Note 24 - Raw Materials & Inventory',
        title: 'Breakdown of Consumed Raw Stocks',
        snippet: 'Indigenous raw materials consumed = ₹6,240 Cr; Imported raw materials = ₹2,880 Cr (currency translation impact ₹120 Cr).',
        tool: 'Docling Table Parser',
        validation: 'Verified Note Schedule'
      }
    ]
  },
  {
    id: 'sig-debt-increase',
    title: 'Total Debt Expansion for Green Capex',
    signalType: 'Debt Signal',
    severity: 'low',
    primarySummary: 'Total debt increased 30.8% from ₹3,930 Cr to ₹5,140 Cr.',
    secondarySummary: 'Debt-to-equity ratio rose modestly from 0.36 to 0.42, well below the covenant threshold of 1.20.',
    metricsInvolved: [
      { name: 'Total Borrowings', change: '+30.8% (₹3,930 Cr → ₹5,140 Cr)', isAnomaly: true },
      { name: 'Debt / Equity', change: '+0.06x (0.36 → 0.42)' },
      { name: 'Interest Coverage', change: '8.4x (Healthy)' }
    ],
    period: 'FY 2024-25',
    evidenceCount: 3,
    validationStatus: 'Verified',
    detailedQuestion: 'What caused total debt to increase by 30.8% in FY25?',
    financialPattern: [
      { label: 'Total Borrowings', metric: '₹5,140 Cr', direction: 'up', percent: '+30.8%', badgeColor: 'amber' },
      { label: 'Debt / Equity', metric: '0.42x', direction: 'up', percent: '+0.06x', badgeColor: 'emerald' },
      { label: 'Interest Coverage', metric: '8.4x', direction: 'flat', percent: 'Safe', badgeColor: 'emerald' }
    ],
    aiExplanation: 'The increase in total debt from ₹3,930 Cr to ₹5,140 Cr (+₹1,210 Cr) was deployed towards funding the Phase-2 Green Hydrogen and Renewable Energy Manufacturing facility in Gujarat. As disclosed in Note 14 (Page 158), ₹950 Cr consists of 10-year concessional green loans at 6.85% fixed coupon, with comfortable interest coverage of 8.4x.',
    evidenceCards: [
      {
        pageNumber: 148,
        section: 'Balance Sheet',
        title: 'Non-Current Liabilities - Long-Term Borrowings',
        snippet: 'Non-current borrowings stood at ₹4,180 Cr and short-term working capital borrowings at ₹960 Cr (Total: ₹5,140 Cr).',
        tool: 'Docling Table Parser',
        validation: 'Verified Balance Sheet'
      },
      {
        pageNumber: 158,
        section: 'Note 14 - Borrowings & Loan Terms',
        title: 'Schedule of Term Loans & Sovereign Green Facility',
        snippet: 'Secured term loans from commercial consortium: ₹3,230 Cr; Green Climate Facility loan: ₹950 Cr at subsidized 6.85% p.a.',
        tool: 'Docling Table Parser',
        validation: 'Verified Loan Schedule'
      },
      {
        pageNumber: 82,
        section: 'Director\'s Report',
        title: 'Strategic Capital Projects & Plant Commissioning',
        snippet: 'Phase-2 Clean Energy plant civil construction completed; commercial operations slated for Q3 FY26 with expected IRR of 22%.',
        tool: 'PyMuPDF Text Core',
        validation: 'Verified Director Report'
      }
    ]
  }
];

export const askDoxFinPresetQA: AskDoxFinQA[] = [
  {
    id: 'qa-fcf-decline',
    question: 'Why did free cash flow decline?',
    category: 'Cash Flow Analysis',
    answerSummary: 'Free cash flow declined approximately 16.8% (from ₹1,586 Cr to ₹1,320 Cr), primarily due to higher working capital tie-ups in trade receivables and ongoing capital expenditure.',
    detailedAnalysis: [
      'Operating cash flow contracted from ₹2,540 Cr in FY24 to ₹2,180 Cr in FY25 (-14.2%) as trade receivables increased by ₹448 Cr.',
      'Capital expenditure (CapEx) stood at ₹860 Cr in FY25 as the company completed commissioning of its new high-efficiency turbine unit.',
      'Resulting calculated Free Cash Flow (FCF = CFO - CapEx) came in at ₹1,320 Cr compared to ₹1,586 Cr in FY24, representing a -16.8% contraction.'
    ],
    calculations: {
      label: 'Free Cash Flow Calculation Breakdown (FY 2024-25)',
      items: [
        { title: 'Operating Cash Flow (CFO)', value: '₹2,180 Cr', operation: '+' },
        { title: 'Capital Expenditure (CapEx)', value: '₹860 Cr', operation: '-' }
      ],
      result: { title: 'Free Cash Flow (FCF)', value: '₹1,320 Cr' }
    },
    evidenceCitations: [
      {
        pageNumber: 151,
        section: 'Consolidated Statement of Cash Flows',
        document: 'ABC_Industries_Annual_Report_2025.pdf',
        snippet: 'Net cash generated from operating activities: ₹2,180.20 Crores (FY24: ₹2,540.10 Crores).',
        tool: 'Docling'
      },
      {
        pageNumber: 178,
        section: 'Note 31 - Capital Expenditure Commitments',
        document: 'ABC_Industries_Annual_Report_2025.pdf',
        snippet: 'Additions to Property, Plant and Equipment (CapEx payments during the fiscal): ₹860.00 Crores.',
        tool: 'Docling'
      },
      {
        pageNumber: 82,
        section: 'Management Discussion & Analysis',
        document: 'ABC_Industries_Annual_Report_2025.pdf',
        snippet: 'Capital allocation strategy remains disciplined with internal accruals funding 72% of strategic capital projects.',
        tool: 'PyMuPDF'
      }
    ],
    confidence: 'Verified from 3 independent table & text sources'
  },
  {
    id: 'qa-profit-margins',
    question: 'Why did profit margins decline?',
    category: 'Profitability Analysis',
    answerSummary: 'Operating margin compressed from 19.6% to 18.4% (-120 bps) because raw material inflation (+16.2%) exceeded revenue growth (+12.4%), alongside transitional freight costs.',
    detailedAnalysis: [
      'Cost of materials consumed expanded from ₹7,850 Cr in FY24 to ₹9,120 Cr in FY25 (+16.2% YoY).',
      'Employee benefit expenses also rose 11.8% to ₹1,420 Cr due to talent acquisition in the automation division.',
      'Pricing adjustments on long-term enterprise supply agreements take effect on a 90-day lag, buffering margins for upcoming quarters.'
    ],
    calculations: {
      label: 'Operating Margin Equation Breakdown',
      items: [
        { title: 'Revenue from Operations', value: '₹16,420 Cr', operation: '+' },
        { title: 'Total Operating Expenses', value: '₹13,399 Cr', operation: '-' },
        { title: 'Operating Profit (EBITDA)', value: '₹3,021 Cr', operation: '=' }
      ],
      result: { title: 'Operating Margin (3,021 / 16,420)', value: '18.40%' }
    },
    evidenceCitations: [
      {
        pageNumber: 146,
        section: 'Consolidated Statement of Profit and Loss',
        document: 'ABC_Industries_Annual_Report_2025.pdf',
        snippet: 'Revenue ₹16,420 Cr; Cost of Materials ₹9,120 Cr; Total Expenses ₹13,399 Cr.',
        tool: 'Docling'
      },
      {
        pageNumber: 89,
        section: 'MD&A - Operating Margins & Cost Structure',
        document: 'ABC_Industries_Annual_Report_2025.pdf',
        snippet: 'Gross margins contracted by 140 bps due to global supply chain adjustments in critical mineral inputs.',
        tool: 'PyMuPDF'
      }
    ],
    confidence: 'Verified from multiple audited statements'
  },
  {
    id: 'qa-debt-3y',
    question: 'How has debt changed over the last 3 years?',
    category: 'Solvency & Leverage',
    answerSummary: 'Total borrowings increased from ₹3,920 Cr in FY23 to ₹5,140 Cr in FY25 (+31.1% over 3 years), keeping Debt/Equity stable at 0.42x due to simultaneous equity accumulation.',
    detailedAnalysis: [
      'FY23 Total Borrowings: ₹3,920 Cr (Debt/Equity: 0.41x)',
      'FY24 Total Borrowings: ₹3,930 Cr (Debt/Equity: 0.36x)',
      'FY25 Total Borrowings: ₹5,140 Cr (Debt/Equity: 0.42x)',
      'The net addition of ₹1,210 Cr in FY25 is predominantly long-term project debt secured for the green manufacturing facility.'
    ],
    calculations: {
      label: 'Debt / Equity Ratio (FY25)',
      items: [
        { title: 'Total Borrowings (Long + Short Term)', value: '₹5,140 Cr', operation: '+' },
        { title: 'Total Shareholders Equity (Net Worth)', value: '₹12,240 Cr', operation: '-' }
      ],
      result: { title: 'Debt-to-Equity Ratio', value: '0.42x' }
    },
    evidenceCitations: [
      {
        pageNumber: 148,
        section: 'Consolidated Balance Sheet',
        document: 'ABC_Industries_Annual_Report_2025.pdf',
        snippet: 'Long term borrowings: ₹4,180 Cr, Short term borrowings: ₹960 Cr.',
        tool: 'Docling'
      },
      {
        pageNumber: 158,
        section: 'Note 14 - Borrowings',
        document: 'ABC_Industries_Annual_Report_2025.pdf',
        snippet: 'Interest coverage ratio stands strong at 8.4x as of March 31, 2025.',
        tool: 'Docling'
      }
    ],
    confidence: 'Verified across 3-year historical tables'
  },
  {
    id: 'qa-management-concerns',
    question: "Summarize management's major financial concerns.",
    category: 'Qualitative MD&A Risk',
    answerSummary: "Management's principal disclosures in MD&A highlight raw material volatility, foreign currency translation headwinds on imported components, and extended customer credit cycles.",
    detailedAnalysis: [
      '1. Raw Material Price Volatility: Unpredictable commodity cycles affecting margins before renegotiations take effect.',
      '2. Currency Exposure: EUR and USD fluctuations affecting unhedged procurement portions amounting to ₹640 Cr.',
      '3. Working Capital Extension: Rising DSO from 49 to 53 days in enterprise segment.'
    ],
    evidenceCitations: [
      {
        pageNumber: 84,
        section: 'MD&A - Risk Management Framework',
        document: 'ABC_Industries_Annual_Report_2025.pdf',
        snippet: 'The company actively hedges 75% of forecasted forex exposures using forward exchange contracts.',
        tool: 'PyMuPDF'
      },
      {
        pageNumber: 87,
        section: 'MD&A - Liquidity & Cash Flow Management',
        document: 'ABC_Industries_Annual_Report_2025.pdf',
        snippet: 'Credit evaluation committee conducts quarterly reviews of all accounts with receivables over 90 days.',
        tool: 'PyMuPDF'
      }
    ],
    confidence: 'Verified from MD&A Risk Disclosures'
  },
  {
    id: 'qa-rev-vs-ebitda',
    question: 'Compare revenue growth with operating profit growth.',
    category: 'Performance Comparison',
    answerSummary: 'Revenue grew +12.4% (₹14,600 Cr → ₹16,420 Cr), while EBITDA grew at a slower pace of +5.6% (₹2,862 Cr → ₹3,021 Cr), illustrating operating leverage friction.',
    detailedAnalysis: [
      'Topline growth (+12.4%) was driven by strong volume demand (+9.1%) and modest realization gains (+3.3%).',
      'Operating profit growth (+5.6%) trailed top-line growth due to 16.2% increase in raw material consumed and higher logistics costs.',
      'However, net profit PAT rose +8.7% aided by higher treasury income and lower effective tax rate (24.2% vs 25.6%).'
    ],
    evidenceCitations: [
      {
        pageNumber: 146,
        section: 'Statement of Profit and Loss',
        document: 'ABC_Industries_Annual_Report_2025.pdf',
        snippet: 'Revenue from operations: ₹16,420 Cr; EBITDA: ₹3,021 Cr; PAT: ₹2,180 Cr.',
        tool: 'Docling'
      }
    ],
    confidence: 'Verified from Consolidated P&L'
  }
];

export const comparisonMetricsList: ComparisonMetric[] = [
  {
    metric: 'Revenue from Operations',
    category: 'Topline',
    fy24: '₹14,600 Cr',
    fy25: '₹16,420 Cr',
    change: '+12.4%',
    direction: 'up',
    impact: 'positive',
    analysisNote: 'Robust 12.4% volume & value growth across domestic and export markets.'
  },
  {
    metric: 'Operating Profit (EBITDA)',
    category: 'Profitability',
    fy24: '₹2,862 Cr',
    fy25: '₹3,021 Cr',
    change: '+5.6%',
    direction: 'up',
    impact: 'positive',
    analysisNote: 'Positive expansion, though curtailed by higher raw material procurement costs.'
  },
  {
    metric: 'Operating Margin',
    category: 'Profitability',
    fy24: '19.6%',
    fy25: '18.4%',
    change: '-1.2% (-120 bps)',
    direction: 'down',
    impact: 'negative',
    analysisNote: 'Margin compressed as input cost inflation (+16.2%) exceeded topline growth.'
  },
  {
    metric: 'Net Profit (PAT)',
    category: 'Bottomline',
    fy24: '₹2,005 Cr',
    fy25: '₹2,180 Cr',
    change: '+8.7%',
    direction: 'up',
    impact: 'positive',
    analysisNote: 'Net profit grew by ₹175 Cr supported by prudent debt servicing and treasury yields.'
  },
  {
    metric: 'Total Debt / Borrowings',
    category: 'Leverage',
    fy24: '₹3,930 Cr',
    fy25: '₹5,140 Cr',
    change: '+30.8%',
    direction: 'up',
    impact: 'negative',
    analysisNote: 'Long-term debt raised to finance Phase-2 green renewable capacity expansion.'
  },
  {
    metric: 'Debt-to-Equity Ratio',
    category: 'Leverage',
    fy24: '0.36x',
    fy25: '0.42x',
    change: '+0.06x',
    direction: 'up',
    impact: 'neutral',
    analysisNote: 'Remains conservatively low, well within safe corporate covenants of < 1.20x.'
  },
  {
    metric: 'Operating Cash Flow (CFO)',
    category: 'Cash Flow',
    fy24: '₹2,540 Cr',
    fy25: '₹2,180 Cr',
    change: '-14.2%',
    direction: 'down',
    impact: 'negative',
    analysisNote: 'Working capital tie-up from extended 90-day credit windows to major clients.'
  },
  {
    metric: 'Free Cash Flow (FCF)',
    category: 'Cash Flow',
    fy24: '₹1,586 Cr',
    fy25: '₹1,320 Cr',
    change: '-16.8%',
    direction: 'down',
    impact: 'negative',
    analysisNote: 'Lower operating cash flow combined with ₹860 Cr CapEx reduced net free cash.'
  },
  {
    metric: 'Return on Equity (ROE)',
    category: 'Return Ratios',
    fy24: '18.5%',
    fy25: '17.8%',
    change: '-0.7%',
    direction: 'down',
    impact: 'neutral',
    analysisNote: 'Slight moderation due to expanded equity base (+12.8%) from retained profits.'
  },
  {
    metric: 'Return on Capital Employed (ROCE)',
    category: 'Return Ratios',
    fy24: '21.8%',
    fy25: '19.9%',
    change: '-1.9%',
    direction: 'down',
    impact: 'negative',
    analysisNote: 'Capital employed expanded with new plant investment prior to full revenue generation.'
  }
];

export const sampleUsers: LocalUser[] = [
  {
    id: 'usr-1',
    name: 'Pratham',
    email: 'pratham@internal.doxfin',
    role: 'Administrator',
    department: 'Financial Strategy & AI Ops',
    documentsCount: 24,
    lastActive: 'Active Now',
    status: 'Active',
    permissions: { owner: true, analyze: true, read: true, export: true, delete: true }
  },
  {
    id: 'usr-2',
    name: 'Priya Sundaram',
    email: 'priya.s@internal.doxfin',
    role: 'Financial Analyst',
    department: 'Equity Research',
    documentsCount: 18,
    lastActive: '12 mins ago',
    status: 'Active',
    permissions: { owner: false, analyze: true, read: true, export: true, delete: false }
  },
  {
    id: 'usr-3',
    name: 'Rajesh K. Mehta',
    email: 'rajesh.m@internal.doxfin',
    role: 'Reviewer',
    department: 'Statutory Audit & Compliance',
    documentsCount: 31,
    lastActive: '1 hour ago',
    status: 'Active',
    permissions: { owner: false, analyze: false, read: true, export: true, delete: false }
  },
  {
    id: 'usr-4',
    name: 'Ananya Sharma',
    email: 'ananya.s@internal.doxfin',
    role: 'Financial Analyst',
    department: 'Credit Rating & Risk',
    documentsCount: 9,
    lastActive: '3 hours ago',
    status: 'Active',
    permissions: { owner: false, analyze: true, read: true, export: true, delete: false }
  },
  {
    id: 'usr-5',
    name: 'Vikram Merchant',
    email: 'vikram.m@internal.doxfin',
    role: 'Viewer',
    department: 'Executive Board Secretariat',
    documentsCount: 42,
    lastActive: 'Yesterday',
    status: 'Active',
    permissions: { owner: false, analyze: false, read: true, export: false, delete: false }
  }
];

export const sampleAuditLogs: AuditLog[] = [
  {
    id: 'log-101',
    timestamp: '2026-09-20 11:48:22',
    user: 'Pratham (Admin)',
    role: 'Administrator',
    action: 'UPLOAD_DOCUMENT',
    actionLabel: 'Uploaded Financial PDF',
    document: 'ABC_Industries_Annual_Report_2025.pdf',
    ipAddress: '192.168.1.104 (Local Subnet)',
    status: 'SUCCESS',
    details: 'Initiated 10-stage processing pipeline for 428-page PDF via Docling + Qwen3-VL router.'
  },
  {
    id: 'log-102',
    timestamp: '2026-09-20 11:52:05',
    user: 'Priya Sundaram',
    role: 'Financial Analyst',
    action: 'VIEW_ANALYSIS',
    actionLabel: 'Opened Document Analysis',
    document: 'ABC_Industries_Annual_Report_2025.pdf',
    ipAddress: '192.168.1.112 (Local Subnet)',
    status: 'SUCCESS',
    details: 'Inspected Income Statement table and verified Revenue ₹16,420 Cr on Page 146.'
  },
  {
    id: 'log-103',
    timestamp: '2026-09-20 11:55:18',
    user: 'Rajesh K. Mehta',
    role: 'Reviewer',
    action: 'VERIFY_METRIC',
    actionLabel: 'Verified Financial Metric',
    document: 'ABC_Industries_Annual_Report_2025.pdf',
    ipAddress: '192.168.1.118 (Local Subnet)',
    status: 'SUCCESS',
    details: 'Validated Operating Cash Flow ₹2,180 Cr and confirmed alignment with Note 18 Trade Receivables.'
  },
  {
    id: 'log-104',
    timestamp: '2026-09-20 12:01:40',
    user: 'Pratham (Admin)',
    role: 'Administrator',
    action: 'RUN_QUERY',
    actionLabel: 'Executed Ask DoxFin Inquiry',
    document: 'ABC_Industries_Annual_Report_2025.pdf',
    ipAddress: '192.168.1.104 (Local Subnet)',
    status: 'SUCCESS',
    details: 'Queried: "Why did operating cash flow decline?" - Retrieved 4 evidence citations from local FAISS store.'
  },
  {
    id: 'log-105',
    timestamp: '2026-09-20 12:03:10',
    user: 'Ananya Sharma',
    role: 'Financial Analyst',
    action: 'EXPORT_REPORT',
    actionLabel: 'Exported Financial Briefing',
    document: 'Tata_Motors_Annual_Report_FY25.pdf',
    ipAddress: '192.168.1.121 (Local Subnet)',
    status: 'SUCCESS',
    details: 'Generated audit-ready local executive PDF summary with Docling source coordinates.'
  },
  {
    id: 'log-106',
    timestamp: '2026-09-19 16:30:00',
    user: 'Pratham (Admin)',
    role: 'Administrator',
    action: 'CHANGE_SYSTEM_MODE',
    actionLabel: 'Configured Engine Mode',
    document: 'Global System Config',
    ipAddress: '192.168.1.104 (Local Subnet)',
    status: 'SUCCESS',
    details: 'Set default execution mode to "BALANCED" (Docling + Qwen3-VL 4-bit + Ray 4 Workers).'
  }
];
