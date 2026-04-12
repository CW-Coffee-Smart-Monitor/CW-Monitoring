/**
 * Mock/seed data for CW Coffee tables.
 * Used in Simulation Mode and as initial state.
 */
import { TableState } from '@/types';

/** Initial table configuration for CW Coffee (16 tables) */
export const INITIAL_TABLES: TableState[] = [
  {
    id: 1, name: 'Meja 01', status: 'available', uid: null,
    isOccupied: false, distance: 120, isGhostBooking: false,
    checkInTime: null, elapsedSeconds: 0,
    facilities: [{ label: 'Colokan', icon: 'Plug' }, { label: 'WiFi Kuat', icon: 'Wifi' }],
    zone: 'Indoor A', seatType: 'Sofa',
  },
  {
    id: 2, name: 'Meja 02', status: 'available', uid: null,
    isOccupied: false, distance: 150, isGhostBooking: false,
    checkInTime: null, elapsedSeconds: 0,
    facilities: [{ label: 'Colokan', icon: 'Plug' }],
    zone: 'Indoor A', seatType: 'Kursi Kayu',
  },
  {
    id: 3, name: 'Meja 03', status: 'available', uid: null,
    isOccupied: false, distance: 100, isGhostBooking: false,
    checkInTime: null, elapsedSeconds: 0,
    facilities: [{ label: 'Dekat Jendela', icon: 'Sun' }, { label: 'Colokan', icon: 'Plug' }],
    zone: 'Indoor A', seatType: 'Sofa',
  },
  {
    id: 4, name: 'Meja 04', status: 'available', uid: null,
    isOccupied: false, distance: 200, isGhostBooking: false,
    checkInTime: null, elapsedSeconds: 0,
    facilities: [{ label: 'Tenang', icon: 'Volume1' }],
    zone: 'Indoor B', seatType: 'Kursi Kayu',
  },
  {
    id: 5, name: 'Meja 05', status: 'available', uid: null,
    isOccupied: false, distance: 180, isGhostBooking: false,
    checkInTime: null, elapsedSeconds: 0,
    facilities: [{ label: 'Tenang', icon: 'Volume1' }, { label: 'Colokan', icon: 'Plug' }],
    zone: 'Indoor B', seatType: 'Bean Bag',
  },
  {
    id: 6, name: 'Meja 06', status: 'available', uid: null,
    isOccupied: false, distance: 130, isGhostBooking: false,
    checkInTime: null, elapsedSeconds: 0,
    facilities: [{ label: 'Dekat Jendela', icon: 'Sun' }],
    zone: 'Indoor B', seatType: 'Sofa',
  },
  {
    id: 7, name: 'Meja 07', status: 'available', uid: null,
    isOccupied: false, distance: 110, isGhostBooking: false,
    checkInTime: null, elapsedSeconds: 0,
    facilities: [{ label: 'Colokan', icon: 'Plug' }, { label: 'WiFi Kuat', icon: 'Wifi' }],
    zone: 'Indoor C', seatType: 'Kursi Kayu',
  },
  {
    id: 8, name: 'Meja 08', status: 'available', uid: null,
    isOccupied: false, distance: 160, isGhostBooking: false,
    checkInTime: null, elapsedSeconds: 0,
    facilities: [{ label: 'Meeting Area', icon: 'Users' }],
    zone: 'Indoor C', seatType: 'Kursi Kayu',
  },
  {
    id: 9, name: 'Meja 09', status: 'available', uid: null,
    isOccupied: false, distance: 140, isGhostBooking: false,
    checkInTime: null, elapsedSeconds: 0,
    facilities: [{ label: 'Colokan', icon: 'Plug' }],
    zone: 'Outdoor', seatType: 'Kursi Besi',
  },
  {
    id: 10, name: 'Meja 10', status: 'available', uid: null,
    isOccupied: false, distance: 170, isGhostBooking: false,
    checkInTime: null, elapsedSeconds: 0,
    facilities: [{ label: 'Pemandangan', icon: 'Trees' }],
    zone: 'Outdoor', seatType: 'Kursi Besi',
  },
  {
    id: 11, name: 'Meja 11', status: 'available', uid: null,
    isOccupied: false, distance: 190, isGhostBooking: false,
    checkInTime: null, elapsedSeconds: 0,
    facilities: [{ label: 'Colokan', icon: 'Plug' }, { label: 'Dekat Jendela', icon: 'Sun' }],
    zone: 'Indoor A', seatType: 'Sofa',
  },
  {
    id: 12, name: 'Meja 12', status: 'available', uid: null,
    isOccupied: false, distance: 125, isGhostBooking: false,
    checkInTime: null, elapsedSeconds: 0,
    facilities: [{ label: 'Dekat Jendela', icon: 'Sun' }, { label: 'Colokan', icon: 'Plug' }],
    zone: 'Indoor A', seatType: 'Sofa',
  },
  {
    id: 13, name: 'Meja 13', status: 'available', uid: null,
    isOccupied: false, distance: 115, isGhostBooking: false,
    checkInTime: null, elapsedSeconds: 0,
    facilities: [{ label: 'WiFi Kuat', icon: 'Wifi' }],
    zone: 'Indoor B', seatType: 'Kursi Kayu',
  },
  {
    id: 14, name: 'Meja 14', status: 'available', uid: null,
    isOccupied: false, distance: 145, isGhostBooking: false,
    checkInTime: null, elapsedSeconds: 0,
    facilities: [{ label: 'Tenang', icon: 'Volume1' }, { label: 'Colokan', icon: 'Plug' }],
    zone: 'Indoor C', seatType: 'Bean Bag',
  },
  {
    id: 15, name: 'Meja 15', status: 'available', uid: null,
    isOccupied: false, distance: 155, isGhostBooking: false,
    checkInTime: null, elapsedSeconds: 0,
    facilities: [{ label: 'Meeting Area', icon: 'Users' }, { label: 'Colokan', icon: 'Plug' }],
    zone: 'Indoor C', seatType: 'Kursi Kayu',
  },
  {
    id: 16, name: 'Meja 16', status: 'available', uid: null,
    isOccupied: false, distance: 200, isGhostBooking: false,
    checkInTime: null, elapsedSeconds: 0,
    facilities: [{ label: 'Pemandangan', icon: 'Trees' }, { label: 'Colokan', icon: 'Plug' }],
    zone: 'Outdoor', seatType: 'Kursi Besi',
  },
];
