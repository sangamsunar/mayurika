/** Batch: TC-091 to TC-100 — Misc Edge Cases */
const { chromium } = require('playwright');
const path = require('path');
const { BASE_URL, STABLE_USER } = require('./test-config');
const { makeShot, loginUser } = require('./helpers');

const mkShot = (tc) => makeShot(path.join(__dirname, 'screenshots', tc));

(async () => {
  console.log('\nBatch: Misc Edge Cases (TC-091 to TC-100)');
  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page    = await context.newPage();

  // TC-091: Verify email page direct access (no state) ──────────────────────
  console.log('TC-091: Verify email page without state');
  const s91 = mkShot('tc091');
  await page.goto(`${BASE_URL}/verify-email`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await s91(page, '01-verify-email-no-state.png');

  // TC-092: Verify OTP page direct access (no state) ────────────────────────
  console.log('TC-092: Verify OTP page without state');
  const s92 = mkShot('tc092');
  await page.goto(`${BASE_URL}/verify-otp`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await s92(page, '01-verify-otp-no-state.png');

  // TC-093: Register page → login link ──────────────────────────────────────
  console.log('TC-093: Register → Login link');
  const s93 = mkShot('tc093');
  await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle' });
  await s93(page, '01-register-page.png');
  await page.locator('a').filter({ hasText: /sign in|login/i }).first().click();
  await page.waitForURL(/login/, { timeout: 5000 });
  await page.waitForTimeout(400);
  await s93(page, '02-navigated-to-login.png');

  // TC-094: Login page → Register link ──────────────────────────────────────
  console.log('TC-094: Login → Register link');
  const s94 = mkShot('tc094');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await s94(page, '01-login-page.png');
  await page.locator('a').filter({ hasText: /create|register|sign up/i }).first().click();
  await page.waitForURL(/register/, { timeout: 5000 });
  await page.waitForTimeout(400);
  await s94(page, '02-navigated-to-register.png');

  // TC-095: Product not found / invalid product ID ───────────────────────────
  console.log('TC-095: Invalid product ID');
  const s95 = mkShot('tc095');
  await page.goto(`${BASE_URL}/product/000000000000000000000000`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await s95(page, '01-product-not-found.png');

  // TC-096: Product detail size measurement modal ───────────────────────────
  console.log('TC-096: Size measurement modal');
  const s96 = mkShot('tc096');
  await loginUser(page, STABLE_USER.email, STABLE_USER.password);
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  await page.locator('[class*="cursor-pointer"]').first().click();
  await page.waitForURL(/\/product\//, { timeout: 8000 });
  await page.waitForTimeout(800);
  const sizeBtn = page.locator('button').filter({ hasText: /size|measure|how to/i }).first();
  if (await sizeBtn.count() > 0) {
    await sizeBtn.click();
    await page.waitForTimeout(600);
    await s96(page, '01-size-measurement-modal.png');
    const closeBtn = page.locator('button').filter({ hasText: /cancel|close|×/i }).first();
    if (await closeBtn.count() > 0) await closeBtn.click();
  } else {
    await s96(page, '01-product-detail-no-size-modal.png');
  }
  await s96(page, '02-product-detail-after-modal.png');

  // TC-097: Add to cart then view cart navigation ───────────────────────────
  console.log('TC-097: Add to cart → navigate to cart');
  const s97 = mkShot('tc097');
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  await page.locator('[class*="cursor-pointer"]').first().click();
  await page.waitForURL(/\/product\//, { timeout: 8000 });
  await page.waitForTimeout(600);
  const addBtn = page.locator('button').filter({ hasText: /add to cart/i }).first();
  if (await addBtn.count() > 0) await addBtn.click();
  await page.waitForTimeout(800);
  await s97(page, '01-added-to-cart-toast.png');
  await page.goto(`${BASE_URL}/cart`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await s97(page, '02-cart-with-added-item.png');

  // TC-098: Reset password page direct access (no state) ────────────────────
  console.log('TC-098: Reset password page without state');
  const s98 = mkShot('tc098');
  await page.goto(`${BASE_URL}/reset-password`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await s98(page, '01-reset-password-no-state.png');

  // TC-099: Search navigation from home navbar ───────────────────────────────
  console.log('TC-099: Search from navbar');
  const s99 = mkShot('tc099');
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  await s99(page, '01-home-navbar.png');
  const searchLink = page.locator('a[href*="search"], nav a').filter({ hasText: /search/i }).first();
  if (await searchLink.count() > 0) await searchLink.click();
  else await page.goto(`${BASE_URL}/search`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await s99(page, '02-search-page-from-navbar.png');

  // TC-100: Full journey — Home → Product → Cart → Profile ──────────────────
  console.log('TC-100: Full user journey');
  const s100 = mkShot('tc100');
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  await s100(page, '01-journey-home.png');
  await page.locator('[class*="cursor-pointer"]').first().click();
  await page.waitForURL(/\/product\//, { timeout: 8000 });
  await page.waitForTimeout(600);
  await s100(page, '02-journey-product.png');
  const addCartBtn = page.locator('button').filter({ hasText: /add to cart/i }).first();
  if (await addCartBtn.count() > 0) await addCartBtn.click();
  await page.waitForTimeout(600);
  await page.goto(`${BASE_URL}/cart`, { waitUntil: 'networkidle' });
  await s100(page, '03-journey-cart.png');
  await page.goto(`${BASE_URL}/profile`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await s100(page, '04-journey-profile.png');

  await browser.close();
  console.log('TC-091 to TC-100 done.');
})();
