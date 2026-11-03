// Shift kill gate: the welding department as numbers only. No interface, no text
// beyond a trace. Pure and deterministic: (state, plan) -> state, seeded streams.
//
// The question this answers (SPEC.md "Kill gate"): does the loop produce
// different outcomes for different leadership styles, with no style winning on
// every axis, the balanced style winning most seeds but not all, and ignoring
// the floor losing most seeds but not all?
//
// v2 after the first run (history in docs/KILLGATE.md):
//  - hours were not scarce: the floor's interruptions were missing. Now every
//    unresolved problem, every new hand and an absent lead cost you hours
//    whether you plan for them or not;
//  - ignoring could never win: every problem needed an action. Now each problem
//    type has a passing cause that sorts itself out, where acting costs hours
//    and heavy action does harm;
//  - causes were too clean: now people sometimes give you a cover story, and
//    acting on it does not work, which is how you find out.
//
// Every number here is a first guess and a parameter (P below), not a fact.

// ---------------------------------------------------------------- rng
function hash(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h;
}
function mulberry(a) {
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
// Named streams so a change in one system does not shift another's draws.
function streams(seed) {
  const s = {};
  for (const name of ['events', 'causes', 'people', 'outcomes']) s[name] = mulberry(hash(`${seed}:${name}`));
  return s;
}
const pick = (r, weights) => {
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  let x = r() * total;
  for (const [k, w] of Object.entries(weights)) { x -= w; if (x <= 0) return k; }
  return Object.keys(weights).at(-1);
};
const clamp = (x, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, x));
const randint = (r, lo, hi) => lo + Math.floor(r() * (hi - lo + 1));

// ---------------------------------------------------------------- parameters
export const P = {
  weeks: 8,
  demand: 6,                 // bodies a week paint expects
  starveBelow: 4.75,         // a week under this counts toward paint starving
  starveWeeks: 2,            // consecutive weeks under the floor end the module
  scheduleShare: 0.95,       // shipped / demanded at the end to count as schedule met
  rate: { fit: 3.9, weld: 2.35, finish: 3.8 },   // bodies a week per person at skill 0.6, morale 0.7, 5 days; full strength makes about 6.4
  supWeldPerDay: 0.42,       // bodies a day when you cover a weld station
  weldContent: 1.1,          // average welding work per body for the week's mix (Drayman = 1.0)
  baseDefect: 0.06,
  reworkCost: 0.5,           // finish capacity a defect found at finish costs
  escapeShare: 0.3,          // share of defects finish misses and paint finds
  routine: { meeting: 2, scheduler: 1, safety: 1, timecards: 1.5, paint: 0.5, huddles: 2.5 },
  interrupts: { base: 27, perProblem: 2, perSeverity: 1, newHand: 1, leadOut: 6, leadStrained: 2 },
  incidentBase: 0.0012,      // per person per week; fatigue, skipped safety walks and rushing add to it
  sickChance: 0.05, pressChance: 0.08, rushChance: 0.1, changeChance: 0.06,
  quitMorale: 0.22,          // morale under this for two weeks starts a resignation
  overHours: 55, overWeeks: 3,
};

// ---------------------------------------------------------------- the crew (ORG.md)
const CREW = [
  { id: 'kev', name: 'Kev', station: 'fit', skill: 0.85, morale: 0.7, trust: 0.6, lead: true },
  { id: 'lyle', name: 'Lyle', station: 'fit', skill: 0.8, morale: 0.65, trust: 0.5 },
  { id: 'brent', name: 'Brent', station: 'weld', skill: 0.75, morale: 0.7, trust: 0.5 },
  { id: 'marisol', name: 'Marisol', station: 'weld', skill: 0.62, morale: 0.7, trust: 0.55 },
  { id: 'tyler', name: 'Tyler', station: 'weld', skill: 0.5, morale: 0.7, trust: 0.5 },
  { id: 'donna', name: 'Donna', station: 'finish', skill: 0.85, morale: 0.68, trust: 0.55 },
  { id: 'joel', name: 'Joel', station: 'finish', skill: 0.4, morale: 0.75, trust: 0.5 },
];

// ---------------------------------------------------------------- problems
// Each problem draws a hidden cause when it appears. Actions cost hours; the right
// action depends on the cause; finding the cause costs hours too. One cause per
// type is "passing": it ends by itself, and the right move is to watch it.
export const PROBLEMS = {
  late: {
    causes: { childcare: 0.35, ride: 0.3, attitude: 0.35 },
    passing: 'ride',
    // what a talk tells you: attitude sometimes comes back as a story about the truck
    stories: { attitude: { ride: 0.4 } },
    actions: { talk: 1, document: 1.5, accommodate: 0.5, carpool: 1, remind: 0.25 },
  },
  rework: {
    causes: { untrained: 0.4, rushing: 0.25, fixture: 0.15, newJig: 0.2 },
    passing: 'newJig',
    stories: {},
    actions: { fixYourself: 2, correct: 0.5, coach: 1, investigate: 3, document: 1.5, fixFixture: 4 },
  },
  load: {
    causes: { unowned: 0.45, personal: 0.3, crunch: 0.25 },
    passing: 'crunch',
    stories: { personal: { unowned: 0.3 } },
    actions: { talk: 1, redistribute: 2, timeOff: 1, carry: 3 },
  },
  friction: {
    causes: { workload: 0.3, personal: 0.25, roles: 0.25, badWeek: 0.2 },
    passing: 'badWeek',
    stories: { personal: { workload: 0.35 } },
    actions: { separate: 2, reset: 1.5, expectations: 1, warning: 0.5, clarify: 3 },
  },
};

// Who a problem of each type can land on, when a scenario draws it.
const WHO = {
  late: [['brent'], ['tyler'], ['lyle'], ['joel']],
  rework: [['tyler'], ['marisol'], ['brent']],
  load: [['kev'], ['donna']],
  friction: [['marisol', 'donna'], ['brent', 'tyler'], ['kev', 'donna'], ['lyle', 'brent']],
};

// Single problems are the reference; a module carries its main problem plus one
// more that arrives mid-module, drawn per seed, which is what the plan's modules
// look like ("3 to 5 designed decision points and random floor events").
export const SCENARIOS = {
  'late+': [{ week: 1, type: 'late', who: ['brent'] }, { week: 'rand', type: 'rand', not: 'late' }],
  'rework+': [{ week: 1, type: 'rework', who: ['tyler'] }, { week: 'rand', type: 'rand', not: 'rework' }],
  'load+': [{ week: 1, type: 'load', who: ['kev'] }, { week: 'rand', type: 'rand', not: 'load' }],
  'friction+': [{ week: 1, type: 'friction', who: ['marisol', 'donna'] }, { week: 'rand', type: 'rand', not: 'friction' }],
  late: [{ week: 1, type: 'late', who: ['brent'] }],
  rework: [{ week: 1, type: 'rework', who: ['tyler'] }],
  load: [{ week: 1, type: 'load', who: ['kev'] }],
  friction: [{ week: 1, type: 'friction', who: ['marisol', 'donna'] }],
  season: [
    { week: 1, type: 'late', who: ['brent'] },
    { week: 2, type: 'rework', who: ['tyler'] },
    { week: 3, type: 'load', who: ['kev'] },
    { week: 4, type: 'friction', who: ['marisol', 'donna'] },
  ],
};

// ---------------------------------------------------------------- state
export function newGame(seed, scenario = 'season') {
  const s = {
    seed, scenario, week: 1, done: false,
    crew: CREW.map((c) => ({ ...c, status: 'active', daysOut: 0, lowMorale: 0, lateness: 0, defectAdd: 0, stress: 0 })),
    fitBuf: 1.5, weldBuf: 0.5, shipped: 0, demanded: 0,
    managerTrust: 0.6, safetyDebt: 0, fixtureFixed: false,
    problems: [], queue: [], nextId: 1, lastInterrupts: 16,
    hoursHistory: [], shippedHistory: [], interruptHistory: [],
    fails: { starvedStreak: 0, starved: false, lost: [], overStreak: 0, bottleneck: false },
    escapes: 0, rework: 0, incidents: 0,
    tags: {}, log: [],
  };
  s._rng = streams(seed);
  // draw the scenario's random arrivals now, from their own stream
  const rs = mulberry(hash(`${seed}:scenario`));
  s.script = SCENARIOS[scenario].map((sc) => {
    if (sc.week !== 'rand') return sc;
    const types = Object.keys(PROBLEMS).filter((t) => t !== sc.not);
    const type = types[Math.floor(rs() * types.length)];
    const main = SCENARIOS[scenario][0].who;
    const options = WHO[type].filter((w) => !w.some((id) => main.includes(id)));
    return { week: 3 + Math.floor(rs() * 3), type, who: options[Math.floor(rs() * options.length)] };
  });
  return s;
}

// What a player (or a bot) can see: what people told you, not the hidden cause.
export function view(s) {
  return {
    week: s.week, weeks: P.weeks,
    crew: s.crew.map(({ id, name, station, status, lead }) => ({ id, name, station, status, lead })),
    problems: s.problems.filter((p) => p.state !== 'resolved' && p.seen).map((p) => ({
      id: p.id, type: p.type, who: p.who, told: p.told, weeks: s.week - p.since,
      sessions: p.sessions, suppressed: p.state === 'suppressed', tried: [...p.tried], failed: [...p.failed], failedTwice: Object.keys(p.fails).filter((k) => p.fails[k] >= 2),
    })),
    projected: projectWeld(s), demand: P.demand, shipped: s.shipped, demanded: s.demanded,
    routine: Object.values(P.routine).reduce((a, b) => a + b, 0),
    lastInterrupts: s.lastInterrupts, costs: Object.fromEntries(Object.entries(PROBLEMS).map(([k, v]) => [k, v.actions])),
  };
}

function person(s, id) { return s.crew.find((c) => c.id === id); }
const active = (c) => c.status === 'active';
function tag(s, key, n = 1) { s.tags[key] = (s.tags[key] || 0) + n; }
function log(s, line) { s.log.push(`w${s.week} ${line}`); }
function queue(s, weeksAhead, kind, data, cause) { s.queue.push({ week: s.week + weeksAhead, kind, data, cause }); }

function capacityOf(c) {
  if (!active(c)) return 0;
  const avail = clamp((5 - c.daysOut - c.lateness) / 5, 0, 1);
  const skillF = (0.6 + 0.5 * c.skill) / 0.9;
  const moraleF = (0.85 + 0.25 * c.morale) / 1.025;
  return P.rate[c.station] * skillF * moraleF * avail;
}
function projectWeld(s) {
  return s.crew.filter((c) => c.station === 'weld').reduce((a, c) => a + capacityOf(c), 0) / P.weldContent;
}

function interruptions(s) {
  const I = P.interrupts;
  let h = I.base;
  for (const p of s.problems) {
    if (p.state === 'active') h += I.perProblem + I.perSeverity * (p.severity - 1);
    if (p.state === 'suppressed') h += 1;
  }
  h += s.crew.filter((c) => active(c) && c.skill < 0.45).length * I.newHand;
  const kev = person(s, 'kev');
  if (!active(kev)) h += I.leadOut;
  else if (kev.stress >= 3) h += I.leadStrained;
  return h;
}

// ---------------------------------------------------------------- the week
// plan: { cover: days of welding, actions: [{problem, action} | {coach: id}], skip: ['timecards', ...] }
export function advance(s, plan) {
  if (s.done) throw new Error('advance after done');
  const r = s._rng;
  const week = s.week;
  for (const c of s.crew) { c.daysOut = c.carryOut || 0; c.carryOut = 0; c.lateness = 0; }
  let hours = 0, extraDemand = 0, fitLostDays = 0, reworkExtra = 0, capacityMul = 1;

  // ---- problems arrive (Monday)
  for (const [i, sc] of s.script.entries()) if (sc.week === week) spawn(s, sc.type, sc.who, 'script').main = i === 0 || s.scenario === 'season';

  // ---- the floor takes its hours first
  const interrupts = interruptions(s);
  hours += interrupts;

  // ---- routine
  const skip = new Set(plan.skip || []);
  for (const [k, h] of Object.entries(P.routine)) {
    if (!skip.has(k)) { hours += h; continue; }
    tag(s, `skip:${k}`);
    if (k === 'meeting') s.managerTrust = clamp(s.managerTrust - 0.05);
    if (k === 'safety') s.safetyDebt += 0.01;
    if (k === 'timecards') for (const c of s.crew) c.morale = clamp(c.morale - 0.03);
    if (k === 'huddles') { capacityMul *= 0.97; for (const c of s.crew) c.morale = clamp(c.morale - 0.01); }
  }
  if (!skip.has('safety')) s.safetyDebt = Math.max(0, s.safetyDebt - 0.01);

  // ---- actions on problems and people
  for (const a of plan.actions || []) {
    if (a.coach) {
      const c = person(s, a.coach);
      if (!c || !active(c)) continue;
      hours += 1;
      c.skill = clamp(c.skill + 0.03 * (1 - c.skill));
      c.trust = clamp(c.trust + 0.03);
      c.morale = clamp(c.morale + 0.02);
      tag(s, 'coach');
      continue;
    }
    const p = s.problems.find((x) => x.id === a.problem);
    if (!p || p.state === 'resolved') continue;
    const cost = PROBLEMS[p.type].actions[a.action];
    if (cost === undefined) throw new Error(`no action ${a.action} for ${p.type}`);
    hours += cost;
    p.acted = true;
    p.tried.add(a.action);
    p.tries[a.action] = (p.tries[a.action] || 0) + 1;
    tag(s, `${p.type}:${a.action}`);
    const before = p.state;
    act(s, p, a.action);
    if (p.state === before && before === 'active' && ['accommodate', 'carpool', 'redistribute', 'timeOff', 'reset', 'clarify', 'fixFixture', 'document', 'expectations'].includes(a.action)) {
      p.failed.add(a.action); p.fails[a.action] = (p.fails[a.action] || 0) + 1;
    }
  }

  // ---- walking the floor: two hours a week to see what the numbers will not show you
  if (plan.walk) { hours += 2; tag(s, 'walk'); }

  // ---- covering a weld station yourself
  const coverDays = Math.min(plan.cover || 0, 3);
  hours += coverDays * 8;
  if (coverDays) tag(s, 'cover', coverDays);

  // ---- you as the bottleneck
  if (hours > P.overHours) { s.fails.overStreak++; capacityMul *= 0.95; } else s.fails.overStreak = 0;
  if (s.fails.overStreak >= P.overWeeks) s.fails.bottleneck = true;
  const fatigue = hours > 50 ? 0.008 : 0;

  // ---- floor events (drawn after the plan: you did not know)
  for (const c of s.crew) if (active(c) && r.events() < P.sickChance) c.daysOut += randint(r.events, 1, 3);
  if (r.events() < P.pressChance) fitLostDays = randint(r.events, 1, 2);
  if (r.events() < P.rushChance) extraDemand = 1;
  if (r.events() < P.changeChance) reworkExtra += 0.5;

  // ---- problems run their week
  for (const p of s.problems) if (p.state !== 'resolved') runProblem(s, p);

  // ---- the cell
  let fitCap = s.crew.filter((c) => c.station === 'fit').reduce((a, c) => a + capacityOf(c), 0) * (5 - fitLostDays) / 5;
  let weldCap = s.crew.filter((c) => c.station === 'weld').reduce((a, c) => a + capacityOf(c), 0) / P.weldContent + coverDays * P.supWeldPerDay;
  let finishCap = s.crew.filter((c) => c.station === 'finish').reduce((a, c) => a + capacityOf(c), 0);
  fitCap *= capacityMul; weldCap *= capacityMul; finishCap *= capacityMul;

  s.fitBuf += fitCap;
  const weldOut = Math.min(weldCap, s.fitBuf);
  s.fitBuf = Math.min(s.fitBuf - weldOut, 4);
  const welders = s.crew.filter((c) => c.station === 'weld' && active(c));
  const wsum = welders.reduce((a, c) => a + capacityOf(c), 0) || 1;
  let defects = reworkExtra;
  for (const c of welders) defects += weldOut * (capacityOf(c) / wsum) * (P.baseDefect * (1.6 - c.skill) + c.defectAdd);
  const donnaIn = active(person(s, 'donna'));
  const escapes = defects * P.escapeShare * (donnaIn ? 1 : 1.6);
  const found = defects - escapes;
  s.weldBuf += weldOut;
  const shipped = Math.min(Math.max(0, finishCap - found * P.reworkCost), s.weldBuf);
  s.weldBuf -= shipped;
  s.shipped += shipped;
  s.demanded += P.demand + extraDemand;
  s.escapes += escapes; s.rework += found;
  if (escapes > 0.3) s.managerTrust = clamp(s.managerTrust - 0.03);
  if (shipped < P.demand + extraDemand - 0.5) s.managerTrust = clamp(s.managerTrust - 0.03);

  // ---- incidents
  for (const c of s.crew) {
    if (!active(c)) continue;
    const risk = P.incidentBase + s.safetyDebt + fatigue + (c.defectAdd > 0.1 ? 0.004 : 0);
    if (r.events() < risk) {
      s.incidents++;
      c.status = 'injured';
      s.fails.lost.push({ id: c.id, why: 'incident', week });
      log(s, `${c.name} injured`);
    }
  }

  // ---- consequences land
  const landing = s.queue.filter((q) => q.week === week);
  s.queue = s.queue.filter((q) => q.week !== week);
  for (const q of landing) land(s, q);

  // ---- morale drift and resignations
  for (const c of s.crew) {
    if (!active(c)) continue;
    c.morale = clamp(c.morale + (0.68 - c.morale) * 0.08);
    if (c.morale < P.quitMorale) c.lowMorale++; else c.lowMorale = 0;
    if (c.lowMorale >= 2 && !c.leaving) { c.leaving = true; queue(s, randint(r.people, 1, 3), 'quit', { id: c.id }, 'low morale'); }
  }

  // ---- what you will know on Monday
  for (const p of s.problems) {
    if (p.seen || p.state === 'resolved') continue;
    const a = person(s, p.who[0]);
    const r2 = r.outcomes();
    if (p.type === 'late' && !skip.has('timecards')) p.seen = true;            // it is on the timecards
    else if (p.type === 'rework') p.seen = true;                               // QC writes it up
    else if (plan.walk && r2 < 0.85) p.seen = true;                            // you saw it
    else if (coverDays && r2 < 0.5) p.seen = true;                             // you were standing next to it
    else if (p.severity >= 2 || (a && a.stress >= 3) || r2 < 0.2) p.seen = true; // it got loud enough
    if (p.seen) p.seenWeek = s.week;
  }

  // ---- Friday
  if (shipped < P.starveBelow) s.fails.starvedStreak++; else s.fails.starvedStreak = 0;
  if (s.fails.starvedStreak >= P.starveWeeks) s.fails.starved = true;
  s.hoursHistory.push(hours);
  s.interruptHistory.push(interrupts);
  s.lastInterrupts = interrupts;
  s.shippedHistory.push(shipped);
  s.week++;
  if (s.week > P.weeks || s.fails.starved) s.done = true;
  return s;
}

function spawn(s, type, who, source) {
  const def = PROBLEMS[type];
  const cause = pick(s._rng.causes, def.causes);
  const p = {
    id: s.nextId++, type, who, cause, told: null, state: 'active', since: s.week, sessions: 0, neglect: 0,
    source, rootFixed: false, settled: false, severity: 1, tried: new Set(), failed: new Set(), tries: {}, fails: {}, need: 3,
  };
  // what you will be told if you ask: the truth, or the story
  p.need = 3 + (s._rng.causes() < 0.5 ? 1 : 0);
  const story = def.stories[cause];
  p.story = cause;
  if (story) for (const [alt, chance] of Object.entries(story)) if (s._rng.causes() < chance) p.story = alt;
  s.problems.push(p);
  log(s, `${type} appears (${who.join('+')}; cause ${cause}${p.story !== cause ? `, will say ${p.story}` : ''})`);
  return p;
}

function resolve(s, p, how, { root = false, settled = root } = {}) {
  p.state = 'resolved';
  p.rootFixed = root;
  p.settled = settled;
  p.resolvedWeek = s.week;
  p.how = how;
  for (const id of p.who) { const c = person(s, id); if (c) { c.defectAdd = 0; c.stress = 0; } }
  log(s, `${p.type} resolved by ${how}${root ? ' (root)' : settled ? ' (settled)' : ''}`);
}

// ---------------------------------------------------------------- actions by cause
function act(s, p, action) {
  const r = s._rng.outcomes;
  const [a, b] = p.who.map((id) => person(s, id));
  const passing = p.cause === PROBLEMS[p.type].passing;
  const ask = () => { if (!p.told) p.told = p.story; };
  // The right action usually works, not always: a second try works more often.
  const works = (first, again) => r() < ((p.tries[action] || 0) > 1 ? again : first);
  switch (p.type) {
    case 'late': {
      if (action === 'talk') {
        ask(); a.trust = clamp(a.trust + 0.05);
        if (p.cause === 'attitude' && p.tried.has('document')) resolve(s, p, 'a talk after the write-up', { root: true });
      }
      if (action === 'document') {
        p.heldThisWeek = true;
        if (p.cause === 'attitude') {
          a.trust = clamp(a.trust - 0.05);
          // Holding the line has a price: some people walk rather than be written up.
          if (!p.walkChecked) { p.walkChecked = true; if (r() < 0.12) queue(s, 1, 'quit', { id: a.id }, `${a.name} taking the write-up badly`); }
          if (works(0.7, 0.85)) { resolve(s, p, 'documenting', { root: true }); for (const c of s.crew) c.morale = clamp(c.morale + 0.02); }
        }
        else if (p.cause === 'ride') { a.morale = clamp(a.morale - 0.08); a.trust = clamp(a.trust - 0.1); }
        else { a.morale = clamp(a.morale - 0.15); a.trust = clamp(a.trust - 0.15); p.severity++; }
      }
      if (action === 'accommodate') {
        if (p.cause === 'childcare') { a.trust = clamp(a.trust + 0.05); if (works(0.8, 0.9)) { resolve(s, p, 'a start-time change', { root: true }); a.morale = clamp(a.morale + 0.1); } }
        else if (p.cause === 'attitude') { p.severity++; tag(s, 'rewarded-attitude'); for (const c of s.crew) if (c !== a) c.morale = clamp(c.morale - 0.03); }
      }
      if (action === 'carpool') {
        if (p.cause === 'ride' && works(0.85, 0.9)) { resolve(s, p, 'a carpool', { root: true }); a.trust = clamp(a.trust + 0.08); }
      }
      if (action === 'remind') { p.heldThisWeek = true; if (p.cause === 'attitude') { p.state = 'suppressed'; p.suppressedUntil = s.week + 2; } }
      break;
    }
    case 'rework': {
      if (action === 'fixYourself') p.fixedThisWeek = true;
      if (action === 'correct') { a.trust = clamp(a.trust - 0.02); if (p.cause === 'rushing' && r() < 0.5) resolve(s, p, 'a correction', { root: false, settled: true }); }
      if (action === 'coach') {
        p.sessions++; a.trust = clamp(a.trust + 0.04);
        if (p.cause === 'untrained') { a.skill = clamp(a.skill + 0.06); if (p.sessions >= p.need) resolve(s, p, 'coaching sessions', { root: true }); }
        if (p.cause === 'rushing' && r() < 0.6) resolve(s, p, 'coaching on pace', { root: true });
        if (p.cause === 'fixture' && r() < 0.5) ask();
        if (p.cause === 'newJig' && p.sessions >= 1) ask();
      }
      if (action === 'investigate') ask();
      if (action === 'document') {
        if (p.cause === 'rushing' && r() < 0.5) { resolve(s, p, 'a written warning', { root: false, settled: true }); a.morale = clamp(a.morale - 0.1); }
        else { a.morale = clamp(a.morale - 0.12); a.trust = clamp(a.trust - 0.1); }
      }
      if (action === 'fixFixture') { if (p.cause === 'fixture' && works(0.9, 1)) { s.fixtureFixed = true; resolve(s, p, 'fixing the fixture', { root: true }); } }
      break;
    }
    case 'load': {
      if (action === 'talk') { ask(); a.trust = clamp(a.trust + 0.05); a.stress = Math.max(0, a.stress - 0.5); }
      if (action === 'redistribute') {
        if (p.cause === 'unowned') { a.stress = Math.max(0, a.stress - 1); if (works(0.7, 0.85)) { resolve(s, p, 'handing out what he was carrying', { root: true }); a.morale = clamp(a.morale + 0.1); } }
        else if (passing) { a.stress = Math.max(0, a.stress - 1); }
        else a.stress += 0.5;
      }
      if (action === 'timeOff') {
        if (p.cause === 'personal') { a.carryOut = 2; if (works(0.8, 0.9)) { resolve(s, p, 'time off', { root: true }); a.morale = clamp(a.morale + 0.12); } }
        else a.carryOut = 2;
      }
      if (action === 'carry') { a.stress = Math.max(0, a.stress - 1); p.carriedThisWeek = true; }
      break;
    }
    case 'friction': {
      if (action === 'separate') { ask(); a.trust = clamp(a.trust + 0.03); b.trust = clamp(b.trust + 0.03); }
      if (action === 'reset') {
        const ok = (p.cause === 'workload' || p.cause === 'roles' || passing) && (p.told || r() < 0.5);
        if (ok && works(0.75, 0.85)) resolve(s, p, 'a joint reset', { root: true });
        else if (ok) { /* they agreed in the room and went back to it */ }
        else { a.morale = clamp(a.morale - 0.05); b.morale = clamp(b.morale - 0.05); p.severity++; }
      }
      if (action === 'expectations') {
        if (p.cause === 'personal' ? works(0.65, 0.8) : r() < 0.25) resolve(s, p, 'setting expectations', { root: p.cause === 'personal' });
      }
      if (action === 'warning') {
        p.state = 'suppressed'; p.suppressedUntil = s.week + 2; a.trust = clamp(a.trust - 0.05); b.trust = clamp(b.trust - 0.05);
        if (!p.walkChecked) { p.walkChecked = true; if (r() < 0.08) queue(s, 1, 'quit', { id: (r() < 0.5 ? a : b).id }, 'a warning taken badly'); }
      }
      if (action === 'clarify') {
        if (p.cause === 'roles' && works(0.8, 0.9)) resolve(s, p, 'clarifying who owns what', { root: true });
        else if (p.cause === 'workload' && r() < 0.5) resolve(s, p, 'clarifying who owns what', { root: true });
      }
      break;
    }
  }
}

// ---------------------------------------------------------------- problems run
function runProblem(s, p) {
  const r = s._rng.people;
  const [a, b] = p.who.map((id) => person(s, id));
  if (p.state === 'suppressed') {
    if (s.week >= p.suppressedUntil) { p.state = 'active'; p.severity++; log(s, `${p.type} back`); }
    else return;
  }
  if (!p.acted) p.neglect++; else p.neglect = 0;
  p.acted = false;
  if (p.who.some((id) => !active(person(s, id)) && person(s, id).status !== 'leave')) { resolve(s, p, 'the person leaving'); return; }
  const age = s.week - p.since;
  switch (p.type) {
    case 'late': {
      a.lateness += 0.4 * p.severity;
      // The crew watches what happens to late, not what you said about it: two
      // weeks of lateness with no standard held, and someone else starts too.
      if (p.cause === 'attitude') {
        if (p.heldThisWeek) p.unchecked = 0; else p.unchecked = (p.unchecked || 0) + 1;
        p.heldThisWeek = false;
        if (p.unchecked >= 2 && !p.spread) { p.spread = true; queue(s, randint(r, 1, 2), 'spread', { from: a.id }, `${a.name}'s lateness tolerated`); }
      }
      if (p.cause === 'childcare') {
        a.morale = clamp(a.morale - 0.03 * p.severity);
        if (p.neglect >= 3 && !p.quitQueued) { p.quitQueued = true; if (r() < 0.6) queue(s, randint(r, 2, 4), 'quit', { id: a.id }, `${a.name}'s childcare problem left alone`); }
      }
      if (p.cause === 'ride' && age >= 1 && r() < 0.4) resolve(s, p, 'the truck coming back from the shop', { settled: true });
      break;
    }
    case 'rework': {
      a.defectAdd = p.cause === 'fixture' ? 0.18 : p.cause === 'newJig' ? 0.1 : 0.14;
      if (p.cause === 'fixture') for (const c of s.crew) if (c.station === 'weld' && c !== a && active(c)) c.defectAdd = Math.max(c.defectAdd, 0.05);
      if (p.fixedThisWeek) { a.defectAdd = 0; p.fixedThisWeek = false; }
      if (p.cause === 'untrained') a.skill = clamp(a.skill + 0.01);
      if (p.neglect >= 2 && p.cause !== 'newJig') a.morale = clamp(a.morale - 0.02);
      if (p.cause === 'newJig' && age >= 2 && r() < 0.5) resolve(s, p, 'the crew getting used to the new jig', { settled: true });
      break;
    }
    case 'load': {
      if (p.carriedThisWeek) { p.carriedThisWeek = false; break; }
      a.stress += p.cause === 'crunch' ? 0.7 : 1;
      a.morale = clamp(a.morale - 0.04);
      for (const c of s.crew) if (c !== a) c.morale = clamp(c.morale - 0.008);
      if (p.cause === 'crunch' && age >= 2 && r() < 0.5) { resolve(s, p, 'the rush ending', { settled: true }); break; }
      if (a.stress >= 5 && !p.blown) {
        p.blown = true;
        if (r() < 0.4) queue(s, 1, 'quit', { id: a.id }, `${a.name} carrying it alone`);
        else queue(s, 1, 'leave', { id: a.id, weeks: 2 }, `${a.name} carrying it alone`);
      }
      break;
    }
    case 'friction': {
      a.morale = clamp(a.morale - 0.03 * p.severity); b.morale = clamp(b.morale - 0.03 * p.severity);
      if (p.cause === 'badWeek' && age >= 1 && p.severity === 1 && r() < 0.5) { resolve(s, p, 'a better week', { settled: true }); break; }
      if ((p.neglect >= 4 || p.severity >= 3) && !p.blown) {
        p.blown = true;
        const who = r() < 0.5 ? a : b;
        if (r() < 0.5) queue(s, 1, 'quit', { id: who.id }, `the friction between ${a.name} and ${b.name}`);
        else queue(s, 0, 'blowup', { ids: [a.id, b.id] }, `the friction between ${a.name} and ${b.name}`);
      }
      break;
    }
  }
}

function land(s, q) {
  if (q.kind === 'quit') {
    const c = person(s, q.data.id);
    if (!c || !active(c)) return;
    if (q.cause === 'low morale' && c.morale > 0.45) { c.leaving = false; return; }   // recovered in time
    c.status = 'quit';
    s.fails.lost.push({ id: c.id, why: q.cause, week: s.week });
    for (const p of s.problems) if (p.who.includes(c.id) && p.state !== 'resolved') resolve(s, p, 'the person leaving');
    for (const o of s.crew) o.morale = clamp(o.morale - 0.04);
    log(s, `${c.name} quits (${q.cause})`);
  }
  if (q.kind === 'leave') {
    const c = person(s, q.data.id);
    if (c && active(c)) { c.status = 'leave'; log(s, `${c.name} off on stress leave`); queue(s, q.data.weeks, 'return', { id: c.id }, 'return'); }
  }
  if (q.kind === 'return') {
    const c = person(s, q.data.id);
    if (c && c.status === 'leave') { c.status = 'active'; c.stress = 0; for (const p of s.problems) if (p.who.includes(c.id) && p.type === 'load' && p.state !== 'resolved') resolve(s, p, 'stress leave'); }
  }
  if (q.kind === 'spread') {
    const target = [person(s, 'tyler'), ...s.crew].find((c) => c && active(c) && c.id !== q.data.from && !s.problems.some((p) => p.state !== 'resolved' && p.type === 'late' && p.who.includes(c.id)));
    if (target) {
      const p = spawn(s, 'late', [target.id], 'spread');
      p.cause = 'attitude'; p.story = 'attitude';
      p.main = s.problems.some((x) => x.main && x.type === 'late' && x.who.includes(q.data.from));
      for (const c of s.crew) c.morale = clamp(c.morale - 0.02);
    }
  }
  if (q.kind === 'blowup') {
    for (const id of q.data.ids) { const c = person(s, id); if (c) c.morale = clamp(c.morale - 0.12); }
    log(s, 'blow-up on the floor');
  }
}

// ---------------------------------------------------------------- outcomes
export function outcome(s) {
  const scheduleMet = s.shipped >= P.scheduleShare * s.demanded;
  // The win asks for the module's problem settled (SPEC: "the module's problem
  // solved at the root rather than tolerated or blown up"). A background problem
  // still open at the end is carried over, not a loss, unless it cost a person.
  const settled = s.problems.filter((p) => p.main).every((p) => p.state === 'resolved' && p.settled);
  const carried = s.problems.filter((p) => !p.main && p.state !== 'resolved').length;
  const lost = s.fails.lost.length;
  const onLeave = s.crew.some((c) => c.status === 'leave');
  const win = scheduleMet && lost === 0 && !onLeave && settled && !s.fails.bottleneck && !s.fails.starved;
  const here = s.crew.filter(active);
  const avg = (f) => here.reduce((a, c) => a + f(c), 0) / Math.max(1, here.length);
  return {
    win, scheduleMet, settled, carried, lost, onLeave, starved: s.fails.starved, bottleneck: s.fails.bottleneck,
    shipShare: s.shipped / s.demanded, hours: s.hoursHistory.reduce((a, b) => a + b, 0) / s.hoursHistory.length,
    maxHours: Math.max(...s.hoursHistory), morale: avg((c) => c.morale), trust: avg((c) => c.trust),
    escapes: s.escapes, incidents: s.incidents,
  };
}
