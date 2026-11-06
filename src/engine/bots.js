// The five measurement bots, ported from the kill gate (prototypes/killgate/
// policies.mjs) to read the real inbox. Each sees only what the week screen
// shows: cards, what people told you, what you tried and what did not hold, the
// forecast. Never a hidden cause. `fits` on an option is common sense a good
// supervisor has (a later start fits a childcare problem), not a hint.
//
// A bot returns a plan: { picks: { cardId: optionId }, skip: [routine ids] }.

import { weekView } from './view.js';

// `pattern` is the two-rule bot from docs/REVIEW-loop.md: press the find-out
// option, then press the label that matches what you were told. It knows
// nothing about leadership. Since beta 15 the gate requires it to lose.
// `memoriser` (beta 17) has played betas 15 and 16 and learned their tells:
// the easy story each type's people told and each bystander's view (the
// data's `cover` and `bias`, which since beta 17 are no longer used to draw
// anything). It discounts those and acts on what is left, without reading
// trust or looking at evidence. `principle` (not in the tables) remembers
// nothing about any module except one rule: don't accept "it will sort
// itself out" without checking. The gate requires that remembering the tells
// is worth no more than the rule: there is nothing module-specific to learn.
export const POLICIES = ['firefighter', 'documenter', 'coach', 'ignorer', 'balanced', 'pattern', 'memoriser'];
const CEILING = { firefighter: 60, documenter: 46, coach: 48, ignorer: 45, balanced: 50, pattern: 50, memoriser: 50, principle: 50 };

// the fix on the ticket for a reason; in the lead hand's seat what needs a signature goes to Kev
const fitOn = (c, cause) => c.options.find((o) => (o.fits || []).includes(cause) && !c.failedTwice.includes(o.id))?.id || (c.options.some((o) => o.id === 'takeUp') && !c.waiting && !c.tried.includes('takeUp') ? 'takeUp' : null);

function memoriser(c, remembers = true) {
  if (!remembers) c = { ...c, covers: [c.passing], views: [] };
  const ways = Object.fromEntries(c.find.options.filter((o) => o.way).map((o) => [o.way, o.id]));
  const f = c.findings.filter((x) => !x.repeat);
  const known = (x) => (x.way === 'ask' && c.covers.includes(x.says)) || (x.way === 'around' && c.views.includes(x.says));
  const credible = f.filter((x) => x.says && !known(x) && c.candidates.includes(x.says));
  if (credible.length) { const said = credible.at(-1).says; return ['none', said === c.passing ? 'leave' : fitOn(c, said) || 'leave']; }
  if (!f.some((x) => x.way === 'ask') && ways.ask) return [ways.ask, 'leave'];
  if (ways.around && !f.some((x) => x.way === 'around')) return [ways.around, 'leave'];
  // a known story: assume it is the lie, and act on the likeliest reason it is covering
  const other = c.candidates.find((x) => !c.covers.includes(x) && x !== c.passing) || c.candidates.find((x) => x !== c.passing);
  return ['none', (other && fitOn(c, other)) || 'leave'];
}

// The balanced style on a ticket that finds out (engine/findout.js): read the
// person, gather a second source before believing the easy story from someone
// wary, hold the line in front of the crew while finding out, act when the
// evidence agrees. Returns [find, do].
function reader(c) {
  const ways = Object.fromEntries(c.find.options.filter((o) => o.way).map((o) => [o.way, o.id]));
  const hold = c.holdId || 'leave';
  const fitFor = (cause) => fitOn(c, cause);
  const sup = c.supported;
  const f = c.findings.filter((x) => !x.repeat);
  const asked = f.some((x) => x.way === 'ask');
  const looked = f.some((x) => x.way === 'look');
  // "it will sort itself out" is checked against the evidence once before it is believed
  if (sup === c.passing && !looked && ways.look) return [ways.look, hold];
  if (sup) return sup === c.passing ? ['none', hold] : ['none', fitFor(sup) || hold];
  // while still finding out: hold the line if there is a way to; with nothing to hold
  // and two findings in hand, act on the likeliest reading rather than wait
  const meanwhile = c.holdId ? hold : f.length >= 2 && c.guess && c.guess !== c.passing ? fitFor(c.guess) || 'leave' : 'leave';
  // ask the person first unless they are wary of you; an opinion is worth less than the evidence
  if (!asked && ((c.band !== 'wary' && c.band !== 'opinion') || looked || !ways.look)) return [ways.ask, meanwhile];
  if (!looked && ways.look) return [ways.look, meanwhile];
  if (ways.around) return [ways.around, meanwhile];
  // everything in hand and nothing agrees: act on the likeliest reading
  return ['none', fitFor(c.guess && c.guess !== c.passing ? c.guess : c.candidates.find((x) => x !== c.passing) || c.candidates[0]) || hold];
}

// What each style does with a problem, given what it knows. Returns an option id.
const PROBLEM = {
  firefighter(c) {
    return { late: 'remind', rework: 'fixYourself', load: 'carry', friction: 'warning', hazard: c.waiting ? 'leave' : 'workOrder',
      recurring: 'fixYourself', escalation: 'decide', standards: 'matchThem',
      constraint: c.ruledOut.includes('weld') ? 'improveFit' : 'improveWeld', huddle: 'shutDown', newhand: 'fixHis', otherside: 'fixInPaint', bench: c.weeks === 0 ? 'doItAll' : 'callMe',
      customer: 'pushMore', infowork: 'faster', erp: 'ownSheet', lean: 'redoFor', flow: 'leave' }[c.type];
  },
  documenter(c) {
    if (c.type === 'late' || c.type === 'rework') return c.weeks % 2 === 0 ? 'document' : 'leave';
    if (c.type === 'friction') return 'warning';
    if (c.type === 'load') return c.weeks === 0 ? 'talk' : 'leave';
    if (c.type === 'hazard') return c.waiting ? 'leave' : 'workOrder';
    if (c.type === 'recurring') return c.waiting || c.ruledOut.length ? 'leave' : 'workOrder';
    if (c.type === 'escalation') return c.waiting ? 'leave' : 'askRuss';
    if (c.type === 'standards') return 'complain';
    if (c.type === 'constraint') return c.weeks === 0 ? 'askCrew' : c.ruledOut.includes('weld') ? 'leave' : 'improveWeld';
    if (c.type === 'huddle') return 'parkingLot';
    if (c.type === 'newhand') return c.weeks === 0 ? 'sheet' : c.weeks >= 2 && !c.tried.includes('document') ? 'document' : 'leave';
    if (c.type === 'bench') return c.tried.includes('sheet') ? 'leave' : 'sheet';
    if (c.type === 'otherside') return 'sendBack';
    if (c.type === 'customer') return c.weeks === 0 ? 'defend' : 'leave';
    if (c.type === 'infowork') return c.tried.includes('memo') ? (c.tried.includes('board') ? 'leave' : 'board') : 'memo';
    if (c.type === 'erp') return c.tried.includes('blame') ? 'leave' : 'blame';
    if (c.type === 'lean') return c.tried.includes('signs') ? (c.tried.includes('audit') ? 'leave' : 'audit') : 'signs';
    // the documenter checks quality: inspection at each station, whatever the round says
    if (c.type === 'flow') return c.flow.check === 'source' ? 'leave' : 'checkSource';
    return 'leave';
  },
  coach(c) {
    const t = c.told;
    switch (c.type) {
      case 'late': return !t || t === 'attitude' ? 'talk' : t === 'childcare' && !c.failedTwice.includes('accommodate') ? 'accommodate' : t === 'ride' && !c.failed.includes('carpool') ? 'carpool' : 'talk';
      case 'rework': return t === 'fixture' ? 'fixFixture' : 'coach';
      case 'load': return !t ? 'talk' : t === 'unowned' && !c.failedTwice.includes('redistribute') ? 'redistribute' : t === 'crunch' ? 'talk' : 'timeOff';
      case 'friction': return !t || t === 'personal' || t === 'badWeek' ? 'separate' : !c.failedTwice.includes('reset') ? 'reset' : 'separate';
      case 'hazard': return !t ? 'look' : t === 'noisy' || c.waiting ? 'leave' : 'workOrder';
      case 'recurring': return !t ? 'investigate' : t === 'setup' ? 'standardWork' : t === 'steel' ? 'raiseFab' : t === 'pin' && !c.waiting ? 'workOrder' : 'leave';
      case 'escalation': return !t ? 'check' : c.waiting ? 'leave' : 'askRuss';
      case 'standards': return t === 'spec' ? 'writeStandard' : 'talkPeer';
      // the coach trusts people: asks the crew, improves what they say
      case 'constraint': return !c.tried.includes('askCrew') ? 'askCrew' : c.ruledOut.includes('weld') ? 'leave' : 'improveWeld';
      case 'huddle': return !t ? 'talk' : { habit: 'parkingLot', parts: 'fixParts', unheard: 'giveFloor', newRoute: 'talk' }[t];
      case 'newhand': return !t ? 'watch' : { untaught: 'teach', afraid: 'pair', rushed: 'slowDown', settling: 'watch' }[t];
      // the coach hands over first and asks second
      case 'bench': return !t ? (c.tried.includes('handover') ? 'ask' : 'handover') : { unshown: 'handover', unseen: 'announce', wontAsk: 'steps', ready: 'leave' }[t];
      // the coach goes to the people first: Tyler, then paint's side
      case 'otherside': return c.pending ? 'checkPaint' : !t ? (c.tried.includes('slowTyler') ? 'lookPaint' : 'slowTyler') : { wire: 'swapWire', rushing: 'slowTyler', noStandard: 'writeStandard', careful: 'leave' }[t];
      case 'customer': return !t ? 'askPaint' : { timing: 'fixTiming', order: 'fixOrder', info: 'fixInfo', theirs: 'askPaint' }[t];
      // the coach answers people: points them at the answer before counting anything
      case 'infowork': return !t ? (c.tried.includes('point') ? 'tally' : 'point') : { board: 'board', travellers: 'travellers', youAnswer: 'point', newMix: 'leave' }[t];
      case 'erp': return !t ? 'trace' : { lateEntries: 'clockNow', wrongOps: 'fixOps', noIssue: 'issueMaterial', upgrade: 'trace' }[t];
      // the coach re-does it with the crew first and asks second
      case 'lean': return c.pending ? (!c.lean.audit ? 'audit' : 'leave') : !t ? (c.tried.includes('redoWith') ? 'ask' : 'redoWith') : { noOwner: 'owners', noAudit: 'audit', forThem: 'redoWith', moveIn: 'leave' }[t];
      // the coach asks the crew what they think and changes everything they suggest
      case 'flow': return c.tried.includes('all') ? 'leave' : 'all';
    }
    return 'leave';
  },
  ignorer() { return 'leave'; },
  memoriser(c) { return c.find ? memoriser(c) : PROBLEM.pattern(c); },
  principle(c) { return c.find ? memoriser(c, false) : PROBLEM.pattern(c); },
  // find out until someone tells you something (each way once, in the order listed), then do what they said
  pattern(c) {
    if (!c.told) { const ask = (c.find?.options || c.options).find((o) => o.kind === 'ask' && o.id !== 'none' && !c.tried.includes(o.id)); return ask ? ask.id : 'leave'; }
    const fit = c.options.find((o) => (o.fits || []).includes(c.told));
    return fit ? fit.id : 'leave';
  },
  balanced(c) {
    if (c.find) return reader(c);
    const t = c.told;
    switch (c.type) {
      case 'late':
        if (!t) return 'talk';
        if (t === 'childcare' && !c.failedTwice.includes('accommodate')) return 'accommodate';
        if (t === 'ride' && c.weeks < 1) return 'leave';                      // give the truck a week
        if (t === 'ride' && !c.failed.includes('carpool')) return 'carpool';
        return !c.failedTwice.includes('document') ? 'document' : 'talk';
      case 'rework':
        if (!t && !c.tried.includes('investigate')) return 'investigate';
        if (t === 'fixture') return 'fixFixture';
        if (t === 'newJig') return 'leave';                                   // it settles as they learn it
        return 'coach';
      case 'load':
        if (!t) return 'talk';
        if (t === 'unowned' && !c.failedTwice.includes('redistribute')) return 'redistribute';
        if (t === 'crunch') return 'talk';
        return 'timeOff';
      case 'friction':
        if (!t) return 'separate';
        if (t === 'badWeek') return 'leave';
        if (t === 'roles' && !c.failedTwice.includes('clarify')) return 'clarify';
        if (t === 'workload' && !c.failedTwice.includes('reset')) return 'reset';
        return 'expectations';
      case 'hazard':
        if (!t) return 'look';
        if (t === 'noisy') return 'leave';
        if (t === 'duct' && !c.tried.includes('shutBooth')) return 'shutBooth';
        if (t === 'filter') return c.waiting ? 'leave' : 'workOrder';
        return 'followUp';
      case 'recurring':
        if (!t) return 'investigate';
        if (t === 'pin') return c.waiting ? 'leadFix' : 'workOrder';
        if (t === 'setup') return 'standardWork';
        if (t === 'steel') return 'raiseFab';
        return 'leadFix';                                                     // contain it while the coil runs out
      case 'escalation':
        if (!t) return 'check';
        if (c.waiting) return 'leave';
        return { yours: 'decide', signoff: 'askRuss', engineering: 'engineering', dropped: 'leave' }[t];
      case 'standards':
        if (!t) return 'talkPeer';
        return { spec: 'writeStandard', pressure: 'handoff', unaware: 'showHer', newHire: 'leave' }[t];
      case 'constraint':
        if (!t) return 'look';
        return { fit: 'improveFit', weld: 'improveWeld', finish: 'improveFinish', mix: 'leave' }[t];
      case 'huddle':
        if (!t) return 'talk';
        return { habit: 'parkingLot', parts: 'fixParts', unheard: 'giveFloor', newRoute: 'leave' }[t];
      case 'newhand':
        if (!t) return 'watch';
        return { untaught: 'teach', afraid: 'pair', rushed: 'slowDown', settling: 'leave' }[t];
      case 'bench':
        if (!t) return 'ask';
        return { unshown: 'handover', unseen: 'announce', wontAsk: 'steps', ready: 'leave' }[t];
      case 'otherside':
        if (c.pending) return 'checkPaint';
        if (!t) return 'lookPaint';
        return { wire: 'swapWire', rushing: 'slowTyler', noStandard: 'writeStandard', careful: 'leave' }[t];
      case 'customer':
        if (!t) return 'askPaint';
        return { timing: 'fixTiming', order: 'fixOrder', info: 'fixInfo', theirs: 'leave' }[t];
      case 'infowork':
        if (!t) return 'tally';
        return { board: 'board', travellers: 'travellers', youAnswer: 'point', newMix: 'leave' }[t];
      case 'erp':
        if (!t) return 'trace';
        return { lateEntries: 'clockNow', wrongOps: 'fixOps', noIssue: 'issueMaterial', upgrade: 'leave' }[t];
      case 'flow': {
        // read a round; change the one rule it points at; read the next round if the change did not hold
        if (!t) return 'readRound';
        if (t === 'fine') return 'leave';
        const rule = { batch: 'batchOne', push: 'pull', late: 'checkSource' }[t];
        const set = { batchOne: c.flow.batch === 1, pull: c.flow.pull, checkSource: c.flow.check === 'source' }[rule];
        if (!set) return rule;
        if (c.flow.changedAgo >= 2 && c.flow.held === 0 && !c.tried.includes('readRound2')) return 'readRound';
        return 'leave';
      }
      case 'lean':
        // the fix is settling: add what keeps it alive
        if (c.pending) return !c.lean.owner ? 'owners' : !c.lean.audit ? 'audit' : 'leave';
        if (!t) return 'ask';
        return { noOwner: 'owners', noAudit: 'audit', forThem: 'redoWith', moveIn: 'leave' }[t];
    }
    return 'leave';
  },
};

// What each style does with a scripted card or a request.
function scripted(policy, card, v) {
  if (['pattern', 'memoriser', 'principle'].includes(policy)) policy = 'balanced';     // these are about problems; they take requests like anyone careful
  const by = (kind) => card.options.find((o) => o.kind === kind)?.id;
  const cue = card.cue;
  const fallback = card.pick;
  switch (policy) {
    case 'ignorer': return fallback;
    case 'firefighter':
      if (cue === 'huddle') return by('allow') ?? fallback;
      if (cue === 'deadline' || cue === 'pressure') return by('do') ?? fallback;
      if (cue === 'shortcut') return by('allow') ?? fallback;
      if (cue === 'overtime') return by('overtime') ?? by('up') ?? fallback;
      if (cue === 'yours' || cue === 'notYours') return by('decide') ?? fallback;
      return by('keep') ?? by('skip') ?? fallback;
    case 'documenter':
      if (cue === 'huddle') return by('hold') ?? fallback;
      if (cue === 'deadline' || cue === 'safety') return by('do') ?? fallback;
      if (cue === 'shortcut') return by('hold') ?? fallback;
      if (cue === 'yours' || cue === 'notYours') return by('ask') ?? fallback;
      if (cue === 'develop') return by('keep') ?? fallback;
      return by('skip') ?? by('no') ?? fallback;
    case 'coach':
      if (cue === 'huddle') return by('hold') ?? fallback;
      if (cue === 'people' || cue === 'safety') return by('do') ?? fallback;
      if (cue === 'develop') return by('delegate') ?? fallback;
      if (cue === 'shortcut') return (card.who.length ? by('allow') : by('hold')) ?? fallback;
      if (cue === 'yours' || cue === 'notYours') return by('ask') ?? fallback;
      return by('skip') ?? by('no') ?? fallback;
    case 'balanced':
      if (cue === 'huddle') return by('hold') ?? fallback;
      if (['deadline', 'people', 'safety', 'pressure'].includes(cue)) return by('do') ?? fallback;
      if (cue === 'develop') return by('delegate') ?? fallback;
      if (cue === 'shortcut') return by('hold') ?? fallback;
      if (cue === 'yours') return by('decide') ?? fallback;
      if (cue === 'notYours') return by('ask') ?? fallback;
      if (cue === 'overtime') return v.paint.forecast < v.paint.thisWeek - 1.5 ? (by('overtime') ?? by('up')) : by('no');
      return by('skip') ?? fallback;
  }
  return fallback;
}

// The manager's seat: four moves on every problem (KILLGATE-manager.md).
const MANAGER = {
  firefighter: () => 'rescue',
  documenter: () => 'direct',
  coach: () => 'coach',
  ignorer: () => 'leave',
  pattern: (c) => (!c.told ? 'coach' : 'direct'),
  memoriser: (c) => (!c.told ? 'coach' : 'direct'),
  principle: (c) => (!c.told ? 'coach' : 'direct'),
  balanced: (c) => (!c.told ? 'coach' : !c.plan ? (c.weeks >= 3 ? 'direct' : c.cap >= 0.55 ? 'leave' : 'coach') : 'leave'),
};

export function decide(s, policy) {
  const v = weekView(s, {});
  const ceiling = CEILING[policy];
  let left = ceiling - v.hours.total;
  const picks = {};
  const want = [];
  const problems = v.cards.filter((c) => c.kind === 'problem').sort((a, b) => b.main - a.main);
  for (const c of problems) {
    const pick = s.seat === 'manager' ? MANAGER[policy](c) : policy === 'documenter' && c.options.some((o) => o.id === 'takeUp') && !c.tried.includes('takeUp') ? 'takeUp' : PROBLEM[policy](c) || 'leave';
    for (const id of Array.isArray(pick) ? pick : [pick]) want.push([c, id]);
  }
  for (const c of v.cards.filter((x) => x.kind === 'script')) want.push([c, scripted(policy, c, v)]);
  const coach = v.cards.find((c) => c.kind === 'coach');
  if (coach && ['balanced', 'coach', 'pattern', 'memoriser', 'principle'].includes(policy)) {
    const learners = coach.options.filter((o) => o.id !== 'none');
    const joel = learners.find((o) => o.id === 'joel');
    want.push([coach, (joel || learners[0])?.id || 'none']);
  }
  const walk = v.cards.find((c) => c.kind === 'walk');
  if (walk && ['balanced', 'coach', 'pattern', 'memoriser', 'principle'].includes(policy)) want.push([walk, 'walk']);
  for (const [card, id] of want) {
    if (card.find && card.find.options.some((o) => o.id === id)) {
      // the find-out row of a ticket
      const fo = card.find.options.find((o) => o.id === id);
      if (fo.hours <= left) { picks[`${card.id}~find`] = fo.id; left -= fo.hours; }
      continue;
    }
    let opt = card.options.find((o) => o.id === id);
    // the lead hand's seat: what needs the supervisor becomes "take it to Kev";
    // the firefighter never does, the ignorer never does, the rest do
    if (!opt && card.options.some((o) => o.id === 'takeUp') && !['firefighter', 'ignorer'].includes(policy)) opt = card.options.find((o) => o.id === 'takeUp' && !card.waiting);
    if (!opt) continue;
    if (opt.hours <= left) { picks[card.id] = opt.id; left -= opt.hours; }
  }
  const cover = v.cards.find((c) => c.kind === 'cover');
  if (cover) {
    const gap = (margin) => Math.max(0, Math.ceil((v.paint.thisWeek + margin - v.paint.forecast) / 0.42));
    // a lead hand is already producing at fit-up; welding a booth empties their own table
    // a lead hand is already producing at fit-up; a second day in a booth empties their own table
    const most = s.seat === 'lead' ? 1 : 2;
    const days = { firefighter: Math.min(3, gap(0.8)), documenter: gap(-1.2) ? 1 : 0, coach: 0, ignorer: 0, balanced: Math.min(most, gap(-0.3)), pattern: Math.min(most, gap(-0.3)), memoriser: Math.min(most, gap(-0.3)), principle: Math.min(most, gap(-0.3)) }[policy];
    const afford = Math.max(0, Math.min(days, Math.floor(left / 8)));
    picks[cover.id] = `d${afford}`;
  }
  return { picks, skip: [] };
}
