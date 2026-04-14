'use client';

/**
 * AppShell — Client wrapper providing global context, header, navbar, and simulator.
 */

import { TableProvider } from '@/context/TableContext';
import Header from '@/components/common/Header';
import BottomNav from '@/components/common/BottomNav';
import SimulatorRunner from '@/components/common/SimulatorRunner';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <TableProvider>
      <SimulatorRunner />
      <Header />
      <main className="mx-auto w-full max-w-md flex-1 px-4 pb-8 pt-4">
        {children}
      </main>
      {/* <BottomNav /> */}
    </TableProvider>
  );
}
