/** Batch: TC-073 to TC-076 — Chatbot */
const { chromium } = require('playwright');
const path = require('path');
const { BASE_URL } = require('./test-config');
const { makeShot } = require('./helpers');

const mkShot = (tc) => makeShot(path.join(__dirname, 'screenshots', tc));

(async () => {
  console.log('\nBatch: Chatbot (TC-073 to TC-076)');
  const browser = await chromium.launch({ headless: false, slowMo: 350 });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page    = await context.newPage();

  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  // TC-073: Open chatbot widget ──────────────────────────────────────────────
  console.log('TC-073: Open chatbot');
  const s73 = mkShot('tc073');
  await s73(page, '01-home-with-chatbot-button.png');
  const chatBtn = page.locator('button').filter({ hasText: /chat|bot|message|assistant/i }).last();
  const chatIcon = page.locator('[class*="chat"], [class*="bot"]').last();
  const btn = (await chatBtn.count() > 0) ? chatBtn : chatIcon;
  if (await btn.count() > 0) await btn.click();
  await page.waitForTimeout(800);
  await s73(page, '02-chatbot-open.png');

  // TC-074: Send message ─────────────────────────────────────────────────────
  console.log('TC-074: Send chatbot message');
  const s74 = mkShot('tc074');
  const chatInput = page.locator('input[placeholder*="message" i], input[placeholder*="ask" i], textarea').last();
  if (await chatInput.count() > 0) {
    await chatInput.fill('Hello, what jewellery do you have?');
    await s74(page, '01-chatbot-message-typed.png');
    await chatInput.press('Enter');
    await page.waitForTimeout(2000);
  } else {
    await s74(page, '01-chatbot-panel.png');
  }

  // TC-075: Chatbot response ─────────────────────────────────────────────────
  console.log('TC-075: Chatbot response');
  const s75 = mkShot('tc075');
  await page.waitForTimeout(1500);
  await s75(page, '01-chatbot-response.png');
  await page.evaluate(() => window.scrollBy(0, 100));
  await s75(page, '02-chatbot-conversation.png');

  // TC-076: Close chatbot ────────────────────────────────────────────────────
  console.log('TC-076: Close chatbot');
  const s76 = mkShot('tc076');
  const closeBtn = page.locator('button').filter({ hasText: /close|×|✕/i }).last();
  const xBtn = page.locator('[class*="close"], [aria-label*="close" i]').last();
  const closeTarget = (await closeBtn.count() > 0) ? closeBtn : xBtn;
  if (await closeTarget.count() > 0) await closeTarget.click();
  await page.waitForTimeout(600);
  await s76(page, '01-chatbot-closed.png');

  await browser.close();
  console.log('TC-073 to TC-076 done.');
})();
