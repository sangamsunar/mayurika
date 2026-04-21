/** Batch: TC-027 to TC-034 — Browsing Extended */
const { chromium } = require('playwright');
const path = require('path');
const { BASE_URL, STABLE_USER } = require('./test-config');
const { makeShot, loginUser } = require('./helpers');

const mkShot = (tc) => makeShot(path.join(__dirname, 'screenshots', tc));

(async () => {
  console.log('\nBatch: Browsing Extended (TC-027 to TC-034)');
  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page    = await context.newPage();

  // TC-027: Unisex collection ────────────────────────────────────────────────
  console.log('TC-027: Unisex collection');
  const s27 = mkShot('tc027');
  await page.goto(`${BASE_URL}/unisex`, { waitUntil: 'networkidle' });
  await s27(page, '01-unisex-page.png');
  await page.evaluate(() => window.scrollBy(0, 400));
  await page.waitForTimeout(400);
  await s27(page, '02-unisex-product-grid.png');

  // TC-028: About page ───────────────────────────────────────────────────────
  console.log('TC-028: About page');
  const s28 = mkShot('tc028');
  await page.goto(`${BASE_URL}/about`, { waitUntil: 'networkidle' });
  await s28(page, '01-about-page.png');
  await page.evaluate(() => window.scrollBy(0, 500));
  await page.waitForTimeout(400);
  await s28(page, '02-about-page-content.png');

  // TC-029: Return policy page ───────────────────────────────────────────────
  console.log('TC-029: Return policy');
  const s29 = mkShot('tc029');
  await page.goto(`${BASE_URL}/return-policy`, { waitUntil: 'networkidle' });
  await s29(page, '01-return-policy-page.png');
  await page.evaluate(() => window.scrollBy(0, 400));
  await page.waitForTimeout(300);
  await s29(page, '02-return-policy-content.png');

  // TC-030: 3D model viewer ──────────────────────────────────────────────────
  console.log('TC-030: 3D model viewer');
  const s30 = mkShot('tc030');
  await loginUser(page, STABLE_USER.email, STABLE_USER.password);
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  const productLink = page.locator('[class*="cursor-pointer"]').first();
  await productLink.click();
  await page.waitForURL(/\/product\//, { timeout: 8000 });
  await page.waitForTimeout(1000);
  await s30(page, '01-product-detail-page.png');
  // Look for 3D model / model viewer toggle
  const modelBtn = page.locator('button').filter({ hasText: /3d|model|view/i }).first();
  if (await modelBtn.count() > 0) {
    await modelBtn.click();
    await page.waitForTimeout(1500);
  }
  await s30(page, '02-3d-model-viewer.png');

  // TC-031: Product reviews section ──────────────────────────────────────────
  console.log('TC-031: Product reviews');
  const s31 = mkShot('tc031');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(600);
  await s31(page, '01-reviews-section.png');
  await page.evaluate(() => window.scrollBy(0, -200));
  await page.waitForTimeout(300);
  await s31(page, '02-reviews-area.png');

  // TC-032: Footer links ─────────────────────────────────────────────────────
  console.log('TC-032: Footer links');
  const s32 = mkShot('tc032');
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);
  await s32(page, '01-footer-full.png');
  await page.evaluate(() => window.scrollBy(0, -200));
  await page.waitForTimeout(300);
  await s32(page, '02-footer-links.png');

  // TC-033: Navbar active link state ─────────────────────────────────────────
  console.log('TC-033: Navbar active state');
  const s33 = mkShot('tc033');
  await page.goto(`${BASE_URL}/men`, { waitUntil: 'networkidle' });
  await s33(page, '01-navbar-men-active.png');
  await page.goto(`${BASE_URL}/women`, { waitUntil: 'networkidle' });
  await s33(page, '02-navbar-women-active.png');

  // TC-034: Product image gallery ────────────────────────────────────────────
  console.log('TC-034: Product image gallery');
  const s34 = mkShot('tc034');
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  await page.locator('[class*="cursor-pointer"]').first().click();
  await page.waitForURL(/\/product\//, { timeout: 8000 });
  await page.waitForTimeout(800);
  await s34(page, '01-product-main-image.png');
  // Try clicking thumbnail if any
  const thumb = page.locator('img').nth(1);
  if (await thumb.count() > 0) await thumb.click().catch(() => {});
  await page.waitForTimeout(400);
  await s34(page, '02-product-gallery-thumbnail.png');

  await browser.close();
  console.log('TC-027 to TC-034 done.');
})();
