// Monday's inbox. Built once per week from state, so the cards (and their text)
// are part of the save and cannot change if the page reloads.
//
// Order: the problems you know about (the module's main problem first), the
// module's own cards for this week, a few requests, your standing week
// (routine), an hour with someone, weld coverage, the floor walk. The problem
// comes first because it is what the week is about (the beta's first look:
// six routine items above it pushed it off the screen). Every option
// says what it costs; "leave it" is always there and costs nothing now.

import { CONFIG as C } from '../data/config.data.js';
import { PROBLEMS } from '../data/problems.data.js';
import { streamFor } from './rng.js';
import { say, fill } from './text.js';
import { active } from './derive.js';

export function buildCards(s, module) {
  const cards = [];
  const routine = ({
    id: 'routine', kind: 'routine', title: say(s, 'card.routine.title'), body: say(s, 'card.routine.body'),
    items: C.routine.filter((it) => !s.dept.routineGone.includes(it.id)).map((it) => ({ id: it.id, label: it.label, hours: it.hours, why: it.why })),
    gone: s.dept.routineGone.map((id) => C.routine.find((it) => it.id === id)?.label).filter(Boolean),
    options: [], pick: null,
  });

  const open = s.problems.filter((p) => p.seen && p.state === 'active').sort((a, b) => (b.main - a.main) || (a.id - b.id));
  for (const p of open) cards.push(problemCard(s, p));

  for (const def of module.cards || []) {
    if (def.week !== s.week) continue;
    if (def.ifFlag && !s.dept.flags[def.ifFlag]) continue;
    if (def.unlessFlag && s.dept.flags[def.unlessFlag]) continue;
    cards.push(scriptCard(s, def));
  }

  if (module.pool && !s.monday.away) {
    const r = streamFor(s.seed, s.week, 'requests');
    const [lo, hi] = module.pool.perWeek;
    const n = r.range(lo, hi);
    const avail = module.pool.cards.filter((c) => !s.dept.usedCards.includes(c.id) && (!c.from || s.week >= c.from) && (!c.to || s.week <= c.to));
    for (let i = 0; i < n && avail.length; i++) {
      const def = avail.splice(r.int(avail.length), 1)[0];
      s.dept.usedCards.push(def.id);
      cards.push(scriptCard(s, def));
    }
  }

  cards.push(routine);

  if (!s.monday.away) {
    const learners = s.crew.filter((c) => active(c) && !c.lead && c.skill < 0.75);
    if (learners.length) {
      cards.push({
        id: 'coach', kind: 'coach', title: say(s, 'card.coach.title'), body: say(s, 'card.coach.body'),
        options: [{ id: 'none', label: say(s, 'card.coach.none'), hours: 0, kind: 'leave' },
          ...learners.map((c) => ({ id: c.id, label: fill(s, 'An hour with {c}', { c }), hours: 1, kind: 'coach' }))],
        pick: 'none',
      });
    }
    cards.push({
      id: 'cover', kind: 'cover', title: say(s, 'card.cover.title'),
      body: say(s, s.monday.forecast >= s.monday.demand ? 'card.cover.body.enough' : 'card.cover.body.short', { weld: s.monday.forecast, demand: s.monday.demand }),
      options: [0, 1, 2, 3].slice(0, C.coverMax + 1).map((d) => ({ id: `d${d}`, days: d, label: say(s, `card.cover.d${d}`), hours: d * 8, kind: d ? 'cover' : 'leave' })),
      pick: 'd0',
    });
    cards.push({
      id: 'walk', kind: 'walk', title: say(s, 'card.walk.title'), body: say(s, 'card.walk.body'),
      options: [{ id: 'no', label: say(s, 'card.walk.no'), hours: 0, kind: 'leave' }, { id: 'walk', label: say(s, 'card.walk.yes'), hours: C.walkHours, kind: 'walk' }],
      pick: 'no',
    });
  }
  return cards;
}

function problemCard(s, p) {
  const def = PROBLEMS[p.type];
  const fresh = p.seenWeek === s.week;
  const know = [];
  if (p.told) know.push(say(s, `know.${p.type}.${p.told}`, { p }));
  for (const id of p.tried) {
    if (p.fails[id]) know.push(fill(s, `Tried: ${def.actions[id].label.charAt(0).toLowerCase()}${def.actions[id].label.slice(1)}. It has not held.`, { p }));
  }
  if (p.ruledOut.length) know.push(say(s, `know.${p.type}.ruledOut`, { p, n: p.ruledOut.length }));
  return {
    id: `p${p.id}`, kind: 'problem', problem: p.id, type: p.type, main: p.main, who: p.who,
    title: say(s, `card.${p.type}.title`, { p }),
    body: say(s, `card.${p.type}.body.${fresh ? 'new' : p.severity >= 2 ? 'worse' : 'open'}`, { p }),
    know,
    weeks: s.week - (p.seenWeek ?? s.week),
    told: p.told, tried: [...p.tried], failed: Object.keys(p.fails), failedTwice: Object.keys(p.fails).filter((k) => p.fails[k] >= 2),
    sessions: p.sessions, ruledOut: [...p.ruledOut], waiting: !!(p.order || p.russDue || p.engDue || p.aroundDue),
    options: [
      ...Object.entries(def.actions).map(([id, a]) => ({ id, label: fill(s, a.label, { p }), hours: a.hours, kind: a.kind, fits: a.fits || [] })),
      { id: 'leave', label: say(s, `option.leave.${fresh ? 'new' : 'open'}`), hours: 0, kind: 'leave', fits: [] },
    ],
    pick: 'leave',
  };
}

function scriptCard(s, def) {
  const vars = { c: def.who ? s.crew.find((c) => c.id === def.who) : undefined };
  return {
    id: `m${def.id}`, kind: 'script', cue: def.cue || 'plain', who: def.who ? [def.who] : [],
    title: fill(s, def.title, vars), body: fill(s, def.body, vars), know: [],
    options: def.options.map((o) => ({ id: o.id, label: fill(s, o.label, vars), hours: o.hours || 0, kind: o.kind || 'do', effects: o.effects || [], score: o.score || [] })),
    pick: def.pick || def.options[def.options.length - 1].id,
  };
}
