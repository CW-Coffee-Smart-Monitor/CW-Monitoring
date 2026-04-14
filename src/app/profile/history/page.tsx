'use client';

import BookingHistory from '@/components/booking/BookingHistory';
import type { BookingItem } from '@/types/booking';

export default function HistoryBookingPage() {
  const bookings: BookingItem[] = [
    {
      id: 'BK-001',
      branch: 'CW Coffee Pusat',
      room: 'Sofa',
      chairsNeeded: 3,
      date: '2026-01-10',
      time: '19:00',
      note: 'Dekat colokan',
      status: 'completed', //kemuninan confilct
      createdAt: '2026-01-08 14:30',
    },
  ];

  return (
    <section className="space-y-4">
      {/* Page header — title + CTA button */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-neutral-900">History Reservasi Saya</h1>

      </div>

      <BookingHistory bookings={bookings} />
    </section>
  );
}
