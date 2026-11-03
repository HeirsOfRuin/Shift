// What each problem type does: when it appears, what each action does by its
// hidden cause, what it does every week it stays open, and how its decisions
// score for the practice profile. Pure: every draw comes from the kernel's
// streams; every word the player reads is a key into text.data.js.
//
// The first four types are the kill gate's (prototypes/killgate/model.mjs, run
// 7) with the same numbers. The other four are new for the Supervisor track.
//
// The kernel `K` (built in week.js) gives: s, r.{outcomes,people}, person(id),
// active(c), clamp, line(kind, key, vars), queue(weeks, kind, data, because),
// resolve(p, how, opts), score(p, sub, pts, note), week.

import { PROBLEMS } from '../data/problems.data.js';

// The right action usually works, not always; a second try works more often.
const works = (K, p, action, first, again) => K.r.outcomes.next() < ((p.tries[action] || 0) > 1 ? again : first);
const told = (p) => { if (!p.told) p.told = p.story; };

export const TYPES = {
  // ------------------------------------------------------------- lateness
  late: {
    notice(K, p, plan) { return !plan.skip.includes('timecards'); },   // it is on the timecards
    act(K, p, action) {
      const [a] = p.who.map(K.person);
      const v = { p };
      switch (action) {
        case 'talk':
          told(p); a.trust = K.clamp(a.trust + 0.05);
          K.line('told', `late.told.${p.told}`, v);
          if (p.cause === 'attitude' && p.tried.includes('document')) { K.resolve(p, 'late.fixed.talkAfterWriteup', { root: true }); }
          return;
        case 'document':
          p.heldThisWeek = true;
          if (p.cause === 'attitude') {
            a.trust = K.clamp(a.trust - 0.05);
            // Holding the line has a price: some people walk rather than be written up.
            if (!p.walkChecked) { p.walkChecked = true; if (K.r.outcomes.next() < 0.12) K.queue(1, 'quit', { id: a.id }, { key: 'because.writeupWalk', vars: v }); }
            if (works(K, p, action, 0.7, 0.85)) { K.resolve(p, 'late.fixed.writeup', { root: true }); for (const c of K.crew()) c.morale = K.clamp(c.morale + 0.02); }
            else K.line('result', 'late.writeup.notYet', v);
          } else {
            a.morale = K.clamp(a.morale - (p.cause === 'ride' ? 0.08 : 0.15)); a.trust = K.clamp(a.trust - (p.cause === 'ride' ? 0.1 : 0.15));
            if (p.cause === 'childcare') p.severity++;
            K.line('result', `late.writeup.wrong.${p.cause}`, v);
          }
          return;
        case 'accommodate':
          if (p.cause === 'childcare') {
            a.trust = K.clamp(a.trust + 0.05);
            if (works(K, p, action, 0.8, 0.9)) { K.resolve(p, 'late.fixed.startTime', { root: true }); a.morale = K.clamp(a.morale + 0.1); }
            else K.line('result', 'late.startTime.notYet', v);
          } else if (p.cause === 'attitude') {
            p.severity++; p.rewarded = true;
            for (const c of K.crew()) if (c !== a) c.morale = K.clamp(c.morale - 0.03);
            K.line('result', 'late.startTime.rewarded', v);
          } else K.line('result', 'late.startTime.noHelp', v);
          return;
        case 'carpool':
          if (p.cause === 'ride' && works(K, p, action, 0.85, 0.9)) { K.resolve(p, 'late.fixed.carpool', { root: true }); a.trust = K.clamp(a.trust + 0.08); }
          else K.line('result', p.cause === 'ride' ? 'late.carpool.notYet' : 'late.carpool.noHelp', v);
          return;
        case 'remind':
          p.heldThisWeek = true;
          if (p.cause === 'attitude') { p.state = 'quiet'; p.quietUntil = K.week + 2; K.line('result', 'late.remind.quiet', v); }
          else K.line('result', 'late.remind.noHelp', v);
          return;
      }
    },
    week(K, p) {
      const [a] = p.who.map(K.person);
      const v = { p };
      a.lateness += 0.4 * p.severity;
      if (p.cause === 'attitude') {
        // The crew watches what happens to late, not what you said about it.
        p.unchecked = p.heldThisWeek ? 0 : (p.unchecked || 0) + 1;
        p.heldThisWeek = false;
        if (p.unchecked >= 2 && !p.spread) { p.spread = true; K.queue(1 + (K.r.people.next() < 0.5 ? 1 : 0), 'spread', { from: a.id, main: p.main }, { key: 'because.lateTolerated', vars: v }); }
      }
      if (p.cause === 'childcare') {
        a.morale = K.clamp(a.morale - 0.03 * p.severity);
        if (p.neglect >= 3 && !p.quitQueued) { p.quitQueued = true; if (K.r.people.next() < 0.6) K.queue(2 + Math.floor(K.r.people.next() * 3), 'quit', { id: a.id }, { key: 'because.childcareAlone', vars: v }); }
      }
      if (p.cause === 'ride' && K.week - p.since >= 1 && K.r.people.next() < 0.4) { K.resolve(p, 'late.passed.truck', { settled: true }); return; }
      K.line('signal', 'late.week', v);
    },
    score(p, action) {
      if (action === 'talk') return p.told ? [] : [['Basic Empathy', 2, 'Asked before acting']];
      if (action === 'document') return p.told === 'attitude' ? [['Accountability Management', 2, 'Held the standard when it was attitude']] : p.told ? [['Basic Empathy', -1, 'Wrote up a reason, not a choice']] : [['Accountability Management', 0, 'Wrote it up before asking']];
      if (action === 'accommodate') return p.told === 'childcare' ? [['Basic Empathy', 2, 'Fitted the fix to the reason']] : p.told === 'attitude' ? [['Accountability Management', -1, 'Bent the rule for attitude']] : [['Basic Empathy', 1, 'Tried to help']];
      if (action === 'carpool') return p.told === 'ride' ? [['Basic Empathy', 2, 'Fitted the fix to the reason']] : [['Basic Empathy', 0, 'A fix for a reason nobody gave']];
      if (action === 'remind') return [['Accountability Management', 0, 'Mentioned it in passing']];
      return [];
    },
  },

  // ------------------------------------------------------------- rework
  rework: {
    notice() { return true; },                                          // QC writes it up
    act(K, p, action) {
      const [a] = p.who.map(K.person);
      const v = { p };
      switch (action) {
        case 'investigate': told(p); K.line('told', `rework.told.${p.told}`, v); return;
        case 'fixYourself': p.fixedThisWeek = true; K.line('result', 'rework.fixYourself', v); return;
        case 'correct':
          a.trust = K.clamp(a.trust - 0.02);
          if (p.cause === 'rushing' && K.r.outcomes.next() < 0.5) K.resolve(p, 'rework.fixed.correction', { settled: true });
          else K.line('result', 'rework.correct.noHelp', v);
          return;
        case 'coach':
          p.sessions++; a.trust = K.clamp(a.trust + 0.04);
          if (p.cause === 'untrained') {
            a.skill = K.clamp(a.skill + 0.06);
            if (p.sessions >= p.need) K.resolve(p, 'rework.fixed.coaching', { root: true });
            else K.line('result', 'rework.coach.progress', v);
          } else if (p.cause === 'rushing' && K.r.outcomes.next() < 0.6) K.resolve(p, 'rework.fixed.pace', { root: true });
          else if (p.cause === 'fixture' && K.r.outcomes.next() < 0.5) { told(p); K.line('told', 'rework.told.fixture', v); }
          else if (p.cause === 'newJig') { told(p); K.line('told', 'rework.told.newJig', v); }
          else K.line('result', 'rework.coach.noHelp', v);
          return;
        case 'fixFixture':
          if (p.cause === 'fixture' && works(K, p, action, 0.9, 1)) { K.s.dept.fixtureFixed = true; K.resolve(p, 'rework.fixed.fixture', { root: true }); }
          else K.line('result', p.cause === 'fixture' ? 'rework.fixture.notYet' : 'rework.fixture.noHelp', v);
          return;
        case 'document':
          if (p.cause === 'rushing' && K.r.outcomes.next() < 0.5) { a.morale = K.clamp(a.morale - 0.1); K.resolve(p, 'rework.fixed.warning', { settled: true }); }
          else { a.morale = K.clamp(a.morale - 0.12); a.trust = K.clamp(a.trust - 0.1); K.line('result', 'rework.writeup.wrong', v); }
          return;
      }
    },
    week(K, p) {
      const [a] = p.who.map(K.person);
      a.defectAdd = p.cause === 'fixture' ? 0.18 : p.cause === 'newJig' ? 0.1 : 0.14;
      if (p.cause === 'fixture') for (const c of K.crew()) if (c.station === 'weld' && c !== a && K.active(c)) c.defectAdd = Math.max(c.defectAdd, 0.05);
      if (p.fixedThisWeek) { a.defectAdd = 0; p.fixedThisWeek = false; }
      if (p.cause === 'untrained') a.skill = K.clamp(a.skill + 0.01);
      if (p.neglect >= 2 && p.cause !== 'newJig') a.morale = K.clamp(a.morale - 0.02);
      if (p.cause === 'newJig' && K.week - p.since >= 2 && K.r.people.next() < 0.5) { K.resolve(p, 'rework.passed.jig', { settled: true }); return; }
      K.line('signal', 'rework.week', { p });
    },
    score(p, action) {
      if (action === 'investigate') return p.told ? [] : [['Early Coaching & Guidance', 2, 'Found out why before fixing it']];
      if (action === 'coach') return [['Early Coaching & Guidance', p.told === 'untrained' || p.told === 'rushing' || !p.told ? 2 : 1, 'Coached at the booth']];
      if (action === 'fixYourself') return [['Early Coaching & Guidance', p.firefought++ ? -1 : 0, 'Fixed the welds yourself']];
      if (action === 'fixFixture') return p.told === 'fixture' ? [['Openness to Improvement', 2, 'Fixed the fixture, not the welder']] : [['Openness to Improvement', 0, 'Rebuilt a fixture nobody said was bad']];
      if (action === 'document') return [['Accountability Management', p.told === 'rushing' ? 1 : -1, 'Wrote up quality']];
      if (action === 'correct') return [['Early Coaching & Guidance', 0, 'Told him to tighten up']];
      return [];
    },
  },

  // ------------------------------------------------------------- carrying too much
  load: {
    notice(K, p) { const a = K.person(p.who[0]); return a.stress >= 3; },
    act(K, p, action) {
      const [a] = p.who.map(K.person);
      const v = { p };
      switch (action) {
        case 'talk': told(p); a.trust = K.clamp(a.trust + 0.05); a.stress = Math.max(0, a.stress - 0.5); K.line('told', `load.told.${p.told}`, v); return;
        case 'redistribute':
          if (p.cause === 'unowned') {
            a.stress = Math.max(0, a.stress - 1);
            if (works(K, p, action, 0.7, 0.85)) { K.resolve(p, 'load.fixed.handedOut', { root: true }); a.morale = K.clamp(a.morale + 0.1); }
            else K.line('result', 'load.handedOut.notYet', v);
          } else if (p.cause === 'crunch') { a.stress = Math.max(0, a.stress - 1); K.line('result', 'load.handedOut.crunch', v); }
          else { a.stress += 0.5; K.line('result', 'load.handedOut.wrong', v); }
          return;
        case 'timeOff':
          a.carryOut = 2;
          if (p.cause === 'personal' && works(K, p, action, 0.8, 0.9)) { K.resolve(p, 'load.fixed.timeOff', { root: true }); a.morale = K.clamp(a.morale + 0.12); }
          else K.line('result', p.cause === 'personal' ? 'load.timeOff.notYet' : 'load.timeOff.wrong', v);
          return;
        case 'carry': a.stress = Math.max(0, a.stress - 1); p.carriedThisWeek = true; K.line('result', 'load.carry', v); return;
      }
    },
    week(K, p) {
      const [a] = p.who.map(K.person);
      const v = { p };
      if (p.carriedThisWeek) { p.carriedThisWeek = false; return; }
      a.stress += p.cause === 'crunch' ? 0.7 : 1;
      a.morale = K.clamp(a.morale - 0.04);
      for (const c of K.crew()) if (c !== a) c.morale = K.clamp(c.morale - 0.008);
      if (p.cause === 'crunch' && K.week - p.since >= 2 && K.r.people.next() < 0.5) { K.resolve(p, 'load.passed.crunch', { settled: true }); return; }
      if (a.stress >= 5 && !p.blown) {
        p.blown = true;
        if (K.r.people.next() < 0.4) K.queue(1, 'quit', { id: a.id }, { key: 'because.carryingAlone', vars: v });
        else K.queue(1, 'leave', { id: a.id, weeks: 2 }, { key: 'because.carryingAlone', vars: v });
      }
      K.line('signal', `load.week.${a.stress >= 3 ? 'showing' : 'quiet'}`, v);
    },
    score(p, action) {
      if (action === 'talk') return p.told ? [['Basic Empathy', 1, 'Checked in again']] : [['Basic Empathy', 2, 'Asked before acting']];
      if (action === 'redistribute') return p.told === 'unowned' ? [['Culture & Organizational Influence', 2, 'Gave the work an owner']] : [['Culture & Organizational Influence', 0, 'Moved work around without knowing why']];
      if (action === 'timeOff') return p.told === 'personal' ? [['Basic Empathy', 2, 'Fitted the fix to the reason']] : [['Basic Empathy', 0, 'Time off for a reason nobody gave']];
      if (action === 'carry') return [['Culture & Organizational Influence', -1, 'Took his load yourself']];
      return [];
    },
  },

  // ------------------------------------------------------------- friction
  friction: {
    notice(K, p) { return p.severity >= 2; },
    act(K, p, action) {
      const [a, b] = p.who.map(K.person);
      const v = { p };
      switch (action) {
        case 'separate': told(p); a.trust = K.clamp(a.trust + 0.03); b.trust = K.clamp(b.trust + 0.03); K.line('told', `friction.told.${p.told}`, v); return;
        case 'reset': {
          const fits = p.cause === 'workload' || p.cause === 'roles' || p.cause === 'badWeek';
          if (fits && (p.told || K.r.outcomes.next() < 0.5) && works(K, p, action, 0.75, 0.85)) K.resolve(p, 'friction.fixed.reset', { root: true });
          else if (fits) K.line('result', 'friction.reset.notYet', v);
          else { a.morale = K.clamp(a.morale - 0.05); b.morale = K.clamp(b.morale - 0.05); p.severity++; K.line('result', 'friction.reset.wrong', v); }
          return;
        }
        case 'expectations':
          if (p.cause === 'personal' ? works(K, p, action, 0.65, 0.8) : K.r.outcomes.next() < 0.25) K.resolve(p, 'friction.fixed.expectations', { root: p.cause === 'personal', settled: true });
          else K.line('result', 'friction.expectations.noHelp', v);
          return;
        case 'clarify':
          if ((p.cause === 'roles' && works(K, p, action, 0.8, 0.9)) || (p.cause === 'workload' && K.r.outcomes.next() < 0.5)) K.resolve(p, 'friction.fixed.clarify', { root: true });
          else K.line('result', 'friction.clarify.noHelp', v);
          return;
        case 'warning':
          p.state = 'quiet'; p.quietUntil = K.week + 2; a.trust = K.clamp(a.trust - 0.05); b.trust = K.clamp(b.trust - 0.05);
          if (!p.walkChecked) { p.walkChecked = true; if (K.r.outcomes.next() < 0.08) K.queue(1, 'quit', { id: (K.r.outcomes.next() < 0.5 ? a : b).id }, { key: 'because.warningWalk', vars: v }); }
          K.line('result', 'friction.warning', v);
          return;
      }
    },
    week(K, p) {
      const [a, b] = p.who.map(K.person);
      const v = { p };
      a.morale = K.clamp(a.morale - 0.03 * p.severity); b.morale = K.clamp(b.morale - 0.03 * p.severity);
      if (p.cause === 'badWeek' && K.week - p.since >= 1 && p.severity === 1 && K.r.people.next() < 0.5) { K.resolve(p, 'friction.passed.week', { settled: true }); return; }
      if ((p.neglect >= 4 || p.severity >= 3) && !p.blown) {
        p.blown = true;
        const who = K.r.people.next() < 0.5 ? a : b;
        if (K.r.people.next() < 0.5) K.queue(1, 'quit', { id: who.id }, { key: 'because.frictionLeft', vars: v });
        else K.queue(0, 'blowup', { ids: [a.id, b.id] }, { key: 'because.frictionLeft', vars: v });
      }
      K.line('signal', `friction.week.${p.severity >= 2 ? 'loud' : 'quiet'}`, v);
    },
    score(p, action) {
      if (action === 'separate') return p.told ? [['Recurring Conflict Resolution', 1, 'Listened again']] : [['Recurring Conflict Resolution', 2, 'Heard both sides first']];
      if (action === 'reset') return p.told === 'workload' ? [['Recurring Conflict Resolution', 2, 'Reset the work, not the people']] : p.told ? [['Recurring Conflict Resolution', 0, 'Reset the work when it was not the work']] : [['Recurring Conflict Resolution', 0, 'Reset before hearing them out']];
      if (action === 'clarify') return p.told === 'roles' ? [['Recurring Conflict Resolution', 2, 'Gave the gap an owner']] : [['Recurring Conflict Resolution', 0, 'Wrote roles down for a different problem']];
      if (action === 'expectations') return p.told === 'personal' ? [['Respect & Professionalism', 2, 'Set out how people treat each other']] : [['Respect & Professionalism', 0, 'A talk about conduct for a problem with the work']];
      if (action === 'warning') return [['Recurring Conflict Resolution', -1, 'Told them to knock it off']];
      return [];
    },
  },

  // ------------------------------------------------------------- the fume extractor
  hazard: {
    notice() { return true; },
    act(K, p, action) {
      const v = { p };
      switch (action) {
        case 'look':
          told(p); K.line('told', `hazard.told.${p.told}`, v);
          if (p.cause === 'filter' && K.r.outcomes.next() < 0.8) K.resolve(p, 'hazard.fixed.filterNow', { root: true });
          if (p.cause === 'noisy') K.resolve(p, 'hazard.fixed.noisy', { root: true, settled: true });
          return;
        case 'workOrder': if (!p.order) { p.order = { due: K.week + 1 }; K.line('result', 'hazard.order.placed', v); } return;
        case 'followUp':
          if (!p.order) p.order = { due: K.week + 1 };
          p.followed = true; K.line('result', 'hazard.order.followed', v); return;
        case 'shutBooth': p.shut = true; K.line('result', 'hazard.shut', v); return;
        case 'moveWelder': p.moved = true; K.line('result', 'hazard.moved', v); return;
      }
    },
    week(K, p) {
      const v = { p };
      const [a] = p.who.map(K.person);
      if (p.order && K.week >= p.order.due) {
        const odds = { filter: 0.9, motor: p.followed ? 0.9 : 0.45, duct: p.shut ? 0.85 : p.followed ? 0.5 : 0.25, noisy: 1 }[p.cause];
        if (K.r.outcomes.next() < odds) { K.resolve(p, `hazard.fixed.order.${p.cause}`, { root: true }); return; }
        p.order.due = K.week + 1; K.line('result', 'hazard.order.waiting', v);
      }
      if (p.cause === 'noisy') {
        if (K.week - p.since >= 3) { K.resolve(p, 'hazard.passed.noisy', { settled: true }); return; }
        return;
      }
      if (p.shut) { a.daysOut += 2; return; }        // helping out elsewhere for part of the week
      if (p.moved) { a.cramped = true; return; }
      p.exposure = (p.exposure || 0) + (p.cause === 'duct' ? 1.5 : 1);
      a.morale = K.clamp(a.morale - 0.02);
      if (p.exposure >= 3.5 && !p.hurt) {
        p.hurt = true;
        K.queue(0, 'fumes', { id: a.id }, { key: 'because.hazardLeft', vars: v });
      }
      K.line('signal', p.exposure >= 2 ? 'hazard.week.bad' : 'hazard.week.mild', v);
    },
    score(p, action) {
      if (action === 'look') return [['Basic Empathy', 2, 'Went and looked when someone raised safety']];
      if (action === 'workOrder') return [['Accountability Management', 1, 'Put it in the system']];
      if (action === 'followUp') return [['Accountability Management', 2, 'Followed it through']];
      if (action === 'shutBooth' || action === 'moveWelder') return [['Impulse Control', 1, 'Made it safe before it was fixed']];
      return [];
    },
  },

  // ------------------------------------------------------------- the same fire
  recurring: {
    notice() { return true; },
    act(K, p, action) {
      const v = { p };
      const kev = K.person('kev');
      switch (action) {
        case 'investigate': told(p); K.line('told', `recurring.told.${p.told}`, v); return;
        case 'fixYourself': p.fixedThisWeek = true; K.line('result', 'recurring.fixYourself', v); return;
        case 'leadFix': p.fixedThisWeek = true; if (K.active(kev)) kev.daysOut += 0.5; K.line('result', 'recurring.leadFix', v); return;
        case 'workOrder':
          if (p.cause === 'pin') { if (!p.order) p.order = { due: K.week + 1 }; K.line('result', 'recurring.order.placed', v); }
          else { p.ruledOut.push('pin'); K.line('result', 'recurring.order.notPins', v); }
          return;
        case 'standardWork':
          if (p.cause === 'setup' && works(K, p, action, 0.8, 0.9)) K.resolve(p, 'recurring.fixed.setup', { root: true });
          else { if (p.cause !== 'setup') p.ruledOut.push('setup'); K.line('result', p.cause === 'setup' ? 'recurring.setup.notYet' : 'recurring.setup.notIt', v); }
          return;
        case 'raiseFab':
          if (p.cause === 'steel' && works(K, p, action, 0.7, 0.85)) { K.s.dept.peerTrust = K.clamp(K.s.dept.peerTrust + 0.05); K.resolve(p, 'recurring.fixed.steel', { root: true }); }
          else { if (p.cause !== 'steel') { p.ruledOut.push('steel'); K.s.dept.peerTrust = K.clamp(K.s.dept.peerTrust - 0.03); } K.line('result', p.cause === 'steel' ? 'recurring.fab.notYet' : 'recurring.fab.notIt', v); }
          return;
        case 'escalate':
          if (p.cause === 'steel') {
            K.s.dept.peerTrust = K.clamp(K.s.dept.peerTrust - 0.15);
            if (K.r.outcomes.next() < 0.5) K.resolve(p, 'recurring.fixed.steelUp', { root: true }); else K.line('result', 'recurring.up.slow', v);
          } else { K.s.dept.managerTrust = K.clamp(K.s.dept.managerTrust - 0.03); K.line('result', 'recurring.up.notIt', v); }
          return;
      }
    },
    week(K, p) {
      const v = { p };
      const [a] = p.who.map(K.person);
      if (p.order && K.week >= p.order.due) {
        if (K.r.outcomes.next() < 0.85) { K.resolve(p, 'recurring.fixed.pins', { root: true }); return; }
        p.order.due = K.week + 1; K.line('result', 'recurring.order.waiting', v);
      }
      if (p.cause === 'batch' && K.week - p.since >= 2 && K.r.people.next() < 0.5) { K.resolve(p, 'recurring.passed.batch', { settled: true }); return; }
      a.defectAdd = p.fixedThisWeek ? 0 : 0.15 + 0.03 * (p.severity - 1);
      p.fixedThisWeek = false;
      p.extraInterrupts = 2;
      if ((K.week - p.since) % 3 === 2) p.severity++;
      K.line('signal', 'recurring.week', v);
    },
    score(p, action) {
      if (action === 'investigate') return p.told ? [] : [['Openness to Improvement', 2, 'Went after the cause, not the fire']];
      if (action === 'fixYourself' || action === 'leadFix') return [['Impulse Control', p.firefought++ >= 1 ? -1 : 0, 'Put the fire out again']];
      if (action === 'workOrder') return [['Openness to Improvement', p.told === 'pin' ? 2 : 0, 'Work order on the pins']];
      if (action === 'standardWork') return [['Early Coaching & Guidance', p.told === 'setup' ? 2 : 0, 'Wrote the setup down with the crew']];
      if (action === 'raiseFab') return [['Cross-Functional Awareness', p.told === 'steel' ? 2 : 0, 'Took it across to fabrication']];
      if (action === 'escalate') return [['Cross-Functional Awareness', -1, 'Went over a peer instead of to him']];
      return [];
    },
  },

  // ------------------------------------------------------------- a decision with nobody upstairs
  escalation: {
    notice() { return true; },
    act(K, p, action) {
      const v = { p };
      switch (action) {
        case 'check': told(p); K.line('told', `escalation.told.${p.told}`, v); return;
        case 'decide':
          if (p.cause === 'yours' && works(K, p, action, 0.9, 1)) { K.resolve(p, 'escalation.fixed.decided', { root: true }); return; }
          if (p.cause === 'engineering') { K.s.week_.defects += 1; K.s.dept.managerTrust = K.clamp(K.s.dept.managerTrust - 0.08); K.line('result', 'escalation.decide.sketch', v); p.guessed = true; return; }
          if (p.cause === 'signoff') { p.overstepped = true; K.queue(Math.max(1, (K.s.setup.managerBack || K.week + 2) - K.week), 'overstep', {}, { key: 'because.signedWhatWasntYours', vars: v }); K.resolve(p, 'escalation.decide.signed', { settled: false }); return; }
          if (p.cause === 'dropped') { K.s.week_.defects += 0.5; K.line('result', 'escalation.decide.wasted', v); return; }
          K.line('result', 'escalation.decide.notYet', v);
          return;
        case 'askRuss': if (!p.russDue) { p.russDue = K.week + 1 + (K.r.outcomes.next() < 0.5 ? 1 : 0); K.line('result', 'escalation.russ.asked', v); } return;
        case 'engineering':
          if (p.cause === 'engineering') { p.engDue = K.week + 1; K.line('result', 'escalation.eng.taken', v); }
          else { told(p); if (p.cause !== 'dropped') p.told = p.cause; K.line('result', 'escalation.eng.bounced', v); }
          return;
        case 'around':
          K.s.dept.managerTrust = K.clamp(K.s.dept.managerTrust - 0.08);
          p.aroundDue = K.week + 1; K.line('result', 'escalation.around.asked', v);
          return;
      }
    },
    week(K, p) {
      const v = { p };
      if (p.russDue && K.week >= p.russDue) {
        if (p.cause === 'signoff') { K.resolve(p, 'escalation.fixed.russ', { root: true }); return; }
        p.russDue = null; if (p.cause !== 'dropped') p.told = p.cause; K.line('told', `escalation.russ.redirect.${p.cause}`, v);
      }
      if (p.engDue && K.week >= p.engDue) { K.resolve(p, 'escalation.fixed.eng', { root: true }); return; }
      if (p.aroundDue && K.week >= p.aroundDue) { K.resolve(p, 'escalation.fixed.around', { settled: true }); return; }
      if (p.cause === 'dropped' && K.week - p.since >= 2 && K.r.people.next() < 0.5) { K.resolve(p, 'escalation.passed.dropped', { settled: true }); return; }
      if (K.s.setup.managerBack && K.week >= K.s.setup.managerBack) { K.resolve(p, 'escalation.danaBack', { settled: false }); return; }
      p.extraInterrupts = 2;
      if (K.week - p.since >= 2) K.s.dept.managerTrust = K.clamp(K.s.dept.managerTrust - 0.03);
      K.line('signal', 'escalation.week', v);
    },
    score(p, action) {
      if (action === 'check') return p.told ? [] : [['Emotional Awareness', 2, 'Found out whose call it was first']];
      if (action === 'decide') return p.told === 'yours' ? [['Accountability Management', 2, 'Made the call that was yours']] : p.told ? [['Accountability Management', -1, 'Made a call that was not yours']] : [['Emotional Awareness', -1, 'Decided before knowing whose call it was']];
      if (action === 'askRuss') return [['Cross-Functional Awareness', p.told === 'signoff' ? 2 : 0, 'Used the chain while Dana was away']];
      if (action === 'engineering') return [['Cross-Functional Awareness', p.told === 'engineering' ? 2 : 0, 'Sent it to the people who own the drawing']];
      if (action === 'around') return [['Respect & Professionalism', -1, 'Went around the chain']];
      return [];
    },
  },

  // ------------------------------------------------------------- two standards
  standards: {
    notice() { return true; },
    act(K, p, action) {
      const v = { p };
      const d = K.s.dept;
      switch (action) {
        case 'talkPeer':
          d.peerTrust = K.clamp(d.peerTrust + 0.05);
          if (p.told === 'unaware' && p.cause === 'unaware' && works(K, p, action, 0.6, 0.75)) { K.resolve(p, 'standards.fixed.talk', { root: true }); return; }
          told(p); K.line('told', `standards.told.${p.told}`, v); return;
        case 'writeStandard': {
          const odds = { spec: 0.85, unaware: 0.6, pressure: 0.35, newHire: 0.9 }[p.cause];
          if (K.r.outcomes.next() < odds) K.resolve(p, 'standards.fixed.written', { root: true });
          else K.line('result', 'standards.written.notYet', v);
          return;
        }
        case 'handoff':
          if (p.cause === 'pressure' && works(K, p, action, 0.8, 0.9)) K.resolve(p, 'standards.fixed.handoff', { root: true });
          else K.line('result', 'standards.handoff.noHelp', v);
          return;
        case 'showHer':
          if ((p.cause === 'unaware' && works(K, p, action, 0.85, 0.9)) || (p.cause === 'spec' && K.r.outcomes.next() < 0.3)) K.resolve(p, 'standards.fixed.shown', { root: true });
          else K.line('result', 'standards.shown.noHelp', v);
          return;
        case 'complain':
          if (!p.tried.includes('talkPeer')) { d.peerTrust = K.clamp(d.peerTrust - 0.2); p.severity++; }
          else d.peerTrust = K.clamp(d.peerTrust - 0.05);
          if (p.cause === 'pressure' && K.r.outcomes.next() < 0.45) K.resolve(p, 'standards.fixed.dana', { root: true });
          else K.line('result', p.tried.includes('talkPeer') ? 'standards.dana.slow' : 'standards.dana.defensive', v);
          return;
        case 'matchThem':
          d.standard = K.clamp(d.standard - 0.1); d.escapeAdd = (d.escapeAdd || 0) + 0.15;
          p.state = 'quiet'; p.quietUntil = K.week + 2; K.line('result', 'standards.matched', v);
          return;
      }
    },
    week(K, p) {
      const v = { p };
      if (p.cause === 'newHire' && K.week - p.since >= 2 && K.r.people.next() < 0.5) { K.resolve(p, 'standards.passed.newHire', { settled: true }); return; }
      K.s.dept.standard = K.clamp(K.s.dept.standard - 0.03);
      K.s.week_.defects += 0.3 * p.severity;
      p.extraInterrupts = 2;
      if (p.neglect >= 3 && !p.blown) { p.blown = true; K.queue(0, 'kickbackWar', {}, { key: 'because.twoStandards', vars: v }); }
      K.line('signal', 'standards.week', v);
    },
    score(p, action) {
      if (action === 'talkPeer') return [['Cross-Functional Awareness', 2, 'Went across before going up']];
      if (action === 'complain') return p.tried.includes('talkPeer') ? [['Cross-Functional Awareness', 0, 'Took it up after trying across']] : [['Peer Conflict Prevention', -1, 'Went up before going across']];
      if (action === 'writeStandard') return [['Cross-Functional Awareness', p.told === 'spec' ? 2 : 1, 'Wrote one standard for both sides']];
      if (action === 'handoff') return [['Cross-Functional Awareness', p.told === 'pressure' ? 2 : 0, 'Fixed the handoff']];
      if (action === 'showHer') return [['Peer Conflict Prevention', p.told === 'unaware' ? 2 : 0, 'Showed her the tickets']];
      if (action === 'matchThem') return [['Respect & Professionalism', -1, 'Dropped your standard to match']];
      return [];
    },
  },
};

export function actionsFor(type) { return PROBLEMS[type].actions; }
