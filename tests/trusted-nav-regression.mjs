import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = process.cwd();
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const exists = (rel) => fs.existsSync(path.join(root, rel));

assert.ok(exists('trusted/index.html'), 'trusted/index.html should exist so /trusted route can build');

const indexHtml = read('index.html');
assert.match(
  indexHtml,
  /<a\s+href="\/trusted\/?"\s+class="nav-item(?:\s+active)?"[^>]*aria-label="Trusted/i,
  'Bottom nav Trusted button should point to /trusted/'
);

const scriptJs = read('script.js');
assert.match(
  scriptJs,
  /href\.charAt\(0\)\s*(?:===|!==)\s*['"]#['"]|href\.startsWith\(['"]#['"]\)/,
  'Bottom nav JS should explicitly distinguish hash links from real routes'
);

const trustedHtml = read('trusted/index.html');
assert.match(
  trustedHtml,
  /renderTrustedCompanies\s*\(/,
  'trusted/index.html should contain the full trusted company list renderer'
);
assert.match(
  trustedHtml,
  /https:\/\/api\.tipsmega888\.com\/api\/companies/,
  'trusted/index.html should keep the TipsMega888 companies API integration'
);

const viteConfig = read('vite.config.js');
assert.match(
  viteConfig,
  /trusted\/index\.html/,
  'Vite config should include trusted/index.html as a build input'
);

console.log('trusted nav regression checks passed');
