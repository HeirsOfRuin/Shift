// The lean tools kill gate: node prototypes/lean/run.mjs [--runs=100]
//
// The question (CATALOGUE.md, B2): a 5S event or a standard-work sheet is
// alive the week it is done and decays after. Does a loop where the
// improvement decays without an owner and an audit, and where re-running the
// event is the cheap-looking move, separate supervisor styles with none
// dominant, and show the "well-organised broken environment" as a number?
// Numbers only, no engine. If it does not separate, the module is not built.
//
// The model. Twelve weeks. `alive` is how much of the improvement is still
// standing, 0 to 1. The event sets it to 0.9. Every week it decays: 0.12
// with nobody owning it, 0.04 with an owner, half that again if the event was
// done with the crew rather than for them. An audit that week halves the
// decay again and tops it up: 0.08 with an owner, 0.03 without one (without
// an owner the audit finds the same things every week and the crew waits). When it is alive the floor's hours
// drop by up to 3 a week (nobody is looking for the gap gauge); when it is
// dead they come back. The supervisor has 8 free hours a week, less the
// fallout of an unrelated problem that lands every third week.
//   event     6 h   (8 h done with the crew)  alive = 0.9
//   owner     1 h   names on every area, once
//   audit     1 h   that week
// The passing cause: one seed in five, a natural owner emerges in the crew in
// week 2 and the decay drops to the owned, with-the-crew rate on its own.
// One week in five is a rush and the free hours go. The win: alive >= 0.55
// at week twelve, with the event run at most twice.

const args = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true]; }));
const RUNS = Number(args.runs || 100);
const WEEKS = 12;
const FREE = 8;
const HOURS = { event: 6, eventWith: 8, owner: 1, audit: 1 };

function rng(seed) { let s = seed >>> 0 || 1; return () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

function play(policy, seed) {
  const r = rng(seed);
  const s = { week: 1, alive: 0, owner: false, withCrew: false, events: 0, audits: 0, hours: 0, saved: 0, natural: r() < 0.2 };
  for (; s.week <= WEEKS; s.week++) {
    const fallout = s.week === 4 || s.week === 8 ? 3 : 0;
    const badWeek = r() < 0.2;                       // a rush: the free hours go
    let left = badWeek ? 0 : FREE - fallout + 3 * s.alive;
    const acts = POLICIES[policy](s);
    let audited = false;
    for (const act of acts) {
      const h = HOURS[act === 'eventWith' ? 'eventWith' : act];
      if (h > left) continue;
      left -= h; s.hours += h;
      if (act === 'event') { s.alive = 0.9; s.events++; s.withCrew = false; }
      if (act === 'eventWith') { s.alive = 0.9; s.events++; s.withCrew = true; }
      if (act === 'owner') s.owner = true;
      if (act === 'audit') { audited = true; s.audits++; }
    }
    if (s.natural && s.week >= 2) { s.owner = true; s.withCrew = true; }   // a natural owner emerges in the crew
    let decay = s.owner ? 0.04 : 0.12;
    if (s.withCrew) decay *= 0.5;
    // an audit holds it up; without an owner the audit finds the same things every week and the crew waits for it
    if (audited) { decay *= 0.5; s.alive = Math.min(1, s.alive + (s.owner ? 0.08 : 0.03)); }
    s.alive = Math.max(0, s.alive - decay * (0.7 + 0.6 * r()));
    s.saved += 3 * s.alive;
    if (s.alive >= 0.55) s.weeksAlive = (s.weeksAlive || 0) + 1;
  }
  return { win: s.alive >= 0.55 && s.events <= 2, alive: s.alive, events: s.events, audits: s.audits, hours: s.hours, saved: s.saved, natural: s.natural, weeksAlive: (s.weeksAlive || 0) / WEEKS };
}

const POLICIES = {
  eventer: (s) => (s.week === 1 || s.alive < 0.4 ? ['event'] : []),
  auditor: (s) => (s.week === 1 ? ['event'] : ['audit']),
  delegator: (s) => (s.week === 1 ? ['event'] : s.week === 2 ? ['owner'] : []),
  leaver: (s) => (s.week === 1 ? ['event'] : []),
  balanced: (s) => (s.week === 1 ? ['eventWith'] : s.week === 2 ? ['owner', 'audit'] : s.week <= 5 || s.week % 2 === 0 ? ['audit'] : []),
};

const se = (p, n = RUNS) => 100 * Math.sqrt(Math.max(p * (1 - p), 1 / n) / n);
const pct = (p) => `${(100 * p).toFixed(0)}% ±${se(p).toFixed(0)}`;
const within = (p, lo, hi) => p >= lo - 2 * se(p) / 100 && p <= hi + 2 * se(p) / 100;
const floor = (a, b) => 2 * Math.sqrt(se(a) ** 2 + se(b) ** 2) / 100;

const rows = Object.keys(POLICIES).map((policy) => {
  const outs = []; for (let i = 0; i < RUNS; i++) outs.push(play(policy, 1000 + i));
  const rate = (k) => outs.filter((o) => o[k]).length / RUNS;
  const mean = (k) => outs.reduce((a, o) => a + o[k], 0) / RUNS;
  return { policy, win: rate('win'), alive: mean('alive'), events: mean('events'), audits: mean('audits'), hours: mean('hours'), saved: mean('saved'), weeksAlive: mean('weeksAlive') };
});
const md = ['| Style | Win | Alive at week 12 | Weeks alive | Events run | Audits | Hours spent | Floor hours saved |', '|---|---|---|---|---|---|---|---|'];
for (const r of rows) md.push(`| ${r.policy} | ${pct(r.win)} | ${r.alive.toFixed(2)} | ${(100 * r.weeksAlive).toFixed(0)}% | ${r.events.toFixed(1)} | ${r.audits.toFixed(1)} | ${r.hours.toFixed(1)} | ${r.saved.toFixed(1)} |`);
const by = Object.fromEntries(rows.map((r) => [r.policy, r]));
const wins = rows.map((r) => r.win);
const hi = Math.max(...wins), lo = Math.min(...wins);
const checks = [
  [`styles diverge (spread ${(100 * (hi - lo)).toFixed(0)} points)`, hi - lo > floor(hi, lo)],
  ['no style best on every axis (win, alive, hours spent, hours saved)', !rows.some((r) => rows.every((o) => r.win >= o.win && r.alive >= o.alive && r.hours <= o.hours && r.saved >= o.saved))],
  [`balanced wins most, not all (${pct(by.balanced.win)}, want 50-90%)`, within(by.balanced.win, 0.5, 0.9) && by.balanced.win < 1],
  [`leaving loses most, not all (${pct(by.leaver.win)}, want 3-40%)`, within(by.leaver.win, 0.03, 0.4) && by.leaver.win > 0],
  [`the eventer re-runs the event and is alive less of the time than balanced (${by.eventer.events.toFixed(1)} events, alive ${(100 * by.eventer.weeksAlive).toFixed(0)}% of weeks against ${(100 * by.balanced.weeksAlive).toFixed(0)}%)`, by.eventer.events >= 2.5 && by.eventer.weeksAlive < by.balanced.weeksAlive],
  ['nothing beats balanced beyond the noise', rows.every((r) => r.win - by.balanced.win <= floor(r.win, by.balanced.win))],
];
md.push('');
let pass = true;
for (const [label, ok] of checks) { md.push(`- ${ok ? 'PASS' : 'FAIL'} ${label}`); pass &&= ok; }
console.log(md.join('\n'));
console.log(`\nLean kill gate: ${pass ? 'PASS' : 'FAIL'}`);
process.exitCode = pass ? 0 : 1;
