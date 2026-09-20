import React, { useState } from 'react';
import {
  Search,
  ArrowRight
} from 'lucide-react';
import type { FinancialSignal, SeverityLevel } from '../types/doxfin';

interface AnomalyIntelligenceProps {
  signals: FinancialSignal[];
  onInvestigate: (signal: FinancialSignal) => void;
}

export const AnomalyIntelligence: React.FC<AnomalyIntelligenceProps> = ({
  signals,
  onInvestigate
}) => {
  const [severityFilter, setSeverityFilter] = useState<'ALL' | SeverityLevel>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSignals = signals.filter((sig) => {
    const matchesSeverity = severityFilter === 'ALL' || sig.severity === severityFilter;
    const matchesSearch =
      sig.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sig.signalType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sig.primarySummary.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 font-mono uppercase tracking-wider">
                Pattern Recognition Engine
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500">Deterministic Mathematical Heuristics</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-['DM_Sans']">
              Financial Signals
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Patterns detected from validated financial data across multiple years, statement notes, and cash flow schedules.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Total Signals:</span>
            <span className="text-sm font-bold text-slate-900 font-mono bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
              {signals.length} Detected
            </span>
          </div>
        </div>

        {/* Severity Filters & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-6 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 mr-1">Severity:</span>
            {(['ALL', 'high', 'moderate', 'low'] as const).map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  severityFilter === sev
                    ? 'bg-[#0F3E5D] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sev === 'ALL' ? 'All Signals' : sev.charAt(0).toUpperCase() + sev.slice(1)}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter signals..."
              className="dox-input text-xs pl-8"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>
      </div>

      {/* Financial Signal Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredSignals.map((signal) => (
          <div
            key={signal.id}
            className="dox-card p-6 bg-white border border-slate-200 flex flex-col justify-between space-y-4 hover:border-sky-300 transition-all shadow-xs"
          >
            <div>
              {/* Signal Top Metadata */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  signal.severity === 'high'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : signal.severity === 'moderate'
                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                    : 'bg-sky-50 text-sky-800 border border-sky-200'
                }`}>
                  {signal.signalType}
                </span>

                <span className="text-[11px] font-mono text-slate-500">
                  {signal.period}
                </span>
              </div>

              {/* Title & Core Summaries */}
              <h3 className="text-base font-bold text-slate-900 mt-3 font-['DM_Sans']">
                {signal.title}
              </h3>

              <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1 text-xs">
                <p className="font-semibold text-slate-800">{signal.primarySummary}</p>
                <p className="text-slate-500 text-[11px]">{signal.secondarySummary}</p>
              </div>

              {/* Metrics Involved */}
              <div className="mt-4 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Metrics Involved:
                </span>
                {signal.metricsInvolved.map((m, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-none">
                    <span className="text-slate-600 font-medium">{m.name}</span>
                    <span className={`font-mono font-semibold ${m.isAnomaly ? 'text-amber-800' : 'text-slate-800'}`}>
                      {m.change}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Attributes & CTA */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>{signal.evidenceCount} Citations Indexed</span>
                <span className="text-emerald-700 font-semibold">{signal.validationStatus}</span>
              </div>

              <button
                onClick={() => onInvestigate(signal)}
                className="w-full btn btn-primary py-2 text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <span>Investigate Signal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
