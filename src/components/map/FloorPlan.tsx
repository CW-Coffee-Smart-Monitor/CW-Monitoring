'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useTableContext } from '@/context/TableContext';
import { TABLE_POSITIONS, TABLE_ROOMS } from '@/data/tables';
import { TableState } from '@/types';
import ZoomControls from './ZoomControls';

// Status color for the subtle tint overlay
const STATUS_FILL: Record<string, string> = {
  available: '#22c55e',
  occupied:  '#ef4444',
  reserved:  '#f59e0b',
  warning:   '#f97316',
  offline:   '#9ca3af',
};

interface FloorPlanProps {
  readonly highlightFilter: string | null;
  readonly roomFilter: string | null;
  readonly recommendedId?: number | null;
  readonly onSelectTable: (t: TableState) => void;
}

export default function FloorPlan({ highlightFilter, roomFilter, recommendedId, onSelectTable }: FloorPlanProps) {
  const { tables } = useTableContext();
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [compassHeading, setCompassHeading] = useState(0);
  const dragRef = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(null);
  const isDragging = useRef(false);

  // Device orientation — auto-rotate compass
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      const ios = (e as DeviceOrientationEvent & { webkitCompassHeading?: number }).webkitCompassHeading;
      let heading = 0;
      if (ios != null) {
        heading = ios;
      } else if (e.alpha != null) {
        heading = 360 - e.alpha;
      }
      setCompassHeading(heading);
    };
    globalThis.addEventListener('deviceorientation', handleOrientation, true);
    return () => globalThis.removeEventListener('deviceorientation', handleOrientation, true);
  }, []);

  // ViewBox-based zoom + pan
  const SVG_W = 609, SVG_H = 483;
  const vw = SVG_W / zoom;
  const vh = SVG_H / zoom;

  // Clamp pan so map doesn't go out of bounds
  const clampPan = useCallback((x: number, y: number, z: number) => {
    const vwz = SVG_W / z;
    const vhz = SVG_H / z;
    const maxX = (SVG_W - vwz) / 2;
    const maxY = (SVG_H - vhz) / 2;
    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y)),
    };
  }, []);

  const vx = (SVG_W - vw) / 2 + pan.x;
  const vy = (SVG_H - vh) / 2 + pan.y;

  const zoomIn    = useCallback(() => setZoom((z) => Math.min(+(z + 0.25).toFixed(2), 3)), []);
  const zoomOut   = useCallback(() => setZoom((z) => { const nz = Math.max(+(z - 0.25).toFixed(2), 0.5); setPan((p) => clampPan(p.x, p.y, nz)); return nz; }), [clampPan]);
  const resetZoom = useCallback(() => { setZoom(1); setPan({ x: 0, y: 0 }); }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) => {
      const delta = e.deltaY < 0 ? 0.15 : -0.15;
      return Math.min(3, Math.max(0.5, +(z + delta).toFixed(2)));
    });
  }, []);

  // Mouse pan handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoom <= 1) return;
    isDragging.current = false;
    dragRef.current = { startX: e.clientX, startY: e.clientY, panX: pan.x, panY: pan.y };
  }, [zoom, pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) isDragging.current = true;
    // Convert pixel delta to SVG units (element width maps to vw)
    const svgEl = e.currentTarget as HTMLElement;
    const scaleX = vw / svgEl.clientWidth;
    const scaleY = vh / (svgEl.clientHeight || svgEl.clientWidth * (SVG_H / SVG_W));
    const nx = dragRef.current.panX - dx * scaleX;
    const ny = dragRef.current.panY - dy * scaleY;
    setPan(clampPan(nx, ny, zoom));
  }, [vw, vh, zoom, clampPan]);

  const handleMouseUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  // Touch pan handlers
  const touchRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (zoom <= 1 || e.touches.length !== 1) return;
    const t = e.touches[0];
    touchRef.current = { x: t.clientX, y: t.clientY, panX: pan.x, panY: pan.y };
  }, [zoom, pan]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchRef.current || e.touches.length !== 1) return;
    e.preventDefault();
    const t = e.touches[0];
    const dx = t.clientX - touchRef.current.x;
    const dy = t.clientY - touchRef.current.y;
    const svgEl = e.currentTarget as HTMLElement;
    const scaleX = vw / svgEl.clientWidth;
    const scaleY = vh / (svgEl.clientHeight || svgEl.clientWidth * (SVG_H / SVG_W));
    const nx = touchRef.current.panX - dx * scaleX;
    const ny = touchRef.current.panY - dy * scaleY;
    setPan(clampPan(nx, ny, zoom));
  }, [vw, vh, zoom, clampPan]);

  const handleTouchEnd = useCallback(() => {
    touchRef.current = null;
  }, []);

  const isHighlighted = (t: TableState) => {
    if (!highlightFilter) return true;
    if (highlightFilter === 'Sofa') return t.zone === 'Sofa';
    if (highlightFilter === 'Sofa2') return t.zone === 'Sofa' && [16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32].includes(t.id);
    if (highlightFilter === 'Sofa4') return t.zone === 'Sofa' && [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].includes(t.id);
    if (highlightFilter === 'Colokan') return [1,3,5,12,13,14,15,16,23,24,25,26,27,28,29,30,31,32].includes(t.id);
    if (highlightFilter === 'Outdoor') return t.zone === 'Outdoor';
    if (highlightFilter === 'Counter') return t.zone === 'Counter';
    if (highlightFilter === 'Tenang') return t.facilities.some((f) => f.label === 'Tenang');
    if (highlightFilter === 'Meeting') return t.facilities.some((f) => f.label === 'Meeting Area');
    return t.facilities.some((f) => f.label.includes(highlightFilter));
  };

  let cursorStyle = 'default';
  if (zoom > 1) cursorStyle = dragRef.current ? 'grabbing' : 'grab';

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <div
      className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm"
      role="application"
      aria-label="Floor plan map, draggable when zoomed"
      style={{ cursor: cursorStyle }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
        <ZoomControls onZoomIn={zoomIn} onZoomOut={zoomOut} onReset={resetZoom} />

        <svg
          viewBox={`${vx} ${vy} ${vw} ${vh}`}
          className="w-full"
          style={{ display: 'block', touchAction: 'none' }}
        >
            <image href="/Frame 112.svg" x="0" y="0" width="609" height="483" />

            {tables.map((table) => {
              const pos = TABLE_POSITIONS[table.id];
              if (!pos) return null;
              const dimmed = !isHighlighted(table) || (roomFilter != null && TABLE_ROOMS[table.id] !== roomFilter);
              const fill = STATUS_FILL[table.status] ?? '#9ca3af';
              // Per-sofa size: use override from TABLE_POSITIONS, default 63×43 (4-person)
              const w = pos.w ?? 63;
              const h = pos.h ?? 43;
              const x = pos.x - w / 2;
              const y = pos.y - h / 2;

              const isHovered = hoveredId === table.id;

              return (
                <g
                  key={table.id}
                  opacity={dimmed ? 0.3 : 1}
                  style={{ cursor: zoom > 1 ? 'inherit' : 'pointer' }}
                  onClick={() => { if (!isDragging.current) onSelectTable(table); }}
                  onMouseEnter={() => setHoveredId(table.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* Status tint overlay */}
                  <rect
                    x={x} y={y} width={w} height={h}
                    fill={fill}
                    opacity={isHovered ? 0.35 : 0.15}
                    rx={4}
                  />

                  {/* Hover border */}
                  {isHovered && (
                    <rect
                      x={x} y={y} width={w} height={h}
                      fill="none"
                      stroke={fill}
                      strokeWidth={2}
                      rx={4}
                    />
                  )}

                  {/* Recommended highlight ring (animated dashes) */}
                  {table.id === recommendedId && (
                    <rect
                      x={x - 3} y={y - 3} width={w + 6} height={h + 6}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth={2.5}
                      rx={6}
                      strokeDasharray="4 2"
                    >
                      <animate attributeName="stroke-dashoffset" from="0" to="18" dur="1s" repeatCount="indefinite" />
                    </rect>
                  )}

                  {/* Pulse ring for available tables */}
                  {table.status === 'available' && (
                    <circle cx={pos.x} cy={pos.y} r={6} fill="#22c55e" opacity={0}>
                      <animate attributeName="r" values="6;14;6" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.45;0;0.45" dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}

                  {/* Small status dot — center of sofa */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={4}
                    fill={fill}
                    stroke="white"
                    strokeWidth={1.5}
                  />
                </g>
              );
            })}

            {/* Compass — bottom-right corner, rotates with device */}
            <g transform="translate(575, 449)">
              {/* Outer ring */}
              <circle r={28} fill="white" fillOpacity={0.85} stroke="#d1d5db" strokeWidth={1.5} />

              {/* Rotating needle group */}
              <g transform={`rotate(${-compassHeading})`}>
                {/* N arrow (up) — purple brand color */}
                <polygon points="0,-18 4,-6 -4,-6" fill="#4B135F" />
                {/* S arrow (down) — gray */}
                <polygon points="0,18 4,6 -4,6" fill="#9ca3af" />
              </g>

              {/* Fixed W/E ticks */}
              <line x1="-18" y1="0" x2="-14" y2="0" stroke="#d1d5db" strokeWidth={1.5} />
              <line x1="14" y1="0" x2="18" y2="0" stroke="#d1d5db" strokeWidth={1.5} />

              {/* Center dot */}
              <circle r={2.5} fill="#4B135F" />

              {/* Fixed N label — always top */}
              <text x={0} y={-20} textAnchor="middle" fontSize={8} fontWeight="700" fill="#4B135F" fontFamily="system-ui">N</text>
            </g>
        </svg>
    </div>
  );
}
