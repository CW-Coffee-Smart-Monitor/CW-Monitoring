export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

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