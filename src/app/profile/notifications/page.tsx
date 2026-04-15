'use client';

import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Bell,
  CheckCircle,
  TicketPercent,
  AlertTriangle,
} from 'lucide-react';

type NotificationType = 'booking' | 'alert' | 'promo';

type NotificationItem = {
  id: string;
  title: string;
  description: string;
  time: string;
  isRead: boolean;
  type: NotificationType;
};

export default function NotificationPage() {
  const router = useRouter();

  const notifications: NotificationItem[] = [
    {
      id: '1',
      title: 'Reservasi Dikonfirmasi',
      description: 'Meja 12 berhasil kamu booking.',
      time: '2 menit lalu',
      isRead: false,
      type: 'booking',
    },
    {
      id: '2',
      title: 'Kafe Ramai',
      description: 'CW Coffee sedang penuh (90%).',
      time: '1 jam lalu',
      isRead: true,
      type: 'alert',
    },
    {
      id: '3',
      title: 'Promo Hari Ini',
      description: 'Diskon 20% untuk member premium!',
      time: 'Kemarin',
      isRead: true,
      type: 'promo',
    },
  ];

  // 🔥 function untuk icon + warna
  const renderIcon = (notif: NotificationItem) => {
    switch (notif.type) {
      case 'promo':
        return (
          <TicketPercent
            className="h-5 w-5 text-amber-500"
            strokeWidth={2.5}
          />
        );
      case 'booking':
        return (
          <Bell
            className="h-5 w-5 text-emerald-500"
            strokeWidth={2.5}
          />
        );
      case 'alert':
        return (
          <AlertTriangle
            className="h-5 w-5 text-rose-500"
            strokeWidth={2.5}
          />
        );
      default:
        return (
          <CheckCircle
            className="h-5 w-5 text-neutral-400"
            strokeWidth={2.5}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-white p-4 space-y-4">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center h-8 w-8 rounded-full bg-white shadow-sm border border-neutral-200 hover:bg-neutral-50"
        >
          <ArrowLeft
            className="h-4 w-4 text-neutral-700"
            strokeWidth={2.5}
          />
        </button>

        <h1 className="text-lg font-semibold text-neutral-900">
          Notifikasi
        </h1>
      </div>

      {/* List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-4 text-sm text-neutral-500">
            Tidak ada notifikasi.
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`rounded-2xl p-4 border shadow-sm flex gap-3 transition ${
                notif.isRead
                  ? 'bg-white border-neutral-200'
                  : 'bg-amber-50 border-amber-200'
              }`}
            >
              {/* Icon */}
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100">
                {renderIcon(notif)}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="text-sm font-semibold text-neutral-900">
                    {notif.title}
                  </h3>

                  {!notif.isRead && (
                    <span className="h-2 w-2 rounded-full bg-amber-400 mt-1"></span>
                  )}
                </div>

                <p className="mt-1 text-sm text-neutral-600">
                  {notif.description}
                </p>

                <p className="mt-2 text-xs text-neutral-400">
                  {notif.time}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}