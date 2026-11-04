# Frame: internal customers, hidden rework, and the system

The author, 2026-11-04: "More I want this to cover is helping people explain
the idea of internal customers, rework being beyond parts (like have to have
the same conversation multiple times or causing people to search for
information they should have had), how ERPs work and how much more work
there is beyond the interface production staff can see and manipulate (this
one should be aimed at Epicor and how PhiBer uses it)"

## The rule, first

`CLAUDE.md`: nothing in this repository identifies the author's employer.
So the third module teaches how an ERP works beyond the screens production
staff touch, with the structure and vocabulary of Epicor (jobs, operations,
clocking on and off, material issue, backflush, MRP, closing jobs), in the
fictional plant, and the system's name comes from the trainee's profile. At
the author's plant the screens say "Epicor"; in this repository they say
"the system". What the plant does with it is what the coach brings to the
debrief; the debrief questions point at "your plant's system".

## The problem with what exists

Three things every supervisor deals with and no module names: that paint,
the scheduler and maintenance are customers with needs that differ from
their requests; that rework is not only parts; that the system behind the
schedule is fed by what the floor enters, and starves on what it does not.

## The design rule

Same engine, one problem type per module, a hidden cause with one passing
cause, the floor alive around it. The catalogue grows by three areas, one
each, and each module reads its own.

## The three modules

### Who you work for (E4 Internal customers)

Paint is the customer the player can see. Theresa's handover note (in *The
other side*) listed timing, order and travellers; this module makes them the
problem. The `customer` type: "what paint actually needs from welding."
Hidden causes: **timing** (paint needs bodies by two to cure overnight;
welding sends at four), **order** (paint needs them in the schedule's order;
welding sends what is easiest), **info** (paint needs the traveller filled in:
colour code, rework notes; welding sends blanks), and the passing one,
**theirs** (paint's own booth schedule slipped; nothing welding sends changes
it). Actions: ask Theresa what paint needs, in her words; move the handoff to
two; send in the schedule's order; fill in every traveller before the door;
send more bodies, earlier (the wrong measure, made bigger); tell Dana paint
is never happy. Two scripted cards: Jess's numbers (give her your format, or
ask what she does with them) and a maintenance work order (write "the
extractor is loud", or write what maintenance can act on). The reads: asked
the receiver what they need; delivered what was asked for instead of what
was needed; measured by the receiver's week.

### Say it once (B5 Hidden rework)

The walk-up hours on the bar (seven a week) are the symptom. The `infowork`
type: "the same question, four times a day." Hidden causes: **board**
(the day's plan lives in the player's head; nothing on the board), **travellers**
(the job travellers from engineering are missing the rev, so people ask),
**youAnswer** (the player answers every question instead of pointing at where
the answer is, so they ask), and the passing one, **newMix** (a new variant this
month; the questions stop when it is familiar). Actions: keep a tally for a
week of who asks what; put the day's plan and the revs on the board every
morning; get engineering to put the rev on every traveller; answer "where
would you find that?" for a week; answer faster; send a memo. Fixed at the
root, the walk-up hours on the bar drop and stay down. Two scripted cards:
Brent asking for the third time whether Saturday is on (tell him again, or
put it on the board with the date), and Marisol's hour looking for the Hauler
roof rev (find it for her, or fix where drawings live). The reads: counted the
rework nobody counts; put the answer where they would find it; had the same
conversation a third time; did the rework faster.

### What the system sees (B6 The system)

The `erp` type: "Jess built next week on what the system said." The schedule
shows welding ahead; it is not; the scheduler, purchasing and paint plan off
the system's picture. Hidden causes: **lateEntries** (the crew clocks off jobs
on Friday for the whole week, so the system sees every job open until Friday
and then all done at once), **wrongOps** (the operations on the Hauler jobs are
in the wrong order from engineering, so the crew clocks onto whatever is
open), **noIssue** (the steel is never issued to the job, so the system shows
brackets in stock that are on the floor and purchasing does not reorder),
and the passing one, **upgrade** (the system was down over the upgrade
weekend and is catching up). Actions: sit with Jess and trace one job through
the system, screen by screen; clock on and off at the booth, every operation,
the day it happens, and show the crew why; get Ben to fix the operation
sequence; issue the steel to the jobs when it is cut; keep your own
spreadsheet and give Jess that; tell Dana the system is wrong. Open, Jess's
week holds a surprise every other week and the floor spends hours chasing
steel the system says is in stock. Two scripted cards: the system shows forty
brackets in stock and the rack is empty (walk over and count with Jess, or
tell her the system is wrong), and eleven jobs open in the system that are
already in paint (close them properly now, or let the office close them at
month end). The reads: traced a job past the screen you use; fixed the entry
where it happens, not the report; kept a second system; blamed the system for
what it was told.

The system's name: a new optional field on the profile, "What your plant
calls its system", used wherever the module names it. Default "the system".

## What will be measured

| Claim | Instrument | Pass |
|---|---|---|
| Each module passes the gate | `npm run gate`, 100 seeds per style, every seat it supports | The five conditions |
| The reads separate the styles | `tools/_reads.mjs` (scratch) | Balanced Solid most runs; firefighter and ignorer Not yet most runs |
| The twelve existing modules did not move | Gate before and after | Identical |
| Nothing in the content names the employer | Grep for the employer's name and product-specific process | None |

## Status

Built 2026-11-04 as beta 8. Module gate at 100 seeds per style, every seat
each module supports: all five conditions pass on the first run.

| Module | Balanced | Coach | Documenter | Firefighter | Doing nothing |
|---|---|---|---|---|---|
| Say it once | 80% ±4 | 86% ±3 | 39% ±5 | 16% ±4 | 14% ±3 |
| Say it once, lead seat | 80% ±4 | 86% ±3 | 35% ±5 | 16% ±4 | 14% ±3 |
| What the system sees | 80% ±4 | 80% ±4 | 15% ±4 | 16% ±4 | 13% ±3 |
| What the system sees, lead seat | 80% ±4 | 81% ±4 | 14% ±3 | 16% ±4 | 14% ±3 |

Reads, 100 seeds, supervisor seat: balanced reads Solid on the module's area
100% of runs in all three; the firefighter, the documenter and the ignorer
read Not yet 100%; the coach reads Getting there (it goes to the people
first and counts or traces second). In *Say it once* the coach bot wins 86%
to balanced's 80%, inside the noise floor: pointing people at the answer is a
fix for one of the four causes and a harmless week for the others.

The employer check: the only occurrence of the employer's name in the
repository is the author's quoted request at the top of this frame.
