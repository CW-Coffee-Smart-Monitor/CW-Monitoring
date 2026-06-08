import type { Reservation } from '@/types/reservation';
import type { NotificationItem } from '@/types/notification';

export type ReservationNotification = NotificationItem;

function formatRelativeTime(isoString: string): string {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diffMin = Math.floor((now - then) / 60_000);

  if (diffMin < 1) return 'Baru saja';
  if (diffMin < 60) return `${diffMin} menit lalu`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} jam lalu`;
  return `${Math.floor(diffHour / 24)} hari lalu`;
}

const STATUS_CONFIG: Record<string, { title: string; description: (name: string) => string; type: NotificationItem['type'] }> = {
  confirmed: {
    title: 'Reservasi Dikonfirmasi',
    description: (name) => `Reservasi ${name} telah dikonfirmasi.`,
    type: 'booking',
  },
  rejected: {
    title: 'Reservasi Ditolak',
    description: (name) => `Reservasi ${name} ditolak oleh pengelola.`,
    type: 'alert',
  },
  cancelled: {
    title: 'Reservasi Dibatalkan',
    description: (name) => `Reservasi ${name} telah dibatalkan.`,
    type: 'alert',
  },
  pending: {
    title: 'Reservasi Diterima',
    description: (name) => `Reservasi ${name} sedang menunggu konfirmasi.`,
    type: 'booking',
  },
  completed: {
    title: 'Reservasi Selesai',
    description: (name) => `Reservasi ${name} telah selesai. Terima kasih!`,
    type: 'booking',
  },
};

export function buildNotificationFromReservation(reservation: Reservation): ReservationNotification {
  const config = STATUS_CONFIG[reservation.status] ?? {
    title: 'Update Reservasi',
    description: (name: string) => `Status reservasi ${name} diperbarui.`,
    type: 'booking' as const,
  };

  const label = reservation.tableName ?? reservation.blockCode ?? 'meja';

  return {
    id: `${reservation.id}-${reservation.status}`, // Tanpa Date.now()
    title: config.title,
    description: config.description(label),
    isRead: false,
    type: config.type,
    reservationId: reservation.id,
    status: reservation.status,
    // 👇 SIMPAN WAKTU ASLI DI SINI
    timestamp: reservation.createdAt, 
  };
}