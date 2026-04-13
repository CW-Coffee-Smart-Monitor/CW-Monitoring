/**
 * Mock/seed data for CW Coffee tables.
 * Used in Simulation Mode and as initial state.
 *
 * Zone naming: S=Sofa, T=Table, C=Counter, O=Outdoor, R=Regular
 */
import { TableState } from '@/types';

/** Position coordinates for the floor plan SVG (x, y in viewBox units) */
export interface MapPosition { x: number; y: number }

/**
 * Mapping from table id → position on the floor plan.
 * viewBox = "0 0 760 595" — landscape layout matching architectural blueprint.
 *
 * Quadrants:
 *   Upper-Left (8–338, 8–225)  : Booth/Workstation zone → R1 R2 R3
 *   Upper-Right (395–700, 8–225): Communal tables      → T1 T2 T3 T4
 *   Lower-Left (8–338, 252–432) : Sofa booths + grid   → S1 S2 S3 S4
 *   Lower-Right (395–700, 252–432): Tables              → (decoration)
 *   Bottom (8–752, 432–587)     : Seat rows + Counter   → O1 O2 O3 / C1 C2
 */
export const TABLE_POSITIONS: Record<number, MapPosition> = {
  1:  { x: 55,  y: 350 },   // S1  — Lower-Left small table grid
  2:  { x: 148, y: 350 },   // S2
  3:  { x: 55,  y: 390 },   // S3
  4:  { x: 148, y: 390 },   // S4
  5:  { x: 470, y: 48 },    // T1  — Upper-Right communal table row 1
  6:  { x: 420, y: 545 },   // C1  — Bottom counter area
  7:  { x: 60,  y: 458 },   // O1  — Bottom-Left seat rows
  8:  { x: 142, y: 458 },   // O2
  9:  { x: 560, y: 48 },    // T2  — Upper-Right communal table row 1
  10: { x: 510, y: 545 },   // C2  — Bottom counter area
  11: { x: 65,  y: 80 },    // R1  — Upper-Left booth block A
  12: { x: 160, y: 80 },    // R2
  13: { x: 230, y: 458 },   // O3  — Bottom-Left seat rows
  14: { x: 264, y: 80 },    // R3
  15: { x: 470, y: 128 },   // T3  — Upper-Right communal table row 3
  16: { x: 560, y: 128 },   // T4
};

/** Initial table configuration for CW Coffee */
export const INITIAL_TABLES: TableState[] = [
  {
    id: 1, name: 'S1', status: 'available', uid: null,
    isOccupied: false, distance: 120, isGhostBooking: false,
    checkInTime: null, elapsedSeconds: 0,
    facilities: [{ label: 'Colokan', icon: 'Plug' }, { label: 'WiFi Kuat', icon: 'Wifi' }],
    zone: 'Sofa', seatType: 'Sofa',
  },
  {
    id: 2, name: 'S2', status: 'available', uid: null,
    isOccupied: false, distance: 150, isGhostBooking: false,
    checkInTime: null, elapsedSeconds: 0,
    facilities: [{ label: 'Colokan', icon: 'Plug' }, { label: 'WiFi Kuat', icon: 'Wifi' }],
    zone: 'Sofa', seatType: 'Sofa',
  },
  {
    id: 3, name: 'S3', status: 'available', uid: null,
    isOccupied: false, distance: 100, isGhostBooking: false,
    checkInTime: null, elapsedSeconds: 0,
    facilities: [{ label: 'Dekat Jendela', icon: 'Sun' }, { label: 'Colokan', icon: 'Plug' }],
    zone: 'Sofa', seatType: 'Sofa',
  },
  {
    id: 4, name: 'S4', status: 'available', uid: null,
    isOccupied: false, distance: 200, isGhostBooking: false,
    checkInTime: null, elapsedSeconds: 0,
    facilities: [{ label: 'Dekat Jendela', icon: 'Sun' }, { label: 'Colokan', icon: 'Plug' }],
    zone: 'Sofa', seatType: 'Sofa',
  },
  {
    id: 5, name: 'T1', status: 'available', uid: null,
    isOccupied: false, distance: 180, isGhostBooking: false,
    checkInTime: null, elapsedSeconds: 0,
    facilities: [{ label: 'Tenang', icon: 'Volume1' }, { label: 'Colokan', icon: 'Plug' }],
    zone: 'Table', seatType: 'Kursi Kayu',
  },
  {
    id: 6, name: 'C1', status: 'available', uid: null,
    isOccupied: false, distance: 130, isGhostBooking: false,
    checkInTime: null, elapsedSeconds: 0,
    facilities: [{ label: 'Dekat Counter', icon: 'Coffee' }],
    zone: 'Counter', seatType: 'Bar Stool',
  },
  {
    id: 7, name: 'O1', status: 'occupied', uid: 'DEMO-01',
    isOccupied: true, distance: 35, isGhostBooking: false,
    checkInTime: Date.now() - 3600000, elapsedSeconds: 3600,
    facilities: [{ label: 'Pemandangan', icon: 'Trees' }],
    zone: 'Outdoor', seatType: 'Kursi Besi',
  },
  {
    id: 8, name: 'O2', status: 'available', uid: null,
    isOccupied: false, distance: 160, isGhostBooking: false,
    checkInTime: null, elapsedSeconds: 0,
    facilities: [{ label: 'Pemandangan', icon: 'Trees' }, { label: 'Colokan', icon: 'Plug' }],
    zone: 'Outdoor', seatType: 'Kursi Besi',
  },
  {
    id: 9, name: 'T2', status: 'available', uid: null,
    isOccupied: false, distance: 140, isGhostBooking: false,
    checkInTime: null, elapsedSeconds: 0,
    facilities: [{ label: 'Tenang', icon: 'Volume1' }],
    zone: 'Table', seatType: 'Kursi Kayu',
  },
  {
    id: 10, name: 'C2', status: 'available', uid: null,
    isOccupied: false, distance: 170, isGhostBooking: false,
    checkInTime: null, elapsedSeconds: 0,
    facilities: [{ label: 'Dekat Counter', icon: 'Coffee' }, { label: 'Colokan', icon: 'Plug' }],
    zone: 'Counter', seatType: 'Bar Stool',
  },
  {
    id: 11, name: 'R1', status: 'available', uid: null,
    isOccupied: false, distance: 190, isGhostBooking: false,
    checkInTime: null, elapsedSeconds: 0,
    facilities: [{ label: 'Colokan', icon: 'Plug' }, { label: 'WiFi Kuat', icon: 'Wifi' }],
    zone: 'Regular', seatType: 'Kursi Kayu',
  },
  {
    id: 12, name: 'R2', status: 'available', uid: null,
    isOccupied: false, distance: 125, isGhostBooking: false,
    checkInTime: null, elapsedSeconds: 0,
    facilities: [{ label: 'Colokan', icon: 'Plug' }],
    zone: 'Regular', seatType: 'Kursi Kayu',
  },
  {
    id: 13, name: 'O3', status: 'available', uid: null,
    isOccupied: false, distance: 115, isGhostBooking: false,
    checkInTime: null, elapsedSeconds: 0,
    facilities: [{ label: 'Pemandangan', icon: 'Trees' }],
    zone: 'Outdoor', seatType: 'Kursi Besi',
  },
  {
    id: 14, name: 'R3', status: 'available', uid: null,
    isOccupied: false, distance: 145, isGhostBooking: false,
    checkInTime: null, elapsedSeconds: 0,
    facilities: [{ label: 'Meeting Area', icon: 'Users' }, { label: 'Colokan', icon: 'Plug' }],
    zone: 'Regular', seatType: 'Kursi Kayu',
  },
  {
    id: 15, name: 'T3', status: 'available', uid: null,
    isOccupied: false, distance: 155, isGhostBooking: false,
    checkInTime: null, elapsedSeconds: 0,
    facilities: [{ label: 'Tenang', icon: 'Volume1' }, { label: 'Colokan', icon: 'Plug' }],
    zone: 'Table', seatType: 'Kursi Kayu',
  },
  {
    id: 16, name: 'T4', status: 'available', uid: null,
    isOccupied: false, distance: 200, isGhostBooking: false,
    checkInTime: null, elapsedSeconds: 0,
    facilities: [{ label: 'Tenang', icon: 'Volume1' }],
    zone: 'Table', seatType: 'Kursi Kayu',
  },
];
