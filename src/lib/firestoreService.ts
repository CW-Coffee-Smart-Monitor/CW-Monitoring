/**
 * firestoreService.ts
 * Semua operasi baca/tulis Firestore untuk CW-Monitoring.
 *
 * Koleksi:
 *   tables/{tableId}   — status real-time setiap sofa
 *   bookings/{id}      — riwayat checkout
 */

import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import { TableState, BookingRecord } from '@/types';
import type { Reservation, ReservationStatus } from '@/types/reservation';

// ─── Types ────────────────────────────────────────────────────

/** Subset dari TableState yang disimpan di Firestore */
export interface TableDoc {
  status: TableState['status'];
  uid: string | null;
  isOccupied: boolean;
  distance: number;
  isGhostBooking: boolean;
  checkInTime: number | null;
  elapsedSeconds: number;
}

// ─── Tables ───────────────────────────────────────────────────

/**
 * Simpan/update status satu meja ke Firestore.
 * Menggunakan setDoc + merge agar tidak overwrite field lain.
 */
export async function saveTableStatus(table: TableState): Promise<void> {
  const ref = doc(db, 'tables', String(table.id));
  const data: TableDoc = {
    status:        table.status,
    uid:           table.uid ?? null,
    isOccupied:    table.isOccupied,
    distance:      table.distance,
    isGhostBooking: table.isGhostBooking,
    checkInTime:   table.checkInTime ?? null,
    elapsedSeconds: table.elapsedSeconds,
  };
  await setDoc(ref, data, { merge: true });
}

/**
 * Langganan real-time ke semua dokumen dalam koleksi `tables`.
 * Callback dipanggil setiap kali ada perubahan di Firestore.
 * Mengembalikan fungsi unsubscribe.
 */
export function subscribeToTables(
  callback: (updates: Record<number, TableDoc>) => void
): Unsubscribe {
  const ref = collection(db, 'tables');
  return onSnapshot(ref, (snapshot) => {
    const updates: Record<number, TableDoc> = {};
    snapshot.forEach((docSnap) => {
      const id = Number(docSnap.id);
      if (!isNaN(id)) {
        updates[id] = docSnap.data() as TableDoc;
      }
    });
    callback(updates);
  });
}

// ─── Bookings ─────────────────────────────────────────────────

/**
 * Simpan satu record checkout ke koleksi `bookings`.
 */
export async function saveBookingRecord(record: BookingRecord): Promise<void> {
  await addDoc(collection(db, 'bookings'), {
    ...record,
    createdAt: serverTimestamp(),
  });
}

// ─── Reservations ──────────────────────────────────────────────

/**
 * Simpan reservasi baru ke koleksi `reservations`.
 * Mengembalikan document ID yang dibuat Firestore.
 */
export async function saveReservation(
  data: Omit<Reservation, 'id'>
): Promise<string> {
  const ref = await addDoc(collection(db, 'reservations'), {
    ...data,
    createdAt: new Date().toISOString(),
  });
  return ref.id;
}

/**
 * Langganan real-time ke semua reservasi berstatus 'pending'.
 */
export function subscribeToActiveReservations(
  callback: (reservations: Reservation[]) => void
): Unsubscribe {
  const ref = query(
    collection(db, 'reservations'),
    where('status', '==', 'pending')
  );
  return onSnapshot(ref, (snapshot) => {
    const items: Reservation[] = [];
    snapshot.forEach((docSnap) => {
      items.push({ id: docSnap.id, ...docSnap.data() } as Reservation);
    });
    callback(items);
  });
}

/**
 * Langganan real-time ke semua reservasi (untuk halaman riwayat).
 */
export function subscribeToAllReservations(
  callback: (reservations: Reservation[]) => void
): Unsubscribe {
  const ref = query(
    collection(db, 'reservations'),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(ref, (snapshot) => {
    const items: Reservation[] = [];
    snapshot.forEach((docSnap) => {
      items.push({ id: docSnap.id, ...docSnap.data() } as Reservation);
    });
    callback(items);
  });
}

/**
 * Update status sebuah reservasi.
 */
export async function updateReservationStatus(
  id: string,
  status: ReservationStatus
): Promise<void> {
  await setDoc(doc(db, 'reservations', id), { status }, { merge: true });
}
