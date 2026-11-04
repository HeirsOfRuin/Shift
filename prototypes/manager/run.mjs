// The manager's kill gate: node prototypes/manager/run.mjs [--runs=100] [--md]
//
// The question (FRAME-seats.md): a manager works through a supervisor. Does a
// loop where the supervisor's capability grows when he decides and shrinks
// when he is told or rescued produce different outcomes for different manager
// styles, with none dominant, and with rescuing fast now and worse later?
// Numbers only, no interface, no engine: if this does not separate the styles,
// the seat is not worth building.
//
// The model. Eight weeks. Problems arrive (one in week 1, then every two
// weeks). Each has a hidden cause the supervisor must find before the fix
// fits. The manager, per open problem, per week, does one of:
//   coach   1 h    ask what he found and what he would do: he finds out (week
//                  one) or forms a plan (week two); capability +0.04 each.
//                  Coaching a problem he already has a plan for is hovering:
//                  capability -0.02, and he waits to be told that week.
//   direct  0.5 h  tell him what to do: it is his plan now, right if the cause
//                  is known, a guess if not; capability -0.03.
//   rescue  2.5 h  go down and sort it yourself; it gets sorted; capability -0.06.
//   leave   0 h    leave it with him.
// Then he acts, every week, whatever the manager did: with a plan he settles
// it 75% of the time (50% if hovered over) and gains +0.03 when it was his
// own plan; without one he finds out or forms a plan with probability =
// capability (+0.2 for finding out: he is on the floor). Open problems cost the manager floor hours and the department
// output, and get worse every three weeks; one left four weeks blows up some
// of the time. The win: output kept, nothing blown up, and the supervisor no
// less capable than you found him.

const args = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true]; }));
const RUNS = Number(args.runs || 100);
const WEEKS = 8;
const C0 = 0.4;
const HOURS = { coach: 1, direct: 0.5, rescue: 2.5, leave: 0 };
const FREE = Number(args.free || 9);   // the manager's hours a week after her own floor and standing week
const ARRIVE = String(args.arrive || '1,2,4,5,7').split(',').map(Number);   // the weeks a problem lands
const LIMIT = Number(args.limit || 7);  // output lost that still counts as kept

function rng(seed) { let s = seed >>> 0 || 1; return () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

function play(policy, seed) {
  const r = rng(seed);
  const s = { week: 1, cap: C0, problems: [], cost: 0, blowups: 0, hours: [], settledBy: { kev: 0, you: 0 }, nextId: 1 };
  for (; s.week <= WEEKS; s.week++) {
    if (ARRIVE.includes(s.week)) s.problems.push({ id: s.nextId++, since: s.week, told: false, state: 'active', severity: 1, neglect: 0, kevOn: false });
    const open = s.problems.filter((p) => p.state === 'active');
    let left = FREE - open.reduce((a, p) => a + 1 + p.severity, 0);   // fallout eats her hours first
    let spent = 0;
    for (const p of open) {
      const act = POLICIES[policy](p, s);
      if (HOURS[act] > left) { p.neglect++; continue; }
      left -= HOURS[act]; spent += HOURS[act];
      p.hovered = false;
      if (act === 'coach') {
        if (!p.told) { p.told = true; s.cap = Math.min(1, s.cap + 0.04); }
        else if (!p.plan) { p.plan = 'his'; s.cap = Math.min(1, s.cap + 0.04); }
        else { p.hovered = true; s.cap = Math.max(0, s.cap - 0.02); }
      } else if (act === 'direct') {
        s.cap = Math.max(0, s.cap - 0.03);
        p.plan = p.told ? 'yours' : 'guess';
      } else if (act === 'rescue') {
        s.cap = Math.max(0, s.cap - 0.06); p.told = true;
        if (r() < 0.85) { p.state = 'resolved'; s.settledBy.you++; }
      }
    }
    // then he acts, whatever she did
    for (const p of open) {
      if (p.state !== 'active') continue;
      if (p.plan) {
        const odds = p.plan === 'guess' ? 0.3 : p.hovered ? 0.5 : 0.75;
        if (r() < odds) { p.state = 'resolved'; s.settledBy.kev++; if (p.plan === 'his') s.cap = Math.min(1, s.cap + 0.03); }
        else if (p.plan === 'guess') { p.plan = null; p.severity++; }
      } else if (r() < (p.told ? s.cap : s.cap + 0.2)) { if (!p.told) p.told = true; else p.plan = 'his'; }   // he is closer to the floor than she is: finding out comes easier than deciding
      else p.neglect++;
    }
    s.hours.push(spent + (FREE - left - spent) + 28);
    for (const p of s.problems) {
      if (p.state !== 'active') continue;
      s.cost += 0.5 * p.severity;
      if ((s.week - p.since) % 3 === 2) p.severity++;
      if (p.neglect >= 4 && !p.blown) { p.blown = true; if (r() < 0.3) { s.blowups++; p.state = 'resolved'; } }
    }
  }
  const capOk = s.cap >= C0 - 0.05;
  return { win: s.cost <= LIMIT && s.blowups === 0 && capOk, cost: s.cost, cap: s.cap, blowups: s.blowups, capOk, hours: s.hours.reduce((a, b) => a + b, 0) / WEEKS, byKev: s.settledBy.kev, byYou: s.settledBy.you };
}

const POLICIES = {
  rescuer: () => 'rescue',
  director: () => 'direct',
  coacher: () => 'coach',
  leaver: () => 'leave',
  balanced: (p, s) => (!p.told ? 'coach' : !p.plan ? (p.severity >= 3 ? 'direct' : s.cap >= 0.55 ? 'leave' : 'coach') : 'leave'),
};

const se = (p, n = RUNS) => 100 * Math.sqrt(Math.max(p * (1 - p), 1 / n) / n);
const pct = (p) => `${(100 * p).toFixed(0)}% ±${se(p).toFixed(0)}`;
const within = (p, lo, hi) => p >= lo - 2 * se(p) / 100 && p <= hi + 2 * se(p) / 100;
const floor = (a, b) => 2 * Math.sqrt(se(a) ** 2 + se(b) ** 2) / 100;

const rows = Object.keys(POLICIES).map((policy) => {
  const outs = []; for (let i = 0; i < RUNS; i++) outs.push(play(policy, 1000 + i));
  const rate = (k) => outs.filter((o) => o[k]).length / RUNS;
  const mean = (k) => outs.reduce((a, o) => a + o[k], 0) / RUNS;
  return { policy, win: rate('win'), capOk: rate('capOk'), blown: outs.filter((o) => o.blowups > 0).length / RUNS, cost: mean('cost'), cap: mean('cap'), hours: mean('hours'), byKev: mean('byKev'), byYou: mean('byYou') };
});
const md = [];
md.push(`| Style | Win | Supervisor no worse | Something blew up | Output lost | Capability at end | Hours a week | Settled by him | Settled by you |`);
md.push('|---|---|---|---|---|---|---|---|---|');
for (const r of rows) md.push(`| ${r.policy} | ${pct(r.win)} | ${pct(r.capOk)} | ${pct(r.blown)} | ${r.cost.toFixed(1)} | ${r.cap.toFixed(2)} | ${r.hours.toFixed(1)} | ${r.byKev.toFixed(1)} | ${r.byYou.toFixed(1)} |`);
const by = Object.fromEntries(rows.map((r) => [r.policy, r]));
const wins = rows.map((r) => r.win);
const hi = Math.max(...wins), lo = Math.min(...wins);
const checks = [
  [`styles diverge (spread ${(100 * (hi - lo)).toFixed(0)} points)`, hi - lo > floor(hi, lo)],
  ['no style best on every axis (win, capability, output, hours)', !rows.some((r) => rows.every((o) => r.win >= o.win && r.cap >= o.cap && r.cost <= o.cost && r.hours <= o.hours))],
  [`balanced wins most, not all (${pct(by.balanced.win)}, want 50-90%)`, within(by.balanced.win, 0.5, 0.9) && by.balanced.win < 1],
  [`leaving loses most, not all (${pct(by.leaver.win)}, want 3-40%)`, within(by.leaver.win, 0.03, 0.4) && by.leaver.win > 0],
  [`rescuing settles the most itself and leaves the supervisor worst (${by.rescuer.cap.toFixed(2)} vs balanced ${by.balanced.cap.toFixed(2)})`, by.rescuer.byYou > by.balanced.byYou && by.rescuer.cap < by.balanced.cap],
  [`nothing beats balanced beyond the noise`, rows.every((r) => r.win - by.balanced.win <= floor(r.win, by.balanced.win))],
];
md.push('');
let pass = true;
for (const [label, ok] of checks) { md.push(`- ${ok ? 'PASS' : 'FAIL'} ${label}`); pass &&= ok; }
console.log(md.join('\n'));
console.log(`\nManager kill gate: ${pass ? 'PASS' : 'FAIL'}`);
process.exitCode = pass ? 0 : 1;
