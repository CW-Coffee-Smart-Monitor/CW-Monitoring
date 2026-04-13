'use client';

/**
 * Map Page — Interactive Floor Plan of CW Coffee.
 * Shows real-time table status on an SVG café layout.
 */

import { useState, useEffect, useRef } from 'react';
import { Sparkles, ChevronDown, MapPin } from 'lucide-react';
import { useTableContext } from '@/context/TableContext';
import { TABLE_ROOMS } from '@/data/tables';
import FloorPlan from '@/components/map/FloorPlan';
import FilterChips from '@/components/map/FilterChips';
import MapLegend from '@/components/map/MapLegend';

const QUICK_FILTERS = [
  { label: 'Mau ngecas', emoji: '🔌', filterKey: 'Colokan' },
  { label: 'Mau sepi',   emoji: '🤫', filterKey: 'Tenang' },
  { label: 'Mau sofa',  emoji: '🛋️', filterKey: 'Sofa'   },
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('Baru saja');
  const [recommendedId, setRecommendedId] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredTables = roomFilter
    ? tables.filter((t) => TABLE_ROOMS[t.id] === roomFilter)
    : tables;
  const availableCount = filteredTables.filter((t) => t.status === 'available').length;
  const activeRoom = ROOMS.find((r) => r.key === roomFilter) ?? ROOMS[0];

  /* Close dropdown on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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
    <section className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-neutral-900">Live Map</h1>
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-[#4B135F] animate-pulse" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#4B135F]">
              Terakhir diperbarui: {lastUpdate}
            </span>
          </div>
        </div>

        {/* Available count badge */}
        <div className="flex flex-col items-end shrink-0">
          <span className="text-xl font-bold text-green-600">{availableCount}</span>
          <span className="text-[10px] text-neutral-500">dari {filteredTables.length} tersedia</span>
        </div>
      </div>

      {/* Room Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen((o) => !o)}
          className="flex w-full items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-sm transition-colors hover:border-neutral-300"
        >
          <div className="flex items-center gap-2.5">
            <MapPin className="h-4 w-4 text-[#4B135F]" />
            <span className="text-sm font-semibold text-neutral-800">{activeRoom.label}</span>
            {roomFilter && (
              <span className="rounded-full bg-[#4B135F]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#4B135F]">
                aktif
              </span>
            )}
          </div>
          <ChevronDown
            className={`h-4 w-4 text-neutral-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Dropdown list */}
        {dropdownOpen && (
          <div className="absolute left-0 right-0 top-full z-40 mt-1.5 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl">
            {ROOMS.map((room) => {
              const isActive = roomFilter === room.key;
              const count = tables.filter((t) => TABLE_ROOMS[t.id] === room.key && t.status === 'available').length;
              const total = tables.filter((t) => TABLE_ROOMS[t.id] === room.key).length;
              const isOffline = !room.available;
              let rowClass = 'hover:bg-neutral-50';
              if (isOffline) rowClass = 'cursor-not-allowed opacity-50';
              else if (isActive) rowClass = 'bg-[#4B135F]/5 hover:bg-[#4B135F]/10';

              let labelClass = 'text-neutral-700';
              if (isActive) labelClass = 'text-[#4B135F] font-semibold';
              else if (isOffline) labelClass = 'text-neutral-400';

              return (
                <button
                  key={String(room.key)}
                  onClick={() => {
                    if (isOffline) return;
                    setRoomFilter(room.key); setDropdownOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors ${rowClass}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{room.emoji}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${labelClass}`}>
                        {room.label}
                      </span>
                      {isOffline && (
                        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-neutral-400">
                          Segera
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`text-xs font-semibold ${count > 0 ? 'text-green-600' : 'text-neutral-400'}`}>
                    {count}/{total}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Kebutuhan Saya quick-filter */}
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
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'border-[#4B135F] bg-[#4B135F]/10 text-[#4B135F]'
                    : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:border-neutral-300'
                }`}
              >
                <span>{qf.emoji}</span>
                {qf.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter chips (detail) */}
      <FilterChips activeFilter={activeFilter} onFilterChange={setActiveFilter} />

      {/* Rekomendasikan Meja */}
      <button
        onClick={handleRecommend}
        className="flex items-center justify-center gap-2 rounded-2xl bg-[#4B135F] py-3 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90 active:opacity-80"
      >
        <Sparkles className="h-4 w-4" />
        Rekomendasikan Meja
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
