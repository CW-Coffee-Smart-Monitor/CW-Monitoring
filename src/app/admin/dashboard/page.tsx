"use client";
import { useMemo, useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { Users, Armchair } from "lucide-react";
import { ReservationStatus } from "@/types/reservation";
import { useTableContext } from "@/context/TableContext";
import { db } from "@/lib/firebase";

/* ── Constants ─────────────────────────────────────────────── */

const SVG_W = 609,
  SVG_H = 483;

const TABLE_POS: { id: number; x: number; y: number; w?: number; h?: number }[] = [
  { id: 1,  x: 31,  y: 126 }, { id: 2,  x: 114, y: 127 },
  { id: 3,  x: 31,  y: 189 }, { id: 4,  x: 114, y: 189 },
  { id: 5,  x: 31,  y: 273 }, { id: 6,  x: 112, y: 271 },
  { id: 7,  x: 197, y: 271 }, { id: 8,  x: 448, y: 125 },
  { id: 9,  x: 448, y: 188 }, { id: 10, x: 448, y: 294 },
  { id: 11, x: 448, y: 357 }, { id: 12, x: 28,  y: 461 },
  { id: 13, x: 91,  y: 461 }, { id: 14, x: 154, y: 461 },
  { id: 15, x: 217, y: 461 },
  { id: 16, x: 10,  y: 347, w: 25, h: 61 }, { id: 17, x: 52,  y: 347, w: 25, h: 61 },
  { id: 18, x: 94,  y: 347, w: 25, h: 61 }, { id: 19, x: 136, y: 347, w: 25, h: 61 },
  { id: 20, x: 178, y: 347, w: 25, h: 61 }, { id: 21, x: 220, y: 347, w: 25, h: 61 },
  { id: 22, x: 262, y: 347, w: 25, h: 61 },
  { id: 23, x: 10,  y: 29,  w: 25, h: 64 }, { id: 24, x: 52,  y: 29,  w: 25, h: 64 },
  { id: 25, x: 94,  y: 29,  w: 25, h: 64 }, { id: 26, x: 136, y: 29,  w: 25, h: 64 },
  { id: 27, x: 178, y: 29,  w: 25, h: 64 }, { id: 28, x: 220, y: 29,  w: 25, h: 64 },
  { id: 29, x: 345, y: 29,  w: 25, h: 64 }, { id: 30, x: 388, y: 29,  w: 25, h: 64 },
  { id: 31, x: 430, y: 29,  w: 25, h: 64 }, { id: 32, x: 472, y: 29,  w: 25, h: 64 },
];

const TIME_SLOTS = [
  { label: "08:00", start: 8,  end: 10 }, { label: "10:00", start: 10, end: 12 },
  { label: "12:00", start: 12, end: 14 }, { label: "14:00", start: 14, end: 16 },
  { label: "16:00", start: 16, end: 18 }, { label: "18:00", start: 18, end: 20 },
  { label: "20:00", start: 20, end: 22 }, { label: "22:00", start: 22, end: 24 },
];

/* ── Page ───────────────────────────────────────────────────── */

export default function AdminDashboardPage() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [hoveredBar, setHoveredBar] = useState<{
    label: string; value: number; x: number; y: number;
  } | null>(null);

  const { tables } = useTableContext();
  const selectedTable = selectedId != null ? tables.find((t) => t.id === selectedId) : null;
  const getTableStatus = (id: number) => tables.find((t) => t.id === id)?.status ?? "available";

  /* Live device counts */
  const [availableCount, setAvailableCount] = useState<number | null>(null);
  const [occupiedCount,  setOccupiedCount]  = useState<number | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "devices"), (snap) => {
      let available = 0, occupied = 0;
      snap.docs.forEach((doc) => {
        const s = doc.data().status as string;
        if (s === "available") available++;
        else if (s === "occupied") occupied++;
      });
      setAvailableCount(available);
      setOccupiedCount(occupied);
    });
    return () => unsub();
  }, []);

  /* Live reservations */
  type ReservationAnalysis = {
    id: string; createdAt: string; arrivalTime: string; status: ReservationStatus;
  };
  const [reservations, setReservations] = useState<ReservationAnalysis[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "reservations"), (snap) => {
      setReservations(snap.docs.map((doc) => {
        const d = doc.data();
        return { id: doc.id, createdAt: d.createdAt, arrivalTime: d.arrivalTime, status: d.status };
      }));
    });
    return () => unsub();
  }, []);

  const occupancyBars = useMemo(() =>
    TIME_SLOTS.map((slot) => ({
      label: slot.label,
      value: reservations.filter((res) => {
        const hour = Number(res.arrivalTime.split(":")[0]);
        return res.status === "confirmed" && hour >= slot.start && hour < slot.end;
      }).length,
    })),
  [reservations]);

  const maxBar = Math.max(...occupancyBars.map((b) => b.value), 1);

  /* ── Render ─────────────────────────────────────────────── */

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-800">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Live monitoring and operational control center.
        </p>
      </div>

      {/* ── Live Operation ── */}
      <section>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
          Live Operation
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

          {/* Available */}
          <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
                Available
              </p>
              <p className="mt-1 text-4xl font-bold text-neutral-800">
                {availableCount ?? "—"}
              </p>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-neutral-100">
              <Armchair className="h-6 w-6 text-neutral-400" />
            </div>
          </div>

          {/* Occupied */}
          <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
                Occupied
              </p>
              <p className="mt-1 text-4xl font-bold text-[#4B135F]">
                {occupiedCount ?? "—"}
              </p>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#EDE9F5]">
              <Users className="h-6 w-6 text-[#4B135F]" />
            </div>
          </div>

        </div>
      </section>

      {/* ── Interactive Floor Plan ── */}
      <section>
        <div className="rounded-xl border border-neutral-200 bg-white p-5">

          {/* Card header */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold text-neutral-800">Interactive Floor Plan</p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500">
              <span className="flex items-center gap-1.5">
                <span className="block h-2 w-2 rounded-full bg-green-400" /> Tersedia
              </span>
              <span className="flex items-center gap-1.5">
                <span className="block h-2 w-2 rounded-full bg-red-500" /> Ditempati
              </span>
              <span className="flex items-center gap-1.5">
                <span className="block h-2 w-2 rounded-full bg-yellow-500" /> Reservasi
              </span>
              <span className="text-neutral-300">· Klik meja untuk detail</span>
            </div>
          </div>

          {/* SVG */}
          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
            <svg
              viewBox={`0 0 ${SVG_W} ${SVG_H}`}
              className="block w-full"
              aria-label="CW Coffee interactive floor plan"
              onClick={() => setSelectedId(null)}
            >
              <image href="/Frame 112.svg" x="0" y="0" width={SVG_W} height={SVG_H} />

              {TABLE_POS.map((pos) => {
                const status = getTableStatus(pos.id);
                const w = pos.w ?? 63, h = pos.h ?? 43;
                const x = pos.x - w / 2,  y = pos.y - h / 2;
                const isSelected = selectedId === pos.id;
                const fill =
                  status === "occupied" ? "#ef4444" :
                  status === "reserved" ? "#f59e0b" : "#22c55e";
                const opacity = isSelected ? 0.85 : status !== "available" ? 0.55 : 0.25;

                return (
                  <g key={pos.id} style={{ cursor: "pointer" }}
                    onClick={(e) => { e.stopPropagation(); setSelectedId(isSelected ? null : pos.id); }}>
                    <rect x={x} y={y} width={w} height={h} fill={fill} opacity={opacity} rx={4} />
                    {isSelected && (
                      <rect x={x - 2} y={y - 2} width={w + 4} height={h + 4}
                        fill="none" stroke={fill} strokeWidth={2} rx={5} opacity={0.9} />
                    )}
                    <circle cx={pos.x} cy={pos.y} r={3} fill={fill}
                      opacity={status !== "available" ? 0.9 : 0.5} />
                  </g>
                );
              })}

              {/* Popup */}
              {selectedId !== null && (() => {
                const pos     = TABLE_POS.find((p) => p.id === selectedId)!;
                const table   = selectedTable;
                const occupied = table?.status === "occupied";
                const reserved = table?.status === "reserved";
                const th  = pos.h ?? 43;
                const popW = 192, popH = reserved ? 120 : 60;
                const px  = Math.min(Math.max(pos.x - popW / 2, 6), SVG_W - popW - 6);
                const py  = pos.y > SVG_H / 2
                  ? pos.y - th / 2 - popH - 8
                  : pos.y + th / 2 + 8;

                return (
                  <foreignObject key="popup" x={px} y={py} width={popW} height={popH}>
                    <div style={{
                      background: "white", border: "1px solid #e5e7eb", borderRadius: "10px",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.12)", padding: "10px 12px",
                      fontSize: "10px", lineHeight: "1.45", fontFamily: "inherit",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                        <span style={{ fontWeight: 700, fontSize: "11px", color: "#1a1a1a" }}>
                          Meja {selectedId}
                        </span>
                        <button type="button"
                          onClick={(e) => { e.stopPropagation(); setSelectedId(null); }}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 0, lineHeight: 1 }}>
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                          </svg>
                        </button>
                      </div>

                      {occupied ? (
                        <div style={{ color: "#dc2626", fontWeight: 600 }}>Terisi</div>
                      ) : reserved ? (
                        <>
                          <div style={{ color: "#1f2937", fontWeight: 600, marginBottom: "4px" }}>
                            Atas Nama: {table?.reservedBy ?? "Reservasi"}
                          </div>
                          <div style={{ color: "#6b7280", marginBottom: "4px" }}>
                            Jam: {table?.reservationArrivalTime ?? "-"}
                          </div>
                          <div style={{ color: "#6b7280", marginBottom: "4px" }}>
                            Status: {table?.reservationStatus ?? "-"}
                          </div>
                          <div style={{ color: "#f59e0b", fontWeight: 600 }}>Reservasi</div>
                        </>
                      ) : (
                        <div style={{ color: "#16a34a", fontWeight: 600 }}>Tersedia</div>
                      )}
                    </div>
                  </foreignObject>
                );
              })()}
            </svg>
          </div>
        </div>
      </section>

      {/* ── Insight & Reporting ── */}
      <section>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
          Insight &amp; Reporting
        </p>

        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold text-neutral-800">Reservation Analytics</p>
            <span className="rounded-lg bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-500">
              Today
            </span>
          </div>

          <div className="relative flex h-36 items-end gap-2 sm:gap-3">
            {occupancyBars.map((bar) => (
              <div key={bar.label} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-md transition-all"
                  style={{
                    height: `${(bar.value / maxBar) * 112}px`,
                    backgroundColor: bar.value === maxBar ? "#4B135F" : "#D8CCE8",
                  }}
                  onMouseEnter={(e) =>
                    setHoveredBar({ label: bar.label, value: bar.value, x: e.clientX, y: e.clientY })
                  }
                  onMouseLeave={() => setHoveredBar(null)}
                />
                <span className="whitespace-nowrap text-[10px] text-neutral-400">
                  {bar.label}
                </span>
              </div>
            ))}

            {hoveredBar && (
              <div
                className="pointer-events-none fixed z-50 rounded-lg bg-white px-3 py-2 text-xs shadow-lg"
                style={{ left: hoveredBar.x + 10, top: hoveredBar.y - 40 }}
              >
                <p className="font-semibold">{hoveredBar.label}</p>
                <p>{hoveredBar.value} bookings</p>
              </div>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}