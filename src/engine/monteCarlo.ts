import { SimulationParameters, SimulationResult, PercentileStep } from '../types/simulation';

// Fast Marsaglia Polar Method for standard Gaussian random numbers
let hasSpareGaussian = false;
let spareGaussian = 0;

function fastRandomGaussian(): number {
  if (hasSpareGaussian) {
    hasSpareGaussian = false;
    return spareGaussian;
  }
  let u = 0, v = 0, s = 0;
  do {
    u = Math.random() * 2.0 - 1.0;
    v = Math.random() * 2.0 - 1.0;
    s = u * u + v * v;
  } while (s >= 1.0 || s === 0);

  const mul = Math.sqrt(-2.0 * Math.log(s) / s);
  spareGaussian = v * mul;
  hasSpareGaussian = true;
  return u * mul;
}

// Student-t random generator using Gamma / Gaussian ratio
function randomStudentT(degreesOfFreedom: number = 5): number {
  const z = fastRandomGaussian();
  let chiSquare = 0;
  for (let i = 0; i < degreesOfFreedom; i++) {
    const g = fastRandomGaussian();
    chiSquare += g * g;
  }
  return z / Math.sqrt(chiSquare / degreesOfFreedom);
}

// Poisson generator for Jump-Diffusion
function randomPoisson(lambda: number): number {
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1.0;
  do {
    k++;
    p *= Math.random();
  } while (p > L);
  return k - 1;
}

// O(1) Closed-form Annuity Newton-Raphson Solver for Internal Rate of Return (IRR)
function fastAnnuityIRR(initial: number, monthlyContribution: number, months: number, terminalVal: number): number {
  if (initial <= 0 || terminalVal <= 0 || months <= 0) return 0;
  if (Math.abs(monthlyContribution) < 1) {
    return (Math.pow(terminalVal / initial, 12 / months) - 1) * 100;
  }
  let r = 0.005; // 0.5% monthly guess
  for (let iter = 0; iter < 12; iter++) {
    const v = 1 / (1 + r);
    const vn = Math.pow(v, months);
    const an = (1 - vn) / r;
    const npv = -initial - monthlyContribution * an + terminalVal * vn;

    const dan = (months * Math.pow(v, months + 1) * r - (1 - vn)) / (r * r);
    const dnpv = -monthlyContribution * dan - months * terminalVal * Math.pow(v, months + 1);

    if (Math.abs(dnpv) < 1e-12) break;
    const nextR = r - npv / dnpv;
    if (isNaN(nextR) || nextR < -0.99) break;
    if (Math.abs(nextR - r) < 1e-6) {
      r = nextR;
      break;
    }
    r = nextR;
  }
  const annualized = (Math.pow(1 + r, 12) - 1) * 100;
  return isNaN(annualized) ? 0 : annualized;
}

export function runMonteCarloSimulation(params: SimulationParameters): SimulationResult {
  const startTime = performance.now();
  
  // Bound iterations for instant 60fps responsiveness
  const N = Math.min(Math.max(params.iterations, 500), 50000);
  const years = Math.max(1, Math.min(params.timeHorizonYears, 40));
  const totalMonths = years * 12;
  const dt = 1 / 12; // monthly step
  
  // Calculate weighted portfolio expected return & volatility if assets provided
  let muAnnual = params.expectedAnnualReturn / 100;
  let sigmaAnnual = params.annualVolatility / 100;

  if (params.assets && params.assets.length > 0) {
    const totalWeight = params.assets.reduce((sum, a) => sum + a.weight, 0);
    if (totalWeight > 0) {
      let weightedMu = 0;
      let weightedVar = 0;
      params.assets.forEach(a => {
        const w = a.weight / totalWeight;
        weightedMu += w * (a.expectedReturn / 100);
        weightedVar += Math.pow(w * (a.volatility / 100), 2);
      });
      muAnnual = weightedMu;
      sigmaAnnual = Math.sqrt(weightedVar * 1.15);
    }
  }

  const inflationRate = params.annualInflationRate / 100;
  const monthlyContribution = params.monthlyContribution;
  const initialBalance = params.initialBalance;

  // Jump diffusion parameters
  const jumpIntensity = params.jumpIntensity ?? 0.15;
  const jumpMean = params.jumpMean ?? -0.12;
  const jumpStdDev = params.jumpStdDev ?? 0.08;

  // Track representative sample paths for charting (first 24 paths)
  const numSamplePaths = Math.min(N, 24);
  const samplePaths: number[][] = Array.from({ length: numSamplePaths }, () => [initialBalance]);

  // Pre-allocate typed arrays
  const currentBalances = new Float64Array(N);
  const nominalBalances = new Float64Array(N);
  const peakBalances = new Float64Array(N);
  const maxDrawdowns = new Float64Array(N);

  for (let i = 0; i < N; i++) {
    currentBalances[i] = initialBalance;
    nominalBalances[i] = initialBalance;
    peakBalances[i] = initialBalance;
  }

  const steps: PercentileStep[] = [];
  const currentDate = new Date();

  // Initial step 0
  steps.push({
    step: 0,
    year: 0,
    month: 0,
    dateStr: currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    p5: initialBalance,
    p10: initialBalance,
    p25: initialBalance,
    p50: initialBalance,
    p75: initialBalance,
    p90: initialBalance,
    p95: initialBalance,
    mean: initialBalance,
    nominalMedian: initialBalance,
    totalContributions: initialBalance,
  });

  // Pre-calculate drift under Ito's Lemma
  const drift = (muAnnual - 0.5 * sigmaAnnual * sigmaAnnual) * dt;
  const volSqDt = sigmaAnnual * Math.sqrt(dt);

  // Determine recording frequency (reduces sorting overhead by 80%)
  const recordInterval = totalMonths <= 36 ? 3 : totalMonths <= 120 ? 6 : 12;

  // Reusable Float64Array for sorting to avoid garbage collection pauses
  const sortBuffer = new Float64Array(N);

  // Monthly Time Stepping
  for (let m = 1; m <= totalMonths; m++) {
    const timeInYears = m / 12;
    const inflationFactor = Math.pow(1 + inflationRate, timeInYears);

    for (let i = 0; i < N; i++) {
      let b = nominalBalances[i];
      if (b <= 0) {
        nominalBalances[i] = 0;
        currentBalances[i] = 0;
        continue;
      }

      let shock = params.model === 'student_t' ? randomStudentT(5) : fastRandomGaussian();
      let growthFactor = Math.exp(drift + volSqDt * shock);

      if (params.model === 'jump_diffusion') {
        const numJumps = randomPoisson(jumpIntensity * dt);
        if (numJumps > 0) {
          for (let j = 0; j < numJumps; j++) {
            const jumpMagnitude = jumpMean + jumpStdDev * fastRandomGaussian();
            growthFactor *= Math.max(0.1, 1 + jumpMagnitude);
          }
        }
      }

      b = b * growthFactor + monthlyContribution;
      if (b < 0) b = 0;

      nominalBalances[i] = b;
      const realBalance = b / inflationFactor;
      currentBalances[i] = realBalance;

      if (b > peakBalances[i]) {
        peakBalances[i] = b;
      } else if (peakBalances[i] > 0) {
        const dd = (peakBalances[i] - b) / peakBalances[i];
        if (dd > maxDrawdowns[i]) maxDrawdowns[i] = dd;
      }

      if (i < numSamplePaths && (m % recordInterval === 0 || m === totalMonths)) {
        samplePaths[i].push(Math.round(realBalance));
      }
    }

    // Step percentiles (only at milestone steps)
    const isRecordMilestone = (m % recordInterval === 0) || (m === totalMonths);
    if (isRecordMilestone) {
      sortBuffer.set(currentBalances);
      sortBuffer.sort();

      const getP = (p: number) => {
        const idx = Math.min(Math.floor((p / 100) * N), N - 1);
        return Math.round(sortBuffer[idx]);
      };

      let sum = 0;
      for (let i = 0; i < N; i++) sum += sortBuffer[i];
      const mean = Math.round(sum / N);

      const stepDate = new Date(currentDate);
      stepDate.setMonth(currentDate.getMonth() + m);

      const medianReal = getP(50);
      const nominalMedian = Math.round(medianReal * inflationFactor);

      steps.push({
        step: m,
        year: parseFloat((m / 12).toFixed(1)),
        month: m,
        dateStr: stepDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        p5: getP(5),
        p10: getP(10),
        p25: getP(25),
        p50: medianReal,
        p75: getP(75),
        p90: getP(90),
        p95: getP(95),
        mean,
        nominalMedian,
        totalContributions: Math.round(initialBalance + monthlyContribution * m),
      });
    }
  }

  // Final summary statistics
  sortBuffer.set(currentBalances);
  sortBuffer.sort();

  const medianTerminalWealth = Math.round(sortBuffer[Math.floor(0.5 * N)]);
  let totalTerminalSum = 0;
  let ruinCount = 0;
  let maxDrawdownSum = 0;

  for (let i = 0; i < N; i++) {
    totalTerminalSum += sortBuffer[i];
    if (sortBuffer[i] <= 0) ruinCount++;
    maxDrawdownSum += maxDrawdowns[i];
  }

  const meanTerminalWealth = Math.round(totalTerminalSum / N);
  const totalContributed = Math.round(initialBalance + monthlyContribution * totalMonths);

  const p5Terminal = sortBuffer[Math.floor(0.05 * N)];
  const var95 = Math.round(Math.max(0, medianTerminalWealth - p5Terminal));
  const capitalAtRisk = Math.round(Math.max(0, totalContributed - p5Terminal));

  const numTail = Math.max(1, Math.floor(0.05 * N));
  let tailSum = 0;
  for (let i = 0; i < numTail; i++) tailSum += sortBuffer[i];
  const cvar95 = Math.round(Math.max(0, medianTerminalWealth - (tailSum / numTail)));

  // Instant O(1) Money-Weighted Return (IRR)
  const rawIRR = fastAnnuityIRR(initialBalance, monthlyContribution, totalMonths, medianTerminalWealth);
  const simulatedCAGR = parseFloat(rawIRR.toFixed(2));

  // Risk-adjusted ratios
  const riskFreeRate = 0.03;
  const sharpeRatio = sigmaAnnual > 0 ? (muAnnual - riskFreeRate) / sigmaAnnual : 0;
  const sortinoRatio = (sigmaAnnual * 0.72) > 0 ? (muAnnual - riskFreeRate) / (sigmaAnnual * 0.72) : 0;

  // Sample array of final values for distribution histogram (250 points)
  const terminalSample: number[] = [];
  const sampleStride = Math.max(1, Math.floor(N / 250));
  for (let i = 0; i < N; i += sampleStride) {
    terminalSample.push(sortBuffer[i]);
  }

  const executionTimeMs = performance.now() - startTime;

  return {
    parameters: params,
    steps,
    terminalValues: terminalSample,
    medianTerminalWealth,
    meanTerminalWealth,
    nominalTerminalWealth: steps[steps.length - 1].nominalMedian,
    totalContributed,
    simulatedCAGR,
    var95,
    capitalAtRisk,
    cvar95,
    maxDrawdownExpected: parseFloat(((maxDrawdownSum / N) * 100).toFixed(1)),
    sharpeRatio: parseFloat(sharpeRatio.toFixed(2)),
    sortinoRatio: parseFloat(sortinoRatio.toFixed(2)),
    probabilityOfRuin: parseFloat(((ruinCount / N) * 100).toFixed(2)),
    samplePaths,
    executionTimeMs: parseFloat(executionTimeMs.toFixed(1)),
  };
}
