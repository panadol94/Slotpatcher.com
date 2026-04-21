import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = process.cwd();
const trustedHtml = fs.readFileSync(path.join(root, 'trusted/index.html'), 'utf8');

assert.doesNotMatch(
  trustedHtml,
  /trusted-company-facts-minimal/,
  'Trusted company cards should not render the duplicated footer facts block on mobile'
);

assert.doesNotMatch(
  trustedHtml,
  /class="nav-item center-hack-btn"/,
  'Trusted page bottom nav should not use the floating center-hack-btn that overlaps CTAs'
);

assert.doesNotMatch(
  trustedHtml,
  /trusted-company-chip-row/,
  'Trusted company cards should not render an extra chip row that overloads the card header'
);

assert.doesNotMatch(
  trustedHtml,
  /TRUSTED COMPANIES|Trusted Companies/,
  'Trusted page wording should be updated from Trusted Companies to Trusted Casino'
);

console.log('trusted mobile density regression checks passed');
