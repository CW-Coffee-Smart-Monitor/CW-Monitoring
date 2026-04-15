'use client';

/**
 * AppShell — Client wrapper providing global context, header, navbar, and simulator.
 */

import { TableProvider } from '@/context/TableContext';
import { usePathname } from 'next/navigation';
import Header from '@/components/common/Header';
import SimulatorRunner from '@/components/common/SimulatorRunner';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = pathname?.startsWith('/auth');

  return (
    <TableProvider>
      <SimulatorRunner />
      {!isAuthRoute && <Header />}
      <main className="mx-auto w-full max-w-md flex-1 px-4 pb-4 pt-4">
        {children}
      </main>
    </TableProvider>
  );
}
