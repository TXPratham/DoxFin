import React from 'react';
import {
  FileText,
  Calculator,
  AlertTriangle,
  FileSearch,
  UserCheck,
  ShieldCheck,
  MessageSquare,
  Cpu,
  Server,
  Lock,
  Sparkles
} from 'lucide-react';
import type { ProcessingMode, DeploymentType } from '../types/finwise';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  processingMode: ProcessingMode;
  setProcessingMode: (mode: ProcessingMode) => void;
  deployment: DeploymentType;
  setDeployment: (dep: DeploymentType) => void;
  anomaliesCount: number;
  unreviewedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  processingMode,
  setProcessingMode,
  deployment,
  setDeployment,
  anomaliesCount,
  unreviewedCount
}) => {
  return (
    <header className="border-b border-gray-800 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
      {/* Top Banner Status Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between text-xs text-gray-400 border-b border-gray-800/50">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <Lock className="w-3.5 h-3.5" /> TLS 1.3 / AES-256 Encrypted
          </span>
          <span className="hidden sm:inline text-gray-600">|</span>
          <span className="hidden sm:flex items-center gap-1">
            Core Rule: <span className="text-gray-200 font-semibold">Python Calculates</span>, <span className="text-sky-400 font-semibold">RAG Provides Evidence</span>, <span className="text-purple-400 font-semibold">LLM Explains</span>
          </span>
        </div>

        {/* Dynamic Selectors */}
        <div className="flex items-center gap-4">
          {/* Hardware Adaptive Mode */}
          <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-md border border-gray-800">
            <Cpu className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-gray-400 mr-1">Hardware Mode:</span>
            <select
              value={processingMode}
              onChange={(e) => setProcessingMode(e.target.value as ProcessingMode)}
              className="bg-transparent text-sky-300 font-semibold cursor-pointer focus:outline-none"
            >
              <option value="lite" className="bg-slate-900 text-gray-200">Lite (Small VLM / Laptops)</option>
              <option value="balanced" className="bg-slate-900 text-gray-200">Balanced (Medium VLM / GPU)</option>
              <option value="performance" className="bg-slate-900 text-gray-200">Performance (Large VLM / Cloud GPU)</option>
            </select>
          </div>

          {/* Deployment Model */}
          <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-md border border-gray-800">
            <Server className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-gray-400 mr-1">Deploy:</span>
            <select
              value={deployment}
              onChange={(e) => setDeployment(e.target.value as DeploymentType)}
              className="bg-transparent text-purple-300 font-semibold cursor-pointer focus:outline-none"
            >
              <option value="saas" className="bg-slate-900 text-gray-200">FinWise SaaS</option>
              <option value="enterprise_local" className="bg-slate-900 text-gray-200">Enterprise Local</option>
              <option value="private_cloud" className="bg-slate-900 text-gray-200">Private Cloud</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Navbar Title & Tab Buttons */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo Branding */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <Sparkles className="w-6 h-6 text-white animate-glow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight font-heading">
                FinWise
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30 rounded">
                v2.4 Intelligence
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Multimodal Financial Document Intelligence Platform
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'pipeline'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                : 'text-gray-400 hover:text-gray-200 hover:bg-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            Document Pipeline
          </button>

          <button
            onClick={() => setActiveTab('engine')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'engine'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                : 'text-gray-400 hover:text-gray-200 hover:bg-slate-900'
            }`}
          >
            <Calculator className="w-4 h-4" />
            Financial Engine
          </button>

          <button
            onClick={() => setActiveTab('anomalies')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'anomalies'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-gray-400 hover:text-gray-200 hover:bg-slate-900'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            Anomalies
            {anomaliesCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {anomaliesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('rag_evidence')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'rag_evidence'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-gray-400 hover:text-gray-200 hover:bg-slate-900'
            }`}
          >
            <FileSearch className="w-4 h-4 text-cyan-400" />
            RAG Evidence
          </button>

          <button
            onClick={() => setActiveTab('human_loop')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'human_loop'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-gray-400 hover:text-gray-200 hover:bg-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4 text-amber-400" />
            Human-in-Loop
            {unreviewedCount > 0 && (
              <span className="bg-amber-500 text-black text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {unreviewedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'security'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-gray-400 hover:text-gray-200 hover:bg-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Security & License
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'chat'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-gray-400 hover:text-gray-200 hover:bg-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-purple-400" />
            AI Analyst
          </button>
        </nav>
      </div>
    </header>
  );
};
