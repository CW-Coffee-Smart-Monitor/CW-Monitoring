'use client';

import { Users } from 'lucide-react';

interface Props {
  percentage: number;
  filled: number;
  total: number;
}

export default function CapacityCard({ percentage, filled, total }: Props) {
  return (
    <div className="rounded-3xl p-5 text-white bg-gradient-to-br from-neutral-900 to-emerald-900 shadow-xl relative overflow-hidden">
      
      {/* Title */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Kapasitas CW Coffee</h2>
        <p className="text-xs text-neutral-400">REAL-TIME SYNC</p>
      </div>

      <div className="flex items-center justify-between">
        
        {/* Circle */}
        <div className="relative w-28 h-28 flex items-center justify-center">
          <div className="text-2xl font-bold">{percentage}%</div>

          <div className="absolute inset-0 rounded-full border-[6px] border-yellow-400 opacity-30" />
        </div>

        {/* Info */}
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl">
          <p className="text-xs text-neutral-300">MEJA TERISI</p>
          <p className="text-xl font-bold">
            {filled} <span className="text-sm text-neutral-400">/ {total}</span>
          </p>

          <p className="text-xs text-neutral-400 mt-2">
            Masih ada tempat duduk
          </p>
        </div>
      </div>
    </div>
  );
}