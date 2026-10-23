import React, { useState } from 'react';
import { AssetAllocation } from '../types/simulation';
import { ArrowUpRight } from 'lucide-react';

interface CategoryDonutProps {
  assets: AssetAllocation[];
  totalValue: number;
}

export const CategoryDonut: React.FC<CategoryDonutProps> = ({ assets, totalValue }) => {
  const [hoveredAssetId, setHoveredAssetId] = useState<string | null>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // SVG Donut calculation
  const size = 140;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const totalWeight = assets.reduce((acc, a) => acc + a.weight, 0) || 100;
  let accumulatedPercent = 0;

  const activeAsset = assets.find(a => a.id === hoveredAssetId);

  return (
    <div className="flux-card p-5 flex flex-col justify-between h-[380px] overflow-hidden">
      {/* Title */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-bold text-white tracking-tight">
          Portfolio Allocation
        </h3>
        <button className="text-[#8E95A8] hover:text-white transition-colors">
          <ArrowUpRight size={18} />
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 my-auto min-w-0">
        {/* Donut Chart SVG with Glowing Rings */}
        <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
            {assets.map((asset) => {
              const fraction = asset.weight / totalWeight;
              const strokeDasharray = `${fraction * circumference * 0.94} ${circumference}`;
              const strokeDashoffset = -(accumulatedPercent * circumference);
              accumulatedPercent += fraction;

              const isHovered = hoveredAssetId === asset.id;

              return (
                <circle
                  key={asset.id}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={asset.color}
                  strokeWidth={isHovered ? strokeWidth + 3 : strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredAssetId(asset.id)}
                  onMouseLeave={() => setHoveredAssetId(null)}
                  style={{
                    filter: isHovered ? `drop-shadow(0 0 10px ${asset.color})` : 'none',
                  }}
                />
              );
            })}
          </svg>

          {/* Center Text inside Donut matching Behance */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-1">
            <span className="text-lg font-bold tracking-tight text-white font-sans leading-tight">
              {activeAsset 
                ? `${activeAsset.weight}%` 
                : formatCurrency(totalValue)
              }
            </span>
            <span className="text-[10px] text-[#787F92] mt-0.5 truncate max-w-[85px]">
              {activeAsset ? activeAsset.name : 'Total Capital'}
            </span>
          </div>
        </div>

        {/* Legend List on Right matching Behance */}
        <div className="w-full flex-1 space-y-1.5 min-w-0">
          {assets.map((asset) => {
            const assetVal = Math.round(totalValue * (asset.weight / totalWeight));
            const isHovered = hoveredAssetId === asset.id;

            return (
              <div
                key={asset.id}
                onMouseEnter={() => setHoveredAssetId(asset.id)}
                onMouseLeave={() => setHoveredAssetId(null)}
                className={`flex items-center justify-between text-xs py-1 px-2 rounded-lg cursor-pointer transition-colors gap-2 min-w-0 ${
                  isHovered ? 'bg-[#1D202D]' : 'hover:bg-[#181A25]'
                }`}
              >
                {/* Dot & Asset Name */}
                <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{
                      backgroundColor: asset.color,
                      boxShadow: isHovered ? `0 0 8px ${asset.color}` : 'none'
                    }}
                  />
                  <span className={`text-[11px] truncate ${isHovered ? 'text-white font-medium' : 'text-[#A0A6B8]'}`}>
                    {asset.name}
                  </span>
                </div>

                {/* Amount & Percentage */}
                <div className="flex items-center gap-2 shrink-0 font-mono text-right text-[11px]">
                  <span className="text-white font-medium whitespace-nowrap">
                    {formatCurrency(assetVal)}
                  </span>
                  <span className="text-[#6C7284] w-7 text-right whitespace-nowrap">
                    {asset.weight}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-2 text-[11px] text-[#61687B] border-t border-[#1F222E]/80 flex justify-between">
        <span>Asset Diversification</span>
        <span className="text-[#A0A6B8]">{assets.length} active classes</span>
      </div>
    </div>
  );
};
