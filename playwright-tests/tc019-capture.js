/** TC-019: 404 Not Found Page */

const { chromium } = require('playwright');
const path = require('path');
const { BASE_URL } = require('./test-config');
const { makeShot } = require('./helpers');

const OUT_DIR = path.join(__dirname, 'screenshots', 'tc019');

(async () => {
  console.log('\nTC-019: 404 Not Found');
  const shot = makeShot(OUT_DIR);

  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page    = await context.newPage();

  // Navigate to a non-existent route
  console.log('Step 1: Navigate to non-existent URL');
  await page.goto(`${BASE_URL}/this-page-does-not-exist`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await shot(page, '01-404-not-found.png');

  await browser.close();
  console.log('TC-019 screenshots saved.');
})();
