import React from 'react';
import {
  X,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Sparkles,
  Eye
} from 'lucide-react';
import type { FinancialSignal } from '../types/doxfin';

interface AnomalyInvestigationModalProps {
  isOpen: boolean;
  onClose: () => void;
  signal: FinancialSignal | null;
  onViewEvidencePage: (page: number) => void;
}

export const AnomalyInvestigationModal: React.FC<AnomalyInvestigationModalProps> = ({
  isOpen,
  onClose,
  signal,
  onViewEvidencePage
}) => {
  if (!isOpen || !signal) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-5xl w-full shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-800 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {signal.signalType}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-medium text-slate-500">{signal.period}</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5 font-['DM_Sans']">
                {signal.detailedQuestion}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3-Column Layout: Pattern (Left) | AI Explanation (Center) | Evidence Cards (Right) */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#F7F9FC]">
          {/* Left Side: Financial Pattern */}
          <div className="lg:col-span-3 bg-white p-4 rounded-xl border border-slate-200 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block pb-1 border-b border-slate-100">
              Financial Pattern
            </span>

            <div className="space-y-2.5">
              {signal.financialPattern.map((pat, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                  <span className="text-[11px] text-slate-500 block font-medium">{pat.label}</span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-sm font-bold text-slate-900 font-mono">{pat.metric}</span>
                    <span className={`text-xs font-semibold px-1.5 py-0.2 rounded flex items-center gap-0.5 ${
                      pat.direction === 'up' && pat.badgeColor === 'emerald'
                        ? 'bg-emerald-100 text-emerald-800'
                        : pat.direction === 'up' && pat.badgeColor === 'rose'
                        ? 'bg-rose-100 text-rose-800'
                        : pat.direction === 'down'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {pat.direction === 'up' ? <ArrowUpRight className="w-3 h-3" /> : pat.direction === 'down' ? <ArrowDownRight className="w-3 h-3" /> : null}
                      <span>{pat.percent}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 text-[11px] text-slate-500">
              <span className="font-semibold text-slate-700">Validation:</span> {signal.validationStatus}
            </div>
          </div>

          {/* Center: AI Explanation */}
          <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 pb-2 mb-3 border-b border-slate-100">
                <Sparkles className="w-4 h-4 text-[#0F3E5D]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  AI Synthesized Explanation
                </h3>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed bg-sky-50/40 p-4 rounded-lg border border-sky-100">
                "{signal.aiExplanation}"
              </p>

              <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
                <div className="font-semibold text-slate-800">Deterministic Cross-Statement Finding:</div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Income statement recognition was valid, while cash conversion divergence was accounted for by documented trade debtor credit extensions on Note 18.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-[11px] font-semibold text-slate-600 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>AI explanation based on retrieved document evidence.</span>
            </div>
          </div>

          {/* Right Side: Clickable Evidence Cards */}
          <div className="lg:col-span-4 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Document Evidence ({signal.evidenceCards.length} Citations)
            </span>

            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
              {signal.evidenceCards.map((card, idx) => (
                <div
                  key={idx}
                  onClick={() => onViewEvidencePage(card.pageNumber)}
                  className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-sky-400 cursor-pointer transition-all shadow-xs group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold font-mono text-[#0F3E5D] bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                      Page {card.pageNumber}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{card.tool}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 group-hover:text-sky-800">
                    {card.section}
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                    "{card.snippet}"
                  </p>
                  <div className="mt-2 flex items-center gap-1 text-[11px] text-sky-700 font-medium group-hover:underline">
                    <Eye className="w-3 h-3" />
                    <span>Open in Document Viewer</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-white flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Signal Verified • Docling Native Bounding Box
          </span>
          <button onClick={onClose} className="btn btn-secondary text-xs">
            Close Investigation
          </button>
        </div>
      </div>
    </div>
  );
};
