'use client';

/**
 * TableGrid — Grid of all table cards with animated transitions.
 */

import { motion } from 'framer-motion';
import { useTableContext } from '@/context/TableContext';
import TableCard from '@/components/ui/TableCard';

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.04 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

export default function TableGrid() {
  const { tables } = useTableContext();

  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold text-neutral-600">
        Semua Meja
      </h2>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 gap-3"
      >
        {tables.map((table) => (
          <motion.div key={table.id} variants={itemVariants}>
            <TableCard table={table} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
