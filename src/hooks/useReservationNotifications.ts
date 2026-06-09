"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { subscribeToUserReservationNotifications } from "@/lib/firestoreService";
import type { NotificationItem } from "@/types/notification";
import type { ReservationNotification } from "@/lib/notificationUtils";

// ─── localStorage helpers ─────────────────────────────────────

function getReadKey(userId: string) {
  return `cw_notif_read_${userId}`;
}

function loadReadIds(userId: string): Set<string> {
  try {
    const raw = localStorage.getItem(getReadKey(userId));
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function saveReadIds(userId: string, ids: Set<string>) {
  try {
    localStorage.setItem(getReadKey(userId), JSON.stringify([...ids]));
  } catch {}
}

function getNotifKey(userId: string) {
  return `cw_notifs_${userId}`;
}

function loadNotificationsFromStorage(userId: string): NotificationItem[] {
  try {
    const raw = localStorage.getItem(getNotifKey(userId));
    if (!raw) return [];
    const items = JSON.parse(raw) as NotificationItem[];
    const readIds = loadReadIds(userId);
    return items.map((n) => ({ ...n, isRead: readIds.has(n.id) || n.isRead }));
  } catch {
    return [];
  }
}

function saveNotificationsToStorage(userId: string, items: NotificationItem[]) {
  try {
    localStorage.setItem(getNotifKey(userId), JSON.stringify(items.slice(0, 50)));
  } catch {}
}

// ─── Hook ─────────────────────────────────────────────────────

export function useReservationNotifications() {
  const userIdRef = useRef<string | null>(null);
  const notifsRef = useRef<NotificationItem[]>([]);

  const [notifications, setNotificationsState] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const applyNotifications = useCallback((items: NotificationItem[]) => {
    notifsRef.current = items;
    setNotificationsState(items);
    setUnreadCount(items.filter((n) => !n.isRead).length);
  }, []);

  const addNotifications = useCallback(
    (incoming: ReservationNotification[]) => {
      const uid = userIdRef.current;
      if (!uid) return;

      const readIds = loadReadIds(uid);
      const existingIds = new Set(notifsRef.current.map((n) => n.id));

      const fresh = incoming
        .filter((n) => !existingIds.has(n.id))
        .map((n) => ({
          ...n,
          isRead: readIds.has(n.id) ? true : n.isRead,
        }));

      if (fresh.length === 0) return;

      const updated = [...fresh, ...notifsRef.current].slice(0, 50);
      saveNotificationsToStorage(uid, updated);
      applyNotifications(updated);
    },
    [applyNotifications],
  );

  // ✅ PERUBAHAN 1: dispatch custom event setelah markAllRead
  const markAllRead = useCallback(() => {
    const uid = userIdRef.current;
    if (!uid) return;

    const updated = notifsRef.current.map((n) => ({ ...n, isRead: true }));
    const readIds = new Set(updated.map((n) => n.id));
    saveReadIds(uid, readIds);
    saveNotificationsToStorage(uid, updated);
    applyNotifications(updated);

    window.dispatchEvent(new Event("cw-notif-updated"));
  }, [applyNotifications]);

  // ✅ PERUBAHAN 2: dispatch custom event setelah markRead
  const markRead = useCallback(
    (id: string) => {
      const uid = userIdRef.current;
      if (!uid) return;

      const updated = notifsRef.current.map((n) => (n.id === id ? { ...n, isRead: true } : n));
      const readIds = loadReadIds(uid);
      readIds.add(id);
      saveReadIds(uid, readIds);
      saveNotificationsToStorage(uid, updated);
      applyNotifications(updated);

      window.dispatchEvent(new Event("cw-notif-updated"));
    },
    [applyNotifications],
  );

  useEffect(() => {
    let unsubscribeReservations: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      unsubscribeReservations?.();

      if (!user) {
        userIdRef.current = null;
        notifsRef.current = [];
        setNotificationsState([]);
        setUnreadCount(0);
        return;
      }

      userIdRef.current = user.uid;

      const saved = loadNotificationsFromStorage(user.uid);
      notifsRef.current = saved;

      setNotificationsState(saved);
      setUnreadCount(saved.filter((n) => !n.isRead).length);

      unsubscribeReservations = subscribeToUserReservationNotifications(user.uid, addNotifications, (error) => console.error("NOTIFICATION ERROR:", error));
    });

    // ✅ PERUBAHAN 3: listener untuk cross-tab (StorageEvent)
    const handleStorageChange = (e: StorageEvent) => {
      const uid = userIdRef.current;
      if (!uid) return;

      const readKey = getReadKey(uid);
      const notifKey = getNotifKey(uid);

      if (e.key === readKey || e.key === notifKey) {
        const updated = loadNotificationsFromStorage(uid);
        applyNotifications(updated);
      }
    };

    // ✅ PERUBAHAN 4: listener untuk same-tab (custom event)
    const handleNotifUpdate = () => {
      const uid = userIdRef.current;
      if (!uid) return;
      const updated = loadNotificationsFromStorage(uid);
      applyNotifications(updated);
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("cw-notif-updated", handleNotifUpdate);

    return () => {
      unsubscribeAuth();
      unsubscribeReservations?.();
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("cw-notif-updated", handleNotifUpdate);
    };
  }, [addNotifications, applyNotifications]);

  return { notifications, unreadCount, markAllRead, markRead };
}
