// How a module ended, and why. The win (SPEC.md): the schedule met, the crew
// intact, and the module's problem solved at the root rather than tolerated or
// blown up. Some modules judge their problem differently (goal 'held': the floor
// held while you were away; goal 'standard': the standard survived the rush).
//
// The practice profile uses the LBA's own arithmetic (points earned over points
// possible, times 25, per domain; tier weights; the low-domain penalty) and is
// labelled practice. It scores decisions against what the player knew when
// they made them, never against the hidden cause.

import { CONFIG as C } from '../data/config.data.js';
import { MODULES } from '../data/modules.data.js';
import { SUBDOMAINS, DOMAINS, WEIGHTS, BANDS } from '../data/tags.data.js';
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

const MIN_DECISIONS = 3;

export function profile(s) {
  const by = {};
  for (const k of Object.keys(DOMAINS)) by[k] = { earned: 0, possible: 0, notes: [] };
  const subs = {};
  for (const dcs of s.decisions) {
    const sub = SUBDOMAINS[dcs.sub];
    if (!sub) continue;
    const dom = by[sub.domain];
    dom.earned += dcs.pts; dom.possible += 2;
    subs[dcs.sub] = subs[dcs.sub] || { earned: 0, possible: 0 };
    subs[dcs.sub].earned += dcs.pts; subs[dcs.sub].possible += 2;
    dom.notes.push({ pts: dcs.pts, note: dcs.note, week: dcs.week });
  }
  // A score from one or two decisions is noise that reads like a verdict (the
  // author on beta 1: "the score was only based on the 2 seen domains, making
  // it a false low score"). A domain scores only with MIN_DECISIONS behind it;
  // the overall only when every domain does.
  const domains = Object.entries(by).map(([k, v]) => {
    const n = v.possible / 2;
    const score = n >= MIN_DECISIONS ? Math.max(0, (v.earned / v.possible) * 25) : null;
    const evidence = [...v.notes].sort((a, b) => Math.abs(b.pts) - Math.abs(a.pts)).slice(0, 4).map((x) => ({ note: x.note, pts: x.pts, week: x.week }));
    return { id: k, label: DOMAINS[k].label, explain: DOMAINS[k].explain, score: score === null ? null : Math.round(score * 10) / 10, band: score === null ? `Not enough seen (${n} decision${n === 1 ? '' : 's'})` : BANDS.find((b) => score >= b.min).label, decisions: n, evidence };
  });
  const seen = domains.filter((d) => d.score !== null);
  let overall = null;
  const complete = seen.length === domains.length;
  if (complete) {
    const wsum = seen.reduce((a, d) => a + WEIGHTS[d.id], 0);
    overall = seen.reduce((a, d) => a + d.score * WEIGHTS[d.id], 0) / wsum * 4;
    const low = Math.min(...seen.map((d) => d.score));
    if (low < 4) overall *= 0.8; else if (low < 6) overall *= 0.85; else if (low < 8) overall *= 0.9;
    overall = Math.round(overall * 10) / 10;
  }
  const strengths = s.decisions.filter((d) => d.pts >= 2).map((d) => d.note);
  const gaps = s.decisions.filter((d) => d.pts < 0).map((d) => d.note);
  const count = (arr) => Object.entries(arr.reduce((m, n) => ((m[n] = (m[n] || 0) + 1), m), {})).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([note, n]) => ({ note, n }));
  return {
    domains, overall, complete, label: 'Practice, not assessment',
    why: complete ? '' : `No overall score: ${domains.filter((d) => d.score === null).map((d) => d.label).join(' and ')} did not have ${MIN_DECISIONS} decisions behind ${seen.length === 3 ? 'it' : 'them'} this run. A score from fewer would be noise.`,
    subdomains: Object.entries(subs).map(([k, v]) => ({ id: k, score: Math.round(Math.max(0, v.earned / v.possible) * 250) / 10, n: v.possible / 2 })).sort((a, b) => b.n - a.n),
    strengths: count(strengths), gaps: count(gaps),
  };
}
