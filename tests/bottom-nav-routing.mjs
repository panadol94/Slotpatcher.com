import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const repoRoot = process.cwd();
const indexHtml = fs.readFileSync(path.join(repoRoot, 'index.html'), 'utf8');
const script = fs.readFileSync(path.join(repoRoot, 'script.js'), 'utf8');

assert.match(
  indexHtml,
  /<a href="\/trusted\/?" class="nav-item"/,
  'expected home page bottom nav to include a real /trusted route link'
);

assert.match(
  script,
  /href\.charAt\(0\)\s*!==\s*'#'\)\s*return;/,
  'expected initBottomNav to let non-hash links like /trusted navigate normally'
);

assert.doesNotMatch(
  script,
  /if \(href && href !== '#'/,
  'expected initBottomNav to stop hijacking every non-empty href as an in-page selector'
);

console.log('Bottom nav routing checks passed.');
