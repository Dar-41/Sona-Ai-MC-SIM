import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import { ParsedDocumentData, SimulationParameters, FinancialGoal } from '../types/simulation';

// Configure pdfjs worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;

export async function parseUploadedFile(file: File): Promise<ParsedDocumentData> {
  const fileName = file.name;
  const ext = fileName.split('.').pop()?.toLowerCase();

  let textContent = '';
  let structuredRows: any[] = [];

  if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    structuredRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    textContent = structuredRows.map(row => Array.isArray(row) ? row.join(' ') : String(row)).join('\n');
    return extractParametersFromTextAndRows(textContent, structuredRows, fileName, ext === 'csv' ? 'csv' : 'xlsx');
  } 
  else if (ext === 'docx') {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    textContent = result.value;
    return extractParametersFromTextAndRows(textContent, [], fileName, 'docx');
  } 
  else if (ext === 'pdf') {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
    const pdfDoc = await loadingTask.promise;
    
    let fullPdfText = '';
    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const textObj = await page.getTextContent();
      const pageText = textObj.items.map((item: any) => item.str).join(' ');
      fullPdfText += `\n--- Page ${pageNum} ---\n` + pageText;
    }
    textContent = fullPdfText;
    return extractParametersFromTextAndRows(textContent, [], fileName, 'pdf');
  } 
  else {
    // Fallback text reader
    textContent = await file.text();
    return extractParametersFromTextAndRows(textContent, [], fileName, 'csv');
  }
}

function extractParametersFromTextAndRows(
  text: string,
  rows: any[],
  fileName: string,
  fileType: 'pdf' | 'docx' | 'xlsx' | 'csv'
): ParsedDocumentData {
  const lowerText = text.toLowerCase();
  const detectedParams: Partial<SimulationParameters> = {};
  const detectedGoals: Partial<FinancialGoal>[] = [];
  const detectedCashFlows: any[] = [];

  // Helper regex patterns
  const matchNumber = (regex: RegExp): number | null => {
    const match = text.match(regex);
    if (match && match[1]) {
      const cleaned = match[1].replace(/,/g, '').trim();
      const num = parseFloat(cleaned);
      return isNaN(num) ? null : num;
    }
    return null;
  };

  // 1. Initial Balance / Portfolio Value / Current Net Worth
  const balance = matchNumber(/(?:initial\s*balance|portfolio\s*value|current\s*balance|net\s*worth|starting\s*capital|total\s*assets)[^\d\n\r$€£]{0,25}[$€£]?\s*([\d,]+(?:\.\d+)?)/i)
    ?? matchNumber(/balance[:\s]+[$€£]?\s*([\d,]+(?:\.\d+)?)/i);
  if (balance !== null && balance > 0) {
    detectedParams.initialBalance = balance;
  }

  // 2. Monthly Contribution / Inflow / Savings
  const contribution = matchNumber(/(?:monthly\s*contribution|monthly\s*savings|monthly\s*deposit|regular\s*investment|recurring\s*inflow)[^\d\n\r$€£]{0,25}[$€£]?\s*([\d,]+(?:\.\d+)?)/i)
    ?? matchNumber(/contribution[:\s]+[$€£]?\s*([\d,]+(?:\.\d+)?)/i);
  if (contribution !== null) {
    detectedParams.monthlyContribution = contribution;
  }

  // 3. Expected Return (CAGR / Growth Rate)
  const expReturn = matchNumber(/(?:expected\s*annual\s*return|cagr|annual\s*growth\s*rate|average\s*return|expected\s*return)[^\d\n\r%]{0,25}([\d]+(?:\.\d+)?)\s*%/i)
    ?? matchNumber(/return[:\s]+([\d]+(?:\.\d+)?)\s*%/i);
  if (expReturn !== null && expReturn > 0 && expReturn < 100) {
    detectedParams.expectedAnnualReturn = expReturn;
  }

  // 4. Volatility / Standard Deviation
  const volatility = matchNumber(/(?:volatility|standard\s*deviation|annual\s*risk|sigma)[^\d\n\r%]{0,25}([\d]+(?:\.\d+)?)\s*%/i)
    ?? matchNumber(/volatility[:\s]+([\d]+(?:\.\d+)?)\s*%/i);
  if (volatility !== null && volatility > 0 && volatility < 100) {
    detectedParams.annualVolatility = volatility;
  }

  // 5. Time Horizon (Years)
  const horizon = matchNumber(/(?:time\s*horizon|duration|investment\s*period|years\s*to\s*retire|simulation\s*years)[^\d\n\r]{0,25}([\d]+(?:\.\d+)?)\s*(?:years|yrs)/i)
    ?? matchNumber(/horizon[:\s]+([\d]+(?:\.\d+)?)/i);
  if (horizon !== null && horizon > 0 && horizon <= 50) {
    detectedParams.timeHorizonYears = Math.round(horizon);
  }

  // 6. Inflation Rate
  const inflation = matchNumber(/(?:inflation\s*rate|annual\s*inflation|cpi\s*assumption)[^\d\n\r%]{0,25}([\d]+(?:\.\d+)?)\s*%/i);
  if (inflation !== null && inflation >= 0 && inflation < 30) {
    detectedParams.annualInflationRate = inflation;
  }

  // 7. Check for structured rows in Excel/CSV
  if (rows.length > 0) {
    rows.forEach((row) => {
      if (!Array.isArray(row)) return;
      const rowStr = row.join(' ').toLowerCase();
      
      // Check for merchant/transactions
      const firstCol = String(row[0] || '');
      const secondCol = String(row[1] || '');
      const thirdCol = String(row[2] || '');
      const numCol = parseFloat(String(row[row.length - 1] || '').replace(/[^0-9.-]/g, ''));

      if (!isNaN(numCol) && Math.abs(numCol) > 5 && firstCol.length > 2 && !rowStr.includes('total')) {
        detectedCashFlows.push({
          merchant: firstCol,
          category: secondCol || 'Financial',
          account: thirdCol || 'Main Account',
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          amount: Math.abs(numCol),
          type: numCol > 0 ? 'income' : 'expense'
        });
      }
    });
  }

  // 8. Financial Goals
  const targetGoal = matchNumber(/(?:goal|target\s*amount|target\s*wealth|retirement\s*goal)[^\d\n\r$€£]{0,25}[$€£]?\s*([\d,]+(?:\.\d+)?)/i);
  if (targetGoal && targetGoal > 0) {
    detectedGoals.push({
      id: 'detected-goal-1',
      title: 'Target Capital Reserve',
      targetAmount: targetGoal,
      currentAmount: detectedParams.initialBalance || 42180,
      targetDate: `~ Dec ${new Date().getFullYear() + (detectedParams.timeHorizonYears || 10)}`,
      targetYear: detectedParams.timeHorizonYears || 10,
      category: 'retirement',
      colorStart: '#FF5722',
      colorEnd: '#7C4DFF',
    });
  }

  // Calculate confidence score based on how many fields were successfully identified
  let score = 0.4;
  if (detectedParams.initialBalance) score += 0.2;
  if (detectedParams.monthlyContribution) score += 0.15;
  if (detectedParams.expectedAnnualReturn) score += 0.15;
  if (detectedParams.timeHorizonYears) score += 0.1;

  return {
    fileName,
    fileType,
    extractedTextPreview: text.slice(0, 800) + (text.length > 800 ? '...' : ''),
    detectedParameters: detectedParams,
    detectedGoals: detectedGoals.length > 0 ? detectedGoals : undefined,
    detectedCashFlows: detectedCashFlows.slice(0, 6),
    confidenceScore: Math.min(1.0, score),
  };
}

// Built-in presets for instant testing
export const SAMPLE_DOCUMENTS = [
  {
    id: 'retirement_plan',
    title: 'Retirement_Portfolio_Analysis_2026.xlsx',
    type: 'xlsx' as const,
    description: 'Executive wealth management sheet with €120,000 initial balance, €1,500/mo contribution, 9.2% expected return, 15.5% volatility, 15-year horizon.',
    params: {
      initialBalance: 120000,
      monthlyContribution: 1500,
      expectedAnnualReturn: 9.2,
      annualVolatility: 15.5,
      timeHorizonYears: 15,
      annualInflationRate: 2.8,
      model: 'gbm' as const,
      iterations: 10000,
    },
    goals: [
      {
        id: 'retire-goal',
        title: 'Retirement Freedom Milestone',
        targetAmount: 850000,
        currentAmount: 120000,
        targetDate: '~ Oct 2041',
        targetYear: 15,
        category: 'retirement' as const,
        colorStart: '#FF5722',
        colorEnd: '#7C4DFF',
      }
    ]
  },
  {
    id: 'startup_treasury',
    title: 'Fintech_Treasury_Stress_Test.pdf',
    type: 'pdf' as const,
    description: 'Corporate balance sheet & runway model with jump-diffusion crash risk, €250,000 capital, €4,000/mo cash-burn, 5-year stress test.',
    params: {
      initialBalance: 250000,
      monthlyContribution: -4000, // cash burn
      expectedAnnualReturn: 6.5,
      annualVolatility: 22.0,
      timeHorizonYears: 5,
      annualInflationRate: 3.1,
      model: 'jump_diffusion' as const,
      iterations: 15000,
    },
    goals: [
      {
        id: 'burn-goal',
        title: 'Runway Breakeven Reserve',
        targetAmount: 400000,
        currentAmount: 250000,
        targetDate: '~ Jun 2031',
        targetYear: 5,
        category: 'emergency' as const,
        colorStart: '#3B82F6',
        colorEnd: '#7C4DFF',
      }
    ]
  },
  {
    id: 'wealth_builder',
    title: 'Sona_Ai_Portfolio_Model.docx',
    type: 'docx' as const,
    description: 'Long-term multigenerational compounding plan for Darsh Sheth with €42,180 starting wealth, €850/mo savings, 8.4% return, 10 years.',
    params: {
      initialBalance: 42180,
      monthlyContribution: 850,
      expectedAnnualReturn: 8.4,
      annualVolatility: 14.8,
      timeHorizonYears: 10,
      annualInflationRate: 2.4,
      model: 'gbm' as const,
      iterations: 10000,
    },
    goals: [
      {
        id: 'vacation-goal',
        title: 'Vacations & World Travel',
        targetAmount: 3000,
        currentAmount: 1200,
        targetDate: '~ Aug 2027',
        targetYear: 1,
        category: 'vacation' as const,
        colorStart: '#FF5722',
        colorEnd: '#7C4DFF',
      },
      {
        id: 'emergency-fund',
        title: 'Emergency Liquid Reserve',
        targetAmount: 10000,
        currentAmount: 7200,
        targetDate: '~ Nov 2026',
        targetYear: 1,
        category: 'emergency' as const,
        colorStart: '#FF5722',
        colorEnd: '#3B82F6',
      }
    ]
  }
];
