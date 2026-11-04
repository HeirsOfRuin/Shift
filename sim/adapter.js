// sim/adapter.js: connects Shift to the game-measure kit (sim/run.js and
// friends). The kit files are not edited per game; this one is.

import { newModule, advance, TRACK } from '../src/engine/game.js';
import { decide, POLICIES } from './bot.js';

export const axes = { policy: POLICIES, module: TRACK.modules };
export const defaults = { policy: 'balanced', module: 'late-one' };

export function play(seed, opts = {}) {
  let s = newModule(opts.module || defaults.module, seed);
  for (let guard = 0; !s.over && guard < 40; guard++) {
    const before = s.week;
    s = advance(s, decide(s, opts.policy || defaults.policy)).state;
    if (!s.over && s.week <= before) throw new Error(`no progress at week ${before}`);
  }
  return s;
}

export function progress(s) {
  const missing = [];
  if (!s.over) missing.push('never ended');
  if (s.history.length < 2) missing.push(`only ${s.history.length} weeks played`);
  return missing;
}

export function metrics(s) {
  const o = s.outcome;
  const here = s.crew.filter((c) => c.status === 'active');
  const avg = (f) => here.reduce((a, c) => a + f(c), 0) / Math.max(1, here.length);
  const check = (id) => o.checks.find((c) => c.id === id)?.ok ?? false;
  return {
    win: o.win,
    schedule: check('schedule'),
    kept: check('crew'),
    problem: check('problem'),
    starved: s.dept.starved,
    bottleneck: s.dept.bottleneck,
    ship: s.dept.shipped / s.dept.demanded,
    hours: s.history.reduce((a, r) => a + r.hours, 0) / s.history.length,
    morale: avg((c) => c.morale),
    trust: avg((c) => c.trust),
    // share of the module's focus areas that read Solid (0, 0.5 or 1)
    practice: o.profile.focus.filter((f) => f.read.id === 'solid').length / o.profile.focus.length,
  };
}

export function digest(s) {
  return JSON.stringify([s.outcome?.win, s.week, Math.round(s.dept.shipped * 100), s.problems.map((p) => [p.state, p.cause]), s.crew.map((c) => c.status)]);
}

export function trace(s) {
  return s.history.map((r) => `week ${r.week}  ${r.hours}h  shipped ${r.shipped}/${r.asked}\n  ${r.lines.map((l) => `[${l.kind}] ${l.text}`).join('\n  ')}`).join('\n') +
    `\n${s.outcome.summary}\n${s.outcome.checks.map((c) => `${c.ok ? 'ok ' : 'NO '} ${c.label}`).join('\n')}\n` +
    `trace:\n${s.trace.map((t) => `  w${t.week} ${t.text} <- ${t.because}`).join('\n')}`;
}
