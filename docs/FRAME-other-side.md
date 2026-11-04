# Frame: The other side

The author, 2026-11-04: "I think forcing some people to see the other
departments pov from time to time would actually be a really good training
tool as well!"

## The problem with what exists

Every module stands the player in welding and lets them send bodies through
the paint door. Nothing lets them receive one. *Across* has them negotiate
with Theresa about the spatter; it does not make them sand it.

## The design rule

The point of view flips without a new floor. The player stays the welding
supervisor and keeps the welding bay; for four weeks they also run paint,
and what welding sends lands on their own desk as paint's rework. The lesson
is felt before it is read: the complaint you dismissed as "paint being
paint" is now your Tuesday.

## The module

**The other side** (`otherside`), supervisor seat, eight weeks, focus E2
*Working across* and C3 *Quality at the source*.

**The situation.** Theresa is away for four weeks (a wedding, a honeymoon,
the first holiday she has taken in six years). Dana asks the player to cover
paint as well as welding: paint's standing week comes to them (six hours a
week, weeks 2 to 5), and so do paint's kickback tickets, which are about the
player's own bodies.

**The problem type** `otherside`: your own bodies, from paint's side. Hidden
causes: the new flux-core wire the rep brought in (30%), Tyler rushing the
Rescue roofs (25%), no written spatter standard so finish passes what paint
will not take (30%), and the passing one: paint's new hire is being careful
and will settle (15%).

| Action | Hours | What it does |
|---|---|---|
| Spend a morning on paint's side of the door, with the kickback tickets | 2 | Finds the cause |
| Send your own bodies back to your own crew | 0.5 | Feeds it back upstream: the crew feels paint's side; a little less spatter for a week; morale dips; nothing fixed at the root |
| Have paint sand it, like Theresa does | 1 | Paint absorbs welding's rework; nothing fixed; the player has become the thing they complained about |
| Go back to the old wire | 0.5 | Fits the wire |
| Take Tyler off the Rescue roofs for a week and show him | 1 | Fits rushing |
| Write the spatter standard with Val, now that you stand on both sides | 3 | Fits no standard; one standard at the interface |
| Wave them through; Theresa can sort it when she is back | 0 | Goes quiet, comes back worse, and Theresa finds it her first week back |

Open, the problem adds paint's rework hours to the player's floor and
defects to the week. Two scripted cards: Theresa's handover note in week 2
(read it properly, and it names the three things she has wanted from welding
for a year; or skim it), and Theresa's return in week 6 (sit down with her
about what you saw, or hand paint back and move on).

**The reads.** E2: stood on the other side of the door; agreed one standard
at the interface; brought what you saw back across; left it for Theresa to
find. C3: traced the defect to where it was made; fed it back upstream; let
paint absorb welding's rework.

**Debrief.** What did your own bodies look like from the other side of the
door? Which of paint's complaints had you been filing under "paint being
paint"? On your real floor: whose output do you receive, and whose receives
yours, and when did you last stand on their side of it?

## What will be measured

| Claim | Instrument | Pass |
|---|---|---|
| The styles diverge and none dominates | `npm run gate --module=otherside`, 100 seeds per style | The five conditions |
| Looking from paint's side is the separating move | The firefighter (sands it in paint) and documenter (sends it back) against balanced | Both well below balanced |
| The read separates the styles | `tools/_reads.mjs` (scratch) | Balanced Solid most runs; firefighter and ignorer Not yet most runs |
| The other modules did not move | The gate before and after | Identical |

## What it is not

It is not a paint floor. The bay on screen stays the welding bay; paint is
the door on the right and the tickets that come back through it. A paint
floor with its own crew and sprites is `FRAME-departments.md`, and this
module is the cheap test of whether the point-of-view flip teaches anything
before that is paid for.

## Status

Filled in after the build.
