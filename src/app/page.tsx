'use client';

import { Bell } from 'lucide-react';
import { useTableContext } from '@/context/TableContext';
import CapacityCard from '@/components/home/CapacityCard';
import RecommendationCard from '@/components/home/RecommendationCard';
import TrafficCard from '@/components/home/TrafficCard';
import SensorCard from '@/components/home/SensorCard';
import VisitHistoryCard from '@/components/home/HistoryCard';

export default function HomePage() {
  const { summary } = useTableContext();

  return (
    <section className="space-y-6 p-4">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/favicon.ico"
            alt="avatar"
            className="w-10 h-10 rounded-full"
          />
          <div>
            <p className="text-xs text-neutral-400">SELAMAT PAGI</p>
            <h1 className="text-lg font-semibold">Aditya</h1>
          </div>
        </div>

        <div className="relative">
          <Bell className="w-5 h-5 text-neutral-500" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
        </div>
      </div>

      {/* Capacity Card */}
      <CapacityCard
        percentage={72}
        filled={summary.totalTables - summary.available}
        total={summary.totalTables}
      />

      {/* Recommendation */}
      <RecommendationCard />

      {/* Traffic Trend */}
      <TrafficCard />

      {/* Visit History */}
      <VisitHistoryCard />

      {/* IoT Sensors */}
      <div className="grid grid-cols-2 gap-3">
        <SensorCard
          title="Quiet Vibe"
          value="55 dB"
          description="Cocok buat fokus"
          type="noise"
        />
        <SensorCard
          title="Suhu"
          value="22°C"
          description="AC nyaman & stabil"
          type="temperature"
        />
      </div>

    </section>
  );
}