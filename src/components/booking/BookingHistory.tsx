import type { BookingItem, BookingStatus } from '@/types/booking';
import { CalendarDays, Clock, StickyNote, Hash } from 'lucide-react';

interface BookingHistoryProps {
  bookings: BookingItem[];
}

const STATUS_BADGE: Record<BookingStatus, { label: string; className: string }> = {
  pending: { label: 'Menunggu', className: 'bg-amber-100 text-amber-700' },
  confirmed: { label: 'Dikonfirmasi', className: 'bg-emerald-100 text-emerald-700' },
  cancelled: { label: 'Dibatalkan', className: 'bg-rose-100 text-rose-600' },
  completed: { label: 'Selesai', className: 'bg-blue-100 text-blue-700' },
};

export default function BookingHistory({ bookings }: BookingHistoryProps) {
  return (
    <div className="space-y-3">
      {bookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-4 text-sm text-neutral-500">
          Belum ada data booking.
        </div>
      ) : (
        bookings.map((booking) => {
          const badge = STATUS_BADGE[booking.status] ?? {
            label: booking.status,
            className: 'bg-neutral-100 text-neutral-600',
          };

          return (
            <div
              key={booking.id}
              className="rounded-2xl border border-[#4B135F]/20 shadow-sm backdrop-blur-sm"
              style={{ background: 'linear-gradient(to right, rgba(75,19,95,0.08), transparent)' }}
            >
              <div className="flex items-start justify-between gap-3 p-4 pb-3">
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-base font-bold text-neutral-900">
                    {booking.branch}
                  </h3>
                  <p className="mt-0.5 text-sm text-neutral-500">
                    {booking.room} - {booking.tableName}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${badge.className}`}>
                  {badge.label}
                </span>
              </div>

              <div className="mx-4 h-px bg-[#4B135F]/10" />

              <div className="grid grid-cols-2 gap-x-4 gap-y-2 p-4 pt-3 text-sm">
                <div className="flex items-center gap-2 text-neutral-600">
                  <CalendarDays className="h-3.5 w-3.5 shrink-0 text-[#4B135F]/60" />
                  <span>{booking.date}</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-600">
                  <Clock className="h-3.5 w-3.5 shrink-0 text-[#4B135F]/60" />
                  <span>{booking.time}</span>
                </div>
                {booking.note && (
                  <div className="col-span-2 flex items-start gap-2 text-neutral-500">
                    <StickyNote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#4B135F]/60" />
                    <span className="text-xs">{booking.note}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
