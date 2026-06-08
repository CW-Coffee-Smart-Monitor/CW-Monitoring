'use client';

import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Bell, CheckCircle,
  TicketPercent, AlertTriangle,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useReservationNotifications } from '@/hooks/useReservationNotifications';
import type { NotificationItem, NotificationType } from '@/types/notification';

// ─── Pindahkan Fungsi Format ke Sini ────────────────────────────
function formatRelativeTime(isoString: string): string {
  if (!isoString) return '';
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diffMin = Math.floor((now - then) / 60_000);

  if (diffMin < 1) return 'Baru saja';
  if (diffMin < 60) return `${diffMin} menit lalu`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} jam lalu`;
  return `${Math.floor(diffHour / 24)} hari lalu`;
}

export default function NotificationPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const n = t.notifications;
  const { notifications, markAllRead, markRead } = useReservationNotifications();

  const renderIcon = (type: NotificationType) => {
    switch (type) {
      case 'promo':
        return <TicketPercent className="h-5 w-5 text-amber-500" strokeWidth={2.5} />;
      case 'booking':
        return <Bell className="h-5 w-5 text-emerald-500" strokeWidth={2.5} />;
      case 'alert':
        return <AlertTriangle className="h-5 w-5 text-rose-500" strokeWidth={2.5} />;
      default:
        return <CheckCircle className="h-5 w-5 text-neutral-400" strokeWidth={2.5} />;
    }
  };

  return (
    <div className="min-h-screen bg-white p-4 space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center h-8 w-8 rounded-full bg-white shadow-sm border border-neutral-200 hover:bg-neutral-50"
          >
            <ArrowLeft className="h-4 w-4 text-neutral-700" strokeWidth={2.5} />
          </button>
          <h1 className="text-lg font-semibold text-neutral-900">{n.title}</h1>
        </div>

        {/* Tombol mark all read */}
        {notifications.some((notif) => !notif.isRead) && (
          <button
            onClick={markAllRead}
            className="text-xs font-medium text-amber-600 hover:underline"
          >
            {n.markAllRead}
          </button>
        )}
      </div>

      {/* List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-4 text-sm text-neutral-500">
            {n.empty}
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => markRead(notif.id)}
              className={`rounded-2xl p-4 border shadow-sm flex gap-3 transition cursor-pointer ${
                notif.isRead
                  ? 'bg-white border-neutral-200'
                  : 'bg-amber-50 border-amber-200'
              }`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 shrink-0">
                {renderIcon(notif.type)}
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="text-sm font-semibold text-neutral-900">
                    {notif.title}
                  </h3>
                  {!notif.isRead && (
                    <span className="h-2 w-2 rounded-full bg-amber-400 mt-1 shrink-0" />
                  )}
                </div>
                <p className="mt-1 text-sm text-neutral-600">{notif.description}</p>
                
                {/* ✅ PERUBAHAN DI SINI:
                  Mengubah dari 'notif.time' menjadi fungsi dinamis 'formatRelativeTime(notif.timestamp)'
                */}
                <p className="mt-2 text-xs text-neutral-400">
                  {formatRelativeTime(notif.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}