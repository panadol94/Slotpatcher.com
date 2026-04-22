import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const repoRoot = process.cwd();
const indexHtml = fs.readFileSync(path.join(repoRoot, 'index.html'), 'utf8');
const scriptCode = fs.readFileSync(path.join(repoRoot, 'script.js'), 'utf8');
const styleCode = fs.readFileSync(path.join(repoRoot, 'style.css'), 'utf8');

assert.doesNotMatch(
  indexHtml,
  /id="bootOverlay"|id="matrixRain"|class="particle-field"/,
  'expected homepage to stop shipping boot overlay, matrix canvas, and ambient particle shell markup'
);

assert.doesNotMatch(
  indexHtml,
  /gsap@|aos@|lazysizes/,
  'expected homepage to drop non-critical GSAP/AOS/lazysizes assets from initial load'
);

assert.match(
  scriptCode,
  /function initHomepageStatusStrip\(/,
  'expected script.js to keep a lightweight one-shot status-strip initializer'
);

assert.match(
  scriptCode,
  /function initHomepageTelemetry\(/,
  'expected script.js to keep lightweight telemetry initialization without heavy cinematic boot effects'
);

assert.doesNotMatch(
  scriptCode,
  /window\.AOS|window\.gsap|sessionStorage\.getItem\('sp_boot_shown'\)|setInterval\(draw,\s*70\)/,
  'expected script.js to stop initializing AOS/GSAP and the continuous matrix/boot overlay logic on homepage'
);

assert.doesNotMatch(
  styleCode,
  /\.boot-overlay\s*\{|\.matrix-rain\s*\{|@keyframes bootBlink/,
  'expected style.css to remove boot overlay and matrix-rain CSS once those homepage layers are gone'
);

console.log('Homepage lite-effects regression checks passed.');
