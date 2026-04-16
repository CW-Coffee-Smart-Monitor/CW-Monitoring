'use client';

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

      {/* Capacity Card */}
      <CapacityCard
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