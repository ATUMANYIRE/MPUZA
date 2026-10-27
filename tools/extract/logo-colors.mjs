// Samples the dominant colors out of mpuza.com/logo.png via a canvas in Chromium.
import { chromium } from 'playwright';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const OUT = resolve(import.meta.dirname, '../../docs/_measured');
const browser = await chromium.launch({ channel: 'chromium' });
const page = await browser.newPage();
await page.goto('https://mpuza.com/', { waitUntil: 'domcontentloaded' });

const result = await page.evaluate(async () => {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = '/logo.png';
  await img.decode();
  const c = document.createElement('canvas');
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const { data } = ctx.getImageData(0, 0, c.width, c.height);
  const hex = (r, g, b) => '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
  const tally = new Map();
  let transparent = 0;
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a < 200) { transparent++; continue; }
    const k = hex(data[i], data[i + 1], data[i + 2]);
    tally.set(k, (tally.get(k) || 0) + 1);
  }
  const total = data.length / 4;
  return {
    size: [c.width, c.height],
    transparentPct: +(100 * transparent / total).toFixed(1),
    top: [...tally.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12)
      .map(([k, v]) => ({ hex: k, pct: +(100 * v / total).toFixed(2) })),
  };
});

await browser.close();
await writeFile(OUT + '/logo-colors.json', JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
