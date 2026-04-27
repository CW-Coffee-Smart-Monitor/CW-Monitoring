'use client';

/**
 * AppShell — Client wrapper providing global context, header, navbar, and simulator.
 */

import { TableProvider } from '@/context/TableContext';
import { usePathname } from 'next/navigation';
import Header from '@/components/common/Header';
import AppFooter from '@/components/common/AppFooter';
import SimulatorRunner from '@/components/common/SimulatorRunner';

export default function AppShell({ children }: { readonly children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = pathname?.startsWith('/auth');
  const isLandingRoute = pathname === '/landing';

  const isMapRoute = pathname === '/map';
  const isAdminRoute = pathname?.startsWith('/admin');

  // Landing and admin pages get full-width layout without app chrome
  if (isLandingRoute || isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <TableProvider>
      <SimulatorRunner />
      {!isAuthRoute && <Header />}
      <main className={`mx-auto w-full flex-1 pb-4 pt-4 ${isMapRoute ? 'bg-neutral-50 px-4 lg:px-6' : 'max-w-md px-4'}`}>
        {children}
      </main>
      {!isAuthRoute && <AppFooter />}
    </TableProvider>
  );
}
