import type { Reservation, ReservationStatus } from '@/types/reservation';

export const RESERVATION_TOLERANCE_MINUTES = 30;

export function getLocalDateKey(date = new Date()): string {
  return date.toLocaleDateString('en-CA');
}

export function buildReservationDateTime(date: string, time: string): Date {
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

export function getReservationTiming(
  date: string,
  time: string,
  toleranceMinutes = RESERVATION_TOLERANCE_MINUTES
): { arrivalTimestamp: number; expiresAt: number } {
  const arrivalDate = buildReservationDateTime(date, time);
  const arrivalTimestamp = arrivalDate.getTime();

  return {
    arrivalTimestamp,
    expiresAt: arrivalTimestamp + toleranceMinutes * 60 * 1000,
  };
}

export function isReservationBlockingLiveTable(
  reservation: Pick<Reservation, 'date' | 'expiresAt'> & { status: ReservationStatus },
  now = Date.now()
): boolean {
  return (
    (reservation.status === 'pending' || reservation.status === 'confirmed') &&
    reservation.date === getLocalDateKey(new Date(now)) &&
    reservation.expiresAt > now
  );
}