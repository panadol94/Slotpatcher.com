import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const repoRoot = process.cwd();
const indexHtml = fs.readFileSync(path.join(repoRoot, 'index.html'), 'utf8');
const tutorialHtmlPath = path.join(repoRoot, 'tutorial', 'index.html');
const styleCss = fs.readFileSync(path.join(repoRoot, 'style.css'), 'utf8');
const viteConfig = fs.readFileSync(path.join(repoRoot, 'vite.config.js'), 'utf8');

assert.ok(
  fs.existsSync(tutorialHtmlPath),
  'expected Tutorial to live on a dedicated /tutorial/ page'
);

const tutorialHtml = fs.existsSync(tutorialHtmlPath)
  ? fs.readFileSync(tutorialHtmlPath, 'utf8')
  : '';

assert.match(
  indexHtml,
  /<a href="\/tutorial\/" class="nav-item" aria-label="Tutorial cara guna scanner">[\s\S]*?<span>Tutorial<\/span>[\s\S]*?<\/a>/,
  'home bottom nav Tutorial tab should route to /tutorial/'
);

assert.doesNotMatch(
  indexHtml,
  /<section id="tutorialSection" class="tutorial-section"/,
  'home page should not render the tutorial section under the scanner'
);

assert.match(
  tutorialHtml,
  /<main[^>]*class="tutorial-page"[\s\S]*?<section id="tutorialSection" class="tutorial-section[^\"]*"[\s\S]*?<h1[^>]*>\s*CARA GUNA SCANNER\s*<\/h1>/,
  'tutorial page should contain the CARA GUNA SCANNER section as its main content'
);

assert.match(
  tutorialHtml,
  /<img\s+class="tutorial-visual-img"\s+src="\.\.\/assets\/tutorial-scanner-guide\.svg"\s+alt="Preview Slotpatcher scanner live result"/,
  'tutorial page should include the attractive scanner guide image'
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
  assert.match(tutorialHtml, new RegExp(step), `tutorial page should include step: ${step}`);
});

assert.match(
  tutorialHtml,
  /<a href="\.\.\/#providerSection" class="tutorial-primary-cta">Pilih Provider<\/a>/,
  'tutorial page should link provider CTA back to the scanner provider flow'
);

assert.match(
  tutorialHtml,
  /<a href="\.\.\/#resultsSection" class="tutorial-secondary-cta">Lihat Result<\/a>/,
  'tutorial page should link results CTA back to the scanner result flow'
);

assert.match(
  styleCss,
  /\.tutorial-page\b[\s\S]*?\.tutorial-section\b[\s\S]*?\.tutorial-card\b[\s\S]*?\.tutorial-primary-cta\b/,
  'expected premium tutorial page/section/card/CTA styles'
);

assert.match(
  viteConfig,
  /tutorial:\s*resolve\(process\.cwd\(\),\s*'tutorial\/index\.html'\)/,
  'Vite build should include the dedicated tutorial page'
);

console.log('Dedicated tutorial page checks passed.');
