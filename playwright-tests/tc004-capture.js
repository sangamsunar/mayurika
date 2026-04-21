/** TC-004: Forgot Password → OTP → Reset Password (uses yopmail from TC-001) */

const { chromium } = require('playwright');
const fs   = require('fs');
const path = require('path');
const { BASE_URL, STABLE_USER } = require('./test-config');
const { makeShot, getOtpFromYopmail } = require('./helpers');

const OUT_DIR = path.join(__dirname, 'screenshots', 'tc004');

(async () => {
  console.log('\nTC-004: Forgot Password + OTP + Reset');
  console.log(`Using email: ${STABLE_USER.email}`);
  const shot = makeShot(OUT_DIR);

  const browser = await chromium.launch({ headless: false, slowMo: 350 });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page    = await context.newPage();

  // Step 1: Forgot password page
  console.log('Step 1: Forgot password page');
  await page.goto(`${BASE_URL}/forgot-password`, { waitUntil: 'networkidle' });
  await shot(page, '01-forgot-password-page.png');

  // Step 2: Enter email
  console.log('Step 2: Enter email');
  await page.fill('input[type="email"]', STABLE_USER.email);
  await shot(page, '02-email-entered.png');

  // Step 3: Submit → redirects to /verify-otp
  console.log('Step 3: Submit → verify-otp');
  await page.click('button[type="submit"]');
  await page.waitForURL(/verify-otp/, { timeout: 10000 });
  await page.waitForTimeout(800);
  await shot(page, '03-verify-otp-page.png');

  // Step 4: Fetch OTP from yopmail
  const yopmailUser = STABLE_USER.email.replace('@yopmail.com', '');
  const otp = await getOtpFromYopmail(context, yopmailUser);

  // Copy yopmail screenshot into tc004 folder
  const yopSrc = path.join(__dirname, 'screenshots', '_yopmail', `${yopmailUser}-inbox.png`);
  if (fs.existsSync(yopSrc)) fs.copyFileSync(yopSrc, path.join(OUT_DIR, '04-yopmail-otp-email.png'));

  if (!otp) { console.error('Could not get OTP. Exiting.'); await browser.close(); process.exit(1); }
  console.log(`OTP received: ${otp}`);

  // Step 5: Enter OTP
  console.log('Step 5: Enter OTP');
  await page.bringToFront();
  await page.fill('input[inputmode="numeric"]', otp);
  await shot(page, '05-otp-entered.png');

  // Step 6: Submit OTP → /reset-password
  console.log('Step 6: Submit OTP');
  await page.click('button[type="submit"]');
  await page.waitForURL(/reset-password/, { timeout: 8000 });
  await page.waitForTimeout(600);
  await shot(page, '06-reset-password-page.png');

  // Step 7: Enter new password
  console.log('Step 7: Enter new password');
  const inputs = page.locator('input[type="password"], input[placeholder*="password" i]');
  await inputs.first().fill('NewSecure@456');
  await inputs.nth(1).fill('NewSecure@456').catch(() => {
    // some pages use a second password field with different selector
    page.locator('input').nth(1).fill('NewSecure@456');
  });
  await shot(page, '07-new-password-entered.png');

  // Step 8: Submit reset → redirected to /login
  console.log('Step 8: Submit reset');
  await page.click('button[type="submit"]');
  await page.waitForURL(/login/, { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(800);
  await shot(page, '08-reset-success-login.png');

  // Update config password since we changed it
  const meta = { email: STABLE_USER.email, otp, newPassword: 'NewSecure@456' };
  fs.writeFileSync(path.join(__dirname, 'tc004-run.json'), JSON.stringify(meta));

  await browser.close();
  console.log('TC-004 screenshots saved.');
})();
