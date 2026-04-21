/** Batch: TC-051 to TC-058 — Profile Extended */
const { chromium } = require('playwright');
const path = require('path');
const { BASE_URL, STABLE_USER } = require('./test-config');
const { makeShot, loginUser } = require('./helpers');

const mkShot = (tc) => makeShot(path.join(__dirname, 'screenshots', tc));

(async () => {
  console.log('\nBatch: Profile Extended (TC-051 to TC-058)');
  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page    = await context.newPage();

  await loginUser(page, STABLE_USER.email, STABLE_USER.password);
  await page.goto(`${BASE_URL}/profile`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  // TC-051: Profile completion score ────────────────────────────────────────
  console.log('TC-051: Profile completion score');
  const s51 = mkShot('tc051');
  await s51(page, '01-profile-completion-score.png');
  await page.evaluate(() => window.scrollBy(0, 200));
  await s51(page, '02-profile-missing-fields.png');

  // TC-052: Profile personal info tab ───────────────────────────────────────
  console.log('TC-052: Profile personal info');
  const s52 = mkShot('tc052');
  const profileTab = page.locator('button').filter({ hasText: /profile|personal|account/i }).first();
  if (await profileTab.count() > 0) await profileTab.click();
  await page.waitForTimeout(400);
  await s52(page, '01-profile-personal-info.png');

  // TC-053: Update gender selection ─────────────────────────────────────────
  console.log('TC-053: Gender selection in profile');
  const s53 = mkShot('tc053');
  const femaleBtn = page.locator('button').filter({ hasText: /female|♀/i }).first();
  if (await femaleBtn.count() > 0) await femaleBtn.click();
  await page.waitForTimeout(400);
  await s53(page, '01-gender-selected.png');

  // TC-054: Add new address ─────────────────────────────────────────────────
  console.log('TC-054: Add new address');
  const s54 = mkShot('tc054');
  const addrTab = page.locator('button').filter({ hasText: /address/i }).first();
  if (await addrTab.count() > 0) await addrTab.click();
  await page.waitForTimeout(400);
  await s54(page, '01-addresses-section.png');
  const addAddrBtn = page.locator('button').filter({ hasText: /add.*address|new address/i }).first();
  if (await addAddrBtn.count() > 0) await addAddrBtn.click();
  await page.waitForTimeout(500);
  await s54(page, '02-add-address-form.png');

  // TC-055: Size profile tab ────────────────────────────────────────────────
  console.log('TC-055: Size profile');
  const s55 = mkShot('tc055');
  const sizeTab = page.locator('button').filter({ hasText: /size/i }).first();
  if (await sizeTab.count() > 0) await sizeTab.click();
  await page.waitForTimeout(500);
  await s55(page, '01-size-profile-tab.png');
  await page.evaluate(() => window.scrollBy(0, 300));
  await s55(page, '02-size-profile-fields.png');

  // TC-056: Avatar upload area ───────────────────────────────────────────────
  console.log('TC-056: Avatar upload area');
  const s56 = mkShot('tc056');
  await page.goto(`${BASE_URL}/profile`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await s56(page, '01-profile-avatar-area.png');

  // TC-057: View order in profile ────────────────────────────────────────────
  console.log('TC-057: Orders in profile');
  const s57 = mkShot('tc057');
  const ordersTab = page.locator('button').filter({ hasText: /order/i }).first();
  if (await ordersTab.count() > 0) await ordersTab.click();
  await page.waitForTimeout(600);
  await s57(page, '01-orders-list-in-profile.png');
  await page.evaluate(() => window.scrollBy(0, 300));
  await s57(page, '02-order-status-badges.png');

  // TC-058: Order detail / receipt ───────────────────────────────────────────
  console.log('TC-058: Order receipt');
  const s58 = mkShot('tc058');
  const firstOrder = page.locator('[class*="order"], tr, div').filter({ hasText: /order|#/i }).nth(1);
  if (await firstOrder.count() > 0) await firstOrder.click().catch(() => {});
  await page.waitForTimeout(600);
  const printBtn = page.locator('button').filter({ hasText: /print|receipt|invoice/i }).first();
  if (await printBtn.count() > 0) await printBtn.scrollIntoViewIfNeeded();
  await s58(page, '01-order-detail-receipt.png');

  await browser.close();
  console.log('TC-051 to TC-058 done.');
})();
