import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = process.cwd();
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const script = fs.readFileSync(path.join(root, 'script.js'), 'utf8');

assert.match(
  html,
  /id="gameListLoadMore"/,
  'Results section should expose a dedicated Load More control under the game list'
);

assert.match(
  script,
  /var\s+GAME_LIST_BATCH_SIZE\s*=\s*(24|30|36)\s*;/,
  'Game list rendering should define an initial batch size instead of rendering every game at once'
);

assert.match(
  script,
  /var\s+currentVisibleGameCount\s*=\s*0\s*;/,
  'Game list pagination should track the currently visible game count'
);

assert.match(
  script,
  /function\s+handleLoadMoreGames\s*\(/,
  'Game list should provide a dedicated load-more handler'
);

assert.match(
  script,
  /filtered\.slice\(0,\s*currentVisibleGameCount\)/,
  'renderGames should only render the current visible slice rather than the full filtered array'
);

assert.doesNotMatch(
  script,
  /filtered\.forEach\(function\(game, index\)/,
  'renderGames should not append every filtered game card in one pass anymore'
);

console.log('game list pagination regression checks passed');
