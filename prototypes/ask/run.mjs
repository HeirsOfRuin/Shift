// The "how you ask" kill gate: node prototypes/ask/run.mjs [--runs=200]
//
// The author, 2026-11-06: "I don't actually feel like it imparts any
// information. It just feels like finding or following the right answer while
// attempting to keep under 40 hrs." Measured (docs/REVIEW-loop.md): a bot
// with two rules (press the find-out button, then press the label that
// matches what you were told) wins 76% against the tuned bot's 88%.
//
// The question here: if finding out is three ways with different reliability,
// and what a person tells their boss depends on how much they trust the boss,
// does a player who reads the person and checks one account against another
// clearly beat the two-rule pattern, with no single way of asking that wins
// on its own? Numbers only, no engine. Modelled on The late one.
//
// The model. Brent is late. One hidden cause: childcare 0.35, ride 0.30,
// attitude 0.35. His trust in you is drawn per run, 0.25 to 0.80, and the
// player sees it as a band (trusts you, benefit of the doubt, wary).
//   ask him (1 h)        the truth with p = ride 0.9, childcare trust - 0.1, attitude 0.5 x trust;
//                        otherwise "the truck" (ride), the story people tell a boss.
//                        Asking again gets the same answer unless his trust rose 0.15.
//   ask around (0.5 h)   Kev first: the truth with p = ride 0.5, childcare 0.35, attitude 0.45,
//                        otherwise nothing. Then Tyler: ride 0.5, childcare 0.2, attitude 0.6,
//                        otherwise his view of Brent, attitude (60%). Nobody else knows.
//                        Brent hears you asked round him 30% of the time: trust -0.08.
//   the timecards (0.5 h) rule out one of the two wrong causes.
//   mention it (0.25 h)  holds the line in front of the crew this week; fixes nothing.
// Fixes: write-up (1.5 h) fits attitude; a later start (0.5 h) fits childcare;
// sort a ride (1 h) fits ride. A right fix works 80%, 90% on a second try.
// A write-up for childcare costs his trust and morale and may cost him; a later
// start for attitude rewards it and the crew sees. Childcare left three weeks
// may cost him (60%); attitude left two weeks spreads; a ride problem passes
// on its own 40% a week after the first. Eight weeks, eight free hours a week.
// The win, as the module has it: the lateness settled for a reason that holds,
// nobody lost, and it did not spread to the crew.

const args = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true]; }));
const RUNS = Number(args.runs || 200);
const WEEKS = 8;
function rng(seed) { let s = seed >>> 0 || 1; return () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const CAUSES = ['childcare', 'ride', 'attitude'];
const FIX = { attitude: 'writeup', childcare: 'later', ride: 'ridefix' };
const band = (t) => (t >= 0.65 ? 'trusts' : t >= 0.45 ? 'doubt' : 'wary');

function play(policy, seed) {
  const r = rng(seed);
  let x = r(); const cause = x < 0.35 ? 'childcare' : x < 0.65 ? 'ride' : 'attitude';
  const s = { cause, trust: 0.25 + 0.55 * r(), said: null, saidTrust: null, heard: null, ruledOut: [], tried: {}, fixed: false, lost: false, spread: false, neglect: 0, unchecked: 0, hours: 0, week: 0, wrong: 0 };
  s.startBand = band(s.trust);
  const ways = {
    ask() { s.hours += 1; if (s.said && s.trust < s.saidTrust + 0.15) return; const p = { ride: 0.9, childcare: s.trust - 0.1, attitude: 0.5 * s.trust }[cause]; s.said = r() < p ? cause : 'ride'; s.saidTrust = s.trust; s.trust = Math.min(1, s.trust + 0.05); },
    around() {
      s.hours += 0.5; s.asked = (s.asked || 0) + 1;
      if (s.asked === 1) { if (r() < { ride: 0.5, childcare: 0.35, attitude: 0.45 }[cause]) s.heard = cause; }
      else if (s.asked === 2) { const t = r() < { ride: 0.5, childcare: 0.2, attitude: 0.6 }[cause] ? cause : r() < 0.6 ? 'attitude' : null; if (t && !s.heard) s.heard = t; else if (t && t !== s.heard) s.heard2 = t; }
      if (r() < 0.3) s.trust = Math.max(0, s.trust - 0.08);
    },
    remind() { s.hours += 0.25; s.heldWeek = s.week; },
    cards() { s.hours += 0.5; const wrong = CAUSES.filter((c) => c !== cause && !s.ruledOut.includes(c)); if (wrong.length > 1) s.ruledOut.push(wrong[Math.floor(r() * wrong.length)]); else if (wrong.length === 1 && !s.ruledOut.length) s.ruledOut.push(wrong[0]); },
  };
  function fix(f) {
    s.hours += { writeup: 1.5, later: 0.5, ridefix: 1 }[f];
    const right = FIX[cause] === f;
    s.tried[f] = (s.tried[f] || 0) + 1;
    if (right) { if (r() < (s.tried[f] > 1 ? 0.9 : 0.8)) s.fixed = true; return; }
    s.wrong++;
    if (f === 'writeup' && cause === 'childcare') { s.trust = Math.max(0, s.trust - 0.15); if (r() < 0.3) s.lost = true; }
    if (f === 'writeup' && cause === 'ride') s.trust = Math.max(0, s.trust - 0.1);
    if (f === 'later' && cause === 'attitude') { s.spread = s.spread || r() < 0.5; }
  }
  for (let w = 1; w <= WEEKS && !s.fixed && !s.lost; w++) {
    s.week = w;
    const view = { band: band(s.trust), said: s.said, heard: s.heard, heard2: s.heard2, asked: s.asked || 0, ruledOut: [...s.ruledOut], tried: { ...s.tried }, week: w };
    const acts = POLICIES[policy](view);
    let held = false;
    for (const a of acts) { if (ways[a]) ways[a](); else if (a) { fix(a); if (a === 'writeup') held = true; } if (s.fixed || s.lost) break; }
    if (s.fixed) break;
    if (cause === 'childcare') { s.neglect = acts.some((a) => a === 'later') ? 0 : s.neglect + 1; if (s.neglect >= 3 && !s.quitChecked) { s.quitChecked = true; if (r() < 0.6) s.lost = true; } }
    if (cause === 'attitude') { s.unchecked = held || s.heldWeek === w ? 0 : s.unchecked + 1; if (s.unchecked >= 2) s.spread = true; }
    if (cause === 'ride' && w >= 2 && r() < 0.4) s.fixed = true;
  }
  return { win: s.fixed && !s.lost && !s.spread, fixed: s.fixed, lost: s.lost, spread: s.spread, hours: s.hours, wrong: s.wrong, trust: s.trust };
}

// what the evidence in hand supports: the causes not ruled out, and the ones two sources name
function supported(v) {
  const left = CAUSES.filter((c) => !v.ruledOut.includes(c));
  if (left.length === 1) return left[0];
  const votes = {};
  if (v.said && left.includes(v.said)) votes[v.said] = (votes[v.said] || 0) + (v.band === 'trusts' || v.said !== 'ride' ? 2 : 1);
  if (v.heard && left.includes(v.heard)) votes[v.heard] = (votes[v.heard] || 0) + 1;
  if (v.heard2 && left.includes(v.heard2)) votes[v.heard2] = (votes[v.heard2] || 0) + 1;
  const best = Object.entries(votes).sort((a, b) => b[1] - a[1])[0];
  return best && best[1] >= 2 ? best[0] : null;
}
const nextFix = (v, c) => (v.tried[FIX[c]] >= 2 ? null : FIX[c]);
const POLICIES = {
  // the two-rule pattern: press the first find-out option, then the label that matches what you were told
  pattern: (v) => (!v.said ? ['ask'] : [FIX[v.said]]),
  // the same, but always asking around first
  gossip: (v) => (!v.heard ? (v.asked < 2 ? ['around'] : []) : [FIX[v.heard]]),
  // evidence only: pull the cards, then try what is left, one at a time
  cards: (v) => { if (!v.ruledOut.length) return ['cards']; const left = CAUSES.filter((c) => !v.ruledOut.includes(c) && !(v.tried[FIX[c]] >= 1)); return left.length ? [FIX[left[0]]] : []; },
  documenter: (v) => (v.week % 2 === 1 ? ['writeup'] : []),
  firefighter: () => [],
  ignorer: () => [],
  // reads the person: asks him straight when he trusts you; when he is wary, checks the cards
  // and asks around before believing "the truck"; acts once the evidence agrees
  // and mentions it at the huddle each week until it is settled: the crew watches
  reader: (v) => {
    const c = supported(v);
    if (c) return [nextFix(v, c), c === 'attitude' ? null : 'remind'].filter(Boolean);
    if (!v.said) return v.band === 'trusts' ? ['ask', 'remind'] : ['cards', 'ask', 'remind'];
    if (!v.ruledOut.length) return ['cards', 'remind'];
    if (v.asked < 1) return ['around', 'remind'];
    const left = CAUSES.filter((x) => !v.ruledOut.includes(x));
    const guess = left.find((x) => x !== 'ride') || left[0];
    return [nextFix(v, guess), 'remind'].filter(Boolean);
  },
};

const se = (p, n = RUNS) => 100 * Math.sqrt(Math.max(p * (1 - p), 1 / n) / n);
const pct = (p) => `${(100 * p).toFixed(0)}% ±${se(p).toFixed(0)}`;
const within = (p, lo, hi) => p >= lo - 2 * se(p) / 100 && p <= hi + 2 * se(p) / 100;
const floor = (a, b) => 2 * Math.sqrt(se(a) ** 2 + se(b) ** 2) / 100;
const rows = Object.keys(POLICIES).map((policy) => {
  const outs = []; for (let i = 0; i < RUNS; i++) outs.push(play(policy, 3000 + i));
  const rate = (k) => outs.filter((o) => o[k]).length / RUNS;
  const mean = (k) => outs.reduce((a, o) => a + o[k], 0) / RUNS;
  return { policy, win: rate('win'), lost: rate('lost'), spread: rate('spread'), wrong: mean('wrong'), hours: mean('hours'), trust: mean('trust') };
});
const by = Object.fromEntries(rows.map((x) => [x.policy, x]));
const md = ['| Style | Win | Lost him | Spread | Wrong fixes | Hours (8 weeks) | His trust at the end |', '|---|---|---|---|---|---|---|'];
for (const x of rows) md.push(`| ${x.policy} | ${pct(x.win)} | ${pct(x.lost)} | ${pct(x.spread)} | ${x.wrong.toFixed(2)} | ${x.hours.toFixed(1)} | ${x.trust.toFixed(2)} |`);
const wins = rows.map((x) => x.win);
const single = ['pattern', 'gossip', 'cards'];
const checks = [
  [`styles diverge (spread ${(100 * (Math.max(...wins) - Math.min(...wins))).toFixed(0)} points)`, Math.max(...wins) - Math.min(...wins) > floor(Math.max(...wins), Math.min(...wins))],
  [`the reader wins most, not all (${pct(by.reader.win)}, want 50-90%)`, within(by.reader.win, 0.5, 0.9) && by.reader.win < 1],
  [`leaving it loses most, not all (${pct(by.ignorer.win)}, want 3-40%)`, within(by.ignorer.win, 0.03, 0.4) && by.ignorer.win > 0],
  [`the two-rule pattern loses clearly to the reader (${pct(by.pattern.win)} against ${pct(by.reader.win)}, want 20 points or more)`, by.reader.win - by.pattern.win >= 0.2],
  [`no single way of finding out wins on its own: each loses to the reader by 10 points or more, above the noise (best: ${single.map((k) => by[k]).sort((a, b) => b.win - a.win)[0].policy} ${pct(single.map((k) => by[k]).sort((a, b) => b.win - a.win)[0].win)})`, single.every((k) => by.reader.win - by[k].win >= Math.max(0.1, floor(by.reader.win, by[k].win)))],
  ['nothing beats the reader beyond the noise', rows.every((x) => x.win - by.reader.win <= floor(x.win, by.reader.win))],
  ['no style best on every axis (win, wrong fixes, hours, trust)', !rows.some((x) => rows.every((o) => x.win >= o.win && x.wrong <= o.wrong && x.hours <= o.hours && x.trust >= o.trust))],
];
md.push('');
let pass = true;
for (const [label, ok] of checks) { md.push(`- ${ok ? 'PASS' : 'FAIL'} ${label}`); pass &&= ok; }
console.log(md.join('\n'));
console.log(`\nHow-you-ask kill gate: ${pass ? 'PASS' : 'FAIL'}`);
process.exitCode = pass ? 0 : 1;
