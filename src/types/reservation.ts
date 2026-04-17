export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled';
export type ReservationDuration = '1jam' | '2jam' | 'bebas';
export type ReservationScope = 'single-table' | 'block';

export interface Reservation {
  id: string;

  // target utama reservasi
  tableId?: number;              // dipakai untuk map / single sofa
  tableName?: string;
  blockCode?: string;            // dipakai untuk form / blok, mis. "A"

  // daftar sofa yang ikut ter-cover reservasi
  coveredTableIds: number[];
  coveredTableNames?: string[];

  reservationScope: ReservationScope;

  guestName: string;
  date: string;             // YYYY-MM-DD
  arrivalTime: string;      // HH:MM
  duration: ReservationDuration;
  toleranceMinutes: number;
  status: ReservationStatus;
  createdAt: string;
  expiresAt: number;
  source: 'map' | 'form';

  branch?: string;
  room?: string;
  note?: string;
  userId?: string;
  userEmail?: string;
  paymentProofName?: string;
}