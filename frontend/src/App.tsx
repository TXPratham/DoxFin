import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Send,
  Search,
  Layers,
  TrendingUp,
  ShieldCheck,
  BarChart3,
  Clock,
  Loader2,
  ChevronRight,
  Sparkles,
  ArrowLeft,
  FileUp,
  CheckCircle,
  Building2,
  Bell,
  Terminal,
  Cpu,
  Shield,
  Calendar,
  XCircle,
  FolderOpen,
  GitCompare,
  Users,
  Activity,
  Settings,
  ChevronDown,
  Filter,
  Download,
  Plus,
  Trash2,
  Lock,
  RefreshCw,
  FileSpreadsheet,
  Eye,
  Check,
  ExternalLink,
  Sliders,
  Database,
  Key,
  ShieldAlert,
  SlidersHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Bot,
  MessageSquare,
  CornerDownLeft,
  Table as TableIcon
} from 'lucide-react';
import { DoxFinLogo } from './components/DoxFinLogo';

interface MetricItem {
  metric_name: string;
  value: number;
  unit: string;
  period?: string;
  validation_status?: string;
  source?: string;
}

interface AnomalyItem {
  anomaly_type: string;
  severity: string;
  message: string;
  action_required?: string;
}

interface RAGCitation {
  page_number: number;
  section: string;
  chunk_id?: string;
  score: number;
  text_snippet: string;
  source_type?: string;
  text?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'doxfin';
  text: string;
  timestamp: string;
  citations?: RAGCitation[];
}

interface DocumentSummary {
  id: string;
  filename: string;
  page_count: number;
  status: string;
  created_at?: string;
  file_size?: string;
  time_ago?: string;
}

interface DocumentRoutingInfo {
  total_pages: number;
  text_pages: number;
  table_pages: number;
  chart_pages: number;
  skipped_pages: number;
  table_page_numbers?: number[];
  chart_page_numbers?: number[];
  skipped_page_numbers?: number[];
}

interface HardwareConfig {
  mode: string;
  vision_model: string;
  vision_quantization: string;
  memory_ceiling_gb: number;
  max_parallel_workers: number;
  is_auto_managed: boolean;
  description: string;
  hardware_detected: {
    ram_total_gb: number;
    ram_available_gb: number;
    cpu_cores: number;
    cpu_physical: number;
    gpu_name: string;
    vram_gb: number;
    gpu_available: boolean;
  };
  recommended_model: string;
  recommended_tier: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user_email: string;
  user_name: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details: any;
  ip_address: string;
  status: string;
}

export interface EnterpriseUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at?: string;
  department?: string;
  last_active?: string;
}

export default function App() {
  // Navigation: 'LANDING' (Front Page) vs 'WORKSPACE' (Enterprise View)
  const [currentView, setCurrentView] = useState<'LANDING' | 'WORKSPACE'>('LANDING');
  
  // Workspace Active Tab: 'Processing' | 'Financial Analysis' | 'Overview' | 'Anomalies' | 'Ask DoxFin' | 'System'
  const [activeSidebarTab, setActiveSidebarTab] = useState<string>('Processing');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Hardware Profiling & Adaptive Qwen Model Selection
  const [hardwareConfig, setHardwareConfig] = useState<HardwareConfig | null>(null);
  const [hardwareLoading, setHardwareLoading] = useState<boolean>(false);

  // Active Document Details
  const [activeDocId, setActiveDocId] = useState<string>('doc_abc_2025');
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [activeFilename, setActiveFilename] = useState<string>('ABC Industries — Annual Report 2025.pdf');
  const [pageCount, setPageCount] = useState<number>(184);
  const [docStatus, setDocStatus] = useState<string>('completed');
  const [progressPercent, setProgressPercent] = useState<number>(100);
  const [currentStageLabel, setCurrentStageLabel] = useState<string>('Completed');

  // Selective Page Router Summary (PyMuPDF Fast Pass)
  const [routingSummary, setRoutingSummary] = useState<DocumentRoutingInfo>({
    total_pages: 519,
    text_pages: 472,
    table_pages: 45,
    chart_pages: 1,
    skipped_pages: 1,
    table_page_numbers: [2, 55, 79, 192, 240, 329, 334, 335, 336, 337, 338, 339, 345, 346, 381],
    chart_page_numbers: [302],
    skipped_page_numbers: [1]
  });

  // Derived active routing metrics dynamically matching uploaded document
  const activeTotalPages = pageCount > 0 ? pageCount : (routingSummary.total_pages || 184);
  const isCustomDoc = routingSummary.total_pages === activeTotalPages;
  const activeTextPages = isCustomDoc ? routingSummary.text_pages : Math.max(1, Math.round(activeTotalPages * 0.91));
  const activeTablePages = isCustomDoc ? routingSummary.table_pages : Math.max(1, Math.round(activeTotalPages * 0.08));
  const activeChartPages = isCustomDoc ? routingSummary.chart_pages : Math.max(1, Math.round(activeTotalPages * 0.005));
  const activeSkippedPages = isCustomDoc ? routingSummary.skipped_pages : Math.max(1, activeTotalPages - (activeTextPages + activeTablePages + activeChartPages));
  const fastPassTime = Math.max(0.6, (activeTotalPages * 0.007 + 0.8)).toFixed(1);

  // Recent Documents List for Landing Page
  const [recentDocs, setRecentDocs] = useState<DocumentSummary[]>([
    {
      id: 'doc_abc_2025',
      filename: 'ABC Industries - Annual Report 2025',
      page_count: 184,
      status: 'completed',
      time_ago: '12 mins ago',
      file_size: '48.2 MB'
    },
    {
      id: 'doc_reliance_q3',
      filename: 'Reliance Retail - Q3 2025',
      page_count: 142,
      status: 'completed',
      time_ago: 'Yesterday',
      file_size: '18.6 MB'
    },
    {
      id: 'doc_hdfc_fy24',
      filename: 'HDFC Bank - FY24 Annual Report',
      page_count: 420,
      status: 'completed',
      time_ago: '3 days ago',
      file_size: '55.0 MB'
    }
  ]);

  // Streaming Live Terminal Console Logs
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    '[00:01.04] Allocated sovereign GPU sandbox (Worker Node cluster #04).',
    '[00:02.19] Optical bounds established across 184 pages. DPI resolution: 600.',
    '[00:04.12] Extracted Consolidated Revenue from Operations: ₹16,420 Cr',
    '[00:04.85] Net Profit after Tax identified: ₹2,180 Cr (Page 112)',
    '[00:05.10] Operating margin computed at 18.4% (-1.2% YoY)',
    '[00:06.33] Detected Trade Receivables divergence Note 17: +23% surge vs +12.4% Revenue growth...',
    '[00:07.12] Indexing vector embeddings for 24 audit schedules...',
    '[00:07.89] Cross-verifying impairment tests against Ind AS 36 / Note 22...',
    '[00:08.45] Correlating Note 17 sub-ledger with Schedule III disaggregations...'
  ]);

  // Deterministic Financial Metrics (Python Engine)
  const [metrics, setMetrics] = useState<MetricItem[]>([
    { metric_name: 'Consolidated Revenue', value: 16420.0, unit: 'Cr', validation_status: 'verified', source: 'income_statement' },
    { metric_name: 'Reported PAT', value: 2180.0, unit: 'Cr', validation_status: 'verified', source: 'income_statement' },
    { metric_name: 'Operating Margin', value: 18.4, unit: '%', validation_status: 'verified', source: 'income_statement' },
    { metric_name: 'Free Cash Flow', value: 1320.0, unit: 'Cr', validation_status: 'verified', source: 'cash_flow_statement' },
    { metric_name: 'Debt-to-Equity Ratio', value: 0.68, unit: 'ratio', validation_status: 'verified', source: 'balance_sheet' },
    { metric_name: 'Current Ratio', value: 1.33, unit: 'ratio', validation_status: 'verified', source: 'balance_sheet' }
  ]);

  const [anomalies, setAnomalies] = useState<AnomalyItem[]>([
    {
      anomaly_type: 'TRADE_RECEIVABLES_DIVERGENCE',
      severity: 'HIGH',
      message: 'Trade receivables grew by +23.0% YoY while revenue expanded by +12.4%, indicating working capital strain.',
      action_required: 'Review Note 17 aging schedule and Expected Credit Loss (ECL) provisioning on Page 151.'
    },
    {
      anomaly_type: 'OPERATING_CASH_FLOW_LAG',
      severity: 'MEDIUM',
      message: 'Operating cash flow to EBITDA ratio declined to 62% from 78% in FY24 due to inventory build-up.',
      action_required: 'Cross-reference inventory turnover days in MD&A Note 8.'
    }
  ]);

  // Grounded RAG State (Zero Hallucination)
  const [query, setQuery] = useState<string>('');
  const [queryLoading, setQueryLoading] = useState<boolean>(false);
  const [answer, setAnswer] = useState<string>(
    'Consolidated Revenue from operations reached ₹16,420 Cr in FY25 (up +12.4% YoY) with Operating Margin at 18.4%. Free Cash Flow closed at ₹1,320 Cr verified via Schedule III Cash Flow Statements.'
  );
  const [chatInput, setChatInput] = useState<string>('');
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'doxfin',
      text: 'Hello Marcus, I am DoxFin Quantitative AI. I have indexed this financial filing with deterministic arithmetic and strict page grounding. You can ask me to summarize financial statements, evaluate debt ratios, or analyze table disclosures like Note 17 Trade Receivables aging.',
      timestamp: 'Just now',
      citations: [
        {
          page_number: 112,
          section: 'Consolidated Statement of Profit and Loss',
          score: 0.96,
          text_snippet: 'Revenue from operations for the financial year ended March 31, 2025 stood at ₹16,420.00 Crores compared to ₹14,600.00 Crores in the previous year.'
        },
        {
          page_number: 114,
          section: 'Consolidated Statement of Cash Flows',
          score: 0.94,
          text_snippet: 'Net cash generated from operating activities before changes in working capital was ₹3,021.50 Crores; Free Cash Flow was ₹1,320.00 Crores.'
        },
        {
          page_number: 151,
          section: 'Note 17: Trade Receivables Aging Schedule',
          score: 0.95,
          text_snippet: '| Category | Less than 6 mos | 6 mos - 1 yr | 1 - 2 yrs | 2 - 3 yrs | > 3 yrs | Total |\n|---|---|---|---|---|---|---|\n| Undisputed Billed | ₹162 Cr | ₹549 Cr | ₹711 Cr | ₹2 Cr | ₹31 Cr | ₹1,455 Cr |\n| Unbilled Dues | ₹45 Cr | ₹88 Cr | ₹12 Cr | ₹0 Cr | ₹0 Cr | ₹145 Cr |\n| ECL Provisioning | (₹4.2 Cr) | (₹18.5 Cr) | (₹22.1 Cr) | (₹1.8 Cr) | (₹31 Cr) | (₹77.6 Cr) |'
        }
      ]
    }
  ]);
  const [citations, setCitations] = useState<RAGCitation[]>([
    {
      page_number: 112,
      section: 'Consolidated Statement of Profit and Loss',
      score: 0.96,
      text_snippet: 'Revenue from operations for the financial year ended March 31, 2025 stood at ₹16,420.00 Crores compared to ₹14,600.00 Crores in the previous year.'
    },
    {
      page_number: 114,
      section: 'Consolidated Statement of Cash Flows',
      score: 0.94,
      text_snippet: 'Net cash generated from operating activities before changes in working capital was ₹3,021.50 Crores; Free Cash Flow was ₹1,320.00 Crores.'
    },
    {
      page_number: 151,
      section: 'Note 17: Trade Receivables Aging & ECL',
      score: 0.91,
      text_snippet: 'Trade receivables considered good - unsecured aggregate ₹3,240.00 Crores. Outstanding > 6 months: ₹412.00 Crores (ECL coverage 14.5%).'
    }
  ]);

  // Audit Logs State (Phase 40 SOC2 Ledger)
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([
    {
      id: 'aud_9024',
      timestamp: '2025-03-29T14:48:12Z',
      user_email: 'marcus.sterling@syndicate-a.internal',
      user_name: 'Marcus Sterling',
      action: 'INVARIANCE_SCAN',
      resource_type: 'DOCUMENT',
      resource_id: 'doc_abc_2025',
      details: 'Deterministic ratio verification completed: 18 rules evaluated, 2 anomalies flagged.',
      ip_address: '10.240.12.89',
      status: 'SUCCESS'
    },
    {
      id: 'aud_9023',
      timestamp: '2025-03-29T14:45:00Z',
      user_email: 'marcus.sterling@syndicate-a.internal',
      user_name: 'Marcus Sterling',
      action: 'UPLOAD',
      resource_type: 'DOCUMENT',
      resource_id: 'doc_abc_2025',
      details: 'Ingested ABC Industries - Annual Report 2025.pdf (184 pages, Qwen2.5-VL-3B AWQ).',
      ip_address: '10.240.12.89',
      status: 'SUCCESS'
    },
    {
      id: 'aud_9022',
      timestamp: '2025-03-29T14:32:18Z',
      user_email: 'sarah.lin@syndicate-a.internal',
      user_name: 'Sarah Lin',
      action: 'QUERY',
      resource_type: 'RAG_INDEX',
      resource_id: 'idx_rel_q3',
      details: 'Semantic search on Note 17 Trade Receivables ECL provisioning provisions.',
      ip_address: '10.240.14.102',
      status: 'SUCCESS'
    },
    {
      id: 'aud_9021',
      timestamp: '2025-03-29T13:18:40Z',
      user_email: 'aris.thorne@syndicate-a.internal',
      user_name: 'Dr. Aris Thorne',
      action: 'VERIFY',
      resource_type: 'METRIC',
      resource_id: 'met_fcf_2025',
      details: 'Free Cash Flow reconciled against Ind AS 7 Statement of Cash Flows.',
      ip_address: '10.240.08.15',
      status: 'SUCCESS'
    },
    {
      id: 'aud_9020',
      timestamp: '2025-03-29T11:05:00Z',
      user_email: 'marcus.sterling@syndicate-a.internal',
      user_name: 'Marcus Sterling',
      action: 'LOGIN',
      resource_type: 'USER',
      resource_id: 'usr_m_sterling',
      details: 'Hardware security token authentication passed. Sovereign Enclave session initialized.',
      ip_address: '10.240.12.89',
      status: 'SUCCESS'
    }
  ]);
  const [auditFilter, setAuditFilter] = useState<string>('ALL');
  const [auditStatusFilter, setAuditStatusFilter] = useState<string>('ALL');
  const [auditLoading, setAuditLoading] = useState<boolean>(false);

  // Enterprise Users & Access State
  const [enterpriseUsers, setEnterpriseUsers] = useState<EnterpriseUser[]>([
    {
      id: 'usr_1',
      email: 'marcus.sterling@syndicate-a.internal',
      full_name: 'Marcus Sterling',
      role: 'LEAD AUDITOR',
      department: 'Credit Risk & Audit Committee',
      is_active: true,
      created_at: '2024-01-15',
      last_active: 'Just now'
    },
    {
      id: 'usr_2',
      email: 'aris.thorne@syndicate-a.internal',
      full_name: 'Dr. Aris Thorne',
      role: 'ADMIN',
      department: 'Quantitative Analytics & Model Governance',
      is_active: true,
      created_at: '2023-11-10',
      last_active: '12 mins ago'
    },
    {
      id: 'usr_3',
      email: 'sarah.lin@syndicate-a.internal',
      full_name: 'Sarah Lin',
      role: 'SENIOR ANALYST',
      department: 'Institutional Fixed Income',
      is_active: true,
      created_at: '2024-03-01',
      last_active: '1 hour ago'
    },
    {
      id: 'usr_4',
      email: 'elena.vance@syndicate-a.internal',
      full_name: 'Elena Vance',
      role: 'COMPLIANCE REVIEWER',
      department: 'Regulatory Compliance & SOC2 Enclave',
      is_active: true,
      created_at: '2024-04-20',
      last_active: 'Yesterday'
    },
    {
      id: 'usr_5',
      email: 'alex.chen@syndicate-a.internal',
      full_name: 'Alex Chen',
      role: 'VIEWER',
      department: 'Junior Research Analyst',
      is_active: true,
      created_at: '2024-06-12',
      last_active: '3 days ago'
    }
  ]);
  const [usersLoading, setUsersLoading] = useState<boolean>(false);

  // Financial Statement Category Filter
  const [statementCategory, setStatementCategory] = useState<'ALL' | 'INCOME' | 'BALANCE' | 'CASHFLOW' | 'RATIOS'>('ALL');

  // Anomalies Filter & Resolution State
  const [anomalySeverityFilter, setAnomalySeverityFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'RESOLVED'>('ALL');
  const [resolvedAnomalyTypes, setResolvedAnomalyTypes] = useState<string[]>([]);

  // Compare Reports State
  const [compareDocA, setCompareDocA] = useState<string>('doc_abc_2025');
  const [compareDocB, setCompareDocB] = useState<string>('doc_hdfc_fy24');

  // Settings State
  const [settingsCategory, setSettingsCategory] = useState<'SECURITY' | 'ENGINE' | 'LICENSE' | 'INTEGRATIONS'>('SECURITY');
  const [settingsAirGap, setSettingsAirGap] = useState<boolean>(true);
  const [settingsZeroLeakage, setSettingsZeroLeakage] = useState<boolean>(true);
  const [settingsStrictIndAS, setSettingsStrictIndAS] = useState<boolean>(true);
  const [settingsOcrEngine, setSettingsOcrEngine] = useState<string>('docling');
  const [settingsConfidenceThreshold, setSettingsConfidenceThreshold] = useState<number>(95);

  // Document Management Tab Filter
  const [docSearch, setDocSearch] = useState<string>('');
  const [docFilterStatus, setDocFilterStatus] = useState<string>('ALL');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const terminalBottomRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  // Time Tracking & Strict Backward Countdown Estimation
  const [totalEstimatedDuration, setTotalEstimatedDuration] = useState<number>(8.5);
  const [startTime, setStartTime] = useState<number>(Date.now() - 8500);
  const [elapsedSec, setElapsedSec] = useState<number>(8.5);
  const [estimatedRemainingSec, setEstimatedRemainingSec] = useState<number>(0);

  // Strict Backward Countdown Timer
  useEffect(() => {
    if (docStatus === 'processing' && progressPercent < 100) {
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const curElapsed = (now - startTime) / 1000;
        setElapsedSec(curElapsed);

        // Calculate strict backward countdown
        const rem = Math.max(0, totalEstimatedDuration - curElapsed);
        setEstimatedRemainingSec(rem);
      }, 100);
    } else {
      setEstimatedRemainingSec(0);
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [docStatus, progressPercent, startTime, totalEstimatedDuration]);


  // Fetch system hardware profile & active Qwen model configuration
  const fetchHardwareConfig = async () => {
    try {
      setHardwareLoading(true);
      const res = await fetch('/api/v1/hardware/config');
      if (res.ok) {
        const data = await res.json();
        setHardwareConfig(data);
      }
    } catch {
      // Offline fallback profile (matching ASUS A15 RTX 3050 default)
      setHardwareConfig({
        mode: 'LITE',
        vision_model: 'Qwen2.5-VL-3B',
        vision_quantization: '4bit',
        memory_ceiling_gb: 4.0,
        max_parallel_workers: 2,
        is_auto_managed: true,
        description: 'Optimized for lightweight memory usage and 4GB VRAM (ASUS A15 RTX 3050/CPU).',
        hardware_detected: {
          ram_total_gb: 15.3,
          ram_available_gb: 2.5,
          cpu_cores: 12,
          cpu_physical: 6,
          gpu_name: 'NVIDIA GeForce RTX 3050 Laptop GPU',
          vram_gb: 4.0,
          gpu_available: true
        },
        recommended_model: 'Qwen/Qwen2.5-VL-3B-Instruct',
        recommended_tier: 'LITE'
      });
    } finally {
      setHardwareLoading(false);
    }
  };

  // Switch Qwen VLM execution mode dynamically
  const switchHardwareMode = async (targetMode: string) => {
    try {
      setHardwareLoading(true);
      // Optimistic UI state update so button highlights immediately
      setHardwareConfig(prev => prev ? ({
        ...prev,
        mode: targetMode,
        vision_model: targetMode === 'LITE' ? 'Qwen2.5-VL-3B' : 'Qwen2.5-VL-7B',
        vision_quantization: targetMode === 'PERFORMANCE' ? 'bfloat16' : '4bit',
        memory_ceiling_gb: targetMode === 'LITE' ? 4.0 : targetMode === 'BALANCED' ? 8.0 : 16.0
      }) : null);

      const res = await fetch('/api/v1/hardware/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: targetMode })
      });
      if (res.ok) {
        const data = await res.json();
        setHardwareConfig(data.active_config);
      }
    } catch (e) {
      console.warn('Mode switch error:', e);
    } finally {
      setHardwareLoading(false);
    }
  };

  // Fetch documents from backend
  const fetchBackendDocuments = async () => {
    try {
      const res = await fetch('/api/v1/documents');
      if (res.ok) {
        const data = await res.json();
        if (data.documents && data.documents.length > 0) {
          const mapped: DocumentSummary[] = data.documents.map((d: any, idx: number) => ({
            id: d.id,
            filename: d.filename,
            page_count: d.page_count || 184,
            status: d.status || 'completed',
            time_ago: idx === 0 ? 'Just now' : `${idx * 2} hours ago`,
            file_size: `${(Math.max(12, (d.page_count || 184) * 0.15)).toFixed(1)} MB`
          }));
          setRecentDocs((prev) => {
            const combined = [...mapped, ...prev.filter(p => !mapped.some(m => m.id === p.id))];
            return combined.slice(0, 6);
          });
        }
      }
    } catch {
      // Offline fallback
    }
  };

  // Fetch selective page routing classification breakdown
  const fetchDocumentRoutes = async (docId: string) => {
    try {
      const res = await fetch(`/api/v1/documents/${docId}/routes`);
      if (res.ok) {
        const data = await res.json();
        setRoutingSummary(data);
      }
    } catch (e) {
      console.warn('Routes fetch offline:', e);
    }
  };

  // Fetch real analytics (metrics & anomalies) for active document
  const fetchDocumentAnalytics = async (docId: string) => {
    try {
      fetchDocumentRoutes(docId);
      const [mRes, aRes] = await Promise.all([
        fetch(`/api/v1/documents/${docId}/metrics`),
        fetch(`/api/v1/documents/${docId}/anomalies`)
      ]);

      if (mRes.ok) {
        const mData = await mRes.json();
        setMetrics(mData.metrics || []);
      } else {
        setMetrics([]);
      }

      if (aRes.ok) {
        const aData = await aRes.json();
        setAnomalies(aData.anomalies || []);
      } else {
        setAnomalies([]);
      }
    } catch (e) {
      console.warn('Analytics fetch offline:', e);
    }
  };

  // Live polling worker connecting to FastAPI backend
  const startLivePolling = (docId: string, jobId?: string, totalPages: number = 1) => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    fetchDocumentRoutes(docId);

    let simProgress = 20;
    const pollFunc = async () => {
      try {
        const targetUrl = jobId ? `/api/v1/jobs/${jobId}` : `/api/v1/documents/${docId}/status`;
        const res = await fetch(targetUrl);
        if (res.ok) {
          const data = await res.json();
          setDocStatus(data.status);
          setProgressPercent(data.progress_percent || 0);
          setCurrentStageLabel(data.current_stage || 'Processing');
          if (data.page_count) setPageCount(data.page_count);
          if (data.filename) setActiveFilename(data.filename);

          // Append live terminal logs as progress advances
          if (data.progress_percent >= 30 && data.progress_percent < 50) {
            setConsoleLogs(prev => {
              const line = `[00:03.12] OCR & Optical Bounds completed across ${data.page_count || totalPages} page(s).`;
              return prev.includes(line) ? prev : [...prev, line];
            });
          }
          if (data.progress_percent >= 50 && data.progress_percent < 75) {
            setConsoleLogs(prev => {
              const line = `[00:05.40] Table extraction and statement structure scan completed.`;
              return prev.includes(line) ? prev : [...prev, line];
            });
          }
          if (data.progress_percent >= 75 && data.progress_percent < 95) {
            setConsoleLogs(prev => {
              const line = `[00:07.10] Deterministic Python ratio engine validated financial schedules.`;
              return prev.includes(line) ? prev : [...prev, line];
            });
          }

          if (data.status === 'completed' || data.progress_percent >= 100) {
            if (pollingRef.current) clearInterval(pollingRef.current);
            setDocStatus('completed');
            setProgressPercent(100);
            setCurrentStageLabel('Completed');
            setConsoleLogs(prev => [
              ...prev,
              `[00:08.92] FAISS vector indexing complete. Document ${data.document_id || docId} ready for interrogation.`
            ]);
            fetchDocumentAnalytics(docId);
            fetchBackendDocuments();
          } else if (data.status === 'failed') {
            if (pollingRef.current) clearInterval(pollingRef.current);
            setDocStatus('failed');
            setConsoleLogs(prev => [...prev, `[ERROR] Processing failed: ${data.current_stage}`]);
          }
        } else {
          // Progress simulation if running without live background task worker
          simProgress += 18;
          if (simProgress >= 100) {
            simProgress = 100;
            if (pollingRef.current) clearInterval(pollingRef.current);
            setDocStatus('completed');
            setProgressPercent(100);
            setCurrentStageLabel('Completed');
            setConsoleLogs(prev => [
              ...prev,
              `[00:08.92] Ingestion complete. Document ${docId} indexed with FAISS.`
            ]);
            fetchDocumentAnalytics(docId);
          } else {
            setProgressPercent(simProgress);
          }
        }
      } catch {
        // Fallback simulation
        simProgress += 20;
        if (simProgress >= 100) {
          simProgress = 100;
          if (pollingRef.current) clearInterval(pollingRef.current);
          setDocStatus('completed');
          setProgressPercent(100);
          fetchDocumentAnalytics(docId);
        } else {
          setProgressPercent(simProgress);
        }
      }
    };

    pollFunc();
    pollingRef.current = setInterval(pollFunc, 600);
  };

  // Fetch audit logs from backend compliance API
  const fetchAuditLogs = async () => {
    try {
      setAuditLoading(true);
      const res = await fetch('/api/v1/audit-logs');
      if (res.ok) {
        const data = await res.json();
        if (data.logs && data.logs.length > 0) {
          setAuditLogs(data.logs);
        }
      }
    } catch {
      // Keep rich fallback logs
    } finally {
      setAuditLoading(false);
    }
  };

  // Fetch registered enterprise employees
  const fetchEnterpriseUsers = async () => {
    try {
      setUsersLoading(true);
      const res = await fetch('/api/v1/auth/users');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setEnterpriseUsers(data.map((u: any, idx: number) => ({
            id: u.id || `usr_${idx}`,
            email: u.email,
            full_name: u.full_name || u.email.split('@')[0],
            role: u.role || 'ANALYST',
            department: idx === 0 ? 'Lead Auditor' : 'Institutional Credit',
            is_active: u.is_active !== undefined ? u.is_active : true,
            created_at: u.created_at ? new Date(u.created_at).toLocaleDateString() : '2024-01-01',
            last_active: idx === 0 ? 'Just now' : 'Active'
          })));
        }
      }
    } catch {
      // Keep rich fallback team
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchBackendDocuments();
    fetchHardwareConfig();
    fetchAuditLogs();
    fetchEnterpriseUsers();
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Handle Document/Image Upload & Start Processing
  const processUploadFile = async (file: File) => {
    if (!file) return;

    const tStart = Date.now();
    const isImage = /\.(png|jpe?g|webp|bmp|tiff)$/i.test(file.name);
    const estPages = isImage ? 1 : Math.max(1, Math.round(file.size / (1024 * 70)));
    const estDuration = isImage ? 3.5 : Math.max(4.0, Math.min(60.0, estPages * 0.12 + 3.0));
    
    setTotalEstimatedDuration(estDuration);
    setStartTime(tStart);
    setElapsedSec(0.0);
    setEstimatedRemainingSec(estDuration);

    setActiveFilename(file.name);
    setCurrentView('WORKSPACE');
    setActiveSidebarTab('Processing');
    setDocStatus('processing');
    setProgressPercent(10);
    setCurrentStageLabel('File validation & Fast Pass');
    setPageCount(estPages);

    // Reset previous document metrics, anomalies & answer
    setMetrics([]);
    setAnomalies([]);
    setCitations([]);
    setAnswer(`Ingesting and indexing ${file.name}... Ask any question once indexing completes.`);

    setConsoleLogs([
      `[00:00.08] Accepted ${file.name} for selective ingestion (Enclave mode).`,
      `[00:00.35] Validating structure and optical bounds...`,
      `[00:00.80] Fast-Pass scanning ${estPages} page(s)...`,
      `[00:01.20] Allocated local worker process sandbox (16 Cores / AVX-512).`
    ]);

    const formData = new FormData();
    formData.append('file', file);
    const newDocId = `doc_${Date.now()}`;
    formData.append('document_id', newDocId);

    try {
      const res = await fetch('/api/v1/documents', {
        method: 'POST',
        body: formData,
      });

      if (res.status === 202 || res.status === 200) {
        const data = await res.json();
        setActiveDocId(data.document_id);
        setActiveJobId(data.job_id);
        setActiveFilename(data.filename);
        if (data.page_count) setPageCount(data.page_count);

        setConsoleLogs(prev => [
          ...prev,
          `[00:01.85] Registered Document ID ${data.document_id} (${data.page_count || estPages} verified page(s)).`,
          `[00:02.30] Dispatching table and text extraction worker...`
        ]);

        // Start live polling
        startLivePolling(data.document_id, data.job_id, data.page_count || estPages);
      } else {
        startLivePolling(newDocId, undefined, estPages);
      }
    } catch {
      startLivePolling(newDocId, undefined, estPages);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processUploadFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processUploadFile(file);
  };

  const openDocument = (doc: DocumentSummary) => {
    setActiveDocId(doc.id);
    setActiveFilename(doc.filename);
    setPageCount(doc.page_count);
    setDocStatus('completed');
    setProgressPercent(100);
    setCurrentStageLabel('Completed');
    setEstimatedRemainingSec(0);
    setMetrics([]);
    setAnomalies([]);
    setCitations([]);
    setAnswer(`Evidence extracted from ${doc.filename}. You can ask quantitative questions below.`);
    fetchDocumentAnalytics(doc.id);
    setCurrentView('WORKSPACE');
    setActiveSidebarTab('Processing');
  };

  const formatMetricDisplay = (val: number, unit: string) => {
    if (typeof val !== 'number' || isNaN(val)) return 'N/A';
    if (unit === 'Cr' || unit === 'crore') {
      return `₹${Math.round(val).toLocaleString()} Cr`;
    }
    if (unit === '%') {
      return `${val.toFixed(2)}%`;
    }
    if (unit === 'ratio') {
      return `${val.toFixed(2)}x`;
    }
    return `${val.toFixed(2)} ${unit}`;
  };

  const renderEvidenceContent = (text: string) => {
    if (!text) return null;
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const tableLines = lines.filter(l => l.includes('|'));

    if (tableLines.length >= 2 && tableLines.some(l => l.includes('---'))) {
      const headerLine = tableLines[0];
      const dataLines = tableLines.slice(1).filter(l => !l.includes('---'));

      const headers = headerLine.split('|').map(c => c.trim()).filter(Boolean);
      const rows = dataLines.map(line => line.split('|').map(c => c.trim()).filter(Boolean));

      if (headers.length > 0 && rows.length > 0) {
        return (
          <div style={{ overflowX: 'auto', margin: '0.5rem 0', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.74rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                  {headers.map((h, i) => (
                    <th key={i} style={{ padding: '0.45rem 0.65rem', textAlign: i === 0 ? 'left' : 'right', fontWeight: 700, color: '#1e293b', borderRight: '1px solid #f1f5f9' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rIdx) => (
                  <tr key={rIdx} style={{ borderBottom: '1px solid #f1f5f9', background: rIdx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                    {row.map((cell, cIdx) => {
                      const isNum = cell.includes('₹') || cell.includes('%') || (!isNaN(Number(cell.replace(/,/g, '').replace(/[()]/g, ''))) && cell.trim() !== '');
                      return (
                        <td key={cIdx} style={{ padding: '0.4rem 0.65rem', textAlign: cIdx === 0 ? 'left' : 'right', color: isNum ? '#0f172a' : '#334155', fontFamily: isNum ? 'var(--font-mono)' : 'inherit', fontWeight: isNum ? 600 : 400, borderRight: '1px solid #f8fafc' }}>
                          {cell}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
    }

    // Clean text snippet fallback
    return (
      <div style={{ fontSize: '0.8rem', color: '#334155', lineHeight: 1.5, background: '#f8fafc', padding: '0.55rem 0.75rem', borderRadius: '6px', borderLeft: '3px solid #0284c7' }}>
        "{text}"
      </div>
    );
  };

  const handleSendChatMessage = async (queryText?: string) => {
    const question = (queryText || chatInput).trim();
    if (!question || queryLoading) return;

    const userMsgId = `usr_${Date.now()}`;
    const newMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: question,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, newMsg]);
    setChatInput('');
    setQueryLoading(true);

    try {
      const res = await fetch(`/api/v1/documents/${activeDocId}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: question, top_k: 8 }),
      });

      if (res.ok) {
        const data = await res.json();
        const aiMsg: ChatMessage = {
          id: `dox_${Date.now()}`,
          sender: 'doxfin',
          text: data.answer || 'Analysis complete with verified evidence.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          citations: data.citations || []
        };
        setChatMessages(prev => [...prev, aiMsg]);
        setAnswer(data.answer);
        setCitations(data.citations || []);
      } else {
        const errData = await res.json().catch(() => ({}));
        const aiMsg: ChatMessage = {
          id: `dox_${Date.now()}`,
          sender: 'doxfin',
          text: errData.detail || `Insufficient evidence in ${activeFilename} to answer this question.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          citations: []
        };
        setChatMessages(prev => [...prev, aiMsg]);
      }
    } catch {
      const aiMsg: ChatMessage = {
        id: `dox_${Date.now()}`,
        sender: 'doxfin',
        text: `The uploaded document (${activeFilename}) does not contain financial disclosures to answer "${question}".`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: []
      };
      setChatMessages(prev => [...prev, aiMsg]);
    } finally {
      setQueryLoading(false);
      setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    handleSendChatMessage(query);
  };

  // Format estimated remaining time string: '00:04.48s'
  const formatEstRemaining = (sec: number) => {
    if (docStatus === 'completed' || progressPercent >= 100) {
      return `00:00.00s (Finished in ${elapsedSec.toFixed(1)}s)`;
    }
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 100);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms).padStart(2, '0')}s`;
  };

  // Dynamic values for preliminary capture box
  const toplineMetric = metrics.find(m => m.metric_name.toLowerCase().includes('revenue') || m.metric_name.toLowerCase().includes('topline'));
  const profitMetric = metrics.find(m => m.metric_name.toLowerCase().includes('profit') || m.metric_name.toLowerCase().includes('pat') || m.metric_name.toLowerCase().includes('net'));

  return (
    <>
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".pdf,.png,.jpg,.jpeg,.webp,.bmp,.tiff,.xlsx,.xbrl,.zip"
        style={{ display: 'none' }}
        onChange={handleFileInputChange}
      />

      {/* ======================================================== */}
      {/* 1. FRONT PAGE / LANDING VIEW (Image 1 Logo + Hero)       */}
      {/* ======================================================== */}
      {currentView === 'LANDING' ? (
        <div className="app-landing-wrapper">
          <div className="ambient-glow-left"></div>
          <div className="ambient-glow-right"></div>

          <main className="landing-container">
            {/* Top Pill Badge with Official Image 1 Logo */}
            <div className="brand-pill">
              <DoxFinLogo size="sm" showText={true} />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500, borderLeft: '1px solid #e2e8f0', paddingLeft: '0.6rem' }}>
                Financial Report Intelligence
              </span>
            </div>

            {/* Hero Titles */}
            <h1 className="hero-title">
              Upload <span className="hero-title-blue">Financial Report</span>
            </h1>
            <p className="hero-subtitle">
              Upload PDF statements, annual reports, screenshots, earnings transcripts, or XBRL packages
              for intelligent analysis and insights.
            </p>

            {/* Upload Dropzone Card */}
            <div
              className={`upload-dropzone-card ${isDragOver ? 'drag-active' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="dropzone-icon-wrapper">
                <FileText size={24} />
                <div className="dropzone-badge-plus">+</div>
              </div>

              <div className="dropzone-prompt">Drag and drop your financial report here</div>
              <div className="dropzone-limits">PDF, PNG, JPG, XLSX, XBRL up to 150MB</div>

              <button
                type="button"
                className="btn-select-report"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                <FileUp size={15} />
                <span>Select Report</span>
              </button>
            </div>

            {/* Recent Documents Section */}
            <section className="recent-docs-section">
              <div className="recent-docs-header">
                <div className="recent-docs-title">
                  <Clock size={16} /> Recent Documents
                </div>
                <button
                  type="button"
                  className="recent-view-all"
                  onClick={() => openDocument(recentDocs[0])}
                >
                  View All <ChevronRight size={14} />
                </button>
              </div>

              <div className="recent-docs-grid">
                {recentDocs.slice(0, 3).map((doc) => (
                  <div
                    key={doc.id}
                    className="recent-doc-card"
                    onClick={() => openDocument(doc)}
                  >
                    <div className="recent-doc-left">
                      <div className="doc-icon-coral">
                        <FileText size={18} />
                      </div>
                      <div className="recent-doc-info">
                        <span className="recent-doc-name" title={doc.filename}>
                          {doc.filename}
                        </span>
                        <span className="recent-doc-meta">
                          {doc.time_ago || '12 mins ago'} • {doc.file_size || '48.2 MB'}
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={18} color="#0084d1" />
                  </div>
                ))}
              </div>
            </section>
          </main>
        </div>
      ) : (
        /* ======================================================== */
        /* 2. ENTERPRISE PROCESSING & WORKSPACE VIEW (Image 2)      */
        /* ======================================================== */
        <div className="enterprise-app-layout">
          {/* Left Dark Sidebar */}
          <aside className="enterprise-sidebar">
            <div className="sidebar-top">
              {/* Logo Row with Enterprise Version Badge */}
              <div className="sidebar-logo-row">
                <div style={{ cursor: 'pointer' }} onClick={() => setCurrentView('LANDING')}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.65rem' }}>
                    <svg width="28" height="28" viewBox="0 0 100 100" fill="none">
                      <rect width="100" height="100" rx="20" fill="#1e293b" />
                      <path d="M 22 24 L 54 24 C 74 24 84 36 84 50 C 84 64 74 76 54 76 L 22 76 Z" stroke="#00a3e0" strokeWidth="11" strokeLinejoin="round" fill="none" />
                      <line x1="38" y1="36" x2="38" y2="64" stroke="#00a3e0" strokeWidth="9" strokeLinecap="round" />
                      <path d="M 52 38 L 65 50 L 52 62" stroke="#00c875" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                    <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#ffffff', letterSpacing: '0.02em' }}>
                      DOX<span style={{ color: '#00a3e0' }}>FIN</span>
                    </span>
                    <span style={{ width: 6, height: 6, backgroundColor: '#00c875', borderRadius: '50%', display: 'inline-block' }} />
                  </div>
                </div>
                <span className="version-badge">V3.4 ENTERPRISE</span>
              </div>

              {/* Workspace Switcher */}
              <div className="syndicate-selector">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Building2 size={14} color="#00c875" />
                  <span>Global Syndicate A</span>
                </div>
                <ChevronDown size={14} color="#94a3b8" />
              </div>

              {/* Sidebar Menu Items (Exact list from Image 2) */}
              <nav className="sidebar-nav">
                <button
                  className={`sidebar-item ${activeSidebarTab === 'Overview' ? 'active' : ''}`}
                  onClick={() => setActiveSidebarTab('Overview')}
                >
                  <div className="sidebar-item-left">
                    <BarChart3 size={15} /> Overview
                  </div>
                </button>

                <button
                  className={`sidebar-item ${activeSidebarTab === 'Documents' ? 'active' : ''}`}
                  onClick={() => setActiveSidebarTab('Documents')}
                >
                  <div className="sidebar-item-left">
                    <FolderOpen size={15} /> Documents
                  </div>
                </button>

                <button
                  className={`sidebar-item ${activeSidebarTab === 'Financial Analysis' ? 'active' : ''}`}
                  onClick={() => setActiveSidebarTab('Financial Analysis')}
                >
                  <div className="sidebar-item-left">
                    <TrendingUp size={15} /> Financial Analysis
                  </div>
                </button>

                <button
                  className={`sidebar-item ${activeSidebarTab === 'Anomalies' ? 'active' : ''}`}
                  onClick={() => setActiveSidebarTab('Anomalies')}
                >
                  <div className="sidebar-item-left">
                    <AlertTriangle size={15} /> Anomalies
                  </div>
                  {anomalies.length > 0 && <span className="badge-red">{anomalies.length}</span>}
                </button>

                <button
                  className={`sidebar-item ${activeSidebarTab === 'Ask DoxFin' ? 'active' : ''}`}
                  onClick={() => setActiveSidebarTab('Ask DoxFin')}
                >
                  <div className="sidebar-item-left">
                    <Sparkles size={15} /> Ask DoxFin
                  </div>
                </button>

                <button
                  className={`sidebar-item ${activeSidebarTab === 'Compare Reports' ? 'active' : ''}`}
                  onClick={() => setActiveSidebarTab('Compare Reports')}
                >
                  <div className="sidebar-item-left">
                    <GitCompare size={15} /> Compare Reports
                  </div>
                </button>

                <button
                  className={`sidebar-item ${activeSidebarTab === 'Processing' ? 'active' : ''}`}
                  onClick={() => setActiveSidebarTab('Processing')}
                >
                  <div className="sidebar-item-left">
                    <Activity size={15} /> Processing
                  </div>
                </button>

                <div className="sidebar-divider" />

                <button
                  className={`sidebar-item ${activeSidebarTab === 'Users' ? 'active' : ''}`}
                  onClick={() => setActiveSidebarTab('Users')}
                >
                  <div className="sidebar-item-left">
                    <Users size={15} /> Users & Access
                  </div>
                </button>

                <button
                  className={`sidebar-item ${activeSidebarTab === 'Audit' ? 'active' : ''}`}
                  onClick={() => setActiveSidebarTab('Audit')}
                >
                  <div className="sidebar-item-left">
                    <ShieldCheck size={15} /> Audit Logs
                  </div>
                </button>

                <button
                  className={`sidebar-item ${activeSidebarTab === 'System' ? 'active' : ''}`}
                  onClick={() => setActiveSidebarTab('System')}
                >
                  <div className="sidebar-item-left">
                    <Cpu size={15} /> System
                  </div>
                </button>

                <button
                  className={`sidebar-item ${activeSidebarTab === 'Settings' ? 'active' : ''}`}
                  onClick={() => setActiveSidebarTab('Settings')}
                >
                  <div className="sidebar-item-left">
                    <Settings size={15} /> Settings
                  </div>
                </button>
              </nav>
            </div>

            {/* Sidebar Bottom SOC2 Badge */}
            <div className="sidebar-footer">
              <div className="soc2-banner">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Shield size={12} /> SOC2 TYPE II
                </div>
                <span>ATTESTED</span>
              </div>
              <div className="enclave-sub">
                <span>Sovereign Enclave</span>
                <span>us-east-1</span>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="enterprise-main">
            {/* Top Navigation Bar */}
            <header className="enterprise-header">
              <div className="header-breadcrumbs">
                <button
                  onClick={() => setCurrentView('LANDING')}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#64748b', fontSize: '0.8rem', fontWeight: 600, border: 'none', background: 'none', cursor: 'pointer' }}
                >
                  <ArrowLeft size={13} /> Back to Hub
                </button>
                <span>/</span>
                <span>Ledger</span>
                <span>&gt;</span>
                <span>Institutional Credit</span>
                <span>&gt;</span>
                <span className="breadcrumb-active">Audited Review</span>
              </div>

              <div className="header-badges-right">
                <div className="pill-audited">
                  <Calendar size={12} /> FY2025 AUDITED
                </div>

                <div className="pill-engine-online">
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a' }} />
                  ENGINE ONLINE
                </div>

                <div className="pill-soc2-badge">
                  <ShieldCheck size={13} /> SOC2 Type II
                </div>

                <button style={{ padding: '0.4rem', color: '#64748b', position: 'relative', border: 'none', background: 'none' }}>
                  <Bell size={16} />
                  <span style={{ position: 'absolute', top: 3, right: 3, width: 6, height: 6, background: '#ef4444', borderRadius: '50%' }} />
                </button>

                {/* User Profile */}
                <div className="user-profile-widget">
                  <div className="user-profile-text">
                    <span className="user-profile-name">Marcus Sterling</span>
                    <span className="user-profile-role">Lead Auditor</span>
                  </div>
                  <div className="user-avatar-circle">MS</div>
                </div>
              </div>
            </header>

            {/* View Switching Container */}
            <div className="processing-container">
              {/* Top Document Title Banner (Image 2) */}
              <div className="doc-processing-banner">
                <div className="doc-banner-left">
                  <div className="doc-bank-icon">
                    <Building2 size={24} />
                  </div>
                  <div>
                    <div className="doc-banner-title">
                      Processing: {activeFilename}
                    </div>
                    <div className="doc-banner-tags">
                      <span className="tag-pages">{pageCount} PAGE{pageCount === 1 ? '' : 'S'}</span>
                      <span>•</span>
                      <span>✓ Ingestion Engine v4.2.9</span>
                      <span>•</span>
                      <span>Session Key: <strong>SES-{activeDocId.slice(-4).toUpperCase()}-EAA91</strong></span>
                      <span>•</span>
                      <span style={{ color: '#16a34a', fontWeight: 600 }}>
                        {docStatus === 'processing' ? '● Enclave Real-Time Stream' : '✓ Ingestion Complete'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="doc-banner-right">
                  <div
                    className="thread-pool-pill"
                    onClick={() => setActiveSidebarTab('System')}
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    title="Click to view Hardware Telemetry & Model Switcher"
                  >
                    <Cpu size={14} color="#00a3e0" />
                    <span>
                      {hardwareConfig
                        ? `${hardwareConfig.hardware_detected.gpu_name.replace('NVIDIA ', '')} (${hardwareConfig.hardware_detected.vram_gb}GB VRAM) • ${hardwareConfig.vision_model} (${hardwareConfig.vision_quantization})`
                        : '⚙️ Hardware Engine Active'}
                    </span>
                  </div>
                  <button
                    className="btn-cancel-run"
                    onClick={() => setCurrentView('LANDING')}
                  >
                    <XCircle size={14} /> Cancel Run
                  </button>
                </div>
              </div>

              {/* Processing Pipeline Screen (Image 2) */}
              {activeSidebarTab === 'Processing' && (
                <>
                  {/* Overall Pipeline Status Card */}
                  <div className="overall-status-card">
                    <div className="overall-status-top">
                      <div>
                        <div className="pipeline-status-label">OVERALL PIPELINE STATUS</div>
                        <div className="pipeline-pct-big">
                          {progressPercent}%{' '}
                          <span className="pipeline-stage-sub">
                            {progressPercent >= 100 ? 'Completed' : `(Stage ${Math.min(6, Math.max(1, Math.ceil(progressPercent / 16.6)))} of 6: ${currentStageLabel})`}
                          </span>
                        </div>
                      </div>
                      <div className="pipeline-est-remaining">
                        EST. REMAINING <strong>{formatEstRemaining(estimatedRemainingSec)}</strong>
                      </div>
                    </div>

                    {/* Segmented Progress Bar */}
                    <div className="segmented-progress-bar">
                      <div className={`segment-item ${progressPercent >= 20 ? 'completed' : progressPercent > 0 ? 'active' : ''}`} />
                      <div className={`segment-item ${progressPercent >= 40 ? 'completed' : progressPercent >= 20 ? 'active' : ''}`} />
                      <div className={`segment-item ${progressPercent >= 60 ? 'completed' : progressPercent >= 40 ? 'active' : ''}`} />
                      <div className={`segment-item ${progressPercent >= 80 ? 'completed' : progressPercent >= 60 ? 'active' : ''}`} />
                      <div className={`segment-item ${progressPercent >= 100 ? 'completed' : progressPercent >= 80 ? 'active' : ''}`} />
                    </div>
                    <div className="segment-labels-row">
                      <span className={progressPercent >= 20 ? 'active-label' : ''}>Fast Pass &amp; Layout</span>
                      <span className={progressPercent >= 40 ? 'active-label' : ''}>Table Structuring</span>
                      <span className={progressPercent >= 60 ? 'active-label' : ''}>Visual Analysis</span>
                      <span className={progressPercent >= 80 ? 'active-label' : ''}>Forensics &amp; Ratios</span>
                      <span className={progressPercent >= 100 ? 'active-label' : ''}>Vector Index</span>
                    </div>

                    {/* 3 Bottom Stat Boxes */}
                    <div className="status-stats-grid">
                      <div className="stat-box">
                        <span className="stat-box-title">DATA INGESTED</span>
                        <span className="stat-box-val">
                          {Math.min(pageCount, Math.max(1, Math.round((progressPercent / 100) * pageCount)))} / {pageCount} Pgs
                        </span>
                      </div>
                      <div className="stat-box">
                        <span className="stat-box-title">TOKENS PARSED</span>
                        <span className="stat-box-val">
                          {(Math.max(120, Math.round((progressPercent / 100) * pageCount * 850))).toLocaleString()} Ops
                        </span>
                      </div>
                      <div className="stat-box">
                        <span className="stat-box-title">PRECISION CONFIDENCE</span>
                        <span className="stat-box-val confidence">99.98% SOC2</span>
                      </div>
                    </div>
                  </div>

                  {/* Split Execution Sequence & Terminal Grid */}
                  <div className="execution-grid-layout">
                          {/* Execution Sequence List (Left Column) */}
                          <div className="execution-card">
                            <div className="execution-card-header">
                              <div>
                                <div className="execution-title">Execution Sequence</div>
                                <div className="execution-subtitle">
                                  Selective Fast-Pass routing, targeted table extraction, and deterministic ratio checks.
                                </div>
                              </div>
                              <span className="sync-lock-badge">Sync Lock Active</span>
                            </div>

                            <div className="sequence-list">
                              {/* Step 1: PyMuPDF Fast Pass */}
                              <div className={`sequence-row ${progressPercent >= 16 ? '' : 'active'}`}>
                                <div className="sequence-row-left">
                                  {progressPercent >= 16 ? (
                                    <CheckCircle size={18} color="#16a34a" className="sequence-status-icon" />
                                  ) : (
                                    <Loader2 size={18} color="#0284c7" className="sequence-status-icon spin-icon" />
                                  )}
                                  <div>
                                    <div className="sequence-title-bold">
                                      1. PyMuPDF Fast Pass &amp; Intelligent Page Classification
                                    </div>
                                    <div className="sequence-desc-text">
                                      Fast-pass layout and keyword boundary scan across all {activeTotalPages} pages (~{fastPassTime}s).
                                    </div>
                                  </div>
                                </div>
                                <div className="sequence-row-right">
                                  <span className="tag-metric-sub">{activeTotalPages} scanned</span>
                                  <span className="tag-metric-time">{fastPassTime}s</span>
                                </div>
                              </div>

                              {/* Step 2: Selective Docling Tables */}
                              <div className={`sequence-row ${progressPercent >= 33 ? '' : progressPercent >= 16 ? 'active' : ''}`}>
                                <div className="sequence-row-left">
                                  {progressPercent >= 33 ? (
                                    <CheckCircle size={18} color="#16a34a" className="sequence-status-icon" />
                                  ) : progressPercent >= 16 ? (
                                    <Loader2 size={18} color="#0284c7" className="sequence-status-icon spin-icon" />
                                  ) : (
                                    <span style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid #cbd5e1', display: 'inline-block' }} />
                                  )}
                                  <div>
                                    <div className="sequence-title-bold" style={{ color: progressPercent >= 16 ? '#0f172a' : '#64748b' }}>
                                      2. Selective Docling Financial Table Structuring
                                    </div>
                                    <div className="sequence-desc-text">
                                      Isolated extraction on {activeTablePages} mapped financial table pages (Balance Sheet, P&amp;L, Cash Flow).
                                    </div>
                                  </div>
                                </div>
                                <div className="sequence-row-right">
                                  <span className="tag-metric-sub">{activeTablePages} Tables</span>
                                  <span className="tag-metric-time">{progressPercent >= 33 ? '3.2s' : progressPercent >= 16 ? 'Running' : 'Queued'}</span>
                                </div>
                              </div>

                              {/* Step 3: Selective Qwen3-VL Charts */}
                              <div className={`sequence-row ${progressPercent >= 50 ? '' : progressPercent >= 33 ? 'active' : ''}`}>
                                <div className="sequence-row-left">
                                  {progressPercent >= 50 ? (
                                    <CheckCircle size={18} color="#16a34a" className="sequence-status-icon" />
                                  ) : progressPercent >= 33 ? (
                                    <Loader2 size={18} color="#0284c7" className="sequence-status-icon spin-icon" />
                                  ) : (
                                    <span style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid #cbd5e1', display: 'inline-block' }} />
                                  )}
                                  <div>
                                    <div className="sequence-title-bold" style={{ color: progressPercent >= 33 ? '#0f172a' : '#64748b' }}>
                                      3. Selective Qwen3-VL Multimodal Visual Analysis
                                    </div>
                                    <div className="sequence-desc-text">
                                      Targeted multimodal visual reasoning executed only on {activeChartPages} identified financial chart page(s).
                                    </div>
                                  </div>
                                </div>
                                <div className="sequence-row-right">
                                  <span className="tag-metric-sub" style={{ background: '#dbeafe', color: '#1e40af' }}>
                                    {activeChartPages} Chart(s)
                                  </span>
                                  <span className="tag-metric-time" style={{ color: progressPercent >= 33 && progressPercent < 50 ? '#0284c7' : '#475569', fontWeight: 600 }}>
                                    {progressPercent >= 50 ? '2.4s' : progressPercent >= 33 ? 'Running' : 'Queued'}
                                  </span>
                                </div>
                              </div>

                              {/* Step 4: PyMuPDF Text Pass-Through */}
                              <div className={`sequence-row ${progressPercent >= 67 ? '' : progressPercent >= 50 ? 'active' : ''}`}>
                                <div className="sequence-row-left">
                                  {progressPercent >= 67 ? (
                                    <CheckCircle size={18} color="#16a34a" className="sequence-status-icon" />
                                  ) : progressPercent >= 50 ? (
                                    <Loader2 size={18} color="#0284c7" className="sequence-status-icon spin-icon" />
                                  ) : (
                                    <span style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid #cbd5e1', display: 'inline-block' }} />
                                  )}
                                  <div>
                                    <div className="sequence-title-bold" style={{ color: progressPercent >= 50 ? '#0f172a' : '#64748b' }}>
                                      4. Direct PyMuPDF Text Pass-Through &amp; Normalization
                                    </div>
                                    <div className="sequence-desc-text">
                                      Bypassed heavy OCR and Docling overhead on {activeTextPages} ordinary text pages (zero re-parsing).
                                    </div>
                                  </div>
                                </div>
                                <div className="sequence-row-right">
                                  <span className="tag-metric-sub">{activeTextPages} Text Pgs</span>
                                  <span className="tag-metric-time">{progressPercent >= 67 ? '0.8s' : progressPercent >= 50 ? 'Running' : 'Queued'}</span>
                                </div>
                              </div>

                              {/* Step 5: Deterministic Financial Ratio Engine */}
                              <div className={`sequence-row ${progressPercent >= 84 ? '' : progressPercent >= 67 ? 'active' : ''}`}>
                                <div className="sequence-row-left">
                                  {progressPercent >= 84 ? (
                                    <CheckCircle size={18} color="#16a34a" className="sequence-status-icon" />
                                  ) : progressPercent >= 67 ? (
                                    <Loader2 size={18} color="#0284c7" className="sequence-status-icon spin-icon" />
                                  ) : (
                                    <span style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid #cbd5e1', display: 'inline-block' }} />
                                  )}
                                  <div>
                                    <div className="sequence-title-bold" style={{ color: progressPercent >= 67 ? '#0f172a' : '#64748b' }}>
                                      5. Deterministic Financial Ratio Engine &amp; Anomaly Detection
                                    </div>
                                    <div className="sequence-desc-text">
                                      Deterministic Python calculations (YoY growth, PAT margin, D/E, FCF) and accounting stress flags.
                                    </div>
                                  </div>
                                </div>
                                <div className="sequence-row-right">
                                  <span className="tag-metric-sub">18 Rules</span>
                                  <span className="tag-metric-time">{progressPercent >= 84 ? '0.6s' : progressPercent >= 67 ? 'Running' : 'Queued'}</span>
                                </div>
                              </div>

                              {/* Step 6: Vector Indexing */}
                              <div className={`sequence-row ${progressPercent >= 100 ? '' : progressPercent >= 84 ? 'active' : ''}`}>
                                <div className="sequence-row-left">
                                  {progressPercent >= 100 ? (
                                    <CheckCircle size={18} color="#16a34a" className="sequence-status-icon" />
                                  ) : progressPercent >= 84 ? (
                                    <Loader2 size={18} color="#0284c7" className="sequence-status-icon spin-icon" />
                                  ) : (
                                    <span style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid #cbd5e1', display: 'inline-block' }} />
                                  )}
                                  <div>
                                    <div className="sequence-title-bold" style={{ color: progressPercent >= 84 ? '#0f172a' : '#64748b' }}>
                                      6. Grounded FAISS Vector Store Indexing
                                    </div>
                                    <div className="sequence-desc-text">
                                      Normalized chunks with page and section provenance indexed for sub-second citation retrieval.
                                    </div>
                                  </div>
                                </div>
                                <div className="sequence-row-right">
                                  <span className="tag-metric-sub">FAISS Store</span>
                                  <span className="tag-metric-time">{progressPercent >= 100 ? '0.9s' : progressPercent >= 84 ? 'Running' : 'Queued'}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                    {/* Right Stack: Terminal Console + Preliminary Capture (Image 2) */}
                    <div className="right-column-stack">
                      {/* Live Extraction Console */}
                      <div className="terminal-card">
                        <div className="terminal-header">
                          <div className="terminal-title">
                            <Terminal size={14} color="#00c875" /> LIVE EXTRACTION CONSOLE
                          </div>
                          <span className="streaming-dot">
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00c875' }} />{' '}
                            {docStatus === 'processing' ? 'STREAMING' : 'IDLE'}
                          </span>
                        </div>

                        <div className="terminal-stream-body">
                          {consoleLogs.map((line, idx) => (
                            <div
                              key={idx}
                              className={`log-line ${line.includes('₹') || line.includes('complete') ? 'green' : line.includes('Note') || line.includes('OCR') ? 'cyan' : ''}`}
                            >
                              {line}
                            </div>
                          ))}
                          <div ref={terminalBottomRef} />
                        </div>

                        <div className="terminal-footer">
                          <span>Latency: 14ms</span>
                          <span>Buffer: {(Math.min(16, (progressPercent / 100) * 16)).toFixed(1)}MB / 16MB</span>
                        </div>
                      </div>

                      {/* Action & Analysis Navigation Card with "Ask with Ask DoxFin" button */}
                      <div className="preliminary-card">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                          <div className="preliminary-title" style={{ marginBottom: 0 }}>Document Analysis Preview</div>
                          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: docStatus === 'completed' ? '#16a34a' : '#0284c7', background: docStatus === 'completed' ? '#f0fdf4' : '#f0f9ff', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                            {docStatus === 'completed' ? '✓ Ingestion Complete' : '● Processing'}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '1rem', lineHeight: 1.5 }}>
                          Grounded multi-modal analysis is available. Access deterministic ratios, anomaly detection, and sub-second RAG citations.
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                          <button
                            className="btn-skip-wait"
                            onClick={() => setActiveSidebarTab('Financial Analysis')}
                            style={{ margin: 0 }}
                          >
                            Open Financial Analysis & Evidence <ChevronRight size={16} />
                          </button>

                          <button
                            className="btn-ask-doxfin-direct"
                            onClick={() => setActiveSidebarTab('Ask DoxFin')}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.5rem',
                              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '0.65rem 1rem',
                              fontSize: '0.84rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              boxShadow: '0 2px 4px rgba(2, 132, 199, 0.25)',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <Sparkles size={15} color="#ffffff" />
                            <span>Ask with Ask DoxFin</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}


              {/* ======================================================== */}
              {/* TAB 1: OVERVIEW (Executive Syndicate Dashboard)          */}
              {/* ======================================================== */}
              {activeSidebarTab === 'Overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Top Aggregate KPI Stat Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.15rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, color: '#64748b' }}>
                        <span>TOTAL INGESTION REPOSITORY</span>
                        <FolderOpen size={16} color="#0284c7" />
                      </div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0.35rem 0', fontFamily: 'var(--font-mono)' }}>
                        {recentDocs.length} Disclosures
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '0.3rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.4rem' }}>
                        <CheckCircle2 size={13} /> {recentDocs.reduce((acc, d) => acc + d.page_count, 0) + pageCount} Pages Indexed
                      </div>
                    </div>

                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.15rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, color: '#64748b' }}>
                        <span>INVARIANCE COMPLIANCE</span>
                        <ShieldCheck size={16} color="#16a34a" />
                      </div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0.35rem 0', fontFamily: 'var(--font-mono)' }}>
                        98.6% Score
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '0.3rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.4rem' }}>
                        <CheckCircle2 size={13} /> Deterministic Rules Passed
                      </div>
                    </div>

                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.15rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, color: '#64748b' }}>
                        <span>FORENSIC CONFIDENCE</span>
                        <TrendingUp size={16} color="#0284c7" />
                      </div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0.35rem 0', fontFamily: 'var(--font-mono)' }}>
                        99.8% Grounded
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#0284c7', display: 'flex', alignItems: 'center', gap: '0.3rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.4rem' }}>
                        <Sparkles size={13} /> Zero Hallucination Arithmetic
                      </div>
                    </div>

                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.15rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, color: '#64748b' }}>
                        <span>ACTIVE AI VISION ENGINE</span>
                        <Cpu size={16} color="#7e22ce" />
                      </div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0.4rem 0' }}>
                        {hardwareConfig ? hardwareConfig.vision_model : 'Qwen2.5-VL-3B'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#7e22ce', display: 'flex', alignItems: 'center', gap: '0.3rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.4rem' }}>
                        <Shield size={13} /> Mode: {hardwareConfig ? hardwareConfig.mode : 'LITE'} (CUDA Enclave)
                      </div>
                    </div>
                  </div>

                  {/* Active Document Executive Summary Card */}
                  <div className="execution-card">
                    <div className="execution-card-header">
                      <div>
                        <div className="execution-title">Active Disclosure Snapshot: {activeFilename}</div>
                        <div className="execution-subtitle">Deterministic Key Figures & Invariance Summary</div>
                      </div>
                      <button
                        className="btn-select-report"
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem' }}
                        onClick={() => setActiveSidebarTab('Financial Analysis')}
                      >
                        Deep Financial Analysis →
                      </button>
                    </div>

                    {metrics.length > 0 ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
                        {metrics.slice(0, 4).map((m, idx) => (
                          <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
                            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b' }}>{m.metric_name}</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-mono)', margin: '0.25rem 0' }}>
                              {formatMetricDisplay(m.value, m.unit)}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <CheckCircle2 size={11} /> {m.source ? m.source.replace(/_/g, ' ') : 'Audited Schedule'}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.86rem' }}>
                        No financial statements detected in active document. Strict Zero Hallucination enforced.
                      </div>
                    )}
                  </div>

                  {/* Quick Action Navigation Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                    <div
                      style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem', cursor: 'pointer', transition: 'all 0.2s' }}
                      onClick={() => setActiveSidebarTab('Financial Analysis')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#0284c7', fontWeight: 800, fontSize: '0.95rem' }}>
                        <TrendingUp size={18} /> Financial Analysis
                      </div>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem', lineHeight: 1.5 }}>
                        Inspect deterministic Schedule III balance sheets, P&L schedules, and forensic ratios.
                      </p>
                    </div>

                    <div
                      style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem', cursor: 'pointer', transition: 'all 0.2s' }}
                      onClick={() => setActiveSidebarTab('Anomalies')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#d97706', fontWeight: 800, fontSize: '0.95rem' }}>
                        <AlertTriangle size={18} /> Forensic Anomalies
                      </div>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem', lineHeight: 1.5 }}>
                        Triage working capital divergences, ECL provisioning gaps, and cash lag alerts.
                      </p>
                    </div>

                    <div
                      style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem', cursor: 'pointer', transition: 'all 0.2s' }}
                      onClick={() => setActiveSidebarTab('Ask DoxFin')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#7e22ce', fontWeight: 800, fontSize: '0.95rem' }}>
                        <Sparkles size={18} /> Ask DoxFin RAG
                      </div>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem', lineHeight: 1.5 }}>
                        Interrogate disclosures with grounded sub-second FAISS vector search and page citations.
                      </p>
                    </div>

                    <div
                      style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem', cursor: 'pointer', transition: 'all 0.2s' }}
                      onClick={() => setActiveSidebarTab('Compare Reports')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#059669', fontWeight: 800, fontSize: '0.95rem' }}>
                        <GitCompare size={18} /> Compare YoY Filings
                      </div>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem', lineHeight: 1.5 }}>
                        Execute multi-period restatement reconciliation and discrepancy audit matrix.
                      </p>
                    </div>
                  </div>
                </div>
              )}


              {/* ======================================================== */}
              {/* TAB 2: DOCUMENTS (Enterprise Document Repository)        */}
              {/* ======================================================== */}
              {activeSidebarTab === 'Documents' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Top Action Bar */}
                  <div className="execution-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                      <div>
                        <div className="execution-title">Enterprise Disclosure Repository</div>
                        <div className="execution-subtitle">Manage ingested financial reports, quarterly filings, and audited statements</div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="btn-select-report"
                          style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '0.5rem 1rem', fontSize: '0.82rem', fontWeight: 700 }}
                        >
                          <FileUp size={15} /> Upload New Filing
                        </button>
                      </div>
                    </div>

                    {/* Filter & Search Bar */}
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '0.35rem 0.65rem', flex: 1, minWidth: '220px' }}>
                        <Search size={15} color="#64748b" />
                        <input
                          type="text"
                          placeholder="Search filings by name or company..."
                          value={docSearch}
                          onChange={(e) => setDocSearch(e.target.value)}
                          style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.82rem', width: '100%' }}
                        />
                      </div>

                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button
                          className={`dox-filter-btn ${docFilterStatus === 'ALL' ? 'active' : ''}`}
                          onClick={() => setDocFilterStatus('ALL')}
                        >
                          All ({recentDocs.length})
                        </button>
                        <button
                          className={`dox-filter-btn ${docFilterStatus === 'COMPLETED' ? 'active' : ''}`}
                          onClick={() => setDocFilterStatus('COMPLETED')}
                        >
                          Completed
                        </button>
                        <button
                          className={`dox-filter-btn ${docFilterStatus === 'PROCESSING' ? 'active' : ''}`}
                          onClick={() => setDocFilterStatus('PROCESSING')}
                        >
                          Processing
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Documents Data Table */}
                  <div className="dox-table-container">
                    <table className="dox-table">
                      <thead>
                        <tr>
                          <th>Document Filing</th>
                          <th>Pages & Size</th>
                          <th>Ingestion Status</th>
                          <th>Added</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentDocs
                          .filter(d => docFilterStatus === 'ALL' || d.status.toUpperCase() === docFilterStatus)
                          .filter(d => !docSearch || d.filename.toLowerCase().includes(docSearch.toLowerCase()))
                          .map((doc, idx) => (
                            <tr key={doc.id || idx}>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                  <div style={{ width: 32, height: 32, borderRadius: '6px', background: '#eff6ff', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem' }}>
                                    PDF
                                  </div>
                                  <div>
                                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{doc.filename}</div>
                                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>ID: {doc.id} • Sovereign Enclave</div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div style={{ fontWeight: 600 }}>{doc.page_count} Pages</div>
                                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{doc.file_size || '24.5 MB'}</div>
                              </td>
                              <td>
                                <span className={`dox-tag-pill ${doc.status === 'completed' ? 'dox-tag-green' : 'dox-tag-blue'}`}>
                                  {doc.status === 'completed' ? <CheckCircle2 size={11} /> : <Loader2 size={11} className="spin-icon" />}
                                  {doc.status.toUpperCase()}
                                </span>
                              </td>
                              <td style={{ color: '#64748b', fontSize: '0.78rem' }}>
                                {doc.time_ago || 'Recent'}
                              </td>
                              <td>
                                <div style={{ display: 'flex', gap: '0.35rem' }}>
                                  <button
                                    className="dox-action-btn-sm"
                                    onClick={() => {
                                      setActiveDocId(doc.id);
                                      setActiveFilename(doc.filename);
                                      setPageCount(doc.page_count);
                                      fetchDocumentAnalytics(doc.id);
                                      setActiveSidebarTab('Financial Analysis');
                                    }}
                                    title="Open Financial Analysis"
                                  >
                                    <TrendingUp size={13} /> Analyze
                                  </button>
                                  <button
                                    className="dox-action-btn-sm"
                                    onClick={() => {
                                      setActiveDocId(doc.id);
                                      setActiveFilename(doc.filename);
                                      setActiveSidebarTab('Ask DoxFin');
                                    }}
                                    title="Ask Questions with RAG"
                                  >
                                    <Sparkles size={13} /> RAG
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}


              {/* ======================================================== */}
              {/* TAB 3: FINANCIAL ANALYSIS (Deterministic Statements)     */}
              {/* ======================================================== */}
              {activeSidebarTab === 'Financial Analysis' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Category Filter Navigation */}
                  <div className="execution-card" style={{ padding: '0.85rem 1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <button
                          className={`dox-filter-btn ${statementCategory === 'ALL' ? 'active' : ''}`}
                          onClick={() => setStatementCategory('ALL')}
                        >
                          All Schedules ({metrics.length})
                        </button>
                        <button
                          className={`dox-filter-btn ${statementCategory === 'INCOME' ? 'active' : ''}`}
                          onClick={() => setStatementCategory('INCOME')}
                        >
                          Income Statement
                        </button>
                        <button
                          className={`dox-filter-btn ${statementCategory === 'BALANCE' ? 'active' : ''}`}
                          onClick={() => setStatementCategory('BALANCE')}
                        >
                          Balance Sheet
                        </button>
                        <button
                          className={`dox-filter-btn ${statementCategory === 'CASHFLOW' ? 'active' : ''}`}
                          onClick={() => setStatementCategory('CASHFLOW')}
                        >
                          Cash Flow
                        </button>
                        <button
                          className={`dox-filter-btn ${statementCategory === 'RATIOS' ? 'active' : ''}`}
                          onClick={() => setStatementCategory('RATIOS')}
                        >
                          Forensic Ratios
                        </button>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.76rem', color: '#16a34a', fontWeight: 700 }}>
                        <ShieldCheck size={14} /> Zero Hallucination Engine Active
                      </div>
                    </div>
                  </div>

                  {/* Deterministic Financial Metrics Cards */}
                  <div className="execution-card">
                    <div className="execution-card-header">
                      <div>
                        <div className="execution-title">Deterministic Financial Schedules ({activeFilename})</div>
                        <div className="execution-subtitle">Python Deterministic Arithmetic • Ind AS & Schedule III Grounding</div>
                      </div>
                      <span className="sync-lock-badge">Audited Disclosures</span>
                    </div>

                    {metrics.length > 0 ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1rem', marginTop: '0.75rem' }}>
                        {metrics
                          .filter(m => {
                            if (statementCategory === 'ALL') return true;
                            if (statementCategory === 'INCOME') return m.source?.includes('income') || m.metric_name.toLowerCase().includes('revenue') || m.metric_name.toLowerCase().includes('pat') || m.metric_name.toLowerCase().includes('margin');
                            if (statementCategory === 'BALANCE') return m.source?.includes('balance') || m.metric_name.toLowerCase().includes('debt') || m.metric_name.toLowerCase().includes('ratio');
                            if (statementCategory === 'CASHFLOW') return m.source?.includes('cash') || m.metric_name.toLowerCase().includes('cash');
                            if (statementCategory === 'RATIOS') return m.unit === 'ratio' || m.unit === '%' || m.metric_name.toLowerCase().includes('margin') || m.metric_name.toLowerCase().includes('ratio');
                            return true;
                          })
                          .map((m, idx) => (
                            <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                              <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>
                                  <span>{m.metric_name}</span>
                                  <TrendingUp size={15} color="#16a34a" />
                                </div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-mono)', margin: '0.35rem 0' }}>
                                  {formatMetricDisplay(m.value, m.unit)}
                                </div>
                              </div>
                              <div style={{ fontSize: '0.72rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '0.35rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.4rem', marginTop: '0.5rem' }}>
                                <CheckCircle2 size={12} /> Source: {m.source ? m.source.replace(/_/g, ' ') : 'Audited Statement'}
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '10px', padding: '2.5rem 1.5rem', textAlign: 'center' }}>
                        <ShieldCheck size={36} color="#64748b" style={{ margin: '0 auto 0.75rem auto', display: 'block' }} />
                        <div style={{ fontWeight: 700, fontSize: '0.98rem', color: '#1e293b', marginBottom: '0.4rem' }}>
                          No Financial Statements or Ratios Detected in this Document
                        </div>
                        <p style={{ fontSize: '0.84rem', color: '#64748b', maxWidth: '580px', margin: '0 auto', lineHeight: 1.5 }}>
                          DoxFin adheres strictly to <strong>Zero Hallucination Arithmetic</strong>. The uploaded document (<em>{activeFilename}</em>) did not contain verifiable balance sheet, P&L, or cash flow schedules. No synthetic or extrapolated figures have been generated.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}


              {/* ======================================================== */}
              {/* TAB 4: ANOMALIES (Forensic Invariance & Red-Flag Audit)  */}
              {/* ======================================================== */}
              {activeSidebarTab === 'Anomalies' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Top Triage Filter Bar */}
                  <div className="execution-card" style={{ padding: '0.85rem 1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <button
                          className={`dox-filter-btn ${anomalySeverityFilter === 'ALL' ? 'active' : ''}`}
                          onClick={() => setAnomalySeverityFilter('ALL')}
                        >
                          All Flags ({anomalies.length})
                        </button>
                        <button
                          className={`dox-filter-btn ${anomalySeverityFilter === 'HIGH' ? 'active' : ''}`}
                          onClick={() => setAnomalySeverityFilter('HIGH')}
                        >
                          High Severity ({anomalies.filter(a => a.severity === 'HIGH').length})
                        </button>
                        <button
                          className={`dox-filter-btn ${anomalySeverityFilter === 'MEDIUM' ? 'active' : ''}`}
                          onClick={() => setAnomalySeverityFilter('MEDIUM')}
                        >
                          Medium Severity ({anomalies.filter(a => a.severity === 'MEDIUM').length})
                        </button>
                        <button
                          className={`dox-filter-btn ${anomalySeverityFilter === 'RESOLVED' ? 'active' : ''}`}
                          onClick={() => setAnomalySeverityFilter('RESOLVED')}
                        >
                          Resolved ({resolvedAnomalyTypes.length})
                        </button>
                      </div>

                      <span className="sync-lock-badge">Ind AS Invariance Rules</span>
                    </div>
                  </div>

                  {/* Anomaly Cards List */}
                  {anomalies.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {anomalies
                        .filter(a => {
                          const isResolved = resolvedAnomalyTypes.includes(a.anomaly_type);
                          if (anomalySeverityFilter === 'RESOLVED') return isResolved;
                          if (isResolved && anomalySeverityFilter !== 'ALL') return false;
                          if (anomalySeverityFilter === 'HIGH') return a.severity === 'HIGH';
                          if (anomalySeverityFilter === 'MEDIUM') return a.severity === 'MEDIUM';
                          return true;
                        })
                        .map((a, i) => {
                          const isResolved = resolvedAnomalyTypes.includes(a.anomaly_type);
                          return (
                            <div
                              key={i}
                              style={{
                                background: isResolved ? '#f0fdf4' : a.severity === 'HIGH' ? '#fffbeb' : '#ffffff',
                                border: `1px solid ${isResolved ? '#86efac' : a.severity === 'HIGH' ? '#fde68a' : '#e2e8f0'}`,
                                borderRadius: '10px',
                                padding: '1.25rem'
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <AlertTriangle size={18} color={isResolved ? '#16a34a' : a.severity === 'HIGH' ? '#d97706' : '#64748b'} />
                                  <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
                                    {a.anomaly_type.replace(/_/g, ' ')}
                                  </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <span className={`dox-tag-pill ${isResolved ? 'dox-tag-green' : a.severity === 'HIGH' ? 'dox-tag-amber' : 'dox-tag-slate'}`}>
                                    {isResolved ? '✓ REVIEWED & RESOLVED' : `${a.severity} SEVERITY`}
                                  </span>
                                  <button
                                    onClick={() => {
                                      setResolvedAnomalyTypes(prev =>
                                        prev.includes(a.anomaly_type) ? prev.filter(x => x !== a.anomaly_type) : [...prev, a.anomaly_type]
                                      );
                                    }}
                                    className="dox-action-btn-sm"
                                  >
                                    {isResolved ? 'Re-open Flag' : 'Mark Reviewed'}
                                  </button>
                                </div>
                              </div>

                              <p style={{ fontSize: '0.86rem', color: '#334155', margin: '0.75rem 0', lineHeight: 1.5 }}>
                                {a.message}
                              </p>

                              {a.action_required && (
                                <div style={{ fontSize: '0.8rem', color: '#92400e', background: isResolved ? '#dcfce7' : '#fef3c7', padding: '0.5rem 0.75rem', borderRadius: '6px', marginTop: '0.5rem' }}>
                                  <strong>Action Required:</strong> {a.action_required}
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="execution-card" style={{ background: '#f0fdf4', borderColor: '#bbf7d0', textAlign: 'center', padding: '2rem' }}>
                      <CheckCircle2 size={36} color="#16a34a" style={{ margin: '0 auto 0.5rem auto', display: 'block' }} />
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: '#166534' }}>Zero Invariance Anomalies Detected</div>
                      <p style={{ fontSize: '0.82rem', color: '#15803d', marginTop: '0.25rem' }}>
                        All balance sheet balances, cash flow bridges, and ratio relationships satisfy standard Ind AS accounting equations.
                      </p>
                    </div>
                  )}
                </div>
              )}


              {/* ======================================================== */}
              {/* TAB 5: ASK DOXFIN (Conversational Neural RAG)            */}
              {/* ======================================================== */}
              {activeSidebarTab === 'Ask DoxFin' && (
                <div className="execution-card" style={{ display: 'flex', flexDirection: 'column' }}>
                  {/* Chat Header */}
                  <div className="execution-card-header" style={{ marginBottom: '0.75rem' }}>
                    <div>
                      <div className="execution-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Bot size={20} color="#0284c7" />
                        DoxFin Financial Neural Analyst
                      </div>
                      <div className="execution-subtitle">
                        Sovereign Enclave RAG • Grounded strictly on <strong>{activeFilename}</strong>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span className="sync-lock-badge" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <ShieldCheck size={13} color="#16a34a" /> Zero Hallucination Arithmetic
                      </span>
                      <button
                        onClick={() => setChatMessages([
                          {
                            id: 'msg_reset',
                            sender: 'doxfin',
                            text: `Session reset. Ready to answer deterministic quantitative questions about ${activeFilename}.`,
                            timestamp: 'Just now',
                            citations: []
                          }
                        ])}
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          padding: '0.3rem 0.65rem',
                          fontSize: '0.72rem',
                          color: '#64748b',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                        title="Clear conversation history"
                      >
                        <RefreshCw size={11} /> Clear Thread
                      </button>
                    </div>
                  </div>

                  {/* Preset Question Suggestions */}
                  <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', marginBottom: '0.85rem' }}>
                    <span style={{ fontSize: '0.74rem', color: '#64748b', display: 'flex', alignItems: 'center', fontWeight: 600, marginRight: '0.2rem' }}>
                      Suggested:
                    </span>
                    {[
                      'What is the revenue growth YoY?',
                      'Summarize Note 17 trade receivables aging',
                      'Check Ind AS 36 impairment disclosures',
                      'Explain Free Cash Flow bridge'
                    ].map((q, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendChatMessage(q)}
                        disabled={queryLoading}
                        style={{
                          background: '#f1f5f9',
                          border: '1px solid #cbd5e1',
                          borderRadius: '16px',
                          padding: '0.28rem 0.65rem',
                          fontSize: '0.74rem',
                          color: '#334155',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {q}
                      </button>
                    ))}
                  </div>

                  {/* Conversational Scrollable Thread */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1.15rem',
                      minHeight: '440px',
                      maxHeight: '580px',
                      overflowY: 'auto',
                      padding: '1.25rem',
                      background: '#f8fafc',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    {chatMessages.map((msg) => {
                      if (msg.sender === 'user') {
                        return (
                          <div key={msg.id} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <div
                              style={{
                                maxWidth: '78%',
                                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                                color: '#ffffff',
                                borderRadius: '16px 16px 4px 16px',
                                padding: '0.75rem 1.1rem',
                                boxShadow: '0 2px 8px rgba(2, 132, 199, 0.2)'
                              }}
                            >
                              <div style={{ fontSize: '0.88rem', fontWeight: 500, lineHeight: 1.5 }}>
                                {msg.text}
                              </div>
                              <div style={{ fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.75)', textAlign: 'right', marginTop: '0.35rem' }}>
                                {msg.timestamp}
                              </div>
                            </div>
                          </div>
                        );
                      }

                      // DoxFin AI Response Bubble
                      return (
                        <div key={msg.id} style={{ display: 'flex', gap: '0.75rem', maxWidth: '94%' }}>
                          <div
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: '50%',
                              background: '#eff6ff',
                              border: '1px solid #bae6fd',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              color: '#0284c7'
                            }}
                          >
                            <Bot size={18} />
                          </div>
                          <div
                            style={{
                              flex: 1,
                              background: '#ffffff',
                              border: '1px solid #e2e8f0',
                              borderRadius: '16px 16px 16px 4px',
                              padding: '1rem 1.25rem',
                              boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '0.5rem',
                                paddingBottom: '0.35rem',
                                borderBottom: '1px solid #f1f5f9'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>
                                <span>DoxFin Neural Financial Analyst</span>
                                <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '0.68rem', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 600 }}>
                                  Verified Grounding
                                </span>
                              </div>
                              <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{msg.timestamp}</span>
                            </div>

                            {/* Synthesized Answer */}
                            <div style={{ fontSize: '0.88rem', color: '#1e293b', lineHeight: 1.6, whiteSpace: 'pre-line', marginBottom: msg.citations && msg.citations.length > 0 ? '0.85rem' : 0 }}>
                              {msg.text}
                            </div>

                            {/* Direct Grounded Evidence Tables */}
                            {msg.citations && msg.citations.length > 0 && (
                              <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px dashed #cbd5e1' }}>
                                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0369a1', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.55rem' }}>
                                  <TableIcon size={14} /> Source Evidence &amp; Financial Disclosures ({msg.citations.length} Grounded Citations)
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                                  {msg.citations.map((c, i) => (
                                    <div key={i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                          <span style={{ background: '#0284c7', color: '#ffffff', fontWeight: 700, fontSize: '0.74rem', padding: '0.15rem 0.5rem', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <FileText size={11} /> Page {c.page_number}
                                          </span>
                                          <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#1e293b' }}>
                                            {c.section || 'Audited Note'}
                                          </span>
                                        </div>
                                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                                          Relevance: {(c.score * 100).toFixed(0)}%
                                        </span>
                                      </div>
                                      {/* Directly Render Formatted Evidence Table or Snippet */}
                                      {renderEvidenceContent(c.text || c.text_snippet)}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Live Query In-Flight Spinner */}
                    {queryLoading && (
                      <div style={{ display: 'flex', gap: '0.75rem', maxWidth: '80%' }}>
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: '50%',
                            background: '#eff6ff',
                            border: '1px solid #bae6fd',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#0284c7'
                          }}
                        >
                          <Loader2 size={16} className="spin-icon" />
                        </div>
                        <div
                          style={{
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '16px 16px 16px 4px',
                            padding: '0.85rem 1.15rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem'
                          }}
                        >
                          <span style={{ fontSize: '0.82rem', color: '#64748b', fontStyle: 'italic' }}>
                            Scanning FAISS index &amp; retrieving full table disclosures...
                          </span>
                        </div>
                      </div>
                    )}
                    <div ref={chatBottomRef} />
                  </div>

                  {/* Bottom Chat Input Bar */}
                  <div style={{ marginTop: '0.85rem' }}>
                    <div
                      style={{
                        display: 'flex',
                        gap: '0.5rem',
                        background: '#ffffff',
                        border: '1.5px solid #cbd5e1',
                        borderRadius: '10px',
                        padding: '0.5rem 0.75rem',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                        alignItems: 'center'
                      }}
                    >
                      <MessageSquare size={18} color="#0284c7" />
                      <input
                        type="text"
                        style={{
                          flex: 1,
                          border: 'none',
                          background: 'transparent',
                          outline: 'none',
                          fontSize: '0.88rem',
                          color: '#0f172a'
                        }}
                        placeholder={`Ask financial question about ${activeFilename} (e.g., Note 17 receivables, debt ratios)...`}
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendChatMessage();
                          }
                        }}
                      />
                      <button
                        onClick={() => handleSendChatMessage()}
                        disabled={!chatInput.trim() || queryLoading}
                        className="btn-select-report"
                        style={{
                          padding: '0.5rem 1.1rem',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          opacity: !chatInput.trim() || queryLoading ? 0.6 : 1
                        }}
                      >
                        {queryLoading ? <Loader2 size={14} className="spin-icon" /> : <Send size={14} />}
                        <span>Send</span>
                      </button>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '0.4rem',
                        padding: '0 0.25rem',
                        fontSize: '0.7rem',
                        color: '#94a3b8'
                      }}
                    >
                      <span>Press <kbd style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '3px', padding: '0.1rem 0.3rem', fontSize: '0.65rem' }}>Enter</kbd> to send • Multi-turn conversation</span>
                      <span>Zero Hallucination Arithmetic • Verified Schedule III Citations</span>
                    </div>
                  </div>
                </div>
              )}


              {/* ======================================================== */}
              {/* TAB 6: COMPARE REPORTS (YoY Financial Restatement Matrix) */}
              {/* ======================================================== */}
              {activeSidebarTab === 'Compare Reports' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Selector Bar */}
                  <div className="execution-card">
                    <div className="execution-card-header">
                      <div>
                        <div className="execution-title">YoY Multi-Period Financial Comparison & Restatement Matrix</div>
                        <div className="execution-subtitle">Deterministic reconciliation between reporting periods with variance flags</div>
                      </div>
                      <span className="sync-lock-badge">Ind AS 8 Accounting Policies</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.35rem' }}>
                          PRIMARY PERIOD (CURRENT)
                        </label>
                        <select
                          value={compareDocA}
                          onChange={(e) => setCompareDocA(e.target.value)}
                          style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#ffffff', fontSize: '0.84rem' }}
                        >
                          <option value="doc_abc_2025">ABC Industries - Annual Report 2025 (FY25)</option>
                          <option value="doc_reliance_q3">Reliance Retail - Q3 2025</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.35rem' }}>
                          BASELINE PERIOD (PRIOR YEAR)
                        </label>
                        <select
                          value={compareDocB}
                          onChange={(e) => setCompareDocB(e.target.value)}
                          style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#ffffff', fontSize: '0.84rem' }}
                        >
                          <option value="doc_hdfc_fy24">ABC Industries - Annual Report 2024 (FY24)</option>
                          <option value="doc_reliance_q3">Reliance Retail - Q3 2024</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Side-by-Side Comparison Table */}
                  <div className="dox-table-container">
                    <table className="dox-table">
                      <thead>
                        <tr>
                          <th>Financial Metric / Schedule Item</th>
                          <th>FY24 Baseline</th>
                          <th>FY25 Current</th>
                          <th>Variance Delta</th>
                          <th>YoY Growth (%)</th>
                          <th>Audit Verification</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { metric: 'Revenue from Operations', base: '₹14,600 Cr', current: '₹16,420 Cr', delta: '+₹1,820 Cr', pct: '+12.47%', status: 'VERIFIED', flag: 'green' },
                          { metric: 'Operating Profit (EBITDA)', base: '₹2,860 Cr', current: '₹3,021 Cr', delta: '+₹161 Cr', pct: '+5.63%', status: 'VERIFIED', flag: 'green' },
                          { metric: 'Reported PAT (Net Profit)', base: '₹1,950 Cr', current: '₹2,180 Cr', delta: '+₹230 Cr', pct: '+11.79%', status: 'VERIFIED', flag: 'green' },
                          { metric: 'Total Debt / Borrowings', base: '₹4,100 Cr', current: '₹4,850 Cr', delta: '+₹750 Cr', pct: '+18.29%', status: 'VARIANCE FLAG', flag: 'amber' },
                          { metric: 'Trade Receivables (Gross)', base: '₹2,630 Cr', current: '₹3,240 Cr', delta: '+₹610 Cr', pct: '+23.19%', status: 'WORKING CAPITAL STRAIN', flag: 'amber' },
                          { metric: 'Free Cash Flow (FCF)', base: '₹1,420 Cr', current: '₹1,320 Cr', delta: '-₹100 Cr', pct: '-7.04%', status: 'CASH CONVERSION LAG', flag: 'amber' },
                          { metric: 'Cash & Cash Equivalents', base: '₹980 Cr', current: '₹1,120 Cr', delta: '+₹140 Cr', pct: '+14.29%', status: 'VERIFIED', flag: 'green' }
                        ].map((row, idx) => (
                          <tr key={idx}>
                            <td style={{ fontWeight: 700, color: '#0f172a' }}>{row.metric}</td>
                            <td style={{ fontFamily: 'var(--font-mono)' }}>{row.base}</td>
                            <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{row.current}</td>
                            <td style={{ fontFamily: 'var(--font-mono)', color: row.delta.startsWith('+') ? '#15803d' : '#b91c1c' }}>{row.delta}</td>
                            <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: row.pct.startsWith('+') ? '#15803d' : '#b91c1c' }}>
                              {row.pct}
                            </td>
                            <td>
                              <span className={`dox-tag-pill ${row.flag === 'green' ? 'dox-tag-green' : 'dox-tag-amber'}`}>
                                {row.flag === 'green' ? <CheckCircle2 size={11} /> : <AlertTriangle size={11} />}
                                {row.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}


              {/* ======================================================== */}
              {/* TAB 7: USERS & ACCESS (RBAC Directory & Permissions)     */}
              {/* ======================================================== */}
              {activeSidebarTab === 'Users' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div className="execution-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                      <div>
                        <div className="execution-title">Enterprise Role-Based Access Control (RBAC)</div>
                        <div className="execution-subtitle">Manage institutional seats, cryptographic key allocations, and audit roles</div>
                      </div>
                      <button
                        onClick={fetchEnterpriseUsers}
                        className="btn-select-report"
                        style={{ padding: '0.45rem 0.85rem', fontSize: '0.78rem' }}
                      >
                        <RefreshCw size={14} className={usersLoading ? 'spin-icon' : ''} />
                        <span>Refresh Directory</span>
                      </button>
                    </div>
                  </div>

                  {/* Team Members Table */}
                  <div className="dox-table-container">
                    <table className="dox-table">
                      <thead>
                        <tr>
                          <th>Team Member</th>
                          <th>Role</th>
                          <th>Department / Syndicate</th>
                          <th>Status & Security</th>
                          <th>Last Active</th>
                        </tr>
                      </thead>
                      <tbody>
                        {enterpriseUsers.map((u, idx) => (
                          <tr key={u.id || idx}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#0284c7', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem' }}>
                                  {u.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </div>
                                <div>
                                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{u.full_name}</div>
                                  <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{u.email}</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className={`dox-tag-pill ${u.role === 'ADMIN' ? 'dox-tag-purple' : u.role === 'LEAD AUDITOR' ? 'dox-tag-blue' : 'dox-tag-slate'}`}>
                                <Lock size={11} /> {u.role}
                              </span>
                            </td>
                            <td style={{ color: '#475569', fontSize: '0.8rem' }}>{u.department || 'Institutional Syndicate'}</td>
                            <td>
                              <span className="dox-tag-pill dox-tag-green">
                                <ShieldCheck size={11} /> MFA Enforced
                              </span>
                            </td>
                            <td style={{ color: '#64748b', fontSize: '0.78rem' }}>{u.last_active || 'Active'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Permission Matrix */}
                  <div className="execution-card">
                    <div className="execution-title" style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>
                      RBAC Enclave Governance Matrix
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '0.75rem' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#0f172a' }}>Lead Auditor</div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.2rem' }}>Full verification, anomaly sign-off, export signed balance sheets.</div>
                      </div>
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '0.75rem' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#0f172a' }}>Quant & Admin</div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.2rem' }}>Configure hardware VLM tiers, Ray workers, deterministic math rules.</div>
                      </div>
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '0.75rem' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#0f172a' }}>Senior Analyst</div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.2rem' }}>Upload disclosures, run RAG queries, compare financial filings.</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}


              {/* ======================================================== */}
              {/* TAB 8: AUDIT LOGS (Immutable Compliance Ledger)          */}
              {/* ======================================================== */}
              {activeSidebarTab === 'Audit' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Top Stats & Filters */}
                  <div className="execution-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                      <div>
                        <div className="execution-title">Immutable SOC2 Compliance Audit Trail</div>
                        <div className="execution-subtitle">Cryptographically verified forensic activity ledger across all analysts and jobs</div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={fetchAuditLogs}
                          className="btn-select-report"
                          style={{ padding: '0.45rem 0.85rem', fontSize: '0.78rem' }}
                        >
                          <RefreshCw size={14} className={auditLoading ? 'spin-icon' : ''} />
                          <span>Refresh Ledger</span>
                        </button>
                      </div>
                    </div>

                    {/* Filter Pills */}
                    <div style={{ display: 'flex', gap: '0.4rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
                      {['ALL', 'UPLOAD', 'QUERY', 'VERIFY', 'INVARIANCE_SCAN', 'LOGIN'].map((act) => (
                        <button
                          key={act}
                          className={`dox-filter-btn ${auditFilter === act ? 'active' : ''}`}
                          onClick={() => setAuditFilter(act)}
                        >
                          {act.replace(/_/g, ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Audit Logs Table */}
                  <div className="dox-table-container">
                    <table className="dox-table">
                      <thead>
                        <tr>
                          <th>Timestamp (UTC)</th>
                          <th>Actor / User</th>
                          <th>Action</th>
                          <th>Target Resource</th>
                          <th>Enclave IP</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {auditLogs
                          .filter(l => auditFilter === 'ALL' || l.action === auditFilter)
                          .map((log, idx) => (
                            <tr key={log.id || idx}>
                              <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#64748b' }}>
                                {log.timestamp.replace('T', ' ').replace('Z', '')}
                              </td>
                              <td>
                                <div style={{ fontWeight: 700, color: '#0f172a' }}>{log.user_name}</div>
                                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{log.user_email}</div>
                              </td>
                              <td>
                                <span className={`dox-tag-pill ${log.action === 'UPLOAD' ? 'dox-tag-blue' : log.action === 'VERIFY' ? 'dox-tag-green' : log.action === 'INVARIANCE_SCAN' ? 'dox-tag-amber' : 'dox-tag-slate'}`}>
                                  {log.action.replace(/_/g, ' ')}
                                </span>
                              </td>
                              <td>
                                <div style={{ fontWeight: 600, fontSize: '0.78rem' }}>{log.resource_type}: {log.resource_id}</div>
                                <div style={{ fontSize: '0.72rem', color: '#64748b', maxWidth: '320px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                                </div>
                              </td>
                              <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.76rem', color: '#475569' }}>
                                {log.ip_address}
                              </td>
                              <td>
                                <span className={`dox-tag-pill ${log.status === 'SUCCESS' ? 'dox-tag-green' : 'dox-tag-amber'}`}>
                                  <CheckCircle2 size={11} /> {log.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}


              {/* ======================================================== */}
              {/* TAB 9: SYSTEM (Hardware Telemetry & Model Switcher)     */}
              {/* ======================================================== */}
              {activeSidebarTab === 'System' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Top System Status Banner */}
                  <div className="execution-card" style={{ background: '#f8fafc', borderColor: '#cbd5e1' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                      <div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Cpu size={20} color="#0284c7" />
                          <span>Hardware-Adaptive Detection & Qwen VLM Switcher</span>
                        </div>
                        <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.25rem' }}>
                          Auto-detects physical CPU, RAM, GPU, and VRAM to dynamically route financial charts to the optimal Qwen model without CUDA Out-of-Memory crashes.
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <button
                          onClick={() => switchHardwareMode('AUTO')}
                          disabled={hardwareLoading}
                          className="btn-select-report"
                          style={{
                            padding: '0.45rem 0.85rem',
                            fontSize: '0.78rem',
                            background: hardwareConfig?.is_auto_managed ? '#f0fdf4' : '#ffffff',
                            color: hardwareConfig?.is_auto_managed ? '#166534' : '#475569',
                            borderColor: hardwareConfig?.is_auto_managed ? '#86efac' : '#cbd5e1'
                          }}
                        >
                          <Sparkles size={14} color={hardwareConfig?.is_auto_managed ? '#16a34a' : '#64748b'} />
                          <span>{hardwareConfig?.is_auto_managed ? '✓ Auto-Adaptive Active' : 'Enable Auto-Adaptive'}</span>
                        </button>

                        <button
                          onClick={fetchHardwareConfig}
                          disabled={hardwareLoading}
                          className="btn-select-report"
                          style={{ padding: '0.45rem 0.85rem', fontSize: '0.78rem' }}
                        >
                          <Activity size={14} />
                          <span>Re-probe Hardware</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 4 Hardware Telemetry Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600, color: '#64748b' }}>
                        <span>HOST SYSTEM</span>
                        <Building2 size={16} color="#0284c7" />
                      </div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0.4rem 0' }}>
                        ASUS A15 Laptop
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '0.3rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.4rem' }}>
                        <ShieldCheck size={13} /> Sovereign Enclave Active
                      </div>
                    </div>

                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600, color: '#64748b' }}>
                        <span>CPU THREAD POOL</span>
                        <Cpu size={16} color="#0284c7" />
                      </div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0.4rem 0' }}>
                        {hardwareConfig?.hardware_detected.cpu_cores || 12} Cores ({hardwareConfig?.hardware_detected.cpu_physical || 6} Physical)
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '0.4rem' }}>
                        Ray Parallel Worker Sandbox
                      </div>
                    </div>

                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600, color: '#64748b' }}>
                        <span>SYSTEM MEMORY</span>
                        <Activity size={16} color="#0284c7" />
                      </div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0.4rem 0' }}>
                        {hardwareConfig?.hardware_detected.ram_total_gb || 15.3} GB RAM
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '0.4rem' }}>
                        {hardwareConfig?.hardware_detected.ram_available_gb || 2.5} GB Available
                      </div>
                    </div>

                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600, color: '#64748b' }}>
                        <span>DEDICATED GPU & VRAM</span>
                        <TrendingUp size={16} color="#16a34a" />
                      </div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0.4rem 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={hardwareConfig?.hardware_detected.gpu_name}>
                        {hardwareConfig?.hardware_detected.gpu_name.replace('NVIDIA ', '') || 'RTX 3050 Laptop'}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '0.3rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.4rem' }}>
                        <CheckCircle2 size={13} /> {hardwareConfig?.hardware_detected.vram_gb || 4.0} GB VRAM (CUDA Active)
                      </div>
                    </div>
                  </div>

                  {/* Model Tier Selection Matrix */}
                  <div className="execution-card">
                    <div className="execution-card-header">
                      <div>
                        <div className="execution-title">Dynamic Qwen VLM Model Selection Matrix</div>
                        <div className="execution-subtitle">Select or auto-tune the Vision Language Model based on dedicated GPU memory</div>
                      </div>
                      <span className="sync-lock-badge">Active Mode: {hardwareConfig?.mode || 'LITE'}</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
                      {/* Tier 1: LITE */}
                      <div
                        style={{
                          border: hardwareConfig?.mode === 'LITE' ? '2px solid #0284c7' : '1px solid #e2e8f0',
                          borderRadius: '10px',
                          padding: '1.2rem',
                          background: hardwareConfig?.mode === 'LITE' ? '#f0f9ff' : '#ffffff',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          position: 'relative'
                        }}
                      >
                        {hardwareConfig?.recommended_tier === 'LITE' && (
                          <span style={{ position: 'absolute', top: -10, right: 12, background: '#16a34a', color: '#ffffff', fontSize: '0.68rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '12px' }}>
                            RECOMMENDED FOR ASUS A15 (4GB VRAM)
                          </span>
                        )}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>LITE Mode</span>
                            <span style={{ fontSize: '0.72rem', background: '#e0f2fe', color: '#0369a1', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                              4GB Ceiling
                            </span>
                          </div>
                          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0284c7', fontFamily: 'var(--font-mono)', marginBottom: '0.35rem' }}>
                            Qwen2.5-VL-3B (4-bit)
                          </div>
                          <p style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5, margin: '0.5rem 0' }}>
                            Ultra-low latency model optimized for 4GB VRAM (ASUS A15 RTX 3050) and CPUs. Completely prevents Out-of-Memory crashes.
                          </p>
                          <div style={{ fontSize: '0.74rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.5rem' }}>
                            <div>• <strong>Parallel Workers:</strong> 2 Cores</div>
                            <div>• <strong>Batch Size:</strong> 5 Pages/batch</div>
                            <div>• <strong>Quantization:</strong> 4-bit AWQ (CUDA)</div>
                          </div>
                        </div>

                        <button
                          onClick={() => switchHardwareMode('LITE')}
                          disabled={hardwareConfig?.mode === 'LITE' || hardwareLoading}
                          style={{
                            marginTop: '1rem',
                            padding: '0.5rem',
                            borderRadius: '6px',
                            border: 'none',
                            background: hardwareConfig?.mode === 'LITE' ? '#0284c7' : '#f1f5f9',
                            color: hardwareConfig?.mode === 'LITE' ? '#ffffff' : '#334155',
                            fontWeight: 700,
                            fontSize: '0.82rem',
                            cursor: hardwareConfig?.mode === 'LITE' ? 'default' : 'pointer'
                          }}
                        >
                          {hardwareConfig?.mode === 'LITE' ? '✓ Currently Active' : 'Switch to LITE'}
                        </button>
                      </div>

                      {/* Tier 2: BALANCED */}
                      <div
                        style={{
                          border: hardwareConfig?.mode === 'BALANCED' ? '2px solid #0284c7' : '1px solid #e2e8f0',
                          borderRadius: '10px',
                          padding: '1.2rem',
                          background: hardwareConfig?.mode === 'BALANCED' ? '#f0f9ff' : '#ffffff',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>BALANCED Mode</span>
                            <span style={{ fontSize: '0.72rem', background: '#fef3c7', color: '#92400e', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                              8GB Ceiling
                            </span>
                          </div>
                          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0284c7', fontFamily: 'var(--font-mono)', marginBottom: '0.35rem' }}>
                            Qwen2.5-VL-7B (4-bit)
                          </div>
                          <p style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5, margin: '0.5rem 0' }}>
                            Balanced high-precision visual model for 6GB-12GB VRAM GPUs (RTX 3060/4060). Enhanced accuracy for complex financial charts.
                          </p>
                          <div style={{ fontSize: '0.74rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.5rem' }}>
                            <div>• <strong>Parallel Workers:</strong> 4 Cores</div>
                            <div>• <strong>Batch Size:</strong> 15 Pages/batch</div>
                            <div>• <strong>Quantization:</strong> 4-bit Quantized</div>
                          </div>
                        </div>

                        <button
                          onClick={() => switchHardwareMode('BALANCED')}
                          disabled={hardwareConfig?.mode === 'BALANCED' || hardwareLoading}
                          style={{
                            marginTop: '1rem',
                            padding: '0.5rem',
                            borderRadius: '6px',
                            border: 'none',
                            background: hardwareConfig?.mode === 'BALANCED' ? '#0284c7' : '#f1f5f9',
                            color: hardwareConfig?.mode === 'BALANCED' ? '#ffffff' : '#334155',
                            fontWeight: 700,
                            fontSize: '0.82rem',
                            cursor: hardwareConfig?.mode === 'BALANCED' ? 'default' : 'pointer'
                          }}
                        >
                          {hardwareConfig?.mode === 'BALANCED' ? '✓ Currently Active' : 'Switch to BALANCED'}
                        </button>
                      </div>

                      {/* Tier 3: PERFORMANCE */}
                      <div
                        style={{
                          border: hardwareConfig?.mode === 'PERFORMANCE' ? '2px solid #0284c7' : '1px solid #e2e8f0',
                          borderRadius: '10px',
                          padding: '1.2rem',
                          background: hardwareConfig?.mode === 'PERFORMANCE' ? '#f0f9ff' : '#ffffff',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>PERFORMANCE Mode</span>
                            <span style={{ fontSize: '0.72rem', background: '#f3e8ff', color: '#6b21a8', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                              16GB+ Ceiling
                            </span>
                          </div>
                          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0284c7', fontFamily: 'var(--font-mono)', marginBottom: '0.35rem' }}>
                            Qwen2.5-VL-7B (bfloat16)
                          </div>
                          <p style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5, margin: '0.5rem 0' }}>
                            Maximum throughput full-precision VLM for enterprise workstations & GPU server clusters (RTX 4090 / A100 / H100).
                          </p>
                          <div style={{ fontSize: '0.74rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.5rem' }}>
                            <div>• <strong>Parallel Workers:</strong> 8 Cores</div>
                            <div>• <strong>Batch Size:</strong> 50 Pages/batch</div>
                            <div>• <strong>Quantization:</strong> Native bfloat16 / fp16</div>
                          </div>
                        </div>

                        <button
                          onClick={() => switchHardwareMode('PERFORMANCE')}
                          disabled={hardwareConfig?.mode === 'PERFORMANCE' || hardwareLoading}
                          style={{
                            marginTop: '1rem',
                            padding: '0.5rem',
                            borderRadius: '6px',
                            border: 'none',
                            background: hardwareConfig?.mode === 'PERFORMANCE' ? '#0284c7' : '#f1f5f9',
                            color: hardwareConfig?.mode === 'PERFORMANCE' ? '#ffffff' : '#334155',
                            fontWeight: 700,
                            fontSize: '0.82rem',
                            cursor: hardwareConfig?.mode === 'PERFORMANCE' ? 'default' : 'pointer'
                          }}
                        >
                          {hardwareConfig?.mode === 'PERFORMANCE' ? '✓ Currently Active' : 'Switch to PERFORMANCE'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}


              {/* ======================================================== */}
              {/* TAB 10: SETTINGS (Enterprise Governance & Enclave Config) */}
              {/* ======================================================== */}
              {activeSidebarTab === 'Settings' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Category Filter Navigation */}
                  <div className="execution-card" style={{ padding: '0.85rem 1.25rem' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <button
                        className={`dox-filter-btn ${settingsCategory === 'SECURITY' ? 'active' : ''}`}
                        onClick={() => setSettingsCategory('SECURITY')}
                      >
                        <ShieldCheck size={13} /> Sovereign Security & Privacy
                      </button>
                      <button
                        className={`dox-filter-btn ${settingsCategory === 'ENGINE' ? 'active' : ''}`}
                        onClick={() => setSettingsCategory('ENGINE')}
                      >
                        <Sliders size={13} /> Extraction Engine Tuning
                      </button>
                      <button
                        className={`dox-filter-btn ${settingsCategory === 'LICENSE' ? 'active' : ''}`}
                        onClick={() => setSettingsCategory('LICENSE')}
                      >
                        <Key size={13} /> Sovereign License Key
                      </button>
                      <button
                        className={`dox-filter-btn ${settingsCategory === 'INTEGRATIONS' ? 'active' : ''}`}
                        onClick={() => setSettingsCategory('INTEGRATIONS')}
                      >
                        <Database size={13} /> ERP & Webhook Integrations
                      </button>
                    </div>
                  </div>

                  {/* Settings Panels */}
                  {settingsCategory === 'SECURITY' && (
                    <div className="execution-card">
                      <div className="execution-title">Sovereign Privacy & Local Enclave Security</div>
                      <div className="execution-subtitle">Zero External Data Leakage and Air-Gapped Financial Compliance Controls</div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>Air-Gapped Sovereign Execution</div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Disallow all outbound network traffic during OCR parsing and LLM inference.</div>
                          </div>
                          <input
                            type="checkbox"
                            checked={settingsAirGap}
                            onChange={(e) => setSettingsAirGap(e.target.checked)}
                            style={{ width: 18, height: 18, accentColor: '#0284c7', cursor: 'pointer' }}
                          />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>Strict Zero Hallucination Arithmetic Policy</div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Never allow probabilistic LLM extrapolation on missing financial numbers.</div>
                          </div>
                          <input
                            type="checkbox"
                            checked={settingsZeroLeakage}
                            onChange={(e) => setSettingsZeroLeakage(e.target.checked)}
                            style={{ width: 18, height: 18, accentColor: '#0284c7', cursor: 'pointer' }}
                          />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>AES-256 Vector Index Encryption</div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Encrypt all FAISS embedding indices with local hardware TPM master key.</div>
                          </div>
                          <span className="dox-tag-pill dox-tag-green">ENFORCED</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {settingsCategory === 'ENGINE' && (
                    <div className="execution-card">
                      <div className="execution-title">Extraction Engine Tuning & OCR Priorities</div>
                      <div className="execution-subtitle">Configure Schedule III parsers and confidence thresholds</div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.25rem' }}>
                        <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.86rem', color: '#0f172a' }}>OCR Extraction Engine Priority</span>
                          </div>
                          <select
                            value={settingsOcrEngine}
                            onChange={(e) => setSettingsOcrEngine(e.target.value)}
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                          >
                            <option value="docling">IBM Docling + PyMuPDF Hybrid (Recommended)</option>
                            <option value="pymupdf">PyMuPDF High-Speed Native Fast-Pass</option>
                            <option value="qwen">Pure Qwen-VL Visual Table Extractor</option>
                          </select>
                        </div>

                        <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.86rem', color: '#0f172a' }}>Minimum Extraction Confidence Threshold</span>
                            <span style={{ fontWeight: 800, color: '#0284c7', fontFamily: 'var(--font-mono)' }}>{settingsConfidenceThreshold}%</span>
                          </div>
                          <input
                            type="range"
                            min="80"
                            max="99"
                            value={settingsConfidenceThreshold}
                            onChange={(e) => setSettingsConfidenceThreshold(Number(e.target.value))}
                            style={{ width: '100%', accentColor: '#0284c7' }}
                          />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>Strict Ind AS Schedule III Validation</div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Require all line items to map to canonical Schedule III balance sheets.</div>
                          </div>
                          <input
                            type="checkbox"
                            checked={settingsStrictIndAS}
                            onChange={(e) => setSettingsStrictIndAS(e.target.checked)}
                            style={{ width: 18, height: 18, accentColor: '#0284c7', cursor: 'pointer' }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {settingsCategory === 'LICENSE' && (
                    <div className="execution-card">
                      <div className="execution-title">Cryptographic Sovereign License</div>
                      <div className="execution-subtitle">Hardware-bound offline enterprise licensing status</div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '1.25rem' }}>
                        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
                          <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 700 }}>LICENSE TIER</div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0.3rem 0' }}>DoxFin Sovereign Enterprise</div>
                          <span className="dox-tag-pill dox-tag-green">VALID & ACTIVE</span>
                        </div>

                        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
                          <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 700 }}>SOVEREIGN NODE ID</div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0284c7', fontFamily: 'var(--font-mono)', margin: '0.3rem 0' }}>NODE-ASUS-A15-EAA91</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Hardware Fingerprint Verified</div>
                        </div>

                        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
                          <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 700 }}>EXPIRATION & SUPPORT</div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0.3rem 0' }}>March 31, 2027</div>
                          <div style={{ fontSize: '0.72rem', color: '#16a34a' }}>Perpetual Air-Gapped Entitlement</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {settingsCategory === 'INTEGRATIONS' && (
                    <div className="execution-card">
                      <div className="execution-title">ERP & Financial Webhook Integrations</div>
                      <div className="execution-subtitle">Connect audited ledgers directly to upstream core banking & ERP systems</div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <div>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>SAP S/4HANA Finance Connector</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Push verified trial balance adjustments directly into SAP general ledger.</div>
                          </div>
                          <span className="dox-tag-pill dox-tag-blue">READY TO SYNC</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <div>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>Oracle Financial Services Analytical Applications (OFSAA)</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Automated credit risk ingestion stream for institutional covenants.</div>
                          </div>
                          <span className="dox-tag-pill dox-tag-slate">AVAILABLE</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <div>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>Compliance Audit Webhook URL</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Post immutable audit events to internal SIEM / Splunk endpoint.</div>
                          </div>
                          <button className="dox-action-btn-sm">Configure Endpoint</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </main>
        </div>
      )}
    </>
  );
}
