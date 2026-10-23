import React from 'react';
import { 
  SimulationResult, 
  SimulationParameters 
} from '../types/simulation';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  CircleDollarSign, 
  TrendingUp, 
  ShieldAlert, 
  Wallet,
  Activity
} from 'lucide-react';

interface StatCardsProps {
  result: SimulationResult;
  params: SimulationParameters;
}

export const StatCards: React.FC<StatCardsProps> = ({ result, params }) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Percentage gain compared to total money contributed
  const netGainPercent = result.totalContributed > 0
    ? (((result.medianTerminalWealth - result.totalContributed) / result.totalContributed) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 w-full">
      {/* CARD 1: Total Balance / Median Outcome */}
      <div className="flux-card p-5 relative overflow-hidden flex flex-col justify-between min-w-0">
        <div>
          {/* Header */}
          <div className="flex items-center gap-2 text-[#8E95A8] text-xs font-medium mb-1.5">
            <div className="w-5 h-5 rounded-full border border-[#262A3B] flex items-center justify-center text-[#A0A6B8] shrink-0">
              <CircleDollarSign size={12} />
            </div>
            <span className="truncate">Total Expected Wealth</span>
          </div>

          {/* Amount & Change */}
          <div className="flex items-baseline justify-between flex-wrap gap-1.5">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans shrink-0">
              {formatCurrency(result.medianTerminalWealth)}
            </span>
            <span className="flex items-center text-[10px] sm:text-[11px] font-medium text-[#10B981] bg-[#10B981]/10 px-1.5 py-0.5 rounded-md shrink-0 whitespace-nowrap">
              <ArrowUpRight size={12} className="mr-0.5" />
              +{netGainPercent}%
            </span>
          </div>
          <p className="text-[10px] text-[#5C6275] mt-0.5 truncate">Real median outcome (P50)</p>
        </div>

        {/* Dual glowing curves chart matching Behance Card 1 */}
        <div className="h-16 w-full mt-3 relative">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 200 60" preserveAspectRatio="none">
            <defs>
              <linearGradient id="curve1Glow" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FF5722" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#FF5722" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="curve2Glow" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
              </linearGradient>
              <filter id="glowOrange" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Blue Curve 2 (P25 path) */}
            <path
              d="M 0 52 C 40 48, 70 35, 110 42 C 140 48, 170 38, 200 46"
              fill="none"
              stroke="#3B82F6"
              strokeWidth="2"
              strokeOpacity="0.8"
            />
            {/* Blue dot */}
            <circle cx="110" cy="42" r="3.5" fill="#3B82F6" />
            <circle cx="110" cy="42" r="6" fill="#3B82F6" fillOpacity="0.3" />

            {/* Orange Curve 1 (P50/P75 path) */}
            <path
              d="M 0 45 C 35 40, 50 18, 90 26 C 130 35, 160 14, 200 20"
              fill="none"
              stroke="#FF5722"
              strokeWidth="2.5"
              filter="url(#glowOrange)"
            />
            {/* Orange glowing dot */}
            <circle cx="90" cy="26" r="4" fill="#FF5722" />
            <circle cx="90" cy="26" r="8" fill="#FF5722" fillOpacity="0.35" />
          </svg>
        </div>
      </div>

      {/* CARD 2: Monthly Income / Simulated CAGR */}
      <div className="flux-card p-5 relative overflow-hidden flex flex-col justify-between min-w-0">
        <div>
          <div className="flex items-center gap-2 text-[#8E95A8] text-xs font-medium mb-1.5">
            <div className="w-5 h-5 rounded-full border border-[#262A3B] flex items-center justify-center text-[#A0A6B8] shrink-0">
              <TrendingUp size={12} />
            </div>
            <span className="truncate">Annual Compounding (IRR)</span>
          </div>

          <div className="flex items-baseline justify-between flex-wrap gap-1.5">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans shrink-0">
              {result.simulatedCAGR}%
            </span>
            <span className="flex items-center text-[10px] sm:text-[11px] font-medium text-[#10B981] bg-[#10B981]/10 px-1.5 py-0.5 rounded-md shrink-0 whitespace-nowrap">
              <ArrowUpRight size={12} className="mr-0.5" />
              {params.expectedAnnualReturn}% Drift
            </span>
          </div>
          <p className="text-[10px] text-[#5C6275] mt-0.5 truncate">Real Money-Weighted Return</p>
        </div>

        {/* Orange area curve chart matching Behance Card 2 */}
        <div className="h-16 w-full mt-3 relative">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 200 60" preserveAspectRatio="none">
            <defs>
              <linearGradient id="orangeAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FF5722" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#FF5722" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d="M 0 58 Q 50 55 90 40 T 170 28 T 200 48 L 200 60 L 0 60 Z"
              fill="url(#orangeAreaGrad)"
            />
            <path
              d="M 0 58 Q 50 55 90 40 T 170 28 T 200 48"
              fill="none"
              stroke="#FF5722"
              strokeWidth="2.5"
            />
            {/* Highlight glowing dot */}
            <circle cx="170" cy="28" r="3.5" fill="#FF5722" />
            <circle cx="170" cy="28" r="7" fill="#FF5722" fillOpacity="0.3" />
          </svg>
        </div>
      </div>

      {/* CARD 3: Monthly Expenses / VaR (95%) Risk */}
      <div className="flux-card p-5 relative overflow-hidden flex flex-col justify-between min-w-0">
        <div>
          <div className="flex items-center gap-2 text-[#8E95A8] text-xs font-medium mb-1.5">
            <div className="w-5 h-5 rounded-full border border-[#262A3B] flex items-center justify-center text-[#A0A6B8] shrink-0">
              <ShieldAlert size={12} />
            </div>
            <span className="truncate">VaR (95% Downside Spread)</span>
          </div>

          <div className="flex items-baseline justify-between flex-wrap gap-1.5">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans shrink-0">
              {formatCurrency(result.var95)}
            </span>
            <span className={`flex items-center text-[10px] sm:text-[11px] font-medium px-1.5 py-0.5 rounded-md shrink-0 whitespace-nowrap ${
              result.capitalAtRisk === 0 
                ? 'text-[#10B981] bg-[#10B981]/10' 
                : 'text-[#8B5CF6] bg-[#8B5CF6]/10'
            }`}>
              {result.capitalAtRisk === 0 ? (
                <>
                  <ArrowUpRight size={12} className="mr-0.5" />
                  Capital Preserved
                </>
              ) : (
                <>
                  <ArrowDownRight size={12} className="mr-0.5" />
                  -{result.maxDrawdownExpected}% DD
                </>
              )}
            </span>
          </div>
          <p className="text-[10px] text-[#5C6275] mt-0.5 truncate">
            {result.capitalAtRisk === 0 
              ? 'Max deviation from median • 0% principal loss' 
              : 'Potential tail loss below contributions'
            }
          </p>
        </div>

        {/* Purple area curve chart matching Behance Card 3 */}
        <div className="h-16 w-full mt-3 relative">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 200 60" preserveAspectRatio="none">
            <defs>
              <linearGradient id="purpleAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#7C4DFF" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#7C4DFF" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d="M 0 55 C 30 54, 50 42, 80 44 C 110 46, 130 52, 160 40 C 180 32, 195 45, 200 50 L 200 60 L 0 60 Z"
              fill="url(#purpleAreaGrad)"
            />
            <path
              d="M 0 55 C 30 54, 50 42, 80 44 C 110 46, 130 52, 160 40 C 180 32, 195 45, 200 50"
              fill="none"
              stroke="#7C4DFF"
              strokeWidth="2.5"
            />
          </svg>
        </div>
      </div>

      {/* CARD 4: Saving Rates / Sharpe Ratio & Distribution */}
      <div className="flux-card p-5 relative overflow-hidden flex flex-col justify-between min-w-0">
        <div>
          <div className="flex items-center gap-2 text-[#8E95A8] text-xs font-medium mb-1.5">
            <div className="w-5 h-5 rounded-full border border-[#262A3B] flex items-center justify-center text-[#A0A6B8] shrink-0">
              <Wallet size={12} />
            </div>
            <span className="truncate">Sharpe Ratio & Efficiency</span>
          </div>

          <div className="flex items-baseline justify-between flex-wrap gap-1.5">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans shrink-0">
              {result.sharpeRatio}
            </span>
            <span className="flex items-center text-[10px] sm:text-[11px] font-medium text-[#FF5722] bg-[#FF5722]/10 px-1.5 py-0.5 rounded-md shrink-0 whitespace-nowrap">
              <Activity size={12} className="mr-0.5" />
              Sortino {result.sortinoRatio}
            </span>
          </div>
          <p className="text-[10px] text-[#5C6275] mt-0.5 truncate">Risk-adjusted return efficiency</p>
        </div>

        {/* Mini vertical bar chart distribution matching Behance Card 4 */}
        <div className="h-16 w-full mt-3 flex items-end justify-between gap-1 sm:gap-1.5 px-1 sm:px-2">
          {[
            { h: 35, active: false },
            { h: 50, active: false },
            { h: 70, active: false },
            { h: 100, active: true },
            { h: 80, active: true },
            { h: 55, active: false },
            { h: 40, active: false },
            { h: 25, active: false },
          ].map((bar, idx) => (
            <div
              key={idx}
              className={`flex-1 min-w-[6px] max-w-[24px] rounded-t-sm transition-all ${
                bar.active 
                  ? 'bg-gradient-to-t from-[#FF5722] to-[#FF7A45] shadow-glow-orange' 
                  : 'bg-[#252837] hover:bg-[#31364A]'
              }`}
              style={{ height: `${bar.h}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
