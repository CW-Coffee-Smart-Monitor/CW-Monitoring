'use client';

/**
 * Map Page — Interactive Floor Plan of CW Coffee.
 * Shows real-time table status on an SVG café layout.
 */

import { useState, useEffect } from 'react';
import FloorPlan from '@/components/map/FloorPlan';
import FilterChips from '@/components/map/FilterChips';
import MapLegend from '@/components/map/MapLegend';

export default function MapPage() {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('Baru saja');

  /* Timestamp update every 30s */
  useEffect(() => {
    const start = Date.now();
    const timer = setInterval(() => {
      const diff = Math.floor((Date.now() - start) / 60_000);
      setLastUpdate(diff < 1 ? 'Baru saja' : `${diff} menit lalu`);
    }, 30_000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-neutral-900">Live Map</h1>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-500">
            Terakhir diperbarui: {lastUpdate}
          </span>
        </div>
      </div>

      {/* Filter chips */}
      <FilterChips activeFilter={activeFilter} onFilterChange={setActiveFilter} />

      {/* Floor plan */}
      <FloorPlan highlightFilter={activeFilter} />

      {/* Legend */}
      <MapLegend />
    </section>
  );
}
