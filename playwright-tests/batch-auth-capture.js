/** Batch: TC-021 to TC-026 — Auth Edge Cases */
const { chromium } = require('playwright');
const fs   = require('fs');
const path = require('path');
const { BASE_URL, STABLE_USER, DEFAULT_PASSWORD } = require('./test-config');
const { makeShot, loginUser, getOtpFromYopmail } = require('./helpers');

const mkShot = (tc) => makeShot(path.join(__dirname, 'screenshots', tc));

(async () => {
  console.log('\nBatch: Auth Edge Cases (TC-021 to TC-026)');
  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page    = await context.newPage();

  // TC-021: Register duplicate email ─────────────────────────────────────────
  console.log('TC-021: Duplicate email registration');
  const s21 = mkShot('tc021');
  await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle' });
  await page.fill('input[placeholder="Your full name"]', 'Test User');
  await page.fill('input[type="email"]', STABLE_USER.email);
  await page.fill('input[placeholder="At least 6 characters"]', DEFAULT_PASSWORD);
  await s21(page, '01-duplicate-email-form.png');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1500);
  await s21(page, '02-duplicate-email-error.png');

  // TC-022: Register empty fields ────────────────────────────────────────────
  console.log('TC-022: Register empty fields');
  const s22 = mkShot('tc022');
  await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle' });
  await s22(page, '01-register-empty-form.png');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(600);
  await s22(page, '02-register-empty-validation.png');

  // TC-023: Register weak password ───────────────────────────────────────────
  console.log('TC-023: Weak password strength indicator');
  const s23 = mkShot('tc023');
  await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle' });
  await page.fill('input[placeholder="At least 6 characters"]', 'abc');
  await page.waitForTimeout(400);
  await s23(page, '01-weak-password-indicator.png');
  await page.fill('input[placeholder="At least 6 characters"]', 'abcdef7');
  await page.waitForTimeout(300);
  await s23(page, '02-fair-password-indicator.png');
  await page.fill('input[placeholder="At least 6 characters"]', 'StrongPass@123');
  await page.waitForTimeout(300);
  await s23(page, '03-strong-password-indicator.png');

  // TC-024: Password visibility toggle ───────────────────────────────────────
  console.log('TC-024: Password visibility toggle');
  const s24 = mkShot('tc024');
  await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle' });
  await page.fill('input[placeholder="At least 6 characters"]', DEFAULT_PASSWORD);
  await s24(page, '01-password-hidden.png');
  await page.locator('button', { hasText: 'SHOW' }).first().click();
  await page.waitForTimeout(300);
  await s24(page, '02-password-visible.png');

  // TC-025: Access login page then link to register ──────────────────────────
  console.log('TC-025: Login page → Register link');
  const s25 = mkShot('tc025');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await s25(page, '01-login-page.png');
  await page.locator('a', { hasText: /create one|sign up|register/i }).first().click();
  await page.waitForTimeout(600);
  await s25(page, '02-register-page-from-login.png');

  // TC-026: Logout functionality ─────────────────────────────────────────────
  console.log('TC-026: Logout');
  const s26 = mkShot('tc026');
  await loginUser(page, STABLE_USER.email, STABLE_USER.password);
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  await s26(page, '01-logged-in-navbar.png');
  // Try navbar profile / logout button
  const logoutBtn = page.locator('button, a').filter({ hasText: /logout|sign out/i }).first();
  const profileLink = page.locator('a[href*="profile"], button').filter({ hasText: /profile/i }).first();
  if (await logoutBtn.count() > 0) {
    await logoutBtn.click();
  } else if (await profileLink.count() > 0) {
    await profileLink.click();
    await page.waitForTimeout(400);
    await page.locator('button').filter({ hasText: /logout|sign out/i }).first().click().catch(() => {});
  }
  await page.waitForTimeout(1200);
  await s26(page, '02-logged-out-state.png');

  await browser.close();
  console.log('TC-021 to TC-026 done.');
})();
