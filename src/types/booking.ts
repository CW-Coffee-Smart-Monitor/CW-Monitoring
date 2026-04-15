export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'; //kemungkinan confilict

export interface BookingFormValues {
  branch: string;
  room: string;
  tableId: number | null;
  tableName: string;
  chairsNeeded: number;
  date: string;
  time: string;
  note: string;
  paymentProof: File | null;
}

export interface BookingItem extends BookingFormValues {
  id: string;
  status: BookingStatus;
  createdAt: string;
}