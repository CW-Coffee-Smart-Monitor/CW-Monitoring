'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Radio,
  MoreVertical,
  XCircle,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react';

/* ─── Types ─────────────────────────────────────────────── */
type SessionStatus = 'UPSELL_READY' | 'GHOST' | null;

interface ActiveSession {
  id: number;
  cardId: string;
  tableName: string;
  memberType: string;
  zone: string;
  duration: string;
  sessionStatus: SessionStatus;
}

/* ─── Mock Data ──────────────────────────────────────────── */
const INITIAL_SESSIONS: ActiveSession[] = [
  { id: 1,  cardId: '05', tableName: 'Table 12', memberType: 'Premium Member', zone: 'Walk-in',      duration: '2h 15m', sessionStatus: 'UPSELL_READY' },
  { id: 2,  cardId: '09', tableName: 'Table 07', memberType: 'Guest',          zone: 'Espresso Bar', duration: '0h 45m', sessionStatus: null           },
  { id: 3,  cardId: '11', tableName: 'Table 15', memberType: 'Guest',          zone: 'Window Seat',  duration: '1h 20m', sessionStatus: 'GHOST'        },
  { id: 4,  cardId: '15', tableName: 'Table 22', memberType: 'Premium Member', zone: 'AC Section',   duration: '3h 02m', sessionStatus: 'UPSELL_READY' },
  { id: 5,  cardId: '42', tableName: 'Table 04', memberType: 'Guest',          zone: 'Espresso Bar', duration: '0h 45m', sessionStatus: null           },
  { id: 6,  cardId: '42', tableName: 'Table 04', memberType: 'Guest',          zone: 'Espresso Bar', duration: '0h 45m', sessionStatus: null           },
  { id: 7,  cardId: '42', tableName: 'Table 04', memberType: 'Guest',          zone: 'Espresso Bar', duration: '0h 45m', sessionStatus: null           },
  { id: 8,  cardId: '42', tableName: 'Table 04', memberType: 'Guest',          zone: 'Espresso Bar', duration: '0h 45m', sessionStatus: null           },
  { id: 9,  cardId: '42', tableName: 'Table 04', memberType: 'Guest',          zone: 'Espresso Bar', duration: '0h 45m', sessionStatus: null           },
  { id: 10, cardId: '42', tableName: 'Table 04', memberType: 'Guest',          zone: 'Espresso Bar', duration: '0h 45m', sessionStatus: null           },
  { id: 11, cardId: '42', tableName: 'Table 04', memberType: 'Guest',          zone: 'Espresso Bar', duration: '0h 45m', sessionStatus: null           },
];

/* ─── Badge Component ────────────────────────────────────── */
function SessionBadge({ status }: { readonly status: SessionStatus }) {
  if (!status) return null;
  if (status === 'UPSELL_READY') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F5E9C8] text-[#7D5A1B] whitespace-nowrap border border-[#E8D49A]">
        UPSELL READY
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-yellow-400 text-yellow-900 whitespace-nowrap">
      GHOST
    </span>
  );
}

/* ─── Main Page ──────────────────────────────────────────── */
export default function ActiveSessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<ActiveSession[]>(INITIAL_SESSIONS);
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const menuContainerRef = useRef<HTMLDivElement>(null);

  /* Close dropdown on outside click */
  const handleOutsideClick = useCallback((e: MouseEvent) => {
    if (menuContainerRef.current && !menuContainerRef.current.contains(e.target as Node)) {
      setOpenMenu(null);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [handleOutsideClick]);

  /* ── Actions ─────────────────────────────────────────── */
  function handleForceCheckout(id: number, cardId: string) {
    setSessions(prev => prev.filter(s => s.id !== id));
    setOpenMenu(null);
    // eslint-disable-next-line no-console
    console.info(`[Force Checkout] Card #${cardId}`);
  }

  function handleMarkFaulty(id: number, tableName: string) {
    setOpenMenu(null);
    // eslint-disable-next-line no-console
    console.info(`[Mark Faulty] ${tableName} — session ${id}`);
  }

  function handleVerify(id: number) {
    setOpenMenu(null);
    // eslint-disable-next-line no-console
    console.info(`[Verify Presence] Session ${id}`);
  }

  function handleReboot(id: number) {
    setOpenMenu(null);
    // eslint-disable-next-line no-console
    console.info(`[Reboot Device] Session ${id}`);
  }

  return (
    <div className="space-y-6">

      {/* ── Back button ────────────────────────────────── */}
      <button
        type="button"
        onClick={() => router.push('/admin/rfid')}
        className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembal ke halaman utama
      </button>

      {/* ── Page Header ────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">RFID &amp; Membership Hub</h1>
          <p className="text-neutral-500 text-sm mt-1">Manage physical cards, active sessions, and inventory</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-neutral-500 bg-white border border-neutral-200 rounded-lg px-3 py-1.5 shrink-0">
          <span className="w-2 h-2 rounded-full bg-neutral-400 block" aria-hidden="true" />
          <span>Waiting for Tap...</span>
        </div>
      </div>

      {/* ── Active Session Monitor card ─────────────────── */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-visible">

        {/* Card header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <h2 className="font-semibold text-neutral-800">Active Session Monitor</h2>
          <span className="px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-500 text-xs font-medium tracking-wide">
            LIVE FEED
          </span>
        </div>

        {/* Session list */}
        <div className="p-4 space-y-3" ref={menuContainerRef}>
          {sessions.length === 0 ? (
            <div className="py-10 text-center text-neutral-400 text-sm">
              Tidak ada sesi kartu yang aktif.
            </div>
          ) : (
            sessions.map(session => (
              <div
                key={session.id}
                className="relative bg-neutral-50 rounded-xl border border-neutral-200 px-4 py-3.5 flex items-center gap-3"
              >
                {/* Left accent bar for notable sessions */}
                {session.sessionStatus && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-[#4B135F] rounded-full" />
                )}

                {/* Card icon */}
                <div className="w-9 h-9 rounded-lg bg-[#EDE9F5] flex items-center justify-center shrink-0 ml-1">
                  <Radio className="w-4 h-4 text-[#4B135F]" />
                </div>

                {/* Session info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-neutral-800">
                    Card #{session.cardId}{' '}
                    <span className="text-neutral-400 font-normal">→</span>{' '}
                    {session.tableName}
                  </p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {session.memberType} · {session.zone}
                  </p>
                </div>

                {/* Status badge */}
                <div className="shrink-0">
                  <SessionBadge status={session.sessionStatus} />
                </div>

                {/* Duration */}
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-[#4B135F]">{session.duration}</p>
                  <p className="text-xs text-neutral-400">Duration</p>
                </div>

                {/* 3-dot dropdown */}
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => setOpenMenu(openMenu === session.id ? null : session.id)}
                    className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors text-neutral-400"
                    aria-label="Aksi sesi"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {openMenu === session.id && (
                    <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-neutral-200 rounded-xl shadow-xl z-30 py-1 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => handleForceCheckout(session.id, session.cardId)}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <XCircle className="w-4 h-4 shrink-0" />
                        Paksa Check-out
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMarkFaulty(session.id, session.tableName)}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                      >
                        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
                        Labeli Tabel Rusak
                      </button>
                      <button
                        type="button"
                        onClick={() => handleVerify(session.id)}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4 shrink-0 text-green-500" />
                        Verifikasi Kehadiran
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReboot(session.id)}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                      >
                        <RefreshCw className="w-4 h-4 shrink-0 text-blue-500" />
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
    </div>
  );
}
