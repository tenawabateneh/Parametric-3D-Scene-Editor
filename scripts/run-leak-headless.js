#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const url = process.argv[2] || 'http://localhost:5174/?leakTest=1&leakIterations=60&leakDelay=5';
const out = process.argv[3] || path.resolve(process.cwd(), 'tmp', `leak-headless-${Date.now()}.json`);

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: 'domcontentloaded' });

  try {
    await page.waitForFunction(() => window.__leakTestReport !== undefined, { timeout: 120000 });
    const report = await page.evaluate(() => window.__leakTestReport);

    const dir = path.dirname(out);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(out, JSON.stringify({ receivedAt: new Date().toISOString(), report }, null, 2));
    console.log('Leak report written to', out);
  } catch (e) {
    console.error('Timed out waiting for leak report', e);
    await page.screenshot({ path: path.resolve(process.cwd(), 'tmp', `leak-timeout-${Date.now()}.png`) });
  } finally {
    await browser.close();
  }
})();


