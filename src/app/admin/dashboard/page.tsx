'use client';
import { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  AlertTriangle,
  Zap,
  Wifi,
  Armchair,
} from 'lucide-react';

/* ── Mock data ──────────────────────────────────────────────── */

const GHOST_ALERTS = [
  {
    tableId: 'W-12',
    detected: 'Booked',
    physical: 'Empty (25m)',
    detectedVariant: 'booked' as const,
    physicalVariant: 'normal' as const,
  },
  {
    tableId: 'S-04',
    detected: 'Available',
    physical: 'Occupied',
    detectedVariant: 'normal' as const,
    physicalVariant: 'occupied' as const,
  },
];

const OCCUPANCY_BARS = [
  { label: '8am',  value: 20 },
  { label: '10am', value: 55 },
  { label: '12pm', value: 75 },
  { label: '2pm',  value: 88 },
  { label: '4pm',  value: 62 },
  { label: '6pm',  value: 28 },
];

/* Tables occupied in snapshot (mock) */
const OCCUPIED_IDS = new Set([2, 4, 8, 9, 10, 14, 23, 25, 29, 31]);

const SVG_W = 609, SVG_H = 483;

const TABLE_POS: { id: number; x: number; y: number; w?: number; h?: number }[] = [
  { id: 1,  x: 31,  y: 126 },
  { id: 2,  x: 114, y: 127 },
  { id: 3,  x: 31,  y: 189 },
  { id: 4,  x: 114, y: 189 },
  { id: 5,  x: 31,  y: 273 },
  { id: 6,  x: 112, y: 271 },
  { id: 7,  x: 197, y: 271 },
  { id: 8,  x: 448, y: 125 },
  { id: 9,  x: 448, y: 188 },
  { id: 10, x: 448, y: 294 },
  { id: 11, x: 448, y: 357 },
  { id: 12, x: 28,  y: 461 },
  { id: 13, x: 91,  y: 461 },
  { id: 14, x: 154, y: 461 },
  { id: 15, x: 217, y: 461 },
  { id: 16, x: 10,  y: 347, w: 25, h: 61 },
  { id: 17, x: 52,  y: 347, w: 25, h: 61 },
  { id: 18, x: 94,  y: 347, w: 25, h: 61 },
  { id: 19, x: 136, y: 347, w: 25, h: 61 },
  { id: 20, x: 178, y: 347, w: 25, h: 61 },
  { id: 21, x: 220, y: 347, w: 25, h: 61 },
  { id: 22, x: 262, y: 347, w: 25, h: 61 },
  { id: 23, x: 10,  y: 29,  w: 25, h: 64 },
  { id: 24, x: 52,  y: 29,  w: 25, h: 64 },
  { id: 25, x: 94,  y: 29,  w: 25, h: 64 },
  { id: 26, x: 136, y: 29,  w: 25, h: 64 },
  { id: 27, x: 178, y: 29,  w: 25, h: 64 },
  { id: 28, x: 220, y: 29,  w: 25, h: 64 },
  { id: 29, x: 345, y: 29,  w: 25, h: 64 },
  { id: 30, x: 388, y: 29,  w: 25, h: 64 },
  { id: 31, x: 430, y: 29,  w: 25, h: 64 },
  { id: 32, x: 472, y: 29,  w: 25, h: 64 },
];

/* Session data for occupied tables (mock) */
const TABLE_SESSIONS: Record<number, { name: string; member: string; checkIn: string; duration: string; type: string }> = {
  2:  { name: 'Andi Rizky',     member: 'MBR-0021', checkIn: '09:15', duration: '1j 45m', type: 'Workstation' },
  4:  { name: 'Budi Santoso',   member: 'MBR-0047', checkIn: '08:30', duration: '2j 30m', type: 'Workstation' },
  8:  { name: 'Citra Maharani', member: 'MBR-0093', checkIn: '10:00', duration: '1j 00m', type: 'Study Table' },
  9:  { name: 'Dina Putri',     member: 'MBR-0112', checkIn: '10:20', duration: '0j 40m', type: 'Study Table' },
  10: { name: 'Erik Wijaya',    member: 'MBR-0058', checkIn: '09:45', duration: '1j 15m', type: 'Study Table' },
  14: { name: 'Fira Amelia',    member: 'MBR-0074', checkIn: '11:00', duration: '0j 05m', type: 'Sofa Lounge' },
  23: { name: 'Gilang Tirta',   member: 'MBR-0031', checkIn: '07:50', duration: '3j 10m', type: 'Bar Seat' },
  25: { name: 'Hana Kusuma',    member: 'MBR-0088', checkIn: '08:10', duration: '2j 50m', type: 'Bar Seat' },
  29: { name: 'Irfan Noor',     member: 'MBR-0065', checkIn: '09:30', duration: '1j 30m', type: 'Bar Seat' },
  31: { name: 'Julia Sari',     member: 'MBR-0102', checkIn: '10:45', duration: '0j 15m', type: 'Bar Seat' },
};

const ZONE_SUMMARY = [
  { zone: 'Workstation',  occupied: 2, total: 6  },
  { zone: 'Bar Seat',     occupied: 4, total: 10 },
  { zone: 'Study Table',  occupied: 3, total: 8  },
  { zone: 'Sofa Lounge',  occupied: 1, total: 6  },
];

const LIVE_TICKER: { time: string; name: string; action: 'in' | 'out'; table: number }[] = [
  { time: '11:00', name: 'Fira Amelia',    action: 'in',  table: 14 },
  { time: '10:45', name: 'Julia Sari',     action: 'in',  table: 31 },
  { time: '10:20', name: 'Dina Putri',     action: 'in',  table: 9  },
  { time: '10:15', name: 'Bintang Eka',    action: 'out', table: 7  },
  { time: '10:00', name: 'Citra Maharani', action: 'in',  table: 8  },
];

/* ── Page ───────────────────────────────────────────────────── */

export default function AdminDashboardPage() {
  const maxBar = Math.max(...OCCUPANCY_BARS.map(b => b.value));
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [confirmTableId, setConfirmTableId] = useState<string | null>(null);

  return (
    <div className="space-y-8">

      {/* ── Header ──────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-800">Dashboard Overview</h1>
        <p className="text-neutral-500 text-sm mt-1">Live monitoring and operational control center.</p>
      </div>

      {/* ── LIVE OPERATION ──────────────────────────────── */}
      <section>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-3">
          Live Operation
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          {/* Available */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">Available</p>
              <p className="text-4xl font-bold text-neutral-800 mt-1">42</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
              <Armchair className="w-6 h-6 text-neutral-400" />
            </div>
          </div>

          {/* Occupied */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">Occupied</p>
              <p className="text-4xl font-bold text-[#4B135F] mt-1">118</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#EDE9F5] flex items-center justify-center shrink-0">
              <Users className="w-6 h-6 text-[#4B135F]" />
            </div>
          </div>

          {/* Issues */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">Issues</p>
              <p className="text-4xl font-bold text-red-500 mt-1">3</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
          </div>

        </div>
      </section>

      {/* ── Interactive Floor Plan + Manual Controls ─────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-4">

        {/* Floor Plan */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <p className="font-semibold text-neutral-800">Interactive Floor Plan</p>
            <div className="flex items-center gap-4 text-xs text-neutral-500">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-gray-400 block"></span>Tersedia</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500 block"></span>Ditempati</span>
              <span className="text-neutral-300">· Klik meja untuk detail</span>
            </div>
          </div>

          {/* Real CW Coffee floor plan — interactive */}
          <div className="bg-neutral-50 rounded-xl border border-neutral-200 overflow-hidden">
            <svg
              viewBox={`0 0 ${SVG_W} ${SVG_H}`}
              className="w-full"
              aria-label="CW Coffee interactive floor plan"
              style={{ display: 'block' }}
              onClick={() => setSelectedId(null)}
            >
              <image href="/Frame 112.svg" x="0" y="0" width={SVG_W} height={SVG_H} />

              {TABLE_POS.map(pos => {
                const occupied = OCCUPIED_IDS.has(pos.id);
                const w = pos.w ?? 63, h = pos.h ?? 43;
                const x = pos.x - w / 2, y = pos.y - h / 2;
                const isSelected = selectedId === pos.id;
                const fill = occupied ? '#ef4444' : '#9ca3af';
                let opacity = 0.25;
                if (isSelected) opacity = 0.85;
                else if (occupied) opacity = 0.55;
                return (
                  <g
                    key={pos.id}
                    style={{ cursor: 'pointer' }}
                    onClick={(e) => { e.stopPropagation(); setSelectedId(isSelected ? null : pos.id); }}
                  >
                    <rect x={x} y={y} width={w} height={h} fill={fill} opacity={opacity} rx={4} />
                    {isSelected && (
                      <rect
                        x={x - 2} y={y - 2} width={w + 4} height={h + 4}
                        fill="none" stroke={fill} strokeWidth={2} rx={5} opacity={0.9}
                      />
                    )}
                    <circle cx={pos.x} cy={pos.y} r={3} fill={fill} opacity={occupied ? 0.9 : 0.5} />
                  </g>
                );
              })}

              {/* Popup foreignObject */}
              {selectedId !== null && (() => {
                const pos = TABLE_POS.find(p => p.id === selectedId)!;
                const session = TABLE_SESSIONS[selectedId];
                const occupied = OCCUPIED_IDS.has(selectedId);
                const th = pos.h ?? 43;
                const popW = 192;
                const popH = occupied ? 122 : 52;
                const rawX = pos.x - popW / 2;
                const px = Math.min(Math.max(rawX, 6), SVG_W - popW - 6);
                const isAbove = pos.y > SVG_H / 2;
                const py = isAbove
                  ? pos.y - th / 2 - popH - 8
                  : pos.y + th / 2 + 8;
                return (
                  <foreignObject key="popup" x={px} y={py} width={popW} height={popH}>
                    <div
                      style={{
                        background: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '10px',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                        padding: '10px 12px',
                        fontSize: '10px',
                        lineHeight: '1.45',
                        fontFamily: 'inherit',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 700, fontSize: '11px', color: '#1a1a1a' }}>
                          Meja #{selectedId}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setSelectedId(null); }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0, lineHeight: 1 }}
                        >
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                          </svg>
                        </button>
                      </div>
                      {occupied && session ? (
                        <>
                          <div style={{ color: '#374151', fontWeight: 600, marginBottom: '2px' }}>{session.name}</div>
                          <div style={{ color: '#9ca3af', marginBottom: '4px' }}>{session.member} · {session.type}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ color: '#6b7280' }}>Masuk {session.checkIn}</span>
                            <span style={{ color: '#4B135F', fontWeight: 700 }}>{session.duration}</span>
                          </div>
                        </>
                      ) : (
                        <div style={{ color: '#16a34a', fontWeight: 600 }}>Tersedia</div>
                      )}
                    </div>
                  </foreignObject>
                );
              })()}
            </svg>
          </div>
        </div>

        {/* Zone Summary + Live Session Ticker */}
        <div className="space-y-4">

          {/* Zone Summary */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <p className="font-semibold text-neutral-800 mb-0.5">Zone Summary</p>
            <p className="text-[10px] text-neutral-400 mb-4">Occupancy per area &#40;mock&#41;</p>
            <div className="space-y-3">
              {ZONE_SUMMARY.map(z => {
                const pct = Math.round((z.occupied / z.total) * 100);
                return (
                  <div key={z.zone}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-neutral-600">{z.zone}</span>
                      <span className="text-xs text-neutral-400">{z.occupied}/{z.total}</span>
                    </div>
                    <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#4B135F] transition-all"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Session Ticker */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <div className="flex items-center justify-between mb-0.5">
              <p className="font-semibold text-neutral-800">Session Ticker</p>
              <span className="text-[9px] font-semibold uppercase tracking-widest text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded">Mock</span>
            </div>
            <p className="text-[10px] text-neutral-400 mb-4">Aktivitas sesi terkini</p>
            <div className="space-y-3">
              {LIVE_TICKER.map((ev) => (
                <div key={`${ev.time}-${ev.table}`} className="flex items-start gap-2">
                  <span
                    className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${
                      ev.action === 'in' ? 'bg-green-400' : 'bg-red-400'
                    }`}
                  ></span>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-neutral-700 truncate">{ev.name}</p>
                    <p className="text-[10px] text-neutral-400">
                      {ev.time} &middot; {ev.action === 'in' ? 'Check-in' : 'Check-out'} M.{ev.table}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── Incident Center + Tech & Maintenance ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_440px] gap-4 items-start">

        {/* Incident Center */}
        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
            Incident Center
          </p>
          <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <p className="font-semibold text-neutral-800">Ghost Booking Alerts</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full table-fixed text-sm">
              <colgroup>
                <col style={{ width: '15%' }} />
                <col style={{ width: '28%' }} />
                <col style={{ width: '32%' }} />
                <col style={{ width: '25%' }} />
              </colgroup>
              <thead>
                <tr className="text-neutral-400 uppercase tracking-wider text-[10px]">
                  <th className="text-left pb-3 font-semibold leading-tight">Table<br />ID</th>
                  <th className="text-left pb-3 font-semibold leading-tight">Detected<br />Status</th>
                  <th className="text-left pb-3 font-semibold leading-tight">Physical<br />Status</th>
                  <th className="text-left pb-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {GHOST_ALERTS.map(row => (
                  <tr key={row.tableId}>
                    <td className="py-4 font-semibold text-neutral-800">{row.tableId}</td>
                    <td className="py-4">
                      <span className="inline-block px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-600 font-medium">
                        {row.detected}
                      </span>
                    </td>
                    <td className="py-4">
                      {row.physicalVariant === 'occupied' ? (
                        <span className="inline-block px-2.5 py-1 rounded-md bg-red-100 text-red-500 font-medium">
                          {row.physical}
                        </span>
                      ) : (
                        <span className="inline-block px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-500">
                          {row.physical}
                        </span>
                      )}
                    </td>
                    <td className="py-4">
                      <button
                        type="button"
                        onClick={() => setConfirmTableId(row.tableId)}
                        className="text-[#4B135F] font-bold hover:underline leading-tight text-left"
                      >
                        Confirm<br />Check
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Link
            href="/admin/anomaly-logs"
            className="mt-4 inline-block text-sm text-neutral-700 font-medium hover:text-neutral-900 transition-colors"
          >
            View Anomaly Logs →
          </Link>
        </div>
        </div>

        {/* Tech & Maintenance */}
        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
            Tech &amp; Maintenance
          </p>
          <div className="grid grid-cols-2 gap-3">

            {/* ESP32 Fleet */}
            <div className="bg-white rounded-xl border border-neutral-200 p-4 flex flex-col justify-between min-h-75">
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-neutral-400" />
                <p className="text-sm font-semibold text-neutral-700">ESP32 Fleet</p>
              </div>
              <div>
                <div className="flex items-baseline gap-2 mb-2">
                  <p className="text-4xl font-bold text-neutral-800">142</p>
                  <p className="text-sm font-semibold text-yellow-700">Online</p>
                </div>
                <div className="h-1 w-full bg-neutral-100 rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-yellow-700 rounded-full" style={{ width: '98%' }}></div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0"></span>
                  <p className="text-xs text-neutral-500">3 Offline</p>
                </div>
              </div>
            </div>

            {/* Power Usage */}
            <div className="bg-white rounded-xl border border-neutral-200 p-4 flex flex-col justify-between min-h-72">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-neutral-400" />
                <p className="text-sm font-semibold text-neutral-700">Power Usage</p>
              </div>
              <div>
                <div className="flex items-baseline gap-1 mb-1">
                  <p className="text-4xl font-bold text-neutral-800">2.4</p>
                  <p className="text-sm text-neutral-500 font-medium">kW/h</p>
                </div>
                <p className="text-xs text-yellow-700">↘ ~12% vs last hr</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── INSIGHT & REPORTING ──────────────────────────── */}
      <section>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-3">
          Insight &amp; Reporting
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-4">

          {/* Occupancy Analytics */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
              <p className="font-semibold text-neutral-800">Occupancy Analytics</p>
              <span className="px-3 py-1 bg-neutral-100 rounded-lg text-xs font-medium text-neutral-500">
                Today
              </span>
            </div>
            <div className="flex items-end gap-2 sm:gap-3 h-36">
              {OCCUPANCY_BARS.map(bar => (
                <div key={bar.label} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t-md transition-all"
                    style={{
                      height: `${(bar.value / maxBar) * 112}px`,
                      backgroundColor: bar.value === maxBar ? '#4B135F' : '#D8CCE8',
                    }}
                  />
                  <span className="text-[10px] text-neutral-400 whitespace-nowrap">{bar.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Area Clustering + Avg Stay Duration */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5 flex flex-col gap-5">
            <div>
              <p className="font-semibold text-neutral-800 mb-4">Area Clustering</p>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-neutral-600">Workstations</span>
                    <span className="font-semibold text-neutral-800">76%</span>
                  </div>
                  <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#4B135F] rounded-full" style={{ width: '76%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-neutral-600">Sofa Lounges</span>
                    <span className="font-semibold text-neutral-800">45%</span>
                  </div>
                  <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#4B135F] rounded-full" style={{ width: '45%' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-neutral-100 pt-4 mt-auto">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-1">
                Avg. Stay Duration
              </p>
              <p className="text-3xl font-bold text-neutral-800">2h 15m</p>
            </div>
          </div>

        </div>
      </section>

      {/* Confirm Check Modal */}
      {confirmTableId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <button
            type="button"
            aria-label="Tutup dialog"
            className="absolute inset-0 bg-black/30 cursor-default"
            onClick={() => setConfirmTableId(null)}
          />
          <dialog
            open
            aria-labelledby="confirm-title-dash"
            className="relative z-10 bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-7 m-0 border-0"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="shrink-0 w-11 h-11 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
              <h2 id="confirm-title-dash" className="text-lg font-bold text-neutral-900 leading-snug">
                Verifikasi Kehadiran Fisik (Ghost Booking Alert)
              </h2>
            </div>
            <p className="text-sm text-neutral-600 mb-7 leading-relaxed">
              Sistem mendeteksi adanya anomali pada Meja {confirmTableId}. Apakah pelanggan benar-benar tidak ada di lokasi atau sensor ultrasonik tidak berfungsi dengan baik?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setConfirmTableId(null)}
                className="px-5 py-2.5 rounded-lg border border-neutral-300 text-neutral-700 text-sm font-semibold hover:bg-neutral-50 transition-colors"
              >
                Batalkan
              </button>
              <button
                type="button"
                onClick={() => setConfirmTableId(null)}
                className="px-5 py-2.5 rounded-lg bg-[#4B135F] text-white text-sm font-semibold hover:bg-[#3a0f4a] transition-colors"
              >
                Konfirmasi &amp; Kosongkan Meja
              </button>
            </div>
          </dialog>
        </div>
      )}

    </div>
  );
}
