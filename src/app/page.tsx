'use client';

/**
 * Home Page (The Pulse) — Dashboard overview with summary cards,
 * active booking banner, recommendation, and full table grid.
 */

import { LayoutGrid, CheckCircle, AlertTriangle, WifiOff } from 'lucide-react';
import { useTableContext } from '@/context/TableContext';
import SummaryCard from '@/components/ui/SummaryCard';
import ActiveBookingBanner from '@/components/home/ActiveBookingBanner';
import RecommendationCard from '@/components/home/RecommendationCard';
import TableGrid from '@/components/home/TableGrid';

export default function HomePage() {
  const { summary } = useTableContext();

  return (
    <section className="space-y-5">
      {/* Active Booking Banner */}
      <ActiveBookingBanner />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <SummaryCard
          icon={LayoutGrid}
          value={summary.totalTables}
          label="Total Meja"
          color="text-neutral-300"
          bgColor="bg-neutral-500/10"
          borderColor="border-neutral-700"
        />
        <SummaryCard
          icon={CheckCircle}
          value={summary.available}
          label="Tersedia"
          color="text-emerald-400"
          bgColor="bg-emerald-500/10"
          borderColor="border-emerald-500/30"
        />
        <SummaryCard
          icon={AlertTriangle}
          value={summary.warnings}
          label="Ghost Booking"
          color="text-red-400"
          bgColor="bg-red-500/10"
          borderColor="border-red-500/30"
        />
        <SummaryCard
          icon={WifiOff}
          value={summary.offline}
          label="Offline"
          color="text-neutral-500"
          bgColor="bg-neutral-500/10"
          borderColor="border-neutral-600/30"
        />
      </div>

      {/* Smart Recommendation */}
      <RecommendationCard />

      {/* Table Grid */}
      <TableGrid />
    </section>
  );
}
