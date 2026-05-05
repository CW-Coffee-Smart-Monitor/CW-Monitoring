'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Search, ChevronLeft as Prev, ChevronRight as Next } from 'lucide-react';

/* ── Types ─────────────────────────────────────────────────── */
type BookingStatus = 'COMPLETED' | 'NO SHOW' | 'SCHEDULED';

type BookingRow = {
  initials: string;
  name: string;
  avatarBg: string;
  date: string;
  timeRange: string;
  resource: string;
  location: string;
  status: BookingStatus;
};

/* ── Mock data ─────────────────────────────────────────────── */
const ALL_BOOKINGS: BookingRow[] = [
  { initials: 'EK', name: 'Elena Koleva',   avatarBg: 'bg-[#4B135F]',    date: 'Oct 24, 2023', timeRange: '09:00 AM - 11:00 AM', resource: 'Meeting Room A',    location: 'Floor 3, North Wing',   status: 'COMPLETED'  },
  { initials: 'JD', name: 'Julian Davis',   avatarBg: 'bg-purple-200',   date: 'Oct 24, 2023', timeRange: '01:30 PM - 05:00 PM', resource: 'Desk T-09',         location: 'Open Plan Area',        status: 'NO SHOW'    },
  { initials: 'SM', name: 'Sarah Mitchell', avatarBg: 'bg-yellow-700',   date: 'Oct 23, 2023', timeRange: '10:00 AM - 10:30 AM', resource: 'Phone Booth 2',     location: 'Floor 2, Quiet Zone',   status: 'COMPLETED'  },
  { initials: 'MR', name: 'Marcus Reed',    avatarBg: 'bg-neutral-400',  date: 'Oct 23, 2023', timeRange: 'All Day',             resource: 'Boardroom Focus',   location: 'Floor 4, Executive Suite', status: 'COMPLETED' },
  { initials: 'AV', name: 'Ava Voss',       avatarBg: 'bg-[#4B135F]',    date: 'Oct 25, 2023', timeRange: '12:00 PM - 01:00 PM', resource: 'Conference Room B', location: 'Floor 1, Main Building', status: 'SCHEDULED' },
  { initials: 'TW', name: 'Tommy Wilson',   avatarBg: 'bg-purple-300',   date: 'Oct 25, 2023', timeRange: '03:00 PM - 04:00 PM', resource: 'Zoom',              location: 'Remote',                status: 'SCHEDULED'  },
  { initials: 'LB', name: 'Lena Brown',     avatarBg: 'bg-yellow-600',   date: 'Oct 24, 2023', timeRange: '11:15 AM - 12:00 PM', resource: 'Cafe Meeting Area', location: 'Floor 1, South Wing',   status: 'COMPLETED'  },
  { initials: 'RN', name: 'Ryan Nguyen',    avatarBg: 'bg-blue-500',     date: 'Oct 22, 2023', timeRange: '02:00 PM - 04:00 PM', resource: 'Meeting Room C',    location: 'Floor 2, East Wing',    status: 'COMPLETED'  },
  { initials: 'PK', name: 'Priya Kumar',    avatarBg: 'bg-pink-500',     date: 'Oct 22, 2023', timeRange: '09:30 AM - 11:00 AM', resource: 'Quiet Pod 3',       location: 'Floor 2, Quiet Zone',   status: 'NO SHOW'    },
  { initials: 'BT', name: 'Ben Torres',     avatarBg: 'bg-neutral-600',  date: 'Oct 21, 2023', timeRange: '01:00 PM - 03:00 PM', resource: 'Hot Desk T-22',     location: 'Open Plan Area',        status: 'COMPLETED'  },
];

const STATUS_STYLE: Record<BookingStatus, string> = {
  COMPLETED: 'bg-green-100 text-green-600',
  'NO SHOW': 'bg-red-100 text-red-500',
  SCHEDULED: 'bg-[#EDE9F5] text-[#4B135F]',
};

const TOTAL_ENTRIES = 128;
const PER_PAGE = 10;
const TOTAL_PAGES = Math.ceil(TOTAL_ENTRIES / PER_PAGE);

export default function BookingHistoryPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');

  const filtered = ALL_BOOKINGS.filter(b =>
    search === '' ||
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.resource.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/admin/history"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-[#4B135F] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Kembali ke halaman history
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800">Booking History</h1>
          <p className="text-neutral-500 text-sm mt-1">Historical record of all resource reservations and their fulfillment status.</p>
        </div>
        {/* Search */}
        <div className="relative shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search history..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 rounded-xl border border-neutral-200 text-sm text-neutral-700 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#4B135F]/30 bg-white w-52"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-neutral-200 mb-4">
        <table className="w-full table-fixed text-sm">
          <colgroup>
            <col style={{ width: '28%' }} />
            <col style={{ width: '24%' }} />
            <col style={{ width: '30%' }} />
            <col style={{ width: '18%' }} />
          </colgroup>
          <thead>
            <tr className="border-b border-neutral-100">
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-neutral-400">User Name</th>
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-neutral-400">Date &amp; Time</th>
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-neutral-400">Resource</th>
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-neutral-400">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filtered.map((row) => (
              <tr key={`${row.name}-${row.date}-${row.timeRange}`} className="hover:bg-neutral-50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`${row.avatarBg} w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                      {row.initials}
                    </div>
                    <span className="font-semibold text-neutral-800">{row.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-neutral-600">
                  <div className="font-medium">{row.date}</div>
                  <div className="text-neutral-400 text-xs">{row.timeRange}</div>
                </td>
                <td className="px-5 py-4">
                  <div className="font-semibold text-[#4B135F]">{row.resource}</div>
                  <div className="text-neutral-400 text-xs">{row.location}</div>
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${STATUS_STYLE[row.status]}`}>
                    {row.status === 'NO SHOW' ? 'No Show' : row.status === 'COMPLETED' ? 'Completed' : 'Scheduled'}
                  </span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-12 text-center text-neutral-400 text-sm">
                  Tidak ada data yang cocok.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-neutral-100">
          <p className="text-sm text-neutral-400">
            Showing 1 to {PER_PAGE} of {TOTAL_ENTRIES} entries
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-50 disabled:opacity-30 transition-colors"
            >
              <Prev className="w-3.5 h-3.5" />
            </button>
            {[1, 2, 3].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setCurrentPage(p)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
                  currentPage === p
                    ? 'bg-[#4B135F] text-white'
                    : 'border border-neutral-200 text-neutral-500 hover:bg-neutral-50'
                }`}
              >
                {p}
              </button>
            ))}
            <span className="w-8 h-8 flex items-center justify-center text-neutral-400 text-sm">…</span>
            <button
              type="button"
              onClick={() => setCurrentPage(p => Math.min(TOTAL_PAGES, p + 1))}
              disabled={currentPage === TOTAL_PAGES}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-50 disabled:opacity-30 transition-colors"
            >
              <Next className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
