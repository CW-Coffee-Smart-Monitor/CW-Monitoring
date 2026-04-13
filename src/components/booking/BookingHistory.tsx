import type { BookingItem, BookingStatus } from '@/types/booking';

interface BookingHistoryProps {
  bookings: BookingItem[];
}

const STATUS_CONFIG: Record<BookingStatus, { label: string; className: string }> = {
  pending: {
    label: 'Menunggu',
    className: 'bg-amber-100 text-amber-700',
  },
  confirmed: {
    label: 'Dikonfirmasi',
    className: 'bg-emerald-100 text-emerald-700',
  },
  cancelled: {
    label: 'Dibatalkan',
    className: 'bg-rose-100 text-rose-600',
  },
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
          const statusConfig = STATUS_CONFIG[booking.status] ?? {
            label: booking.status,
            className: 'bg-neutral-100 text-neutral-600',
          };

          return (
            <div
              key={booking.id}
              className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-neutral-900">
                    {booking.branch}
                  </h3>
                  <p className="mt-1 text-sm text-neutral-500">
                    {booking.room} • {booking.chairsNeeded} kursi
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${statusConfig.className}`}
                >
                  {statusConfig.label}
                </span>
              </div>

              <div className="mt-3 space-y-1 text-sm text-neutral-700">
                <p>
                  <span className="text-neutral-500">Tanggal:</span> {booking.date}
                </p>
                <p>
                  <span className="text-neutral-500">Waktu:</span> {booking.time}
                </p>
                <p>
                  <span className="text-neutral-500">Catatan:</span> {booking.note || '-'}
                </p>
                <p>
                  <span className="text-neutral-500">Dibuat:</span> {booking.createdAt}
                </p>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}