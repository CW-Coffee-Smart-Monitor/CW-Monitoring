'use client';

/**
 * MapLegend — Bottom legend + "Kamu berada di sini" indicator.
 */

import { MapPin } from 'lucide-react';

export default function MapLegend() {
  return (
    <div className="flex items-center justify-between px-1 pt-3">
      {/* User location indicator */}
      <div className="flex items-center gap-1.5 rounded-full bg-neutral-900 px-3 py-1.5 text-[10px] font-medium text-white shadow-sm">
        <MapPin className="h-3.5 w-3.5 text-white" />
        Kamu berada di sini
      </div>

      {/* Status legend */}
      <div className="flex items-center gap-3 text-[10px] text-neutral-500">
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          Tersedia
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
          Penuh
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          Hold / Dibersihkan
        </span>
      </div>
    </div>
  );
}
