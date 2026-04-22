import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const repoRoot = process.cwd();
const indexHtml = fs.readFileSync(path.join(repoRoot, 'index.html'), 'utf8');
const scriptCode = fs.readFileSync(path.join(repoRoot, 'script.js'), 'utf8');
const fullGameData = fs.readFileSync(path.join(repoRoot, 'game-data.js'), 'utf8');
const manifestPath = path.join(repoRoot, 'provider-manifest.js');
const providerDataDir = path.join(repoRoot, 'provider-data');

assert.ok(fs.existsSync(manifestPath), 'expected a lightweight provider-manifest.js file for initial page load');
assert.ok(fs.existsSync(providerDataDir), 'expected provider-data directory for split provider payloads');

assert.match(
  indexHtml,
  /provider-manifest\.js\?v=/,
  'expected homepage to include provider-manifest.js as the initial lightweight provider source'
);

assert.doesNotMatch(
  indexHtml,
  /game-data\.js\?v=|game-data\.js"|game-data\.js'/,
  'expected homepage to stop loading the full game-data.js payload up front'
);

assert.match(
  scriptCode,
  /var PROVIDER_MANIFEST = window\.SQUEEN668_PROVIDER_MANIFEST \|\| \{\};/,
  'expected script.js to read provider metadata from a lightweight manifest object'
);

assert.match(
  scriptCode,
  /function getProviderMeta\(/,
  'expected script.js to add a helper for resolving provider metadata independently of full game lists'
);

assert.match(
  scriptCode,
  /function ensureProviderDataLoaded\(/,
  'expected script.js to add an on-demand provider data loader'
);

assert.match(
  scriptCode,
  /await ensureProviderDataLoaded\(currentProvider\)/,
  'expected startScan to wait for provider data before generating scan results'
);

assert.match(
  scriptCode,
  /ensureProviderDataLoaded\(key\)\.then\(/,
  'expected provider selection to begin prefetching the chosen provider payload in the background'
);

const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(manifestPath, 'utf8'), sandbox);
const manifest = sandbox.window.SQUEEN668_PROVIDER_MANIFEST;
const order = sandbox.window.SQUEEN668_PROVIDER_ORDER;

assert.ok(manifest && typeof manifest === 'object', 'expected provider-manifest.js to populate window.SQUEEN668_PROVIDER_MANIFEST');
assert.ok(Array.isArray(order) && order.length > 0, 'expected provider-manifest.js to define provider order');
assert.equal(order.length, 16, 'expected provider manifest to preserve the current 16-provider catalog');

const chunkFiles = fs.readdirSync(providerDataDir).filter((name) => name.endsWith('.json'));
assert.equal(chunkFiles.length, order.length, 'expected one split provider JSON file per provider in the manifest');

for (const key of order) {
  const meta = manifest[key];
  assert.ok(meta, `expected manifest entry for provider ${key}`);
  assert.ok(meta.name && meta.logo, `expected manifest provider ${key} to keep name/logo metadata`);
  assert.ok(!('games' in meta), `expected manifest provider ${key} to omit the heavy games array`);

  const jsonPath = path.join(providerDataDir, `${key}.json`);
  assert.ok(fs.existsSync(jsonPath), `expected split payload file ${key}.json`);
  const payload = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  assert.equal(payload.name, meta.name, `expected chunk payload ${key}.json to preserve provider name`);
  assert.ok(Array.isArray(payload.games) && payload.games.length > 0, `expected chunk payload ${key}.json to contain games array`);
}

const manifestSize = fs.statSync(manifestPath).size;
const fullSize = fs.statSync(path.join(repoRoot, 'game-data.js')).size;
assert.ok(manifestSize < fullSize / 4, 'expected provider-manifest.js to be much smaller than full game-data.js');

console.log('Provider lazy-loading regression checks passed.');
