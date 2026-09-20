import React, { useState } from 'react';
import {
  Server,
  Cpu,
  HardDrive,
  Layers,
  Sparkles,
  ShieldCheck,
  Zap,
  Activity
} from 'lucide-react';
import type { SystemHardware, ProcessingMode } from '../types/doxfin';

interface LocalSystemDashboardProps {
  hardware: SystemHardware;
  processingMode: ProcessingMode;
  onSetProcessingMode: (mode: ProcessingMode) => void;
}

export const LocalSystemDashboard: React.FC<LocalSystemDashboardProps> = ({
  hardware,
  processingMode,
  onSetProcessingMode
}) => {
  const [autoSelectRecommended, setAutoSelectRecommended] = useState(true);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono uppercase tracking-wider">
                Node Status: Online
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-mono">Uptime: {hardware.uptime}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-['DM_Sans']">
              DoxFin Local System
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Local execution node telemetry, AI model weights, distributed document workers, and memory configuration.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <Server className="w-4 h-4 text-sky-700" />
            <span className="text-slate-700 font-semibold">Local IP:</span>
            <span className="text-[#0F3E5D] font-bold">{hardware.serverIp}</span>
          </div>
        </div>

        {/* Local Processing Guarantee Banner */}
        <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-emerald-50/80 via-white to-sky-50/60 border border-emerald-200/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider block">
                100% On-Premises Isolation Guaranteed
              </span>
              <p className="text-xs text-slate-600 mt-0.5">
                AI inference runs on this organization's infrastructure. No document embeddings or text chunks ever traverse external public APIs.
              </p>
            </div>
          </div>
          <span className="badge badge-completed font-mono text-xs flex-shrink-0">
            Air-Gapped Node
          </span>
        </div>
      </div>

      {/* Hardware Utilization Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CPU */}
        <div className="dox-card p-5 bg-white border border-slate-200 space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">CPU Compute</span>
            <Cpu className="w-4 h-4 text-sky-700" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 font-['DM_Sans'] tabular-nums">
              {hardware.cpuCores} Cores <span className="text-xs font-normal text-slate-400">({hardware.cpuUsagePercent}%)</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mt-2 border border-slate-200">
              <div className="bg-[#0F3E5D] h-full rounded-full" style={{ width: `${hardware.cpuUsagePercent}%` }}></div>
            </div>
          </div>
          <span className="text-[11px] text-slate-400 font-mono block truncate">{hardware.cpuModel}</span>
        </div>

        {/* RAM */}
        <div className="dox-card p-5 bg-white border border-slate-200 space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">System Memory</span>
            <Activity className="w-4 h-4 text-sky-700" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 font-['DM_Sans'] tabular-nums">
              {hardware.ramUsedGB} <span className="text-xs font-normal text-slate-400">/ {hardware.ramTotalGB} GB</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mt-2 border border-slate-200">
              <div className="bg-sky-600 h-full rounded-full" style={{ width: `${(hardware.ramUsedGB / hardware.ramTotalGB) * 100}%` }}></div>
            </div>
          </div>
          <span className="text-[11px] text-slate-400 font-mono block">4.6 GB Free for Ray Pool</span>
        </div>

        {/* GPU */}
        <div className="dox-card p-5 bg-white border border-slate-200 space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">GPU Acceleration</span>
            <Zap className="w-4 h-4 text-indigo-700" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 font-['DM_Sans'] tabular-nums">
              {hardware.gpuUsagePercent}% <span className="text-xs font-normal text-slate-400">Active</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mt-2 border border-slate-200">
              <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${hardware.gpuUsagePercent}%` }}></div>
            </div>
          </div>
          <span className="text-[11px] text-slate-400 font-mono block truncate">{hardware.gpuModel}</span>
        </div>

        {/* VRAM */}
        <div className="dox-card p-5 bg-white border border-slate-200 space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">VRAM Allocation</span>
            <HardDrive className="w-4 h-4 text-amber-700" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 font-['DM_Sans'] tabular-nums">
              {hardware.vramUsedGB} <span className="text-xs font-normal text-slate-400">/ {hardware.vramTotalGB} GB</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mt-2 border border-slate-200">
              <div className="bg-amber-600 h-full rounded-full" style={{ width: `${(hardware.vramUsedGB / hardware.vramTotalGB) * 100}%` }}></div>
            </div>
          </div>
          <span className="text-[11px] text-slate-400 font-mono block">Quantized Weights Resident</span>
        </div>
      </div>

      {/* AI Models & Document Engine Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* AI Models Status */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#0F3E5D]" />
              <h2 className="text-base font-bold text-slate-900 font-['DM_Sans']">AI Model Weights</h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">Local Quantized Models</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Vision Model</span>
                <span className="text-xs font-bold text-slate-900 font-mono">Qwen3-VL (Vision-Language Model)</span>
                <p className="text-[11px] text-slate-500 mt-0.5">Processes financial bar charts, line graphs, and executive infographics</p>
              </div>
              <span className="badge badge-completed font-mono text-[10px]">Active</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Financial Explanation Model</span>
                <span className="text-xs font-bold text-slate-900 font-mono">Local LLM (DeepSeek / Llama-3.3-Fin)</span>
                <p className="text-[11px] text-slate-500 mt-0.5">Synthesizes evidence-grounded answers without hallucination</p>
              </div>
              <span className="badge badge-completed font-mono text-[10px]">Active</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Embedding Model</span>
                <span className="text-xs font-bold text-slate-900 font-mono">BAAI/bge-m3 (Local Dense & Sparse Embedding)</span>
                <p className="text-[11px] text-slate-500 mt-0.5">Multi-lingual 8192 token financial semantic indexing</p>
              </div>
              <span className="badge badge-completed font-mono text-[10px]">Active</span>
            </div>
          </div>
        </div>

        {/* Document Engine Components */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#0F3E5D]" />
              <h2 className="text-base font-bold text-slate-900 font-['DM_Sans']">Document Engine Status</h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">5 Core Services</span>
          </div>

          <div className="space-y-2.5 text-xs">
            {[
              { name: 'PyMuPDF', desc: 'Fast PDF stream text & layout parser', status: 'Active' },
              { name: 'Docling', desc: 'Deep learning table structure & cell coordinates', status: 'Active' },
              { name: 'Ray Cluster', desc: 'Distributed parallel page execution (4 workers)', status: 'Active' },
              { name: 'FAISS Vector Store', desc: 'Local vector database with 12,480 chunk vectors', status: 'Active' },
              { name: 'PostgreSQL', desc: 'Relational storage for normalized financial statements', status: 'Active' }
            ].map((srv, idx) => (
              <div key={idx} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 font-mono">{srv.name}</span>
                  <span className="text-slate-500 text-[11px] block">{srv.desc}</span>
                </div>
                <span className="badge badge-completed font-mono text-[10px]">{srv.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Processing Mode Configuration */}
      <div className="dox-card p-6 bg-white border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-['DM_Sans']">Processing Mode Configuration</h3>
            <p className="text-xs text-slate-500">Tailor pipeline latency vs precision according to local hardware capacity</p>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={autoSelectRecommended}
              onChange={(e) => setAutoSelectRecommended(e.target.checked)}
              className="rounded text-sky-600 focus:ring-sky-500"
            />
            <span>Auto Select Recommended Mode (BALANCED)</span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Lite */}
          <div
            onClick={() => onSetProcessingMode('lite')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              processingMode === 'lite'
                ? 'border-[#0F3E5D] bg-sky-50/50 ring-2 ring-[#0F3E5D]/10'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-900 font-mono text-sm">LITE</span>
              {processingMode === 'lite' && <span className="badge badge-brand">Selected</span>}
            </div>
            <p className="text-slate-600 text-xs">
              Fast PyMuPDF extraction without deep vision VLM charts. Best for quick reading on low-resource machines.
            </p>
          </div>

          {/* Balanced */}
          <div
            onClick={() => onSetProcessingMode('balanced')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              processingMode === 'balanced'
                ? 'border-[#0F3E5D] bg-sky-50/50 ring-2 ring-[#0F3E5D]/10'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 font-mono text-sm">BALANCED</span>
                <span className="badge badge-completed text-[10px]">Recommended</span>
              </div>
              {processingMode === 'balanced' && <span className="badge badge-brand">Selected</span>}
            </div>
            <p className="text-slate-600 text-xs">
              Hybrid Docling table extraction + quantized Qwen3-VL for charts with Ray 4 workers.
            </p>
          </div>

          {/* Performance */}
          <div
            onClick={() => onSetProcessingMode('performance')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              processingMode === 'performance'
                ? 'border-[#0F3E5D] bg-sky-50/50 ring-2 ring-[#0F3E5D]/10'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-900 font-mono text-sm">PERFORMANCE</span>
              {processingMode === 'performance' && <span className="badge badge-brand">Selected</span>}
            </div>
            <p className="text-slate-600 text-xs">
              Full unquantized vision model passes on every page with maximum RAG chunk overlapping and dense cross-verification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
