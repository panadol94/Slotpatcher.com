import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const repoRoot = process.cwd();
const serverFile = path.join(repoRoot, 'server.mjs');
const scriptFile = path.join(repoRoot, 'script.js');

assert.ok(fs.existsSync(serverFile), 'expected server.mjs to exist for thumbnail proxy support');
assert.ok(fs.existsSync(scriptFile), 'expected script.js to exist for game thumbnail URL rewrites');

const serverCode = fs.readFileSync(serverFile, 'utf8');
const scriptCode = fs.readFileSync(scriptFile, 'utf8');

assert.match(
  serverCode,
  /\/api\/game-thumb/,
  'expected server to expose a dedicated /api/game-thumb route for proxied game thumbnails'
);

assert.match(
  serverCode,
  /GAME_THUMB_[A-Z_]+/,
  'expected game thumbnail proxy to define dedicated cache/guard constants'
);

assert.match(
  serverCode,
  /storage\.googleapis\.com/,
  'expected game thumbnail proxy to explicitly scope allowed upstream host to storage.googleapis.com'
);

assert.match(
  serverCode,
  /images\.imbaweb\.com/,
  'expected game thumbnail proxy to restrict upstream object paths to the images.imbaweb.com bucket namespace'
);

assert.match(
  serverCode,
  /AbortSignal\.timeout\(GAME_THUMB_FETCH_TIMEOUT_MS\)/,
  'expected game thumbnail proxy to enforce a fetch timeout on remote thumbnail requests'
);

assert.match(
  serverCode,
  /GAME_THUMB_MAX_BYTES|Thumbnail too large|content-length/,
  'expected game thumbnail proxy to enforce a response size limit for remote thumbnail images'
);

assert.match(
  serverCode,
  /Cache-Control': 'public, max-age=/,
  'expected game thumbnail proxy to return cacheable responses so repeat visits reuse warmed thumbnails'
);

assert.match(
  scriptCode,
  /function getGameThumbnailUrl\(/,
  'expected script.js to add a helper that rewrites raw game image URLs through the local thumbnail proxy'
);

assert.match(
  scriptCode,
  /\/api\/game-thumb\?src=/,
  'expected frontend game cards to request thumbnails through the local /api/game-thumb route'
);

assert.doesNotMatch(
  scriptCode,
  /<img loading="lazy" src="' \+ escapeHtml\(game\.img\)/,
  'expected game-card rendering to stop pointing img src directly at the remote thumbnail host'
);

console.log('Game thumbnail proxy checks passed.');
