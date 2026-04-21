/**
 * Playwright screenshot capture for TC-001: User Registration
 * Automates the full register → yopmail OTP → verify flow
 * Run: node capture.js
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL  = 'http://localhost:5173';
const YOPMAIL_USER = `mayurika.test${Date.now()}`;
const EMAIL     = `${YOPMAIL_USER}@yopmail.com`;
const PASSWORD  = 'SecurePass@123';
const NAME      = 'Test User';
const OUT_DIR   = path.join(__dirname, 'screenshots', 'tc001');

fs.mkdirSync(OUT_DIR, { recursive: true });

const shot = (page, name) =>
  page.screenshot({ path: path.join(OUT_DIR, name), fullPage: false });

async function getOtpFromYopmail(context) {
  console.log('  Opening yopmail to fetch OTP…');
  const yop = await context.newPage();
  await yop.goto('https://yopmail.com/en/', { waitUntil: 'domcontentloaded' });

  // Accept cookie if banner appears
  try { await yop.click('button#accept', { timeout: 3000 }); } catch {}

  // Enter username
  await yop.fill('#login', YOPMAIL_USER);
  await yop.click('[type="submit"].md, button.sbut, #refreshbut', { timeout: 5000 }).catch(() =>
    yop.keyboard.press('Enter')
  );

  // Poll inbox iframe for the email (max 30s)
  let otp = null;
  for (let attempt = 0; attempt < 10; attempt++) {
    await yop.waitForTimeout(3000);
    try {
      // Refresh inbox
      const refreshBtn = yop.locator('#refreshbut');
      if (await refreshBtn.isVisible()) await refreshBtn.click();
      await yop.waitForTimeout(1500);

      // Click first email in inbox iframe
      const inboxFrame = yop.frameLocator('#ifinbox');
      const firstMail  = inboxFrame.locator('.lm').first();
      await firstMail.click({ timeout: 4000 });
      await yop.waitForTimeout(1500);

      // Read OTP from mail iframe
      const mailFrame  = yop.frameLocator('#ifmail');
      const bodyText   = await mailFrame.locator('body').innerText({ timeout: 5000 });
      const match      = bodyText.match(/\b(\d{6})\b/);
      if (match) { otp = match[1]; break; }
    } catch { /* email not arrived yet */ }
  }

  await shot(yop, '05-yopmail-inbox.png');
  await yop.close();
  return otp;
}

(async () => {
  console.log(`\nTC-001 Register Flow`);
  console.log(`Email: ${EMAIL}\n`);

  const browser = await chromium.launch({ headless: false, slowMo: 400 });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page    = await context.newPage();

  // ── Step 1: Empty register page ──────────────────────────────────────────
  console.log('Step 1: Navigate to /register');
  await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle' });
  await shot(page, '01-register-empty.png');

  // ── Step 2: Fill form ─────────────────────────────────────────────────────
  console.log('Step 2: Fill registration form');
  await page.fill('input[placeholder="Your full name"]', NAME);
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[placeholder="At least 6 characters"]', PASSWORD);
  await shot(page, '02-register-filled.png');

  // ── Step 3: Submit ────────────────────────────────────────────────────────
  console.log('Step 3: Submit form');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1500);
  await shot(page, '03-register-submitted.png');

  // ── Step 4: Verify email page ─────────────────────────────────────────────
  console.log('Step 4: Waiting for /verify-email redirect…');
  await page.waitForURL(/verify-email/, { timeout: 10000 });
  await shot(page, '04-verify-email-page.png');

  // ── Step 5: Fetch OTP from yopmail ────────────────────────────────────────
  const otp = await getOtpFromYopmail(context);
  if (!otp) {
    console.error('Could not fetch OTP from yopmail. Exiting.');
    await browser.close(); process.exit(1);
  }
  console.log(`OTP received: ${otp}`);

  // ── Step 6: Enter OTP ─────────────────────────────────────────────────────
  console.log('Step 6: Enter OTP');
  await page.bringToFront();
  await page.fill('input[inputmode="numeric"]', otp);
  await shot(page, '06-otp-entered.png');

  // ── Step 7: Submit OTP ────────────────────────────────────────────────────
  console.log('Step 7: Submit OTP');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);
  await shot(page, '07-otp-submitted.png');

  // ── Step 8: Expect redirect to /login ─────────────────────────────────────
  console.log('Step 8: Redirect to /login');
  await page.waitForURL(/login/, { timeout: 8000 }).catch(() => {});
  await shot(page, '08-login-page-after-verify.png');

  await browser.close();

  // Save email used for docx generator to pick up
  fs.writeFileSync(path.join(__dirname, 'last-run.json'), JSON.stringify({ email: EMAIL, otp }));

  console.log('\nAll screenshots saved to playwright-tests/screenshots/tc001/');
  console.log('Run: node generate-docx.js');
})();
