// The flow rounds kill gate: node prototypes/flow/run.mjs [--runs=100]
//
// Inspired by the brick-built plane exercise that lean trainers run in rounds:
// build under the old rules (big batches, push, inspect at the end), measure,
// change one rule, run again, compare. The question: in the welding bay, does
// a loop where batch size, push or pull, and where defects are caught each
// matter for a hidden reason, and where changing several rules at once costs
// a compounding learning dip, separate supervisor styles with none dominant?
// Numbers only, no engine. If it does not separate, the module is not built.
//
// The model. Eight weeks (rounds), paint wants six. Fit-up 6.6 a week, weld
// 6.0, finish 6.8. Three rules, each starting at the old way:
//   batch   6 (a full rack) or 1
//   pull    no (fit-up builds all it can) or yes (only into a two-slot rack)
//   check   at the end (finish) or at each station
// One hidden cause, drawn per run:
//   batch   a setup error ruins a whole rack: +0.9 defects a week while batch is 6
//   push    the clogged aisle and the wrong parts cost weld 0.9 a week while there is no pull
//   late    defects caught at finish cost rework there, and escape to paint: -0.9 while checked at the end
//   fine    nothing is wrong with the rules this month (20%): any change only costs the dip
// Changing rules teaches the crew a new way: each rule changed this week costs
// 2 h and a dip; two at once compound and the dip carries a second week.
// Reading a round (2 h: where WIP piles, where defects are found) names the
// cause 65% of the time, the wrong rule 20%, nothing clear 15%. The
// supervisor has 8 free hours a week; one week in five is a rush and has 2.
// A changed rule slides back to the old way by Friday one time in five: the
// crew has not taken it yet. The win, as every module has it: 44 of 48
// bodies, paint never short two weeks running, and the cause settled (the
// fitting rule in place at the end, or nothing wrong to begin with).

const args = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true]; }));
const RUNS = Number(args.runs || 100);
const WEEKS = 8;

function rng(seed) { let s = seed >>> 0 || 1; return () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const CAUSES = [['batch', 0.27], ['push', 0.27], ['late', 0.26], ['fine', 0.2]];

function play(policy, seed) {
  const r = rng(seed);
  let roll = r(), cause = 'fine';
  for (const [c, w] of CAUSES) { if (roll < w) { cause = c; break; } roll -= w; }
  const s = { cause, rules: { batch: 6, pull: false, check: 'end' }, known: null, shipped: 0, short: 0, starved: false, wip: 0, changes: 0, dipNext: 1, hours: 0, lead: [] };
  let fitBuf = 1.5, weldBuf = 0.5;
  for (let week = 1; week <= WEEKS; week++) {
    let left = r() < 0.2 ? 2 : 8;     // one week in five is a rush and the free hours go
    const acts = POLICIES[policy](s, week);
    let changed = 0;
    for (const a of acts) {
      // a round read: right 65%, the wrong rule 20% (a pile of WIP is ambiguous), nothing clear 15%
      if (a === 'observe' && left >= 2) { left -= 2; s.hours += 2; const q = r(); s.known = q < 0.65 ? cause : q < 0.85 ? ['batch', 'push', 'late', 'fine'].filter((c) => c !== cause)[Math.floor(r() * 3)] : s.known; s.looked = week; }
      if (a === 'cover' && left >= 8) { left -= 8; s.hours += 8; s.cover = true; }
      for (const [rule, to] of [['batch1', ['batch', 1]], ['pull', ['pull', true]], ['check', ['check', 'source']]]) {
        if (a === rule && left >= 2 && s.rules[to[0]] !== to[1]) { left -= 2; s.hours += 2; s.rules[to[0]] = to[1]; changed++; s.changes++; if (r() < 0.2) s.slide = to[0]; }
      }
    }
    // learning dip: one change 0.9; two 0.78 and 0.92 next week; three 0.66 and 0.82 next week
    const dip = [1, 0.9, 0.78, 0.66][changed] * s.dipNext;
    s.dipNext = [1, 1, 0.92, 0.82][changed];
    const noise = 0.92 + 0.16 * r();
    let fit = 6.6 * dip * noise, weld = 6.0 * dip * noise + (s.cover ? 0.8 : 0), finish = 6.8 * dip * noise;
    s.cover = false;
    let defects = 0.4;
    if (cause === 'batch' && s.rules.batch === 6) defects += 1.2;
    if (cause === 'push' && !s.rules.pull) weld -= 1.1;
    // weld draws first; pull caps what fit-up may leave waiting in the rack after
    const wOut = Math.min(weld, fitBuf + fit);
    fitBuf = Math.min(fitBuf + fit - wOut, s.rules.pull ? 2 : 6); weldBuf += wOut;
    const rework = defects * (s.rules.check === 'end' ? 0.5 : 0.15);
    let out = Math.max(0, Math.min(finish - rework, weldBuf)); weldBuf -= out;
    if (cause === 'late' && s.rules.check === 'end') out = Math.max(0, out - 1.0);
    s.shipped += out;
    s.lastOut = out;
    s.short = out < 4.75 ? s.short + 1 : 0;
    if (s.short >= 2) s.starved = true;
    s.wip += fitBuf + weldBuf;
    s.lead.push((fitBuf + weldBuf) / Math.max(1, out));
    // a change the crew has not taken slides back to the old way by Friday, one time in five
    if (s.slide) { s.rules[s.slide] = { batch: 6, pull: false, check: 'end' }[s.slide]; s.slid = (s.slid || 0) + 1; s.slide = null; }
  }
  const fixed = cause === 'fine' || { batch: s.rules.batch === 1, push: s.rules.pull, late: s.rules.check === 'source' }[cause];
  return { win: s.shipped >= 44 && !s.starved && fixed, shipped: s.shipped, starved: s.starved, wip: s.wip / WEEKS, changes: s.changes, hours: s.hours / WEEKS, fixed };
}

const FIX = { batch: 'batch1', push: 'pull', late: 'check' };
const POLICIES = {
  pusher: (s) => ['cover'],
  changeAll: (s, w) => (w === 1 ? ['batch1', 'pull', 'check'] : []),
  inspector: (s, w) => (w === 1 ? ['check'] : []),
  leaver: () => [],
  // read a round, change the one rule it points at, read the next round to see whether it took
  balanced: (s, w) => {
    if (!s.known) return ['observe'];
    const rule = s.known === 'fine' ? null : FIX[s.known];
    const set = rule && { batch1: s.rules.batch === 1, pull: s.rules.pull, check: s.rules.check === 'source' }[rule];
    if (rule && !set) { s.changedAt = w; return [rule]; }
    if (s.changedAt === w - 1 || (s.known === 'fine' && s.looked === w - 1)) { if (s.lastOut < 5.6) { s.known = null; return ['observe']; } }
    return [];
  },
};

const se = (p, n = RUNS) => 100 * Math.sqrt(Math.max(p * (1 - p), 1 / n) / n);
const pct = (p) => `${(100 * p).toFixed(0)}% ±${se(p).toFixed(0)}`;
const within = (p, lo, hi) => p >= lo - 2 * se(p) / 100 && p <= hi + 2 * se(p) / 100;
const floor = (a, b) => 2 * Math.sqrt(se(a) ** 2 + se(b) ** 2) / 100;

const rows = Object.keys(POLICIES).map((policy) => {
  const outs = []; for (let i = 0; i < RUNS; i++) outs.push(play(policy, 1000 + i));
  const rate = (k) => outs.filter((o) => o[k]).length / RUNS;
  const mean = (k) => outs.reduce((a, o) => a + o[k], 0) / RUNS;
  return { policy, win: rate('win'), starved: rate('starved'), fixed: rate('fixed'), shipped: mean('shipped'), wip: mean('wip'), changes: mean('changes'), hours: mean('hours') };
});
const md = ['| Style | Win | Cause fixed | Paint starved | Bodies (of 48) | WIP in the bay | Rules changed | Hours a week |', '|---|---|---|---|---|---|---|---|'];
for (const x of rows) md.push(`| ${x.policy} | ${pct(x.win)} | ${pct(x.fixed)} | ${pct(x.starved)} | ${x.shipped.toFixed(1)} | ${x.wip.toFixed(1)} | ${x.changes.toFixed(1)} | ${x.hours.toFixed(1)} |`);
const by = Object.fromEntries(rows.map((x) => [x.policy, x]));
const wins = rows.map((x) => x.win);
const hi = Math.max(...wins), lo = Math.min(...wins);
const checks = [
  [`styles diverge (spread ${(100 * (hi - lo)).toFixed(0)} points)`, hi - lo > floor(hi, lo)],
  ['no style best on every axis (win, bodies, WIP, hours)', !rows.some((x) => rows.every((o) => x.win >= o.win && x.shipped >= o.shipped && x.wip <= o.wip && x.hours <= o.hours))],
  [`balanced wins most, not all (${pct(by.balanced.win)}, want 50-90%)`, within(by.balanced.win, 0.5, 0.9) && by.balanced.win < 1],
  [`leaving it loses most, not all (${pct(by.leaver.win)}, want 3-40%)`, within(by.leaver.win, 0.03, 0.4) && by.leaver.win > 0],
  [`changing everything at once fixes the cause most of the time and still loses more than balanced (fixed ${pct(by.changeAll.fixed)}, won ${pct(by.changeAll.win)}, starved ${pct(by.changeAll.starved)})`, by.changeAll.fixed > 0.75 && by.changeAll.win < by.balanced.win - floor(by.changeAll.win, by.balanced.win)],
  ['nothing beats balanced beyond the noise', rows.every((x) => x.win - by.balanced.win <= floor(x.win, by.balanced.win))],
];
md.push('');
let pass = true;
for (const [label, ok] of checks) { md.push(`- ${ok ? 'PASS' : 'FAIL'} ${label}`); pass &&= ok; }
console.log(md.join('\n'));
console.log(`\nFlow kill gate: ${pass ? 'PASS' : 'FAIL'}`);
process.exitCode = pass ? 0 : 1;
