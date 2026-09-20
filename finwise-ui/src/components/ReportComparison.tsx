import React, { useState } from 'react';
import {
  ArrowUpRight,
  ArrowDownRight,
  Sparkles
} from 'lucide-react';
import type { ComparisonMetric } from '../types/doxfin';

interface ReportComparisonProps {
  comparisonMetrics: ComparisonMetric[];
  companyName?: string;
}

export const ReportComparison: React.FC<ReportComparisonProps> = ({
  comparisonMetrics,
  companyName = 'ABC Industries Ltd.'
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = ['ALL', 'Topline', 'Profitability', 'Cash Flow', 'Leverage', 'Return Ratios'];

  const filteredMetrics = comparisonMetrics.filter(
    (m) => selectedCategory === 'ALL' || m.category === selectedCategory
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-[#0F3E5D]/10 text-[#0F3E5D] font-mono uppercase tracking-wider">
                Multi-Period Variance Analysis
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500">Deterministic Ratio Comparison</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-['DM_Sans']">
              Report Comparison: FY2024 vs FY2025
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Side-by-side audited variance for {companyName}, evaluating operational margin trajectory, debt funding, and cash conversion.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <div className="text-center px-3 border-r border-slate-200">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">Base Period</span>
              <span className="text-xs font-bold text-slate-700 font-mono">FY 2023-24</span>
            </div>
            <div className="text-center px-3">
              <span className="text-[10px] text-sky-700 block font-semibold uppercase">Target Period</span>
              <span className="text-xs font-bold text-[#0F3E5D] font-mono">FY 2024-25</span>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-100 overflow-x-auto">
          <span className="text-xs font-semibold text-slate-400 mr-2">Filter:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#0F3E5D] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* MAJOR CHANGES DETECTED (Summary Highlights Banner) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#0F3E5D]" />
            <h2 className="text-base font-bold text-slate-900 font-['DM_Sans']">
              Major Changes Detected
            </h2>
          </div>
          <span className="badge badge-completed font-mono text-xs">5 Core Shifts Flagged</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-950 uppercase">Revenue</span>
              <ArrowUpRight className="w-4 h-4 text-emerald-700" />
            </div>
            <span className="text-lg font-bold text-emerald-900 font-mono mt-1 block">+12.4%</span>
            <span className="text-[10px] text-emerald-800 font-medium">₹14,600 Cr → ₹16,420 Cr</span>
          </div>

          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-950 uppercase">Net Profit</span>
              <ArrowUpRight className="w-4 h-4 text-emerald-700" />
            </div>
            <span className="text-lg font-bold text-emerald-900 font-mono mt-1 block">+8.7%</span>
            <span className="text-[10px] text-emerald-800 font-medium">₹2,005 Cr → ₹2,180 Cr</span>
          </div>

          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-950 uppercase">Operating Margin</span>
              <ArrowDownRight className="w-4 h-4 text-amber-700" />
            </div>
            <span className="text-lg font-bold text-amber-900 font-mono mt-1 block">-1.2%</span>
            <span className="text-[10px] text-amber-800 font-medium">19.6% → 18.4%</span>
          </div>

          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-950 uppercase">Total Debt</span>
              <ArrowUpRight className="w-4 h-4 text-amber-700" />
            </div>
            <span className="text-lg font-bold text-amber-900 font-mono mt-1 block">+30.8%</span>
            <span className="text-[10px] text-amber-800 font-medium">₹3,930 Cr → ₹5,140 Cr</span>
          </div>

          <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-rose-950 uppercase">Cash Flow (FCF)</span>
              <ArrowDownRight className="w-4 h-4 text-rose-700" />
            </div>
            <span className="text-lg font-bold text-rose-900 font-mono mt-1 block">-16.8%</span>
            <span className="text-[10px] text-rose-800 font-medium">₹1,586 Cr → ₹1,320 Cr</span>
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison Metric Table */}
      <div className="dox-card p-6 bg-white border border-slate-200">
        <div className="pb-4 mb-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-['DM_Sans']">Detailed Financial Item Comparison</h3>
            <p className="text-xs text-slate-500">Cross-verified multi-statement metrics</p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {filteredMetrics.length} Line Items Listed
          </span>
        </div>

        <div className="dox-table-container">
          <table className="dox-table">
            <thead>
              <tr>
                <th>Financial Line Item</th>
                <th>Category</th>
                <th>FY 2023-24 (Audited)</th>
                <th>FY 2024-25 (Current)</th>
                <th>Variance / YoY</th>
                <th>AI Synthesis & Audited Note Context</th>
              </tr>
            </thead>
            <tbody>
              {filteredMetrics.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="font-semibold text-xs text-slate-900">
                    {item.metric}
                  </td>
                  <td>
                    <span className="text-[11px] font-mono text-slate-500 px-2 py-0.5 rounded bg-slate-100">
                      {item.category}
                    </span>
                  </td>
                  <td className="font-mono text-xs text-slate-700 font-semibold">
                    {item.fy24}
                  </td>
                  <td className="font-mono text-xs text-slate-900 font-bold bg-sky-50/40">
                    {item.fy25}
                  </td>
                  <td>
                    <span className={`inline-flex items-center gap-1 font-mono text-xs font-bold px-2 py-0.5 rounded ${
                      item.impact === 'positive'
                        ? 'bg-emerald-50 text-emerald-700'
                        : item.impact === 'negative'
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {item.direction === 'up' ? <ArrowUpRight className="w-3.5 h-3.5" /> : item.direction === 'down' ? <ArrowDownRight className="w-3.5 h-3.5" /> : null}
                      {item.change}
                    </span>
                  </td>
                  <td className="text-xs text-slate-600 max-w-md">
                    {item.analysisNote}
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
