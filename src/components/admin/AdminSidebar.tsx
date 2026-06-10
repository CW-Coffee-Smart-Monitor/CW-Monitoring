'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  CreditCard,
  Archive,
  Wrench,
  Clock,
  LogOut,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/admin/dashboard',    label: 'Dashboard',                  icon: LayoutDashboard },
  { href: '/admin/rfid',         label: 'RFID Devices',      icon: CreditCard      },
  { href: '/admin/history',      label: 'History & Archive Logs',     icon: Archive         },
  { href: '/admin/maintenance',  label: 'Maintenance & Service Desk', icon: Wrench          },
  { href: '/admin/shift',        label: 'Shift Summary',              icon: Clock           },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/auth/staff');
  };

  return (
    <aside className="w-64 h-screen sticky top-0 bg-[#ECEEF6] flex flex-col shrink-0 border-r border-[#DDE0EE] overflow-hidden">
      {/* Identity */}
      <div className="px-5 pt-6 pb-8 flex justify-center">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/CWClub.png" alt="CWClub Logo" className="w-10 h-10 object-contain shrink-0" />
          <span className="text-lg font-bold tracking-wide text-[#1a0528]">CWMonitor</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                active
                  ? 'bg-white text-[#4B135F] font-semibold shadow-sm'
                  : 'text-[#5a4d6b] hover:bg-white/60 hover:text-[#4B135F]'
              }`}
            >
              {/* Active left border indicator */}
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-[#4B135F]" />
              )}
              <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#4B135F]' : 'text-[#7B6B8D]'}`} />
              <span className="leading-snug">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom:  Logout */}
      <div className="px-3 pb-5 pt-4 border-t border-[#DDE0EE] space-y-0.5 mt-4">
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#5a4d6b] hover:bg-red-50 hover:text-red-600 transition-all disabled:opacity-50"
        >
          <LogOut className="w-4 h-4 shrink-0 text-[#7B6B8D]" />
          <span>{loggingOut ? 'Keluar...' : 'Logout'}</span>
        </button>
      </div>
    </aside>
  );
}
