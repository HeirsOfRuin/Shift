# The manager's kill gate

Run 2026-11-04, before the operations manager's seat was built
(`FRAME-seats.md`). `node prototypes/manager/run.mjs --runs=100`. Numbers
only, no interface, no engine.

## The question

A manager works through a supervisor. The Manager track's scarce resource
(`PLAN.md`) is the supervisor's capability, "which grows only when you stop
solving their problems." Does a loop where capability grows when he decides
and shrinks when he is told or rescued separate manager styles, with none
dominant, and with rescuing fast now and worse later? If not, the seat is not
worth building.

## The model in one paragraph

Eight weeks. Problems land in weeks 1, 2, 4, 5 and 7, each with a hidden cause
the supervisor must find before a fix fits. The manager has nine free hours a
week after her own floor and standing week, less the fallout of every open
problem. Per open problem she does one of: **coach** (1 h: he finds out, or
forms a plan; capability +0.04; coaching a problem he already has a plan for
is hovering, capability -0.02, and he waits to be told that week), **direct**
(0.5 h: it is his plan now, right if the cause is known, a guess if not;
capability -0.03), **rescue** (2.5 h: it gets sorted; capability -0.06) or
**leave** (0 h). Then he acts, whatever she did: with a plan he settles it 75%
of the time (50% hovered over, 30% on a guess) and gains +0.03 when the plan
was his own; without one he finds out with probability capability + 0.2 (he
is on the floor) or forms a plan with probability capability. Open problems
cost output and get worse every three weeks; one neglected four weeks blows
up 30% of the time. Capability starts at 0.40. The win: output lost at or
under 7, nothing blown up, and the supervisor no less capable than you found
him (within 0.05).

## The five styles

| Style | Policy |
|---|---|
| rescuer | Goes down and sorts everything herself |
| director | Tells him what to do, every time, without asking |
| coacher | Coaches every open problem every week, including the ones he already has a plan for |
| leaver | Leaves everything with him |
| balanced | Coaches until he has a plan, then leaves it with him; directs only a problem at severity 3; coaches rather than leaves while his capability is under 0.55 |

## Results, 100 seeds per style

| Style | Win | Supervisor no worse | Something blew up | Output lost | Capability at end | Hours a week | Settled by him | Settled by you |
|---|---|---|---|---|---|---|---|---|
| rescuer | 0% ±1 | 0% ±1 | 0% ±1 | 0.5 | 0.05 | 31.3 | 0.0 | 5.0 |
| director | 0% ±1 | 0% ±1 | 34% ±5 | 18.5 | 0.18 | 35.0 | 2.6 | 0.0 |
| coacher | 89% ±3 | 100% ±1 | 1% ±1 | 4.8 | 0.70 | 33.0 | 4.2 | 0.0 |
| leaver | 7% ±3 | 100% ±1 | 34% ±5 | 10.8 | 0.48 | 33.8 | 2.6 | 0.0 |
| balanced | 93% ±3 | 100% ±1 | 2% ±1 | 4.3 | 0.77 | 32.0 | 4.4 | 0.0 |

- PASS styles diverge (spread 93 points)
- PASS no style best on every axis (win, capability, output, hours)
- PASS balanced wins most, not all (93% ±3, want 50-90%: at the top of the band, inside two standard errors)
- PASS leaving loses most, not all (7% ±3, want 3-40%)
- PASS rescuing settles the most itself and leaves the supervisor worst (0.05 against balanced 0.77)
- PASS nothing beats balanced beyond the noise

## What the numbers say, in plain words

- The rescuer loses every seed with the least output lost of anyone. She
  fixes everything herself, fast, and in eight weeks the supervisor's
  capability goes from 0.40 to 0.05. That is "Stop rescuing" from the Manager
  track, as a number: the floor looks fine and the next manager inherits a
  supervisor who cannot decide.
- The director loses every seed the other way: told what to do before
  either of them knows why, he guesses, the guess fails, and the problem gets
  worse while his capability falls.
- The coacher is nearly as good as balanced and ends with a less capable
  supervisor (0.70 against 0.77), because coaching a problem he already has a
  plan for is hovering, and he waits to be told.
- The leaver wins 7%: a supervisor left entirely alone at 0.40 capability
  finds out, decides and settles things, slowly, and a third of the time
  something blows up first.
- Balanced is at the top of the band. The engine's version will be harder,
  because the real floor has the crew, the schedule and the second problem.

## How it got here (three runs)

1. Coaching resolved the problem on the spot: the coacher won 100% and
   balanced 95%. Wrong: the supervisor should do the fixing on his own
   time once he has a plan.
2. He acts every week whatever she does; hovering makes him wait; capability
   starts at 0.40 instead of 0.45. Balanced 98%: too easy with four problems
   and twelve free hours.
3. Five problems, nine free hours, and finding out comes easier to him than
   deciding (+0.2). Passes as above. Six and eight problems were tried and
   drove the leaver to 0%, which preaches.

## What the gate does not prove

The model has no crew, no schedule and no second problem type; capability is
one number. It proves the loop has a shape worth building, not that the
numbers are right. The engine's version carries the mechanics (coach / direct
/ rescue / leave, the supervisor acting every week, hovering, the +0.2 for
finding out) and the module gate on the real floor is the test that counts.
