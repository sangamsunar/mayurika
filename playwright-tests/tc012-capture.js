/** TC-012: Checkout Page — Delivery & Payment Options */

const { chromium } = require('playwright');
const path = require('path');
const { BASE_URL, STABLE_USER } = require('./test-config');
const { makeShot, loginUser } = require('./helpers');

const OUT_DIR = path.join(__dirname, 'screenshots', 'tc012');

(async () => {
  console.log('\nTC-012: Checkout');
  const shot = makeShot(OUT_DIR);

  const browser = await chromium.launch({ headless: false, slowMo: 350 });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page    = await context.newPage();

  // Step 1: Login
  console.log('Step 1: Login');
  await loginUser(page, STABLE_USER.email, STABLE_USER.password);

  // Step 2: Navigate to checkout (requires items in cart from TC-009)
  console.log('Step 2: Checkout page');
  await page.goto(`${BASE_URL}/checkout`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await shot(page, '01-checkout-page.png');

  // Step 3: Delivery type selection
  console.log('Step 3: Delivery options');
  await page.evaluate(() => window.scrollBy(0, 300));
  await page.waitForTimeout(400);
  await shot(page, '02-delivery-type-options.png');

  // Step 4: Payment method selection
  console.log('Step 4: Payment methods');
  await page.evaluate(() => window.scrollBy(0, 300));
  await page.waitForTimeout(400);
  await shot(page, '03-payment-method-options.png');

  // Step 5: Address / delivery form
  console.log('Step 5: Address form');
  await page.evaluate(() => window.scrollBy(0, 400));
  await page.waitForTimeout(400);
  await shot(page, '04-address-form.png');

  await browser.close();
  console.log('TC-012 screenshots saved.');
})();
