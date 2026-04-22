import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const repoRoot = process.cwd();
const indexHtml = fs.readFileSync(path.join(repoRoot, 'index.html'), 'utf8');

const expectedBanners = [
  'assets/banner-1.webp',
  'assets/banner-2.webp',
  'assets/banner-3.webp'
];

for (const bannerPath of expectedBanners) {
  assert.match(
    indexHtml,
    new RegExp(bannerPath.replace('.', '\\.')),
    `expected homepage hero to reference optimized banner asset ${bannerPath}`
  );
  assert.ok(fs.existsSync(path.join(repoRoot, bannerPath)), `expected optimized banner file ${bannerPath} to exist`);
}

assert.doesNotMatch(
  indexHtml,
  /assets\/banner-[123]\.jpg/,
  'expected homepage hero to stop referencing the heavier JPG banner originals'
);

assert.doesNotMatch(
  indexHtml,
  /data-aos(?:-delay)?=/,
  'expected homepage to remove leftover dead AOS attributes after dropping AOS'
);

assert.doesNotMatch(
  indexHtml,
  /\bswiper(?:-[a-z-]+)?\b/,
  'expected homepage hero markup to remove leftover Swiper-only classes once native carousel is primary'
);

const totalBannerBytes = expectedBanners
  .map((bannerPath) => fs.statSync(path.join(repoRoot, bannerPath)).size)
  .reduce((sum, size) => sum + size, 0);

assert.ok(
  totalBannerBytes < 160000,
  `expected optimized hero banners to stay under 160000 bytes total, got ${totalBannerBytes}`
);

console.log('Hero banner optimization regression checks passed.');
