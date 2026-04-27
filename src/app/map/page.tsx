'use client';

/**
 * Map Page — Interactive Floor Plan of CW Coffee.
 * Shows real-time table status on an SVG café layout.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, Wifi, WifiOff } from 'lucide-react';
import { useTableContext } from '@/context/TableContext';
import { TABLE_ROOMS } from '@/data/tables';
import { TableState } from '@/types';
import FloorPlan from '@/components/map/FloorPlan';
import { TableDetailContent } from '@/components/map/TableDetailDrawer';
import ReservationModal from '@/components/map/ReservationModal';

const AMENITY_FILTERS = [
  { label: 'Power Outlets', filterKey: 'Colokan' },
  { label: 'Sofa 2P',       filterKey: 'Sofa2'   },
  { label: 'Sofa 4P',       filterKey: 'Sofa4'   },
  { label: 'Quiet Spot',    filterKey: 'Tenang'  },
];

const ROOMS = [
  { key: 'AC1',          label: 'AC 1',         emoji: '❄️', available: true  },
  { key: 'AC2',          label: 'AC 2',         emoji: '❄️', available: false },
  { key: 'Semi Outdoor', label: 'Semi Outdoor', emoji: '🌿', available: false },
  { key: 'Outdoor',      label: 'Outdoor',      emoji: '☀️', available: false },
];

export default function MapPage() {
  const { tables } = useTableContext();
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [roomFilter, setRoomFilter] = useState<string | null>('AC1');
  const [lastUpdate, setLastUpdate] = useState<string>('Baru saja');
  const [recommendedId, setRecommendedId] = useState<number | null>(null);
  const [selectedTable, setSelectedTable] = useState<TableState | null>(null);
  const [isLive] = useState(true);
  const [showBooking, setShowBooking] = useState(false);

  // Recommended table takes priority over manual click
  const displayTable: TableState | null =
    recommendedId == null
      ? selectedTable
      : (tables.find((t) => t.id === recommendedId) ?? selectedTable);

  const handleCloseDetail = () => { setSelectedTable(null); setRecommendedId(null); setShowBooking(false); };

  const filteredTables = roomFilter
    ? tables.filter((t) => TABLE_ROOMS[t.id] === roomFilter)
    : tables;
  const availableCount = filteredTables.filter((t) => t.status === 'available').length;
  const occupiedCount  = filteredTables.filter((t) => t.status === 'occupied').length;
  const reservedCount  = filteredTables.filter((t) => t.status === 'reserved').length;
  const totalCount     = filteredTables.length;
  const occupancyPct   = totalCount > 0 ? Math.round((occupiedCount / totalCount) * 100) : 0;
  const activeRoom = ROOMS.find((r) => r.key === roomFilter) ?? ROOMS[0];

  useEffect(() => {
    const start = Date.now();
    const timer = setInterval(() => {
      const diff = Math.floor((Date.now() - start) / 60_000);
      setLastUpdate(diff < 1 ? 'Just now' : `${diff}m ago`);
    }, 30_000);
    return () => clearInterval(timer);
  }, []);

  const handleRecommend = () => {
    const candidates = filteredTables.filter((t) => {
      if (t.status !== 'available') return false;
      if (!activeFilter) return true;
      if (activeFilter === 'Sofa') return t.zone === 'Sofa';
      if (activeFilter === 'Sofa2') return t.zone === 'Sofa' && [16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32].includes(t.id);
      if (activeFilter === 'Sofa4') return t.zone === 'Sofa' && [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].includes(t.id);
      if (activeFilter === 'Colokan') return [1,3,5,12,13,14,15,16,23,24,25,26,27,28,29,30,31,32].includes(t.id);
      if (activeFilter === 'Tenang') return t.facilities.some((f) => f.label === 'Tenang');
      return t.facilities.some((f) => f.label.includes(activeFilter));
    });
    if (candidates.length === 0) return;
    const best = candidates.reduce<typeof candidates[0]>((prev, cur) =>
      cur.facilities.length > prev.facilities.length ? cur : prev
    , candidates[0]);
    setRecommendedId(best.id);
  };

  return (
    <section className="grid grid-cols-1 gap-5 pb-8 md:grid-cols-[268px_1fr] md:items-start md:gap-6 lg:grid-cols-[288px_1fr]">

      {/* LEFT SIDEBAR */}
      <aside className="flex flex-col gap-4">

        {/* Occupancy Stats Card */}
        <div className="relative overflow-hidden rounded-2xl bg-[#4B135F] p-5 shadow-xl">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/4" />
          <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/4" />
          <div className="pointer-events-none absolute bottom-4 right-10 h-16 w-16 rounded-full bg-[#D07E20]/20" />

          <div className="relative space-y-4">
            {/* Header row */}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">Floor Plan</p>
                <h1 className="mt-0.5 text-xl font-bold text-white">CW Coffee</h1>
              </div>
              <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                isLive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
              }`}>
                {isLive ? (
                  <>
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                    <span>LIVE</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3" />
                    <span>OFFLINE</span>
                  </>
                )}
              </div>
            </div>

            {/* Big number */}
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black leading-none tabular-nums text-white">{occupiedCount}</span>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-white/40">occupied</span>
                <span className="text-xs font-medium text-white/40">of {totalCount}</span>
              </div>
            </div>

            {/* Occupancy progress bar */}
            <div>
              <div className="mb-1.5 flex justify-between text-[10px] font-medium text-white/40">
                <span>Occupancy</span>
                <span>{occupancyPct}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-linear-to-r from-emerald-400 to-[#D07E20] transition-all duration-700"
                  style={{ width: `${occupancyPct}%` }}
                />
              </div>
            </div>

            {/* Mini stats */}
            <div className="grid grid-cols-3 gap-2 border-t border-white/10 pt-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-bold text-emerald-400">{availableCount}</span>
                <span className="text-[9px] uppercase tracking-wider text-white/30">Available</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-bold text-amber-400">{reservedCount}</span>
                <span className="text-[9px] uppercase tracking-wider text-white/30">Reserved</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] font-bold text-white/50">{lastUpdate}</span>
                <span className="text-[9px] uppercase tracking-wider text-white/30">Updated</span>
              </div>
            </div>
          </div>
        </div>

        {/* Select Area */}
        <div className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Select Area</p>
          <div className="flex flex-col gap-1.5">
            {ROOMS.map((room) => {
              const isActive = roomFilter === room.key;
              const count = tables.filter((t) => TABLE_ROOMS[t.id] === room.key && t.status === 'available').length;
              const isOffline = !room.available;

              let badgeClass = 'bg-emerald-50 text-emerald-700';
              if (isOffline) badgeClass = 'bg-neutral-100 text-neutral-400';
              else if (count === 0) badgeClass = 'bg-red-50 text-red-600';

              let badgeText = 'Full';
              if (isOffline) badgeText = 'Soon';
              else if (count > 0) badgeText = `${count} open`;

              let btnClass = 'hover:bg-neutral-50';
              if (isActive) btnClass = 'bg-[#4B135F] shadow-sm';
              else if (isOffline) btnClass = 'cursor-not-allowed opacity-40';

              return (
                <button
                  key={room.key}
                  onClick={() => { if (!isOffline) setRoomFilter(room.key); }}
                  disabled={isOffline}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all ${btnClass}`}
                >
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base ${
                    isActive ? 'bg-white/15' : 'bg-neutral-100'
                  }`}>
                    {room.emoji}
                  </span>
                  <span className={`flex-1 text-left text-sm font-medium ${isActive ? 'text-white' : 'text-neutral-700'}`}>
                    {room.label}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    isActive ? 'bg-white/20 text-white' : badgeClass
                  }`}>
                    {badgeText}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter Amenities */}
        <div className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Filter Amenities</p>
          <div className="flex flex-wrap gap-2">
            {AMENITY_FILTERS.map((af) => {
              const isActive = activeFilter === af.filterKey;
              return (
                <button
                  key={af.filterKey}
                  onClick={() => setActiveFilter(isActive ? null : af.filterKey)}
                  className={`rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-all ${
                    isActive
                      ? 'border-[#4B135F] bg-[#4B135F] text-white shadow-sm'
                      : 'border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-[#4B135F]/40 hover:bg-[#4B135F]/5 hover:text-[#4B135F]'
                  }`}
                >
                  {af.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Status Legend — desktop sidebar */}
        <div className="hidden rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm md:block">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">Status Legend</p>
          <div className="space-y-2.5">
            {[
              { color: 'bg-emerald-500', label: 'Available',       sub: 'Bisa langsung duduk' },
              { color: 'bg-red-500',     label: 'Occupied',        sub: 'Sedang digunakan'    },
              { color: 'bg-amber-400',   label: 'Reserved / Hold', sub: 'Ada reservasi aktif' },
              { color: 'bg-orange-500',  label: 'Needs Attention', sub: 'Perlu dibersihkan'   },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${item.color}`} />
                <div>
                  <p className="text-xs font-semibold text-neutral-700">{item.label}</p>
                  <p className="text-[10px] text-neutral-400">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommend button — mobile only */}
        <button
          onClick={handleRecommend}
          className="flex items-center justify-center gap-2 rounded-2xl bg-[#4B135F] py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-[#3a0f49] hover:shadow-xl active:scale-[0.98] md:hidden"
        >
          <Sparkles className="h-4 w-4" />
          Temukan Meja Terbaik
        </button>

      </aside>

      {/* RIGHT: Floor Plan + push-panels */}
      <div className="flex min-w-0 flex-col gap-3 md:flex-row">

        {/* Floor Plan column — flex-1, shrinks as panels open (md+) */}
        <div className="flex min-w-0 flex-1 flex-col gap-3">

        {/* Top bar — desktop only */}
        <div className="hidden items-center justify-between rounded-2xl border border-neutral-100 bg-white px-5 py-3 shadow-sm md:flex">
          <div className="flex items-center gap-4">
            {[
              { dot: 'bg-emerald-500', label: 'Available' },
              { dot: 'bg-red-500',     label: 'Occupied'  },
              { dot: 'bg-amber-400',   label: 'Reserved'  },
            ].map((item) => (
              <span key={item.label} className="flex items-center gap-1.5 text-xs font-medium text-neutral-500">
                <span className={`h-2 w-2 rounded-full ${item.dot}`}></span>
                <span>{item.label}</span>
              </span>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-[11px] font-semibold text-neutral-600">
              <Wifi className="h-3 w-3 text-emerald-500" />
              {activeRoom.emoji} {activeRoom.label}
            </span>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700">
              {availableCount} seats free
            </span>
          </div>
        </div>

        {/* Floor plan or offline placeholder */}
        {roomFilter != null && !(ROOMS.find((r) => r.key === roomFilter)?.available) ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/80 py-20 text-center md:py-36">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 text-3xl shadow-sm">
              🚧
            </div>
            <div>
              <p className="text-sm font-bold text-neutral-700">Peta belum tersedia</p>
              <p className="mt-0.5 text-xs text-neutral-400">
                <span className="font-medium text-neutral-500">{activeRoom.label}</span> sedang dalam pengembangan
              </p>
            </div>
          </div>
        ) : (
          <FloorPlan
            highlightFilter={activeFilter}
            roomFilter={roomFilter}
            recommendedId={recommendedId}
            onSelectTable={setSelectedTable}
          />
        )}

        {/* Bottom bar — desktop only */}
        <div className="hidden items-center justify-between md:flex">
          <div className="flex items-center gap-2 text-[11px] text-neutral-400">
            <Zap className="h-3.5 w-3.5 text-[#D07E20]" />
            <span>Klik meja di peta untuk detail lengkap</span>
          </div>
          <button
            onClick={handleRecommend}
            className="flex items-center gap-2.5 rounded-full bg-[#4B135F] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#4B135F]/30 transition-all hover:bg-[#3a0f49] hover:shadow-xl hover:shadow-[#4B135F]/40 active:scale-[0.97]"
          >
            <Sparkles className="h-4 w-4" />
            Auto Assign Table
          </button>
        </div>

        {/* Mobile legend */}
        <div className="flex flex-wrap items-center gap-3 px-1 text-[11px] text-neutral-500 md:hidden">
          {[
            { dot: 'bg-emerald-500', label: 'Available' },
            { dot: 'bg-red-500',     label: 'Occupied'  },
            { dot: 'bg-amber-400',   label: 'Reserved'  },
          ].map((item) => (
            <span key={item.label} className="flex items-center gap-1.5 font-medium">
              <span className={`h-2 w-2 rounded-full ${item.dot}`}></span>
              <span>{item.label}</span>
            </span>
          ))}
        </div>

        </div>

        {/* Mobile detail — bottom sheet overlay, slides up from bottom (md:hidden) */}
        <AnimatePresence>
          {displayTable && (
            <motion.div
              key="mobile-inline-panel"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-40 flex max-h-[85dvh] flex-col rounded-t-3xl border-t border-neutral-200 bg-white shadow-2xl md:hidden"
            >
              <TableDetailContent table={displayTable} onClose={handleCloseDetail} onBook={() => setShowBooking(true)} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile booking form — bottom sheet overlay, slides up from bottom (md:hidden) */}
        <AnimatePresence>
          {displayTable && showBooking && (
            <motion.div
              key="mobile-booking-panel"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85dvh] flex-col rounded-t-3xl border-t border-neutral-200 bg-white shadow-2xl md:hidden"
            >
              <ReservationModal table={displayTable} onClose={() => setShowBooking(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop booking form panel — slides in to the RIGHT of map, LEFT of detail (md+) */}
        <AnimatePresence>
          {displayTable && showBooking && (
            <motion.div
              key="desktop-booking-panel"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 32, stiffness: 300 }}
              className="hidden shrink-0 flex-col overflow-hidden rounded-2xl border border-neutral-200 shadow-xl md:flex"
            >
              <div className="w-80">
                <ReservationModal table={displayTable} onClose={() => setShowBooking(false)} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop detail panel — slides in to the RIGHT of booking form (md+) */}
        <AnimatePresence>
          {displayTable && (
            <motion.div
              key="desktop-panel"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 32, stiffness: 300 }}
              className="hidden shrink-0 flex-col overflow-hidden rounded-2xl border border-neutral-200 shadow-xl md:flex"
            >
              <div className="w-80">
                <TableDetailContent table={displayTable} onClose={handleCloseDetail} onBook={() => setShowBooking(true)} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

    </section>
  );
}
