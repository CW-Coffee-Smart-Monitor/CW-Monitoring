'use client';

import { useEffect, useMemo, useState } from 'react';
import { Clock } from 'lucide-react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { subscribeToUserReservations } from '@/lib/firestoreService';
import type { Reservation } from '@/types/reservation';

export default function HistoryCard() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [latestReservation, setLatestReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('Memuat riwayat...');

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      Promise.resolve().then(() => {
        setCurrentUser(user);
      });
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!currentUser) {
      Promise.resolve().then(() => {
        setLatestReservation(null);
        setLoading(false);
        setMessage('Masuk untuk melihat riwayat pemesanan Anda.');
      });
      return;
    }

    Promise.resolve().then(() => setLoading(true));
    const unsubscribeReservations = subscribeToUserReservations(
      currentUser.uid,
      (reservations) => {
        const latest = reservations[0] ?? null;
        setLatestReservation(latest);
        setLoading(false);
        setMessage(latest ? '' : 'Belum ada pemesanan terakhir.');
      },
      (error) => {
        console.error('LOAD USER RESERVATIONS ERROR:', error);
        setLatestReservation(null);
        setLoading(false);
        setMessage('Gagal memuat riwayat pemesanan.');
      }
    );

    return () => unsubscribeReservations();
  }, [currentUser]);

  const content = useMemo(() => {
    if (loading) {
      return {
        title: 'Memuat history...',
        subtitle: 'Sedang mengambil data reservasi terakhir Anda.',
      };
    }

    if (!latestReservation) {
      return {
        title: 'Tidak ada riwayat terbaru',
        subtitle: message,
      };
    }

    const date = new Date(`${latestReservation.date}T${latestReservation.arrivalTime}:00`);
    const formattedDate = date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
    });

    const statusConfig =
  latestReservation.status === 'confirmed'
    ? {
        label: 'Dikonfirmasi',
        className: 'bg-green-100 text-green-600',
      }
    : latestReservation.status === 'pending'
    ? {
        label: 'Menunggu',
        className: 'bg-yellow-100 text-yellow-600',
      }
    : {
        label: 'Dibatalkan',
        className: 'bg-red-100 text-red-600',
      };

    return {
      title: `${formattedDate} · ${latestReservation.arrivalTime} di ${latestReservation.tableName}`,
      subtitle: `${latestReservation.guestName}`,
      status: statusConfig,
};
  }, [latestReservation, loading, message]);

  return (
    <div className="rounded-2xl p-4 shadow-sm flex justify-between items-center">
      <div className={loading ? 'w-full rounded-2xl border border-amber-200 bg-amber-50 p-4' : 'bg-white w-full rounded-2xl p-4'}>
        <p className="text-xs text-neutral-400">RIWAYAT KUNJUNGAN</p>
        <h4 className="mt-1 font-semibold text-neutral-900">{content.title}</h4>
        <p className="text-sm text-neutral-500 mt-1">{content.subtitle}</p>
          {content.status && (
      <span
        className={`text-xs font-medium px-2 py-0.5 rounded-full ${content.status.className}`}
      >
        {content.status.label}
      </span>
          )}
      </div>
      <Clock className="text-neutral-400 ml-4" />
    </div>
  );
}