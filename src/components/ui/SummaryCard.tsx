'use client';

/**
 * SummaryCard — Displays a single metric with icon, value, and label.
 * Used on the Home dashboard for table counts.
 */

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  icon: LucideIcon;
  value: number;
  label: string;
  color: string;        // Tailwind text color, e.g. "text-emerald-400"
  bgColor: string;      // Tailwind bg color, e.g. "bg-emerald-500/10"
  borderColor: string;  // Tailwind border color
}

export default function SummaryCard({
  icon: Icon,
  value,
  label,
  color,
  bgColor,
  borderColor,
}: SummaryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border ${borderColor} ${bgColor} p-4 backdrop-blur-sm`}
    >
      <div className="flex items-center gap-3">
        <div className={`rounded-xl ${bgColor} p-2.5`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
        <div>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          <p className="text-xs text-neutral-400">{label}</p>
        </div>
      </div>
    </motion.div>
  );
}
