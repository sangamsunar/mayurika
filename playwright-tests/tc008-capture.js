/** TC-008: Women's Collection */

const { chromium } = require('playwright');
const path = require('path');
const { BASE_URL } = require('./test-config');
const { makeShot } = require('./helpers');

const OUT_DIR = path.join(__dirname, 'screenshots', 'tc008');

(async () => {
  console.log('\nTC-008: Women\'s Collection');
  const shot = makeShot(OUT_DIR);

  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page    = await context.newPage();

  // Step 1: Women's page
  console.log('Step 1: Women\'s page');
  await page.goto(`${BASE_URL}/women`, { waitUntil: 'networkidle' });
  await shot(page, '01-women-page.png');

  // Step 2: Scroll to product grid
  console.log('Step 2: Product grid');
  await page.evaluate(() => window.scrollBy(0, 400));
  await page.waitForTimeout(500);
  await shot(page, '02-women-product-grid.png');

  await browser.close();
  console.log('TC-008 screenshots saved.');
})();
