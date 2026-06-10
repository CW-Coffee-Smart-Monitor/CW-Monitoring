import type { Reservation } from '@/types/reservation';

export type AdminNotificationItem = {
  id: string;
  reservationId: string;
  guestName: string;
  tableName: string;
  date: string;
  time: string;
  status: string;
  createdAt: string;
  isRead: boolean;
  changeType: 'new' | 'modified';
};

export function buildAdminNotification(
  reservation: Reservation,
  changeType: 'new' | 'modified'
): AdminNotificationItem {
  return {
    id: `${reservation.id}-${reservation.status}-${Date.now()}`,
    reservationId: reservation.id,
    guestName: reservation.guestName ?? 'Unknown',
    tableName: reservation.tableName ?? reservation.blockCode ?? '-',
    date: reservation.date,
    time: reservation.arrivalTime,
    status: reservation.status,
    createdAt: reservation.createdAt,
    isRead: false,
    changeType,
  };
}