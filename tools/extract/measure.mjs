// Measures real computed styles from mpuza.com. Output: docs/_measured/*
// Everything this writes is OBSERVED. Nothing here estimates.
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const OUT = resolve(import.meta.dirname, '../../docs/_measured');
const ORIGIN = 'https://mpuza.com';
const PAGES = [
  ['home', '/'],
  ['login', '/login'],
  ['signin', '/signin'],
  ['create-company-page', '/m/create-company-page'],
];

const census = (page) => page.evaluate(() => {
  const tally = (map, key, el) => {
    if (key == null || key === '') return;
    const k = String(key);
    if (!map[k]) map[k] = { count: 0, examples: [] };
    map[k].count++;
    if (map[k].examples.length < 4) {
      const sel = el.tagName.toLowerCase()
        + (el.id ? '#' + el.id : '')
        + (el.className && typeof el.className === 'string'
          ? '.' + el.className.trim().split(/\s+/).slice(0, 3).join('.') : '');
      const txt = (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40);
      map[k].examples.push(txt ? sel + ' "' + txt + '"' : sel);
    }
  };
  const out = {
    fontFamily: {}, fontSizeWeight: {}, color: {}, backgroundColor: {},
    borderColor: {}, borderRadius: {}, boxShadow: {}, transition: {}, letterSpacing: {},
  };
  for (const el of document.querySelectorAll('*')) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const r = el.getBoundingClientRect();
    const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    tally(out.fontFamily, cs.fontFamily, el);
    if (hasText) {
      tally(out.fontSizeWeight, cs.fontSize + ' / ' + cs.fontWeight + ' / ' + cs.lineHeight, el);
      tally(out.color, cs.color, el);
      tally(out.letterSpacing, cs.letterSpacing, el);
    }
    if (cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && r.width > 4 && r.height > 4) {
      tally(out.backgroundColor, cs.backgroundColor, el);
    }
    if (cs.borderTopWidth !== '0px' || cs.borderBottomWidth !== '0px') {
      tally(out.borderColor, cs.borderTopWidth + ' ' + cs.borderTopStyle + ' ' + cs.borderTopColor, el);
    }
    if (cs.borderRadius !== '0px') tally(out.borderRadius, cs.borderRadius, el);
    if (cs.boxShadow !== 'none') tally(out.boxShadow, cs.boxShadow, el);
    if (cs.transitionDuration !== '0s') {
      tally(out.transition, cs.transitionProperty + ' ' + cs.transitionDuration + ' ' + cs.transitionTimingFunction, el);
    }
  }
  for (const k of Object.keys(out)) {
    out[k] = Object.fromEntries(
      Object.entries(out[k]).sort((a, b) => b[1].count - a[1].count).slice(0, 40)
    );
  }
  return out;
});

const customProps = (page) => page.evaluate(() => {
  const names = new Set();
  for (const sheet of document.styleSheets) {
    let rules;
    try { rules = sheet.cssRules; } catch { continue; }
    const walk = (list) => {
      for (const rule of list) {
        if (rule.style) for (const p of rule.style) if (p.startsWith('--')) names.add(p);
        if (rule.cssRules) walk(rule.cssRules);
      }
    };
    walk(rules);
  }
  const rootCs = getComputedStyle(document.documentElement);
  const bodyCs = getComputedStyle(document.body);
  const found = {};
  for (const n of [...names].sort()) {
    const v = rootCs.getPropertyValue(n).trim() || bodyCs.getPropertyValue(n).trim();
    if (v) found[n] = v;
  }
  return found;
});

const PROBE_KEYS = ['fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'lineHeight', 'letterSpacing',
  'color', 'backgroundColor', 'backgroundImage', 'borderTopWidth', 'borderTopStyle', 'borderTopColor',
  'borderRadius', 'boxShadow', 'padding', 'textTransform', 'outlineColor', 'outlineWidth', 'outlineStyle'];

const probes = (page) => page.evaluate((keys) => {
  const want = {
    html: 'html', body: 'body',
    h1: 'h1', h2: 'h2', h3: 'h3', h4: 'h4', h5: 'h5', h6: 'h6',
    p: 'p', label: 'label', small: 'small', strong: 'strong', em: 'em', i: 'i',
    'input[text]': 'input[type="text"], input:not([type]), input[type="email"]',
    'input[password]': 'input[type="password"]',
    'input[checkbox]': 'input[type="checkbox"]',
    select: 'select', textarea: 'textarea',
    button: 'button',
    'button[submit]': 'button[type="submit"], input[type="submit"]',
    a: 'a', nav: 'nav', header: 'header', footer: 'footer',
    'img[logo]': 'img[alt*="logo" i], img[src*="logo" i], header img',
    svg: 'svg',
  };
  const out = {};
  for (const [name, sel] of Object.entries(want)) {
    const els = [...document.querySelectorAll(sel)];
    const el = els.find((e) => {
      const cs = getComputedStyle(e);
      if (cs.display === 'none' || cs.visibility === 'hidden') return false;
      return e.getBoundingClientRect().width > 0 || e.tagName === 'INPUT';
    });
    if (!el) { out[name] = null; continue; }
    const cs = getComputedStyle(el);
    const o = {
      _count: els.length,
      _text: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 60),
      _class: typeof el.className === 'string' ? el.className : '',
    };
    for (const k of keys) o[k] = cs[k];
    out[name] = o;
  }
  return out;
}, PROBE_KEYS);

const focusRing = (page) => page.evaluate(async () => {
  const el = document.querySelector('input[type="text"], input:not([type]), input[type="email"], input[type="password"]')
    || document.querySelector('button');
  if (!el) return null;
  const read = () => {
    const cs = getComputedStyle(el);
    return {
      tag: el.tagName.toLowerCase(),
      outline: cs.outlineWidth + ' ' + cs.outlineStyle + ' ' + cs.outlineColor,
      outlineOffset: cs.outlineOffset,
      boxShadow: cs.boxShadow,
      borderColor: cs.borderTopColor,
      borderWidth: cs.borderTopWidth,
    };
  };
  const blurred = read();
  el.focus();
  await new Promise((r) => setTimeout(r, 250));
  const focused = read();
  el.blur();
  return { blurred, focused };
});

const assets = (page) => page.evaluate(() => ({
  title: document.title,
  metaThemeColor: document.querySelector('meta[name="theme-color"]')?.content ?? null,
  favicons: [...document.querySelectorAll('link[rel*="icon"], link[rel="apple-touch-icon"], link[rel="manifest"]')]
    .map((l) => ({ rel: l.rel, href: l.href, type: l.type, sizes: l.sizes?.value })),
  stylesheets: [...document.querySelectorAll('link[rel="stylesheet"]')].map((l) => l.href),
  inlineSvgCount: document.querySelectorAll('svg').length,
  firstInlineSvg: document.querySelector('svg')?.outerHTML?.slice(0, 2000) ?? null,
  images: [...document.querySelectorAll('img')].slice(0, 25)
    .map((i) => ({ src: i.src, alt: i.alt, w: i.naturalWidth, h: i.naturalHeight })),
}));

const run = async () => {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ channel: 'chromium' });
  const result = { measuredAt: new Date().toISOString(), origin: ORIGIN, pages: {} };

  for (const [name, path] of PAGES) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    const net = [];
    page.on('response', (r) => {
      const u = r.url();
      const t = r.request().resourceType();
      if (['font', 'stylesheet', 'document'].includes(t) || /\.(woff2?|ttf|otf|css|svg|ico|png)(\?|$)/i.test(u)) {
        net.push({ type: t, status: r.status(), url: u, ct: r.headers()['content-type'] });
      }
    });
    const consoleErr = [];
    page.on('console', (m) => { if (m.type() === 'error') consoleErr.push(m.text().slice(0, 200)); });

    const rec = { path, url: ORIGIN + path };
    try {
      const resp = await page.goto(ORIGIN + path, { waitUntil: 'networkidle', timeout: 60000 });
      rec.status = resp?.status() ?? null;
      rec.finalUrl = page.url();
      await page.waitForTimeout(2500);
      rec.customProps = await customProps(page);
      rec.probes = await probes(page);
      rec.census = await census(page);
      rec.focusRing = await focusRing(page);
      rec.assets = await assets(page);
      rec.loadedFonts = await page.evaluate(() => [...document.fonts]
        .map((f) => ({ family: f.family, weight: f.weight, style: f.style, status: f.status })));
      rec.textSample = (await page.evaluate(() => document.body.innerText))
        .replace(/\n{3,}/g, '\n\n').slice(0, 2500);
      await page.screenshot({ path: OUT + '/' + name + '-1440.png', fullPage: true });
      await page.setViewportSize({ width: 375, height: 812 });
      await page.waitForTimeout(800);
      rec.mobileProbes = await probes(page);
      await page.screenshot({ path: OUT + '/' + name + '-375.png', fullPage: true });
    } catch (e) {
      rec.error = String(e).slice(0, 400);
    }
    rec.network = net;
    rec.consoleErrors = consoleErr.slice(0, 10);
    result.pages[name] = rec;
    await ctx.close();
    console.log('[done] ' + name + ' -> ' + (rec.status ?? rec.error));
  }

  await browser.close();
  await writeFile(OUT + '/measured.json', JSON.stringify(result, null, 2));
  console.log('wrote ' + OUT + '/measured.json');
};
run();
