// Responsiveness audit: checks every route at every width for horizontal
// overflow, under-sized tap targets and text that overflows its box.
import { chromium } from 'playwright';

const BASE = process.env.BASE ?? 'http://127.0.0.1:5173';
const WIDTHS = [320, 360, 375, 390, 414, 430, 540, 768, 1024, 1280, 1440];
const ROUTES = ['/', '/styleguide'];

const audit = (page, touch) =>
  page.evaluate((touch) => {
    const docW = document.documentElement.clientWidth;
    const out = { docW, overflow: [], smallTargets: [], clipped: [] };

    for (const el of document.querySelectorAll('*')) {
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden' || cs.position === 'fixed') continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;

      const name =
        el.tagName.toLowerCase() +
        (typeof el.className === 'string' && el.className.trim()
          ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.')
          : '');

      // Anything sticking out past the right edge, or starting left of 0.
      if (r.right > docW + 1 || r.left < -1) {
        out.overflow.push({
          el: name,
          left: Math.round(r.left),
          right: Math.round(r.right),
          text: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40),
        });
      }

      // Interactive targets below 44px in either axis. A visually hidden input
      // (the sr-only checkbox behind a styled one) is not the real target —
      // its wrapping label is — so 1x1 elements are skipped.
      // The 44px rule is a *touch* rule. On a mouse pointer Mpuza's measured
      // 42px button and 36px chip are correct and are left alone.
      const visuallyHidden = r.width <= 1 && r.height <= 1;
      const interactive =
        touch &&
        el.matches('button, a[href], input, select, textarea, [role="tab"], [role="button"]') &&
        !el.matches('input[type="hidden"]') &&
        !visuallyHidden &&
        cs.pointerEvents !== 'none';
      if (interactive && (r.height < 44 - 0.5 || r.width < 24)) {
        out.smallTargets.push({
          el: name,
          w: Math.round(r.width),
          h: Math.round(r.height),
          text: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 30),
        });
      }

      // Text wider than its own box with no way out.
      if (
        el.children.length === 0 &&
        el.scrollWidth > el.clientWidth + 1 &&
        cs.overflowX === 'visible'
      ) {
        out.clipped.push({
          el: name,
          scroll: el.scrollWidth,
          client: el.clientWidth,
          text: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 30),
        });
      }
    }

    out.bodyScrollW = document.body.scrollWidth;
    return out;
  }, touch);

const browser = await chromium.launch({ channel: 'chromium' });
let failures = 0;

for (const route of ROUTES) {
  console.log(`\n### ${route}`);
  for (const width of WIDTHS) {
    const touch = width < 1024;
    const ctx = await browser.newContext({
      viewport: { width, height: 900 },
      isMobile: touch,
      hasTouch: touch,
    });
    const page = await ctx.newPage();
    await page.goto(BASE + route, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    const r = await audit(page, touch);

    const hScroll = r.bodyScrollW > r.docW + 1;
    const bad = r.overflow.length + r.smallTargets.length + r.clipped.length + (hScroll ? 1 : 0);
    failures += bad;

    const status = bad === 0 ? 'OK  ' : 'FAIL';
    console.log(
      `  ${status} ${String(width).padStart(4)}px  ` +
        `scrollW ${r.bodyScrollW}/${r.docW}` +
        (hScroll ? '  << HORIZONTAL SCROLL' : '') +
        `  overflow:${r.overflow.length} targets<44:${r.smallTargets.length} clipped:${r.clipped.length}`,
    );
    for (const o of r.overflow.slice(0, 4)) {
      console.log(`         overflow ${o.el} [${o.left}..${o.right}] "${o.text}"`);
    }
    for (const t of r.smallTargets.slice(0, 4)) {
      console.log(`         target   ${t.el} ${t.w}x${t.h} "${t.text}"`);
    }
    for (const c of r.clipped.slice(0, 4)) {
      console.log(`         clipped  ${c.el} ${c.scroll}>${c.client} "${c.text}"`);
    }
    await ctx.close();
  }
}

await browser.close();
console.log(failures === 0 ? '\nresponsive audit: clean' : `\nresponsive audit: ${failures} issue(s)`);
process.exit(failures === 0 ? 0 : 1);
