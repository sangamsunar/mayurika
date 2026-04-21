/** TC-018: Admin Analytics Dashboard */

const { chromium } = require('playwright');
const path = require('path');
const { BASE_URL, ADMIN } = require('./test-config');
const { makeShot, loginUser } = require('./helpers');

const OUT_DIR = path.join(__dirname, 'screenshots', 'tc018');

(async () => {
  console.log('\nTC-018: Admin Analytics');
  const shot = makeShot(OUT_DIR);

  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page    = await context.newPage();

  // Login as admin
  console.log('Step 1: Login as admin + analytics tab');
  await loginUser(page, ADMIN.email, ADMIN.password);
  await page.waitForURL(/\/admin/, { timeout: 10000 });
  await page.waitForTimeout(1500); // wait for charts to render
  await shot(page, '01-analytics-overview.png');

  // Step 2: Scroll to revenue chart
  console.log('Step 2: Revenue chart');
  await page.evaluate(() => window.scrollBy(0, 400));
  await page.waitForTimeout(600);
  await shot(page, '02-revenue-chart.png');

  // Step 3: Scroll further to see more charts / stats
  console.log('Step 3: More analytics');
  await page.evaluate(() => window.scrollBy(0, 500));
  await page.waitForTimeout(500);
  await shot(page, '03-more-analytics-charts.png');

  await browser.close();
  console.log('TC-018 screenshots saved.');
})();
