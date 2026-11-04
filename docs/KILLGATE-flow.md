# The flow rounds kill gate

Run 2026-11-04. The author: "It'd be really nice to have some sort of
inspiration from the Lego Plane lean exercise."
`node prototypes/flow/run.mjs --runs=100`. Numbers only.

## The inspiration, and what is taken from it

The plane exercise lean trainers run with toy bricks: a team builds the same
small aircraft in rounds. Round one runs the old way: big batches, each
station pushes everything it makes to the next, inspection at the end. The
facilitator counts output, work in progress, lead time and defects found
late on a flip chart. Between rounds the team changes one rule (smaller
batches, a pull signal, each station checking its own) and runs again. The
lesson is in the flip chart: the numbers move when the right rule changes,
and they do not when the wrong one does.

What Shift takes: rounds, three rules, the numbers on a board each Friday,
and one change at a time. What it does not take: the brand, the bricks, or
the planes. In the game it is Priya's "flow rounds" in the welding bay, and
a round is a week.

## The question

Does a loop where batch size, push or pull, and where defects are caught
each matter for a hidden reason, and where changing several rules at once
costs a compounding learning dip, separate supervisor styles with none
dominant? If not, the module is not built.

## The model in one paragraph

Eight rounds; paint wants six bodies a round. Fit-up 6.6 a round, weld 6.0,
finish 6.8. Three rules start the old way: batch of 6 (a full rack), push,
check at the end. One hidden cause per run: **batch** (a setup error ruins a
whole rack: more defects while the batch is 6), **push** (the clogged aisle
and the wrong parts cost weld about one body a round while there is no pull),
**late** (defects caught at finish cost rework there and escape to paint
while checking is at the end), or **fine** (20%: nothing is wrong with the
rules this month; any change only costs the dip). Changing a rule costs two
hours and a dip that round (0.9); two at once compound (0.78, and 0.92 the
round after); three (0.66, then 0.82). A changed rule slides back to the old
way by Friday one time in five. Reading a round (two hours: where WIP piles,
where defects are found) names the cause 65% of the time, the wrong rule 20%
(a pile of WIP is ambiguous), nothing clear 15%. Eight free hours a round;
one round in five is a rush with two. The win, as every module has it: 44 of
48 bodies, paint never short two rounds running, and the cause settled.

## The five styles

| Style | Policy |
|---|---|
| pusher | Welds a booth every round to make the number; never changes a rule |
| changeAll | Changes all three rules in round one |
| inspector | Moves checking to each station, because quality must be the problem |
| leaver | Changes nothing |
| balanced | Reads a round; changes the one rule it points at; reads the next round to see whether it took; reads again if the number did not move |

## Results, 100 seeds per style

| Style | Win | Cause fixed | Paint starved | Bodies (of 48) | WIP in the bay | Rules changed | Hours a week |
|---|---|---|---|---|---|---|---|
| pusher | 20% ±4 | 20% ±4 | 0% ±1 | 47.3 | 3.5 | 0.0 | 6.6 |
| changeAll | 69% ±5 | 85% ±4 | 26% ±4 | 44.9 | 2.5 | 2.8 | 0.7 |
| inspector | 43% ±5 | 43% ±5 | 16% ±4 | 45.7 | 4.5 | 1.0 | 0.3 |
| leaver | 20% ±4 | 20% ±4 | 25% ±4 | 44.1 | 4.6 | 0.0 | 0.0 |
| balanced | 84% ±4 | 92% ±3 | 7% ±3 | 46.6 | 3.7 | 1.2 | 0.8 |

- PASS styles diverge (spread 64 points)
- PASS no style best on every axis (win, bodies, WIP, hours)
- PASS balanced wins most, not all (84% ±4, want 50-90%)
- PASS leaving it loses most, not all (20% ±4, want 3-40%)
- PASS changing everything at once fixes the cause most of the time and still loses more than balanced (fixed 85% ±4, won 69% ±5, starved 26% ±4)
- PASS nothing beats balanced beyond the noise

## What the numbers say, in plain words

- **The pusher ships the most bodies and wins 20%.** Welding a booth every
  round makes the number; the cause is still there at the end. That is the
  first lesson of the plane exercise: round one's output can be made to look
  fine by heroics, and the flip chart's WIP column does not lie.
- **Changing everything fixes the cause 85% of the time and starves paint
  26% of the time.** Three new ways in one round is a crew that does not know
  which way it is working. And when it works, nobody knows which rule did it.
- **The inspector wins when the cause was late checking (about a quarter of
  runs) and in the fine month**, and loses the rest: the right tool for one
  problem out of three.
- **Balanced wins 84%** by doing what the exercise teaches: measure a round,
  change one thing, measure the next. It loses where the round was misread
  twice or a rush week landed on a dip.

## How it got here (four runs)

1. The pull rule capped fit-up's rack before welding drew from it, so
   welding never got more than two bodies a round, and changing everything
   shipped 16 of 48. A bug, not a lesson; fixed.
2. The win counted bodies only: welding a booth every round won 100%. Every
   module's win includes the cause settled; the gate now does too.
3. Reading a round was always right, so balanced won 99%. A pile of WIP is
   ambiguous: the read now misses one time in five, changed rules slide back
   one time in five, and balanced has to read the next round to check.
4. Passes as above.

## The module it became (beta 11)

*Round two* (`roundtwo`, B7 Flow, supervisor and lead seats). Priya wants to
run the bay as rounds for eight weeks, the way she ran the toy-plane
exercise at the CI conference. The week screen carries **the board by
fit-up**: the three rules as chips, and one row a round with bodies against
asked, work waiting, days from cut to paint, a bar for defects found late,
and which rule changed that round (and whether it slid back). The problem
card holds the moves: read the round; batch of one; the two-slot rack; each
station checks its own; or change all three at once. A rule changed costs a
learning dip that compounds; one in five slides back by Friday, and the
Friday report says so; the root fix holds only after the fitting rule has
stayed two rounds; a second read after a change that did not move the
numbers corrects a misread first read. Two cards: who fills in the board
(the crew, or you), and Jess's rush round in week four (hold the rules, or
go back to the old way for a week). For a lead hand, the rule changes are
Kev's: the lead reads the round and takes it to him.

Module gate at 100 seeds per style, first run, both seats:

| Seat | Balanced | Coach | Documenter | Firefighter | Doing nothing |
|---|---|---|---|---|---|
| Supervisor | 79% ±4 | 66% ±5 | 33% ±5 | 16% ±4 | 16% ±4 |
| Lead hand | 60% ±5 | 16% ±4 | 16% ±4 | 15% ±4 | 15% ±4 |

The coach bot, which changes everything the crew suggests in round one, wins
66% to balanced's 79% and settles the cause 81% of the time to balanced's
99%: the kill gate's lesson, carried. The documenter checks at the source
whatever the round says, and wins in the runs where that was the cause.

## Carried into the engine

`dept.flow` (the three rules), the learning dip and the slide-back, a
problem type whose root fix holds only after the fitting rule has stayed in
place two rounds, a re-read that corrects a misread, a "change all three"
option for the player who wants to, and a round-results board on the week
screen: bodies, WIP, lead time in days, defects found late, and which rule
changed, every round.
