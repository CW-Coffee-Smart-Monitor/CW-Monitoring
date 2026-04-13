'use client';

/**
 * FilterChips — Horizontal scroll of facility-based filter chips.
 * Matches the design: "Dekat Colokan", "Meja Sofa", "Area Outdoor", etc.
 */

import { TreePalm, Coffee, Users, type LucideIcon } from 'lucide-react';

interface Chip {
  label: string;
  icon: LucideIcon;
  filterKey: string;
}

const CHIPS: Chip[] = [
  { label: 'Area Outdoor', icon: TreePalm, filterKey: 'Outdoor' },
  { label: 'Dekat Counter', icon: Coffee,   filterKey: 'Counter' },
  { label: 'Meeting Area', icon: Users,     filterKey: 'Meeting' },
];

interface FilterChipsProps {
  readonly activeFilter: string | null;
  readonly onFilterChange: (key: string | null) => void;
}

export default function FilterChips({ activeFilter, onFilterChange }: FilterChipsProps) {
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2">
      {CHIPS.map((chip) => {
        const isActive = activeFilter === chip.filterKey;
        return (
          <button
            key={chip.filterKey}
            onClick={() => onFilterChange(isActive ? null : chip.filterKey)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              isActive
                ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                : 'border-neutral-300 bg-neutral-100/60 text-neutral-600 hover:border-neutral-400'
            }`}
          >
            <chip.icon className="h-3.5 w-3.5" />
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}
