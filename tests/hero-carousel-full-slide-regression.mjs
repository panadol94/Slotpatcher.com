import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const repoRoot = process.cwd();
const scriptCode = fs.readFileSync(path.join(repoRoot, 'script.js'), 'utf8');

const match = scriptCode.match(/function goToSlide\(index\) \{[\s\S]*?\n\}/);
assert.ok(match, 'expected script.js to define goToSlide(index) for the homepage hero carousel');

const track = { style: {} };
const dots = Array.from({ length: 3 }, () => ({
  active: false,
  classList: {
    toggle(className, value) {
      if (className === 'active') this._owner.active = Boolean(value);
    },
    _owner: null
  }
}));
for (const dot of dots) {
  dot.classList._owner = dot;
}

const context = {
  carouselTotal: 3,
  carouselCurrent: 0,
  document: {
    getElementById(id) {
      assert.equal(id, 'carouselTrack', 'expected goToSlide to update the hero carousel track');
      return track;
    },
    querySelectorAll(selector) {
      assert.equal(selector, '.carousel-dot', 'expected goToSlide to re-sync hero carousel dots');
      return dots;
    }
  },
  startCarouselTimer() {}
};

vm.createContext(context);
vm.runInContext(match[0], context);

context.goToSlide(1);

assert.equal(
  track.style.transform,
  'translateX(-100%)',
  `expected slide 2 to shift one full banner width, got ${track.style.transform}`
);
assert.equal(context.carouselCurrent, 1, 'expected goToSlide(1) to update carouselCurrent to slide 2');
assert.deepEqual(
  dots.map((dot) => dot.active),
  [false, true, false],
  'expected slide 2 dot to be the only active pagination dot'
);

console.log('Hero carousel full-slide regression checks passed.');
