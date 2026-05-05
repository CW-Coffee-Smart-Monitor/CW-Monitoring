'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Clock, Monitor, Users, X, Check } from 'lucide-react';

/* ── Types ─────────────────────────────────────────────────── */
type Tier = 'PREMIUM' | 'STANDARD' | 'ENTERPRISE';
type TabKey = 'Pending' | 'Approved' | 'Rejected';

type Booking = {
  id: number;
  name: string;
  initials: string;
  avatarBg: string;
  hasPhoto: boolean;
  tier: Tier;
  department: string;
  email: string;
  company: string;
  role: string;
  resource: string;
  resourceIcon: 'monitor' | 'desk' | 'podcast';
  time: string;
  date: string;
  duration: string;
  guests: string;
  purpose: string;
  totalBookings: number;
  cancellationRate: string;
  lastVisit: string;
  urgent: boolean;
  tab: TabKey;
  bookedTableId: number;
};

/* ── Floor plan constants (same as dashboard) ───────────────── */
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

/* ── Mock data ─────────────────────────────────────────────── */
const ALL_BOOKINGS: Booking[] = [
  {
    id: 1,
    name: 'Elena Rodriguez',
    initials: 'ER',
    avatarBg: 'bg-neutral-600',
    hasPhoto: false,
    tier: 'PREMIUM',
    department: 'Marketing D.',
    email: 's.jenkins@creativeco.com',
    company: 'CreativeCo Design',
    role: 'Senior Art Director',
    resource: 'Meeting Room B',
    resourceIcon: 'monitor',
    time: 'Tomorrow, 2:00 PM – 4:00 PM',
    date: 'Oct 26, 2023',
    duration: '2 Hours',
    guests: '4 External',
    purpose: '"Quarterly review presentation with client stakeholder team. Need reliable VC setup."',
    totalBookings: 42,
    cancellationRate: '2.4%',
    lastVisit: 'Oct 12, 2023',
    urgent: false,
    tab: 'Pending',
    bookedTableId: 8,
  },
  {
    id: 2,
    name: 'Marcus Johnson',
    initials: 'MJ',
    avatarBg: 'bg-purple-400',
    hasPhoto: false,
    tier: 'STANDARD',
    department: 'Freelance D.',
    email: 'm.johnson@freelance.com',
    company: 'Independent',
    role: 'UX Consultant',
    resource: 'Hot Desk T-15',
    resourceIcon: 'desk',
    time: 'Oct 24, 9:00 AM – 5:00 PM',
    date: 'Oct 24, 2023',
    duration: '8 Hours',
    guests: '0 External',
    purpose: '"Full-day deep work session for client deliverable. Prefer window desk."',
    totalBookings: 18,
    cancellationRate: '5.6%',
    lastVisit: 'Oct 10, 2023',
    urgent: false,
    tab: 'Pending',
    bookedTableId: 15,
  },
  {
    id: 3,
    name: 'Sarah Chen',
    initials: 'SC',
    avatarBg: 'bg-neutral-500',
    hasPhoto: false,
    tier: 'ENTERPRISE',
    department: 'Acme Corp',
    email: 's.chen@acmecorp.com',
    company: 'Acme Corp',
    role: 'Product Manager',
    resource: 'Podcast Studio A',
    resourceIcon: 'podcast',
    time: 'Today, 4:00 PM – 6:00 PM',
    date: 'Oct 25, 2023',
    duration: '2 Hours',
    guests: '2 External',
    purpose: '"Recording internal product update podcast episode with remote guests."',
    totalBookings: 67,
    cancellationRate: '1.1%',
    lastVisit: 'Oct 20, 2023',
    urgent: true,
    tab: 'Pending',
    bookedTableId: 2,
  },
  {
    id: 4,
    name: 'Sarah Chen',
    initials: 'SC',
    avatarBg: 'bg-neutral-500',
    hasPhoto: false,
    tier: 'ENTERPRISE',
    department: 'Acme Corp',
    email: 's.chen@acmecorp.com',
    company: 'Acme Corp',
    role: 'Product Manager',
    resource: 'Podcast Studio A',
    resourceIcon: 'podcast',
    time: 'Today, 4:00 PM – 6:00 PM',
    date: 'Oct 26, 2023',
    duration: '2 Hours',
    guests: '2 External',
    purpose: '"Follow-up recording session for missed content from previous booking."',
    totalBookings: 67,
    cancellationRate: '1.1%',
    lastVisit: 'Oct 20, 2023',
    urgent: true,
    tab: 'Pending',
    bookedTableId: 4,
  },
  {
    id: 5,
    name: 'Sarah Chen',
    initials: 'SC',
    avatarBg: 'bg-neutral-500',
    hasPhoto: false,
    tier: 'ENTERPRISE',
    department: 'Acme Corp',
    email: 's.chen@acmecorp.com',
    company: 'Acme Corp',
    role: 'Product Manager',
    resource: 'Podcast Studio A',
    resourceIcon: 'podcast',
    time: 'Today, 4:00 PM – 6:00 PM',
    date: 'Oct 27, 2023',
    duration: '2 Hours',
    guests: '2 External',
    purpose: '"Third session in the enterprise podcast series for Q4 product launch."',
    totalBookings: 67,
    cancellationRate: '1.1%',
    lastVisit: 'Oct 20, 2023',
    urgent: true,
    tab: 'Pending',
    bookedTableId: 25,
  },
  {
    id: 6,
    name: 'James Tan',
    initials: 'JT',
    avatarBg: 'bg-blue-500',
    hasPhoto: false,
    tier: 'STANDARD',
    department: 'Tech Startup',
    email: 'j.tan@techstartup.io',
    company: 'TechStartup Inc',
    role: 'CTO',
    resource: 'Meeting Room A',
    resourceIcon: 'monitor',
    time: 'Nov 1, 10:00 AM – 12:00 PM',
    date: 'Nov 1, 2023',
    duration: '2 Hours',
    guests: '3 Internal',
    purpose: '"Sprint planning and architecture review with engineering team."',
    totalBookings: 29,
    cancellationRate: '3.4%',
    lastVisit: 'Oct 18, 2023',
    urgent: false,
    tab: 'Approved',
    bookedTableId: 9,
  },
  {
    id: 7,
    name: 'Priya Nair',
    initials: 'PN',
    avatarBg: 'bg-pink-500',
    hasPhoto: false,
    tier: 'PREMIUM',
    department: 'Design Agency',
    email: 'p.nair@designagency.com',
    company: 'Design Agency',
    role: 'Creative Lead',
    resource: 'Lounge Suite 1',
    resourceIcon: 'desk',
    time: 'Oct 30, 1:00 PM – 3:00 PM',
    date: 'Oct 30, 2023',
    duration: '2 Hours',
    guests: '1 External',
    purpose: '"Client discovery workshop for new brand identity project."',
    totalBookings: 55,
    cancellationRate: '0.9%',
    lastVisit: 'Oct 22, 2023',
    urgent: false,
    tab: 'Rejected',
    bookedTableId: 14,
  },
];

const PENDING_COUNT = ALL_BOOKINGS.filter(b => b.tab === 'Pending').length;

const TIER_STYLES: Record<Tier, string> = {
  PREMIUM:    'bg-amber-100 text-amber-700',
  STANDARD:   'bg-neutral-100 text-neutral-600',
  ENTERPRISE: 'bg-purple-100 text-[#4B135F]',
};

const RESOURCE_ICON_MAP = {
  monitor: <Monitor className="w-4 h-4 text-neutral-500 shrink-0" />,
  desk:    <Monitor className="w-4 h-4 text-neutral-500 shrink-0" />,
  podcast: <Monitor className="w-4 h-4 text-neutral-500 shrink-0" />,
};

export default function BookingApprovalsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('Pending');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const filtered = ALL_BOOKINGS.filter(b => b.tab === activeTab);

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
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab
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
            className={`bg-white rounded-xl border ${booking.urgent ? 'border-l-4 border-l-[#4B135F] border-neutral-200' : 'border-neutral-200'} p-5 flex items-center gap-5`}
          >
            {/* Avatar */}
            <div className={`${booking.avatarBg} w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0`}>
              {booking.initials}
            </div>

            {/* Name + tier */}
            <div className="min-w-40">
              <p className="font-bold text-neutral-800">
                {booking.name}
                {booking.urgent && <span className="ml-1 text-red-500">!</span>}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${TIER_STYLES[booking.tier]}`}>
                  {booking.tier}
                </span>
                <span className="text-xs text-neutral-400">{booking.department}</span>
              </div>
            </div>

            {/* Resource + time */}
            <div className="flex-1">
              <div className="flex items-center gap-1.5 text-neutral-700 font-semibold text-sm">
                {RESOURCE_ICON_MAP[booking.resourceIcon]}
                {booking.resource}
              </div>
              <div className="flex items-center gap-1.5 text-neutral-400 text-xs mt-1">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                {booking.time}
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
                  <div className={`${selectedBooking.avatarBg} w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto relative`}>
                    {selectedBooking.initials}
                    <span className={`absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide ${TIER_STYLES[selectedBooking.tier]} whitespace-nowrap`}>
                      {selectedBooking.tier}
                    </span>
                  </div>
                  <div className="pt-2">
                    <p className="font-bold text-neutral-800">{selectedBooking.name}</p>
                    <p className="text-xs text-[#4B135F]">{selectedBooking.email}</p>
                  </div>
                  <div className="text-xs text-neutral-500 space-y-1 pt-1">
                    <div className="flex items-center justify-center gap-1.5">
                      <Monitor className="w-3.5 h-3.5 shrink-0" />
                      {selectedBooking.company}
                    </div>
                    <div className="flex items-center justify-center gap-1.5">
                      <Users className="w-3.5 h-3.5 shrink-0" />
                      {selectedBooking.role}
                    </div>
                  </div>
                </div>

                {/* Member analytics */}
                <div className="bg-neutral-50 rounded-xl p-4 space-y-2">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-2">Member Analytics</p>
                  <div className="flex justify-between text-xs">
                    <span className="flex items-center gap-1 text-neutral-500">
                      <Clock className="w-3 h-3" /> Total Bookings
                    </span>
                    <span className="font-bold text-neutral-800">{selectedBooking.totalBookings}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="flex items-center gap-1 text-neutral-500">
                      <Monitor className="w-3 h-3" /> Cancellation Rate
                    </span>
                    <span className="font-bold text-neutral-800">{selectedBooking.cancellationRate}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="flex items-center gap-1 text-neutral-500">
                      <Clock className="w-3 h-3" /> Last Visit
                    </span>
                    <span className="font-bold text-neutral-800">{selectedBooking.lastVisit}</span>
                  </div>
                </div>
              </div>

              {/* Right column */}
              <div className="flex-1 pl-6 space-y-4">
                {/* Resource header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-neutral-800">{selectedBooking.resource}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#EDE9F5] text-[#4B135F] text-[10px] font-bold uppercase tracking-wide">
                        <Monitor className="w-3 h-3" /> Video Enabled
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-neutral-100 text-neutral-600 text-[10px] font-bold uppercase tracking-wide">
                        <Users className="w-3 h-3" /> Cap: 8
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-2xl font-bold text-[#4B135F]">14:00</p>
                    <p className="text-xs text-neutral-400">{selectedBooking.date}</p>
                  </div>
                </div>

                {/* Duration + Guests */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-neutral-50 rounded-lg p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-1">Duration</p>
                    <div className="flex items-center gap-1.5 font-semibold text-neutral-800 text-sm">
                      <Clock className="w-4 h-4 text-neutral-400" />
                      {selectedBooking.duration}
                    </div>
                  </div>
                  <div className="bg-neutral-50 rounded-lg p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-1">Expected Guests</p>
                    <div className="flex items-center gap-1.5 font-semibold text-neutral-800 text-sm">
                      <Users className="w-4 h-4 text-neutral-400" />
                      {selectedBooking.guests}
                    </div>
                  </div>
                </div>

                {/* Stated purpose */}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-2">Stated Purpose</p>
                  <div className="bg-neutral-50 rounded-lg p-3 text-sm text-neutral-600 italic leading-relaxed">
                    {selectedBooking.purpose}
                  </div>
                </div>

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
                      const isBooked = pos.id === selectedBooking.bookedTableId;
                      const w = pos.w ?? 63, h = pos.h ?? 43;
                      const x = pos.x - w / 2, y = pos.y - h / 2;
                      const fill = isBooked ? '#4B135F' : '#9ca3af';
                      const opacity = isBooked ? 0.85 : 0.18;
                      return (
                        <g key={pos.id}>
                          <rect x={x} y={y} width={w} height={h} fill={fill} opacity={opacity} rx={4} />
                          {isBooked && (() => {
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
                                  {selectedBooking.name.split(' ')[0]} · Seat #{pos.id}
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
                    {selectedBooking.resource} — Lokasi yang dipesan
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
                  onClick={() => setSelectedBooking(null)}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-red-50 border border-red-200 text-red-500 text-sm font-semibold hover:bg-red-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedBooking(null)}
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
    </div>
  );
}
