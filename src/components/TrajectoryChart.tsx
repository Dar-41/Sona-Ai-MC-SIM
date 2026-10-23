import React, { useState, useRef, useMemo, useCallback } from 'react';
import { SimulationResult, PercentileStep } from '../types/simulation';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Layers, 
  Sparkles, 
  BarChart2
} from 'lucide-react';

interface TrajectoryChartProps {
  result: SimulationResult;
}

export const TrajectoryChart: React.FC<TrajectoryChartProps> = ({ result }) => {
  const [viewMode, setViewMode] = useState<'bars' | 'cone' | 'paths'>('bars');
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
  const [hoverStepIndex, setHoverStepIndex] = useState<number | null>(null);
  const [cursorX, setCursorX] = useState<number>(0);
  
  const chartBodyRef = useRef<HTMLDivElement>(null);
  const cachedRectRef = useRef<DOMRect | null>(null);
  const rafIdRef = useRef<number | null>(null);

  const steps = result.steps;
  const numSteps = steps.length;
  if (numSteps === 0) return null;

  // Representative intervals for bar view
  const intervalCount = Math.min(8, numSteps - 1);
  const barIntervals = useMemo(() => {
    const list: {
      label: string;
      stepData: PercentileStep;
      p10: number;
      p50: number;
      p90: number;
    }[] = [];
    for (let i = 1; i <= intervalCount; i++) {
      const stepIdx = Math.floor((i / intervalCount) * (numSteps - 1));
      const step = steps[stepIdx];
      list.push({
        label: step.dateStr,
        stepData: step,
        p10: step.p10,
        p50: step.p50,
        p90: step.p90,
      });
    }
    return list;
  }, [steps, intervalCount, numSteps]);

  const maxVal = useMemo(() => Math.max(...steps.map(s => s.p90), 1000), [steps]);

  const formatEuro = (v: number) => {
    return `€${Math.round(v).toLocaleString('en-US')}`;
  };

  // Cache bounding client rect on enter to avoid expensive layout thrashing
  const handleMouseEnter = () => {
    if (chartBodyRef.current) {
      cachedRectRef.current = chartBodyRef.current.getBoundingClientRect();
    }
  };

  // Throttled mouse tracking with requestAnimationFrame
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (rafIdRef.current) return;
    const clientX = e.clientX;

    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null;
      let rect = cachedRectRef.current;
      if (!rect && chartBodyRef.current) {
        rect = chartBodyRef.current.getBoundingClientRect();
        cachedRectRef.current = rect;
      }
      if (!rect) return;

      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      setCursorX(x);
      const fraction = x / rect.width;
      const stepIdx = Math.min(Math.round(fraction * (numSteps - 1)), numSteps - 1);
      setHoverStepIndex(stepIdx);
    });
  }, [numSteps]);

  const handleMouseLeave = () => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    cachedRectRef.current = null;
    setHoverStepIndex(null);
  };

  const activeStep = hoverStepIndex !== null ? steps[hoverStepIndex] : null;
  const activeBar = hoveredBarIndex !== null ? barIntervals[hoveredBarIndex] : null;

  // Memoize SVG Cone Path calculations so mousemove never recomputes string geometries
  const coneD90 = useMemo(() => {
    if (steps.length === 0) return '';
    return (
      `M 0 ${200 - (steps[0].p10 / maxVal) * 190} ` +
      steps.map((s, i) => `L ${(i / (numSteps - 1)) * 1000} ${200 - (s.p90 / maxVal) * 190}`).join(' ') +
      ` ` +
      steps.slice().reverse().map((s, i) => `L ${((numSteps - 1 - i) / (numSteps - 1)) * 1000} ${200 - (s.p10 / maxVal) * 190}`).join(' ') +
      ' Z'
    );
  }, [steps, maxVal, numSteps]);

  const coneD75 = useMemo(() => {
    if (steps.length === 0) return '';
    return (
      `M 0 ${200 - (steps[0].p25 / maxVal) * 190} ` +
      steps.map((s, i) => `L ${(i / (numSteps - 1)) * 1000} ${200 - (s.p75 / maxVal) * 190}`).join(' ') +
      ` ` +
      steps.slice().reverse().map((s, i) => `L ${((numSteps - 1 - i) / (numSteps - 1)) * 1000} ${200 - (s.p25 / maxVal) * 190}`).join(' ') +
      ' Z'
    );
  }, [steps, maxVal, numSteps]);

  const medianConeD = useMemo(() => {
    if (steps.length === 0) return '';
    return (
      `M 0 ${200 - (steps[0].p50 / maxVal) * 190} ` +
      steps.map((s, i) => `L ${(i / (numSteps - 1)) * 1000} ${200 - (s.p50 / maxVal) * 190}`).join(' ')
    );
  }, [steps, maxVal, numSteps]);

  const contributionBaselineD = useMemo(() => {
    if (steps.length === 0) return '';
    return (
      `M 0 ${200 - (steps[0].totalContributions / maxVal) * 190} ` +
      steps.map((s, i) => `L ${(i / (numSteps - 1)) * 1000} ${200 - (s.totalContributions / maxVal) * 190}`).join(' ')
    );
  }, [steps, maxVal, numSteps]);

  // Memoize Sample Paths SVG strings
  const samplePathStrings = useMemo(() => {
    return result.samplePaths.map((path) => {
      const totalP = path.length;
      return (
        `M 0 ${200 - (path[0] / maxVal) * 190} ` +
        path.map((val, stepIdx) => `L ${(stepIdx / (totalP - 1)) * 1000} ${200 - (val / maxVal) * 190}`).join(' ')
      );
    });
  }, [result.samplePaths, maxVal]);

  return (
    <div className="flux-card p-6 relative overflow-hidden flex flex-col justify-between h-[380px]">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-base font-bold text-white tracking-tight">
              Simulation Trajectory & Cash Flow
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1F222E] text-[#8E95A8] border border-[#2B2F42]">
              {result.parameters.iterations.toLocaleString()} runs • {result.executionTimeMs}ms
            </span>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-1.5 text-xs">
            <span className="flex items-center gap-1 text-[#8E95A8]">
              <ArrowUpRight size={14} className="text-[#FF5722]" />
              <span className="text-[#FF5722] font-medium">Expected Median (P50)</span>
            </span>
            <span className="flex items-center gap-1 text-[#8E95A8]">
              <ArrowDownRight size={14} className="text-[#7C4DFF]" />
              <span className="text-[#7C4DFF] font-medium">Conservative (P10)</span>
            </span>
          </div>
        </div>

        {/* View Switcher Pills */}
        <div className="flex items-center gap-1.5 bg-[#0E0F15] p-1 rounded-xl border border-[#1F222E] self-start sm:self-auto">
          <button
            onClick={() => setViewMode('bars')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
              viewMode === 'bars'
                ? 'bg-[#1F222E] text-white shadow-sm'
                : 'text-[#6A7182] hover:text-white'
            }`}
          >
            <BarChart2 size={13} />
            <span>Intervals</span>
          </button>
          <button
            onClick={() => setViewMode('cone')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
              viewMode === 'cone'
                ? 'bg-[#1F222E] text-white shadow-sm'
                : 'text-[#6A7182] hover:text-white'
            }`}
          >
            <Layers size={13} />
            <span>Cone Bands</span>
          </button>
          <button
            onClick={() => setViewMode('paths')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
              viewMode === 'paths'
                ? 'bg-[#1F222E] text-white shadow-sm'
                : 'text-[#6A7182] hover:text-white'
            }`}
          >
            <Sparkles size={13} />
            <span>Live Paths</span>
          </button>
        </div>
      </div>

      {/* Main Chart Body */}
      <div 
        ref={chartBodyRef}
        onMouseEnter={handleMouseEnter}
        onMouseMove={viewMode !== 'bars' ? handleMouseMove : undefined}
        onMouseLeave={handleMouseLeave}
        className="relative flex-1 w-full min-h-[220px] select-none"
      >
        {/* Y Axis Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
          <div className="border-b border-[#2D3145] w-full" />
          <div className="border-b border-[#2D3145] w-full" />
          <div className="border-b border-[#2D3145] w-full" />
          <div className="border-b border-[#2D3145] w-full" />
        </div>

        {/* 1. Bar Hover Tooltip */}
        {viewMode === 'bars' && activeBar && (
          <div 
            className="absolute z-20 pointer-events-none transition-all duration-150"
            style={{
              top: '10px',
              left: `${Math.min(Math.max((hoveredBarIndex ?? 0) * 12 + 10, 5), 70)}%`,
            }}
          >
            <div className="bg-[#12131A]/95 backdrop-blur-md border border-[#2A2E3F] rounded-xl p-3 shadow-2xl min-w-[170px] text-xs">
              <p className="font-semibold text-white mb-1.5 border-b border-[#1F222E] pb-1">
                {activeBar.label} • Year {activeBar.stepData.year}
              </p>
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-3 text-[#A0A6B8]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-3 rounded-full bg-[#FF5722]" />
                    Median P50
                  </span>
                  <span className="font-mono font-medium text-white">
                    {formatEuro(activeBar.p50)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 text-[#A0A6B8]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-3 rounded-full bg-[#7C4DFF]" />
                    P10 Risk
                  </span>
                  <span className="font-mono font-medium text-white">
                    {formatEuro(activeBar.p10)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 text-[#A0A6B8] pt-0.5">
                  <span className="text-[#717789]">Net Real Gain</span>
                  <span className="font-mono font-medium text-[#10B981]">
                    +{formatEuro(Math.max(0, activeBar.p50 - activeBar.stepData.totalContributions))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. Continuous Crosshair Tooltip for Cone & Paths (Only appears on hover) */}
        {viewMode !== 'bars' && activeStep && (
          <>
            {/* Vertical Laser Crosshair */}
            <div 
              className="absolute top-0 bottom-6 w-[1px] bg-gradient-to-b from-[#FF5722] via-[#7C4DFF] to-transparent pointer-events-none z-10"
              style={{ left: `${cursorX}px` }}
            />
            {/* Interactive Tooltip Card positioned dynamically next to cursor */}
            <div 
              className="absolute z-20 pointer-events-none"
              style={{
                top: '10px',
                left: `${Math.min(Math.max(cursorX - 85, 10), (cachedRectRef.current?.width ?? 400) - 185)}px`,
              }}
            >
              <div className="bg-[#12131A]/95 backdrop-blur-md border border-[#2A2E3F] rounded-xl p-3 shadow-2xl min-w-[170px] text-xs">
                <p className="font-semibold text-white mb-1.5 border-b border-[#1F222E] pb-1">
                  {activeStep.dateStr} • Year {activeStep.year}
                </p>
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-3 text-[#A0A6B8]">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-3 rounded-full bg-[#FF5722]" />
                      Median P50
                    </span>
                    <span className="font-mono font-medium text-white">
                      {formatEuro(activeStep.p50)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-[#A0A6B8]">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-3 rounded-full bg-[#7C4DFF]" />
                      P10 Risk
                    </span>
                    <span className="font-mono font-medium text-white">
                      {formatEuro(activeStep.p10)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-[#A0A6B8] pt-0.5">
                    <span className="text-[#717789]">Net Real Gain</span>
                    <span className="font-mono font-medium text-[#10B981]">
                      +{formatEuro(Math.max(0, activeStep.p50 - activeStep.totalContributions))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* VIEW 1: Grouped Bars */}
        {viewMode === 'bars' && (
          <div className="w-full h-full flex items-end justify-between gap-2 px-4 pb-6">
            {barIntervals.map((bar, idx) => {
              const isSelected = hoveredBarIndex === idx;
              const p50Height = Math.max(12, Math.min(100, (bar.p50 / maxVal) * 95));
              const p10Height = Math.max(8, Math.min(100, (bar.p10 / maxVal) * 95));

              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredBarIndex(idx)}
                  onMouseLeave={() => setHoveredBarIndex(null)}
                  className="flex-1 h-full flex flex-col justify-end items-center cursor-pointer group"
                >
                  <div className="w-full max-w-[48px] flex items-end justify-center gap-1.5 h-[85%]">
                    {/* Secondary Bar (Conservative P10) */}
                    <div
                      className={`w-1/2 rounded-t-md transition-all duration-300 ${
                        isSelected
                          ? 'bg-gradient-to-t from-[#651FFF] to-[#7C4DFF] shadow-glow-purple'
                          : 'bg-[#212433] group-hover:bg-[#2C3044]'
                      }`}
                      style={{ height: `${p10Height}%` }}
                    />
                    {/* Primary Bar (Median P50) */}
                    <div
                      className={`w-1/2 rounded-t-md transition-all duration-300 ${
                        isSelected
                          ? 'bg-gradient-to-t from-[#FF5722] to-[#FF7043] shadow-glow-orange'
                          : 'bg-[#292D3E] group-hover:bg-[#34394E]'
                      }`}
                      style={{ height: `${p50Height}%` }}
                    />
                  </div>
                  {/* Label */}
                  <span className={`text-[11px] mt-2 font-mono transition-colors ${
                    isSelected ? 'text-white font-bold' : 'text-[#585E70] group-hover:text-[#8E95A8]'
                  }`}>
                    {bar.label.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* VIEW 2: Continuous Percentile Cone Bands */}
        {viewMode === 'cone' && (
          <svg className="w-full h-full overflow-visible pb-6" viewBox="0 0 1000 200" preserveAspectRatio="none">
            <defs>
              <linearGradient id="coneGrad90" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FF5722" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#7C4DFF" stopOpacity="0.10" />
              </linearGradient>
              <linearGradient id="coneGrad75" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FF5722" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#7C4DFF" stopOpacity="0.25" />
              </linearGradient>
            </defs>

            {/* P10 - P90 Band */}
            <path d={coneD90} fill="url(#coneGrad90)" />

            {/* P25 - P75 Band */}
            <path d={coneD75} fill="url(#coneGrad75)" />

            {/* P50 Median Line */}
            <path
              d={medianConeD}
              fill="none"
              stroke="#FF5722"
              strokeWidth="2.5"
              vectorEffect="non-scaling-stroke"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Total Contribution Baseline */}
            <path
              d={contributionBaselineD}
              fill="none"
              stroke="#6B7280"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        )}

        {/* VIEW 3: Live Spaghetti Paths */}
        {viewMode === 'paths' && (
          <svg className="w-full h-full overflow-visible pb-6" viewBox="0 0 1000 200" preserveAspectRatio="none">
            {/* Background Sample Paths */}
            {samplePathStrings.slice(1).map((dString, pathIdx) => {
              const color = pathIdx % 2 === 0 ? 'rgba(124, 77, 255, 0.45)' : 'rgba(59, 130, 246, 0.40)';
              return (
                <path
                  key={pathIdx}
                  d={dString}
                  fill="none"
                  stroke={color}
                  strokeWidth="1.2"
                  vectorEffect="non-scaling-stroke"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              );
            })}

            {/* Primary Highlighted Path (Path 0) */}
            {samplePathStrings[0] && (
              <path
                d={samplePathStrings[0]}
                fill="none"
                stroke="#FF5722"
                strokeWidth="2.5"
                vectorEffect="non-scaling-stroke"
                strokeLinejoin="round"
                strokeLinecap="round"
                style={{ filter: 'drop-shadow(0 0 6px #FF5722)' }}
              />
            )}
          </svg>
        )}
      </div>

      {/* Footer labels */}
      <div className="flex items-center justify-between text-[11px] text-[#6B7280] pt-2 border-t border-[#1F222E]/80">
        <span>Starting: {formatEuro(result.parameters.initialBalance)}</span>
        <span className="font-mono text-[#A0A6B8]">
          Nominal Median: {formatEuro(result.nominalTerminalWealth)} • Real: {formatEuro(result.medianTerminalWealth)}
        </span>
        <span>Horizon: {result.parameters.timeHorizonYears} Years</span>
      </div>
    </div>
  );
};
