import { test, expect } from '@playwright/test';

test.describe('Real-Time Firestore & UI Sync Audit', () => {
  const testTableId = 32;

  test('1. Sinkronisasi Real-Time pada Admin Dashboard', async ({ page, context }) => {
    // Print browser logs for debugging
    page.on('console', (msg) => console.log(`BROWSER LOG: ${msg.text()}`));
    page.on('pageerror', (err) => console.log(`BROWSER ERROR: ${err.message}`));

    // Inject auth cookie to access admin path
    await context.addCookies([
      {
        name: 'cw_session',
        value: 'mock-session-id',
        domain: '127.0.0.1',
        path: '/',
      },
    ]);

    await page.goto('/admin/dashboard');

    // Wait for hydration and React context initialization to complete
    await page.waitForFunction(() => typeof (window as any).__setTableStatus === 'function');

    // Step A: Verifikasi Meja 32 awal adalah 'available' (hijau)
    const rect = page.locator('[data-table-id="32"] rect').first();
    await expect(rect).toBeVisible();
    await expect(rect).toHaveAttribute('fill', '#22c55e');
    console.log('Step A: Status Meja 32 terdeteksi "available" (#22c55e)');

    // Step B: Simulasikan sensor mendeteksi meja ditempati ('occupied' -> merah)
    await page.evaluate((tableId) => {
      (window as any).__setTableStatus(tableId, 'occupied');
    }, testTableId);
    console.log('Mengubah status via window helper ke "occupied"...');

    // Harusnya tersinkronisasi instan tanpa reload halaman
    await expect(rect).toHaveAttribute('fill', '#ef4444', { timeout: 8000 });
    console.log('Step B: Status Meja 32 berubah secara real-time menjadi "occupied" (#ef4444)');

    // Step C: Simulasikan meja kembali tersedia ('available' -> hijau)
    await page.evaluate((tableId) => {
      (window as any).__setTableStatus(tableId, 'available');
    }, testTableId);
    console.log('Mengubah status via window helper ke "available"...');

    await expect(rect).toHaveAttribute('fill', '#22c55e', { timeout: 8000 });
    console.log('Step C: Status Meja 32 kembali menjadi "available" (#22c55e)');
  });

  test('2. Sinkronisasi Real-Time pada Peta Interaktif Pelanggan', async ({ page, context }) => {
    // Print browser logs for debugging
    page.on('console', (msg) => console.log(`BROWSER LOG: ${msg.text()}`));
    page.on('pageerror', (err) => console.log(`BROWSER ERROR: ${err.message}`));

    // Map page also needs session cookie to bypass redirects
    await context.addCookies([
      {
        name: 'cw_session',
        value: 'mock-session-id',
        domain: '127.0.0.1',
        path: '/',
      },
    ]);

    await page.goto('/map');

    // Wait for hydration and React context initialization to complete
    await page.waitForFunction(() => typeof (window as any).__setTableStatus === 'function');

    // Step A: Verifikasi Meja 32 awal adalah 'available' (hijau)
    const rect = page.locator('[data-table-id="32"] rect').first();
    await expect(rect).toBeVisible();
    await expect(rect).toHaveAttribute('fill', '#22c55e');
    console.log('Step A (Map): Status Meja 32 terdeteksi "available" (#22c55e)');

    // Step B: Simulasikan sensor mendeteksi meja ditempati ('occupied' -> merah)
    await page.evaluate((tableId) => {
      (window as any).__setTableStatus(tableId, 'occupied');
    }, testTableId);
    console.log('Mengubah status via window helper ke "occupied"...');

    // Harusnya tersinkronisasi instan
    await expect(rect).toHaveAttribute('fill', '#ef4444', { timeout: 8000 });
    console.log('Step B (Map): Status Meja 32 berubah secara real-time menjadi "occupied" (#ef4444)');

    // Step C: Simulasikan status meja diubah ke 'reserved' (kuning)
    await page.evaluate((tableId) => {
      (window as any).__setTableStatus(tableId, 'reserved');
    }, testTableId);
    console.log('Mengubah status via window helper ke "reserved"...');

    await expect(rect).toHaveAttribute('fill', '#f59e0b', { timeout: 8000 });
    console.log('Step C (Map): Status Meja 32 berubah secara real-time menjadi "reserved" (#f59e0b)');
  });
});
