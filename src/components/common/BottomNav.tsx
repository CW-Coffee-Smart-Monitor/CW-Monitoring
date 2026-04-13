'use client';

/**
 * BottomNav — Mobile bottom navigation bar with 4 menu items.
 * Highlights the active route and uses Framer Motion for the indicator.
 */

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, Map, CalendarClock, User } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/map', label: 'Map', icon: Map },
  { href: '/booking', label: 'Booking', icon: CalendarClock },
  { href: '/profile', label: 'Profile', icon: User },
] as const;

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-neutral-200 bg-white/90 backdrop-blur-lg">
      <div className="mx-auto flex max-w-md items-center justify-around py-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center gap-0.5 px-4 py-1"
            >
              {isActive && (
                <motion.span
                  layoutId="nav-indicator"
                  className="absolute -top-2 h-0.5 w-6 rounded-full bg-[#4B135F]"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <item.icon
                className={`h-5 w-5 transition-colors ${
                  isActive ? 'text-[#4B135F]' : 'text-neutral-400'
                }`}
              />
              <span
                className={`text-[10px] font-medium transition-colors ${
                  isActive ? 'text-[#4B135F]' : 'text-neutral-400'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
