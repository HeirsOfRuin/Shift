// The moment that decided it. The author, 2026-11-06, choosing the next
// steps: "Do 1, then 4 and 2." Step 2: the end screen showed what the cause was
// and what other approaches got, but not where the player's own reading went
// wrong. This finds that moment from what was in hand when they acted (the
// acts recorded in week.js) and says it in one line: the week, what they did,
// what they had, and what it was. Pure; reads only the finished run.

import { PROBLEMS } from '../data/problems.data.js';
import { CAST } from '../data/crew.data.js';
import { say, fill } from './text.js';

const nameOf = (s, id) => s.crew.find((c) => c.id === id)?.name || CAST[id]?.name || id;
const bandWord = { trusts: 'trusted you', doubt: 'gave you the benefit of the doubt', wary: 'was wary of you' };

/** The kinds, worst first: what a coach would want to talk about. */
export const KINDS = ['blind', 'patched', 'against', 'oneWary', 'guessed', 'passed', 'never', 'checkedWrong', 'lucky', 'guessedRight', 'settled', 'checked'];

export function momentOf(run) {
  const p = run.problems.find((x) => x.main && PROBLEMS[x.type].find) || run.problems.find((x) => PROBLEMS[x.type].find && x.seen);
  if (!p) return null;
  const def = PROBLEMS[p.type];
  const v = { p };
  const truth = say(run, `${p.type}.short.${p.cause}`, v);
  const label = (id) => { const t = def.actions[id]?.label || id; return t.charAt(0).toLowerCase() + t.slice(1); };
  const did = (a) => (run.seat === 'lead' && def.actions[a.id]?.needs ? `take it to ${run.roles?.sup?.name || 'the supervisor'}` : fill(run, label(a.id), v));
  const out = (kind, vars) => ({ kind, week: vars.w ?? null, text: say(run, `moment.${kind}`, { ...v, truth, ...vars }) });
  const acts = p.acts || [];
  // patching it yourself, again and again, without a reason: the firefighter's moment
  const patches = acts.filter((a) => !a.fits.length);
  if (patches.length >= 2 && !acts.some((a) => a.fits.length && a.right)) return out('patched', { w: patches[0].week, n: patches.length, what: did(patches[0]) });
  const real = acts.filter((a) => a.fits.length);
  const first = real.find((a) => !a.right) || real[0];
  if (!first) {
    const f = p.findings || [];
    if (p.state === 'resolved') return out('settled', { w: p.resolvedWeek ?? run.history.length });
    if (f.some((x) => x.says === def.passing)) return out('passed', { w: f.find((x) => x.says === def.passing).week });
    return out('never', { w: run.history.length, n: f.length });
  }
  const sources = first.findings.filter((x) => x.says && !x.repeat);
  const looked = first.findings.find((x) => x.way === 'look' && x.rules.length);
  const ask = sources.filter((x) => x.way === 'ask').at(-1);
  const w = first.week;
  const what = did(first);
  if (!first.findings.length) return out('blind', { w, what });
  const ruled = first.fits.find((c) => first.ruledOut.includes(c));
  if (ruled) return out('against', { w, what, evidence: looked ? def.find.look?.name || 'the evidence' : say(run, 'moment.failedFix', v) });
  const n = sources.length + (looked ? 1 : 0);
  if (first.sup && first.fits.includes(first.sup)) return out(first.right ? 'checked' : 'checkedWrong', { w, what, n });
  if (n <= 1 && sources.length) { const x = sources[0]; return out(first.right ? 'lucky' : 'oneWary', { w, what, src: nameOf(run, x.who), band: x.way === 'ask' ? bandWord[x.band] || bandWord.doubt : 'had a view of their own' }); }
  return out(first.right ? 'guessedRight' : 'guessed', { w, what, n });
}
