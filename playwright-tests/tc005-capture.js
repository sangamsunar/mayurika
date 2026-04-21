/** TC-005: Home Page — Browse Products */

const { chromium } = require('playwright');
const path = require('path');
const { BASE_URL } = require('./test-config');
const { makeShot } = require('./helpers');

const OUT_DIR = path.join(__dirname, 'screenshots', 'tc005');

(async () => {
  console.log('\nTC-005: Home Page Browse');
  const shot = makeShot(OUT_DIR);

  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page    = await context.newPage();

  // Step 1: Home page hero
  console.log('Step 1: Home hero section');
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  await shot(page, '01-home-hero.png');

  // Step 2: Scroll down to product listings
  console.log('Step 2: Product grid');
  await page.evaluate(() => window.scrollBy(0, 600));
  await page.waitForTimeout(600);
  await shot(page, '02-home-product-grid.png');

  // Step 3: Scroll to category navigation / footer area
  console.log('Step 3: Category nav');
  await page.evaluate(() => window.scrollBy(0, 600));
  await page.waitForTimeout(500);
  await shot(page, '03-home-categories.png');

  await browser.close();
  console.log('TC-005 screenshots saved.');
})();
