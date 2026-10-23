import React from 'react';
import { SimulationResult, SimulationParameters } from '../types/simulation';
import { 
  ShieldAlert, 
  TrendingDown, 
  Zap, 
  BarChart, 
  CheckCircle2, 
  AlertTriangle,
  Info
} from 'lucide-react';

interface AnalyticsViewProps {
  result: SimulationResult;
  params: SimulationParameters;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ result, params }) => {
  const formatEuro = (v: number) => {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(v);
  };

  // Build histogram buckets from terminal values
  const values = result.terminalValues;
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const bucketCount = 20;
  const bucketSize = (maxVal - minVal) / bucketCount || 1;
  const buckets = Array(bucketCount).fill(0);

  values.forEach(v => {
    const idx = Math.min(Math.floor((v - minVal) / bucketSize), bucketCount - 1);
    buckets[idx]++;
  });

  const maxBucketHeight = Math.max(...buckets, 1);

  return (
    <div className="space-y-6">
      {/* Risk Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* VaR 95% */}
        <div className="flux-card p-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#FF5722] mb-1">
            <ShieldAlert size={14} />
            <span>Value at Risk (95% 1-Tail)</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono mt-1">
            {formatEuro(result.var95)}
          </div>
          <p className="text-xs text-[#7B8296] mt-1.5 leading-relaxed">
            In 95% of market regimes, your terminal shortfall will not exceed this threshold.
          </p>
        </div>

        {/* CVaR / Expected Shortfall */}
        <div className="flux-card p-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#7C4DFF] mb-1">
            <TrendingDown size={14} />
            <span>Expected Shortfall (CVaR 95%)</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono mt-1">
            {formatEuro(result.cvar95)}
          </div>
          <p className="text-xs text-[#7B8296] mt-1.5 leading-relaxed">
            Average catastrophic loss in the worst 5% black-swan tail distribution.
          </p>
        </div>

        {/* Probability of Ruin */}
        <div className="flux-card p-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#10B981] mb-1">
            <Zap size={14} />
            <span>Solvency & Ruin Probability</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono mt-1">
            {result.probabilityOfRuin}%
          </div>
          <p className="text-xs text-[#7B8296] mt-1.5 leading-relaxed">
            {result.probabilityOfRuin < 1 
              ? 'Near zero insolvency risk under current contributions and asset buffer.'
              : 'Warning: Portfolio faces sequence-of-returns drawdown vulnerability.'
            }
          </p>
        </div>
      </div>

      {/* Terminal Wealth Distribution Histogram */}
      <div className="flux-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Terminal Wealth Probability Density (N={params.iterations.toLocaleString()})
            </h3>
            <p className="text-xs text-[#7B8296] mt-0.5">
              Empirical probability density function (PDF) across all simulated outcomes
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-[#1B1E2C] text-[#FF5722] border border-[#2A2E42]">
            Median: {formatEuro(result.medianTerminalWealth)}
          </span>
        </div>

        {/* Histogram Bars */}
        <div className="h-56 w-full flex items-end justify-between gap-1.5 pt-6 pb-2 px-2">
          {buckets.map((count, idx) => {
            const bucketVal = minVal + idx * bucketSize;
            const heightPercent = (count / maxBucketHeight) * 100;
            const isMedianBucket = bucketVal <= result.medianTerminalWealth && (bucketVal + bucketSize) > result.medianTerminalWealth;
            const isWorstTail = idx < 2;

            return (
              <div
                key={idx}
                className="flex-1 h-full flex flex-col justify-end items-center group relative cursor-pointer"
              >
                {/* Tooltip */}
                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-[#161824] border border-[#2B3045] px-2 py-1 rounded text-[10px] text-white whitespace-nowrap pointer-events-none z-10 shadow-lg font-mono">
                  {formatEuro(bucketVal)}: {count} runs
                </div>

                <div
                  className={`w-full rounded-t-sm transition-all duration-200 ${
                    isMedianBucket
                      ? 'bg-gradient-to-t from-[#FF5722] to-[#FF7A45] shadow-glow-orange'
                      : isWorstTail
                      ? 'bg-gradient-to-t from-[#EF4444] to-[#F87171]'
                      : 'bg-[#232738] group-hover:bg-[#343A52]'
                  }`}
                  style={{ height: `${Math.max(4, heightPercent)}%` }}
                />
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-xs text-[#62687A] font-mono pt-3 border-t border-[#1F222E]">
          <span>Min: {formatEuro(minVal)}</span>
          <span className="text-[#FF5722]">Median (P50): {formatEuro(result.medianTerminalWealth)}</span>
          <span>Max: {formatEuro(maxVal)}</span>
        </div>
      </div>
    </div>
  );
};
