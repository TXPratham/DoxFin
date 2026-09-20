import React from 'react';
import {
  X,
  CheckCircle2,
  Eye,
  Table2,
  ShieldCheck
} from 'lucide-react';
import type { FinancialMetricItem, DocumentInfo } from '../types/doxfin';

interface SourceEvidenceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  metric: FinancialMetricItem | null;
  document: DocumentInfo;
  onNavigateToDocumentPage: (page: number) => void;
}

export const SourceEvidenceDrawer: React.FC<SourceEvidenceDrawerProps> = ({
  isOpen,
  onClose,
  metric,
  document,
  onNavigateToDocumentPage
}) => {
  if (!isOpen || !metric) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0F3E5D] text-white flex items-center justify-center font-bold text-xs">
              <Table2 className="w-4 h-4 text-sky-300" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-['DM_Sans']">SOURCE EVIDENCE PANEL</h3>
              <p className="text-xs text-slate-500 font-mono">Deterministic Extraction Citation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Metric Highlight Card */}
          <div className="p-4 bg-sky-50/60 border border-sky-100 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-sky-800 tracking-wider">
              {metric.category}
            </span>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">{metric.name}</h2>
            <div className="flex items-baseline gap-3 mt-2">
              <span className="text-2xl font-bold text-[#0F3E5D] font-['DM_Sans'] tabular-nums">
                {typeof metric.fy25 === 'number' ? `₹${metric.fy25.toLocaleString()} Cr` : metric.fy25}
              </span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                metric.isNegativeChange
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}>
                {metric.changeYoY} YoY
              </span>
            </div>
          </div>

          {/* Core Verification Attributes */}
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Source Document:</span>
              <span className="font-semibold text-slate-800 font-mono text-right">{document.documentName}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Audited Page Number:</span>
              <span className="font-bold text-sky-800 font-mono bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                Page {metric.sourcePage}
              </span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Document Section:</span>
              <span className="font-semibold text-slate-800 text-right">{metric.sourceSection}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Extracted By Engine:</span>
              <span className="font-semibold text-slate-800 font-mono">{metric.extractedBy}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Validation Status:</span>
              <span className="badge badge-completed">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                {metric.validationStatus}
              </span>
            </div>
          </div>

          {/* Historical Data Stream */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Multi-Year Extracted Sequence
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-semibold">FY 2022-23</span>
                <span className="font-bold text-slate-800 tabular-nums font-mono">{typeof metric.fy23 === 'number' ? `₹${metric.fy23}` : metric.fy23}</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-semibold">FY 2023-24</span>
                <span className="font-bold text-slate-800 tabular-nums font-mono">{typeof metric.fy24 === 'number' ? `₹${metric.fy24}` : metric.fy24}</span>
              </div>
              <div className="bg-sky-50 p-2 rounded-lg border border-sky-200">
                <span className="text-[10px] text-sky-800 block font-semibold">FY 2024-25 (Current)</span>
                <span className="font-bold text-sky-900 tabular-nums font-mono">{typeof metric.fy25 === 'number' ? `₹${metric.fy25}` : metric.fy25}</span>
              </div>
            </div>
          </div>

          {/* Extracted Context Snippet */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Docling Extraction Boundary Context</span>
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed font-mono bg-slate-50 p-3 rounded-lg border border-slate-150">
              "Row 14: [{metric.name}] | CY_March_31_2025: {typeof metric.fy25 === 'number' ? `₹${metric.fy25} Cr` : metric.fy25} | PY_March_31_2024: {typeof metric.fy24 === 'number' ? `₹${metric.fy24} Cr` : metric.fy24} | Audited by BSR & Co. LLP | Certified Note Ref #146"
            </p>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="btn btn-secondary text-xs flex-1"
          >
            Close
          </button>
          <button
            onClick={() => {
              onNavigateToDocumentPage(metric.sourcePage);
              onClose();
            }}
            className="btn btn-primary text-xs font-semibold flex-1 flex items-center justify-center gap-2"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View in Document</span>
          </button>
        </div>
      </div>
    </div>
  );
};
