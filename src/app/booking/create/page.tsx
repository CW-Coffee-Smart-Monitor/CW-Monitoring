'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import BookingForm from '@/components/booking/BookingForm';
import type { BookingFormValues } from '@/types/booking';
import { auth } from '@/lib/firebase';
import { saveReservation, getFirestoreErrorMessage } from '@/lib/firestoreService';
import { getReservationTiming } from '@/lib/reservationUtils';

export default function CreateBookingPage() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateBooking = async (values: BookingFormValues) => {
    const user = auth.currentUser;

    if (!values.tableId) {
      setSubmitError('Silakan pilih meja terlebih dahulu.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const { expiresAt } = getReservationTiming(values.date, values.time);

      await saveReservation({
        tableId: values.tableId,
        tableName: values.tableName,
        guestName: user?.displayName || user?.email || 'Guest',
        date: values.date,
        arrivalTime: values.time,
        duration: 'bebas',
        toleranceMinutes: 30,
        status: 'pending',
        createdAt: new Date().toISOString(),
        expiresAt,
        source: 'form',
        branch: values.branch,
        room: values.room,
        note: values.note || '',
        userId: user?.uid || 'guest',
        userEmail: user?.email || '',
        paymentProofName: values.paymentProof?.name || '',
      });

      window.sessionStorage.setItem('booking-success-toast', 'Booking berhasil disimpan.');
      router.push('/booking');
    } catch (error) {
      console.error('SAVE RESERVATION ERROR:', error);
      setSubmitError(
        getFirestoreErrorMessage(error, 'Booking gagal disimpan. Silakan coba lagi.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="space-y-4">
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

      {submitError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {submitError}
        </div>
      )}

      {isSubmitting && (
        <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
          Menyimpan reservasi...
        </div>
      )}

      <BookingForm onSubmit={handleCreateBooking} />
    </section>
  );
}