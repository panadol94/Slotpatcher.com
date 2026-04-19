import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const repoRoot = process.cwd();
const trustedHtml = fs.readFileSync(path.join(repoRoot, 'trusted', 'index.html'), 'utf8');
const styleCss = fs.readFileSync(path.join(repoRoot, 'style.css'), 'utf8');

assert.match(
  trustedHtml,
  /renderTrustedCompanyCard\(/,
  'expected trusted page to render cards through a dedicated review-card helper'
);

assert.doesNotMatch(
  trustedHtml,
  /preload="metadata"/,
  'expected trusted page to stop preloading video metadata for every listing card'
);

assert.match(
  styleCss,
  /\.trusted-company-review-card\s*\{/,
  'expected trusted cards to expose a review-card shell class'
);

assert.match(
  styleCss,
  /\.trusted-company-brand-panel\s*\{/,
  'expected trusted cards to include a left brand panel inspired by comparison/review sites'
);

assert.match(
  styleCss,
  /\.trusted-company-rank\s*\{/,
  'expected trusted cards to include a compact rank panel in the left column'
);

assert.match(
  styleCss,
  /\.trusted-company-main\s*\{/,
  'expected trusted cards to define a main copy column'
);

assert.match(
  styleCss,
  /\.trusted-company-facts\s*\{/,
  'expected trusted cards to render a bottom facts row similar to review/comparison cards'
);

assert.match(
  styleCss,
  /\.trusted-company-cta\s*\{/,
  'expected trusted cards to expose a strong right-side CTA block'
);

console.log('Trusted card redesign checks passed.');
