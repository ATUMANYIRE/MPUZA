import { readToken } from './contrast';
/**
 * Pulls the dominant colour out of an uploaded logo so the page can be tinted
 * with the company's own brand colour rather than Mpuza's.
 *
 * Runs entirely in the browser on a canvas — the file is never uploaded
 * anywhere. Returns null when the logo has no usable colour (a flat black or
 * white mark, or a decode failure).
 */

export interface LogoColor {
  hex: string;
  /** A readable text colour to pair with it. */
  onHex: string;
}

const relativeLuminance = (r: number, g: number, b: number): number => {
  const [lr, lg, lb] = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
};

const toHex = (r: number, g: number, b: number) =>
  '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');

export const extractLogoColor = async (src: string): Promise<LogoColor | null> => {
  try {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;
    await img.decode();

    const size = 64; // downscale: we want the dominant hue, not detail
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, size, size);
    const { data } = ctx.getImageData(0, 0, size, size);

    // Bucket by coarse hue/level, weighting saturated mid-tones. A logo's
    // identity lives in its saturated pixels, not its white background.
    const buckets = new Map<string, { r: number; g: number; b: number; n: number; w: number }>();

    for (let i = 0; i < data.length; i += 4) {
      const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
      if (a < 160) continue;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const sat = max === 0 ? 0 : (max - min) / max;
      const lum = relativeLuminance(r, g, b);

      // Skip near-white, near-black and near-grey.
      if (sat < 0.18) continue;
      if (lum > 0.92 || lum < 0.03) continue;

      const key = [Math.round(r / 24), Math.round(g / 24), Math.round(b / 24)].join(',');
      const weight = sat * (1 - Math.abs(lum - 0.45));
      const cur = buckets.get(key) ?? { r: 0, g: 0, b: 0, n: 0, w: 0 };
      cur.r += r;
      cur.g += g;
      cur.b += b;
      cur.n += 1;
      cur.w += weight;
      buckets.set(key, cur);
    }

    if (buckets.size === 0) return null;

    const best = [...buckets.values()].sort((a, b) => b.w - a.w)[0];
    const r = best.r / best.n;
    const g = best.g / best.n;
    const b = best.b / best.n;

    // The paired text colour is read back out of tokens.css rather than
    // written here, so it follows the design system if those tokens change.
    const dark = readToken('--color-text');
    const light = readToken('--color-text-on-primary');

    return {
      hex: toHex(r, g, b),
      onHex: relativeLuminance(r, g, b) > 0.45 ? dark : light,
    };
  } catch {
    return null;
  }
};
