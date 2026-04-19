import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const repoRoot = process.cwd();
const trustedHtml = fs.readFileSync(path.join(repoRoot, 'trusted', 'index.html'), 'utf8');

assert.match(
  trustedHtml,
  /id="trustedCompanyGrid"/,
  'expected trusted page to expose a dedicated company grid container'
);

assert.match(
  trustedHtml,
  /id="trustedPlatformCount"/,
  'expected trusted page to expose a live platform count element'
);

assert.match(
  trustedHtml,
  /id="trustedVideoCount"/,
  'expected trusted page to expose a live video-count stat'
);

assert.match(
  trustedHtml,
  /id="trustedPhotoCount"/,
  'expected trusted page to expose a live photo-count stat'
);

assert.match(
  trustedHtml,
  /var\s+apiUrl\s*=\s*'https:\/\/api\.tipsmega888\.com\/api\/companies'/,
  'expected trusted page to target the TipsMega888 companies API'
);

assert.match(
  trustedHtml,
  /fetch\(apiUrl\)/,
  'expected trusted page to fetch company data from the configured API URL'
);

assert.match(
  trustedHtml,
  /sortCompaniesByFreshness\(/,
  'expected trusted page to sort companies by updatedAt\/createdAt before rendering'
);

assert.match(
  trustedHtml,
  /updatedAt|createdAt/,
  'expected trusted page sorting logic to use timestamp fields from the API payload'
);

assert.match(
  trustedHtml,
  /resolveMediaUrl\(/,
  'expected trusted page to resolve storageUrl values into absolute media URLs'
);

assert.match(
  trustedHtml,
  /renderCompanyMedia\(/,
  'expected trusted page to render photo\/video previews from storageUrl'
);

assert.match(
  trustedHtml,
  /trusted-company-media-frame/,
  'expected trusted page cards to include a dedicated media frame'
);

assert.match(
  trustedHtml,
  /company\.status\s*===\s*'ACTIVE'/,
  'expected trusted page to filter the API payload down to ACTIVE companies only'
);

assert.match(
  trustedHtml,
  /id="trustedSourceStatus"/,
  'expected trusted page to show API sync/fallback status to the user'
);

assert.match(
  trustedHtml,
  /class="bottom-nav trusted-bottom-nav"/,
  'expected trusted page to include a bottom nav for quick navigation'
);

console.log('Trusted companies API integration checks passed.');
