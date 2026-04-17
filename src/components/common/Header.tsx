'use client';

/**
 * Header — Top bar dengan hamburger menu.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Radio, MonitorSmartphone, Menu, X, Home, Map, CalendarClock, User, Bell } from 'lucide-react';
import { useTableContext } from '@/context/TableContext';

const NAV_ITEMS = [
  { href: '/home',    label: 'Home',    icon: Home,          desc: 'Dashboard utama' },
  { href: '/map',     label: 'Map',     icon: Map,           desc: 'Peta lantai live' },
  { href: '/booking', label: 'Booking', icon: CalendarClock, desc: 'Reservasi meja' },
  { href: '/profile', label: 'Profile', icon: User,          desc: 'Akun & pengaturan' },
] as const;

export default function Header() {
  const { isSimulation, toggleSimulation } = useTableContext();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[#3a0f49] bg-[#4B135F] backdrop-blur-lg">
        <div className="mx-auto flex max-w-md items-center justify-between px-5 py-4">
          {/* Brand */}
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/CWClub.png" alt="CWClub Logo" className="h-9 w-9 object-contain" />
            <span className="text-base font-bold tracking-wide text-white">
              CW<span className="text-[#ffffff]">Monitor</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Notification bell */}
            <button className="relative flex items-center justify-center rounded-full border border-white/30 bg-white/10 p-2 text-white transition-colors hover:border-white/50">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
            </button>

            {/* Simulation toggle */}
            <button
              onClick={toggleSimulation}
              className="flex items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white/80 transition-colors hover:border-white/50"
            >
              {isSimulation ? (
                <>
                  <motion.span
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <MonitorSmartphone className="h-4 w-4 text-amber-400" />
                  </motion.span>
                  SIM
                </>
              ) : (
                <>
                  <Radio className="h-4 w-4 text-emerald-400" />
                  LIVE
                </>
              )}
            </button>

            {/* Hamburger button */}
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center justify-center rounded-full border border-white/30 bg-white/10 p-2 text-white transition-colors hover:border-white/50"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            />

            {/* Slide-down menu */}
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="fixed left-0 right-0 top-[57px] z-50 mx-auto max-w-md px-4"
            >
              <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl">
                {NAV_ITEMS.map((item, i) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center gap-4 px-5 py-4 transition-colors ${
                        i < NAV_ITEMS.length - 1 ? 'border-b border-neutral-100' : ''
                      } ${isActive ? 'bg-[#4B135F]/5' : 'hover:bg-neutral-50'}`}
                    >
                      <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                        isActive ? 'bg-[#4B135F] text-white' : 'bg-neutral-100 text-neutral-500'
                      }`}>
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${isActive ? 'text-[#4B135F]' : 'text-neutral-800'}`}>
                          {item.label}
                        </p>
                        <p className="text-xs text-neutral-400">{item.desc}</p>
                      </div>
                      {isActive && (
                        <span className="ml-auto h-2 w-2 rounded-full bg-[#4B135F]" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
