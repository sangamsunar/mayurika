/** TC-006: Product Search */

const { chromium } = require('playwright');
const path = require('path');
const { BASE_URL } = require('./test-config');
const { makeShot } = require('./helpers');

const OUT_DIR = path.join(__dirname, 'screenshots', 'tc006');

(async () => {
  console.log('\nTC-006: Product Search');
  const shot = makeShot(OUT_DIR);

  const browser = await chromium.launch({ headless: false, slowMo: 350 });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page    = await context.newPage();

  // Step 1: Search page empty
  console.log('Step 1: Search page empty');
  await page.goto(`${BASE_URL}/search`, { waitUntil: 'networkidle' });
  await shot(page, '01-search-page-empty.png');

  // Step 2: Type a search query
  console.log('Step 2: Type "ring"');
  const searchInput = page.locator('input[type="search"], input[type="text"], input[placeholder*="search" i]').first();
  await searchInput.fill('ring');
  await page.waitForTimeout(800);
  await shot(page, '02-search-query-ring.png');

  // Step 3: Results
  console.log('Step 3: Results shown');
  await page.waitForTimeout(1000);
  await shot(page, '03-search-results.png');

  // Step 4: No results query
  console.log('Step 4: No results query');
  await searchInput.click({ clickCount: 3 }).catch(() => {});
  await searchInput.fill('xyznotfounditem999');
  await page.waitForTimeout(1000);
  await shot(page, '04-search-no-results.png');

  await browser.close();
  console.log('TC-006 screenshots saved.');
})();
