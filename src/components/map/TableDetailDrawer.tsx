'use client';

/**
 * TableDetailDrawer — Slide-up bottom sheet showing table info when tapped.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { X, Plug, Wifi, Sun, Coffee, Volume1, Trees, Users, Sofa, MapPin, Timer } from 'lucide-react';
import { TableState } from '@/types';
import { useTableStatus } from '@/hooks/useTableStatus';
import StatusBadge from '@/components/ui/StatusBadge';
import { LucideIcon } from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  Plug, Wifi, Sun, Coffee, Volume1, Trees, Users, Sofa,
};

interface TableDetailDrawerProps {
  table: TableState | null;
  onClose: () => void;
}

export default function TableDetailDrawer({ table, onClose }: TableDetailDrawerProps) {
  return (
    <AnimatePresence>
      {table && <DrawerContent table={table} onClose={onClose} />}
    </AnimatePresence>
  );
}

function DrawerContent({ table, onClose }: { table: TableState; onClose: () => void }) {
  const { statusLabel, statusColor, elapsedFormatted, isOverstay } = useTableStatus(table);

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/50"
      />

      {/* Drawer */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-md rounded-t-3xl border-t border-neutral-700 bg-[#1A1A1A] p-5"
      >
        {/* Handle bar */}
        <div className="mb-4 flex justify-center">
          <div className="h-1 w-10 rounded-full bg-neutral-600" />
        </div>

        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-neutral-100">Meja {table.name}</h3>
            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-neutral-500">
              <MapPin className="h-3 w-3" />
              {table.zone} · {table.seatType}
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-neutral-800 p-2 text-neutral-400 transition-colors hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Status + Timer */}
        <div className="mb-4 flex items-center gap-3">
          <StatusBadge
            label={statusLabel}
            variant={table.status === 'occupied' ? (isOverstay ? 'info' : 'occupied') : table.status}
            pulse={table.status === 'warning'}
          />
          {table.isOccupied && (
            <span className={`flex items-center gap-1 font-mono text-sm ${statusColor}`}>
              <Timer className="h-3.5 w-3.5" />
              {elapsedFormatted}
            </span>
          )}
        </div>

        {/* Facilities */}
        <div className="mb-4">
          <p className="mb-2 text-xs font-semibold text-neutral-400">Fasilitas</p>
          <div className="flex flex-wrap gap-2">
            {table.facilities.map((f) => {
              const Icon = ICON_MAP[f.icon] || Plug;
              return (
                <span
                  key={f.label}
                  className="flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-800/60 px-2.5 py-1.5 text-xs text-neutral-300"
                >
                  <Icon className="h-3.5 w-3.5 text-amber-400" />
                  {f.label}
                </span>
              );
            })}
          </div>
        </div>

        {/* Sensor data */}
        <div className="flex gap-4 rounded-xl border border-neutral-700 bg-neutral-800/40 p-3">
          <div>
            <p className="text-[10px] text-neutral-500">Jarak Sensor</p>
            <p className="font-mono text-sm font-bold text-neutral-200">{table.distance} cm</p>
          </div>
          <div>
            <p className="text-[10px] text-neutral-500">RFID UID</p>
            <p className="font-mono text-sm font-bold text-neutral-200">{table.uid ?? '—'}</p>
          </div>
        </div>
      </motion.div>
    </>
  );
}
