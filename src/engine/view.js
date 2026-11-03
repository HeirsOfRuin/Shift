// Everything the screens show, computed here. The UI computes nothing (rule 1):
// hours come from hoursFor, words for moods from derive, and every empty or
// locked state carries its reason (rule 6).

import { CONFIG as C } from '../data/config.data.js';
import { MODULES, TRACK } from '../data/modules.data.js';
import { STATIONS, CREW } from '../data/crew.data.js';
import { hoursFor } from './week.js';
import { unlocked } from './state.js';
import { moodWord, standardWord, trustWord, active } from './derive.js';
import { say } from './text.js';

export function trackView(save) {
  return {
    id: TRACK.id, title: TRACK.title, intro: TRACK.intro, openAll: save.track.openAll,
    modules: TRACK.modules.map((id, i) => {
      const m = MODULES[id];
      const t = save.track.modules[id];
      const open = unlocked(save, id);
      return {
        id, n: i + 1, title: m.title, teaches: m.teaches, weeks: m.weeks, open,
        why: open ? '' : `Opens when "${MODULES[TRACK.modules[i - 1]].title}" is signed off by your coach.`,
        plays: t.plays, wins: t.wins, last: t.last, debriefed: !!t.debrief, signedOff: t.signedOff,
      };
    }),
    inRun: save.run ? { moduleId: save.run.moduleId, title: MODULES[save.run.moduleId].title, week: save.run.week, over: save.run.over } : null,
  };
}

export function briefView(id) {
  const m = MODULES[id];
  return { id, title: m.title, teaches: m.teaches, handbook: m.handbook, weeks: m.weeks, brief: m.brief, goal: m.goalText, lose: m.lose };
}

/** The week screen. `plan` is the player's current picks, so the hours bar is live. */
export function weekView(s, plan = {}) {
  const m = s.monday;
  const module = MODULES[s.moduleId];
  const hours = s.over ? 0 : hoursFor(s, plan);
  const routineHours = s.over ? 0 : C.routine.filter((it) => !s.dept.routineGone.includes(it.id) && !(plan.skip || []).includes(it.id)).reduce((a, it) => a + it.hours, 0);
  const limit = hours > C.bottleneckAt ? say(s, 'limit.bottleneck') : hours > C.fatigueAt ? say(s, 'limit.fatigue') : hours > C.tiredAt ? say(s, 'limit.tired') : hours > C.hoursCeiling ? say(s, 'limit.over') : say(s, 'limit.ok', { n: Math.max(0, Math.round((C.hoursCeiling - hours) * 2) / 2) });
  const last = s.history[s.history.length - 1];
  return {
    module: { id: s.moduleId, title: module.title, goal: module.goalText },
    week: Math.min(s.week, s.weeks), weeks: s.weeks, over: s.over, outcome: s.outcome,
    hours: { total: hours, floor: s.over ? 0 : m.interrupts, meetings: s.over ? 0 : m.meetings, routine: routineHours, chosen: Math.max(0, hours - (m?.interrupts || 0) - (m?.meetings || 0) - routineHours), ceiling: C.hoursCeiling, tired: C.tiredAt, bottleneck: C.bottleneckAt, limit },
    away: m?.away, managerAway: m?.managerAway,
    cards: s.over ? [] : m.cards,
    paint: { lastShipped: last?.bodies ?? null, lastAsked: last?.asked ?? null, shipped: Math.round(s.dept.shipped), asked: s.dept.demanded, thisWeek: m?.demand, forecast: m?.forecast },
    dept: { standard: standardWord(s.dept.standard), streak: s.dept.overStreak },
    floor: floorView(s),
    crew: crewView(s),
    history: s.history,
    trace: s.trace,
  };
}

/** What the pixel floor shows: who is where, how they look from across the bay,
 *  and what the bay itself shows (booth three's haze, a shut booth). */
export function floorView(s) {
  const open = s.problems.filter((p) => p.state === 'active');
  const hazard = s.problems.find((p) => p.type === 'hazard' && p.state !== 'resolved');
  const flags = { haze: !!hazard && !hazard.shut, boothShut: !!hazard?.shut };
  const people = s.crew.map((c) => {
    let state = 'working';
    if (!active(c)) state = 'absent';
    else if (c.daysOut >= 3) state = 'absent';
    else if (open.some((p) => p.who.includes(c.id) && p.type === 'friction' && p.severity >= 2)) state = 'frustrated';
    else if (c.morale < 0.45 || c.stress >= 3) state = 'frustrated';
    else if (open.some((p) => p.who.includes(c.id) && (p.type === 'friction' || p.type === 'load'))) state = 'talking';
    else if (c.daysOut > 0 || c.lateness > 0.3) state = 'idle';
    return { id: c.id, name: c.name, station: c.station, slot: c.slot, look: c.look, state, lead: !!c.lead, caption: captionFor(c, state) };
  });
  return { people, flags };
}

const STATE_WORDS = { working: 'working', idle: 'standing around more than usual', talking: 'in a conversation that looks like it is not about work', frustrated: 'looks fed up', absent: 'not here' };
function captionFor(c, state) {
  const where = { fit: 'fit-up', weld: 'body weld', finish: 'finish' }[c.station];
  return `${c.name}, ${where}: ${STATE_WORDS[state]}.`;
}

/** The title screen's bay: everyone working, nothing wrong yet. */
export function demoFloor() {
  return {
    people: CREW.map((c) => ({ id: c.id, name: c.name, station: c.station, slot: c.slot, look: c.look, state: 'working', lead: !!c.lead, caption: captionFor(c, 'working') })),
    flags: { haze: false, boothShut: false },
  };
}

export function crewView(s) {
  return s.crew.map((c) => {
    const known = s.problems.filter((p) => p.seen && p.who.includes(c.id));
    return {
      id: c.id, name: c.name, full: c.full, station: STATIONS[c.station].label, lead: !!c.lead, about: c.about, look: c.look,
      status: c.status === 'active' ? 'On the floor' : c.status === 'quit' ? 'Gone: quit' : c.status === 'injured' ? 'Off hurt' : 'On leave',
      mood: active(c) ? moodWord(c.morale) : '',
      trust: active(c) ? trustWord(c.trust) : '',
      known: known.map((p) => ({ title: p.state === 'resolved' ? `${say(s, `card.${p.type}.title`, { p })} (settled)` : say(s, `card.${p.type}.title`, { p }), told: p.told ? say(s, `know.${p.type}.${p.told}`, { p }) : '', tried: p.tried.length })),
    };
  });
}

export { MODULES, TRACK };

/** The crew as the brief shows them: name, station, a line about each. */
export function crewStrip() {
  return CREW.map((c) => ({ id: c.id, name: c.name, station: STATIONS[c.station].label, about: c.about, look: c.look, lead: !!c.lead }));
}
