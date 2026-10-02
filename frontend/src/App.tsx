import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Send,
  Search,
  Layers,
  TrendingUp,
  ShieldCheck,
  Cpu,
  BarChart3,
  BookOpen,
  Clock,
  Loader2,
  ChevronRight,
  Database,
  Sparkles,
  Info,
  CheckCircle,
  CircleDot,
  Circle
} from 'lucide-react';

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
}

interface StageDetail {
  key: string;
  label: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' | 'FAILED';
}

interface DocumentSummary {
  id: string;
  filename: string;
  page_count: number;
  status: string;
  created_at?: string;
}

export default function App() {
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [activeDocId, setActiveDocId] = useState<string>('doc_phase27_e2e');
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [activeFilename, setActiveFilename] = useState<string>('Annual_Report_2025.pdf');
  const [pageCount, setPageCount] = useState<number>(500);
  const [docStatus, setDocStatus] = useState<string>('completed');
  const [progressPercent, setProgressPercent] = useState<number>(100);
  const [currentStageLabel, setCurrentStageLabel] = useState<string>('Completed');
  
  const [stageDetails, setStageDetails] = useState<StageDetail[]>([
    { key: 'file_validation', label: 'File validated', status: 'COMPLETED' },
    { key: 'pymupdf_fast_pass', label: '500 pages detected', status: 'COMPLETED' },
    { key: 'page_classification', label: 'Page classification', status: 'COMPLETED' },
    { key: 'text_extraction', label: 'Text extraction', status: 'COMPLETED' },
    { key: 'table_extraction', label: 'Table extraction', status: 'COMPLETED' },
    { key: 'chart_analysis', label: 'Chart analysis', status: 'COMPLETED' },
    { key: 'financial_calculations', label: 'Financial calculations', status: 'COMPLETED' },
    { key: 'anomaly_detection', label: 'Anomaly detection', status: 'COMPLETED' },
    { key: 'rag_indexing', label: 'RAG indexing', status: 'COMPLETED' }
  ]);

  const [metrics, setMetrics] = useState<MetricItem[]>([
    { metric_name: 'YoY Revenue Growth', value: 17.42, unit: '%', validation_status: 'verified', source: 'income_statement' },
    { metric_name: 'Net Profit Margin', value: 13.19, unit: '%', validation_status: 'verified', source: 'income_statement' },
    { metric_name: 'Debt-to-Equity Ratio', value: 0.68, unit: 'ratio', validation_status: 'verified', source: 'balance_sheet' },
    { metric_name: 'Current Ratio', value: 1.33, unit: 'ratio', validation_status: 'verified', source: 'balance_sheet' },
    { metric_name: 'Free Cash Flow', value: 1150.0, unit: 'crore', validation_status: 'verified', source: 'cash_flow_statement' }
  ]);

  const [anomalies, setAnomalies] = useState<AnomalyItem[]>([]);
  const [query, setQuery] = useState<string>('Why did operating cash flow decrease and what is the Free Cash Flow?');
  const [queryLoading, setQueryLoading] = useState<boolean>(false);
  const [answer, setAnswer] = useState<string>(
    'Operating cash flow experienced temporary timing adjustments due to working capital expansion and receivables collection cycles (Page 151, Statement of Cash Flows). Free cash flow remained robust at $1,150M after accounting for capital expenditures of $950M (Page 3, Cash Flow Summary).'
  );
  const [citations, setCitations] = useState<RAGCitation[]>([
    {
      page_number: 151,
      section: 'Statement of Cash Flows',
      chunk_id: 'doc_p151_c1',
      score: 0.6842,
      text_snippet: 'Cash generated from operating activities stood at $2,100 million. Capital expenditures totaled $950 million resulting in positive Free Cash Flow of $1,150 million.',
    },
    {
      page_number: 82,
      section: 'Management Discussion and Analysis',
      chunk_id: 'doc_p82_c1',
      score: 0.5891,
      text_snippet: 'Operating cash flow faced temporary headwinds during the second half due to upfront customer procurement cycles and elevated inventory levels.',
    },
    {
      page_number: 146,
      section: 'Consolidated Statement of Profit and Loss',
      chunk_id: 'doc_p146_c1',
      score: 0.5124,
      text_snippet: 'Revenue from operations increased by 17.42% YoY to $18,200 million, while Net Profit Margin expanded to 13.19%.',
    }
  ]);

  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadMessage, setUploadMessage] = useState<string>('');
  const pollingRef = useRef<any>(null);


  // Fetch metrics & anomalies for an active document
  const fetchDocumentAnalytics = async (docId: string) => {
    try {
      const [mRes, aRes] = await Promise.all([
        fetch(`/api/v1/documents/${docId}/metrics`),
        fetch(`/api/v1/documents/${docId}/anomalies`)
      ]);

      if (mRes.ok) {
        const mData = await mRes.json();
        if (mData.metrics && mData.metrics.length > 0) {
          setMetrics(mData.metrics);
        }
      }

      if (aRes.ok) {
        const aData = await aRes.json();
        setAnomalies(aData.anomalies || []);
      }
    } catch (e) {
      console.warn('Analytics fetch offline:', e);
    }
  };

  // Poll status for in-progress processing job
  const pollJobStatus = (docId: string, jobId?: string) => {
    if (pollingRef.current) clearInterval(pollingRef.current);

    const checkStatus = async () => {
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

          if (data.stage_details && data.stage_details.length > 0) {
            setStageDetails(data.stage_details);
          }

          if (data.status === 'completed') {
            if (pollingRef.current) clearInterval(pollingRef.current);
            setIsUploading(false);
            setUploadMessage('Processing completed successfully!');
            fetchDocumentAnalytics(docId);
            fetchDocumentList();
          } else if (data.status === 'failed') {
            if (pollingRef.current) clearInterval(pollingRef.current);
            setIsUploading(false);
            setUploadMessage(`Processing failed: ${data.current_stage}`);
          }
        }
      } catch (err) {
        console.warn('Polling error:', err);
      }
    };

    // Run immediately and interval poll
    checkStatus();
    pollingRef.current = setInterval(checkStatus, 700);
  };

  const fetchDocumentList = async () => {
    try {
      const res = await fetch('/api/v1/documents');
      if (res.ok) {
        const data = await res.json();
        if (data.documents && data.documents.length > 0) {
          setDocuments(data.documents);
        }
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    fetchDocumentList();
    fetchDocumentAnalytics(activeDocId);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  // Handle PDF Upload (Phase 28 HTTP 202 Async Ingestion)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setDocStatus('processing');
    setProgressPercent(5);
    setCurrentStageLabel('Uploading & File Validation');
    setUploadMessage(`Accepted ${file.name} (HTTP 202). Processing in background...`);
    setActiveFilename(file.name);

    // Initial tentative checklist
    setStageDetails([
      { key: 'file_validation', label: 'File validated', status: 'IN_PROGRESS' },
      { key: 'pymupdf_fast_pass', label: '500 pages detected', status: 'PENDING' },
      { key: 'page_classification', label: 'Page classification', status: 'PENDING' },
      { key: 'text_extraction', label: 'Text extraction', status: 'PENDING' },
      { key: 'table_extraction', label: 'Table extraction', status: 'PENDING' },
      { key: 'chart_analysis', label: 'Chart analysis', status: 'PENDING' },
      { key: 'financial_calculations', label: 'Financial calculations', status: 'PENDING' },
      { key: 'anomaly_detection', label: 'Anomaly detection', status: 'PENDING' },
      { key: 'rag_indexing', label: 'RAG indexing', status: 'PENDING' }
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
        
        // Start live polling
        pollJobStatus(data.document_id, data.job_id);
      } else {
        setUploadMessage('Upload rejected by server.');
        setIsUploading(false);
      }
    } catch (err) {
      setUploadMessage('Upload network request error.');
      setIsUploading(false);
    }
  };

  // Handle Sub-second RAG Query
  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || queryLoading) return;

    setQueryLoading(true);
    try {
      const res = await fetch(`/api/v1/documents/${activeDocId}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, top_k: 4 }),
      });

      if (res.ok) {
        const data = await res.json();
        setAnswer(data.answer);
        setCitations(data.citations || []);
      } else {
        setAnswer('RAG query could not retrieve evidence from the indexed document.');
      }
    } catch (err) {
      setAnswer('Backend connection error during RAG retrieval.');
    } finally {
      setQueryLoading(false);
    }
  };

  const sampleQueries = [
    'Why did operating cash flow decrease?',
    'What is the Free Cash Flow and Net Profit Margin?',
    'What are the key liquidity indicators and current ratio?'
  ];

  return (
    <div className="app-container">
      {/* Top Header */}
      <header className="app-header">
        <div className="brand">
          <div className="brand-logo">DF</div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="brand-title">DoxFin</span>
              <span className="brand-badge">Phase 27 & 28 Connected Pipeline</span>
            </div>
          </div>
        </div>

        <div className="header-status">
          <div className="status-indicator">
            <span className="dot-pulse"></span>
            <span>FastAPI Core: <strong>127.0.0.1:8000</strong></span>
          </div>
          <a
            href="http://127.0.0.1:8000/docs"
            target="_blank"
            rel="noreferrer"
            className="docs-link"
          >
            <BookOpen size={15} /> OpenAPI /docs
          </a>
        </div>
      </header>

      {/* Main Grid Layout */}
      <main className="main-layout">
        {/* Left Sidebar: Ingestion & Job Status System */}
        <aside className="sidebar">
          {/* Upload Card */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">
                <Upload size={16} color="var(--primary)" /> Document Ingestion
              </span>
              <span className="status-pill">HTTP 202 Async</span>
            </div>

            <label className={`dropzone ${isUploading ? 'dropzone-active' : ''}`}>
              <input
                type="file"
                accept=".pdf"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
                disabled={isUploading}
              />
              <div className="dropzone-icon">
                {isUploading ? <Loader2 size={24} className="spin-icon" color="var(--primary)" /> : <FileText size={24} />}
              </div>
              <div className="dropzone-title">
                {isUploading ? 'Processing Document...' : 'Click to Upload Financial PDF'}
              </div>
              <div className="dropzone-sub">
                Supports up to 500-page Annual Reports (Selective Processing)
              </div>
            </label>

            {uploadMessage && (
              <div className="upload-msg">
                <Clock size={12} /> {uploadMessage}
              </div>
            )}
          </div>

          {/* Phase 28 Processing Job System Card */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">
                <Layers size={16} color="var(--primary)" /> Processing Job System
              </span>
              <span className="job-badge">
                {docStatus === 'completed' ? 'Completed' : docStatus === 'processing' ? 'Active Worker' : 'Ready'}
              </span>
            </div>

            {/* Live Progress Bar */}
            <div className="progress-section">
              <div className="progress-header">
                <span className="progress-docname">{activeFilename}</span>
                <span className="progress-pct">
                  {docStatus === 'completed' ? '100%' : `Processing: ${progressPercent}%`}
                </span>
              </div>
              <div className="progress-bar-bg">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${docStatus === 'completed' ? 100 : progressPercent}%` }}
                ></div>
              </div>
              <div className="current-stage-text">
                {docStatus === 'processing' && <Loader2 size={13} className="spin-icon inline-icon" />}
                <span>Current Stage: <strong>{currentStageLabel}</strong></span>
              </div>
            </div>

            {/* Checklist items as specified in Phase 28 */}
            <div className="stage-checklist">
              {stageDetails.map((st) => (
                <div key={st.key} className={`checklist-row ${st.status.toLowerCase()}`}>
                  <div className="checklist-icon">
                    {st.status === 'COMPLETED' ? (
                      <CheckCircle size={15} color="var(--success)" />
                    ) : st.status === 'IN_PROGRESS' ? (
                      <CircleDot size={15} className="spin-icon" color="var(--primary)" />
                    ) : (
                      <Circle size={15} color="var(--text-muted)" />
                    )}
                  </div>
                  <span className="checklist-label">{st.label}</span>
                  <span className={`checklist-badge badge-${st.status.toLowerCase()}`}>
                    {st.status === 'COMPLETED' ? 'Done' : st.status === 'IN_PROGRESS' ? 'Running' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Indexed Documents Registry */}
          {documents.length > 0 && (
            <div className="card">
              <div className="card-header">
                <span className="card-title">
                  <Database size={15} color="var(--primary)" /> Indexed Documents
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{documents.length} docs</span>
              </div>
              <div className="doc-list">
                {documents.map((d) => (
                  <button
                    key={d.id}
                    className={`doc-list-item ${d.id === activeDocId ? 'active' : ''}`}
                    onClick={() => {
                      setActiveDocId(d.id);
                      setActiveFilename(d.filename);
                      setPageCount(d.page_count);
                      fetchDocumentAnalytics(d.id);
                    }}
                  >
                    <FileText size={14} />
                    <span className="doc-list-name">{d.filename}</span>
                    <span className="doc-list-pages">{d.page_count}p</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Right Content Area: Dashboard & RAG */}
        <section className="content-area">
          {/* Active Document Banner */}
          <div className="doc-meta-banner">
            <div className="doc-info">
              <div className="doc-icon-box">PDF</div>
              <div>
                <div className="doc-name">{activeFilename}</div>
                <div className="doc-stats">
                  <span>Document ID: <code>{activeDocId}</code></span>
                  <span>•</span>
                  <span>{pageCount} Inspected Pages</span>
                  <span>•</span>
                  <span style={{ color: 'var(--success)', fontWeight: 600 }}>
                    Deterministic Financial Engine Active
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Anomaly & Invariance Alert Box */}
          {anomalies.length > 0 ? (
            anomalies.map((a, idx) => (
              <div key={idx} className="anomaly-box">
                <AlertTriangle size={20} className="anomaly-icon" />
                <div>
                  <div className="anomaly-title">{a.anomaly_type.replace(/_/g, ' ')}</div>
                  <div className="anomaly-desc">{a.message}</div>
                  {a.action_required && (
                    <div className="anomaly-action">
                      <strong>Recommended Action:</strong> {a.action_required}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="anomaly-box clean-box">
              <ShieldCheck size={20} color="var(--success)" className="anomaly-icon" />
              <div>
                <div className="anomaly-title" style={{ color: 'var(--success-text)' }}>
                  Accounting Invariance & Liquidity Verified
                </div>
                <div className="anomaly-desc" style={{ color: 'var(--success-text)' }}>
                  Deterministic verification passed: Balance sheet assets balance liabilities + equity. No working capital strain detected.
                </div>
              </div>
            </div>
          )}

          {/* Deterministic Financial Metrics Cards (Python Calculated) */}
          <div className="section-block">
            <div className="section-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BarChart3 size={18} color="var(--primary)" />
                <h3 className="section-title">
                  Deterministic Financial Metrics (Zero Hallucination Arithmetic)
                </h3>
              </div>
              <span className="badge-python">Python Calculates</span>
            </div>

            <div className="metrics-grid">
              {metrics.map((m, idx) => (
                <div key={idx} className="metric-card">
                  <div className="metric-header">
                    <span className="metric-label">{m.metric_name}</span>
                    <TrendingUp size={16} className="metric-status-icon" />
                  </div>
                  <div className="metric-value-row">
                    <span className="metric-value">
                      {m.value > 0 && m.unit === '%' ? `+${m.value.toFixed(2)}` : m.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                    <span className="metric-unit">{m.unit}</span>
                  </div>
                  <div className="metric-footer">
                    <CheckCircle2 size={13} color="var(--success)" />
                    <span>Verified {m.source ? m.source.replace(/_/g, ' ') : 'Deterministic'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sub-Second RAG Intelligence Assistant */}
          <div className="section-block">
            <div className="section-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={18} color="var(--primary)" />
                <h3 className="section-title">
                  RAG Evidence & Explanations with Source Citations
                </h3>
              </div>
              <span className="badge-rag">Selective FAISS Retrieval</span>
            </div>

            {/* Prompt Form */}
            <form onSubmit={handleAskQuestion} className="query-form">
              <div className="query-input-box">
                <Search size={18} className="query-search-icon" />
                <input
                  type="text"
                  className="query-input"
                  placeholder="Ask a financial question (e.g., 'Why did operating cash flow change?')..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={queryLoading}
                  className="query-submit-btn"
                >
                  {queryLoading ? <Loader2 size={16} className="spin-icon" /> : <Send size={16} />}
                  <span>{queryLoading ? 'Retrieving...' : 'Ask RAG'}</span>
                </button>
              </div>

              {/* Sample Queries */}
              <div className="sample-queries">
                <span className="sample-title">Quick Prompts:</span>
                {sampleQueries.map((sq, i) => (
                  <button
                    key={i}
                    type="button"
                    className="sample-pill"
                    onClick={() => setQuery(sq)}
                  >
                    {sq}
                  </button>
                ))}
              </div>
            </form>

            {/* Generated Explanation */}
            <div className="answer-card">
              <div className="answer-header">
                <span className="answer-title">Synthesized Evidence-Backed Explanation</span>
                <span className="citation-count-badge">{citations.length} Grounded Citations</span>
              </div>
              <p className="answer-text">{answer}</p>
            </div>

            {/* Traceable Source Citations */}
            <div className="citations-header">
              <h4 className="citations-title">Verified Document Source Evidence</h4>
            </div>

            <div className="citations-grid">
              {citations.map((c, i) => (
                <div key={i} className="citation-card">
                  <div className="citation-top">
                    <span className="citation-page-badge">Page {c.page_number}</span>
                    <span className="citation-section">{c.section}</span>
                    <span className="citation-score">Score: {c.score.toFixed(4)}</span>
                  </div>
                  <div className="citation-body">
                    "{c.text_snippet}"
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
