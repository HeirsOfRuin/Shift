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
} from '../engine/game.js';
import { STORAGE_OK, lsGet, lsSet } from './storage.js';
import { registerSW, installPrompt } from './sw-register.js';
import { mountBay, drawPortrait } from './floor.js';

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
let floorOpen = true;        // the floor's itemised hours, open until folded     // the standing week, folded to one line unless opened
let busy = false;
let install = null;
let draft = null;          // the profile form in progress

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
    ${STORAGE_OK ? '' : '<p class="warn">This browser will not keep anything for this page, so progress is lost when you leave. Copy a save code from the menu before you go, or open Shift in its own tab.</p>'}
    ${banner ? `<p class="warn">${esc(banner)}</p>` : ''}
    <div class="stack">
      ${saved ? '<button class="btn primary" data-act="continue">Continue</button>' : '<button class="btn primary" data-act="new">Start: who are you here?</button>'}
      ${saved ? (pending?.act === 'new' ? `<p class="warn">This wipes the track on this device: every module played, every debrief. A save code from the menu keeps a copy.</p><div class="row"><button class="btn" data-act="new">Yes, start over</button><button class="btn quiet" data-act="cancel">Keep it</button></div>` : '<button class="btn" data-act="ask-new">Start over</button>') : ''}
      <button class="btn" data-act="load-code">Load a save code</button>
      ${install ? '<button class="btn" data-act="install">Install on this device</button>' : ''}
    </div>
    ${codeBox === 'load' ? loadBox() : ''}
  </main>`;
}

function loadBox() {
  return `<div class="codebox"><label class="label" for="codein">Paste a save code</label><textarea id="codein" class="code" rows="4" placeholder="SHFT1."></textarea>
    <div class="row"><button class="btn primary" data-act="load-go">Load it</button><button class="btn quiet" data-act="cancel">Cancel</button></div></div>`;
}

// ================================================================ the track
function trackScreen() {
  const t = trackView(save);
  return `<main class="screen">
    <div class="stack"><p class="label">Northern Motors &middot; ${esc(t.title)}</p><h2>${t.you ? `${esc(t.you.seat)}, ${esc(t.you.department)}` : 'The welding department'}</h2></div>
    ${t.you ? youCard(t.you) : ''}
    <p class="lede">${esc(t.intro)}</p>
    ${t.you ? `<p class="soft"><span class="label">Your path</span><br>The order below is built from your profile: what you want to work on first, what your seat leans on next, and what you called a strength last, as a check. Your coach can open any module.</p>` : ''}
    ${banner ? `<p class="banner">${esc(banner)}</p>` : ''}
    ${t.inRun ? `<div class="banner info row"><span>${t.inRun.over ? `Your last run of ${esc(t.inRun.title)} has ended.` : `You are in week ${t.inRun.week} of ${esc(t.inRun.title)}.`}</span><button class="btn" data-act="resume">${t.inRun.over ? 'See how it went' : 'Back to it'}</button></div>` : ''}
    <div class="ladder">${t.modules.map(rung).join('')}</div>
    ${t.notHere.length ? `<section><p class="label">Not in this seat</p>${t.notHere.map((m) => `<div class="rung locked"><span class="n">&middot;</span><span class="body"><h3>${esc(m.title)}</h3><span class="soft">${esc(m.teaches)}</span><span class="soft">${esc(m.why)}</span></span></div>`).join('')}</section>` : ''}
    <div class="toggle"><button class="btn" data-act="open-all">${t.openAll ? 'Lock modules to the sign-off order' : 'Open every module'}</button><span class="soft">Beta switch. Normally each module opens when the one before it has been debriefed and signed off by a coach.</span></div>
    <div class="row"><button class="btn" data-act="export">Copy a save code</button><button class="btn quiet" data-act="title">Title screen</button></div>
    ${codeBox === 'export' ? exportBox() : ''}
  </main>`;
}

function rung(m) {
  const chips = [];
  if (!m.open) chips.push('<span class="chip">Locked</span>');
  if (m.plays) chips.push(`<span class="chip">Played ${m.plays}</span>`);
  if (m.wins) chips.push(`<span class="chip good">Got through ${m.wins}</span>`);
  if (m.debriefed) chips.push('<span class="chip amber">Debriefed</span>');
  if (m.signedOff) chips.push(`<span class="chip good">Signed off: ${esc(m.signedOff.coach)}</span>`);
  const inner = `<span class="n">${m.n}</span><span class="body"><h3>${esc(m.title)}</h3><span class="soft">${esc(m.teaches)} &middot; ${m.weeks} weeks</span><span class="chips">${m.focus.map((f) => `<span class="chip focus">${esc(f)}</span>`).join('')}</span>${m.because ? `<span class="soft">${esc(m.because)}</span>` : ''}${chips.length ? `<span class="chips">${chips.join('')}</span>` : ''}${m.open ? '' : `<span class="soft">${esc(m.why)}</span>`}</span>`;
  return m.open ? `<button class="rung" data-act="brief" data-id="${m.id}">${inner}</button>` : `<div class="rung locked">${inner}</div>`;
}

function youCard(y) {
  return `<section class="you"><div class="row" style="justify-content:space-between"><p class="label">Your profile${y.name ? ` &middot; ${esc(y.name)}` : ''}</p><button class="btn quiet small" data-act="profile">Change</button></div>
    <p>${esc(y.seat)} in ${esc(y.department)} (${esc(y.group)}, under ${esc(y.manager)}).${y.tied.length ? ` Also tied to ${esc(y.tied.join(', '))}.` : ''}</p>
    ${y.work.length ? `<p><span class="label">Want to work on</span><br>${esc(y.work.join(', '))}</p>` : ''}
    ${y.strengths.length ? `<p><span class="label">Strengths</span><br>${esc(y.strengths.join(', '))}</p>` : ''}
    ${y.written ? '' : `<p class="soft">Every module is written in the welding bay so far. You play them from there; the people screen puts ${esc(y.department)} and its neighbours first.</p>`}
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
    return `<button class="check ${on ? 'on' : 'off'}" data-pick="${field}" data-id="${a.id}" aria-pressed="${on}" ${blocked ? 'disabled' : ''}><span class="box"></span><span>${esc(a.label)}<span class="why">${esc(a.about)}</span></span></button>`;
  };
  const areas = (field) => v.families.map((f) => `<p class="label">${esc(f.name)}</p><div class="checklist">${f.areas.map((a) => area(a, field)).join('')}</div>`).join('');
  const ready = draft.seat && draft.department;
  return `<main class="screen">
    <div><button class="btn quiet" data-act="${save?.profile ? 'track' : 'title'}">${save?.profile ? 'Back to the track' : 'Back'}</button></div>
    <div class="stack"><p class="label">Northern Motors</p><h2>Who are you here?</h2></div>
    <p class="soft">This shapes which modules come first and what the screens show. It is not a test. Your coach sees it, and you can change it any time.</p>
    ${banner ? `<p class="warn">${esc(banner)}</p>` : ''}
    <section><p class="label">Your name, for the debrief (optional)</p><input id="pname" type="text" autocomplete="name" value="${esc(draft.name)}" data-draft="name"></section>
    <section><p class="label">Your seat</p><div class="opts">${v.seats.map((x) => `<button class="opt ${draft.seat === x.id ? 'on' : ''}" data-pick="seat" data-id="${x.id}"><span class="dot"></span><span class="t">${esc(x.label)}<span class="why">${esc(x.about)}</span></span></button>`).join('')}</div></section>
    <section><p class="label">Your department</p><div class="opts">${v.departments.map((d) => `<button class="opt ${draft.department === d.id ? 'on' : ''}" data-pick="department" data-id="${d.id}"><span class="dot"></span><span class="t">${esc(d.name)} <span class="soft">&middot; ${esc(d.group)}</span><span class="why">${esc(d.what)}</span></span></button>`).join('')}</div>
      <p class="soft">The modules are written in ${esc(v.writtenBay)} so far. Pick your real department anyway: it sets your neighbours and your path, and it is where the next modules get written.</p></section>
    ${draft.department ? `<section><p class="label">Departments tied to you</p>
      ${v.byLine.length ? `<p class="soft">By the line: ${v.byLine.map((d) => `${esc(d.name)} (${d.how})`).join(', ')}. Always counted.</p>` : ''}
      <p class="soft">Anything else you deal with every week:</p>
      <div class="checklist">${v.others.map((d) => `<button class="check ${chosen(draft.tied, d.id) ? 'on' : 'off'}" data-pick="tied" data-id="${d.id}" aria-pressed="${chosen(draft.tied, d.id)}"><span class="box"></span><span>${esc(d.name)}</span></button>`).join('')}</div></section>` : ''}
    <section><p class="label">What you want to work on (up to ${v.limit})</p><p class="soft">Your own call. These modules come first.</p>${areas('work')}</section>
    <section><p class="label">What you would call a strength (up to ${v.limit})</p><p class="soft">These come last, as a check: a self-rating is a claim, and the floor gets a vote.</p>${areas('strengths')}</section>
    ${ready ? '' : '<p class="soft">Pick a seat and a department to go on. The rest is optional.</p>'}
    <button class="btn primary block" data-act="profile-save" ${ready ? '' : 'disabled'}>${save?.profile ? 'Save the changes' : 'Start the track'}</button>
  </main>`;
}

function exportBox() {
  return `<div class="codebox"><label class="label" for="codeout">Save code: paste it into Load a save code on any device</label><textarea id="codeout" class="code" rows="5" readonly>${esc(toCode(save))}</textarea>
    <div class="row"><button class="btn primary" data-act="copy" data-target="codeout">Copy</button><button class="btn quiet" data-act="cancel">Done</button></div></div>`;
}

// ================================================================ the brief
function briefScreen() {
  const b = briefView(briefId, save.profile);
  const m = trackView(save).modules.find((x) => x.id === briefId);
  const other = save.run && !save.run.over ? save.run : null;
  return `<main class="screen">
    <div><button class="btn quiet" data-act="track">Back to the track</button></div>
    <div class="stack"><p class="label">Module ${m.n} &middot; Handbook ${esc(b.handbook)}</p><h2>${esc(b.title)}</h2><p class="soft">${esc(b.teaches)} &middot; ${b.weeks} weeks &middot; played as ${esc(b.playedAs)}</p></div>
    ${b.seat ? `<p class="banner info">${esc(b.seat)}</p>` : ''}
    <div class="prose">${b.brief.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
    <section><p class="label">What this module trains</p>${b.focus.map((f) => `<p><strong>${esc(f.label)}${f.seatArea ? ' (your seat)' : ''}.</strong> ${esc(f.about)}${f.seatArea && b.seatAreaNote ? ` ${esc(b.seatAreaNote)}` : ''}</p>`).join('')}</section>
    <section><p class="label">To get through it</p><p>${esc(b.goal)}</p></section>
    <section><p class="label">Ways it goes wrong</p><ul class="notes">${b.lose.map((l) => `<li>${esc(l)}</li>`).join('')}</ul></section>
    <section><p class="label">Your crew</p><div class="people">${crewStrip(briefId, seatFor(save.profile)).map((c) => `<div class="person"><canvas data-portrait="${c.id}" aria-hidden="true"></canvas><div class="body"><span class="name">${esc(c.name)}</span><span class="soft">${esc(c.station)}${c.lead ? ' &middot; lead' : ''}</span><span>${esc(c.about)}</span></div></div>`).join('')}</div></section>
    ${other ? `<p class="warn">Starting this ends your run of ${esc(MODULES[other.moduleId].title)} in week ${other.week}. It will not count as played.</p>` : ''}
    <button class="btn primary block" data-act="start-module" data-id="${b.id}">Start Monday</button>
  </main>`;
}

// ================================================================ the week
const CUE = { huddle: 'At the huddle', deadline: 'Request &middot; deadline', people: 'Request &middot; one of yours', safety: 'Safety', optional: 'Request', pressure: 'Request &middot; pressure', develop: 'Before you go', shortcut: 'Shortcut offered', overtime: 'Overtime', yours: 'A decision', notYours: 'A decision', plain: 'Request' };
const TYPE = { late: 'Lateness', rework: 'Rework', load: 'Carrying too much', friction: 'Friction', hazard: 'Safety', recurring: 'The same fire', escalation: 'A decision', standards: 'Two standards', constraint: 'Where it waits', huddle: 'The huddle', newhand: 'The new hand' };

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
  out.push(`<div class="bay"><div class="legend"><span>Fit-up</span><span>Body weld</span><span>Finish</span><span>Paint</span></div><canvas data-bay="week" aria-label="The welding bay this week"></canvas><p class="caption" data-caption>Tap someone to see how they look from across the bay.</p></div>`);
  out.push(`<p class="soft"><span class="label">This module</span><br>${esc(v.module.goal)}</p>`);
  if (v.dept.supCap) out.push(`<p class="soft"><span class="label">Kev, this week</span><br>${esc(v.dept.supCap)}.</p>`);
  if (!save.track.seen?.howto) out.push(howTo());
  out.push(hoursPanel(v.hours, v.floorItems, v.tired));
  out.push(`<div class="tickets">${v.cards.map(ticket).join('')}</div>`);
  return out.join('');
}

// The first week's explainer. The author on beta 1: "It definitely needs more
// depth and more explanation."
function howTo() {
  return `<article class="ticket"><div class="kind"><span class="label">How a week works</span></div><h3>Forty hours, and the floor takes most of them</h3>
    <div class="prose"><p>Each turn is a week. Before you choose anything, the floor has already taken its hours: walk-ups, chasing parts, calls about bodies gone to paint. Every open problem adds more. The bar below shows where they go.</p>
    <p>Your standing week (meetings, timecards, huddles) comes next. What is left is yours to spend on the tickets: the module's problem, requests, an hour with someone, welding a booth yourself, walking the floor.</p>
    <p>Going past forty is allowed, and it costs: weeks over forty wear you down, and run down, your fixes land less often. If the week will not fit, something in the system is taking too much. Usually it is a problem nobody has fixed at the root.</p>
    <p>Nobody tells you the cause of a problem. People tell you what they tell you. Ask, watch, act, and read Friday's report. The People tab says who everyone is.</p></div>
    <button class="btn" data-act="howto-done">Got it</button></article>`;
}

function hoursPanel(hr, items = [], tired = '') {
  const max = Math.max(70, Math.ceil(hr.total / 5) * 5);
  const w = (n) => `${(100 * n / max).toFixed(2)}%`;
  const state = hr.total > hr.bottleneck ? 'bottleneck' : hr.total > hr.ceiling ? 'over' : '';
  return `<div class="hours">
    <div class="total ${state}"><span class="label">Your week</span><span class="num">${h(hr.total)}</span></div>
    <div class="bar" role="img" aria-label="${h(hr.total)} planned against a forty-hour week"><span class="floor" style="width:${w(hr.floor)}"></span><span class="meet" style="width:${w(hr.meetings)}"></span><span class="routine" style="width:${w(hr.routine)}"></span><span class="chosen" style="width:${w(hr.chosen)}"></span></div>
    <div class="marks"><i style="left:${w(hr.ceiling)}">40</i><i style="left:${w(hr.bottleneck)}">55</i></div>
    <div class="key"><span><b class="floor"></b>${esc(hr.floorLabel || 'The floor')} ${h(hr.floor)}</span>${hr.meetings ? `<span><b class="meet"></b>Audit room ${h(hr.meetings)}</span>` : ''}<span><b class="routine"></b>Standing week ${h(hr.routine)}</span><span><b class="chosen"></b>Your choices ${h(hr.chosen)}</span></div>
    <p class="limit">${esc(hr.limit)}</p>
    ${hr.table ? `<p class="limit">At the table this week: ${h(hr.table.worked)} of ${h(hr.table.of)}. What you choose to do comes off the table unless you stay to make it up.</p>` : ''}
    ${tired ? `<p class="banner">${esc(tired)}</p>` : ''}
    ${items.length ? `<details class="floorlist"${floorOpen ? ' open' : ''}><summary data-act="floor-toggle">Where the floor's ${h(hr.floor)} go</summary><ul>${[...items].sort((a, b) => Number(!!(b.problem || b.pushed)) - Number(!!(a.problem || a.pushed)) || b.hours - a.hours).map((it) => `<li class="${it.problem ? 'fallout' : it.pushed ? 'pushed' : ''}"><span>${esc(it.label)}${it.pushed ? ' <span class="chip">pushed off</span>' : ''}</span><span class="num">${h(it.hours)}</span></li>`).join('')}</ul><p class="soft">Fixing a problem at the root takes its fallout off this list. Developing Kev and training Joel shrink it too.</p></details>` : ''}
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
    <section><h3>What came from what</h3>${s.trace.length ? `<ul class="trace">${s.trace.map((t) => `<li><span><span class="label">Week ${t.week}</span> ${esc(t.text)}</span><span class="because">${esc(t.because)}</span></li>`).join('')}</ul>` : '<p class="soft">Nothing landed on you this time: no resignations, no injuries, nothing that blew up. The Friday reports in the log show how close it came.</p>'}</section>
    ${o.carried.length ? `<section><h3>Still open</h3><ul class="notes">${o.carried.map((c) => `<li>${esc(c)}</li>`).join('')}</ul></section>` : ''}
    <section class="profile"><div class="row" style="justify-content:space-between"><h3>What this module trains</h3><span class="chip amber">${esc(p.label)}</span></div>
      <p class="soft">How your decisions read against what you knew when you made them, on this module's focus only. The moves below are what the module looks for; the list is what it saw. A conversation starter for the debrief, never a score on a person.</p>
      ${p.focus.map((f) => `<div class="dom"><span>${esc(f.label)}</span><span class="score read-${f.read.id}">${esc(f.read.label)}${f.read.id === 'thin' ? '' : ` &middot; ${f.n} decisions`}</span>
        <p class="soft explain">${esc(f.about)} The moves: ${esc(f.moves.join('; ').toLowerCase())}.</p>
        ${f.made.length ? `<p class="label">Made</p><ul class="notes">${f.made.map((e) => `<li>Week ${e.week}: ${esc(e.note)}</li>`).join('')}</ul>` : ''}
        ${f.missed.length ? `<p class="label">Missed</p><ul class="notes">${f.missed.map((e) => `<li>Week ${e.week}: ${esc(e.note)}</li>`).join('')}</ul>` : ''}
        ${!f.made.length && !f.missed.length ? '<p class="soft">Nothing clear either way. A run where you did not touch the thing the module is about is itself worth a question.</p>' : ''}</div>`).join('')}
      ${p.also.length ? `<p class="label">Also on the floor, unrated</p><ul class="notes">${p.also.map((a) => `<li><strong>${esc(a.label)}</strong>: ${a.made} made, ${a.missed} missed${a.notes.length ? `. ${esc(a.notes.map((n) => n.note).join('; '))}.` : ''}</li>`).join('')}</ul>` : ''}
    </section>
    <div class="stack"><button class="btn primary" data-act="debrief" data-id="${s.moduleId}">Debrief with your coach</button>
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

// ================================================================ render
function render() {
  if (!save && screen !== 'title') screen = 'title';
  let html;
  if (screen === 'title') html = titleScreen();
  else if (screen === 'profile') html = profileScreen();
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
    case 'new': save = newSave(); persist(); draft = null; screen = 'profile'; codeBox = null; banner = null; return;
    case 'profile': draft = null; screen = 'profile'; banner = null; scrollTo(0, 0); return;
    case 'profile-save': {
      try { save = setProfile(save, { ...draft, since: save.profile?.since || new Date().toISOString().slice(0, 10) }); persist(); draft = null; banner = null; screen = 'track'; scrollTo(0, 0); } catch (e) { banner = e.message; }
      return;
    }
    case 'ask-new': pending = { act: 'new' }; return;
    case 'ask-abandon': pending = { act: 'abandon' }; return;
    case 'cancel': pending = null; codeBox = null; return;
    case 'continue': save = loadSaved(); screen = save?.run && !save.run.over ? 'week' : save?.profile ? 'track' : 'profile'; tab = 'week'; return;
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
    case 'load-code': codeBox = 'load'; return;
    case 'load-go': {
      const code = app.querySelector('#codein')?.value || '';
      try { save = fromCode(code); persist(); codeBox = null; banner = null; screen = 'track'; } catch (e) { banner = e.message; }
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
  const t = e.target.closest('[data-act],[data-tab],[data-action],[data-opt],[data-skip],[data-pick]');
  if (!t || busy) return;
  if (t.tagName === 'SUMMARY') e.preventDefault();   // the page owns the open state
  busy = true;
  let keepScroll = false;
  try {
    if (t.dataset.tab) { tab = t.dataset.tab; codeBox = null; pending = null; scrollTo(0, 0); }
    else if (t.dataset.action === 'run') run();
    else if (t.dataset.opt) { plan.picks[t.dataset.card] = t.dataset.opt; keepScroll = true; }
    else if (t.dataset.skip) { const id = t.dataset.skip; plan.skip = plan.skip.includes(id) ? plan.skip.filter((x) => x !== id) : [...plan.skip, id]; keepScroll = true; }
    else if (t.dataset.pick) {
      const f = t.dataset.pick; const id = t.dataset.id;
      draft.name = app.querySelector('#pname')?.value ?? draft.name;
      if (f === 'seat' || f === 'department') { draft[f] = id; if (f === 'department') draft.tied = draft.tied.filter((d) => d !== id); }
      else draft[f] = draft[f].includes(id) ? draft[f].filter((x) => x !== id) : [...draft[f], id];
      keepScroll = true;
    }
    else { if (t.dataset.act === 'profile-save' && draft) draft.name = app.querySelector('#pname')?.value ?? draft.name; act(t); if (/^(routine-|floor-|howto-)/.test(t.dataset.act || '')) keepScroll = true; }
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
