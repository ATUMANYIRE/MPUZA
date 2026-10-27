// Drives the running app and captures the states worth reviewing.
// Usage: npm run dev, then npm run shots
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const BASE = process.env.BASE ?? 'http://127.0.0.1:5173';
const OUT = resolve(import.meta.dirname, '../../docs/_shots');

// Real device widths, smallest phone still in use → desktop.
const VIEWPORTS = [
  ['320', { width: 320, height: 658 }, true], // iPhone SE 1st gen
  ['375', { width: 375, height: 812 }, true], // iPhone X / 12 mini
  ['414', { width: 414, height: 896 }, true], // iPhone 11 Pro Max
  ['430', { width: 430, height: 932 }, true], // iPhone 15 Pro Max
  ['768', { width: 768, height: 1024 }, true], // iPad portrait
  ['1440', { width: 1440, height: 900 }, false],
];

const DRAFT = {
  name: 'INTERNORY',
  website: 'https://intern-ory.com',
  slogan: 'Internships, rebuilt for the best.',
  description:
    'Internory is the enterprise platform where ambitious students meet the world’s top companies — with pipelines, interviews, and analytics that actually feel premium.',
};

const fillForm = async (page) => {
  await page.getByLabel('Name').fill(DRAFT.name);
  await page.getByLabel('Website (Ex: mpuza.com)').fill(DRAFT.website);

  await page.getByRole('button', { name: /Industry/ }).click();
  await page.getByRole('button', { name: 'Computer Software', exact: true }).click();

  await page.getByRole('button', { name: /Location/ }).click();
  await page.getByRole('button', { name: 'Rwanda', exact: true }).click();

  await page.getByLabel('Slogan').fill(DRAFT.slogan);

  await page.getByRole('button', { name: /Company type/ }).click();
  await page.getByRole('button', { name: 'no profit', exact: true }).click();

  await page.getByLabel('Description').fill(DRAFT.description);
  await page.waitForTimeout(600);
};

const shot = async (page, name, opts = {}) => {
  await page.screenshot({ path: `${OUT}/${name}.png`, ...opts });
  console.log('  ' + name);
};

const run = async () => {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ channel: 'chromium' });

  for (const [tag, viewport, isMobile] of VIEWPORTS) {
    console.log(`== ${tag}px ==`);
    const ctx = await browser.newContext({
      viewport,
      deviceScaleFactor: 2,
      isMobile,
      hasTouch: isMobile,
    });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(m.text().slice(0, 200));
    });

    // 1 — empty, island at rest
    await page.goto(BASE + '/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    await shot(page, `${tag}-01-create-empty`);

    // 1b — the activity orb: header close-up, then the sheet it opens.
    //      The Island must step aside while the sheet is up.
    await page.locator('header').first().screenshot({ path: `${OUT}/${tag}-01b-header.png` });
    // Above 1024px the orb splits back into three separate ring icons, so
    // there is no single Activity button to press.
    const orb = page.getByRole('button', { name: /^Activity:/ });
    if (await orb.isVisible().catch(() => false)) {
      await orb.click();
      await page.waitForTimeout(700);
      await shot(page, `${tag}-01c-activity-sheet`);
      await page.getByRole('button', { name: 'Close activity' }).click();
      await page.waitForTimeout(500);
    }

    // 2 — bottom sheet, with and without a query
    await page.getByRole('button', { name: /Industry/ }).click();
    await page.waitForTimeout(500);
    await shot(page, `${tag}-02-sheet-industry`);
    await page.getByLabel('Search industry').fill('soft');
    await page.waitForTimeout(350);
    await shot(page, `${tag}-03-sheet-search`);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);

    // 3 — filled; the hero and the island's ring both reflect it
    await fillForm(page);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);
    await shot(page, `${tag}-04-create-filled`);

    // 4 — island expanded into its checklist
    await page.getByRole('button', { name: /Page strength/ }).click();
    await page.waitForTimeout(700);
    await shot(page, `${tag}-05-island-expanded`);
    await page.getByRole('button', { name: /Page strength/ }).click();
    await page.waitForTimeout(500);

    // 5 — Preview. Below 1024px the segmented control expands the hero in
    //     place; at or above it, both panes are already on screen.
    const previewTab = page.getByRole('tab', { name: 'Preview' });
    if (await previewTab.isVisible().catch(() => false)) {
      await previewTab.click();
      await page.waitForTimeout(900);
      await shot(page, `${tag}-06-preview`);
      await page.getByRole('tab', { name: 'Create' }).click();
      await page.waitForTimeout(500);
    } else {
      await shot(page, `${tag}-06-preview`);
    }

    // 6 — submit: the island morphs to working, then to done, then hands off
    await page.getByRole('button', { name: 'Create page' }).click();
    await page.waitForTimeout(600);
    await shot(page, `${tag}-07-island-working`);
    await page.waitForTimeout(1100);
    await shot(page, `${tag}-08-island-done`);

    await page.waitForURL('**/company', { timeout: 8000 });
    await page.waitForTimeout(800);
    await shot(page, `${tag}-09-company-success`);
    await page.waitForTimeout(2400); // let the toast retire
    await shot(page, `${tag}-10-company-page`, { fullPage: true });

    // 7 — style guide
    await page.goto(BASE + '/styleguide', { waitUntil: 'networkidle' });
    await page.waitForTimeout(900);
    // scale:'css' avoids the 2x device-scale multiplication; the style guide
    // is tall enough that 2x exceeds Chromium's max screenshot texture.
    await shot(page, `${tag}-11-styleguide`, { fullPage: true, scale: 'css' });

    if (errors.length) {
      console.log('  !! console/page errors:');
      for (const e of [...new Set(errors)].slice(0, 8)) console.log('     ' + e);
    } else {
      console.log('  no console errors');
    }
    await ctx.close();
  }

  await browser.close();
  console.log('\nwrote ' + OUT);
};

run();
