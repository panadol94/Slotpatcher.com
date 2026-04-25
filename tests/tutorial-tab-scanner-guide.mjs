import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const repoRoot = process.cwd();
const indexHtml = fs.readFileSync(path.join(repoRoot, 'index.html'), 'utf8');
const styleCss = fs.readFileSync(path.join(repoRoot, 'style.css'), 'utf8');

assert.match(
  indexHtml,
  /<a href="#tutorialSection" class="nav-item" aria-label="Tutorial cara guna scanner">[\s\S]*?<span>Tutorial<\/span>[\s\S]*?<\/a>/,
  'bottom nav Tutorial tab should route to a dedicated scanner tutorial section, not the results board'
);

assert.match(
  indexHtml,
  /<section id="tutorialSection" class="tutorial-section"[\s\S]*?<h2 class="section-title"[^>]*>[\s\S]*?CARA GUNA SCANNER[\s\S]*?<\/h2>/,
  'expected a dedicated CARA GUNA SCANNER tutorial section'
);

assert.match(
  indexHtml,
  /<img\s+class="tutorial-visual-img"\s+src="assets\/tutorial-scanner-guide\.svg"\s+alt="Preview Slotpatcher scanner live result"/,
  'tutorial should include an attractive scanner guide image'
);

assert.ok(
  fs.existsSync(path.join(repoRoot, 'assets', 'tutorial-scanner-guide.svg')),
  'tutorial scanner guide SVG asset should exist'
);

[
  'Pilih provider casino',
  'Tekan butang SCAN',
  'Tunggu live scan siap',
  'Baca Live Result Board'
].forEach((step) => {
  assert.match(indexHtml, new RegExp(step), `tutorial should include step: ${step}`);
});

assert.match(
  indexHtml,
  /<a href="#providerSection" class="tutorial-primary-cta">Pilih Provider<\/a>/,
  'tutorial should include a provider CTA that opens the provider picker flow'
);

assert.match(
  indexHtml,
  /<a href="#resultsSection" class="tutorial-secondary-cta">Lihat Result<\/a>/,
  'tutorial should include a results CTA for users after scanning'
);

assert.match(
  styleCss,
  /\.tutorial-section\b[\s\S]*?\.tutorial-card\b[\s\S]*?\.tutorial-primary-cta\b/,
  'expected premium tutorial section/card/CTA styles'
);

console.log('Tutorial tab scanner guide checks passed.');
