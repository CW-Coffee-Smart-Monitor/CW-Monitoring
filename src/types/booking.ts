export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'rejected';

export interface BookingFormValues {
  branch: string;
  blockCode: string;
  blockLabel?: string;
  date: string;
  time: string;
  note: string;
  paymentProof: File | null;
}

export interface BookingItem {
  id: string;
  branch: string;
  blockCode: string;
  blockLabel?: string;
  date: string;
  time: string;
  note: string;
  paymentProof: File | null;
  status: BookingStatus;
  createdAt: string;
}

export interface Reservation {
  id: string;
  date: string;
  arrivalTime: string;
  durationMinutes: number;
  bookingId?: string;
  tableId?: number;
  status: ReservationStatus;
  userId: string;
  createdAt: string;
  user?: {
    name?: string;
  };
  paymentProof?: string;
}