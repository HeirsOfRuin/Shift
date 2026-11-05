// The screens. Reads the engine through game.js and computes nothing itself:
// hours come from the engine's own hoursFor, words and limits from view.js.
//
// Patterns every screen keeps (game-building rules):
//  - Empty and locked states say why and what would change them (rule 6).
//  - The save is written after every change; a text code moves it anywhere.
//  - A throw never leaves a dead button: busy is released in finally, and the
//    error screen offers the save code.
//  - No prompt(), confirm() or print(): framed hosts refuse them, so every
//    confirmation and every copy happens on the page.

import {
  newSave, setProfile, seatFor, startRun, playWeek, saveDebrief, signOff, setOpenAll, SAVE_KEY, serialize, deserialize, toCode, fromCode,
  trackView, briefView, weekView, demoFloor, crewStrip, peopleView, profileView, markSeen, MODULES, TRACK,
  becomeCoach, becomeTrainee, setTrainee, removeTrainee, assignmentCode, kindOf, takeAssignment, progressOf, progressCode, recordProgress, rosterView, assignable, GROUP_SESSIONS, GROUP_ORDER,
} from '../engine/game.js';
import { STORAGE_OK, lsGet, lsSet } from './storage.js';
import { registerSW, installPrompt } from './sw-register.js';
import { mountBay, drawPortrait } from './floor.js';
import { loadNotes, saveNote, sendNotes, noteText, sendProgress, fetchProgress } from './feedback.js';

const app = document.getElementById('app');
let save = null;
let screen = 'title';
let briefId = null;
let debriefId = null;
let tab = 'week';
let plan = { picks: {}, skip: [] };
let modal = null;
let pending = null;          // an in-page confirmation: { act, text, yes }
let codeBox = null;          // 'load' | 'export' | null
let banner = null;
let routineOpen = false;
let floorOpen = false;       // the floor's itemised hours, folded until opened     // the standing week, folded to one line unless opened
let busy = false;
let install = null;
let draft = null;          // the profile form in progress
let note = null;           // the feedback form in progress
let sendState = null;      // { busy, ok, why } after a send
let coachTab = 'trainees'; // the coach's screen: trainees | add | groups
let tdraft = null;         // the trainee form on the coach's screen
let openCode = null;       // the trainee whose assignment code is showing
let groupOpen = null;      // the group session whose plan is open

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// Hours to the quarter: 0.25 h is a quarter hour, not 0.3.
const h = (n) => `${Number(n.toFixed(2))} h`;

function persist() { if (save) lsSet(SAVE_KEY, serialize(save)); }
function loadSaved() {
  const raw = lsGet(SAVE_KEY);
  if (!raw) return null;
  try { return deserialize(raw); } catch (e) { banner = `The saved progress could not be read (${e.message}). Load a save code, or start again.`; return null; }
}

// ================================================================ title
function titleScreen() {
  const saved = loadSaved();
  return `<main class="title">
    <p class="maker">Northern Motors</p>
    <h1>Shift</h1>
    <p class="lede">A leadership simulator for the shop floor. A few weeks at a time, forty hours a week, a crew with problems whose causes are hidden, and a plant that does not wait for you.</p>
    <div class="bay"><div class="legend"><span>Fit-up</span><span>Body weld</span><span>Finish</span><span>Paint</span></div><canvas data-bay="demo" aria-label="The welding bay at Northern Motors, everyone at work"></canvas><p class="caption" data-caption>Tap someone to see how they look from across the bay.</p></div>
    <section class="you"><p class="label">For testers</p><p>This is a beta. If your coach gave you a code, paste it below and your modules are set. Otherwise make your profile (two minutes). Play one module (about twenty), then <strong>Menu &rarr; Your thoughts</strong> and tell the coach what felt true, what felt fake and what was missing. Nothing from your runs leaves this phone unless you send it.</p></section>
    ${STORAGE_OK ? '' : '<p class="warn">This browser will not keep anything for this page, so progress is lost when you leave. Copy a save code from the menu before you go, or open Shift in its own tab.</p>'}
    ${banner ? `<p class="warn">${esc(banner)}</p>` : ''}
    <div class="stack">
      ${saved ? '<button class="btn primary" data-act="continue">Continue</button>' : '<button class="btn primary" data-act="new">Start: who are you here?</button>'}
      ${saved ? '' : '<button class="btn" data-act="new-coach">I am a coach: set up my trainees</button>'}
      ${saved ? (pending?.act === 'new' ? `<p class="warn">This wipes the track on this device: every module played, every debrief. A save code from the menu keeps a copy.</p><div class="row"><button class="btn" data-act="new">Yes, start over</button><button class="btn quiet" data-act="cancel">Keep it</button></div>` : '<button class="btn" data-act="ask-new">Start over</button>') : ''}
      <button class="btn" data-act="load-code">Paste a code: from your coach, or a save code</button>
      ${install ? '<button class="btn" data-act="install">Install on this device</button>' : ''}
    </div>
    ${codeBox === 'load' ? loadBox() : ''}
  </main>`;
}

function loadBox() {
  return `<div class="codebox"><label class="label" for="codein">Paste a code</label><textarea id="codein" class="code" rows="4" placeholder="SHFTA1. from a coach, SHFTP1. from a trainee, SHFT1. a save"></textarea>
    <div class="row"><button class="btn primary" data-act="load-go">Use it</button><button class="btn quiet" data-act="cancel">Cancel</button></div></div>`;
}

// ================================================================ the track
function trackScreen() {
  const t = trackView(save);
  return `<main class="screen">
    <div class="stack"><p class="label">Northern Motors &middot; ${esc(t.title)}</p><h2>${t.you ? `${esc(t.you.seat)}, ${esc(t.you.department)}` : 'The welding department'}</h2></div>
    ${t.you ? youCard(t.you) : ''}
    ${t.you ? '' : `<p class="lede">${esc(t.intro)}</p>`}
    ${t.assignment ? `<p class="banner info"><strong>Assigned by ${esc(t.assignment.coach)}</strong>: ${t.assignment.count} module${t.assignment.count === 1 ? '' : 's'}, in your coach's order${t.assignment.open === 'all' ? ', all open' : ', each opening on the sign-off of the one before'}. When you have played one, send your coach a progress code from below.</p>` : t.you ? `<p class="soft">In your order: what you want to work on first, what your seat leans on next, your strengths last as a check. Each module is about twenty minutes.</p>` : ''}
    ${banner ? `<p class="banner">${esc(banner)}</p>` : ''}
    ${t.inRun ? `<div class="banner info row"><span>${t.inRun.over ? `Your last run of ${esc(t.inRun.title)} has ended.` : `You are in week ${t.inRun.week} of ${esc(t.inRun.title)}.`}</span><button class="btn" data-act="resume">${t.inRun.over ? 'See how it went' : 'Back to it'}</button></div>` : ''}
    <div class="ladder">${t.modules.map(rung).join('')}</div>
    ${t.notHere.length && !t.assignment ? `<details class="fold"><summary>${t.notHere.length} module${t.notHere.length === 1 ? '' : 's'} not in this seat: ${esc(t.notHere.map((m) => m.title).join(', '))}</summary><ul class="notes">${t.notHere.map((m) => `<li><strong>${esc(m.title)}</strong>: ${esc(m.why)}</li>`).join('')}</ul></details>` : ''}
    ${t.assignment ? '' : `<div class="toggle"><button class="btn" data-act="open-all">${t.openAll ? 'Lock to the sign-off order' : 'Open every module'}</button><span class="soft">Beta switch. Normally the next opens on a coach's sign-off.</span></div>`}
    <div class="row"><button class="btn" data-act="progress">Progress code, for your coach</button><button class="btn" data-act="feedback">Your thoughts, for the coach</button><button class="btn" data-act="export">Copy a save code</button><button class="btn quiet" data-act="title">Title screen</button></div>
    ${codeBox === 'export' ? exportBox() : codeBox === 'progress' ? progressBox() : ''}
  </main>`;
}

function rung(m) {
  const chips = [];
  if (!m.open) chips.push('<span class="chip">Locked</span>');
  if (m.plays) chips.push(`<span class="chip">Played ${m.plays}</span>`);
  if (m.wins) chips.push(`<span class="chip good">Got through ${m.wins}</span>`);
  if (m.debriefed) chips.push('<span class="chip amber">Debriefed</span>');
  if (m.signedOff) chips.push(`<span class="chip good">Signed off: ${esc(m.signedOff.coach)}</span>`);
  // open rungs carry their purpose; locked ones are a line, so the track fits a phone
  const inner = `<span class="n">${m.n}</span><span class="body"><h3>${esc(m.title)}</h3>${m.open ? (m.purpose ? `<span class="purpose">${esc(m.purpose)}</span>` : `<span class="soft">${esc(m.teaches)}</span>`) : ''}<span class="chips">${m.focus.map((f) => `<span class="chip focus">${esc(f)}</span>`).join('')}${chips.join('')}</span></span>`;
  return m.open ? `<button class="rung" data-act="brief" data-id="${m.id}">${inner}</button>` : `<div class="rung locked compact">${inner}</div>`;
}

function youCard(y) {
  return `<section class="you"><div class="row" style="justify-content:space-between"><p class="label">Your profile${y.name ? ` &middot; ${esc(y.name)}` : ''}</p><button class="btn quiet small" data-act="profile">Change</button></div>
    <p>${esc(y.seat)} in ${esc(y.department)} (${esc(y.group)}, under ${esc(y.manager)}).${y.tied.length ? ` Also tied to ${esc(y.tied.join(', '))}.` : ''}</p>
    ${y.work.length ? `<p><span class="label">Want to work on</span><br>${esc(y.work.join(', '))}</p>` : ''}
    ${y.strengths.length ? `<p><span class="label">Strengths</span><br>${esc(y.strengths.join(', '))}</p>` : ''}
    ${y.written ? '' : `<p class="soft">The modules are written in the welding bay; you play them from there.</p>`}
  </section>`;
}

// ================================================================ the profile
// "Log in or create a profile": the seat, the department, what is tied to it,
// and the self-rated strengths and areas to work on. The path is built from it.
function profileScreen() {
  draft = draft || (save?.profile ? { ...save.profile } : { seat: '', department: '', tied: [], strengths: [], work: [], name: '' });
  const v = profileView(draft);
  const chosen = (list, id) => list.includes(id);
  const area = (a, field) => {
    const on = chosen(draft[field], a.id);
    const other = field === 'strengths' ? 'work' : 'strengths';
    const blocked = !on && (draft[field].length >= v.limit || chosen(draft[other], a.id));
    return `<button class="chip pick ${on ? 'on' : ''}" data-pick="${field}" data-id="${a.id}" aria-pressed="${on}" ${blocked ? 'disabled' : ''}>${esc(a.label)}</button>`;
  };
  const all = v.families.flatMap((f) => f.areas);
  const areas = (field) => `<div class="chips grid">${all.map((a) => area(a, field)).join('')}</div>${draft[field].length ? `<ul class="notes small">${draft[field].map((id) => all.find((a) => a.id === id)).filter(Boolean).map((a) => `<li><strong>${esc(a.label)}:</strong> ${esc(a.about)}</li>`).join('')}</ul>` : ''}`;
  const dept = v.departments.find((d) => d.id === draft.department);
  const ready = draft.seat && draft.department;
  return `<main class="screen">
    <div><button class="btn quiet" data-act="${save?.profile ? 'track' : 'title'}">${save?.profile ? 'Back to the track' : 'Back'}</button></div>
    <div class="stack"><p class="label">Northern Motors</p><h2>Who are you here?</h2></div>
    <p class="soft">Two minutes. It sets the order of your modules and what the screens show. Not a test; change it any time.</p>
    ${banner ? `<p class="warn">${esc(banner)}</p>` : ''}
    <section><p class="label">Your name, for the debrief (optional)</p><input id="pname" type="text" autocomplete="name" value="${esc(draft.name)}" data-draft="name"></section>
    <section><p class="label">What your plant calls its system (optional)</p><input id="perp" type="text" value="${esc(draft.erp || '')}" placeholder="the system"><p class="soft">The ERP. One module is about it and uses this name.</p></section>
    ${save?.assignment ? `<p class="banner info">Your seat and department were set by ${esc(save.assignment.coach)}'s assignment. The rest is yours.</p>` : ''}
    <section><p class="label">Your seat</p><div class="chips grid">${v.seats.map((x) => `<button class="chip pick ${draft.seat === x.id ? 'on' : ''}" data-pick="seat" data-id="${x.id}" ${save?.assignment ? 'disabled' : ''}>${esc(x.label)}</button>`).join('')}</div>${draft.seat ? `<p class="soft">${esc(v.seats.find((x) => x.id === draft.seat).about)}</p>` : ''}</section>
    <section><p class="label">Your department</p><div class="chips grid">${v.departments.map((d) => `<button class="chip pick ${draft.department === d.id ? 'on' : ''}" data-pick="department" data-id="${d.id}" ${save?.assignment ? 'disabled' : ''}>${esc(d.name)}</button>`).join('')}</div>
      ${dept ? `<p class="soft">${esc(dept.what)}${v.byLine.length ? ` On the line with ${v.byLine.map((d) => esc(d.name)).join(' and ')}.` : ''}</p>` : `<p class="soft">The modules are written in ${esc(v.writtenBay)}; your real department sets your neighbours and your path.</p>`}</section>
    ${draft.department ? `<section><p class="label">Also tied to you (optional)</p><div class="chips grid">${v.others.map((d) => `<button class="chip pick ${chosen(draft.tied, d.id) ? 'on' : ''}" data-pick="tied" data-id="${d.id}" aria-pressed="${chosen(draft.tied, d.id)}">${esc(d.name)}</button>`).join('')}</div></section>` : ''}
    <section><p class="label">Want to work on (up to ${v.limit}; these come first)</p>${areas('work')}</section>
    <section><p class="label">A strength (up to ${v.limit}; played last, as a check)</p>${areas('strengths')}</section>
    ${ready ? '' : '<p class="soft">Pick a seat and a department to go on. The rest is optional.</p>'}
    <button class="btn primary block" data-act="profile-save" ${ready ? '' : 'disabled'}>${save?.profile ? 'Save the changes' : 'Start the track'}</button>
  </main>`;
}

function exportBox() {
  return `<div class="codebox"><label class="label" for="codeout">Save code: paste it into Load a save code on any device</label><textarea id="codeout" class="code" rows="5" readonly>${esc(toCode(save))}</textarea>
    <div class="row"><button class="btn primary" data-act="copy" data-target="codeout">Copy</button><button class="btn quiet" data-act="cancel">Done</button></div></div>`;
}

function progressBox() {
  const p = progressOf(save);
  return `<div class="codebox"><label class="label" for="progout">Progress code: what you played, how it read, what you committed to. Not your save, not your debrief answers.</label>
    <p class="soft">${p.m.length ? `${p.m.length} module${p.m.length === 1 ? '' : 's'} played.` : 'Nothing played yet; the code says so.'}</p>
    <textarea id="progout" class="code" rows="4" readonly>${esc(progressCode(save))}</textarea>
    ${sendState?.busy ? '<p class="banner info">Sending&hellip;</p>' : sendState?.ok ? '<p class="signed">Sent. Your coach can read it from the page.</p>' : sendState?.why ? `<p class="warn">${esc(sendState.why)}</p>` : ''}
    <div class="row"><button class="btn primary" data-act="copy" data-target="progout">Copy</button><button class="btn" data-act="progress-send" ${sendState?.busy ? 'disabled' : ''}>Send from this page</button><button class="btn quiet" data-act="cancel">Done</button></div></div>`;
}

// ================================================================ the coach
// The coach's screen: who is assigned to them, what each can play, the codes
// that carry it, and the group sessions to run with a room.
function coachScreen() {
  const r = rosterView(save);
  const tabs = [['trainees', `Trainees${r.rows.length ? ` (${r.rows.length})` : ''}`], ['add', tdraft?.id ? 'Edit' : 'Add a trainee'], ['groups', 'Group sessions']];
  return `<main class="screen">
    <div class="stack"><p class="label">Northern Motors &middot; Coach</p><h2>${r.coach ? esc(r.coach) : 'Your trainees'}</h2></div>
    ${r.department ? `<p class="soft">Coaching from ${esc(r.department)}.</p>` : ''}
    ${banner ? `<p class="banner">${esc(banner)}</p>` : ''}
    <nav class="tabs">${tabs.map(([id, label]) => `<button data-ctab="${id}" class="${coachTab === id ? 'on' : ''}">${label}</button>`).join('')}</nav>
    ${coachTab === 'trainees' ? traineesTab(r) : coachTab === 'add' ? addTab(r) : groupsTab()}
    <div class="row"><button class="btn" data-act="coach-profile">Your name and department</button><button class="btn" data-act="export">Copy a save code</button><button class="btn quiet" data-act="title">Title screen</button></div>
    ${codeBox === 'export' ? exportBox() : codeBox === 'load' ? loadBox() : ''}
  </main>`;
}

const STATE_CHIP = { 'not started': '', played: 'amber', 'got through': 'amber', debriefed: 'amber', 'signed off': 'good' };
function traineesTab(r) {
  if (!r.rows.length) return `<section class="you"><p>Nobody yet. <strong>Add a trainee</strong>: their name, seat and department, and the modules you want them to play. You get a code to send them; they paste it on the title screen and the track shows only what you assigned.</p><p class="soft">Progress comes back the same way: they tap <em>Progress code, for your coach</em> on their track and send it to you, or send it from the page when both of you are signed in on claude.ai.</p></section>
    <div class="row"><button class="btn primary" data-act="coach-add">Add a trainee</button></div>`;
  return `<div class="stack">
    ${r.rows.map((t) => `<section class="you roster">
      <div class="row" style="justify-content:space-between"><p class="label">${esc(t.name)} &middot; ${esc(t.seat)}, ${esc(t.department)}</p><span class="chip ${t.done === t.modules.length ? 'good' : ''}">${t.done} of ${t.modules.length} signed off</span></div>
      ${t.note ? `<p class="soft">${esc(t.note)}</p>` : ''}
      <ol class="notes">${t.modules.map((m) => `<li><strong>${esc(m.title)}</strong> <span class="chip ${STATE_CHIP[m.state]}">${esc(m.state)}</span>${m.plays ? ` <span class="soft">played ${m.plays}, got through ${m.wins}</span>` : ''}${m.reads.length ? `<br><span class="soft">${m.reads.map((x) => `${esc(x.area)}: ${esc(x.read)}`).join('; ')}</span>` : ''}${m.commitment ? `<br><em>&ldquo;${esc(m.commitment)}&rdquo;</em>${m.by ? ` <span class="soft">by ${esc(m.by)}</span>` : ''}` : ''}${m.signedOff ? `<br><span class="soft">Signed off by ${esc(m.signedOff)}</span>` : ''}</li>`).join('')}</ol>
      <p class="soft">${t.lastHeard ? `Last progress code ${esc(t.lastHeard)}.` : 'No progress code yet.'} Assigned ${esc(t.issued)}${t.open === 'all' ? ', all open at once' : ', in order'}.</p>
      <div class="row"><button class="btn small" data-act="coach-code" data-id="${t.id}">${openCode === t.id ? 'Hide the code' : 'Assignment code'}</button><button class="btn small" data-act="coach-paste" data-id="${t.id}">Paste a progress code</button><button class="btn small quiet" data-act="coach-edit" data-id="${t.id}">Edit</button>${pending?.act === 'coach-remove' && pending.id === t.id ? `<button class="btn small" data-act="coach-remove" data-id="${t.id}">Yes, remove</button><button class="btn small quiet" data-act="cancel">Keep</button>` : `<button class="btn small quiet" data-act="ask-coach-remove" data-id="${t.id}">Remove</button>`}</div>
      ${openCode === t.id ? `<div class="codebox"><label class="label" for="acode-${t.id}">Send this to ${esc(t.name)}. They paste it on the title screen.</label><textarea id="acode-${t.id}" class="code" rows="4" readonly>${esc(assignmentCode(save, t.id))}</textarea><div class="row"><button class="btn primary small" data-act="copy" data-target="acode-${t.id}">Copy</button></div></div>` : ''}
      ${codeBox === `paste-${t.id}` ? `<div class="codebox"><label class="label" for="pcode-${t.id}">Paste ${esc(t.name)}'s progress code</label><textarea id="pcode-${t.id}" class="code" rows="4" placeholder="SHFTP1."></textarea><div class="row"><button class="btn primary small" data-act="coach-paste-go" data-id="${t.id}">Read it</button><button class="btn quiet small" data-act="cancel">Cancel</button></div></div>` : ''}
    </section>`).join('')}
    <div class="row"><button class="btn primary" data-act="coach-add">Add a trainee</button><button class="btn" data-act="coach-fetch" ${sendState?.busy ? 'disabled' : ''}>Fetch progress sent from the page</button></div>
    ${sendState?.busy ? '<p class="banner info">Reading the store&hellip;</p>' : sendState?.ok ? `<p class="signed">${esc(sendState.ok)}</p>` : sendState?.why ? `<p class="warn">${esc(sendState.why)}</p>` : ''}
  </div>`;
}

function addTab(r) {
  tdraft = tdraft || { name: '', seat: '', department: '', modules: [], open: 'inorder', note: '' };
  const v = profileView({});
  const mods = tdraft.seat ? assignable(tdraft.seat) : [];
  const chip = (field, id, label, on) => `<button class="chip pick ${on ? 'on' : ''}" data-tpick="${field}" data-id="${id}" aria-pressed="${on}">${esc(label)}</button>`;
  return `<div class="stack">
    <section><p class="label">Name</p><input id="tname" type="text" value="${esc(tdraft.name)}"></section>
    <section><p class="label">Seat</p><div class="chips grid">${v.seats.map((x) => chip('seat', x.id, x.label, tdraft.seat === x.id)).join('')}</div></section>
    <section><p class="label">Department</p><div class="chips grid">${v.departments.map((d) => chip('department', d.id, d.name, tdraft.department === d.id)).join('')}</div></section>
    <section><p class="label">Modules to assign${tdraft.seat ? `, written for a ${esc(v.seats.find((x) => x.id === tdraft.seat).label.toLowerCase())}` : ''} (tap in the order you want them played)</p>
      ${tdraft.seat ? `<div class="stack">${mods.map((m) => { const i = tdraft.modules.indexOf(m.id); return `<button class="rung compact ${i >= 0 ? 'on' : ''}" data-tpick="modules" data-id="${m.id}" aria-pressed="${i >= 0}"><span class="n">${i >= 0 ? i + 1 : '&middot;'}</span><span class="body"><h3>${esc(m.title)}</h3><span class="soft">${esc(m.purpose)}</span><span class="chips">${m.focus.map((f) => `<span class="chip focus">${esc(f)}</span>`).join('')}</span></span></button>`; }).join('')}</div>` : '<p class="soft">Pick a seat first; the list is what is written for it.</p>'}
      ${tdraft.modules.length > 4 ? `<p class="warn">${tdraft.modules.length} modules. Three to five is a term\'s worth; a long list is a shelf, not a path.</p>` : ''}</section>
    <section><p class="label">Opening</p><div class="chips grid">${chip('open', 'inorder', 'In order, each on the sign-off of the one before', tdraft.open === 'inorder')}${chip('open', 'all', 'All open at once', tdraft.open === 'all')}</div></section>
    <section><p class="label">A note for yourself (optional)</p><input id="tnote" type="text" value="${esc(tdraft.note)}" placeholder="why these modules"></section>
    <div class="row"><button class="btn primary" data-act="coach-save">${tdraft.id ? 'Save the changes' : 'Add and make the code'}</button><button class="btn quiet" data-act="coach-cancel">Cancel</button></div>
  </div>`;
}

function groupsTab() {
  return `<div class="stack">
    <p class="soft">Sessions to run with a room, each built on a module everyone plays on their own phone with the same seed. Ninety minutes to two hours, four to ten people, a flip chart, and a commitment each person reads aloud. The plan is for you; the reveal stays with you until the debrief.</p>
    ${GROUP_ORDER.map((id) => { const g = GROUP_SESSIONS[id]; const open = groupOpen === id; return `<section class="you">
      <div class="row" style="justify-content:space-between"><h3>${esc(g.title)}</h3><span class="chip">${g.minutes} min</span></div>
      <p>${esc(g.purpose)}</p>
      <p class="soft">Played: <strong>${esc(MODULES[g.module].title)}</strong>. ${esc(g.size)}. From: ${esc(g.from)}.</p>
      <div class="row"><button class="btn small" data-act="group-open" data-id="${id}">${open ? 'Close the plan' : 'The plan'}</button></div>
      ${open ? `<table class="plan"><tbody>${g.blocks.map(([m, w, how]) => `<tr><td class="min">${m}</td><td><strong>${esc(w)}</strong><br>${esc(how)}</td></tr>`).join('')}</tbody></table>
        <p class="label">Debrief questions</p><ol class="notes">${g.questions.map((q) => `<li>${esc(q)}</li>`).join('')}</ol>
        <details class="fold"><summary>For you, not the room: the reveal</summary><p>${esc(g.reveal)}</p></details>
        <p class="label">The commitment card</p><p>${esc(g.commitment)}</p>` : ''}
    </section>`; }).join('')}
  </div>`;
}

function coachProfileScreen() {
  draft = draft || { name: save.coach?.name || '', department: save.coach?.department || '' };
  const v = profileView({});
  return `<main class="screen">
    <div><button class="btn quiet" data-act="coach">Back</button></div>
    <div class="stack"><p class="label">Northern Motors</p><h2>You, the coach</h2></div>
    <p class="soft">Your name goes on the codes you hand out, so a trainee sees who assigned them. Nothing else.</p>
    ${banner ? `<p class="warn">${esc(banner)}</p>` : ''}
    <section><p class="label">Your name</p><input id="pname" type="text" autocomplete="name" value="${esc(draft.name)}"></section>
    <section><p class="label">Your department (optional)</p><div class="chips grid">${v.departments.map((d) => `<button class="chip pick ${draft.department === d.id ? 'on' : ''}" data-pick="department" data-id="${d.id}">${esc(d.name)}</button>`).join('')}</div></section>
    <button class="btn primary block" data-act="coach-profile-save">Save</button>
  </main>`;
}

// ================================================================ the brief
function briefScreen() {
  const b = briefView(briefId, save.profile);
  const m = trackView(save).modules.find((x) => x.id === briefId);
  const other = save.run && !save.run.over ? save.run : null;
  return `<main class="screen">
    <div><button class="btn quiet" data-act="track">Back to the track</button></div>
    <div class="stack"><p class="label">Module ${m.n} &middot; ${b.weeks} weeks &middot; as ${esc(b.playedAs)}</p><h2>${esc(b.title)}</h2>${b.purpose ? `<p class="purpose">${esc(b.purpose)}</p>` : `<p class="soft">${esc(b.teaches)}</p>`}</div>
    ${b.seat ? `<p class="banner info">${esc(b.seat)}</p>` : ''}
    <div class="prose"><p>${esc(b.brief[0])}</p>${b.brief.length > 1 ? `<details class="fold"><summary>Read the rest of the brief</summary>${b.brief.slice(1).map((p) => `<p>${esc(p)}</p>`).join('')}</details>` : ''}</div>
    <section><p class="label">Trains</p><p>${b.focus.map((f) => `<strong>${esc(f.label)}</strong>${f.seatArea ? ' (your seat)' : ''}`).join(' and ')}: ${esc(b.focus.map((f) => f.about.replace(/\.$/, '')).join('; ').toLowerCase())}.</p></section>
    <section><p class="label">To get through it</p><p>${esc(b.goal)}</p><p class="soft">Lose by: ${esc(b.lose.map((l) => l.charAt(0).toLowerCase() + l.slice(1)).join('; '))}.</p></section>
    <details class="fold crewfold"><summary>Your crew: ${esc(crewStrip(briefId, seatFor(save.profile)).map((c) => c.name).join(', '))}</summary><div class="people">${crewStrip(briefId, seatFor(save.profile)).map((c) => `<div class="person"><canvas data-portrait="${c.id}" aria-hidden="true"></canvas><div class="body"><span class="name">${esc(c.name)}</span><span class="soft">${esc(c.station)}${c.lead ? ' &middot; lead' : ''}</span><span>${esc(c.about)}</span></div></div>`).join('')}</div></details>
    ${other ? `<p class="warn">Starting this ends your run of ${esc(MODULES[other.moduleId].title)} in week ${other.week}. It will not count as played.</p>` : ''}
    <button class="btn primary block" data-act="start-module" data-id="${b.id}">Start Monday</button>
  </main>`;
}

// ================================================================ the week
const CUE = { huddle: 'At the huddle', deadline: 'Request &middot; deadline', people: 'Request &middot; one of yours', safety: 'Safety', optional: 'Request', pressure: 'Request &middot; pressure', develop: 'Before you go', shortcut: 'Shortcut offered', overtime: 'Overtime', yours: 'A decision', notYours: 'A decision', plain: 'Request' };
const TYPE = { late: 'Lateness', rework: 'Rework', load: 'Carrying too much', friction: 'Friction', hazard: 'Safety', recurring: 'The same fire', escalation: 'A decision', standards: 'Two standards', constraint: 'Where it waits', huddle: 'The huddle', newhand: 'The new hand', otherside: 'From the other side', customer: 'Internal customer', infowork: 'Hidden rework', erp: 'The system', lean: 'The 5S event', flow: 'Flow rounds' };

function weekScreen() {
  const v = weekView(save.run, plan);
  const last = v.paint.lastShipped === null ? 'no week yet' : `${v.paint.lastShipped} of ${v.paint.lastAsked} last week`;
  const tabs = [['week', 'Week'], ['crew', 'People'], ['log', 'Log'], ['menu', 'Menu']];
  const body = tab === 'week' ? weekTab(v) : tab === 'crew' ? crewTab(v) : tab === 'log' ? logTab(v) : menuTab();
  return `<header class="hud"><span class="turn">Week ${v.week} of ${v.weeks}</span><span class="mod">${esc(v.module.title)}</span><span class="paint">Paint: ${esc(last)}</span></header>
    <nav class="tabs">${tabs.map(([id, label]) => `<button data-tab="${id}" class="${tab === id ? 'on' : ''}">${label}</button>`).join('')}</nav>
    <main class="screen">${body}</main>
    ${tab === 'week' ? `<div class="runbar"><div class="inner"><span class="hrs">${h(v.hours.total)}</span><button class="btn primary" data-action="run">Run the week</button></div></div>` : ''}`;
}

function weekTab(v) {
  const out = [];
  if (v.away) out.push('<p class="banner">You are in the audit room most of this week. The meetings already take 18 hours; Kev is running the floor.</p>');
  if (v.managerAway) out.push('<p class="banner info">Dana is away. Russ is covering her departments as well as his own.</p>');
  if (v.covering) out.push(`<p class="banner info">${esc(v.covering)}</p>`);
  out.push(`<div class="bay"><div class="legend"><span>Fit-up</span><span>Body weld</span><span>Finish</span><span>Paint</span></div><canvas data-bay="week" aria-label="The welding bay this week"></canvas><p class="caption" data-caption>Tap someone to see how they look from across the bay.</p></div>`);
  if (v.flow) out.push(roundBoard(v.flow));
  else if (v.history.length) out.push(spark(v.history, v.weeks));
  if (v.dept.supCapN !== null && v.dept.supCapN !== undefined) out.push(meter('Kev runs his floor', v.dept.supCapN, v.dept.supCap));
  if (v.dept.lean !== null && v.dept.lean !== undefined) out.push(meter('The 5S event, still standing', v.dept.lean, `${Math.round(v.dept.lean * 100)}%`));
  if (!save.track.seen?.howto) out.push(howTo());
  out.push(hoursPanel(v.hours, v.floorItems, v.tired));
  const time = v.cards.filter((c) => ['coach', 'cover', 'walk'].includes(c.kind));
  out.push(`<div class="tickets">${v.cards.filter((c) => !time.includes(c)).map(ticket).join('')}${time.length ? timeStrip(time) : ''}</div>`);
  return out.join('');
}

// The first week's explainer. The author on beta 1: "It definitely needs more
// depth and more explanation."
function howTo() {
  return `<article class="ticket"><div class="kind"><span class="label">How a week works</span></div><h3>Forty hours. The floor takes most of them.</h3>
    <p class="body">Pick what to do on each ticket; the bar shows your hours. Over forty costs you. Nobody tells you the cause of a problem: ask, watch, act, read Friday.</p>
    <button class="btn" data-act="howto-done">Got it</button></article>`;
}

/** The flow rounds' board: the flip chart from the plane exercise. One row a
 *  round; the rules now; what changed when. */
function roundBoard(f) {
  const rule = { batch: (r) => (r.batch === 1 ? 'Batch of one' : 'Rack of six'), pull: (r) => (r.pull ? 'Pull: two-slot rack' : 'Push'), check: (r) => (r.check === 'source' ? 'Check at each station' : 'Check at the end') };
  const name = { batch: 'batch', pull: 'pull', check: 'check' };
  const rows = f.rounds.map((r) => `<tr><td>${r.week}</td><td class="${r.bodies >= r.asked ? 'ok' : 'short'}">${r.bodies}/${r.asked}</td><td>${r.wip ?? ''}</td><td>${r.lead ?? '&ndash;'}</td><td><span class="latebar" title="Defects found at finish"><span style="width:${Math.min(100, Math.round((r.late || 0) / 1.5 * 100))}%"></span></span></td><td>${esc(r.changed.map((c) => `${name[c]}${r.slid.includes(c) ? ' (slid back)' : ''}`).join(', '))}</td></tr>`).join('');
  return `<div class="board"><div class="row" style="justify-content:space-between"><span class="label">The board by fit-up</span></div>
    <div class="chips">${['batch', 'pull', 'check'].map((k) => `<span class="chip rule">${esc(rule[k](f.rules))}</span>`).join('')}</div>
    ${f.rounds.length ? `<table><thead><tr><th>Round</th><th>Bodies</th><th>Waiting</th><th>Days</th><th>Late</th><th>Changed</th></tr></thead><tbody>${rows}</tbody></table>` : '<p class="soft">Round one runs this week, the old way. Its numbers go up on Friday.</p>'}
  </div>`;
}

/** Paint, week by week: what it asked for and what it got. */
function spark(history, weeks) {
  const W = 20, G = 6, Hh = 40;
  const max = Math.max(8, ...history.map((r) => Math.max(r.asked, r.bodies)));
  const bars = history.map((r, i) => { const x = i * (W + G); const a = Hh * r.asked / max, b = Hh * r.bodies / max; return `<rect x="${x}" y="${Hh - a}" width="${W}" height="${a}" class="ask"/><rect x="${x + 3}" y="${Hh - b}" width="${W - 6}" height="${b}" class="${r.bodies >= r.asked ? 'got' : 'short'}"/><text x="${x + W / 2}" y="${Hh + 12}" class="wk">${i + 1}</text>`; }).join('');
  const w = weeks * (W + G) - G;
  return `<div class="spark"><div class="row" style="justify-content:space-between"><span class="label">Paint, week by week</span><span class="soft">outline asked &middot; filled got</span></div><svg viewBox="0 0 ${w} ${Hh + 16}" width="${w}" height="${Hh + 16}" role="img" aria-label="Bodies paint got each week against what it asked for"><line x1="0" y1="${Hh}" x2="${w}" y2="${Hh}" class="axis"/>${bars}</svg></div>`;
}

function meter(label, x, word) {
  return `<div class="meterline"><span class="label">${esc(label)}</span><span class="meter"><span style="width:${(100 * Math.max(0, Math.min(1, x))).toFixed(0)}%"></span></span><span class="soft">${esc(word)}</span></div>`;
}

/** Your own time, on one card: the floor walk, a booth, an hour with someone. */
function timeStrip(cards) {
  const rows = cards.map((c) => {
    const pick = plan.picks[c.id] ?? c.pick;
    const opts = c.options.map((o) => `<button class="chip pick ${o.id === pick ? 'on' : ''}" data-card="${c.id}" data-opt="${o.id}" aria-pressed="${o.id === pick}">${esc(c.kind === 'cover' ? (o.days ? `${o.days} day${o.days > 1 ? 's' : ''}` : 'No') : c.kind === 'walk' ? (o.id === 'walk' ? 'Walk it' : 'No') : o.id === 'none' ? 'No' : o.label.replace(/^An hour with /, ''))}</button>`).join('');
    const title = c.kind === 'cover' ? 'Weld a booth yourself (8 h a day)' : c.kind === 'walk' ? 'Walk the floor (2 h)' : 'An hour with someone (1 h)';
    return `<div class="timerow"><span>${esc(title)}</span><span class="chips">${opts}</span></div>`;
  }).join('');
  return `<article class="ticket"><div class="kind"><span class="label">Your time</span></div>${rows}</article>`;
}

function hoursPanel(hr, items = [], tired = '') {
  const max = Math.max(70, Math.ceil(hr.total / 5) * 5);
  const w = (n) => `${(100 * n / max).toFixed(2)}%`;
  const state = hr.total > hr.bottleneck ? 'bottleneck' : hr.total > hr.ceiling ? 'over' : '';
  return `<div class="hours">
    <div class="total ${state}"><span class="label">Your week</span><span class="num">${h(hr.total)}</span></div>
    <div class="bar" role="img" aria-label="${h(hr.total)} planned against a forty-hour week"><span class="floor" style="width:${w(hr.floor)}"></span><span class="meet" style="width:${w(hr.meetings)}"></span><span class="routine" style="width:${w(hr.routine)}"></span><span class="chosen" style="width:${w(hr.chosen)}"></span></div>
    <div class="marks"><i style="left:${w(hr.ceiling)}">40</i><i style="left:${w(hr.bottleneck)}">55</i></div>
    <div class="key"><span><b class="floor"></b>${esc(hr.floorLabel || 'The floor')} ${h(hr.floor)}</span>${hr.meetings ? `<span><b class="meet"></b>${esc(hr.meetingsLabel)} ${h(hr.meetings)}</span>` : ''}<span><b class="routine"></b>Standing week ${h(hr.routine)}</span><span><b class="chosen"></b>Your choices ${h(hr.chosen)}</span></div>
    <p class="limit">${esc(hr.limit)}</p>
    ${hr.table ? `<p class="limit">At the table this week: ${h(hr.table.worked)} of ${h(hr.table.of)}. What you choose to do comes off the table unless you stay to make it up.</p>` : ''}
    ${tired ? `<p class="banner">${esc(tired)}</p>` : ''}
    ${items.length ? `<details class="floorlist"${floorOpen ? ' open' : ''}><summary data-act="floor-toggle">Where the floor's ${h(hr.floor)} go${(() => { const top = [...items].sort((a, b) => b.hours - a.hours)[0]; return top ? `: mostly ${esc(top.label.charAt(0).toLowerCase() + top.label.slice(1).replace(/:.*$/, ''))}` : ''; })()}</summary><ul>${[...items].sort((a, b) => Number(!!(b.problem || b.pushed)) - Number(!!(a.problem || a.pushed)) || b.hours - a.hours).map((it) => `<li class="${it.problem ? 'fallout' : it.pushed ? 'pushed' : ''}"><span>${esc(it.label)}${it.pushed ? ' <span class="chip">pushed off</span>' : ''}</span><span class="num">${h(it.hours)}</span></li>`).join('')}</ul><p class="soft">Fixing a problem at the root takes its fallout off this list.</p></details>` : ''}
  </div>`;
}

function ticket(c) {
  if (c.kind === 'routine') {
    const skipped = c.items.filter((it) => plan.skip.includes(it.id));
    const hours = c.items.filter((it) => !plan.skip.includes(it.id)).reduce((a, it) => a + it.hours, 0);
    const sum = skipped.length ? `${c.items.length - skipped.length} of ${c.items.length} done, ${h(hours)}. Skipping: ${skipped.map((it) => it.label.toLowerCase()).join(', ')}.` : `All ${c.items.length} done, ${h(hours)}.`;
    if (!routineOpen) {
      return `<article class="ticket"><div class="kind"><span class="label">Standing week</span></div><h3>${esc(c.title)}</h3><p class="body">${esc(sum)}</p>
        ${c.gone.length ? `<p class="soft">Kev does these now: ${esc(c.gone.join(', '))}.</p>` : ''}
        <button class="btn" data-act="routine-open">Skip something this week</button></article>`;
    }
    return `<article class="ticket"><div class="kind"><span class="label">Standing week</span></div><h3>${esc(c.title)}</h3><p class="body">${esc(c.body)}</p>
      <div class="checklist">${c.items.map((it) => { const on = !plan.skip.includes(it.id); return `<button class="check ${on ? 'on' : 'off'}" data-skip="${it.id}" aria-pressed="${on}"><span class="box"></span><span>${esc(it.label)}<span class="why">${esc(it.why)}</span></span><span class="h">${on ? h(it.hours) : 'skipped'}</span></button>`; }).join('')}</div>
      ${c.gone.length ? `<p class="soft">Kev does these now: ${esc(c.gone.join(', '))}.</p>` : ''}
      <button class="btn quiet" data-act="routine-close">Fold it away</button></article>`;
  }
  const pick = plan.picks[c.id] ?? c.pick;
  let kind = 'Your time';
  let cls = 'ticket';
  if (c.kind === 'problem') { kind = c.main ? `The module's problem &middot; ${TYPE[c.type]}` : `Red tag &middot; ${TYPE[c.type]}`; cls += ' problem'; if (c.type === 'hazard') cls += ' safety'; }
  if (c.kind === 'script') { kind = CUE[c.cue] || 'Request'; if (c.cue === 'safety' || c.cue === 'shortcut') cls += ' safety'; }
  const age = c.kind === 'problem' ? (c.weeks ? `<span class="label">Open ${c.weeks} week${c.weeks > 1 ? 's' : ''}${c.waiting ? ' &middot; waiting on someone' : ''}</span>` : `<span class="label tagged">New</span>`) : '';
  return `<article class="${cls}"><div class="kind"><span class="label">${kind}</span>${age}</div><h3>${esc(c.title)}</h3><p class="body">${esc(c.body)}</p>
    ${c.know?.length ? `<div class="know"><span class="label">What you know</span>${c.know.map((k) => `<p>${esc(k)}</p>`).join('')}</div>` : ''}
    <div class="opts" role="radiogroup" aria-label="${esc(c.title)}">${c.options.map((o) => `<button class="opt ${o.id === pick ? 'on' : ''}" role="radio" aria-checked="${o.id === pick}" data-card="${c.id}" data-opt="${o.id}"><span class="dot"></span><span class="t">${esc(o.label)}</span><span class="h">${o.hours ? h(o.hours) : '0 h'}</span></button>`).join('')}</div></article>`;
}

function crewTab(v) {
  const pv = peopleView(save.profile);
  const yours = pv.yours.length ? `<section><h2>Your corner of the plant</h2><div class="people">${pv.yours.map((d) => `<div class="person nopic"><div class="body"><span class="name">${esc(d.name)} <span class="chip">${esc(d.how)}</span></span><span class="soft">${esc(d.supervisor === 'you, in the welding seat' ? 'Supervisor: the seat this module is played in' : `Supervisor ${d.supervisor}`)} &middot; ${d.people} people &middot; ${esc(d.stations.join(', '))}</span><span>${esc(d.what)}</span></div></div>`).join('')}</div></section>` : '';
  const plant = `${yours}<section><h2>Beyond the bay</h2><p class="soft">${esc(pv.about)}</p>
    <p><span class="label">The line, in order</span><br>${pv.flow.map(esc).join(' &rarr; ')} &rarr; out the door</p>
    <ul class="notes">${pv.vehicles.map((x) => `<li><strong>${esc(x.name)}:</strong> ${esc(x.what)}</li>`).join('')}</ul>
    ${pv.groups.map((g) => `<p class="label">${esc(g.title)}</p><div class="people">${g.people.map((p) => `<div class="person nopic"><div class="body"><span class="name">${esc(p.name)}</span><span class="soft">${esc(p.role)}</span><span>${esc(p.about)}</span></div></div>`).join('')}</div>`).join('')}</section>`;
  return crewList(v) + plant;
}

function crewList(v) {
  return `<h2>Your crew</h2><p class="soft">What you can see from across the bay and what people have told you. What they have not told you is not here.</p>
    <div class="people">${v.crew.map((c) => `<div class="person"><canvas data-portrait="${c.id}" aria-hidden="true"></canvas><div class="body"><span class="name">${esc(c.name)}</span><span class="soft">${esc(c.station)}${c.lead ? ' &middot; lead' : ''} &middot; ${esc(c.status)}</span>
      ${c.mood ? `<dl class="facts"><dt>Seems</dt><dd>${esc(c.mood)}</dd><dt>With you</dt><dd>${esc(c.trust)}</dd></dl>` : ''}
      <span>${esc(c.about)}</span>${c.known.map((k) => `<span class="soft">${esc(k.title)}${k.told ? `: ${esc(k.told)}` : ''}</span>`).join('')}</div></div>`).join('')}</div>`;
}

function logTab(v) {
  if (!v.history.length) return '<h2>The log</h2><p class="soft">Nothing yet. Every Friday report lands here once you have run a week.</p>';
  return `<h2>The log</h2><div class="stack">${[...v.history].reverse().map((r) => `<section><p class="label">Week ${r.week} &middot; ${h(r.hours)} &middot; ${r.bodies} of ${r.asked} bodies</p><div class="report">${r.lines.map(line).join('')}</div></section>`).join('')}</div>`;
}

function menuTab() {
  return `<h2>Menu</h2><div class="stack">
    <button class="btn" data-act="track">Back to the track (the run waits)</button>
    <button class="btn" data-act="feedback">Your thoughts, for the coach</button>
    <button class="btn" data-act="export">Copy a save code</button>
    ${codeBox === 'export' ? exportBox() : ''}
    ${pending?.act === 'abandon' ? `<p class="warn">Abandon this run? It will not count as played, and the weeks so far are gone.</p><div class="row"><button class="btn" data-act="abandon">Yes, abandon it</button><button class="btn quiet" data-act="cancel">Keep playing</button></div>` : '<button class="btn quiet" data-act="ask-abandon">Abandon this run</button>'}
  </div>
  <p class="soft">Progress lives in this browser on this device. A save code moves it anywhere, including to your coach.</p>`;
}

const KIND = { number: 'Numbers', told: 'Heard', result: 'You did', event: 'The floor', signal: 'Noticed', consequence: 'Landed' };
function line(l) { return `<div class="line ${l.kind}"><span class="label">${KIND[l.kind] || ''}</span><p>${esc(l.text)}</p></div>`; }

function fridayModal(record, over) {
  const order = ['number', 'told', 'result', 'event', 'signal', 'consequence'];
  const first = record.lines[0];
  const rest = record.lines.slice(1).sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind));
  return `<p class="label">Friday &middot; week ${record.week}</p><h2>The week</h2><div class="report">${[first, ...rest].map(line).join('')}</div>
    <button class="btn primary block" data-act="close">${over ? 'See how it went' : 'On to Monday'}</button>`;
}

// ================================================================ the end
function endScreen() {
  const s = save.run;
  const o = s.outcome;
  const m = MODULES[s.moduleId];
  const p = o.profile;
  return `<main class="screen">
    <p class="label">${esc(m.title)} &middot; ended after week ${s.history.length}</p>
    <div class="verdict ${o.win ? 'win' : ''}"><h2>${o.win ? 'You got through it' : 'Not this time'}</h2><p>${esc(o.summary)}</p></div>
    <section><h3>How it went</h3><ul class="checks">${o.checks.map((c) => `<li><span class="stamp ${c.ok ? 'met' : 'missed'}">${c.ok ? 'Met' : 'Missed'}</span><span>${esc(c.label)}</span></li>`).join('')}</ul></section>
    <section><h3>What came from what</h3>${s.trace.length ? `<ul class="trace">${s.trace.map((t) => `<li><span><span class="label">Week ${t.week}</span> ${esc(t.text)}</span><span class="because">${esc(t.because)}</span></li>`).join('')}</ul>` : '<p class="soft">Nothing landed on you this time. The log shows how close it came.</p>'}</section>
    ${o.carried.length ? `<section><h3>Still open</h3><ul class="notes">${o.carried.map((c) => `<li>${esc(c)}</li>`).join('')}</ul></section>` : ''}
    <section class="profile"><div class="row" style="justify-content:space-between"><h3>What this module trains</h3><span class="chip amber">${esc(p.label)}</span></div>
      <p class="soft">Your decisions against what you knew at the time, on this module's focus only. For the debrief, never a score on a person.</p>
      ${p.focus.map((f) => { const lvl = { thin: 0, notyet: 1, getting: 2, solid: 3 }[f.read.id]; const list = (xs, cap) => `<ul class="notes small">${xs.slice(0, cap).map((e) => `<li>Wk ${e.week}: ${esc(e.note)}</li>`).join('')}</ul>${xs.length > cap ? `<details class="fold"><summary>${xs.length - cap} more</summary><ul class="notes small">${xs.slice(cap).map((e) => `<li>Wk ${e.week}: ${esc(e.note)}</li>`).join('')}</ul></details>` : ''}`; return `<div class="dom"><span>${esc(f.label)}</span><span class="score read-${f.read.id}">${esc(f.read.label)}</span>
        <span class="meter3 l${lvl}" role="img" aria-label="${esc(f.read.label)}"><i></i><i></i><i></i></span>
        ${f.made.length ? `<p class="label">Made (${f.made.length})</p>${list(f.made, 3)}` : ''}
        ${f.missed.length ? `<p class="label">Missed (${f.missed.length})</p>${list(f.missed, 3)}` : ''}
        ${!f.made.length && !f.missed.length ? '<p class="soft">Nothing clear either way: you did not touch the thing the module is about. Worth a question.</p>' : ''}</div>`; }).join('')}
      ${p.also.length ? `<details class="fold"><summary>Also on the floor, unrated: ${esc(p.also.map((a) => a.label).join(', '))}</summary><ul class="notes small">${p.also.map((a) => `<li><strong>${esc(a.label)}</strong>: ${a.made} made, ${a.missed} missed${a.notes.length ? `. ${esc(a.notes.map((n) => n.note).join('; '))}.` : ''}</li>`).join('')}</ul></details>` : ''}
    </section>
    <div class="stack"><button class="btn primary" data-act="debrief" data-id="${s.moduleId}">Debrief with your coach</button>
    <button class="btn" data-act="feedback">Your thoughts, for the coach</button>
    <button class="btn" data-act="replay" data-id="${s.moduleId}">Play it again (new week, new causes)</button>
    <button class="btn quiet" data-act="track">Back to the track</button></div>
  </main>`;
}

// ================================================================ the debrief
function debriefScreen() {
  const m = MODULES[debriefId];
  const t = save.track.modules[debriefId];
  const d = t.debrief || { answers: [], commitment: '' };
  return `<main class="screen">
    <div><button class="btn quiet" data-act="track">Back to the track</button></div>
    <div class="stack"><p class="label">Debrief &middot; ${esc(m.title)} &middot; Handbook ${esc(m.handbook)}</p><h2>Debrief</h2></div>
    <p class="soft">Ten minutes with your coach after a run. Answer in your own words. The answers stay on this device and travel in the save code.</p>
    ${t.last ? `<p class="banner info">Last run: ${t.last.win ? 'you got through it' : 'you did not get through it'}${t.last.reads?.length ? `. ${esc(t.last.reads.map((r) => `${MODULES[debriefId].focus.includes(r.id) ? r.id : r.id}: ${r.read}`).join('; '))}` : ''}. The end report and the log have the detail.</p>` : '<p class="warn">Play the module before debriefing it.</p>'}
    ${m.debrief.questions.map((q, i) => `<div class="q"><label for="dq${i}">${esc(q)}</label><textarea id="dq${i}" data-field="a${i}">${esc(d.answers[i] || '')}</textarea></div>`).join('')}
    <div class="q"><label for="dcommit">${esc(m.debrief.commitment)}</label><textarea id="dcommit" data-field="commitment">${esc(d.commitment || '')}</textarea>
      ${d.by ? `<span class="soft">Follow up by ${esc(d.by)}: ninety days from when you wrote it.</span>` : '<span class="soft">A follow-up date ninety days out is set when you write it.</span>'}</div>
    ${t.signedOff ? `<p class="signed">Signed off by ${esc(t.signedOff.coach)}. The next module is open.</p>`
      : `<div class="q"><label for="dcoach">Coach's name</label><input id="dcoach" type="text" autocomplete="name"></div><button class="btn primary" data-act="signoff" data-id="${debriefId}">Coach signs off</button>`}
    <button class="btn" data-act="copy-debrief" data-id="${debriefId}">Copy the debrief as text</button>
    <textarea id="dcopy" class="code" rows="6" readonly hidden></textarea>
  </main>`;
}

function debriefText(id) {
  const m = MODULES[id];
  const t = save.track.modules[id];
  const d = t.debrief || { answers: [] };
  const who = save.profile ? `${save.profile.name ? `${save.profile.name}, ` : ''}${save.profile.seat}, ${save.profile.department}` : '';
  return [`Shift debrief: ${m.title}`, who, t.last ? `Last run: ${t.last.win ? 'got through it' : 'did not get through it'}. ${(t.last.reads || []).map((r) => `${r.id} ${r.read}`).join('; ')} (practice, not assessment).` : '',
    ...m.debrief.questions.map((q, i) => `\n${q}\n${d.answers[i] || '(no answer)'}`), `\n${m.debrief.commitment}\n${d.commitment || '(none yet)'}`, d.by ? `Follow up by ${d.by}.` : '',
    t.signedOff ? `Signed off by ${t.signedOff.coach}.` : 'Not signed off yet.'].filter(Boolean).join('\n');
}

// ================================================================ your thoughts
// What a tester tells the coach. Context is read from the save (the last run,
// the profile); the words are theirs. Two ways out: send (claude.ai, signed
// in) and copy (always).
function feedbackScreen() {
  const last = save?.run?.over ? save.run : null;
  const lastModule = last ? MODULES[last.moduleId] : (() => { const ids = Object.keys(save?.track?.modules || {}).filter((id) => save.track.modules[id].plays); return ids.length ? MODULES[ids[ids.length - 1]] : null; })();
  note = note || { answers: { true: '', fake: '', missing: '', else: '' } };
  const you = save?.profile ? trackView(save).you : null;
  const inRun = save?.run && !save.run.over ? `in week ${save.run.week} of ${MODULES[save.run.moduleId].title}` : '';
  const ctx = [you ? `${you.seat}, ${you.department}` : 'No profile yet', inRun || (lastModule ? lastModule.title : 'No module played yet'), last ? (last.outcome.win ? 'got through it' : 'did not get through it') : ''].filter(Boolean);
  const notes = loadNotes();
  return `<main class="screen">
    <div><button class="btn quiet" data-act="feedback-back">Back</button></div>
    <div class="stack"><p class="label">For the coach</p><h2>Your thoughts</h2></div>
    <p class="soft">What you write here goes to the coach, with the module you played, your seat and how it ended. Not your save, not your answers in the debrief. Write it the way you would say it.</p>
    <p><span class="label">About</span><br>${ctx.map(esc).join(' &middot; ')}</p>
    <div class="q"><label for="fb-true">What felt true to your floor?</label><textarea id="fb-true" data-fb="true">${esc(note.answers.true)}</textarea></div>
    <div class="q"><label for="fb-fake">What felt fake, or would never happen?</label><textarea id="fb-fake" data-fb="fake">${esc(note.answers.fake)}</textarea></div>
    <div class="q"><label for="fb-missing">What was missing: an option you wanted, a question you would have asked?</label><textarea id="fb-missing" data-fb="missing">${esc(note.answers.missing)}</textarea></div>
    <div class="q"><label for="fb-else">Anything else: the look, the length, the words, how long it took</label><textarea id="fb-else" data-fb="else">${esc(note.answers.else)}</textarea></div>
    ${sendState?.busy ? '<p class="banner info">Sending&hellip;</p>' : sendState?.ok ? '<p class="signed">Sent. The coach has it. Thank you.</p>' : sendState?.why ? `<p class="warn">${esc(sendState.why)}</p>` : ''}
    <div class="stack">
      <button class="btn primary" data-act="feedback-send" ${sendState?.busy ? 'disabled' : ''}>Send to the coach</button>
      <button class="btn" data-act="feedback-copy">Copy as text to message instead</button>
    </div>
    <textarea id="fb-copy" class="code" rows="8" readonly hidden></textarea>
    ${notes.length ? `<p class="soft">${notes.length} note${notes.length === 1 ? '' : 's'} written on this device so far. Sending sends all of them.</p>` : ''}
  </main>`;
}

function readNote() {
  for (const k of ['true', 'fake', 'missing', 'else']) note.answers[k] = app.querySelector(`[data-fb="${k}"]`)?.value ?? note.answers[k];
  const last = save?.run?.over ? save.run : null;
  const you = save?.profile ? trackView(save).you : null;
  return {
    at: new Date().toLocaleString(), name: save?.profile?.name || '', seat: you?.seat || '', department: you?.department || '',
    module: last ? MODULES[last.moduleId].title : save?.run ? `${MODULES[save.run.moduleId].title} (in week ${save.run.week})` : '', outcome: last ? (last.outcome.win ? 'got through it' : 'did not get through it') : '',
    reads: last ? last.outcome.profile.focus.map((f) => `${f.label}: ${f.read.label}`).join('; ') : '',
    answers: { ...note.answers },
  };
}

// ================================================================ render
function render() {
  if (!save && screen !== 'title') screen = 'title';
  let html;
  if (screen === 'title') html = titleScreen();
  else if (screen === 'profile') html = profileScreen();
  else if (screen === 'feedback') html = feedbackScreen();
  else if (screen === 'coach-profile' && save.role === 'coach') html = coachProfileScreen();
  else if ((screen === 'coach' || screen === 'track') && save.role === 'coach') { screen = 'coach'; html = coachScreen(); }
  else if (screen === 'track' && !save.profile) { screen = 'profile'; html = profileScreen(); }
  else if (screen === 'track') html = trackScreen();
  else if (screen === 'brief') html = briefScreen();
  else if (screen === 'debrief') html = debriefScreen();
  else if (screen === 'week' && save.run && !save.run.over) html = weekScreen();
  else if (save.run?.over) { screen = 'end'; html = endScreen(); }
  else { screen = 'track'; html = trackScreen(); }
  app.innerHTML = html + (modal ? `<div class="scrim" role="dialog" aria-modal="true"><div class="sheet">${modal}</div></div>` : '');
  mountArt();
}

function mountArt() {
  for (const cv of app.querySelectorAll('canvas[data-bay]')) {
    const data = cv.dataset.bay === 'demo' ? demoFloor() : weekView(save.run, plan).floor;
    const cap = cv.parentElement.querySelector('[data-caption]');
    mountBay(cv, data, (p) => { if (cap) cap.textContent = p ? p.caption : 'Nobody there. Tap a person.'; });
  }
  const crew = [...crewStrip(screen === 'brief' ? briefId : save?.run?.moduleId, screen === 'brief' ? seatFor(save?.profile) : save?.run?.seat || 'supervisor')];
  for (const cv of app.querySelectorAll('canvas[data-portrait]')) {
    const c = crew.find((x) => x.id === cv.dataset.portrait);
    if (c) drawPortrait(cv, c.look, c.lead);
  }
}

function fail(err) {
  console.error(err);
  modal = `<h2>Something went wrong</h2><p>${esc(err?.message || err)}</p>
    <p>Your progress was saved before this. Copy this code somewhere safe, then reload the page:</p>
    <textarea class="code" rows="4" readonly>${save ? esc(toCode(save)) : ''}</textarea>
    <button class="btn primary block" data-act="close">Close</button>`;
  try { render(); } catch { /* the modal is the last resort */ }
}

// ================================================================ input
function act(t) {
  const a = t.dataset.act;
  if (a !== 'cancel' && !a.startsWith('ask-')) pending = null;
  switch (a) {
    case 'new': save = becomeTrainee(newSave()); persist(); draft = null; screen = 'profile'; codeBox = null; banner = null; return;
    case 'new-coach': save = becomeCoach(newSave()); persist(); draft = null; screen = 'coach-profile'; codeBox = null; banner = null; return;
    case 'coach': screen = 'coach'; draft = null; codeBox = null; banner = null; return;
    case 'coach-profile': draft = null; screen = 'coach-profile'; banner = null; scrollTo(0, 0); return;
    case 'coach-profile-save': {
      draft.name = app.querySelector('#pname')?.value ?? draft.name;
      save = becomeCoach(save, draft); persist(); draft = null; banner = null; screen = 'coach'; scrollTo(0, 0); return;
    }
    case 'coach-add': tdraft = null; coachTab = 'add'; banner = null; scrollTo(0, 0); return;
    case 'coach-edit': { const row = save.coach.roster.find((x) => x.id === t.dataset.id); tdraft = row ? { ...row, modules: [...row.modules] } : null; coachTab = 'add'; banner = null; scrollTo(0, 0); return; }
    case 'coach-cancel': tdraft = null; coachTab = 'trainees'; banner = null; return;
    case 'coach-save': {
      readTdraft();
      try { save = setTrainee(save, tdraft); persist(); openCode = tdraft.id || save.coach.roster.at(-1).id; tdraft = null; coachTab = 'trainees'; banner = null; scrollTo(0, 0); } catch (e) { banner = e.message; }
      return;
    }
    case 'coach-code': openCode = openCode === t.dataset.id ? null : t.dataset.id; codeBox = null; return;
    case 'coach-paste': codeBox = `paste-${t.dataset.id}`; openCode = null; sendState = null; return;
    case 'coach-paste-go': {
      const code = app.querySelector(`#pcode-${t.dataset.id}`)?.value || '';
      try { const r = recordProgress(save, code); save = r.save; persist(); codeBox = null; banner = `Read: ${r.trainee.name}'s progress.`; } catch (e) { banner = e.message; }
      return;
    }
    case 'ask-coach-remove': pending = { act: 'coach-remove', id: t.dataset.id }; return;
    case 'coach-remove': save = removeTrainee(save, t.dataset.id); persist(); return;
    case 'coach-fetch': {
      sendState = { busy: true };
      fetchProgress().then((r) => {
        if (!r.ok) { sendState = { why: r.why }; render(); return; }
        let read = 0;
        for (const rec of r.records) { try { save = recordProgress(save, progressCodeOf(rec)).save; read++; } catch { /* a record for nobody on the roster */ } }
        persist(); sendState = { ok: `${r.records.length} record${r.records.length === 1 ? '' : 's'} in the store; ${read} matched someone on your roster.` }; render();
      });
      return;
    }
    case 'group-open': groupOpen = groupOpen === t.dataset.id ? null : t.dataset.id; return;
    case 'progress': codeBox = codeBox === 'progress' ? null : 'progress'; sendState = null; return;
    case 'progress-send': {
      sendState = { busy: true };
      sendProgress(progressOf(save)).then((r) => { sendState = r.ok ? { ok: true } : { why: r.why }; render(); });
      return;
    }
    case 'profile': draft = null; screen = 'profile'; banner = null; scrollTo(0, 0); return;
    case 'profile-save': {
      try { save = setProfile(save, { ...draft, since: save.profile?.since || new Date().toISOString().slice(0, 10) }); persist(); draft = null; banner = null; screen = 'track'; scrollTo(0, 0); } catch (e) { banner = e.message; }
      return;
    }
    case 'ask-new': pending = { act: 'new' }; return;
    case 'ask-abandon': pending = { act: 'abandon' }; return;
    case 'cancel': pending = null; codeBox = null; return;
    case 'continue': save = loadSaved(); screen = save?.role === 'coach' ? 'coach' : save?.run && !save.run.over ? 'week' : save?.profile ? 'track' : 'profile'; tab = 'week'; return;
    case 'title': screen = 'title'; codeBox = null; return;
    case 'track': screen = 'track'; modal = null; codeBox = null; return;
    case 'resume': screen = save.run.over ? 'end' : 'week'; tab = 'week'; return;
    case 'brief': briefId = t.dataset.id; screen = 'brief'; scrollTo(0, 0); return;
    case 'start-module': case 'replay': {
      save = startRun(save, t.dataset.id || briefId, (Math.random() * 2 ** 31) >>> 0);
      persist(); plan = { picks: {}, skip: [] }; tab = 'week'; screen = 'week'; scrollTo(0, 0); return;
    }
    case 'abandon': save = { ...save, run: null }; persist(); screen = 'track'; return;
    case 'close': modal = null; if (save?.run?.over) { screen = 'end'; scrollTo(0, 0); } return;
    case 'debrief': debriefId = t.dataset.id; screen = 'debrief'; scrollTo(0, 0); return;
    case 'signoff': {
      const name = app.querySelector('#dcoach')?.value || '';
      try { save = signOff(save, t.dataset.id, name); persist(); banner = null; } catch (e) { modal = `<h2>Not yet</h2><p>${esc(e.message)}</p><button class="btn primary block" data-act="close">OK</button>`; }
      return;
    }
    case 'copy-debrief': {
      const box = app.querySelector('#dcopy');
      const text = debriefText(t.dataset.id);
      copy(text, box);
      return;
    }
    case 'open-all': save = setOpenAll(save, !save.track.openAll); persist(); return;
    case 'export': codeBox = 'export'; return;
    case 'feedback': note = null; sendState = null; screen = 'feedback'; scrollTo(0, 0); return;
    case 'feedback-back': note = null; sendState = null; screen = save?.run?.over ? 'end' : save?.run ? 'week' : save?.profile ? 'track' : 'title'; return;
    case 'feedback-copy': { const n = readNote(); copy(noteText(n), app.querySelector('#fb-copy')); return; }
    case 'feedback-send': {
      const n = readNote();
      if (!Object.values(n.answers).some((t) => t.trim())) { sendState = { why: 'Write something first: one line is plenty.' }; return; }
      const notes = saveNote(n);
      sendState = { busy: true };
      sendNotes(notes).then((r) => { sendState = r.ok ? { ok: true } : { why: r.why }; if (r.ok) note = { answers: { true: '', fake: '', missing: '', else: '' } }; render(); });
      return;
    }
    case 'load-code': codeBox = 'load'; return;
    case 'load-go': {
      const code = app.querySelector('#codein')?.value || '';
      try {
        const kind = kindOf(code);
        if (kind === 'assignment') { save = takeAssignment(save || newSave(), code); persist(); codeBox = null; banner = `Assigned by ${save.assignment.coach}. Your seat and department are set; add what you want to work on if you like.`; draft = null; screen = 'profile'; }
        else if (kind === 'progress') { if (save?.role !== 'coach') throw new Error('That is a trainee\'s progress code. Only a coach profile can read it: start as a coach, add the trainee, then paste it.'); const r = recordProgress(save, code); save = r.save; persist(); codeBox = null; banner = `Read: ${r.trainee.name}'s progress.`; screen = 'coach'; }
        else { save = fromCode(code); persist(); codeBox = null; banner = null; screen = save.role === 'coach' ? 'coach' : 'track'; }
      } catch (e) { banner = e.message; }
      return;
    }
    case 'copy': copy(app.querySelector(`#${t.dataset.target}`)?.value || '', app.querySelector(`#${t.dataset.target}`)); return;
    case 'install': install?.(); return;
    case 'routine-open': routineOpen = true; return;
    case 'howto-done': save = markSeen(save, 'howto'); persist(); return;
    case 'floor-toggle': floorOpen = !floorOpen; return;
    case 'routine-close': routineOpen = false; return;
  }
}

function readTdraft() { tdraft.name = app.querySelector('#tname')?.value ?? tdraft.name; tdraft.note = app.querySelector('#tnote')?.value ?? tdraft.note; }
/** A store record back into a code, so one reader handles both routes. */
function progressCodeOf(rec) { const { updated, ...p } = rec; return 'SHFTP1.' + btoa(unescape(encodeURIComponent(JSON.stringify(p)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }

function copy(text, box) {
  const show = () => { if (box) { box.hidden = false; box.value = text; box.focus(); box.select(); } };
  try { navigator.clipboard.writeText(text).then(() => { banner = 'Copied.'; show(); }, show); } catch { show(); }
  show();
}

function run() {
  const { save: next, record } = playWeek(save, plan);
  save = next; persist();
  plan = { picks: {}, skip: [] };
  modal = fridayModal(record, save.run.over);
}

app.addEventListener('click', (e) => {
  const t = e.target.closest('[data-act],[data-tab],[data-action],[data-opt],[data-skip],[data-pick],[data-ctab],[data-tpick]');
  if (!t || busy) return;
  if (t.tagName === 'SUMMARY') e.preventDefault();   // the page owns the open state
  busy = true;
  let keepScroll = false;
  try {
    if (t.dataset.tab) { tab = t.dataset.tab; codeBox = null; pending = null; scrollTo(0, 0); }
    else if (t.dataset.ctab) { if (coachTab === 'add' && tdraft) readTdraft(); coachTab = t.dataset.ctab; codeBox = null; pending = null; banner = null; scrollTo(0, 0); }
    else if (t.dataset.tpick) {
      readTdraft();
      const f = t.dataset.tpick; const id = t.dataset.id;
      if (f === 'modules') tdraft.modules = tdraft.modules.includes(id) ? tdraft.modules.filter((x) => x !== id) : [...tdraft.modules, id];
      else { tdraft[f] = id; if (f === 'seat') tdraft.modules = tdraft.modules.filter((m) => assignable(id).some((x) => x.id === m)); }
      keepScroll = true;
    }
    else if (t.dataset.action === 'run') run();
    else if (t.dataset.opt) { plan.picks[t.dataset.card] = t.dataset.opt; keepScroll = true; }
    else if (t.dataset.skip) { const id = t.dataset.skip; plan.skip = plan.skip.includes(id) ? plan.skip.filter((x) => x !== id) : [...plan.skip, id]; keepScroll = true; }
    else if (t.dataset.pick) {
      const f = t.dataset.pick; const id = t.dataset.id;
      draft.name = app.querySelector('#pname')?.value ?? draft.name; draft.erp = app.querySelector('#perp')?.value ?? draft.erp;
      if (f === 'seat' || f === 'department') { draft[f] = id; if (f === 'department' && draft.tied) draft.tied = draft.tied.filter((d) => d !== id); }
      else draft[f] = draft[f].includes(id) ? draft[f].filter((x) => x !== id) : [...draft[f], id];
      keepScroll = true;
    }
    else { if (t.dataset.act === 'profile-save' && draft) { draft.name = app.querySelector('#pname')?.value ?? draft.name; draft.erp = app.querySelector('#perp')?.value ?? draft.erp; } act(t); if (/^(routine-|floor-|howto-)/.test(t.dataset.act || '')) keepScroll = true; }
    const y = scrollY;
    render();
    if (keepScroll) scrollTo(0, y);
  } catch (err) { fail(err); } finally { busy = false; }
});

// Debrief answers save as they are typed.
let typing = null;
app.addEventListener('input', (e) => {
  const f = e.target.dataset?.field;
  if (!f || !debriefId) return;
  clearTimeout(typing);
  typing = setTimeout(() => {
    const m = MODULES[debriefId];
    const answers = m.debrief.questions.map((q, i) => app.querySelector(`#dq${i}`)?.value || '');
    const commitment = app.querySelector('#dcommit')?.value || '';
    const prev = save.track.modules[debriefId].debrief;
    let by = prev?.by || '';
    if (!by && commitment.trim()) { const d = new Date(); d.setDate(d.getDate() + 90); by = d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }); }
    try { save = saveDebrief(save, debriefId, { answers, commitment, by }); persist(); } catch (err) { console.error(err); }
  }, 300);
});

addEventListener('error', (e) => fail(e.error || e.message));
addEventListener('unhandledrejection', (e) => fail(e.reason));

// ================================================================ start
function start(snap = {}) {
  save = loadSaved();
  if (snap.screen && save) { screen = snap.screen; tab = snap.tab || 'week'; briefId = snap.briefId || null; debriefId = snap.debriefId || null; plan = snap.plan || plan; }
  installPrompt((go) => { install = go; if (screen === 'title') render(); });
  render();
  registerSW({ onUpdate: (reload) => { banner = 'A new version of Shift is ready.'; modal = `<h2>Update ready</h2><p>A new version of Shift has been installed.</p><button class="btn primary block" data-act="reload-now">Reload now</button>`; render(); app.querySelector('[data-act="reload-now"]')?.addEventListener('click', reload); } });
}
try { globalThis.claude?.hot?.snapshot?.(() => ({ screen, tab, briefId, debriefId, plan })); } catch { /* no host */ }
if (globalThis.claude?.hot?.ready) globalThis.claude.hot.ready(start); else start(globalThis.claude?.hot?.data ?? {});

// For tools/smoke.mjs and tools/check-bundle.mjs: read-only access to the game.
globalThis.__game = { get state() { return save; } };
