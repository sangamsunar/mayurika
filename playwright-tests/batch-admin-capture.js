/** Batch: TC-059 to TC-072 — Admin Extended */
const { chromium } = require('playwright');
const path = require('path');
const { BASE_URL, ADMIN } = require('./test-config');
const { makeShot, loginUser } = require('./helpers');

const mkShot = (tc) => makeShot(path.join(__dirname, 'screenshots', tc));

(async () => {
  console.log('\nBatch: Admin Extended (TC-059 to TC-072)');
  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page    = await context.newPage();

  await loginUser(page, ADMIN.email, ADMIN.password);
  await page.waitForURL(/\/admin/, { timeout: 10000 });
  await page.waitForTimeout(1000);

  const goTab = async (tabName) => {
    const btn = page.locator('button').filter({ hasText: new RegExp(tabName, 'i') }).first();
    if (await btn.count() > 0) await btn.click();
    await page.waitForTimeout(700);
  };

  // TC-059: Admin edit product ───────────────────────────────────────────────
  console.log('TC-059: Admin edit product');
  const s59 = mkShot('tc059');
  await goTab('product');
  await s59(page, '01-products-list.png');
  const editBtn = page.locator('button').filter({ hasText: /edit/i }).first();
  if (await editBtn.count() > 0) await editBtn.click();
  await page.waitForTimeout(600);
  await s59(page, '02-edit-product-form.png');

  // TC-060: Admin delete product (confirm dialog) ────────────────────────────
  console.log('TC-060: Admin delete product');
  const s60 = mkShot('tc060');
  await goTab('product');
  const deleteBtn = page.locator('button').filter({ hasText: /delete|remove/i }).first();
  if (await deleteBtn.count() > 0) {
    await deleteBtn.scrollIntoViewIfNeeded();
    await s60(page, '01-delete-product-button.png');
    await deleteBtn.click();
    await page.waitForTimeout(500);
    await s60(page, '02-delete-confirmation.png');
    // Cancel the deletion
    const cancelBtn = page.locator('button').filter({ hasText: /cancel|no/i }).first();
    if (await cancelBtn.count() > 0) await cancelBtn.click();
  } else {
    await s60(page, '01-products-list.png');
    await s60(page, '02-products-list.png');
  }

  // TC-061: Admin customers list ─────────────────────────────────────────────
  console.log('TC-061: Admin customers list');
  const s61 = mkShot('tc061');
  await goTab('customer');
  await s61(page, '01-customers-list.png');
  await page.evaluate(() => window.scrollBy(0, 300));
  await s61(page, '02-customers-detail.png');

  // TC-062: Admin filter orders by status ────────────────────────────────────
  console.log('TC-062: Admin order status filter');
  const s62 = mkShot('tc062');
  await goTab('order');
  await s62(page, '01-all-orders.png');
  const statusFilter = page.locator('select, button').filter({ hasText: /filter|status|all/i }).first();
  if (await statusFilter.count() > 0) await statusFilter.click();
  await page.waitForTimeout(400);
  await s62(page, '02-order-status-filter.png');

  // TC-063: Admin manual gold rate update ────────────────────────────────────
  console.log('TC-063: Admin gold rate update');
  const s63 = mkShot('tc063');
  await goTab('product');
  const goldSection = page.locator('[class*="gold"], input[placeholder*="gold" i], input[placeholder*="rate" i]').first();
  if (await goldSection.count() > 0) await goldSection.scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(400);
  await s63(page, '01-gold-rate-section.png');
  await page.evaluate(() => window.scrollBy(0, -200));
  await s63(page, '02-gold-rate-inputs.png');

  // TC-064: Admin analytics top products ────────────────────────────────────
  console.log('TC-064: Analytics top products');
  const s64 = mkShot('tc064');
  await goTab('analytic');
  await page.waitForTimeout(1200);
  await s64(page, '01-analytics-top.png');
  await page.evaluate(() => window.scrollBy(0, 600));
  await page.waitForTimeout(500);
  await s64(page, '02-analytics-products-chart.png');

  // TC-065: Admin analytics customer stats ──────────────────────────────────
  console.log('TC-065: Analytics customer stats');
  const s65 = mkShot('tc065');
  await page.evaluate(() => window.scrollBy(0, 600));
  await page.waitForTimeout(400);
  await s65(page, '01-analytics-customer-stats.png');
  await page.evaluate(() => window.scrollBy(0, 400));
  await s65(page, '02-analytics-more-stats.png');

  // TC-066: Admin analytics orders chart ────────────────────────────────────
  console.log('TC-066: Analytics orders chart');
  const s66 = mkShot('tc066');
  await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.evaluate(() => window.scrollBy(0, 300));
  await s66(page, '01-orders-chart.png');
  await page.evaluate(() => window.scrollBy(0, 400));
  await s66(page, '02-orders-chart-detail.png');

  // TC-067: Admin order detail ───────────────────────────────────────────────
  console.log('TC-067: Admin order detail');
  const s67 = mkShot('tc067');
  await goTab('order');
  await page.waitForTimeout(600);
  const firstRow = page.locator('tr, [class*="order-row"]').nth(1);
  if (await firstRow.count() > 0) await firstRow.click();
  await page.waitForTimeout(700);
  await s67(page, '01-order-detail-modal.png');
  await page.evaluate(() => window.scrollBy(0, 200));
  await s67(page, '02-order-items-list.png');

  // TC-068: Admin product stock toggle ──────────────────────────────────────
  console.log('TC-068: Product stock status');
  const s68 = mkShot('tc068');
  await goTab('product');
  await s68(page, '01-products-with-stock-status.png');
  // Find in-stock toggle
  const stockToggle = page.locator('input[type="checkbox"], button').filter({ hasText: /stock|available/i }).first();
  if (await stockToggle.count() > 0) await stockToggle.scrollIntoViewIfNeeded();
  await s68(page, '02-stock-toggle.png');

  // TC-069: Admin search products ───────────────────────────────────────────
  console.log('TC-069: Admin product search');
  const s69 = mkShot('tc069');
  await goTab('product');
  const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();
  if (await searchInput.count() > 0) {
    await searchInput.fill('ring');
    await page.waitForTimeout(600);
  }
  await s69(page, '01-admin-product-search.png');

  // TC-070: Admin analytics revenue period ─────────────────────────────────
  console.log('TC-070: Analytics revenue period');
  const s70 = mkShot('tc070');
  await goTab('analytic');
  await page.waitForTimeout(1200);
  await s70(page, '01-analytics-revenue.png');
  const dateFilter = page.locator('select, button').filter({ hasText: /week|month|year|period/i }).first();
  if (await dateFilter.count() > 0) await dateFilter.click();
  await page.waitForTimeout(500);
  await s70(page, '02-revenue-date-filter.png');

  // TC-071: Admin gold rate scrape ──────────────────────────────────────────
  console.log('TC-071: Admin gold rate scrape');
  const s71 = mkShot('tc071');
  await goTab('product');
  const scrapeBtn = page.locator('button').filter({ hasText: /scrape|update rate|fetch/i }).first();
  if (await scrapeBtn.count() > 0) await scrapeBtn.scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await s71(page, '01-gold-rate-scrape-button.png');

  // TC-072: Admin analytics summary cards ───────────────────────────────────
  console.log('TC-072: Analytics summary cards');
  const s72 = mkShot('tc072');
  await goTab('analytic');
  await page.waitForTimeout(1200);
  await s72(page, '01-analytics-summary-cards.png');
  await page.evaluate(() => window.scrollBy(0, 300));
  await page.waitForTimeout(400);
  await s72(page, '02-analytics-full-view.png');

  await browser.close();
  console.log('TC-059 to TC-072 done.');
})();
