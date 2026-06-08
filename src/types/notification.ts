export type NotificationType = 'booking' | 'alert' | 'promo' | 'status';

export type NotificationItem = {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  type: NotificationType;
  reservationId?: string;
  status?: string;
};