# Frame: the three new modules

The author, 2026-11-04: "1 and then 2. keep this project moving. I think
forcing some people to see the other departments pov from time to time would
actually be a really good training tool as well!"

Decision 1 was the order from `FRAME-departments.md`: the three new modules
first, the three seats second. This frame is the three modules.

## The problem with what exists

Three of the eight topics in the 2026-11-02 brief had no module: understanding
systems, facilitating meetings, and employee development from day one
(`REVIEW.md` 2.1). The catalogue has areas for them (B1, F1, D4) with no
module behind any of them.

## The design rule

Each module trains one focus area and keeps the floor alive around it: a hidden
cause drawn per run, one passing cause so doing nothing is sometimes right, a
background problem, and the inbox. The same engine; a module is content plus
one problem type.

## The three modules

| Module | Focus | The problem type | Hidden causes (one passes) | The right move depends on |
|---|---|---|---|---|
| **Where it waits** | B1 Finding the bottleneck | `constraint`: paint is short and everyone in the building says body weld | fit-up (brackets late), body weld, finish (the inspection bench), **the product mix** (passes when the Rescues ship) | Looking at where work waits. Improving any other station changes nothing. When the constraint is fixed it moves, and the player has to look again. |
| **Monday, 7:00** | F1 Running a huddle | `huddle`: the five-minute huddle runs fifteen and goes sideways, mostly through Brent | habit, a real parts problem, nobody listens to him otherwise, **the new forklift route** (everyone has an opinion for two weeks, then it passes) | Asking Brent after the huddle. A parking lot fixes habit; the parts problem needs Raymond; the unheard one needs the floor, first. Shutting him down in front of the crew goes quiet and comes back worse. Plus six scripted huddle moments: the late one at seven, a problem that needs an owner, the silent one, Dana's twenty-minute add-on, the dead board, a safety item raised standing up. |
| **The new hand** | D4 Training and onboarding | `newhand`: Sam started Monday at fit-up in Lyle's spot (Lyle is on parental leave for the module) | nobody taught him the reason, he is afraid to ask and hides mistakes, he is being rushed, **he is a week in** (passes) | Sitting with him first. Teaching the reason needs two sessions, and the second is the check that it landed. Pairing him with Kev fits the afraid one. A sheet instead of a person does nothing. A write-up in his first month sends him looking elsewhere. |

### Engine additions

- `week_.stationMul`: a per-week multiplier per station that a problem can set.
  The constraint problem sets its station to about 0.7; a fixed station keeps a
  +0.1 improvement for the rest of the run (`dept.improved`).
- `setup.swap`: a module can replace one crew member with another for its
  length (Lyle out, Sam in). The brief's crew strip and the bay follow.
- Scripted cards with cue `huddle` for the bots: balanced, coach and
  documenter hold the structure, the firefighter lets it run, the ignorer takes
  the default.

### What is skipped, and why it is not silent

The workshop asks for a numbers-only prototype for a new mechanic. The three
problem types are built straight into the engine instead, because the engine
is already numbers-only in Node, the five bots already play it, and the module
gate is the kill gate's five conditions on the same bots at 100 seeds. The
numbers below are that gate.

## What will be measured

| Claim | Instrument | Pass |
|---|---|---|
| The styles diverge on each module and none dominates | `npm run gate`, 100 seeds per style | Balanced wins 50 to 90%; ignorer wins 3 to 40%; no other style beats balanced beyond the noise |
| Looking before improving matters in Where it waits | The coach bot improves what the crew says (body weld) without looking; its win rate against balanced | Coach well below balanced |
| The read on each module's focus separates the styles | `tools/_reads.mjs` (scratch) | Balanced reads Solid most runs; ignorer reads Not yet most runs |
| Nothing a player reads is a raw token, for every module and every bot | `test/text.test.js` | Green |
| The eight existing modules did not move | The gate before and after, same seeds | Identical win rates |

## Status

Built 2026-11-04 as beta 4. Module gate, 100 seeds per style, all five
conditions pass on all three; the original eight modules' numbers are
identical to the run before.

| Module | Balanced | Coach | Documenter | Firefighter | Doing nothing |
|---|---|---|---|---|---|
| Where it waits | 87% ±3 | 42% ±5 | 40% ±5 | 63% ±5 | 15% ±4 |
| Monday, 7:00 | 76% ±4 | 75% ±4 | 35% ±5 | 7% ±3 | 7% ±3 |
| The new hand | 74% ±4 | 73% ±4 | 10% ±3 | 15% ±4 | 14% ±3 |

Reads on each module's focus, 100 seeds: balanced reads Solid 100% on all
three; firefighter and ignorer read Not yet 97 to 100%. The coach reads Not
yet 100% in *Where it waits* (it improves what the crew says, body weld,
without looking) and Solid in the other two, where its policy is the
balanced one. The documenter reads Solid 38% in *Monday, 7:00*: it holds every
scripted huddle moment and puts up a parking lot for everything, which is
right when the cause is habit.

Two things to know. The firefighter gets through *Where it waits* 63% of the
time by improving station after station until the number moves, at 41 to 52
hours a week; its read is Not yet every time, because it found the constraint
by paying for every station. That is a true thing about firefighting and the
gate allows it. And the coach and balanced bots play *Monday, 7:00* and *The
new hand* the same way, so those two modules do not separate a people-first
style from a balanced one; the gap there is between asking and not asking.
