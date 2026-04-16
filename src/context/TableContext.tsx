'use client';

/**
 * TableContext — Global state management for all table statuses.
 *
 * Responsibilities:
 * - Store & expose the current state of every table.
 * - Process incoming sensor payloads (from hardware or simulation).
 * - Implement ghost-booking detection with 3-second smoothing.
 * - Track elapsed time per occupied table.
 * - Provide dashboard summary metrics.
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { TableState, SensorPayload, DashboardSummary, BookingRecord } from '@/types';
import { Reservation } from '@/types/reservation';
import { INITIAL_TABLES } from '@/data/tables';
import { CONFIG } from '@/lib/config';
import { subscribeToTables, saveTableStatus, saveBookingRecord, TableDoc, subscribeToActiveReservations, updateReservationStatus } from '@/lib/firestoreService';
import { subscribeToRTDB } from '@/lib/rtdbService';

// ──────────────────────────── Types ────────────────────────────

interface TableContextValue {
  tables: TableState[];
  summary: DashboardSummary;
  bookingHistory: BookingRecord[];
  isSimulation: boolean;
  processSensorData: (payload: SensorPayload) => void;
  toggleSimulation: () => void;
  demoSetStatus: (tableId: number, status: TableState['status']) => void;
  reserveTable: (tableId: number, reservationId: string, guestName: string, expiresAt: number) => void;
}

type Action =
  | { type: 'SENSOR_UPDATE'; payload: SensorPayload }
  | { type: 'TICK' }
  | { type: 'GHOST_CONFIRM'; tableId: number }
  | { type: 'CHECKOUT'; tableId: number; record: BookingRecord }
  | { type: 'DEMO_SET'; tableId: number; status: TableState['status'] }
  | { type: 'FIRESTORE_SYNC'; updates: Record<number, TableDoc> }
  | { type: 'RTDB_SYNC'; updates: Record<number, TableDoc> }
  | { type: 'RESERVE_TABLE'; tableId: number; reservationId: string; guestName: string; expiresAt: number }
  | { type: 'CANCEL_RESERVATION'; tableId: number }
  | { type: 'SYNC_RESERVATIONS'; reservations: Reservation[] };

interface State {
  tables: TableState[];
  bookingHistory: BookingRecord[];
  /** ID tabel yang dikontrol RTDB (ESP32) — tidak boleh di-overwrite Firestore */
  rtdbControlled: Set<number>;
  /** ID tabel yang sedang dalam status reserved (dari UI) */
  reservedTables: Set<number>;
}

// ──────────────────────────── Reducer ──────────────────────────

function tableReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SENSOR_UPDATE': {
      const { tableId, uid, isOccupied, distance } = action.payload;
      return {
        ...state,
        tables: state.tables.map((t) => {
          if (t.id !== tableId) return t;

          // Check-out: was occupied, now not
          if (t.isOccupied && !isOccupied) {
            return {
              ...t,
              status: 'available',
              uid: null,
              isOccupied: false,
              distance,
              isGhostBooking: false,
              checkInTime: null,
              elapsedSeconds: 0,
            };
          }

          // Check-in: was free, now occupied
          if (!t.isOccupied && isOccupied) {
            return {
              ...t,
              status: 'occupied',
              uid,
              isOccupied: true,
              distance,
              isGhostBooking: false,
              checkInTime: Date.now(),
              elapsedSeconds: 0,
            };
          }

          // Ongoing occupancy — update distance (ghost logic handled by timer)
          return { ...t, distance, uid: uid || t.uid };
        }),
      };
    }

    case 'TICK': {
      const now = Date.now();
      return {
        ...state,
        tables: state.tables.map((t) => {
          if (!t.isOccupied || !t.checkInTime) return t;
          const elapsed = Math.floor((now - t.checkInTime) / 1000);
          return { ...t, elapsedSeconds: elapsed };
        }),
      };
    }

    case 'GHOST_CONFIRM': {
      return {
        ...state,
        tables: state.tables.map((t) =>
          t.id === action.tableId
            ? { ...t, status: 'warning', isGhostBooking: true }
            : t
        ),
      };
    }

    case 'CHECKOUT': {
      return {
        ...state,
        tables: state.tables.map((t) =>
          t.id === action.tableId
            ? {
                ...t,
                status: 'available',
                uid: null,
                isOccupied: false,
                isGhostBooking: false,
                checkInTime: null,
                elapsedSeconds: 0,
                distance: 200,
              }
            : t
        ),
        bookingHistory: [action.record, ...state.bookingHistory],
      };
    }

    case 'DEMO_SET': {
      return {
        ...state,
        tables: state.tables.map((t) => {
          if (t.id !== action.tableId) return t;
          const isOcc = action.status === 'occupied' || action.status === 'warning';
          return {
            ...t,
            status: action.status,
            isOccupied: isOcc,
            isGhostBooking: action.status === 'warning',
            distance: action.status === 'warning' ? 90 : isOcc ? 30 : 200,
            checkInTime: isOcc ? (t.checkInTime ?? Date.now()) : null,
            elapsedSeconds: isOcc ? t.elapsedSeconds : 0,
            uid: isOcc ? (t.uid ?? 'DEMO-USER') : null,
          };
        }),
      };
    }

    case 'RTDB_SYNC': {
      const newControlled = new Set(state.rtdbControlled);
      const newReservedRTDB = new Set(state.reservedTables);
      return {
        ...state,
        rtdbControlled: newControlled,
        reservedTables: newReservedRTDB,
        tables: state.tables.map((t) => {
          const remote = action.updates[t.id];
          if (!remote) return t;
          newControlled.add(t.id);
          const isOcc = remote.isOccupied ?? false;
          const elapsed = remote.elapsedSeconds ?? 0;
          // ESP32 mengirim elapsedSeconds dari millis(), bukan unix timestamp.
          // Hitung checkInTime mundur dari sekarang agar timer website sinkron.
          const inferredCheckIn = isOcc && elapsed > 0
            ? Date.now() - elapsed * 1000
            : (isOcc ? Date.now() : null);
          // Jika meja reserved dan orang datang tap RFID → hapus reservation state
          const clearReservation = t.status === 'reserved' && isOcc;
          if (clearReservation) newReservedRTDB.delete(t.id);
          return {
            ...t,
            status:         remote.status,
            uid:            remote.uid ?? null,
            isOccupied:     isOcc,
            distance:       remote.distance ?? t.distance,
            isGhostBooking: remote.isGhostBooking ?? false,
            checkInTime:    inferredCheckIn,
            elapsedSeconds: elapsed,
            ...(clearReservation ? { reservationId: null, reservedBy: null, reservedUntil: null } : {}),
          };
        }),
      };
    }

    case 'FIRESTORE_SYNC': {
      return {
        ...state,
        tables: state.tables.map((t) => {
          // Jangan overwrite tabel yang sudah dikontrol RTDB (ESP32) atau sedang reserved
          if (state.rtdbControlled.has(t.id) || state.reservedTables.has(t.id)) return t;
          const remote = action.updates[t.id];
          if (!remote) return t;
          return {
            ...t,
            status:        remote.status,
            uid:           remote.uid ?? null,
            isOccupied:    remote.isOccupied ?? false,
            distance:      remote.distance ?? t.distance,
            isGhostBooking: remote.isGhostBooking ?? false,
            checkInTime:   remote.checkInTime ?? null,
            elapsedSeconds: remote.elapsedSeconds ?? 0,
          };
        }),
      };
    }

    case 'RESERVE_TABLE': {
      const newReserved = new Set(state.reservedTables);
      newReserved.add(action.tableId);
      return {
        ...state,
        reservedTables: newReserved,
        tables: state.tables.map((t) =>
          t.id === action.tableId ? {
            ...t,
            status: 'reserved' as const,
            reservationId: action.reservationId,
            reservedBy: action.guestName,
            reservedUntil: action.expiresAt,
          } : t
        ),
      };
    }

    case 'CANCEL_RESERVATION': {
      const newReservedC = new Set(state.reservedTables);
      newReservedC.delete(action.tableId);
      return {
        ...state,
        reservedTables: newReservedC,
        tables: state.tables.map((t) =>
          t.id === action.tableId && t.status === 'reserved' ? {
            ...t,
            status: 'available' as const,
            reservationId: null,
            reservedBy: null,
            reservedUntil: null,
          } : t
        ),
      };
    }

    case 'SYNC_RESERVATIONS': {
      const now = Date.now();
      const newReservedS = new Set<number>();
      // Build map: tableId → most recent active reservation
      const activeByTable = new Map<number, Reservation>();
      for (const res of action.reservations) {
        if (res.expiresAt > now) {
          const existing = activeByTable.get(res.tableId);
          if (!existing || existing.expiresAt < res.expiresAt) {
            activeByTable.set(res.tableId, res);
          }
        }
      }
      const updatedTables = state.tables.map((t) => {
        const activeRes = activeByTable.get(t.id);
        const wasReserved = state.reservedTables.has(t.id);
        if (activeRes && !state.rtdbControlled.has(t.id) && t.status !== 'occupied' && t.status !== 'warning') {
          newReservedS.add(t.id);
          return {
            ...t,
            status: 'reserved' as const,
            reservationId: activeRes.id,
            reservedBy: activeRes.guestName,
            reservedUntil: activeRes.expiresAt,
          };
        } else if (wasReserved && !activeRes) {
          // Reservation expired or removed in Firestore
          return {
            ...t,
            status: 'available' as const,
            reservationId: null,
            reservedBy: null,
            reservedUntil: null,
          };
        }
        if (t.status === 'reserved') newReservedS.add(t.id);
        return t;
      });
      return { ...state, reservedTables: newReservedS, tables: updatedTables };
    }

    default:
      return state;
  }
}

// ──────────────────────────── Context ──────────────────────────

const TableContext = createContext<TableContextValue | null>(null);

export function TableProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(tableReducer, {
    tables: INITIAL_TABLES,
    bookingHistory: [],
    rtdbControlled: new Set<number>(),
    reservedTables: new Set<number>(),
  });

  const [isSimulation, setIsSimulation] = React.useState(
    CONFIG.dataMode === 'simulation'
  );

  // Ghost-booking timers per table
  const ghostTimers = useRef<Map<number, NodeJS.Timeout>>(new Map());

  /** Process raw sensor data with ghost-smoothing logic */
  const processSensorData = useCallback(
    (payload: SensorPayload) => {
      dispatch({ type: 'SENSOR_UPDATE', payload });

      const table = state.tables.find((t) => t.id === payload.tableId);
      if (!table) return;

      const isAboveThreshold = payload.distance > CONFIG.ghostThresholdCm;
      const timerKey = payload.tableId;

      if (payload.isOccupied && isAboveThreshold) {
        // Start ghost timer if not already running
        if (!ghostTimers.current.has(timerKey)) {
          const timer = setTimeout(() => {
            dispatch({ type: 'GHOST_CONFIRM', tableId: payload.tableId });
            ghostTimers.current.delete(timerKey);
          }, CONFIG.ghostDelayMs);
          ghostTimers.current.set(timerKey, timer);
        }
      } else {
        // Cancel ghost timer — person is present or table freed
        const existing = ghostTimers.current.get(timerKey);
        if (existing) {
          clearTimeout(existing);
          ghostTimers.current.delete(timerKey);
        }
      }
    },
    [state.tables]
  );

  /** Toggle between simulation and hardware mode */
  const toggleSimulation = useCallback(() => {
    setIsSimulation((prev) => !prev);
  }, []);

  /** Demo shortcut: instantly set a table's status (for presentations) */
  const demoSetStatus = useCallback(
    (tableId: number, status: TableState['status']) => {
      dispatch({ type: 'DEMO_SET', tableId, status });
    },
    []
  );

  /** Tandai meja sebagai reserved oleh user dari UI */
  const reserveTable = useCallback(
    (tableId: number, reservationId: string, guestName: string, expiresAt: number) => {
      dispatch({ type: 'RESERVE_TABLE', tableId, reservationId, guestName, expiresAt });
    },
    []
  );

  // Tick every second to update elapsed timers
  useEffect(() => {
    const interval = setInterval(() => dispatch({ type: 'TICK' }), 1000);
    return () => clearInterval(interval);
  }, []);

  // ── Firestore real-time listener ──────────────────────────────
  useEffect(() => {
    const unsub = subscribeToTables((updates) => {
      dispatch({ type: 'FIRESTORE_SYNC', updates });
    });
    return () => unsub();
  }, []);

  // ── Realtime Database listener (data dari ESP32 / Wokwi) ──────
  // currentTablesRef selalu menyimpan state terbaru agar bisa diakses
  // di dalam closure RTDB listener tanpa re-subscribe setiap render.
  const currentTablesRef = useRef<TableState[]>(state.tables);
  useEffect(() => {
    currentTablesRef.current = state.tables;
  }, [state.tables]);

  useEffect(() => {
    const unsub = subscribeToRTDB((updates) => {
      // Cek SEBELUM dispatch: meja mana yang transisi reserved → occupied
      // Kalau ketemu, langsung update Firestore reservasi: pending → confirmed
      currentTablesRef.current.forEach((t) => {
        const remote = updates[t.id];
        if (!remote) return;
        const isNowOccupied = remote.isOccupied ?? false;
        if (t.status === 'reserved' && isNowOccupied && t.reservationId) {
          updateReservationStatus(t.reservationId, 'confirmed').catch(console.error);
        }
      });
      dispatch({ type: 'RTDB_SYNC', updates });
    });
    return () => unsub();
  }, []); // Hanya subscribe sekali — baca state via ref
  // ── Reservation listener (pending reservations dari Firestore) ──
  useEffect(() => {
    const unsub = subscribeToActiveReservations((reservations) => {
      dispatch({ type: 'SYNC_RESERVATIONS', reservations });
    });
    return () => unsub();
  }, []);

  // ── Auto-cancel expired reservations (cek setiap 30 detik) ───
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      state.tables.forEach((t) => {
        if (t.status === 'reserved' && t.reservedUntil && now > t.reservedUntil) {
          dispatch({ type: 'CANCEL_RESERVATION', tableId: t.id });
          if (t.reservationId) {
            updateReservationStatus(t.reservationId, 'cancelled').catch(console.error);
          }
        }
      });
    }, 30_000);
    return () => clearInterval(interval);
  }, [state.tables]);
  // ── Write to Firestore when table state changes ───────────────
  // Inisialisasi dengan INITIAL_TABLES agar tidak trigger burst writes saat app pertama load.
  // Skip tabel yang dikontrol RTDB (ESP32) — RTDB sudah jadi sumber kebenaran, tidak perlu mirror ke Firestore.
  const prevTablesRef = useRef<TableState[]>(INITIAL_TABLES);
  useEffect(() => {
    const prev = prevTablesRef.current;
    state.tables.forEach((table) => {
      // Jangan tulis ke Firestore untuk tabel yang dikontrol ESP32 via RTDB
      if (state.rtdbControlled.has(table.id)) return;
      const old = prev.find((t) => t.id === table.id);
      const changed =
        !old ||
        old.status !== table.status ||
        old.isOccupied !== table.isOccupied ||
        old.uid !== table.uid ||
        old.isGhostBooking !== table.isGhostBooking;
      if (changed) {
        saveTableStatus(table).catch(console.error);
      }
    });
    prevTablesRef.current = state.tables;
  }, [state.tables, state.rtdbControlled]);

  // ── Write booking records to Firestore on checkout ────────────
  const prevHistoryLenRef = useRef(0);
  useEffect(() => {
    if (state.bookingHistory.length > prevHistoryLenRef.current) {
      const newest = state.bookingHistory[0];
      saveBookingRecord(newest).catch(console.error);
    }
    prevHistoryLenRef.current = state.bookingHistory.length;
  }, [state.bookingHistory]);

  // Compute dashboard summary
  const summary: DashboardSummary = React.useMemo(() => {
    const s: DashboardSummary = { totalTables: 0, available: 0, occupied: 0, warnings: 0, offline: 0 };
    for (const t of state.tables) {
      s.totalTables++;
      if (t.status === 'available') s.available++;
      else if (t.status === 'occupied') s.occupied++;
      else if (t.status === 'warning') s.warnings++;
      else if (t.status === 'offline') s.offline++;
    }
    return s;
  }, [state.tables]);

  return (
    <TableContext.Provider
      value={{
        tables: state.tables,
        summary,
        bookingHistory: state.bookingHistory,
        isSimulation,
        processSensorData,
        toggleSimulation,
        demoSetStatus,
        reserveTable,
      }}
    >
      {children}
    </TableContext.Provider>
  );
}

/**
 * Custom hook to consume the TableContext.
 * Throws if used outside of <TableProvider>.
 */
export function useTableContext(): TableContextValue {
  const ctx = useContext(TableContext);
  if (!ctx) throw new Error('useTableContext must be used within <TableProvider>');
  return ctx;
}
