#!/usr/bin/env node
/**
 * Fails if a raw colour value appears anywhere in src/ outside src/design/.
 * Catches: #hex, rgb()/rgba(), hsl()/hsla(), and Tailwind arbitrary colour
 * values such as bg-[#35a8df] or text-[rgb(...)].
 *
 * Run: npm run lint:tokens
 */
import { readdir, readFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const SRC = join(ROOT, 'src');
const ALLOWED_DIR = join(SRC, 'design');

const RULES = [
  { name: 'hex colour', re: /#[0-9a-fA-F]{3,8}\b/g },
  { name: 'rgb()/rgba()', re: /\brgba?\s*\(/g },
  { name: 'hsl()/hsla()', re: /\bhsla?\s*\(/g },
  // Only flag an arbitrary value whose contents actually look like a colour.
  // `border-[3px]` is a width and is fine; `border-[#35a8df]` is not.
  {
    name: 'arbitrary Tailwind colour',
    re: /\b(?:bg|text|border|ring|from|via|to|fill|stroke|shadow|outline|decoration|divide|accent|caret|placeholder)-\[(?:#|rgba?\(|hsla?\(|(?:red|blue|green|black|white|gray|grey|slate|zinc|amber|cyan)\b)[^\]]*\]/g,
  },
];

const walk = async (dir) => {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else if (/\.(tsx?|jsx?|css)$/.test(entry.name)) out.push(full);
  }
  return out;
};

const files = (await walk(SRC)).filter((f) => !f.startsWith(ALLOWED_DIR + sep));
const violations = [];

for (const file of files) {
  const text = await readFile(file, 'utf8');
  const lines = text.split('\n');
  lines.forEach((line, i) => {
    // A line that is purely a comment is allowed to name a colour, so docs can
    // explain which measured value a token stands for.
    const stripped = line.trim();
    if (
      stripped.startsWith('//') ||
      stripped.startsWith('*') ||
      stripped.startsWith('/*') ||
      stripped.startsWith('{/*') // JSX comment
    ) {
      return;
    }
    for (const { name, re } of RULES) {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(line)) !== null) {

        violations.push({
          file: relative(ROOT, file),
          line: i + 1,
          col: m.index + 1,
          rule: name,
          text: m[0],
          source: line.trim().slice(0, 100),
        });
      }
    }
  });
}

if (violations.length === 0) {
  console.log(`lint:tokens — clean. ${files.length} files checked outside src/design/.`);
  process.exit(0);
}

console.error(`lint:tokens — ${violations.length} raw colour value(s) outside src/design/:\n`);
for (const v of violations) {
  console.error(`  ${v.file}:${v.line}:${v.col}  ${v.rule} "${v.text}"`);
  console.error(`    ${v.source}`);
}
console.error('\nUse a semantic token from src/design/tokens.css instead.');
process.exit(1);
