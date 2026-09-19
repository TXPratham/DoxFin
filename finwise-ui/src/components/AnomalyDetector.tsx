import React, { useState } from 'react';
import {
  AlertTriangle,
  FileText,
  Search,
  ShieldAlert,
  Info,
  ChevronRight
} from 'lucide-react';
import type { Anomaly } from '../types/finwise';

interface AnomalyDetectorProps {
  anomalies: Anomaly[];
  onInspectEvidence: (pageNumber: number, document: string) => void;
}

export const AnomalyDetector: React.FC<AnomalyDetectorProps> = ({
  anomalies,
  onInspectEvidence
}) => {
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly>(anomalies[0]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge badge-crimson flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Automated Anomaly Detector
              </span>
              <span className="badge badge-amber">RAG Cause Investigation Engine</span>
            </div>
            <h2 className="text-2xl font-bold text-white font-heading">
              Financial Pattern & Anomaly Analysis
            </h2>
            <p className="text-sm text-gray-400 mt-1 max-w-3xl">
              Flags unusual relationships (e.g., Revenue rising while profits fall, operating cash flow deteriorating). Retrieves management explanation snippets from notes & MD&A.
            </p>
          </div>

          <div className="bg-slate-900 px-4 py-3 rounded-xl border border-rose-500/30 text-right">
            <span className="text-xs text-gray-400 block">Active Anomalies Detected</span>
            <span className="text-xl font-bold text-rose-400 font-mono">{anomalies.length} Flagged Pattern(s)</span>
          </div>
        </div>
      </div>

      {/* Main Split Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Anomaly List Feed */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
            Flagged Pattern Feed ({anomalies.length})
          </h3>

          {anomalies.map((anom) => {
            const isSelected = selectedAnomaly.id === anom.id;
            return (
              <div
                key={anom.id}
                onClick={() => setSelectedAnomaly(anom)}
                className={`glass-panel p-4 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-sky-500/60 bg-slate-900/90 shadow-lg shadow-sky-500/10'
                    : 'hover:border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {anom.severity === 'high' && (
                      <span className="badge badge-crimson">High Risk</span>
                    )}
                    {anom.severity === 'medium' && (
                      <span className="badge badge-amber">Medium Risk</span>
                    )}
                    <span className="text-xs text-gray-400 font-mono">
                      {anom.type}
                    </span>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-gray-500 transition ${isSelected ? 'translate-x-1 text-sky-400' : ''}`} />
                </div>

                <h4 className="text-base font-bold text-white font-heading mt-2">
                  {anom.title}
                </h4>

                {/* Metric comparison mini boxes */}
                <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                  <div className="bg-slate-950/80 p-2 rounded border border-gray-800">
                    <span className="text-gray-400 block text-[10px]">{anom.metric1.name}:</span>
                    <span className="text-sky-300 font-mono font-semibold">{anom.metric1.change}</span>
                  </div>

                  <div className="bg-slate-950/80 p-2 rounded border border-gray-800">
                    <span className="text-gray-400 block text-[10px]">{anom.metric2.name}:</span>
                    <span className="text-rose-400 font-mono font-semibold">{anom.metric2.change}</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-gray-800">
                  <span>Page {anom.sourcePage} Reference</span>
                  <span className="text-sky-400 font-mono">{anom.confidence}% Confidence</span>
                </div>
              </div>
            );
          })}

          <div className="bg-slate-900/60 p-4 rounded-xl border border-gray-800 text-xs text-gray-400 flex items-start gap-3">
            <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
            <p>
              <strong className="text-gray-200">Important Disclaimer:</strong> An automated anomaly flag indicates an unusual mathematical pattern and should not be automatically interpreted as fraud or wrongdoing.
            </p>
          </div>
        </div>

        {/* Detailed Anomaly Evidence & Reasoning Card */}
        <div className="lg:col-span-7">
          <div className="glass-panel p-6 space-y-6 sticky top-24">
            <div>
              <div className="flex items-center justify-between">
                <span className="badge badge-cyan">{selectedAnomaly.type}</span>
                <button
                  onClick={() => onInspectEvidence(selectedAnomaly.sourcePage, selectedAnomaly.sourceDocument)}
                  className="btn-primary text-xs"
                >
                  <Search className="w-3.5 h-3.5" />
                  Jump to Page {selectedAnomaly.sourcePage} Evidence
                </button>
              </div>

              <h3 className="text-xl font-bold text-white font-heading mt-3">
                {selectedAnomaly.title}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Source: <span className="text-gray-200">{selectedAnomaly.sourceDocument}</span> (Page {selectedAnomaly.sourcePage} • {selectedAnomaly.sourceSection})
              </p>
            </div>

            {/* If conflict exists */}
            {selectedAnomaly.tableVsTextConflict && (
              <div className="bg-rose-950/40 p-4 rounded-xl border border-rose-500/40 space-y-2">
                <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
                  <ShieldAlert className="w-4 h-4" /> Conflict Detected Between Table vs Text/Chart Source
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs mt-2">
                  <div className="bg-slate-900 p-2.5 rounded border border-gray-800">
                    <span className="text-gray-400 block text-[10px]">Table Extraction Value:</span>
                    <strong className="text-rose-400 font-mono">{selectedAnomaly.tableVsTextConflict.tableValue}</strong>
                    <span className="text-[10px] text-gray-500 block mt-1">{selectedAnomaly.tableVsTextConflict.tableSource}</span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded border border-gray-800">
                    <span className="text-gray-400 block text-[10px]">Text / Chart Value:</span>
                    <strong className="text-amber-400 font-mono">{selectedAnomaly.tableVsTextConflict.textValue}</strong>
                    <span className="text-[10px] text-gray-500 block mt-1">{selectedAnomaly.tableVsTextConflict.textSource}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Python Calculation Summary */}
            <div className="bg-slate-900/90 p-4 rounded-xl border border-gray-800 space-y-2">
              <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                1. Deterministic Python Finding
              </h4>
              <p className="text-sm text-gray-200 leading-relaxed">
                {selectedAnomaly.description}
              </p>
            </div>

            {/* RAG Vector Retrieval Evidence */}
            <div className="bg-slate-900/90 p-4 rounded-xl border border-sky-500/20 space-y-2">
              <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> 2. RAG Extracted Evidence Snippet (FAISS Vector Match)
              </h4>
              <blockquote className="text-xs text-cyan-200 italic bg-slate-950 p-3 rounded-lg border-l-2 border-cyan-400 font-mono">
                "{selectedAnomaly.ragEvidenceSnippet}"
              </blockquote>
            </div>

            {/* Management Explanation */}
            <div className="bg-slate-900/90 p-4 rounded-xl border border-purple-500/20 space-y-2">
              <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                3. LLM Synthesized Management Rationale
              </h4>
              <p className="text-xs text-purple-200 leading-relaxed">
                {selectedAnomaly.managementExplanation}
              </p>
            </div>

            {/* Footer confidence */}
            <div className="flex items-center justify-between text-xs pt-4 border-t border-gray-800 text-gray-400">
              <span>Confidence Score: <strong className="text-emerald-400 font-mono">{selectedAnomaly.confidence}%</strong></span>
              <span className="text-gray-500">Human-in-the-Loop Review: {selectedAnomaly.reviewStatus}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
