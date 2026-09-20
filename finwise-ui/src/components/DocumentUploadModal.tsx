import React, { useState } from 'react';
import {
  UploadCloud,
  FileText,
  Cpu,
  Sparkles,
  Shield,
  X,
  ArrowRight
} from 'lucide-react';
import type { DocumentInfo, ProcessingMode, SystemHardware } from '../types/doxfin';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartAnalysis: (newDoc: DocumentInfo) => void;
  hardware: SystemHardware;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  onStartAnalysis,
  hardware
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    sizeMB: number;
    pages: number;
  }>({
    name: 'ABC_Industries_Annual_Report_2025.pdf',
    sizeMB: 46.8,
    pages: 428
  });

  const [companyName, setCompanyName] = useState('ABC Industries Ltd.');
  const [documentType, setDocumentType] = useState<'Annual Report' | 'Financial Statement' | 'Earnings Report' | 'Quarterly 10-Q'>('Annual Report');
  const [financialYear, setFinancialYear] = useState('FY 2024-25');
  const [processingMode] = useState<ProcessingMode>('balanced');

  if (!isOpen) return null;

  const handleSelectSample = (name: string, company: string, year: string, pages: number, sizeMB: number) => {
    setSelectedFile({ name, sizeMB, pages });
    setCompanyName(company);
    setFinancialYear(year);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newDoc: DocumentInfo = {
      id: `doc-${Date.now()}`,
      company: companyName || 'Custom Enterprise Corp',
      documentName: selectedFile.name,
      documentType: documentType,
      financialYear: financialYear || 'FY 2024-25',
      pages: selectedFile.pages,
      fileSizeMB: selectedFile.sizeMB,
      processingMode: processingMode,
      status: 'processing',
      uploadedBy: 'Pratham (Lead Analyst)',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      confidenceScore: 99.1,
      tablesFound: 83,
      chartsFound: 27,
      metricsExtracted: 146
    };

    onStartAnalysis(newDoc);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0F3E5D] text-white flex items-center justify-center">
              <UploadCloud className="w-4 h-4 text-sky-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-['DM_Sans']">Upload Financial Document</h2>
              <p className="text-xs text-slate-500">Local Multi-Stage Processing Pipeline</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Drag and Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                const f = e.dataTransfer.files[0];
                setSelectedFile({
                  name: f.name,
                  sizeMB: Number((f.size / (1024 * 1024)).toFixed(1)),
                  pages: Math.floor(Math.random() * 200 + 100)
                });
                setCompanyName(f.name.replace('.pdf', '').replace(/_/g, ' '));
              }
            }}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
              isDragging
                ? 'border-sky-500 bg-sky-50/50'
                : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            <div className="w-12 h-12 mx-auto rounded-full bg-sky-100 text-sky-800 flex items-center justify-center mb-3">
              <FileText className="w-6 h-6 text-[#0F3E5D]" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">
              Drag & Drop Financial Reports or <span className="text-sky-700 underline">Browse Local File</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Supports PDF, Annual Reports, Financial Statements, Earnings Reports (Audited or Unaudited)
            </p>

            {/* Quick Sample Selector */}
            <div className="mt-4 pt-3 border-t border-slate-200/60 flex flex-wrap items-center justify-center gap-2">
              <span className="text-[11px] font-medium text-slate-400">Load sample:</span>
              <button
                type="button"
                onClick={() => handleSelectSample('ABC_Industries_Annual_Report_2025.pdf', 'ABC Industries Ltd.', 'FY 2024-25', 428, 46.8)}
                className="px-2.5 py-1 text-xs font-mono rounded bg-white border border-slate-200 text-slate-700 hover:border-sky-400 hover:text-sky-800 transition-colors"
              >
                ABC Industries (428 pgs)
              </button>
              <button
                type="button"
                onClick={() => handleSelectSample('Tata_Motors_Annual_Report_FY25.pdf', 'Tata Motors Limited', 'FY 2024-25', 384, 39.2)}
                className="px-2.5 py-1 text-xs font-mono rounded bg-white border border-slate-200 text-slate-700 hover:border-sky-400 hover:text-sky-800 transition-colors"
              >
                Tata Motors FY25 (384 pgs)
              </button>
            </div>
          </div>

          {/* Selected File Details Banner */}
          <div className="p-3.5 bg-sky-50/50 border border-sky-100 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-xs font-mono">
                PDF
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900 font-mono">{selectedFile.name}</p>
                <p className="text-[11px] text-slate-500">
                  File Size: <strong className="text-slate-700 font-mono">{selectedFile.sizeMB} MB</strong> • Document Length: <strong className="text-slate-700 font-mono">{selectedFile.pages} pages</strong>
                </p>
              </div>
            </div>
            <span className="badge badge-completed">Ready for Ingestion</span>
          </div>

          {/* Document Information Form */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                className="dox-input text-xs"
                placeholder="e.g. ABC Industries Ltd."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Document Type</label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value as any)}
                className="dox-select w-full text-xs"
              >
                <option value="Annual Report">Annual Report</option>
                <option value="Financial Statement">Financial Statement</option>
                <option value="Earnings Report">Earnings Report</option>
                <option value="Quarterly 10-Q">Quarterly 10-Q</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Financial Year</label>
              <input
                type="text"
                value={financialYear}
                onChange={(e) => setFinancialYear(e.target.value)}
                required
                className="dox-input text-xs font-mono"
                placeholder="e.g. FY 2024-25"
              />
            </div>
          </div>

          {/* SYSTEM CAPABILITY DISPLAY */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200/80">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-sky-800" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Detected System Capability
                </span>
              </div>
              <span className="text-[11px] font-mono text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Local Hardware Ready
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200/70">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">CPU</span>
                <span className="font-bold text-slate-800 tabular-nums">{hardware.cpuCores} Cores</span>
                <span className="text-[10px] text-slate-500 block truncate">AMD 8C / 16T</span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200/70">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">RAM</span>
                <span className="font-bold text-slate-800 tabular-nums">{hardware.ramTotalGB} GB</span>
                <span className="text-[10px] text-slate-500 block">DDR4 3200MHz</span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200/70">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">GPU</span>
                <span className="font-bold text-slate-800 truncate block">NVIDIA RTX 3050</span>
                <span className="text-[10px] text-slate-500 block">CUDA Accelerated</span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200/70">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">VRAM</span>
                <span className="font-bold text-slate-800 tabular-nums">{hardware.vramTotalGB} GB</span>
                <span className="text-[10px] text-slate-500 block">4-bit Quantized VLM</span>
              </div>
            </div>

            {/* Recommended Processing Mode */}
            <div className="mt-3.5 pt-3 border-t border-slate-200 flex items-center justify-between bg-sky-50/60 p-2.5 rounded-lg border-sky-100">
              <div className="flex items-center gap-2 text-xs">
                <Sparkles className="w-4 h-4 text-sky-700" />
                <span className="text-slate-700">Recommended Processing Mode:</span>
                <strong className="text-sky-900 font-bold uppercase tracking-wider bg-white px-2 py-0.5 rounded border border-sky-200 font-mono text-xs">
                  BALANCED
                </strong>
              </div>
              <span className="text-[11px] text-slate-500 hidden sm:inline">Optimal throughput for 400+ pgs</span>
            </div>
          </div>

          {/* Selected AI Configuration */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
              Selected AI Configuration
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="border-l-2 border-sky-500 pl-2">
                <span className="text-slate-400 text-[10px] block uppercase font-semibold">Document Parser</span>
                <span className="font-semibold text-slate-800">Docling</span>
              </div>
              <div className="border-l-2 border-indigo-500 pl-2">
                <span className="text-slate-400 text-[10px] block uppercase font-semibold">Vision Model</span>
                <span className="font-semibold text-slate-800">Qwen3-VL</span>
              </div>
              <div className="border-l-2 border-emerald-500 pl-2">
                <span className="text-slate-400 text-[10px] block uppercase font-semibold">Execution Engine</span>
                <span className="font-semibold text-slate-800">Ray (4 Workers)</span>
              </div>
              <div className="border-l-2 border-amber-500 pl-2">
                <span className="text-slate-400 text-[10px] block uppercase font-semibold">Processing</span>
                <span className="font-semibold text-slate-800">Local (100% On-Prem)</span>
              </div>
            </div>
          </div>

          {/* Footer & Actions */}
          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Shield className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Your document remains within your local infrastructure.</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary text-xs flex-1 sm:flex-initial"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary text-xs font-semibold flex-1 sm:flex-initial flex items-center justify-center gap-2"
              >
                <span>Start Analysis</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
