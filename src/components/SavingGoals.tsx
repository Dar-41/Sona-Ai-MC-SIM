import React from 'react';
import { FinancialGoal, SimulationResult } from '../types/simulation';
import { ArrowUpRight, Plus, CheckCircle2, AlertCircle } from 'lucide-react';

interface SavingGoalsProps {
  goals: FinancialGoal[];
  result: SimulationResult;
  onAddGoal: () => void;
}

export const SavingGoals: React.FC<SavingGoalsProps> = ({ goals, result, onAddGoal }) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const totalLEDTicks = 48; // Total vertical segment lines for the progress bar

  return (
    <div className="flux-card p-6 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Saving Goals & Probability
          </h3>
          <p className="text-[11px] text-[#717789] mt-0.5">
            Monte Carlo verified probability of achievement
          </p>
        </div>
        <button className="text-[#8E95A8] hover:text-white transition-colors">
          <ArrowUpRight size={18} />
        </button>
      </div>

      {/* Goals List */}
      <div className="space-y-6 my-auto">
        {goals.map((goal) => {
          // Calculate progress percentage based on current vs target
          const progressPercent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
          const filledTicks = Math.round((progressPercent / 100) * totalLEDTicks);

          // Calculate Monte Carlo probability of reaching target from simulation terminal values
          const successfulRuns = result.terminalValues.filter(v => v >= goal.targetAmount).length;
          const mcProbability = Math.round((successfulRuns / result.terminalValues.length) * 100);

          return (
            <div key={goal.id} className="space-y-2">
              {/* Title & Percentage Header matching Behance */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white tracking-wide">
                    {goal.title}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1A1D2B] text-[#10B981] font-mono border border-[#23273A]">
                    {mcProbability}% MC Chance
                  </span>
                </div>
                <span className="font-bold text-sm text-white font-mono">
                  {progressPercent}%
                </span>
              </div>

              {/* Signature LED Segment Progress Bar matching Behance exactly */}
              <div className="flex items-center gap-[3px] h-6 w-full py-0.5">
                {Array.from({ length: totalLEDTicks }).map((_, idx) => {
                  const isFilled = idx < filledTicks;
                  // Color interpolation along filled ticks: from orange (#FF5722) to purple (#7C4DFF)
                  const ratio = filledTicks > 1 ? idx / (filledTicks - 1) : 0;
                  
                  return (
                    <div
                      key={idx}
                      className={`h-full flex-1 rounded-[1.5px] transition-all duration-300 ${
                        isFilled
                          ? 'shadow-[0_0_8px_rgba(255,87,34,0.3)]'
                          : 'bg-[#1E212E]'
                      }`}
                      style={{
                        backgroundColor: isFilled
                          ? `hsl(${14 + ratio * 245}, 100%, ${56 + ratio * 8}%)`
                          : undefined,
                      }}
                    />
                  );
                })}
              </div>

              {/* Subtitle row matching Behance: Current/Target on left, Date on right */}
              <div className="flex items-center justify-between text-xs text-[#7B8296] font-mono">
                <span>
                  {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                </span>
                <span className="text-[#A0A6B8]">
                  {goal.targetDate}
                </span>
              </div>
            </div>
          );
        })}

        {/* "+ New Goal" dashed outline button matching Behance */}
        <button
          onClick={onAddGoal}
          className="w-full py-2.5 rounded-xl border border-dashed border-[#FF5722]/50 text-[#FF5722] hover:bg-[#FF5722]/10 flex items-center justify-center gap-2 text-xs font-semibold tracking-wide transition-all active:scale-[0.99]"
        >
          <Plus size={14} />
          <span>+ New Goal</span>
        </button>
      </div>
    </div>
  );
};
