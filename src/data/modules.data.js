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
    id: 'appraisals', cue: 'deadline', title: 'Four appraisals due',
    body: "Marion's office sent the second reminder Monday. Four appraisals for your crew, due at the end of the month. Done properly they take the better part of an hour each, and the people getting them can tell when they weren't.",
    options: [
      { id: 'do', label: 'Do them properly this week', hours: 3, kind: 'do', effects: [{ trust: 0.03, who: 'all' }], score: [['Accountability Management', 1, 'Kept a promise to HR and the crew']] },
      { id: 'later', label: 'Push them to next month', hours: 0, kind: 'skip', effects: [{ floorLoad: { label: "HR's follow-up on the appraisals you pushed off", hours: 2, inWeeks: 2 } }, { queue: { weeks: 2, effects: [{ managerTrust: -0.06 }], line: "Marion's office copied Dana on the third reminder about your appraisals." }, because: 'You put the appraisals off' }] },
    ],
  },
  engReview: {
    id: 'engReview', cue: 'deadline', title: 'Engineering wants a welder to look at a drawing',
    body: "Ben in manufacturing engineering has a revised fixture for the Drayman Crew cab and wants a welder's eye on it before it goes to the toolroom. An hour and a half at his bench. He asked nicely, which with Ben means it matters.",
    options: [
      { id: 'do', label: 'Go and look at it with him', hours: 1.5, kind: 'do', effects: [{ line: 'You found a clamp that sits right where the torch has to go on the B-pillar seam. Ben took the drawing back and thanked you twice.' }], score: [['Cross-Functional Awareness', 2, 'Gave engineering a welder before it was too late']] },
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
    id: 'townHall', cue: 'optional', title: "Irene's town hall",
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
      { id: 'do', label: 'Show him at the bench', hours: 1, kind: 'do', effects: [{ skill: 0.05, who: 'joel' }, { trust: 0.05, who: 'joel' }], score: [['Early Coaching & Guidance', 2, 'Answered a new hand at the bench']] },
      { id: 'skip', label: 'Tell him to ask Donna', hours: 0, kind: 'skip', effects: [{ floorLoad: { label: 'Rework on finish checks Joel was not sure about', hours: 1, weeks: 2 } }, { trust: -0.03, who: 'joel' }, { line: "{c} didn't ask Donna. He didn't ask anyone." }], score: [['Early Coaching & Guidance', -1, "Sent a new hand's question somewhere else"]] },
    ],
  },
  kevVacation: {
    id: 'kevVacation', cue: 'people', who: 'kev', title: "{c}'s vacation request",
    body: "{c} wants the last week of the month off for his daughter's wedding. He needs an answer so he can book, and it means sorting out cover at fit-up. Half an hour, if you do it now.",
    options: [
      { id: 'do', label: 'Sort the cover and say yes', hours: 0.5, kind: 'do', effects: [{ morale: 0.05, who: 'kev' }, { trust: 0.05, who: 'kev' }] },
      { id: 'skip', label: 'Say you will get back to him', hours: 0, kind: 'skip', effects: [{ floorLoad: { label: "Sorting Kev's vacation cover in a hurry", hours: 1 } }, { morale: -0.05, who: 'kev' }, { trust: -0.04, who: 'kev' }, { line: '{c} asked again on Thursday, more carefully than the first time.' }] },
    ],
  },
  jessForecast: {
    id: 'jessForecast', cue: 'deadline', title: 'Jess needs next month from you',
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
      { id: 'do', label: 'Check it today', hours: 0.5, kind: 'do', effects: [{ safetyDebt: -0.01 }, { line: 'The eyewash bottles were out of date. You swapped them.' }], score: [['Accountability Management', 1, 'Closed a safety action']] },
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
    id: 'danaPage', cue: 'deadline', title: 'Dana wants a page on overtime',
    body: 'Russ asked Dana why welding overtime went up last quarter, so Dana is asking you. One page, by Thursday.',
    options: [
      { id: 'do', label: 'Write it', hours: 1.5, kind: 'do', effects: [{ managerTrust: 0.05 }] },
      { id: 'skip', label: 'Tell her you are slammed', hours: 0, kind: 'skip', effects: [{ managerTrust: -0.06 }, { floorLoad: { label: 'Dana asking about the overtime page, again', hours: 1, weeks: 2 } }] },
    ],
  },
};
const pool = (...ids) => ids.map((id) => R[id]);

// ---------------------------------------------------------------- the track
export const TRACK = {
  id: 'supervisor',
  title: 'Supervisor track',
  intro: "You run the welding department at Northern Motors: seven people, three stations, and a paint department that wants six bodies a week. Each module is a few weeks of that job. Nobody tells you the right answer, because there usually isn't one; there is what you knew, what you did, and what it did.",
  modules: ['the-week', 'late-one', 'loop', 'firefighting', 'pulled', 'upstairs', 'rush', 'across'],
};

export const MODULES = {
  // -------------------------------------------------------------------- 1
  'the-week': {
    title: 'The week', handbook: '2: When everything is urgent, nothing is strategic', weeks: 6, goal: 'main',
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
    title: 'The late one', handbook: '7: Culture is what you tolerate under pressure', weeks: 8, goal: 'main',
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
    pool: { perWeek: [0, 1], cards: pool('vendorDemo', 'townHall', 'joelGauge', 'jessForecast', 'supplierCall', 'paintCall') },
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
    title: 'The loop', handbook: '7: Culture is what you tolerate under pressure', weeks: 8, goal: 'main',
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
    pool: { perWeek: [0, 1], cards: pool('vendorDemo', 'townHall', 'kevVacation', 'jessForecast', 'supplierCall', 'eyewash') },
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
    title: 'Firefighting', handbook: '1: Firefighting is a leadership failure, not a badge of honour', weeks: 8, goal: 'main',
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
    pool: { perWeek: [0, 1], cards: pool('vendorDemo', 'joelGauge', 'kevVacation', 'jessForecast', 'paintCall', 'danaPage') },
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
    title: 'Pulled off the floor', handbook: '6: Leaders build leaders, not just output', weeks: 8, goal: 'held',
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
          { id: 'teach', label: 'Sit with him and hand it over', hours: 1.5, kind: 'delegate', effects: [{ bench: 0.15 }, { removeRoutine: 'scheduler' }, { morale: 0.03, who: 'kev' }], score: [['Emotional Awareness', 1, 'Saw what only you were holding'], ['Culture & Organizational Influence', 2, 'Handed over a real piece of the job']] },
          { id: 'keep', label: 'Keep doing it yourself', hours: 0, kind: 'keep', score: [['Emotional Awareness', -1, 'Kept a piece of the job only you can do']] },
        ] },
      { id: 'huddles', week: 1, cue: 'develop', who: 'kev', title: 'Let {c} run the huddles',
        body: 'The morning huddle is yours. Five minutes, every day. If {c} runs it, the crew starts looking at him first in the morning, which is the point.',
        options: [
          { id: 'teach', label: 'Run the first two together, then hand it over', hours: 1, kind: 'delegate', effects: [{ bench: 0.15 }, { removeRoutine: 'huddles' }], score: [['Emotional Awareness', 1, 'Saw what only you were holding'], ['Culture & Organizational Influence', 2, 'Let the lead lead']] },
          { id: 'keep', label: 'Keep running them', hours: 0, kind: 'keep', score: [['Emotional Awareness', -1, 'Kept a piece of the job only you can do']] },
        ] },
      { id: 'steps', week: 2, cue: 'develop', who: 'kev', title: 'Walk {c} through the hard conversations',
        body: "If someone is late three times while you're in the audit room, {c} is who they'll be late to. He doesn't know the steps, and he doesn't want to get them wrong in front of the crew.",
        options: [
          { id: 'teach', label: 'Walk him through how you handle it', hours: 1.5, kind: 'delegate', effects: [{ bench: 0.15 }, { flag: 'kevSteps' }], score: [['Emotional Awareness', 1, 'Saw what only you were holding'], ['Early Coaching & Guidance', 2, 'Prepared the lead for the hard part']] },
          { id: 'keep', label: 'Tell him to call you', hours: 0, kind: 'keep', score: [['Emotional Awareness', -1, 'Planned to be reachable instead of replaceable']] },
        ] },
      { id: 'cross', week: 2, cue: 'develop', who: 'marisol', title: 'Show {c} the finish checks',
        body: "If Donna's off while you're away, finish slows to a crawl. {c} could cover the checks with an hour of showing.",
        options: [
          { id: 'teach', label: 'Show her', hours: 1, kind: 'delegate', effects: [{ bench: 0.05 }, { skill: 0.03, who: 'marisol' }], score: [['Emotional Awareness', 1, 'Saw what only you were holding']] },
          { id: 'keep', label: 'Hope Donna stays healthy', hours: 0, kind: 'keep' },
        ] },
      { id: 'announce', week: 2, cue: 'develop', who: 'kev', title: 'Tell the crew who is in charge',
        body: "The crew knows you'll be busy. They don't know what that means for them. Ten minutes at the huddle with {c} standing beside you would settle it.",
        options: [
          { id: 'teach', label: 'Say it at the huddle with him there', hours: 0.5, kind: 'delegate', effects: [{ bench: 0.1 }], score: [['Emotional Awareness', 1, 'Saw what only you were holding'], ['Tone-Setting', 2, 'Made the handover visible']] },
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
    title: 'Nobody upstairs', handbook: '4: Ownership without authority creates friction; 8: Leading up', weeks: 8, goal: 'main',
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
          { id: 'sign', label: 'Approve it yourself and sort it out later', hours: 0.5, kind: 'decide', effects: [{ capacity: 1.2 }, { morale: -0.02, who: 'all' }, { queue: { weeks: 4, effects: [{ managerTrust: -0.1 }], line: 'Dana found the Saturday on the payroll report her first week back. She asked who signed it.', trace: 'trace.saturday' }, because: 'You signed overtime that needed a manager' }], score: [['Accountability Management', -1, 'Signed what was not yours to sign']] },
          { id: 'russ', label: 'Put it to Russ today', hours: 0.5, kind: 'ask', effects: [{ chance: 0.6, then: [{ capacity: 1.2 }, { line: 'Russ signed the Saturday on Thursday night. Nobody complained about the overtime.' }], else: [{ line: "Russ didn't get to the Saturday request until Monday. The Saturday came and went." }] }], score: [['Cross-Functional Awareness', 2, 'Used the chain while Dana was away']] },
          { id: 'no', label: 'No Saturday', hours: 0, kind: 'skip' },
        ] },
      { id: 'swap', week: 3, cue: 'yours', who: 'lyle', title: '{c} wants to swap two days',
        body: "{c} wants to trade two days with a fabricator for a family thing. Raymond's fine with it. Swaps inside the same pay band are a supervisor's call; the policy says so in as many words.",
        options: [
          { id: 'yes', label: 'Approve it', hours: 0.25, kind: 'decide', effects: [{ morale: 0.05, who: 'lyle' }], score: [['Accountability Management', 2, 'Made the call that was yours']] },
          { id: 'russ', label: 'Check with Russ first', hours: 0.5, kind: 'ask', effects: [{ morale: -0.03, who: 'lyle' }, { line: "Russ wrote back on Friday: 'Why are you asking me this?'" }], score: [['Emotional Awareness', -1, 'Sent up a call that was yours']] },
          { id: 'no', label: 'Say no', hours: 0, kind: 'skip', effects: [{ morale: -0.06, who: 'lyle' }, { trust: -0.05, who: 'lyle' }] },
        ] },
      { id: 'scrap', week: 4, cue: 'notYours', title: 'Scrap it or weld it?',
        body: "A Hauler roof panel came over from fab with a crease in it. Raymond says weld it, it'll paint out. Val is on vacation. Scrap calls belong to QC, and QC has a backup who is slow but exists.",
        options: [
          { id: 'weld', label: 'Weld it and move on', hours: 0, kind: 'decide', effects: [{ chance: 0.5, then: [{ defects: 0.6 }, { line: "The crease didn't paint out. Theresa sent it back with a photo." }], else: [{ line: 'It painted out. Mostly.' }] }], score: [['Accountability Management', -1, "Made QC's call for them"]] },
          { id: 'hold', label: "Hold it for QC's backup", hours: 0, kind: 'ask', effects: [{ capacity: -0.3 }, { line: "The panel sat on the rack until QC's backup signed it off Thursday afternoon." }], score: [['Cross-Functional Awareness', 2, 'Left the call with the people who own it']] },
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
    title: 'Rush week', handbook: '7: Culture is what you tolerate under pressure', weeks: 8, goal: 'standard',
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
          { id: 'allow', label: 'Let it go for the rush', hours: 0, kind: 'allow', effects: [{ capacity: 0.35 }, { standard: -0.12 }, { flag: 'tackSkipped' }], score: [['Accountability Management', -1, 'Let a check go to make the number']] },
          { id: 'hold', label: 'Keep the check and tell him why', hours: 0.5, kind: 'hold', effects: [{ standard: 0.03 }, { morale: -0.02, who: 'brent' }], score: [['Accountability Management', 2, 'Held the check under pressure']] },
        ] },
      { id: 'ot2', week: 2, cue: 'overtime', title: 'Saturday?',
        body: 'A Saturday with three welders is a body and a bit. It is also a Saturday.',
        options: [
          { id: 'yes', label: 'Run Saturday (you will be there)', hours: 5, kind: 'overtime', effects: [{ capacity: 1.2 }, { morale: -0.03, who: 'all' }, { stress: 0.5, who: 'kev' }] },
          { id: 'no', label: 'No Saturday this week', hours: 0, kind: 'no' },
        ] },
      { id: 'lunch', week: 3, cue: 'shortcut', who: 'kev', title: 'The crew offers to weld through lunch',
        body: "{c} says the crew would rather weld through lunch this week and take it Friday. They mean it kindly. It's thirty degrees in the bay.",
        options: [
          { id: 'allow', label: 'Let them', hours: 0, kind: 'allow', effects: [{ capacity: 0.4 }, { standard: -0.06 }, { safetyDebt: 0.01 }, { morale: -0.03, who: 'all' }], score: [['Tone-Setting', -1, 'Let them skip the break in the heat']] },
          { id: 'hold', label: 'Thank them and keep lunch', hours: 0.25, kind: 'hold', effects: [{ morale: 0.02, who: 'all' }, { standard: 0.02 }], score: [['Tone-Setting', 2, 'Kept the break and said thank you']] },
        ] },
      { id: 'ot3', week: 3, cue: 'overtime', title: 'Saturday again?',
        body: 'Paint wants eight. Another Saturday is a body and a bit, and it is the second one.',
        options: [
          { id: 'yes', label: 'Run Saturday', hours: 5, kind: 'overtime', effects: [{ capacity: 1.2 }, { morale: -0.04, who: 'all' }, { stress: 0.5, who: 'kev' }] },
          { id: 'no', label: 'No Saturday', hours: 0, kind: 'no' },
        ] },
      { id: 'sleeves', week: 3, cue: 'shortcut', who: 'tyler', title: "{c}'s welding in a T-shirt",
        body: "It's thirty-one degrees in the bay and {c} has his sleeves off at booth three. Nobody's said anything, which means everybody has noticed.",
        options: [
          { id: 'hold', label: 'Say something now', hours: 0.25, kind: 'hold', effects: [{ standard: 0.04 }, { morale: -0.02, who: 'tyler' }], score: [['Accountability Management', 2, 'Said something the first time']] },
          { id: 'allow', label: "Leave it, it's hot", hours: 0, kind: 'allow', effects: [{ standard: -0.1 }, { safetyDebt: 0.02 }], score: [['Accountability Management', -1, 'Let PPE go because it was hot']] },
        ] },
      { id: 'spatter', week: 4, cue: 'shortcut', title: 'Paint will take some spatter, this once',
        body: 'Theresa says paint will take bodies with light spatter this week and sand it themselves. It saves your finish crew most of an hour a body.',
        options: [
          { id: 'allow', label: 'Take the deal', hours: 0, kind: 'allow', effects: [{ capacity: 0.5 }, { standard: -0.08 }, { escapeAdd: 0.1 }] },
          { id: 'writing', label: 'Take it for this order only, in writing', hours: 0.5, kind: 'hold', effects: [{ capacity: 0.5 }, { standard: -0.02 }], score: [['Cross-Functional Awareness', 2, 'Made the exception visible and temporary']] },
          { id: 'hold', label: 'Keep finishing to standard', hours: 0, kind: 'hold', effects: [{ standard: 0.02 }] },
        ] },
      { id: 'ot4', week: 4, cue: 'overtime', title: 'A third Saturday?',
        body: 'Kev has stopped saying anything about Saturdays, which is how you know.',
        options: [
          { id: 'yes', label: 'Run Saturday', hours: 5, kind: 'overtime', effects: [{ capacity: 1.2 }, { morale: -0.05, who: 'all' }, { stress: 1, who: 'kev' }] },
          { id: 'no', label: 'No Saturday', hours: 0, kind: 'no' },
        ] },
      { id: 'gauges', week: 5, cue: 'shortcut', title: 'The gauges are due for calibration',
        body: "The weld gauges are due for calibration this week. It takes them off the floor for a day. Nobody would know if they went next month. You'd know.",
        options: [
          { id: 'hold', label: 'Send them', hours: 0.5, kind: 'hold', effects: [{ capacity: -0.2 }, { standard: 0.04 }], score: [['Accountability Management', 1, 'Kept the calibration date']] },
          { id: 'allow', label: 'Next month', hours: 0, kind: 'allow', effects: [{ standard: -0.08 }] },
        ] },
      { id: 'after', week: 6, cue: 'shortcut', ifFlag: 'tackSkipped', who: 'brent', title: 'The tack check never came back',
        body: "The rush is over. The tack check didn't come back with it. {c} says nobody's missed it.",
        options: [
          { id: 'hold', label: 'Bring it back at the huddle', hours: 0.5, kind: 'hold', effects: [{ standard: 0.08 }, { morale: -0.02, who: 'all' }], score: [['Accountability Management', 2, 'Took back an exception when the rush ended']] },
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
    title: 'Across', handbook: '8: Leading at every level: horizontally', weeks: 8, goal: 'main',
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
    pool: { perWeek: [0, 1], cards: pool('vendorDemo', 'townHall', 'joelGauge', 'jessForecast', 'danaPage') },
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
};
