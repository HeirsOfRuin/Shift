# Frame: the seats

The author, 2026-11-04: "1 and then 2. keep this project moving." Decision 2
in `FRAME-departments.md` was the three seats before the seven departments:
"A lead hand's and an operations manager's screens differ in what they can
do (no discipline; no welding yourself), not in which bay they stand in."

## The problem with what exists

Beta 3's profile takes any seat, and then every module puts the trainee in the
welding supervisor's chair and says so. A lead hand playing *The late one*
writes Brent up. A lead hand cannot write anybody up. The screen is honest
about it and still wrong for them: the lesson a lead needs from that module
is what to do when the move you want is not yours to make.

## The design rule

A seat changes what the player can do and what their hours are for, never
which bay they stand in or what the floor does. Same modules, same hidden
causes, same crew; a different set of options on the cards, a different
standing week, and one extra thing the module reads.

## The lead hand's seat (built, beta 5)

**The world.** Kev Dueck got the supervisor's job in the spring. The player
is the new lead hand, at fit-up, in Kev's old spot, with Lyle beside them.
Kev's door is open. Dana is two levels up and mostly a name.

**Hours.** A lead hand works the table. The floor's hours are the table (24)
plus walk-ups (4) plus the fallout of open problems, as before. Every hour
spent leading (the standing week, the tickets) comes off the table unless
the lead stays past forty to make it up, and the table is a third of
fit-up's output. The hours bar shows "At the table" shrinking as the week
fills. That is the lead's scarce resource from `SPEC.md`, made visible: the
crew's trust, bought with hours that were supposed to be brackets.

**Authority.** Problem actions marked `needs: 'supervisor'` (write someone
up, change a start time, give two days off, write up a new hire) are not on
the lead's card. In their place is one action: *Take it to Kev with what you
know.* It lands the next week. If the lead found out the cause, Kev does the
fitting thing his way and tells them after. If the lead brought nothing but a
complaint, Kev asks what they found out, and nothing happens. Scripted
options that need a signature (a Saturday) become *Ask Kev*, and Kev usually
says yes.

**The standing week.** Huddles (the lead runs them), the safety walk, the
paint door, and ten minutes with Kev at the end of each day. No production
meeting, no timecards, no capacity numbers for Jess: those are Kev's now.

**What the module reads.** The module's focus, plus E1 *Leading up and
decision rights* as the seat's own area: took it up with the facts, took it
up with nothing, sent up something that was theirs to handle.

**Which modules.** Eight of eleven play from the lead's seat: The week, The
late one, The loop, Firefighting, Rush week, Where it waits, Monday 7:00, The
new hand. Three are the supervisor's by their nature (Pulled off the floor
is about leaving Kev in charge; Nobody upstairs is a supervisor's decision
rights; Across is supervisor to supervisor). The track says so on the rung
instead of hiding them.

## The operations manager's seat (not built; framed)

The manager runs supervisors, not crews. Every problem on the welding floor
reaches Dana through the welding supervisor, and Dana's options are: coach
the supervisor to handle it (slow, and the supervisor grows), tell them
exactly what to do (fast, and they stop deciding), go down and fix it herself
(fastest, and the supervisor learns that she will), or leave it with them.
The scarce resource is the supervisor's capability (`PLAN.md`, the Manager
track: "which grows only when you stop solving their problems"), and that is
a new quantity with its own dynamics: it needs a numbers-only kill gate
before content, as the first loop did. It is the next frame, not this one.
Until it is built, a manager profile plays the supervisor's chair and the
brief says so.

## What will be measured

| Claim | Instrument | Pass |
|---|---|---|
| The lead seat's modules pass the gate | `npm run gate` runs every lead-capable module in both seats, 100 seeds per style | The five conditions, per seat |
| The supervisor seat did not move | Gate before and after, same seeds | Identical |
| Leading up with facts is the separating move | The documenter bot takes everything to Kev without asking; its win rate and E1 read against balanced | Documenter well below balanced on E1 |
| Table time is a real cost | Balanced bot's fit-up output in the lead seat against the supervisor seat | Lower, and the schedule still met most seeds |
| Nothing a lead reads is a raw token or a supervisor's line | `test/text.test.js` runs both seats | Green |

## Status

Built 2026-11-04 as beta 5: the lead hand's seat on the welding bay, eight of
eleven modules. Numbers are the module gate at 100 seeds per style; the
supervisor seat's numbers are identical to beta 4 on every module.

| Module, lead seat | Balanced | Coach | Documenter | Firefighter | Doing nothing |
|---|---|---|---|---|---|
| The week | 89% ±3 | 73% ±4 | 80% ±4 | 69% ±5 | 15% ±4 |
| The late one | 61% ±5 | 61% ±5 | 22% ±4 | 26% ±4 | 23% ±4 |
| The loop | 82% ±4 | 60% ±5 | 0% ±1 | 0% ±1 | 11% ±3 |
| Firefighting | 85% ±4 | 86% ±3 | 34% ±5 | 13% ±3 | 11% ±3 |
| Rush week | 79% ±4 | 0% ±1 | 41% ±5 | 0% ±1 | 10% ±3 |
| Where it waits | 86% ±3 | 42% ±5 | 42% ±5 | 67% ±5 | 16% ±4 |
| Monday, 7:00 | 76% ±4 | 76% ±4 | 36% ±5 | 7% ±3 | 7% ±3 |
| The new hand | 74% ±4 | 74% ±4 | 16% ±4 | 14% ±3 | 13% ±3 |

What the build taught, in the order it was found:

- **The standing week does not come off the table.** The first cut took
  huddles, the safety walk, the paint door and the handover out of the lead's
  table time as well as the tickets. Every week ran over forty and the lead
  read Not yet on time management in every module. Huddles and handovers
  happen at the edges of the day; only what the lead chooses to do comes off
  the table. The table is 22 hours, walk-ups 3.
- **A lead who welds a booth empties their own table.** The balanced bot's
  two days in a booth, right for a supervisor, starved fit-up in the lead's
  seat and lost Rush week 72% of the time. One day is the lead's number. That
  is the seat's lesson made measurable: the lead's hands are a third of
  fit-up.
- **Holding the line costs a lead something it does not cost a supervisor.**
  Needed so that no style was best on every axis in Rush week, and true:
  every shortcut a lead refuses costs the crew's morale a little (0.012),
  with a Friday line the first time. The firefighter and the ignorer, who
  allow everything, are liked more and ship less.
- **The seat's own area is read only when something needed a signature.**
  E1 appears beside the module's focus when the run had a take-it-to-Kev
  decision in it; in modules where nothing needs the supervisor it does not
  appear, instead of reading Not enough seen on every run.
- **Leading up with facts is the separating move.** In The late one, the
  documenter takes everything to Kev before asking Brent anything and reads
  Not yet on E1 88% of runs, winning 22%; balanced asks first, takes it up
  with the cause, and wins 61%, the same as in the supervisor's seat.

The operations manager's seat is framed above and not built; a manager's
profile plays the supervisor's chair and the brief says so.
