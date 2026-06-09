'use client';

import React from 'react';

interface Props {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  badge?: string;
}

export default function SensorCard({
  title,
  value,
  description,
  icon,
  badge = 'LIVE',
}: Props) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-100 flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-center mb-2">
          <div className="text-amber-500 bg-amber-500/10 p-1.5 rounded-lg">
            {icon}
          </div>
          <span className="text-[10px] font-bold tracking-widest bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full animate-pulse">
            {badge}
          </span>
        </div>

        <h4 className="text-sm font-bold text-neutral-800 mt-2">{title}</h4>
        <p className="text-xl font-black text-neutral-900 mt-1">{value}</p>
      </div>
      <p className="text-xs text-neutral-400 mt-2 line-clamp-2">{description}</p>
    </div>
  );
}