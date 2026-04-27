'use client';

import { useRouter } from 'next/navigation';
import { useState, useCallback, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  Unlink,
  RotateCcw,
  MonitorSmartphone,
  Info,
  ShieldAlert,
  X,
  AlertTriangle,
  UserCheck,
  Clock,
  Zap,
  Wifi,
  WifiOff,
  MoreVertical,
  XCircle,
  CheckCircle,
  RefreshCw,
  Radio,
} from 'lucide-react';
import { TABLE_POSITIONS } from '@/data/tables';

/* ─── Types ───────────────────────────────────────────── */
type TableStatus = 'occupied' | 'available';

interface TableData {
  id: number;
  status: TableStatus;
  /* session / member */
  cardId?: string;
  memberId?: string;
  memberName?: string;
  memberType?: string;
  /* sofa info */
  zone?: string;
  asset?: string;
  sofaName?: string;
  sofaDesc?: string;
  /* session timing */
  sessionStart?: string;
  duration?: string;
  /* sensor / hardware */
  sensorId?: string;
  powerUsage?: string;
  signalDbm?: number;
  /* flags */
  hasGhostAlert?: boolean;
  /* staff note */
  internalNote?: string;
}

/* ─── Mock session data ────────────────────────────────── */
const INITIAL_TABLES: TableData[] = [
  {
    id: 1, status: 'occupied',
    cardId: '05', memberId: 'MEM-1021', memberName: 'Raka S.', memberType: 'Premium Member',
    zone: 'Zone A', asset: '#0021', sofaName: 'Sofa Area A-01',
    sofaDesc: 'Premium 4-seater with integrated wireless charging and ambient lighting.',
    sessionStart: '08:30 AM', duration: '2h 15m',
    sensorId: 'BLE-ATRIUM-A1-L', powerUsage: '14.2W (Charging)',
    signalDbm: -58, hasGhostAlert: false,
    internalNote: '"Requested extra cushion at check-in." — Staff',
  },
  {
    id: 2, status: 'occupied',
    cardId: '12', memberId: 'MEM-0874', memberName: 'Dian P.', memberType: 'Guest',
    zone: 'Zone A', asset: '#0022', sofaName: 'Sofa Area A-02',
    sofaDesc: 'Compact 2-seater near the window with natural light access.',
    sessionStart: '10:00 AM', duration: '0h 45m',
    sensorId: 'BLE-ATRIUM-A2-R', powerUsage: '5.1W (Idle)',
    signalDbm: -71, hasGhostAlert: false,
  },
  { id: 3,  status: 'available' },
  {
    id: 4, status: 'occupied',
    cardId: '42', memberId: 'MEM-0310', memberName: 'Toni W.', memberType: 'Guest',
    zone: 'Zone A', asset: '#0024', sofaName: 'Sofa Area A-04',
    sofaDesc: 'Corner sofa with high backrest, suitable for focused work.',
    sessionStart: '10:15 AM', duration: '0h 45m',
    sensorId: 'BLE-ATRIUM-A4-L', powerUsage: '8.9W (Charging)',
    signalDbm: -64, hasGhostAlert: true,
    internalNote: '"Member Toni mentioned he might step out for a quick call. Keep eye on ghosting." — Sarah (Floor Lead)',
  },
  { id: 5, status: 'available' },
  {
    id: 6, status: 'occupied',
    cardId: '07', memberId: 'MEM-2201', memberName: 'Lina H.', memberType: 'Regular Member',
    zone: 'Zone A', asset: '#0026', sofaName: 'Sofa Area A-06',
    sofaDesc: 'Sofa with USB-A & USB-C ports, perfect for long sessions.',
    sessionStart: '09:45 AM', duration: '1h 10m',
    sensorId: 'BLE-ATRIUM-A6-C', powerUsage: '11.3W (Charging)',
    signalDbm: -55, hasGhostAlert: false,
  },
  { id: 7, status: 'available' },
  { id: 8, status: 'available' },
  {
    id: 9, status: 'occupied',
    cardId: '21', memberId: 'MEM-0045', memberName: 'Budi A.', memberType: 'Guest',
    zone: 'Zone B', asset: '#0029', sofaName: 'Sofa Area B-01',
    sofaDesc: 'Single-seat pod with privacy panel and quiet zone rating.',
    sessionStart: '10:30 AM', duration: '0h 30m',
    sensorId: 'BLE-ATRIUM-B1-L', powerUsage: '3.5W (Idle)',
    signalDbm: -78, hasGhostAlert: false,
  },
  {
    id: 10, status: 'occupied',
    cardId: '33', memberId: 'MEM-4412', memberName: 'Sari N.', memberType: 'Premium Member',
    zone: 'Zone B', asset: '#0030', sofaName: 'Sofa Area B-02',
    sofaDesc: 'Premium velvet sectional with wireless charging and noise-dampening upholstery.',
    sessionStart: '08:00 AM', duration: '3h 00m',
    sensorId: 'BLE-ATRIUM-B2-R', powerUsage: '16.0W (Charging)',
    signalDbm: -49, hasGhostAlert: false,
    internalNote: '"Long session member — prefers cold brew at 2h mark." — Staff',
  },
  { id: 11, status: 'available' },
  {
    id: 12, status: 'occupied',
    cardId: '18', memberId: 'MEM-1803', memberName: 'Yoga K.', memberType: 'Regular Member',
    zone: 'Zone B', asset: '#0032', sofaName: 'Sofa Area B-04',
    sofaDesc: 'Premium velvet sectional with integrated wireless charging and noise-dampening upholstery.',
    sessionStart: '09:14 AM', duration: '1h 55m',
    sensorId: 'BLE-ATRIUM-B4-L', powerUsage: '12.4W (Charging)',
    signalDbm: -64, hasGhostAlert: true,
    internalNote: '"Member Yoga mentioned he might step out for a quick call. Keep eye on ghosting." — Sarah (Floor Lead)',
  },
  { id: 13, status: 'available' },
  {
    id: 14, status: 'occupied',
    cardId: '09', memberId: 'MEM-0092', memberName: 'Adi R.', memberType: 'Guest',
    zone: 'Zone B', asset: '#0034', sofaName: 'Sofa Area B-06',
    sofaDesc: 'Compact loveseat near the counter, great for quick sessions.',
    sessionStart: '10:45 AM', duration: '0h 20m',
    sensorId: 'BLE-ATRIUM-B6-C', powerUsage: '0W (No device)',
    signalDbm: -82, hasGhostAlert: false,
  },
  { id: 15, status: 'available' },
  {
    id: 16, status: 'occupied',
    cardId: '11', memberId: 'MEM-3309', memberName: 'Maya L.', memberType: 'Premium Member',
    zone: 'Zone C', asset: '#0036', sofaName: 'Sofa Area C-01',
    sofaDesc: 'Executive single sofa with ergonomic armrests and power hub.',
    sessionStart: '08:15 AM', duration: '2h 40m',
    sensorId: 'BLE-ATRIUM-C1-L', powerUsage: '18.5W (Charging)',
    signalDbm: -52, hasGhostAlert: false,
  },
  { id: 17, status: 'available' },
  { id: 18, status: 'available' },
  {
    id: 19, status: 'occupied',
    cardId: '25', memberId: 'MEM-0741', memberName: 'Rizal F.', memberType: 'Guest',
    zone: 'Zone C', asset: '#0039', sofaName: 'Sofa Area C-04',
    sofaDesc: 'Standard sofa with USB port, near the cooling vent.',
    sessionStart: '10:05 AM', duration: '0h 55m',
    sensorId: 'BLE-ATRIUM-C4-R', powerUsage: '6.8W (Idle)',
    signalDbm: -69, hasGhostAlert: false,
  },
  { id: 20, status: 'available' },
  {
    id: 21, status: 'occupied',
    cardId: '30', memberId: 'MEM-2258', memberName: 'Desti A.', memberType: 'Regular Member',
    zone: 'Zone C', asset: '#0041', sofaName: 'Sofa Area C-06',
    sofaDesc: 'Mid-range sofa with side table and reading lamp.',
    sessionStart: '09:30 AM', duration: '1h 30m',
    sensorId: 'BLE-ATRIUM-C6-C', powerUsage: '9.2W (Charging)',
    signalDbm: -61, hasGhostAlert: false,
  },
  {
    id: 22, status: 'occupied',
    cardId: '14', memberId: 'MEM-0583', memberName: 'Hendra B.', memberType: 'Guest',
    zone: 'Zone D', asset: '#0042', sofaName: 'Sofa Area D-01',
    sofaDesc: 'Open-plan sofa cluster, ideal for small group work.',
    sessionStart: '10:20 AM', duration: '0h 40m',
    sensorId: 'BLE-ATRIUM-D1-L', powerUsage: '4.0W (Idle)',
    signalDbm: -74, hasGhostAlert: false,
  },
  { id: 23, status: 'available' },
  {
    id: 24, status: 'occupied',
    cardId: '16', memberId: 'MEM-5284', memberName: 'Julian R.', memberType: 'Premium Member',
    zone: 'Zone D', asset: '#0044', sofaName: 'Sofa Area D-03',
    sofaDesc: 'Premium velvet sectional with integrated wireless charging and noise-dampening upholstery.',
    sessionStart: '08:55 AM', duration: '2h 05m',
    sensorId: 'BLE-ATRIUM-D3-R', powerUsage: '13.7W (Charging)',
    signalDbm: -60, hasGhostAlert: true,
    internalNote: '"Member Julian mentioned he might step out for a quick call. Keep eye on ghosting." — Sarah (Floor Lead)',
  },
  { id: 25, status: 'available' },
  {
    id: 26, status: 'occupied',
    cardId: '19', memberId: 'MEM-0113', memberName: 'Nisa W.', memberType: 'Guest',
    zone: 'Zone D', asset: '#0046', sofaName: 'Sofa Area D-05',
    sofaDesc: 'Lightweight sofa near the entrance, suitable for short stays.',
    sessionStart: '10:50 AM', duration: '0h 15m',
    sensorId: 'BLE-ATRIUM-D5-C', powerUsage: '0W (No device)',
    signalDbm: -88, hasGhostAlert: false,
  },
  { id: 27, status: 'available' },
  {
    id: 28, status: 'occupied',
    cardId: '27', memberId: 'MEM-1667', memberName: 'Bagas P.', memberType: 'Regular Member',
    zone: 'Zone D', asset: '#0048', sofaName: 'Sofa Area D-07',
    sofaDesc: 'Sofa with footrest and dual USB-C, good for laptop work.',
    sessionStart: '09:15 AM', duration: '1h 45m',
    sensorId: 'BLE-ATRIUM-D7-L', powerUsage: '15.1W (Charging)',
    signalDbm: -55, hasGhostAlert: false,
  },
  { id: 29, status: 'available' },
  {
    id: 30, status: 'occupied',
    cardId: '31', memberId: 'MEM-0397', memberName: 'Clara M.', memberType: 'Guest',
    zone: 'Zone D', asset: '#0050', sofaName: 'Sofa Area D-09',
    sofaDesc: 'Standard sofa with shared armrest table.',
    sessionStart: '10:25 AM', duration: '0h 35m',
    sensorId: 'BLE-ATRIUM-D9-R', powerUsage: '2.2W (Idle)',
    signalDbm: -77, hasGhostAlert: false,
  },
  { id: 31, status: 'available' },
  {
    id: 32, status: 'occupied',
    cardId: '36', memberId: 'MEM-6001', memberName: 'Farhan D.', memberType: 'Premium Member',
    zone: 'Zone D', asset: '#0052', sofaName: 'Sofa Area D-11',
    sofaDesc: 'Premium corner sofa with panoramic window view and fast charger.',
    sessionStart: '08:00 AM', duration: '2h 50m',
    sensorId: 'BLE-ATRIUM-D11-C', powerUsage: '19.8W (Charging)',
    signalDbm: -47, hasGhostAlert: false,
    internalNote: '"VIP member — reserve preferred seat for next visit." — Manager',
  },
];

const SVG_W = 609, SVG_H = 483;

/* ─── Signal bar helper ─────────────────────────────────── */
function SignalBars({ dbm }: { readonly dbm: number }) {
  /* -40 to -60 = strong (4), -61 to -70 = good (3), -71 to -80 = fair (2), <-80 = weak (1) */
  let bars = 1;
  if (dbm >= -60) bars = 4;
  else if (dbm >= -70) bars = 3;
  else if (dbm >= -80) bars = 2;

  return (
    <div className="flex items-end gap-0.5">
      {[1, 2, 3, 4].map(b => (
        <span
          key={b}
          className={`block w-1.5 rounded-sm ${b <= bars ? 'bg-white' : 'bg-white/25'}`}
          style={{ height: `${b * 4}px` }}
        />
      ))}
    </div>
  );
}

/* ─── Table Detail Modal ────────────────────────────────── */
function TableModal({
  table,
  onClose,
  onUnpair,
  onVerify,
}: {
  readonly table: TableData;
  readonly onClose: () => void;
  readonly onUnpair: (t: TableData) => void;
  readonly onVerify: (t: TableData) => void;
}) {
  const signalOk = (table.signalDbm ?? -100) >= -80;
  let memberBadgeClass = 'bg-neutral-100 text-neutral-600';
  if (table.memberType === 'Premium Member') memberBadgeClass = 'bg-[#EDE9F5] text-[#4B135F]';
  else if (table.memberType === 'Regular Member') memberBadgeClass = 'bg-blue-50 text-blue-700';

  return (
    /* Backdrop + flex positioner */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.45)' }}
    >
      {/* Invisible button covering the backdrop for click-to-close */}
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        aria-label="Close dialog"
      />
      {/* Modal panel */}
      <dialog
        aria-label="Table session details"
        open
        className="relative w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col sm:flex-row p-0 border-0 bg-transparent"
      >
        {/* ── LEFT: Sofa info (dark purple) ─────────────── */}
        <div className="bg-[#4B135F] text-white p-6 sm:w-56 shrink-0 flex flex-col gap-5">
          {/* Zone + Asset badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded bg-white/15 text-[10px] font-bold uppercase tracking-widest">
              {table.zone ?? 'Zone A'}
            </span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-semibold uppercase tracking-widest text-white/70">
              Asset {table.asset ?? '#0000'}
            </span>
          </div>

          {/* Sofa name + desc */}
          <div>
            <h2 className="text-xl font-bold leading-tight">{table.sofaName ?? `Sofa #${table.id}`}</h2>
            <p className="text-xs text-white/65 mt-2 leading-relaxed">{table.sofaDesc ?? 'Sofa seat.'}</p>
          </div>

          {/* Status */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-white/50 font-semibold mb-2">Status</p>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 shrink-0" />
              <span className="text-sm font-semibold">Occupied</span>
            </div>
            <p className="text-xs text-white/60 mt-1">ID: {table.memberId ?? '—'} ({table.memberName ?? '—'})</p>
          </div>

          {/* Ghost Booking Alert */}
          {table.hasGhostAlert && (
            <div className="bg-red-500/20 border border-red-400/40 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <AlertTriangle className="w-3.5 h-3.5 text-red-300 shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-red-300">Ghost Booking Alert</span>
              </div>
              <p className="text-[10px] text-red-200/80 leading-relaxed">
                Card inactive for 30+ min. Occupancy sensor may have detected an idle session.
              </p>
            </div>
          )}

          {/* Signal Strength — pushed to bottom */}
          <div className="mt-auto flex items-center justify-between pt-3 border-t border-white/10">
            <span className="text-[10px] text-white/50">Signal Strength</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold">{table.signalDbm} dBm</span>
              {signalOk
                ? <SignalBars dbm={table.signalDbm ?? -100} />
                : <WifiOff className="w-3.5 h-3.5 text-red-300" />
              }
            </div>
          </div>
        </div>

        {/* ── RIGHT: Session details (white) ────────────── */}
        <div className="bg-white flex-1 p-6 flex flex-col gap-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Table Details</p>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-400 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 2×2 metadata grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-semibold mb-0.5">Session Start</p>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <p className="text-sm font-semibold text-neutral-800">{table.sessionStart ?? '—'}</p>
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-semibold mb-0.5">Current Duration</p>
              <p className="text-xl font-bold text-[#4B135F]">{table.duration ?? '—'}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-semibold mb-0.5">Sensor ID</p>
              <div className="flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <p className="text-xs font-mono text-neutral-700">{table.sensorId ?? '—'}</p>
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-semibold mb-0.5">Power Usage</p>
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <p className="text-xs font-semibold text-neutral-700">{table.powerUsage ?? '—'}</p>
              </div>
            </div>
          </div>

          {/* Internal Note */}
          {table.internalNote && (
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3">
              <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-semibold mb-1.5">Internal Note</p>
              <p className="text-xs text-neutral-600 italic leading-relaxed">{table.internalNote}</p>
            </div>
          )}

          {/* Member type badge */}
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${memberBadgeClass}`}>
              {table.memberType ?? 'Guest'}
            </span>
            <span className="text-xs text-neutral-400">{table.memberName}</span>
          </div>

          {/* Action buttons — pushed to bottom */}
          <div className="mt-auto space-y-2.5">
            <button
              onClick={() => onVerify(table)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#4B135F] text-white text-sm font-semibold hover:bg-[#3a0f49] transition-colors"
            >
              <UserCheck className="w-4 h-4" />
              Verify Physical Presence
            </button>
            <button
              onClick={() => onUnpair(table)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-100 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Card Session
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}

/* ─── Main page ───────────────────────────────────────── */
export default function UnpairingPage() {
  const router = useRouter();
  const [tables, setTables]       = useState<TableData[]>(INITIAL_TABLES);
  const [selected, setSelected]   = useState<TableData | null>(null);
  const [toast, setToast]         = useState<string | null>(null);
  const [zoom, setZoom]           = useState(1);
  const [pan, setPan]             = useState({ x: 0, y: 0 });
  const [openMenu, setOpenMenu]   = useState<number | null>(null);
  const dragRef      = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(null);
  const isDragging   = useRef(false);
  const sessionListRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);

  /* ── Close session dropdown on outside click ─────── */
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (sessionListRef.current && !sessionListRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  /* ── toast helper ─────────────────────────────────── */
  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  /* ── zoom/pan helpers ─────────────────────────────── */
  const vw = SVG_W / zoom;
  const vh = SVG_H / zoom;
  const vx = (SVG_W - vw) / 2 + pan.x;
  const vy = (SVG_H - vh) / 2 + pan.y;

  const clampPan = useCallback((x: number, y: number, z: number) => {
    const vwz = SVG_W / z, vhz = SVG_H / z;
    const maxX = (SVG_W - vwz) / 2, maxY = (SVG_H - vhz) / 2;
    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y)),
    };
  }, []);

  const zoomIn    = () => setZoom(z => Math.min(+(z + 0.25).toFixed(2), 3));
  const zoomOut   = () => setZoom(z => { const nz = Math.max(+(z - 0.25).toFixed(2), 0.5); setPan(p => clampPan(p.x, p.y, nz)); return nz; });
  const resetZoom = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(z => {
      const delta = e.deltaY < 0 ? 0.15 : -0.15;
      return Math.min(3, Math.max(0.5, +(z + delta).toFixed(2)));
    });
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoom <= 1) return;
    isDragging.current = false;
    dragRef.current = { startX: e.clientX, startY: e.clientY, panX: pan.x, panY: pan.y };
    setIsPanning(true);
  }, [zoom, pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) isDragging.current = true;
    const svgEl = e.currentTarget as HTMLElement;
    const scaleX = vw / svgEl.clientWidth;
    const scaleY = vh / (svgEl.clientHeight || svgEl.clientWidth * (SVG_H / SVG_W));
    setPan(clampPan(dragRef.current.panX - dx * scaleX, dragRef.current.panY - dy * scaleY, zoom));
  }, [vw, vh, zoom, clampPan]);

  const handleMouseUp = useCallback(() => { dragRef.current = null; setIsPanning(false); }, []);

  /* ── actions ──────────────────────────────────────── */
  function handleUnpair(table: TableData) {
    setTables(prev =>
      prev.map(t => t.id === table.id ? { id: t.id, status: 'available' } : t)
    );
    const sofaLabel = table.sofaName ?? `Table ${table.id}`;
    showToast(`Card #${table.cardId} berhasil di-unpair dari ${sofaLabel}.`);
    setSelected(null);
  }

  function handleVerify(table: TableData) {
    const sofaLabel = table.sofaName ?? `Table ${table.id}`;
    showToast(`Verifikasi kehadiran fisik dikirim untuk ${sofaLabel}.`);
    setSelected(null);
  }

  function handleForceCheckout(id: number) {
    setTables(prev => prev.map(t => t.id === id ? { id: t.id, status: 'available' } : t));
    if (selected?.id === id) setSelected(null);
    setOpenMenu(null);
    const t = tables.find(tb => tb.id === id);
    showToast(`Sesi Card #${t?.cardId ?? '??'} berhasil di-checkout paksa.`);
  }

  function handleMarkFaulty(id: number) {
    setOpenMenu(null);
    const t = tables.find(tb => tb.id === id);
    const label = t?.sofaName ?? ('Table ' + String(id));
    showToast(`${label} ditandai Rusak — status diperbarui.`);
  }

  function handleReboot(id: number) {
    setOpenMenu(null);
    const t = tables.find(tb => tb.id === id);
    const label = t?.sofaName ?? ('Table ' + String(id));
    showToast(`Perintah reboot dikirim ke ${label}.`);
  }

  function handleVerifyById(id: number) {
    const t = tables.find(tb => tb.id === id);
    if (!t) return;
    setOpenMenu(null);
    handleVerify(t);
  }

  function handleBulkUnpair() {
    setTables(prev => prev.map(t => ({ id: t.id, status: 'available' as TableStatus })));
    showToast('Semua kartu berhasil di-unpair (Bulk).');
    setSelected(null);
  }

  function handleReset() {
    setTables(INITIAL_TABLES);
    setSelected(null);
    showToast('Data direset.');
  }

  const activeCount = tables.filter(t => t.status === 'occupied').length;
  const availCount  = tables.filter(t => t.status === 'available').length;

  /* Fast lookup: tableId → TableData */
  const tableMap = Object.fromEntries(tables.map(t => [t.id, t]));

  /* Cursor: derive from state, not ref */
  let mapCursor = 'default';
  if (zoom > 1) mapCursor = isPanning ? 'grabbing' : 'grab';

  return (
    <div className="space-y-5">

      {/* ── Back nav ── */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-xs text-neutral-500 hover:text-[#4B135F] transition-colors uppercase tracking-wide font-medium"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Kembali ke Halaman Utama
      </button>

      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs text-neutral-400 uppercase tracking-widest font-medium mb-1">
            RFID &amp; Membership Hub
          </p>
          <h1 className="text-3xl font-bold text-neutral-800">Manual Unpairing Map View</h1>
          <p className="text-sm text-neutral-500 mt-1 max-w-lg">
            Identify and select tables for session unpairing. Tap a highlighted table to begin the manual override process.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-300 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Filters
          </button>
          <button
            onClick={handleBulkUnpair}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#4B135F] text-white text-sm font-medium hover:bg-[#3a0f49] transition-colors"
          >
            <Unlink className="w-3.5 h-3.5" />
            Bulk Unpair
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_260px] gap-5">

        {/* ── Floor plan card ── */}
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">

          {/* Toolbar */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-100">
            <div className="flex items-center gap-2 text-sm font-semibold text-neutral-800">
              <MonitorSmartphone className="w-4 h-4 text-neutral-400" />
              Atrium Floor Plan
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 text-xs text-neutral-500">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span>Occupied</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-neutral-300" />
                  <span>Available</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={zoomIn}    className="p-1.5 rounded-md hover:bg-neutral-100 text-neutral-400 transition-colors" aria-label="Zoom in"><ZoomIn  className="w-4 h-4" /></button>
                <button onClick={zoomOut}   className="p-1.5 rounded-md hover:bg-neutral-100 text-neutral-400 transition-colors" aria-label="Zoom out"><ZoomOut className="w-4 h-4" /></button>
                <button onClick={resetZoom} className="p-1.5 rounded-md hover:bg-neutral-100 text-neutral-500 text-xs font-semibold transition-colors px-1" aria-label="Reset zoom">1:1</button>
              </div>
            </div>
          </div>

          {/* SVG floor plan */}
          <div className="relative overflow-hidden bg-neutral-50">
            <svg
              viewBox={`${vx} ${vy} ${vw} ${vh}`}
              className="w-full"
              role="application"
              aria-label="Floor plan, draggable when zoomed"
              tabIndex={0}
              style={{ display: 'block', touchAction: 'none', cursor: mapCursor, outline: 'none' }}
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <image href="/Frame 112.svg" x="0" y="0" width={SVG_W} height={SVG_H} />

              {Object.entries(TABLE_POSITIONS).map(([idStr, pos]) => {
                const id     = Number(idStr);
                const table  = tableMap[id];
                if (!table) return null;

                const isOccupied = table.status === 'occupied';
                const isSelected = selected?.id === id;
                const w = pos.w ?? 63, h = pos.h ?? 43;
                const x = pos.x - w / 2, y = pos.y - h / 2;

                let fill = '#d1d5db';
                if (isSelected) fill = '#4B135F';
                else if (isOccupied) fill = '#ef4444';

                let opacity = 0.2;
                if (isSelected) opacity = 0.75;
                else if (isOccupied) opacity = 0.5;

                let dotOpacity = 0.45;
                if (isSelected) dotOpacity = 1;
                else if (isOccupied) dotOpacity = 0.9;

                return (
                  <g
                    key={id}
                    style={{ cursor: isOccupied ? 'pointer' : 'default' }}
                    onClick={() => {
                      if (isDragging.current) return;
                      if (!isOccupied) return;
                      setSelected(isSelected ? null : table);
                    }}
                  >
                    <rect x={x} y={y} width={w} height={h} fill={fill} opacity={opacity} rx={4} />

                    {isSelected && (
                      <rect x={x - 2} y={y - 2} width={w + 4} height={h + 4}
                        fill="none" stroke="#4B135F" strokeWidth={2.5} rx={5}
                      />
                    )}

                    {isOccupied && !isSelected && (
                      <circle cx={pos.x} cy={pos.y} r={5} fill="#ef4444" opacity={0}>
                        <animate attributeName="r"       values="5;13;5"    dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
                      </circle>
                    )}

                    <circle cx={pos.x} cy={pos.y} r={3.5} fill={fill} stroke="white" strokeWidth={1.5} opacity={dotOpacity} />
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* ── Right sidebar ── */}
        <div className="space-y-4">

          {/* Hub Overview */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">Hub Overview</p>
              <span className="w-2 h-2 rounded-full bg-green-400" />
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-3xl font-bold text-neutral-800">{activeCount}</p>
                <p className="text-xs text-neutral-400 uppercase tracking-wide mt-0.5">Active Pairings</p>
              </div>
              <div className="border-t border-neutral-100 pt-3">
                <p className="text-3xl font-bold text-neutral-300">{availCount}</p>
                <p className="text-xs text-neutral-400 uppercase tracking-wide mt-0.5">Available Desks</p>
              </div>
            </div>
          </div>

          {/* Active Sessions list with 3-dot actions */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-visible" ref={sessionListRef}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">Active Sessions</p>
              <span className="px-2 py-0.5 rounded-full bg-[#EDE9F5] text-[#4B135F] text-xs font-bold">{activeCount}</span>
            </div>
            <div className="divide-y divide-neutral-100">
              {tables.filter(t => t.status === 'occupied').length === 0 ? (
                <p className="px-4 py-5 text-center text-xs text-neutral-400">Tidak ada sesi aktif.</p>
              ) : (
                tables.filter(t => t.status === 'occupied').map(t => (
                  <div key={t.id} className="flex items-center gap-2.5 px-3 py-3">
                    {/* Icon */}
                    <div className="w-7 h-7 rounded-lg bg-[#EDE9F5] flex items-center justify-center shrink-0">
                      <Radio className="w-3.5 h-3.5 text-[#4B135F]" />
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-neutral-800 truncate">
                        {t.sofaName ?? ('Table ' + String(t.id))}
                      </p>
                      <p className="text-[10px] text-neutral-400 mt-0.5 truncate">
                        Card #{t.cardId} · {t.duration ?? '--'}
                      </p>
                    </div>
                    {/* 3-dot dropdown */}
                    <div className="relative shrink-0">
                      <button
                        type="button"
                        onClick={() => setOpenMenu(openMenu === t.id ? null : t.id)}
                        className="p-1 rounded-md hover:bg-neutral-100 transition-colors text-neutral-400"
                        aria-label="Aksi sesi"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>
                      {openMenu === t.id && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-neutral-200 rounded-xl shadow-xl z-40 py-1 overflow-hidden">
                          <button
                            type="button"
                            onClick={() => handleForceCheckout(t.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5 shrink-0" />
                            Paksa Check-out
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMarkFaulty(t.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-neutral-700 hover:bg-neutral-50 transition-colors"
                          >
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                            Labeli Tabel Rusak
                          </button>
                          <button
                            type="button"
                            onClick={() => handleVerifyById(t.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-neutral-700 hover:bg-neutral-50 transition-colors"
                          >
                            <CheckCircle className="w-3.5 h-3.5 shrink-0 text-green-500" />
                            Verifikasi Kehadiran
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReboot(t.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-neutral-700 hover:bg-neutral-50 transition-colors"
                          >
                            <RefreshCw className="w-3.5 h-3.5 shrink-0 text-blue-500" />
                            Reboot Device
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Select a Table prompt */}
          <div className="bg-[#4B135F] rounded-2xl p-5 text-white text-center">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3">
              <Unlink className="w-5 h-5 text-white" />
            </div>
            <p className="font-semibold text-base">Select a Table</p>
            <p className="text-xs text-white/70 mt-1.5 leading-relaxed">
              Click on any occupied table on the floor plan to view session details and manual unpairing options.
            </p>
          </div>

          {/* System Guide */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3">System Guide</p>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                <p className="text-xs text-neutral-600">
                  Manual unpairing overrides the RFID hardware lock immediately.
                </p>
              </li>
              <li className="flex items-start gap-2.5">
                <Info className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                <p className="text-xs text-neutral-600">
                  All manual unpairs are logged for security auditing.
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── Table Detail Modal ── */}
      {selected && (
        <TableModal
          table={selected}
          onClose={() => setSelected(null)}
          onUnpair={handleUnpair}
          onVerify={handleVerify}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-neutral-800 text-white text-sm px-5 py-2.5 rounded-xl shadow-xl z-50 whitespace-nowrap">
          {toast}
        </div>
      )}
    </div>
  );
}





