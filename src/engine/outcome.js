// How a module ended, and why. The win (SPEC.md): the schedule met, the crew
// intact, and the module's problem solved at the root rather than tolerated or
// blown up. Some modules judge their problem differently (goal 'held': the floor
// held while you were away; goal 'standard': the standard survived the rush).
//
// The practice read covers only the module's own focus areas (one or two, from
// the catalogue in src/data/focus.data.js). It scores decisions against what
// the player knew when they made them, never against the hidden cause, and it
// gives no overall number: a single figure on a scale is what gets copied into
// a spreadsheet and compared across people (docs/REVIEW.md 2.5).

import { CONFIG as C } from '../data/config.data.js';
import { MODULES } from '../data/modules.data.js';
import { AREAS, READ } from '../data/focus.data.js';
import { say } from './text.js';
import { active, person } from './derive.js';

export function judge(s) {
  const module = MODULES[s.moduleId];
  const d = s.dept;
  const share = s.setup.scheduleShare ?? C.scheduleShare;
  const scheduleMet = d.shipped >= share * d.demanded;
  const onLeave = s.crew.filter((c) => c.status === 'leave');
  const kept = d.lost.length === 0 && onLeave.length === 0;
  const main = s.problems.filter((p) => p.main);
  let problemOk;
  let problemText;
  if (module.goal === 'held') {
    const firstAway = Math.min(...Object.keys(s.setup.meetings || { 99: 0 }).map(Number));
    const kev = person(s, 'kev');
    const brokeWhileAway = s.trace.some((t) => t.week >= firstAway);
    const buckled = s.problems.some((p) => p.source === 'away');
    problemOk = !brokeWhileAway && !buckled && active(kev);
    problemText = say(s, problemOk ? 'end.held.ok' : 'end.held.no');
  } else if (module.goal === 'standard') {
    problemOk = d.standard >= 0.6 && !d.lost.some((l) => l.why === 'injured');
    problemText = say(s, problemOk ? 'end.standard.ok' : 'end.standard.no', { n: Math.round(d.standard * 100) });
  } else {
    problemOk = main.length > 0 && main.every((p) => p.state === 'resolved' && p.settled);
    const p = main[0];
    problemText = p?.state === 'resolved' ? p.how : say(s, 'end.main.open', { p });
  }
  const checks = [
    { id: 'schedule', ok: scheduleMet, label: say(s, 'end.check.schedule', { n: Math.round(d.shipped), asked: Math.round(d.demanded) }) },
    { id: 'crew', ok: kept, label: kept ? say(s, 'end.check.crew.ok') : say(s, 'end.check.crew.no', { n: d.lost.length + onLeave.length }) },
    { id: 'problem', ok: problemOk, label: problemText },
    { id: 'you', ok: !d.bottleneck, label: say(s, d.bottleneck ? 'end.check.you.no' : 'end.check.you.ok') },
  ];
  if (d.starved) checks.unshift({ id: 'starved', ok: false, label: say(s, 'end.check.starved', { n: s.week - 1 }) });
  const win = checks.every((c) => c.ok);
  const carried = s.problems.filter((p) => !p.main && p.state !== 'resolved').map((p) => say(s, `carried.${p.type}`, { p }));
  return { win, checks, carried, profile: profile(s), summary: say(s, win ? 'end.win' : d.starved ? 'end.starved' : 'end.loss') };
}

/** One focus area's read from a list of decisions. Pure, shared with the path. */
export function readArea(decisions, area) {
  const mine = decisions.filter((d) => d.area === area);
  const n = mine.length;
  const earned = mine.reduce((a, d) => a + d.pts, 0);
  const ratio = n ? earned / (2 * n) : 0;
  const level = n >= READ.minDecisions ? READ.levels.find((l) => ratio >= l.min) : null;
  const byWeek = (x, y) => x.week - y.week;
  return {
    id: area, label: AREAS[area].label, about: AREAS[area].about, moves: AREAS[area].moves, n,
    read: level ? { id: level.id, label: level.label } : { id: 'thin', label: `${READ.thin} (${n} decision${n === 1 ? '' : 's'})` },
    made: mine.filter((d) => d.pts > 0).sort(byWeek).map((d) => ({ week: d.week, note: d.note })),
    missed: mine.filter((d) => d.pts < 0).sort(byWeek).map((d) => ({ week: d.week, note: d.note })),
  };
}

export function profile(s) {
  const focus = MODULES[s.moduleId].focus;
  const outside = [...new Set(s.decisions.map((d) => d.area))].filter((a) => AREAS[a] && !focus.includes(a));
  return {
    label: 'Practice, not assessment',
    focus: focus.map((a) => readArea(s.decisions, a)),
    // the floor does not stop for the module's topic: what else happened, unrated
    also: outside.map((a) => {
      const r = readArea(s.decisions, a);
      return { id: a, label: r.label, n: r.n, made: r.made.length, missed: r.missed.length, notes: [...r.missed, ...r.made].slice(0, 3) };
    }).sort((x, y) => y.n - x.n),
  };
}
