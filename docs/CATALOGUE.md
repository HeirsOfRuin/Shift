# The focus-area catalogue

What Shift trains. Written 2026-11-04 after the author's redirect (`REVIEW.md`):
"I don't want this whole thing to revolve around EI or LBA, It needs to cover a
wide array of different topics and focus points, with modules designed to
focus on one or two at a time." He answered "yes to all" to the review's six
decisions the same day.

The source of truth is `src/data/focus.data.js`; this page is the readable
copy. If they disagree, the data file wins and this page is stale.

## How it is used

- **A module names one or two areas** (`focus` in `modules.data.js`). Its end
  report reads only those. Decisions in other areas are still recorded and
  shown as "also on the floor, unrated", because the floor does not stop for
  the module's topic.
- **A read is three levels**, never a number: *Solid*, *Getting there*, *Not
  yet*. A good move scores +2, a mixed one 0 or +1, a miss -1; the read is the
  share earned of what was possible (Solid at 60%, Getting there at 25%). An
  area with fewer than three decisions behind it reads *Not enough seen*.
  There is no overall score. The old 0 to 25 profile and its weighted overall
  are gone; a single figure on a scale is what gets copied into a spreadsheet
  and compared across people.
- **The moves are what a module can count.** A move scores only when the
  signal was in front of the trainee; nothing is scored against the hidden
  cause (`outcome.js`).
- **The profile picks the order.** The trainee's "want to work on" areas
  come first, their seat's leanings next, the rest in the written order, and
  what they called a strength last, as a check. The coach can open any
  module.
- **The LBA and the Five Principles are lookups**, carried on each area for
  the pilot's comparison with the author's Leadership Behaviour Assessment
  and for the Northbound remake. Names only; no item text is in this
  repository.

## The areas

Twenty areas on the morning of 2026-11-04; B5, B6 and E4 added the same
evening from the author's note on internal customers, hidden rework and the
ERP (`FRAME-three-more.md`). Twenty-three now.

| Id | Area | The moves | Engine | Modules |
|---|---|---|---|---|
| **A. Running the work** | | | | |
| A1 | Prioritisation | Spends hours on what moves the goal; refuses low-value work out loud; protects time for the important thing that is not urgent | ready | The week |
| A2 | Time and interruptions | Keeps the week inside forty and still acts; notices what pushed the week over; does not let the floor take the whole week | ready | The week |
| A3 | Planning and capacity | Reads the forecast before committing; covers a gap that is coming; gives the scheduler honest numbers | small | (scored in every module, unrated) |
| A4 | Delegation | Sees what only they are holding; hands over a real piece of the job; does not take it back at the first wobble | ready | Pulled off the floor |
| **B. Flow and systems** | | | | |
| B1 | Finding the bottleneck | Looks at where work waits; spends improvement hours on the constraint; rechecks when it moves | ready | Where it waits |
| B2 | Lean tools | Picks the tool that fits; builds it with the crew; sets up the audit that keeps it alive | new | none yet: *It looked great for a week* |
| B3 | Root-cause problem solving | Investigates before fixing; fixes the cause, not the symptom; changes course when a fix does not hold | ready | Firefighting |
| B4 | Metrics and data | Reads leading signals; spots a measure being gamed; changes the measure, not just the people | new | none yet: *The number on the board* |
| B5 | Hidden rework | Counts the rework nobody counts; puts the answer where they would find it; does not do the rework faster | ready | Say it once |
| B6 | The system | Traces a job past the screen they use; fixes the entry where it happens, not the report; does not keep a second system | ready | What the system sees |
| **C. Quality and safety** | | | | |
| C1 | Holding the standard | Keeps the standard when the number is short; makes an exception visible and temporary; takes it back when the pressure ends | ready | Rush week |
| C2 | Safety | Goes and looks on the first report; makes it safe before it is fixed; closes the action | ready | none yet: *The near miss* (scored in The week, unrated) |
| C3 | Quality at the source | Traces a defect to where it was made; feeds back upstream; does not let rework hide the cause | ready | The other side |
| **D. People** | | | | |
| D1 | Coaching and development | Coaches early, at the bench; asks before acting on someone; fits the help to the reason | ready | Pulled off the floor |
| D2 | Accountability | Finds out why before acting; fits the response to the cause; holds the line when it is a choice | ready | The late one |
| D3 | Conflict | Hears both sides first; fixes the work or the gap, not the flare; sets out how people treat each other when that is the problem | ready | The loop |
| D4 | Training and onboarding | Answers a new hand at the bench; teaches the reason; checks understanding | ready | The new hand |
| **E. Up and across** | | | | |
| E1 | Leading up and decision rights | Finds out whose call it is; makes the calls that are theirs; uses the chain | ready | Nobody upstairs |
| E2 | Working across | Goes across before going up; fixes the handoff, not the blame; agrees one standard at the interface | ready | Across; The other side |
| E3 | Leading change | Explains the why before the what; involves the sceptics; keeps the change alive | new | none yet: *Nobody asked for this* |
| E4 | Internal customers | Asks the receiver what they need; delivers what was needed, not what was asked for; measures by the receiver's week | ready | Who you work for |
| **F. Meetings and self** | | | | |
| F1 | Running a huddle | Starts on time; every action gets an owner; handles the derailer | ready | Monday, 7:00 |
| F2 | Self-management under pressure | Notices own load and pulls back; does not grind past useful; recovers the week | ready | (scored in every module, unrated) |

"Engine" says whether the current engine can run a module on the area today
(**ready**), needs a small addition (**small**), or needs a new mechanic
(**new**). A new mechanic gets a numbers-only kill gate in `prototypes/`
before any content, as the first one did.

## The re-tag of the eight built modules

Done 2026-11-04. The mechanics did not change, and the module gate proved it:
100 seeds per style, every win rate identical to the run before the change.
What changed is what the end report counts:

| Module | Was scored on | Now reads |
|---|---|---|
| The week | Accountability, Emotional Awareness, Impulse Control, Early Coaching, Cross-Functional, Basic Empathy | A1 Prioritisation, A2 Time and interruptions |
| The late one | Basic Empathy, Accountability, Emotional Awareness | D2 Accountability |
| The loop | Recurring Conflict Resolution, Respect, Emotional Awareness | D3 Conflict |
| Firefighting | Openness to Improvement, Impulse Control, Early Coaching, Cross-Functional | B3 Root-cause problem solving |
| Pulled off the floor | Culture & Org. Influence, Early Coaching, Tone-Setting, and a "saw what only you were holding" point on every card | A4 Delegation, D1 Coaching and development |
| Nobody upstairs | Accountability, Cross-Functional, Emotional Awareness, Respect | E1 Leading up and decision rights |
| Rush week | Accountability, Tone-Setting, Cross-Functional | C1 Holding the standard |
| Across | Cross-Functional, Peer Conflict Prevention, Respect | E2 Working across |

Two scoring changes beyond the re-tag, both small:
- *The week* now scores prioritisation from the inbox: saying no to the wire
  rep, the town hall and the gas supplier (requests the text marks as
  optional) is a move; putting off one of your own people or a safety item
  is a miss. Deadlines are a trade and score nothing. Before this, nothing
  in the module scored the thing the module is about.
- *Pulled off the floor* lost the padding point ("saw what only you were
  holding") that rode beside every real delegation move; it double-counted.

How the bots read on the new scale, 100 seeds each (`tools/_reads.mjs`, a
scratch script, the day it was run): on every module the balanced and coach
styles read Solid on the module's focus 87 to 100% of the time and the
firefighter and ignorer read Not yet 80 to 100%, with two exceptions worth
knowing. In *Rush week* the coach reads Not yet (it coaches through the
shortcuts instead of refusing them, and loses the module 100% of the time,
which the gate already showed). In *Nobody upstairs* the coach reads Not yet
52% (it asks before acting but then makes calls that were not its to make).
Both are the scoring telling the truth about that style, not a scoring fault.

## The next modules, in order

*Where it waits* (B1), *Monday, 7:00* (F1) and *The new hand* (D4) were built
2026-11-04 (`FRAME-three-modules.md`), then the three seats
(`FRAME-seats.md`), then *The other side* (E2 and C3, from the author's note:
"forcing some people to see the other departments pov from time to time would
actually be a really good training tool"; `FRAME-other-side.md`), then *Who
you work for* (E4), *Say it once* (B5) and *What the system sees* (B6) from the
author's note the same evening (`FRAME-three-more.md`). Next: *It looked
great for a week* (B2), *The near miss* (C2), *The number on the board* (B4),
*Nobody asked for this* (E3).
