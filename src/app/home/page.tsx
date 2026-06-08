'use client';

import { useTableContext } from '@/context/TableContext';
import { useLanguage } from '@/context/LanguageContext';
import CapacityCard from '@/components/home/CapacityCard';
import RecommendationCard from '@/components/home/RecommendationCard';
import TrafficCard from '@/components/home/TrafficCard';
import SensorCard from '@/components/home/SensorCard';
import VisitHistoryCard from '@/components/home/HistoryCard';

export default function HomePage() {
  const { summary } = useTableContext();
  const { t } = useLanguage();
  const s = t.home.sensors;

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
          title={s.noise.title}
          value={s.noise.value}
          description={s.noise.description}
          type="noise"
        />
        <SensorCard
          title={s.temperature.title}
          value={s.temperature.value}
          description={s.temperature.description}
          type="temperature"
        />
      </div>

    </section>
  );
}