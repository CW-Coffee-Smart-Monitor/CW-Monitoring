'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import BookingForm from '@/components/booking/BookingForm';
import type { BookingFormValues } from '@/types/booking';

export default function CreateBookingPage() {
  const router = useRouter();

  const handleCreateBooking = (values: BookingFormValues) => {
    console.log('Booking baru:', values);

    alert('Booking berhasil disimpan.');
    router.push('/booking');
  };

  return (
    <section className="space-y-4">
      {/* Page header — back button + title */}
      <div className="flex items-center gap-2">
        <Link
          href="/booking"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 transition-colors hover:bg-neutral-200 active:scale-95"
          aria-label="Kembali ke halaman reservasi"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={2.5} />
        </Link>
        <div>
          <h1 className="text-lg font-bold text-neutral-900">Buat Reservasi</h1>
          <p className="text-xs text-neutral-500">Isi form untuk membuat booking baru.</p>
        </div>
      </div>

      <BookingForm onSubmit={handleCreateBooking} />
    </section>
  );
}
