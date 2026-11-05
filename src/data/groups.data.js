// Group sessions: what a facilitator runs with a room, on one screen.
//
// The author, 2026-11-05: "outline the group learning modules that coaches
// can present and work a group through. like the lego plane thing, working
// through difficult scenarios, etc." And, the same day, on the first draft
// (everyone on their own phone): "I want the group event to be a facilitator
// using one screen to work through problems or theories with the group
// watching, conversing, participating, etc. the facilitator would have printed
// out notes to go off of, or something like that."
//
// So a session is one run of one module on one screen (a laptop on a
// projector, or a phone passed round a table), driven by the facilitator,
// with the room deciding out loud. Every session is built on a module that
// exists and is gated; none needs a new mechanic. That is the rule from the
// author's note of the same day: do not "cover everything and not show
// anything properly". The facilitator's notes (the plan, what to say, the
// reveal) are here, shown on the screen while running and printed from
// docs/GROUPS.md. Logic-free.
//
// Shape: `blocks` is the plan by the clock. `room` is what the facilitator
// says at the screen: `open` before the brief, `each` the standing rule for
// every week, `weeks` a line for particular weeks (by week number), `close`
// after Friday of the last week. `questions` is the debrief; `reveal` stays
// with the facilitator until then; `commitment` is the card.

export const GROUPS = {
  rounds: {
    title: 'The round board', module: 'roundtwo', minutes: 90, size: '4 to 10 around one screen',
    purpose: 'The plane exercise without the pieces: the room runs the welding bay as eight rounds on one screen, the board fills in every Friday, and the room argues over which one rule to change next.',
    from: 'The flow rounds (the plane exercise); Handbook 2, urgency and strategy',
    blocks: [
      ['10', 'Frame', 'Say the three rules out loud: rack of six or batch of one; push, or a two-slot pull rack; check at the end, or at each station. Do not say which matters; one cause was drawn and the room does not know which. One rule for the room: nothing changes until the room has read a round.'],
      ['45', 'Eight rounds', 'Read the ticket aloud. Before each week ask the room: change a rule, or read another round? Which rule, and what on the board says so? Take hands, pick what the room picks, run the week, read Friday aloud. Copy the board\'s line to the flip chart every week so the room can see the dip.'],
      ['15', 'Read the chart', 'Which week dipped, and what had changed the week before? When a rule slid back by Friday, whose change was it? Did the room ever change two things at once, and what did it learn from that week?'],
      ['10', 'The lever', 'What is the rack of six on your floor? Where do you push instead of pull? What is checked at the end that could be checked where it is made?'],
      ['10', 'Commit', 'One rule each person will change on their own floor in the next two weeks, and what they will read first to know whether it worked. Read aloud. Name one pattern seen in the room; close on time.'],
    ],
    room: {
      open: 'This is the bay run as rounds. Three rules, one hidden reason the numbers are what they are. We change nothing until we have read a round.',
      each: 'Read the ticket. Ask: change a rule or read another round? Take hands before you tap. Read Friday aloud, then copy the board to the chart.',
      weeks: { 1: 'Week one: most rooms want to change all three now. Let them argue; then ask what they would learn from a week where three things changed.', 3: 'If the board has not moved, ask what reading another round costs against guessing.', 6: 'Ask whether the rule the room changed is still in place, and who on the crew took it.' },
      close: 'Stop the screen. Read the chart from the top: the dip, the slide-back, the round that paid.',
    },
    questions: ['Which rule did the room change first, and what on the board said to?', 'What did the dip cost, and was it worth it?', 'When a rule slid back by Friday, whose change was it?', 'On your floor, what is the rack of six?'],
    reveal: 'The room reaches for all three rules at once because each sounds right. One cause was drawn; only one rule fixed it; the other two cost a dip for nothing. Reading the first round and changing one rule ships the most. If the cause was found and the room still lost, the rule slid back: the crew had not taken it. That is a change the supervisor made for them, not with them.',
    commitment: 'One rule I will change on my floor, and what I will read first to know if it worked:',
  },

  paint: {
    title: 'Why it lands in paint', module: 'otherside', minutes: 120, size: '4 to 10 around one screen',
    purpose: 'The systems-thinking scenario, run instead of read: the room covers paint for eight weeks on the receiving end of welding\'s work, then explains why the pressure keeps landing there without blaming anyone.',
    from: 'The author\'s systems-thinking simulation; Handbook 7, 4 and 1',
    blocks: [
      ['15', 'Frame', 'Say it in the first minute: this is not a problem-solving session. You are not here to fix paint. You are here to understand why pressure keeps showing up where it does. Hand out the five questions on paper; they are answered after the run.'],
      ['45', 'Eight weeks', 'Read each ticket aloud. Before each pick, ask the room what it would do and why; take the room\'s pick. Read Friday aloud. Note what the room does with Theresa\'s handover note, and whether anyone wants to go back to welding before week four.'],
      ['25', 'The five questions', 'On the flip chart, as a room: Where does pressure pile up in this bay, and why does it show up in paint? What work is being done that nobody\'s job says they own? Who benefits from it working this way? If Theresa were away another month, what would fail first? What problem is management trying to solve but has not named right?'],
      ['10', 'Slow it down', 'Questions only, never a correction: Who owns that decision on a bad day? What breaks if that person is not there? What behaviour does this bay quietly reward? Silence is fine.'],
      ['15', 'Reveal', 'The layers, in order: who absorbs the load (the senior painter, the supervisor who reorders to protect assembly), authority against ownership (paint owns the outcome and not the cause), what information actually flows (verbal, late, emotional), the fragility test, the illusion that it is a capacity problem, and the lever: who owns "paint-ready" before paint.'],
      ['10', 'Commit', 'One behaviour each person will stop tolerating under pressure, in their words, on the card. Keep the cards; ask about them in thirty days.'],
    ],
    room: {
      open: 'You are covering paint for a month. Welding\'s work arrives at your door. You are not here to fix paint.',
      each: 'Read the ticket. Ask the room: what would you do, and what do you know for certain? Take the pick. Read Friday aloud.',
      weeks: { 2: 'Theresa\'s note: ask the room what it says and what it does not say.', 4: 'Halfway. Ask who has gone across to welding, and who has gone up to Dana instead.', 6: 'Theresa is back. Ask what the room will tell her it found.' },
      close: 'Stop the screen. Hand out the five questions; the room answers them on the chart, not from the game.',
    },
    questions: ['Where does the pressure pile up, and why does it show up in paint?', 'What work is being done that nobody\'s job says they own?', 'Who benefits from the bay working this way today?', 'If the senior painter were away for two weeks, what would fail first?', 'What problem is management trying to solve but has not named right?'],
    reveal: 'Expect the room to diagnose paint\'s capacity, propose an inspection step, suggest pushing back harder, and recommend training welders. These are the signals, not mistakes; note which it reaches for first. The hidden thing is that no role owns what paint-ready means, so paint discovers defects late, fixes them quietly, and absorbs the variation. Paint owns outcomes without owning causes. Until "paint-ready" is owned outside paint, paint stays a buffer.',
    commitment: 'One behaviour I will stop tolerating under pressure:',
  },

  whose: {
    title: 'Whose call is it', module: 'upstairs', minutes: 90, size: '4 to 8 around one screen',
    purpose: 'The leadership tier finds out it does not share a model of whose decision is whose: the room runs Nobody upstairs on one screen and votes on every call before the game says what it cost.',
    from: 'The author\'s exercise "Whose job is it?"; Handbook 4 and 8',
    blocks: [
      ['10', 'Frame', 'Dana is away for the month. The rule: at every decision card, the screen stops. Nobody says what they would do until the hands are counted.'],
      ['45', 'Eight weeks', 'At each decision card: read it aloud, ask for hands, yours to make or not yours? Count and write it on the chart. Then ask what the room wants to do, take the pick, run the week, read Friday aloud. Expect the biggest split on the Saturday call and the scrap call.'],
      ['15', 'Where we did not agree', 'Go back over the chart. Every card where the hands split is a finding: this tier does not agree on who owns that call. Do not settle it in the room. Write it on a sheet titled "Ownership we do not agree on"; it goes to the manager.'],
      ['10', 'The cost', 'What did guessing cost, either way: the call made that was not yours, and the call not made that was? Who wanted to go up the chain, who wanted to go around it, and what happened when Dana came back?'],
      ['10', 'Commit', 'One decision each person has been making that belongs to someone else, or one they have been sending up that is theirs. Named, with a date. Read aloud.'],
    ],
    room: {
      open: 'Dana is away. Every call that lands this month is either yours or not, and the game knows which. At every decision card the screen stops for hands.',
      each: 'Read the ticket. For a decision card: hands first, yours or not yours, count on the chart. Then the room\'s pick. Read Friday aloud.',
      weeks: { 2: 'The Saturday call. Count the hands twice; the room changes its mind while you count.', 4: 'The scrap call. Ask who in the room would phone Dana on holiday, and who would not.', 8: 'Dana is back Monday. Ask what the room tells her first.' },
      close: 'Stop the screen. Read the chart: every split is a line for the manager.',
    },
    questions: ['Which call split the room, and why?', 'What did the room do with a call that was not its to make, and what did it cost?', 'Who did it tell, and when?', 'On your floor, what decision is understood but never written down?'],
    reveal: 'Role confusion is a design problem, not a personality one. The split hands are the result: a tier that disagrees on who owns the scrap call will have operators who have already found the gap. The sheet of disagreements is the deliverable; the manager decides them, not the room.',
    commitment: 'One decision I will stop making, or start making, because of whose it is:',
  },

  rules: {
    title: 'Same floor, different rules', module: 'rush', minutes: 90, size: '4 to 8 supervisors and leads around one screen',
    purpose: 'The room runs a rush week on one screen and, at each shortcut offered, every person says out loud what they would do on their own floor, so the gaps between them are on the chart before the game says what each one cost.',
    from: 'The author\'s peer-alignment check; Handbook 7, culture under pressure',
    blocks: [
      ['10', 'Frame', 'Before the screen: each person writes on paper, alone, the quality defect they send back versus let through with a note; the standard for an unexcused absence; when they escalate a performance issue. Folded; it comes out later.'],
      ['40', 'Six weeks', 'Read each ticket aloud. At every shortcut offered (the tack check, lunch, the sleeves, the spatter, the gauges, the Saturdays) go round the room: what would you do? Write each name against each answer on the chart. Then take the majority pick and run the week. Read Friday aloud.'],
      ['15', 'The chart and the papers', 'Where the room split, that is the conversation. Unfold the papers and read the three answers around the room, one question at a time. Expect the biggest spread on the quality-defect question.'],
      ['15', 'Agree one', 'For each split, ask the room to agree one standard now if it can, and record who takes the ones it cannot to the manager. The agreed standards go on a sheet you keep.'],
      ['10', 'Commit', 'One standard each person will hold through the next busy week, and how the crew will know. Read aloud.'],
    ],
    room: {
      open: 'A rush week. The game will offer shortcuts. At each one, everyone says what they would do before we tap anything.',
      each: 'Read the ticket. At a shortcut: round the room, name against answer on the chart. Majority pick. Read Friday aloud.',
      weeks: { 2: 'The tack check. Ask who has skipped one on a real rush, and what happened in week six.', 3: 'Three shortcuts this week. Take them one at a time.', 6: 'If the tack check was skipped, it comes back this week. Read it slowly.' },
      close: 'Stop the screen. Unfold the papers. One question at a time, round the room.',
    },
    questions: ['Which shortcut did you take, and what were you telling yourself at the time?', 'Where did your answer differ from the person beside you?', 'What does the crew already know about the gaps between you?', 'What is the rule in June?'],
    reveal: 'Operators find the gaps between supervisors and use them, not out of malice: inconsistency makes room. The biggest spread is usually on the quality defect question. Whatever slides in the rush is the rule by June; the standard is what you hold on the worst week.',
    commitment: 'One standard I will hold through the next rush, and how my crew will know:',
  },

  fire: {
    title: 'The same fire', module: 'firefighting', minutes: 90, size: '4 to 6 around one screen',
    purpose: 'The handbook\'s first module as a run: the room fights the same fire on one screen and counts, on the chart, the hours spent putting it out against the hours it would have taken to find out why it keeps lighting.',
    from: 'Handbook 1, firefighting is a leadership failure',
    blocks: [
      ['10', 'Open', 'Pre-work read out, one minute each: two problems on your floor that came back three or more times in six months. Write them on the chart. No discussion.'],
      ['35', 'Six weeks', 'Read each ticket aloud. Before each pick, ask: put it out, or find out why? Take the room\'s pick. After each Friday, add to the chart: hours on the fire this week, hours on the cause.'],
      ['20', 'Count the hours', 'Total both columns. At which week did the room stop and look, if it did, and what made it? What was the room doing the week the fix did not hold?'],
      ['15', 'Back to the chart', 'Return to the opening list of recurring problems. For each: what has actually been changed about the conditions that cause it? If the answer is nothing, it was postponed, not solved.'],
      ['10', 'Commit', 'One recurring problem each person will solve at the root this month, and one they will stop solving themselves and hand to a named owner. Read aloud; the room asks how it will see it.'],
    ],
    room: {
      open: 'The same thing goes wrong on this floor every week. We can put it out, or find out why. Two columns on the chart: hours on the fire, hours on the cause.',
      each: 'Read the ticket. Ask: put it out or find out why, and what do we know? Take the pick. After Friday, fill both columns.',
      weeks: { 1: 'Most rooms put it out in week one. Let them; write the two hours down.', 3: 'If the room is still putting it out, ask what the total on the chart will be by week six.', 5: 'If a fix did not hold, ask what the room knew when it chose it.' },
      close: 'Stop the screen. Total the columns out loud.',
    },
    questions: ['How many hours did the fire take across the run, and how many did finding the cause take?', 'What was the room doing the week the fix did not hold?', 'If you were off for two weeks, which fires on your floor would start first?', 'Where are you the single point everything routes through?'],
    reveal: 'Firefighting rewards reaction. It feels important, gives visible wins, and lets a leader avoid the uncomfortable cause. The run makes the ledger visible: the fire costs two hours a week forever, the cause costs three hours once. If a problem keeps returning, it was not solved; it was postponed.',
    commitment: 'One recurring problem I will solve at the root this month, and one I will hand to a named owner:',
  },

  week: {
    title: 'Where the week went', module: 'the-week', minutes: 90, size: '4 to 8 around one screen',
    purpose: 'The room runs the first module on one screen and lays the forty hours on the chart every Friday: what was planned, what the floor took, what was refused, and what was never going to fit.',
    from: 'Handbook 2, when everything is urgent nothing is strategic',
    blocks: [
      ['10', 'Open', 'Pre-work: last week, in two numbers, reactive hours against planned. Round the room, numbers only. Below twenty percent reactive from a supervisor is usually wrong; ask for the example.'],
      ['35', 'Six weeks', 'Read the ticket and the inbox aloud. Ask the room what gets an hour and what gets a no. Take the pick. After Friday, four columns on the chart: planned, the floor, refused, never fit.'],
      ['20', 'The chart', 'Read the columns down. Then the inbox: who in the room wanted to say no to the wire rep, the town hall, the gas supplier, and who wanted to put off one of their own people instead?'],
      ['15', 'Protect it', 'What would you stop doing this week to protect two hours? Who on your crew absorbs the urgency so you do not have to, and is that sustainable for them?'],
      ['10', 'Commit', 'One improvement each person has been putting off until things calm down, scheduled for a day and time inside two weeks. Read aloud.'],
    ],
    room: {
      open: 'Forty hours. A floor that wants all of them, an inbox that wants more, and one thing that matters that is not urgent. Every no is a decision.',
      each: 'Read the ticket and the inbox. Ask what gets an hour and what gets a no. Take the pick. After Friday, the four columns.',
      weeks: { 1: 'The wire rep and the town hall: ask who says yes to be polite.', 2: 'If the week went over forty, ask what pushed it and whether it was a choice.', 4: 'Ask which hour this week was the important thing that was not urgent, and whether it got one.' },
      close: 'Stop the screen. Read the four columns across six weeks.',
    },
    questions: ['What pushed the week over, and was it a choice?', 'What did the room refuse, and what did refusing cost?', 'What was put off that belonged to one of your own people?', 'Which hour this week was the important thing that was not urgent?'],
    reveal: 'Urgency creates pressure to act; strategy needs permission to pause. The run shows refusal as a decision: the week that said no to the wire rep had an hour the week that said yes did not. Today\'s urgency is usually last month\'s neglected system.',
    commitment: 'The improvement I will schedule this week, with its day and time:',
  },
};

export const GROUP_ORDER = ['rounds', 'paint', 'whose', 'rules', 'fire', 'week'];
