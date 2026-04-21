/** Batch: TC-035 to TC-043 — Cart & Wishlist Extended */
const { chromium } = require('playwright');
const path = require('path');
const { BASE_URL, STABLE_USER } = require('./test-config');
const { makeShot, loginUser } = require('./helpers');

const mkShot = (tc) => makeShot(path.join(__dirname, 'screenshots', tc));

(async () => {
  console.log('\nBatch: Cart & Wishlist Extended (TC-035 to TC-043)');
  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page    = await context.newPage();

  // TC-035: Empty cart state ─────────────────────────────────────────────────
  console.log('TC-035: Empty cart state');
  const s35 = mkShot('tc035');
  await loginUser(page, STABLE_USER.email, STABLE_USER.password);
  await page.goto(`${BASE_URL}/cart`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await s35(page, '01-cart-page.png');
  // Remove all items if any
  let removeBtn = page.locator('button').filter({ hasText: /remove/i });
  while (await removeBtn.count() > 0) {
    await removeBtn.first().click();
    await page.waitForTimeout(800);
  }
  await page.waitForTimeout(500);
  await s35(page, '02-empty-cart-state.png');

  // TC-036: Add multiple items to cart ───────────────────────────────────────
  console.log('TC-036: Multiple items in cart');
  const s36 = mkShot('tc036');
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  const products = page.locator('[class*="cursor-pointer"]');
  // Add first product
  await products.first().click();
  await page.waitForURL(/\/product\//, { timeout: 6000 });
  await page.waitForTimeout(600);
  const addBtn1 = page.locator('button').filter({ hasText: /add to cart/i }).first();
  if (await addBtn1.count() > 0) await addBtn1.click();
  await page.waitForTimeout(800);
  // Go back and add second product
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  await products.nth(1).click().catch(() => products.first().click());
  await page.waitForURL(/\/product\//, { timeout: 6000 });
  await page.waitForTimeout(600);
  const addBtn2 = page.locator('button').filter({ hasText: /add to cart/i }).first();
  if (await addBtn2.count() > 0) await addBtn2.click();
  await page.waitForTimeout(800);
  await page.goto(`${BASE_URL}/cart`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await s36(page, '01-cart-multiple-items.png');
  await page.evaluate(() => window.scrollBy(0, 300));
  await page.waitForTimeout(300);
  await s36(page, '02-cart-totals.png');

  // TC-037: Wishlist empty state ─────────────────────────────────────────────
  console.log('TC-037: Wishlist empty state');
  const s37 = mkShot('tc037');
  await page.goto(`${BASE_URL}/wishlist`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await s37(page, '01-wishlist-page.png');

  // TC-038: Remove from wishlist ─────────────────────────────────────────────
  console.log('TC-038: Remove from wishlist');
  const s38 = mkShot('tc038');
  // Add item to wishlist first
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  await page.locator('[class*="cursor-pointer"]').first().click();
  await page.waitForURL(/\/product\//, { timeout: 6000 });
  await page.waitForTimeout(600);
  const wishlistBtn = page.locator('button').filter({ hasText: /wishlist/i }).first();
  if (await wishlistBtn.count() > 0) await wishlistBtn.click();
  await page.waitForTimeout(800);
  await page.goto(`${BASE_URL}/wishlist`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await s38(page, '01-wishlist-with-item.png');
  const removeWishBtn = page.locator('button').filter({ hasText: /remove|delete/i }).first();
  if (await removeWishBtn.count() > 0) await removeWishBtn.click();
  await page.waitForTimeout(800);
  await s38(page, '02-wishlist-after-remove.png');

  // TC-039: Cart checkout button state ───────────────────────────────────────
  console.log('TC-039: Cart checkout button');
  const s39 = mkShot('tc039');
  await page.goto(`${BASE_URL}/cart`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(300);
  await s39(page, '01-cart-checkout-button.png');

  // TC-040: Cart item details ────────────────────────────────────────────────
  console.log('TC-040: Cart item metal/purity details');
  const s40 = mkShot('tc040');
  await page.goto(`${BASE_URL}/cart`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(700);
  await s40(page, '01-cart-item-details.png');
  await page.evaluate(() => window.scrollBy(0, 200));
  await page.waitForTimeout(300);
  await s40(page, '02-cart-price-breakdown.png');

  // TC-041: Add product with gold metal option ────────────────────────────────
  console.log('TC-041: Add to cart — select gold purity');
  const s41 = mkShot('tc041');
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  await page.locator('[class*="cursor-pointer"]').first().click();
  await page.waitForURL(/\/product\//, { timeout: 6000 });
  await page.waitForTimeout(800);
  const goldBtn = page.locator('button').filter({ hasText: /gold/i }).first();
  if (await goldBtn.count() > 0) await goldBtn.click();
  await page.waitForTimeout(400);
  await s41(page, '01-gold-metal-selected.png');
  const purityBtn = page.locator('button').filter({ hasText: /22k|24k|18k/i }).first();
  if (await purityBtn.count() > 0) await purityBtn.click();
  await page.waitForTimeout(300);
  await s41(page, '02-purity-selected.png');

  // TC-042: Cart WhatsApp/contact button ─────────────────────────────────────
  console.log('TC-042: Cart WhatsApp button');
  const s42 = mkShot('tc042');
  await page.goto(`${BASE_URL}/cart`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  const whatsappBtn = page.locator('a[href*="whatsapp"], button').filter({ hasText: /whatsapp|contact/i }).first();
  if (await whatsappBtn.count() > 0) {
    await whatsappBtn.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
  }
  await s42(page, '01-cart-with-whatsapp.png');

  // TC-043: Cart gold rate based pricing ─────────────────────────────────────
  console.log('TC-043: Cart pricing based on gold rate');
  const s43 = mkShot('tc043');
  await page.goto(`${BASE_URL}/cart`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(700);
  await s43(page, '01-cart-live-pricing.png');

  await browser.close();
  console.log('TC-035 to TC-043 done.');
})();
