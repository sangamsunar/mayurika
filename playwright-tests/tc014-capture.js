/** TC-014: User Profile — View and Update */

const { chromium } = require('playwright');
const path = require('path');
const { BASE_URL, STABLE_USER } = require('./test-config');
const { makeShot, loginUser } = require('./helpers');

const OUT_DIR = path.join(__dirname, 'screenshots', 'tc014');

(async () => {
  console.log('\nTC-014: User Profile');
  const shot = makeShot(OUT_DIR);

  const browser = await chromium.launch({ headless: false, slowMo: 350 });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page    = await context.newPage();

  // Step 1: Login
  console.log('Step 1: Login');
  await loginUser(page, STABLE_USER.email, STABLE_USER.password);

  // Step 2: Profile page
  console.log('Step 2: Profile page');
  await page.goto(`${BASE_URL}/profile`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await shot(page, '01-profile-overview.png');

  // Step 3: Find and click Edit / profile tab
  console.log('Step 3: Profile edit section');
  const profileTab = page.locator('button').filter({ hasText: /profile|account|edit/i }).first();
  if (await profileTab.count() > 0) await profileTab.click();
  await page.waitForTimeout(500);
  await shot(page, '02-profile-edit-section.png');

  // Step 4: Update phone number field
  console.log('Step 4: Edit a field');
  const phoneInput = page.locator('input[type="tel"], input[placeholder*="phone" i]').first();
  if (await phoneInput.count() > 0) {
    await phoneInput.fill('9800000001');
    await shot(page, '03-profile-field-updated.png');
  } else {
    await shot(page, '03-profile-fields.png');
  }

  await browser.close();
  console.log('TC-014 screenshots saved.');
})();
