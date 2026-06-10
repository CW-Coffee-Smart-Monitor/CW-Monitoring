'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, X, AlertTriangle, Clock, Loader } from 'lucide-react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { subscribeToUserReservations } from '@/lib/firestoreService';
import { useTableContext } from '@/context/TableContext';
import { useTableStatus } from '@/hooks/useTableStatus';
import { useLanguage } from '@/context/LanguageContext';
import type { Reservation } from '@/types/reservation';

export default function ActiveBookingBanner() {
  const { tables } = useTableContext();
  const { t } = useLanguage();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userActiveRes, setUserActiveRes] = useState<Reservation | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [lastResId, setLastResId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      // ✅ setState di dalam callback Firebase — diizinkan
      setCurrentUser(user);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!currentUser) {
      // ✅ Wrap dengan Promise.resolve agar tidak synchronous di body effect
      Promise.resolve().then(() => setUserActiveRes(null));
      return;
    }

    const unsub = subscribeToUserReservations(
      currentUser.uid,
      (reservations) => {
        // ✅ setState di dalam callback — diizinkan
        const active = reservations.find(
          (r) => r.status === 'confirmed' || r.status === 'pending'
        );
        setUserActiveRes(active ?? null);
      },
      (error) => {
        console.error('ACTIVE BOOKING BANNER ERROR:', error);
      }
    );

    return () => unsub();
  }, [currentUser]);

  // ✅ Reset dismissal — setState di dalam kondisi perbandingan ref
  useEffect(() => {
    if (userActiveRes?.id !== lastResId) {
      Promise.resolve().then(() => {
        setIsDismissed(false);
        setLastResId(userActiveRes?.id ?? null);
      });
    }
  }, [userActiveRes, lastResId]);

  const activeTable = useMemo(() => {
    if (!userActiveRes) return null;
    const tableIds = userActiveRes.coveredTableIds ?? (userActiveRes.tableId ? [userActiveRes.tableId] : []);
    const matchingTables = tables.filter((t) => tableIds.includes(t.id));
    const occupiedTable = matchingTables.find((t) => t.isOccupied);
    return occupiedTable ?? matchingTables[0] ?? null;
  }, [userActiveRes, tables]);

  if (isDismissed || !userActiveRes || !activeTable) return null;

  let stateType: 'pending' | 'waiting' | 'active' | 'ghost' = 'pending';

  if (userActiveRes.status === 'pending') {
    stateType = 'pending';
  } else if (activeTable.status === 'warning') {
    stateType = 'ghost';
  } else if (activeTable.isOccupied) {
    stateType = 'active';
  } else {
    stateType = 'waiting';
  }

  return (
    <AnimatePresence>
      <ActiveBannerInner
        stateType={stateType}
        tableId={activeTable.id}
        reservation={userActiveRes}
        onClose={() => setIsDismissed(true)}
      />
    </AnimatePresence>
  );
}

interface BannerInnerProps {
  stateType: 'pending' | 'waiting' | 'active' | 'ghost';
  tableId: number;
  reservation: Reservation;
  onClose: () => void;
}

function ActiveBannerInner({ stateType, tableId, reservation, onClose }: BannerInnerProps) {
  const { tables } = useTableContext();
  const { t } = useLanguage();
  const table = tables.find((t) => t.id === tableId)!;
  const { elapsedFormatted } = useTableStatus(table);
  const abb = t.activeBookingBanner;

  const config = useMemo(() => {
    const tableLabel = table
      ? table.name
      : reservation.blockCode
      ? `Blok ${reservation.blockCode}`
      : 'Meja';

    switch (stateType) {
      case 'ghost':
        return {
          title: abb.status.ghost,
          description: abb.desc.ghost.replace('{table}', tableLabel),
          style: 'border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 animate-pulse',
          icon: <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />,
        };
      case 'active':
        return {
          title: `${abb.status.active} — ${tableLabel}`,
          description: abb.desc.active,
          style: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
          icon: <Timer className="h-5 w-5 text-emerald-500 shrink-0" />,
          showTimer: true,
        };
      case 'waiting': {
        const timeStr = reservation.arrivalTime || '';
        return {
          title: `${abb.status.waiting} — ${tableLabel}`,
          description: abb.desc.waiting.replace('{table}', tableLabel).replace('{time}', timeStr),
          style: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400',
          icon: <Clock className="h-5 w-5 text-amber-500 shrink-0" />,
        };
      }
      case 'pending':
      default:
        return {
          title: abb.status.pending,
          description: abb.desc.pending.replace('{table}', tableLabel),
          style: 'border-neutral-200 bg-neutral-50 text-neutral-600 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300',
          icon: <Loader className="h-5 w-5 text-neutral-400 animate-spin shrink-0" />,
        };
    }
  }, [stateType, table, reservation, abb]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className={`mb-4 flex items-start justify-between gap-3 rounded-2xl border p-4 shadow-sm backdrop-blur-sm ${config.style}`}
    >
      <div className="flex items-start gap-3 min-w-0">
        <div className="mt-0.5">{config.icon}</div>
        <div className="min-w-0">
          <p className="text-sm font-bold tracking-tight">{config.title}</p>
          <p className="mt-0.5 text-xs opacity-90">{config.description}</p>
          {config.showTimer && (
            <p className="mt-2 font-mono text-xl font-bold tracking-wider">
              {elapsedFormatted}
            </p>
          )}
        </div>
      </div>
      <button
        onClick={onClose}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full hover:bg-black/5 active:scale-95 transition-all text-current opacity-65 hover:opacity-100"
        aria-label="Dismiss alert"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}