'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Reservation } from '@/types/reservation';
import {
  buildAdminNotification,
  type AdminNotificationItem,
} from '@/lib/adminNotificationUtils';

const ADMIN_READ_KEY = 'cw_admin_notif_read';
const ADMIN_NOTIF_KEY = 'cw_admin_notifs';

function loadAdminReadIds(): Set<string> {
  try {
    const raw = localStorage.getItem(ADMIN_READ_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch { return new Set(); }
}

function saveAdminReadIds(ids: Set<string>) {
  try {
    localStorage.setItem(ADMIN_READ_KEY, JSON.stringify([...ids]));
  } catch {}
}

function loadAdminNotifications(): AdminNotificationItem[] {
  try {
    const raw = localStorage.getItem(ADMIN_NOTIF_KEY);
    if (!raw) return [];
    const items = JSON.parse(raw) as AdminNotificationItem[];
    const readIds = loadAdminReadIds();
    return items.map((n) => ({ ...n, isRead: readIds.has(n.id) || n.isRead }));
  } catch { return []; }
}

function saveAdminNotifications(items: AdminNotificationItem[]) {
  try {
    localStorage.setItem(ADMIN_NOTIF_KEY, JSON.stringify(items.slice(0, 100)));
  } catch {}
}

let _cachedInit: { notifs: AdminNotificationItem[]; unread: number } | null = null;

function getInitialState() {
  if (typeof window === 'undefined') return { notifs: [], unread: 0 };
  if (_cachedInit) return _cachedInit;
  const notifs = loadAdminNotifications();
  _cachedInit = { notifs, unread: notifs.filter((n) => !n.isRead).length };
  return _cachedInit;
}

export function useAdminNotifications() {
  const init = getInitialState();

  const [notifications, setNotificationsState] = useState<AdminNotificationItem[]>(init.notifs);
  const [unreadCount, setUnreadCount] = useState<number>(init.unread);
  const notifsRef = useRef<AdminNotificationItem[]>(init.notifs);
  const initialLoadDoneRef = useRef(false);
  const knownReservationIdsRef = useRef<Set<string>>(
    new Set(init.notifs.map((n) => n.reservationId))
  );

  // ✅ Hapus useCallback — fungsi biasa, ref tidak perlu di deps
  function applyNotifications(items: AdminNotificationItem[]) {
    notifsRef.current = items;
    setNotificationsState(items);
    setUnreadCount(items.filter((n) => !n.isRead).length);
  }

  const addNotifications = useCallback((incoming: AdminNotificationItem[]) => {
    const readIds = loadAdminReadIds();
    const existingIds = new Set(notifsRef.current.map((n) => n.id));

    const fresh = incoming
      .filter((n) => !existingIds.has(n.id))
      .map((n) => ({ ...n, isRead: readIds.has(n.id) ? true : n.isRead }));

    if (fresh.length === 0) return;

    const updated = [...fresh, ...notifsRef.current].slice(0, 100);
    saveAdminNotifications(updated);
    _cachedInit = null;
    applyNotifications(updated);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markAllRead = useCallback(() => {
    const updated = notifsRef.current.map((n) => ({ ...n, isRead: true }));
    const readIds = new Set(updated.map((n) => n.id));
    saveAdminReadIds(readIds);
    saveAdminNotifications(updated);
    _cachedInit = null;
    applyNotifications(updated);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markRead = useCallback((id: string) => {
    const updated = notifsRef.current.map((n) =>
      n.id === id ? { ...n, isRead: true } : n
    );
    const readIds = loadAdminReadIds();
    readIds.add(id);
    saveAdminReadIds(readIds);
    saveAdminNotifications(updated);
    _cachedInit = null;
    applyNotifications(updated);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const ref = query(
      collection(db, 'reservations'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(ref, (snapshot) => {
      if (!initialLoadDoneRef.current) {
        snapshot.docs.forEach((docSnap) => {
          knownReservationIdsRef.current.add(docSnap.id);
        });
        initialLoadDoneRef.current = true;
        return;
      }

      const incoming: AdminNotificationItem[] = [];

      snapshot.docChanges().forEach((change) => {
        const data = { id: change.doc.id, ...change.doc.data() } as Reservation;

        if (
          change.type === 'added' &&
          !knownReservationIdsRef.current.has(data.id)
        ) {
          knownReservationIdsRef.current.add(data.id);
          incoming.push(buildAdminNotification(data, 'new'));
        }

        if (change.type === 'modified') {
          incoming.push(buildAdminNotification(data, 'modified'));
        }
      });

      if (incoming.length > 0) addNotifications(incoming);
    });

    return () => unsubscribe();
  }, [addNotifications]);

  return { notifications, unreadCount, markAllRead, markRead };
}