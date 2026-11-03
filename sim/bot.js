// The five measurement bots, ported from the kill gate (prototypes/killgate/
// policies.mjs) to read the real inbox. Each sees only what the week screen
// shows: cards, what people told you, what you tried and what did not hold, the
// forecast. Never a hidden cause. `fits` on an option is common sense a good
// supervisor has (a later start fits a childcare problem), not a hint.
//
// A bot returns a plan: { picks: { cardId: optionId }, skip: [routine ids] }.

import { weekView } from '../src/engine/game.js';

export const POLICIES = ['firefighter', 'documenter', 'coach', 'ignorer', 'balanced'];
const CEILING = { firefighter: 60, documenter: 46, coach: 48, ignorer: 45, balanced: 50 };

// What each style does with a problem, given what it knows. Returns an option id.
const PROBLEM = {
  firefighter(c) {
    return { late: 'remind', rework: 'fixYourself', load: 'carry', friction: 'warning', hazard: c.waiting ? 'leave' : 'workOrder',
      recurring: 'fixYourself', escalation: 'decide', standards: 'matchThem' }[c.type];
  },
  documenter(c) {
    if (c.type === 'late' || c.type === 'rework') return c.weeks % 2 === 0 ? 'document' : 'leave';
    if (c.type === 'friction') return 'warning';
    if (c.type === 'load') return c.weeks === 0 ? 'talk' : 'leave';
    if (c.type === 'hazard') return c.waiting ? 'leave' : 'workOrder';
    if (c.type === 'recurring') return c.waiting || c.ruledOut.length ? 'leave' : 'workOrder';
    if (c.type === 'escalation') return c.waiting ? 'leave' : 'askRuss';
    if (c.type === 'standards') return 'complain';
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
    }
    return 'leave';
  },
  ignorer() { return 'leave'; },
  balanced(c) {
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
    }
    return 'leave';
  },
};

// What each style does with a scripted card or a request.
function scripted(policy, card, v) {
  const by = (kind) => card.options.find((o) => o.kind === kind)?.id;
  const cue = card.cue;
  const fallback = card.pick;
  switch (policy) {
    case 'ignorer': return fallback;
    case 'firefighter':
      if (cue === 'deadline' || cue === 'pressure') return by('do') ?? fallback;
      if (cue === 'shortcut') return by('allow') ?? fallback;
      if (cue === 'overtime') return by('overtime') ?? fallback;
      if (cue === 'yours' || cue === 'notYours') return by('decide') ?? fallback;
      return by('keep') ?? by('skip') ?? fallback;
    case 'documenter':
      if (cue === 'deadline' || cue === 'safety') return by('do') ?? fallback;
      if (cue === 'shortcut') return by('hold') ?? fallback;
      if (cue === 'yours' || cue === 'notYours') return by('ask') ?? fallback;
      if (cue === 'develop') return by('keep') ?? fallback;
      return by('skip') ?? by('no') ?? fallback;
    case 'coach':
      if (cue === 'people' || cue === 'safety') return by('do') ?? fallback;
      if (cue === 'develop') return by('delegate') ?? fallback;
      if (cue === 'shortcut') return (card.who.length ? by('allow') : by('hold')) ?? fallback;
      if (cue === 'yours' || cue === 'notYours') return by('ask') ?? fallback;
      return by('skip') ?? by('no') ?? fallback;
    case 'balanced':
      if (['deadline', 'people', 'safety', 'pressure'].includes(cue)) return by('do') ?? fallback;
      if (cue === 'develop') return by('delegate') ?? fallback;
      if (cue === 'shortcut') return by('hold') ?? fallback;
      if (cue === 'yours') return by('decide') ?? fallback;
      if (cue === 'notYours') return by('ask') ?? fallback;
      if (cue === 'overtime') return v.paint.forecast < v.paint.thisWeek - 1.5 ? by('overtime') : by('no');
      return by('skip') ?? fallback;
  }
  return fallback;
}

export function decide(s, policy) {
  const v = weekView(s, {});
  const ceiling = CEILING[policy];
  let left = ceiling - v.hours.total;
  const picks = {};
  const want = [];
  const problems = v.cards.filter((c) => c.kind === 'problem').sort((a, b) => b.main - a.main);
  for (const c of problems) want.push([c, PROBLEM[policy](c) || 'leave']);
  for (const c of v.cards.filter((x) => x.kind === 'script')) want.push([c, scripted(policy, c, v)]);
  const coach = v.cards.find((c) => c.kind === 'coach');
  if (coach && (policy === 'balanced' || policy === 'coach')) {
    const learners = coach.options.filter((o) => o.id !== 'none');
    const joel = learners.find((o) => o.id === 'joel');
    want.push([coach, (joel || learners[0])?.id || 'none']);
  }
  const walk = v.cards.find((c) => c.kind === 'walk');
  if (walk && (policy === 'balanced' || policy === 'coach')) want.push([walk, 'walk']);
  for (const [card, id] of want) {
    const opt = card.options.find((o) => o.id === id);
    if (!opt) continue;
    if (opt.hours <= left) { picks[card.id] = id; left -= opt.hours; }
  }
  const cover = v.cards.find((c) => c.kind === 'cover');
  if (cover) {
    const gap = (margin) => Math.max(0, Math.ceil((v.paint.thisWeek + margin - v.paint.forecast) / 0.42));
    const days = { firefighter: Math.min(3, gap(0.8)), documenter: gap(-1.2) ? 1 : 0, coach: 0, ignorer: 0, balanced: Math.min(2, gap(-0.3)) }[policy];
    const afford = Math.max(0, Math.min(days, Math.floor(left / 8)));
    picks[cover.id] = `d${afford}`;
  }
  return { picks, skip: [] };
}
