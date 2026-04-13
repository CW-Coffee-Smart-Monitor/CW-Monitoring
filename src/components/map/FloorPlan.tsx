'use client';

/**
 * FloorPlan — SVG-based interactive floor map of CW Coffee.
 *
 * Faithful reproduction of the architectural blueprint:
 *
 *  ┌──────────────┬══╤══╤──────────────┬───┐
 *  │  Upper-Left  ║  │  │  Upper-Right │ R │
 *  │  Booth/Desks ║  │  │  Communal    │ i │
 *  │  R1 R2 R3    ║  │  │  T1 T2 T3 T4│ g │
 *  ├──────────────╫──┘  └──────────────┤ h │
 *  │  Lower-Left  ║     Lower-Right    │ t │
 *  │  S1 S2 S3 S4║     Tables         │   │
 *  │  Small grid  ║                    │ E │
 *  ├──────────────╨────────────────────┤ d │
 *  │  Bottom: Seat rows │ Counter+Kasir│ g │
 *  │  O1 O2 O3         │ C1 C2   🌿  │ e │
 *  └────────────────────┴──────────────┴───┘
 */

import React, { useState, useCallback } from 'react';
import { useTableContext } from '@/context/TableContext';
import { TABLE_POSITIONS } from '@/data/tables';
import { TableState } from '@/types';
import TableMarker from './TableMarker';
import ZoomControls from './ZoomControls';
import TableDetailDrawer from './TableDetailDrawer';

interface FloorPlanProps {
  highlightFilter: string | null;
}

/* ── SVG furniture helpers ──────────────────────────────── */
const Desk = ({ x, y, w = 52, h = 20 }: { x: number; y: number; w?: number; h?: number }) => (
  <rect x={x} y={y} width={w} height={h} rx={2} fill="#d6d6d6" stroke="#888" strokeWidth={0.7} />
);
const Chair = ({ cx, cy }: { cx: number; cy: number }) => (
  <rect x={cx - 5} y={cy - 3.5} width={10} height={7} rx={2} fill="#c8c8c8" stroke="#999" strokeWidth={0.4} />
);
const RoundChair = ({ cx, cy }: { cx: number; cy: number }) => (
  <ellipse cx={cx} cy={cy} rx={4.5} ry={4.5} fill="#c8c8c8" stroke="#999" strokeWidth={0.4} />
);
const Booth = ({ x, y, w = 80 }: { x: number; y: number; w?: number }) => (
  <g>
    <rect x={x} y={y} width={w} height={7} rx={2} fill="#d0d0d0" stroke="#999" strokeWidth={0.5} />
    <rect x={x} y={y + 9} width={w} height={16} rx={2} fill="#d6d6d6" stroke="#888" strokeWidth={0.7} />
    <rect x={x} y={y + 27} width={w} height={7} rx={2} fill="#d0d0d0" stroke="#999" strokeWidth={0.5} />
  </g>
);
const SmallTable = ({ x, y }: { x: number; y: number }) => (
  <g>
    <rect x={x} y={y} width={26} height={18} rx={2} fill="#d6d6d6" stroke="#888" strokeWidth={0.6} />
    <Chair cx={x + 6} cy={y + 23} />
    <Chair cx={x + 20} cy={y + 23} />
  </g>
);
const SeatPair = ({ x, y }: { x: number; y: number }) => (
  <g>
    <rect x={x} y={y} width={16} height={22} rx={2} fill="#d6d6d6" stroke="#888" strokeWidth={0.5} />
    <rect x={x + 20} y={y} width={16} height={22} rx={2} fill="#d6d6d6" stroke="#888" strokeWidth={0.5} />
  </g>
);

export default function FloorPlan({ highlightFilter }: FloorPlanProps) {
  const { tables } = useTableContext();
  const [scale, setScale] = useState(1);
  const [selectedTable, setSelectedTable] = useState<TableState | null>(null);

  const zoomIn = useCallback(() => setScale((s) => Math.min(s + 0.25, 2.5)), []);
  const zoomOut = useCallback(() => setScale((s) => Math.max(s - 0.25, 0.5)), []);
  const resetZoom = useCallback(() => setScale(1), []);

  const isHighlighted = (t: TableState) => {
    if (!highlightFilter) return true;
    if (highlightFilter === 'Sofa') return t.zone === 'Sofa';
    if (highlightFilter === 'Outdoor') return t.zone === 'Outdoor';
    if (highlightFilter === 'Counter') return t.zone === 'Counter';
    if (highlightFilter === 'Tenang') return t.facilities.some((f) => f.label === 'Tenang');
    if (highlightFilter === 'Meeting') return t.facilities.some((f) => f.label === 'Meeting Area');
    return t.facilities.some((f) => f.label.includes(highlightFilter));
  };

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <ZoomControls onZoomIn={zoomIn} onZoomOut={zoomOut} onReset={resetZoom} />

        <div className="overflow-auto" style={{ maxHeight: '62vh' }}>
          <svg
            viewBox="0 0 760 595"
            className="w-full"
            style={{
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              minWidth: `${760 * scale}px`,
            }}
          >
            {/* ═══════════ BACKGROUND ═══════════ */}
            <rect width="760" height="595" fill="#ffffff" />

            {/* ═══════════ OUTER WALLS ═══════════ */}
            <rect x="8" y="8" width="744" height="579" rx="1" fill="none" stroke="#333" strokeWidth="2.5" />

            {/* ═════════════════════════════════════════════════ */}
            {/* ║  STRUCTURAL WALLS — Vertical & Horizontal    ║ */}
            {/* ═════════════════════════════════════════════════ */}

            {/* Vertical corridor — LEFT wall */}
            <line x1="338" y1="8" x2="338" y2="225" stroke="#333" strokeWidth="2.5" />
            <line x1="338" y1="252" x2="338" y2="432" stroke="#333" strokeWidth="2.5" />
            {/* Vertical corridor — RIGHT wall */}
            <line x1="395" y1="8" x2="395" y2="225" stroke="#333" strokeWidth="2.5" />
            <line x1="395" y1="252" x2="395" y2="432" stroke="#333" strokeWidth="2.5" />

            {/* Horizontal corridor — TOP line */}
            <line x1="8" y1="225" x2="338" y2="225" stroke="#333" strokeWidth="2" />
            <line x1="395" y1="225" x2="700" y2="225" stroke="#333" strokeWidth="2" />
            {/* Horizontal corridor — BOTTOM line */}
            <line x1="8" y1="252" x2="338" y2="252" stroke="#333" strokeWidth="2" />
            <line x1="395" y1="252" x2="700" y2="252" stroke="#333" strokeWidth="2" />

            {/* Right utility strip wall */}
            <line x1="700" y1="8" x2="700" y2="432" stroke="#333" strokeWidth="2" />

            {/* Bottom section divider */}
            <line x1="8" y1="432" x2="752" y2="432" stroke="#333" strokeWidth="2" />

            {/* Door arcs (dashed quarter-circles at openings) */}
            <path d="M 338 225 Q 366 238 395 225" fill="none" stroke="#888" strokeWidth="0.6" strokeDasharray="3 2" />
            <path d="M 338 252 Q 366 240 395 252" fill="none" stroke="#888" strokeWidth="0.6" strokeDasharray="3 2" />
            <path d="M 20 8 Q 20 -8 40 8" fill="none" stroke="#888" strokeWidth="0.5" strokeDasharray="2 2" />
            <path d="M 20 587 Q 20 602 40 587" fill="none" stroke="#888" strokeWidth="0.5" strokeDasharray="2 2" />

            {/* ═════════════════════════════════════════════════ */}
            {/* ║  UPPER-LEFT QUADRANT  (8–338, 8–225)         ║ */}
            {/* ║  Workstation desks & long booth tables        ║ */}
            {/* ═════════════════════════════════════════════════ */}

            {/* Top wall shelf strip */}
            {[15, 62, 108, 154, 200, 250, 298].map((x) => (
              <rect key={`uls-${x}`} x={x} y={11} width={38} height={8} rx={1} fill="#c0c0c0" stroke="#aaa" strokeWidth={0.4} />
            ))}

            {/* Row 1: individual desks + chairs facing down */}
            {[20, 75, 130, 190, 248, 298].map((x, i) => (
              <g key={`ul1-${i}`}>
                <Desk x={x} y={28} w={44} h={16} />
                <Chair cx={x + 11} cy={50} />
                <Chair cx={x + 33} cy={50} />
              </g>
            ))}

            {/* Left wall shelving */}
            {[30, 75, 120, 165].map((y) => (
              <rect key={`ulls-${y}`} x={10} y={y} width={7} height={35} rx={1} fill="#c0c0c0" stroke="#aaa" strokeWidth={0.4} />
            ))}

            {/* Booth Block A — 3 long booths */}
            {[22, 118, 222].map((x, i) => (
              <Booth key={`ulba-${i}`} x={x} y={62} w={84} />
            ))}

            {/* Booth Block B — 3 long booths (back-to-back with A) */}
            {[22, 118, 222].map((x, i) => (
              <Booth key={`ulbb-${i}`} x={x} y={102} w={84} />
            ))}

            {/* Row of desks below booths */}
            {[22, 80, 140, 200, 260].map((x, i) => (
              <g key={`uld1-${i}`}>
                <Desk x={x} y={148} w={48} h={16} />
                <Chair cx={x + 12} cy={170} />
                <Chair cx={x + 36} cy={170} />
              </g>
            ))}

            {/* More desks near the horizontal corridor */}
            {[22, 80, 140, 200, 260].map((x, i) => (
              <g key={`uld2-${i}`}>
                <Desk x={x} y={185} w={48} h={16} />
                <Chair cx={x + 12} cy={207} />
                <Chair cx={x + 36} cy={207} />
              </g>
            ))}

            {/* ═════════════════════════════════════════════════ */}
            {/* ║  UPPER-RIGHT QUADRANT  (395–700, 8–225)      ║ */}
            {/* ║  Communal tables with round chairs + round   ║ */}
            {/* ═════════════════════════════════════════════════ */}

            {/* Top wall shelf strip */}
            {[402, 448, 494, 540, 586, 632, 672].map((x) => (
              <rect key={`urs-${x}`} x={x} y={11} width={32} height={8} rx={1} fill="#c0c0c0" stroke="#aaa" strokeWidth={0.4} />
            ))}

            {/* Big round table at top-right corner */}
            <circle cx="690" cy="38" r="22" fill="none" stroke="#888" strokeWidth={0.8} />
            <circle cx="690" cy="38" r="15" fill="#d6d6d6" stroke="#999" strokeWidth={0.6} />

            {/* Communal table row 1 */}
            <rect x="405" y="38" width="130" height="20" rx={2} fill="#d6d6d6" stroke="#888" strokeWidth={0.7} />
            {[415, 435, 455, 475, 495, 515, 525].map((cx) => (
              <RoundChair key={`c1t-${cx}`} cx={cx} cy={32} />
            ))}
            {[415, 435, 455, 475, 495, 515, 525].map((cx) => (
              <RoundChair key={`c1b-${cx}`} cx={cx} cy={65} />
            ))}

            {/* Communal table row 2 */}
            <rect x="405" y="78" width="130" height="20" rx={2} fill="#d6d6d6" stroke="#888" strokeWidth={0.7} />
            {[415, 435, 455, 475, 495, 515, 525].map((cx) => (
              <RoundChair key={`c2b-${cx}`} cx={cx} cy={105} />
            ))}

            {/* Communal table row 3 */}
            <rect x="405" y="118" width="120" height="18" rx={2} fill="#d6d6d6" stroke="#888" strokeWidth={0.7} />
            {[415, 435, 455, 475, 495, 515].map((cx) => (
              <RoundChair key={`c3t-${cx}`} cx={cx} cy={112} />
            ))}
            {[415, 435, 455, 475, 495, 515].map((cx) => (
              <RoundChair key={`c3b-${cx}`} cx={cx} cy={143} />
            ))}

            {/* Right-side individual desks (vertical orientation) */}
            {[35, 80, 125, 170].map((y, i) => (
              <g key={`urd-${i}`}>
                <Desk x={640} y={y} w={18} h={36} />
                <Chair cx={634} cy={y + 10} />
                <Chair cx={634} cy={y + 28} />
                <Desk x={672} y={y} w={18} h={36} />
                <Chair cx={696} cy={y + 10} />
                <Chair cx={696} cy={y + 28} />
              </g>
            ))}

            {/* Individual desks near bottom of upper-right */}
            {[405, 465, 530, 595].map((x, i) => (
              <g key={`urd2-${i}`}>
                <Desk x={x} y={165} w={48} h={16} />
                <Chair cx={x + 12} cy={187} />
                <Chair cx={x + 36} cy={187} />
              </g>
            ))}
            {[405, 465, 530, 595].map((x, i) => (
              <g key={`urd3-${i}`}>
                <Desk x={x} y={200} w={48} h={16} />
                <Chair cx={x + 12} cy={222} />
                <Chair cx={x + 36} cy={222} />
              </g>
            ))}

            {/* Right wall shelving (upper) */}
            {[30, 80, 135, 185].map((y) => (
              <rect key={`urrs-${y}`} x={703} y={y} width={7} height={35} rx={1} fill="#c0c0c0" stroke="#aaa" strokeWidth={0.4} />
            ))}

            {/* ═════════════════════════════════════════════════ */}
            {/* ║  CORRIDOR ZONE  (338–395, 8–432)             ║ */}
            {/* ║  Vertical hallway — mostly empty              ║ */}
            {/* ═════════════════════════════════════════════════ */}
            <rect x="339" y="9" width="55" height="215" fill="#e0e0e0" opacity={0.5} />
            <rect x="339" y="253" width="55" height="178" fill="#e0e0e0" opacity={0.5} />

            {/* ═════════════════════════════════════════════════ */}
            {/* ║  LOWER-LEFT QUADRANT  (8–338, 252–432)       ║ */}
            {/* ║  Sofa booths + small individual table grid    ║ */}
            {/* ═════════════════════════════════════════════════ */}

            {/* Booth row 1 top of lower-left */}
            {[22, 118, 222].map((x, i) => (
              <g key={`llb1-${i}`}>
                <Desk x={x} y={262} w={80} h={18} />
                <Chair cx={x + 20} cy={256} />
                <Chair cx={x + 60} cy={256} />
                <rect x={x} y={283} width={80} height={7} rx={2} fill="#d0d0d0" stroke="#999" strokeWidth={0.4} />
              </g>
            ))}

            {/* Booth row 2 */}
            {[22, 118, 222].map((x, i) => (
              <g key={`llb2-${i}`}>
                <Desk x={x} y={298} w={80} h={18} />
                <rect x={x} y={319} width={80} height={7} rx={2} fill="#d0d0d0" stroke="#999" strokeWidth={0.4} />
              </g>
            ))}

            {/* Small individual table grid (5 cols × 3 rows) */}
            {[0, 1, 2, 3, 4].map((col) =>
              [0, 1, 2].map((row) => (
                <SmallTable
                  key={`st-${col}-${row}`}
                  x={22 + col * 62}
                  y={338 + row * 32}
                />
              ))
            )}

            {/* Left wall shelving (lower) */}
            {[260, 310, 360, 405].map((y) => (
              <rect key={`llls-${y}`} x={10} y={y} width={7} height={32} rx={1} fill="#c0c0c0" stroke="#aaa" strokeWidth={0.4} />
            ))}

            {/* ═════════════════════════════════════════════════ */}
            {/* ║  LOWER-RIGHT QUADRANT  (395–700, 252–432)    ║ */}
            {/* ║  Long communal tables + grouped desks         ║ */}
            {/* ═════════════════════════════════════════════════ */}

            {/* Long communal table A */}
            <rect x="420" y="262" width="120" height="18" rx={2} fill="#d6d6d6" stroke="#888" strokeWidth={0.7} />
            {[430, 450, 470, 490, 510, 530].map((cx) => (
              <RoundChair key={`lrc1t-${cx}`} cx={cx} cy={256} />
            ))}
            {[430, 450, 470, 490, 510, 530].map((cx) => (
              <RoundChair key={`lrc1b-${cx}`} cx={cx} cy={287} />
            ))}

            {/* Long communal table B */}
            <rect x="420" y="298" width="120" height="18" rx={2} fill="#d6d6d6" stroke="#888" strokeWidth={0.7} />
            {[430, 450, 470, 490, 510, 530].map((cx) => (
              <RoundChair key={`lrc2b-${cx}`} cx={cx} cy={323} />
            ))}

            {/* Right-side desk groups (vertical) */}
            {[262, 310, 358, 400].map((y, i) => (
              <g key={`lrvd-${i}`}>
                <Desk x={560} y={y} w={18} h={36} />
                <Chair cx={554} cy={y + 10} />
                <Chair cx={554} cy={y + 28} />
                <Desk x={600} y={y} w={18} h={36} />
                <Chair cx={624} cy={y + 10} />
                <Chair cx={624} cy={y + 28} />
              </g>
            ))}

            {/* Desk rows near bottom of quadrant */}
            {[420, 478, 536].map((x, i) => (
              <g key={`lrd1-${i}`}>
                <Desk x={x} y={340} w={48} h={16} />
                <Chair cx={x + 12} cy={362} />
                <Chair cx={x + 36} cy={362} />
              </g>
            ))}
            {[420, 478, 536].map((x, i) => (
              <g key={`lrd2-${i}`}>
                <Desk x={x} y={380} w={48} h={16} />
                <Chair cx={x + 12} cy={402} />
                <Chair cx={x + 36} cy={402} />
              </g>
            ))}
            {[640, 670].map((x, i) => (
              <g key={`lrd3-${i}`}>
                <Desk x={x} y={340} w={18} h={36} />
                <Desk x={x} y={388} w={18} h={36} />
              </g>
            ))}

            {/* Right wall shelving (lower) */}
            {[260, 315, 370, 410].map((y) => (
              <rect key={`lrrs-${y}`} x={703} y={y} width={7} height={32} rx={1} fill="#c0c0c0" stroke="#aaa" strokeWidth={0.4} />
            ))}

            {/* ═════════════════════════════════════════════════ */}
            {/* ║  RIGHT EDGE STRIP  (700–752, 8–432)          ║ */}
            {/* ║  Utility / equipment / storage               ║ */}
            {/* ═════════════════════════════════════════════════ */}

            {/* Round element top-right (AC / pillar) */}
            <circle cx="730" cy="30" r="16" fill="none" stroke="#888" strokeWidth={0.7} />

            {/* Equipment circles (mid-right) */}
            {[270, 300, 330, 360].map((y) => (
              <circle key={`rec-${y}`} cx="730" cy={y} r={9} fill="#ddd" stroke="#999" strokeWidth={0.5} />
            ))}

            {/* Storage shelves right strip */}
            {[90, 140, 190].map((y) => (
              <rect key={`rss-${y}`} x={715} y={y} width={30} height={38} rx={2} fill="#d0d0d0" stroke="#999" strokeWidth={0.5} />
            ))}

            {/* ═════════════════════════════════════════════════ */}
            {/* ║  BOTTOM SECTION  (8–752, 432–587)            ║ */}
            {/* ║  Dense seat rows (left) + Counter/Kasir (right)║ */}
            {/* ═════════════════════════════════════════════════ */}

            {/* === Dense seat pair rows (left side of bottom) === */}
            {/* Row 1 */}
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <SeatPair key={`sp1-${i}`} x={18 + i * 42} y={442} />
            ))}
            {/* Row 2 */}
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <SeatPair key={`sp2-${i}`} x={18 + i * 42} y={472} />
            ))}
            {/* Row 3 */}
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <SeatPair key={`sp3-${i}`} x={18 + i * 42} y={502} />
            ))}

            {/* === Counter / Kasir Area (right side of bottom) === */}
            {/* Counter bar background */}
            <rect x="355" y="438" width="393" height="146" fill="#f0f0f0" stroke="none" />

            {/* Long counter bar */}
            <rect x="370" y="538" width="230" height="14" rx={2} fill="#d6d6d6" stroke="#999" strokeWidth={0.7} />

            {/* Equipment: coffee machines */}
            <rect x="420" y="556" width="28" height="20" rx={3} fill="#d0d0d0" stroke="#999" strokeWidth={0.5} />
            <circle cx="470" cy="566" r={10} fill="#ddd" stroke="#999" strokeWidth={0.5} />
            <circle cx="500" cy="566" r={10} fill="#ddd" stroke="#999" strokeWidth={0.5} />

            {/* Sink / equipment */}
            <rect x="530" y="556" width="45" height="20" rx={3} fill="#d0d0d0" stroke="#999" strokeWidth={0.5} />
            <rect x="585" y="556" width="30" height="20" rx={3} fill="#d0d0d0" stroke="#999" strokeWidth={0.5} />

            {/* Entrance marker at bottom center */}
            <rect x="370" y="580" width="8" height="4" rx={1} fill="#999" />

            {/* Outdoor plants (bottom-right corner) */}
            <g transform="translate(670, 540)" opacity={0.55}>
              <circle cx="0" cy="0" r="13" fill="#6a8a6a" opacity={0.35} />
              <circle cx="22" cy="6" r="11" fill="#6a8a6a" opacity={0.3} />
              <circle cx="48" cy="2" r="14" fill="#6a8a6a" opacity={0.35} />
              <circle cx="10" cy="22" r="9" fill="#6a8a6a" opacity={0.25} />
              <circle cx="36" cy="25" r="10" fill="#6a8a6a" opacity={0.3} />
              <circle cx="60" cy="20" r="8" fill="#6a8a6a" opacity={0.25} />
            </g>

            {/* Area Kasir label */}
            <text x="490" y="530" textAnchor="middle" fontSize="8" fill="#999" fontWeight="600" fontFamily="system-ui" letterSpacing="0.8">
              AREA KASIR
            </text>

            {/* ═══════════ USER LOCATION PIN ═══════════ */}
            <g transform="translate(367, 565)">
              <circle cx="0" cy="0" r="4" fill="#1A1A1A" opacity="0.12" />
              <circle cx="0" cy="-1.5" r="3" fill="#374151" />
              <path d="M0,-7 L2,-1.5 Q0,0.5 -2,-1.5 Z" fill="#374151" />
            </g>

            {/* ═══════════ TABLE MARKERS (Interactive) ═══════════ */}
            {tables.map((table) => {
              const pos = TABLE_POSITIONS[table.id];
              if (!pos) return null;
              const dimmed = !isHighlighted(table);
              return (
                <g key={table.id} opacity={dimmed ? 0.25 : 1}>
                  <TableMarker
                    name={table.name}
                    status={table.status}
                    x={pos.x}
                    y={pos.y}
                    onTap={() => setSelectedTable(table)}
                  />
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      <TableDetailDrawer
        table={selectedTable}
        onClose={() => setSelectedTable(null)}
      />
    </>
  );
}
