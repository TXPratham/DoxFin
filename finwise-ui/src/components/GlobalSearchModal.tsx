import React, { useState, useEffect } from 'react';
import {
  Search,
  X,
  Table2,
  AlertTriangle,
  Building,
  ChevronRight
} from 'lucide-react';
import type { FinancialMetricItem, FinancialSignal, DocumentInfo } from '../types/doxfin';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: FinancialMetricItem[];
  signals: FinancialSignal[];
  documents: DocumentInfo[];
  onSelectMetric: (m: FinancialMetricItem) => void;
  onSelectSignal: (s: FinancialSignal) => void;
  onSelectDocument: (d: DocumentInfo) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  metrics,
  signals,
  documents,
  onSelectMetric,
  onSelectSignal,
  onSelectDocument
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredMetrics = metrics.filter(
    (m) =>
      m.name.toLowerCase().includes(query.toLowerCase()) ||
      m.category.toLowerCase().includes(query.toLowerCase()) ||
      String(m.sourcePage).includes(query)
  );

  const filteredSignals = signals.filter(
    (s) =>
      s.title.toLowerCase().includes(query.toLowerCase()) ||
      s.signalType.toLowerCase().includes(query.toLowerCase())
  );

  const filteredDocs = documents.filter(
    (d) =>
      d.company.toLowerCase().includes(query.toLowerCase()) ||
      d.documentName.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-start justify-center p-4 pt-20">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
          <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search financial metrics, statements, pages, signals, or companies..."
            className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 font-medium"
          />
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Results List */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4 text-xs">
          {/* Metrics Results */}
          {filteredMetrics.length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Financial Metrics & Statements ({filteredMetrics.length})
              </span>
              <div className="space-y-1">
                {filteredMetrics.slice(0, 5).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      onSelectMetric(m);
                      onClose();
                    }}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-sky-50/70 border border-transparent hover:border-sky-100 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Table2 className="w-4 h-4 text-sky-700" />
                      <div>
                        <span className="font-semibold text-slate-800 group-hover:text-sky-900 block">
                          {m.name}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {m.category} • Page {m.sourcePage} ({m.sourceSection})
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900 font-mono">
                        {typeof m.fy25 === 'number' ? `₹${m.fy25.toLocaleString()} Cr` : m.fy25}
                      </span>
                      <span className={`block text-[10px] font-semibold ${m.isNegativeChange ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {m.changeYoY}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Signals Results */}
          {filteredSignals.length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Financial Signals ({filteredSignals.length})
              </span>
              <div className="space-y-1">
                {filteredSignals.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      onSelectSignal(s);
                      onClose();
                    }}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-amber-50/70 border border-transparent hover:border-amber-100 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <div>
                        <span className="font-semibold text-slate-800 group-hover:text-amber-900 block">
                          {s.title}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {s.primarySummary}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Companies Results */}
          {filteredDocs.length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Companies & Indexed Reports
              </span>
              <div className="space-y-1">
                {filteredDocs.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => {
                      onSelectDocument(doc);
                      onClose();
                    }}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Building className="w-4 h-4 text-slate-600" />
                      <div>
                        <span className="font-semibold text-slate-800 group-hover:text-slate-900 block">
                          {doc.company}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {doc.documentName} • {doc.pages} pages
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {doc.financialYear}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Navigate with arrows • Press ESC to dismiss</span>
          <span className="font-mono">Local FAISS Index</span>
        </div>
      </div>
    </div>
  );
};
