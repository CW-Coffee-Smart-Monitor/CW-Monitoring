'use client';

/**
 * Header — Top bar showing app title, simulation toggle, and mode indicator.
 */

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Radio, MonitorSmartphone } from 'lucide-react';
import { useTableContext } from '@/context/TableContext';

export default function Header() {
  const { isSimulation, toggleSimulation } = useTableContext();

  return (
    <header className="sticky top-0 z-40 border-b border-[#3a0f49] bg-[#4B135F] backdrop-blur-lg">
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <Image src="/CW Club.png" alt="CW Club Logo" width={28} height={28} className="object-contain" />
          <span className="text-sm font-bold tracking-wide text-white">
            CW<span className="text-amber-300">Monitor</span>
          </span>
        </div>

        {/* Simulation toggle */}
        <button
          onClick={toggleSimulation}
          className="flex items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[10px] font-medium text-white/80 transition-colors hover:border-white/50"
        >
          {isSimulation ? (
            <>
              <motion.span
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <MonitorSmartphone className="h-3.5 w-3.5 text-amber-400" />
              </motion.span>
              SIM
            </>
          ) : (
            <>
              <Radio className="h-3.5 w-3.5 text-emerald-400" />
              LIVE
            </>
          )}
        </button>
      </div>
    </header>
  );
}
