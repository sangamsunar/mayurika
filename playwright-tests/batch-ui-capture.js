/** Batch: TC-077 to TC-090 — UI, Responsive & Security */
const { chromium } = require('playwright');
const path = require('path');
const { BASE_URL, STABLE_USER, ADMIN } = require('./test-config');
const { makeShot, loginUser } = require('./helpers');

const mkShot = (tc) => makeShot(path.join(__dirname, 'screenshots', tc));

(async () => {
  console.log('\nBatch: UI / Responsive / Security (TC-077 to TC-090)');
  const browser = await chromium.launch({ headless: false, slowMo: 300 });

  // ── Mobile context (375px) ──────────────────────────────────────────────────
  const mobile  = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const mPage   = await mobile.newPage();

  // TC-077: Mobile view home ─────────────────────────────────────────────────
  console.log('TC-077: Mobile home');
  const s77 = mkShot('tc077');
  await mPage.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  await s77(mPage, '01-mobile-home.png');
  await mPage.evaluate(() => window.scrollBy(0, 400));
  await s77(mPage, '02-mobile-home-scrolled.png');

  // TC-078: Mobile navbar menu ───────────────────────────────────────────────
  console.log('TC-078: Mobile navbar');
  const s78 = mkShot('tc078');
  await mPage.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  await s78(mPage, '01-mobile-navbar-closed.png');
  const hamburger = mPage.locator('button').filter({ hasText: /menu|☰|≡/i }).first();
  const hamIcon = mPage.locator('[class*="hamburger"], [class*="menu-btn"], [aria-label*="menu" i]').first();
  const hamBtn = (await hamburger.count() > 0) ? hamburger : hamIcon;
  if (await hamBtn.count() > 0) await hamBtn.click();
  await mPage.waitForTimeout(500);
  await s78(mPage, '02-mobile-navbar-open.png');

  // TC-079: Mobile product detail ────────────────────────────────────────────
  console.log('TC-079: Mobile product detail');
  const s79 = mkShot('tc079');
  await mPage.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  await mPage.locator('[class*="cursor-pointer"]').first().click();
  await mPage.waitForURL(/\/product\//, { timeout: 8000 });
  await mPage.waitForTimeout(800);
  await s79(mPage, '01-mobile-product-detail.png');
  await mPage.evaluate(() => window.scrollBy(0, 400));
  await s79(mPage, '02-mobile-product-options.png');

  // TC-080: Mobile cart ──────────────────────────────────────────────────────
  console.log('TC-080: Mobile cart');
  const s80 = mkShot('tc080');
  await loginUser(mPage, STABLE_USER.email, STABLE_USER.password);
  await mPage.goto(`${BASE_URL}/cart`, { waitUntil: 'networkidle' });
  await mPage.waitForTimeout(600);
  await s80(mPage, '01-mobile-cart.png');

  await mobile.close();

  // ── Tablet context (768px) ──────────────────────────────────────────────────
  const tablet  = await browser.newContext({ viewport: { width: 768, height: 1024 } });
  const tPage   = await tablet.newPage();

  // TC-081: Tablet home ──────────────────────────────────────────────────────
  console.log('TC-081: Tablet view');
  const s81 = mkShot('tc081');
  await tPage.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  await s81(tPage, '01-tablet-home.png');
  await tPage.evaluate(() => window.scrollBy(0, 400));
  await s81(tPage, '02-tablet-product-grid.png');

  await tablet.close();

  // ── Desktop context ─────────────────────────────────────────────────────────
  const desktop = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const dPage   = await desktop.newPage();

  // TC-082: Footer links ─────────────────────────────────────────────────────
  console.log('TC-082: Footer links');
  const s82 = mkShot('tc082');
  await dPage.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  await dPage.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await dPage.waitForTimeout(500);
  await s82(dPage, '01-footer-section.png');
  await dPage.locator('footer a').first().scrollIntoViewIfNeeded().catch(() => {});
  await s82(dPage, '02-footer-links.png');

  // TC-083: Navbar logged out state ─────────────────────────────────────────
  console.log('TC-083: Navbar states');
  const s83 = mkShot('tc083');
  await dPage.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  await s83(dPage, '01-navbar-logged-out.png');
  await loginUser(dPage, STABLE_USER.email, STABLE_USER.password);
  await dPage.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  await s83(dPage, '02-navbar-logged-in.png');

  // TC-084: Navbar logo home link ───────────────────────────────────────────
  console.log('TC-084: Navbar logo');
  const s84 = mkShot('tc084');
  await dPage.goto(`${BASE_URL}/men`, { waitUntil: 'networkidle' });
  await s84(dPage, '01-on-men-page.png');
  await dPage.locator('a').filter({ hasText: /maryurika|mayurika/i }).first().click();
  await dPage.waitForURL('**/');
  await dPage.waitForTimeout(500);
  await s84(dPage, '02-back-to-home-via-logo.png');

  // TC-085: 404 page back to home ───────────────────────────────────────────
  console.log('TC-085: 404 → home navigation');
  const s85 = mkShot('tc085');
  await dPage.goto(`${BASE_URL}/nonexistent`, { waitUntil: 'networkidle' });
  await s85(dPage, '01-404-page.png');
  const homeLink = dPage.locator('a').filter({ hasText: /home|back/i }).first();
  if (await homeLink.count() > 0) await homeLink.click();
  await dPage.waitForURL('**/');
  await dPage.waitForTimeout(400);
  await s85(dPage, '02-back-to-home-from-404.png');

  // TC-086: Regular user accessing /admin → redirect ────────────────────────
  console.log('TC-086: Regular user access /admin');
  const s86 = mkShot('tc086');
  await dPage.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle' });
  await dPage.waitForTimeout(800);
  await s86(dPage, '01-admin-blocked-regular-user.png');

  // TC-087: Session persistence after refresh ───────────────────────────────
  console.log('TC-087: Session persistence');
  const s87 = mkShot('tc087');
  await dPage.goto(`${BASE_URL}/profile`, { waitUntil: 'networkidle' });
  await dPage.waitForTimeout(500);
  await s87(dPage, '01-profile-before-refresh.png');
  await dPage.reload({ waitUntil: 'networkidle' });
  await dPage.waitForTimeout(600);
  await s87(dPage, '02-profile-after-refresh.png');

  // TC-088: Access /profile without login ───────────────────────────────────
  console.log('TC-088: /profile unauthenticated');
  const s88 = mkShot('tc088');
  const noAuthCtx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const naPage = await noAuthCtx.newPage();
  await naPage.goto(`${BASE_URL}/profile`, { waitUntil: 'networkidle' });
  await naPage.waitForTimeout(800);
  await s88(naPage, '01-profile-unauthenticated-redirect.png');
  await naPage.goto(`${BASE_URL}/checkout`, { waitUntil: 'networkidle' });
  await naPage.waitForTimeout(800);
  await s88(naPage, '02-checkout-unauthenticated-redirect.png');
  await noAuthCtx.close();

  // TC-089: Logout clears session ───────────────────────────────────────────
  console.log('TC-089: Logout clears session');
  const s89 = mkShot('tc089');
  await loginUser(dPage, STABLE_USER.email, STABLE_USER.password);
  await dPage.goto(`${BASE_URL}/profile`, { waitUntil: 'networkidle' });
  await s89(dPage, '01-logged-in-profile.png');
  const logoutBtn = dPage.locator('button').filter({ hasText: /logout|sign out/i }).first();
  if (await logoutBtn.count() > 0) await logoutBtn.click();
  await dPage.waitForTimeout(800);
  await s89(dPage, '02-after-logout.png');

  // TC-090: Login page forgot password link ─────────────────────────────────
  console.log('TC-090: Login forgot password link');
  const s90 = mkShot('tc090');
  await dPage.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await s90(dPage, '01-login-with-forgot-link.png');
  await dPage.locator('a').filter({ hasText: /forgot/i }).first().click();
  await dPage.waitForURL(/forgot/, { timeout: 6000 });
  await dPage.waitForTimeout(400);
  await s90(dPage, '02-forgot-password-from-login.png');

  await desktop.close();
  await browser.close();
  console.log('TC-077 to TC-090 done.');
})();
