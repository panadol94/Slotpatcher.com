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
  'expected trusted cards to include a refined identity block for company initials and trust signal'
);

assert.match(
  styleCss,
  /\.trusted-company-signal\s*\{/,
  'expected trusted cards to include a subtle trust/live signal treatment'
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

console.log('Trusted card redesign checks passed.');
