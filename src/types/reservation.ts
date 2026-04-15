export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled';
export type ReservationDuration = '1jam' | '2jam' | 'bebas';

export interface Reservation {
  id: string;
  tableId: number;
  tableName: string;
  guestName: string;
  date: string;             // YYYY-MM-DD
  arrivalTime: string;      // HH:MM
  duration: ReservationDuration;
  toleranceMinutes: number; // default 30
  status: ReservationStatus;
  createdAt: string;        // ISO string
  expiresAt: number;        // unix ms = arrivalTime + toleranceMinutes
  source: 'map' | 'form';
  branch?: string;
  note?: string;
}
