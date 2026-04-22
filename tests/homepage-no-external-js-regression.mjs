import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const repoRoot = process.cwd();
const indexHtml = fs.readFileSync(path.join(repoRoot, 'index.html'), 'utf8');
const scriptCode = fs.readFileSync(path.join(repoRoot, 'script.js'), 'utf8');

assert.doesNotMatch(
  indexHtml,
  /<script[^>]+src="https?:\/\//i,
  'expected homepage HTML to stop shipping external JavaScript tags up front'
);

assert.doesNotMatch(
  indexHtml,
  /swiper-bundle\.min\.css/,
  'expected homepage HTML to stop shipping external Swiper CSS once native carousel fallback is the primary path'
);

assert.match(
  scriptCode,
  /function ensureChartLibraryLoaded\(/,
  'expected script.js to add a lazy chart loader instead of relying on an upfront Chart.js script tag'
);

assert.match(
  scriptCode,
  /createElement\('script'\)[\s\S]*chart\.js/,
  'expected lazy chart loader to inject Chart.js only when results need the RTP chart'
);

assert.doesNotMatch(
  scriptCode,
  /window\.Swiper|new window\.Swiper/,
  'expected hero carousel to stop depending on Swiper runtime when native fallback becomes the main path'
);

assert.match(
  scriptCode,
  /if \(!window\.Chart\) \{[\s\S]*ensureChartLibraryLoaded\(\)/,
  'expected renderRtpChart to request the chart library on demand when it is first needed'
);

console.log('Homepage no-external-js regression checks passed.');
