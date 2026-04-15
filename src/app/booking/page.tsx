'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import BookingHistory from '@/components/booking/BookingHistory';
import type { BookingItem } from '@/types/booking';

export default function BookingPage() {
  const bookings: BookingItem[] = [
    {
      id: 'BK-001',
      branch: 'CW Coffee Pusat',
      room: 'Sofa',
      date: '2026-01-10',
      tableId: 1,
      tableName: 'Meja 1',
      time: '19:00',
      note: 'Dekat colokan',
      status: 'confirmed',
      createdAt: '2026-01-08 14:30',
      paymentProof: null,
    },
  ];

  return (
    <section className="space-y-4">
      {/* Page header — title + CTA button */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-neutral-900">Reservasi Saya</h1>
        <Link
          href="/booking/create"
          className="flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1.5 text-sm font-semibold text-neutral-900 transition-opacity hover:opacity-80 active:scale-95"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
        </Link>
      </div>

      <BookingHistory bookings={bookings} />
    </section>
  );
}
