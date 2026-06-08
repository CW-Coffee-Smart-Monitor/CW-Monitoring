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
  getDocs,
  updateDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import { BookingRecord, TableStatus } from '@/types';
import type { Reservation, ReservationStatus } from '@/types/reservation';
import { buildReservationDateTime } from '@/lib/reservationUtils';
import {
  buildNotificationFromReservation,
  type ReservationNotification,
} from '@/lib/notificationUtils';
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

// ─── Conflict helpers ─────────────────────────────────────────

function hasAnyOverlap(a: number[], b: number[]): boolean {
  const setB = new Set(b);
  return a.some((id) => setB.has(id));
}

function getReservationCoveredTableIds(reservation: Reservation): number[] {
  if (reservation.coveredTableIds?.length) return reservation.coveredTableIds;
  if (reservation.tableId != null) return [reservation.tableId];
  return [];
}

function getReservationStartTimestamp(reservation: Reservation): number {
  return buildReservationDateTime(reservation.date, reservation.arrivalTime).getTime();
}

function getReservationEndTimestamp(reservation: Reservation): number {
  if (typeof reservation.expiresAt === 'number') return reservation.expiresAt;

  const start = getReservationStartTimestamp(reservation);
  const tolerance = reservation.toleranceMinutes ?? 60;
  return start + tolerance * 60 * 1000;
}

function doesReservationOverlapRequestedSlot(params: {
  reservation: Reservation;
  date: string;
  arrivalTime: string;
  durationMinutes?: number;
}): boolean {
  const { reservation, date, arrivalTime, durationMinutes = 30 } = params;

  if (reservation.date !== date) return false;
  if (reservation.status !== 'pending' && reservation.status !== 'confirmed') return false;

  const requestedStart = buildReservationDateTime(date, arrivalTime).getTime();
  const requestedEnd = requestedStart + durationMinutes * 60 * 1000;

  const existingStart = getReservationStartTimestamp(reservation);
  const existingEnd = getReservationEndTimestamp(reservation);

  return requestedStart < existingEnd && requestedEnd > existingStart;
}

export async function hasReservationConflictForTables(params: {
  coveredTableIds: number[];
  date: string;
  arrivalTime: string;
  durationMinutes?: number;
}): Promise<boolean> {
  const { coveredTableIds, date, arrivalTime, durationMinutes = 30 } = params;

  if (coveredTableIds.length === 0) return false;

  const ref = query(
    collection(db, RESERVATIONS_COLLECTION),
    where('date', '==', date),
    where('status', 'in', ['pending', 'confirmed'])
  );

  const snapshot = await getDocs(ref);

  for (const docSnap of snapshot.docs) {
    const reservation = { id: docSnap.id, ...docSnap.data() } as Reservation;
    const existingCoveredIds = getReservationCoveredTableIds(reservation);

    if (!hasAnyOverlap(coveredTableIds, existingCoveredIds)) continue;

    if (
      doesReservationOverlapRequestedSlot({
        reservation,
        date,
        arrivalTime,
        durationMinutes,
      })
    ) {
      return true;
    }
  }

  return false;
}

export async function getBlockAvailabilityForDateTime(params: {
  blocks: Array<{ code: string; coveredTableIds: number[] }>;
  date: string;
  arrivalTime: string;
  durationMinutes?: number;
}): Promise<Record<string, boolean>> {
  const { blocks, date, arrivalTime, durationMinutes = 30 } = params;

  if (!date || !arrivalTime) {
    return Object.fromEntries(blocks.map((block) => [block.code, true]));
  }

  const ref = query(
    collection(db, RESERVATIONS_COLLECTION),
    where('date', '==', date),
    where('status', 'in', ['pending', 'confirmed'])
  );

  const snapshot = await getDocs(ref);

  const activeReservations: Reservation[] = snapshot.docs.map(
    (docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Reservation)
  );

  const availability: Record<string, boolean> = {};

  for (const block of blocks) {
    const hasConflict = activeReservations.some((reservation) => {
      const existingCoveredIds = getReservationCoveredTableIds(reservation);

      if (!hasAnyOverlap(block.coveredTableIds, existingCoveredIds)) return false;

      return doesReservationOverlapRequestedSlot({
        reservation,
        date,
        arrivalTime,
        durationMinutes,
      });
    });

    availability[block.code] = !hasConflict;
  }

  return availability;
}

export interface DeviceDoc {
  tableId: number;
  rfidId: string;
  deviceStatus: string;

  status: string;
  isOccupied: boolean;
  uid: string | null;
}

export function subscribeToDevices(
  callback: (updates: Record<number, DeviceDoc>) => void
) {
  return onSnapshot(
    collection(db, "devices"),
    (snapshot) => {
      const updates: Record<number, DeviceDoc> = {};

      snapshot.forEach((doc) => {
        const data = doc.data() as DeviceDoc;
        updates[data.tableId] = data;
      });

      callback(updates);
    }
  );
}
export async function assignRFIDToReservation(
  reservationId: string,
  rfidId: string,
  role: 'customer' | 'staff' | 'karyawan',
): Promise<void> {
  await updateDoc(
    doc(db, RESERVATIONS_COLLECTION, reservationId),
    {
      rfidId,
      role,
      rfidAssignedAt: new Date().toISOString(),
      checkInStatus: 'pending',
    }
  );
}

export async function findDeviceByTableId(
  tableId: number,
): Promise<{
  id: string;
  rfidId: string;
  tableId: number
} | null> {
  const q = query(
    collection(db, 'devices'),
    where('tableId', '==', tableId)
  );
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const docSnap = snapshot.docs[0];

  return {
    id: docSnap.id,
    ...(docSnap.data() as {
      rfidId: string;
      tableId: number;
    }),
  };
}

//  ─── Part Admin ─────────────────────────────────────────

export function subscribePendingReservations(
  callback: (data: Reservation[]) => void
) {
  const q = query(
    collection(db, RESERVATIONS_COLLECTION),
    where('status', '==', 'pending')
  );

  return onSnapshot(q, (snapshot) => {
    const reservations = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Reservation[];

    callback(reservations);
  });
}

export async function acceptReservation(
  reservationId: string,
  userId: string,
) {
  await updateDoc(
    doc(db, RESERVATIONS_COLLECTION, reservationId),
    {
      status: 'confirmed',
      approvedAt: new Date().toISOString(),
      approvedBy: userId,
    }
  );
}

export async function rejectReservation(
  reservationId: string,
) {
  await updateDoc(
    doc(db, RESERVATIONS_COLLECTION, reservationId),
    {
      status: 'rejected',
      rejectedAt: new Date().toISOString(),
    }
  );
}

// Tambahkan di bagian bawah firestoreService.ts

export function subscribeToUserReservationNotifications(
  userId: string,
  callback: (notifications: ReservationNotification[]) => void,
  onError?: ReservationListenerError
): Unsubscribe {
  const ref = query(
    collection(db, RESERVATIONS_COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    ref,
    (snapshot) => {
      const notifications: ReservationNotification[] = [];

      snapshot.docChanges().forEach((change) => {
        const data = { id: change.doc.id, ...change.doc.data() } as Reservation;

        // ✅ Hanya trigger notif saat dokumen berubah (bukan load awal)
        if (change.type === 'modified') {
          notifications.push(buildNotificationFromReservation(data));
        }

        // ✅ Notif saat reservasi baru dibuat
        if (change.type === 'added' && !snapshot.metadata.hasPendingWrites) {
          notifications.push(buildNotificationFromReservation(data));
        }
      });

      if (notifications.length > 0) {
        callback(notifications);
      }
    },
    (error) => onError?.(error)
  );
}

  export async function cancelReservation(
    reservationId: string,
  ) {
    await updateDoc(
      doc(db, RESERVATIONS_COLLECTION, reservationId),
      {
        status: 'cancelled',
        canceledAt: new Date().toISOString(),
      }
    );
  }
