# Frame: Pulled off the floor, rebuilt

Beta 14, 2026-11-05. The first thing the breadth check (`FRAME-coach.md`)
recommended building, and the author's "Then start the next beta".

## Why

The audit of beta 11 found one module weaker than the rest. *Pulled off the
floor* was scripted: four "develop" cards in weeks one and two, each a
hand-over-or-keep choice, no hidden cause. Doing nothing won 40% of the time,
the top of the gate's allowed band, and a tester who had played any other
module would feel the difference: the other sixteen ask you to find out
before you act; this one only asked whether you would hand things over.

## The rebuild

A problem type, `bench`, on Kev, seen from week one, on the pattern every
other module uses (`problems.data.js`, `problems.js`):

| Hidden cause | Weight | What it is | The fitting move |
|---|---|---|---|
| unshown | 0.30 | He has watched you do Jess's numbers and the huddle a thousand times and never done either | Hand him both and sit beside him the first time |
| unseen | 0.25 | The crew goes round him to you, and you change his calls without telling him | Say it at the huddle with him beside you, and stop re-deciding what he decides |
| wontAsk | 0.25 | He knows the job and not the hard conversations, and he will not ask, because asking looks like not knowing | Walk him through them, step by step |
| ready | 0.20 | He is ready; the one not ready to let go is you | Nothing; asking tells you so |

A story: wontAsk shows as unshown 40% of the time (he says "the numbers"
because that is easier to say than "the third-late conversation").

Other moves: a handover sheet (helps a little, only for unshown), doing
everything yourself before you go (the floor is tidy for a week and Kev
learns again that you do it), and "call me with anything" (he will: two
calls a week in the audit room, both his to make).

What the cause does while you are away (weeks three to five, eighteen hours
of meetings): the gap you did not find lands on him. Kev's strain rises, the
floor slows, and in a given week there is a 45% chance of the specific
failure the cause produces (wrong numbers to Jess and an ownerless huddle;
the crew walking past him to the audit room door; a conversation not had),
which is a trace entry, and a trace entry during the away weeks is the loss
condition the module has always had. A ready lead resolves himself by the
second week whether you asked or not.

What did not change: the away mechanic (`leadWhileAway`), the eighteen-hour
weeks, Marisol's finish-checks card, the second problem in week three, the
held goal and its end check. The module's focus stays A4 Delegation and D1
Coaching; the generic "found out before acting" move scores to D1 here
(asking the lead what worries him is coaching), the fixes to A4.

## What was measured

The module gate at 100 seeds, before and after:

| Style | Before | After |
|---|---|---|
| firefighter | 60% | 16% |
| documenter | 53% | 15% |
| coach | 82% | 73% |
| ignorer | 40% | 13% |
| balanced | 82% | 76% |

All five conditions pass. The spread went from 42 points to 63. Doing
nothing fell from the top of the band to near the bottom, because the floor
no longer holds on a bench of 0.3 by luck: whatever was wrong with Kev goes
wrong without you. The firefighter does everything himself before he goes
and then takes the calls; the documenter writes a sheet. Neither finds out.

Kev's strain in the away weeks was set at 0.6 a week and softened to 0.4
after the first run: at 0.6 the ignorer lost a person four runs in five,
which read as punishment rather than consequence; at 0.4 it is one in four
kept, which is what three weeks of unowned floor would do.

The text test plays the module with every bot and finds no raw token; every
cause has its know line and its told line.

## What the author should check

Play it once as the ignorer would, and once asking first. The two Fridays
in week four should feel like different modules.
