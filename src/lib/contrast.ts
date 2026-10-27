/**
 * Reads a token's resolved value out of the live cascade and computes WCAG 2.1
 * contrast. Used by the style guide so the ratios shown can never drift from
 * what tokens.css actually declares.
 */

export const readToken = (name: string): string => {
  if (typeof window === 'undefined') return '';
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  if (!raw) return '';
  // A token may point at another token; resolve through a probe element.
  if (raw.startsWith('var(')) {
    const probe = document.createElement('span');
    probe.style.color = `var(${name})`;
    probe.style.display = 'none';
    document.body.appendChild(probe);
    const resolved = getComputedStyle(probe).color;
    probe.remove();
    return rgbToHex(resolved) ?? resolved;
  }
  return raw;
};

const rgbToHex = (value: string): string | null => {
  const m = value.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const [r, g, b] = m[1].split(',').map((p) => Number.parseFloat(p.trim()));
  if ([r, g, b].some(Number.isNaN)) return null;
  return '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
};

const parse = (value: string): [number, number, number] | null => {
  const v = value.trim();
  if (v.startsWith('#')) {
    let h = v.slice(1);
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    if (h.length !== 6) return null;
    const n = Number.parseInt(h, 16);
    if (Number.isNaN(n)) return null;
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const m = v.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const [r, g, b] = m[1].split(',').map((p) => Number.parseFloat(p.trim()));
  return [r, g, b].some(Number.isNaN) ? null : [r, g, b];
};

const luminance = (rgb: [number, number, number]): number => {
  const [r, g, b] = rgb.map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export const contrast = (a: string, b: string): number | null => {
  const ca = parse(a);
  const cb = parse(b);
  if (!ca || !cb) return null;
  const la = luminance(ca);
  const lb = luminance(cb);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
};
