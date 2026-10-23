import React from 'react';
import { 
  Menu, 
  Calendar, 
  Bell, 
  Plus, 
  FileUp, 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronDown,
  Layers,
  Sparkles
} from 'lucide-react';
import { SimulationParameters } from '../types/simulation';

interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenDocModal: () => void;
  onOpenParams: () => void;
  parameters: SimulationParameters;
  isSimulating: boolean;
  onRerun: () => void;
  activeScenario: string;
  setActiveScenario: (s: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onOpenDocModal,
  onOpenParams,
  parameters,
  isSimulating,
  onRerun,
  activeScenario,
  setActiveScenario,
}) => {
  const scenarios = [
    { id: 'balanced', label: 'Balanced Growth', color: '#FF5722' },
    { id: 'aggressive', label: 'Tech & Digital Assets', color: '#7C4DFF' },
    { id: 'conservative', label: 'Capital Preservation', color: '#3B82F6' },
  ];

  return (
    <header className="px-4 lg:px-8 pt-6 pb-4 border-b border-[#1A1C28]/80 bg-[#0B0C10]/80 backdrop-blur-md sticky top-0 z-30">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left greeting & status */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl bg-[#14161F] border border-[#1F222E] text-[#8E95A8] hover:text-white"
          >
            <Menu size={18} />
          </button>
          
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Good morning, DARSH SHETH
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] mr-1.5 animate-pulse" />
                Live Engine
              </span>
            </h1>
            <p className="text-xs text-[#7B8296] mt-0.5 flex items-center gap-1.5">
              <span>Stochastic wealth projections across all accounts</span>
              <span className="inline-block w-1 h-1 rounded-full bg-[#474D5E]" />
              <span className="text-[#9CA3AF] font-mono">{parameters.iterations.toLocaleString()} paths computed</span>
            </p>
          </div>
        </div>

        {/* Right side quick actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Timeframe pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#14161F] border border-[#1F222E] text-xs text-[#A0A6B8]">
            <Calendar size={13} className="text-[#FF5722]" />
            <span className="font-medium text-white">{parameters.timeHorizonYears} Yrs</span>
            <span className="text-[#62687A]">({parameters.timeHorizonYears * 12} mo)</span>
          </div>

          {/* Re-simulate Button */}
          <button
            onClick={onRerun}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#14161F] hover:bg-[#1C1F2B] border border-[#1F222E] text-xs font-medium text-white transition-colors"
            title="Re-run Monte Carlo Simulation"
          >
            <RotateCcw size={13} className="text-[#FF5722]" />
            <span className="hidden sm:inline">Rerun</span>
          </button>

          {/* Upload Document Button */}
          <button
            onClick={onOpenDocModal}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#FF5722] to-[#FF7043] hover:from-[#F4511E] hover:to-[#FF5722] text-xs font-medium text-white shadow-glow-orange transition-all active:scale-95"
          >
            <FileUp size={14} />
            <span>+ Import File</span>
          </button>

          {/* Notification bell */}
          <button className="relative p-2 rounded-xl bg-[#14161F] border border-[#1F222E] text-[#8E95A8] hover:text-white transition-colors">
            <Bell size={16} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#FF5722]" />
          </button>
        </div>
      </div>

      {/* Account / Asset pills matching Behance exactly */}
      <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1 text-xs no-scrollbar">
        {scenarios.map((sc) => {
          const isSelected = activeScenario === sc.id;
          return (
            <button
              key={sc.id}
              onClick={() => setActiveScenario(sc.id)}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all whitespace-nowrap
                ${isSelected 
                  ? 'bg-[#181A25] border-[#FF5722]/50 text-white shadow-sm' 
                  : 'bg-[#12141C] border-[#1F222E] text-[#8E95A8] hover:text-white hover:border-[#2E3347]'
                }
              `}
            >
              <span 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: sc.color, boxShadow: `0 0 8px ${sc.color}` }} 
              />
              <span className="font-medium">{sc.label}</span>
              <ChevronDown size={12} className="text-[#595F70]" />
            </button>
          );
        })}

        {/* + Add scenario / custom parameter button matching Behance dashed style */}
        <button
          onClick={onOpenParams}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-dashed border-[#FF5722]/50 text-[#FF5722] hover:bg-[#FF5722]/10 transition-colors whitespace-nowrap"
        >
          <Plus size={13} />
          <span className="font-medium">Edit Parameters</span>
        </button>
      </div>
    </header>
  );
};
