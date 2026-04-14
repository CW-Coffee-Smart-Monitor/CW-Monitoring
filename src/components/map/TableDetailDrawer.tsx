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

const FACILITY_COLOR: Record<string, string> = {
  Plug:    'bg-[#D7851F]/10 text-[#D7851F]',
  Wifi:    'bg-blue-500/10 text-blue-500',
  Sun:     'bg-yellow-400/10 text-yellow-500',
  Coffee:  'bg-amber-700/10 text-amber-700',
  Volume1: 'bg-purple-500/10 text-purple-500',
  Trees:   'bg-green-500/10 text-green-600',
  Users:   'bg-indigo-500/10 text-indigo-500',
  Sofa:    'bg-[#4B135F]/10 text-[#4B135F]',
};

const STATUS_CONFIG: Record<string, { label: string; dot: string; badge: string; icon: LucideIcon }> = {
  available: { label: 'Tersedia',  dot: 'bg-green-400',   badge: 'bg-green-500/15 text-green-400 border border-green-500/30',   icon: CheckCircle },
  occupied:  { label: 'Terisi',    dot: 'bg-red-400',     badge: 'bg-red-500/15 text-red-400 border border-red-500/30',         icon: AlertCircle },
  warning:   { label: 'Ghost Booking', dot: 'bg-[#D7851F]',   badge: 'bg-[#D7851F]/15 text-[#D7851F] border border-[#D7851F]/30',  icon: Clock },
  offline:   { label: 'Offline',   dot: 'bg-neutral-400', badge: 'bg-neutral-500/15 text-neutral-400 border border-neutral-500/30', icon: AlertCircle },
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
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
      />

      {/* Drawer */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-md flex flex-col max-h-[88vh] overflow-hidden rounded-t-3xl shadow-2xl"
      >
        {/* ── HERO SECTION (dark purple) ── */}
        <div className="relative bg-[#2a0838] px-5 pt-4 pb-6 shrink-0 overflow-hidden">

          {/* Decorative circles */}
          <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-[#4B135F]/40" />
          <div className="pointer-events-none absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-[#D7851F]/10" />

          {/* Handle */}
          <div className="mb-4 flex justify-center">
            <div className="h-1 w-10 rounded-full bg-white/20" />
          </div>

          {/* Header row */}
          <div className="flex items-start justify-between relative z-10">
            <div className="flex-1 pr-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#D7851F] mb-1">
                Detail Sofa
              </p>
              <h3 className="text-3xl font-extrabold text-white leading-tight">{table.name}</h3>
              <p className="mt-1 text-sm text-white/50">{table.seatType}</p>
            </div>

            {/* Close + sofa icon stack */}
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/70 transition-colors hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Status + timer row */}
          <div className="mt-4 flex items-center gap-3 relative z-10">
            <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${statusCfg.badge}`}>
              <span className={`inline-block h-1.5 w-1.5 rounded-full ${statusCfg.dot} ${table.status === 'available' ? 'animate-pulse' : ''}`} />
              <StatusIcon className="h-3 w-3" />
              {statusCfg.label}
            </div>
            {table.isOccupied && elapsedFormatted && (
              <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/60">
                <Clock className="h-3 w-3" />
                {elapsedFormatted}
              </div>
            )}
          </div>

          {/* Big watermark sofa icon */}
          <Sofa className="pointer-events-none absolute right-4 bottom-0 h-20 w-20 text-white/5" />
        </div>

        {/* ── WHITE CONTENT AREA ── */}
        <div className="overflow-y-auto overscroll-contain bg-white flex-1 min-h-0">
          <div className="px-5 pb-10 pt-5 space-y-5">

            {/* Photo / Preview */}
            <div className="relative h-44 w-full overflow-hidden rounded-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-[#2a0838] via-[#4B135F] to-slate-800 flex items-center justify-center">
                <Sofa className="h-20 w-20 text-white/15" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              {/* Sofa name watermark */}
              <p className="absolute bottom-3 left-4 text-xl font-extrabold text-white/80 tracking-wide">
                {table.name}
              </p>
            </div>

            {/* Smart Insight */}
            <div className="rounded-2xl border border-[#D7851F]/20 bg-[#D7851F]/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#D7851F]/15">
                  <Zap className="h-3.5 w-3.5 text-[#D7851F]" />
                </div>
                <span className="text-[10px] font-bold tracking-widest text-[#D7851F] uppercase">
                  Smart Insight
                </span>
              </div>
              <p className="text-sm text-neutral-700 leading-relaxed">
                Rata-rata penggunaan meja ini{' '}
                <span className="font-bold text-neutral-900">120 menit</span>.
                Cocok untuk sesi kerja atau belajar singkat.
              </p>
            </div>

            {/* Facilities */}
            {table.facilities.length > 0 && (
              <div>
                <p className="mb-3 text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
                  Fasilitas Tersedia
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {table.facilities.map((f) => {
                    const Icon = ICON_MAP[f.icon] || Plug;
                    const colorClass = FACILITY_COLOR[f.icon] ?? 'bg-neutral-100 text-neutral-600';
                    return (
                      <div
                        key={f.label}
                        className={`flex items-center gap-2.5 rounded-xl px-3.5 py-3 text-sm font-medium ${colorClass} bg-opacity-10`}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span>{f.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="h-px bg-neutral-100" />

            {/* Quick stats row */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl bg-[#4B135F]/5 p-3">
                <p className="text-lg font-extrabold text-[#4B135F]">
                  {table.seatType?.replace(/[^0-9]/g, '') || '—'}
                </p>
                <p className="mt-0.5 text-[10px] text-neutral-400 font-medium">Kursi</p>
              </div>
              <div className="rounded-2xl bg-[#D7851F]/5 p-3">
                <p className="text-lg font-extrabold text-[#D7851F]">AC</p>
                <p className="mt-0.5 text-[10px] text-neutral-400 font-medium">Area</p>
              </div>
              <div className="rounded-2xl bg-green-500/5 p-3">
                <p className="text-lg font-extrabold text-green-600">1 Lt</p>
                <p className="mt-0.5 text-[10px] text-neutral-400 font-medium">Lantai</p>
              </div>
            </div>

            {/* CTA Button */}
            <button className="w-full rounded-2xl bg-[#4B135F] py-4 text-sm font-bold text-white shadow-lg shadow-[#4B135F]/30 transition-all hover:bg-[#3a0f49] active:scale-[0.98]">
              Pesan Meja Sekarang →
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
