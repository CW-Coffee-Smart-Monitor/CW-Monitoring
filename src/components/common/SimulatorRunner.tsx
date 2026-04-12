'use client';

/**
 * SimulatorRunner — Invisible component that activates the useSimulator hook.
 * Must be inside <TableProvider>.
 */

import { useSimulator } from '@/hooks/useSimulator';

export default function SimulatorRunner() {
  useSimulator();
  return null;
}
