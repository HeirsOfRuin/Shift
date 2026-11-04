// Problem types. Logic-free: what each type is, its hidden causes, what people
// tell you, and the actions on its card. What the actions DO, by cause, is in
// src/engine/problems.js; what the player reads is in text.data.js.
//
// Every type has one passing cause: it sorts itself out, acting costs hours, and
// heavy action does harm. The kill gate needed this, or doing nothing could never
// be right and the tool would preach (docs/KILLGATE.md, run 1).
//
// Action fields: hours; kind (what the bots read: ask, fix, hold, contain,
// yourself, soft, up, around, leave); fits (the causes it is the right answer
// for; common sense a good supervisor has, never shown as a hint); needs
// ('supervisor': a lead hand cannot do this and takes it to the supervisor).

export const PROBLEMS = {
  late: {
    label: 'Lateness',
    causes: { childcare: 0.35, ride: 0.3, attitude: 0.35 },
    passing: 'ride',
    stories: { attitude: { ride: 0.4 } },
    actions: {
      talk: { label: 'Talk to {a.him} privately', hours: 1, kind: 'ask' },
      document: { label: 'Write it up and start the discipline steps', hours: 1.5, kind: 'hold', fits: ['attitude'], needs: 'supervisor' },
      accommodate: { label: 'Offer {a.him} a later start time', hours: 0.5, kind: 'fix', fits: ['childcare'], needs: 'supervisor' },
      carpool: { label: 'Sort out a ride with someone on {a.his} road', hours: 1, kind: 'fix', fits: ['ride'] },
      remind: { label: 'Mention it in passing', hours: 0.25, kind: 'soft' },
    },
  },
  rework: {
    label: 'Rework',
    causes: { untrained: 0.4, rushing: 0.25, fixture: 0.15, newJig: 0.2 },
    passing: 'newJig',
    stories: {},
    actions: {
      investigate: { label: 'Watch {a.him} weld for a morning and pull the tickets', hours: 3, kind: 'ask' },
      coach: { label: 'Coach {a.him} at the booth', hours: 1, kind: 'fix', fits: ['untrained', 'rushing'] },
      correct: { label: 'Tell {a.him} to tighten up', hours: 0.5, kind: 'soft' },
      fixYourself: { label: 'Fix the welds yourself', hours: 2, kind: 'yourself' },
      fixFixture: { label: 'Rebuild the fixture with maintenance', hours: 4, kind: 'fix', fits: ['fixture'] },
      document: { label: 'Write {a.him} up for quality', hours: 1.5, kind: 'hold', needs: 'supervisor' },
    },
  },
  load: {
    label: 'Carrying too much',
    causes: { unowned: 0.45, personal: 0.3, crunch: 0.25 },
    passing: 'crunch',
    stories: { personal: { unowned: 0.3 } },
    actions: {
      talk: { label: 'Take {a.him} for a coffee and ask', hours: 1, kind: 'ask' },
      redistribute: { label: 'Hand out what {a.hes} been carrying', hours: 2, kind: 'fix', fits: ['unowned'] },
      timeOff: { label: 'Give {a.him} two days off', hours: 1, kind: 'fix', fits: ['personal'], needs: 'supervisor' },
      carry: { label: 'Take some of it yourself', hours: 3, kind: 'yourself' },
    },
  },
  friction: {
    label: 'Friction',
    causes: { workload: 0.3, personal: 0.25, roles: 0.25, badWeek: 0.2 },
    passing: 'badWeek',
    stories: { personal: { workload: 0.35 } },
    actions: {
      separate: { label: 'Talk to each of them on their own', hours: 2, kind: 'ask' },
      reset: { label: 'Sit them down together and reset the work', hours: 1.5, kind: 'fix', fits: ['workload'] },
      clarify: { label: 'Write down who owns what between their stations', hours: 3, kind: 'fix', fits: ['roles'] },
      expectations: { label: 'Set out how people treat each other here', hours: 1, kind: 'fix', fits: ['personal'] },
      warning: { label: 'Tell them both to knock it off', hours: 0.5, kind: 'soft' },
    },
  },
  hazard: {
    label: 'Safety',
    causes: { filter: 0.3, motor: 0.3, duct: 0.2, noisy: 0.2 },
    passing: 'noisy',
    stories: {},
    actions: {
      look: { label: 'Go and look at it now', hours: 1, kind: 'ask' },
      workOrder: { label: 'Put in a maintenance work order', hours: 0.25, kind: 'fix', fits: ['filter', 'motor', 'duct'] },
      followUp: { label: 'Walk the work order over to maintenance', hours: 0.5, kind: 'fix', fits: ['motor', 'duct'] },
      shutBooth: { label: 'Shut booth three until it is fixed', hours: 0.5, kind: 'contain', fits: ['duct', 'motor'] },
      moveWelder: { label: 'Move {a} to another booth for now', hours: 0.5, kind: 'contain' },
    },
  },
  recurring: {
    label: 'The same fire',
    causes: { pin: 0.3, setup: 0.3, steel: 0.2, batch: 0.2 },
    passing: 'batch',
    stories: {},
    actions: {
      investigate: { label: 'Spend a morning finding out why it keeps moving', hours: 3, kind: 'ask' },
      fixYourself: { label: 'Re-square the jig yourself again', hours: 2, kind: 'yourself' },
      leadFix: { label: 'Have {senior} re-square it', hours: 0.5, kind: 'yourself' },
      workOrder: { label: 'Work order: replace the locating pins', hours: 0.5, kind: 'fix', fits: ['pin'] },
      standardWork: { label: 'Write the setup down with the crew and train it', hours: 4, kind: 'fix', fits: ['setup'] },
      raiseFab: { label: 'Take the parts to Raymond in fabrication', hours: 1, kind: 'fix', fits: ['steel'] },
      escalate: { label: 'Tell Dana fabrication is sending bad parts', hours: 0.5, kind: 'up' },
    },
  },
  escalation: {
    label: 'A decision',
    causes: { yours: 0.3, signoff: 0.3, engineering: 0.25, dropped: 0.15 },
    passing: 'dropped',
    stories: {},
    actions: {
      check: { label: 'Check who decides this before anyone does', hours: 1, kind: 'ask' },
      decide: { label: 'Make the call yourself', hours: 0.5, kind: 'fix', fits: ['yours'] },
      askRuss: { label: 'Put it to Russ while Dana is away', hours: 0.5, kind: 'fix', fits: ['signoff'] },
      engineering: { label: 'Send it to Simone and engineering', hours: 1, kind: 'fix', fits: ['engineering'] },
      around: { label: 'Go straight to Irene', hours: 0.5, kind: 'around' },
    },
  },
  standards: {
    label: 'Two standards',
    causes: { pressure: 0.3, spec: 0.3, unaware: 0.25, newHire: 0.15 },
    passing: 'newHire',
    stories: { pressure: { unaware: 0.3 } },
    actions: {
      talkPeer: { label: 'Go and talk to Theresa', hours: 1, kind: 'ask' },
      writeStandard: { label: 'Write a spatter standard with Theresa and Val', hours: 3, kind: 'fix', fits: ['spec'] },
      handoff: { label: 'Rework the handoff times with Theresa', hours: 2, kind: 'fix', fits: ['pressure'] },
      showHer: { label: 'Bring Theresa the kickback tickets side by side', hours: 1, kind: 'fix', fits: ['unaware'] },
      complain: { label: 'Take it to Dana', hours: 0.5, kind: 'up' },
      matchThem: { label: 'Tell the crew to send whatever paint will take', hours: 0, kind: 'soft' },
    },
  },
  // ---- beta 4: Where it waits (B1)
  constraint: {
    label: 'Where it waits',
    causes: { fit: 0.3, weld: 0.25, finish: 0.25, mix: 0.2 },
    passing: 'mix',
    stories: {},
    actions: {
      look: { label: 'Spend a morning watching where work waits', hours: 2, kind: 'ask' },
      improveFit: { label: 'Put improvement hours into fit-up: a second jig set up and the rack sorted', hours: 4, kind: 'fix', fits: ['fit'] },
      improveWeld: { label: 'Put improvement hours into body weld: fixtures, wire feed, a spare stinger', hours: 4, kind: 'fix', fits: ['weld'] },
      improveFinish: { label: 'Put improvement hours into finish: a second inspection bench', hours: 4, kind: 'fix', fits: ['finish'] },
      askCrew: { label: 'Ask the crew where the problem is', hours: 0.5, kind: 'soft' },
    },
  },
  // ---- beta 4: Monday, 7:00 (F1)
  huddle: {
    label: 'The huddle',
    causes: { habit: 0.3, parts: 0.3, unheard: 0.25, newRoute: 0.15 },
    passing: 'newRoute',
    stories: { parts: { habit: 0.3 } },
    actions: {
      talk: { label: 'Catch Brent after the huddle and ask what is going on', hours: 0.5, kind: 'ask' },
      parkingLot: { label: 'Put up a parking lot and hold the five minutes', hours: 1, kind: 'fix', fits: ['habit'] },
      fixParts: { label: 'Take the parts problem to Raymond, and say so at the huddle', hours: 1, kind: 'fix', fits: ['parts'] },
      giveFloor: { label: 'Give Brent the first minute, every day, to raise what he has', hours: 0.5, kind: 'fix', fits: ['unheard'] },
      shutDown: { label: 'Tell him to take it offline', hours: 0.25, kind: 'soft' },
      letRun: { label: 'Let it run; people need to vent', hours: 0, kind: 'yourself' },
    },
  },
  // ---- beta 4: The new hand (D4)
  newhand: {
    label: 'The new hand',
    causes: { untaught: 0.35, afraid: 0.3, rushed: 0.15, settling: 0.2 },
    passing: 'settling',
    stories: { afraid: { untaught: 0.4 } },
    actions: {
      watch: { label: 'Sit with {a.him} at the table for an hour and watch', hours: 1, kind: 'ask' },
      teach: { label: 'Teach {a.him} the job and why it is done that way', hours: 2, kind: 'fix', fits: ['untaught'] },
      pair: { label: 'Pair {a.him} with {senior} for the week, and tell {senior} why', hours: 0.5, kind: 'fix', fits: ['afraid'] },
      slowDown: { label: 'Take the rack off {a.him}: speed comes later', hours: 0.5, kind: 'fix', fits: ['rushed'] },
      sheet: { label: 'Hand {a.him} the fit-up sheet and the drawing', hours: 0.25, kind: 'soft' },
      fixHis: { label: 'Fix {a.his} brackets yourself after hours', hours: 2, kind: 'yourself' },
      document: { label: 'Write up the scrapped brackets', hours: 1, kind: 'hold', needs: 'supervisor' },
    },
  },
  // ---- beta 7: The other side (E2 + C3): your own bodies, from paint's side
  otherside: {
    label: 'Your own bodies, from the other side',
    causes: { wire: 0.3, rushing: 0.25, noStandard: 0.3, careful: 0.15 },
    passing: 'careful',
    stories: { wire: { rushing: 0.3 } },
    actions: {
      lookPaint: { label: "Spend a morning on paint's side of the door, with the kickback tickets", hours: 2, kind: 'ask' },
      sendBack: { label: 'Send your own bodies back to your own crew', hours: 0.5, kind: 'hold' },
      fixInPaint: { label: 'Have paint sand it, like Theresa does', hours: 1, kind: 'yourself' },
      swapWire: { label: 'Go back to the old wire', hours: 0.5, kind: 'fix', fits: ['wire'] },
      slowTyler: { label: 'Take Tyler off the Rescue roofs for a week and show him', hours: 1, kind: 'fix', fits: ['rushing'] },
      writeStandard: { label: 'Write the spatter standard with Val, now that you stand on both sides', hours: 3, kind: 'fix', fits: ['noStandard'] },
      checkPaint: { label: "Go and check from paint's side that it held", hours: 1, kind: 'ask' },
      waveThrough: { label: 'Wave them through; Theresa can sort it when she is back', hours: 0, kind: 'soft' },
    },
  },
  // ---- beta 8: Who you work for (E4): what paint actually needs from welding
  customer: {
    label: 'What paint needs',
    causes: { timing: 0.3, order: 0.25, info: 0.25, theirs: 0.2 },
    passing: 'theirs',
    stories: { timing: { order: 0.3 } },
    actions: {
      askPaint: { label: 'Ask Theresa what paint needs from welding, in her words', hours: 1, kind: 'ask' },
      fixTiming: { label: 'Move the handoff to two: finish the last body first thing', hours: 1, kind: 'fix', fits: ['timing'] },
      fixOrder: { label: "Send bodies in the schedule's order, not the easy order", hours: 0.5, kind: 'fix', fits: ['order'] },
      fixInfo: { label: 'Fill in every traveller before the door: colour code, rework notes', hours: 1, kind: 'fix', fits: ['info'] },
      pushMore: { label: 'Send more bodies, earlier in the week', hours: 2, kind: 'yourself' },
      defend: { label: 'Tell Dana paint is never happy', hours: 0.5, kind: 'up' },
    },
  },
  // ---- beta 8: Say it once (B5): the same question, four times a day
  infowork: {
    label: 'The same question',
    causes: { board: 0.3, travellers: 0.25, youAnswer: 0.25, newMix: 0.2 },
    passing: 'newMix',
    stories: { youAnswer: { board: 0.3 } },
    actions: {
      tally: { label: 'Keep a tally for a week: who asks what, and how often', hours: 1, kind: 'ask' },
      board: { label: "Put the day's plan and the drawing revs on the board, every morning", hours: 1, kind: 'fix', fits: ['board'] },
      travellers: { label: 'Get engineering to put the rev on every traveller', hours: 1.5, kind: 'fix', fits: ['travellers'] },
      point: { label: "Answer with 'where would you find that?' for a week", hours: 0.5, kind: 'fix', fits: ['youAnswer'] },
      faster: { label: 'Answer faster; keep the day moving', hours: 0, kind: 'yourself' },
      memo: { label: 'Send a memo', hours: 0.25, kind: 'soft' },
    },
  },
  // ---- beta 8: What the system sees (B6): Jess built next week on what the system said
  erp: {
    label: 'What the system sees',
    causes: { lateEntries: 0.3, wrongOps: 0.25, noIssue: 0.25, upgrade: 0.2 },
    passing: 'upgrade',
    stories: { noIssue: { lateEntries: 0.3 } },
    actions: {
      trace: { label: 'Sit with Jess and trace one job through {erp}, screen by screen', hours: 2, kind: 'ask' },
      clockNow: { label: 'Clock on and off at the booth, every operation, the day it happens: show them why', hours: 1.5, kind: 'fix', fits: ['lateEntries'] },
      fixOps: { label: 'Get Ben to fix the operation sequence on the Hauler jobs', hours: 1, kind: 'fix', fits: ['wrongOps'] },
      issueMaterial: { label: 'Issue the steel to the jobs when it is cut, with the lead', hours: 1, kind: 'fix', fits: ['noIssue'] },
      ownSheet: { label: 'Keep your own spreadsheet and give Jess that', hours: 1, kind: 'yourself' },
      blame: { label: 'Tell Dana {erp} is wrong', hours: 0.5, kind: 'up' },
    },
  },
};

// Where a problem of each type can land, when a module draws one at random.
export const LANDS_ON = {
  late: [['brent'], ['tyler'], ['lyle'], ['joel']],
  rework: [['tyler'], ['marisol'], ['brent']],
  load: [['kev'], ['donna']],
  friction: [['marisol', 'donna'], ['brent', 'tyler'], ['kev', 'donna'], ['lyle', 'brent']],
};
