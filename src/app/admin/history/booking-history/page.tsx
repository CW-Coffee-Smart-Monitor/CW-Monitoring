'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Search, ChevronLeft as Prev, ChevronRight as Next } from 'lucide-react';
import { subscribeToAllReservations } from '@/lib/firestoreService';
import { Reservation } from '@/types/reservation';
 

/* ── Mock data ─────────────────────────────────────────────── */

export default function BookingHistoryPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');

  const [reservations, setReservations] = useState<Reservation[]>([]);

   useEffect(() => {
      const unsubscribe = subscribeToAllReservations((newReservations) => {
        setReservations(newReservations);
      });
      return unsubscribe;
    }, []);

  const bookingList = reservations.filter((r) =>
    r.status === 'confirmed' || 
    r.status === 'rejected' ||
    r.status === 'cancelled'
  )

  const PER_PAGE = 10;

  const bookingHistory = reservations.filter(b =>
    search === '' ||
    b.guestName.toLowerCase().includes(search.toLowerCase()) ||
    (b.tableName ?? '').toLowerCase().includes(search.toLowerCase()) || 
    b.status.toLowerCase().includes(search.toLowerCase())
  );

  const TOTAL_ENTRIES = bookingHistory.length;
  const TOTAL_PAGES = Math.ceil(TOTAL_ENTRIES / PER_PAGE);
  const startIndex = (currentPage - 1) * PER_PAGE;
  const endIndex = Math.min(startIndex + PER_PAGE, TOTAL_ENTRIES);
  const filtered = bookingHistory.slice(startIndex, endIndex);

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
            <col style={{ width: '25%' }} />
            <col style={{ width: '20%' }} />
          </colgroup>
          <thead>
            <tr className="border-b border-neutral-100">
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-neutral-400">User Name</th>
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-neutral-400">Date &amp; Time</th>
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-neutral-400">Resource</th>
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-neutral-400">Last Updated</th>
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-neutral-400">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filtered.map((reservation) => (
              <tr key={`${reservation.id}-${reservation.date}-${reservation.arrivalTime}`} className="hover:bg-neutral-50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`bg-[#4B135F] w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                      {reservation.guestName
                        .split(' ')
                        .map((word) => word[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()}
                    </div>
                    <span className="font-semibold text-neutral-800">{reservation.guestName}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-neutral-600">
                  <div className="font-medium">{reservation.date}</div>
                  <div className="text-neutral-400 text-xs">{reservation.arrivalTime}</div>
                </td>
                <td className="px-5 py-4">
                  <div className="font-semibold text-[#4B135F]">{reservation.tableName}</div>
                  <div className="text-neutral-400 text-xs">{reservation.room}</div>
                </td> 
                     <td className="px-5 py-4 text-neutral-600">
                      {new Date(
                        reservation.approvedAt ??
                        reservation.rejectedAt ??
                        reservation.canceledAt ??
                        reservation.createdAt
                      ).toLocaleString('id-ID')}
                    </td>
                <td className="px-5 py-4">
                  {reservation.status === 'confirmed' ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-green-100 text-green-700 font-semibold text-xs">
                        ✓ Disetujui
                      </span>
                    ) : reservation.status === 'rejected' ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-red-100 text-red-700 font-semibold text-xs">
                        ✕ Ditolak
                      </span>
                    ) : reservation.status === 'cancelled' ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-600 font-semibold text-xs">
                        ○ Dibatalkan
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700 font-semibold text-xs">
                        ⏳ Menunggu
                      </span>
                    )}
                </td>
              </tr>
            ))}
            {bookingList.length === 0 && (
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
            Showing {TOTAL_ENTRIES === 0 ? 0 : startIndex + 1}
            {' '}to {endIndex}
            {' '}of {TOTAL_ENTRIES} entries
          </p>

          {TOTAL_PAGES > 1 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-50 disabled:opacity-30 transition-colors"
              >
                <Prev className="w-3.5 h-3.5" />
              </button>

              {Array.from({ length: TOTAL_PAGES }, (_, i) => i + 1)
                .slice(
                  Math.max(0, currentPage - 3),
                  Math.min(TOTAL_PAGES, currentPage + 2)
                )
                .map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
                      currentPage === page
                        ? 'bg-[#4B135F] text-white'
                        : 'border border-neutral-200 text-neutral-500 hover:bg-neutral-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}

              <button
                type="button"
                onClick={() =>
                  setCurrentPage((p) => Math.min(TOTAL_PAGES, p + 1))
                }
                disabled={currentPage === TOTAL_PAGES}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-50 disabled:opacity-30 transition-colors"
              >
                <Next className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
