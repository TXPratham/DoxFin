import React, { useState } from 'react';
import {
  Cpu,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  ArrowRight,
  Shield
} from 'lucide-react';
import type { DocumentInfo, PipelineStage, SystemHardware } from '../types/doxfin';

interface ProcessingScreenProps {
  document: DocumentInfo;
  pipelineStages: PipelineStage[];
  hardware?: SystemHardware;
  onViewAnalysis: (doc: DocumentInfo) => void;
}

export const ProcessingScreen: React.FC<ProcessingScreenProps> = ({
  document,
  pipelineStages: initialStages,
  onViewAnalysis
}) => {
  const [progress, setProgress] = useState(64);
  const [processedPages, setProcessedPages] = useState(274);
  const [stages, setStages] = useState<PipelineStage[]>(initialStages);

  // Status icon helper
  const renderStageStatusBadge = (status: PipelineStage['status']) => {
    switch (status) {
      case 'completed':
        return (
          <span className="badge badge-completed">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Completed
          </span>
        );
      case 'running':
        return (
          <span className="badge badge-processing">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-ping"></span>
            Running
          </span>
        );
      case 'waiting':
        return (
          <span className="badge badge-neutral">
            <Clock className="w-3 h-3 text-slate-400" />
            Waiting
          </span>
        );
      case 'failed':
        return (
          <span className="badge badge-failed">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            Failed
          </span>
        );
    }
  };

  const isCompleted = progress >= 100;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Banner with Document Info & Overall Progress */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-[#0F3E5D] border border-sky-100 flex items-center justify-center font-bold flex-shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-['DM_Sans']">
                  {document.company}
                </h1>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                  {document.financialYear}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                {document.documentName} • {document.pages} pages • Mode: <span className="font-semibold text-slate-700 uppercase">{document.processingMode}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setProgress(100);
                setProcessedPages(document.pages);
                setStages(stages.map((s) => ({ ...s, status: 'completed' })));
              }}
              className="btn btn-secondary btn-sm text-xs"
            >
              Simulate Instant Ready
            </button>
            <button
              onClick={() => onViewAnalysis(document)}
              className="btn btn-primary btn-sm text-xs font-semibold flex items-center gap-1.5"
            >
              <span>{isCompleted ? 'Open Analysis Workspace' : 'Inspect Extracted Data'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Clean Horizontal Progress Bar */}
        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">Overall Pipeline Progress</span>
            <span className="font-mono font-bold text-sky-800 text-sm tabular-nums">{progress}%</span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200">
            <div
              className="bg-gradient-to-r from-[#0F3E5D] to-sky-600 h-full rounded-full transition-all duration-500 relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-[pulse_2s_infinite]"></div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span>Stage 5 of 10: Chart Analysis & Table Normalization</span>
            <span className="font-mono">Estimated remaining: ~18 seconds</span>
          </div>
        </div>
      </div>

      {/* 4 Primary Extraction Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="dox-card p-4 bg-white border border-slate-200">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Pages Processed</span>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 font-['DM_Sans'] tabular-nums mt-1">
            {processedPages} <span className="text-xs font-normal text-slate-400">/ {document.pages}</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-medium">64.0% scanned</span>
        </div>

        <div className="dox-card p-4 bg-white border border-slate-200">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Tables Found</span>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 font-['DM_Sans'] tabular-nums mt-1">
            83
          </div>
          <span className="text-[11px] text-sky-700 font-medium">Docling Table Model</span>
        </div>

        <div className="dox-card p-4 bg-white border border-slate-200">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Financial Charts</span>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 font-['DM_Sans'] tabular-nums mt-1">
            27
          </div>
          <span className="text-[11px] text-indigo-700 font-medium">Qwen3-VL Vision</span>
        </div>

        <div className="dox-card p-4 bg-white border border-slate-200">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Metrics Extracted</span>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 font-['DM_Sans'] tabular-nums mt-1">
            146
          </div>
          <span className="text-[11px] text-emerald-700 font-medium">P&L, Balance Sheet, Ratios</span>
        </div>
      </div>

      {/* Main Grid: Pipeline Sequence (Left) + System Utilization Telemetry (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Processing Pipeline Stages */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-['DM_Sans']">Processing Pipeline Stages</h2>
              <p className="text-xs text-slate-500">Autonomous 10-step document validation and financial extraction sequence</p>
            </div>
            <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
              Ray Distributed Graph
            </span>
          </div>

          <div className="space-y-3">
            {stages.map((stage, idx) => (
              <div
                key={stage.id}
                className={`p-3.5 rounded-lg border transition-all flex items-start justify-between gap-3 ${
                  stage.status === 'running'
                    ? 'border-sky-300 bg-sky-50/40 shadow-xs'
                    : stage.status === 'completed'
                    ? 'border-slate-200 bg-white hover:bg-slate-50/60'
                    : 'border-slate-150 bg-slate-50/40 opacity-70'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5 ${
                      stage.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : stage.status === 'running'
                        ? 'bg-sky-100 text-sky-800 animate-pulse'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{stage.name}</span>
                      {stage.toolUsed && (
                        <span className="text-[10px] font-mono text-slate-400">({stage.toolUsed})</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{stage.description}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  {renderStageStatusBadge(stage.status)}
                  {stage.timeTaken && (
                    <span className="text-[10px] font-mono text-slate-400">{stage.timeTaken}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hardware Utilization Telemetry Panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-sky-800" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  System Utilization
                </h3>
              </div>
              <span className="text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                Local Host
              </span>
            </div>

            <div className="space-y-4 text-xs">
              {/* CPU */}
              <div>
                <div className="flex justify-between text-slate-700 mb-1">
                  <span className="font-semibold">CPU Utilization</span>
                  <span className="font-mono font-bold text-slate-900">62%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                  <div className="bg-[#0F3E5D] h-full rounded-full" style={{ width: '62%' }}></div>
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">8 Cores active • 4 Ray worker threads</span>
              </div>

              {/* RAM */}
              <div>
                <div className="flex justify-between text-slate-700 mb-1">
                  <span className="font-semibold">System Memory (RAM)</span>
                  <span className="font-mono font-bold text-slate-900">11.4 / 16 GB (71%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                  <div className="bg-sky-600 h-full rounded-full" style={{ width: '71%' }}></div>
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">4.6 GB available buffer</span>
              </div>

              {/* GPU */}
              <div>
                <div className="flex justify-between text-slate-700 mb-1">
                  <span className="font-semibold">GPU Core (RTX 3050)</span>
                  <span className="font-mono font-bold text-slate-900">71%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: '71%' }}></div>
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">CUDA Compute Shader active</span>
              </div>

              {/* VRAM */}
              <div>
                <div className="flex justify-between text-slate-700 mb-1">
                  <span className="font-semibold">VRAM (Video Memory)</span>
                  <span className="font-mono font-bold text-slate-900">3.2 / 4 GB (80%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                  <div className="bg-amber-600 h-full rounded-full" style={{ width: '80%' }}></div>
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">Qwen3-VL 4-bit quantization loaded</span>
              </div>
            </div>

            {/* Ray Workers Status */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-lg">
              <span className="text-slate-600 font-medium">Ray Workers:</span>
              <span className="font-mono font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded">
                4 Active
              </span>
            </div>
          </div>

          {/* Privacy Footnote Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-800">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Zero-Egress Processing</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              All OCR, table extraction, and ratio derivations are executing entirely within the local server runtime. No external network requests are made.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
