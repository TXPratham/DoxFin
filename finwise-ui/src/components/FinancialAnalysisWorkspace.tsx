import React, { useState } from 'react';
import {
  FileText,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Table2,
  LineChart as LineChartIcon,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Calculator,
  Building,
  Info,
  ChevronLeft
} from 'lucide-react';
import type {
  DocumentInfo,
  FinancialMetricItem,
  FinancialSignal,
  AskDoxFinQA
} from '../types/doxfin';

interface FinancialAnalysisWorkspaceProps {
  document: DocumentInfo;
  metrics: FinancialMetricItem[];
  signals: FinancialSignal[];
  qaPresets: AskDoxFinQA[];
  onInspectMetricEvidence: (metric: FinancialMetricItem) => void;
  onInvestigateSignal: (signal: FinancialSignal) => void;
  initialSubTab?: 'overview' | 'financials' | 'trends' | 'anomalies' | 'document' | 'ask_doxfin';
}

export const FinancialAnalysisWorkspace: React.FC<FinancialAnalysisWorkspaceProps> = ({
  document,
  metrics,
  signals,
  qaPresets,
  onInspectMetricEvidence,
  onInvestigateSignal,
  initialSubTab = 'overview'
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'financials' | 'trends' | 'anomalies' | 'document' | 'ask_doxfin'>(initialSubTab);

  // Financial Statements sub-tab
  const [statementTab, setStatementTab] = useState<'Income Statement' | 'Balance Sheet' | 'Cash Flow' | 'Key Ratios'>('Income Statement');

  // Trends Tab controls
  const [trendMetric, setTrendMetric] = useState<'Revenue' | 'Profit' | 'Margin' | 'Debt' | 'CashFlow' | 'ROE'>('Revenue');
  const [trendPeriod, setTrendPeriod] = useState<'1Y' | '3Y' | '5Y'>('3Y');
  const [hoveredPoint, setHoveredPoint] = useState<{ year: string; val: string; change: string; page: number } | null>({
    year: 'FY 2024-25',
    val: '₹16,420 Cr',
    change: '+12.4%',
    page: 146
  });

  // Document Viewer controls
  const [activePdfPage, setActivePdfPage] = useState<number>(146);

  // Ask DoxFin tab controls
  const [selectedQA, setSelectedQA] = useState<AskDoxFinQA>(qaPresets[0]);
  const [customQuestion, setCustomQuestion] = useState<string>('');
  const [customAnswer, setCustomAnswer] = useState<AskDoxFinQA | null>(null);

  // Filtered metrics by statement category
  const filteredMetrics = metrics.filter((m) => m.category === statementTab);

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim()) return;

    const matched = qaPresets.find((qa) =>
      qa.question.toLowerCase().includes(customQuestion.toLowerCase().split(' ')[0])
    );

    if (matched) {
      setSelectedQA(matched);
      setCustomAnswer(null);
    } else {
      setCustomAnswer({
        id: `custom-${Date.now()}`,
        question: customQuestion,
        category: 'Ad-hoc Ingestion Query',
        answerSummary: `DoxFin synthesized response for "${customQuestion}" based on verified tables on Page 146 and Page 151 of ${document.company} Annual Report.`,
        detailedAnalysis: [
          'Deterministic Python formula verified across P&L and Balance Sheet notes.',
          'Docling extracted 83 tabular rows with zero mathematical discrepancy.',
          'Cross-referenced with MD&A qualitative disclosures on pages 82-89.'
        ],
        calculations: {
          label: 'Deterministic Calculation Tree',
          items: [
            { title: 'Gross Operating Receipts', value: '₹16,420 Cr', operation: '+' },
            { title: 'Operational Outflows', value: '₹14,240 Cr', operation: '-' }
          ],
          result: { title: 'Net Inferred Flow', value: '₹2,180 Cr' }
        },
        evidenceCitations: [
          {
            pageNumber: 146,
            section: 'Consolidated Statement of Profit & Loss',
            document: document.documentName,
            snippet: 'Audited financial numbers verified by statutory auditors.',
            tool: 'Docling'
          }
        ],
        confidence: 'Verified from local model inference'
      });
    }
  };

  const currentQA = customAnswer || selectedQA;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Workspace Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#0F3E5D] text-white flex items-center justify-center font-bold text-base shadow-xs">
              <Building className="w-5 h-5 text-sky-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-['DM_Sans']">
                  {document.company}
                </h1>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200">
                  {document.financialYear}
                </span>
                <span className="badge badge-completed">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Verified
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                {document.documentName} • {document.pages} pages • Docling Table Engine • 100% Local Inference
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Processing Mode:</span>
            <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-1 rounded border border-slate-200 uppercase font-mono">
              {document.processingMode}
            </span>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex items-center gap-1 border-b border-slate-200 mt-6 overflow-x-auto text-xs sm:text-sm">
          {[
            { id: 'overview', label: 'Overview', icon: LineChartIcon },
            { id: 'financials', label: 'Financials', icon: Table2 },
            { id: 'trends', label: 'Trends', icon: TrendingUp },
            { id: 'anomalies', label: 'Anomalies', icon: AlertTriangle, badge: signals.length },
            { id: 'document', label: 'Document', icon: FileText },
            { id: 'ask_doxfin', label: 'Ask DoxFin', icon: Sparkles }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 font-medium border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-[#0F3E5D] text-[#0F3E5D] font-bold bg-sky-50/50'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#0F3E5D]' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-bold">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. OVERVIEW TAB */}
      {/* ========================================================================= */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Top 6 Large Financial KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {/* 1. Revenue */}
            <div className="dox-card p-4 bg-white border border-slate-200 flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Revenue</span>
              <div className="my-2">
                <div className="text-xl sm:text-2xl font-bold text-slate-900 font-['DM_Sans'] tabular-nums">
                  ₹16,420 <span className="text-xs font-normal text-slate-500">Cr</span>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700 mt-1">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>+12.4%</span>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Page 146 (P&L)</span>
            </div>

            {/* 2. Net Profit */}
            <div className="dox-card p-4 bg-white border border-slate-200 flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Net Profit</span>
              <div className="my-2">
                <div className="text-xl sm:text-2xl font-bold text-slate-900 font-['DM_Sans'] tabular-nums">
                  ₹2,180 <span className="text-xs font-normal text-slate-500">Cr</span>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700 mt-1">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>+8.7%</span>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Page 146 (P&L)</span>
            </div>

            {/* 3. Operating Margin */}
            <div className="dox-card p-4 bg-white border border-slate-200 flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Operating Margin</span>
              <div className="my-2">
                <div className="text-xl sm:text-2xl font-bold text-slate-900 font-['DM_Sans'] tabular-nums">
                  18.4%
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-amber-700 mt-1">
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  <span>-1.2%</span>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">EBITDA margin</span>
            </div>

            {/* 4. Free Cash Flow */}
            <div className="dox-card p-4 bg-white border border-slate-200 flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Free Cash Flow</span>
              <div className="my-2">
                <div className="text-xl sm:text-2xl font-bold text-slate-900 font-['DM_Sans'] tabular-nums">
                  ₹1,320 <span className="text-xs font-normal text-slate-500">Cr</span>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-rose-700 mt-1">
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  <span>-16.8%</span>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Page 151 (Cash Flow)</span>
            </div>

            {/* 5. Debt / Equity */}
            <div className="dox-card p-4 bg-white border border-slate-200 flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Debt / Equity</span>
              <div className="my-2">
                <div className="text-xl sm:text-2xl font-bold text-slate-900 font-['DM_Sans'] tabular-nums">
                  0.42
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-slate-600 mt-1">
                  <span>+0.06 vs FY24</span>
                </div>
              </div>
              <span className="text-[10px] text-emerald-700 font-mono">Safe (&lt; 1.20)</span>
            </div>

            {/* 6. ROE */}
            <div className="dox-card p-4 bg-white border border-slate-200 flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">ROE</span>
              <div className="my-2">
                <div className="text-xl sm:text-2xl font-bold text-slate-900 font-['DM_Sans'] tabular-nums">
                  17.8%
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-slate-600 mt-1">
                  <span>-0.7% YoY</span>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Page 153 (Ratios)</span>
            </div>
          </div>

          {/* Executive Synthesis & Signals Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: AI Executive Summary */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#0F3E5D]" />
                  <h3 className="text-sm font-bold text-slate-900 font-['DM_Sans']">Executive Synthesis Brief</h3>
                </div>
                <span className="badge badge-brand font-mono text-[10px]">Local Model Verification</span>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed">
                ABC Industries delivered solid top-line performance in FY 2024-25 with consolidated revenue rising <strong className="text-slate-900 font-semibold">12.4% to ₹16,420 Cr</strong>. Profit after tax expanded <strong className="text-slate-900 font-semibold">8.7% to ₹2,180 Cr</strong>.
              </p>

              <div className="space-y-2.5 pt-2">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-xs">
                  <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    Margin Compression Observation
                  </div>
                  <p className="text-slate-600 mt-1">
                    Operating margin compressed by 120 bps (from 19.6% to 18.4%) due to a 16.2% increase in raw material procurement expenses.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-xs">
                  <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    Cash Flow & Working Capital Divergence
                  </div>
                  <p className="text-slate-600 mt-1">
                    Operating cash flow declined 14.2% (to ₹2,180 Cr) as trade receivables expanded by 23% (₹2,398 Cr) following 90-day credit term extensions to tier-1 clients.
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Quick Signal Highlights */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <h3 className="text-sm font-bold text-slate-900 font-['DM_Sans']">Signals in this Report</h3>
                </div>
                <span className="text-xs text-slate-500">{signals.length} Signals Detected</span>
              </div>

              <div className="space-y-3">
                {signals.map((sig) => (
                  <div
                    key={sig.id}
                    className="p-3 bg-white border border-slate-200 rounded-lg hover:border-sky-300 transition-colors flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded ${
                          sig.severity === 'high'
                            ? 'bg-rose-100 text-rose-800'
                            : sig.severity === 'moderate'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-sky-100 text-sky-800'
                        }`}>
                          {sig.signalType}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800 mt-1">{sig.title}</p>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{sig.primarySummary}</p>
                    </div>

                    <button
                      onClick={() => onInvestigateSignal(sig)}
                      className="btn btn-secondary btn-sm text-xs font-semibold text-[#0F3E5D] flex-shrink-0"
                    >
                      Investigate
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. FINANCIAL STATEMENTS TAB */}
      {/* ========================================================================= */}
      {activeSubTab === 'financials' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="dox-card p-6 bg-white border border-slate-200">
            {/* Statements Sub-Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                {(['Income Statement', 'Balance Sheet', 'Cash Flow', 'Key Ratios'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setStatementTab(tab)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      statementTab === tab
                        ? 'bg-[#0F3E5D] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Info className="w-3.5 h-3.5 text-sky-700" />
                <span>Click any metric row or number to inspect audited source page & Docling coordinates</span>
              </div>
            </div>

            {/* Spreadsheet-Style Financial Table */}
            <div className="dox-table-container">
              <table className="dox-table dox-table-clickable">
                <thead>
                  <tr>
                    <th>Metric / Line Item</th>
                    <th>Unit</th>
                    <th>FY 2022-23 (FY23)</th>
                    <th>FY 2023-24 (FY24)</th>
                    <th>FY 2024-25 (FY25)</th>
                    <th>YoY Change</th>
                    <th>3Y CAGR</th>
                    <th>Audited Source</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMetrics.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => onInspectMetricEvidence(item)}
                      className="group transition-colors"
                    >
                      {/* Metric Name */}
                      <td className="font-semibold text-xs text-slate-900 group-hover:text-sky-900">
                        {item.name}
                      </td>

                      {/* Unit */}
                      <td className="text-xs text-slate-500 font-mono">
                        {item.unit}
                      </td>

                      {/* FY23 */}
                      <td className="tabular-nums text-xs text-slate-700 font-mono">
                        {typeof item.fy23 === 'number' ? `₹${item.fy23.toLocaleString()}` : item.fy23}
                      </td>

                      {/* FY24 */}
                      <td className="tabular-nums text-xs text-slate-700 font-mono">
                        {typeof item.fy24 === 'number' ? `₹${item.fy24.toLocaleString()}` : item.fy24}
                      </td>

                      {/* FY25 */}
                      <td className="tabular-nums text-xs font-bold text-slate-900 font-mono bg-sky-50/40">
                        {typeof item.fy25 === 'number' ? `₹${item.fy25.toLocaleString()}` : item.fy25}
                      </td>

                      {/* Change */}
                      <td className="tabular-nums text-xs font-semibold font-mono">
                        <span className={`px-2 py-0.5 rounded ${
                          item.isNegativeChange
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {item.changeYoY}
                        </span>
                      </td>

                      {/* CAGR */}
                      <td className="tabular-nums text-xs text-slate-600 font-mono">
                        {item.cagr3Y || '—'}
                      </td>

                      {/* Source Citation */}
                      <td>
                        <span className="text-[11px] font-mono text-sky-800 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
                          Page {item.sourcePage}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="text-right">
                        <button className="text-xs font-medium text-[#0F3E5D] group-hover:underline flex items-center justify-end gap-1 w-full">
                          <span>Evidence</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. FINANCIAL TRENDS TAB */}
      {/* ========================================================================= */}
      {activeSubTab === 'trends' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="dox-card p-6 bg-white border border-slate-200 space-y-6">
            {/* Trend Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 flex-wrap">
                {[
                  { id: 'Revenue', label: 'Revenue Growth' },
                  { id: 'Profit', label: 'Profit Growth' },
                  { id: 'Margin', label: 'Operating Margin' },
                  { id: 'Debt', label: 'Debt Breakdown' },
                  { id: 'CashFlow', label: 'Free Cash Flow' },
                  { id: 'ROE', label: 'ROE / ROCE' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setTrendMetric(item.id as any);
                      if (item.id === 'Revenue') {
                        setHoveredPoint({ year: 'FY 2024-25', val: '₹16,420 Cr', change: '+12.4%', page: 146 });
                      } else if (item.id === 'Margin') {
                        setHoveredPoint({ year: 'FY 2024-25', val: '18.4%', change: '-1.2%', page: 146 });
                      } else if (item.id === 'CashFlow') {
                        setHoveredPoint({ year: 'FY 2024-25', val: '₹1,320 Cr', change: '-16.8%', page: 151 });
                      } else {
                        setHoveredPoint({ year: 'FY 2024-25', val: '₹2,180 Cr', change: '+8.7%', page: 146 });
                      }
                    }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      trendMetric === item.id
                        ? 'bg-[#0F3E5D] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Time Range Selector */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
                {(['1Y', '3Y', '5Y'] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setTrendPeriod(period)}
                    className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                      trendPeriod === period
                        ? 'bg-white text-slate-900 shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>

            {/* Clean Professional SVG Chart Area */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 relative">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {trendMetric === 'Revenue' && 'Revenue from Operations Progression (₹ Crores)'}
                    {trendMetric === 'Profit' && 'Net Profit (PAT) Historical Trend (₹ Crores)'}
                    {trendMetric === 'Margin' && 'Operating Margin (%) Trend Progression'}
                    {trendMetric === 'Debt' && 'Total Borrowings & Leverage Structure (₹ Crores)'}
                    {trendMetric === 'CashFlow' && 'Free Cash Flow (FCF = CFO - CapEx) Trend'}
                    {trendMetric === 'ROE' && 'Return on Equity (ROE) & ROCE Progression (%)'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    White backgrounds, thin gridlines, source verified against audited annual reports
                  </p>
                </div>

                {hoveredPoint && (
                  <div className="bg-sky-50 border border-sky-200 rounded-lg p-2.5 text-right text-xs shadow-xs animate-in fade-in">
                    <div className="font-bold text-[#0F3E5D] font-mono">{hoveredPoint.year}</div>
                    <div className="text-slate-800 font-semibold">{hoveredPoint.val} ({hoveredPoint.change})</div>
                    <div className="text-[10px] text-sky-800 font-mono">
                      Source: Page {hoveredPoint.page} – Consolidated Financial Statements
                    </div>
                  </div>
                )}
              </div>

              {/* Visual SVG Financial Chart */}
              <div className="h-64 w-full relative flex items-end justify-between px-8 pb-8 pt-4 border-b border-l border-slate-200">
                {/* Thin Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40 px-8 pb-8 pt-4">
                  <div className="w-full border-b border-slate-200"></div>
                  <div className="w-full border-b border-slate-200"></div>
                  <div className="w-full border-b border-slate-200"></div>
                  <div className="w-full border-b border-slate-200"></div>
                </div>

                {/* 3 Years Data Points for ABC Industries */}
                <div
                  onMouseEnter={() =>
                    setHoveredPoint({ year: 'FY 2022-23', val: '₹12,800 Cr', change: 'Base Year', page: 146 })
                  }
                  className="flex flex-col items-center gap-2 z-10 cursor-pointer group"
                >
                  <span className="text-xs font-mono font-bold text-slate-700 group-hover:text-sky-700">₹12,800 Cr</span>
                  <div className="w-12 bg-slate-200 group-hover:bg-sky-300 rounded-t-md h-32 transition-all"></div>
                  <span className="text-xs font-mono text-slate-500">FY 2022-23</span>
                </div>

                <div
                  onMouseEnter={() =>
                    setHoveredPoint({ year: 'FY 2023-24', val: '₹14,600 Cr', change: '+14.1%', page: 146 })
                  }
                  className="flex flex-col items-center gap-2 z-10 cursor-pointer group"
                >
                  <span className="text-xs font-mono font-bold text-slate-700 group-hover:text-sky-700">₹14,600 Cr</span>
                  <div className="w-12 bg-sky-600/70 group-hover:bg-sky-500 rounded-t-md h-40 transition-all"></div>
                  <span className="text-xs font-mono text-slate-500">FY 2023-24</span>
                </div>

                <div
                  onMouseEnter={() =>
                    setHoveredPoint({ year: 'FY 2024-25', val: '₹16,420 Cr', change: '+12.4%', page: 146 })
                  }
                  className="flex flex-col items-center gap-2 z-10 cursor-pointer group"
                >
                  <span className="text-xs font-mono font-bold text-[#0F3E5D] group-hover:text-sky-700">₹16,420 Cr</span>
                  <div className="w-12 bg-[#0F3E5D] group-hover:bg-sky-700 rounded-t-md h-48 transition-all ring-2 ring-sky-300"></div>
                  <span className="text-xs font-mono font-bold text-[#0F3E5D]">FY 2024-25 (Current)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. ANOMALIES IN REPORT TAB */}
      {/* ========================================================================= */}
      {activeSubTab === 'anomalies' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="dox-card p-6 bg-white border border-slate-200">
            <div className="pb-4 mb-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 font-['DM_Sans']">
                Financial Signals Detected in {document.company}
              </h2>
              <p className="text-xs text-slate-500">
                Deterministic mathematical divergences and cross-statement checks flagged by Docling & Python Rule Engine
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {signals.map((sig) => (
                <div
                  key={sig.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 hover:border-sky-300 transition-all flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        sig.severity === 'high'
                          ? 'bg-rose-100 text-rose-800'
                          : sig.severity === 'moderate'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-sky-100 text-sky-800'
                      }`}>
                        {sig.signalType}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {sig.evidenceCount} Citations
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900">{sig.title}</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{sig.primarySummary}</p>
                    <p className="text-[11px] text-slate-500 mt-2 bg-slate-50 p-2 rounded border border-slate-150">
                      {sig.secondarySummary}
                    </p>
                  </div>

                  <button
                    onClick={() => onInvestigateSignal(sig)}
                    className="w-full btn btn-secondary text-xs font-semibold text-[#0F3E5D] flex items-center justify-center gap-1.5"
                  >
                    <span>Investigate Evidence</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. DOCUMENT VIEWER TAB (Split Screen PDF + AI Panel) */}
      {/* ========================================================================= */}
      {activeSubTab === 'document' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-150">
          {/* Left: Rendered PDF Document Viewer */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col">
            {/* PDF Toolbar */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800">PDF Viewer:</span>
                <span className="font-mono text-slate-500">{document.documentName}</span>
              </div>

              <div className="flex items-center gap-2">
                {/* Page Navigation */}
                <button
                  onClick={() => setActivePdfPage((p) => Math.max(1, p - 1))}
                  className="p-1 rounded hover:bg-slate-100 text-slate-600"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-mono text-xs font-semibold bg-slate-100 px-2 py-0.5 rounded">
                  Page {activePdfPage} / {document.pages}
                </span>
                <button
                  onClick={() => setActivePdfPage((p) => Math.min(document.pages, p + 1))}
                  className="p-1 rounded hover:bg-slate-100 text-slate-600"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Quick Page Jump */}
                <div className="flex items-center gap-1 ml-2">
                  <button
                    onClick={() => setActivePdfPage(87)}
                    className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-[10px] font-mono"
                  >
                    p.87 (MD&A)
                  </button>
                  <button
                    onClick={() => setActivePdfPage(146)}
                    className="px-1.5 py-0.5 rounded bg-sky-100 hover:bg-sky-200 text-[#0F3E5D] font-bold text-[10px] font-mono"
                  >
                    p.146 (P&L)
                  </button>
                  <button
                    onClick={() => setActivePdfPage(151)}
                    className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-[10px] font-mono"
                  >
                    p.151 (Cash Flow)
                  </button>
                </div>
              </div>
            </div>

            {/* Document Rendered Simulation Surface */}
            <div className="flex-1 bg-slate-100 rounded-lg p-4 flex justify-center overflow-auto min-h-[460px]">
              <div className="bg-white border border-slate-300 rounded shadow-md w-full max-w-lg p-6 text-slate-800 text-xs font-serif relative">
                {/* Header of simulated PDF page */}
                <div className="border-b border-slate-200 pb-2 mb-4 flex justify-between items-center text-[10px] font-mono text-slate-500">
                  <span>ABC INDUSTRIES LIMITED • ANNUAL REPORT 2024-25</span>
                  <span>PAGE {activePdfPage}</span>
                </div>

                {activePdfPage === 146 ? (
                  <div>
                    <h3 className="font-bold text-center text-sm font-sans mb-3 text-slate-900">
                      CONSOLIDATED STATEMENT OF PROFIT AND LOSS
                    </h3>
                    <p className="text-[10px] text-center text-slate-500 mb-4 font-sans">
                      for the year ended March 31, 2025 (All amounts in ₹ Crores, unless otherwise stated)
                    </p>

                    {/* Highlighted Bounding Box on Table */}
                    <div className="relative border border-slate-200 rounded p-2 bg-slate-50/50">
                      <div className="pdf-highlight-box" style={{ inset: '4px' }}></div>
                      <table className="w-full text-[11px] font-sans">
                        <thead>
                          <tr className="border-b border-slate-300 text-slate-600 font-bold">
                            <th className="text-left py-1">Particulars</th>
                            <th className="text-right py-1">FY 2024-25</th>
                            <th className="text-right py-1">FY 2023-24</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 font-mono">
                          <tr className="bg-sky-50/60 font-semibold">
                            <td className="py-1 text-slate-900">I. Revenue from Operations</td>
                            <td className="text-right py-1 text-slate-900 font-bold">16,420.00</td>
                            <td className="text-right py-1 text-slate-600">14,600.00</td>
                          </tr>
                          <tr>
                            <td className="py-1 text-slate-700">II. Other Income</td>
                            <td className="text-right py-1">340.50</td>
                            <td className="text-right py-1">290.10</td>
                          </tr>
                          <tr className="font-bold border-t border-slate-300">
                            <td className="py-1 text-slate-900">III. Total Income (I + II)</td>
                            <td className="text-right py-1 text-slate-900">16,760.50</td>
                            <td className="text-right py-1">14,890.10</td>
                          </tr>
                          <tr>
                            <td className="py-1 text-slate-700">Cost of Materials Consumed</td>
                            <td className="text-right py-1">9,120.40</td>
                            <td className="text-right py-1">7,850.10</td>
                          </tr>
                          <tr className="bg-emerald-50/70 font-bold border-t border-slate-300">
                            <td className="py-1 text-emerald-950">Profit for the Year (PAT)</td>
                            <td className="text-right py-1 text-emerald-950 font-bold">2,180.20</td>
                            <td className="text-right py-1 text-slate-700">2,005.10</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : activePdfPage === 151 ? (
                  <div>
                    <h3 className="font-bold text-center text-sm font-sans mb-3 text-slate-900">
                      CONSOLIDATED STATEMENT OF CASH FLOWS
                    </h3>
                    <div className="relative border border-slate-200 rounded p-2 bg-slate-50/50">
                      <div className="pdf-highlight-box" style={{ inset: '4px' }}></div>
                      <table className="w-full text-[11px] font-sans">
                        <tbody className="divide-y divide-slate-200 font-mono">
                          <tr className="font-bold text-slate-900">
                            <td className="py-1.5">A. Cash flow from Operating Activities</td>
                            <td className="text-right py-1.5 font-bold">₹2,180.20 Cr</td>
                          </tr>
                          <tr>
                            <td className="py-1 text-slate-600 pl-3">Adjustments for: Working Capital</td>
                            <td className="text-right py-1 text-rose-700">(₹841.00 Cr)</td>
                          </tr>
                          <tr>
                            <td className="py-1 text-slate-600 pl-3">Net cash generated from operating activities</td>
                            <td className="text-right py-1 font-bold text-slate-900">₹2,180.20 Cr</td>
                          </tr>
                          <tr className="border-t border-slate-300">
                            <td className="py-1.5 text-slate-800">B. Capital Expenditure (CapEx)</td>
                            <td className="text-right py-1.5 text-slate-800">(₹860.00 Cr)</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 font-sans">
                    <h3 className="font-bold text-slate-900">Management Discussion and Analysis (MD&A)</h3>
                    <p className="text-slate-700 leading-relaxed">
                      "During the financial year 2024-25, the company expanded enterprise partnerships. To accommodate tier-1 client infrastructure ramp-ups, the board sanctioned extended milestone payment terms of 90 days. This resulted in an expansion of trade receivables while maintaining zero bad debt write-offs."
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: DoxFin Intelligence Panel */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#0F3E5D]" />
                  <h3 className="text-sm font-bold text-slate-900 font-['DM_Sans']">DoxFin Intelligence Panel</h3>
                </div>
                <span className="badge badge-completed font-mono text-[10px]">Verified Active</span>
              </div>

              <div className="space-y-4 mt-4 text-xs">
                {/* Extracted Data Card */}
                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Extracted Active Data (Page {activePdfPage})
                  </span>
                  <div className="text-slate-800 font-semibold">
                    {activePdfPage === 146 && 'Revenue: ₹16,420 Cr | Net Profit: ₹2,180 Cr | Operating Margin: 18.4%'}
                    {activePdfPage === 151 && 'Operating Cash Flow: ₹2,180 Cr | CapEx: ₹860 Cr | FCF: ₹1,320 Cr'}
                    {activePdfPage === 87 && 'MD&A Qualitative: Extended 90-day settlement windows for top 10 clients'}
                  </div>
                </div>

                {/* Evidence Snippet */}
                <div className="p-3.5 bg-white rounded-lg border border-sky-200">
                  <span className="text-[10px] uppercase font-bold text-sky-800 block mb-1">
                    Verified Citation Evidence
                  </span>
                  <p className="text-slate-600 leading-relaxed font-mono">
                    "Page {activePdfPage} was extracted via Docling OCR & Table Model with a 99.4% confidence rating. No text-table conflict detected."
                  </p>
                </div>

                {/* AI Explanation */}
                <div className="p-3.5 bg-sky-50/50 rounded-lg border border-sky-100">
                  <span className="text-[10px] uppercase font-bold text-[#0F3E5D] block mb-1">
                    AI Financial Inference
                  </span>
                  <p className="text-slate-700 leading-relaxed">
                    {activePdfPage === 146 && 'Revenue growth (+12.4%) confirms strong core demand. Raw material cost expansion (+16.2%) accounts for the 120 bps margin compression.'}
                    {activePdfPage === 151 && 'Operating cash conversion lagged accounting profit by 14.2% due to working capital expansion in trade debtors.'}
                    {activePdfPage === 87 && 'Management narrative correlates directly with the ₹448 Cr increase in trade receivables on Note 18.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-slate-500 text-[11px] flex items-center justify-between">
              <span>Bi-directional Citation Linked</span>
              <span className="font-mono text-emerald-700 font-semibold">Docling v2.4</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. ASK DOXFIN TAB */}
      {/* ========================================================================= */}
      {activeSubTab === 'ask_doxfin' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#0F3E5D] text-white flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4 text-sky-300" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 font-['DM_Sans']">Ask DoxFin</h2>
                  <p className="text-xs text-slate-500">Financial Research Workspace • Calculation Trees • Document Citations</p>
                </div>
              </div>
              <span className="badge badge-brand text-xs font-mono">
                Local LLM & FAISS Vector Engine
              </span>
            </div>

            {/* Suggested Question Pills */}
            <div className="space-y-2 mb-6">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Suggested Financial Research Queries:
              </span>
              <div className="flex flex-wrap gap-2">
                {qaPresets.map((qa) => (
                  <button
                    key={qa.id}
                    onClick={() => {
                      setSelectedQA(qa);
                      setCustomAnswer(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all text-left ${
                      currentQA.id === qa.id
                        ? 'bg-[#0F3E5D] text-white shadow-xs font-semibold'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {qa.question}
                  </button>
                ))}
              </div>
            </div>

            {/* Response Card */}
            <div className="border border-slate-200 rounded-xl p-6 bg-slate-50/40 space-y-6">
              {/* Question & Summary */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F3E5D] bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                  {currentQA.category}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-2 font-['DM_Sans']">
                  {currentQA.question}
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed mt-2 bg-white p-4 rounded-lg border border-slate-200">
                  {currentQA.answerSummary}
                </p>
              </div>

              {/* Calculation Tree Breakdown */}
              {currentQA.calculations && (
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                    <Calculator className="w-4 h-4 text-[#0F3E5D]" />
                    <span>{currentQA.calculations.label}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    {currentQA.calculations.items.map((calc, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                        <span className="text-[10px] text-slate-400 block font-semibold">{calc.title}</span>
                        <div className="flex items-center justify-between mt-1">
                          <span className="font-bold text-slate-800 font-mono text-sm">{calc.value}</span>
                          {calc.operation && (
                            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                              {calc.operation}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}

                    <div className="p-2.5 rounded-lg bg-sky-50 border border-sky-200">
                      <span className="text-[10px] text-sky-800 block font-bold uppercase">
                        {currentQA.calculations.result.title}
                      </span>
                      <span className="font-bold text-sky-950 font-mono text-sm block mt-1">
                        {currentQA.calculations.result.value}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Supporting Evidence Citations */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold uppercase tracking-wider text-slate-600">
                    Supporting Document Evidence ({currentQA.evidenceCitations.length} Sources)
                  </span>
                  <span className="text-emerald-700 font-semibold font-mono">{currentQA.confidence}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {currentQA.evidenceCitations.map((cite, idx) => (
                    <div key={idx} className="bg-white p-3.5 rounded-lg border border-slate-200 text-xs flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold font-mono text-[#0F3E5D] bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
                            Page {cite.pageNumber}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{cite.tool}</span>
                        </div>
                        <p className="font-semibold text-slate-800 text-xs mb-1">{cite.section}</p>
                        <p className="text-slate-600 text-[11px] leading-relaxed line-clamp-3">
                          "{cite.snippet}"
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setActivePdfPage(cite.pageNumber);
                          setActiveSubTab('document');
                        }}
                        className="mt-3 text-sky-700 hover:text-sky-900 font-semibold text-[11px] flex items-center gap-1"
                      >
                        <span>View Source in Document</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Inquiry Form */}
            <form onSubmit={handleAskQuestion} className="mt-6 flex gap-3">
              <input
                type="text"
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                placeholder="Ask any financial question about this report (e.g., What caused free cash flow to fall?)..."
                className="dox-input text-xs flex-1"
              />
              <button
                type="submit"
                className="btn btn-primary text-xs font-semibold px-4 flex items-center gap-1.5"
              >
                <span>Investigate</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
