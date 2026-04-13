'use client';

/**
 * TableDetailDrawer — Slide-up bottom sheet showing table info when tapped.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { X, Plug, Wifi, Sun, Coffee, Volume1, Trees, Users, Sofa, Zap, CheckCircle, AlertCircle, Clock, type LucideIcon } from 'lucide-react';
import { TableState } from '@/types';
import { useTableStatus } from '@/hooks/useTableStatus';

const ICON_MAP: Record<string, LucideIcon> = {
  Plug, Wifi, Sun, Coffee, Volume1, Trees, Users, Sofa,
};

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; icon: LucideIcon }> = {
  available: { label: 'Tersedia',  bg: 'bg-green-500',  text: 'text-white', icon: CheckCircle },
  occupied:  { label: 'Terisi',    bg: 'bg-red-500',    text: 'text-white', icon: AlertCircle },
  warning:   { label: 'Overstay',  bg: 'bg-amber-500',  text: 'text-white', icon: Clock },
  offline:   { label: 'Offline',   bg: 'bg-neutral-400',text: 'text-white', icon: AlertCircle },
};

interface TableDetailDrawerProps {
  readonly table: TableState | null;
  readonly onClose: () => void;
}

export default function TableDetailDrawer({ table, onClose }: TableDetailDrawerProps) {
  return (
    <AnimatePresence>
      {table && <DrawerContent table={table} onClose={onClose} />}
    </AnimatePresence>
  );
}

function DrawerContent({ table, onClose }: { readonly table: TableState; readonly onClose: () => void }) {
  const { elapsedFormatted } = useTableStatus(table);
  const statusCfg = STATUS_CONFIG[table.status] ?? STATUS_CONFIG.offline;
  const StatusIcon = statusCfg.icon;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/40"
      />

      {/* Drawer */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-md rounded-t-3xl bg-white shadow-2xl flex flex-col max-h-[85vh]"
      >
        {/* Handle bar — fixed, not scrolled */}
        <div className="pt-3 pb-1 flex justify-center shrink-0">
          <div className="h-1 w-10 rounded-full bg-neutral-300" />
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto overscroll-contain px-5 pb-24 min-h-0 flex-1">
          {/* Header */}
          <div className="mb-4 mt-3 flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-bold text-neutral-900">{table.name}</h3>
              <p className="mt-0.5 text-sm text-neutral-400">{table.seatType}</p>
            </div>
            <button
              onClick={onClose}
              className="rounded-full bg-neutral-100 p-2 text-neutral-500 transition-colors hover:bg-neutral-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Photo area with status badge */}
          <div className="relative mb-4 h-44 w-full overflow-hidden rounded-2xl">
            {/* Gradient placeholder photo */}
            <div className="absolute inset-0 bg-linear-to-br from-slate-700 via-blue-800 to-slate-900 flex items-end justify-start p-4">
              <Sofa className="h-14 w-14 text-white/20" />
            </div>
            {/* Subtle texture overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent" />

            {/* Status badge */}
            <div
              className={`absolute top-3 right-3 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow-lg ${statusCfg.bg} ${statusCfg.text}`}
            >
              <StatusIcon className="h-3.5 w-3.5" />
              {statusCfg.label}
              {table.isOccupied && elapsedFormatted ? (
                <span> · {elapsedFormatted}</span>
              ) : null}
            </div>
          </div>

          {/* Smart Insight */}
          <div className="mb-4 rounded-xl bg-neutral-50 border border-neutral-100 p-4">
            <div className="mb-1.5 flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              <span className="text-[11px] font-bold tracking-widest text-neutral-400 uppercase">
                Smart Insight
              </span>
            </div>
            <p className="text-sm text-neutral-700 leading-relaxed">
              Rata-rata penggunaan di meja ini:{' '}
              <span className="font-bold text-neutral-900">120 menit</span>.
            </p>
          </div>

          {/* Facilities */}
          <div className="mb-5">
            <p className="mb-2.5 text-[11px] font-bold tracking-widest text-neutral-400 uppercase">
              Fasilitas Tersedia
            </p>
            <div className="flex flex-wrap gap-2">
              {table.facilities.map((f) => {
                const Icon = ICON_MAP[f.icon] || Plug;
                return (
                  <span
                    key={f.label}
                    className="flex items-center gap-1.5 rounded-lg bg-neutral-100 px-3 py-2 text-sm text-neutral-700"
                  >
                    <Icon className="h-3.5 w-3.5 text-neutral-500" />
                    {f.label}
                  </span>
                );
              })}
            </div>
          </div>

          {/* CTA Button */}
          <button className="w-full rounded-2xl bg-neutral-900 py-4 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 active:bg-neutral-950">
            Pesan Meja Sekarang →
          </button>
        </div>
      </motion.div>
    </>
  );
}
