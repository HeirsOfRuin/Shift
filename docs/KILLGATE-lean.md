# The lean tools kill gate

Run 2026-11-04, before *It looked great for a week* was built. The author:
"Keep going with the lean tools module, kill gate first."
`node prototypes/lean/run.mjs --runs=100`. Numbers only, no interface, no
engine.

## The question

Northbound's own line: a tool dropped into a broken leadership environment
produces a well-organised broken environment. A 5S event is alive the week
it is done and decays after. Does a loop where the improvement decays without
an owner and an audit, and where re-running the event is the cheap-looking
move, separate supervisor styles with none dominant, and show the
well-organised broken environment as a number? If not, the module is not
worth building.

## The model in one paragraph

Twelve weeks. `alive` is how much of the improvement is still standing, 0 to
1; the event sets it to 0.9. Every week it decays: 0.12 with nobody owning
it, 0.04 with an owner, half that again if the event was done with the crew
rather than for them, with week-to-week noise. An audit that week halves the
decay again and tops it up: by 0.08 with an owner, by 0.03 without one
(without an owner the audit finds the same things every week and the crew
waits for it). While it is alive the floor's hours drop by up to three a week:
nobody is looking for the gap gauge. The supervisor has eight free hours a
week, less the fallout of an unrelated problem in weeks four and eight; one
week in five is a rush and the free hours go. The event costs 6 hours, 8 with
the crew; naming an owner 1; an audit 1. One seed in five, a natural owner
emerges in the crew in week two. The win: alive at or over 0.55 at week
twelve, with the event run at most twice.

## The five styles

| Style | Policy |
|---|---|
| eventer | Runs the event in week 1 and again whenever it falls under 0.4 |
| auditor | Runs the event, then audits every week herself; never names an owner |
| delegator | Runs the event, names an owner in week 2, never audits |
| leaver | Runs the event and leaves it |
| balanced | Runs the event with the crew, names owners in week 2, audits weekly to week 5 and every other week after |

## Results, 100 seeds per style

| Style | Win | Alive at week 12 | Weeks alive | Events run | Audits | Hours spent | Floor hours saved |
|---|---|---|---|---|---|---|---|
| eventer | 16% ±4 | 0.61 | 65% | 2.6 | 0.0 | 15.4 | 21.3 |
| auditor | 18% ±4 | 0.37 | 50% | 0.9 | 8.9 | 14.3 | 19.5 |
| delegator | 10% ±3 | 0.29 | 49% | 0.9 | 0.0 | 6.2 | 17.1 |
| leaver | 10% ±3 | 0.08 | 30% | 0.9 | 0.0 | 5.3 | 10.2 |
| balanced | 81% ±4 | 0.85 | 88% | 0.9 | 6.5 | 14.5 | 30.2 |

- PASS styles diverge (spread 71 points)
- PASS no style best on every axis (win, alive, hours spent, hours saved)
- PASS balanced wins most, not all (81% ±4, want 50-90%)
- PASS leaving loses most, not all (10% ±3, want 3-40%)
- PASS the eventer re-runs the event and is alive less of the time than balanced (2.6 events, alive 65% of weeks against 88%)
- PASS nothing beats balanced beyond the noise

## What the numbers say, in plain words

- The eventer's bay is alive at week twelve (0.61) and looks about as good as
  the balanced one on the day Dana walks through. It was alive 65% of the
  weeks against 88%, it cost 2.6 events and the most hours, and it wins 16%.
  That is the well-organised broken environment: a tool re-applied every
  five weeks to a floor that does not own it.
- The auditor holds it up by hand and wins 18%: audits without an owner are
  a treadmill, and the week she cannot audit, it slips.
- The delegator names an owner and walks away: 10%. An owner with no audit
  is a name on a wall.
- The leaver wins 10%, every one a seed where the crew produced its own
  owner, which happens.
- Balanced wins 81% at the same hours as the auditor, with one event and six
  audits, because the crew chose where things go and somebody's name is on
  each area.

## How it got here (three runs)

1. The event done with the crew cost more than the week had: balanced never
   ran it and won 0%. The unrelated fallout moved off week one.
2. No noise and a 0.6 line: balanced won 100% and the natural owner could not
   reach the line. Added a rush week in five, decay that varies, a 0.55 line,
   and the weeks-alive measure.
3. Passes as above.

## Carried into the engine

`dept.lean` (alive), `dept.leanOwner`, `dept.leanWith`, a Friday audit as a
standing-week item that appears once the audit is set up, the floor item
"Looking for the gap gauge, clamps, carts" at 3 hours times what has died,
and a problem whose fix is pending until it has held for two weeks.

## The module it became (beta 9)

*It looked great for a week* (`greatweek`, B2, supervisor and lead seats).
Priya's 5S event is two Fridays old and the gap gauge is in Brent's pocket
again. Hidden causes: nobody owns anything (30%), owners exist and nobody
checks (25%), the event was done for the crew and not with them (25%), and
the passing one, a new fixture rack landed in the taped area and everything
is displaced until it is bolted down (20%). Actions: walk the bay with the
crew and ask; put a name on every area, chosen by the crew; start a
five-minute Friday audit with the owner (it then appears in the standing
week, and skipping it costs); re-run the event with the crew; re-run it
yourself on Saturday; new labels and a memo. The decay runs every week as the
gate had it; `dept.lean` is on the hours bar as "Looking for the gap gauge,
clamps, carts: the event wearing off". A root fix is pending until the bay
has held two weeks; the end report also checks the bay is still standing at
0.55. Two cards: Priya's laminated 92-out-of-100 (sign it, or ask who owns
each area), and Dana walking Russ through in week six (show it as it is, or
blitz it Wednesday night).

Module gate at 100 seeds per style, both seats, after one change:

| Seat | Balanced | Coach | Documenter | Firefighter | Doing nothing |
|---|---|---|---|---|---|
| Supervisor | 80% ±4 | see below | 15% ±4 | 16% ±4 | 14% ±3 |

The first run had the coach at 87% and balanced at 26%: re-running the
event with the crew had quietly granted ownership for every cause, and the
balanced bot stopped at the one fitting fix while the bay kept decaying.
Now re-running with the crew gives the crew's ownership and nothing else;
the bay must still be standing at the end; and while a fix is settling, the
supporting moves (a name on it, a Friday audit) count. That is the gate's
lesson carried into the module: the owner and the audit are the tool.

## What the gate does not prove

One number for a whole bay; no crew, no schedule, no second problem. It
proves the loop separates the styles, not that the decay rate is right. The
module gate on the real floor is the test that counts.
