// The save: the track (which modules are played, debriefed and signed off) and
// the run in progress, if any.
//
// The save KEY is a contract: renaming it orphans every save on every device.
// The payload carries `v`; MIGRATIONS[v] upgrades version v to v + 1. Every
// version that ever shipped gets a fixture in test/fixtures/ that must load and
// play on (test/save-contract.test.js).

import { MODULES, TRACK } from '../data/modules.data.js';
import { newModule, advance as advanceWeek } from './week.js';

export const SAVE_KEY = 'shift.save.v1'; // never rename
export const SAVE_VERSION = 2;
export const CODE_PREFIX = 'SHFT1.';

export function newSave() {
  return {
    v: SAVE_VERSION,
    track: { id: TRACK.id, openAll: false, modules: Object.fromEntries(TRACK.modules.map((id) => [id, { plays: 0, wins: 0, last: null, debrief: null, signedOff: null }])) },
    run: null,
    runs: 0,
  };
}

/** Is a module open to play? The first is; each next one opens on the previous sign-off. */
export function unlocked(save, id) {
  const i = TRACK.modules.indexOf(id);
  if (i < 0) return false;
  if (i === 0 || save.track.openAll) return true;
  return !!save.track.modules[TRACK.modules[i - 1]].signedOff;
}

export function startRun(save, moduleId, seed) {
  if (!unlocked(save, moduleId)) throw new Error('That module is not open yet: the one before it needs a coach sign-off.');
  const s = structuredClone(save);
  s.run = newModule(moduleId, seed);
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
    m.last = { win: state.outcome.win, week: state.week - 1, seed: state.seed, overall: state.outcome.profile.overall, summary: state.outcome.summary };
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
};

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
