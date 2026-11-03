// The effect language for module cards: what a scripted or request option does,
// as data, so a module never needs new engine code unless it needs a new kind
// of problem (docs/DESIGN.md section 5). One function applies all of them.
//
//   { morale|trust|skill|stress: x, who: id | 'all' }      a person or the crew
//   { standard|bench|managerTrust|peerTrust|safetyDebt|escapeAdd: x }
//   { capacity: x }   bodies this week     { defects: x }   defects this week
//   { demand: x, inWeeks: n }               paint's ask, this week or later
//   { daysOut: n, who: id }                 { flag: 'name' } { unflag: 'name' }
//   { removeRoutine: id }                   someone else does it from now on
//   { line: 'text', kind }                  a line in Friday's report
//   { queue: { weeks, effects, line, trace }, because: 'text' }
//   { spawn: { type, who, seen } }
//   { chance: p, then: [...], else: [...] } { ifFlag: 'name', then, else }

import { clamp, person } from './derive.js';
import { fill } from './text.js';

const PEOPLE = ['morale', 'trust', 'skill', 'stress'];
const DEPT = ['standard', 'bench', 'managerTrust', 'peerTrust', 'safetyDebt', 'escapeAdd'];

export function applyEffects(K, effects, ctx = {}) {
  const s = K.s;
  for (const e of effects) {
    if (e.chance !== undefined) { applyEffects(K, K.r.outcomes.next() < e.chance ? e.then || [] : e.else || [], ctx); continue; }
    if (e.ifFlag !== undefined) { applyEffects(K, s.dept.flags[e.ifFlag] ? e.then || [] : e.else || [], ctx); continue; }
    for (const k of PEOPLE) {
      if (e[k] === undefined) continue;
      const targets = e.who === 'all' ? s.crew : [person(s, e.who)];
      for (const c of targets) if (c) c[k] = k === 'stress' ? Math.max(0, c[k] + e[k]) : clamp(c[k] + e[k]);
    }
    for (const k of DEPT) if (e[k] !== undefined) s.dept[k] = k === 'safetyDebt' || k === 'escapeAdd' ? Math.max(0, s.dept[k] + e[k]) : clamp(s.dept[k] + e[k]);
    if (e.capacity !== undefined) s.week_.capacity += e.capacity;
    if (e.defects !== undefined) s.week_.defects += e.defects;
    if (e.demand !== undefined) {
      if (!e.inWeeks) s.week_.demand += e.demand;
      else { s.setup.demand = s.setup.demand || {}; const w = s.week + e.inWeeks; s.setup.demand[w] = (s.setup.demand[w] ?? 6) + e.demand; }
    }
    if (e.daysOut !== undefined) { const c = person(s, e.who); if (c) c.daysOut += e.daysOut; }
    if (e.flag) s.dept.flags[e.flag] = true;
    if (e.unflag) delete s.dept.flags[e.unflag];
    if (e.removeRoutine && !s.dept.routineGone.includes(e.removeRoutine)) s.dept.routineGone.push(e.removeRoutine);
    if (e.line) K.lineRaw(e.kind || 'result', e.line, ctx);
    if (e.queue) s.queue.push({ week: s.week + (e.queue.weeks || 1), kind: 'effects', data: { effects: e.queue.effects || [], line: e.queue.line, trace: e.queue.trace }, because: { week: s.week, text: fill(s, e.because || '', ctx) } });
    if (e.spawn) K.spawn(e.spawn.type, e.spawn.who, { seen: !!e.spawn.seen, source: 'card' });
    // what you pushed off comes back as floor hours: { floorLoad: { label, hours, weeks, inWeeks } }
    if (e.floorLoad) { s.dept.floorExtra = s.dept.floorExtra || []; const from = s.week + (e.floorLoad.inWeeks ?? 1); s.dept.floorExtra.push({ label: e.floorLoad.label, hours: e.floorLoad.hours, from, until: from + (e.floorLoad.weeks || 1) - 1 }); }
  }
}
