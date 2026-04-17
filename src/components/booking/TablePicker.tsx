'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Eye,
  X,
  Wifi,
  Plug,
  Sun,
  Volume1,
  MapPin,
  Check,
  ChevronRight,
  Users,
  CalendarDays,
  Clock3,
} from 'lucide-react';
import { INITIAL_TABLES, TABLE_POSITIONS } from '@/data/tables';
import type { TableState } from '@/types';

/* ---------- floor plan mini-map constants ---------- */
const SVG_W = 609;
const SVG_H = 483;
const CROP_PAD = 80;

/* ---------- helpers ---------- */

function getSofaGroup(name: string): string {
  return name.trim().charAt(0).toUpperCase();
}

const ICON_MAP: Record<string, React.ElementType> = { Wifi, Plug, Sun, Volume1 };

type AvailabilityState = 'available' | 'unavailable' | 'unknown';

type SofaGroup = {
  key: string;
  tables: TableState[];
  representative: TableState;
  totalCount: number;
};

function buildSofaGroups(tables: TableState[]): SofaGroup[] {
  const grouped = new Map<string, TableState[]>();

  tables.forEach((table) => {
    const key = getSofaGroup(table.name);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)?.push(table);
  });

  return Array.from(grouped.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, items]) => ({
      key,
      tables: items,
      representative: items[0],
      totalCount: items.length,
    }));
}

function getGroupCenter(group: SofaGroup) {
  const positions = group.tables
    .map((table) => {
      const pos = TABLE_POSITIONS[table.id];
      if (!pos) return null;
      return {
        x: pos.x,
        y: pos.y,
        w: pos.w ?? 63,
        h: pos.h ?? 43,
      };
    })
    .filter(Boolean) as { x: number; y: number; w: number; h: number }[];

  if (positions.length === 0) {
    return {
      cx: SVG_W / 2,
      cy: SVG_H / 2,
      minX: SVG_W / 2 - 30,
      minY: SVG_H / 2 - 30,
      maxX: SVG_W / 2 + 30,
      maxY: SVG_H / 2 + 30,
    };
  }

  const minX = Math.min(...positions.map((p) => p.x - p.w / 2));
  const minY = Math.min(...positions.map((p) => p.y - p.h / 2));
  const maxX = Math.max(...positions.map((p) => p.x + p.w / 2));
  const maxY = Math.max(...positions.map((p) => p.y + p.h / 2));

  return {
    cx: (minX + maxX) / 2,
    cy: (minY + maxY) / 2,
    minX,
    minY,
    maxX,
    maxY,
  };
}

function getAvailabilityConfig(state: AvailabilityState) {
  if (state === 'available') {
    return {
      dot: 'bg-emerald-400',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      label: 'Tersedia',
    };
  }

  if (state === 'unavailable') {
    return {
      dot: 'bg-red-400',
      badge: 'bg-red-50 text-red-700 border-red-100',
      label: 'Sudah dibooking',
    };
  }

  return {
    dot: 'bg-neutral-400',
    badge: 'bg-neutral-100 text-neutral-600 border-neutral-200',
    label: 'Belum dicek',
  };
}

/* ============================================================
   FLOATING PREVIEW CARD
   ============================================================ */

function PreviewCard({
  group,
  selectedDate,
  selectedTime,
  availabilityState,
  onClose,
}: {
  group: SofaGroup;
  selectedDate: string;
  selectedTime: string;
  availabilityState: AvailabilityState;
  onClose: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const representative = group.representative;
  const center = getGroupCenter(group);
  const availability = getAvailabilityConfig(availabilityState);

  const cropWidth = Math.max(center.maxX - center.minX + CROP_PAD * 2, 140);
  const cropHeight = Math.max(center.maxY - center.minY + CROP_PAD * 2, 140);
  const cropSize = Math.max(cropWidth, cropHeight);

  const vbX = Math.max(0, Math.min(center.cx - cropSize / 2, SVG_W - cropSize));
  const vbY = Math.max(0, Math.min(center.cy - cropSize / 2, SVG_H - cropSize));
  const vbW = Math.min(cropSize, SVG_W);
  const vbH = Math.min(cropSize, SVG_H);

  const highlightColor =
    availabilityState === 'available'
      ? '#22c55e'
      : availabilityState === 'unavailable'
        ? '#ef4444'
        : '#9ca3af';

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-neutral-900/60 p-5 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xs rounded-3xl bg-white p-5 shadow-2xl ring-1 ring-neutral-200/80"
        style={{ animation: 'fadeScaleIn 0.18s ease-out' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 transition hover:bg-neutral-200 active:scale-95"
          aria-label="Tutup preview"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-4 flex items-center gap-3 pr-10">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-base font-black text-white shadow-sm">
            {group.key}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-neutral-900">Blok {group.key}</p>
            <p className="text-xs text-neutral-500">Preview lokasi · CW Coffee</p>
          </div>
        </div>

        <div className="mb-3 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-neutral-50 p-3">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
              Tanggal dipilih
            </p>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-800">
              <CalendarDays className="h-3.5 w-3.5 text-neutral-500" />
              <span>{selectedDate || '-'}</span>
            </div>
          </div>
          <div className="rounded-xl bg-neutral-50 p-3">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
              Waktu dipilih
            </p>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-800">
              <Clock3 className="h-3.5 w-3.5 text-neutral-500" />
              <span>{selectedTime || '-'}</span>
            </div>
          </div>
        </div>

        <div className="mb-4 overflow-hidden rounded-2xl border border-neutral-100 bg-neutral-50">
          <svg
            viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
            className="w-full"
            aria-label={`Denah posisi blok ${group.key}`}
          >
            <image href="/Frame 112.svg" x="0" y="0" width={SVG_W} height={SVG_H} />

            {INITIAL_TABLES.map((t) => {
              const p = TABLE_POSITIONS[t.id];
              if (!p) return null;
              const w = p.w ?? 63;
              const h = p.h ?? 43;
              const isInGroup = group.tables.some((groupTable) => groupTable.id === t.id);

              return (
                <rect
                  key={t.id}
                  x={p.x - w / 2}
                  y={p.y - h / 2}
                  width={w}
                  height={h}
                  fill={isInGroup ? highlightColor : '#000'}
                  opacity={isInGroup ? 0.25 : 0.15}
                  rx={4}
                />
              );
            })}

            <rect
              x={center.minX - 6}
              y={center.minY - 6}
              width={center.maxX - center.minX + 12}
              height={center.maxY - center.minY + 12}
              fill="none"
              stroke={highlightColor}
              strokeWidth={3}
              rx={10}
              opacity={0.9}
            />
          </svg>
        </div>

        <div className="mb-3 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-neutral-50 p-3">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
              Status
            </p>
            <div className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${availability.dot}`} />
              <span className="text-xs font-semibold text-neutral-800">{availability.label}</span>
            </div>
          </div>
          <div className="rounded-xl bg-neutral-50 p-3">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
              Cakupan
            </p>
            <div className="flex items-center gap-1 text-xs font-semibold text-neutral-800">
              <Users className="h-3.5 w-3.5 text-neutral-500" />
              <span>{group.totalCount} sofa</span>
            </div>
          </div>
        </div>

        {representative.facilities.length > 0 && (
          <div>
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
              Fasilitas
            </p>
            <div className="flex flex-wrap gap-1.5">
              {representative.facilities.map((f, i) => {
                const Icon = ICON_MAP[f.icon];
                return (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700"
                  >
                    {Icon && <Icon className="h-3 w-3" />}
                    {f.label}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Sofa dalam blok
          </p>
          <p className="mt-1 text-sm font-medium text-neutral-900">
            {group.tables.map((table) => table.name).join(', ')}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   BLOCK ROW
   ============================================================ */

function SofaRow({
  group,
  availabilityState,
  isSelected,
  onSelect,
  onPreview,
}: {
  group: SofaGroup;
  availabilityState: AvailabilityState;
  isSelected: boolean;
  onSelect: () => void;
  onPreview: () => void;
}) {
  const availability = getAvailabilityConfig(availabilityState);
  const isAvailable = availabilityState === 'available';

  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border px-3 py-3 transition-all duration-150 ${
        isSelected
          ? 'border-amber-400 bg-amber-50'
          : isAvailable
            ? 'border-neutral-200 bg-white hover:border-amber-200 hover:bg-amber-50/40'
            : 'border-neutral-200 bg-neutral-50 opacity-70'
      }`}
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-base font-black shadow-sm ${
          isSelected
            ? 'bg-amber-400 text-white'
            : isAvailable
              ? 'bg-neutral-100 text-neutral-800'
              : 'bg-neutral-200 text-neutral-500'
        }`}
      >
        {group.key}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
          <p
            className={`text-sm font-semibold leading-tight ${
              isSelected ? 'text-amber-800' : 'text-neutral-900'
            }`}
          >
            Blok {group.key}
          </p>
          <span
            className={`rounded-full border px-1.5 py-0.5 text-[10px] font-semibold ${availability.badge}`}
          >
            {availability.label}
          </span>
        </div>

        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="flex items-center gap-1 text-[11px] text-neutral-500">
            <Users className="h-3 w-3 shrink-0" />
            <span>{group.totalCount} sofa</span>
          </span>
          {group.representative.facilities.slice(0, 1).map((f, i) => {
            const Icon = ICON_MAP[f.icon];
            return (
              <span key={i} className="flex items-center gap-1 text-[11px] text-neutral-500">
                {Icon && <Icon className="h-3 w-3 shrink-0" />}
                <span className="truncate">{f.label}</span>
              </span>
            );
          })}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPreview();
          }}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-400 shadow-sm transition hover:border-amber-300 hover:text-amber-600 active:scale-95"
          aria-label={`Preview blok ${group.key}`}
        >
          <Eye className="h-4 w-4" />
        </button>

        <button
          type="button"
          disabled={!isAvailable}
          onClick={onSelect}
          className={`flex h-9 w-9 items-center justify-center rounded-full transition-all ${
            isAvailable ? 'cursor-pointer' : 'cursor-not-allowed'
          }`}
          aria-label={`Pilih blok ${group.key}`}
        >
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all ${
              isSelected
                ? 'border-amber-400 bg-amber-400'
                : isAvailable
                  ? 'border-neutral-300 bg-white hover:border-amber-300'
                  : 'border-neutral-200 bg-neutral-100'
            }`}
          >
            {isSelected && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
          </span>
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   BOTTOM SHEET
   ============================================================ */

function TableListSheet({
  selectedCode,
  selectedDate,
  selectedTime,
  availabilityByBlock,
  isLoadingAvailability,
  onSelect,
  onClose,
}: {
  selectedCode: string;
  selectedDate: string;
  selectedTime: string;
  availabilityByBlock: Record<string, boolean>;
  isLoadingAvailability: boolean;
  onSelect: (blockCode: string) => void;
  onClose: () => void;
}) {
  const [previewGroup, setPreviewGroup] = useState<SofaGroup | null>(null);

  const groupedSofas = useMemo(() => buildSofaGroups(INITIAL_TABLES), []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !previewGroup) onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, previewGroup]);

  const handleSelect = useCallback(
    (group: SofaGroup) => {
      if (availabilityByBlock[group.key] === false) return;
      onSelect(group.key);
      onClose();
    },
    [availabilityByBlock, onSelect, onClose]
  );

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-neutral-900/50 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <div
        className="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-3xl bg-white shadow-2xl"
        style={{ maxHeight: '85dvh' }}
      >
        <div className="flex shrink-0 justify-center pb-1 pt-3">
          <div className="h-1 w-10 rounded-full bg-neutral-200" />
        </div>

        <div className="flex shrink-0 items-center justify-between px-5 py-3">
          <div>
            <p className="text-base font-bold text-neutral-900">Pilih Blok Sofa</p>
            <p className="text-xs text-neutral-500">
              Tanggal <span className="font-semibold text-neutral-700">{selectedDate}</span> ·{' '}
              Waktu <span className="font-semibold text-neutral-700">{selectedTime}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 transition hover:bg-neutral-200 active:scale-95"
            aria-label="Tutup"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mx-5 mb-3 h-px shrink-0 bg-neutral-100" />

        <div className="px-5 pb-3">
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-xs text-neutral-600">
            {isLoadingAvailability
              ? 'Memeriksa ketersediaan blok untuk jadwal yang dipilih...'
              : 'Status blok di bawah sudah disesuaikan dengan tanggal dan waktu yang dipilih.'}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 px-5 pb-6">
          {groupedSofas.map((group) => {
            const availabilityState: AvailabilityState = isLoadingAvailability
              ? 'unknown'
              : availabilityByBlock[group.key] === false
                ? 'unavailable'
                : 'available';

            return (
              <SofaRow
                key={group.key}
                group={group}
                availabilityState={availabilityState}
                isSelected={selectedCode === group.key}
                onSelect={() => handleSelect(group)}
                onPreview={() => setPreviewGroup(group)}
              />
            );
          })}
        </div>
      </div>

      {previewGroup && (
        <PreviewCard
          group={previewGroup}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          availabilityState={
            isLoadingAvailability
              ? 'unknown'
              : availabilityByBlock[previewGroup.key] === false
                ? 'unavailable'
                : 'available'
          }
          onClose={() => setPreviewGroup(null)}
        />
      )}
    </>
  );
}

/* ============================================================
   MAIN EXPORT
   ============================================================ */

export interface TablePickerProps {
  selectedCode: string;
  selectedDate: string;
  selectedTime: string;
  availabilityByBlock: Record<string, boolean>;
  isLoadingAvailability?: boolean;
  disabled?: boolean;
  onChange: (blockCode: string) => void;
}

export default function TablePicker({
  selectedCode,
  selectedDate,
  selectedTime,
  availabilityByBlock,
  isLoadingAvailability = false,
  disabled = false,
  onChange,
}: TablePickerProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const isReady = Boolean(selectedDate && selectedTime) && !disabled;

  return (
    <>
      <button
        type="button"
        disabled={!isReady}
        onClick={() => {
          if (!isReady) return;
          setSheetOpen(true);
        }}
        className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-all active:scale-[0.985] ${
          !isReady
            ? 'cursor-not-allowed border-neutral-200 bg-neutral-50 text-neutral-400'
            : selectedCode
              ? 'border-amber-400 bg-amber-50 hover:border-amber-500'
              : 'border-neutral-300 bg-white hover:border-amber-300'
        }`}
      >
        <div className="flex min-w-0 items-center gap-3">
          {selectedCode ? (
            <>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-400 text-sm font-black text-white shadow-sm">
                {selectedCode}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-neutral-900">Blok {selectedCode}</p>
                <p className="flex items-center gap-1 text-xs text-neutral-500">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">Preview lokasi tersedia</span>
                </p>
              </div>
            </>
          ) : (
            <>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-400">
                <MapPin className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm text-neutral-400">
                  {isReady ? 'Pilih blok sofa…' : 'Pilih tanggal & waktu dulu'}
                </p>
                {!isReady && (
                  <p className="mt-0.5 text-xs text-neutral-400">
                    Blok akan dicek setelah jadwal diisi
                  </p>
                )}
              </div>
            </>
          )}
        </div>
        <ChevronRight
          className={`ml-2 h-4 w-4 shrink-0 transition-colors ${
            selectedCode && isReady ? 'text-amber-500' : 'text-neutral-400'
          }`}
        />
      </button>

      {sheetOpen && isReady && (
        <TableListSheet
          selectedCode={selectedCode}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          availabilityByBlock={availabilityByBlock}
          isLoadingAvailability={isLoadingAvailability}
          onSelect={onChange}
          onClose={() => setSheetOpen(false)}
        />
      )}
    </>
  );
}