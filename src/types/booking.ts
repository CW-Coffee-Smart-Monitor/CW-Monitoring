export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

export interface BookingFormValues {
  branch: string;
  room: string;
  chairsNeeded: number;
  date: string;
  time: string;
  note: string;
}

export interface BookingItem extends BookingFormValues {
  id: string;
  status: BookingStatus;
  createdAt: string;
}