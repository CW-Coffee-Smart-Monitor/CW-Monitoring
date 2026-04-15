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
import { TableState, BookingRecord } from '@/types';
import type { Reservation, ReservationStatus } from '@/types/reservation';

const RESERVATIONS_COLLECTION = 'reservations';
type ReservationListenerError = (error: unknown) => void;

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

export async function saveTableStatus(table: TableState): Promise<void> {
  const ref = doc(db, 'tables', String(table.id));
  const data: TableDoc = {
    status: table.status,
    uid: table.uid ?? null,
    isOccupied: table.isOccupied,
    distance: table.distance,
    isGhostBooking: table.isGhostBooking,
    checkInTime: table.checkInTime ?? null,
    elapsedSeconds: table.elapsedSeconds,
  };
  await setDoc(ref, data, { merge: true });
}

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