'use client';

import { useLanguage } from '@/context/LanguageContext';

export default function TrafficCard() {
  const { t } = useLanguage();
  const tc = t.trafficCard;

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm">

      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold">{tc.title}</h3>
        <span className="text-xs text-neutral-400">{tc.today}</span>
      </div>

      <p className="text-sm text-neutral-500 mb-4">{tc.peakAt}</p>

      {/* Fake Chart */}
      <div className="h-24 bg-gradient-to-t from-orange-200 to-transparent rounded-xl" />

      <div className="mt-4 text-xs text-neutral-500 bg-neutral-100 p-3 rounded-xl">
        {tc.avoidHours}
      </div>
    </div>
  );
}