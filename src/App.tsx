import React, { useState, useMemo, useEffect, useDeferredValue } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { StatCards } from './components/StatCards';
import { TrajectoryChart } from './components/TrajectoryChart';
import { CategoryDonut } from './components/CategoryDonut';
import { SavingGoals } from './components/SavingGoals';
import { RecentTransactions } from './components/RecentTransactions';
import { ParameterPanel } from './components/ParameterPanel';
import { DocumentModal } from './components/DocumentModal';
import { GoalModal } from './components/GoalModal';
import { AnalyticsView } from './components/AnalyticsView';
import { runMonteCarloSimulation } from './engine/monteCarlo';
import { SimulationParameters, FinancialGoal, SimulationResult } from './types/simulation';

export function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isParamDrawerOpen, setIsParamDrawerOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [activeScenario, setActiveScenario] = useState('balanced');
  const [isHighPerfMode, setIsHighPerfMode] = useState(false);

  // Default parameters match the Behance screens (€42,180 initial balance!)
  const initialDefaultParams: SimulationParameters = {
    initialBalance: 42180,
    monthlyContribution: 850,
    expectedAnnualReturn: 8.6,
    annualVolatility: 14.5,
    timeHorizonYears: 10,
    annualInflationRate: 2.4,
    iterations: 5000,
    model: 'gbm',
    rebalanceFrequency: 'quarterly',
    confidenceInterval: 95,
    jumpIntensity: 0.15,
    jumpMean: -0.15,
    jumpStdDev: 0.1,
    // Matching Behance donut chart categories & colors exactly
    assets: [
      { id: '1', name: 'Real Estate', weight: 38, expectedReturn: 7.2, volatility: 11.0, color: '#FF5722' },
      { id: '2', name: 'Equities', weight: 22, expectedReturn: 9.8, volatility: 16.5, color: '#3B82F6' },
      { id: '3', name: 'Tech Index', weight: 18, expectedReturn: 13.5, volatility: 24.0, color: '#7C4DFF' },
      { id: '4', name: 'Treasury', weight: 12, expectedReturn: 3.8, volatility: 2.0, color: '#00E5FF' },
      { id: '5', name: 'Commodities', weight: 10, expectedReturn: 6.0, volatility: 14.0, color: '#6B7280' },
    ],
  };

  const [parameters, setParameters] = useState<SimulationParameters>(initialDefaultParams);

  // Default goals matching Behance mockup
  const [goals, setGoals] = useState<FinancialGoal[]>([
    {
      id: 'g-1',
      title: 'Vacations',
      targetAmount: 3000,
      currentAmount: 1200,
      targetDate: '~ Aug 2026',
      targetYear: 1,
      category: 'vacation',
      successProbability: 88,
      colorStart: '#FF5722',
      colorEnd: '#7C4DFF',
    },
    {
      id: 'g-2',
      title: 'Emergency Fund',
      targetAmount: 10000,
      currentAmount: 7200,
      targetDate: '~ Nov 2026',
      targetYear: 1,
      category: 'emergency',
      successProbability: 94,
      colorStart: '#FF5722',
      colorEnd: '#3B82F6',
    },
  ]);

  const [customTransactions, setCustomTransactions] = useState<any[]>([]);

  // Update simulation parameters when scenario pill changes
  useEffect(() => {
    if (activeScenario === 'aggressive') {
      setParameters(prev => ({
        ...prev,
        expectedAnnualReturn: 13.8,
        annualVolatility: 26.0,
        model: 'student_t',
      }));
    } else if (activeScenario === 'conservative') {
      setParameters(prev => ({
        ...prev,
        expectedAnnualReturn: 5.4,
        annualVolatility: 7.5,
        model: 'gbm',
      }));
    } else {
      setParameters(prev => ({
        ...prev,
        expectedAnnualReturn: 8.6,
        annualVolatility: 14.5,
        model: 'gbm',
      }));
    }
  }, [activeScenario]);

  // Adjust iterations when Turbo Mode toggled
  useEffect(() => {
    setParameters(prev => ({
      ...prev,
      iterations: isHighPerfMode ? 35000 : 10000,
    }));
  }, [isHighPerfMode]);

  // Use React 18 concurrent deferred value so sliders & UI stay at 120 FPS
  const deferredParameters = useDeferredValue(parameters);

  // Compute live Monte Carlo simulation concurrently
  const simulationResult: SimulationResult = useMemo(() => {
    return runMonteCarloSimulation(deferredParameters);
  }, [deferredParameters]);

  // Apply parsed document data
  const handleApplyExtractedDocument = (
    newParams: Partial<SimulationParameters>,
    detectedGoals?: Partial<FinancialGoal>[],
    transactions?: any[]
  ) => {
    setParameters(prev => ({
      ...prev,
      ...newParams,
    }));

    if (detectedGoals && detectedGoals.length > 0) {
      const fullGoals = detectedGoals.map((dg, idx) => ({
        id: dg.id || `goal-doc-${Date.now()}-${idx}`,
        title: dg.title || 'Extracted Target',
        targetAmount: dg.targetAmount || 50000,
        currentAmount: dg.currentAmount || parameters.initialBalance,
        targetDate: dg.targetDate || `~ Dec ${new Date().getFullYear() + 5}`,
        targetYear: dg.targetYear || 5,
        category: dg.category || 'custom',
        successProbability: 85,
        colorStart: '#FF5722',
        colorEnd: '#7C4DFF',
      }));
      setGoals(fullGoals);
    }

    if (transactions && transactions.length > 0) {
      setCustomTransactions(transactions);
    }

    setActiveTab('overview');
  };

  const handleAddGoal = (newGoal: FinancialGoal) => {
    setGoals(prev => [...prev, newGoal]);
  };

  return (
    <div className="min-h-screen bg-[#0B0C10] flex overflow-x-hidden font-sans">
      {/* Left Sidebar matching Fluxo design */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenDocModal={() => setIsDocModalOpen(true)}
        onOpenParams={() => setIsParamDrawerOpen(true)}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        isHighPerfMode={isHighPerfMode}
        setIsHighPerfMode={setIsHighPerfMode}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          onToggleSidebar={() => setIsSidebarOpen(true)}
          onOpenDocModal={() => setIsDocModalOpen(true)}
          onOpenParams={() => setIsParamDrawerOpen(true)}
          parameters={parameters}
          isSimulating={false}
          onRerun={() => {
            // Trigger quick re-run by slightly nudging iterations to force memo update
            setParameters(prev => ({ ...prev, iterations: prev.iterations }));
          }}
          activeScenario={activeScenario}
          setActiveScenario={setActiveScenario}
        />

        {/* Dynamic Main Body */}
        <main className="p-4 lg:p-8 space-y-6 flex-1">
          {activeTab === 'overview' && (
            <>
              {/* Stat Cards matching Behance 4 top/bottom cards */}
              <StatCards result={simulationResult} params={parameters} />

              {/* Middle Row: Trajectory Chart & Donut Allocation */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7">
                  <TrajectoryChart result={simulationResult} />
                </div>
                <div className="lg:col-span-5">
                  <CategoryDonut 
                    assets={parameters.assets} 
                    totalValue={parameters.initialBalance} 
                  />
                </div>
              </div>

              {/* Lower Row: Recent Transactions Ledger & Saving Goals */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7">
                  <RecentTransactions customTransactions={customTransactions} />
                </div>
                <div className="lg:col-span-5">
                  <SavingGoals
                    goals={goals}
                    result={simulationResult}
                    onAddGoal={() => setIsGoalModalOpen(true)}
                  />
                </div>
              </div>
            </>
          )}

          {activeTab === 'simulation' && (
            <div className="space-y-6">
              <StatCards result={simulationResult} params={parameters} />
              <TrajectoryChart result={simulationResult} />
              <div className="flux-card p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Need to refine inputs?</h3>
                  <p className="text-xs text-[#7B8296] mt-0.5">
                    Adjust initial balance, returns, volatility, crash shocks, and simulation horizon in real time.
                  </p>
                </div>
                <button
                  onClick={() => setIsParamDrawerOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#FF5722] text-white text-xs font-bold shadow-glow-orange hover:bg-[#FF7043] transition-colors"
                >
                  Configure Parameters
                </button>
              </div>
            </div>
          )}

          {activeTab === 'goals' && (
            <div className="space-y-6">
              <StatCards result={simulationResult} params={parameters} />
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7">
                  <SavingGoals
                    goals={goals}
                    result={simulationResult}
                    onAddGoal={() => setIsGoalModalOpen(true)}
                  />
                </div>
                <div className="lg:col-span-5">
                  <CategoryDonut
                    assets={parameters.assets}
                    totalValue={parameters.initialBalance}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView result={simulationResult} params={parameters} />
          )}
        </main>
      </div>

      {/* Interactive Parameter Tuning Drawer */}
      <ParameterPanel
        isOpen={isParamDrawerOpen}
        onClose={() => setIsParamDrawerOpen(false)}
        params={parameters}
        onChange={setParameters}
        onReset={() => setParameters(initialDefaultParams)}
      />

      {/* Universal Document Reader Modal (PDF, Word, Excel) */}
      <DocumentModal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        onApplyExtracted={handleApplyExtractedDocument}
      />

      {/* New Goal Creator Modal */}
      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onSave={handleAddGoal}
      />
    </div>
  );
}

export default App;
