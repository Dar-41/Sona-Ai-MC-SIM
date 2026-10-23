import React from 'react';
import { SimulationParameters, StochasticModel } from '../types/simulation';
import { 
  Sliders, 
  X, 
  RotateCcw, 
  Sparkles, 
  TrendingUp, 
  ShieldAlert, 
  Percent, 
  DollarSign, 
  Clock, 
  Cpu,
  Layers
} from 'lucide-react';

interface ParameterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  params: SimulationParameters;
  onChange: (newParams: SimulationParameters) => void;
  onReset: () => void;
}

export const ParameterPanel: React.FC<ParameterPanelProps> = ({
  isOpen,
  onClose,
  params,
  onChange,
  onReset,
}) => {
  if (!isOpen) return null;

  const updateParam = <K extends keyof SimulationParameters>(key: K, value: SimulationParameters[K]) => {
    onChange({
      ...params,
      [key]: value,
    });
  };

  const updateAssetWeight = (index: number, newWeight: number) => {
    const updatedAssets = [...params.assets];
    updatedAssets[index].weight = newWeight;
    onChange({
      ...params,
      assets: updatedAssets,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-[#0E1017] border-l border-[#1F222E] h-full shadow-2xl flex flex-col justify-between z-10 overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#1F222E] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FF5722]/15 text-[#FF5722] flex items-center justify-center border border-[#FF5722]/30">
              <Sliders size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Simulation Parameters
              </h2>
              <p className="text-[11px] text-[#717789]">
                Live stochastic engine controls
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onReset}
              className="p-1.5 rounded-lg bg-[#14161F] text-[#8E95A8] hover:text-white border border-[#1F222E] transition-colors"
              title="Reset to defaults"
            >
              <RotateCcw size={15} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#14161F] text-[#8E95A8] hover:text-white border border-[#1F222E] transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable Parameter Form */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Group 1: Capital & Horizon */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#FF5722] flex items-center gap-1.5">
              <DollarSign size={13} />
              Capital & Time Horizon
            </h3>

            {/* Initial Balance */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-[#A0A6B8] font-medium">Initial Balance (€)</span>
                <span className="text-white font-mono font-bold">€{params.initialBalance.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="1000"
                max="500000"
                step="1000"
                value={params.initialBalance}
                onChange={(e) => updateParam('initialBalance', Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Monthly Contribution */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-[#A0A6B8] font-medium">Monthly Savings / Inflow (€)</span>
                <span className="text-white font-mono font-bold">€{params.monthlyContribution.toLocaleString()}/mo</span>
              </div>
              <input
                type="range"
                min="-2000"
                max="10000"
                step="50"
                value={params.monthlyContribution}
                onChange={(e) => updateParam('monthlyContribution', Number(e.target.value))}
                className="w-full"
              />
              <span className="text-[10px] text-[#5A6072] mt-0.5 block">
                Negative values simulate retirement withdrawal or startup cash-burn.
              </span>
            </div>

            {/* Time Horizon */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-[#A0A6B8] font-medium">Time Horizon</span>
                <span className="text-white font-mono font-bold">{params.timeHorizonYears} Years</span>
              </div>
              <input
                type="range"
                min="1"
                max="35"
                step="1"
                value={params.timeHorizonYears}
                onChange={(e) => updateParam('timeHorizonYears', Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          {/* Group 2: Stochastic Dynamics */}
          <div className="space-y-4 pt-2 border-t border-[#1F222E]">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#7C4DFF] flex items-center gap-1.5">
              <TrendingUp size={13} />
              Return, Volatility & Inflation
            </h3>

            {/* Expected Annual Return */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-[#A0A6B8] font-medium">Expected Annual Return (CAGR)</span>
                <span className="text-[#FF5722] font-mono font-bold">{params.expectedAnnualReturn}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="25"
                step="0.1"
                value={params.expectedAnnualReturn}
                onChange={(e) => updateParam('expectedAnnualReturn', Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Annual Volatility */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-[#A0A6B8] font-medium">Annual Volatility (σ)</span>
                <span className="text-[#7C4DFF] font-mono font-bold">{params.annualVolatility}%</span>
              </div>
              <input
                type="range"
                min="3"
                max="45"
                step="0.5"
                value={params.annualVolatility}
                onChange={(e) => updateParam('annualVolatility', Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Inflation Rate */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-[#A0A6B8] font-medium">Annual Inflation Discount</span>
                <span className="text-white font-mono font-bold">{params.annualInflationRate}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="12"
                step="0.1"
                value={params.annualInflationRate}
                onChange={(e) => updateParam('annualInflationRate', Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          {/* Group 3: Simulation Model & Iterations */}
          <div className="space-y-4 pt-2 border-t border-[#1F222E]">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#3B82F6] flex items-center gap-1.5">
              <Cpu size={13} />
              Stochastic Model & Sample Size
            </h3>

            {/* Model Selector */}
            <div>
              <span className="text-xs text-[#A0A6B8] font-medium block mb-2">Distribution Model</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'gbm', label: 'Geometric BM', desc: 'Log-normal' },
                  { id: 'jump_diffusion', label: 'Merton Jump', desc: 'Crash Shocks' },
                  { id: 'student_t', label: 'Student-t', desc: 'Fat Tails' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => updateParam('model', m.id as StochasticModel)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      params.model === m.id
                        ? 'bg-[#181A25] border-[#FF5722] text-white shadow-glow-orange'
                        : 'bg-[#13151F] border-[#1F222E] text-[#717789] hover:text-white'
                    }`}
                  >
                    <p className="text-xs font-bold">{m.label}</p>
                    <p className="text-[10px] text-[#5A6072] mt-0.5">{m.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Iterations selector */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-[#A0A6B8] font-medium">Simulated Paths (N)</span>
                <span className="text-white font-mono font-bold">{params.iterations.toLocaleString()} runs</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[1000, 5000, 10000, 25000].map((n) => (
                  <button
                    key={n}
                    onClick={() => updateParam('iterations', n)}
                    className={`py-1.5 rounded-lg border text-xs font-mono transition-colors ${
                      params.iterations === n
                        ? 'bg-[#FF5722] border-[#FF5722] text-white font-bold'
                        : 'bg-[#13151F] border-[#1F222E] text-[#8E95A8] hover:text-white'
                    }`}
                  >
                    {n / 1000}k
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Group 4: Asset Allocation Tuning */}
          <div className="space-y-3 pt-2 border-t border-[#1F222E]">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A0A6B8] flex items-center gap-1.5">
              <Layers size={13} />
              Asset Class Weights
            </h3>

            {params.assets.map((asset, idx) => (
              <div key={asset.id} className="bg-[#13151F] p-3 rounded-xl border border-[#1F222E] space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-white font-medium">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: asset.color }} />
                    {asset.name}
                  </span>
                  <span className="font-mono text-white font-bold">{asset.weight}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={asset.weight}
                  onChange={(e) => updateAssetWeight(idx, Number(e.target.value))}
                  className="w-full"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1F222E] bg-[#0E1017] flex items-center justify-between gap-3">
          <span className="text-[11px] text-[#717789]">
            Instant live recalculation enabled
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#FF5722] to-[#FF7043] text-white text-xs font-bold shadow-glow-orange hover:opacity-95 transition-opacity"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
