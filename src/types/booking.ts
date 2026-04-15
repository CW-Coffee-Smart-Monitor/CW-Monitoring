export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'; 

export interface BookingFormValues {
  branch: string;
  room: string;
  tableId: number | null;
  tableName: string;
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
