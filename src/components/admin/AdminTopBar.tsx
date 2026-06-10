'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, Search } from 'lucide-react';
import { useAdminNotifications } from '@/hooks/useAdminNotifications';
import AdminNotificationPanel from '@/components/admin/AdminNotificationPanel';

export default function AdminTopBar() {
  const [panelOpen, setPanelOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markAllRead, markRead } = useAdminNotifications();

  // ✅ Tutup panel saat klik di luar
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setPanelOpen(false);
      }
    }
    if (panelOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [panelOpen]);

  return (
    <header className="h-14 bg-white border-b border-neutral-200 flex items-center justify-between px-6 flex-shrink-0">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search operations..."
          className="pl-9 pr-4 py-1.5 text-sm bg-neutral-100 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:bg-white transition-all"
        />
      </div>

      <div className="flex items-center gap-2 text-neutral-500">

        {/* ✅ Bell button dengan panel */}
        <div className="relative" ref={panelRef}>
          <button
            onClick={() => setPanelOpen((prev) => !prev)}
            className="relative p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {panelOpen && (
            <AdminNotificationPanel
              notifications={notifications}
              onMarkAllRead={markAllRead}
              onMarkRead={markRead}
              onClose={() => setPanelOpen(false)}
            />
          )}
        </div>

        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-semibold">
          A
        </div>
      </div>
    </header>
  );
}