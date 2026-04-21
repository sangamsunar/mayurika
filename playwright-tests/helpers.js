/**
 * Shared helpers for all TC capture scripts.
 */

const fs   = require('fs');
const path = require('path');
const { BASE_URL } = require('./test-config');

/** Create a screenshot helper bound to an output directory */
function makeShot(outDir) {
  fs.mkdirSync(outDir, { recursive: true });
  return (page, name) => page.screenshot({ path: path.join(outDir, name), fullPage: false });
}

/** Log in a user via the /login page. Resolves when navigation after login is complete. */
async function loginUser(page, email, password) {
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', email);
  await page.fill('input[placeholder="Your password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/^(?!.*\/login).*$/, { timeout: 10000 });
  await page.waitForTimeout(800);
}

/**
 * Open yopmail, wait for an email to arrive, read the first 6-digit number from it.
 * Returns the OTP string or null if not found within 30 s.
 */
async function getOtpFromYopmail(context, yopmailUser) {
  console.log('  Opening yopmail to fetch OTP…');
  const yop = await context.newPage();
  await yop.goto('https://yopmail.com/en/', { waitUntil: 'domcontentloaded' });
  try { await yop.click('button#accept', { timeout: 3000 }); } catch {}

  await yop.fill('#login', yopmailUser);
  await yop.keyboard.press('Enter');

  let otp = null;
  const shotsDir = path.join(__dirname, 'screenshots', '_yopmail');
  fs.mkdirSync(shotsDir, { recursive: true });

  for (let i = 0; i < 10; i++) {
    await yop.waitForTimeout(3000);
    try {
      const refreshBtn = yop.locator('#refreshbut');
      if (await refreshBtn.isVisible()) await refreshBtn.click();
      await yop.waitForTimeout(1500);

      const inboxFrame = yop.frameLocator('#ifinbox');
      const firstMail  = inboxFrame.locator('.lm').first();
      await firstMail.click({ timeout: 4000 });
      await yop.waitForTimeout(1500);

      const mailFrame = yop.frameLocator('#ifmail');
      const bodyText  = await mailFrame.locator('body').innerText({ timeout: 5000 });
      const match = bodyText.match(/\b(\d{6})\b/);
      if (match) { otp = match[1]; break; }
    } catch {}
  }

  await yop.screenshot({ path: path.join(shotsDir, `${yopmailUser}-inbox.png`), fullPage: false });
  await yop.close();
  return otp;
}

/** Launch a headed Chromium browser with standard viewport */
async function launchBrowser(playwright) {
  const browser = await playwright.chromium.launch({ headless: false, slowMo: 350 });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page    = await context.newPage();
  return { browser, context, page };
}

module.exports = { makeShot, loginUser, getOtpFromYopmail, launchBrowser };
