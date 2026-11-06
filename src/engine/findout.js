// How you find out. The author, 2026-11-06: "I don't actually feel like it
// imparts any information. It just feels like finding or following the right
// answer while attempting to keep under 40 hrs." Before this, finding out was
// one button that returned the cause, and the cause named the fix
// (docs/REVIEW-loop.md). Now a problem type with `find` in its data has three
// ways, each with its own reliability (docs/KILLGATE-ask.md):
//
//   ask      the person. The truth with a probability that rises with their
//            trust in you; otherwise the story people give a boss (`cover`,
//            drawn per run from the data's choices, so it is never a fixed tell).
//            Asking again gets the same answer until their trust has risen.
//   around   the people near it, one at a time, in order. Each knows the
//            cause with its own probability; some have a view (`bias`, drawn
//            per run from the data's choices like the cover). The
//            person hears you went round them some of the time.
//   look     the evidence. Rules out wrong causes; never names the right one.
//
// What each way returned is shown as what it is: what they said, what someone
// else said, what the evidence rules out. Nothing on the ticket says which is
// true. Pure: every draw from the kernel's streams.

import { PROBLEMS } from '../data/problems.data.js';
import { CAST } from '../data/crew.data.js';
import { say } from './text.js';

export const bandOf = (s, p) => { const f = PROBLEMS[p.type].find; const c = whoIs(s, p, f?.ask?.who); return f.ask?.band === false ? 'opinion' : c ? BAND(trustOf(p, c)) : null; };

/** A fix aimed at a reason that was not the reason: the person can tell you
 *  acted without understanding them, tells you less next time, and the thing
 *  itself gets worse once. */
export function misread(K, p, severityBefore = p.severity) {
  const f = PROBLEMS[p.type].find;
  if (!f || f.ask?.band === false) return;
  const c = whoIs(K.s, p, f.ask?.who);
  if (c) setTrust(K, p, c, trustOf(p, c) - 0.05);
  // and it does not just fail: the first time, it makes the real thing worse
  // (unless the type's own consequence already made it worse this week)
  if (!p.misread && p.severity === severityBefore) { p.misread = true; p.severity = Math.min(3, p.severity + 1); }
}
export const BAND = (t) => (t >= 0.65 ? 'trusts' : t >= 0.45 ? 'doubt' : 'wary');

/** The person a "who" in the data names: an id, 'self' (the problem's person),
 *  or 'senior' (Kev beside the supervisor, Lyle beside the lead hand). Someone
 *  from the cast (Theresa, Jess, Val) is not on the crew: their trust in you
 *  for this problem lives on the problem. */
export function whoIs(s, p, who) {
  const id = who === 'self' || !who ? p.who[0] : who === 'senior' ? (s.seat === 'lead' ? 'lyle' : 'kev') : who;
  if (!id) return null;
  const c = s.crew.find((x) => x.id === id);
  if (c) return c.status === 'active' ? c : null;
  return CAST[id] ? { ...CAST[id], id, cast: true } : null;
}
/** Anyone named in a finding, for the words on the ticket, whether or not they are still here. */
const anyone = (s, id) => s.crew.find((x) => x.id === id) || (CAST[id] ? { ...CAST[id], id, cast: true } : null);
const trustOf = (p, c) => (c.cast ? p.srcTrust ?? 0.5 : c.trust);
const setTrust = (K, p, c, x) => { if (c.cast) p.srcTrust = K.clamp(x); else c.trust = K.clamp(x); };

const pickOf = (r, xs) => xs[Math.floor(r.next() * xs.length)];
/** The easy story this person gives, and the view each bystander holds, for
 *  this problem in this run: drawn once, so who lies about what cannot be
 *  memorised across replays (the author's beta 17 note, docs/KILLGATE-ask.md). */
export const coverOf = (p) => { const c = p.cover ?? PROBLEMS[p.type].find?.ask?.cover; return Array.isArray(c) ? c[0] : c; };
const viewOf = (p, x) => (p.views && x.who in p.views ? p.views[x.who] : Array.isArray(x.bias) ? x.bias[0] : x.bias);

/** Draw the person's trust in you for this run, so how to ask is a reading,
 *  not a rule; and the cover story and the bystanders' views. Called once,
 *  when the problem is made. */
export function drawTrust(s, p, r) {
  const f = PROBLEMS[p.type].find;
  if (!f) return;
  // any reason but the true one can be someone's easy story, equally likely; a bystander's view
  // can be any reason at all, the truth included. A weighted draw (the typical stories twice as
  // likely) was tried first: remembering the typical ones was worth 16 to 21 points to a bot
  // that knew nothing else (docs/KILLGATE-ask.md, beta 17). The data's `cover` and `bias` are
  // now what a player of betas 15 and 16 would have learned; the memoriser bot remembers them.
  const causes = Object.keys(PROBLEMS[p.type].causes);
  p.cover = pickOf(r, causes.filter((c) => c !== p.cause));
  p.views = Object.fromEntries((f.around?.from || []).filter((x) => x.bias).map((x) => [x.who, pickOf(r, causes)]));
  if (!f.trust) return;
  const c = whoIs(s, p, f.ask?.who);
  const t = f.trust[0] + (f.trust[1] - f.trust[0]) * r.next();
  if (c?.cast) p.srcTrust = t; else if (c) c.trust = t;
}

/** The causes the evidence has not ruled out. */
export const candidates = (p) => Object.keys(PROBLEMS[p.type].causes).filter((c) => !p.ruledOut.includes(c));

/** What the evidence in hand supports, or null: the one cause left, or a cause
 *  two sources name. The person's own account counts twice when they trust
 *  you and once when they don't: since beta 17 the easy story changes from run
 *  to run, so no account is known to be the cover. An opinion counts once. */
export function supported(p) {
  const f = PROBLEMS[p.type].find;
  if (!f) return p.told;
  const left = candidates(p);
  if (left.length === 1) return left[0];
  const votes = {};
  for (const x of p.findings || []) {
    if (!x.says || !left.includes(x.says) || x.repeat) continue;
    // an opinion (someone asked where the problem is, not why they do something) counts once
    const w = x.way === 'ask' && f.ask.band !== false && x.band === 'trusts' ? 2 : 1;
    votes[x.says] = (votes[x.says] || 0) + w;
  }
  const best = Object.entries(votes).sort((a, b) => b[1] - a[1])[0];
  return best && best[1] >= 2 ? best[0] : null;
}

/** How many people near it you have not asked yet. When none, the ticket stops offering it. */
export function aroundLeft(s, p) {
  const f = PROBLEMS[p.type].find;
  if (!f?.around) return 0;
  const subject = whoIs(s, p, f.ask?.who);
  const used = (p.findings || []).filter((x) => x.way === 'around').map((x) => x.who);
  const skip = new Set([...p.who, subject?.id, ...used]);
  return f.around.from.filter((x) => { const c = whoIs(s, p, x.who); return c && !skip.has(c.id); }).length;
}

/** The likeliest reason on what is in hand, even when nothing agrees yet:
 *  for a player who has to act before the evidence is complete. */
export function bestGuess(p) {
  const f = PROBLEMS[p.type].find;
  const left = candidates(p);
  const votes = Object.fromEntries(left.map((c) => [c, 0]));
  for (const x of p.findings || []) if (x.says && x.says in votes && !x.repeat) votes[x.says] += x.way === 'ask' && f.ask.band !== false && x.band !== 'trusts' ? 0.5 : 1;
  const pref = (c) => (c === PROBLEMS[p.type].passing ? 0.2 : 0);
  return left.sort((a, b) => votes[b] - votes[a] || pref(a) - pref(b))[0] || null;
}

/** One way of finding out, this week. */
export function findOut(K, p, way) {
  const s = K.s;
  const f = PROBLEMS[p.type].find;
  const subject = whoIs(s, p, f.ask?.who);
  p.findings = p.findings || [];
  const v = { p };
  if (way === 'ask') {
    const src = subject;
    if (!src) { K.line('result', 'find.ask.away', v); return; }
    const t = trustOf(p, src);
    const before = p.findings.filter((x) => x.way === 'ask' && !x.repeat).at(-1);
    if (before && t < before.trust + 0.15) {
      p.findings.push({ way: 'ask', who: src.id, says: before.says, band: BAND(t), trust: t, repeat: true, week: s.week });
      K.line('told', 'find.ask.same', { ...v, src });
      return;
    }
    const [base, k] = f.ask.truth[p.cause] || [1, 0];
    const truth = K.r.outcomes.next() < base + k * t;
    const says = truth ? p.cause : (coverOf(p) ?? p.cause);
    p.findings.push({ way: 'ask', who: src.id, says, band: BAND(t), trust: t, week: s.week });
    setTrust(K, p, src, t + 0.05);
    p.told = says;
    // the type's own told lines are written as what this person says; otherwise one shared line
    if (f.ask.told) K.line('told', `${p.type}.told.${says}`, v);
    else K.line('told', 'find.said', { ...v, src, what: say(s, `${p.type}.short.${says}`, v) });
    return;
  }
  if (way === 'around') {
    const used = p.findings.filter((x) => x.way === 'around').map((x) => x.who);
    const skip = new Set([...p.who, subject?.id, ...used]);
    const from = f.around.from.map((x) => ({ ...x, c: whoIs(s, p, x.who) })).find((x) => x.c && !skip.has(x.c.id));
    if (!from) { p.findings.push({ way: 'around', who: null, says: null, week: s.week }); K.line('result', 'find.around.nobody', v); return; }
    const q = K.r.outcomes.next();
    const view = viewOf(p, from);
    const says = q < (from.truth[p.cause] ?? 0) ? p.cause : view && K.r.outcomes.next() < (from.biasP ?? 0.5) ? view : null;
    p.findings.push({ way: 'around', who: from.c.id, says, week: s.week });
    if (says) { p.told = says; K.line('told', 'find.heard', { ...v, src: from.c, what: say(s, `${p.type}.short.${says}`, v) }); }
    else K.line('told', 'find.heard.none', { ...v, src: from.c });
    if (subject && !subject.cast && p.who.includes(subject.id) && K.r.outcomes.next() < (f.around.noticed ?? 0.3)) { setTrust(K, p, subject, subject.trust - 0.08); K.line('consequence', 'find.around.noticed', { ...v, src: subject }); }
    return;
  }
  if (way === 'look') {
    // the evidence is what it is: looking at it a second time shows nothing new
    if (p.findings.some((x) => x.way === 'look')) { p.findings.push({ way: 'look', rules: [], week: s.week }); K.line('told', 'find.look.nothing', v); return; }
    const wrong = Object.keys(PROBLEMS[p.type].causes).filter((c) => c !== p.cause && !p.ruledOut.includes(c));
    const n = Math.min(f.look?.rules ?? 1, wrong.length);
    const out = [];
    for (let i = 0; i < n; i++) out.push(wrong.splice(Math.floor(K.r.outcomes.next() * wrong.length), 1)[0]);
    p.findings.push({ way: 'look', rules: out, week: s.week });
    p.ruledOut.push(...out);
    if (!out.length) K.line('told', 'find.look.nothing', v);
    for (const c of out) K.line('told', `${p.type}.not.${c}`, v);
  }
}

/** The ticket's "what you know", for a type that finds out: the person's trust
 *  as you can read it, then each finding as what it is. */
export function knowLines(s, p) {
  const f = PROBLEMS[p.type].find;
  const v = { p };
  const out = [];
  const subject = whoIs(s, p, f.ask?.who);
  if (subject && f.ask?.band !== false) out.push(say(s, `find.band.${BAND(trustOf(p, subject))}`, { ...v, src: subject }));
  for (const x of p.findings || []) {
    if (x.way === 'ask' && !x.repeat) out.push(say(s, 'find.know.said', { ...v, src: anyone(s, x.who), what: say(s, `${p.type}.short.${x.says}`, v) }));
    if (x.way === 'around' && x.who) out.push(say(s, x.says ? 'find.know.heard' : 'find.know.heardNone', { ...v, src: anyone(s, x.who), what: x.says ? say(s, `${p.type}.short.${x.says}`, v) : '' }));
    if (x.way === 'look') for (const c of x.rules) out.push(say(s, `${p.type}.not.${c}`, v));
  }
  return out;
}
