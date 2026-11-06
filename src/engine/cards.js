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
import { say, fill, hasText } from './text.js';
import { active, routineFor } from './derive.js';
import { knowLines, supported, candidates, BAND, whoIs } from './findout.js';

export function buildCards(s, module) {
  const cards = [];
  const routine = ({
    id: 'routine', kind: 'routine', title: say(s, 'card.routine.title'), body: say(s, 'card.routine.body'),
    items: routineFor(s).map((it) => ({ id: it.id, label: it.label, hours: it.hours, why: it.why })),
    gone: s.dept.routineGone.map((id) => C.routine.find((it) => it.id === id)?.label).filter(Boolean),
    options: [], pick: null,
  });

  const open = s.problems.filter((p) => p.seen && p.state === 'active').sort((a, b) => (b.main - a.main) || (a.id - b.id));
  for (const p of open) cards.push(problemCard(s, p));

  const seat = s.seat || 'supervisor';
  const forSeat = (def) => (def.seats || ['supervisor', 'lead']).includes(seat);
  const manager = seat === 'manager';
  for (const def of module.cards || []) {
    if (def.week !== s.week || !forSeat(def)) continue;
    if (def.ifFlag && !s.dept.flags[def.ifFlag]) continue;
    if (def.unlessFlag && s.dept.flags[def.unlessFlag]) continue;
    cards.push(scriptCard(s, def));
  }

  if (module.pool && !s.monday.away) {
    const r = streamFor(s.seed, s.week, 'requests');
    const [lo, hi] = module.pool.perWeek;
    const n = r.range(lo, hi);
    const avail = module.pool.cards.filter((c) => forSeat(c) && !s.dept.usedCards.includes(c.id) && (!c.from || s.week >= c.from) && (!c.to || s.week <= c.to));
    for (let i = 0; i < n && avail.length; i++) {
      const def = avail.splice(r.int(avail.length), 1)[0];
      s.dept.usedCards.push(def.id);
      cards.push(scriptCard(s, def));
    }
  }

  cards.push(routine);

  if (!s.monday.away) {
    const learners = manager ? [] : s.crew.filter((c) => active(c) && !c.lead && c.skill < 0.75);
    if (learners.length) {
      cards.push({
        id: 'coach', kind: 'coach', title: say(s, 'card.coach.title'), body: say(s, 'card.coach.body'),
        options: [{ id: 'none', label: say(s, 'card.coach.none'), hours: 0, kind: 'leave' },
          ...learners.map((c) => ({ id: c.id, label: fill(s, 'An hour with {c}', { c }), hours: 1, kind: 'coach' }))],
        pick: 'none',
      });
    }
    if (!manager) cards.push({
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
  if (p.told && !(def.find && s.seat !== 'manager')) know.push(say(s, `know.${p.type}.${p.told}`, { p }));
  for (const id of p.tried) {
    if (p.fails[id]) know.push(fill(s, `Tried: ${def.actions[id].label.charAt(0).toLowerCase()}${def.actions[id].label.slice(1)}. It has not held.`, { p }));
  }
  if (p.ruledOut.length) know.push(say(s, `know.${p.type}.ruledOut`, { p, n: p.ruledOut.length }));
  if (s.seat === 'manager') {
    // the manager's four moves on anything that reaches her through Kev
    if (p.plan) know.push(say(s, { his: 'know.mgr.planHis', yours: 'know.mgr.planYours', guess: 'know.mgr.planGuess', hisGuess: 'know.mgr.planHisGuess' }[p.plan], { p }));
    return {
      id: `p${p.id}`, kind: 'problem', problem: p.id, type: p.type, main: p.main, who: p.who,
      title: say(s, `card.${p.type}.title`, { p }),
      body: fresh && hasText(`card.${p.type}.body.manager`) ? say(s, `card.${p.type}.body.manager`, { p }) : say(s, `card.${p.type}.body.${fresh ? 'new' : p.severity >= 2 ? 'worse' : 'open'}`, { p }),
      know, weeks: s.week - (p.seenWeek ?? s.week),
      told: p.told, plan: p.plan || null, cap: s.dept.supCap, tried: [...p.tried], failed: Object.keys(p.fails), failedTwice: [], sessions: p.sessions, ruledOut: [...p.ruledOut], waiting: false,
      options: [
        { id: 'coach', label: say(s, p.told ? (p.plan ? 'option.mgr.coach.again' : 'option.mgr.coach.plan') : 'option.mgr.coach'), hours: 1, kind: 'ask', fits: [] },
        { id: 'direct', label: say(s, 'option.mgr.direct'), hours: 0.5, kind: 'direct', fits: [] },
        { id: 'rescue', label: say(s, 'option.mgr.rescue'), hours: 2.5, kind: 'yourself', fits: [] },
        { id: 'leave', label: say(s, 'option.mgr.leave'), hours: 0, kind: 'leave', fits: [] },
      ],
      pick: 'leave',
    };
  }
  // a type that finds out: the ticket's two rows, find out and do
  const finds = !!def.find;
  const subject = finds ? whoIs(s, p, def.find.ask?.who) : null;
  const find = finds ? {
    options: [{ id: 'none', label: say(s, 'find.none'), hours: 0, kind: 'leave', way: null },
      ...Object.entries(def.actions).filter(([, a]) => a.way).map(([id, a]) => ({ id, label: fill(s, a.label, { p }), hours: a.hours, kind: 'ask', way: a.way }))],
    pick: 'none',
  } : null;
  return {
    id: `p${p.id}`, kind: 'problem', problem: p.id, type: p.type, main: p.main, who: p.who,
    title: say(s, `card.${p.type}.title`, { p }),
    body: say(s, `card.${p.type}.body.${fresh ? 'new' : p.severity >= 2 ? 'worse' : 'open'}`, { p }),
    know: finds ? [...knowLines(s, p), ...know.filter((k) => k !== say(s, `know.${p.type}.ruledOut`, { p, n: p.ruledOut.length }))] : know,
    find,
    findings: finds ? (p.findings || []).map((x) => ({ ...x })) : null,
    band: subject ? BAND(subject.trust) : null,
    supported: finds ? supported(p) : null,
    candidates: finds ? candidates(p) : null,
    holdId: finds ? Object.entries(def.actions).find(([, a]) => a.holds)?.[0] || null : null,
    passing: finds ? def.passing : null,
    cover: finds ? def.find.ask?.cover || null : null,
    weeks: s.week - (p.seenWeek ?? s.week),
    told: p.told, tried: [...p.tried], failed: Object.keys(p.fails), failedTwice: Object.keys(p.fails).filter((k) => p.fails[k] >= 2),
    sessions: p.sessions, ruledOut: [...p.ruledOut], waiting: !!(p.order || p.russDue || p.engDue || p.aroundDue), pending: !!p.pending,
    lean: s.dept.lean === null || s.dept.lean === undefined ? null : { owner: !!s.dept.leanOwner, audit: !!s.dept.flags?.leanAudit, with: !!s.dept.leanWith },
    flow: s.dept.flow ? { ...s.dept.flow, held: p.held || 0, changedAgo: p.changedAt ? s.week - p.changedAt : null } : null,
    options: [
      ...Object.entries(def.actions).filter(([, a]) => !(s.seat === 'lead' && a.needs) && !(finds && a.way)).map(([id, a]) => ({ id, label: fill(s, a.label, { p }), hours: a.hours, kind: a.kind, fits: a.fits || [] })),
      // a lead hand's one move for what needs the supervisor's signature
      ...(s.seat === 'lead' && Object.values(def.actions).some((a) => a.needs) ? [{ id: 'takeUp', label: say(s, p.upDue ? 'option.takeUp.waiting' : 'option.takeUp'), hours: 0.5, kind: 'up', fits: [] }] : []),
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
    options: def.options.map((o) => (s.seat === 'lead' && o.needs
      // what needs a signature becomes a request to the supervisor, who usually says yes
      ? { id: o.id, label: fill(s, `Ask {sup}: ${o.label.charAt(0).toLowerCase()}${o.label.slice(1)}`, vars), hours: 0.5, kind: 'up', effects: [{ chance: 0.7, then: o.effects || [], else: [{ line: say(s, 'lead.ask.no') }] }], score: [...(o.score || []), ['E1', 1, `Asked ${s.roles.sup.name} for what needed a signature`]] }
      // a lead hand who holds the line on a shortcut pays for it with the crew: they eat lunch with these people
      : s.seat === 'lead' && def.cue === 'shortcut' && o.kind === 'hold'
        ? { id: o.id, label: fill(s, o.label, vars), hours: o.hours || 0, kind: 'hold', effects: [...(o.effects || []), { morale: -0.012, who: 'all' }, { ifFlag: 'leadHeld', then: [], else: [{ flag: 'leadHeld' }, { line: say(s, 'lead.hold.cost') }] }], score: o.score || [] }
        : { id: o.id, label: fill(s, o.label, vars), hours: o.hours || 0, kind: o.kind || 'do', effects: o.effects || [], score: o.score || [] })),
    pick: def.pick || def.options[def.options.length - 1].id,
  };
}
