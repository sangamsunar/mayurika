/** Batch: TC-044 to TC-050 — Checkout Extended */
const { chromium } = require('playwright');
const path = require('path');
const { BASE_URL, STABLE_USER } = require('./test-config');
const { makeShot, loginUser } = require('./helpers');

const mkShot = (tc) => makeShot(path.join(__dirname, 'screenshots', tc));

(async () => {
  console.log('\nBatch: Checkout Extended (TC-044 to TC-050)');
  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page    = await context.newPage();

  await loginUser(page, STABLE_USER.email, STABLE_USER.password);

  // TC-044: Checkout COD payment method ──────────────────────────────────────
  console.log('TC-044: Checkout COD');
  const s44 = mkShot('tc044');
  await page.goto(`${BASE_URL}/checkout`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  // Click COD option
  const codBtn = page.locator('button, label, input').filter({ hasText: /cod|cash on delivery/i }).first();
  if (await codBtn.count() > 0) await codBtn.click();
  await page.waitForTimeout(400);
  await s44(page, '01-checkout-cod-selected.png');
  await page.evaluate(() => window.scrollBy(0, 300));
  await s44(page, '02-cod-advance-amount.png');

  // TC-045: Checkout Pickup delivery ─────────────────────────────────────────
  console.log('TC-045: Checkout Pickup');
  const s45 = mkShot('tc045');
  await page.goto(`${BASE_URL}/checkout`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(700);
  const pickupBtn = page.locator('button, label').filter({ hasText: /pickup|pick up/i }).first();
  if (await pickupBtn.count() > 0) await pickupBtn.click();
  await page.waitForTimeout(400);
  await s45(page, '01-checkout-pickup-selected.png');
  await page.evaluate(() => window.scrollBy(0, 300));
  await s45(page, '02-pickup-no-delivery-charge.png');

  // TC-046: Checkout empty address validation ────────────────────────────────
  console.log('TC-046: Checkout address validation');
  const s46 = mkShot('tc046');
  await page.goto(`${BASE_URL}/checkout`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(700);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(400);
  const placeOrderBtn = page.locator('button').filter({ hasText: /place order|pay|confirm/i }).first();
  if (await placeOrderBtn.count() > 0) await placeOrderBtn.click();
  await page.waitForTimeout(800);
  await s46(page, '01-checkout-address-validation.png');

  // TC-047: Checkout eSewa payment ───────────────────────────────────────────
  console.log('TC-047: Checkout eSewa button');
  const s47 = mkShot('tc047');
  await page.goto(`${BASE_URL}/checkout`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(700);
  const esewaBtn = page.locator('button, label').filter({ hasText: /esewa|eSewa/i }).first();
  if (await esewaBtn.count() > 0) await esewaBtn.click();
  await page.waitForTimeout(400);
  await s47(page, '01-esewa-selected.png');
  await page.evaluate(() => window.scrollBy(0, 200));
  await s47(page, '02-esewa-payment-option.png');

  // TC-048: Checkout Stripe payment ──────────────────────────────────────────
  console.log('TC-048: Checkout Stripe');
  const s48 = mkShot('tc048');
  await page.goto(`${BASE_URL}/checkout`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(700);
  const stripeBtn = page.locator('button, label').filter({ hasText: /stripe|card|credit/i }).first();
  if (await stripeBtn.count() > 0) await stripeBtn.click();
  await page.waitForTimeout(400);
  await s48(page, '01-stripe-selected.png');

  // TC-049: Checkout order summary ───────────────────────────────────────────
  console.log('TC-049: Checkout order summary');
  const s49 = mkShot('tc049');
  await page.goto(`${BASE_URL}/checkout`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await s49(page, '01-checkout-order-summary.png');
  await page.evaluate(() => window.scrollBy(0, 500));
  await page.waitForTimeout(400);
  await s49(page, '02-checkout-grand-total.png');

  // TC-050: Checkout delivery charge calculation ─────────────────────────────
  console.log('TC-050: Checkout delivery charge');
  const s50 = mkShot('tc050');
  await page.goto(`${BASE_URL}/checkout`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(700);
  await page.evaluate(() => window.scrollBy(0, 400));
  await page.waitForTimeout(400);
  await s50(page, '01-checkout-delivery-charge.png');
  await page.evaluate(() => window.scrollBy(0, 300));
  await s50(page, '02-checkout-total-with-delivery.png');

  await browser.close();
  console.log('TC-044 to TC-050 done.');
})();
