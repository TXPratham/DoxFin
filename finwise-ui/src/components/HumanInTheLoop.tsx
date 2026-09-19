import React, { useState } from 'react';
import {
  UserCheck,
  CheckCircle2,
  Edit3,
  ThumbsUp
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Anomaly } from '../types/finwise';

interface HumanInTheLoopProps {
  anomalies: Anomaly[];
  onUpdateStatus: (id: string, newStatus: 'approved' | 'corrected' | 'overridden' | 'unreviewed') => void;
}

export const HumanInTheLoop: React.FC<HumanInTheLoopProps> = ({
  anomalies,
  onUpdateStatus
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [customNotes, setCustomNotes] = useState<string>('');

  const triggerConfetti = () => {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.7 }
    });
  };

  const handleApprove = (id: string) => {
    onUpdateStatus(id, 'approved');
    triggerConfetti();
  };

  const handleCorrect = (id: string) => {
    onUpdateStatus(id, 'corrected');
    setEditingId(null);
    triggerConfetti();
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="glass-panel p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge badge-amber flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5" /> Human-in-the-Loop Control Layer
              </span>
              <span className="badge badge-cyan">Confidence Threshold Verification</span>
            </div>
            <h2 className="text-2xl font-bold text-white font-heading">
              Analyst Verification & Review Queue
            </h2>
            <p className="text-sm text-gray-400 mt-1 max-w-3xl">
              Outputs with low confidence (&lt;75%) or source discrepancies (Table vs Text/Chart conflicts) are routed to financial analysts before final report export.
            </p>
          </div>

          <div className="bg-slate-900 px-4 py-3 rounded-xl border border-amber-500/30 text-right">
            <span className="text-xs text-gray-400 block">Threshold Rules</span>
            <span className="text-xs font-mono text-emerald-400 block">≥98%: Auto Output</span>
            <span className="text-xs font-mono text-amber-400 block">75-97%: Warning</span>
            <span className="text-xs font-mono text-rose-400 block">&lt;75%: Mandatory Analyst Review</span>
          </div>
        </div>
      </div>

      {/* Review Queue Cards */}
      <div className="space-y-4">
        {anomalies.map((anom) => {
          const isApproved = anom.reviewStatus === 'approved';
          const isCorrected = anom.reviewStatus === 'corrected';

          return (
            <div
              key={anom.id}
              className={`glass-panel p-6 border-l-4 ${
                isApproved
                  ? 'border-l-emerald-500 bg-slate-900/60'
                  : isCorrected
                  ? 'border-l-sky-500 bg-slate-900/60'
                  : 'border-l-amber-500 bg-slate-900/90'
              }`}
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="badge badge-amber text-[10px]">
                      Confidence: {anom.confidence}%
                    </span>
                    <span className="text-xs text-gray-400 font-mono">
                      {anom.type}
                    </span>
                    {isApproved && (
                      <span className="badge badge-emerald flex items-center gap-1 text-[10px]">
                        <CheckCircle2 className="w-3 h-3" /> Approved by Analyst
                      </span>
                    )}
                    {isCorrected && (
                      <span className="badge badge-cyan flex items-center gap-1 text-[10px]">
                        <Edit3 className="w-3 h-3" /> Corrected with Analyst Note
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-white font-heading">
                    {anom.title}
                  </h3>
                  <p className="text-xs text-gray-400">
                    Source: <strong className="text-gray-200">{anom.sourceDocument}</strong> (Page {anom.sourcePage})
                  </p>
                </div>

                {/* Status or Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  {!isApproved && !isCorrected && (
                    <>
                      <button
                        onClick={() => handleApprove(anom.id)}
                        className="btn-primary bg-emerald-600 hover:bg-emerald-700 border-emerald-500 text-xs"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        Approve AI Extraction
                      </button>

                      <button
                        onClick={() => setEditingId(editingId === anom.id ? null : anom.id)}
                        className="btn-secondary text-xs"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Correct Extraction
                      </button>
                    </>
                  )}

                  {(isApproved || isCorrected) && (
                    <button
                      onClick={() => onUpdateStatus(anom.id, 'unreviewed')}
                      className="btn-secondary text-xs text-gray-400 hover:text-white"
                    >
                      Re-open Review
                    </button>
                  )}
                </div>
              </div>

              {/* Extraction Detail */}
              <div className="mt-4 pt-4 border-t border-gray-800 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-950 p-3 rounded-lg border border-gray-800">
                  <span className="text-sky-400 font-bold block mb-1">AI Extracted Value & RAG Snippet:</span>
                  <p className="text-gray-300 italic font-mono">
                    "{anom.ragEvidenceSnippet}"
                  </p>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-gray-800">
                  <span className="text-purple-400 font-bold block mb-1">LLM Recommendation:</span>
                  <p className="text-gray-300">
                    {anom.managementExplanation}
                  </p>
                </div>
              </div>

              {/* Editing Form */}
              {editingId === anom.id && (
                <div className="mt-4 p-4 bg-slate-950 rounded-xl border border-sky-500/40 space-y-3">
                  <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                    Provide Analyst Override / Correction Note
                  </h4>
                  <textarea
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    placeholder="Enter verified financial number or note (e.g., Confirmed Gross Debt ₹820 Cr from Note 14; Net Debt ₹280 Cr is after ₹540 Cr cash offset)..."
                    className="w-full bg-slate-900 text-xs text-gray-200 p-3 rounded-lg border border-gray-800 focus:outline-none focus:border-sky-500 min-h-[70px]"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditingId(null)}
                      className="btn-secondary text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleCorrect(anom.id)}
                      className="btn-primary text-xs"
                    >
                      Submit Correction & Approve
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
