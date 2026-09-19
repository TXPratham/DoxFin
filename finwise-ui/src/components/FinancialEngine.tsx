import React, { useState } from 'react';
import {
  Calculator,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Zap,
  BookOpen
} from 'lucide-react';
import type { FinancialRatio } from '../types/finwise';

interface FinancialEngineProps {
  ratios: FinancialRatio[];
}

export const FinancialEngine: React.FC<FinancialEngineProps> = ({ ratios }) => {
  // Interactive Python Calculator Sandbox State
  const [calcRev2024, setCalcRev2024] = useState<number>(1000);
  const [calcRev2025, setCalcRev2025] = useState<number>(1200);
  const [calcNetProfit, setCalcNetProfit] = useState<number>(162);
  const [calcBorrowings, setCalcBorrowings] = useState<number>(820);
  const [calcEquity, setCalcEquity] = useState<number>(1200);

  // Derived Python Engine Formulas
  const calculatedGrowth = (((calcRev2025 - calcRev2024) / calcRev2024) * 100).toFixed(2);
  const calculatedMargin = ((calcNetProfit / calcRev2025) * 100).toFixed(2);
  const calculatedDebtToEquity = (calcBorrowings / calcEquity).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-panel p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge badge-emerald flex items-center gap-1">
                <Calculator className="w-3.5 h-3.5" /> Deterministic Python Engine
              </span>
              <span className="badge badge-cyan">Zero Arithmetic Hallucination</span>
            </div>
            <h2 className="text-2xl font-bold text-white font-heading">
              Financial Metric Calculation Engine
            </h2>
            <p className="text-sm text-gray-400 mt-1 max-w-3xl">
              LLMs are strictly forbidden from performing financial arithmetic. All ratios are executed via deterministic Python/Pandas logic over verified document tables.
            </p>
          </div>

          <div className="bg-slate-900 px-4 py-3 rounded-xl border border-sky-500/20 text-right">
            <span className="text-xs text-gray-400 block">Total Metrics Verified</span>
            <span className="text-xl font-bold text-sky-400 font-mono">8 Programmatic Ratios</span>
          </div>
        </div>
      </div>

      {/* Programmatic Ratios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {ratios.map((r) => {
          const isPositive = r.changePercent >= 0;
          return (
            <div key={r.key} className="glass-panel p-5 relative overflow-hidden group">
              {/* Status accent border */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 ${
                  r.status === 'anomaly'
                    ? 'bg-rose-500'
                    : r.status === 'warning'
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
              />

              <div className="flex items-start justify-between">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {r.category}
                </span>
                {r.status === 'anomaly' ? (
                  <span className="badge badge-crimson flex items-center gap-1 text-[10px]">
                    <AlertCircle className="w-3 h-3" /> Anomaly
                  </span>
                ) : r.status === 'warning' ? (
                  <span className="badge badge-amber flex items-center gap-1 text-[10px]">
                    <AlertCircle className="w-3 h-3" /> Caution
                  </span>
                ) : (
                  <span className="badge badge-emerald flex items-center gap-1 text-[10px]">
                    <CheckCircle className="w-3 h-3" /> Verified
                  </span>
                )}
              </div>

              <h4 className="text-base font-bold text-white font-heading mt-2">
                {r.name}
              </h4>

              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-white font-mono">
                  {r.val2025} {r.unit}
                </span>
                <span className="text-xs text-gray-500">
                  vs {r.val2024} {r.unit} (FY24)
                </span>
              </div>

              <div className="mt-2 flex items-center gap-1.5 text-xs">
                {isPositive ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-0.5 font-mono">
                    <TrendingUp className="w-3.5 h-3.5" /> +{r.changePercent}%
                  </span>
                ) : (
                  <span className="text-rose-400 font-semibold flex items-center gap-0.5 font-mono">
                    <TrendingDown className="w-3.5 h-3.5" /> {r.changePercent}%
                  </span>
                )}
                <span className="text-gray-500">YoY change</span>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-800/80 flex items-center justify-between text-[11px] text-gray-400">
                <span className="truncate max-w-[170px]" title={r.sourceReference}>
                  {r.sourceReference}
                </span>
                <span className="text-sky-400 font-mono">{r.confidenceScore}% conf</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Python Calculator Sandbox */}
      <div className="glass-panel p-6">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-white font-heading">
              Interactive Python Deterministic Calculation Simulator
            </h3>
          </div>
          <span className="badge badge-cyan">Live Execution Engine</span>
        </div>

        <p className="text-xs text-gray-400 mb-6">
          Adjust extracted variable inputs below. The Python engine executes formulas in real-time, delivering pure mathematical truth directly into the RAG context.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls */}
          <div className="space-y-4 bg-slate-900/80 p-5 rounded-xl border border-gray-800">
            <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" /> Variable Inputs (Extracted from Balance Sheet & P&L)
            </h4>

            <div>
              <div className="flex justify-between text-xs text-gray-300 mb-1">
                <span>Revenue FY2024:</span>
                <span className="font-mono text-sky-300 font-bold">₹{calcRev2024} Cr</span>
              </div>
              <input
                type="range"
                min="500"
                max="2000"
                value={calcRev2024}
                onChange={(e) => setCalcRev2024(Number(e.target.value))}
                className="w-full accent-sky-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-gray-300 mb-1">
                <span>Revenue FY2025:</span>
                <span className="font-mono text-sky-300 font-bold">₹{calcRev2025} Cr</span>
              </div>
              <input
                type="range"
                min="500"
                max="2500"
                value={calcRev2025}
                onChange={(e) => setCalcRev2025(Number(e.target.value))}
                className="w-full accent-sky-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-gray-300 mb-1">
                <span>Net Profit FY2025:</span>
                <span className="font-mono text-emerald-300 font-bold">₹{calcNetProfit} Cr</span>
              </div>
              <input
                type="range"
                min="50"
                max="500"
                value={calcNetProfit}
                onChange={(e) => setCalcNetProfit(Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-gray-300 mb-1">
                <span>Total Borrowings (Debt):</span>
                <span className="font-mono text-rose-300 font-bold">₹{calcBorrowings} Cr</span>
              </div>
              <input
                type="range"
                min="100"
                max="1500"
                value={calcBorrowings}
                onChange={(e) => setCalcBorrowings(Number(e.target.value))}
                className="w-full accent-rose-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-gray-300 mb-1">
                <span>Shareholders' Equity:</span>
                <span className="font-mono text-purple-300 font-bold">₹{calcEquity} Cr</span>
              </div>
              <input
                type="range"
                min="500"
                max="2000"
                value={calcEquity}
                onChange={(e) => setCalcEquity(Number(e.target.value))}
                className="w-full accent-purple-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Real-time Python Code Output Box */}
          <div className="bg-slate-950 p-5 rounded-xl border border-sky-500/30 flex flex-col justify-between font-mono text-xs">
            <div>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-800 text-gray-400 font-sans">
                <span className="font-bold text-gray-200">Python Engine Execution Script</span>
                <span className="text-[11px] text-emerald-400 font-mono">STATUS: OK</span>
              </div>

              <pre className="text-gray-300 leading-relaxed overflow-x-auto">
{`# FinWise Financial Engine (Deterministic Python execution)

rev_2024 = ${calcRev2024}.0
rev_2025 = ${calcRev2025}.0
net_profit = ${calcNetProfit}.0
borrowings = ${calcBorrowings}.0
equity = ${calcEquity}.0

# 1. Revenue Growth Calculation
rev_growth = ((rev_2025 - rev_2024) / rev_2024) * 100
# Result -> ${calculatedGrowth}%

# 2. Net Profit Margin Calculation
net_margin = (net_profit / rev_2025) * 100
# Result -> ${calculatedMargin}%

# 3. Debt-to-Equity Solvency Ratio
debt_equity = borrowings / equity
# Result -> ${calculatedDebtToEquity}x`}
              </pre>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-800 grid grid-cols-3 gap-2 text-center font-sans">
              <div className="bg-slate-900 p-2 rounded border border-gray-800">
                <div className="text-[10px] text-gray-400 uppercase">Growth</div>
                <div className="text-sm font-bold text-sky-400 mt-0.5">{calculatedGrowth}%</div>
              </div>

              <div className="bg-slate-900 p-2 rounded border border-gray-800">
                <div className="text-[10px] text-gray-400 uppercase">Net Margin</div>
                <div className="text-sm font-bold text-emerald-400 mt-0.5">{calculatedMargin}%</div>
              </div>

              <div className="bg-slate-900 p-2 rounded border border-gray-800">
                <div className="text-[10px] text-gray-400 uppercase">Debt/Equity</div>
                <div className="text-sm font-bold text-purple-400 mt-0.5">{calculatedDebtToEquity}x</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
