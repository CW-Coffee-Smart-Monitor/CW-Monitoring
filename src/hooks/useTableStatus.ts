'use client';

/**
 * useTableStatus — Derives display-friendly information for a single table.
 *
 * Returns formatted elapsed time, status label & color, and overstay flag.
 */

import { useMemo } from 'react';
import { TableState } from '@/types';
import { CONFIG } from '@/lib/config';

interface TableStatusInfo {
  statusLabel: string;
  statusColor: string;   // Tailwind text color class
  bgColor: string;       // Tailwind background color class
  borderColor: string;
  elapsedFormatted: string;
  isOverstay: boolean;
}

export function useTableStatus(table: TableState): TableStatusInfo {
  return useMemo(() => {
    const hrs = Math.floor(table.elapsedSeconds / 3600);
    const mins = Math.floor((table.elapsedSeconds % 3600) / 60);
    const secs = table.elapsedSeconds % 60;
    const elapsedFormatted = table.isOccupied
      ? `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
      : '--:--:--';

    const isOverstay = table.elapsedSeconds >= CONFIG.overstayHours * 3600;

    switch (table.status) {
      case 'available':
        return {
          statusLabel: 'Tersedia',
          statusColor: 'text-emerald-400',
          bgColor: 'bg-emerald-500/10',
          borderColor: 'border-emerald-500/30',
          elapsedFormatted,
          isOverstay: false,
        };
      case 'occupied':
        return {
          statusLabel: isOverstay ? 'Overstay' : 'Terisi',
          statusColor: isOverstay ? 'text-orange-400' : 'text-sky-400',
          bgColor: isOverstay ? 'bg-orange-500/10' : 'bg-sky-500/10',
          borderColor: isOverstay ? 'border-orange-500/30' : 'border-sky-500/30',
          elapsedFormatted,
          isOverstay,
        };
      case 'warning':
        return {
          statusLabel: 'Ghost Booking',
          statusColor: 'text-red-400',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/30',
          elapsedFormatted,
          isOverstay,
        };
      case 'offline':
      default:
        return {
          statusLabel: 'Offline',
          statusColor: 'text-neutral-500',
          bgColor: 'bg-neutral-500/10',
          borderColor: 'border-neutral-500/30',
          elapsedFormatted: '--:--:--',
          isOverstay: false,
        };
    }
  }, [table.status, table.elapsedSeconds, table.isOccupied]);
}
