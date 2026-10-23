import React, { useState } from 'react';
import { 
  FileUp, 
  X, 
  FileSpreadsheet, 
  FileType, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Download,
  Sparkles,
  FileText
} from 'lucide-react';
import { parseUploadedFile, SAMPLE_DOCUMENTS } from '../engine/documentParser';
import { ParsedDocumentData, SimulationParameters, FinancialGoal } from '../types/simulation';

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyExtracted: (params: Partial<SimulationParameters>, goals?: Partial<FinancialGoal>[], transactions?: any[]) => void;
}

export const DocumentModal: React.FC<DocumentModalProps> = ({
  isOpen,
  onClose,
  onApplyExtracted,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedDocumentData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFile = async (file: File) => {
    setIsParsing(true);
    setErrorMessage(null);
    try {
      const data = await parseUploadedFile(file);
      setParsedData(data);
    } catch (err: any) {
      console.error('File parsing error:', err);
      setErrorMessage(err.message || 'Failed to read file. Please ensure it is a valid PDF, Word, or Excel document.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSampleSelect = (sample: typeof SAMPLE_DOCUMENTS[0]) => {
    setParsedData({
      fileName: sample.title,
      fileType: sample.type,
      extractedTextPreview: sample.description,
      detectedParameters: sample.params,
      detectedGoals: sample.goals,
      confidenceScore: 0.98,
    });
  };

  const handleApply = () => {
    if (parsedData) {
      onApplyExtracted(
        parsedData.detectedParameters,
        parsedData.detectedGoals,
        parsedData.detectedCashFlows
      );
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-[#11131C] border border-[#23273A] rounded-2xl shadow-2xl p-6 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1F222E]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF5722] to-[#FF7043] flex items-center justify-center text-white shadow-glow-orange">
              <FileUp size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Universal Financial Document Reader
              </h3>
              <p className="text-xs text-[#7B8296]">
                Extract simulation parameters directly from PDF, Word (.docx) or Excel (.xlsx/.csv)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#7B8296] hover:text-white hover:bg-[#1E212E] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="py-5 space-y-5">
          {/* Dropzone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`
              relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer
              ${isDragging 
                ? 'border-[#FF5722] bg-[#FF5722]/10 scale-[1.01]' 
                : 'border-[#262B3D] hover:border-[#383E56] bg-[#141622]/60'
              }
            `}
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.pdf,.docx,.doc,.xlsx,.xls,.csv';
              input.onchange = (e: any) => {
                if (e.target.files && e.target.files[0]) {
                  handleFile(e.target.files[0]);
                }
              };
              input.click();
            }}
          >
            <div className="w-12 h-12 rounded-full bg-[#1C1F2E] flex items-center justify-center text-[#FF5722] mb-3">
              <FileSpreadsheet size={24} />
            </div>
            <p className="text-sm font-semibold text-white mb-1">
              Drag & Drop your financial document here
            </p>
            <p className="text-xs text-[#787F94] mb-3">
              Supports <span className="text-[#FF5722] font-medium">PDF reports</span>, <span className="text-[#3B82F6] font-medium">Excel sheets</span>, and <span className="text-[#7C4DFF] font-medium">Word summaries</span>
            </p>
            <span className="px-3 py-1.5 rounded-lg bg-[#222536] text-xs font-medium text-white hover:bg-[#2B3045] transition-colors">
              Browse Files from Computer
            </span>
          </div>

          {/* Quick Sample Presets */}
          <div>
            <p className="text-xs font-semibold text-[#8E95A8] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Sparkles size={13} className="text-[#FF5722]" />
              Or Test Instant Real Document Presets:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {SAMPLE_DOCUMENTS.map((sample) => {
                const sampleDownloadMap: Record<string, string> = {
                  retirement_plan: '/samples/sample_portfolio.xlsx',
                  startup_treasury: '/samples/sample_treasury.pdf',
                  wealth_builder: '/samples/sample_wealth_plan.docx',
                };
                const downloadUrl = sampleDownloadMap[sample.id];

                return (
                  <div
                    key={sample.id}
                    className="p-3 rounded-xl bg-[#151724] border border-[#212538] hover:border-[#FF5722]/50 text-left transition-all hover:bg-[#1A1D2D] group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#202438] text-[#A0A6B8] group-hover:text-[#FF5722]">
                          {sample.type}
                        </span>
                        {downloadUrl && (
                          <a
                            href={downloadUrl}
                            download
                            onClick={(e) => e.stopPropagation()}
                            className="text-[10px] text-[#A0A6B8] hover:text-[#FF5722] flex items-center gap-1 font-mono hover:underline"
                            title="Download sample file"
                          >
                            <Download size={11} />
                            <span>Download</span>
                          </a>
                        )}
                      </div>
                      <p className="text-xs font-bold text-white truncate">{sample.title}</p>
                      <p className="text-[10px] text-[#6E758A] mt-1 line-clamp-2 leading-tight">
                        {sample.description}
                      </p>
                    </div>

                    <button
                      onClick={() => handleSampleSelect(sample)}
                      className="mt-3 w-full py-1.5 rounded-lg bg-[#202438] hover:bg-[#FF5722] text-white text-[11px] font-semibold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Load Data</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Parsing State */}
          {isParsing && (
            <div className="p-4 rounded-xl bg-[#161826] border border-[#23273D] flex items-center justify-center gap-3 text-xs text-white">
              <div className="w-4 h-4 border-2 border-[#FF5722] border-t-transparent rounded-full animate-spin" />
              <span>Analyzing document layout and parsing financial figures...</span>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/30 text-xs text-[#EF4444] flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Parsed Results Preview */}
          {parsedData && (
            <div className="p-4 rounded-xl bg-[#161928] border border-[#2C314A] space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#10B981]" />
                  <span className="text-xs font-bold text-white">
                    Parsed: {parsedData.fileName}
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                  {Math.round(parsedData.confidenceScore * 100)}% Confidence
                </span>
              </div>

              {/* Detected Parameters Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {parsedData.detectedParameters.initialBalance !== undefined && (
                  <div className="bg-[#11131E] p-2 rounded-lg border border-[#222538]">
                    <span className="text-[10px] text-[#717789] block">Initial Balance</span>
                    <span className="font-mono font-bold text-white">
                      €{parsedData.detectedParameters.initialBalance.toLocaleString()}
                    </span>
                  </div>
                )}
                {parsedData.detectedParameters.monthlyContribution !== undefined && (
                  <div className="bg-[#11131E] p-2 rounded-lg border border-[#222538]">
                    <span className="text-[10px] text-[#717789] block">Monthly Inflow</span>
                    <span className="font-mono font-bold text-white">
                      €{parsedData.detectedParameters.monthlyContribution.toLocaleString()}
                    </span>
                  </div>
                )}
                {parsedData.detectedParameters.expectedAnnualReturn !== undefined && (
                  <div className="bg-[#11131E] p-2 rounded-lg border border-[#222538]">
                    <span className="text-[10px] text-[#717789] block">Expected CAGR</span>
                    <span className="font-mono font-bold text-[#FF5722]">
                      {parsedData.detectedParameters.expectedAnnualReturn}%
                    </span>
                  </div>
                )}
                {parsedData.detectedParameters.timeHorizonYears !== undefined && (
                  <div className="bg-[#11131E] p-2 rounded-lg border border-[#222538]">
                    <span className="text-[10px] text-[#717789] block">Horizon</span>
                    <span className="font-mono font-bold text-white">
                      {parsedData.detectedParameters.timeHorizonYears} Yrs
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[#1F222E] flex items-center justify-between">
          <span className="text-[11px] text-[#6E7487]">
            Universal OCR & Structured Regex Engine
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-[#8E95A8] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={!parsedData}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#FF5722] to-[#FF7043] text-white text-xs font-bold shadow-glow-orange hover:opacity-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <span>Apply to Monte Carlo</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
