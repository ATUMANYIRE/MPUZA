// Samples exact colors out of reference/screenshots/*.png.
// "solid" = mean of the patch. "ink" = mean of the darkest 3% of the patch (text strokes).
// "accent" = mean of the most saturated 3% (coloured text on light ground).
import { chromium } from 'playwright';
import { writeFile, readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '../..');
const SHOTS = resolve(ROOT, 'reference/screenshots');
const OUT = resolve(ROOT, 'docs/_measured');

// [file, label, mode, x, y, w, h]
const SAMPLES = [
  ['create-empty.png', 'app canvas (right of preview)', 'solid', 700, 600, 120, 60],
  ['create-empty.png', 'app canvas (below form)', 'solid', 620, 690, 40, 20],
  ['create-empty.png', 'header bar', 'solid', 700, 8, 120, 10],
  ['create-empty.png', 'form panel surface', 'solid', 260, 480, 60, 16],
  ['create-empty.png', '"Any feedback?" fill', 'solid', 1110, 28, 30, 12],
  ['create-empty.png', 'section heading "Company logo"', 'accent', 60, 168, 120, 22],
  ['create-empty.png', 'section heading "Profile Details"', 'accent', 60, 504, 120, 22],
  ['create-empty.png', 'h1 "Create company page"', 'ink', 60, 98, 230, 22],
  ['create-empty.png', 'h1 subtitle', 'ink', 60, 130, 300, 14],
  ['create-empty.png', 'field label "Name"', 'ink', 62, 394, 40, 14],
  ['create-empty.png', 'upload zone fill', 'solid', 280, 240, 120, 20],
  ['create-empty.png', 'upload "Drag & drop" bold', 'ink', 157, 282, 150, 14],
  ['create-empty.png', 'upload helper text', 'ink', 157, 301, 240, 12],
  ['create-empty.png', 'upload icon (blue)', 'accent', 163, 244, 24, 26],
  ['create-empty.png', 'avatar placeholder fill', 'solid', 92, 265, 26, 26],
  ['create-empty.png', 'input placeholder text', 'ink', 76, 431, 110, 14],
  ['create-empty.png', 'preview bar fill', 'solid', 700, 100, 120, 20],
  ['create-empty.png', 'preview bar title ink', 'ink', 623, 95, 92, 16],
  ['create-empty.png', 'preview "Your company name"', 'ink', 701, 354, 190, 18],
  ['create-empty.png', 'preview "Industry · Location"', 'ink', 701, 383, 110, 14],

  ['create-filled.png', 'slogan (blue italic)', 'accent', 701, 479, 200, 16],
  ['create-filled.png', 'description body', 'ink', 701, 412, 390, 14],
  ['create-filled.png', 'company title INTERNORY', 'ink', 701, 351, 120, 20],
  ['create-filled.png', 'meta "Computer Software · Rwanda"', 'ink', 701, 381, 150, 14],
  ['create-filled.png', '"Visit website" fill', 'solid', 1130, 360, 30, 16],
  ['create-filled.png', 'filled input text', 'ink', 76, 429, 100, 14],

  ['create-submit.png', '"Create page" fill', 'solid', 75, 705, 100, 18],
  ['create-submit.png', 'focused textarea border', 'accent', 62, 580, 3, 60],
  ['create-submit.png', 'textarea body text', 'ink', 78, 560, 400, 14],

  ['company-page.png', 'verification banner fill', 'solid', 300, 92, 200, 24],
  ['company-page.png', 'banner button fill', 'solid', 640, 96, 40, 14],
  ['company-page.png', 'banner button label', 'accent', 619, 97, 124, 14],
  ['company-page.png', 'accordion header fill', 'solid', 1050, 95, 120, 18],
  ['company-page.png', 'tab selected "Jobs"', 'accent', 158, 434, 32, 16],
  ['company-page.png', 'tab unselected "Projects"', 'accent', 218, 434, 56, 16],
  ['company-page.png', 'tab underline', 'accent', 158, 460, 32, 4],
  ['company-page.png', '"Post a job" label', 'accent', 812, 644, 70, 16],
  ['company-page.png', '"Save" fill', 'solid', 940, 588, 60, 18],
  ['company-page.png', 'overview field label', 'ink', 927, 154, 76, 14],
  ['company-page.png', 'page canvas left margin', 'solid', 12, 400, 20, 80],
  ['company-page.png', 'cover title INTERNORY (white)', 'solid', 196, 347, 100, 14],
  ['company-page.png', 'body text on company page', 'ink', 78, 522, 400, 14],

  // --- second pass: fills re-sampled on patches with no text in them ---
  ['create-empty.png', 'FILL "Any feedback?"', 'solid', 1181, 26, 10, 16],
  ['create-empty.png', 'FILL avatar placeholder', 'solid', 98, 250, 14, 8],
  ['create-empty.png', 'BORDER input top edge', 'solid', 150, 418, 60, 1],
  ['create-empty.png', 'BORDER upload dashed', 'solid', 62, 230, 1, 1],
  ['create-empty.png', 'FILL preview bar (clean)', 'solid', 1100, 100, 100, 20],
  ['create-filled.png', 'FILL "Visit website"', 'solid', 1228, 358, 14, 20],
  ['create-submit.png', 'FILL "Create page"', 'solid', 68, 702, 20, 24],
  ['company-page.png', 'FILL verification banner', 'solid', 52, 90, 20, 24],
  ['company-page.png', 'FILL banner button (white)', 'solid', 592, 96, 18, 16],
  ['company-page.png', 'FILL accordion header', 'solid', 1160, 92, 80, 20],
  ['company-page.png', 'FILL "Save"', 'solid', 933, 588, 16, 20],
  ['company-page.png', 'FILL "Post a job" surface', 'solid', 812, 630, 20, 8],
  ['company-page.png', 'BORDER tab rail divider', 'solid', 400, 461, 60, 1],
  ['company-loading.png', 'FILL loading card', 'solid', 610, 300, 40, 20],
  ['company-loading.png', 'DIMMED canvas under overlay', 'solid', 12, 400, 20, 80],
  ['company-loading.png', 'DIMMED card surface under overlay', 'solid', 300, 560, 40, 16],
  ['company-loading.png', 'spinner dot', 'accent', 634, 318, 30, 30],
  ['create-messaging.png', 'FILL messaging panel header', 'solid', 1080, 180, 60, 20],
  ['create-messaging.png', 'FILL messaging search field', 'solid', 1100, 242, 80, 14],
];

const browser = await chromium.launch({ channel: 'chromium' });
const page = await browser.newPage();
// Serve the screenshots same-origin so the canvas is not tainted.
await page.route('https://shots.local/**', async (route) => {
  const path = new URL(route.request().url()).pathname;
  if (path === '/index.html') {
    await route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>s</title>' });
    return;
  }
  const name = path.replace(/^\/shot\//, '');
  try {
    const body = await readFile(resolve(SHOTS, name));
    await route.fulfill({ status: 200, contentType: 'image/png', body });
  } catch {
    await route.fulfill({ status: 404, body: '' });
  }
});
await page.goto('https://shots.local/index.html');

const files = await readdir(SHOTS);
const results = [];
const dims = {};

for (const [file, label, mode, x, y, w, h] of SAMPLES) {
  if (!files.includes(file)) { results.push({ file, label, error: 'missing file' }); continue; }
  const out = await page.evaluate(async ([file, mode, x, y, w, h]) => {
    const img = new Image();
    img.src = 'shot/' + file;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.naturalWidth; c.height = img.naturalHeight;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);
    if (x + w > c.width || y + h > c.height) {
      return { dim: [c.width, c.height], error: 'patch out of bounds' };
    }
    const { data } = ctx.getImageData(x, y, w, h);
    const px = [];
    for (let i = 0; i < data.length; i += 4) {
      const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
      const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
      px.push({ r, g, b, lum, sat: mx === 0 ? 0 : (mx - mn) / mx });
    }
    const pick = (arr) => {
      const n = Math.max(1, Math.round(arr.length * 0.03));
      const s = arr.slice(0, n);
      const avg = (k) => Math.round(s.reduce((t, p) => t + p[k], 0) / s.length);
      return '#' + [avg('r'), avg('g'), avg('b')].map((v) => v.toString(16).padStart(2, '0')).join('');
    };
    const meanAll = () => {
      const avg = (k) => Math.round(px.reduce((t, p) => t + p[k], 0) / px.length);
      return '#' + [avg('r'), avg('g'), avg('b')].map((v) => v.toString(16).padStart(2, '0')).join('');
    };
    let hex;
    if (mode === 'solid') hex = meanAll();
    else if (mode === 'ink') hex = pick([...px].sort((a, b) => a.lum - b.lum));
    else hex = pick([...px].sort((a, b) => b.sat - a.sat));
    // spread tells us whether the patch was uniform (trustworthy for "solid")
    const lums = px.map((p) => p.lum);
    return { dim: [c.width, c.height], hex, spread: +(Math.max(...lums) - Math.min(...lums)).toFixed(0) };
  }, [file, mode, x, y, w, h]);
  dims[file] = out.dim;
  results.push({ file, label, mode, patch: [x, y, w, h], ...out });
}

await browser.close();
await writeFile(OUT + '/screenshot-colors.json', JSON.stringify({ dims, results }, null, 2));
console.log('dims: ' + JSON.stringify(dims));
let last = '';
for (const r of results) {
  if (r.file !== last) { console.log('\n== ' + r.file + ' =='); last = r.file; }
  console.log('  ' + (r.hex || r.error).padEnd(10) + (r.mode || '').padEnd(8)
    + 'spread=' + String(r.spread ?? '-').padEnd(5) + r.label);
}
