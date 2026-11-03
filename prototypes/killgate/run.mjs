// node prototypes/killgate/run.mjs [--runs=50] [--scenario=season] [--md]
// node prototypes/killgate/run.mjs --trace=SEED --policy=NAME --scenario=NAME
import { newGame, advance, view, outcome, P, SCENARIOS } from './model.mjs';
import { POLICIES } from './policies.mjs';

const args = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true]; }));
const RUNS = Number(args.runs || 50);

function play(policy, seed, scenario) {
  const s = newGame(seed, scenario);
  let guard = 0;
  while (!s.done) {
    const before = s.week;
    advance(s, POLICIES[policy](view(s)));
    if (s.week <= before) throw new Error(`no progress at week ${before}`);   // every harness proves progress
    if (++guard > 50) throw new Error('runaway');
  }
  return s;
}

if (args.trace) {
  const s = play(args.policy || 'balanced', Number(args.trace), args.scenario || 'season');
  console.log(s.log.join('\n'));
  console.log('hours     ', s.hoursHistory.map((h) => h.toFixed(1)).join(' '));
  console.log('interrupts', s.interruptHistory.map((h) => h.toFixed(1)).join(' '));
  console.log('shipped   ', s.shippedHistory.map((h) => h.toFixed(2)).join(' '));
  console.log(outcome(s), s.tags);
  process.exit(0);
}

const se = (p, n) => 100 * Math.sqrt(Math.max(p * (1 - p), 1 / n) / n);
const pct = (p) => `${(100 * p).toFixed(0)}% ±${se(p, RUNS).toFixed(0)}`;

function table(scenario) {
  const rows = [];
  for (const name of Object.keys(POLICIES)) {
    const outs = [];
    for (let i = 0; i < RUNS; i++) outs.push(outcome(play(name, 1000 + i, scenario)));
    const rate = (f) => outs.filter(f).length / RUNS;
    const mean = (f) => outs.reduce((a, o) => a + f(o), 0) / RUNS;
    rows.push({
      name, win: rate((o) => o.win), schedule: rate((o) => o.scheduleMet), settled: rate((o) => o.settled),
      kept: rate((o) => o.lost === 0 && !o.onLeave), starved: rate((o) => o.starved), bottleneck: rate((o) => o.bottleneck),
      ship: mean((o) => o.shipShare), hours: mean((o) => o.hours), maxHours: mean((o) => o.maxHours),
      morale: mean((o) => o.morale), trust: mean((o) => o.trust), escapes: mean((o) => o.escapes),
    });
  }
  return rows;
}

function print(scenario, rows) {
  console.log(`\n### ${scenario} (${RUNS} seeds per policy, ${P.weeks} weeks)\n`);
  console.log('| Policy | Win | Schedule met | Problems settled | Kept everyone | Paint starved | You the bottleneck | Shipped / demanded | Hours a week (peak) | Morale | Trust | Escapes to paint |');
  console.log('|---|---|---|---|---|---|---|---|---|---|---|---|');
  for (const r of rows) {
    console.log(`| ${r.name} | ${pct(r.win)} | ${pct(r.schedule)} | ${pct(r.settled)} | ${pct(r.kept)} | ${pct(r.starved)} | ${pct(r.bottleneck)} | ${(100 * r.ship).toFixed(1)}% | ${r.hours.toFixed(1)} (${r.maxHours.toFixed(0)}) | ${r.morale.toFixed(2)} | ${r.trust.toFixed(2)} | ${r.escapes.toFixed(2)} |`);
  }
}

// The gate's conditions, checked, not eyeballed.
function gate(scenario, rows) {
  const by = Object.fromEntries(rows.map((r) => [r.name, r]));
  const floor = (a, b) => 2 * Math.sqrt(se(a, RUNS) ** 2 + se(b, RUNS) ** 2) / 100;
  const out = [];
  const wins = rows.map((r) => r.win);
  const spread = Math.max(...wins) - Math.min(...wins);
  out.push([`policies diverge (win spread ${(100 * spread).toFixed(0)} points)`, spread > floor(Math.max(...wins), Math.min(...wins))]);
  const axes = ['win', 'schedule', 'kept', 'ship', 'morale', 'trust'];
  const dominant = rows.filter((r) => axes.every((ax) => rows.every((o) => r[ax] >= o[ax] - 1e-9)));
  out.push([`no policy best on every axis${dominant.length ? ` (${dominant.map((d) => d.name).join(', ')} is)` : ''}`, dominant.length === 0]);
  // Bounds are read with the kit's noise rule: a rate breaks a bound only when it
  // is past it by more than 2 standard errors (game-measure, stats.js).
  const within = (p, lo, hi) => p >= lo - 2 * se(p, RUNS) / 100 && p <= hi + 2 * se(p, RUNS) / 100;
  const b = by.balanced.win;
  out.push([`balanced wins most seeds, not all (${(100 * b).toFixed(0)}% ±${se(b, RUNS).toFixed(0)}, want 50-90%)`, within(b, 0.5, 0.9) && b < 1]);
  const ig = by.ignorer.win;
  const want = scenario === 'season' ? [0.0, 0.25] : [0.03, 0.4];
  out.push([`ignoring loses most seeds, not all (${(100 * ig).toFixed(0)}% ±${se(ig, RUNS).toFixed(0)}, want ${100 * want[0]}-${100 * want[1]}%)`, within(ig, want[0], want[1]) && (scenario === 'season' || ig > 0)]);
  const best = rows.reduce((a, r) => (r.win > a.win ? r : a));
  out.push([`nothing beats balanced beyond the noise (best other: ${best.name === 'balanced' ? 'none' : best.name})`, best.win - b <= floor(best.win, b)]);
  return out;
}

// Gated: the module-shaped scenarios and the season. Reported: single problems.
const GATED = ['late+', 'rework+', 'load+', 'friction+', 'season'];
const scenarios = args.scenario ? [args.scenario] : Object.keys(SCENARIOS);
let allPass = true;
for (const sc of scenarios) {
  const rows = table(sc);
  print(sc, rows);
  console.log('');
  const gated = GATED.includes(sc);
  for (const [label, ok] of gate(sc, rows)) {
    console.log(`- ${gated ? (ok ? 'PASS' : 'FAIL') : (ok ? 'ok  ' : 'note')} ${label}`);
    if (gated) allPass &&= ok;
  }
  if (!gated) console.log('- (reference only: a single problem is thinner than a module)');
}
console.log(`\nKill gate: ${allPass ? 'PASS' : 'FAIL'}`);
process.exitCode = allPass ? 0 : 1;
