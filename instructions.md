# CW-SmartMonitor — Master Plan & Instructions

> **Refer back to this file** whenever you need context about the project.
> Usage: "Refer back to instructions.md points 4 and 7."

---

## 1. Project Overview & Goals
- **App**: CW-SmartMonitor — Dashboard monitoring meja real-time untuk CW Coffee.
- **Problem**: Ghost Booking (meja dipesan/check-in tapi orangnya tidak ada).
- **Solution**: Validasi ganda — RFID (identitas) + Ultrasonik (kehadiran fisik).

## 2. Tech Stack
- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS (Mobile-first)
- **State**: React Context API (TableContext)
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Data**: Simulation Mode (mock) + Hardware Mode (ESP32 webhook)

## 3. System Architecture
- **IoT Layer**: ESP32 → JSON `{ tableId, uid, isOccupied, distance }`
- **Logic Layer**: `TableContext` + custom hooks (`useTableStatus`, `useSimulator`)
- **UI Layer**: 4 menus — Home, Map, Booking, Profile

## 4. Core Business Logic (Anti-Ghosting)
- **Available**: `isOccupied == false` → LED Hijau
- **Check-in**: RFID tap → `isOccupied = true`, timer starts
- **Safe**: `isOccupied && distance < 60cm`
- **Warning/Ghost**: `isOccupied && distance > 60cm` (for ≥ 3 seconds)
- **Check-out**: RFID tap ulang → `isOccupied = false`, timer resets

## 5. Coding Constraints
- Folder-based components: `src/components/{common,home,map,booking,profile,ui}/`
- `'use client'` only on interactive components
- Descriptive naming: `useTableStatus`, `isGhostBooking`
- **Branding**: Ebony `#1A1A1A`, Warm Amber (accent), Emerald (available), Signal Red (warning)

## 6. Priority 1 (DONE ✓)
- [x] Next.js App Router setup
- [x] `TableContext.tsx` for global state
- [x] Bottom Navigation + Layout
- [x] Home Dashboard (Summary Cards, Table Grid, Recommendation, Active Banner)
- [x] API webhook route (`/api/webhook`)
- [x] Mock data generator (`useSimulator`)

## 7. Error Handling & Edge Cases
- **Sensor Noise**: 3-second smoothing before ghost-booking confirmation
- **Data Null**: Show "Offline" / "Loading" instead of stale data
- **Overstay**: `> 4 hours` → notify admin for manual check

## 8. API & Integration
- **Webhook**: `app/api/webhook/route.ts` — validates & sanitizes ESP32 input
- **Simulation Toggle**: `NEXT_PUBLIC_DATA_MODE` env variable + UI toggle button

## 9. Documentation
- JSDoc on all major functions
- Atomic Design: reusable components in `components/ui/`

## 10. Deployment
- **Frontend**: Vercel (auto-preview on push)
- **Database**: Digital Ocean Shared CPU (if needed later)
- **Demo Mode**: Shortcut to manually change table status for presentations

## 11. Security
- API input validation (tableId 1-100, distance 0-1000, uid max 64 chars)
- `x-api-key` header authentication on webhook
- All secrets in `.env.local`

## 12. Green Computing
- Energy Saver Mode: Deep Sleep command after 30min inactivity
- Sensor Debouncing: data sent every 3 seconds, not every ms

## 13. Menu Features
### Home (The Pulse)
- Dashboard Summary (total, available, occupied, warning, offline)
- Smart Recommendation Card
- Active Booking Banner with countdown

### Map (Interactive Floor Plan)
- SVG-based clickable layout
- Color-coded statuses (green/red/yellow pulsing)
- Table Detail Drawer

### Booking (Management Hub)
- Active Reservation with Live Timer
- Digital Receipt / QR
- Booking History with duration

### Profile (Identity & Insights)
- RFID Sync Status
- Productivity Analytics chart
- Dark Mode toggle + notification prefs
