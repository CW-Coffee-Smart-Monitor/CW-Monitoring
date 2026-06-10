'use client';

import { X, CheckCheck, Calendar, Clock, User, RefreshCw, Plus } from 'lucide-react';
import type { AdminNotificationItem } from '@/lib/adminNotificationUtils';

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending:   { label: 'Menunggu',     className: 'bg-amber-100 text-amber-700'   },
  confirmed: { label: 'Dikonfirmasi', className: 'bg-emerald-100 text-emerald-700' },
  rejected:  { label: 'Ditolak',      className: 'bg-rose-100 text-rose-600'     },
  cancelled: { label: 'Dibatalkan',   className: 'bg-neutral-100 text-neutral-600' },
  completed: { label: 'Selesai',      className: 'bg-blue-100 text-blue-700'     },
};

interface Props {
  notifications: AdminNotificationItem[];
  onMarkAllRead: () => void;
  onMarkRead: (id: string) => void;
  onClose: () => void;
}

export default function AdminNotificationPanel({
  notifications,
  onMarkAllRead,
  onMarkRead,
  onClose,
}: Props) {
  const hasUnread = notifications.some((n) => !n.isRead);

  return (
    <div className="absolute right-0 top-12 z-50 w-96 rounded-2xl border border-neutral-200 bg-white shadow-xl overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
        <h3 className="text-sm font-semibold text-neutral-900">Notifikasi Reservasi</h3>
        <div className="flex items-center gap-2">
          {hasUnread && (
            <button
              onClick={onMarkAllRead}
              className="flex items-center gap-1 text-xs text-purple-600 hover:underline"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Tandai semua dibaca
            </button>
          )}
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-neutral-100 text-neutral-400"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-[420px] overflow-y-auto divide-y divide-neutral-50">
        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-neutral-400">
            Belum ada notifikasi reservasi.
          </div>
        ) : (
          notifications.map((notif) => {
            const statusCfg = STATUS_CONFIG[notif.status] ?? {
              label: notif.status,
              className: 'bg-neutral-100 text-neutral-600',
            };

            return (
              <div
                key={notif.id}
                onClick={() => onMarkRead(notif.id)}
                className={`flex gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-neutral-50 ${
                  !notif.isRead ? 'bg-purple-50/60' : ''
                }`}
              >
                {/* Icon */}
                <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                  notif.changeType === 'new'
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-amber-100 text-amber-600'
                }`}>
                  {notif.changeType === 'new'
                    ? <Plus className="h-4 w-4" />
                    : <RefreshCw className="h-4 w-4" />
                  }
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-neutral-900 truncate">
                      {notif.changeType === 'new' ? 'Reservasi Baru' : 'Status Diperbarui'}
                    </p>
                    {!notif.isRead && (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-purple-500" />
                    )}
                  </div>

                  <div className="mt-0.5 flex items-center gap-1 text-xs text-neutral-500">
                    <User className="h-3 w-3 shrink-0" />
                    <span className="truncate">{notif.guestName}</span>
                    <span className="mx-1">·</span>
                    <span>{notif.tableName}</span>
                  </div>

                  <div className="mt-0.5 flex items-center gap-3 text-xs text-neutral-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {notif.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {notif.time}
                    </span>
                  </div>

                  <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusCfg.className}`}>
                    {statusCfg.label}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}