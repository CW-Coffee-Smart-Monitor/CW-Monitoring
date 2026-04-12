'use client';

/**
 * TableCard — Compact card showing a single table's live status.
 * Used in the table grid on the Home dashboard.
 */

import { motion } from 'framer-motion';
import { Clock, MapPin, Wifi, WifiOff } from 'lucide-react';
import { TableState } from '@/types';
import { useTableStatus } from '@/hooks/useTableStatus';
import StatusBadge from './StatusBadge';

interface TableCardProps {
  table: TableState;
  onClick?: () => void;
}

export default function TableCard({ table, onClick }: TableCardProps) {
  const { statusLabel, statusColor, bgColor, borderColor, elapsedFormatted } =
    useTableStatus(table);

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className={`w-full rounded-2xl border ${borderColor} ${bgColor} p-4 text-left backdrop-blur-sm transition-colors`}
    >
      {/* Header */}
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-100">{table.name}</h3>
        <StatusBadge
          label={statusLabel}
          variant={table.status === 'occupied' ? 'occupied' : table.status}
          pulse={table.status === 'warning'}
        />
      </div>

      {/* Zone */}
      <div className="mb-2 flex items-center gap-1 text-xs text-neutral-500">
        <MapPin className="h-3 w-3" />
        {table.zone} · {table.seatType}
      </div>

      {/* Timer / Distance */}
      <div className="flex items-center justify-between text-xs">
        <span className={`flex items-center gap-1 font-mono ${statusColor}`}>
          <Clock className="h-3 w-3" />
          {elapsedFormatted}
        </span>
        <span className="flex items-center gap-1 text-neutral-500">
          {table.status === 'offline' ? (
            <WifiOff className="h-3 w-3" />
          ) : (
            <Wifi className="h-3 w-3" />
          )}
          {table.distance}cm
        </span>
      </div>
    </motion.button>
  );
}
