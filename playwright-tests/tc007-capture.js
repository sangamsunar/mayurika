/** TC-007: Men's Collection */

const { chromium } = require('playwright');
const path = require('path');
const { BASE_URL } = require('./test-config');
const { makeShot } = require('./helpers');

const OUT_DIR = path.join(__dirname, 'screenshots', 'tc007');

(async () => {
  console.log('\nTC-007: Men\'s Collection');
  const shot = makeShot(OUT_DIR);

  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page    = await context.newPage();

  // Step 1: Men's page
  console.log('Step 1: Men\'s page');
  await page.goto(`${BASE_URL}/men`, { waitUntil: 'networkidle' });
  await shot(page, '01-men-page.png');

  // Step 2: Scroll to product grid
  console.log('Step 2: Product grid');
  await page.evaluate(() => window.scrollBy(0, 400));
  await page.waitForTimeout(500);
  await shot(page, '02-men-product-grid.png');

  await browser.close();
  console.log('TC-007 screenshots saved.');
})();
