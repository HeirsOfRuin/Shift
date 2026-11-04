// Everything the screens show, computed here. The UI computes nothing (rule 1):
// hours come from hoursFor, words for moods from derive, and every empty or
// locked state carries its reason (rule 6).

import { CONFIG as C } from '../data/config.data.js';
import { MODULES, TRACK } from '../data/modules.data.js';
import { STATIONS, CREW, CAST, PLANT, CAST_ABOUT } from '../data/crew.data.js';
import { AREAS, FAMILIES, SELF_LIMIT } from '../data/focus.data.js';
import { SEATS, DEPARTMENTS, GROUPS, WRITTEN_BAY } from '../data/departments.data.js';
import { hoursFor } from './week.js';
import { unlocked, order } from './state.js';
import { pathFor } from './path.js';
import { moodWord, standardWord, trustWord, active } from './derive.js';
import { say } from './text.js';

export function trackView(save) {
  const ids = order(save);
  const path = save.profile ? pathFor(save.profile) : null;
  return {
    id: TRACK.id, title: TRACK.title, intro: TRACK.intro, openAll: save.track.openAll,
    you: whoView(save.profile),
    modules: ids.map((id, i) => {
      const m = MODULES[id];
      const t = save.track.modules[id];
      const open = unlocked(save, id);
      return {
        id, n: i + 1, title: m.title, teaches: m.teaches, weeks: m.weeks, open,
        focus: m.focus.map((a) => AREAS[a].label),
        because: path ? path.find((x) => x.id === id).why : '',
        why: open ? '' : `Opens when "${MODULES[ids[i - 1]].title}" is signed off by your coach.`,
        plays: t.plays, wins: t.wins, last: t.last, debriefed: !!t.debrief, signedOff: t.signedOff,
      };
    }),
    inRun: save.run ? { moduleId: save.run.moduleId, title: MODULES[save.run.moduleId].title, week: save.run.week, over: save.run.over } : null,
  };
}

export function briefView(id, profile = null) {
  const m = MODULES[id];
  return {
    id, title: m.title, teaches: m.teaches, handbook: m.handbook, weeks: m.weeks, brief: m.brief, goal: m.goalText, lose: m.lose,
    focus: m.focus.map((a) => ({ id: a, label: AREAS[a].label, about: AREAS[a].about, moves: AREAS[a].moves })),
    seat: seatNote(profile),
  };
}

/** Every module is written in the welding supervisor's seat so far. A trainee in
 *  another seat or department plays it there; the brief says so plainly rather
 *  than pretending (rule 6: a silent state is a broken one). */
function seatNote(profile) {
  if (!profile) return '';
  const dept = DEPARTMENTS[profile.department];
  const seat = SEATS[profile.seat];
  if (profile.department === WRITTEN_BAY && profile.seat === 'supervisor') return '';
  const where = profile.department === WRITTEN_BAY ? '' : ` You run ${dept.name}; this module is written in the welding bay, two doors down, and the lessons travel.`;
  const who = profile.seat === 'supervisor' ? '' : ` You are a ${seat.label.toLowerCase()}; in this module you hold the supervisor's seat for a few weeks, and the debrief asks what carries back to yours.`;
  return `This module puts you in the welding supervisor's chair.${where}${who}`;
}

/** The profile as the screens show it. */
export function whoView(profile) {
  if (!profile) return null;
  const dept = DEPARTMENTS[profile.department];
  return {
    name: profile.name, seat: SEATS[profile.seat].label, seatId: profile.seat, department: dept.name, departmentId: profile.department,
    group: GROUPS[dept.group].name, manager: GROUPS[dept.group].manager,
    tied: profile.tied.map((d) => DEPARTMENTS[d].name),
    strengths: profile.strengths.map((a) => AREAS[a].label), work: profile.work.map((a) => AREAS[a].label),
    written: profile.department === WRITTEN_BAY,
  };
}

/** What the profile screen offers: seats, departments (with what each is tied
 *  to by the line), and the catalogue by family. `draft` is the form so far. */
export function profileView(draft = {}) {
  const dept = DEPARTMENTS[draft.department];
  const byLine = dept ? [...dept.fedBy, ...dept.feeds] : [];
  return {
    seats: Object.entries(SEATS).map(([id, x]) => ({ id, label: x.label, about: x.about })),
    departments: Object.entries(DEPARTMENTS).map(([id, d]) => ({ id, name: d.name, what: d.what, group: GROUPS[d.group].name, written: !!d.bay })),
    byLine: byLine.map((id) => ({ id, name: DEPARTMENTS[id].name, how: dept.fedBy.includes(id) ? 'feeds you' : 'you feed' })),
    others: Object.keys(DEPARTMENTS).filter((id) => id !== draft.department && !byLine.includes(id)).map((id) => ({ id, name: DEPARTMENTS[id].name })),
    families: Object.entries(FAMILIES).map(([f, name]) => ({ id: f, name, areas: Object.entries(AREAS).filter(([, a]) => a.family === f).map(([id, a]) => ({ id, label: a.label, about: a.about })) })),
    limit: SELF_LIMIT,
    writtenBay: DEPARTMENTS[WRITTEN_BAY].name,
  };
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
    floorItems: s.over ? [] : m.floorItems,
    tired: s.dept.tired >= C.tiredHome ? 'Run down: it is starting to show at home' : s.dept.tired >= C.tiredSlips ? 'Running down: your fixes land less often until you get a few normal weeks' : s.dept.tired > 0 ? 'A little tired from last week' : '',
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

/** Who is who: the plant, the vehicles, and the people beyond the bay. With a
 *  profile, the trainee's own department and the ones tied to it come first. */
export function peopleView(profile = null) {
  const mine = profile ? [profile.department, ...DEPARTMENTS[profile.department].fedBy, ...DEPARTMENTS[profile.department].feeds, ...profile.tied] : [];
  const yours = [...new Set(mine)].map((id) => {
    const d = DEPARTMENTS[id];
    const how = id === profile.department ? 'yours' : profile.tied.includes(id) && !d.feeds.includes(profile.department) && !d.fedBy.includes(profile.department) ? 'tied to you' : d.feeds.includes(profile.department) ? 'feeds you' : 'you feed';
    return { id, name: d.name, how, supervisor: d.supervisor, what: d.what, stations: d.stations, people: d.people };
  });
  return {
    plant: PLANT.name, about: PLANT.about, flow: PLANT.flow, vehicles: PLANT.vehicles,
    yours,
    groups: PLANT.groups.map((g) => ({ title: g.title, people: g.ids.map((id) => ({ id, name: CAST[id].full, role: CAST[id].role, about: CAST_ABOUT[id] })) })),
  };
}
