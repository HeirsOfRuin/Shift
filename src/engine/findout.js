// How you find out. The author, 2026-11-06: "I don't actually feel like it
// imparts any information. It just feels like finding or following the right
// answer while attempting to keep under 40 hrs." Before this, finding out was
// one button that returned the cause, and the cause named the fix
// (docs/REVIEW-loop.md). Now a problem type with `find` in its data has three
// ways, each with its own reliability (docs/KILLGATE-ask.md):
//
//   ask      the person. The truth with a probability that rises with their
//            trust in you; otherwise the story people give a boss (`cover`).
//            Asking again gets the same answer until their trust has risen.
//   around   the people near it, one at a time, in order. Each knows the
//            cause with its own probability; some have a view (`bias`). The
//            person hears you went round them some of the time.
//   look     the evidence. Rules out wrong causes; never names the right one.
//
// What each way returned is shown as what it is: what they said, what someone
// else said, what the evidence rules out. Nothing on the ticket says which is
// true. Pure: every draw from the kernel's streams.

import { PROBLEMS } from '../data/problems.data.js';
import { say } from './text.js';

export const BAND = (t) => (t >= 0.65 ? 'trusts' : t >= 0.45 ? 'doubt' : 'wary');

/** The person a "who" in the data names: an id, 'self' (the problem's person),
 *  or 'senior' (Kev beside the supervisor, Lyle beside the lead hand). */
export function whoIs(s, p, who) {
  const id = who === 'self' || !who ? p.who[0] : who === 'senior' ? (s.seat === 'lead' ? 'lyle' : 'kev') : who;
  return s.crew.find((c) => c.id === id && c.status === 'active') || null;
}

/** Draw the person's trust in you for this run, so how to ask is a reading,
 *  not a rule. Called once, when the problem is made. */
export function drawTrust(s, p, r) {
  const f = PROBLEMS[p.type].find;
  if (!f?.trust) return;
  const c = s.crew.find((x) => x.id === (f.ask?.who && f.ask.who !== 'self' ? f.ask.who : p.who[0]));
  if (c) c.trust = f.trust[0] + (f.trust[1] - f.trust[0]) * r.next();
}

/** The causes the evidence has not ruled out. */
export const candidates = (p) => Object.keys(PROBLEMS[p.type].causes).filter((c) => !p.ruledOut.includes(c));

/** What the evidence in hand supports, or null: the one cause left, or a cause
 *  two sources name. An admission from the person counts twice (nobody invents
 *  the embarrassing reason); the cover story from someone wary counts once. */
export function supported(p) {
  const f = PROBLEMS[p.type].find;
  if (!f) return p.told;
  const left = candidates(p);
  if (left.length === 1) return left[0];
  const votes = {};
  for (const x of p.findings || []) {
    if (!x.says || !left.includes(x.says) || x.repeat) continue;
    const w = x.way === 'ask' ? (x.band === 'trusts' || x.says !== f.ask.cover ? 2 : 1) : 1;
    votes[x.says] = (votes[x.says] || 0) + w;
  }
  const best = Object.entries(votes).sort((a, b) => b[1] - a[1])[0];
  return best && best[1] >= 2 ? best[0] : null;
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
    const before = p.findings.filter((x) => x.way === 'ask' && !x.repeat).at(-1);
    if (before && src.trust < before.trust + 0.15) {
      p.findings.push({ way: 'ask', who: src.id, says: before.says, band: BAND(src.trust), trust: src.trust, repeat: true, week: s.week });
      K.line('told', 'find.ask.same', { ...v, src });
      return;
    }
    const [base, k] = f.ask.truth[p.cause] || [1, 0];
    const truth = K.r.outcomes.next() < base + k * src.trust;
    const says = truth ? p.cause : (f.ask.cover ?? p.cause);
    p.findings.push({ way: 'ask', who: src.id, says, band: BAND(src.trust), trust: src.trust, week: s.week });
    src.trust = K.clamp(src.trust + 0.05);
    p.told = says;
    K.line('told', `${p.type}.told.${says}`, v);
    return;
  }
  if (way === 'around') {
    const used = p.findings.filter((x) => x.way === 'around').length;
    const from = f.around.from.slice(used).map((x) => ({ ...x, c: whoIs(s, p, x.who) })).find((x) => x.c);
    if (!from) { p.findings.push({ way: 'around', who: null, says: null, week: s.week }); K.line('result', 'find.around.nobody', v); return; }
    const q = K.r.outcomes.next();
    const says = q < (from.truth[p.cause] ?? 0) ? p.cause : from.bias && K.r.outcomes.next() < (from.biasP ?? 0.5) ? from.bias : null;
    p.findings.push({ way: 'around', who: from.c.id, says, week: s.week });
    if (says) { p.told = says; K.line('told', 'find.heard', { ...v, src: from.c, what: say(s, `${p.type}.short.${says}`, v) }); }
    else K.line('told', 'find.heard.none', { ...v, src: from.c });
    if (subject && K.r.outcomes.next() < (f.around.noticed ?? 0.3)) { subject.trust = K.clamp(subject.trust - 0.08); K.line('consequence', 'find.around.noticed', { ...v, src: subject }); }
    return;
  }
  if (way === 'look') {
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
  if (subject) out.push(say(s, `find.band.${BAND(subject.trust)}`, { ...v, src: subject }));
  for (const x of p.findings || []) {
    if (x.way === 'ask' && !x.repeat) out.push(say(s, 'find.know.said', { ...v, src: s.crew.find((c) => c.id === x.who) || subject, what: say(s, `${p.type}.short.${x.says}`, v) }));
    if (x.way === 'around' && x.who) out.push(say(s, x.says ? 'find.know.heard' : 'find.know.heardNone', { ...v, src: s.crew.find((c) => c.id === x.who), what: x.says ? say(s, `${p.type}.short.${x.says}`, v) : '' }));
    if (x.way === 'look') for (const c of x.rules) out.push(say(s, `${p.type}.not.${c}`, v));
  }
  return out;
}
