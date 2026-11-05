// The week: one plan in, one new state and one record out. Pure: no DOM, no
// Date, no Math.random. Same seed and same plans give the same module, which
// is what the bots, the tests and every measurement stand on.
//
// Written order (docs/DESIGN.md section 4; ordering bugs were a whole failure
// class in earlier builds, F22):
//   Monday (startWeek): arrivals, interruptions, the inbox
//   advance(): 1 your hours  2 routine  3 your actions  4 floor events
//   5 problems run  6 the lead while you are away  7 the cell  8 incidents
//   9 consequences land  10 morale and resignations  11 what you will know
//   12 the record, the end check, and next Monday

import { CONFIG as C } from '../data/config.data.js';
import { CREW, PLAYER_LEAD, DALE, ROLES } from '../data/crew.data.js';
import { PROBLEMS, LANDS_ON } from '../data/problems.data.js';
import { MODULES } from '../data/modules.data.js';
import { TYPES } from './problems.js';
import { streamFor, hashString } from './rng.js';
import { buildCards } from './cards.js';
import { applyEffects } from './effects.js';
import { say, fill } from './text.js';
import { judge } from './outcome.js';
import { clamp, round1, active, person, capacity, weldForecast, routineFor } from './derive.js';
export { routineFor };

// ---------------------------------------------------------------- the kernel
// What problem types and effects may touch. One place, so a type cannot reach
// into the UI or draw from a stream it does not own.
export function kernel(s, r, lines) {
  const K = {
    s, r, week: s.week, clamp, active,
    person: (id) => person(s, id),
    crew: () => s.crew,
    // A signal about a problem you have not noticed yet stays out of the report:
    // the report would otherwise tell you before you knew.
    line(kind, key, vars = {}) { if (kind === 'signal' && vars.p && !vars.p.seen) return; lines.push({ kind, text: say(s, key, vars) }); },
    say(key, vars = {}) { return say(s, key, vars); },
    lineRaw(kind, template, vars = {}) { lines.push({ kind, text: fill(s, template, vars) }); },
    spawn(type, who, opts) { return spawn(s, type, who, opts); },
    queue(weeks, kind, data, because) {
      s.queue.push({ week: s.week + weeks, kind, data, because: { week: s.week, text: say(s, because.key, because.vars || {}) } });
    },
    resolve(p, key, { root = false, settled = root } = {}) {
      p.state = 'resolved'; p.rootFixed = root; p.settled = settled; p.resolvedWeek = s.week;
      p.how = say(s, key, { p });
      for (const id of p.who) { const c = person(s, id); if (c) { c.defectAdd = 0; if (p.type === 'load') c.stress = 0; } }
      lines.push({ kind: 'result', text: p.how });
    },
    score(p, area, pts, note) { s.decisions.push({ week: s.week, problem: p?.id ?? null, area, pts, note }); },
  };
  return K;
}

// ---------------------------------------------------------------- problems
export function spawn(s, type, who, { main = false, seen = false, source = 'script', causes = null } = {}) {
  const def = PROBLEMS[type];
  const id = s.nextId++;
  const r = streamFor(s.seed, `problem${id}`, 'causes');
  const weights = causes || def.causes;
  const pick = r.weighted(Object.entries(weights).map(([k, w]) => ({ k, weight: w }))).k;
  const p = {
    id, type, who, cause: pick, story: pick, told: null, state: 'active', since: s.week, seenWeek: seen ? s.week : null,
    seen, main, source, rootFixed: false, settled: false, severity: 1, neglect: 0, sessions: 0,
    need: 3 + (r.chance(0.5) ? 1 : 0), tried: [], tries: {}, fails: {}, ruledOut: [], firefought: 0,
  };
  const story = def.stories[pick];
  if (story) for (const [alt, chance] of Object.entries(story)) if (r.chance(chance)) p.story = alt;
  s.problems.push(p);
  return p;
}

// The floor's hours, item by item: the standing load, what each open problem
// adds (seen or not: you feel a busier floor before you know why), new hands,
// a lead who is out or stretched, and anything you pushed off that came back.
function interruptions(s) {
  const I = C.interrupts;
  const items = (s.seat === 'lead' ? C.lead.floorLoad : s.seat === 'manager' ? C.manager.floorLoad : C.floorLoad).map((f) => ({ label: f.label, hours: f.hours }));
  if (s.seat !== 'lead' && s.dept.bench >= 0.55) items[0] = { label: `${items[0].label} (Kev takes some)`, hours: items[0].hours - 2 };
  // the answers live where people find them now (Say it once): fewer walk-ups
  if (s.dept.walkupsCut) { const w = items.find((it) => /walk-ups/i.test(it.label)); if (w) { w.hours = Math.max(1, w.hours - s.dept.walkupsCut); w.label = `${w.label} (fewer: the answers are on the board)`; } }
  let unseen = 0;
  for (const p of s.problems) {
    let h = 0;
    if (p.state === 'active') h = I.perProblem + I.perSeverity * (p.severity - 1) + (p.extraInterrupts || 0);
    if (p.state === 'quiet') h = 1;
    if (!h) continue;
    if (p.seen) items.push({ label: `Fallout from: ${say(s, `card.${p.type}.title`, { p, i: 0 })}`, hours: h, problem: true });
    else unseen += h;
  }
  if (unseen) items.push({ label: 'More walk-ups than usual, for reasons nobody has told you yet', hours: unseen, problem: true });
  // what dies of the 5S event comes back as hours looking for things (It looked great for a week)
  if (s.dept.lean !== null && s.dept.lean !== undefined) { const h = Math.round(C.lean.lost * (1 - s.dept.lean) * 2) / 2; if (h > 0) items.push({ label: 'Looking for the gap gauge, clamps, carts: the event wearing off', hours: h, problem: true }); }
  const newHands = s.crew.filter((c) => active(c) && c.skill < 0.45);
  if (newHands.length) items.push({ label: `${newHands.map((c) => c.name).join(' and ')} still ask${newHands.length > 1 ? '' : 's'} before guessing`, hours: newHands.length * I.newHand });
  const kev = person(s, 'kev');
  if (kev && !active(kev)) items.push({ label: 'Catching what Kev usually catches', hours: I.leadOut });
  else if (kev && kev.stress >= 3) items.push({ label: 'Kev is stretched; more of it comes to you', hours: I.leadStrained });
  for (const f of s.dept.floorExtra || []) if (f.from <= s.week && f.until >= s.week) items.push({ label: f.label, hours: f.hours, pushed: true });
  const total = Math.round(items.reduce((a, it) => a + it.hours, 0) * 2) / 2;
  return { total, items };
}

// ---------------------------------------------------------------- Monday
export function startWeek(s) {
  const module = MODULES[s.moduleId];
  for (const c of s.crew) { c.daysOut = c.carryOut || 0; c.carryOut = 0; c.lateness = 0; c.cramped = false; }
  for (const [i, a] of s.script.entries()) {
    if (a.week === s.week && !a.done) { a.done = true; spawn(s, a.type, a.who, { main: !!a.main, seen: !!a.seen, source: a.main ? 'main' : 'second' }); }
  }
  const meetings = (s.setup.meetings || {})[s.week] || 0;
  const away = meetings >= 12;
  const floor = interruptions(s);
  if (away) { for (const it of floor.items) it.hours = Math.round(it.hours * 0.4 * 2) / 2; floor.total = Math.round(floor.items.reduce((a, it) => a + it.hours, 0) * 2) / 2; }
  s.monday = {
    interrupts: floor.total,
    floorItems: floor.items,
    meetings,
    away,
    managerAway: !!(s.setup.managerAway && s.week >= s.setup.managerAway[0] && s.week <= s.setup.managerAway[1]),
    demand: (s.setup.demand || {})[s.week] ?? C.demand,
    weldContent: (s.setup.weldContent || {})[s.week] ?? C.weldContent,
  };
  s.monday.forecast = weldForecast(s);
  s.monday.cards = buildCards(s, module);
}

// The plan's hours, the one function the UI and the engine both use (rule 1).
/** The lead hand's hours at the table this week: what the tickets did not take,
 *  plus whatever they stayed past forty to make up. One derivation (rule 1). */
export function tableFor(s, plan) {
  if (s.seat !== 'lead') return null;
  const hours = hoursFor(s, plan);
  const skip = plan.skip || [];
  const routine = routineFor(s).filter((it) => !skip.includes(it.id)).reduce((a, it) => a + it.hours, 0);
  const chosen = Math.max(0, hours - s.monday.interrupts - s.monday.meetings - routine);
  // the standing week happens at the edges of the day; the tickets come off the table
  const worked = clamp(C.lead.table - chosen + Math.max(0, hours - C.hoursCeiling), 0, C.lead.table);
  return { worked: Math.round(worked * 2) / 2, of: C.lead.table };
}

export function hoursFor(s, plan) {
  const m = s.monday;
  let h = m.interrupts + m.meetings;
  const skip = plan.skip || [];
  for (const it of routineFor(s)) if (!skip.includes(it.id)) h += it.hours;
  for (const card of m.cards) {
    if (card.kind === 'routine') continue;
    const opt = card.options.find((o) => o.id === (plan.picks?.[card.id] ?? card.pick));
    if (opt) h += opt.hours;
  }
  return h;
}

// ---------------------------------------------------------------- the week
export function advance(prev, plan = {}) {
  if (prev.over) throw new Error('the module is over');
  const s = structuredClone(prev);
  const module = MODULES[s.moduleId];
  const m = s.monday;
  const lines = [];
  const r = {
    outcomes: streamFor(s.seed, s.week, 'outcomes'),
    people: streamFor(s.seed, s.week, 'people'),
    events: streamFor(s.seed, s.week, 'events'),
  };
  const K = kernel(s, r, lines);
  K.sharp = (s.dept.tired || 0) >= C.tiredSlips ? C.tiredOdds : 1;   // run down, fixes work less often
  s.week_ = { defects: 0, capacity: 0, demand: 0, capacityMul: 1, stationMul: { fit: 1, weld: 1, finish: 1 } };
  const picks = {};
  for (const card of m.cards) {
    if (card.kind === 'routine') continue;
    const id = plan.picks?.[card.id] ?? card.pick;
    if (!card.options.some((o) => o.id === id)) throw new Error(`no option ${id} on card ${card.id}`);
    picks[card.id] = id;
  }
  const skip = (plan.skip || []).filter((id) => routineFor(s).some((it) => it.id === id));
  const P = { skip, picks };

  // 1. your hours
  const hours = hoursFor(s, P);

  // 2. routine
  for (const id of skip) {
    if (id === 'meeting' || id === 'handover') s.dept.managerTrust = clamp(s.dept.managerTrust - (m.managerAway ? 0.01 : 0.05));
    if (id === 'handover') K.score(null, 'E1', -1, `Skipped the ten minutes with ${s.roles.sup.name}`);
    if (id === 'oneOnOne') { s.dept.supCap = clamp(s.dept.supCap - 0.02); K.score(null, 'A4', -1, 'Skipped the half hour with Kev'); }
    if (id === 'russ') s.dept.managerTrust = clamp(s.dept.managerTrust - 0.05);
    if (id === 'scheduler') s.dept.surprise = true;
    if (id === 'safety') { s.dept.safetyDebt += 0.01; K.score(null, 'C2', -1, 'Let the safety walk go'); }
    if (id === 'timecards') for (const c of s.crew) c.morale = clamp(c.morale - 0.03);
    if (id === 'huddles') { s.week_.capacityMul *= 0.97; for (const c of s.crew) c.morale = clamp(c.morale - 0.01); }
  }
  s.dept.auditedThisWeek = !!s.dept.flags?.leanAudit && !skip.includes('audit');
  if (skip.includes('audit')) K.score(null, 'B2', -1, 'Skipped the Friday audit');
  if (!skip.includes('safety')) s.dept.safetyDebt = Math.max(0, s.dept.safetyDebt - 0.01);

  // the lead hand's table time: leading comes off the table (FRAME-seats.md)
  const you = person(s, 'you');
  if (you) { const t = tableFor(s, P); you.tableShare = t.worked / t.of; if (t.worked < t.of * 0.5) lines.push({ kind: 'result', text: say(s, 'lead.table.thin', { n: t.worked }) }); }

  // 3. your actions, in card order
  let cover = 0;
  let walk = false;
  for (const card of m.cards) {
    if (card.kind === 'routine') continue;
    const opt = card.options.find((o) => o.id === picks[card.id]);
    if (card.kind === 'problem') {
      const p = s.problems.find((x) => x.id === card.problem);
      if (!p || p.state === 'resolved') continue;
      if (opt.id === 'leave') {
        const weeksSeen = s.week - (p.seenWeek ?? s.week);
        if (p.told && p.told === PROBLEMS[p.type].passing) K.score(p, areaFor(p.type), 1, 'Watched a passing thing instead of acting');
        else if (weeksSeen >= 1 && p.state === 'active') K.score(p, areaFor(p.type), -1, 'Left a signal alone');
        continue;
      }
      p.acted = true;
      if (s.seat === 'manager') { managerMove(s, K, r, p, opt.id, lines); continue; }
      if (opt.id === 'takeUp') {
        // the lead hand's one move for what is not theirs: take it to the supervisor
        const sup = s.roles.sup;
        const mine = Object.entries(PROBLEMS[p.type].actions).some(([, a]) => !a.needs && p.told && (a.fits || []).includes(p.told));
        if (!p.told) K.score(p, 'E1', -1, `Took it to ${sup.name} with nothing but a complaint`);
        else if (mine) K.score(p, 'E1', 0, `Sent ${sup.name} something that was yours to handle`);
        else { K.score(p, 'E1', 2, `Took it to ${sup.name} with the facts`); K.score(p, areaFor(p.type), 2, `Fitted the response to the cause, through ${sup.name}`); }
        if (!p.tried.includes('takeUp')) p.tried.push('takeUp');
        p.upDue = s.week + 1;
        s.queue.push({ week: s.week + 1, kind: 'leadUp', data: { id: p.id, told: p.told }, because: { week: s.week, text: '' } });
        lines.push({ kind: 'result', text: say(s, p.told ? 'lead.up.taken' : 'lead.up.takenBlind', { p }) });
        continue;
      }
      // knowing what you know: find out before acting, then act on what you found
      if (!p.told && opt.kind === 'ask') K.score(p, areaFor(p.type), 2, 'Found out before acting');
      else if (!p.told && ['fix', 'hold', 'soft', 'yourself', 'up', 'around'].includes(opt.kind)) K.score(p, areaFor(p.type, opt.kind), -1, 'Acted before finding out why');
      else if (p.told && (opt.fits || []).includes(p.told)) K.score(p, areaFor(p.type, opt.kind), 2, 'Acted on what you had found out');
      // changing course when a fix did not hold
      if (Object.keys(p.fails).length && !p.fails[opt.id] && opt.kind !== 'leave') K.score(p, areaFor(p.type, opt.kind), 2, 'Changed course when a fix did not hold');
      else if ((p.fails[opt.id] || 0) >= 2) K.score(p, areaFor(p.type, opt.kind), -1, 'Tried the same failed fix a third time');
      if (!p.tried.includes(opt.id)) p.tried.push(opt.id);
      p.tries[opt.id] = (p.tries[opt.id] || 0) + 1;
      const before = p.state;
      for (const [sub, pts, note] of TYPES[p.type].score(p, opt.id)) K.score(p, sub, pts, note);
      TYPES[p.type].act(K, p, opt.id);
      // a fix that needs rounds to show (the flow rules, a pending fix) is not a failure the week it is made
      if (p.state === before && before === 'active' && ['fix', 'hold'].includes(opt.kind) && !p.pending && p.type !== 'flow') p.fails[opt.id] = (p.fails[opt.id] || 0) + 1;
      continue;
    }
    if (card.kind === 'cover') { cover = Number(opt.days || 0); continue; }
    if (card.kind === 'walk') { walk = opt.id === 'walk'; if (walk) K.score(null, 'A1', 2, 'Made time to walk the floor'); continue; }
    if (card.kind === 'coach') {
      if (opt.id === 'none') continue;
      const c = person(s, opt.id);
      if (!c || !active(c)) continue;
      c.skill = clamp(c.skill + 0.03 * (1 - c.skill)); c.trust = clamp(c.trust + 0.03); c.morale = clamp(c.morale + 0.02);
      K.score(null, 'D1', 1, `Spent an hour coaching ${c.name}`);
      continue;
    }
    // scripted and request cards: effects are data
    applyEffects(K, opt.effects || [], { c: card.who?.[0] ? person(s, card.who[0]) : undefined });
    for (const [area, pts, note] of opt.score || []) K.score(null, area, pts, note);
    // prioritisation: what a careful reader could tell from the request itself
    for (const [area, pts, note] of triage(card, opt)) K.score(null, area, pts, note);
  }
  if (cover) lines.push({ kind: 'result', text: say(s, cover > 1 ? 'you.coveredDays' : 'you.coveredDay', { n: cover }) });

  // your own load: over forty is a symptom, and it accumulates
  const wasTired = s.dept.tired || 0;
  s.dept.tired = hours > C.hoursCeiling ? wasTired + (hours - C.hoursCeiling) * C.tiredPerHour : Math.max(0, wasTired - C.tiredRecover);
  const chosen = hours - m.interrupts - m.meetings - routineFor(s).filter((it) => !skip.includes(it.id)).reduce((a, it) => a + it.hours, 0);
  if (hours > C.tiredAt) K.score(null, 'A2', -1, 'Worked past forty-five');
  else if (hours <= C.hoursCeiling && chosen >= 2) K.score(null, 'A2', 2, 'Kept the week inside forty and still acted');
  else if (hours <= C.hoursCeiling) K.score(null, 'A2', 0, 'Kept the week short by choosing little');
  const lastHours = s.history.at(-1)?.hours ?? 0;
  if (lastHours > C.tiredAt && hours <= C.hoursCeiling + 2) K.score(null, 'F2', 2, 'Noticed your own load and pulled back');
  if (s.dept.tired >= C.tiredHome && wasTired < C.tiredHome) lines.push({ kind: 'consequence', text: say(s, 'you.tiredHome') });
  else if (s.dept.tired >= C.tiredSlips && wasTired < C.tiredSlips) lines.push({ kind: 'consequence', text: say(s, 'you.tiredSlips') });
  // reading the forecast before reaching for a stinger
  const cardCover = m.cards.find((c) => c.kind === 'cover');
  if (cardCover) {
    const gap = m.demand - m.forecast;
    if (cover && gap > 0) K.score(null, 'A3', 2, 'Saw the gap coming and covered it');
    else if (cover && gap < -0.3) K.score(null, 'A3', -1, 'Welded when the booths were fine');
    else if (!cover && gap > 1) K.score(null, 'A3', -1, 'Let a known gap go unfilled');
  }

  // you as the bottleneck
  if (hours > C.bottleneckAt) { s.dept.overStreak++; s.week_.capacityMul *= 0.95; K.score(null, 'F2', -1, 'Worked past the point of being useful'); }
  else s.dept.overStreak = 0;
  if (s.dept.overStreak >= C.bottleneckWeeks && !s.dept.bottleneck) { s.dept.bottleneck = true; lines.push({ kind: 'consequence', text: say(s, 'you.bottleneck') }); }
  const fatigue = hours > C.fatigueAt ? 0.008 : 0;

  // 4. floor events, drawn after the plan: you did not know
  let fitLost = 0;
  for (const c of s.crew) if (active(c) && r.events.chance(C.sickChance)) { const d = r.events.range(1, 3); c.daysOut += d; lines.push({ kind: 'event', text: say(s, d > 1 ? 'floor.sickDays' : 'floor.sickDay', { c, n: d }) }); }
  if (r.events.chance(C.pressChance)) { fitLost = r.events.range(1, 2); lines.push({ kind: 'event', text: say(s, 'floor.press', { n: fitLost }) }); }
  if (r.events.chance(C.rushChance)) { s.week_.demand += 1; lines.push({ kind: 'event', text: say(s, 'floor.rush') }); }
  if (r.events.chance(C.changeChance)) { s.week_.defects += 0.5; lines.push({ kind: 'event', text: say(s, 'floor.change') }); }
  if (s.dept.surprise) { s.week_.demand += 1; s.dept.surprise = false; lines.push({ kind: 'event', text: say(s, 'floor.surprise') }); }

  // the flow rounds: rules changed this week cost a learning dip, compounding when several change at once
  if (s.dept.flow) {
    const n = Math.min(3, s.dept.flowChanged.length);
    s.week_.capacityMul *= C.flow.dip[n] * (s.dept.flowDipNext || 1);
    s.dept.flowDipNext = C.flow.dipNext[n];
  }

  // 5. problems run their week (in the manager's seat, the supervisor acts first)
  if (s.seat === 'manager') supervisorActs(s, K, r, lines);
  for (const p of s.problems) {
    if (p.state === 'resolved') continue;
    if (p.state === 'quiet') {
      if (s.week >= p.quietUntil) { p.state = 'active'; p.severity++; lines.push({ kind: 'consequence', text: say(s, `${p.type}.back`, { p }) }); }
      else continue;
    }
    if (!p.acted) p.neglect++; else p.neglect = 0;
    p.acted = false;
    if (p.who.some((id) => { const c = person(s, id); return c && !active(c) && c.status !== 'leave'; })) { K.resolve(p, 'problem.personGone', { settled: false }); continue; }
    if (p.who.some((id) => person(s, id)?.status === 'leave')) continue;
    TYPES[p.type].week(K, p);
  }

  // 6. the lead while you are away (Pulled off the floor)
  if (m.away) leadWhileAway(s, K, r, lines);

  // 7. the cell
  const cap = (station) => s.crew.filter((c) => c.station === station).reduce((a, c) => a + capacity(c), 0);
  const weldContent = m.weldContent;
  let fitCap = cap('fit') * (5 - fitLost) / 5;
  let weldCap = cap('weld') / weldContent + cover * C.coverPerDay + s.week_.capacity;
  let finishCap = cap('finish');
  fitCap *= s.week_.capacityMul; weldCap *= s.week_.capacityMul; finishCap *= s.week_.capacityMul;
  // a station that is the constraint this week, and any improvement that stuck (Where it waits)
  const imp = s.dept.improved || {};
  fitCap *= s.week_.stationMul.fit * (1 + (imp.fit || 0)); weldCap *= s.week_.stationMul.weld * (1 + (imp.weld || 0)); finishCap *= s.week_.stationMul.finish * (1 + (imp.finish || 0));
  const d = s.dept;
  d.fitBuf += fitCap;
  const weldOut = Math.max(0, Math.min(weldCap, d.fitBuf));
  d.fitBuf = Math.min(d.fitBuf - weldOut, d.flow?.pull ? C.flow.pullRack : C.fitRack);
  const welders = s.crew.filter((c) => c.station === 'weld' && active(c));
  const wsum = welders.reduce((a, c) => a + capacity(c), 0) || 1;
  const standardDrag = Math.max(0, C.standardHome - d.standard);
  let defects = s.week_.defects;
  for (const c of welders) defects += weldOut * (capacity(c) / wsum) * (C.baseDefect * (1.6 - c.skill) + c.defectAdd) * (1 + standardDrag);
  const donnaIn = active(person(s, 'donna'));
  const escapes = defects * Math.min(0.9, (C.escapeShare + (d.escapeAdd || 0) + (skip.includes('paint') ? 0.1 : 0)) * (donnaIn ? 1 : 1.6));
  const found = defects - escapes;
  d.weldBuf += weldOut;
  const shipped = Math.max(0, Math.min(Math.max(0, finishCap - found * (d.flow?.check === 'source' ? C.flow.reworkSource : C.reworkCost)), d.weldBuf));
  d.weldBuf -= shipped;
  const asked = m.demand + s.week_.demand;
  d.shipped += shipped; d.demanded += asked;
  d.escapes += escapes; d.rework += found;
  if (escapes > 0.3) d.managerTrust = clamp(d.managerTrust - 0.03);
  if (shipped < asked - 0.5) d.managerTrust = clamp(d.managerTrust - 0.03);

  // 8. incidents
  for (const c of s.crew) {
    if (!active(c)) continue;
    const risk = C.incidentBase + d.safetyDebt + fatigue + (c.defectAdd > 0.1 ? 0.004 : 0) + standardDrag * 0.01;
    if (r.events.chance(risk)) {
      c.status = 'injured'; d.lost.push({ id: c.id, why: 'injured', week: s.week });
      lines.push({ kind: 'consequence', text: say(s, 'floor.injury', { c }) });
      s.trace.push({ week: s.week, text: say(s, 'trace.injury', { c }), because: d.safetyDebt > 0.015 ? say(s, 'because.safetySkipped') : fatigue ? say(s, 'because.tired') : standardDrag > 0.1 ? say(s, 'because.standardSlipped') : say(s, 'because.badLuck') });
    }
  }

  // 9. consequences land
  const landing = s.queue.filter((q) => q.week <= s.week);
  s.queue = s.queue.filter((q) => q.week > s.week);
  for (const q of landing) land(s, K, q, lines);

  // 10. morale drift and resignations
  for (const c of s.crew) {
    if (!active(c)) continue;
    c.morale = clamp(c.morale + (C.moraleHome - c.morale) * 0.08);
    if (c.morale < C.quitMorale) c.lowMorale++; else c.lowMorale = 0;
    if (c.lowMorale >= 2 && !c.leaving) { c.leaving = true; K.queue(1 + r.people.int(3), 'quit', { id: c.id, morale: true }, { key: 'because.lowMorale', vars: { c } }); }
  }
  d.standard = clamp(d.standard + (C.standardHome - d.standard) * 0.03);
  const kev = person(s, 'kev');
  if (!m.away && kev && active(kev) && !s.problems.some((p) => p.type === 'load' && p.who.includes('kev') && p.state !== 'resolved')) kev.stress = Math.max(0, kev.stress - 0.5);

  // 11. what you will know on Monday
  for (const p of s.problems) {
    if (p.seen || p.state === 'resolved') continue;
    const a = person(s, p.who[0]);
    const roll = r.outcomes.next();
    let how = null;
    if (TYPES[p.type].notice(K, p, P)) how = 'obvious';
    else if (walk && roll < (K.sharp < 1 ? 0.7 : 0.85)) how = 'walk';
    else if (cover && roll < 0.5) how = 'cover';
    else if (p.severity >= 2 || (a && a.stress >= 3) || roll < 0.2) how = 'loud';
    else if (m.away && s.dept.bench > 0.4 && roll < s.dept.bench) how = 'lead';
    if (how) { p.seen = true; p.seenWeek = s.week + 1; lines.push({ kind: 'signal', text: say(s, `notice.${p.type}.${how}`, { p }) }); }
  }

  // 12. the record, the end check, next Monday
  if (shipped < C.starveBelow) d.starvedStreak++; else d.starvedStreak = 0;
  if (d.starvedStreak >= C.starveWeeks) d.starved = true;
  const bodies = Math.round(shipped);   // the one number Friday shows (rule 1)
  const record = {
    week: s.week, hours, interrupts: m.interrupts, meetings: m.meetings, shipped: round1(shipped), bodies, asked,
    found: round1(found), escapes: round1(escapes), cover, walk, skip,
    ...(d.flow ? { wip: round1(d.fitBuf + d.weldBuf), rules: { ...d.flow }, changed: [...d.flowChanged] } : {}),
    lines: [{ kind: 'number', text: say(s, bodies >= asked ? 'friday.met' : 'friday.short', { n: bodies, asked }) }, ...lines,
      { kind: 'number', text: say(s, hours > C.bottleneckAt ? 'friday.hours.bottleneck' : hours > C.tiredAt ? 'friday.hours.long' : hours > C.hoursCeiling ? 'friday.hours.over' : 'friday.hours.ok', { n: Math.round(hours) }) },
      ...(hours > C.hoursCeiling ? [{ kind: 'number', text: say(s, 'friday.why', { n: Math.round(m.interrupts), item: biggest(m.floorItems) }) }] : [])],
  };
  s.history.push(record);
  // a change the crew has not taken slides back to the old way by Friday, now and then
  if (d.flow && d.flowChanged.length) {
    record.slid = [];
    for (const rule of d.flowChanged) if (r.events.next() < C.flow.slide) { d.flow[rule] = { batch: 6, pull: false, check: 'end' }[rule]; record.slid.push(rule); record.lines.push({ kind: 'consequence', text: say(s, `flow.slid.${rule}`) }); }
    d.flowChanged = [];
  }
  delete s.week_;
  s.week++;
  if (s.week > s.weeks || d.starved) { s.over = true; s.outcome = judge(s); }
  else startWeek(s);
  return { state: s, record };
}

// Prioritisation from the inbox: refusing what nobody needs and making time for
// your own people and safety. Read from the request's cue, which is what a
// careful reader gets from its words; deadlines are a trade and score nothing.
function triage(card, opt) {
  if (card.kind !== 'script' || !['optional', 'people', 'safety'].includes(card.cue)) return [];
  const did = opt.kind !== 'skip';
  if (card.cue === 'optional') return did ? [['A1', -1, 'Spent hours on something nobody needed']] : [['A1', 2, 'Said no to something that could wait']];
  const what = card.cue === 'safety' ? 'a safety item' : 'one of your own people';
  return did ? [['A1', 1, `Made time for ${what}`]] : [['A1', -1, `Put off ${what}`]];
}

// The focus area a problem type belongs to: finding out before acting on a
// lateness is accountability, on a hazard it is safety (CATALOGUE.md).
function areaFor(type, kind = null) {
  if (type === 'otherside' && ['fix', 'hold', 'yourself', 'soft'].includes(kind)) return 'C3';
  if (type === 'bench' && kind === 'ask') return 'D1';
  return { late: 'D2', rework: 'D1', load: 'D1', friction: 'D3',
    hazard: 'C2', recurring: 'B3', escalation: 'E1', standards: 'E2', constraint: 'B1', huddle: 'F1', newhand: 'D4', otherside: 'E2', customer: 'E4', infowork: 'B5', erp: 'B6', lean: 'B2', flow: 'B7', bench: 'A4' }[type];
}

// ---------------------------------------------------------------- the manager's seat
// Every problem reaches Dana through Kev. Her four moves (KILLGATE-manager.md):
// coach, direct, rescue, leave. Kev then acts every week whatever she did
// (supervisorActs). Kev's actions run through a muted kernel, because the
// types' lines are in the player's voice; one line says what he did.
const fitsFor = (p) => Object.entries(PROBLEMS[p.type].actions).find(([, a]) => p.told && (a.fits || []).includes(p.told));
const askFor = (p) => Object.entries(PROBLEMS[p.type].actions).find(([, a]) => a.kind === 'ask');
const guessFor = (p) => Object.entries(PROBLEMS[p.type].actions).find(([, a]) => a.kind === 'fix');

function kevDoes(s, r, p, action) {
  const K2 = kernel(s, { outcomes: streamFor(s.seed, s.week, `kev${p.id}`), people: streamFor(s.seed, s.week, `kevPeople${p.id}`) }, []);
  K2.sharp = 1;
  if (!p.tried.includes(action)) p.tried.push(action);
  p.tries[action] = (p.tries[action] || 0) + 1;
  const before = p.state;
  TYPES[p.type].act(K2, p, action);
  if (p.state === before && before === 'active' && ['fix', 'hold'].includes(PROBLEMS[p.type].actions[action].kind)) p.fails[action] = (p.fails[action] || 0) + 1;
  return p.state === 'resolved';
}

function managerMove(s, K, r, p, move, lines) {
  const d = s.dept;
  const kev = s.roles.senior;
  p.hovered = false;
  if (move === 'coach') {
    if (!p.told) {
      d.supCap = clamp(d.supCap + 0.04);
      K.score(p, 'A4', 2, 'Asked what he had found before telling him anything');
      const ask = askFor(p);
      if (ask) kevDoes(s, r, p, ask[0]);
      if (p.told) { lines.push({ kind: 'told', text: say(s, 'mgr.coach.found', { p }) }); lines.push({ kind: 'told', text: say(s, `know.${p.type}.${p.told}`, { p }) }); }
      else lines.push({ kind: 'result', text: say(s, 'mgr.coach.nothingYet', { p }) });
    } else if (!p.plan) {
      d.supCap = clamp(d.supCap + 0.04);
      p.plan = 'his';
      K.score(p, 'A4', 2, 'Asked for his plan and let it be his');
      lines.push({ kind: 'result', text: say(s, fitsFor(p) ? 'mgr.coach.plan' : 'mgr.coach.wait', { p }) });
    } else {
      d.supCap = clamp(d.supCap - 0.02);
      p.hovered = true;
      K.score(p, 'A4', -1, 'Checked in on a plan he already had');
      lines.push({ kind: 'result', text: say(s, 'mgr.coach.hover', { p }) });
    }
  } else if (move === 'direct') {
    d.supCap = clamp(d.supCap - 0.03);
    if (p.told) { p.plan = 'yours'; K.score(p, 'A4', 0, 'Told him what to do, and it fitted what he had found'); lines.push({ kind: 'result', text: say(s, 'mgr.direct.told', { p }) }); }
    else { p.plan = 'guess'; K.score(p, 'A4', -1, 'Told him what to do before either of you knew why'); lines.push({ kind: 'result', text: say(s, 'mgr.direct.guess', { p }) }); }
  } else if (move === 'rescue') {
    d.supCap = clamp(d.supCap - 0.06);
    K.score(p, 'A4', -1, 'Went down and sorted it out yourself');
    const ask = askFor(p);
    if (!p.told && ask) kevDoes(s, r, p, ask[0]);
    const fit = fitsFor(p);
    const done = fit ? kevDoes(s, r, p, fit[0]) : false;
    if (done) p.how = say(s, 'mgr.how.rescue', { p });
    lines.push({ kind: 'result', text: say(s, done ? 'mgr.rescue.done' : fit ? 'mgr.rescue.tried' : 'mgr.rescue.nothing', { p }) });
    for (const c of s.crew) c.trust = clamp(c.trust - 0.01);
  }
}

function supervisorActs(s, K, r, lines) {
  const d = s.dept;
  for (const p of s.problems) {
    if (p.state !== 'active' || !p.seen) continue;
    const rr = r.people.next();
    if (p.plan) {
      const guess = p.plan === 'guess' || p.plan === 'hisGuess';
      const odds = guess ? 0.3 : p.hovered ? 0.5 : 0.75;
      const fit = guess ? guessFor(p) : fitsFor(p);
      if (!fit) { p.acted = true; lines.push({ kind: 'result', text: say(s, 'mgr.kev.waiting', { p }) }); continue; }
      if (rr < odds) {
        p.acted = true;
        const done = kevDoes(s, r, p, fit[0]);
        if (done) {
          p.how = say(s, { his: 'mgr.how.his', yours: 'mgr.how.yours', guess: 'mgr.how.yours', hisGuess: 'mgr.how.hisGuess' }[p.plan], { p });
          if (p.plan === 'his') { d.supCap = clamp(d.supCap + 0.03); K.score(p, 'A4', 1, 'Left it with him, and he had it'); }
          lines.push({ kind: 'result', text: say(s, 'mgr.kev.settled', { p }) });
        } else lines.push({ kind: 'result', text: say(s, 'mgr.kev.tried', { p }) });
      } else if (guess) { lines.push({ kind: 'result', text: say(s, p.plan === 'guess' ? 'mgr.kev.guessFailed' : 'mgr.kev.hisGuessFailed', { p }) }); p.plan = null; p.severity++; }
    } else if (rr < (p.told ? d.supCap : d.supCap + C.manager.foundBonus)) {
      p.acted = true;
      if (!p.told) {
        const ask = askFor(p);
        if (ask) kevDoes(s, r, p, ask[0]);
        if (p.told) { lines.push({ kind: 'told', text: say(s, 'mgr.kev.found', { p }) }); lines.push({ kind: 'told', text: say(s, `know.${p.type}.${p.told}`, { p }) }); }
      } else {
        // on his own, his plan is right as often as his capability says; a coached plan is right
        p.plan = r.people.next() < d.supCap + C.manager.planBonus ? 'his' : 'hisGuess';
        lines.push({ kind: 'result', text: say(s, p.plan === 'hisGuess' ? 'mgr.kev.guessPlan' : fitsFor(p) ? 'mgr.kev.plan' : 'mgr.kev.waitPlan', { p }) });
      }
    }
  }
}

// While you are in the audit room, the floor runs on whatever bench you built.
function leadWhileAway(s, K, r, lines) {
  const kev = person(s, 'kev');
  if (!active(kev)) return;
  const bench = s.dept.bench;
  // Decisions wait for someone who is not there; the floor slows unless the lead is ready.
  s.week_.capacityMul *= 0.88 + 0.12 * bench;
  // What you did not hand over lands on Kev. Some weeks are quieter than others.
  kev.stress += (1 - bench) * (1 + r.people.next() * 1.2);
  for (const p of s.problems) {
    if (p.state !== 'active' || p.who.includes('kev')) continue;
    if (r.people.next() < bench) {
      const fit = Object.entries(PROBLEMS[p.type].actions).find(([, a]) => (a.fits || []).includes(p.cause));
      if (fit && r.people.next() < 0.7) {
        p.acted = true; p.tries[fit[0]] = (p.tries[fit[0]] || 0) + 1;
        TYPES[p.type].act(K, p, fit[0]);
      } else p.acted = true;   // he kept it from getting worse
    }
  }
  if (kev.stress >= 4 && !s.problems.some((p) => p.type === 'load' && p.who.includes('kev') && p.state !== 'resolved')) {
    const p = spawn(s, 'load', ['kev'], { source: 'away', causes: { unowned: 1 } });
    p.seen = true; p.seenWeek = s.week + 1;
    lines.push({ kind: 'consequence', text: say(s, 'away.kevStrained', { p }) });
    s.trace.push({ week: s.week, text: say(s, 'trace.kevBuckled'), because: say(s, 'because.benchThin') });
  }
}

function land(s, K, q, lines) {
  const d = s.dept;
  const trace = (key, vars) => s.trace.push({ week: s.week, text: say(s, key, vars), because: q.because?.text || '' });
  if (q.kind === 'quit') {
    const c = person(s, q.data.id);
    if (!c || !active(c)) return;
    if (q.data.morale && c.morale > 0.45) { c.leaving = false; return; }
    c.status = 'quit'; d.lost.push({ id: c.id, why: 'quit', week: s.week });
    for (const p of s.problems) if (p.who.includes(c.id) && p.state !== 'resolved') K.resolve(p, 'problem.personGone', { settled: false });
    for (const o of s.crew) o.morale = clamp(o.morale - 0.04);
    lines.push({ kind: 'consequence', text: say(s, 'land.quit', { c }) });
    trace('trace.quit', { c });
  }
  if (q.kind === 'leave') {
    const c = person(s, q.data.id);
    if (c && active(c)) { c.status = 'leave'; c.returnWeek = s.week + q.data.weeks; lines.push({ kind: 'consequence', text: say(s, 'land.leave', { c }) }); trace('trace.leave', { c }); s.queue.push({ week: s.week + q.data.weeks, kind: 'return', data: { id: c.id }, because: q.because }); }
  }
  if (q.kind === 'return') {
    const c = person(s, q.data.id);
    if (c && c.status === 'leave') {
      c.status = 'active'; c.stress = 0;
      for (const p of s.problems) if (p.who.includes(c.id) && p.type === 'load' && p.state !== 'resolved') K.resolve(p, 'load.afterLeave', { settled: false });
      lines.push({ kind: 'event', text: say(s, 'land.return', { c }) });
    }
  }
  if (q.kind === 'spread') {
    const target = [person(s, 'tyler'), ...s.crew].find((c) => c && active(c) && c.id !== q.data.from && !s.problems.some((p) => p.state !== 'resolved' && p.type === 'late' && p.who.includes(c.id)));
    if (!target) return;
    const p = spawn(s, 'late', [target.id], { source: 'spread', main: !!q.data.main, causes: { attitude: 1 } });
    p.story = 'attitude';
    for (const c of s.crew) c.morale = clamp(c.morale - 0.02);
    lines.push({ kind: 'consequence', text: say(s, 'land.spread', { c: target, from: person(s, q.data.from) }) });
    trace('trace.spread', { c: target, from: person(s, q.data.from) });
  }
  if (q.kind === 'blowup') {
    const [a, b] = q.data.ids.map((id) => person(s, id));
    for (const c of [a, b]) if (c) c.morale = clamp(c.morale - 0.12);
    lines.push({ kind: 'consequence', text: say(s, 'land.blowup', { a, b }) });
    trace('trace.blowup', { a, b });
  }
  if (q.kind === 'fumes') {
    const c = person(s, q.data.id);
    if (!c || !active(c)) return;
    c.status = 'injured'; d.lost.push({ id: c.id, why: 'fumes', week: s.week });
    lines.push({ kind: 'consequence', text: say(s, 'land.fumes', { c }) });
    trace('trace.fumes', { c });
  }
  if (q.kind === 'overstep') {
    d.managerTrust = clamp(d.managerTrust - 0.15);
    lines.push({ kind: 'consequence', text: say(s, 'land.overstep') });
    trace('trace.overstep', {});
  }
  if (q.kind === 'kickbackWar') {
    d.peerTrust = clamp(d.peerTrust - 0.15); d.standard = clamp(d.standard - 0.08);
    lines.push({ kind: 'consequence', text: say(s, 'land.kickbackWar') });
    trace('trace.kickbackWar', {});
  }
  if (q.kind === 'leadUp') {
    const p = s.problems.find((x) => x.id === q.data.id);
    if (!p || p.state === 'resolved') return;
    p.upDue = null;
    const sup = s.roles.sup;
    if (!q.data.told) { d.managerTrust = clamp(d.managerTrust - 0.03); lines.push({ kind: 'told', text: say(s, 'lead.up.noFacts', { p }) }); return; }
    const fit = Object.entries(PROBLEMS[p.type].actions).find(([, a]) => a.needs && (a.fits || []).includes(q.data.told));
    if (!fit) { lines.push({ kind: 'told', text: say(s, 'lead.up.yours', { p }) }); return; }
    // the supervisor does it their way: the action's own lines are in the
    // player's voice, so they are dropped and one line says what happened
    const K2 = kernel(s, { outcomes: streamFor(s.seed, s.week, 'sup'), people: streamFor(s.seed, s.week, 'supPeople') }, []);
    K2.sharp = 1;
    p.tries[fit[0]] = (p.tries[fit[0]] || 0) + 1;
    TYPES[p.type].act(K2, p, fit[0]);
    d.managerTrust = clamp(d.managerTrust + 0.03);
    if (p.state === 'resolved') { p.how = say(s, 'lead.up.how', { p }); lines.push({ kind: 'result', text: say(s, 'lead.up.done', { p }) }); }
    else lines.push({ kind: 'result', text: say(s, 'lead.up.tried', { p }) });
    if (p.state === 'resolved') for (const c of s.crew) if (c.id !== 'you') c.trust = clamp(c.trust + 0.01);
  }
  if (q.kind === 'constraintMoves') {
    const next = { fit: 'finish', finish: 'weld', weld: 'fit' }[q.data.from];
    const p = spawn(s, 'constraint', [], { source: 'moved', causes: { [next]: 1 } });
    p.seen = false;
    lines.push({ kind: 'consequence', text: say(s, 'land.constraintMoved', { from: q.data.from }) });
  }
  if (q.kind === 'effects') {
    applyEffects(K, q.data.effects || [], {});
    if (q.data.line) lines.push({ kind: 'consequence', text: fill(s, q.data.line, {}) });
    if (q.data.trace) trace(q.data.trace, {});
  }
}

// ---------------------------------------------------------------- a new module
export function newModule(moduleId, seed, seat = 'supervisor', opts = {}) {
  const module = MODULES[moduleId];
  if (!module) throw new Error(`no module ${moduleId}`);
  if (!(module.seats || ['supervisor']).includes(seat)) throw new Error(`${module.title} is not written for the ${seat} seat`);
  const crew = crewFor(module, seat);
  const ids = new Set(crew.map((c) => c.id));
  const rs = streamFor(seed >>> 0, 'module', 'script');
  const script = [];
  if (module.main) script.push({ ...module.main, week: module.main.week || 1, main: module.goal === 'main' });
  if (module.second) {
    const types = Object.keys(LANDS_ON).filter((t) => !(module.second.not || []).includes(t));
    const type = rs.pick(types);
    const taken = new Set(module.main?.who || []);
    const here = LANDS_ON[type].filter((w) => w.every((id) => ids.has(id)));
    const options = here.filter((w) => !w.some((id) => taken.has(id) || (module.second.avoid || []).includes(id)));
    const [lo, hi] = module.second.weeks || [3, 5];
    script.push({ type, who: rs.pick(options.length ? options : here), week: rs.range(lo, hi), seen: false });
  }
  const s = {
    v: 1, seed: seed >>> 0, moduleId, seat, roles: { ...structuredClone(ROLES[seat]), erp: { name: opts.erp || 'the system', full: opts.erp || 'the system', pronoun: 'it' } }, week: 1, weeks: module.weeks, over: false, outcome: null,
    setup: structuredClone(module.setup || {}),
    crew: crew.map((c) => ({ ...structuredClone(c), status: 'active', daysOut: 0, lateness: 0, defectAdd: 0, stress: 0, carryOut: 0, lowMorale: 0, leaving: false, cramped: false })),
    dept: {
      fitBuf: 1.5, weldBuf: 0.5, shipped: 0, demanded: 0, escapes: 0, rework: 0,
      standard: C.standardHome, bench: 0.3, managerTrust: 0.6, peerTrust: 0.5, safetyDebt: 0, fixtureFixed: false, escapeAdd: 0,
      overStreak: 0, bottleneck: false, tired: 0, floorExtra: [], starvedStreak: 0, starved: false, lost: [], surprise: false, flags: {}, routineGone: [], usedCards: [], improved: {},
      supCap: seat === 'manager' ? C.manager.supCap : null,
      lean: module.setup?.lean ?? null, leanOwner: false, leanWith: false, auditedThisWeek: false,
      flow: module.setup?.flow ? { ...module.setup.flow } : null, flowChanged: [], flowDipNext: 1,
    },
    problems: [], queue: [], nextId: 1, script: script.filter(Boolean),
    history: [], decisions: [], trace: [], monday: null,
  };
  for (const [id, change] of Object.entries(module.setup?.crew || {})) Object.assign(person(s, id), change);
  if (module.setup?.dept) Object.assign(s.dept, module.setup.dept);
  startWeek(s);
  return s;
}

/** The crew for a module: the bay's seven, with one swapped out if the module
 *  says so (The new hand: Lyle out on leave, Sam in his spot). */
export function crewFor(module, seat = 'supervisor') {
  const swap = module.setup?.swap;
  let crew = seat === 'lead' ? CREW.map((c) => (c.id === 'kev' ? PLAYER_LEAD : c)) : seat === 'manager' ? CREW.map((c) => (c.id === 'kev' ? DALE : c)) : CREW;
  if (swap) crew = crew.map((c) => (c.id === swap.out ? { ...swap.in, station: swap.in.station || c.station, slot: swap.in.slot ?? c.slot } : c));
  return crew;
}

function biggest(items) {
  const fallout = items.filter((it) => it.problem || it.pushed).sort((a, b) => b.hours - a.hours)[0];
  const top = fallout || [...items].sort((a, b) => b.hours - a.hours)[0];
  return top.label.charAt(0).toLowerCase() + top.label.slice(1);
}

export const digestOf = (s) => hashString(JSON.stringify([s.week, s.dept.shipped, s.problems.map((p) => [p.state, p.cause]), s.crew.map((c) => c.status)]));
