// Every line resolves. A raw {token} or a missing key on a player's screen was a
// whole failure class in earlier builds (F7). This plays every module with every
// bot and scans everything the screens would show: cards, Friday reports, the
// end report, the trace.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { newModule, advance, weekView, TRACK } from '../src/engine/game.js';
import { decide, POLICIES } from '../sim/bot.js';
import { TEXT } from '../src/data/text.data.js';
import { PROBLEMS } from '../src/data/problems.data.js';

const RAW = /[{}]|undefined|NaN|\[object/;

test('no raw tokens anywhere a player can read, across every module and bot', () => {
  for (const module of TRACK.modules) for (const policy of POLICIES) for (let seed = 1; seed <= 8; seed++) {
    let s = newModule(module, seed);
    while (!s.over) {
      const v = weekView(s, {});
      for (const c of v.cards) {
        for (const t of [c.title, c.body, ...(c.know || []), ...(c.options || []).map((o) => o.label), ...(c.items || []).map((i) => i.label + i.why)]) assert.doesNotMatch(String(t), RAW, `${module} card ${c.id}: ${t}`);
      }
      s = advance(s, decide(s, policy)).state;
      for (const l of s.history.at(-1).lines) assert.doesNotMatch(l.text, RAW, `${module} w${s.history.at(-1).week}: ${l.text}`);
    }
    for (const c of s.outcome.checks) assert.doesNotMatch(c.label, RAW, c.label);
    for (const t of s.trace) assert.doesNotMatch(t.text + t.because, RAW, t.text);
    for (const t of s.outcome.carried) assert.doesNotMatch(t, RAW, t);
  }
});

test('every literal text key the engine uses exists', () => {
  const src = ['week.js', 'problems.js', 'cards.js', 'outcome.js', 'view.js'].map((f) => readFileSync(new URL(`../src/engine/${f}`, import.meta.url), 'utf8')).join('\n');
  const keys = [...src.matchAll(/(?:say\(s, |K\.line\('[a-z]+', |K\.resolve\(p, |key: )'([a-zA-Z0-9.]+)'/g)].map((m) => m[1]);
  assert.ok(keys.length > 50, `found only ${keys.length} keys: the scan is broken`);
  const missing = keys.filter((k) => TEXT[k] === undefined);
  assert.deepEqual([...new Set(missing)], []);
});

test('every cause and story has its card line, and every type its card text', () => {
  const missing = [];
  for (const [type, def] of Object.entries(PROBLEMS)) {
    const told = new Set([...Object.keys(def.causes), ...Object.values(def.stories).flatMap((o) => Object.keys(o))]);
    for (const c of told) for (const k of [`know.${type}.${c}`, `${type}.told.${c}`]) if (TEXT[k] === undefined) missing.push(k);
    for (const k of [`card.${type}.title`, `card.${type}.body.new`, `card.${type}.body.open`, `card.${type}.body.worse`, `carried.${type}`, `${type}.back`, `know.${type}.ruledOut`]) if (TEXT[k] === undefined) missing.push(k);
    for (const how of ['obvious', 'walk', 'cover', 'loud', 'lead']) if (['late', 'rework', 'load', 'friction'].includes(type) && TEXT[`notice.${type}.${how}`] === undefined) missing.push(`notice.${type}.${how}`);
  }
  assert.deepEqual(missing, []);
});
