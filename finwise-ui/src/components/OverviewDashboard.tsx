import React from 'react';
import {
  FileText,
  Building2,
  Table2,
  AlertTriangle,
  Upload,
  ArrowUpRight,
  TrendingUp,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  BarChart3
} from 'lucide-react';
import type { DocumentInfo, FinancialSignal } from '../types/doxfin';

interface OverviewDashboardProps {
  documents: DocumentInfo[];
  signals?: FinancialSignal[];
  onOpenDocument: (doc: DocumentInfo) => void;
  onOpenUpload: () => void;
  onOpenAnomalies: () => void;
  onOpenProcessing: (doc?: DocumentInfo) => void;
  onOpenCompare: () => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  documents,
  onOpenDocument,
  onOpenUpload,
  onOpenAnomalies,
  onOpenProcessing,
  onOpenCompare
}) => {
  // Status Badge Helper
  const renderStatusBadge = (status: DocumentInfo['status']) => {
    switch (status) {
      case 'completed':
        return (
          <span className="badge badge-completed">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Completed
          </span>
        );
      case 'processing':
        return (
          <span className="badge badge-processing">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>
            Processing
          </span>
        );
      case 'verification_required':
        return (
          <span className="badge badge-warning">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            Verification Required
          </span>
        );
      case 'failed':
        return (
          <span className="badge badge-failed">
            Failed
          </span>
        );
      default:
        return <span className="badge badge-neutral">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-[#0F3E5D]/10 text-[#0F3E5D] font-mono uppercase tracking-wider">
              On-Premises Workstation
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500">v4.2 Docling & Ray Cluster</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-['DM_Sans']">
            Financial Intelligence
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Analyze reports, detect financial signals and investigate the numbers with verified table evidence and deterministic calculations.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={onOpenCompare}
            className="btn btn-secondary text-xs sm:text-sm font-medium"
          >
            <BarChart3 className="w-4 h-4 text-slate-600" />
            <span>Compare Reports</span>
          </button>
          <button
            onClick={onOpenUpload}
            className="btn btn-primary text-xs sm:text-sm font-semibold shadow-sm flex items-center gap-2"
          >
            <Upload className="w-4 h-4 text-sky-200" />
            <span>+ Analyze Document</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Documents Analyzed */}
        <div className="dox-card p-5 bg-white border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Documents Analyzed</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-100">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-['DM_Sans'] tabular-nums">42</div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+6 reports this month</span>
            </div>
          </div>
        </div>

        {/* Card 2: Companies Analyzed */}
        <div className="dox-card p-5 bg-white border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Companies Analyzed</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-['DM_Sans'] tabular-nums">18</div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-1">
              <span>NIFTY 50 & Enterprise Midcaps</span>
            </div>
          </div>
        </div>

        {/* Card 3: Financial Metrics Extracted */}
        <div className="dox-card p-5 bg-white border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Financial Metrics Extracted</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
              <Table2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-['DM_Sans'] tabular-nums">3,840</div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium mt-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>99.4% Docling extraction confidence</span>
            </div>
          </div>
        </div>

        {/* Card 4: Anomalies Detected */}
        <div
          onClick={onOpenAnomalies}
          className="dox-card p-5 bg-white border border-slate-200 flex flex-col justify-between cursor-pointer hover:border-amber-300 transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Anomalies Detected</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-['DM_Sans'] tabular-nums">14</div>
              <span className="text-xs text-amber-700 font-medium bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                3 high priority
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-sky-700 font-medium mt-1 hover:underline">
              <span>Investigate signals</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>

      {/* Primary Highlight Banner: ABC Industries Key Signals */}
      <div className="bg-gradient-to-r from-sky-50/80 via-white to-slate-50 border border-sky-100 rounded-xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-[#0F3E5D] text-white flex items-center justify-center flex-shrink-0 font-bold shadow-xs">
            <Sparkles className="w-5 h-5 text-sky-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">Active Document Intelligence: ABC Industries Ltd. (FY 2024-25)</h3>
              <span className="badge badge-completed">Verified</span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Revenue expanded <strong className="text-emerald-700 font-semibold">+12.4% (₹16,420 Cr)</strong> while Operating Margin compressed by <strong className="text-amber-700 font-semibold">-1.2% (18.4%)</strong>. Free Cash Flow contracted <strong className="text-rose-700 font-semibold">-16.8% (₹1,320 Cr)</strong> due to 90-day credit elongation in trade receivables.
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            const abcDoc = documents.find((d) => d.id === 'doc-abc-2025') || documents[0];
            onOpenDocument(abcDoc);
          }}
          className="btn btn-primary btn-sm flex-shrink-0"
        >
          <span>Open Analysis Workspace</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* RECENT DOCUMENTS TABLE */}
      <div className="dox-card p-6 bg-white border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-['DM_Sans']">Recent Documents</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Locally indexed financial statements, annual reports, and earnings filings
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-mono">
              Total {documents.length} files in local catalog
            </span>
          </div>
        </div>

        <div className="dox-table-container">
          <table className="dox-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Document</th>
                <th>Financial Year</th>
                <th>Pages</th>
                <th>Processing Mode</th>
                <th>Status</th>
                <th>Uploaded By</th>
                <th>Date</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Company */}
                  <td className="font-medium text-slate-900">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200">
                        {doc.company.charAt(0)}
                      </div>
                      <div>
                        <span className="font-semibold text-xs text-slate-900">{doc.company}</span>
                        {doc.ticker && (
                          <span className="block text-[10px] font-mono text-slate-400">{doc.ticker}</span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Document Name */}
                  <td>
                    <div className="text-xs font-mono text-slate-700 truncate max-w-[180px]" title={doc.documentName}>
                      {doc.documentName}
                    </div>
                    <span className="text-[10px] text-slate-400">{doc.fileSizeMB} MB</span>
                  </td>

                  {/* Financial Year */}
                  <td>
                    <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200/60">
                      {doc.financialYear}
                    </span>
                  </td>

                  {/* Pages */}
                  <td className="tabular-nums text-xs text-slate-700 font-medium">
                    {doc.pages} pages
                  </td>

                  {/* Processing Mode */}
                  <td>
                    <span className="text-[11px] font-medium capitalize px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {doc.processingMode}
                    </span>
                  </td>

                  {/* Status */}
                  <td>
                    {renderStatusBadge(doc.status)}
                  </td>

                  {/* Uploaded By */}
                  <td className="text-xs text-slate-600">
                    {doc.uploadedBy}
                  </td>

                  {/* Date */}
                  <td className="text-xs text-slate-500 font-mono">
                    {doc.date}
                  </td>

                  {/* Action */}
                  <td className="text-right">
                    {doc.status === 'completed' || doc.status === 'verification_required' ? (
                      <button
                        onClick={() => onOpenDocument(doc)}
                        className="btn btn-secondary btn-sm text-xs font-semibold text-[#0F3E5D] hover:text-sky-800"
                      >
                        <span>Analyze</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    ) : doc.status === 'processing' ? (
                      <button
                        onClick={() => onOpenProcessing(doc)}
                        className="btn btn-secondary btn-sm text-xs text-sky-700 font-medium"
                      >
                        <span>View Progress</span>
                      </button>
                    ) : (
                      <button
                        onClick={onOpenUpload}
                        className="btn btn-subtle btn-sm text-xs text-slate-500"
                      >
                        Retry
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
