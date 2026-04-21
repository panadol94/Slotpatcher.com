import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const repoRoot = process.cwd();
const trustedHtml = fs.readFileSync(path.join(repoRoot, 'trusted', 'index.html'), 'utf8');

const navMatch = trustedHtml.match(/<nav class="bottom-nav trusted-bottom-nav"[\s\S]*?<\/nav>/);
assert.ok(navMatch, 'expected trusted page to include a dedicated bottom nav shell');

const navHtml = navMatch[0];
const navItemCount = (navHtml.match(/class="nav-item\b/g) || []).length;

assert.equal(
  navItemCount,
  5,
  'expected trusted page to keep the same 5-slot bottom-nav structure as the home page'
);

assert.doesNotMatch(
  navHtml,
  /center-hack-btn/,
  'expected trusted page bottom nav to avoid the floating center scan button that overlaps listing CTAs'
);

assert.match(
  navHtml,
  /href="\/#providerSection"[^>]*aria-label="Scan utama"|aria-label="Scan utama"[^>]*href="\/#providerSection"/,
  'expected the trusted-page scan button to route back to the home provider/scan entry point'
);

assert.doesNotMatch(
  navHtml,
  /id="scanButtonLabel">SCAN</,
  'expected trusted page bottom nav to remove the old floating SCAN medallion label'
);

assert.doesNotMatch(
  trustedHtml,
  /class="back-btn"/,
  'expected trusted page to remove the old floating back button once bottom nav is the primary navigation'
);

const labels = [...navHtml.matchAll(/<span(?: id="scanButtonLabel")?>([^<]+)<\/span>/g)].map((match) => match[1].trim());
assert.deepEqual(
  labels,
  ['Trusted', 'Download', 'Scan', 'Tutorial', 'Profile'],
  'expected trusted page nav labels to match the lighter trusted-page bottom nav structure'
);

assert.match(
  trustedHtml,
  /\.trusted-bottom-nav \.nav-item\.active::before/,
  'expected trusted page to add a dedicated active-state accent layer for clearer current-page highlighting'
);

assert.match(
  trustedHtml,
  /\.trusted-bottom-nav \.nav-item\.active > svg/,
  'expected trusted page to boost the active icon treatment beyond the base nav style'
);

console.log('Trusted bottom-nav consistency checks passed.');
