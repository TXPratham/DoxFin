import React from 'react';
import {
  Search,
  UploadCloud,
  ShieldCheck,
  ChevronDown,
  Building,
  LogOut,
  Lock
} from 'lucide-react';
import type { DocumentInfo, ProcessingMode } from '../types/doxfin';

interface TopNavProps {
  currentDocument: DocumentInfo;
  allDocuments: DocumentInfo[];
  onSelectDocument: (doc: DocumentInfo) => void;
  processingMode: ProcessingMode;
  onSetProcessingMode: (mode: ProcessingMode) => void;
  onOpenUpload: () => void;
  onOpenSearch: () => void;
  onOpenLogin: () => void;
  isLoggedIn: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentDocument,
  allDocuments,
  onSelectDocument,
  processingMode,
  onSetProcessingMode,
  onOpenUpload,
  onOpenSearch,
  onOpenLogin,
  isLoggedIn
}) => {
  const [isDocDropdownOpen, setIsDocDropdownOpen] = React.useState(false);

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-20 flex items-center justify-between px-6 shadow-xs">
      {/* Left: Active Document Breadcrumb & Selector */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            onClick={() => setIsDocDropdownOpen(!isDocDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-100/70 transition-all text-left group"
          >
            <div className="w-7 h-7 rounded-md bg-[#0F3E5D]/10 text-[#0F3E5D] flex items-center justify-center font-bold text-xs">
              <Building className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-900 group-hover:text-sky-900">
                  {currentDocument.company}
                </span>
                <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 bg-slate-200/70 rounded text-slate-700">
                  {currentDocument.financialYear}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate max-w-[200px] sm:max-w-[280px]">
                {currentDocument.documentName} • {currentDocument.pages} pgs
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 ml-1" />
          </button>

          {/* Document Switcher Dropdown */}
          {isDocDropdownOpen && (
            <div
              className="absolute left-0 top-full mt-1.5 w-80 bg-white border border-slate-200 rounded-lg shadow-lg py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
              onMouseLeave={() => setIsDocDropdownOpen(false)}
            >
              <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                Switch Analyzed Document
              </div>
              <div className="max-h-64 overflow-y-auto">
                {allDocuments.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => {
                      onSelectDocument(doc);
                      setIsDocDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors ${
                      doc.id === currentDocument.id ? 'bg-sky-50/60 font-medium' : ''
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-semibold text-slate-800 truncate">{doc.company}</p>
                      <p className="text-[11px] text-slate-500 truncate">{doc.documentName}</p>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono flex-shrink-0">
                      {doc.financialYear}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Local Verification Status */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span className="font-medium">Processed locally</span>
          <span className="text-emerald-500">•</span>
          <span className="text-[11px] text-emerald-700">100% On-Premises</span>
        </div>
      </div>

      {/* Right: Search, Engine Mode, Upload CTA & Login Toggle */}
      <div className="flex items-center gap-3">
        {/* Global Search Button */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 text-xs transition-colors shadow-xs"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline">Search metrics, notes, pages...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-slate-100 text-slate-500 rounded border border-slate-200">
            Ctrl+K
          </kbd>
        </button>

        {/* Processing Mode Switcher */}
        <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
          <button
            onClick={() => onSetProcessingMode('lite')}
            className={`px-2 py-1 rounded text-xs font-medium transition-all ${
              processingMode === 'lite'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="PyMuPDF Fast Extraction"
          >
            Lite
          </button>
          <button
            onClick={() => onSetProcessingMode('balanced')}
            className={`px-2 py-1 rounded text-xs font-medium transition-all ${
              processingMode === 'balanced'
                ? 'bg-[#0F3E5D] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Docling + Qwen3-VL Hybrid Engine"
          >
            Balanced [Auto]
          </button>
          <button
            onClick={() => onSetProcessingMode('performance')}
            className={`px-2 py-1 rounded text-xs font-medium transition-all ${
              processingMode === 'performance'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Full Vision High Precision Ray Cluster"
          >
            Performance
          </button>
        </div>

        {/* Upload Action */}
        <button
          onClick={onOpenUpload}
          className="btn btn-primary btn-sm flex items-center gap-1.5 shadow-xs"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>Upload Document</span>
        </button>

        {/* Enterprise Login Portal Toggle */}
        <button
          onClick={onOpenLogin}
          className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
          title={isLoggedIn ? "Enterprise Auth (Switch / Log out)" : "Sign In to Local Server"}
        >
          {isLoggedIn ? <Lock className="w-4 h-4 text-emerald-600" /> : <LogOut className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
