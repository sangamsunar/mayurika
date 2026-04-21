/** TC-013: Order Success Page + Order History in Profile */

const { chromium } = require('playwright');
const path = require('path');
const { BASE_URL, STABLE_USER } = require('./test-config');
const { makeShot, loginUser } = require('./helpers');

const OUT_DIR = path.join(__dirname, 'screenshots', 'tc013');

(async () => {
  console.log('\nTC-013: Order Success + History');
  const shot = makeShot(OUT_DIR);

  const browser = await chromium.launch({ headless: false, slowMo: 350 });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page    = await context.newPage();

  // Step 1: Login
  console.log('Step 1: Login');
  await loginUser(page, STABLE_USER.email, STABLE_USER.password);

  // Step 2: Order success page (navigate directly to show the UI)
  console.log('Step 2: Order success page');
  await page.goto(`${BASE_URL}/order-success`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await shot(page, '01-order-success-page.png');

  // Step 3: Navigate to profile
  console.log('Step 3: Profile page');
  await page.goto(`${BASE_URL}/profile`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await shot(page, '02-profile-page.png');

  // Step 4: Orders tab in profile
  console.log('Step 4: Orders section');
  const ordersTab = page.locator('button').filter({ hasText: /order/i }).first();
  if (await ordersTab.count() > 0) await ordersTab.click();
  await page.waitForTimeout(600);
  await shot(page, '03-order-history.png');

  await browser.close();
  console.log('TC-013 screenshots saved.');
})();
