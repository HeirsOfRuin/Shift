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
import { CONFIG as C } from '../data/config.data.js';

// The right action usually works, not always; a second try works more often.
const works = (K, p, action, first, again) => K.r.outcomes.next() < ((p.tries[action] || 0) > 1 ? again : first) * (K.sharp ?? 1);
const told = (p) => { if (!p.told) p.told = p.story; };
// The senior hand beside the player: Kev in the supervisor's seat, Lyle in the lead's.
const senior = (K) => K.person(K.s.seat === 'lead' ? 'lyle' : 'kev');

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
      if (action === 'talk') return p.told ? [] : [['D2', 2, 'Asked before acting']];
      if (action === 'document') return p.told === 'attitude' ? [['D2', 2, 'Held the standard when it was attitude']] : p.told ? [['D2', -1, 'Wrote up a reason, not a choice']] : [['D2', 0, 'Wrote it up before asking']];
      if (action === 'accommodate') return p.told === 'childcare' ? [['D2', 2, 'Fitted the fix to the reason']] : p.told === 'attitude' ? [['D2', -1, 'Bent the rule for attitude']] : [['D2', 1, 'Tried to help']];
      if (action === 'carpool') return p.told === 'ride' ? [['D2', 2, 'Fitted the fix to the reason']] : [['D2', 0, 'A fix for a reason nobody gave']];
      if (action === 'remind') return [['D2', 0, 'Mentioned it in passing']];
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
      if (action === 'investigate') return p.told ? [] : [['D1', 2, 'Found out why before fixing it']];
      if (action === 'coach') return [['D1', p.told === 'untrained' || p.told === 'rushing' || !p.told ? 2 : 1, 'Coached at the booth']];
      if (action === 'fixYourself') return [['D1', p.firefought++ ? -1 : 0, 'Fixed the welds yourself']];
      if (action === 'fixFixture') return p.told === 'fixture' ? [['B3', 2, 'Fixed the fixture, not the welder']] : [['B3', 0, 'Rebuilt a fixture nobody said was bad']];
      if (action === 'document') return [['D2', p.told === 'rushing' ? 1 : -1, 'Wrote up quality']];
      if (action === 'correct') return [['D1', 0, 'Told him to tighten up']];
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
      if (action === 'talk') return p.told ? [['D1', 1, 'Checked in again']] : [['D1', 2, 'Asked before acting']];
      if (action === 'redistribute') return p.told === 'unowned' ? [['A4', 2, 'Gave the work an owner']] : [['A4', 0, 'Moved work around without knowing why']];
      if (action === 'timeOff') return p.told === 'personal' ? [['D1', 2, 'Fitted the fix to the reason']] : [['D1', 0, 'Time off for a reason nobody gave']];
      if (action === 'carry') return [['A4', -1, 'Took his load yourself']];
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
      if (action === 'separate') return p.told ? [['D3', 1, 'Listened again']] : [['D3', 2, 'Heard both sides first']];
      if (action === 'reset') return p.told === 'workload' ? [['D3', 2, 'Reset the work, not the people']] : p.told ? [['D3', 0, 'Reset the work when it was not the work']] : [['D3', 0, 'Reset before hearing them out']];
      if (action === 'clarify') return p.told === 'roles' ? [['D3', 2, 'Gave the gap an owner']] : [['D3', 0, 'Wrote roles down for a different problem']];
      if (action === 'expectations') return p.told === 'personal' ? [['D3', 2, 'Set out how people treat each other']] : [['D3', 0, 'A talk about conduct for a problem with the work']];
      if (action === 'warning') return [['D3', -1, 'Told them to knock it off']];
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
      if (action === 'look') return [['C2', 2, 'Went and looked when someone raised safety']];
      if (action === 'workOrder') return [['C2', 1, 'Put it in the system']];
      if (action === 'followUp') return [['C2', 2, 'Followed it through']];
      if (action === 'shutBooth' || action === 'moveWelder') return [['C2', 1, 'Made it safe before it was fixed']];
      return [];
    },
  },

  // ------------------------------------------------------------- the same fire
  recurring: {
    notice() { return true; },
    act(K, p, action) {
      const v = { p };
      const kev = senior(K);
      switch (action) {
        case 'investigate': told(p); K.line('told', `recurring.told.${p.told}`, v); return;
        case 'fixYourself': p.fixedThisWeek = true; K.line('result', 'recurring.fixYourself', v); return;
        case 'leadFix': p.fixedThisWeek = true; if (kev && K.active(kev)) kev.daysOut += 0.5; K.line('result', 'recurring.leadFix', v); return;
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
      if (action === 'investigate') return p.told ? [] : [['B3', 2, 'Went after the cause, not the fire']];
      if (action === 'fixYourself' || action === 'leadFix') return [['B3', p.firefought++ >= 1 ? -1 : 0, 'Put the fire out again']];
      if (action === 'workOrder') return [['B3', p.told === 'pin' ? 2 : 0, 'Work order on the pins']];
      if (action === 'standardWork') return [['B3', p.told === 'setup' ? 2 : 0, 'Wrote the setup down with the crew']];
      if (action === 'raiseFab') return [['B3', p.told === 'steel' ? 2 : 0, 'Took the cause across to fabrication']];
      if (action === 'escalate') return [['E2', -1, 'Went over a peer instead of to him']];
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
      if (action === 'check') return p.told ? [] : [['E1', 2, 'Found out whose call it was first']];
      if (action === 'decide') return p.told === 'yours' ? [['E1', 2, 'Made the call that was yours']] : p.told ? [['E1', -1, 'Made a call that was not yours']] : [['E1', -1, 'Decided before knowing whose call it was']];
      if (action === 'askRuss') return [['E1', p.told === 'signoff' ? 2 : 0, 'Used the chain while Dana was away']];
      if (action === 'engineering') return [['E1', p.told === 'engineering' ? 2 : 0, 'Sent it to the people who own the drawing']];
      if (action === 'around') return [['E1', -1, 'Went around the chain']];
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
      if (action === 'talkPeer') return [['E2', 2, 'Went across before going up']];
      if (action === 'complain') return p.tried.includes('talkPeer') ? [['E2', 0, 'Took it up after trying across']] : [['E2', -1, 'Went up before going across']];
      if (action === 'writeStandard') return [['E2', p.told === 'spec' ? 2 : 1, 'Wrote one standard for both sides']];
      if (action === 'handoff') return [['E2', p.told === 'pressure' ? 2 : 0, 'Fixed the handoff']];
      if (action === 'showHer') return [['E2', p.told === 'unaware' ? 2 : 0, 'Showed her the tickets']];
      if (action === 'matchThem') return [['E2', -1, 'Dropped your standard to match']];
      return [];
    },
  },

  // ------------------------------------------------------------- where it waits (beta 4)
  // One station is the constraint and the player cannot see which from the
  // Friday number. Improving any other station raises a number that does not
  // matter. When the constraint is fixed it moves to the next station; the
  // player who looked once has to look again.
  constraint: {
    notice() { return true; },
    act(K, p, action) {
      const v = { p };
      const d = K.s.dept;
      const station = { improveFit: 'fit', improveWeld: 'weld', improveFinish: 'finish' }[action];
      switch (action) {
        case 'look': told(p); K.line('told', `constraint.told.${p.told}`, v); return;
        case 'askCrew': K.line('result', 'constraint.askCrew', v); return;
        case 'improveFit': case 'improveWeld': case 'improveFinish':
          d.improved[station] = Math.min(0.2, (d.improved[station] || 0) + 0.1);
          if (p.cause === station) {
            if (works(K, p, action, 0.85, 0.95)) {
              K.resolve(p, `constraint.fixed.${station}`, { root: true });
              // the constraint moves: the next station is now the one that waits
              if (!p.moved && p.source !== 'moved') { p.moved = true; K.queue(1, 'constraintMoves', { from: station }, { key: 'because.constraintMoved', vars: { from: station } }); }
            } else K.line('result', `constraint.notYet.${station}`, v);
          } else {
            if (!p.ruledOut.includes(station)) p.ruledOut.push(station);
            K.line('result', `constraint.wrong.${station}`, v);
          }
          return;
      }
    },
    week(K, p) {
      const v = { p };
      const mul = K.s.week_.stationMul;
      if (p.cause === 'mix') {
        if (K.week - p.since >= 3) { K.resolve(p, 'constraint.passed.mix', { settled: true }); return; }
        mul.weld *= 0.9;
      } else {
        mul[p.cause] *= p.source === 'moved' ? 0.86 : { fit: 0.72, weld: 0.78, finish: 0.72 }[p.cause];
      }
      p.extraInterrupts = 1;
      K.line('signal', 'constraint.week', v);
    },
    score(p, action) {
      const station = { improveFit: 'fit', improveWeld: 'weld', improveFinish: 'finish' }[action];
      if (action === 'look') return p.told ? [] : p.source === 'moved' ? [['B1', 2, 'Looked again when the constraint moved']] : [];
      if (action === 'askCrew') return [['B1', 0, 'Asked the crew, who all said body weld']];
      if (station) {
        if (p.told === station) return [['B1', 2, 'Spent improvement hours on the constraint']];
        if (p.told) return [['B1', -1, 'Improved a station that was not the constraint']];
        return [['B1', 0, 'Improved a station on a hunch']];
      }
      return [];
    },
  },

  // ------------------------------------------------------------- the huddle (beta 4)
  huddle: {
    notice() { return true; },
    act(K, p, action) {
      const v = { p };
      const brent = K.person('brent');
      switch (action) {
        case 'talk': told(p); if (brent) brent.trust = K.clamp(brent.trust + 0.04); K.line('told', `huddle.told.${p.told}`, v); return;
        case 'parkingLot':
          if (p.cause === 'habit' && works(K, p, action, 0.8, 0.9)) K.resolve(p, 'huddle.fixed.parkingLot', { root: true });
          else if (p.cause === 'newRoute') K.resolve(p, 'huddle.fixed.parkingLotRoute', { settled: true });
          else K.line('result', p.cause === 'habit' ? 'huddle.parkingLot.notYet' : 'huddle.parkingLot.noHelp', v);
          return;
        case 'fixParts':
          if (p.cause === 'parts' && works(K, p, action, 0.75, 0.9)) { K.s.dept.peerTrust = K.clamp(K.s.dept.peerTrust + 0.04); K.resolve(p, 'huddle.fixed.parts', { root: true }); }
          else { if (p.cause !== 'parts') { p.ruledOut.push('parts'); K.s.dept.peerTrust = K.clamp(K.s.dept.peerTrust - 0.03); } K.line('result', p.cause === 'parts' ? 'huddle.parts.notYet' : 'huddle.parts.noHelp', v); }
          return;
        case 'giveFloor':
          if (p.cause === 'unheard' && works(K, p, action, 0.8, 0.9)) { if (brent) brent.morale = K.clamp(brent.morale + 0.08); K.resolve(p, 'huddle.fixed.giveFloor', { root: true }); }
          else if (p.cause === 'habit') { p.severity++; K.line('result', 'huddle.giveFloor.worse', v); }
          else K.line('result', 'huddle.giveFloor.noHelp', v);
          return;
        case 'shutDown':
          p.state = 'quiet'; p.quietUntil = K.week + 2;
          if (brent) { brent.trust = K.clamp(brent.trust - 0.08); brent.morale = K.clamp(brent.morale - (p.cause === 'unheard' ? 0.12 : 0.05)); }
          K.line('result', 'huddle.shutDown', v);
          return;
        case 'letRun': p.ranThisWeek = true; K.line('result', 'huddle.letRun', v); return;
      }
    },
    week(K, p) {
      const v = { p };
      const brent = K.person('brent');
      if (p.cause === 'newRoute' && K.week - p.since >= 2 && K.r.people.next() < 0.6) { K.resolve(p, 'huddle.passed.route', { settled: true }); return; }
      // a huddle that runs long and sideways costs everyone ten minutes a day
      K.s.week_.capacityMul *= p.ranThisWeek ? 0.95 : 0.97;
      p.ranThisWeek = false;
      p.extraInterrupts = 2;
      for (const c of K.crew()) if (K.active(c) && c.id !== 'brent') c.morale = K.clamp(c.morale - 0.012);
      if (p.cause === 'unheard' && brent) {
        brent.morale = K.clamp(brent.morale - 0.03 * p.severity);
        if (p.neglect >= 3 && !p.quitQueued) { p.quitQueued = true; if (K.r.people.next() < 0.5) K.queue(2 + Math.floor(K.r.people.next() * 3), 'quit', { id: 'brent' }, { key: 'because.unheard', vars: v }); }
      }
      if (p.cause === 'parts') K.s.week_.capacityMul *= 0.97;
      K.line('signal', `huddle.week.${p.severity >= 2 ? 'worse' : 'long'}`, v);
    },
    score(p, action) {
      if (action === 'talk') return [];
      if (action === 'parkingLot') return p.told === 'habit' ? [['F1', 2, 'Parked it and held the five minutes']] : [['F1', 0, 'Put up a parking lot for a problem that was not a habit']];
      if (action === 'fixParts') return p.told === 'parts' ? [['F1', 2, 'Took the real problem where it belonged']] : [['F1', 0, 'Chased a parts problem nobody had confirmed']];
      if (action === 'giveFloor') return p.told === 'unheard' ? [['F1', 2, 'Gave him the floor, first']] : [['F1', 0, 'Gave the floor to someone who already had it']];
      if (action === 'shutDown') return [['F1', -1, 'Shut him down in front of the crew']];
      if (action === 'letRun') return [['F1', -1, 'Let the huddle run long']];
      return [];
    },
  },

  // ------------------------------------------------------------- the new hand (beta 4)
  newhand: {
    notice() { return true; },
    act(K, p, action) {
      const [a] = p.who.map(K.person);
      const v = { p };
      const kev = senior(K);
      switch (action) {
        case 'watch': told(p); a.trust = K.clamp(a.trust + 0.05); K.line('told', `newhand.told.${p.told}`, v); return;
        case 'teach':
          p.sessions++; a.trust = K.clamp(a.trust + 0.04);
          if (p.cause === 'untaught') {
            a.skill = K.clamp(a.skill + 0.1);
            if (p.sessions >= 2) K.resolve(p, 'newhand.fixed.taught', { root: true });
            else K.line('result', 'newhand.teach.first', v);
          } else if (p.cause === 'settling') { a.skill = K.clamp(a.skill + 0.05); K.line('result', 'newhand.teach.settling', v); }
          else if (p.cause === 'afraid' && K.r.outcomes.next() < 0.4) { told(p); K.line('told', 'newhand.told.afraid', v); }
          else K.line('result', 'newhand.teach.noHelp', v);
          return;
        case 'pair':
          if (kev && K.active(kev)) kev.stress += 0.3;
          if (p.cause === 'afraid' && works(K, p, action, 0.75, 0.9)) { a.morale = K.clamp(a.morale + 0.08); a.skill = K.clamp(a.skill + 0.06); K.resolve(p, 'newhand.fixed.paired', { root: true }); }
          else if (p.cause === 'untaught') { a.skill = K.clamp(a.skill + 0.03); K.line('result', 'newhand.pair.someHelp', v); }
          else K.line('result', 'newhand.pair.noHelp', v);
          return;
        case 'slowDown':
          if (p.cause === 'rushed' && works(K, p, action, 0.85, 0.95)) { a.morale = K.clamp(a.morale + 0.08); K.resolve(p, 'newhand.fixed.slowed', { root: true }); }
          else K.line('result', 'newhand.slowDown.noHelp', v);
          return;
        case 'sheet': K.line('result', 'newhand.sheet', v); return;
        case 'fixHis': p.fixedThisWeek = true; K.line('result', 'newhand.fixHis', v); return;
        case 'document':
          a.trust = K.clamp(a.trust - 0.15); a.morale = K.clamp(a.morale - 0.15);
          if (!p.walkChecked) { p.walkChecked = true; if (K.r.outcomes.next() < 0.3) K.queue(1 + K.r.outcomes.int(2), 'quit', { id: a.id }, { key: 'because.newHandWrittenUp', vars: v }); }
          K.line('result', 'newhand.document', v);
          return;
      }
    },
    week(K, p) {
      const [a] = p.who.map(K.person);
      const v = { p };
      if (p.cause === 'settling' && K.week - p.since >= 2 && K.r.people.next() < 0.6) { a.skill = K.clamp(a.skill + 0.1); K.resolve(p, 'newhand.passed.settled', { settled: true }); return; }
      // scrapped brackets at fit-up, and the ones that get through hidden
      if (!p.fixedThisWeek) K.s.week_.capacity -= p.cause === 'afraid' ? 0.2 : 0.35;
      if (p.cause === 'afraid' && !p.fixedThisWeek) K.s.week_.defects += 0.3;
      p.fixedThisWeek = false;
      p.extraInterrupts = 1;
      a.skill = K.clamp(a.skill + (p.cause === 'untaught' ? 0.005 : 0.015));
      if (p.cause !== 'settling') a.morale = K.clamp(a.morale - 0.03 * p.severity);
      if (p.neglect >= 3 && !p.quitQueued) { p.quitQueued = true; if (K.r.people.next() < 0.55) K.queue(2 + Math.floor(K.r.people.next() * 3), 'quit', { id: a.id }, { key: 'because.newHandAlone', vars: v }); }
      if ((K.week - p.since) % 3 === 2) p.severity++;
      K.line('signal', `newhand.week.${p.severity >= 2 ? 'worse' : 'quiet'}`, v);
    },
    score(p, action) {
      if (action === 'watch') return p.told ? [['D4', 1, 'Sat with him again']] : [];
      if (action === 'teach') return p.told === 'untaught' ? (p.sessions >= 1 ? [['D4', 2, 'Checked that it landed before moving on']] : [['D4', 2, 'Taught the reason, not just the steps']]) : [['D4', 0, 'Taught a job for a reason nobody gave']];
      if (action === 'pair') return p.told === 'afraid' ? [['D4', 2, 'Paired him with someone he could ask']] : [['D4', 0, 'Paired him up without knowing why']];
      if (action === 'slowDown') return p.told === 'rushed' ? [['D4', 2, 'Took the pressure off a new hand']] : [['D4', 0, 'Slowed down a man who was not rushing']];
      if (action === 'sheet') return [['D4', 0, 'Handed him a sheet instead of a person']];
      if (action === 'fixHis') return [['D4', -1, "Fixed the new hand's work for him"]];
      if (action === 'document') return [['D4', -1, 'Wrote up a man in his first month']];
      return [];
    },
  },

  // ------------------------------------------------------------- the other side (beta 7)
  // The player covers paint and receives their own department's spatter. Open,
  // it costs paint's rework hours and welding's defects; waved through, it
  // goes quiet and Theresa finds it her first week back.
  // ------------------------------------------------------------- the bench (Pulled off the floor)
  // Kev will run the floor for three weeks and has never run it. Why he is
  // not ready is hidden: never shown the pieces, never seen as in charge by
  // the crew, won't say what he doesn't know, or ready and the problem is you.
  // Every right move raises dept.bench, which is what leadWhileAway runs on.
  bench: {
    notice() { return true; },
    act(K, p, action) {
      const [a] = p.who.map(K.person);
      const v = { p };
      const d = K.s.dept;
      const up = (n) => { d.bench = K.clamp(d.bench + n); };
      switch (action) {
        case 'ask':
          told(p); a.trust = K.clamp(a.trust + 0.05);
          K.line('told', `bench.told.${p.told}`, v);
          if (p.cause === 'ready') { up(0.3); K.resolve(p, 'bench.passed.ready', { settled: true }); }
          return;
        case 'handover':
          if (!d.routineGone.includes('scheduler')) d.routineGone.push('scheduler');
          if (!d.routineGone.includes('huddles')) d.routineGone.push('huddles');
          if (p.cause === 'unshown' && works(K, p, action, 0.85, 0.95)) { up(0.35); a.morale = K.clamp(a.morale + 0.05); K.resolve(p, 'bench.fixed.handover', { root: true }); }
          else if (p.cause === 'ready') { up(0.3); K.resolve(p, 'bench.passed.handoverReady', { settled: true }); }
          else { up(0.08); if (p.cause !== 'unshown') p.ruledOut.push('unshown'); K.line('result', p.cause === 'unshown' ? 'bench.handover.notYet' : 'bench.handover.noHelp', v); }
          return;
        case 'announce':
          if (p.cause === 'unseen' && works(K, p, action, 0.85, 0.95)) { up(0.35); for (const c of K.crew()) c.trust = K.clamp(c.trust + 0.02); K.resolve(p, 'bench.fixed.announce', { root: true }); }
          else if (p.cause === 'ready') { up(0.3); K.resolve(p, 'bench.passed.announceReady', { settled: true }); }
          else { up(0.05); if (p.cause !== 'unseen') p.ruledOut.push('unseen'); K.line('result', p.cause === 'unseen' ? 'bench.announce.notYet' : 'bench.announce.noHelp', v); }
          return;
        case 'steps':
          d.flags.kevSteps = true;
          if (p.cause === 'wontAsk' && works(K, p, action, 0.8, 0.9)) { up(0.35); a.trust = K.clamp(a.trust + 0.05); K.resolve(p, 'bench.fixed.steps', { root: true }); }
          else if (p.cause === 'ready') { up(0.3); K.resolve(p, 'bench.passed.stepsReady', { settled: true }); }
          else { up(0.05); if (p.cause !== 'wontAsk') p.ruledOut.push('wontAsk'); K.line('result', p.cause === 'wontAsk' ? 'bench.steps.notYet' : 'bench.steps.noHelp', v); }
          return;
        case 'sheet': up(p.cause === 'unshown' ? 0.08 : 0.02); K.line('result', `bench.sheet.${p.cause === 'unshown' ? 'some' : 'none'}`, v); return;
        case 'doItAll':
          // the floor is tidy for a week and the lead has learned that you do it
          up(-0.05); K.s.week_.capacity += 0.4; a.morale = K.clamp(a.morale - 0.03);
          K.line('result', 'bench.doItAll', v);
          return;
        case 'callMe':
          up(-0.05); p.callMe = true; a.trust = K.clamp(a.trust - 0.02);
          K.line('result', 'bench.callMe', v);
          return;
      }
    },
    week(K, p) {
      const [a] = p.who.map(K.person);
      const v = { p };
      // a ready lead shows it by the second week whether you asked or not
      if (p.cause === 'ready' && K.week - p.since >= 2) { K.s.dept.bench = K.clamp(K.s.dept.bench + 0.25); K.resolve(p, 'bench.passed.ready', { settled: true }); return; }
      // in the audit room, the gap you did not find lands on him: what he was never shown
      // goes wrong, what the crew never saw lands back on you, what he would not ask goes unhandled
      if (K.s.monday?.away && p.state === 'active') {
        a.stress += 0.4; K.s.week_.capacityMul *= 0.92;
        if (K.r.outcomes.next() < 0.45) { K.s.trace.push({ week: K.week, text: K.say(`trace.bench.${p.cause}`, v), because: K.say('because.benchGap', v) }); K.line('consequence', `bench.away.${p.cause}`, v); }
        else if (p.callMe) { K.s.week_.interrupts = (K.s.week_.interrupts || 0) + 2; K.line('event', 'bench.week.calls', v); }
        return;
      }
      if (K.week - p.since >= 1 && p.neglect >= 1) K.line('event', 'bench.week.quiet', v);
    },
    // the generic moves (find out first, act on what you found, change course) score; these are the module's own
    score(p, action) {
      const out = [];
      if (action === 'doItAll') out.push(['A4', -1, 'Did the job yourself instead of handing it over']);
      if (action === 'callMe') out.push(['A4', -1, 'Planned to be reachable instead of replaceable']);
      if (action === 'handover') out.push(['A4', 1, 'Handed over a real piece of the job']);
      if (action === 'steps') out.push(['D1', 1, 'Prepared the lead for the hard part']);
      if (action === 'announce') out.push(['A4', 1, 'Made the handover visible']);
      return out;
    },
  },
  otherside: {
    notice() { return true; },
    act(K, p, action) {
      const v = { p };
      const d = K.s.dept;
      const tyler = K.person('tyler');
      switch (action) {
        case 'lookPaint': told(p); K.line('told', `otherside.told.${p.told}`, v); return;
        case 'sendBack':
          p.sentBack = (p.sentBack || 0) + 1;
          d.standard = K.clamp(d.standard + 0.03);
          for (const c of K.crew()) if (c.station === 'weld' && K.active(c)) c.morale = K.clamp(c.morale - 0.03);
          K.s.week_.capacity -= 0.3;
          K.line('result', p.sentBack === 1 ? 'otherside.sendBack.first' : 'otherside.sendBack.again', v);
          return;
        case 'fixInPaint': p.sandedThisWeek = true; K.line('result', 'otherside.fixInPaint', v); return;
        case 'checkPaint':
          if (p.pending) { K.resolve(p, 'otherside.checked', { root: true }); K.s.dept.peerTrust = K.clamp(K.s.dept.peerTrust + 0.03); }
          else if (!p.told) { told(p); K.line('told', `otherside.told.${p.told}`, v); }
          else K.line('result', 'otherside.check.nothing', v);
          return;
        case 'swapWire':
          if (p.cause === 'wire' && works(K, p, action, 0.85, 0.95)) { p.pending = K.week; K.line('result', 'otherside.fixed.wire', v); }
          else { if (p.cause !== 'wire') p.ruledOut.push('wire'); K.line('result', p.cause === 'wire' ? 'otherside.wire.notYet' : 'otherside.wire.noHelp', v); }
          return;
        case 'slowTyler':
          if (tyler && K.active(tyler)) { tyler.trust = K.clamp(tyler.trust + 0.03); tyler.skill = K.clamp(tyler.skill + 0.02); }
          if (p.cause === 'rushing' && works(K, p, action, 0.8, 0.9)) { p.pending = K.week; K.line('result', 'otherside.fixed.tyler', v); }
          else { if (p.cause !== 'rushing') p.ruledOut.push('rushing'); K.line('result', p.cause === 'rushing' ? 'otherside.tyler.notYet' : 'otherside.tyler.noHelp', v); }
          return;
        case 'writeStandard':
          d.flags.spatterStandard = true;
          if (p.cause === 'noStandard' && works(K, p, action, 0.85, 0.95)) { d.peerTrust = K.clamp(d.peerTrust + 0.08); p.pending = K.week; K.line('result', 'otherside.fixed.standard', v); }
          else if (p.cause === 'careful') K.resolve(p, 'otherside.fixed.standardCareful', { settled: true });
          else { K.line('result', p.cause === 'noStandard' ? 'otherside.standard.notYet' : 'otherside.standard.noHelp', v); }
          return;
        case 'waveThrough':
          p.state = 'quiet'; p.quietUntil = K.week + 2; p.waved = true;
          d.escapeAdd = (d.escapeAdd || 0) + 0.1;
          K.line('result', 'otherside.waveThrough', v);
          return;
      }
    },
    week(K, p) {
      const v = { p };
      const d = K.s.dept;
      if (p.cause === 'careful' && K.week - p.since >= 2 && K.r.people.next() < 0.6) { K.resolve(p, 'otherside.passed.careful', { settled: true }); return; }
      // fixed at the source and never checked from paint's side: it settles on its own after two weeks
      if (p.pending) { if (K.week - p.pending >= 2) K.resolve(p, 'otherside.settledUnchecked', { root: true }); else K.line('signal', 'otherside.pending', v); return; }
      // paint's rework on welding's bodies, on your desk now
      if (!p.sandedThisWeek) { K.s.week_.defects += 0.4 * p.severity; p.extraInterrupts = 2; }
      else { p.extraInterrupts = 1; p.sandedThisWeek = false; }
      if (p.cause === 'wire') K.s.week_.defects += 0.2;
      if ((K.week - p.since) % 3 === 2) p.severity++;
      if (K.week === 6 && !p.theresaSaw) { p.theresaSaw = true; d.peerTrust = K.clamp(d.peerTrust - (p.waved ? 0.15 : 0.06)); K.line('consequence', p.waved ? 'otherside.theresaFoundIt' : 'otherside.theresaBackOpen', v); }
      K.line('signal', `otherside.week.${p.severity >= 2 ? 'worse' : 'open'}`, v);
    },
    score(p, action) {
      if (action === 'lookPaint') return p.told ? [] : [['E2', 2, 'Stood on the other side of the door']];
      if (action === 'checkPaint') return p.pending ? [['C3', 2, 'Checked at the receiving end that the fix held']] : p.told ? [['C3', 0, 'Went to check before there was anything to check']] : [['E2', 2, 'Stood on the other side of the door']];
      if (action === 'sendBack') return [['C3', (p.sentBack || 0) <= 1 ? 1 : 0, 'Fed it back upstream, to your own crew']];
      if (action === 'fixInPaint') return [['C3', -1, "Let paint absorb welding's rework"]];
      if (action === 'swapWire') return p.told === 'wire' ? [['C3', 2, 'Traced the defect to where it was made: the wire']] : [['C3', 0, 'Changed the wire on a hunch']];
      if (action === 'slowTyler') return p.told === 'rushing' ? [['C3', 2, 'Traced the defect to where it was made: the booth']] : [['C3', 0, 'Slowed a welder who was not the cause']];
      if (action === 'writeStandard') return p.told === 'noStandard' ? [['E2', 2, 'Agreed one standard at the interface']] : [['E2', 1, 'Wrote a standard both sides can use, for a different problem']];
      if (action === 'waveThrough') return [['E2', -1, 'Left it for Theresa to find']];
      return [];
    },
  },

  // ------------------------------------------------------------- what paint needs (beta 8)
  customer: {
    notice() { return true; },
    act(K, p, action) {
      const v = { p };
      const d = K.s.dept;
      switch (action) {
        case 'askPaint': told(p); d.peerTrust = K.clamp(d.peerTrust + 0.04); K.line('told', `customer.told.${p.told}`, v); return;
        case 'fixTiming':
          if (p.cause === 'timing' && works(K, p, action, 0.85, 0.95)) { d.peerTrust = K.clamp(d.peerTrust + 0.06); K.resolve(p, 'customer.fixed.timing', { root: true }); }
          else { if (p.cause !== 'timing') p.ruledOut.push('timing'); K.line('result', p.cause === 'timing' ? 'customer.timing.notYet' : 'customer.timing.noHelp', v); }
          return;
        case 'fixOrder':
          if (p.cause === 'order' && works(K, p, action, 0.85, 0.95)) { d.peerTrust = K.clamp(d.peerTrust + 0.06); K.resolve(p, 'customer.fixed.order', { root: true }); }
          else { if (p.cause !== 'order') p.ruledOut.push('order'); K.line('result', p.cause === 'order' ? 'customer.order.notYet' : 'customer.order.noHelp', v); }
          return;
        case 'fixInfo':
          if (p.cause === 'info' && works(K, p, action, 0.8, 0.9)) { d.peerTrust = K.clamp(d.peerTrust + 0.06); K.resolve(p, 'customer.fixed.info', { root: true }); }
          else { if (p.cause !== 'info') p.ruledOut.push('info'); K.line('result', p.cause === 'info' ? 'customer.info.notYet' : 'customer.info.noHelp', v); }
          return;
        case 'pushMore': K.s.week_.capacity += 0.4; for (const c of K.crew()) if (K.active(c)) c.morale = K.clamp(c.morale - 0.02); d.peerTrust = K.clamp(d.peerTrust - 0.02); K.line('result', 'customer.pushMore', v); return;
        case 'defend': d.peerTrust = K.clamp(d.peerTrust - 0.1); d.managerTrust = K.clamp(d.managerTrust - 0.03); K.line('result', 'customer.defend', v); return;
      }
    },
    week(K, p) {
      const v = { p };
      if (p.cause === 'theirs' && K.week - p.since >= 2 && K.r.people.next() < 0.6) { K.resolve(p, 'customer.passed.theirs', { settled: true }); return; }
      // bodies that arrive when paint cannot use them wait at the door
      K.s.week_.capacityMul *= 0.96;
      K.s.dept.peerTrust = K.clamp(K.s.dept.peerTrust - 0.02);
      p.extraInterrupts = 1;
      if ((K.week - p.since) % 3 === 2) p.severity++;
      K.line('signal', `customer.week.${p.severity >= 2 ? 'worse' : 'open'}`, v);
    },
    score(p, action) {
      if (action === 'askPaint') return p.told ? [] : [['E4', 2, 'Asked the receiver what they need']];
      if (['fixTiming', 'fixOrder', 'fixInfo'].includes(action)) return p.told && (PROBLEMS.customer.actions[action].fits || []).includes(p.told) ? [['E4', 2, 'Delivered what paint needed']] : p.told ? [['E4', -1, 'Changed something paint had not asked for']] : [['E4', 0, 'Guessed at what paint needed']];
      if (action === 'pushMore') return [['E4', -1, 'Delivered more of what was asked for instead of what was needed']];
      if (action === 'defend') return [['E4', -1, 'Argued with the customer instead of asking them']];
      return [];
    },
  },

  // ------------------------------------------------------------- the same question (beta 8)
  // The walk-up hours on the bar are the symptom. Fixed at the root, they drop
  // and stay down (dept.walkupsCut, read by interruptions()).
  infowork: {
    notice() { return true; },
    act(K, p, action) {
      const v = { p };
      const d = K.s.dept;
      switch (action) {
        case 'tally': told(p); K.line('told', `infowork.told.${p.told}`, v); return;
        case 'board':
          d.boardUp = true;
          if (p.cause === 'board' && works(K, p, action, 0.85, 0.95)) { d.walkupsCut = 3; K.resolve(p, 'infowork.fixed.board', { root: true }); }
          else if (p.cause === 'newMix') { d.walkupsCut = 1; K.resolve(p, 'infowork.fixed.boardMix', { settled: true }); }
          else { d.walkupsCut = Math.max(d.walkupsCut || 0, 1); K.line('result', p.cause === 'board' ? 'infowork.board.notYet' : 'infowork.board.noHelp', v); }
          return;
        case 'travellers':
          if (p.cause === 'travellers' && works(K, p, action, 0.75, 0.9)) { d.walkupsCut = 3; K.resolve(p, 'infowork.fixed.travellers', { root: true }); }
          else { if (p.cause !== 'travellers') p.ruledOut.push('travellers'); K.line('result', p.cause === 'travellers' ? 'infowork.travellers.notYet' : 'infowork.travellers.noHelp', v); }
          return;
        case 'point':
          if (p.cause === 'youAnswer' && works(K, p, action, 0.8, 0.9)) { d.walkupsCut = 3; K.resolve(p, 'infowork.fixed.point', { root: true }); }
          else { if (p.cause !== 'youAnswer') { p.ruledOut.push('youAnswer'); for (const c of K.crew()) if (K.active(c)) c.trust = K.clamp(c.trust - 0.01); } K.line('result', p.cause === 'youAnswer' ? 'infowork.point.notYet' : 'infowork.point.noHelp', v); }
          return;
        case 'faster': p.fasterThisWeek = true; K.line('result', 'infowork.faster', v); return;
        case 'memo': K.line('result', 'infowork.memo', v); return;
      }
    },
    week(K, p) {
      const v = { p };
      if (p.cause === 'newMix' && K.week - p.since >= 2 && K.r.people.next() < 0.6) { K.resolve(p, 'infowork.passed.newMix', { settled: true }); return; }
      // the questions eat the week: two or three hours a week beyond the walk-ups
      p.extraInterrupts = p.fasterThisWeek ? 2 : 3;
      p.fasterThisWeek = false;
      if (p.cause === 'travellers' && K.r.outcomes.next() < 0.25) K.s.week_.defects += 0.4;
      if ((K.week - p.since) % 3 === 2) p.severity++;
      K.line('signal', `infowork.week.${p.severity >= 2 ? 'worse' : 'open'}`, v);
    },
    score(p, action) {
      if (action === 'tally') return p.told ? [] : [['B5', 2, 'Counted the rework nobody counts']];
      if (['board', 'travellers', 'point'].includes(action)) return p.told && (PROBLEMS.infowork.actions[action].fits || []).includes(p.told) ? [['B5', 2, 'Put the answer where they would find it']] : p.told ? [['B5', 0, 'Fixed where a different answer lives']] : [['B5', 0, 'Guessed where the answer should live']];
      if (action === 'faster') return [['B5', -1, 'Did the rework faster']];
      if (action === 'memo') return [['B5', 0, 'Sent a memo nobody will find when they need it']];
      return [];
    },
  },

  // ------------------------------------------------------------- what the system sees (beta 8)
  erp: {
    notice() { return true; },
    act(K, p, action) {
      const v = { p };
      const d = K.s.dept;
      switch (action) {
        case 'trace': told(p); K.line('told', `erp.told.${p.told}`, v); return;
        case 'clockNow':
          if (p.cause === 'lateEntries' && works(K, p, action, 0.8, 0.9)) K.resolve(p, 'erp.fixed.clock', { root: true });
          else { if (p.cause !== 'lateEntries') p.ruledOut.push('lateEntries'); K.line('result', p.cause === 'lateEntries' ? 'erp.clock.notYet' : 'erp.clock.noHelp', v); }
          return;
        case 'fixOps':
          if (p.cause === 'wrongOps' && works(K, p, action, 0.75, 0.9)) K.resolve(p, 'erp.fixed.ops', { root: true });
          else { if (p.cause !== 'wrongOps') p.ruledOut.push('wrongOps'); K.line('result', p.cause === 'wrongOps' ? 'erp.ops.notYet' : 'erp.ops.noHelp', v); }
          return;
        case 'issueMaterial':
          if (p.cause === 'noIssue' && works(K, p, action, 0.8, 0.9)) K.resolve(p, 'erp.fixed.issue', { root: true });
          else { if (p.cause !== 'noIssue') p.ruledOut.push('noIssue'); K.line('result', p.cause === 'noIssue' ? 'erp.issue.notYet' : 'erp.issue.noHelp', v); }
          return;
        case 'ownSheet': p.sheetThisWeek = true; d.secondSystem = true; K.line('result', 'erp.ownSheet', v); return;
        case 'blame': d.managerTrust = K.clamp(d.managerTrust - 0.05); K.line('result', 'erp.blame', v); return;
      }
    },
    week(K, p) {
      const v = { p };
      if (p.cause === 'upgrade' && K.week - p.since >= 2 && K.r.people.next() < 0.6) { K.resolve(p, 'erp.passed.upgrade', { settled: true }); return; }
      // Jess builds on what the system says; purchasing buys on it; the floor chases steel the system thinks is there
      if (!p.sheetThisWeek && (K.week - p.since) % 2 === 1) K.s.dept.surprise = true;
      p.sheetThisWeek = false;
      p.extraInterrupts = 2;
      if (p.cause === 'noIssue' && K.r.outcomes.next() < 0.3) { K.s.week_.capacity -= 0.5; K.line('event', 'erp.steelShort', v); }
      if ((K.week - p.since) % 3 === 2) p.severity++;
      K.line('signal', `erp.week.${p.severity >= 2 ? 'worse' : 'open'}`, v);
    },
    score(p, action) {
      if (action === 'trace') return p.told ? [] : [['B6', 2, 'Traced a job past the screen you use']];
      if (['clockNow', 'fixOps', 'issueMaterial'].includes(action)) return p.told && (PROBLEMS.erp.actions[action].fits || []).includes(p.told) ? [['B6', 2, 'Fixed the entry where it happens, not the report']] : p.told ? [['B6', 0, 'Fixed an entry that was not the one']] : [['B6', 0, 'Guessed at what the system was missing']];
      if (action === 'ownSheet') return [['B6', -1, 'Kept a second system']];
      if (action === 'blame') return [['B6', -1, 'Blamed the system for what it was told']];
      return [];
    },
  },

  // ------------------------------------------------------------- it looked great for a week (beta 9)
  // dept.lean is how much of the event is still standing (KILLGATE-lean.md).
  // A root fix is pending until it has held two weeks; the event re-run
  // yourself resets it to 0.9 and fixes nothing.
  lean: {
    notice() { return true; },
    act(K, p, action) {
      const v = { p };
      const d = K.s.dept;
      switch (action) {
        case 'ask': told(p); K.line('told', `lean.told.${p.told}`, v); return;
        case 'owners':
          d.leanOwner = true;
          if (p.cause === 'noOwner') { p.pending = K.week; K.line('result', 'lean.fixed.owners', v); }
          else { if (p.cause !== 'noOwner') p.ruledOut.push('noOwner'); K.line('result', 'lean.owners.noHelp', v); }
          return;
        case 'audit':
          d.flags.leanAudit = true;
          if (p.cause === 'noAudit') { p.pending = K.week; K.line('result', 'lean.fixed.audit', v); }
          else { p.ruledOut.push('noAudit'); K.line('result', d.leanOwner ? 'lean.audit.someHelp' : 'lean.audit.noOwner', v); }
          return;
        case 'redoWith':
          d.lean = 0.9; d.leanWith = true;
          if (p.cause === 'forThem') { p.pending = K.week; K.line('result', 'lean.fixed.with', v); }
          else if (p.cause === 'moveIn') K.resolve(p, 'lean.fixed.withMove', { settled: true });
          else K.line('result', p.cause === 'noOwner' ? 'lean.with.someHelp' : 'lean.with.noHelp', v);
          return;
        case 'redoFor':
          d.lean = 0.9; p.redone = (p.redone || 0) + 1;
          K.line('result', p.redone === 1 ? 'lean.redoFor.first' : 'lean.redoFor.again', v);
          return;
        case 'signs': K.line('result', 'lean.signs', v); return;
      }
    },
    week(K, p) {
      const v = { p };
      const d = K.s.dept;
      const L = C.lean;
      // what the bay started with, by cause: owners exist when the audit is the gap; the crew owns it when a rack is the gap
      if (!p.inited) { p.inited = true; if (p.cause === 'noAudit') d.leanOwner = true; if (p.cause === 'moveIn') { d.leanOwner = true; d.leanWith = true; } }
      if (p.cause === 'moveIn' && K.week - p.since >= 2 && K.r.people.next() < 0.6) { d.lean = Math.max(d.lean, 0.8); K.resolve(p, 'lean.passed.moveIn', { settled: true }); return; }
      // the decay, as the kill gate had it
      let decay = d.leanOwner ? L.decayOwned : L.decay;
      if (d.leanWith) decay *= L.withCrew;
      if (d.auditedThisWeek) { decay *= L.auditMul; d.lean = Math.min(1, d.lean + (d.leanOwner ? L.auditTop : L.auditTopNoOwner)); }
      d.lean = Math.max(0, d.lean - decay * (0.7 + 0.6 * K.r.people.next()));
      K.s.week_.defects += 0.25 * (1 - d.lean);
      if (p.pending) {
        if (d.lean < 0.4) { p.pending = null; p.severity++; K.line('consequence', 'lean.fellAgain', v); }
        else if (K.week - p.pending >= 2 && d.lean >= 0.6) { K.resolve(p, 'lean.held', { root: true }); return; }
        else K.line('signal', 'lean.pending', v);
        return;
      }
      if (d.lean < 0.5 && (K.week - p.since) % 3 === 2) p.severity++;
      K.line('signal', d.lean < 0.35 ? 'lean.week.dead' : d.lean < 0.65 ? 'lean.week.slipping' : 'lean.week.fine', v);
    },
    score(p, action) {
      if (action === 'ask') return p.told ? [] : [];
      if (action === 'owners') return p.told === 'noOwner' ? [['B2', 2, 'Gave every area an owner the crew chose']] : p.pending ? [['B2', 1, 'Put a name on it so the fix would hold']] : [['B2', 0, 'Named owners for a problem that was not ownership']];
      if (action === 'audit') return p.told === 'noAudit' ? [['B2', 2, 'Set up the audit that keeps it alive']] : p.pending ? [['B2', 1, 'Set up the audit so the fix would hold']] : [['B2', 0, 'Started an audit for a problem that was not the audit']];
      if (action === 'redoWith') return p.told === 'forThem' ? [['B2', 2, 'Built it with the crew, not for them']] : [['B2', 0, 'Re-ran the event with the crew for a cause that was not theirs']];
      if (action === 'redoFor') return [['B2', -1, 'Re-ran the event instead of fixing why it died']];
      if (action === 'signs') return [['B2', 0, 'New labels on the same problem']];
      return [];
    },
  },

  // ------------------------------------------------------------- the flow rounds (beta 11)
  // dept.flow holds the three rules. A change costs a learning dip (applied in
  // week.js), may slide back by Friday, and settles the problem only after the
  // fitting rule has held two rounds.
  flow: {
    notice() { return true; },
    act(K, p, action) {
      const v = { p };
      const d = K.s.dept;
      const set = (rule, to) => { if (d.flow[rule] === to) return false; d.flow[rule] = to; d.flowChanged.push(rule); p.changedAt = K.week; return true; };
      switch (action) {
        case 'readRound':
          if (!p.told) { told(p); K.line('told', `flow.told.${p.told}`, v); return; }
          // a second read after a change that did not move the number corrects a misread
          if (p.told !== p.cause) { p.told = p.cause; p.reread = true; K.line('told', 'flow.reread', v); K.line('told', `flow.told.${p.told}`, v); return; }
          K.line('result', 'flow.read.same', v);
          return;
        case 'batchOne': K.line('result', set('batch', 1) ? 'flow.set.batch' : 'flow.set.already', v); return;
        case 'pull': K.line('result', set('pull', true) ? 'flow.set.pull' : 'flow.set.already', v); return;
        case 'checkSource': K.line('result', set('check', 'source') ? 'flow.set.check' : 'flow.set.already', v); return;
        case 'all': { const n = [set('batch', 1), set('pull', true), set('check', 'source')].filter(Boolean).length; K.line('result', n ? 'flow.set.all' : 'flow.set.already', v); return; }
      }
    },
    week(K, p) {
      const v = { p };
      const d = K.s.dept;
      const mul = K.s.week_.stationMul;
      const fitting = { batch: d.flow.batch === 1, push: d.flow.pull, late: d.flow.check === 'source', fine: true }[p.cause];
      if (p.cause === 'fine' && K.week - p.since >= 3) { K.resolve(p, 'flow.passed.fine', { settled: true }); return; }
      // what the cause costs while its rule is the old way
      if (p.cause === 'batch' && d.flow.batch !== 1) K.s.week_.defects += 0.8;
      if (p.cause === 'push' && !d.flow.pull) mul.weld *= 0.82;
      if (p.cause === 'late' && d.flow.check !== 'source') { mul.finish *= 0.85; K.s.week_.defects += 0.3; }
      p.extraInterrupts = 1;
      if (fitting && p.cause !== 'fine') {
        p.held = (p.held || 0) + 1;
        if (p.held >= 2) { K.resolve(p, `flow.fixed.${p.cause}`, { root: true }); return; }
        K.line('signal', 'flow.holding', v);
        return;
      }
      p.held = 0;
      K.line('signal', 'flow.week', v);
    },
    score(p, action) {
      const rule = { batchOne: 'batch', pull: 'push', checkSource: 'late' }[action];
      if (action === 'readRound') return !p.told ? [['B7', 2, 'Read the round before changing a rule']] : p.changedAt ? [['B7', 2, 'Read the next round to see if the change took']] : [['B7', 0, 'Read the round again with nothing changed']];
      if (rule) return p.told === rule ? [['B7', 2, 'Changed one rule: the one the round pointed at']] : p.told ? [['B7', -1, 'Changed a rule the round did not point at']] : [['B7', 0, 'Changed a rule before reading a round']];
      if (action === 'all') return [['B7', -1, 'Changed everything at once: no way to tell what worked']];
      return [];
    },
  },
};

export function actionsFor(type) { return PROBLEMS[type].actions; }
