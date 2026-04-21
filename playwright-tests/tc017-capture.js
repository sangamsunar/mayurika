/** TC-017: Admin — Manage Orders (View + Update Status) */

const { chromium } = require('playwright');
const path = require('path');
const { BASE_URL, ADMIN } = require('./test-config');
const { makeShot, loginUser } = require('./helpers');

const OUT_DIR = path.join(__dirname, 'screenshots', 'tc017');

(async () => {
  console.log('\nTC-017: Admin Orders Management');
  const shot = makeShot(OUT_DIR);

  const browser = await chromium.launch({ headless: false, slowMo: 350 });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page    = await context.newPage();

  // Login as admin
  console.log('Step 1: Login as admin');
  await loginUser(page, ADMIN.email, ADMIN.password);
  await page.waitForURL(/\/admin/, { timeout: 10000 });
  await page.waitForTimeout(800);

  // Step 2: Orders tab
  console.log('Step 2: Orders tab');
  const ordersTab = page.locator('button').filter({ hasText: /order/i }).first();
  await ordersTab.click();
  await page.waitForTimeout(800);
  await shot(page, '01-orders-list.png');

  // Step 3: Click on first order to expand/view details
  console.log('Step 3: View order detail');
  const firstOrder = page.locator('tr, [class*="order"], [class*="row"]').nth(1);
  if (await firstOrder.count() > 0) await firstOrder.click();
  await page.waitForTimeout(800);
  await shot(page, '02-order-detail.png');

  // Step 4: Status update dropdown / buttons
  console.log('Step 4: Status update options');
  const statusSelect = page.locator('select, [class*="status"]').first();
  if (await statusSelect.count() > 0) await statusSelect.click();
  await page.waitForTimeout(500);
  await shot(page, '03-status-update-options.png');

  // Step 5: Confirm / save status update
  console.log('Step 5: After status update');
  const updateBtn = page.locator('button').filter({ hasText: /update|save|confirm/i }).first();
  if (await updateBtn.count() > 0) await updateBtn.click();
  await page.waitForTimeout(1000);
  await shot(page, '04-status-updated.png');

  await browser.close();
  console.log('TC-017 screenshots saved.');
})();
