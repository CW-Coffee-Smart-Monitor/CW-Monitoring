'use client';

/**
 * RecommendationCard — Suggests the "best" available table based on facilities.
 */

import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useTableContext } from '@/context/TableContext';

export default function RecommendationCard() {
  const { tables } = useTableContext();

  // Pick the available table with the most facilities
  const recommendation = tables
    .filter((t) => t.status === 'available')
    .sort((a, b) => b.facilities.length - a.facilities.length)[0];

  if (!recommendation) return null;

  const facilityText = recommendation.facilities
    .map((f) => f.label)
    .join(' · ');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mb-4 rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-transparent p-4 backdrop-blur-sm"
    >
      <div className="mb-1 flex items-center gap-1.5">
        <Sparkles className="h-4 w-4 text-amber-400" />
        <p className="text-xs font-semibold text-amber-300">Rekomendasi</p>
      </div>
      <p className="text-sm font-bold text-neutral-100">
        {recommendation.name} — {recommendation.zone}
      </p>
      <p className="mb-2 text-xs text-neutral-400">{facilityText}</p>
      <button className="flex items-center gap-1 rounded-lg bg-amber-500/20 px-3 py-1.5 text-xs font-medium text-amber-400 transition-colors hover:bg-amber-500/30">
        Lihat Detail <ArrowRight className="h-3 w-3" />
      </button>
    </motion.div>
  );
}
