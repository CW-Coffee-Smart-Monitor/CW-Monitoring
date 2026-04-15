'use client';

/**
 * TableMarker — Circular marker overlaid on the floor plan SVG.
 * Color-coded by status, pulsing animation for warning/ghost.
 */

import { motion } from 'framer-motion';
import { TableStatus } from '@/types';

interface TableMarkerProps {
  name: string;
  status: TableStatus;
  x: number;
  y: number;
  onTap: () => void;
}

const STATUS_COLORS: Record<TableStatus, { fill: string; stroke: string; text: string; strokeWidth: number }> = {
  available: { fill: '#ffffff', stroke: '#10B981', text: '#059669', strokeWidth: 3 },
  occupied:  { fill: '#ffffff', stroke: '#EF4444', text: '#DC2626', strokeWidth: 3 },
  warning:   { fill: '#ffffff', stroke: '#F59E0B', text: '#D97706', strokeWidth: 3 },
  offline:   { fill: '#f5f5f5', stroke: '#9CA3AF', text: '#6B7280', strokeWidth: 2 },
  reserved:  { fill: '#ffffff', stroke: '#F59E0B', text: '#D97706', strokeWidth: 3 },
};

export default function TableMarker({ name, status, x, y, onTap }: TableMarkerProps) {
  const colors = STATUS_COLORS[status];
  const isWarning = status === 'warning';
  const radius = 22;

  return (
    <motion.g
      style={{ cursor: 'pointer' }}
      onClick={onTap}
      whileTap={{ scale: 0.9 }}
    >
      {/* Pulse ring for warning / ghost booking */}
      {isWarning && (
        <motion.circle
          cx={x}
          cy={y}
          r={radius + 4}
          fill="none"
          stroke="#F59E0B"
          strokeWidth={2}
          animate={{ r: [radius + 2, radius + 10], opacity: [0.8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}

      {/* Outer ring */}
      <circle
        cx={x}
        cy={y}
        r={radius}
        fill={colors.fill}
        stroke={colors.stroke}
        strokeWidth={colors.strokeWidth}
        opacity={0.95}
      />

      {/* Label text */}
      <text
        x={x}
        y={y + 1}
        textAnchor="middle"
        dominantBaseline="central"
        fill={colors.text}
        fontSize={12}
        fontWeight={700}
        fontFamily="system-ui, sans-serif"
      >
        {name}
      </text>
    </motion.g>
  );
}
