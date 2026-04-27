'use client';

/**
 * Header — Two-tier layout:
 * 1. Top announcement bar (dark, desktop only)
 * 2. Main white header (logo | nav | actions)
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Radio, MonitorSmartphone, Menu, X,
  Home, Map, CalendarClock, User, Bell, ChevronRight,
} from 'lucide-react';
import { useTableContext } from '@/context/TableContext';

const NAV_ITEMS = [
  { href: '/home',    label: 'Home',    icon: Home,          desc: 'Dashboard utama'  },
  { href: '/map',     label: 'Map',     icon: Map,           desc: 'Peta lantai live' },
  { href: '/booking', label: 'Booking', icon: CalendarClock, desc: 'Reservasi meja'   },
  { href: '/profile', label: 'Profile', icon: User,          desc: 'Akun & pengaturan'},
] as const;

export default function Header() {
  const { isSimulation, toggleSimulation } = useTableContext();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="sticky top-0 z-40">

      {/* ── TIER 1: Announcement / status bar (desktop only) ── */}
      <div className="hidden bg-[#2a0838] px-6 py-2 md:block">
        <div className="mx-auto flex max-w-screen-2xl items-center justify-center gap-3">
          <span className="rounded-full bg-[#D07E20] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">
            Live
          </span>
          <p className="text-xs text-white/65">
            Monitoring real-time CW Coffee — sistem aktif &amp; terhubung
          </p>
          <ChevronRight className="h-3.5 w-3.5 text-white/35" />
        </div>
      </div>

      {/* ── TIER 2: Main header ── */}
      <header className="border-b border-neutral-150 bg-white shadow-sm">

        {/* Desktop */}
        <div className="hidden items-center gap-6 px-8 py-5 md:flex">

          {/* Brand */}
          <Link href="/home" className="flex shrink-0 items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/CWClub.png" alt="CWClub Logo" className="h-10 w-10 object-contain" />
            <span className="text-lg font-bold tracking-wide text-[#4B135F]">CWMonitor</span>
          </Link>

          {/* Divider */}
          <div className="h-5 w-px bg-neutral-200" />

          {/* Nav links */}
          <nav className="flex items-center gap-0.5">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-[#4B135F]'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0.5 left-4 right-4 h-0.5 rounded-full bg-[#4B135F]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right actions */}
          <div className="flex items-center gap-2">

            {/* Notification bell */}
            <button className="relative flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900">
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
            </button>

            {/* Divider */}
            <div className="mx-1 h-5 w-px bg-neutral-200" />

            {/* Simulation toggle */}
            <button
              onClick={toggleSimulation}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
            >
              {isSimulation ? (
                <>
                  <motion.span
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <MonitorSmartphone className="h-4 w-4 text-amber-500" />
                  </motion.span>
                  Simulation
                </>
              ) : (
                <>
                  <Radio className="h-4 w-4 text-emerald-500" />
                  Live
                </>
              )}
            </button>

            {/* CTA — "Pesan Meja" pill button */}
            <Link
              href="/booking"
              className="rounded-full bg-[#4B135F] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#3a0f49] hover:shadow-md active:scale-[0.97]"
            >
              Pesan Meja
            </Link>

            {/* Avatar */}
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#4B135F] text-xs font-bold text-white shadow-sm">
              CW
            </div>
          </div>
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-3 px-4 py-3 md:hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/CWClub.png" alt="CWClub Logo" className="h-8 w-8 object-contain" />
          <span className="text-base font-bold tracking-wide text-[#4B135F]">CWMonitor</span>
          <div className="flex-1" />
          <button className="relative flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100">
            <Bell className="h-4.5 w-4.5" />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
          </button>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition-colors hover:bg-neutral-100"
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

      </header>

      {/* Mobile slide-down menu */}
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
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="fixed left-0 right-0 top-13 z-50 mx-auto max-w-md px-4"
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
                      {isActive && <span className="ml-auto h-2 w-2 rounded-full bg-[#4B135F]" />}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
