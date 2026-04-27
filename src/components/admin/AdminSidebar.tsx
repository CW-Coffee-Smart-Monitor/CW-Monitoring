'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CreditCard,
  Archive,
  Wrench,
  Clock,
  Settings,
  LogOut,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/admin/dashboard',    label: 'Dashboard',                  icon: LayoutDashboard },
  { href: '/admin/rfid',         label: 'RFID & Membership Hub',      icon: CreditCard      },
  { href: '/admin/history',      label: 'History & Archive Logs',     icon: Archive         },
  { href: '/admin/maintenance',  label: 'Maintenance & Service Desk', icon: Wrench          },
  { href: '/admin/shift',        label: 'Shift Summary',              icon: Clock           },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen sticky top-0 bg-[#ECEEF6] flex flex-col shrink-0 border-r border-[#DDE0EE] overflow-hidden">
      {/* Identity */}
      <div className="px-5 pt-6 pb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#4B135F] flex items-center justify-center text-white text-sm font-bold shrink-0">
            A
          </div>
          <div className="min-w-0">
            <p className="text-[#1a0528] text-sm font-bold leading-tight truncate">CW Monitor</p>
            <p className="text-[#7B6B8D] text-xs mt-0.5">Karyawan</p>
          </div>
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

      {/* Bottom: Settings + Logout */}
      <div className="px-3 pb-5 pt-4 border-t border-[#DDE0EE] space-y-0.5 mt-4">
        <Link
          href="/admin/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#5a4d6b] hover:bg-white/60 hover:text-[#4B135F] transition-all"
        >
          <Settings className="w-4 h-4 shrink-0 text-[#7B6B8D]" />
          <span>Settings</span>
        </Link>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#5a4d6b] hover:bg-white/60 hover:text-[#4B135F] transition-all">
          <LogOut className="w-4 h-4 shrink-0 text-[#7B6B8D]" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
