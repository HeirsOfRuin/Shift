// The save: the track (which modules are played, debriefed and signed off) and
// the run in progress, if any.
//
// The save KEY is a contract: renaming it orphans every save on every device.
// The payload carries `v`; MIGRATIONS[v] upgrades version v to v + 1. Every
// version that ever shipped gets a fixture in test/fixtures/ that must load and
// play on (test/save-contract.test.js).

import { MODULES, TRACK } from '../data/modules.data.js';
import { AREAS, SELF_LIMIT } from '../data/focus.data.js';
import { SEATS, DEPARTMENTS } from '../data/departments.data.js';
import { ROLES } from '../data/crew.data.js';
import { newModule, advance as advanceWeek } from './week.js';
import { pathFor } from './path.js';

export const SAVE_KEY = 'shift.save.v1'; // never rename
export const SAVE_VERSION = 4;
export const CODE_PREFIX = 'SHFT1.';

export function newSave() {
  return {
    v: SAVE_VERSION,
    track: { id: TRACK.id, openAll: false, modules: Object.fromEntries(TRACK.modules.map((id) => [id, { plays: 0, wins: 0, last: null, debrief: null, signedOff: null }])) },
    profile: null,
    run: null,
    runs: 0,
    role: null,         // 'trainee' | 'coach' | null (not chosen yet)
    assignment: null,   // a trainee's assignment from a coach (engine/coach.js)
    coach: null,        // a coach's roster (engine/coach.js)
    room: null,         // a group session being run on this screen (engine/coach.js)
  };
}

/** Set or change the trainee's profile: the seat, the department, the departments
 *  tied to it, and the self-rated strengths and areas to work on. Validated here
 *  so the UI cannot store a seat or area the catalogue does not have. */
export function setProfile(save, p) {
  if (!SEATS[p.seat]) throw new Error('Pick a seat.');
  if (!DEPARTMENTS[p.department]) throw new Error('Pick a department.');
  const areas = (xs, not = []) => [...new Set((xs || []).filter((a) => AREAS[a] && !not.includes(a)))].slice(0, SELF_LIMIT);
  const strengths = areas(p.strengths);
  const work = areas(p.work, strengths);
  const tied = [...new Set((p.tied || []).filter((d) => DEPARTMENTS[d] && d !== p.department))];
  const s = structuredClone(save);
  s.profile = { name: String(p.name || '').trim().slice(0, 60), seat: p.seat, department: p.department, tied, strengths, work, erp: String(p.erp || '').trim().slice(0, 40), since: p.since || s.profile?.since || null };
  return s;
}

/** The module order for this save: the trainee's path if there is a profile, the
 *  track's written order if not. Unlocking follows it. */
/** The seat a profile plays in. */
export function seatFor(profile) { return SEATS[profile?.seat] ? profile.seat : 'supervisor'; }
export const supports = (id, seat) => (MODULES[id].seats || ['supervisor']).includes(seat);

export function order(save) {
  const seat = seatFor(save.profile);
  // an assigned trainee plays what the coach assigned, in the coach's order
  const ids = save.assignment ? save.assignment.modules : save.profile ? pathFor(save.profile).map((x) => x.id) : TRACK.modules;
  return ids.filter((id) => supports(id, seat));
}

/** Is a module open to play? The first is; each next one opens on the previous sign-off. */
export function unlocked(save, id) {
  const ids = order(save);
  const i = ids.indexOf(id);
  if (i < 0) return false;
  if (i === 0 || save.track.openAll || save.assignment?.open === 'all') return true;
  return !!save.track.modules[ids[i - 1]].signedOff;
}

export function startRun(save, moduleId, seed) {
  if (!unlocked(save, moduleId)) throw new Error('That module is not open yet: the one before it needs a coach sign-off.');
  const s = structuredClone(save);
  s.run = newModule(moduleId, seed, seatFor(s.profile), { erp: s.profile?.erp });
  s.runs += 1;
  return s;
}

/** Play the run's week; when the run ends, record it on the track. */
export function playWeek(save, plan) {
  if (!save.run) throw new Error('no run in progress');
  const s = structuredClone(save);
  const { state, record } = advanceWeek(s.run, plan);
  s.run = state;
  if (state.over) {
    const m = s.track.modules[state.moduleId];
    m.plays += 1;
    if (state.outcome.win) m.wins += 1;
    m.last = { win: state.outcome.win, week: state.week - 1, seed: state.seed, reads: state.outcome.profile.focus.map((f) => ({ id: f.id, read: f.read.label })), summary: state.outcome.summary };
  }
  return { save: s, record };
}

export function endRun(save) { const s = structuredClone(save); s.run = null; return s; }

export function saveDebrief(save, moduleId, debrief) {
  const s = structuredClone(save);
  s.track.modules[moduleId].debrief = { answers: debrief.answers || [], commitment: debrief.commitment || '', by: debrief.by || '', week: debrief.week ?? null };
  return s;
}

export function signOff(save, moduleId, coach) {
  if (!MODULES[moduleId]) throw new Error(`no module ${moduleId}`);
  const s = structuredClone(save);
  const m = s.track.modules[moduleId];
  if (!m.plays) throw new Error('Play the module before it can be signed off.');
  if (!m.debrief || !(m.debrief.commitment || '').trim()) throw new Error('Write the commitment on the debrief page before the coach signs off.');
  m.signedOff = { coach: String(coach || '').trim() || 'Coach' };
  return s;
}

/** Remember that the player has seen a one-time explainer (by key). */
export function markSeen(save, key) { const s = structuredClone(save); s.track.seen = { ...(s.track.seen || {}), [key]: true }; return s; }

export function setOpenAll(save, on) { const s = structuredClone(save); s.track.openAll = !!on; return s; }

/** MIGRATIONS[v](save) returns the save at version v + 1. Add one per version bump. */
export const MIGRATIONS = {
  // Beta 1 to 2: fatigue, pushed-off floor hours, and the floor itemised.
  1: (s) => {
    const heal = (run) => {
      if (!run) return run;
      run.dept.tired = run.dept.tired ?? 0;
      run.dept.floorExtra = run.dept.floorExtra ?? [];
      if (run.monday && !run.monday.floorItems) run.monday.floorItems = [{ label: 'The floor (itemised from next week)', hours: run.monday.interrupts }];
      return run;
    };
    return { ...s, v: 2, run: heal(s.run) };
  },
  // Beta 2 to 3: the focus-area catalogue replaces the LBA domains, and the
  // trainee has a profile. An old run's decisions carry LBA subdomain names
  // under `sub`; they are kept as-is and read as nothing (no area), which is
  // honest: the read for that run was never on the new scale. A finished
  // module's `last.overall` is dropped; its reads were on the old scale too.
  2: (s) => {
    const heal = (run) => {
      if (!run) return run;
      run.decisions = (run.decisions || []).map((d) => ('area' in d ? d : { ...d, area: null }));
      return run;
    };
    const modules = Object.fromEntries(Object.entries(s.track.modules).map(([id, m]) => [id, { ...m, last: m.last ? { win: m.last.win, week: m.last.week, seed: m.last.seed, reads: [], summary: m.last.summary } : null }]));
    return { ...s, v: 3, profile: null, track: { ...s.track, modules }, run: heal(s.run) };
  },
};

// Beta 11 to 12: the coach's side. A save is a trainee's or a coach's; a
// trainee may carry an assignment. Old saves are trainees without one, and
// nothing about their track changes.
MIGRATIONS[3] = (s) => ({ ...s, v: 4, role: s.profile ? 'trainee' : null, assignment: null, coach: null, room: null });

export function migrate(save) {
  let s = save;
  if (!s || typeof s !== 'object' || !Number.isInteger(s.v)) throw new Error('not a save');
  if (s.v > SAVE_VERSION) throw new Error(`save is from a newer version (${s.v}) than this build (${SAVE_VERSION})`);
  while (s.v < SAVE_VERSION) {
    const step = MIGRATIONS[s.v];
    if (!step) throw new Error(`no migration from save version ${s.v}`);
    s = step(s);
  }
  // modules added to the track since this save was made
  for (const id of TRACK.modules) if (!s.track.modules[id]) s.track.modules[id] = { plays: 0, wins: 0, last: null, debrief: null, signedOff: null };
  // a run from before every seat named its senior hand (beta 16's labels name them)
  if (s.run && !s.run.roles?.senior) s.run.roles = { ...structuredClone(ROLES[s.run.seat || 'supervisor']), erp: { name: 'the system', full: 'the system', pronoun: 'it' }, ...(s.run.roles || {}) };
  return s;
}

export const serialize = (save) => JSON.stringify(save);
export const deserialize = (text) => migrate(JSON.parse(text));

/** A save as text, to move between devices or to bring to the debrief. */
export function toCode(save) {
  const b64 = btoa(unescape(encodeURIComponent(serialize(save))));
  return CODE_PREFIX + b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function fromCode(code) {
  const text = String(code).trim();
  if (!text.startsWith(CODE_PREFIX.slice(0, -2))) throw new Error('That is not a save code for Shift.');
  const body = text.slice(text.indexOf('.') + 1).replace(/-/g, '+').replace(/_/g, '/');
  return deserialize(decodeURIComponent(escape(atob(body))));
}
