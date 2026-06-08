'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, Clock, Monitor, Users, X, Check } from 'lucide-react';
import { Reservation } from '@/types/reservation';
import { subscribeToAllReservations, acceptReservation, rejectReservation } from '@/lib/firestoreService';
import { auth } from '@/lib/firebase';

/* ── Types ─────────────────────────────────────────────────── */
type TabKey = 'Pending' | 'Approved' | 'Rejected';

/* ── Floor plan constants (same as dashboard) ───────────────── */
const SVG_W = 609, SVG_H = 483;

const TABLE_POS: { id: number; x: number; y: number; w?: number; h?: number }[] = [
  { id: 1, x: 31, y: 126 },
  { id: 2, x: 114, y: 127 },
  { id: 3, x: 31, y: 189 },
  { id: 4, x: 114, y: 189 },
  { id: 5, x: 31, y: 273 },
  { id: 6, x: 112, y: 271 },
  { id: 7, x: 197, y: 271 },
  { id: 8, x: 448, y: 125 },
  { id: 9, x: 448, y: 188 },
  { id: 10, x: 448, y: 294 },
  { id: 11, x: 448, y: 357 },
  { id: 12, x: 28, y: 461 },
  { id: 13, x: 91, y: 461 },
  { id: 14, x: 154, y: 461 },
  { id: 15, x: 217, y: 461 },
  { id: 16, x: 10, y: 347, w: 25, h: 61 },
  { id: 17, x: 52, y: 347, w: 25, h: 61 },
  { id: 18, x: 94, y: 347, w: 25, h: 61 },
  { id: 19, x: 136, y: 347, w: 25, h: 61 },
  { id: 20, x: 178, y: 347, w: 25, h: 61 },
  { id: 21, x: 220, y: 347, w: 25, h: 61 },
  { id: 22, x: 262, y: 347, w: 25, h: 61 },
  { id: 23, x: 10, y: 29, w: 25, h: 64 },
  { id: 24, x: 52, y: 29, w: 25, h: 64 },
  { id: 25, x: 94, y: 29, w: 25, h: 64 },
  { id: 26, x: 136, y: 29, w: 25, h: 64 },
  { id: 27, x: 178, y: 29, w: 25, h: 64 },
  { id: 28, x: 220, y: 29, w: 25, h: 64 },
  { id: 29, x: 345, y: 29, w: 25, h: 64 },
  { id: 30, x: 388, y: 29, w: 25, h: 64 },
  { id: 31, x: 430, y: 29, w: 25, h: 64 },
  { id: 32, x: 472, y: 29, w: 25, h: 64 },
];

/* ── Initials helper ───────────────────────────────────────── */
const getInitials = (name?: string) => {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + (parts[1][0] || '')).toUpperCase();
};

export default function BookingApprovalsPage() {
  const [allBookings, setAllBookings] = useState<Reservation[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>('Pending');
  const [selectedBooking, setSelectedBooking] = useState<Reservation | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToAllReservations((reservations) => {
      setAllBookings(reservations);
    });
    return unsubscribe;
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleApprove = async (reservationId: string) => {
    try {
      const managerId = auth.currentUser?.uid || 'admin';
      await acceptReservation(reservationId, managerId);
      showToast('Booking request approved successfully.');
      setSelectedBooking(null);
    } catch (err) {
      console.error(err);
      showToast('Failed to approve reservation.');
    }
  };

  const handleReject = async (reservationId: string) => {
    try {
      await rejectReservation(reservationId);
      showToast('Booking request rejected.');
      setSelectedBooking(null);
    } catch (err) {
      console.error(err);
      showToast('Failed to reject reservation.');
    }
  };

  const PENDING_COUNT = allBookings.filter(b => b.status === 'pending').length;

  const filtered = allBookings.filter((booking) => {
    if (activeTab === 'Pending') {
      return booking.status === 'pending';
    }

    if (activeTab === 'Approved') {
      return booking.status === 'confirmed';
    }

    if (activeTab === 'Rejected') {
      return booking.status === 'rejected';
    }

    return false;

  });

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/admin/history"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-[#4B135F] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Kembali ke halaman History
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800">Booking Approvals</h1>
          <p className="text-neutral-500 text-sm mt-1">Review and manage workspace requests requiring your authorization.</p>
        </div>
        <div className="flex items-center gap-1 mt-1 border border-neutral-200 rounded-lg overflow-hidden bg-white shrink-0">
          {(['Pending', 'Approved', 'Rejected'] as TabKey[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === tab
                ? 'bg-[#EDE9F5] text-[#4B135F] font-semibold'
                : 'text-neutral-500 hover:bg-neutral-50'
                }`}
            >
              {tab === 'Pending' ? `Pending (${PENDING_COUNT})` : tab}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.map((booking) => (
          <div
            key={booking.id}
            className={`bg-white rounded-xl border ${booking.branch ? 'border-l-4 border-l-[#4B135F] border-neutral-200' : 'border-neutral-200'} p-5 flex items-center gap-5`}
          >
            {/* Avatar */}
            <div className="bg-[#4B135F] w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0">
              {getInitials(booking.guestName)}
            </div>

            {/* Name + email */}
            <div className="min-w-40">
              <p className="font-bold text-neutral-800">
                {booking.guestName}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-neutral-400">{booking.userEmail}</span>
              </div>
            </div>

            {/* Resource + time */}
            <div className="flex-1">
              <div className="flex items-center gap-1.5 text-neutral-700 font-semibold text-sm">
                {booking.room || booking.tableName || (booking.blockCode ? `Block ${booking.blockCode}` : 'Workspace Desk')}
              </div>
              <div className="flex items-center gap-1.5 text-neutral-400 text-xs mt-1">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                {booking.date} @ {booking.arrivalTime} ({booking.duration})
              </div>
            </div>

            {/* View Details */}
            <button
              type="button"
              onClick={() => setSelectedBooking(booking)}
              className="px-4 py-2 rounded-lg border border-neutral-300 text-neutral-700 text-sm font-semibold hover:bg-neutral-50 transition-colors shrink-0"
            >
              View Details
            </button>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center text-neutral-400 text-sm">
            Tidak ada data untuk tab ini.
          </div>
        )}
      </div>

      {/* ── View Details Modal ──────────────────────────── */}
      {selectedBooking !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <dialog
            open
            aria-labelledby="booking-detail-title"
            className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-3xl m-0 border-0 p-0 max-h-[90vh] overflow-y-auto"
          >
            {/* Modal header */}
            <div className="flex items-start justify-between p-6 pb-4 border-b border-neutral-100">
              <div>
                <h2 id="booking-detail-title" className="text-xl font-bold text-neutral-800">
                  Booking Request Details
                </h2>
                <p className="text-sm text-neutral-400 mt-0.5">Pending Manager Approval</p>
              </div>
              <button
                type="button"
                aria-label="Tutup"
                onClick={() => setSelectedBooking(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal body */}
            <div className="flex gap-0 p-6">
              {/* Left column */}
              <div className="w-56 shrink-0 space-y-4 pr-6 border-r border-neutral-100">
                {/* Profile card */}
                <div className="bg-neutral-50 rounded-xl p-4 text-center space-y-2">
                  <div className="bg-[#4B135F] w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto relative">
                    {getInitials(selectedBooking.guestName)}
                    <span className="bg-[#EDE9F5] text-[#4B135F] px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide whitespace-nowrap absolute -bottom-1 left-1/2 -translate-x-1/2 border border-purple-200 shadow-sm">
                      {selectedBooking.date}
                    </span>
                  </div>
                  <div className="pt-2">
                    <p className="font-bold text-neutral-800">{selectedBooking.guestName}</p>
                    <p className="text-xs text-[#4B135F]">{selectedBooking.userEmail}</p>
                  </div>
                  <div className="text-xs text-neutral-500 space-y-1 pt-1">
                    <div className="flex items-center justify-center gap-1.5">
                      <Monitor className="w-3.5 h-3.5 shrink-0" />
                      {selectedBooking.room || selectedBooking.tableName || (selectedBooking.blockCode ? `Block ${selectedBooking.blockCode}` : 'Workspace Desk')}
                    </div>
                    {selectedBooking.note && (
                      <div className="flex items-center justify-center gap-1.5 max-w-full truncate">
                        <Users className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{selectedBooking.note}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right column */}
              <div className="flex-1 pl-6 space-y-4">
                {/* Resource header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-neutral-800">
                      {selectedBooking.room || selectedBooking.tableName || (selectedBooking.blockCode ? `Block ${selectedBooking.blockCode}` : 'Workspace Desk')}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#EDE9F5] text-[#4B135F] text-[10px] font-bold uppercase tracking-wide">
                        <Monitor className="w-3 h-3" /> Booking Request
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-neutral-100 text-neutral-600 text-[10px] font-bold uppercase tracking-wide">
                        <Users className="w-3 h-3" /> Branch: {selectedBooking.branch || 'Utama'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-2xl font-bold text-[#4B135F]">{selectedBooking.arrivalTime}</p>
                    <p className="text-xs text-neutral-400">{selectedBooking.date}</p>
                  </div>
                </div>

                {/* Duration + Scope */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-neutral-50 rounded-lg p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-1">Duration</p>
                    <div className="flex items-center gap-1.5 font-semibold text-neutral-800 text-sm">
                      <Clock className="w-4 h-4 text-neutral-400" />
                      {selectedBooking.duration}
                    </div>
                  </div>
                  <div className="bg-neutral-50 rounded-lg p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-1">Scope &amp; Source</p>
                    <div className="flex items-center gap-1.5 font-semibold text-neutral-800 text-sm">
                      <Users className="w-4 h-4 text-neutral-400" />
                      <span className="capitalize">{selectedBooking.reservationScope} ({selectedBooking.source})</span>
                    </div>
                  </div>
                </div>

                {/* Stated purpose */}
                {selectedBooking.note && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-2">Stated Purpose</p>
                    <div className="bg-neutral-50 rounded-lg p-3 text-sm text-neutral-600 italic leading-relaxed">
                      {selectedBooking.note}
                    </div>
                  </div>
                )}

                {/* Floor map — same SVG as dashboard, highlights booked table */}
                <div className="rounded-xl overflow-hidden border border-neutral-200 bg-neutral-50">
                  <svg
                    viewBox={`0 0 ${SVG_W} ${SVG_H}`}
                    className="w-full"
                    aria-label="Floor plan — booked location highlighted"
                    style={{ display: 'block' }}
                  >
                    <image href="/Frame 112.svg" x="0" y="0" width={SVG_W} height={SVG_H} />
                    {TABLE_POS.map(pos => {
                      const isBooked = pos.id === selectedBooking.tableId || selectedBooking.coveredTableIds?.includes(pos.id);
                      const isMainTable = pos.id === selectedBooking.tableId || (selectedBooking.tableId == null && selectedBooking.coveredTableIds?.[0] === pos.id);
                      const w = pos.w ?? 63, h = pos.h ?? 43;
                      const x = pos.x - w / 2, y = pos.y - h / 2;
                      const fill = isBooked ? '#4B135F' : '#9ca3af';
                      const opacity = isBooked ? 0.85 : 0.18;
                      return (
                        <g key={pos.id}>
                          <rect x={x} y={y} width={w} height={h} fill={fill} opacity={opacity} rx={4} />
                          {isBooked && isMainTable && (() => {
                            const labelW = 110;
                            const labelH = 28;
                            const pinCy = y - 16;
                            const rawLx = pos.x - labelW / 2;
                            const lx = Math.min(Math.max(rawLx, 4), SVG_W - labelW - 4);
                            const ly = pinCy - labelH - 6;
                            return (
                              <>
                                <rect
                                  x={x - 2} y={y - 2} width={w + 4} height={h + 4}
                                  fill="none" stroke="#4B135F" strokeWidth={2} rx={5} opacity={0.9}
                                />
                                {/* Pin */}
                                <circle cx={pos.x} cy={pinCy} r={9} fill="#4B135F" />
                                <circle cx={pos.x} cy={pinCy} r={4} fill="white" opacity={0.9} />
                                <line x1={pos.x} y1={pinCy + 9} x2={pos.x} y2={y} stroke="#4B135F" strokeWidth={2} />
                                {/* Label callout */}
                                <rect x={lx} y={ly} width={labelW} height={labelH} fill="#4B135F" rx={5} />
                                <polygon
                                  points={`${pos.x - 5},${ly + labelH} ${pos.x + 5},${ly + labelH} ${pos.x},${ly + labelH + 6}`}
                                  fill="#4B135F"
                                />
                                <text
                                  x={lx + labelW / 2}
                                  y={ly + labelH / 2 + 1}
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                  fill="white"
                                  fontSize={9}
                                  fontWeight="700"
                                  fontFamily="inherit"
                                >
                                  {selectedBooking.guestName.split(' ')[0]} · Seat #{pos.id}
                                </text>
                              </>
                            );
                          })()}
                        </g>
                      );
                    })}
                  </svg>
                  <div className="px-3 py-1.5 bg-[#EDE9F5] flex items-center gap-2 text-xs text-[#4B135F] font-semibold">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#4B135F] inline-block" />
                    {selectedBooking.room || selectedBooking.tableName || (selectedBooking.blockCode ? `Block ${selectedBooking.blockCode}` : 'Workspace Desk')} — Lokasi yang dipesan
                  </div>
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="px-5 py-2.5 text-sm text-neutral-600 font-semibold hover:text-neutral-800 transition-colors"
              >
                Close
              </button>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handleReject(selectedBooking.id)}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-red-50 border border-red-200 text-red-500 text-sm font-semibold hover:bg-red-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => handleApprove(selectedBooking.id)}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#4B135F] text-white text-sm font-semibold hover:bg-[#3a0f4a] transition-colors"
                >
                  <Check className="w-4 h-4" />
                  Approve Request
                </button>
              </div>
            </div>
          </dialog>
        </div>
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
