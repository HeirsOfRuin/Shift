// Saves are contracts (hub rule 9). Every save version that ever shipped has a
// fixture here that must load and play on. The key never changes.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SAVE_KEY, SAVE_VERSION, newSave, setProfile, order, pathFor, startRun, playWeek, serialize, deserialize, toCode, fromCode, signOff, saveDebrief, unlocked, setOpenAll, TRACK, MODULES } from '../src/engine/game.js';
import { decide } from '../sim/bot.js';

test('the save key has not been renamed', () => assert.equal(SAVE_KEY, 'shift.save.v1'));

for (const v of [1, 2, 3]) {
  test(`the v${v} fixture loads and plays on to the end`, () => {
    let save = deserialize(readFileSync(new URL(`./fixtures/v${v}-save.json`, import.meta.url), 'utf8'));
    assert.equal(save.v, SAVE_VERSION);
    assert.ok(save.run && !save.run.over);
    while (!save.run.over) save = playWeek(save, decide(save.run, 'balanced')).save;
    assert.equal(save.track.modules['the-week'].plays, 2);
    if (v < 3) assert.equal(save.profile, null);           // an old save asks for a profile next
    else assert.equal(save.profile.department, 'paint');
  });
}

test('a profile is validated, builds the path, and the path sets the unlock order', () => {
  let save = newSave();
  assert.throws(() => setProfile(save, { seat: 'boss', department: 'welding' }), /seat/);
  assert.throws(() => setProfile(save, { seat: 'lead', department: 'shipping' }), /department/);
  save = setProfile(save, { name: ' Pat ', seat: 'lead', department: 'paint', tied: ['assembly', 'paint', 'nowhere'], strengths: ['D2', 'D2', 'ZZ'], work: ['B3', 'A1', 'D2', 'C1', 'E2'] });
  assert.equal(save.profile.name, 'Pat');
  assert.deepEqual(save.profile.tied, ['assembly']);
  assert.deepEqual(save.profile.strengths, ['D2']);
  assert.deepEqual(save.profile.work, ['B3', 'A1', 'C1']);         // capped at three, and never also a strength
  const path = pathFor(save.profile);
  assert.equal(path.length, TRACK.modules.length);
  assert.deepEqual([...path.map((x) => x.id)].sort(), [...TRACK.modules].sort());
  const first = path[0].id;
  assert.ok(MODULES[first].focus.some((a) => save.profile.work.includes(a)), 'the first module trains something they want to work on');
  assert.equal(path.at(-1).id, 'late-one', 'the strength comes last, as a check');
  assert.deepEqual(order(save), path.map((x) => x.id).filter((id) => (MODULES[id].seats || []).includes('lead')), 'a lead hand\'s path holds only the modules written for the seat');
  assert.ok(!order(save).includes('pulled'));
  assert.ok(unlocked(save, first));
  assert.ok(!unlocked(save, path[1].id));
  assert.ok(!unlocked(save, TRACK.modules[0]) || first === TRACK.modules[0]);
});

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
