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
    // how you find out (engine/findout.js, docs/KILLGATE-ask.md): what Brent tells
    // his boss depends on how much he trusts you; Kev and Tyler know some of it,
    // and Tyler has a view; the timecards rule a reason out but never name one
    names: { childcare: 'the kids', ride: 'his truck', attitude: 'doesn\'t care' },
    find: {
      trust: [0.25, 0.8],
      ask: { truth: { ride: [0.9, 0], childcare: [-0.1, 1], attitude: [0, 0.5] }, cover: ['ride', 'childcare'], told: true },
      around: { from: [{ who: 'senior', truth: { ride: 0.5, childcare: 0.35, attitude: 0.45 } }, { who: 'tyler', truth: { ride: 0.5, childcare: 0.2, attitude: 0.6 }, bias: ['attitude', 'childcare'], biasP: 0.6 }], noticed: 0.3 },
      look: { name: 'the timecards', rules: 1 },
    },
    actions: {
      talk: { label: 'Ask {a.him} privately what is going on', hours: 1, kind: 'ask', way: 'ask' },
      around: { label: 'Ask around the crew what they know', hours: 0.5, kind: 'ask', way: 'around' },
      cards: { label: "Pull {a.his} timecards for the last two months", hours: 0.5, kind: 'ask', way: 'look' },
      document: { label: 'Write it up: the discipline steps', hours: 1.5, kind: 'hold', fits: ['attitude'], needs: 'supervisor' },
      accommodate: { label: 'Offer {a.him} a later start time', hours: 0.5, kind: 'fix', fits: ['childcare'], needs: 'supervisor' },
      carpool: { label: 'Sort out a ride on {a.his} road', hours: 1, kind: 'fix', fits: ['ride'] },
      remind: { label: 'Say it at the huddle: on time means on time, for everyone', hours: 0.25, kind: 'soft', holds: true },
    },
  },
  rework: {
    label: 'Rework',
    causes: { untrained: 0.4, rushing: 0.25, fixture: 0.15, newJig: 0.2 },
    passing: 'newJig',
    stories: {},
    names: { untrained: 'never shown how', rushing: 'going too fast', fixture: 'the fixture', newJig: 'the new jig' },
    find: { trust: [0.3, 0.8], ask: { truth: { untrained: [0, 0.6], rushing: [0, 0.5], fixture: [0.8, 0], newJig: [0.8, 0] }, cover: ['fixture', 'newJig'] }, around: { from: [{ who: 'senior', truth: { untrained: 0.5, rushing: 0.5, fixture: 0.4, newJig: 0.5 } }, { who: 'donna', truth: { untrained: 0.3, rushing: 0.5, fixture: 0.4, newJig: 0.3 }, bias: ['rushing', 'fixture'], biasP: 0.5 }] }, look: { name: 'a morning watching', rules: 2 } },
    actions: {
      investigate: { label: 'Watch {a.him} weld for a morning', hours: 3, kind: 'ask', way: 'look' },
      askHim: { label: 'Ask {a.him} what is going wrong with the welds', hours: 0.5, kind: 'ask', way: 'ask' },
      askAround: { label: 'Ask {senior} and finish what they see', hours: 0.5, kind: 'ask', way: 'around' },
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
    names: { unowned: 'others\' work', personal: 'something at home', crunch: 'a heavy month' },
    find: { trust: [0.3, 0.8], ask: { truth: { unowned: [0.5, 0.3], personal: [-0.1, 0.9], crunch: [0.9, 0] }, cover: ['crunch', 'unowned'], told: true }, around: { from: [{ who: 'senior', truth: { unowned: 0.6, personal: 0.3, crunch: 0.5 } }, { who: 'donna', truth: { unowned: 0.4, personal: 0.25, crunch: 0.4 }, bias: ['crunch', 'personal'], biasP: 0.4 }, { who: 'brent', truth: { unowned: 0.4, personal: 0.2, crunch: 0.4 } }] }, look: { name: 'a week of the desk', rules: 1 } },
    actions: {
      talk: { label: 'Take {a.him} for a coffee and ask', hours: 1, kind: 'ask', way: 'ask' },
      askAround: { label: 'Ask the crew what lands on {a.him}', hours: 0.5, kind: 'ask', way: 'around' },
      watchDesk: { label: 'Watch what lands on {a.his} desk for a week', hours: 1, kind: 'ask', way: 'look' },
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
    names: { workload: 'too much work', personal: 'between them', roles: 'whose job', badWeek: 'a bad week' },
    find: { trust: [0.3, 0.8], ask: { truth: { workload: [0.5, 0.4], personal: [-0.1, 0.8], roles: [0.15, 0.4], badWeek: [0.9, 0] }, cover: ['workload', 'badWeek'], told: true }, around: { from: [{ who: 'senior', truth: { workload: 0.45, personal: 0.3, roles: 0.35, badWeek: 0.4 }, bias: ['workload', 'roles'], biasP: 0.4 }, { who: 'joel', truth: { workload: 0.3, personal: 0.4, roles: 0.2, badWeek: 0.3 }, bias: ['personal', 'badWeek'], biasP: 0.4 }, { who: 'brent', truth: { workload: 0.4, personal: 0.3, roles: 0.3, badWeek: 0.4 } }] }, look: { name: 'the handoff', rules: 2 } },
    actions: {
      separate: { label: 'Talk to each of them on their own', hours: 2, kind: 'ask', way: 'ask' },
      askAround: { label: 'Ask the crew what sets them off', hours: 0.5, kind: 'ask', way: 'around' },
      watchHandoff: { label: 'Watch the handoff between them for a morning', hours: 2, kind: 'ask', way: 'look' },
      reset: { label: 'Sit them down and reset the work', hours: 1.5, kind: 'fix', fits: ['workload', 'badWeek'] },
      clarify: { label: 'Write down who owns what between them', hours: 3, kind: 'fix', fits: ['roles'] },
      expectations: { label: 'Set out how people treat each other', hours: 1, kind: 'fix', fits: ['personal'] },
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
    names: { pin: 'worn pins', setup: 'the setup', steel: 'fab\'s parts', batch: 'this batch' },
    find: { trust: [0.3, 0.8], ask: { truth: { pin: [0.5, 0], setup: [0, 0.6], steel: [0.4, 0], batch: [0.6, 0] }, cover: ['steel', 'pin'] }, around: { from: [{ who: 'senior', truth: { pin: 0.5, setup: 0.4, steel: 0.3, batch: 0.5 } }, { who: 'raymond', truth: { pin: 0.2, setup: 0.1, steel: 0.6, batch: 0.3 }, bias: ['setup', 'pin'], biasP: 0.5 }] }, look: { name: 'a morning on the jig', rules: 2 } },
    actions: {
      investigate: { label: 'A morning finding out why it keeps moving', hours: 3, kind: 'ask', way: 'look' },
      askHer: { label: 'Ask {a} what {a.he} thinks keeps moving it', hours: 0.5, kind: 'ask', way: 'ask' },
      askAround: { label: 'Ask {senior} and Raymond in fabrication', hours: 0.5, kind: 'ask', way: 'around' },
      fixYourself: { label: 'Re-square the jig yourself again', hours: 2, kind: 'yourself' },
      leadFix: { label: 'Have {senior} re-square it', hours: 0.5, kind: 'yourself' },
      workOrder: { label: 'Work order: replace the locating pins', hours: 0.5, kind: 'fix', fits: ['pin'] },
      standardWork: { label: 'Write the setup down with the crew', hours: 4, kind: 'fix', fits: ['setup'] },
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
      check: { label: 'Check whose call this is', hours: 1, kind: 'ask' },
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
    names: { pressure: 'the schedule', spec: 'no written standard', unaware: 'painters don\'t know', newHire: 'the new painter' },
    find: { trust: [0.3, 0.8], ask: { who: 'theresa', truth: { pressure: [0, 0.6], spec: [0.3, 0.5], unaware: [0.1, 0.4], newHire: [0.9, 0] }, cover: ['newHire', 'spec'], told: true }, around: { from: [{ who: 'val', truth: { pressure: 0.3, spec: 0.5, unaware: 0.3, newHire: 0.4 }, bias: ['spec', 'unaware'], biasP: 0.5 }, { who: 'jess', truth: { pressure: 0.45, spec: 0.2, unaware: 0.2, newHire: 0.3 }, bias: ['pressure', 'newHire'], biasP: 0.4 }] }, look: { name: 'the tickets', rules: 2 } },
    actions: {
      talkPeer: { label: 'Go and talk to Theresa', hours: 1, kind: 'ask', way: 'ask' },
      askAround: { label: 'Ask Val and Jess what they see at the door', hours: 0.5, kind: 'ask', way: 'around' },
      tickets: { label: 'Lay a month of kickback tickets side by side', hours: 1, kind: 'ask', way: 'look' },
      writeStandard: { label: 'Write a spatter standard with Theresa and Val', hours: 3, kind: 'fix', fits: ['spec'] },
      handoff: { label: 'Rework the handoff times with Theresa', hours: 2, kind: 'fix', fits: ['pressure'] },
      showHer: { label: 'Show Theresa the tickets side by side', hours: 1, kind: 'fix', fits: ['unaware'] },
      complain: { label: 'Take it to Dana', hours: 0.5, kind: 'up' },
      matchThem: { label: 'Send whatever paint will take', hours: 0, kind: 'soft' },
    },
  },
  // ---- beta 4: Where it waits (B1)
  constraint: {
    label: 'Where it waits',
    causes: { fit: 0.3, weld: 0.25, finish: 0.25, mix: 0.2 },
    passing: 'mix',
    stories: {},
    names: { fit: 'fit-up', weld: 'body weld', finish: 'finish', mix: 'the mix' },
    find: { ask: { who: 'senior', band: false, truth: { fit: [0.4, 0], weld: [0.35, 0], finish: [0.4, 0], mix: [0.5, 0] }, cover: ['weld', 'fit'] }, around: { from: [{ who: 'jess', truth: { fit: 0.35, weld: 0.35, finish: 0.4, mix: 0.4 }, bias: ['finish', 'weld'], biasP: 0.5 }, { who: 'donna', truth: { fit: 0.25, weld: 0.25, finish: 0.45, mix: 0.25 }, bias: ['fit', 'weld'], biasP: 0.5 }] }, look: { name: 'a morning watching', rules: 2 } },
    actions: {
      look: { label: 'A morning watching where work waits', hours: 2, kind: 'ask', way: 'look' },
      askAround: { label: 'Ask Jess and Donna where the work piles up', hours: 0.5, kind: 'ask', way: 'around' },
      improveFit: { label: 'Improve fit-up: a second jig set-up, the rack sorted', hours: 4, kind: 'fix', fits: ['fit'] },
      improveWeld: { label: 'Improve body weld: fixtures, wire feed, a spare stinger', hours: 4, kind: 'fix', fits: ['weld'] },
      improveFinish: { label: 'Improve finish: a second inspection bench', hours: 4, kind: 'fix', fits: ['finish'] },
      askCrew: { label: 'Ask the crew where the problem is', hours: 0.5, kind: 'ask', way: 'ask' },
    },
  },
  // ---- beta 4: Monday, 7:00 (F1)
  huddle: {
    label: 'The huddle',
    causes: { habit: 0.3, parts: 0.3, unheard: 0.25, newRoute: 0.15 },
    passing: 'newRoute',
    stories: { parts: { habit: 0.3 } },
    names: { habit: 'just habit', parts: 'the parts', unheard: 'not heard', newRoute: 'the new route' },
    find: { trust: [0.3, 0.8], ask: { who: 'brent', truth: { habit: [0, 0.4], parts: [0.8, 0], unheard: [0, 0.7], newRoute: [0.8, 0] }, cover: ['parts', 'newRoute'], told: true }, around: { from: [{ who: 'senior', truth: { habit: 0.5, parts: 0.4, unheard: 0.4, newRoute: 0.5 } }, { who: 'tyler', truth: { habit: 0.5, parts: 0.3, unheard: 0.2, newRoute: 0.3 }, bias: ['habit', 'unheard'], biasP: 0.6 }] }, look: { name: 'a week of mornings', rules: 2 } },
    actions: {
      talk: { label: 'Catch Brent after the huddle and ask', hours: 0.5, kind: 'ask', way: 'ask' },
      askAround: { label: 'Ask {senior} and Tyler about Brent at the huddle', hours: 0.5, kind: 'ask', way: 'around' },
      checkRack: { label: 'Check the parts rack and the board every morning for a week', hours: 0.5, kind: 'ask', way: 'look' },
      parkingLot: { label: 'Put up a parking lot and hold the five minutes', hours: 1, kind: 'fix', fits: ['habit'] },
      fixParts: { label: 'Take the parts to Raymond, and say so at the huddle', hours: 1, kind: 'fix', fits: ['parts'] },
      giveFloor: { label: 'Give Brent the first minute, every day', hours: 0.5, kind: 'fix', fits: ['unheard'] },
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
    names: { untaught: 'never taught why', afraid: 'afraid to ask', rushed: 'racing the rack', settling: 'settling in' },
    find: { trust: [0.25, 0.75], ask: { truth: { untaught: [0.3, 0.4], afraid: [-0.2, 0.8], rushed: [0.4, 0.3], settling: [0.8, 0] }, cover: ['settling', 'rushed'] }, around: { from: [{ who: 'senior', truth: { untaught: 0.5, afraid: 0.3, rushed: 0.4, settling: 0.5 } }, { who: 'brent', truth: { untaught: 0.25, afraid: 0.15, rushed: 0.5, settling: 0.3 }, bias: ['settling', 'untaught'], biasP: 0.4 }] }, look: { name: 'an hour at the table', rules: 2 } },
    actions: {
      watch: { label: 'Sit with {a.him} at the table for an hour and watch', hours: 1, kind: 'ask', way: 'look' },
      askHim: { label: 'Ask {a.him} how it is going', hours: 0.5, kind: 'ask', way: 'ask' },
      askAround: { label: 'Ask {senior} and Brent how {a.hes} getting on', hours: 0.5, kind: 'ask', way: 'around' },
      teach: { label: 'Teach {a.him} the job, and why', hours: 2, kind: 'fix', fits: ['untaught'] },
      pair: { label: 'Pair {a.him} with {senior} this week, and say why', hours: 0.5, kind: 'fix', fits: ['afraid'] },
      slowDown: { label: 'Take the rack off {a.him}; speed comes later', hours: 0.5, kind: 'fix', fits: ['rushed'] },
      sheet: { label: 'Hand {a.him} the fit-up sheet and the drawing', hours: 0.25, kind: 'soft' },
      fixHis: { label: 'Fix {a.his} brackets yourself after hours', hours: 2, kind: 'yourself' },
      document: { label: 'Write up the scrapped brackets', hours: 1, kind: 'hold', needs: 'supervisor' },
    },
  },
  // ---- beta 14: Pulled off the floor rebuilt (A4 + D1): why the lead is not ready
  bench: {
    label: 'The bench',
    causes: { unshown: 0.3, unseen: 0.25, wontAsk: 0.25, ready: 0.2 },
    passing: 'ready',
    stories: { wontAsk: { unshown: 0.4 } },
    names: { unshown: 'never shown', unseen: 'crew doesn\'t follow', wontAsk: 'won\'t ask', ready: 'ready' },
    find: { trust: [0.3, 0.8], ask: { truth: { unshown: [0.6, 0.3], unseen: [0, 0.6], wontAsk: [-0.1, 0.7], ready: [0.9, 0] }, cover: ['unshown', 'ready'], told: true }, around: { from: [{ who: 'brent', truth: { unshown: 0.3, unseen: 0.45, wontAsk: 0.25, ready: 0.4 }, bias: ['unshown', 'unseen'], biasP: 0.4 }, { who: 'donna', truth: { unshown: 0.2, unseen: 0.4, wontAsk: 0.4, ready: 0.5 } }] }, look: { name: 'a morning watching', rules: 2 } },
    actions: {
      ask: { label: 'Sit down with {a.him}: what worries {a.him} about the three weeks', hours: 1, kind: 'ask', way: 'ask' },
      askAround: { label: 'Ask Brent and Donna how the crew sees {a}', hours: 0.5, kind: 'ask', way: 'around' },
      watchMorning: { label: 'Watch a morning: who the crew goes to, and what {a} decides', hours: 1.5, kind: 'ask', way: 'look' },
      handover: { label: "Hand {a.him} Jess's numbers and the huddle, and sit beside {a.him} the first time", hours: 1.5, kind: 'fix', fits: ['unshown'] },
      announce: { label: 'Say it at the huddle with {a.him} beside you, and stop re-deciding what {a.he} decides', hours: 0.5, kind: 'fix', fits: ['unseen'] },
      steps: { label: 'Walk {a.him} through the hard conversations, step by step', hours: 1.5, kind: 'fix', fits: ['wontAsk'] },
      sheet: { label: 'Write {a.him} a handover sheet', hours: 1, kind: 'hold' },
      doItAll: { label: 'Get everything done yourself before you go', hours: 3, kind: 'yourself' },
      callMe: { label: 'Tell {a.him} to call you with anything', hours: 0.25, kind: 'soft' },
    },
  },
  // ---- beta 7: The other side (E2 + C3): your own bodies, from paint's side
  otherside: {
    label: 'Your own bodies, from the other side',
    causes: { wire: 0.3, rushing: 0.25, noStandard: 0.3, careful: 0.15 },
    passing: 'careful',
    stories: { wire: { rushing: 0.3 } },
    actions: {
      lookPaint: { label: "A morning on paint's side, with the kickback tickets", hours: 2, kind: 'ask' },
      sendBack: { label: 'Send your own bodies back to your own crew', hours: 0.5, kind: 'hold' },
      fixInPaint: { label: 'Have paint sand it, like Theresa does', hours: 1, kind: 'yourself' },
      swapWire: { label: 'Go back to the old wire', hours: 0.5, kind: 'fix', fits: ['wire'] },
      slowTyler: { label: 'Take Tyler off the roofs for a week and show him', hours: 1, kind: 'fix', fits: ['rushing'] },
      writeStandard: { label: 'Write the spatter standard with Val', hours: 3, kind: 'fix', fits: ['noStandard'] },
      checkPaint: { label: "Go and check from paint's side that it held", hours: 1, kind: 'ask' },
      waveThrough: { label: 'Wave them through; Theresa can sort it', hours: 0, kind: 'soft' },
    },
  },
  // ---- beta 8: Who you work for (E4): what paint actually needs from welding
  customer: {
    label: 'What paint needs',
    causes: { timing: 0.3, order: 0.25, info: 0.25, theirs: 0.2 },
    passing: 'theirs',
    stories: { timing: { order: 0.3 } },
    names: { timing: 'the time of day', order: 'the order', info: 'the paperwork', theirs: 'paint\'s own' },
    find: { trust: [0.3, 0.8], ask: { who: 'theresa', truth: { timing: [0.5, 0.3], order: [0.6, 0.2], info: [0.4, 0.3], theirs: [0, 0.6] }, cover: ['order', 'timing'], told: true }, around: { from: [{ who: 'jess', truth: { timing: 0.35, order: 0.45, info: 0.25, theirs: 0.25 }, bias: ['order', 'theirs'], biasP: 0.5 }, { who: 'val', truth: { timing: 0.25, order: 0.2, info: 0.45, theirs: 0.35 }, bias: ['info', 'timing'], biasP: 0.4 }] }, look: { name: 'paint\'s door', rules: 2 } },
    actions: {
      askPaint: { label: 'Ask Theresa what paint needs, in her words', hours: 1, kind: 'ask', way: 'ask' },
      askAround: { label: 'Ask Jess and Val what paint complains about', hours: 0.5, kind: 'ask', way: 'around' },
      door: { label: "Stand at paint's door for a morning: what arrives, when, with what", hours: 2, kind: 'ask', way: 'look' },
      fixTiming: { label: 'Move the handoff to two o\'clock', hours: 1, kind: 'fix', fits: ['timing'] },
      fixOrder: { label: "Send bodies in the schedule's order", hours: 0.5, kind: 'fix', fits: ['order'] },
      fixInfo: { label: 'Fill in every traveller before the door', hours: 1, kind: 'fix', fits: ['info'] },
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
    names: { board: 'the plan', travellers: 'the drawings', youAnswer: 'you answer', newMix: 'the new models' },
    find: { trust: [0.3, 0.8], ask: { who: 'senior', band: false, truth: { board: [0.5, 0], travellers: [0.4, 0], youAnswer: [0.25, 0], newMix: [0.5, 0] }, cover: ['board', 'newMix'] }, around: { from: [{ who: 'jess', truth: { board: 0.35, travellers: 0.35, youAnswer: 0.25, newMix: 0.35 }, bias: ['board', 'youAnswer'], biasP: 0.4 }, { who: 'donna', truth: { board: 0.3, travellers: 0.3, youAnswer: 0.35, newMix: 0.3 }, bias: ['travellers', 'board'], biasP: 0.4 }] }, look: { name: 'the tally', rules: 2 } },
    actions: {
      tally: { label: 'Keep a tally for a week: who asks what', hours: 1, kind: 'ask', way: 'look' },
      askKev: { label: 'Ask {senior} why the crew comes to you', hours: 0.5, kind: 'ask', way: 'ask' },
      askAround: { label: 'Ask Jess and Donna what people are asking for', hours: 0.5, kind: 'ask', way: 'around' },
      board: { label: "The day's plan and the revs on the board, every morning", hours: 1, kind: 'fix', fits: ['board'] },
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
    names: { lateEntries: 'late entries', wrongOps: 'the routing', noIssue: 'material not issued', upgrade: 'the upgrade' },
    find: { trust: [0.3, 0.8], ask: { who: 'senior', truth: { lateEntries: [0, 0.6], wrongOps: [0.4, 0], noIssue: [0.4, 0], upgrade: [0.6, 0] }, cover: ['upgrade', 'wrongOps'] }, around: { from: [{ who: 'jess', truth: { lateEntries: 0.45, wrongOps: 0.4, noIssue: 0.3, upgrade: 0.4 }, bias: ['lateEntries', 'noIssue'], biasP: 0.5 }, { who: 'val', truth: { lateEntries: 0.2, wrongOps: 0.3, noIssue: 0.4, upgrade: 0.3 } }] }, look: { name: 'the trace', rules: 2 } },
    actions: {
      trace: { label: 'Trace one job through {erp} with Jess, screen by screen', hours: 2, kind: 'ask', way: 'look' },
      askKev: { label: 'Ask {senior} how the crew enters it', hours: 0.5, kind: 'ask', way: 'ask' },
      askAround: { label: 'Ask Jess and Val where the numbers go wrong', hours: 0.5, kind: 'ask', way: 'around' },
      clockNow: { label: 'Clock every operation the day it happens, and show them why', hours: 1.5, kind: 'fix', fits: ['lateEntries'] },
      fixOps: { label: 'Get Ben to fix the Hauler job sequence', hours: 1, kind: 'fix', fits: ['wrongOps'] },
      issueMaterial: { label: 'Issue the steel to the jobs when it is cut', hours: 1, kind: 'fix', fits: ['noIssue'] },
      ownSheet: { label: 'Keep your own spreadsheet and give Jess that', hours: 1, kind: 'yourself' },
      blame: { label: 'Tell Dana {erp} is wrong', hours: 0.5, kind: 'up' },
    },
  },
  // ---- beta 9: It looked great for a week (B2): the 5S event, a week on
  lean: {
    label: 'It looked great for a week',
    causes: { noOwner: 0.3, noAudit: 0.25, forThem: 0.25, moveIn: 0.2 },
    passing: 'moveIn',
    stories: { forThem: { noOwner: 0.3 } },
    actions: {
      ask: { label: 'Walk the bay with the crew and ask', hours: 1, kind: 'ask' },
      owners: { label: 'Put a name on every area, chosen by the crew', hours: 1, kind: 'fix', fits: ['noOwner'] },
      audit: { label: 'A five-minute Friday audit with each owner', hours: 1, kind: 'fix', fits: ['noAudit'] },
      redoWith: { label: 'Re-run the event with the crew deciding', hours: 4, kind: 'fix', fits: ['forThem'] },
      redoFor: { label: 'Re-run the event yourself on Saturday', hours: 6, kind: 'yourself' },
      signs: { label: 'New labels and a memo', hours: 0.5, kind: 'soft' },
    },
  },
  // ---- beta 11: Round two (B7): the flow rounds, from the plane exercise
  flow: {
    label: 'The flow rounds',
    causes: { batch: 0.27, push: 0.27, late: 0.26, fine: 0.2 },
    passing: 'fine',
    // a pile of WIP is ambiguous: the first read of a round is sometimes the wrong rule
    stories: { batch: { push: 0.2 }, push: { batch: 0.2 }, late: { batch: 0.2 } },
    actions: {
      // the crew has a view of which rule hurts (more checking, always); the round has the evidence
      askCrew: { label: 'Ask the crew which rule is hurting', hours: 0.5, kind: 'ask' },
      readRound: { label: 'Read the round: where WIP piles, where defects are found', hours: 2, kind: 'ask' },
      batchOne: { label: 'Batch of one: each set goes on as soon as it is done', hours: 2, kind: 'fix', fits: ['batch'], needs: 'supervisor' },
      pull: { label: 'Two-slot rack: fit-up builds only into an empty slot', hours: 2, kind: 'fix', fits: ['push'], needs: 'supervisor' },
      checkSource: { label: 'Each station checks its own before passing it on', hours: 2, kind: 'fix', fits: ['late'], needs: 'supervisor' },
      all: { label: 'Change all three rules this week', hours: 5, kind: 'yourself', needs: 'supervisor' },
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
