/** TC-011: Wishlist — Add and View */

const { chromium } = require('playwright');
const path = require('path');
const { BASE_URL, STABLE_USER } = require('./test-config');
const { makeShot, loginUser } = require('./helpers');

const OUT_DIR = path.join(__dirname, 'screenshots', 'tc011');

(async () => {
  console.log('\nTC-011: Wishlist');
  const shot = makeShot(OUT_DIR);

  const browser = await chromium.launch({ headless: false, slowMo: 350 });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page    = await context.newPage();

  // Step 1: Login
  console.log('Step 1: Login');
  await loginUser(page, STABLE_USER.email, STABLE_USER.password);

  // Step 2: Navigate to a product
  console.log('Step 2: Product page');
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  const productLink = page.locator('[class*="cursor-pointer"]').first();
  await productLink.click();
  await page.waitForURL(/\/product\//, { timeout: 8000 });
  await page.waitForTimeout(800);
  await shot(page, '01-product-page-with-wishlist-button.png');

  // Step 3: Click wishlist / heart button
  console.log('Step 3: Toggle wishlist');
  const heartBtn = page.locator('button').filter({ hasText: /wishlist/i }).first();
  const heartIcon = page.locator('[aria-label*="wishlist" i], button:has(svg)').first();
  const btn = (await heartBtn.count() > 0) ? heartBtn : heartIcon;
  await btn.click();
  await page.waitForTimeout(1200);
  await shot(page, '02-wishlist-toggled-toast.png');

  // Step 4: Navigate to wishlist page
  console.log('Step 4: Wishlist page');
  await page.goto(`${BASE_URL}/wishlist`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await shot(page, '03-wishlist-page.png');

  // Step 5: Items in wishlist
  await page.evaluate(() => window.scrollBy(0, 300));
  await page.waitForTimeout(400);
  await shot(page, '04-wishlist-items.png');

  await browser.close();
  console.log('TC-011 screenshots saved.');
})();
