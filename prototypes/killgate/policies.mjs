// Five written policies. Each sees only view(s): what people told you, what you
// tried and what did not work. No hidden causes. Each has a ceiling on the hours
// it will work; the floor's interruptions come out of that ceiling first.

const cost = (v, p, action) => v.costs[p.type][action];

// Fill the week in priority order until the ceiling; then cover with what is left.
function budget(v, ceiling, wanted, coverWanted) {
  let left = ceiling - v.routine - v.lastInterrupts;
  const actions = [];
  for (const a of wanted) {
    const h = a.coach ? 1 : cost(v, v.problems.find((p) => p.id === a.problem), a.action);
    if (h <= left) { actions.push(a); left -= h; }
  }
  const cover = Math.max(0, Math.min(coverWanted, Math.floor(left / 8)));
  return { actions, cover, skip: [] };
}
const walking = (plan) => ({ ...plan, walk: true });
const gapDays = (v, margin) => {
  const gap = v.demand + margin - v.projected;
  return gap > 0 ? Math.ceil(gap / 0.42) : 0;
};

export const POLICIES = {
  // Keeps the line moving with his own hands: covers, fixes rework himself,
  // carries the lead's load himself, tells people to knock it off. Long hours.
  firefighter(v) {
    const want = [];
    for (const p of v.problems) {
      if (p.suppressed) continue;
      if (p.type === 'late') want.push({ problem: p.id, action: 'remind' });
      if (p.type === 'rework') want.push({ problem: p.id, action: 'fixYourself' });
      if (p.type === 'load') want.push({ problem: p.id, action: 'carry' });
      if (p.type === 'friction') want.push({ problem: p.id, action: 'warning' });
    }
    return budget(v, 60, want, Math.min(3, gapDays(v, 0.5)));
  },

  // Holds the standard on paper: writes up lateness and rework every other week,
  // warns on friction, asks the lead once how he is doing.
  documenter(v) {
    const want = [];
    for (const p of v.problems) {
      if (p.suppressed) continue;
      if ((p.type === 'late' || p.type === 'rework') && p.weeks % 2 === 0) want.push({ problem: p.id, action: 'document' });
      if (p.type === 'friction') want.push({ problem: p.id, action: 'warning' });
      if (p.type === 'load' && p.weeks === 0) want.push({ problem: p.id, action: 'talk' });
    }
    return budget(v, 46, want, gapDays(v, -1.2) ? 1 : 0);
  },

  // Talks to everyone, coaches a lot, never writes anyone up, never covers.
  coach(v) {
    const want = [];
    for (const p of v.problems) {
      if (p.suppressed) continue;
      if (p.type === 'late') {
        if (!p.told || p.told === 'attitude') want.push({ problem: p.id, action: 'talk' });
        else if (p.told === 'childcare' && !p.failed.includes('accommodate')) want.push({ problem: p.id, action: 'accommodate' });
        else if (p.told === 'ride' && !p.failed.includes('carpool')) want.push({ problem: p.id, action: 'carpool' });
        else want.push({ problem: p.id, action: 'talk' });
      }
      if (p.type === 'rework') {
        if (p.told === 'fixture') want.push({ problem: p.id, action: 'fixFixture' });
        else want.push({ problem: p.id, action: 'coach' });
      }
      if (p.type === 'load') {
        if (!p.told) want.push({ problem: p.id, action: 'talk' });
        else if (p.told === 'unowned' && !p.failed.includes('redistribute')) want.push({ problem: p.id, action: 'redistribute' });
        else if (p.told === 'crunch') want.push({ problem: p.id, action: 'talk' });
        else want.push({ problem: p.id, action: 'timeOff' });
      }
      if (p.type === 'friction') {
        if (!p.told || p.told === 'personal' || p.told === 'badWeek') want.push({ problem: p.id, action: 'separate' });
        else if (!p.failed.includes('reset')) want.push({ problem: p.id, action: 'reset' });
        else want.push({ problem: p.id, action: 'separate' });
      }
    }
    want.push({ coach: 'joel' }, { coach: 'tyler' }, { coach: 'marisol' });
    return walking(budget(v, 48 - 2, want, 0));
  },

  // Does the routine and lets the floor sort itself out.
  ignorer(v) {
    return budget(v, 45, [], 0);
  },

  // Asks first, then does what the answer needs; when the answer turns out wrong,
  // escalates. Watches passing things instead of acting on them. Covers only to
  // keep paint fed. Coaches the newest person when there is time.
  balanced(v) {
    const want = [];
    for (const p of v.problems) {
      if (p.suppressed) continue;
      if (p.type === 'late') {
        if (!p.told) want.push({ problem: p.id, action: 'talk' });
        else if (p.told === 'childcare' && !p.failedTwice.includes('accommodate')) want.push({ problem: p.id, action: 'accommodate' });
        else if (p.told === 'ride' && !p.failed.includes('carpool') && p.weeks >= 1) want.push({ problem: p.id, action: 'carpool' });
        else if (p.told === 'ride' && p.weeks < 1) { /* give the truck a week */ }
        else if (!p.failedTwice.includes('document')) want.push({ problem: p.id, action: 'document' });
        else want.push({ problem: p.id, action: 'talk' });
      }
      if (p.type === 'rework') {
        if (!p.told && !p.tried.includes('investigate')) want.push({ problem: p.id, action: 'investigate' });
        else if (p.told === 'fixture') want.push({ problem: p.id, action: 'fixFixture' });
        else if (p.told === 'newJig') { /* it settles as they learn the jig */ }
        else want.push({ problem: p.id, action: 'coach' });
      }
      if (p.type === 'load') {
        if (!p.told) want.push({ problem: p.id, action: 'talk' });
        else if (p.told === 'unowned' && !p.failedTwice.includes('redistribute')) want.push({ problem: p.id, action: 'redistribute' });
        else if (p.told === 'crunch') want.push({ problem: p.id, action: 'talk' });
        else want.push({ problem: p.id, action: 'timeOff' });
      }
      if (p.type === 'friction') {
        if (!p.told) want.push({ problem: p.id, action: 'separate' });
        else if (p.told === 'badWeek') { /* let it pass */ }
        else if (p.told === 'roles' && !p.failedTwice.includes('clarify')) want.push({ problem: p.id, action: 'clarify' });
        else if (p.told === 'workload' && !p.failedTwice.includes('reset')) want.push({ problem: p.id, action: 'reset' });
        else want.push({ problem: p.id, action: 'expectations' });
      }
    }
    want.push({ coach: 'joel' });
    return walking(budget(v, 50 - 2, want, Math.min(2, gapDays(v, -0.3))));
  },
};
