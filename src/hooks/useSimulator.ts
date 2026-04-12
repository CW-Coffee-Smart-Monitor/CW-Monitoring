'use client';

/**
 * useSimulator — Mock data generator for demo / simulation mode.
 *
 * Randomly mutates distance values every 5 seconds so the UI
 * reacts with color changes and ghost-booking detection in real-time.
 * Also randomly triggers check-in / check-out events.
 */

import { useEffect, useRef } from 'react';
import { useTableContext } from '@/context/TableContext';

export function useSimulator() {
  const { tables, isSimulation, processSensorData } = useTableContext();
  const tablesRef = useRef(tables);
  tablesRef.current = tables;

  useEffect(() => {
    if (!isSimulation) return;

    const interval = setInterval(() => {
      const currentTables = tablesRef.current;
      // Pick a random table to simulate
      const idx = Math.floor(Math.random() * currentTables.length);
      const table = currentTables[idx];

      if (table.isOccupied) {
        // 30% chance to randomize distance (simulate person moving / leaving)
        if (Math.random() < 0.3) {
          const newDistance = Math.random() < 0.4
            ? Math.floor(Math.random() * 40) + 20   // 20-60cm (present)
            : Math.floor(Math.random() * 100) + 70;  // 70-170cm (away)
          processSensorData({
            tableId: table.id,
            uid: table.uid ?? 'SIM-USER',
            isOccupied: true,
            distance: newDistance,
          });
        }
        // 10% chance to check out
        if (Math.random() < 0.1) {
          processSensorData({
            tableId: table.id,
            uid: table.uid ?? '',
            isOccupied: false,
            distance: 200,
          });
        }
      } else {
        // 15% chance to check in a free table
        if (Math.random() < 0.15) {
          const fakeUid = `SIM-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
          processSensorData({
            tableId: table.id,
            uid: fakeUid,
            isOccupied: true,
            distance: Math.floor(Math.random() * 30) + 20, // 20-50cm
          });
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isSimulation, processSensorData]);
}
