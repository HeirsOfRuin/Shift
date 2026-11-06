// node sim/gate.js [--runs=100] [--module=id] [--seat=lead]
// The kill gate's five conditions (docs/KILLGATE.md), applied to every module
// of the track with the engine's own bots. A module ships only if it passes.
// Exit code 1 if any gated module fails, so `npm run check` can run it.
//
// A sixth condition since beta 15 (docs/REVIEW-loop.md, docs/KILLGATE-ask.md):
// the two-rule pattern bot, which knows nothing about leadership, must trail
// the balanced style by 15 points. For eleven betas the gate certified a loop
// that pattern could win. Since beta 16 it is enforced on every module but the
// ones named in EXEMPT, each with its reason; an exempt module is reported.

import { play, metrics } from './adapter.js';
import { POLICIES } from './bot.js';
import { TRACK, MODULES } from '../src/engine/game.js';

const PATTERN_GAP = 0.15;
// Remembered tells must be worth no more than the noise over a general rule (beta 17).
// First set as "the memoriser trails balanced by 10 points" before it was run; the
// runs showed the memoriser's edge came from one transferable rule, not from
// remembering any module (docs/KILLGATE-ask.md, beta 17), so the test now
// measures what it was meant to: memoriser against the rule alone.
const EXEMPT = {
  // its choices are scripted shortcuts with a known right answer and no hidden
  // reason behind them, so the pattern and the balanced style play it alike.
  // The fix is a hidden reason behind why the crew keeps offering shortcuts:
  // a new mechanic, kill gate first (docs/REVIEW-loop.md, beta 17).
  rush: 'scripted shortcuts, no hidden reason yet',
};
// The difference between two win rates at 100 runs has a standard error of
// about 7 points: too coarse to hold a 15-point bar. The pattern check always
// uses at least 200 runs of the two styles it compares (beta 16).
const PATTERN_RUNS = 200;
function winRate(module, policy, seat, n) {
  let w = 0;
  for (let i = 0; i < n; i++) if (metrics(play(1000 + i, { module, policy, seat })).win) w++;
  return w / n;
}

const args = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true]; }));
const RUNS = Number(args.runs || 100);
const se = (p, n = RUNS) => 100 * Math.sqrt(Math.max(p * (1 - p), 1 / n) / n);
const pct = (p) => `${(100 * p).toFixed(0)}% ±${se(p).toFixed(0)}`;
const within = (p, lo, hi) => p >= lo - 2 * se(p) / 100 && p <= hi + 2 * se(p) / 100;
const floor = (a, b) => 2 * Math.sqrt(se(a) ** 2 + se(b) ** 2) / 100;

function table(module, seat) {
  return POLICIES.map((policy) => {
    const ms = [];
    for (let i = 0; i < RUNS; i++) ms.push(metrics(play(1000 + i, { module, policy, seat })));
    const rate = (k) => ms.filter((m) => m[k]).length / RUNS;
    const mean = (k) => ms.reduce((a, m) => a + m[k], 0) / RUNS;
    return { policy, win: rate('win'), schedule: rate('schedule'), kept: rate('kept'), problem: rate('problem'), starved: rate('starved'),
      bottleneck: rate('bottleneck'), ship: mean('ship'), hours: mean('hours'), morale: mean('morale'), trust: mean('trust'), practice: mean('practice') };
  });
}

function gate(rows, enforce, seat, module) {
  const by = Object.fromEntries(rows.map((r) => [r.policy, r]));
  const wins = rows.map((r) => r.win);
  const out = [];
  const hi = Math.max(...wins), lo = Math.min(...wins);
  out.push([`styles diverge (spread ${(100 * (hi - lo)).toFixed(0)} points)`, hi - lo > floor(hi, lo)]);
  // hours joined the axes in beta 16: finding out costs hours, and a style that pays them
  // is trading something real (the author: "while attempting to keep under 40 hrs")
  const axes = ['win', 'schedule', 'kept', 'ship', 'morale', 'trust', 'fewerHours'];
  for (const r of rows) r.fewerHours = -r.hours;
  const dom = rows.filter((r) => axes.every((ax) => rows.every((o) => r[ax] >= o[ax] - 1e-9)));
  out.push([`no style best on every axis${dom.length ? ` (${dom.map((d) => d.policy)} is)` : ''}`, dom.length === 0]);
  const b = by.balanced.win;
  out.push([`balanced wins most, not all (${pct(b)}, want 50-90%)`, within(b, 0.5, 0.9) && b < 1]);
  const ig = by.ignorer.win;
  out.push([`ignoring loses most, not all (${pct(ig)}, want 3-40%)`, within(ig, 0.03, 0.4) && ig > 0]);
  const best = rows.reduce((a, r) => (r.win > a.win ? r : a));
  out.push([`nothing beats balanced beyond the noise (best other: ${best.policy === 'balanced' ? 'none' : best.policy})`, best.win - b <= floor(best.win, b)]);
  if (seat !== 'manager') {
    const n = Math.max(RUNS, PATTERN_RUNS);
    const bw = n === RUNS ? b : winRate(module, 'balanced', seat, n);
    const pw = n === RUNS ? by.pattern.win : winRate(module, 'pattern', seat, n);
    const gap = bw - pw;
    out.push([`the two-rule pattern trails balanced by ${(100 * PATTERN_GAP).toFixed(0)} points (${n} runs: pattern ${(100 * pw).toFixed(0)}%, balanced ${(100 * bw).toFixed(0)}%, ${(100 * gap).toFixed(0)} behind)${enforce ? '' : ' [reported, not yet enforced]'}`, gap >= PATTERN_GAP, !enforce]);
    const mw = n === RUNS ? by.memoriser.win : winRate(module, 'memoriser', seat, n);
    const rw = winRate(module, 'principle', seat, n);
    const noise = 2 * Math.sqrt((mw * (1 - mw) + rw * (1 - rw)) / n);
    out.push([`remembering this module's tells is worth no more than the noise over the general rule (${n} runs: memoriser ${(100 * mw).toFixed(0)}%, rule alone ${(100 * rw).toFixed(0)}%, noise ${(100 * noise).toFixed(0)})${enforce ? '' : ' [reported, not yet enforced]'}`, mw - rw <= noise, !enforce]);
  }
  return out;
}

const modules = args.module ? [args.module] : TRACK.modules;
let pass = true;
const md = [];
for (const id of modules) for (const seat of (MODULES[id].seats || ['supervisor']).filter((x) => !args.seat || x === args.seat)) {
  const rows = table(id, seat);
  const enforce = !EXEMPT[id];
  md.push(`\n### ${MODULES[id].title} (\`${id}\`${seat === 'supervisor' ? '' : `, ${seat} seat`}), ${RUNS} seeds per style\n`);
  md.push('| Style | Win | Schedule | Kept everyone | Problem settled | Paint starved | Bottleneck | Shipped / asked | Hours a week | Morale | Trust | Practice score |');
  md.push('|---|---|---|---|---|---|---|---|---|---|---|---|');
  for (const r of rows) md.push(`| ${r.policy} | ${pct(r.win)} | ${pct(r.schedule)} | ${pct(r.kept)} | ${pct(r.problem)} | ${pct(r.starved)} | ${pct(r.bottleneck)} | ${(100 * r.ship).toFixed(0)}% | ${r.hours.toFixed(1)} | ${r.morale.toFixed(2)} | ${r.trust.toFixed(2)} | ${(100 * r.practice).toFixed(0)}% |`);
  md.push('');
  for (const [label, ok, soft] of gate(rows, enforce, seat, id)) { md.push(`- ${ok ? 'PASS' : soft ? 'REPORT' : 'FAIL'} ${label}`); if (!soft) pass &&= ok; }
}
console.log(md.join('\n'));
console.log(`\nModule gate: ${pass ? 'PASS' : 'FAIL'}`);
process.exitCode = pass ? 0 : 1;
