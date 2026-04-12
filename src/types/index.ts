/**
 * CW-SmartMonitor — Core Type Definitions
 * Defines all shared types for table monitoring system.
 */

/** Possible visual statuses for a table */
export type TableStatus = 'available' | 'occupied' | 'warning' | 'offline';

/** Raw sensor payload from ESP32 */
export interface SensorPayload {
  tableId: number;
  uid: string;
  isOccupied: boolean;
  distance: number; // in centimeters
  timestamp?: number;
}

/** Processed table state used by the UI */
export interface TableState {
  id: number;
  name: string;
  status: TableStatus;
  uid: string | null;
  isOccupied: boolean;
  distance: number;
  isGhostBooking: boolean;
  checkInTime: number | null;      // Unix timestamp ms
  elapsedSeconds: number;
  facilities: TableFacility[];
  zone: string;
  seatType: string;
}

/** Facility tags attached to each table */
export interface TableFacility {
  label: string;
  icon: string; // Lucide icon name
}

/** Summary statistics for the Home dashboard */
export interface DashboardSummary {
  totalTables: number;
  available: number;
  occupied: number;
  warnings: number;
  offline: number;
}

/** A single booking history entry */
export interface BookingRecord {
  id: string;
  tableId: number;
  tableName: string;
  uid: string;
  checkIn: number;   // Unix timestamp ms
  checkOut: number;   // Unix timestamp ms
  durationMinutes: number;
}

/** User profile linked to an RFID card */
export interface UserProfile {
  id: string;
  name: string;
  rfidUid: string;
  totalVisits: number;
  totalMinutes: number;
  preferredTable: number | null;
  productiveHours: number[]; // array of 24 values (per-hour minutes)
}
