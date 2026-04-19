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
  /renderTrustedCompanies\(/,
  'expected trusted page to render company cards from API data'
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

console.log('Trusted companies API integration checks passed.');
