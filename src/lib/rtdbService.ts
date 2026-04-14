/**
 * rtdbService.ts
 * Firebase Realtime Database listener & writer untuk data dari ESP32 (Wokwi).
 *
 * Struktur RTDB:
 *   tables/{tableId}/
 *     status        : "available" | "occupied" | "warning" | "offline"
 *     isOccupied    : boolean
 *     uid           : string | null   (dari RFID MFRC522)
 *     distance      : number          (dari HC-SR04, dalam cm)
 *     isGhostBooking: boolean
 *     checkInTime   : number | null   (unix ms)
 *     elapsedSeconds: number
 *     updatedAt     : number          (unix ms, di-set oleh ESP32)
 */

import { ref, onValue, off, set } from 'firebase/database';
import { rtdb } from './firebase';
import type { TableDoc } from './firestoreService';

/**
 * Langganan real-time ke /tables di RTDB.
 * Setiap kali ESP32 mengirim data baru, callback dipanggil.
 * Mengembalikan fungsi unsubscribe.
 */
export function subscribeToRTDB(
  callback: (updates: Record<number, TableDoc>) => void
): () => void {
  if (!rtdb) {
    console.warn('[RTDB] NEXT_PUBLIC_FIREBASE_DATABASE_URL belum dikonfigurasi — RTDB dinonaktifkan.');
    return () => {};
  }

  const tablesRef = ref(rtdb, 'tables');

  onValue(tablesRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    const updates: Record<number, TableDoc> = {};
    for (const [key, value] of Object.entries(data)) {
      const id = Number(key);
      if (!isNaN(id) && value && typeof value === 'object') {
        updates[id] = value as TableDoc;
      }
    }
    callback(updates);
  });

  return () => off(tablesRef);
}

/**
 * Tulis status satu meja ke RTDB (dari app → RTDB, opsional).
 * Biasanya ESP32 yang menulis; fungsi ini untuk keperluan override manual.
 */
export async function writeTableToRTDB(
  tableId: number,
  data: Partial<TableDoc>
): Promise<void> {
  if (!rtdb) return;
  const tableRef = ref(rtdb, `tables/${tableId}`);
  await set(tableRef, { ...data, updatedAt: Date.now() });
}
