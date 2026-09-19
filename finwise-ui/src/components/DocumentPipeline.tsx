import React, { useState } from 'react';
import {
  UploadCloud,
  FileCheck,
  FileText,
  Cpu,
  Table,
  Eye,
  CheckCircle2,
  Filter
} from 'lucide-react';
import type { ReportDocument, PageClassification, ProcessingMode } from '../types/finwise';

interface DocumentPipelineProps {
  document: ReportDocument;
  classifiedPages: PageClassification[];
  processingMode: ProcessingMode;
  onSimulateUpload: (fileName: string, pageCount: number) => void;
}

export const DocumentPipeline: React.FC<DocumentPipelineProps> = ({
  document,
  classifiedPages,
  processingMode,
  onSimulateUpload
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const handleCustomUpload = () => {
    const sampleNames = [
      'Reliance_Industries_Annual_Report_FY25_460pgs.pdf',
      'Tata_Motors_Integrated_Report_2025_512pgs.pdf',
      'Apple_Inc_Form_10K_Annual_Report_FY25_390pgs.pdf'
    ];
    const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
    const randomPages = Math.floor(Math.random() * 120) + 380;
    onSimulateUpload(randomName, randomPages);
  };

  const filteredPages = selectedCategory === 'all' 
    ? classifiedPages 
    : classifiedPages.filter(p => p.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Top Banner Overview */}
      <div className="glass-panel p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge badge-cyan">Document Intelligence Hub</span>
              <span className="badge badge-emerald">Progressive Pipeline Ready</span>
            </div>
            <h2 className="text-2xl font-bold text-white font-heading">
              Large Report Parsing & Routing Pipeline
            </h2>
            <p className="text-sm text-gray-400 mt-1 max-w-3xl">
              Handles 400–500 page financial disclosures without overloading LLMs. Applies lightweight keyword & structure scoring (+2 for tables, +3 captions, -3 photos) to selectively route pages to PyMuPDF, Docling, or Vision VLMs.
            </p>
          </div>

          <button
            onClick={handleCustomUpload}
            className="btn-primary"
          >
            <UploadCloud className="w-4 h-4" />
            Upload New 500-Page PDF
          </button>
        </div>
      </div>

      {/* Upload & Current Document Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document Stats Card */}
        <div className="glass-panel p-6 lg:col-span-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center">
                <FileCheck className="w-6 h-6 text-sky-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-heading truncate max-w-md">
                  {document.name}
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mt-1">
                  <span>Pages: <strong className="text-white">{document.totalPages}</strong></span>
                  <span>•</span>
                  <span>Size: <strong className="text-white">{document.fileSizeMB} MB</strong></span>
                  <span>•</span>
                  <span>Uploaded: <strong className="text-white">{document.uploadDate}</strong></span>
                </div>
              </div>
            </div>
            <span className="badge badge-emerald flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Indexed
            </span>
          </div>

          {/* Page Routing Breakdown Bar */}
          <div className="mt-6 pt-6 border-t border-gray-800">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-gray-300">Selective Router Page Allocation ({document.totalPages} Pages Total)</span>
              <span className="text-sky-400 font-mono">
                {Math.round(((document.totalPages - document.classifiedPages.skippedPages) / document.totalPages) * 100)}% Processing Efficiency
              </span>
            </div>
            
            {/* Visual Bar */}
            <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${(document.classifiedPages.textPages / document.totalPages) * 100}%` }}
                className="bg-sky-500 transition-all duration-500"
                title="PyMuPDF Text Pages"
              />
              <div
                style={{ width: `${(document.classifiedPages.tablePages / document.totalPages) * 100}%` }}
                className="bg-emerald-500 transition-all duration-500"
                title="Docling Table Pages"
              />
              <div
                style={{ width: `${(document.classifiedPages.chartPages / document.totalPages) * 100}%` }}
                className="bg-purple-500 transition-all duration-500"
                title="Vision VLM Chart Pages"
              />
              <div
                style={{ width: `${(document.classifiedPages.skippedPages / document.totalPages) * 100}%` }}
                className="bg-slate-700 transition-all duration-500"
                title="Skipped Irrelevant Pages"
              />
            </div>

            {/* Legend Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              <div className="bg-slate-900/80 p-3 rounded-lg border border-sky-500/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Digital Text</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                </div>
                <div className="text-lg font-bold text-sky-400 mt-1">{document.classifiedPages.textPages} pgs</div>
                <div className="text-[11px] text-gray-500">PyMuPDF Reader</div>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-lg border border-emerald-500/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Financial Tables</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                </div>
                <div className="text-lg font-bold text-emerald-400 mt-1">{document.classifiedPages.tablePages} pgs</div>
                <div className="text-[11px] text-gray-500">Docling / Camelot</div>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-lg border border-purple-500/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Charts & Graphs</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                </div>
                <div className="text-lg font-bold text-purple-400 mt-1">{document.classifiedPages.chartPages} pgs</div>
                <div className="text-[11px] text-gray-500">Selective VLM</div>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-lg border border-gray-700/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Skipped/Photos</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-600"></span>
                </div>
                <div className="text-lg font-bold text-gray-400 mt-1">{document.classifiedPages.skippedPages} pgs</div>
                <div className="text-[11px] text-gray-500">Bypassed Heavy AI</div>
              </div>
            </div>
          </div>
        </div>

        {/* Hardware Adaptive Monitor */}
        <div className="glass-panel p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Cpu className="w-5 h-5 text-sky-400" />
              <h3 className="text-lg font-bold text-white font-heading">Hardware Adapter</h3>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              Dynamically scales batch sizes, parallelism, and quantization depending on host hardware capabilities.
            </p>

            <div className="space-y-3">
              <div className="bg-slate-900 p-3 rounded-lg border border-gray-800">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">Active Mode:</span>
                  <span className="text-sky-300 font-bold uppercase">{processingMode}</span>
                </div>
                <div className="text-[11px] text-gray-400">
                  {processingMode === 'lite' && 'Small Quantized 4-bit Models • 8GB System RAM • CPU Offloading'}
                  {processingMode === 'balanced' && 'Medium VLM Models • 16GB VRAM GPU • Moderate Parallel Workers'}
                  {processingMode === 'performance' && 'Large Enterprise Models • Multi-GPU Cluster • Full Parallel Parsing'}
                </div>
              </div>

              <div className="bg-slate-900 p-3 rounded-lg border border-gray-800 space-y-2">
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>RAM Utilization:</span>
                    <span className="text-emerald-400 font-mono">6.4 GB / 32 GB</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-1/5"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>GPU VRAM Utilization:</span>
                    <span className="text-sky-400 font-mono">4.2 GB / 16 GB</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-500 w-1/4"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-800 text-[11px] text-gray-500 flex items-center justify-between">
            <span>FAISS Vector Database: Ready</span>
            <span className="text-emerald-400 font-mono">0.12s Index Query</span>
          </div>
        </div>
      </div>

      {/* Page Classification Routing Matrix Table */}
      <div className="glass-panel p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-white font-heading">
              Page Classification Matrix & Relevance Routing
            </h3>
            <p className="text-xs text-gray-400">
              Inspect how PyMuPDF, Docling, and Vision VLMs were selected per page using keyword signals & score thresholds.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-gray-800 text-xs">
            <Filter className="w-3.5 h-3.5 text-gray-400 ml-2" />
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                selectedCategory === 'all' ? 'bg-sky-500/20 text-sky-300' : 'text-gray-400 hover:text-white'
              }`}
            >
              All Pages
            </button>
            <button
              onClick={() => setSelectedCategory('table')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                selectedCategory === 'table' ? 'bg-emerald-500/20 text-emerald-300' : 'text-gray-400 hover:text-white'
              }`}
            >
              Tables (Docling)
            </button>
            <button
              onClick={() => setSelectedCategory('chart')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                selectedCategory === 'chart' ? 'bg-purple-500/20 text-purple-300' : 'text-gray-400 hover:text-white'
              }`}
            >
              Charts (Vision VLM)
            </button>
            <button
              onClick={() => setSelectedCategory('irrelevant')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                selectedCategory === 'irrelevant' ? 'bg-gray-700/40 text-gray-300' : 'text-gray-400 hover:text-white'
              }`}
            >
              Skipped
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-slate-900/90 text-gray-400 uppercase font-semibold border-b border-gray-800">
              <tr>
                <th className="py-3 px-4">Page #</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Assigned Engine Tool</th>
                <th className="py-3 px-4">Relevance Score</th>
                <th className="py-3 px-4">Detected Keywords / Signals</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {filteredPages.map((p) => (
                <tr key={p.pageNumber} className="hover:bg-slate-900/50 transition">
                  <td className="py-3 px-4 font-mono font-bold text-white">
                    Page {p.pageNumber}
                  </td>
                  <td className="py-3 px-4">
                    {p.category === 'table' && (
                      <span className="badge badge-emerald flex items-center gap-1 w-max">
                        <Table className="w-3 h-3" /> Table
                      </span>
                    )}
                    {p.category === 'chart' && (
                      <span className="badge badge-violet flex items-center gap-1 w-max">
                        <Eye className="w-3 h-3" /> Chart/Graph
                      </span>
                    )}
                    {p.category === 'text' && (
                      <span className="badge badge-cyan flex items-center gap-1 w-max">
                        <FileText className="w-3 h-3" /> Digital Text
                      </span>
                    )}
                    {p.category === 'irrelevant' && (
                      <span className="badge bg-slate-800 text-gray-400 border border-gray-700 flex items-center gap-1 w-max">
                        Irrelevant
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-semibold text-gray-200">
                    {p.tool === 'Docling' && <span className="text-emerald-400">Docling / Camelot</span>}
                    {p.tool === 'Vision VLM' && <span className="text-purple-400">Multimodal VLM</span>}
                    {p.tool === 'PyMuPDF' && <span className="text-sky-400">PyMuPDF Engine</span>}
                    {p.tool === 'Skip' && <span className="text-gray-500">Bypassed (0 Cost)</span>}
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <span className={p.score > 8 ? 'text-emerald-400 font-bold' : p.score > 0 ? 'text-sky-400' : 'text-gray-500'}>
                      {p.score > 0 ? `+${p.score}` : p.score}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {p.keywordsFound.map((kw, i) => (
                        <span key={i} className="bg-slate-800 text-gray-300 px-2 py-0.5 rounded text-[11px]">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-medium">
                    <span className="text-emerald-400 flex items-center justify-end gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Parsed & Vectorized
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
