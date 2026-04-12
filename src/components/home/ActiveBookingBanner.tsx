'use client';

/**
 * ActiveBookingBanner — Floating banner showing user's active booking.
 * Only visible if at least one table has uid matching a demo/sim user.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Timer, X } from 'lucide-react';
import { useTableContext } from '@/context/TableContext';
import { useTableStatus } from '@/hooks/useTableStatus';

export default function ActiveBookingBanner() {
  const { tables } = useTableContext();

  // Find the first table occupied by the current "user" (for demo, any occupied)
  const activeTable = tables.find((t) => t.isOccupied && t.uid);

  return (
    <AnimatePresence>
      {activeTable && (
        <ActiveBannerInner key={activeTable.id} tableId={activeTable.id} />
      )}
    </AnimatePresence>
  );
}

function ActiveBannerInner({ tableId }: { tableId: number }) {
  const { tables } = useTableContext();
  const table = tables.find((t) => t.id === tableId)!;
  const { elapsedFormatted, statusColor } = useTableStatus(table);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Timer className="h-4 w-4 text-amber-400" />
          <div>
            <p className="text-xs font-semibold text-amber-300">
              Booking Aktif — {table.name}
            </p>
            <p className={`font-mono text-lg font-bold ${statusColor}`}>
              {elapsedFormatted}
            </p>
          </div>
        </div>
        <X className="h-4 w-4 text-neutral-500" />
      </div>
    </motion.div>
  );
}
