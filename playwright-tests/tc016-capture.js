/** TC-016: Admin — Add New Product */

const { chromium } = require('playwright');
const path = require('path');
const { BASE_URL, ADMIN } = require('./test-config');
const { makeShot, loginUser } = require('./helpers');

const OUT_DIR = path.join(__dirname, 'screenshots', 'tc016');

(async () => {
  console.log('\nTC-016: Admin Add Product');
  const shot = makeShot(OUT_DIR);

  const browser = await chromium.launch({ headless: false, slowMo: 350 });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page    = await context.newPage();

  // Login as admin
  console.log('Step 1: Login as admin');
  await loginUser(page, ADMIN.email, ADMIN.password);
  await page.waitForURL(/\/admin/, { timeout: 10000 });
  await page.waitForTimeout(800);

  // Step 2: Products tab → product list
  console.log('Step 2: Products tab');
  const productsTab = page.locator('button').filter({ hasText: /product/i }).first();
  await productsTab.click();
  await page.waitForTimeout(600);
  await shot(page, '01-products-list.png');

  // Step 3: Add product form (scroll up where form is)
  console.log('Step 3: Add product form');
  const addBtn = page.locator('button').filter({ hasText: /add|new product/i }).first();
  if (await addBtn.count() > 0) await addBtn.click();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  await shot(page, '02-add-product-form.png');

  // Step 4: Fill in product name and category
  console.log('Step 4: Fill form fields');
  const nameInput = page.locator('input[placeholder*="name" i], input[placeholder*="product" i]').first();
  if (await nameInput.count() > 0) await nameInput.fill('Test Gold Ring');
  const descInput = page.locator('textarea, input[placeholder*="desc" i]').first();
  if (await descInput.count() > 0) await descInput.fill('A beautiful test ring for documentation');
  await page.waitForTimeout(400);
  await shot(page, '03-product-form-filled.png');

  // Step 5: Scroll to see more form fields
  console.log('Step 5: More form fields');
  await page.evaluate(() => window.scrollBy(0, 400));
  await page.waitForTimeout(400);
  await shot(page, '04-product-form-lower-fields.png');

  await browser.close();
  console.log('TC-016 screenshots saved.');
})();
