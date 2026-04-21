/** TC-010: Cart Management (View, Remove item) */

const { chromium } = require('playwright');
const path = require('path');
const { BASE_URL, STABLE_USER } = require('./test-config');
const { makeShot, loginUser } = require('./helpers');

const OUT_DIR = path.join(__dirname, 'screenshots', 'tc010');

(async () => {
  console.log('\nTC-010: Cart Management');
  const shot = makeShot(OUT_DIR);

  const browser = await chromium.launch({ headless: false, slowMo: 350 });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page    = await context.newPage();

  // Step 1: Login
  console.log('Step 1: Login');
  await loginUser(page, STABLE_USER.email, STABLE_USER.password);

  // Step 2: Navigate to cart
  console.log('Step 2: View cart');
  await page.goto(`${BASE_URL}/cart`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await shot(page, '01-cart-with-items.png');

  // Step 3: Hover over remove button (to show it)
  console.log('Step 3: Remove item');
  const removeBtn = page.locator('button').filter({ hasText: /remove/i }).first();
  const trashBtn  = page.locator('[aria-label*="remove" i], button svg').first();
  const anyRemove = (await removeBtn.count() > 0) ? removeBtn : trashBtn;
  if (await anyRemove.count() > 0) await anyRemove.click();
  await page.waitForTimeout(1500);
  await shot(page, '02-item-removed-toast.png');

  // Step 4: Cart state after removal
  console.log('Step 4: Cart after removal');
  await page.waitForTimeout(500);
  await shot(page, '03-cart-after-removal.png');

  // Step 5: Proceed to checkout button
  console.log('Step 5: Checkout button area');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(400);
  await shot(page, '04-proceed-to-checkout.png');

  await browser.close();
  console.log('TC-010 screenshots saved.');
})();
