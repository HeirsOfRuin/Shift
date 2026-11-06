// The coach's side: a roster of trainees, the modules each is assigned, and
// the two text codes that carry it between phones without a server.
//
// Why codes and not accounts. Shift has no server (docs/PLAN.md, shape B).
// A trainee's save lives on their phone. The coach's roster lives on the
// coach's. What crosses between them is text: an ASSIGNMENT code the coach
// hands the trainee (who they are, which modules, in what order, from whom),
// and a PROGRESS code the trainee hands back (what they played, how it read,
// what they committed to). When the page is open on claude.ai and both are
// signed in, the same progress goes to the page's store with one tap, as the
// testers' thoughts do (ui/feedback.js); the code is the way that always
// works. The author, 2026-11-05: "a system that you log in to and you are
// either assigned a coach or trainee profile and the coach profile allows you
// to see which trainees are assigned to you and what modules they can access."
//
// Pure. The save is the only state; every function returns a new one.

import { MODULES, TRACK } from '../data/modules.data.js';
import { AREAS } from '../data/focus.data.js';
import { SEATS, DEPARTMENTS } from '../data/departments.data.js';
import { GROUPS } from '../data/groups.data.js';
import { newModule } from './week.js';

export const ASSIGN_PREFIX = 'SHFTA1.';   // never rename: codes in the wild
export const PROGRESS_PREFIX = 'SHFTP1.'; // never rename

const b64 = (text) => btoa(unescape(encodeURIComponent(text))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64 = (body) => decodeURIComponent(escape(atob(body.replace(/-/g, '+').replace(/_/g, '/'))));
const short = () => Math.random().toString(36).slice(2, 8);
const clean = (s, n) => String(s || '').trim().slice(0, n);

// ---------------------------------------------------------------- the coach

/** Make this save a coach's. One save holds both sides: the roster stays when
 *  the person switches to their own track (becomeTrainee) and the track stays
 *  when they switch back. The role only says which screen opens. */
export function becomeCoach(save, p = {}) {
  const s = structuredClone(save);
  s.role = 'coach';
  s.coach = { id: s.coach?.id || `c_${short()}`, name: clean(p.name ?? s.coach?.name, 60), department: DEPARTMENTS[p.department] ? p.department : s.coach?.department || '', roster: s.coach?.roster || [] };
  return s;
}

export function becomeTrainee(save) { const s = structuredClone(save); s.role = 'trainee'; return s; }

/** Add or change a trainee on the roster. `modules` is the assignment, in
 *  the coach's order; `open` is 'inorder' (each opens on the sign-off of the
 *  one before, as the track does) or 'all'. */
export function setTrainee(save, t) {
  if (save.role !== 'coach') throw new Error('Only a coach profile keeps a roster.');
  if (!SEATS[t.seat]) throw new Error('Pick the trainee\'s seat.');
  if (!DEPARTMENTS[t.department]) throw new Error('Pick the trainee\'s department.');
  const name = clean(t.name, 60);
  if (!name) throw new Error('Give the trainee a name.');
  const seatOk = (id) => (MODULES[id].seats || ['supervisor']).includes(t.seat);
  const modules = [...new Set((t.modules || []).filter((id) => MODULES[id] && seatOk(id)))];
  if (!modules.length) throw new Error('Assign at least one module written for that seat.');
  const s = structuredClone(save);
  const row = { id: t.id || `t_${short()}`, name, seat: t.seat, department: t.department, modules, open: t.open === 'all' ? 'all' : 'inorder', note: clean(t.note, 300), issued: t.issued || new Date().toISOString().slice(0, 10), progress: null };
  const i = s.coach.roster.findIndex((x) => x.id === row.id);
  if (i >= 0) s.coach.roster[i] = { ...s.coach.roster[i], ...row, progress: s.coach.roster[i].progress };
  else s.coach.roster.push(row);
  return s;
}

export function removeTrainee(save, id) { const s = structuredClone(save); s.coach.roster = s.coach.roster.filter((x) => x.id !== id); return s; }

/** The assignment code for one trainee: what the coach hands over. */
export function assignmentCode(save, id) {
  const t = save.coach?.roster.find((x) => x.id === id);
  if (!t) throw new Error('No such trainee on the roster.');
  const body = { c: save.coach.id, cn: save.coach.name, t: t.id, n: t.name, s: t.seat, d: t.department, m: t.modules, o: t.open, i: t.issued };
  return ASSIGN_PREFIX + b64(JSON.stringify(body));
}

/** Read any Shift code and say which it is. */
export function kindOf(code) {
  const text = String(code || '').trim();
  if (text.startsWith(ASSIGN_PREFIX)) return 'assignment';
  if (text.startsWith(PROGRESS_PREFIX)) return 'progress';
  if (text.startsWith('SHFT1.')) return 'save';
  return null;
}

export function readAssignment(code) {
  const text = String(code || '').trim();
  if (!text.startsWith(ASSIGN_PREFIX)) throw new Error('That is not an assignment code. A coach\'s code starts with SHFTA1.');
  let b;
  try { b = JSON.parse(unb64(text.slice(ASSIGN_PREFIX.length))); } catch { throw new Error('That assignment code is damaged. Ask the coach to copy it again.'); }
  const modules = (b.m || []).filter((id) => MODULES[id]);
  if (!b.c || !b.t || !modules.length || !SEATS[b.s] || !DEPARTMENTS[b.d]) throw new Error('That assignment code is missing something. Ask the coach to make it again.');
  return { coachId: String(b.c), coach: clean(b.cn, 60) || 'Your coach', traineeId: String(b.t), name: clean(b.n, 60), seat: b.s, department: b.d, modules, open: b.o === 'all' ? 'all' : 'inorder', issued: b.i || null };
}

// ---------------------------------------------------------------- the trainee

/** Take an assignment onto this save. The profile is made or changed to the
 *  assigned seat and department (the trainee can still add what they want to
 *  work on); the track then shows the assigned modules in the coach's order. */
export function takeAssignment(save, code) {
  const a = readAssignment(code);
  const s = structuredClone(save);
  s.role = 'trainee';
  s.assignment = { ...a, taken: new Date().toISOString().slice(0, 10) };
  const p = s.profile || { tied: [], strengths: [], work: [], erp: '' };
  s.profile = { ...p, name: a.name || p.name || '', seat: a.seat, department: a.department, tied: (p.tied || []).filter((d) => d !== a.department), since: p.since || s.assignment.taken };
  return s;
}

export function dropAssignment(save) { const s = structuredClone(save); s.assignment = null; return s; }

/** The progress code: what the trainee hands back. Never the save: the module
 *  tallies, the last read per focus area, the commitment, the sign-off. The
 *  debrief answers stay on the phone; they are the trainee's. */
export function progressOf(save) {
  const ids = save.assignment ? save.assignment.modules : TRACK.modules;
  return {
    v: 1, t: save.assignment?.traineeId || null, c: save.assignment?.coachId || null, n: save.profile?.name || '', s: save.profile?.seat || '', d: save.profile?.department || '',
    at: new Date().toISOString().slice(0, 10),
    m: ids.filter((id) => save.track.modules[id]?.plays).map((id) => {
      const t = save.track.modules[id];
      return { id, p: t.plays, w: t.wins, r: (t.last?.reads || []).map((x) => [x.id, x.read]), k: t.debrief?.commitment || '', by: t.debrief?.by || '', so: t.signedOff?.coach || '', mo: t.last?.moment?.kind || '' };
    }),
  };
}

export function progressCode(save) { return PROGRESS_PREFIX + b64(JSON.stringify(progressOf(save))); }

export function readProgress(code) {
  const text = String(code || '').trim();
  if (!text.startsWith(PROGRESS_PREFIX)) throw new Error('That is not a progress code. A trainee\'s code starts with SHFTP1.');
  let b;
  try { b = JSON.parse(unb64(text.slice(PROGRESS_PREFIX.length))); } catch { throw new Error('That progress code is damaged. Ask for it again.'); }
  return b;
}

/** Record a trainee's progress on the coach's roster. Matches by the trainee
 *  id in the code; a code with no id (a trainee who was never assigned) is
 *  matched by name, or refused. */
export function recordProgress(save, code) {
  const p = readProgress(code);
  const s = structuredClone(save);
  let t = p.t ? s.coach.roster.find((x) => x.id === p.t) : null;
  if (!t && p.n) t = s.coach.roster.find((x) => x.name.toLowerCase() === String(p.n).toLowerCase());
  if (!t) throw new Error(`Nobody on the roster matches that code${p.n ? ` (${p.n})` : ''}. Add them first.`);
  t.progress = { at: p.at, modules: (p.m || []).filter((m) => MODULES[m.id]) };
  return { save: s, trainee: t };
}

// ---------------------------------------------------------------- views

/** The moment that decided the last run (engine/moment.js), as the roster says it. */
export const MOMENT_PHRASE = {
  blind: 'acted before finding anything out', patched: 'kept patching it, never went after why', against: 'acted against the evidence',
  oneWary: "acted on one wary person's word, and it was wrong", guessed: "guessed between findings that didn't agree, and missed",
  passed: 'believed it would sort itself out', never: 'never acted on it', checkedWrong: 'checked, and the evidence misled',
  lucky: "acted on one person's word, and it happened to be right", guessedRight: "guessed between findings that didn't agree, and it was right",
  settled: 'it settled on its own', checked: 'checked, then acted: the move',
};

/** The roster as the coach's screen shows it: each trainee, each assigned
 *  module, and what the last progress code said about it. */
export function rosterView(save) {
  const rows = (save.coach?.roster || []).map((t) => {
    const prog = Object.fromEntries((t.progress?.modules || []).map((m) => [m.id, m]));
    const modules = t.modules.map((id, i) => {
      const m = MODULES[id];
      const p = prog[id];
      return {
        id, n: i + 1, title: m.title, purpose: m.purpose || '', focus: m.focus.map((a) => AREAS[a].label),
        plays: p?.p || 0, wins: p?.w || 0, moment: p?.mo ? MOMENT_PHRASE[p.mo] || '' : '', reads: (p?.r || []).map(([a, r]) => ({ area: AREAS[a]?.label || a, read: r })), commitment: p?.k || '', by: p?.by || '', signedOff: p?.so || '',
        state: !p ? 'not started' : p.so ? 'signed off' : p.k ? 'debriefed' : p.w ? 'got through' : 'played',
      };
    });
    const done = modules.filter((m) => m.state === 'signed off').length;
    return { id: t.id, name: t.name, seat: SEATS[t.seat].label, seatId: t.seat, department: DEPARTMENTS[t.department].name, departmentId: t.department, open: t.open, note: t.note, issued: t.issued, modules, done, lastHeard: t.progress?.at || null };
  });
  return { coach: save.coach?.name || '', id: save.coach?.id || '', department: save.coach?.department ? DEPARTMENTS[save.coach.department].name : '', rows };
}

/** Every module a coach could assign to a seat, with purpose and focus, in the
 *  track's written order. */
export function assignable(seat) {
  return TRACK.modules.filter((id) => (MODULES[id].seats || ['supervisor']).includes(seat)).map((id) => ({ id, title: MODULES[id].title, purpose: MODULES[id].purpose || '', focus: MODULES[id].focus.map((a) => AREAS[a].label), weeks: MODULES[id].weeks }));
}

// ---------------------------------------------------------------- a session on one screen

/** Start a group session: one run of the session's module on this screen,
 *  driven by the facilitator, with the room deciding out loud. The run is an
 *  ordinary run (the engine does not know about the room); `save.room` says
 *  which session it belongs to, so the screens show the facilitator's lines. */
export function startSession(save, sessionId, seed) {
  const g = GROUPS[sessionId];
  if (!g) throw new Error(`no session ${sessionId}`);
  const s = structuredClone(save);
  s.run = newModule(g.module, seed, 'supervisor', { erp: s.profile?.erp });
  s.room = { session: sessionId, started: new Date().toISOString().slice(0, 10) };
  s.runs += 1;
  return s;
}

export function endSession(save) { const s = structuredClone(save); s.run = null; s.room = null; return s; }

/** What the facilitator's strip on the week screen says for this week. */
export function roomView(save) {
  if (!save.room) return null;
  const g = GROUPS[save.room.session];
  const week = save.run?.week || 0;
  return { id: save.room.session, title: g.title, module: MODULES[g.module].title, over: !!save.run?.over, open: g.room.open, each: g.room.each, line: g.room.weeks[week] || '', close: g.room.close, questions: g.questions, reveal: g.reveal, commitment: g.commitment, blocks: g.blocks, minutes: g.minutes };
}
