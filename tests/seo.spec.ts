import { test, expect } from '@playwright/test';

test.describe('SEO & Accessibility Audits', () => {
  test('1. Validasi Meta Tags Utama & Twitter Cards', async ({ page }) => {
    await page.goto('/landing');

    // 1. Memeriksa Title
    const title = await page.title();
    console.log(`Title found: "${title}"`);
    expect(title).toContain('CW-SmartMonitor');

    // 2. Memeriksa Meta Description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toBeAttached();
    const descContent = await metaDescription.getAttribute('content');
    console.log(`Meta description: "${descContent}"`);
    expect(descContent).not.toBeNull();
    expect(descContent!.length).toBeGreaterThan(30);

    // 3. Memeriksa Twitter Cards
    const twitterCard = page.locator('meta[name="twitter:card"]');
    await expect(twitterCard).toBeAttached();
    expect(await twitterCard.getAttribute('content')).toBe('summary_large_image');
  });

  test('2. Validasi OpenGraph (OG) Tags', async ({ page }) => {
    await page.goto('/landing');

    // OG Title
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toBeAttached();

    // OG Description
    const ogDesc = page.locator('meta[property="og:description"]');
    await expect(ogDesc).toBeAttached();

    // OG Image
    const ogImage = page.locator('meta[property="og:image"]');
    await expect(ogImage).toBeAttached();
  });

  test('3. Validasi Canonical URL & i18n Multilingual Links', async ({ page }) => {
    await page.goto('/landing');

    // Canonical Link
    const canonicalLink = page.locator('link[rel="canonical"]');
    await expect(canonicalLink).toBeAttached();

    // hreflang links
    const alternateId = page.locator('link[rel="alternate"][hreflang="id"]');
    const alternateEn = page.locator('link[rel="alternate"][hreflang="en"]');
    await expect(alternateId).toBeAttached();
    await expect(alternateEn).toBeAttached();
  });

  test('4. Validasi Struktur Semantik HTML (H1)', async ({ page }) => {
    await page.goto('/landing');

    // Hanya boleh ada SATU tag <h1> per halaman
    const h1Count = await page.locator('h1').count();
    console.log(`Jumlah tag H1: ${h1Count}`);
    expect(h1Count).toBe(1);

    const h1Text = await page.locator('h1').first().innerText();
    expect(h1Text).not.toBe('');
  });

  test('5. Validasi Aksesibilitas Gambar (ALT)', async ({ page }) => {
    await page.goto('/landing');

    const images = page.locator('img');
    const imageCount = await images.count();
    console.log(`Menemukan ${imageCount} gambar`);

    let missingAltCount = 0;
    for (let i = 0; i < imageCount; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      if (!alt || alt.trim() === '') {
        missingAltCount++;
      }
    }
    expect(missingAltCount).toBe(0);
  });

  test('6. Validasi JSON-LD Structured Data (Schema.org)', async ({ page }) => {
    await page.goto('/landing');

    // Cari tag script LD+JSON
    const jsonLdScript = page.locator('script[type="application/ld+json"]');
    await expect(jsonLdScript).toBeAttached();

    const rawJson = await jsonLdScript.innerHTML();
    const parsed = JSON.parse(rawJson);
    console.log(`JSON-LD parsed successfully, @type is: "${parsed['@type']}"`);
    expect(parsed['@context']).toBe('https://schema.org');
    expect(parsed['@type']).toBe('CoffeeShop');
    expect(parsed['name']).toBe('CW Coffee Malang');
  });

  test('7. Validasi Robots.txt', async ({ request }) => {
    const response = await request.get('/robots.txt');
    expect(response.ok()).toBeTruthy();
    
    const text = await response.text();
    console.log(`robots.txt output:\n${text}`);
    expect(text).toContain('User-Agent: *');
    expect(text).toContain('Disallow: /admin/');
    expect(text).toContain('Disallow: /profile/');
    expect(text).toContain('Sitemap: http://localhost:3000/sitemap.xml');
  });

  test('8. Validasi Sitemap.xml', async ({ request }) => {
    const response = await request.get('/sitemap.xml');
    expect(response.ok()).toBeTruthy();

    const text = await response.text();
    console.log(`sitemap.xml length: ${text.length} characters`);
    expect(text).toContain('<urlset');
    expect(text).toContain('/landing');
    expect(text).toContain('/map');
  });

  test('9. Validasi Halaman Spesifik Metadata (Map Page)', async ({ page, context }) => {
    // Set mock session cookie to bypass middleware redirect
    await context.addCookies([
      {
        name: 'cw_session',
        value: 'mock-session-id',
        domain: '127.0.0.1',
        path: '/',
      },
    ]);

    await page.goto('/map');

    const title = await page.title();
    console.log(`Map page title: "${title}"`);
    expect(title).toContain('Peta Interaktif & Live Seat Map');

    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toBeAttached();
    const descContent = await metaDescription.getAttribute('content');
    expect(descContent).toContain('fasilitas favorit');
  });
});
