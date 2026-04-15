'use client';

import { Users, Laptop, Coffee } from 'lucide-react';

type ModeType = 'Meeting' | 'Focus' | 'Chill';

type ModeCardProps = {
  mode: ModeType;
  description: string;
};

const MODE_CONFIG = {
  Meeting: {
    icon: <Users className="h-6 w-6" strokeWidth={2.5} />,
    gradient: 'from-indigo-900 to-indigo-700',
  },
  Focus: {
    icon: <Laptop className="h-6 w-6" strokeWidth={2.5} />,
    gradient: 'from-emerald-900 to-emerald-700',
  },
  Chill: {
    icon: <Coffee className="h-6 w-6" strokeWidth={2.5} />,
    gradient: 'from-amber-900 to-amber-700',
  },
};

export default function ModeCard({ mode, description }: ModeCardProps) {
  const config = MODE_CONFIG[mode];

  return (
    <div
      className={`rounded-2xl bg-gradient-to-r ${config.gradient} p-5 text-white shadow-lg`}
    >
      <p className="text-xs uppercase text-white/70">Mode</p>

      <div className="mt-1 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{mode}</h2>
          <p className="mt-1 text-sm text-white/80">{description}</p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
          {config.icon}
        </div>
      </div>
    </div>
  );
}