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
import { INITIAL_TABLES } from '@/data/tables';
import { CONFIG } from '@/lib/config';

// ──────────────────────────── Types ────────────────────────────

interface TableContextValue {
  tables: TableState[];
  summary: DashboardSummary;
  bookingHistory: BookingRecord[];
  isSimulation: boolean;
  processSensorData: (payload: SensorPayload) => void;
  toggleSimulation: () => void;
  demoSetStatus: (tableId: number, status: TableState['status']) => void;
}

type Action =
  | { type: 'SENSOR_UPDATE'; payload: SensorPayload }
  | { type: 'TICK' }
  | { type: 'GHOST_CONFIRM'; tableId: number }
  | { type: 'CHECKOUT'; tableId: number; record: BookingRecord }
  | { type: 'DEMO_SET'; tableId: number; status: TableState['status'] };

interface State {
  tables: TableState[];
  bookingHistory: BookingRecord[];
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

  // Tick every second to update elapsed timers
  useEffect(() => {
    const interval = setInterval(() => dispatch({ type: 'TICK' }), 1000);
    return () => clearInterval(interval);
  }, []);

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
