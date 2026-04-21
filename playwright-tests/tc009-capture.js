/** TC-009: Product Detail Page + Add to Cart */

const { chromium } = require('playwright');
const axios = require('axios');
const path  = require('path');
const { BASE_URL, STABLE_USER } = require('./test-config');
const { makeShot, loginUser } = require('./helpers');

const OUT_DIR = path.join(__dirname, 'screenshots', 'tc009');

(async () => {
  console.log('\nTC-009: Product Detail + Add to Cart');
  const shot = makeShot(OUT_DIR);

  const browser = await chromium.launch({ headless: false, slowMo: 350 });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page    = await context.newPage();

  // Step 1: Login first
  console.log('Step 1: Login');
  await loginUser(page, STABLE_USER.email, STABLE_USER.password);

  // Step 2: Navigate to home and screenshot
  console.log('Step 2: Home page with products');
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  await page.evaluate(() => window.scrollBy(0, 400));
  await page.waitForTimeout(600);
  await shot(page, '01-home-with-products.png');

  // Step 3: Click the first product card
  console.log('Step 3: Click product card');
  const productLink = page.locator('[class*="cursor-pointer"]').first();
  await productLink.click();
  await page.waitForURL(/\/product\//, { timeout: 8000 });
  await page.waitForTimeout(1000);
  await shot(page, '02-product-detail-page.png');

  // Step 4: Select metal option (first available button)
  console.log('Step 4: Select metal/purity');
  await page.evaluate(() => window.scrollBy(0, 300));
  await page.waitForTimeout(400);
  const metalBtn = page.locator('button').filter({ hasText: /gold|silver/i }).first();
  if (await metalBtn.count() > 0) await metalBtn.click();
  await page.waitForTimeout(400);
  await shot(page, '03-metal-purity-selected.png');

  // Step 5: Add to cart
  console.log('Step 5: Add to cart');
  const addToCartBtn = page.locator('button').filter({ hasText: /add to cart/i }).first();
  if (await addToCartBtn.count() > 0) await addToCartBtn.click();
  else await page.locator('[data-testid="add-to-cart"], button:has-text("Cart")').first().click();
  await page.waitForTimeout(1500);
  await shot(page, '04-add-to-cart-toast.png');

  // Step 6: Cart icon / updated count
  await page.waitForTimeout(500);
  await shot(page, '05-cart-count-updated.png');

  await browser.close();
  console.log('TC-009 screenshots saved.');
})();
