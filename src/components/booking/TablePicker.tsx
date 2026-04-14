'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Eye, X, Wifi, Plug, Sun, Volume1, MapPin, Check, ChevronRight, Users } from 'lucide-react';
import { INITIAL_TABLES, TABLE_POSITIONS } from '@/data/tables';
import type { TableState } from '@/types';

/* ---------- floor plan mini-map constants ---------- */
const SVG_W = 609;
const SVG_H = 483;
// How much padding (in SVG units) around the highlighted table
const CROP_PAD = 80;

/* ---------- helpers ---------- */

function tableIdToLabel(id: number): string {
  const row = String.fromCharCode(65 + Math.floor((id - 1) / 6));
  const col = ((id - 1) % 6) + 1;
  return `${row}${col}`;
}

/**
 * Kapasitas meja diturunkan dari lebar di TABLE_POSITIONS:
 *  - lebar ≤ 30 px (sofa 2-orang) → "1–2 orang"
 *  - default 63 px (sofa 4-orang) → "4–6 orang"
 */
function getTableCapacity(id: number): string {
  const pos = TABLE_POSITIONS[id];
  const w = pos?.w ?? 63;
  if (w <= 30) return '1–2 orang';
  return '4–6 orang';
}

const ICON_MAP: Record<string, React.ElementType> = { Wifi, Plug, Sun, Volume1 };

const STATUS_CONFIG = {
  available: { dot: 'bg-emerald-400', badge: 'bg-emerald-50 text-emerald-700 border-emerald-100', label: 'Tersedia' },
  occupied:  { dot: 'bg-red-400',     badge: 'bg-red-50 text-red-600 border-red-100',           label: 'Terisi'   },
  warning:   { dot: 'bg-amber-400',   badge: 'bg-amber-50 text-amber-700 border-amber-100',      label: 'Penuh'    },
  offline:   { dot: 'bg-neutral-400', badge: 'bg-neutral-100 text-neutral-500 border-neutral-200', label: 'Offline' },
};

/* ============================================================
   FLOATING PREVIEW CARD
   ============================================================ */

function PreviewCard({ table, onClose }: { table: TableState; onClose: () => void }) {
  const label = tableIdToLabel(table.id);
  const cfg = STATUS_CONFIG[table.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.available;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Compute cropped viewBox centred on this table
  // NOTE: pos.x/y is the CENTER of the table (same convention as FloorPlan.tsx on the Map page)
  const pos = TABLE_POSITIONS[table.id];
  const tw = pos?.w ?? 63;
  const th = pos?.h ?? 43;
  // pos.x/y = center, so the rect top-left is:
  const cx = pos ? pos.x : SVG_W / 2;
  const cy = pos ? pos.y : SVG_H / 2;
  // top-left corner of the highlight rect
  const tx = cx - tw / 2;
  const ty = cy - th / 2;
  const cropSize = Math.max(tw, th) + CROP_PAD * 2;
  const vbX = Math.max(0, Math.min(cx - cropSize / 2, SVG_W - cropSize));
  const vbY = Math.max(0, Math.min(cy - cropSize / 2, SVG_H - cropSize));
  const vbW = Math.min(cropSize, SVG_W);
  const vbH = Math.min(cropSize, SVG_H);

  const STATUS_FILL: Record<string, string> = {
    available: '#22c55e',
    occupied: '#ef4444',
    warning: '#f59e0b',
    offline: '#9ca3af',
  };
  const highlightColor = STATUS_FILL[table.status] ?? '#f59e0b';

  return (
    /* Full-screen backdrop — no gap on any device */
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-neutral-900/60 p-5 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Card */}
      <div
        className="relative w-full max-w-xs rounded-3xl bg-white p-5 shadow-2xl ring-1 ring-neutral-200/80"
        style={{ animation: 'fadeScaleIn 0.18s ease-out' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* X */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 transition hover:bg-neutral-200 active:scale-95"
          aria-label="Tutup preview"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="mb-4 flex items-center gap-3 pr-10">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-base font-black text-white shadow-sm">
            {label}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-neutral-900">{table.name}</p>
            <p className="text-xs text-neutral-500">{table.zone} · CW Coffee</p>
          </div>
        </div>

        {/* Real floor-plan mini-map, cropped & zoomed to this table */}
        <div className="mb-4 overflow-hidden rounded-2xl border border-neutral-100 bg-neutral-50">
          <svg
            viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
            className="w-full"
            aria-label={`Denah posisi ${table.name}`}
          >
            {/* Background denah asli */}
            <image href="/Frame 112.svg" x="0" y="0" width={SVG_W} height={SVG_H} />

            {/* Dim semua meja lain — pos.x/y adalah CENTER, jadi rect dari center - half */}
            {INITIAL_TABLES.map((t) => {
              if (t.id === table.id) return null;
              const p = TABLE_POSITIONS[t.id];
              if (!p) return null;
              const w = p.w ?? 63;
              const h = p.h ?? 43;
              return (
                <rect
                  key={t.id}
                  x={p.x - w / 2} y={p.y - h / 2} width={w} height={h}
                  fill="#000" opacity={0.15} rx={4}
                />
              );
            })}

            {/* Highlight meja ini — animated pulse ring */}
            {pos && (
              <>
                {/* Glow ring */}
                <rect
                  x={tx - 4} y={ty - 4}
                  width={tw + 8} height={th + 8}
                  fill="none"
                  stroke={highlightColor}
                  strokeWidth={3}
                  rx={7}
                  opacity={0.9}
                >
                  <animate attributeName="opacity" values="0.9;0.3;0.9" dur="1.4s" repeatCount="indefinite" />
                </rect>
                {/* Solid fill tint */}
                <rect
                  x={tx} y={ty} width={tw} height={th}
                  fill={highlightColor} opacity={0.25} rx={4}
                />
                {/* Center dot */}
                <circle cx={tx + tw / 2} cy={ty + th / 2} r={4} fill={highlightColor} stroke="white" strokeWidth={1.5} />
              </>
            )}
          </svg>
        </div>

        {/* Status + Zone + Kapasitas */}
        <div className="mb-3 grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-neutral-50 p-3">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-400">Status</p>
            <div className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
              <span className="text-xs font-semibold text-neutral-800">{cfg.label}</span>
            </div>
          </div>
          <div className="rounded-xl bg-neutral-50 p-3">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-400">Zona</p>
            <p className="text-xs font-semibold text-neutral-800">{table.zone}</p>
          </div>
          <div className="rounded-xl bg-neutral-50 p-3">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-400">Kapasitas</p>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3 shrink-0 text-neutral-500" />
              <p className="text-xs font-semibold text-neutral-800">{getTableCapacity(table.id)}</p>
            </div>
          </div>
        </div>

        {/* Facilities */}
        {table.facilities.length > 0 && (
          <div>
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-400">Fasilitas</p>
            <div className="flex flex-wrap gap-1.5">
              {table.facilities.map((f, i) => {
                const Icon = ICON_MAP[f.icon];
                return (
                  <span key={i} className="inline-flex items-center gap-1 rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700">
                    {Icon && <Icon className="h-3 w-3" />}
                    {f.label}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   TABLE ROW
   ============================================================ */

function TableRow({
  table, isSelected, onSelect, onPreview,
}: {
  table: TableState;
  isSelected: boolean;
  onSelect: () => void;
  onPreview: () => void;
}) {
  const label = tableIdToLabel(table.id);
  const cfg = STATUS_CONFIG[table.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.available;
  const isAvailable = table.status === 'available';

  return (
    <div className={`flex items-center gap-3 rounded-2xl border px-3 py-3 transition-all duration-150 ${
      isSelected
        ? 'border-amber-400 bg-amber-50'
        : isAvailable
        ? 'border-neutral-200 bg-white hover:border-amber-200 hover:bg-amber-50/40'
        : 'border-neutral-200 bg-neutral-50 opacity-55'
    }`}>
      {/* Label badge */}
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-base font-black shadow-sm ${
        isSelected ? 'bg-amber-400 text-white'
        : isAvailable ? 'bg-neutral-100 text-neutral-800'
        : 'bg-neutral-200 text-neutral-400'
      }`}>
        {label}
      </div>

      {/* Info — takes all remaining space */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
          <p className={`text-sm font-semibold leading-tight ${isSelected ? 'text-amber-800' : 'text-neutral-900'}`}>
            {table.name}
          </p>
          <span className={`rounded-full border px-1.5 py-0.5 text-[10px] font-semibold ${cfg.badge}`}>
            {cfg.label}
          </span>
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
          {/* Kapasitas */}
          <span className="flex items-center gap-1 text-[11px] text-neutral-500">
            <Users className="h-3 w-3 shrink-0" />
            <span>{getTableCapacity(table.id)}</span>
          </span>
          {/* Fasilitas */}
          {table.facilities.slice(0, 1).map((f, i) => {
            const Icon = ICON_MAP[f.icon];
            return (
              <span key={i} className="flex items-center gap-1 text-[11px] text-neutral-500">
                {Icon && <Icon className="h-3 w-3 shrink-0" />}
                <span className="truncate">{f.label}</span>
              </span>
            );
          })}
          {table.facilities.length === 0 && (
            <span className="text-[11px] text-neutral-400">–</span>
          )}
        </div>
      </div>

      {/* Actions — fixed width, no shrink */}
      <div className="flex shrink-0 items-center gap-2">
        {/* Preview button — bigger touch target on mobile */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onPreview(); }}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-400 shadow-sm transition hover:border-amber-300 hover:text-amber-600 active:scale-95"
          aria-label={`Preview meja ${label}`}
        >
          <Eye className="h-4 w-4" />
        </button>

        {/* Radio — bigger touch target wrapper */}
        <button
          type="button"
          disabled={!isAvailable}
          onClick={onSelect}
          className={`flex h-9 w-9 items-center justify-center rounded-full transition-all ${
            isAvailable ? 'cursor-pointer' : 'cursor-not-allowed'
          }`}
          aria-label={`Pilih meja ${label}`}
        >
          <span className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all ${
            isSelected ? 'border-amber-400 bg-amber-400'
            : isAvailable ? 'border-neutral-300 bg-white hover:border-amber-300'
            : 'border-neutral-200 bg-neutral-100'
          }`}>
            {isSelected && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
          </span>
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   BOTTOM SHEET — full-width, anchored to bottom viewport edge
   ============================================================ */

function TableListSheet({
  selectedId, onSelect, onClose,
}: {
  selectedId: number | null;
  onSelect: (table: TableState) => void;
  onClose: () => void;
}) {
  const [activeZone, setActiveZone] = useState('Semua');
  const [previewTable, setPreviewTable] = useState<TableState | null>(null);

  const zones = useMemo(() => {
    const unique = [...new Set(INITIAL_TABLES.map((t) => t.zone))];
    return ['Semua', ...unique];
  }, []);

  const filtered = useMemo(() =>
    activeZone === 'Semua' ? INITIAL_TABLES : INITIAL_TABLES.filter((t) => t.zone === activeZone),
    [activeZone]
  );

  const availableCount = filtered.filter((t) => t.status === 'available').length;

  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape' && !previewTable) onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, previewTable]);

  const handleSelect = useCallback((table: TableState) => {
    if (table.status !== 'available') return;
    onSelect(table);
    onClose();
  }, [onSelect, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-neutral-900/50 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Sheet — inset-x-0 bottom-0 guarantees full width at all viewports */}
      <div
        className="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-3xl bg-white shadow-2xl"
        style={{ maxHeight: '85dvh' }}
      >
        {/* Drag handle */}
        <div className="flex shrink-0 justify-center pb-1 pt-3">
          <div className="h-1 w-10 rounded-full bg-neutral-200" />
        </div>

        {/* Header — sticky inside sheet */}
        <div className="flex shrink-0 items-center justify-between px-5 py-3">
          <div>
            <p className="text-base font-bold text-neutral-900">Pilih Meja</p>
            <p className="text-xs text-neutral-500">
              <span className="font-semibold text-emerald-600">{availableCount}</span> meja tersedia
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

        {/* Zone filter */}
        <div className="flex shrink-0 gap-2 overflow-x-auto px-5 pb-3 [scrollbar-width:none]">
          {zones.map((z) => (
            <button
              key={z}
              type="button"
              onClick={() => setActiveZone(z)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                activeZone === z ? 'bg-amber-400 text-neutral-900' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {z}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="mx-5 mb-3 h-px shrink-0 bg-neutral-100" />

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-safe-bottom space-y-2 pb-6">
          {filtered.map((table) => (
            <TableRow
              key={table.id}
              table={table}
              isSelected={selectedId === table.id}
              onSelect={() => handleSelect(table)}
              onPreview={() => setPreviewTable(table)}
            />
          ))}
        </div>
      </div>

      {/* Preview card — on top of sheet */}
      {previewTable && (
        <PreviewCard table={previewTable} onClose={() => setPreviewTable(null)} />
      )}
    </>
  );
}

/* ============================================================
   MAIN EXPORT — trigger button in form + sheet portal
   ============================================================ */

export interface TablePickerProps {
  selectedId: number | null;
  selectedName: string;
  onChange: (table: TableState) => void;
}

export default function TablePicker({ selectedId, selectedName, onChange }: TablePickerProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const selectedTable = INITIAL_TABLES.find((t) => t.id === selectedId) ?? null;
  const selectedLabel = selectedId ? tableIdToLabel(selectedId) : null;

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-all active:scale-[0.985] ${
          selectedId ? 'border-amber-400 bg-amber-50 hover:border-amber-500' : 'border-neutral-300 bg-white hover:border-amber-300'
        }`}
      >
        <div className="flex min-w-0 items-center gap-3">
          {selectedId ? (
            <>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-400 text-sm font-black text-white shadow-sm">
                {selectedLabel}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-neutral-900">{selectedName}</p>
                <p className="flex items-center gap-1 text-xs text-neutral-500">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">{selectedTable?.zone ?? ''}</span>
                </p>
              </div>
            </>
          ) : (
            <>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-400">
                <MapPin className="h-4 w-4" />
              </span>
              <p className="text-sm text-neutral-400">Pilih meja…</p>
            </>
          )}
        </div>
        <ChevronRight className={`ml-2 h-4 w-4 shrink-0 transition-colors ${selectedId ? 'text-amber-500' : 'text-neutral-400'}`} />
      </button>

      {/* Bottom sheet */}
      {sheetOpen && (
        <TableListSheet
          selectedId={selectedId}
          onSelect={onChange}
          onClose={() => setSheetOpen(false)}
        />
      )}
    </>
  );
}
