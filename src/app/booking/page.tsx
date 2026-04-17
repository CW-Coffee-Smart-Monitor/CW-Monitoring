'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import BookingHistory from '@/components/booking/BookingHistory';
import type { BookingItem } from '@/types/booking';
import type { Reservation } from '@/types/reservation';
import {
  getFirestoreErrorMessage,
  subscribeToUserReservations,
} from '@/lib/firestoreService';
import { auth } from '@/lib/firebase';

function getBlockCodeFromReservation(reservation: Reservation): string {
  if (reservation.blockCode) return reservation.blockCode;

  if (reservation.tableName) {
    return reservation.tableName.trim().charAt(0).toUpperCase();
  }

  if (reservation.coveredTableNames && reservation.coveredTableNames.length > 0) {
    return reservation.coveredTableNames[0].trim().charAt(0).toUpperCase();
  }

  return '-';
}

export default function BookingPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [toastMessage, setToastMessage] = useState(() => {
    if (typeof window === 'undefined') return '';
    return window.sessionStorage.getItem('booking-success-toast') ?? '';
  });

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setReservations([]);
      setErrorMessage('Masuk terlebih dahulu untuk melihat histori reservasi Anda.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    const unsubscribeReservations = subscribeToUserReservations(
      currentUser.uid,
      (items) => {
        setReservations(items);
        setLoading(false);
      },
      (error) => {
        console.error('LOAD USER RESERVATIONS ERROR:', error);
        setReservations([]);
        setErrorMessage(
          getFirestoreErrorMessage(error, 'Histori reservasi tidak dapat dimuat saat ini.')
        );
        setLoading(false);
      }
    );

    return () => unsubscribeReservations();
  }, [currentUser]);

  useEffect(() => {
    if (!toastMessage) return;
    window.sessionStorage.removeItem('booking-success-toast');

    const timeout = window.setTimeout(() => {
      setToastMessage('');
    }, 3000);

    return () => window.clearTimeout(timeout);
  }, [toastMessage]);

  const bookings = useMemo<BookingItem[]>(
    () =>
      reservations.map((reservation) => ({
        id: reservation.id,
        branch: reservation.branch ?? 'CW Coffee',
        blockCode: getBlockCodeFromReservation(reservation),
        date: reservation.date,
        time: reservation.arrivalTime,
        note: reservation.note ?? '',
        status: reservation.status === 'cancelled' ? 'cancelled' : reservation.status,
        createdAt: reservation.createdAt,
        paymentProof: null,
      })),
    [reservations]
  );

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-neutral-900">Reservasi Saya</h1>
        <Link
          href="/booking/create"
          className="flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1.5 text-sm font-semibold text-neutral-900 transition-opacity hover:opacity-80 active:scale-95"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
        </Link>
      </div>

      {toastMessage && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {toastMessage}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-neutral-500">
          Memuat histori reservasi...
        </div>
      ) : errorMessage ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {errorMessage}
        </div>
      ) : (
        <BookingHistory bookings={bookings} />
      )}
    </section>
  );
}