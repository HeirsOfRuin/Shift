// Testers' thoughts, for the coach. Two ways out of the phone, both chosen by
// the tester: a one-tap send when the page is open on claude.ai and the
// viewer is signed in (the page's shared store, read only by the owner), and
// a block of text to paste into a message, always. Nothing from a run leaves
// the device unless the tester sends it, and what is sent is what they typed
// plus the module, the seat and how the run ended: never the save.
//
// The store lives behind `claude.use("db")`, which resolves null when this
// view cannot use it (an offline build, a signed-out viewer, a public link):
// the page renders without it and the copy button is the way.

import { lsGet, lsSet } from './storage.js';

const KEY = 'shift.feedback.v1';   // never rename

export function loadNotes() {
  try { return JSON.parse(lsGet(KEY) || '[]'); } catch { return []; }
}

export function saveNote(note) {
  const notes = [...loadNotes(), note];
  lsSet(KEY, JSON.stringify(notes));
  return notes;
}

/** Send every note this device has written to the coach's store. */
export async function sendNotes(notes) {
  try {
    const claude = globalThis.claude;
    if (!claude?.use) return { ok: false, why: 'This copy of Shift is not on claude.ai, so there is nothing to send to. Copy the text instead.' };
    const [db, user] = await Promise.all([claude.use('db'), claude.use('user')]);
    if (!db || !user) return { ok: false, why: 'Sending needs you signed in on claude.ai. Copy the text instead and message it.' };
    const id = await user.id();
    await db.collection('feedback').doc(id).set({ notes, updated: new Date().toISOString(), count: notes.length });
    return { ok: true };
  } catch (e) {
    return { ok: false, why: `It did not send (${e?.code || e?.message || 'unknown'}). Copy the text instead.` };
  }
}

/** Send the trainee's progress (engine/coach.js progressOf: tallies, reads,
 *  commitments; never the save or the debrief answers) to the page's store,
 *  under the same rule as the notes: each viewer writes their own, the owner
 *  reads them. */
export async function sendProgress(progress) {
  try {
    const claude = globalThis.claude;
    if (!claude?.use) return { ok: false, why: 'This copy of Shift is not on claude.ai, so there is nothing to send to. Copy the code instead.' };
    const [db, user] = await Promise.all([claude.use('db'), claude.use('user')]);
    if (!db || !user) return { ok: false, why: 'Sending needs you signed in on claude.ai. Copy the code instead and message it.' };
    const id = await user.id();
    await db.collection('progress').doc(id).set({ ...progress, updated: new Date().toISOString() });
    return { ok: true };
  } catch (e) {
    return { ok: false, why: `It did not send (${e?.code || e?.message || 'unknown'}). Copy the code instead.` };
  }
}

/** The coach's side of the store: every progress record sent to this page.
 *  Only the page's owner can read them (the rule is read: admin). */
export async function fetchProgress() {
  try {
    const claude = globalThis.claude;
    if (!claude?.use) return { ok: false, why: 'This copy of Shift is not on claude.ai; progress arrives as codes here.' };
    const db = await claude.use('db');
    if (!db) return { ok: false, why: 'Reading the store needs you signed in on claude.ai as the page\'s owner.' };
    const snap = await db.collection('progress').get();
    return { ok: true, records: snap.docs.map((d) => d.data()) };
  } catch (e) {
    return { ok: false, why: `The store could not be read (${e?.code || e?.message || 'unknown'}).` };
  }
}

/** The note as text, for a message to the coach. */
export function noteText(n) {
  return [
    `Shift beta: thoughts from ${n.name || 'a tester'}`,
    `${n.seat} in ${n.department}${n.module ? ` · ${n.module}` : ''}${n.outcome ? ` · ${n.outcome}` : ''}${n.reads ? ` · ${n.reads}` : ''}`,
    '',
    `What felt true to my floor:\n${n.answers.true || '(nothing written)'}`,
    '',
    `What felt fake, or would never happen:\n${n.answers.fake || '(nothing written)'}`,
    '',
    `What was missing (an option I wanted, a question I would have asked):\n${n.answers.missing || '(nothing written)'}`,
    '',
    `Anything else (the look, the length, the words):\n${n.answers.else || '(nothing written)'}`,
    '',
    `Written ${n.at}.`,
  ].join('\n');
}
