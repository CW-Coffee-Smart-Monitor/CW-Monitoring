'use client';

import { useMemo } from 'react';
import { useTableContext } from '@/context/TableContext';
import { useLanguage } from '@/context/LanguageContext';
import CapacityCard from '@/components/home/CapacityCard';
import RecommendationCard from '@/components/home/RecommendationCard';
import TrafficCard from '@/components/home/TrafficCard';
import SensorCard from '@/components/home/SensorCard';
import VisitHistoryCard from '@/components/home/HistoryCard';
import ActiveBookingBanner from '@/components/home/ActiveBookingBanner';
import { Users, Laptop, Compass } from 'lucide-react';

export default function HomePage() {
  const { tables, summary } = useTableContext();
  const { t } = useLanguage();
  const ind = t.home.indicators;

  // 1. Hitung Sofa Grup (Kapasitas 4P: Blok A, B, C, D)
  const sofaGroupStats = useMemo(() => {
    const groupTables = tables.filter((t) =>
      ['A', 'B', 'C', 'D'].includes(t.name.trim().charAt(0).toUpperCase())
    );
    const total = groupTables.length;
    const avail = groupTables.filter((t) => t.status === 'available').length;
    return { total, avail };
  }, [tables]);

  // 2. Hitung Sofa Fokus/Kerja (Kapasitas 2P: Blok E, F, G, H)
  const sofaFocusStats = useMemo(() => {
    const focusTables = tables.filter((t) =>
      ['E', 'F', 'G', 'H'].includes(t.name.trim().charAt(0).toUpperCase())
    );
    const total = focusTables.length;
    const avail = focusTables.filter((t) => t.status === 'available').length;
    return { total, avail };
  }, [tables]);

  // 3. Cari Blok Terkondusif/Tersepi (Okupansi terendah & punya meja kosong)
  const quietestBlockInfo = useMemo(() => {
    const blocks = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const stats = blocks.map((code) => {
      const blockTables = tables.filter((t) =>
        t.name.trim().toUpperCase().startsWith(code)
      );
      if (blockTables.length === 0) {
        return { code, occupancyRate: 100, emptyCount: 0 };
      }

      const occupiedCount = blockTables.filter(
        (t) => t.status === 'occupied' || t.status === 'warning'
      ).length;
      const occupancyRate = (occupiedCount / blockTables.length) * 100;
      const emptyCount = blockTables.filter((t) => t.status === 'available').length;

      return { code, occupancyRate, emptyCount };
    });

    const availableBlocks = stats.filter((s) => s.emptyCount > 0);
    if (availableBlocks.length === 0) {
      return {
        value: ind.quietestBlock.fullValue,
        description: ind.quietestBlock.fullDescription,
      };
    }

    // Urutkan berdasarkan keterisian terkecil
    availableBlocks.sort((a, b) => a.occupancyRate - b.occupancyRate);
    const best = availableBlocks[0];

    return {
      value: ind.quietestBlock.value.replace('{block}', best.code),
      description: ind.quietestBlock.description
        .replace('{count}', String(best.emptyCount))
        .replace('{rate}', String(Math.round(best.occupancyRate))),
    };
  }, [tables, ind]);

  return (
    <section className="space-y-6 p-4 max-w-2xl mx-auto">
      {/* Active Booking Banner */}
      <ActiveBookingBanner />

      {/* Capacity Card */}
      <CapacityCard
        filled={summary.totalTables - summary.available}
        total={summary.totalTables}
      />

      {/* Recommendation */}
      <RecommendationCard />

      {/* Indikator Real-Time Tipe Meja */}
      <div className="grid grid-cols-2 gap-3">
        <SensorCard
          title={ind.sofaGroup.title}
          value={sofaGroupStats.avail}
          description={ind.sofaGroup.description
            .replace('{avail}', String(sofaGroupStats.avail))
            .replace('{total}', String(sofaGroupStats.total))}
          icon={<Users className="h-5 w-5" />}
        />
        <SensorCard
          title={ind.sofaFocus.title}
          value={sofaFocusStats.avail}
          description={ind.sofaFocus.description
            .replace('{avail}', String(sofaFocusStats.avail))
            .replace('{total}', String(sofaFocusStats.total))}
          icon={<Laptop className="h-5 w-5" />}
        />
      </div>

      {/* Area Tersepi */}
      <SensorCard
        title={ind.quietestBlock.title}
        value={quietestBlockInfo.value}
        description={quietestBlockInfo.description}
        icon={<Compass className="h-5 w-5" />}
        badge="LIVE STATS"
      />

      {/* Traffic Trend */}
      <TrafficCard />

      {/* Visit History */}
      <VisitHistoryCard />
    </section>
  );
}