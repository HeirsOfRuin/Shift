// Saves are contracts (hub rule 9). Every save version that ever shipped has a
// fixture here that must load and play on. The key never changes.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SAVE_KEY, SAVE_VERSION, newSave, startRun, playWeek, serialize, deserialize, toCode, fromCode, signOff, saveDebrief, unlocked, setOpenAll, TRACK } from '../src/engine/game.js';
import { decide } from '../sim/bot.js';

test('the save key has not been renamed', () => assert.equal(SAVE_KEY, 'shift.save.v1'));

for (const v of [1, 2]) {
  test(`the v${v} fixture loads and plays on to the end`, () => {
    let save = deserialize(readFileSync(new URL(`./fixtures/v${v}-save.json`, import.meta.url), 'utf8'));
    assert.equal(save.v, SAVE_VERSION);
    assert.ok(save.run && !save.run.over);
    while (!save.run.over) save = playWeek(save, decide(save.run, 'balanced')).save;
    assert.equal(save.track.modules['the-week'].plays, 2);
  });
}

test('a save survives the text code and comes back identical', () => {
  let save = startRun(newSave(), 'the-week', 7);
  save = playWeek(save, decide(save.run, 'coach')).save;
  assert.equal(serialize(fromCode(toCode(save))), serialize(save));
  assert.throws(() => fromCode('NOPE1.abc'), /not a save code/);
});

test('modules open in order, on sign-off, and the beta switch opens them all', () => {
  let save = newSave();
  assert.ok(unlocked(save, TRACK.modules[0]));
  assert.ok(!unlocked(save, TRACK.modules[1]));
  assert.throws(() => signOff(save, TRACK.modules[0], 'Coach'), /Play the module/);
  save = startRun(save, TRACK.modules[0], 1);
  while (!save.run.over) save = playWeek(save, decide(save.run, 'balanced')).save;
  assert.throws(() => signOff(save, TRACK.modules[0], 'Coach'), /commitment/);
  save = saveDebrief(save, TRACK.modules[0], { answers: [], commitment: 'Refuse the vendor demo.' });
  save = signOff(save, TRACK.modules[0], 'J. Rose');
  assert.ok(unlocked(save, TRACK.modules[1]));
  assert.ok(!unlocked(save, TRACK.modules[2]));
  assert.ok(unlocked(setOpenAll(save, true), TRACK.modules[7]));
  assert.throws(() => startRun(newSave(), TRACK.modules[3], 1), /not open/);
});
