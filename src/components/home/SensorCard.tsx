'use client';

import { Volume2, Thermometer } from 'lucide-react';

interface Props {
  title: string;
  value: string;
  description: string;
  type: 'noise' | 'temperature';
}

export default function SensorCard({
  title,
  value,
  description,
  type,
}: Props) {
  const Icon = type === 'noise' ? Volume2 : Thermometer;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      
      <div className="flex justify-between items-center mb-2">
        <Icon className="text-orange-400" />
        <span className="text-xs bg-neutral-100 px-2 py-1 rounded-full">
          LIVE
        </span>
      </div>

      <h4 className="font-semibold">{title}</h4>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-sm text-neutral-500">{description}</p>
    </div>
  );
}