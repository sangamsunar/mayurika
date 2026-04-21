/** TC-020: Protected Route — Redirect Unauthenticated User */

const { chromium } = require('playwright');
const path = require('path');
const { BASE_URL } = require('./test-config');
const { makeShot } = require('./helpers');

const OUT_DIR = path.join(__dirname, 'screenshots', 'tc020');

(async () => {
  console.log('\nTC-020: Protected Route Redirect');
  const shot = makeShot(OUT_DIR);

  const browser = await chromium.launch({ headless: false, slowMo: 350 });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page    = await context.newPage();

  // Step 1: Attempt to access /cart without being logged in
  console.log('Step 1: Attempt /cart unauthenticated');
  await page.goto(`${BASE_URL}/cart`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await shot(page, '01-protected-cart-redirect.png');

  // Step 2: Attempt /wishlist without login
  console.log('Step 2: Attempt /wishlist unauthenticated');
  await page.goto(`${BASE_URL}/wishlist`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await shot(page, '02-protected-wishlist-redirect.png');

  await browser.close();
  console.log('TC-020 screenshots saved.');
})();
