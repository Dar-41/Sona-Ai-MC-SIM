export type StochasticModel = 'gbm' | 'jump_diffusion' | 'student_t';

export interface SimulationParameters {
  initialBalance: number;
  monthlyContribution: number;
  expectedAnnualReturn: number; // percentage, e.g. 8.5
  annualVolatility: number; // percentage, e.g. 16.0
  timeHorizonYears: number; // e.g. 10
  annualInflationRate: number; // e.g. 2.5
  iterations: number; // e.g. 5000
  model: StochasticModel;
  rebalanceFrequency: 'monthly' | 'quarterly' | 'annually';
  confidenceInterval: number; // e.g. 95
  
  // Jump diffusion parameters (crash risk)
  jumpIntensity?: number; // e.g. 0.1 jumps per year
  jumpMean?: number; // e.g. -0.15 (15% drop)
  jumpStdDev?: number; // e.g. 0.10

  // Asset allocation breakdown
  assets: AssetAllocation[];
}

export interface AssetAllocation {
  id: string;
  name: string;
  weight: number; // percentage, e.g. 50
  expectedReturn: number; // percentage
  volatility: number; // percentage
  color: string;
}

export interface PercentileStep {
  step: number; // in months or years
  year: number;
  month: number;
  dateStr: string;
  p5: number;
  p10: number;
  p25: number;
  p50: number; // median
  p75: number;
  p90: number;
  p95: number;
  mean: number;
  nominalMedian: number;
  totalContributions: number;
}

export interface SimulationResult {
  parameters: SimulationParameters;
  steps: PercentileStep[];
  terminalValues: number[]; // sorted array of final values
  
  // Key statistical metrics
  medianTerminalWealth: number;
  meanTerminalWealth: number;
  nominalTerminalWealth: number;
  totalContributed: number;
  simulatedCAGR: number;
  
  // Risk & Probability Metrics
  var95: number; // Value at Risk 95% (relative downside from median)
  capitalAtRisk: number; // Principal capital at risk
  cvar95: number; // Conditional Value at Risk (Expected Shortfall)
  maxDrawdownExpected: number;
  sharpeRatio: number;
  sortinoRatio: number;
  probabilityOfRuin: number; // % that ended <= 0
  
  // Sample spaghetti trajectories for live charting (e.g. 25 representative paths)
  samplePaths: number[][];

  // Execution meta
  executionTimeMs: number;
}

export interface FinancialGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  targetYear: number;
  category: 'vacation' | 'emergency' | 'retirement' | 'real_estate' | 'custom';
  successProbability: number; // calculated from simulation % reaching target
  colorStart: string;
  colorEnd: string;
}

export interface ParsedDocumentData {
  fileName: string;
  fileType: 'pdf' | 'docx' | 'xlsx' | 'csv';
  extractedTextPreview?: string;
  detectedParameters: Partial<SimulationParameters>;
  detectedGoals?: Partial<FinancialGoal>[];
  detectedCashFlows?: {
    merchant: string;
    category: string;
    account: string;
    date: string;
    amount: number;
    type: 'income' | 'expense';
  }[];
  confidenceScore: number;
}
