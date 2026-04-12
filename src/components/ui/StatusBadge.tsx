'use client';

/**
 * StatusBadge — Small colored pill indicating a table or system status.
 */

import { motion } from 'framer-motion';

interface StatusBadgeProps {
  label: string;
  variant: 'available' | 'occupied' | 'warning' | 'offline' | 'info';
  pulse?: boolean;
}

const VARIANTS: Record<StatusBadgeProps['variant'], string> = {
  available: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  occupied: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
  warning: 'bg-red-500/20 text-red-400 border-red-500/30',
  offline: 'bg-neutral-600/20 text-neutral-400 border-neutral-600/30',
  info: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
};

export default function StatusBadge({ label, variant, pulse }: StatusBadgeProps) {
  return (
    <motion.span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${VARIANTS[variant]}`}
      animate={pulse ? { opacity: [1, 0.5, 1] } : undefined}
      transition={pulse ? { duration: 1.2, repeat: Infinity } : undefined}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          variant === 'available'
            ? 'bg-emerald-400'
            : variant === 'occupied'
            ? 'bg-sky-400'
            : variant === 'warning'
            ? 'bg-red-400'
            : variant === 'offline'
            ? 'bg-neutral-500'
            : 'bg-amber-400'
        }`}
      />
      {label}
    </motion.span>
  );
}
