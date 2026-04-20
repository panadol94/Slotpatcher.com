import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const repoRoot = process.cwd();
const trustedHtml = fs.readFileSync(path.join(repoRoot, 'trusted', 'index.html'), 'utf8');
const styleCss = fs.readFileSync(path.join(repoRoot, 'style.css'), 'utf8');

assert.match(
  trustedHtml,
  /renderTrustedCompanyCard\(/,
  'expected trusted page to keep rendering cards through a dedicated helper'
);

assert.match(
  trustedHtml,
  /renderCompanyThumb\(/,
  'expected trusted cards to render a small real logo/image treatment helper'
);

assert.doesNotMatch(
  trustedHtml,
  /getCompanyAccentStyle\(/,
  'expected trusted cards to stop using per-card promo gradients that clash with the main site theme'
);

assert.doesNotMatch(
  styleCss,
  /\.trusted-company-brand-panel\s*\{/,
  'expected trusted cards to remove the loud gradient brand panel from the comparison-style redesign'
);

assert.doesNotMatch(
  trustedHtml,
  /trusted-company-leading-note/,
  'expected trusted cards to reduce extra filler copy in the leading column'
);

assert.match(
  styleCss,
  /\.trusted-company-leading\s*\{/,
  'expected trusted cards to define a subdued leading column that fits the premium dark theme'
);

assert.match(
  styleCss,
  /\.trusted-company-index-badge\s*\{/,
  'expected trusted cards to use a smaller premium index badge instead of a promo leaderboard block'
);

assert.match(
  styleCss,
  /\.trusted-company-identity\s*\{/,
  'expected trusted cards to include a refined identity block for company thumb and trust signal'
);

assert.match(
  styleCss,
  /\.trusted-company-thumb\s*\{/,
  'expected trusted cards to include a compact real-image thumb treatment'
);

assert.match(
  styleCss,
  /\.trusted-company-signal\s*\{/,
  'expected trusted cards to include a subtle trust\/live signal treatment'
);

assert.match(
  styleCss,
  /\.trusted-company-meta-row\s*\{/,
  'expected trusted cards to add a compact metadata row inside the main content area'
);

assert.match(
  styleCss,
  /\.trusted-company-cta\s*\{[\s\S]*border:\s*1px solid rgba\(197, 31, 31, 0\.22\)/,
  'expected trusted CTA to become a subtler bordered action that matches Slotpatcher theme better'
);

assert.doesNotMatch(
  trustedHtml,
  /google\.com\/s2\/favicons/,
  'expected trusted cards to stop relying on external Google favicon fetches for non-photo listings'
);

assert.match(
  trustedHtml,
  /var\s+trustedThumbCache\s*=\s*Object\.create\(null\)/,
  'expected trusted page to cache generated thumb treatments locally for more consistent renders'
);

assert.match(
  trustedHtml,
  /buildTrustedThumbDataUrl\(/,
  'expected trusted page to generate a deterministic custom SVG thumb for non-photo listings'
);

assert.match(
  trustedHtml,
  /var\s+cacheKey\s*=\s*\[\s*company && company\.id,\s*company && company\.name,\s*company && company\.link\s*\]/,
  'expected trusted thumb cache key to include id, name, and link so cached SVG thumbs stay correct when listing metadata changes'
);

assert.match(
  styleCss,
  /\.trusted-company-card,\s*[\s\S]*background:\s*linear-gradient\(160deg, rgba\(8, 10, 14, 0\.98\), rgba\(12, 15, 22, 0\.98\)\)/,
  'expected trusted cards to move to a darker luxury surface treatment'
);

assert.match(
  styleCss,
  /@media \(max-width: 640px\)[\s\S]*\.trusted-company-shell\s*\{[\s\S]*grid-template-columns:\s*84px minmax\(0, 1fr\)/,
  'expected trusted cards to use a tighter two-column mobile layout instead of a tall stacked shell'
);

console.log('Trusted card redesign checks passed.');
