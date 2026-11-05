// Saves are contracts (hub rule 9). Every save version that ever shipped has a
// fixture here that must load and play on. The key never changes.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SAVE_KEY, SAVE_VERSION, newSave, setProfile, order, pathFor, startRun, playWeek, serialize, deserialize, toCode, fromCode, signOff, saveDebrief, unlocked, setOpenAll, TRACK, MODULES, becomeCoach, setTrainee, assignmentCode, readAssignment, takeAssignment, progressCode, readProgress, recordProgress, rosterView, kindOf, assignable, GROUP_SESSIONS, startSession, endSession, roomView } from '../src/engine/game.js';
import { decide } from '../sim/bot.js';

test('the save key has not been renamed', () => assert.equal(SAVE_KEY, 'shift.save.v1'));

for (const v of [1, 2, 3, 4]) {
  test(`the v${v} fixture loads and plays on to the end`, () => {
    let save = deserialize(readFileSync(new URL(`./fixtures/v${v}-save.json`, import.meta.url), 'utf8'));
    assert.equal(save.v, SAVE_VERSION);
    assert.ok(save.run && !save.run.over);
    while (!save.run.over) save = playWeek(save, decide(save.run, 'balanced')).save;
    assert.equal(save.track.modules['the-week'].plays, 2);
    if (v < 3) assert.equal(save.profile, null);           // an old save asks for a profile next
    else assert.equal(save.profile.department, 'paint');
    if (v < 4) { assert.equal(save.assignment, null); assert.equal(save.role, v < 3 ? null : 'trainee'); }
    else { assert.equal(save.role, 'trainee'); assert.deepEqual(order(save), ['the-week', 'late-one', 'waits'], 'an assigned trainee plays the coach\'s list'); }
  });
}

test('a coach assigns modules by code, the trainee takes them, and progress comes back by code', () => {
  let coach = becomeCoach(newSave(), { name: 'R. Okafor', department: 'welding' });
  assert.equal(coach.role, 'coach');
  assert.throws(() => setTrainee(coach, { name: '', seat: 'lead', department: 'paint', modules: ['the-week'] }), /name/);
  assert.throws(() => setTrainee(coach, { name: 'Sam', seat: 'lead', department: 'paint', modules: ['pulled'] }), /written for that seat/);
  coach = setTrainee(coach, { name: 'Sam', seat: 'lead', department: 'paint', modules: ['late-one', 'pulled', 'waits', 'late-one', 'nope'], open: 'all' });
  const t = coach.coach.roster[0];
  assert.deepEqual(t.modules, ['late-one', 'waits'], 'duplicates, unknown ids and modules not in the seat are dropped');
  assert.ok(assignable('lead').every((m) => MODULES[m.id].seats.includes('lead')));
  const code = assignmentCode(coach, t.id);
  assert.equal(kindOf(code), 'assignment');
  assert.ok(code.length < 400, `a code fits a text message (${code.length})`);
  const a = readAssignment(code);
  assert.equal(a.coach, 'R. Okafor');
  assert.deepEqual(a.modules, ['late-one', 'waits']);
  assert.throws(() => readAssignment('SHFTA1.zzz'), /damaged/);

  let trainee = takeAssignment(newSave(), code);
  assert.equal(trainee.role, 'trainee');
  assert.equal(trainee.profile.seat, 'lead');
  assert.equal(trainee.profile.name, 'Sam');
  assert.deepEqual(order(trainee), ['late-one', 'waits']);
  assert.ok(unlocked(trainee, 'waits'), 'open: all opens every assigned module');
  assert.throws(() => startRun(trainee, 'the-week', 1), /not open/);
  trainee = startRun(trainee, 'late-one', 3);
  while (!trainee.run.over) trainee = playWeek(trainee, decide(trainee.run, 'balanced')).save;
  trainee = saveDebrief(trainee, 'late-one', { answers: ['private'], commitment: 'Ask before I act.' });
  const pcode = progressCode(trainee);
  assert.equal(kindOf(pcode), 'progress');
  const p = readProgress(pcode);
  assert.equal(p.m.length, 1);
  assert.equal(p.m[0].k, 'Ask before I act.');
  assert.ok(!JSON.stringify(p).includes('private'), 'the debrief answers stay on the phone');
  assert.ok(!pcode.includes('run'), 'the progress code is not the save');

  const { save: coach2, trainee: who } = recordProgress(coach, pcode);
  assert.equal(who.name, 'Sam');
  const view = rosterView(coach2);
  assert.equal(view.rows[0].modules[0].state, 'debriefed');
  assert.equal(view.rows[0].modules[0].commitment, 'Ask before I act.');
  assert.equal(view.rows[0].modules[1].state, 'not started');
  assert.throws(() => recordProgress(becomeCoach(newSave(), {}), pcode), /Nobody on the roster/);
});

test('a coach runs a session on one screen: an ordinary run with the facilitator\'s lines beside it', () => {
  let s = becomeCoach(newSave(), { name: 'R. Okafor' });
  s = startSession(s, 'whose', 11);
  assert.equal(s.run.moduleId, 'upstairs');
  assert.equal(roomView(s).title, 'Whose call is it');
  assert.ok(roomView(s).open && roomView(s).each);
  while (!s.run.over) s = playWeek(s, decide(s.run, 'balanced')).save;
  assert.ok(roomView(s).over);
  assert.equal(roomView(s).questions.length, 4);
  s = endSession(s);
  assert.equal(s.run, null); assert.equal(s.room, null);
  assert.throws(() => startSession(s, 'nope', 1), /no session/);
});

test('every group session is built on a module that exists and is gated', () => {
  for (const [id, g] of Object.entries(GROUP_SESSIONS)) {
    assert.ok(MODULES[g.module], `${id}: module ${g.module}`);
    assert.ok(TRACK.modules.includes(g.module), `${id}: on the track`);
    assert.ok(g.blocks.length >= 4 && g.questions.length >= 3 && g.reveal && g.commitment && g.purpose, `${id}: complete`);
    assert.ok(g.room.open && g.room.each && g.room.close && Object.keys(g.room.weeks).every((w) => Number(w) <= MODULES[g.module].weeks), `${id}: lines for the screen, on weeks the module has`);
    assert.ok((MODULES[g.module].seats || ['supervisor']).includes('supervisor'), `${id}: runs from the supervisor's seat`);
    const minutes = g.blocks.reduce((a, [m]) => a + Number(m), 0);
    assert.equal(minutes, g.minutes, `${id}: the blocks add up to ${g.minutes} minutes`);
  }
});

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
