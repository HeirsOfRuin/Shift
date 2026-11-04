// What can never be true. Impossibility assertions, not magnitudes: they survive
// every rebalance. Each test plays real modules through the bots, so "it held"
// means it held over weeks that actually happened.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newModule, advance, hoursFor, weekView, TRACK, MODULES, AREAS } from '../src/engine/game.js';
import { decide, POLICIES } from '../sim/bot.js';

function* runs(seeds = 6) {
  for (const module of TRACK.modules) for (const seat of MODULES[module].seats || ['supervisor']) for (const policy of POLICIES) for (let seed = 1; seed <= seeds; seed++) yield { module, policy, seed, seat };
}

function playThrough({ module, policy, seed, seat = 'supervisor' }, each = () => {}) {
  let s = newModule(module, seed, seat);
  for (let guard = 0; !s.over && guard < 40; guard++) {
    const plan = decide(s, policy);
    const expected = hoursFor(s, plan);
    const before = s;
    const out = advance(s, plan);
    s = out.state;
    each(before, plan, out.record, s, expected);
  }
  return s;
}

test('every module ends, inside its weeks, and the clock always moves', () => {
  for (const r of runs(4)) {
    const s = playThrough(r, (before, plan, record, after) => assert.ok(after.week > before.week || after.over, `${r.module} ${r.policy} ${r.seed}: stuck at week ${before.week}`));
    assert.ok(s.over, `${r.module} never ended`);
    assert.ok(s.history.length <= MODULES[r.module].weeks);
  }
});

test('the hours on the record are the hours the plan screen showed', () => {
  for (const r of runs(3)) playThrough(r, (before, plan, record, after, expected) => assert.equal(record.hours, expected, `${r.module} week ${record.week}`));
});

test('no number is ever NaN or infinite', () => {
  const bad = (x) => typeof x === 'number' && !Number.isFinite(x);
  for (const r of runs(3)) {
    playThrough(r, (b, p, record, s) => {
      for (const [k, v] of Object.entries(s.dept)) assert.ok(!bad(v), `${r.module} dept.${k} = ${v}`);
      for (const c of s.crew) for (const k of ['skill', 'morale', 'trust', 'stress', 'daysOut', 'lateness']) assert.ok(!bad(c[k]), `${c.id}.${k}`);
      for (const k of ['hours', 'shipped', 'found', 'escapes']) assert.ok(!bad(record[k]), `record.${k}`);
    });
  }
});

test('people who quit or were hurt stay gone, and nobody comes back from nothing', () => {
  for (const r of runs(4)) {
    playThrough(r, (before, plan, record, after) => {
      for (const c of before.crew) {
        const now = after.crew.find((x) => x.id === c.id);
        if (c.status === 'quit' || c.status === 'injured') assert.equal(now.status, c.status, `${c.id} came back in ${r.module}`);
        if (now.status === 'active' && c.status !== 'active') assert.equal(c.status, 'leave', `${c.id} returned from ${c.status}`);
      }
    });
  }
});

test("Friday's first line is the record's own number", () => {
  for (const r of runs(2)) playThrough(r, (b, p, record) => assert.ok(record.lines[0].text.includes(`${record.bodies} bod`), record.lines[0].text));
});

test('the same seed and the same plans give the same module', () => {
  for (const module of TRACK.modules) {
    const a = playThrough({ module, policy: 'balanced', seed: 77 });
    const b = playThrough({ module, policy: 'balanced', seed: 77 });
    assert.equal(JSON.stringify(a), JSON.stringify(b), module);
  }
});

test('a plan cannot pick an option a card does not have', () => {
  const s = newModule('late-one', 5);
  assert.throws(() => advance(s, { picks: { cover: 'd9' } }), /no option/);
});

test('the practice read covers only the module\'s focus areas, gives no overall number, and is labelled practice', () => {
  for (const r of runs(2)) {
    const s = playThrough(r);
    const p = s.outcome.profile;
    assert.match(p.label, /Practice/);
    assert.equal(p.overall, undefined);
    const seatArea = r.seat === 'lead' && !MODULES[r.module].focus.includes('E1') && s.decisions.some((d) => d.area === 'E1');
    assert.deepEqual(p.focus.map((f) => f.id), [...MODULES[r.module].focus, ...(seatArea ? ['E1'] : [])], 'the module\'s focus, plus the seat\'s own area when a lead hand took something up');
    for (const f of p.focus) {
      assert.ok(['solid', 'getting', 'notyet', 'thin'].includes(f.read.id), f.read.id);
      if (f.n < 3) assert.equal(f.read.id, 'thin', `${r.module}: a read from ${f.n} decisions`);
    }
    for (const a of p.also) assert.ok(!MODULES[r.module].focus.includes(a.id));
  }
});

test('the lead hand cannot do what needs the supervisor, and the supervisor never sees "take it to Kev"', () => {
  for (const r of runs(1)) {
    playThrough(r, (before) => {
      for (const card of weekView(before, {}).cards.filter((c) => c.kind === 'problem')) {
        const ids = card.options.map((o) => o.id);
        if (r.seat === 'lead') { assert.ok(!ids.includes('document') && !ids.includes('accommodate') && !ids.includes('timeOff'), `${r.module}: a lead can ${ids}`); }
        else assert.ok(!ids.includes('takeUp'), `${r.module}: the supervisor can take it up`);
      }
    });
  }
  assert.throws(() => newModule('pulled', 1, 'lead'), /not written for the lead seat/);
});

test('every scored decision names a focus area the catalogue has', () => {
  for (const r of runs(1)) for (const d of playThrough(r).decisions) assert.ok(AREAS[d.area], `${r.module}: scored "${d.note}" on unknown area ${d.area}`);
});

test('every module names one or two focus areas, and every area gets at least three decisions from some style', () => {
  for (const id of TRACK.modules) assert.ok(MODULES[id].focus.length >= 1 && MODULES[id].focus.length <= 2, id);
  for (const module of TRACK.modules) for (const area of MODULES[module].focus) {
    const best = Math.max(...POLICIES.map((policy) => playThrough({ module, policy, seed: 3 }).outcome.profile.focus.find((f) => f.id === area).n));
    assert.ok(best >= 3, `${module} ${area}: at most ${best} decisions in any style`);
  }
});

test('a hidden cause is never on the screen before it is told', () => {
  for (const r of runs(2)) {
    playThrough(r, (before) => {
      const v = weekView(before, {});
      for (const card of v.cards.filter((c) => c.kind === 'problem')) {
        const p = before.problems.find((x) => x.id === card.problem);
        if (!p.told) assert.equal(card.told, null, `${r.module}: card shows a cause nobody told`);
      }
    });
  }
});
