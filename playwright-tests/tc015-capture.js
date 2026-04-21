/** TC-015: Admin Login + Dashboard Overview */

const { chromium } = require('playwright');
const path = require('path');
const { BASE_URL, ADMIN } = require('./test-config');
const { makeShot } = require('./helpers');

const OUT_DIR = path.join(__dirname, 'screenshots', 'tc015');

(async () => {
  console.log('\nTC-015: Admin Login + Dashboard');
  console.log(`Admin: ${ADMIN.email}`);
  const shot = makeShot(OUT_DIR);

  const browser = await chromium.launch({ headless: false, slowMo: 350 });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page    = await context.newPage();

  // Step 1: Login page
  console.log('Step 1: Login page');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await shot(page, '01-login-page.png');

  // Step 2: Enter admin credentials
  console.log('Step 2: Enter admin credentials');
  await page.fill('input[type="email"]', ADMIN.email);
  await page.fill('input[placeholder="Your password"]', ADMIN.password);
  await shot(page, '02-admin-credentials-entered.png');

  // Step 3: Submit → redirect to /admin
  console.log('Step 3: Login as admin');
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/admin/, { timeout: 10000 });
  await page.waitForTimeout(1200);
  await shot(page, '03-admin-dashboard-analytics.png');

  // Step 4: Products tab
  console.log('Step 4: Products tab');
  const productsTab = page.locator('button').filter({ hasText: /product/i }).first();
  if (await productsTab.count() > 0) await productsTab.click();
  await page.waitForTimeout(600);
  await shot(page, '04-admin-products-tab.png');

  // Step 5: Orders tab
  console.log('Step 5: Orders tab');
  const ordersTab = page.locator('button').filter({ hasText: /order/i }).first();
  if (await ordersTab.count() > 0) await ordersTab.click();
  await page.waitForTimeout(600);
  await shot(page, '05-admin-orders-tab.png');

  await browser.close();
  console.log('TC-015 screenshots saved.');
})();
