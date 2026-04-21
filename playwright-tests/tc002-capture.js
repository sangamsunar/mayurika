/** TC-002: User Login with Valid Credentials */

const { chromium } = require('playwright');
const path = require('path');
const { BASE_URL, STABLE_USER } = require('./test-config');
const { makeShot } = require('./helpers');

const OUT_DIR = path.join(__dirname, 'screenshots', 'tc002');

(async () => {
  console.log('\nTC-002: User Login — Valid Credentials');
  const shot = makeShot(OUT_DIR);

  const browser = await chromium.launch({ headless: false, slowMo: 350 });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page    = await context.newPage();

  // Step 1: Navigate to login page (empty)
  console.log('Step 1: Login page empty');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await shot(page, '01-login-empty.png');

  // Step 2: Fill in valid credentials
  console.log('Step 2: Fill credentials');
  await page.fill('input[type="email"]', STABLE_USER.email);
  await page.fill('input[placeholder="Your password"]', STABLE_USER.password);
  await shot(page, '02-login-filled.png');

  // Step 3: Submit
  console.log('Step 3: Submit login');
  await page.click('button[type="submit"]');
  await page.waitForURL(/^(?!.*\/login).*$/, { timeout: 10000 });
  await page.waitForTimeout(1000);
  await shot(page, '03-login-success-home.png');

  await browser.close();
  console.log('TC-002 screenshots saved.');
})();
