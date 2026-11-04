// The Supervisor track: eight modules. Logic-free.
//
// A module is a brief, a goal, a setup, a main problem (or a goal of its own), a
// background problem drawn per seed, scripted cards by week, a pool of requests,
// and a debrief. Effects use the language in src/engine/effects.js. Text uses
// the tokens in src/engine/text.js. Everything here is fiction; nobody in it is
// a real person.
//
// Debrief questions are written for Shift around what happens in the run; they
// draw on the themes of the Northbound handbook modules named in `handbook`,
// in the author's register, without copying the handbook.

// ---------------------------------------------------------------- requests
// The kind of thing that lands in a supervisor's inbox. `cue` is what a careful
// reader gets from the text (deadline, people, safety, pressure, optional); the
// bots read it, the player reads the words.
const R = {
  appraisals: {
    id: 'appraisals', cue: 'deadline', seats: ['supervisor'], title: 'Four appraisals due',
    body: "Marion's office sent the second reminder Monday. Four appraisals for your crew, due at the end of the month. Done properly they take the better part of an hour each, and the people getting them can tell when they weren't.",
    options: [
      { id: 'do', label: 'Do them properly this week', hours: 3, kind: 'do', effects: [{ trust: 0.03, who: 'all' }], score: [['D1', 1, 'Kept a promise to HR and the crew']] },
      { id: 'later', label: 'Push them to next month', hours: 0, kind: 'skip', effects: [{ floorLoad: { label: "HR's follow-up on the appraisals you pushed off", hours: 2, inWeeks: 2 } }, { queue: { weeks: 2, effects: [{ managerTrust: -0.06 }], line: "Marion's office copied Dana on the third reminder about your appraisals." }, because: 'You put the appraisals off' }] },
    ],
  },
  engReview: {
    id: 'engReview', cue: 'deadline', title: 'Engineering wants a welder to look at a drawing',
    body: "Ben in manufacturing engineering has a revised fixture for the Drayman Crew cab and wants a welder's eye on it before it goes to the toolroom. An hour and a half at his bench. He asked nicely, which with Ben means it matters.",
    options: [
      { id: 'do', label: 'Go and look at it with him', hours: 1.5, kind: 'do', effects: [{ line: 'You found a clamp that sits right where the torch has to go on the B-pillar seam. Ben took the drawing back and thanked you twice.' }], score: [['E2', 2, 'Gave engineering a welder before it was too late']] },
      { id: 'skip', label: 'Tell him it looks fine from here', hours: 0, kind: 'skip', effects: [{ queue: { weeks: 2, effects: [{ defects: 1 }], line: 'The new Drayman Crew fixture arrived. The clamp on the B-pillar seam sits right where the torch has to go, and the welds there show it.', trace: 'trace.fixture' }, because: 'You skipped the fixture review' }] },
    ],
  },
  vendorDemo: {
    id: 'vendorDemo', cue: 'optional', title: 'A wire rep wants an afternoon',
    body: 'A rep from the wire supplier wants two hours to show you a new flux-core. He is bringing coffee. Nobody asked for it.',
    options: [
      { id: 'do', label: 'Give him the two hours', hours: 2, kind: 'do', effects: [{ line: 'The coffee was good. The wire is the same wire on a nicer spool.' }] },
      { id: 'skip', label: 'Ask him to email the spec sheet', hours: 0, kind: 'skip' },
    ],
  },
  townHall: {
    id: 'townHall', cue: 'optional', seats: ['supervisor', 'lead', 'manager'], title: "Irene's town hall",
    body: "The COO is doing a town hall in the lunchroom Thursday, an hour. Attendance is 'encouraged', which everyone reads differently.",
    options: [
      { id: 'do', label: 'Go', hours: 1, kind: 'do', effects: [{ managerTrust: 0.02 }] },
      { id: 'skip', label: 'Stay on the floor', hours: 0, kind: 'skip' },
    ],
  },
  joelGauge: {
    id: 'joelGauge', cue: 'people', who: 'joel', title: '{c} has a question he has been sitting on',
    body: "{c} caught you at the coffee machine. He isn't sure he's reading the gap gauge right on the finish checks, and he doesn't want to ask Donna a third time. Doing it properly at the bench is an hour.",
    options: [
      { id: 'do', label: 'Show him at the bench', hours: 1, kind: 'do', effects: [{ skill: 0.05, who: 'joel' }, { trust: 0.05, who: 'joel' }], score: [['D4', 2, 'Answered a new hand at the bench']] },
      { id: 'skip', label: 'Tell him to ask Donna', hours: 0, kind: 'skip', effects: [{ floorLoad: { label: 'Rework on finish checks Joel was not sure about', hours: 1, weeks: 2 } }, { trust: -0.03, who: 'joel' }, { line: "{c} didn't ask Donna. He didn't ask anyone." }], score: [['D4', -1, "Sent a new hand's question somewhere else"]] },
    ],
  },
  kevVacation: {
    id: 'kevVacation', cue: 'people', seats: ['supervisor'], who: 'kev', title: "{c}'s vacation request",
    body: "{c} wants the last week of the month off for his daughter's wedding. He needs an answer so he can book, and it means sorting out cover at fit-up. Half an hour, if you do it now.",
    options: [
      { id: 'do', label: 'Sort the cover and say yes', hours: 0.5, kind: 'do', effects: [{ morale: 0.05, who: 'kev' }, { trust: 0.05, who: 'kev' }] },
      { id: 'skip', label: 'Say you will get back to him', hours: 0, kind: 'skip', effects: [{ floorLoad: { label: "Sorting Kev's vacation cover in a hurry", hours: 1 } }, { morale: -0.05, who: 'kev' }, { trust: -0.04, who: 'kev' }, { line: '{c} asked again on Thursday, more carefully than the first time.' }] },
    ],
  },
  jessForecast: {
    id: 'jessForecast', cue: 'deadline', seats: ['supervisor'], title: 'Jess needs next month from you',
    body: 'Jess is building next month around the Rescue order and wants your honest number for each week, not the hopeful one. An hour with the sheet.',
    options: [
      { id: 'do', label: 'Give her the honest numbers', hours: 1, kind: 'do' },
      { id: 'skip', label: 'Tell her to use last month', hours: 0, kind: 'skip', effects: [{ demand: 1, inWeeks: 2 }, { floorLoad: { label: "Re-planning the week Jess built on last month's numbers", hours: 2, inWeeks: 2 } }, { line: "Jess built the month on last month's number. Paint will want an extra body in two weeks." }] },
    ],
  },
  supplierCall: {
    id: 'supplierCall', cue: 'optional', title: 'The gas supplier wants a call',
    body: "The gas supplier wants an hour to 'review the account'. Purchasing owns the account.",
    options: [
      { id: 'do', label: 'Take the call', hours: 1, kind: 'do' },
      { id: 'skip', label: 'Point them at purchasing', hours: 0, kind: 'skip' },
    ],
  },
  eyewash: {
    id: 'eyewash', cue: 'safety', title: 'An action from the safety committee',
    body: "Last month's safety committee left you one action: check the eyewash station by booth one. It has been on the list for three weeks.",
    options: [
      { id: 'do', label: 'Check it today', hours: 0.5, kind: 'do', effects: [{ safetyDebt: -0.01 }, { line: 'The eyewash bottles were out of date. You swapped them.' }], score: [['C2', 1, 'Closed a safety action']] },
      { id: 'skip', label: 'Leave it on the list', hours: 0, kind: 'skip', effects: [{ safetyDebt: 0.01 }] },
    ],
  },
  paintCall: {
    id: 'paintCall', cue: 'pressure', title: 'Theresa wants half an hour',
    body: 'Two bodies went over Monday with spatter in the drip rail. Theresa wants half an hour, and she would like it today.',
    options: [
      { id: 'do', label: 'Go over to paint', hours: 0.5, kind: 'do', effects: [{ peerTrust: 0.03 }] },
      { id: 'skip', label: 'Send her an email', hours: 0, kind: 'skip', effects: [{ peerTrust: -0.04 }, { floorLoad: { label: 'The email thread with paint that should have been a conversation', hours: 1 } }] },
    ],
  },
  danaPage: {
    id: 'danaPage', cue: 'deadline', seats: ['supervisor'], title: 'Dana wants a page on overtime',
    body: 'Russ asked Dana why welding overtime went up last quarter, so Dana is asking you. One page, by Thursday.',
    options: [
      { id: 'do', label: 'Write it', hours: 1.5, kind: 'do', effects: [{ managerTrust: 0.05 }] },
      { id: 'skip', label: 'Tell her you are slammed', hours: 0, kind: 'skip', effects: [{ managerTrust: -0.06 }, { floorLoad: { label: 'Dana asking about the overtime page, again', hours: 1, weeks: 2 } }] },
    ],
  },
};
// The operations manager's inbox (seats: manager).
const M = {
  russPage: {
    id: 'russPage', cue: 'deadline', seats: ['manager'], title: 'Russ wants a page on welding overtime',
    body: "Irene asked Russ why welding overtime went up last quarter, so Russ is asking you. One page by Thursday, and he'd like it to say something.",
    options: [
      { id: 'do', label: 'Write it, with Kev\'s numbers', hours: 1.5, kind: 'do', effects: [{ managerTrust: 0.05 }] },
      { id: 'skip', label: 'Tell him next week', hours: 0, kind: 'skip', effects: [{ managerTrust: -0.06 }, { floorLoad: { label: 'Russ asking about the overtime page, again', hours: 1, weeks: 2 } }] },
    ],
  },
  halBorrow: {
    id: 'halBorrow', cue: 'pressure', seats: ['manager'], title: 'Hal wants to borrow a welder',
    body: "Hal is short in assembly this week and wants one of Kev's welders for three days. He asked you, not Kev, which is how Hal asks.",
    options: [
      { id: 'do', label: 'Lend one, and tell Kev before Hal does', hours: 0.5, kind: 'do', effects: [{ capacity: -0.6 }, { peerTrust: 0.05 }] },
      { id: 'skip', label: 'Not this week', hours: 0, kind: 'skip', effects: [{ peerTrust: -0.05 }] },
    ],
  },
  coreyDate: {
    id: 'coreyDate', cue: 'deadline', seats: ['manager'], title: 'Corey wants a date for the county',
    body: "Corey has the county on the phone and wants a delivery date for two Rescues. He would like the date he already told them. An honest one takes an hour with Jess and Kev.",
    options: [
      { id: 'do', label: 'Give him the honest date', hours: 1, kind: 'do', effects: [{ line: 'Corey took the honest date badly and the customer took it fine.' }] },
      { id: 'skip', label: 'Give him the date he wants', hours: 0, kind: 'skip', effects: [{ demand: 1, inWeeks: 2 }, { line: "Corey's date went to the county. In two weeks paint will want an extra body for it." }] },
    ],
  },
};
const pool = (...ids) => ids.map((id) => R[id] || M[id]);

// ---------------------------------------------------------------- the track
export const TRACK = {
  id: 'supervisor',
  title: 'Supervisor track',
  intro: "You run the welding department at Northern Motors: seven people, three stations, and a paint department that wants six bodies a week. Each module is a few weeks of that job. Nobody tells you the right answer, because there usually isn't one; there is what you knew, what you did, and what it did.",
  introManager: "You're the operations manager for the Metal side at Northern Motors: fabrication, machining, welding and paint. Kev runs welding. Everything on his floor reaches you through him, and your four moves are to ask him, tell him, go down yourself, or leave it with him. What he can do without you at the end is the number that matters.",
  introLead: "You're the lead hand in welding at Northern Motors: fit-up is your table, six people ask you first, and Kev, who had your job until spring, is the supervisor. Every hour you lead comes off the table. Nobody tells you the right answer; there is what you knew, what you did, what you took to Kev, and what it did.",
  modules: ['the-week', 'late-one', 'loop', 'firefighting', 'pulled', 'upstairs', 'rush', 'across', 'waits', 'monday', 'newhand', 'otherside', 'customers', 'sayitonce', 'system'],
};

export const MODULES = {
  // -------------------------------------------------------------------- 1
  'the-week': {
    title: 'The week', focus: ['A1', 'A2'], seats: ['supervisor', 'lead'], notManager: "the inbox in it is a supervisor's",
    leadBrief: "Kev got the supervisor's job in the spring and you got his: lead hand, fit-up, and the first person everyone asks. The inbox is smaller than Kev's and it still does not fit beside twenty-four hours at the table.", handbook: '2: When everything is urgent, nothing is strategic', weeks: 6, goal: 'main',
    teaches: 'Time, priorities, and what you refuse',
    brief: [
      "It's Monday and the inbox is already full. Appraisals, a drawing from engineering, a rep with free coffee, a page Dana wants by Thursday. None of it is unreasonable on its own, and all of it together is about fifty hours.",
      "In among it, Joel said something on his way past your door this morning: the fume extractor over booth three has been making a noise since last week, and the smoke isn't pulling the way it should. Tyler's on booth three. Joel said it the way new people say things, quietly and once.",
      'You have forty hours, give or take. The floor will take a good part of that before you choose anything.',
    ],
    goalText: 'Get through six weeks with paint fed, nobody hurt or gone, and the extractor dealt with properly.',
    lose: ['Paint short of five bodies two weeks running', 'Anyone hurt, or anyone quitting', 'Three weeks in a row over 55 hours'],
    setup: {},
    main: { type: 'hazard', who: ['tyler'], seen: true, week: 1 },
    second: { weeks: [3, 4], not: [] },
    cards: [],
    pool: { perWeek: [2, 3], cards: pool('appraisals', 'engReview', 'vendorDemo', 'townHall', 'joelGauge', 'kevVacation', 'jessForecast', 'supplierCall', 'eyewash', 'paintCall', 'danaPage') },
    debrief: {
      questions: [
        'Which three cards did you spend the most hours on? Would you pick the same three again, knowing how it went?',
        'When did you first do something about the extractor? What else was on your plate that week?',
        'Which requests did you refuse? Which refusal cost you something, and which cost nothing at all?',
        'How many hours did the floor take before you chose anything? What on your real floor takes those hours?',
        'If you protected two hours next week for something that is not urgent, what would it be?',
      ],
      commitment: 'One thing I will refuse or hand off this week, and one thing I will protect time for:',
    },
  },

  // -------------------------------------------------------------------- 2
  'late-one': {
    title: 'The late one', focus: ['D2'], seats: ['supervisor', 'lead', 'manager'],
    managerBrief: "You're the operations manager. Kev runs welding now, and Brent's late mornings came up at Tuesday's production meeting, from Theresa, not from Kev. Kev had noticed. He hadn't decided what to do, and he was hoping you wouldn't ask.",
    leadBrief: "You're the lead hand now; Kev is the supervisor. Brent is late and you can see it, and the crew can see you seeing it. Whatever the discipline steps are, they are Kev's to take. What you bring him is yours.", handbook: '7: Culture is what you tolerate under pressure', weeks: 8, goal: 'main',
    teaches: 'Accountability that fits the reason',
    brief: [
      "It's the first week of March. The Drayman line is running ahead for once, and the Surveyor Rescue that ships at the end of the month is the one Russ asks about every morning before he has his coat off.",
      "Brent has been late three times in two weeks. The second time, nobody said anything, so by the third time it had started to look like a pattern to everyone except Brent. Tyler noticed. Tyler notices most things Brent does.",
      "You don't know why yet. You might not like the answer when you do.",
    ],
    goalText: 'Brent on time for a reason that holds, nobody lost, and paint fed for eight weeks.',
    lose: ['Paint short two weeks running', 'Losing a person', 'Three weeks over 55 hours'],
    setup: {},
    main: { type: 'late', who: ['brent'], seen: true, week: 1 },
    second: { weeks: [3, 5], not: ['late'] },
    cards: [],
    pool: { perWeek: [0, 1], cards: pool('vendorDemo', 'townHall', 'joelGauge', 'jessForecast', 'supplierCall', 'paintCall', 'russPage', 'halBorrow') },
    debrief: {
      questions: [
        'What did Brent tell you, and when? What would you have needed to see to know whether it was true?',
        'Who else on the crew was watching how you handled it? What did they learn from it?',
        'If you wrote it up: what did it cost you? If you did not: what did that cost?',
        'Where on your own floor is a standard held for some people and not others?',
        'What will you say, in your own words, the next time someone is late for the third time?',
      ],
      commitment: 'One standard I will hold the same way for everyone, and the words I will use:',
    },
  },

  // -------------------------------------------------------------------- 3
  loop: {
    title: 'The loop', focus: ['D3'], seats: ['supervisor', 'lead', 'manager'],
    managerBrief: "You're the operations manager. The thing between Marisol and Donna is Kev's to settle, and he has mentioned it to you twice in the voice people use when they want someone else to settle it.",
    leadBrief: "You're the lead hand; Kev is the supervisor and he's in the office more than on the floor. The thing between Marisol and Donna happens three metres from your table, every day, and nobody has told Kev about it.", handbook: '7: Culture is what you tolerate under pressure', weeks: 8, goal: 'main',
    teaches: 'Conflict that keeps coming back',
    brief: [
      "Marisol and Donna aren't speaking, or they're speaking in the way that's worse than not. Marisol's bodies come back from finish with more red tags than they did a month ago, and she says Donna's been picking at her. Donna says she's been doing her job.",
      "It isn't loud yet. It's in the way Marisol leaves the cart a foot short of the finish bench and Donna walks the extra foot without a word. Joel is new enough to think this is how it always is.",
      'Every few days it flares. Every few days it goes quiet again. That is the part to worry about.',
    ],
    goalText: 'The thing between them settled at the root, both of them still here, and paint fed for eight weeks.',
    lose: ['Paint short two weeks running', 'Losing either of them, or anyone else', 'Three weeks over 55 hours'],
    setup: {},
    main: { type: 'friction', who: ['marisol', 'donna'], seen: true, week: 1 },
    second: { weeks: [3, 5], not: ['friction'] },
    cards: [],
    pool: { perWeek: [0, 1], cards: pool('vendorDemo', 'townHall', 'kevVacation', 'jessForecast', 'supplierCall', 'eyewash', 'russPage', 'coreyDate') },
    debrief: {
      questions: [
        'What did each of them tell you? Where did their stories agree?',
        'Did you ever tell them both to knock it off? What happened two weeks later?',
        'What was the friction actually about: the work, the people, or nobody owning the space between them?',
        'Where on your real floor is there a conflict that flares and goes quiet on a cycle?',
        'What would it take to fix the cause, not the flare?',
      ],
      commitment: 'One recurring friction I will get to the bottom of, and how I will start:',
    },
  },

  // -------------------------------------------------------------------- 4
  firefighting: {
    title: 'Firefighting', focus: ['B3'], seats: ['supervisor', 'lead', 'manager'],
    managerBrief: "You're the operations manager. Kev re-squares that jig himself every week and is a little proud of it. You could re-square it yourself, faster. You were the welding supervisor once.",
    leadBrief: "You're the lead hand, and the jig is yours to re-square; Kev used to do it and now he asks you to. He means it as a compliment.", handbook: '1: Firefighting is a leadership failure, not a badge of honour', weeks: 8, goal: 'main',
    teaches: 'Fixing the fire, or the thing that keeps lighting it',
    brief: [
      "The jig on body weld two keeps walking. Not much: a millimetre and a half by Wednesday, enough that Marisol's seams on the Hauler roof start to wander and Donna starts tagging them. You know how to fix it. You've re-squared that jig more times than you've had lunch at the table.",
      "It takes you a couple of hours each time, and every time you do it, it feels like work, because it is. It is also the same work as last week, and the week before.",
      'This time, the question is whether you fix it again.',
    ],
    goalText: 'The jig staying square for a reason, nobody lost, and paint fed for eight weeks.',
    lose: ['Paint short two weeks running', 'Losing a person', 'Three weeks over 55 hours'],
    setup: {},
    main: { type: 'recurring', who: ['marisol'], seen: true, week: 1 },
    second: { weeks: [3, 5], not: ['rework'] },
    cards: [],
    pool: { perWeek: [0, 1], cards: pool('vendorDemo', 'joelGauge', 'kevVacation', 'jessForecast', 'paintCall', 'danaPage', 'halBorrow', 'coreyDate') },
    debrief: {
      questions: [
        'How many times did you fix the jig yourself before you went after why it moved?',
        'What did fixing it yourself feel like? What did it buy you, and what did it cost?',
        'If you went after the cause: who did you need, and did you go to them or around them?',
        'Name a fire on your own floor that you have put out more than three times this year.',
        'If you were off for two weeks, which fires would start the first morning?',
      ],
      commitment: 'One recurring problem I will solve at the root this month, and the first step:',
    },
  },

  // -------------------------------------------------------------------- 5
  pulled: {
    title: 'Pulled off the floor', focus: ['A4', 'D1'], seats: ['supervisor'], onlySupervisor: 'it is about leaving the lead in charge', notManager: 'it is about a supervisor leaving his lead in charge', handbook: '6: Leaders build leaders, not just output', weeks: 8, goal: 'held',
    teaches: 'The bench: what you built before you left',
    brief: [
      'The customer audit is in three weeks, and Dana has put you on the team. For weeks three, four and five you will be in a room with a binder and an auditor most of every day. You will see the floor at lunch, if you eat lunch.',
      "Kev will run the department. Kev is a very good welder and a very good lead, and he has never once run the department, because you have always been there. He knows that. He hasn't said it.",
      'You have two weeks to make the floor need you less.',
    ],
    goalText: 'The floor holding while you are away: nothing blowing up from week three on, Kev still standing, nobody lost, paint fed.',
    lose: ['Paint short two weeks running', 'Losing a person', 'Anything blowing up from week three on', 'Kev buckling under it'],
    setup: { meetings: { 3: 18, 4: 18, 5: 18 } },
    main: null,
    second: { weeks: [3, 3], not: [], avoid: ['kev'] },
    cards: [
      { id: 'scheduler', week: 1, cue: 'develop', who: 'kev', title: "{c} could take Jess's numbers",
        body: "Every week you give Jess the capacity numbers. It's an hour, and it's the hour that tells you what next week looks like. {c} has watched you do it a hundred times. He has never done it.",
        options: [
          { id: 'teach', label: 'Sit with him and hand it over', hours: 1.5, kind: 'delegate', effects: [{ bench: 0.15 }, { removeRoutine: 'scheduler' }, { morale: 0.03, who: 'kev' }], score: [['A4', 2, 'Handed over a real piece of the job']] },
          { id: 'keep', label: 'Keep doing it yourself', hours: 0, kind: 'keep', score: [['A4', -1, 'Kept a piece of the job only you can do']] },
        ] },
      { id: 'huddles', week: 1, cue: 'develop', who: 'kev', title: 'Let {c} run the huddles',
        body: 'The morning huddle is yours. Five minutes, every day. If {c} runs it, the crew starts looking at him first in the morning, which is the point.',
        options: [
          { id: 'teach', label: 'Run the first two together, then hand it over', hours: 1, kind: 'delegate', effects: [{ bench: 0.15 }, { removeRoutine: 'huddles' }], score: [['A4', 2, 'Let the lead lead']] },
          { id: 'keep', label: 'Keep running them', hours: 0, kind: 'keep', score: [['A4', -1, 'Kept a piece of the job only you can do']] },
        ] },
      { id: 'steps', week: 2, cue: 'develop', who: 'kev', title: 'Walk {c} through the hard conversations',
        body: "If someone is late three times while you're in the audit room, {c} is who they'll be late to. He doesn't know the steps, and he doesn't want to get them wrong in front of the crew.",
        options: [
          { id: 'teach', label: 'Walk him through how you handle it', hours: 1.5, kind: 'delegate', effects: [{ bench: 0.15 }, { flag: 'kevSteps' }], score: [['D1', 2, 'Prepared the lead for the hard part']] },
          { id: 'keep', label: 'Tell him to call you', hours: 0, kind: 'keep', score: [['A4', -1, 'Planned to be reachable instead of replaceable']] },
        ] },
      { id: 'cross', week: 2, cue: 'develop', who: 'marisol', title: 'Show {c} the finish checks',
        body: "If Donna's off while you're away, finish slows to a crawl. {c} could cover the checks with an hour of showing.",
        options: [
          { id: 'teach', label: 'Show her', hours: 1, kind: 'delegate', effects: [{ bench: 0.05 }, { skill: 0.03, who: 'marisol' }], score: [['A4', 1, 'Saw what only you were holding']] },
          { id: 'keep', label: 'Hope Donna stays healthy', hours: 0, kind: 'keep' },
        ] },
      { id: 'announce', week: 2, cue: 'develop', who: 'kev', title: 'Tell the crew who is in charge',
        body: "The crew knows you'll be busy. They don't know what that means for them. Ten minutes at the huddle with {c} standing beside you would settle it.",
        options: [
          { id: 'teach', label: 'Say it at the huddle with him there', hours: 0.5, kind: 'delegate', effects: [{ bench: 0.1 }], score: [['A4', 2, 'Made the handover visible']] },
          { id: 'keep', label: 'Let them work it out', hours: 0, kind: 'keep', effects: [{ bench: -0.05 }] },
        ] },
    ],
    pool: { perWeek: [0, 1], cards: pool('townHall', 'jessForecast', 'supplierCall', 'paintCall') },
    debrief: {
      questions: [
        'What did you hand Kev before you left? What did you keep, and why?',
        'Which problem came up while you were away, and who dealt with it?',
        'If nothing went wrong: was it the bench, or was it luck? How would you tell?',
        'On your real floor, who could run your area for three weeks starting tomorrow?',
        'What is the one piece of your job you would hand over first?',
      ],
      commitment: 'The person I am developing toward my job, and the first real piece I will hand them:',
    },
  },

  // -------------------------------------------------------------------- 6
  upstairs: {
    title: 'Nobody upstairs', focus: ['E1'], seats: ['supervisor'], onlySupervisor: "the decisions in it are a supervisor's", notManager: 'you are the one who is away in it', handbook: '4: Ownership without authority creates friction; 8: Leading up', weeks: 8, goal: 'main',
    teaches: 'Decision rights: what is yours, and what is not',
    brief: [
      'Dana is off for five weeks: a knee, done properly this time. Russ is covering her departments on top of his own, which means Russ is covering nothing very closely.',
      "On Monday Corey from sales came down the aisle with a change for a Surveyor Rescue: the customer wants the light bar mount moved four inches. There's no drawing yet. Corey has already promised the date. He'd like you to just do it.",
      "You might be allowed to. You might not. Nobody upstairs is going to tell you which unless you ask the right person, and Russ answers email on Fridays.",
    ],
    goalText: 'The Rescue change settled by whoever owns it, nobody lost, paint fed, and Dana coming back to nothing she has to undo.',
    lose: ['Paint short two weeks running', 'Losing a person', 'Three weeks over 55 hours', 'Leaving it for Dana to sort out'],
    setup: { managerAway: [1, 5], managerBack: 6 },
    main: { type: 'escalation', who: [], seen: true, week: 1 },
    second: { weeks: [3, 5], not: [] },
    cards: [
      { id: 'saturday', week: 2, cue: 'notYours', title: 'Saturday for the Rescue?',
        body: "A Saturday with three welders would put the Rescue back on its date. Overtime past eight hours a week needs a manager's signature under the overtime policy. Dana isn't here; Russ is, technically.",
        options: [
          { id: 'sign', label: 'Approve it yourself and sort it out later', hours: 0.5, kind: 'decide', effects: [{ capacity: 1.2 }, { morale: -0.02, who: 'all' }, { queue: { weeks: 4, effects: [{ managerTrust: -0.1 }], line: 'Dana found the Saturday on the payroll report her first week back. She asked who signed it.', trace: 'trace.saturday' }, because: 'You signed overtime that needed a manager' }], score: [['E1', -1, 'Signed what was not yours to sign']] },
          { id: 'russ', label: 'Put it to Russ today', hours: 0.5, kind: 'ask', effects: [{ chance: 0.6, then: [{ capacity: 1.2 }, { line: 'Russ signed the Saturday on Thursday night. Nobody complained about the overtime.' }], else: [{ line: "Russ didn't get to the Saturday request until Monday. The Saturday came and went." }] }], score: [['E1', 2, 'Used the chain while Dana was away']] },
          { id: 'no', label: 'No Saturday', hours: 0, kind: 'skip' },
        ] },
      { id: 'swap', week: 3, cue: 'yours', who: 'lyle', title: '{c} wants to swap two days',
        body: "{c} wants to trade two days with a fabricator for a family thing. Raymond's fine with it. Swaps inside the same pay band are a supervisor's call; the policy says so in as many words.",
        options: [
          { id: 'yes', label: 'Approve it', hours: 0.25, kind: 'decide', effects: [{ morale: 0.05, who: 'lyle' }], score: [['E1', 2, 'Made the call that was yours']] },
          { id: 'russ', label: 'Check with Russ first', hours: 0.5, kind: 'ask', effects: [{ morale: -0.03, who: 'lyle' }, { line: "Russ wrote back on Friday: 'Why are you asking me this?'" }], score: [['E1', -1, 'Sent up a call that was yours']] },
          { id: 'no', label: 'Say no', hours: 0, kind: 'skip', effects: [{ morale: -0.06, who: 'lyle' }, { trust: -0.05, who: 'lyle' }] },
        ] },
      { id: 'scrap', week: 4, cue: 'notYours', title: 'Scrap it or weld it?',
        body: "A Hauler roof panel came over from fab with a crease in it. Raymond says weld it, it'll paint out. Val is on vacation. Scrap calls belong to QC, and QC has a backup who is slow but exists.",
        options: [
          { id: 'weld', label: 'Weld it and move on', hours: 0, kind: 'decide', effects: [{ chance: 0.5, then: [{ defects: 0.6 }, { line: "The crease didn't paint out. Theresa sent it back with a photo." }], else: [{ line: 'It painted out. Mostly.' }] }], score: [['E1', -1, "Made QC's call for them"]] },
          { id: 'hold', label: "Hold it for QC's backup", hours: 0, kind: 'ask', effects: [{ capacity: -0.3 }, { line: "The panel sat on the rack until QC's backup signed it off Thursday afternoon." }], score: [['E1', 2, 'Left the call with the people who own it']] },
        ] },
    ],
    pool: { perWeek: [0, 1], cards: pool('vendorDemo', 'joelGauge', 'jessForecast', 'supplierCall', 'eyewash') },
    debrief: {
      questions: [
        'For each decision that came to you: whose was it? How did you find out, and how long did that take?',
        'Did you ever go around someone? What did it get you, and what did it cost you with them?',
        'Did Dana come back to anything she had to undo?',
        'On your real floor, which decisions are yours that you send up anyway? Which do you make that are not yours?',
        'What would you put in writing so the next supervisor does not have to guess?',
      ],
      commitment: 'One decision I will stop sending up, and one I will stop making that is not mine:',
    },
  },

  // -------------------------------------------------------------------- 7
  rush: {
    title: 'Rush week', focus: ['C1'], seats: ['supervisor', 'lead'], notManager: 'the shortcuts in it are offered at the booth',
    leadBrief: "You're the lead hand. The shortcuts get offered to you first, at the table, in the tone of people doing you a favour. Saturdays are Kev's to approve; what slides on a Tuesday afternoon is yours.", handbook: '7: Culture is what you tolerate under pressure', weeks: 8, goal: 'standard',
    teaches: 'Holding the standard when the number is short',
    brief: [
      'Corey landed the county: four Surveyor Rescues, delivered before the fire season, which means weeks two through five. A Rescue is half again the welding of a Drayman. Paint will want seven or eight bodies a week and you make six on a good one.',
      "The crew is up for it. That's the trouble with good crews: they'll offer to skip things to make the number, and they'll mean it kindly, and some of the things they offer to skip are the reason nobody's been hurt in four years.",
      'Whatever you let slide in the rush is the rule in June.',
    ],
    goalText: 'Through the rush with the standard still held, nobody hurt or gone, and paint fed close enough (90%).',
    lose: ['Paint short two weeks running', 'Anyone hurt or gone', 'The standard slipping below what it was'],
    setup: { demand: { 2: 7, 3: 8, 4: 8, 5: 7 }, weldContent: { 2: 1.25, 3: 1.3, 4: 1.3, 5: 1.2 }, scheduleShare: 0.9 },
    main: null,
    second: { weeks: [5, 6], not: [] },
    cards: [
      { id: 'tack', week: 2, cue: 'shortcut', who: 'brent', title: '{c} wants to skip the tack check',
        body: "{c} says the tack check on the Rescue cab costs twenty minutes a body and he's never seen one fail. He isn't wrong about the twenty minutes.",
        options: [
          { id: 'allow', label: 'Let it go for the rush', hours: 0, kind: 'allow', effects: [{ capacity: 0.35 }, { standard: -0.12 }, { flag: 'tackSkipped' }], score: [['C1', -1, 'Let a check go to make the number']] },
          { id: 'hold', label: 'Keep the check and tell him why', hours: 0.5, kind: 'hold', effects: [{ standard: 0.03 }, { morale: -0.02, who: 'brent' }], score: [['C1', 2, 'Held the check under pressure']] },
        ] },
      { id: 'ot2', week: 2, cue: 'overtime', title: 'Saturday?',
        body: 'A Saturday with three welders is a body and a bit. It is also a Saturday.',
        options: [
          { id: 'yes', label: 'Run Saturday (you will be there)', hours: 5, kind: 'overtime', needs: 'supervisor', effects: [{ capacity: 1.2 }, { morale: -0.03, who: 'all' }, { stress: 0.5, who: 'kev' }] },
          { id: 'no', label: 'No Saturday this week', hours: 0, kind: 'no' },
        ] },
      { id: 'lunch', week: 3, cue: 'shortcut', who: 'brent', title: 'The crew offers to weld through lunch',
        body: "{c} says the crew would rather weld through lunch this week and take it Friday. They mean it kindly. It's thirty degrees in the bay.",
        options: [
          { id: 'allow', label: 'Let them', hours: 0, kind: 'allow', effects: [{ capacity: 0.4 }, { standard: -0.06 }, { safetyDebt: 0.01 }, { morale: -0.03, who: 'all' }], score: [['C1', -1, 'Let them skip the break in the heat']] },
          { id: 'hold', label: 'Thank them and keep lunch', hours: 0.25, kind: 'hold', effects: [{ morale: 0.02, who: 'all' }, { standard: 0.02 }], score: [['C1', 2, 'Kept the break and said thank you']] },
        ] },
      { id: 'ot3', week: 3, cue: 'overtime', title: 'Saturday again?',
        body: 'Paint wants eight. Another Saturday is a body and a bit, and it is the second one.',
        options: [
          { id: 'yes', label: 'Run Saturday', hours: 5, kind: 'overtime', needs: 'supervisor', effects: [{ capacity: 1.2 }, { morale: -0.04, who: 'all' }, { stress: 0.5, who: 'kev' }] },
          { id: 'no', label: 'No Saturday', hours: 0, kind: 'no' },
        ] },
      { id: 'sleeves', week: 3, cue: 'shortcut', who: 'tyler', title: "{c}'s welding in a T-shirt",
        body: "It's thirty-one degrees in the bay and {c} has his sleeves off at booth three. Nobody's said anything, which means everybody has noticed.",
        options: [
          { id: 'hold', label: 'Say something now', hours: 0.25, kind: 'hold', effects: [{ standard: 0.04 }, { morale: -0.02, who: 'tyler' }], score: [['C1', 2, 'Said something the first time']] },
          { id: 'allow', label: "Leave it, it's hot", hours: 0, kind: 'allow', effects: [{ standard: -0.1 }, { safetyDebt: 0.02 }], score: [['C1', -1, 'Let PPE go because it was hot']] },
        ] },
      { id: 'spatter', week: 4, cue: 'shortcut', title: 'Paint will take some spatter, this once',
        body: 'Theresa says paint will take bodies with light spatter this week and sand it themselves. It saves your finish crew most of an hour a body.',
        options: [
          { id: 'allow', label: 'Take the deal', hours: 0, kind: 'allow', effects: [{ capacity: 0.5 }, { standard: -0.08 }, { escapeAdd: 0.1 }] },
          { id: 'writing', label: 'Take it for this order only, in writing', hours: 0.5, kind: 'hold', effects: [{ capacity: 0.5 }, { standard: -0.02 }], score: [['C1', 2, 'Made the exception visible and temporary']] },
          { id: 'hold', label: 'Keep finishing to standard', hours: 0, kind: 'hold', effects: [{ standard: 0.02 }] },
        ] },
      { id: 'ot4', week: 4, cue: 'overtime', title: 'A third Saturday?',
        body: 'Kev has stopped saying anything about Saturdays, which is how you know.',
        options: [
          { id: 'yes', label: 'Run Saturday', hours: 5, kind: 'overtime', needs: 'supervisor', effects: [{ capacity: 1.2 }, { morale: -0.05, who: 'all' }, { stress: 1, who: 'kev' }] },
          { id: 'no', label: 'No Saturday', hours: 0, kind: 'no' },
        ] },
      { id: 'gauges', week: 5, cue: 'shortcut', title: 'The gauges are due for calibration',
        body: "The weld gauges are due for calibration this week. It takes them off the floor for a day. Nobody would know if they went next month. You'd know.",
        options: [
          { id: 'hold', label: 'Send them', hours: 0.5, kind: 'hold', effects: [{ capacity: -0.2 }, { standard: 0.04 }], score: [['C1', 1, 'Kept the calibration date']] },
          { id: 'allow', label: 'Next month', hours: 0, kind: 'allow', effects: [{ standard: -0.08 }] },
        ] },
      { id: 'after', week: 6, cue: 'shortcut', ifFlag: 'tackSkipped', who: 'brent', title: 'The tack check never came back',
        body: "The rush is over. The tack check didn't come back with it. {c} says nobody's missed it.",
        options: [
          { id: 'hold', label: 'Bring it back at the huddle', hours: 0.5, kind: 'hold', effects: [{ standard: 0.08 }, { morale: -0.02, who: 'all' }], score: [['C1', 2, 'Took back an exception when the rush ended']] },
          { id: 'allow', label: 'Leave it gone', hours: 0, kind: 'allow', effects: [{ standard: -0.05 }, { defects: 0.4 }] },
        ] },
    ],
    pool: { perWeek: [0, 1], cards: pool('townHall', 'supplierCall', 'kevVacation') },
    debrief: {
      questions: [
        'Which shortcuts did you allow? Which did you hold? What did the crew see you do?',
        'What was the standard at the end compared with the start? What moved it?',
        'Which shortcut came back after the rush, and who brought it back?',
        'On your real floor, what slipped during the last busy stretch and never came back?',
        'What will you say the next time a good crew offers to skip something for you?',
      ],
      commitment: 'One standard I will hold the same on the worst day as on a normal one, and how I will show it:',
    },
  },

  // -------------------------------------------------------------------- 8
  across: {
    title: 'Across', focus: ['E2'], seats: ['supervisor', 'manager'], onlySupervisor: 'it is supervisor to supervisor',
    managerBrief: "You're the operations manager, and both departments are yours: Kev's welding and Theresa's paint. Two of your supervisors keep two standards and neither has sat down with the other, because there has always been you between them, and you have always sorted it.", handbook: '8: Leading at every level: horizontally', weeks: 8, goal: 'main',
    teaches: 'Peers: going across before going up',
    brief: [
      "Paint kicks back your bodies for spatter. Some days. On other days the same spatter sails through. Your crew has noticed which days are which, and they've started sending the marginal ones when Theresa's on the line and holding them when her lead is.",
      "Theresa runs paint. You like her well enough. You've never once sat down with her about anything, because there's always been Dana between you, and Dana has always sorted it.",
      "Two departments with two standards don't stay that way. They become one department with no standard.",
    ],
    goalText: 'One standard both departments hold, settled with Theresa, nobody lost, and paint fed.',
    lose: ['Paint short two weeks running', 'Losing a person', 'Three weeks over 55 hours'],
    setup: {},
    main: { type: 'standards', who: [], seen: true, week: 1 },
    second: { weeks: [3, 5], not: [] },
    cards: [],
    pool: { perWeek: [0, 1], cards: pool('vendorDemo', 'townHall', 'joelGauge', 'jessForecast', 'danaPage', 'russPage', 'halBorrow') },
    debrief: {
      questions: [
        'Did you talk to Theresa before you talked to Dana? What did each conversation get you?',
        'What was behind the two standards: pressure, no written standard, or something she did not know?',
        "What did your own crew learn while the standards didn't match?",
        'Where on your real floor do two departments hold two different standards?',
        'Who is the peer you have never sat down with, and what is the first thing you would put on the table?',
      ],
      commitment: 'One peer I will sit down with, and the one thing we need to agree on:',
    },
  },

  // -------------------------------------------------------------------- 9 (beta 4)
  waits: {
    title: 'Where it waits', focus: ['B1'], seats: ['supervisor', 'lead', 'manager'],
    managerBrief: "You're the operations manager, and paint being short is your number as much as Kev's. Russ has asked twice. Everyone upstairs says body weld, and Kev says it too, and nobody has stood in the aisle.",
    leadBrief: "You're the lead hand. Kev has told you to put real hours into fixing it and that he'll back whatever you find, which is generous, and means the hours come off your table.", handbook: '1: Firefighting is a leadership failure, not a badge of honour', weeks: 8, goal: 'main',
    teaches: 'Finding the station that limits everything, and only fixing that one',
    brief: [
      "Paint has been getting five bodies a week against the six it asks for, and it has been that way long enough that everyone has stopped asking why. They know why. It's body weld. Brent says it, Dana says it, Theresa says it with the sigh she keeps for welding.",
      "Dana has told you to put real hours into fixing it this month, and she's told Russ you will. The hours are yours to spend: on fit-up, on the booths, on finish. Four hours of improvement buys about ten percent at whichever station you give it to.",
      'Nobody has stood in the aisle for a morning and watched where the work actually stops. The number does not say. The opinions do not count.',
    ],
    goalText: 'Paint fed for eight weeks with the real constraint found and fixed, not the loudest one, and nobody lost.',
    lose: ['Paint short two weeks running', 'Losing a person', 'Three weeks over 55 hours'],
    setup: {},
    main: { type: 'constraint', who: [], seen: true, week: 1 },
    second: { weeks: [4, 6], not: [] },
    cards: [],
    pool: { perWeek: [0, 1], cards: pool('vendorDemo', 'townHall', 'jessForecast', 'supplierCall', 'danaPage', 'russPage', 'halBorrow') },
    debrief: {
      questions: [
        'Where did you put your first four improvement hours, and what did you know when you put them there?',
        'What did a morning of watching tell you that the Friday number could not?',
        'If you fixed the constraint and it moved: how did you find out, and how long did that take?',
        'On your real floor, which station does everyone say is the bottleneck? When did anyone last watch where the work waits?',
        'What would you improve tomorrow if you had four hours, and how sure are you that it is the constraint?',
      ],
      commitment: 'One morning this month I will spend watching where the work waits, and what I will do with what I see:',
    },
  },

  // -------------------------------------------------------------------- 10 (beta 4)
  monday: {
    title: 'Monday, 7:00', focus: ['F1'], seats: ['supervisor', 'lead'], notManager: "the huddle is Kev's to run",
    leadBrief: "You're the lead hand, and the huddle is yours: Kev handed it over in the spring and stands at the back when he's there at all.", handbook: '2: When everything is urgent, nothing is strategic', weeks: 8, goal: 'main',
    teaches: 'Five minutes, every action with an owner, and the derailer handled without losing the room',
    brief: [
      "The huddle is at seven, at the board by fit-up, five minutes. That was the idea. For about a month it has been fifteen, and most of the extra is Brent: the brackets, the forklift route, the brackets again. By ten past, Lyle is looking at his boots and Joel is looking at Lyle.",
      "It isn't a disaster. The day just starts late and a bit sour, every day, and the board hasn't been touched since the audit. Dana has started saying 'your huddle' in a tone.",
      'Nobody is going to tell you why Brent does it. You could ask him.',
    ],
    goalText: 'The huddle back to five minutes for a reason that holds, the crew still here, and paint fed for eight weeks.',
    lose: ['Paint short two weeks running', 'Losing a person', 'Three weeks over 55 hours'],
    setup: {},
    main: { type: 'huddle', who: [], seen: true, week: 1 },
    second: { weeks: [4, 6], not: ['friction'], avoid: ['brent'] },
    cards: [
      { id: 'ontime', week: 1, cue: 'huddle', who: 'tyler', title: "{c} isn't at the board at seven",
        body: "Seven o'clock and six people at the board. {c} is in the lot, finishing something on his phone. Everyone can see him through the door.",
        options: [
          { id: 'start', label: 'Start without him', hours: 0, kind: 'hold', effects: [{ morale: -0.02, who: 'tyler' }], score: [['F1', 2, 'Started on time']] },
          { id: 'wait', label: 'Wait for him', hours: 0, kind: 'allow', effects: [{ morale: -0.01, who: 'all' }, { line: "You waited. {c} came in at four past. The huddle started at five past and ran accordingly." }], score: [['F1', -1, 'Waited for the late one']] },
        ] },
      { id: 'owner', week: 2, cue: 'huddle', who: 'donna', title: '{c} raises the gap gauge at the huddle',
        body: "{c} says the gap gauge on finish checks is reading different from the one at the booths, and has been for a week. Four people have an opinion about it, standing there.",
        options: [
          { id: 'own', label: 'Give it an owner and a time: Donna, by lunch, tell me what she finds', hours: 0.25, kind: 'hold', effects: [{ line: '{c} came back at lunch: the booth gauge had been dropped. Val swapped it that afternoon.' }], score: [['F1', 2, 'Gave it an owner and a time']] },
          { id: 'solve', label: 'Sort it out right there, standing up', hours: 1.5, kind: 'allow', effects: [{ morale: -0.02, who: 'all' }, { line: 'You sorted the gauge standing at the board. It took twenty-five minutes and seven people.' }], score: [['F1', -1, 'Solved it standing up, with everyone watching']] },
          { id: 'note', label: 'Note it and move on', hours: 0, kind: 'skip', effects: [{ queue: { weeks: 2, effects: [{ defects: 0.6 }], line: "The gap gauge thing never got an owner. Two bodies went to paint a hair out and came back." }, because: 'A problem raised at the huddle got a note instead of an owner' }], score: [['F1', -1, 'Noted it and moved on; nobody owned it']] },
        ] },
      { id: 'silent', week: 3, cue: 'huddle', who: 'lyle', title: "{c} hasn't said a word in a huddle in a month",
        body: "{c} stands at the back and says nothing, every morning. He's the best jig man in the plant. You could ask him for one thing, by name.",
        options: [
          { id: 'ask', label: 'Ask him, by name, for one thing', hours: 0.25, kind: 'hold', effects: [{ trust: 0.06, who: 'lyle' }, { line: "{c}, asked by name, said the locating pins on table two have been loose for a month. He'd been waiting for someone to ask." }], score: [['F1', 2, 'Asked the quiet one, by name']] },
          { id: 'leave', label: 'Let him be; some people are quiet', hours: 0, kind: 'skip', effects: [{ queue: { weeks: 3, effects: [{ capacity: -0.5 }], line: "Table two's locating pins let go on Wednesday. Lyle had known for a month. Nobody asked." }, because: 'The quiet one was never asked' }] },
        ] },
      { id: 'dana', week: 4, cue: 'huddle', seats: ['supervisor'], title: 'Dana wants a quality review in the huddle',
        body: "Dana would like fifteen minutes of quality numbers added to the huddle, daily, 'while everyone's there anyway.' She has the slides ready.",
        options: [
          { id: 'no', label: 'Keep the huddle five minutes; offer her Thursday afternoon instead', hours: 0.5, kind: 'hold', effects: [{ managerTrust: -0.02 }, { line: "Dana took Thursday afternoon, after a pause you could hear." }], score: [['F1', 2, 'Kept the huddle a huddle']] },
          { id: 'yes', label: 'Add it; she is the manager', hours: 0, kind: 'allow', effects: [{ managerTrust: 0.02 }, { floorLoad: { label: 'The twenty-minute huddle, every day', hours: 2, weeks: 4 } }, { morale: -0.03, who: 'all' }], score: [['F1', -1, 'Let the huddle become a meeting']] },
        ] },
      { id: 'board', week: 5, cue: 'huddle', title: "The board hasn't been updated since the audit",
        body: "The board by fit-up still shows March. The huddle happens in front of it and nobody looks at it, which is fair.",
        options: [
          { id: 'fix', label: 'Put the board back in the huddle: yesterday, today, one problem', hours: 1, kind: 'hold', effects: [{ capacity: 0.2 }, { line: 'The board shows this week now. Marisol pointed at it on Wednesday without being asked.' }], score: [['F1', 2, 'Ran the huddle from the board, not from memory']] },
          { id: 'leave', label: 'Leave it; the huddle works without it', hours: 0, kind: 'skip' },
        ] },
      { id: 'safetyRaised', week: 6, cue: 'huddle', who: 'joel', title: '{c} mentions the crane hook, at the huddle, quietly',
        body: "{c} says, not quite to anyone, that the crane hook latch is sticking. It's seven-oh-three and there are four other things on the board.",
        options: [
          { id: 'park', label: 'Stop the huddle: Kev tags the crane now, the rest of the board waits', hours: 0.25, kind: 'hold', effects: [{ safetyDebt: -0.01 }, { trust: 0.05, who: 'joel' }, { line: '{senior} red-tagged the crane at 7:05. Maintenance had the latch sorted by ten.' }], score: [['C2', 2, 'Stopped the huddle for a safety item'], ['F1', 2, 'Gave the safety item an owner before anything else']] },
          { id: 'after', label: 'Finish the board, then deal with it', hours: 0.5, kind: 'allow', effects: [{ safetyDebt: 0.01 }, { line: 'The crane got looked at after the huddle. Nobody used it in between, probably.' }], score: [['C2', 0, 'Dealt with a safety item after the board']] },
          { id: 'list', label: 'Add it to the list', hours: 0, kind: 'skip', effects: [{ safetyDebt: 0.03 }, { trust: -0.05, who: 'joel' }], score: [['C2', -1, 'Put a sticking crane latch on a list']] },
        ] },
    ],
    pool: { perWeek: [0, 1], cards: pool('vendorDemo', 'townHall', 'supplierCall', 'jessForecast') },
    debrief: {
      questions: [
        'What did Brent tell you when you asked him away from the board? Would you have guessed it?',
        'Which things raised at the huddle got an owner and a time? Which got solved standing up, and what did that cost the other six people?',
        'Did you ever wait for the late one, or shut the loud one down? What did the crew learn from each?',
        'On your real floor: how long does your huddle run, and who talks? Who never does?',
        'What is the one rule you would hold for your huddle, in words the crew would recognise?',
      ],
      commitment: 'One rule for my huddle I will hold every morning this month, and how the crew will know:',
    },
  },

  // -------------------------------------------------------------------- 11 (beta 4)
  newhand: {
    title: 'The new hand', focus: ['D4'], seats: ['supervisor', 'lead', 'manager'],
    managerBrief: "You're the operations manager. Sam is Kev's hire, in Lyle's spot, and the scrap bin is Kev's to notice. You walked past it on Wednesday and he hadn't.",
    leadBrief: "You're the lead hand, and Sam is at the table beside you all day. Kev asked you to 'keep an eye on him', which is what supervisors say when they mean train him.", handbook: '6: Leaders build leaders, not just output', weeks: 8, goal: 'main',
    teaches: 'Teaching the task and the reason, and checking it landed',
    brief: [
      "Lyle is on parental leave until the summer, and Sam started Monday in his spot at fit-up. Sam is twenty-three, came off a farm shop where he welded everything that broke, and has good hands. Nobody doubts the hands.",
      "By Wednesday three brackets were in the scrap bin and Kev had quietly redone a jig before the booths saw it. Sam hasn't asked anyone anything. New people don't, mostly, and the ones who leave in the first ninety days are the ones nobody sat with.",
      'You have eight weeks. The scrap bin is not the problem; it is where the problem shows.',
    ],
    goalText: 'Sam still here and making brackets that go straight to the booths, for a reason you can name; nobody lost; paint fed for eight weeks.',
    lose: ['Paint short two weeks running', 'Losing a person, Sam included', 'Three weeks over 55 hours'],
    setup: {
      swap: { out: 'lyle', in: { id: 'sam', name: 'Sam', full: 'Sam Toews', pronoun: 'he', skill: 0.3, morale: 0.7, trust: 0.45,
        look: { skin: 0, hair: 'messy', hairColour: 2, beard: false, build: 'lean' },
        about: 'Fit-up. Started Monday, in Lyle\'s spot while Lyle is on leave. Off a farm shop; good hands, no idea where anything is, and not asking.' } },
    },
    main: { type: 'newhand', who: ['sam'], seen: true, week: 1 },
    second: { weeks: [4, 6], not: ['rework'], avoid: ['lyle', 'sam'] },
    cards: [],
    pool: { perWeek: [0, 1], cards: pool('vendorDemo', 'townHall', 'joelGauge', 'jessForecast', 'eyewash', 'russPage', 'coreyDate') },
    debrief: {
      questions: [
        'What did an hour at the table tell you about Sam that the scrap bin could not?',
        'If you taught him: did you teach the steps or the reasons? How did you check it landed?',
        'What did Sam see you do with his first mistakes, and what did that teach him about the next ones?',
        'On your real floor: who sat with the last new hire in their first week? For how long?',
        'What would you want someone to have told you in your first week, that nobody did?',
      ],
      commitment: 'What the next new hire on my floor gets in their first week, and who sits with them:',
    },
  },

  // -------------------------------------------------------------------- 12 (beta 7)
  otherside: {
    title: 'The other side', focus: ['E2', 'C3'], seats: ['supervisor'], onlySupervisor: "it is about covering a peer's floor", notManager: 'both floors are already yours', handbook: '8: Leading at every level: horizontally', weeks: 8, goal: 'main',
    teaches: "Receiving what you send: four weeks running paint, with your own bodies coming back through the door",
    brief: [
      "Theresa is away for four weeks from next Monday: a wedding, a honeymoon, the first holiday she has taken in six years. Dana has asked you to cover paint as well as welding. Not run it, exactly. Be the person the paint crew brings things to.",
      "What the paint crew brings Theresa, most mornings, is welding's bodies. Spatter in the drip rail. A seam that needs a pass with the grinder before it will take primer. You have heard about it from Theresa for a year, in the tone you had filed under paint being paint.",
      "From Monday it lands on your desk, with your crew's names on the tickets. You can send it back. You can sand it. You can find out why it is happening, now that you stand on both sides of the door.",
    ],
    goalText: "Paint fed and your own spatter settled at the root before Theresa is back, with nobody lost and paint's week covered.",
    lose: ['Paint short two weeks running', 'Losing a person', 'Three weeks over 55 hours', 'Theresa coming back to a month of your bodies she has to sort out'],
    setup: { meetings: { 2: 6, 3: 6, 4: 6, 5: 6 }, meetingsLabel: "Paint's week", covering: "You are covering paint this week as well as welding: six hours of paint's standing week, and paint's kickback tickets come to you." },
    main: { type: 'otherside', who: ['tyler'], seen: true, week: 2 },
    second: { weeks: [4, 6], not: ['standards', 'rework'] },
    cards: [
      { id: 'notes', week: 2, cue: 'pressure', title: "Theresa's handover note",
        body: "Theresa left you two pages. The first is the booth schedule. The second is headed 'Welding', and it is a list.",
        options: [
          { id: 'read', label: 'Read it properly, both pages', hours: 0.5, kind: 'do', effects: [{ line: "The second page: spatter in the drip rails on the Rescue roofs; bodies arriving at four when paint needs them by two; and 'no written spatter standard; I ask and nobody knows.' Three things, a year old each." }], score: [['E2', 1, "Read what the other side had been trying to tell you"]] },
          { id: 'skim', label: 'Skim it; you know what paint wants', hours: 0, kind: 'skip', effects: [{ peerTrust: -0.03 }], score: [['E2', -1, 'Skimmed what the other side had written down for you']] },
        ] },
      { id: 'back', week: 6, cue: 'pressure', title: 'Theresa is back',
        body: "Theresa is back on Monday, tanned and suspicious. She has four weeks of kickback tickets in front of her and your name on the cover sheet.",
        options: [
          { id: 'sit', label: 'Sit down with her about what you saw from her side', hours: 1, kind: 'do', effects: [{ peerTrust: 0.1 }, { line: "You told Theresa what four weeks on her side of the door had looked like. She listened, and then she said 'I know,' and then she said thank you, which from Theresa is a speech." }], score: [['E2', 2, 'Brought what you saw back across']] },
          { id: 'hand', label: 'Hand paint back and get on with your own floor', hours: 0, kind: 'skip', effects: [{ peerTrust: -0.02 }], score: [['E2', 0, 'Handed it back without a word about what you saw']] },
        ] },
    ],
    pool: { perWeek: [0, 1], cards: pool('vendorDemo', 'townHall', 'jessForecast', 'supplierCall', 'danaPage') },
    debrief: {
      questions: [
        'What did your own bodies look like from the other side of the door? What did you do with the first ticket that had your crew\'s name on it?',
        "Which of paint's complaints had you been filing under 'paint being paint'? Which of them turned out to be yours?",
        'Did you send bodies back to your own crew? What did that cost you with them, and what did it buy?',
        'On your real floor: whose output do you receive, and whose receives yours? When did you last stand on their side of it?',
        'What will you say to the next supervisor downstream who tells you your work is costing them an hour a day?',
      ],
      commitment: 'One morning this month I will spend on the receiving end of my own department\'s work, and what I will bring back:',
    },
  },

  // -------------------------------------------------------------------- 13 (beta 8)
  customers: {
    title: 'Who you work for', focus: ['E4'], seats: ['supervisor'], onlySupervisor: "the conversations in it are supervisor to supervisor", notManager: 'both sides of the door are already yours', handbook: '8: Leading at every level: horizontally', weeks: 8, goal: 'main',
    teaches: 'Internal customers: who receives your work, and what they need from it, which is not what they asked for',
    brief: [
      "Welding makes bodies. Paint receives them. That is the whole of the arrangement as far as anyone in welding has ever thought about it, and paint has been unhappy with it for a year in a way that comes out as kickback tickets and Theresa's tone at the production meeting.",
      "Paint has never once said what it needs. Welding has never once asked. Jess needs something from you every week and gets your version of it. Maintenance gets work orders from you written the way you'd say them out loud. Each of them is a customer, and each of them is getting what you decided to send.",
      "This month, find out what they actually need. It will not be what they have been asking for.",
    ],
    goalText: "Paint getting what it needs from welding, settled with Theresa for a reason you can name; paint fed; nobody lost.",
    lose: ['Paint short two weeks running', 'Losing a person', 'Three weeks over 55 hours'],
    setup: {},
    main: { type: 'customer', who: [], seen: true, week: 1 },
    second: { weeks: [3, 5], not: ['standards'] },
    cards: [
      { id: 'jess', week: 2, cue: 'pressure', title: 'Jess wants your numbers, again',
        body: "Every Monday you give Jess next week's bodies: one number. Every Monday she comes back with a question about which ones. You have started to find this annoying.",
        options: [
          { id: 'ask', label: 'Ask her what she does with the number', hours: 0.5, kind: 'do', effects: [{ line: "Jess builds the paint schedule, the tire order and Corey's promises off your number, and she needs it by vehicle, not by body, because a Rescue is not a Drayman to any of those three. You had been giving her one number for two years." }], score: [['E4', 2, 'Asked the receiver what they do with it']] },
          { id: 'give', label: 'Give her the number, the way you always have', hours: 0.25, kind: 'skip', effects: [{ floorLoad: { label: "Jess's questions about which bodies", hours: 1, weeks: 3 } }], score: [['E4', -1, 'Delivered what was asked for, the way it has always been delivered']] },
        ] },
      { id: 'workorder', week: 3, cue: 'pressure', title: 'A work order for maintenance',
        body: "The crane on bay two needs maintenance. You can write 'crane noisy' on the work order, which is what welding has always written, and what maintenance has always put at the bottom of the pile.",
        options: [
          { id: 'proper', label: 'Write what maintenance can act on: which crane, what noise, since when, what you ruled out', hours: 0.5, kind: 'do', effects: [{ line: 'Maintenance had the crane done Thursday. The tech said it was the first work order from welding he could read.' }], score: [['E4', 2, "Delivered what the receiver needed to act"]] },
          { id: 'usual', label: "Write 'crane noisy'", hours: 0.25, kind: 'skip', effects: [{ safetyDebt: 0.01 }, { floorLoad: { label: 'Chasing maintenance about the crane', hours: 1, weeks: 3 } }], score: [['E4', -1, "Sent the receiver something they could not act on"]] },
        ] },
    ],
    pool: { perWeek: [0, 1], cards: pool('vendorDemo', 'townHall', 'supplierCall', 'danaPage', 'eyewash') },
    debrief: {
      questions: [
        'What did Theresa say paint needed, in her words? How far was it from what you thought she had been complaining about?',
        'Who else receives your work every week? Name three. What does each of them do with it after it leaves you?',
        'When did you deliver more of what was asked for instead of what was needed? What did it cost the receiver?',
        'On your real floor: who is your internal customer that you have never asked? What would you ask them tomorrow?',
        'Who treats you as their customer? What do you need from them that you have never said?',
      ],
      commitment: 'One internal customer I will sit down with this month, and the question I will ask them:',
    },
  },

  // -------------------------------------------------------------------- 14 (beta 8)
  sayitonce: {
    title: 'Say it once', focus: ['B5'], seats: ['supervisor', 'lead'], notManager: 'the questions in it come to the floor, not the office', handbook: '2: When everything is urgent, nothing is strategic', weeks: 8, goal: 'main',
    teaches: 'Rework that is not parts: the same question four times a day, the same conversation three times, the hour spent looking',
    leadBrief: "You're the lead hand, and you are the person everyone asks. Where does this go, what rev is this, is it the Hauler or the Hauler 9 today. You know, so they ask, so you know, so they ask.",
    brief: [
      "Seven hours of your week are walk-ups. Where does this go. What rev is this drawing. Is paint taking Draymans first today. Did Saturday get approved. Nobody counts these hours because they are three minutes each and three minutes is not work.",
      "They are rework. Not the kind QC tags: the kind where someone asks you something they should already have known, and you answer it, and tomorrow someone else asks it, and you answer that. Marisol spent an hour on Tuesday looking for a drawing revision. Brent has asked about Saturday three times.",
      'Nobody is wrong to ask. The question is why the answer is only in your head.',
    ],
    goalText: 'The walk-up hours down and staying down, because the answers live where people find them; paint fed; nobody lost.',
    lose: ['Paint short two weeks running', 'Losing a person', 'Three weeks over 55 hours'],
    setup: {},
    main: { type: 'infowork', who: [], seen: true, week: 1 },
    second: { weeks: [3, 5], not: [] },
    cards: [
      { id: 'saturday', week: 3, cue: 'pressure', who: 'brent', title: '{c} asks about Saturday, for the third time',
        body: "{c} wants to know if Saturday is on. He asked Monday, and Tuesday, and now it's Wednesday and he's asking again, because you told him, and he forgot, and nobody wrote it anywhere.",
        options: [
          { id: 'board', label: 'Put it on the board, with the date, and point', hours: 0.25, kind: 'do', effects: [{ line: 'Saturday went on the board with the date and the names. Nobody asked again. Tyler read it and asked to be on it.' }], score: [['B5', 2, 'Said it once, where everyone could see it']] },
          { id: 'again', label: 'Tell him again', hours: 0.25, kind: 'skip', effects: [{ floorLoad: { label: 'Saturday, asked and answered, by everyone', hours: 1, weeks: 2 } }], score: [['B5', -1, 'Had the same conversation a third time']] },
        ] },
      { id: 'drawing', week: 4, cue: 'pressure', who: 'marisol', title: '{c} spent an hour looking for a drawing',
        body: "{c} needed the Hauler roof rev and spent an hour finding it: the shared drive, Ben's desk, the old binder, your office. She found it in your truck. She did not say anything about that.",
        options: [
          { id: 'fix', label: 'Fix where the drawings live, and tell everyone once', hours: 1, kind: 'do', effects: [{ line: 'The current revs live in the rack by the board now, one folder per vehicle, and Ben drops new ones there. Nobody has been in your truck since.' }], score: [['B5', 2, 'Fixed where the information lives']] },
          { id: 'find', label: 'Find it for her, next time she asks', hours: 0.5, kind: 'skip', effects: [{ floorLoad: { label: 'Finding drawings for people', hours: 1, weeks: 3 } }], score: [['B5', -1, 'Did the searching for her, faster']] },
        ] },
    ],
    pool: { perWeek: [0, 1], cards: pool('vendorDemo', 'townHall', 'joelGauge', 'jessForecast', 'supplierCall') },
    debrief: {
      questions: [
        'What did the tally say: who asked what, and how often? Which question surprised you?',
        'How many hours a week were the questions costing you? What were they costing the people who had to come and ask?',
        'Where did the answers live before, and where do they live now? Who keeps them current?',
        'On your real floor: what is the question you answer most often? Why is the answer only in your head?',
        'What conversation have you had three times this month? What would make it once?',
      ],
      commitment: 'One answer I will put where people find it this week, and who will keep it current:',
    },
  },

  // -------------------------------------------------------------------- 15 (beta 8)
  system: {
    title: 'What the system sees', focus: ['B6'], seats: ['supervisor', 'lead'], notManager: 'the entries in it are made at the booth', handbook: '3: Structure protects good people', weeks: 8, goal: 'main',
    teaches: 'The ERP: what it does with what the floor enters, and what it cannot do with what the floor does not',
    leadBrief: "You're the lead hand, and the clock-in terminal is beside your table. The crew clocks on and off jobs through you more than through {erp}, which is the problem, though nobody has put it that way.",
    brief: [
      "Jess built next week on what {erp} said. {erp} said welding was a day ahead on the Hauler jobs. Welding is not a day ahead on the Hauler jobs; welding is behind, and paint's schedule, the tire order and Corey's delivery promise are now built on a day that does not exist.",
      "The crew sees one screen of {erp}: clock on, clock off, the job number. What they do not see is everything downstream of it: the schedule Jess builds off the labour entries, the steel purchasing reorders off the material issues, the costing Marion runs off the closed jobs, the dates Corey promises off all of it. A job clocked off on Friday for work done Tuesday is a lie the whole building reads as the truth.",
      "Dana would like to know why the schedule and the floor disagree. {erp} does not know. It only knows what it was told.",
    ],
    goalText: "{erp}'s picture of welding matching the floor, for a reason you fixed at the booth; paint fed; nobody lost.",
    lose: ['Paint short two weeks running', 'Losing a person', 'Three weeks over 55 hours'],
    setup: {},
    main: { type: 'erp', who: [], seen: true, week: 1 },
    second: { weeks: [3, 5], not: [] },
    cards: [
      { id: 'stock', week: 2, cue: 'pressure', title: "{erp} says forty brackets in stock",
        body: "Jess has {erp} open: forty Drayman brackets in stock. The rack is empty; you can see it from here. Purchasing will not reorder what the system says is on the shelf.",
        options: [
          { id: 'count', label: 'Walk over with Jess and count, then find out where the forty went in the system', hours: 0.5, kind: 'do', effects: [{ line: 'The forty were on the floor, in bodies, never issued to the jobs. Jess fixed the count; purchasing reordered Thursday; you now know what a material issue is for.' }], score: [['B6', 1, 'Saw what the system sees and why']] },
          { id: 'wrong', label: "Tell her the system's wrong", hours: 0, kind: 'skip', effects: [{ capacity: -0.5 }, { line: "You said the system was wrong. It was: it had been told nothing. Fit-up ran out of brackets Thursday and the steel came in the week after." }], score: [['B6', -1, 'Called the system wrong instead of finding what it had been told']] },
        ] },
      { id: 'closing', week: 5, cue: 'pressure', title: 'Eleven jobs still open',
        body: "Marion's month-end is Friday and {erp} shows eleven welding jobs open that are in paint, two in assembly. Open jobs carry no cost and ship no vehicles, as far as the system knows.",
        options: [
          { id: 'close', label: 'Close them properly now, with the real hours and dates', hours: 1, kind: 'do', effects: [{ managerTrust: 0.04 }, { line: 'The eleven jobs closed with their real hours. Marion\'s month-end was the first in a year where welding\'s costs were welding\'s.' }], score: [['B6', 2, 'Closed the jobs the way the system needs them closed']] },
          { id: 'office', label: 'Let the office close them at month end', hours: 0, kind: 'skip', effects: [{ managerTrust: -0.05 }, { line: 'The office closed the eleven jobs with estimated hours. Welding looks forty percent over on labour this month, and Dana has the report.' }], score: [['B6', -1, 'Let someone else guess the entries']] },
        ] },
    ],
    pool: { perWeek: [0, 1], cards: pool('vendorDemo', 'townHall', 'jessForecast', 'supplierCall', 'danaPage') },
    debrief: {
      questions: [
        'What did you find when you traced one job through the system, screen by screen? Which screens had you never seen?',
        'What does a labour entry made on Friday for Tuesday\'s work do to the schedule, the purchasing, the costing, the delivery date? Who reads each of those?',
        'On your real floor: which entries does your crew make, and when? Who downstream builds on them?',
        "What does your plant's system do with a material issue, a clocked operation, a closed job? Ask the person who runs it to show you.",
        'What would you tell a new hire about why the clock-in matters, in one sentence they would believe?',
      ],
      commitment: "One screen of our plant's system I will sit with the person who owns it to understand this month, and what I will tell the crew after:",
    },
  },
};
