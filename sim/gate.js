// node sim/gate.js [--runs=100] [--module=id]
// The kill gate's five conditions (docs/KILLGATE.md), applied to every module
// of the track with the engine's own bots. A module ships only if it passes.
// Exit code 1 if any gated module fails, so `npm run check` can run it.

import { play, metrics } from './adapter.js';
import { POLICIES } from './bot.js';
import { TRACK, MODULES } from '../src/engine/game.js';

const args = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true]; }));
const RUNS = Number(args.runs || 100);
const se = (p, n = RUNS) => 100 * Math.sqrt(Math.max(p * (1 - p), 1 / n) / n);
const pct = (p) => `${(100 * p).toFixed(0)}% ±${se(p).toFixed(0)}`;
const within = (p, lo, hi) => p >= lo - 2 * se(p) / 100 && p <= hi + 2 * se(p) / 100;
const floor = (a, b) => 2 * Math.sqrt(se(a) ** 2 + se(b) ** 2) / 100;

function table(module) {
  return POLICIES.map((policy) => {
    const ms = [];
    for (let i = 0; i < RUNS; i++) ms.push(metrics(play(1000 + i, { module, policy })));
    const rate = (k) => ms.filter((m) => m[k]).length / RUNS;
    const mean = (k) => ms.reduce((a, m) => a + m[k], 0) / RUNS;
    return { policy, win: rate('win'), schedule: rate('schedule'), kept: rate('kept'), problem: rate('problem'), starved: rate('starved'),
      bottleneck: rate('bottleneck'), ship: mean('ship'), hours: mean('hours'), morale: mean('morale'), trust: mean('trust'), practice: mean('practice') };
  });
}

function gate(rows) {
  const by = Object.fromEntries(rows.map((r) => [r.policy, r]));
  const wins = rows.map((r) => r.win);
  const out = [];
  const hi = Math.max(...wins), lo = Math.min(...wins);
  out.push([`styles diverge (spread ${(100 * (hi - lo)).toFixed(0)} points)`, hi - lo > floor(hi, lo)]);
  const axes = ['win', 'schedule', 'kept', 'ship', 'morale', 'trust'];
  const dom = rows.filter((r) => axes.every((ax) => rows.every((o) => r[ax] >= o[ax] - 1e-9)));
  out.push([`no style best on every axis${dom.length ? ` (${dom.map((d) => d.policy)} is)` : ''}`, dom.length === 0]);
  const b = by.balanced.win;
  out.push([`balanced wins most, not all (${pct(b)}, want 50-90%)`, within(b, 0.5, 0.9) && b < 1]);
  const ig = by.ignorer.win;
  out.push([`ignoring loses most, not all (${pct(ig)}, want 3-40%)`, within(ig, 0.03, 0.4) && ig > 0]);
  const best = rows.reduce((a, r) => (r.win > a.win ? r : a));
  out.push([`nothing beats balanced beyond the noise (best other: ${best.policy === 'balanced' ? 'none' : best.policy})`, best.win - b <= floor(best.win, b)]);
  return out;
}

const modules = args.module ? [args.module] : TRACK.modules;
let pass = true;
const md = [];
for (const id of modules) {
  const rows = table(id);
  md.push(`\n### ${MODULES[id].title} (\`${id}\`), ${RUNS} seeds per style\n`);
  md.push('| Style | Win | Schedule | Kept everyone | Problem settled | Paint starved | Bottleneck | Shipped / asked | Hours a week | Morale | Trust | Practice score |');
  md.push('|---|---|---|---|---|---|---|---|---|---|---|---|');
  for (const r of rows) md.push(`| ${r.policy} | ${pct(r.win)} | ${pct(r.schedule)} | ${pct(r.kept)} | ${pct(r.problem)} | ${pct(r.starved)} | ${pct(r.bottleneck)} | ${(100 * r.ship).toFixed(0)}% | ${r.hours.toFixed(1)} | ${r.morale.toFixed(2)} | ${r.trust.toFixed(2)} | ${(100 * r.practice).toFixed(0)}% |`);
  md.push('');
  for (const [label, ok] of gate(rows)) { md.push(`- ${ok ? 'PASS' : 'FAIL'} ${label}`); pass &&= ok; }
}
console.log(md.join('\n'));
console.log(`\nModule gate: ${pass ? 'PASS' : 'FAIL'}`);
process.exitCode = pass ? 0 : 1;
