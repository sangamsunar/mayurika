/** TC-003: User Login Validation (Empty fields + Wrong password) */

const { chromium } = require('playwright');
const path = require('path');
const { BASE_URL, STABLE_USER } = require('./test-config');
const { makeShot } = require('./helpers');

const OUT_DIR = path.join(__dirname, 'screenshots', 'tc003');

(async () => {
  console.log('\nTC-003: Login Validation');
  const shot = makeShot(OUT_DIR);

  const browser = await chromium.launch({ headless: false, slowMo: 350 });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page    = await context.newPage();

  // Step 1: Submit completely empty form
  console.log('Step 1: Submit empty form');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await page.click('button[type="submit"]');
  await page.waitForTimeout(800);
  await shot(page, '01-empty-fields-validation.png');

  // Step 2: Fill email only, wrong password
  console.log('Step 2: Wrong password');
  await page.fill('input[type="email"]', STABLE_USER.email);
  await page.fill('input[placeholder="Your password"]', 'WrongPass999');
  await shot(page, '02-wrong-password-entered.png');

  // Step 3: Submit and capture error toast
  console.log('Step 3: Submit wrong password → error toast');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1500);
  await shot(page, '03-wrong-password-error.png');

  await browser.close();
  console.log('TC-003 screenshots saved.');
})();
