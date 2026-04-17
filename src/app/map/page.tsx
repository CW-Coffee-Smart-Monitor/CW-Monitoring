'use client';

/**
 * Map Page — Interactive Floor Plan of CW Coffee.
 * Shows real-time table status on an SVG café layout.
 */

import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { useTableContext } from '@/context/TableContext';
import { TABLE_ROOMS } from '@/data/tables';
import FloorPlan from '@/components/map/FloorPlan';
import MapLegend from '@/components/map/MapLegend';

const QUICK_FILTERS = [
  { label: 'Ngecas',  emoji: '🔌', filterKey: 'Colokan' },
  { label: 'Sofa 2',  emoji: '👥', filterKey: 'Sofa2'  },
  { label: 'Sofa 4',  emoji: '🛋️', filterKey: 'Sofa4'  },
];

const ROOMS = [
  { key: 'AC1',          label: 'AC 1',           emoji: '❄️', available: true },
  { key: 'AC2',          label: 'AC 2',           emoji: '❄️', available: false },
  { key: 'Semi Outdoor', label: 'Semi Outdoor',   emoji: '🌿', available: false },
  { key: 'Outdoor',      label: 'Outdoor',        emoji: '☀️', available: false },
];

export default function MapPage() {
  const { tables } = useTableContext();
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [roomFilter, setRoomFilter] = useState<string | null>('AC1');
  const [lastUpdate, setLastUpdate] = useState<string>('Baru saja');
  const [recommendedId, setRecommendedId] = useState<number | null>(null);

  const filteredTables = roomFilter
    ? tables.filter((t) => TABLE_ROOMS[t.id] === roomFilter)
    : tables;
  const availableCount = filteredTables.filter((t) => t.status === 'available').length;
  const activeRoom = ROOMS.find((r) => r.key === roomFilter) ?? ROOMS[0];

  /* Timestamp update every 30s */
  useEffect(() => {
    const start = Date.now();
    const timer = setInterval(() => {
      const diff = Math.floor((Date.now() - start) / 60_000);
      setLastUpdate(diff < 1 ? 'Baru saja' : `${diff} menit lalu`);
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
      if (activeFilter === 'Outdoor') return t.zone === 'Outdoor';
      if (activeFilter === 'Counter') return t.zone === 'Counter';
      if (activeFilter === 'Tenang') return t.facilities.some((f) => f.label === 'Tenang');
      if (activeFilter === 'Meeting') return t.facilities.some((f) => f.label === 'Meeting Area');
      return t.facilities.some((f) => f.label.includes(activeFilter));
    });
    if (candidates.length === 0) return;
    const best = candidates.reduce<typeof candidates[0]>((prev, cur) =>
      cur.facilities.length > prev.facilities.length ? cur : prev
    , candidates[0]);
    setRecommendedId(best.id);
  };

  return (
    <section className="flex flex-col gap-4 pb-6">

      {/* ── Header Card ── */}
      <div className="relative overflow-hidden rounded-2xl bg-[#4B135F] px-5 py-5 shadow-lg">
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-white/5" />

        <div className="relative flex items-start justify-between gap-2">
          <div>
            <p className="mb-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
              CW Coffee · Floor Plan
            </p>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">Live Map</h1>
            <div className="mt-1.5 flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-white/60">
                Diperbarui: {lastUpdate}
              </span>
            </div>
          </div>

          {/* Available badge */}
          <div className="flex flex-col items-center rounded-xl bg-white/10 px-4 py-2.5">
            <span className="text-2xl font-extrabold leading-none text-white">{availableCount}</span>
            <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider text-white/60">Tersedia</span>
            <span className="text-[9px] text-white/40">dari {filteredTables.length}</span>
          </div>
        </div>
      </div>

      {/* ── Room Selector (horizontal pills) ── */}
      <div>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
          Pilih Ruangan
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {ROOMS.map((room) => {
            const isActive = roomFilter === room.key;
            const count = tables.filter((t) => TABLE_ROOMS[t.id] === room.key && t.status === 'available').length;
            const total = tables.filter((t) => TABLE_ROOMS[t.id] === room.key).length;
            const isOffline = !room.available;

            let btnClass = 'border-neutral-200 bg-white text-neutral-700 hover:border-[#4B135F]/40 hover:bg-[#4B135F]/5';
            if (isActive) btnClass = 'border-[#4B135F] bg-[#4B135F] text-white shadow-md';
            else if (isOffline) btnClass = 'cursor-not-allowed border-neutral-100 bg-neutral-50 opacity-50';

            let countClass = 'text-neutral-400';
            if (!isOffline && count > 0) countClass = isActive ? 'text-green-300' : 'text-green-600';
            else if (!isOffline && isActive) countClass = 'text-white/50';

            return (
              <button
                key={room.key}
                onClick={() => { if (!isOffline) setRoomFilter(room.key); }}
                disabled={isOffline}
                className={`flex shrink-0 flex-col items-center gap-1 rounded-2xl border px-4 py-3 transition-all ${btnClass}`}
              >
                <span className="text-xl leading-none">{room.emoji}</span>
                <span className={`text-[11px] font-semibold ${isActive ? 'text-white' : 'text-neutral-700'}`}>
                  {room.label}
                </span>
                <span className={`text-[10px] font-bold ${countClass}`}>
                  {isOffline ? 'Segera' : `${count}/${total}`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Quick Filter ── */}
      <div>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
          Kebutuhan Saya
        </p>
        <div className="flex gap-2">
          {QUICK_FILTERS.map((qf) => {
            const isActive = activeFilter === qf.filterKey;
            return (
              <button
                key={qf.filterKey}
                onClick={() => setActiveFilter(isActive ? null : qf.filterKey)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2.5 text-[13px] font-semibold transition-all ${
                  isActive
                    ? 'border-[#4B135F] bg-[#4B135F] text-white shadow-sm'
                    : 'border-neutral-200 bg-white text-neutral-600 hover:border-[#4B135F]/40 hover:bg-[#4B135F]/5'
                }`}
              >
                <span className="text-base">{qf.emoji}</span>
                {qf.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Recommend Button ── */}
      <button
        onClick={handleRecommend}
        className="flex items-center justify-center gap-2 rounded-2xl bg-[#D07E20] py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-[#b86d1a] hover:shadow-lg active:scale-[0.98]"
      >
        <Sparkles className="h-4 w-4" />
        Rekomendasikan Meja Terbaik
      </button>

      {/* Floor plan or offline placeholder */}
      {roomFilter != null && !(ROOMS.find((r) => r.key === roomFilter)?.available) ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 py-16 text-center">
          <span className="text-4xl">🚧</span>
          <p className="text-sm font-semibold text-neutral-600">Peta belum tersedia</p>
          <p className="text-xs text-neutral-400">Ruangan <span className="font-medium">{activeRoom.label}</span> sedang dalam pengembangan</p>
        </div>
      ) : (
        <FloorPlan
          highlightFilter={activeFilter}
          roomFilter={roomFilter}
          recommendedId={recommendedId}
          onClearRecommended={() => setRecommendedId(null)}
        />
      )}

      {/* Legend */}
      <MapLegend />
    </section>
  );
}
