'use client';

import { Users } from 'lucide-react';

interface Props {
  percentage: number;
  filled: number;
  total: number;
}

export default function CapacityCard({ percentage, filled, total }: Props) {
  const available = total - filled;
  const label = percentage >= 80 ? 'RAMAI' : percentage >= 50 ? 'SEDANG' : 'SEPI';

  return (
    <div className="rounded-3xl p-5 bg-[#3b0f52] relative overflow-hidden shadow-lg">

      {/* Top row */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Kapasitas CW Coffee</h2>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#aa5e00] animate-pulse" />
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#aa5e00]">Real-Time Sync</p>
          </div>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
          <Users className="h-4 w-4 text-white/70" />
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">

        {/* Circle */}
        <div className="relative w-32 h-32 shrink-0 flex flex-col items-center justify-center">
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="7" />
            <circle
              cx="50" cy="50" r="38" fill="none"
              stroke="#D7851F" strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 38}`}
              strokeDashoffset={`${2 * Math.PI * 38 * (1 - percentage / 100)}`}
              className="transition-all duration-700"
            />
          </svg>
          <span className="text-2xl font-bold text-white">{percentage}%</span>
          <span className="text-[10px] font-bold tracking-widest text-[#aa5e00] mt-0.5">{label}</span>
        </div>

        {/* Info */}
        <div className="flex-1 rounded-2xl bg-white/10 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/50">Meja Terisi</p>
          <p className="text-2xl font-bold text-white mt-0.5">
            {filled} <span className="text-sm font-normal text-white/50">/ {total}</span>
          </p>
          <p className="text-xs text-white/60 mt-2">Masih ada tempat duduk yang tersedia!</p>
          <div className="mt-2 flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-green-400" />
            <p className="text-xs text-green-400 font-medium">{available} tersedia</p>
          </div>
        </div>
      </div>
    </div>
  );
}