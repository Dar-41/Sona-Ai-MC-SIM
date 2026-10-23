import React, { useState } from 'react';
import { FinancialGoal } from '../types/simulation';
import { X, Target, Plus } from 'lucide-react';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: FinancialGoal) => void;
}

export const GoalModal: React.FC<GoalModalProps> = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState(15000);
  const [currentAmount, setCurrentAmount] = useState(3000);
  const [targetYear, setTargetYear] = useState(3);
  const [category, setCategory] = useState<'vacation' | 'emergency' | 'retirement' | 'real_estate' | 'custom'>('custom');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const currentYear = new Date().getFullYear();
    const newGoal: FinancialGoal = {
      id: `goal-${Date.now()}`,
      title,
      targetAmount,
      currentAmount,
      targetDate: `~ Dec ${currentYear + targetYear}`,
      targetYear,
      category,
      successProbability: 85,
      colorStart: '#FF5722',
      colorEnd: '#7C4DFF',
    };

    onSave(newGoal);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-[#11131C] border border-[#23273A] rounded-2xl shadow-2xl p-6 z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-[#1F222E]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FF5722]/15 text-[#FF5722] flex items-center justify-center border border-[#FF5722]/30">
              <Target size={18} />
            </div>
            <h3 className="text-base font-bold text-white">Create New Scenario Goal</h3>
          </div>
          <button onClick={onClose} className="text-[#7B8296] hover:text-white p-1">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="py-4 space-y-4">
          <div>
            <label className="text-xs text-[#8E95A8] font-medium block mb-1.5">Goal Title</label>
            <input
              type="text"
              placeholder="e.g. Dream House Down Payment"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#161824] border border-[#23273A] rounded-xl px-3 py-2 text-xs text-white placeholder-[#5A6072] focus:outline-none focus:border-[#FF5722]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#8E95A8] font-medium block mb-1.5">Target (€)</label>
              <input
                type="number"
                value={targetAmount}
                onChange={(e) => setTargetAmount(Number(e.target.value))}
                className="w-full bg-[#161824] border border-[#23273A] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF5722]"
                required
              />
            </div>
            <div>
              <label className="text-xs text-[#8E95A8] font-medium block mb-1.5">Current Saved (€)</label>
              <input
                type="number"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(Number(e.target.value))}
                className="w-full bg-[#161824] border border-[#23273A] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF5722]"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-[#8E95A8] font-medium block mb-1.5">Target Horizon (Years)</label>
            <input
              type="range"
              min="1"
              max="20"
              value={targetYear}
              onChange={(e) => setTargetYear(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-[11px] text-[#717789] mt-1 font-mono">
              <span>1 Year</span>
              <span className="text-[#FF5722] font-bold">{targetYear} Years</span>
              <span>20 Years</span>
            </div>
          </div>

          <div className="pt-3 border-t border-[#1F222E] flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-[#8E95A8] hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#FF5722] to-[#FF7043] text-white text-xs font-bold shadow-glow-orange flex items-center gap-1.5"
            >
              <Plus size={14} />
              <span>Create Goal</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
