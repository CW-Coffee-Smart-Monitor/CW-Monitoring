/**
 * firestoreService.ts
 * Semua operasi baca/tulis Firestore untuk CW-Monitoring.
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
import { BookingRecord, TableStatus } from '@/types';
import type { Reservation, ReservationStatus } from '@/types/reservation';

const RESERVATIONS_COLLECTION = 'reservations';
type ReservationListenerError = (error: unknown) => void;

/** Subset dari TableState yang digunakan RTDB dan type references */
export interface TableDoc {
  status: TableStatus;
  uid: string | null;
  isOccupied: boolean;
  distance: number;
  isGhostBooking: boolean;
  checkInTime: number | null;
  elapsedSeconds: number;
}

function sortReservationsByCreatedAt(items: Reservation[]): Reservation[] {
  return [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getFirestoreErrorMessage(
  error: unknown,
  fallback = 'Terjadi kesalahan saat mengakses data reservasi.'
): string {
  const code =
    typeof error === 'object' && error && 'code' in error
      ? String((error as { code?: unknown }).code)
      : '';

  if (code === 'permission-denied') {
    return 'Akses ke data reservasi ditolak. Pastikan Anda sudah login dan Firestore rules mengizinkan operasi ini.';
  }

  if (code === 'unauthenticated') {
    return 'Anda perlu login terlebih dahulu untuk mengakses data reservasi.';
  }

  return fallback;
}

// ─── Tables ───────────────────────────────────────────────────
// saveTableStatus dan subscribeToTables DIHAPUS.
// Menulis status tabel ke Firestore dari frontend menyebabkan feedback loop:
// ESP32 kirim 1x/detik → RTDB_SYNC → saveTableStatus → subscribeToTables fire → loop.
// Ini menghabiskan 86.400 writes + reads/hari, melebihi Spark plan (20k writes, 50k reads).
// Status tabel live sepenuhnya dikelola oleh RTDB (Firebase Realtime Database).

// ─── Bookings ─────────────────────────────────────────────────

export async function saveBookingRecord(record: BookingRecord): Promise<void> {
  await addDoc(collection(db, 'bookings'), {
    ...record,
    createdAt: serverTimestamp(),
  });
}

// ─── Reservations ─────────────────────────────────────────────

export async function saveReservation(data: Omit<Reservation, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, RESERVATIONS_COLLECTION), {
    ...data,
    createdAt: data.createdAt || new Date().toISOString(),
  });
  return ref.id;
}

export function subscribeToActiveReservations(
  callback: (reservations: Reservation[]) => void,
  onError?: ReservationListenerError
): Unsubscribe {
  const ref = query(
    collection(db, RESERVATIONS_COLLECTION),
    where('status', 'in', ['pending', 'confirmed'])
  );

  return onSnapshot(
    ref,
    (snapshot) => {
      const items: Reservation[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as Reservation);
      });
      callback(sortReservationsByCreatedAt(items));
    },
    (error) => onError?.(error)
  );
}

export function subscribeToAllReservations(
  callback: (reservations: Reservation[]) => void,
  onError?: ReservationListenerError
): Unsubscribe {
  const ref = query(
    collection(db, RESERVATIONS_COLLECTION),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    ref,
    (snapshot) => {
      const items: Reservation[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as Reservation);
      });
      callback(items);
    },
    (error) => onError?.(error)
  );
}

export function subscribeToUserReservations(
  userId: string,
  callback: (reservations: Reservation[]) => void,
  onError?: ReservationListenerError
): Unsubscribe {
  const ref = query(
    collection(db, RESERVATIONS_COLLECTION),
    where('userId', '==', userId)
  );

  return onSnapshot(
    ref,
    (snapshot) => {
      const items: Reservation[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as Reservation);
      });
      callback(sortReservationsByCreatedAt(items));
    },
    (error) => onError?.(error)
  );
}

export async function updateReservationStatus(
  id: string,
  status: ReservationStatus
): Promise<void> {
  await setDoc(doc(db, RESERVATIONS_COLLECTION, id), { status }, { merge: true });
}