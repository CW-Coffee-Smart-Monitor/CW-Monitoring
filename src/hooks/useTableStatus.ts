'use client';

import { useMemo } from 'react';
import { TableState } from '@/types';

interface TableStatusInfo {
  statusLabel: string;
  statusColor: string;
  bgColor: string;
  borderColor: string;
  elapsedFormatted: string;
}

export function useTableStatus(table: TableState): TableStatusInfo {
  return useMemo(() => {
    const hrs = Math.floor(table.elapsedSeconds / 3600);
    const mins = Math.floor((table.elapsedSeconds % 3600) / 60);
    const secs = table.elapsedSeconds % 60;
    const elapsedFormatted = table.isOccupied
      ? `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
      : '--:--:--';

    switch (table.status) {
      case 'available':
        return {
          statusLabel: 'Tersedia',
          statusColor: 'text-emerald-400',
          bgColor: 'bg-emerald-500/10',
          borderColor: 'border-emerald-500/30',
          elapsedFormatted,
        };
      case 'occupied':
        return {
          statusLabel: 'Terisi',
          statusColor: 'text-sky-400',
          bgColor: 'bg-sky-500/10',
          borderColor: 'border-sky-500/30',
          elapsedFormatted,
        };
      case 'warning':
        return {
          statusLabel: 'Ghost Booking',
          statusColor: 'text-red-400',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/30',
          elapsedFormatted,
        };
      case 'offline':
      default:
        return {
          statusLabel: 'Offline',
          statusColor: 'text-neutral-500',
          bgColor: 'bg-neutral-500/10',
          borderColor: 'border-neutral-500/30',
          elapsedFormatted: '--:--:--',
        };
    }
  }, [table.status, table.elapsedSeconds, table.isOccupied]);
}
