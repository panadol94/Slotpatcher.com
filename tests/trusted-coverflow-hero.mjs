import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const repoRoot = process.cwd();
const trustedHtml = fs.readFileSync(path.join(repoRoot, 'trusted', 'index.html'), 'utf8');
const styleCss = fs.readFileSync(path.join(repoRoot, 'style.css'), 'utf8');

assert.match(
  trustedHtml,
  /id="trustedFeatureStage"/,
  'expected trusted page to expose a dedicated luxury feature stage above the listing grid'
);

assert.match(
  trustedHtml,
  /id="trustedCoverflow"/,
  'expected trusted page to expose a dedicated coverflow container for featured trusted companies'
);

assert.match(
  trustedHtml,
  /id="trustedCoverflowPrev"/,
  'expected trusted page to expose a previous control for the trusted coverflow'
);

assert.match(
  trustedHtml,
  /id="trustedCoverflowNext"/,
  'expected trusted page to expose a next control for the trusted coverflow'
);

assert.match(
  trustedHtml,
  /id="trustedCoverflowDots"/,
  'expected trusted page to expose pagination dots for the trusted coverflow'
);

assert.match(
  trustedHtml,
  /getTrustedFeatureCompanies\(/,
  'expected trusted page to derive a featured trusted-company set for the hero coverflow'
);

assert.match(
  trustedHtml,
  /renderTrustedFeatureCarousel\(/,
  'expected trusted page to render the trusted hero coverflow through a dedicated helper'
);

assert.match(
  trustedHtml,
  /updateTrustedFeatureCarousel\(/,
  'expected trusted page to update the trusted hero coverflow state without disturbing the main list'
);

assert.match(
  trustedHtml,
  /renderTrustedFeatureCard\(/,
  'expected trusted page to render each coverflow slide through a dedicated helper'
);

assert.match(
  trustedHtml,
  /renderTrustedFeatureMedia\(/,
  'expected trusted page to render a richer media treatment for the featured trusted hero slides'
);

assert.match(
  trustedHtml,
  /shiftTrustedFeature\(/,
  'expected trusted page to expose a directional shift helper for coverflow navigation'
);

assert.match(
  trustedHtml,
  /sanitizeTrustedHref\(/,
  'expected trusted page to sanitize trusted-company links before rendering them into href attributes'
);

assert.match(
  trustedHtml,
  /targetUrl\.protocol !== 'http:' && targetUrl\.protocol !== 'https:'/,
  'expected trusted href sanitization to allow only http and https schemes'
);

assert.match(
  trustedHtml,
  /coverflow\.addEventListener\('click'/,
  'expected trusted page to let users focus a side coverflow card by tapping it'
);

assert.match(
  trustedHtml,
  /event\.target\.closest\('a, button'\)\) return;/,
  'expected trusted coverflow keyboard handler to ignore nested interactive descendants like links and buttons'
);

assert.match(
  trustedHtml,
  /setTrustedFeatureIndex\(nextIndex, 'card'\)/,
  'expected trusted coverflow keyboard focus changes to restore focus onto the newly active card'
);

assert.match(
  trustedHtml,
  /focusTarget === 'dot'/,
  'expected trusted coverflow updates to support focus restoration for pagination dots after rerender'
);

assert.match(
  trustedHtml,
  /renderTrustedFeatureCarousel\(activeCompanies\)/,
  'expected trusted page to render the top trusted hero coverflow from the current ACTIVE company set'
);

assert.match(
  trustedHtml,
  /return companies\.slice\(0, 5\)\.map\(/,
  'expected trusted feature selection to follow the top 5 ranked/listed ACTIVE companies instead of re-sorting by visual richness'
);

assert.doesNotMatch(
  trustedHtml,
  /visualPriority|visualScore/,
  'expected trusted feature selection to stop using a visual-priority scoring sort once the user chooses top-rank ordering'
);

assert.match(
  styleCss,
  /\.trusted-feature-stage\s*\{/,
  'expected style.css to define a dedicated luxury feature stage shell for the trusted coverflow'
);

assert.match(
  styleCss,
  /\.trusted-coverflow-shell\s*\{[\s\S]*perspective:\s*1400px/,
  'expected trusted coverflow shell to use 3D perspective for the luxury carousel effect'
);

assert.match(
  styleCss,
  /\.trusted-feature-card\.is-active\s*\{[\s\S]*translateX\(-50%\)[\s\S]*translateY\(-4px\)/,
  'expected the active trusted feature card to stay centered while lifting slightly for a premium hero motion treatment'
);

assert.match(
  styleCss,
  /\.trusted-feature-card\.is-before\s*\{[\s\S]*rotateY\(44deg\)/,
  'expected the left-side trusted feature card to angle more dramatically inward for a stronger 3D coverflow effect'
);

assert.match(
  styleCss,
  /\.trusted-feature-card\.is-after\s*\{[\s\S]*rotateY\(-44deg\)/,
  'expected the right-side trusted feature card to angle more dramatically inward for a stronger 3D coverflow effect'
);

assert.match(
  styleCss,
  /\.trusted-feature-card-media\s*\{/,
  'expected trusted feature cards to define a large hero-media surface'
);

assert.match(
  styleCss,
  /\.trusted-feature-card-visit\s*\{/,
  'expected trusted feature cards to expose a quieter premium CTA inside the coverflow'
);

assert.match(
  styleCss,
  /@media \(max-width: 640px\)[\s\S]*\.trusted-feature-card\.is-before\s*\{[\s\S]*rotateY\(34deg\)/,
  'expected trusted coverflow to keep a still-noticeable 3D side angle on smaller screens while softening it from desktop'
);

console.log('Trusted coverflow hero checks passed.');
