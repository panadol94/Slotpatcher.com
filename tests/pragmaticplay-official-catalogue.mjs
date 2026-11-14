import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';

const root = process.cwd();
const provenancePath = path.join(root, 'data-sources/pragmaticplay-official.json');
assert.ok(fs.existsSync(provenancePath), 'official catalogue provenance must be present');
const provenance = JSON.parse(fs.readFileSync(provenancePath, 'utf8'));
const payload = JSON.parse(fs.readFileSync(path.join(root, 'provider-data/pp.json'), 'utf8'));
const manifestSandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'provider-manifest.js'), 'utf8'), manifestSandbox);
const fullSandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'game-data.js'), 'utf8'), fullSandbox);
const manifest = manifestSandbox.window.SQUEEN668_PROVIDER_MANIFEST;
const full = fullSandbox.window.SQUEEN668_GAME_DATABASE;
assert.equal(provenance.source_url, 'https://www.pragmaticplay.com/en/games/');
assert.equal(provenance.pagination_complete, true);
assert.equal(payload.games.length, provenance.counts.merged_total);
assert.equal(payload.games.length, manifest.pp.gameCount);
assert.deepEqual(JSON.parse(JSON.stringify(full.pp)), payload);
assert.equal(provenance.counts.existing_total + provenance.counts.new_games, payload.games.length);
assert.equal(provenance.games.length + provenance.preserved_legacy.length, payload.games.length);
const canonical = (name) => name.replace(/[™®©]/g, '').normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
assert.equal(new Set(payload.games.map((g) => canonical(g.name))).size, payload.games.length, 'no duplicate canonical game names');
const byName = new Map(payload.games.map((g) => [g.name, g]));
for (const game of provenance.games) {
  const actual = byName.get(game.name);
  assert.ok(actual, `official raw title missing: ${game.name}`);
  assert.equal(actual.img, game.local_image);
  assert.equal(actual.type, 'slots');
  const source = new URL(game.source_image);
  assert.equal(source.hostname, 'www.pragmaticplay.com');
  assert.ok(source.pathname.startsWith('/wp-content/uploads/'));
  const bytes = fs.readFileSync(path.join(root, actual.img));
  assert.equal(bytes.subarray(0, 4).toString(), 'RIFF');
  assert.equal(bytes.subarray(8, 12).toString(), 'WEBP');
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), game.sha256);
}
for (const game of provenance.preserved_legacy) {
  assert.equal(byName.get(game.name)?.img, game.img, `legacy title/artwork must stay: ${game.name}`);
}
for (const game of provenance.upcoming) {
  assert.ok(!byName.has(game.name), `unreleased game must not enter scan results: ${game.name}`);
}
for (const alias of provenance.aliases) {
  assert.ok(byName.has(alias.official_name));
  if (alias.existing_name !== alias.official_name) assert.ok(!byName.has(alias.existing_name));
}
for (const key of manifestSandbox.window.SQUEEN668_PROVIDER_ORDER) {
  const chunk = JSON.parse(fs.readFileSync(path.join(root, `provider-data/${key}.json`), 'utf8'));
  assert.equal(manifest[key].gameCount, chunk.games.length, `manifest count mismatch: ${key}`);
  assert.deepEqual(JSON.parse(JSON.stringify(full[key])), chunk, `full database/chunk mismatch: ${key}`);
}
const sandbox = {
  window: { SQUEEN668_GAME_DATABASE: { pp: payload }, SQUEEN668_PROVIDER_MANIFEST: manifest, location: { origin: 'https://slotpatcher.com' } },
  document: { addEventListener() {}, querySelectorAll() { return []; }, getElementById() { return null; } },
  navigator: { userAgent: 'catalogue-regression-test' }, console, URL,
  setTimeout() { return 0; }, clearTimeout() {}, setInterval() { return 0; }, clearInterval() {},
  fetch() { throw new Error('No network calls are allowed in catalogue regression tests'); },
};
vm.runInNewContext(fs.readFileSync(path.join(root, 'script.js'), 'utf8'), sandbox);
const results = sandbox.generateResults('pp');
assert.equal(results.length, payload.games.length, 'all declared slot titles must reach scanned results');
for (const name of ['Fish Eye', 'Lucky Fishing Megaways', 'The Dragon Tiger']) assert.ok(results.some((g) => g.name === name));
sandbox.GAME_DATABASE.test = { name: 'Test provider', games: [{ name: 'Roulette', img: 'test.png' }, { name: 'Regular Slot', img: 'test.png' }] };
assert.deepEqual(Array.from(sandbox.generateResults('test'), (g) => g.name), ['Regular Slot'], 'untyped non-slot filtering must remain unchanged for other providers');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
assert.ok(html.includes(`provider-manifest.js?v=${provenance.version}`), 'bump manifest cache key');
assert.ok(html.includes(`script.js?v=${provenance.version}`), 'bump scanner script cache key');
assert.ok(manifest.pp.dataPath.endsWith(`?v=${provenance.version}`), 'bump PP data cache key');
console.log(`Official Pragmatic catalogue checks passed: ${payload.games.length} scanned titles, ${provenance.games.length} official artworks.`);
