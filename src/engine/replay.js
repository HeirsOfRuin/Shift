// Same month, other ways. The author, 2026-11-06: "I don't actually feel like
// it imparts any information." One answer (docs/REVIEW-loop.md, option C):
// at the end of a run, replay the player's exact month (the same seed, so the
// same hidden causes, the same people, the same luck) with the gate's own
// styles, and show what each way of working got and the moment it turned.
// The information is the comparison: what your instinct cost or bought,
// against the instincts you did not have, in the same situation.

import { newModule, advance } from './week.js';
import { decide } from './bots.js';
import { PROBLEMS } from '../data/problems.data.js';
import { say, hasText } from './text.js';

export const WAYS = [
  { policy: 'balanced', label: 'Read it first', how: 'Worked out who would tell you what, checked it another way, held the line meanwhile, and acted when it agreed.' },
  { policy: 'coach', label: 'Took people at their word', how: 'Asked, believed the first answer, and helped.' },
  { policy: 'documenter', label: 'Went by the book', how: 'Wrote it up, filed the order, followed the procedure.' },
  { policy: 'firefighter', label: 'Did it yourself', how: 'Took the quickest fix on every ticket and covered the gaps with your own hours.' },
  { policy: 'ignorer', label: 'Left it alone', how: 'Kept the standing week and let the floor be.' },
];

/** What the module's problem actually was, in a sentence, for the end screen. */
export function truthOf(run) {
  const p = run.problems.find((x) => x.main) || run.problems[0];
  if (!p) return null;
  const key = hasText(`${p.type}.short.${p.cause}`) ? `${p.type}.short.${p.cause}` : `know.${p.type}.${p.cause}`;
  return { type: p.type, label: PROBLEMS[p.type].label, text: say(run, key, { p }), short: key.includes('.short.') };
}

export function otherWays(run) {
  return WAYS.map((w) => {
    let s = newModule(run.moduleId, run.seed, run.seat || 'supervisor', { erp: run.roles?.erp?.name });
    while (!s.over) s = advance(s, decide(s, w.policy)).state;
    const turn = s.trace[0];
    return { ...w, win: s.outcome.win, summary: s.outcome.summary, turn: turn ? { week: turn.week, text: turn.text, because: turn.because } : null };
  });
}
