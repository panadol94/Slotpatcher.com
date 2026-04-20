import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const repoRoot = process.cwd();
const trustedHtml = fs.readFileSync(path.join(repoRoot, 'trusted', 'index.html'), 'utf8');

const expectedThumbs = [
  'a9play',
  'aceplay88',
  'alladin99',
  'atm88',
  'cateye',
  'club99',
  'empire88',
  'everwin',
  'henghongbet',
  'icrown88',
  'iwin88',
  'jomgowin',
  'kuatbox',
  'm9',
  'poker9',
  'star8',
  'u9play',
  'winbox',
  'winway33'
];

assert.match(
  trustedHtml,
  /var\s+trustedVideoThumbs\s*=\s*\{/,
  'expected trusted page to define a local video-thumb mapping for companies that have no API photo or domain icon'
);

assert.match(
  trustedHtml,
  /normalizeTrustedThumbKey\(/,
  'expected trusted page to normalize company names/ids before matching local video thumbnails'
);

assert.match(
  trustedHtml,
  /trustedVideoThumbs\[thumbKey\]/,
  'expected trusted page to resolve local trusted video thumbnails by normalized key'
);

assert.match(
  trustedHtml,
  /kind:\s*'video-thumb'/,
  'expected trusted page to tag local extracted video frames as a dedicated thumb source'
);

for (const slug of expectedThumbs) {
  assert.match(
    trustedHtml,
    new RegExp(`assets/trusted-company-thumbs/${slug}\\.webp`),
    `expected trusted page to reference local video thumb asset for ${slug}`
  );

  const assetPath = path.join(repoRoot, 'assets', 'trusted-company-thumbs', `${slug}.webp`);
  assert.ok(fs.existsSync(assetPath), `expected local video thumb asset file to exist for ${slug}`);
}

console.log('Trusted video thumb checks passed.');
