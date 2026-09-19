import React, { useState } from 'react';
import {
  BookOpen,
  Database,
  CheckCircle2,
  AlertOctagon,
  Search,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import type { RagChunk } from '../types/finwise';

interface RagEvidenceViewerProps {
  chunks: RagChunk[];
  initialPage?: number;
}

export const RagEvidenceViewer: React.FC<RagEvidenceViewerProps> = ({
  chunks,
  initialPage = 126
}) => {
  const [activePage, setActivePage] = useState<number>(initialPage);
  const [searchQuery, setSearchQuery] = useState<string>('Revenue and Margin Analysis');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge badge-cyan flex items-center gap-1">
                <Database className="w-3.5 h-3.5" /> FAISS Vector Retrieval Engine
              </span>
              <span className="badge badge-emerald">Evidence & Citation Inspector</span>
            </div>
            <h2 className="text-2xl font-bold text-white font-heading">
              RAG Source Verification & Bounding Box Inspector
            </h2>
            <p className="text-sm text-gray-400 mt-1 max-w-3xl">
              Every FinWise statement is tied back to exact document source citations: Document Name, Page Number, Section, and Table/Chart References.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-xl border border-gray-800">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search FAISS embeddings..."
              className="bg-transparent text-xs text-gray-200 focus:outline-none w-48"
            />
          </div>
        </div>
      </div>

      {/* Dual Pane View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Pane: Simulated Document PDF Viewer */}
        <div className="lg:col-span-7 glass-panel p-6 flex flex-col justify-between min-h-[600px] relative">
          <div>
            {/* Toolbar */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-800 text-xs">
              <div className="flex items-center gap-2 text-gray-300 font-semibold">
                <BookOpen className="w-4 h-4 text-sky-400" />
                <span>Apex_Global_Tech_FY2025_Annual_Report.pdf</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-slate-900 px-2.5 py-1 rounded border border-gray-800">
                  <button
                    onClick={() => setActivePage(Math.max(1, activePage - 1))}
                    className="text-gray-400 hover:text-white"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-sky-300 font-mono font-bold px-1">Page {activePage}</span>
                  <button
                    onClick={() => setActivePage(Math.min(486, activePage + 1))}
                    className="text-gray-400 hover:text-white"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-gray-500">/ 486 pages</span>
              </div>
            </div>

            {/* Simulated Page Canvas */}
            <div className="bg-slate-950 p-6 rounded-xl border border-gray-800 relative font-serif text-gray-300 space-y-4 shadow-inner min-h-[480px]">
              <div className="flex justify-between items-center text-[10px] text-gray-500 uppercase font-sans border-b border-gray-800 pb-2">
                <span>CONSOLIDATED FINANCIAL STATEMENTS</span>
                <span>FINANCIAL YEAR 2024-2025</span>
              </div>

              {activePage === 126 && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-white font-sans text-center border-b border-gray-800 pb-2">
                    CONSOLIDATED STATEMENT OF PROFIT AND LOSS
                  </h3>

                  {/* Bounding Box Highlighted Table */}
                  <div className="relative border-2 border-amber-500/80 bg-amber-500/10 p-3 rounded-lg animate-glow">
                    <div className="absolute -top-3 left-3 bg-amber-500 text-black text-[10px] font-bold px-2 py-0.5 rounded uppercase font-sans flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> FAISS Vector Match • Page 126 Table 3.1
                    </div>

                    <table className="w-full text-left text-xs font-sans mt-2">
                      <thead className="text-gray-400 border-b border-amber-500/40">
                        <tr>
                          <th className="py-1">Particulars</th>
                          <th className="py-1 text-right">Note</th>
                          <th className="py-1 text-right">FY 2024-25 (₹ Cr)</th>
                          <th className="py-1 text-right">FY 2023-24 (₹ Cr)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-amber-500/20 text-gray-200">
                        <tr>
                          <td className="py-1.5 font-semibold text-sky-300">I. Revenue from Operations</td>
                          <td className="py-1.5 text-right font-mono">22</td>
                          <td className="py-1.5 text-right font-mono font-bold text-emerald-400">1,200.50</td>
                          <td className="py-1.5 text-right font-mono">1,000.00</td>
                        </tr>
                        <tr>
                          <td className="py-1.5">II. Other Income</td>
                          <td className="py-1.5 text-right font-mono">23</td>
                          <td className="py-1.5 text-right font-mono">18.20</td>
                          <td className="py-1.5 text-right font-mono">15.40</td>
                        </tr>
                        <tr className="font-bold text-white">
                          <td className="py-1.5">III. Total Revenue (I + II)</td>
                          <td className="py-1.5 text-right"></td>
                          <td className="py-1.5 text-right font-mono">1,218.70</td>
                          <td className="py-1.5 text-right font-mono">1,015.40</td>
                        </tr>
                        <tr>
                          <td className="py-1.5">IV. Total Expenses (Cost of Materials)</td>
                          <td className="py-1.5 text-right font-mono">24</td>
                          <td className="py-1.5 text-right font-mono text-rose-400 font-bold">1,038.50</td>
                          <td className="py-1.5 text-right font-mono">812.00</td>
                        </tr>
                        <tr className="border-t border-amber-500 font-bold text-emerald-400">
                          <td className="py-1.5">V. Profit After Tax (PAT)</td>
                          <td className="py-1.5 text-right"></td>
                          <td className="py-1.5 text-right font-mono">162.00</td>
                          <td className="py-1.5 text-right font-mono">185.00</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <p className="text-xs text-gray-400 leading-relaxed font-sans mt-3">
                    Revenue from operations increased 20.05% YoY to ₹1,200.50 Crores, driven by expansion in North American cloud infrastructure contracts. Total expenses grew 27.8% primarily due to raw material substrate tariff increases.
                  </p>
                </div>
              )}

              {activePage === 89 && (
                <div className="space-y-3 font-sans">
                  <h3 className="text-base font-bold text-white text-center border-b border-gray-800 pb-2">
                    MANAGEMENT DISCUSSION & ANALYSIS - COST ANALYSIS
                  </h3>
                  <div className="border-2 border-cyan-500/80 bg-cyan-500/10 p-3 rounded-lg">
                    <span className="bg-cyan-500 text-black text-[10px] font-bold px-2 py-0.5 rounded uppercase block w-max mb-2">
                      FAISS Vector Match • Page 89 Section 4.2
                    </span>
                    <p className="text-xs text-cyan-200 leading-relaxed font-mono">
                      "Input costs for rare semiconductor substrates surged by 38% in H2 FY25 due to global supply chain realignments, alongside non-recurring severance costs of ₹24 Cr during restructuring."
                    </p>
                  </div>
                </div>
              )}

              {activePage === 48 && (
                <div className="space-y-3 font-sans">
                  <h3 className="text-base font-bold text-white text-center border-b border-gray-800 pb-2">
                    NOTES TO FINANCIAL STATEMENTS - NOTE 14 BORROWINGS
                  </h3>
                  <div className="border-2 border-rose-500/80 bg-rose-500/10 p-3 rounded-lg">
                    <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase block w-max mb-2">
                      Conflict Area Flag • Table 14.1
                    </span>
                    <p className="text-xs text-rose-200 leading-relaxed font-mono">
                      "Total gross borrowings = ₹820 Cr (Long-term consortium loans ₹280 Cr, Short-term working capital commercial paper ₹540 Cr)."
                    </p>
                  </div>
                </div>
              )}

              {activePage !== 126 && activePage !== 89 && activePage !== 48 && (
                <div className="py-16 text-center text-gray-500 font-sans">
                  <p>Page {activePage} content preview loaded from PyMuPDF store.</p>
                  <button
                    onClick={() => setActivePage(126)}
                    className="mt-3 text-sky-400 text-xs underline font-semibold"
                  >
                    Jump to Highlighted Source Page 126
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-800 flex items-center justify-between text-xs text-gray-400">
            <span>OCR Status: <strong className="text-emerald-400 font-mono">Not Required (Native Digital PDF)</strong></span>
            <span>PyMuPDF Fast Stream</span>
          </div>
        </div>

        {/* Right Pane: Extracted FAISS Chunks & Cross Verification */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
            Retrieved FAISS Vector Chunks ({chunks.length})
          </h3>

          {chunks.map((chunk) => {
            const isSelected = activePage === chunk.pageNumber;
            return (
              <div
                key={chunk.id}
                onClick={() => setActivePage(chunk.pageNumber)}
                className={`glass-panel p-4 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-cyan-500/60 bg-slate-900/90 shadow-lg shadow-cyan-500/10'
                    : 'hover:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="badge badge-cyan font-mono">
                    Page {chunk.pageNumber}
                  </span>
                  <div className="flex items-center gap-2">
                    {chunk.verifiedStatus === 'verified' && (
                      <span className="badge badge-emerald flex items-center gap-1 text-[10px]">
                        <CheckCircle2 className="w-3 h-3" /> Verified Match
                      </span>
                    )}
                    {chunk.verifiedStatus === 'conflict' && (
                      <span className="badge badge-crimson flex items-center gap-1 text-[10px]">
                        <AlertOctagon className="w-3 h-3" /> Conflict Flag
                      </span>
                    )}
                    <span className="text-xs text-sky-400 font-mono">
                      {(chunk.similarityScore * 100).toFixed(1)}% Sim
                    </span>
                  </div>
                </div>

                <h4 className="text-xs font-bold text-white font-heading mt-2">
                  {chunk.section}
                </h4>

                <p className="text-xs text-gray-300 mt-2 line-clamp-3 bg-slate-950 p-2.5 rounded border border-gray-800 font-mono">
                  "{chunk.textSnippet}"
                </p>

                <div className="mt-3 flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-gray-800">
                  <span>{chunk.tableReference || chunk.chartReference || 'Text Section'}</span>
                  <span className="text-cyan-400 font-semibold flex items-center gap-1">
                    Select Page <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
