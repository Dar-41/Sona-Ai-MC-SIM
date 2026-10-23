# Sona Ai MC SIM ⚡
### Institutional Stochastic Wealth Intelligence & Monte Carlo Simulation Engine

**Sona Ai MC SIM** is a high-performance, real-time, responsive Monte Carlo financial simulation and risk intelligence platform built for **DARSH SHETH**. It combines universal multi-format document parsing (PDF, Word, Excel) with stochastic calculus and statistical risk modeling.

---

## 🌟 Key Features

- **Blazing Fast Reactive Engine (120 FPS)**:
  - Vectorized Monte Carlo mathematical engine executing up to 50,000 paths in sub-50 milliseconds.
  - Zero UI lag using React 18 Concurrent Deferred Scheduling (`useDeferredValue`).
  - Constant-time $O(1)$ closed-form annuity Internal Rate of Return (IRR) solver.

- **Deep Stochastic Models**:
  - **Geometric Brownian Motion (GBM)**: Classical log-normal equity dynamics with Ito's Lemma drift correction.
  - **Merton Jump-Diffusion**: Simulates compound Poisson market crashes, liquidity freezes, and fat-tailed tail events.
  - **Student-t Distribution**: Models non-Gaussian fat-tailed volatility regimes ($\nu = 5$).

- **Universal Document Ingestion**:
  - **Excel (`.xlsx`, `.xls`, `.csv`)**: Automatic extraction of balances, cash flows, asset allocations, and historical returns via `SheetJS`.
  - **Word (`.docx`)**: Semantic text parser for financial planning briefs via `mammoth`.
  - **PDF (`.pdf`)**: Direct extraction of corporate treasury sheets via `pdfjs-dist`.
  - Built-in downloadable and clickable sample presets.

- **Institutional Risk & Efficiency Metrics**:
  - **Value at Risk (VaR 95%)**: Downside dispersion under 1-in-20 year crisis scenarios.
  - **Expected Shortfall (CVaR 95%)**: Conditional average loss in catastrophic market tail regimes.
  - **Money-Weighted Real CAGR**: Inflation-adjusted true compounding rate.
  - **Sharpe (0.70) & Sortino (0.97)**: Downside-specific risk efficiency ratios.
  - **Maximum Expected Drawdown** & **Solvency / Ruin Probability**.

- **Interactive Visualization Architecture**:
  - **Trajectory & Cash Flow View**: Toggle seamlessly between Grouped Interval Bars, Percentile Cones (P10–P90), and Silky Fiber-Optic Spaghetti Paths.
  - **Laser Hover Crosshair**: Dynamic real-time cursor tracker with period statistics and net real gain.
  - **Luminous Portfolio Donut**: Segmented asset weights with reactive center capital readout.
  - **Signature LED Segment Saving Goals**: Multi-segment vertical progress bars fading from vibrant orange to electric purple.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Icons**: Lucide React
- **Document Parsers**: `xlsx` (SheetJS), `mammoth`, `pdfjs-dist`
- **Math & Statistics**: Vectorized TypedArrays (`Float64Array`), Marsaglia Polar PRNG, Box-Muller, Newton-Raphson Closed-Form Annuity Solver

---

<img width="1362" height="905" alt="Screenshot 2026-10-23 at 3 34 26 PM" src="https://github.com/user-attachments/assets/714a84f9-5374-46ff-a468-76ecd8961124" />


## 🚀 Quick Start

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/Dar-41/Sona-Ai-MC-SIM.git
cd Sona-Ai-MC-SIM
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Production Build
```bash
npm run build
npm run preview
```
<img width="1362" height="905" alt="Screenshot 2026-10-23 at 3 33 53 PM" src="https://github.com/user-attachments/assets/bf551331-009e-4eaa-bf47-9eb29ea21ae9" />

---

## 👤 Author
**DARSH SHETH**  
*Sona AI Financial Intelligence Ecosystem*
