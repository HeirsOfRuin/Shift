# Review: the loop does not teach

The author, 2026-11-06, after playing beta 14: "I don't actually feel like
it imparts any information. It just feels like finding or following the
right answer while attempting to keep under 40 hrs."

This is the most important note the project has had. It is about the core
loop every module shares, not about any one module, and the numbers say it
is right.

## What was measured

**A bot that knows nothing about leadership nearly matches the tuned one.**
`tools/_pattern.mjs` (scratch) plays every module with two rules and no
module knowledge: if the cause is unknown, pick the option whose kind is
"ask"; once told, pick the option whose `fits` includes what you were told.
100 seeds each, supervisor's seat:

| Module | Two-rule pattern | Tuned balanced | Doing nothing |
|---|---|---|---|
| The week | 68% | 93% | 18% |
| The late one | 78% | 84% | 22% |
| The loop | 84% | 87% | 20% |
| Firefighting | 91% | 91% | 16% |
| Pulled off the floor | 84% | 84% | 18% |
| Nobody upstairs | 66% | 92% | 13% |
| Rush week | 87% | 87% | 13% |
| Across | 82% | 84% | 14% |
| Where it waits | 93% | 93% | 20% |
| Monday, 7:00 | 85% | 85% | 11% |
| The new hand | 84% | 84% | 17% |
| The other side | 42% | 85% | 16% |
| Who you work for | 83% | 85% | 18% |
| Say it once | 86% | 88% | 20% |
| What the system sees | 86% | 88% | 19% |
| It looked great for a week | 22% | 88% | 19% |
| Round two | 76% | 90% | 21% |
| **Average** | **76%** | **88%** | **17%** |

In eleven of seventeen modules the pattern is within three points of the
tuned bot. The leadership is not in the player's head; it is in the labels.

**A wrong move mostly says "not that".** Of 44 lines that answer a wrong
fix, 25 say only that it was not the cause ("It wasn't the wire"); 9 give a
reason. A wrong pick tells the player to try the next button, not why that
approach fails with that person.

## Why it feels the way it does

1. **Finding out is a button.** Every problem has one option of kind "ask",
   it costs an hour, and it nearly always returns the true cause. Finding
   out, which is the skill most modules are about, is never at stake.
2. **What you are told names the fix.** Each told line maps one-to-one to
   one option's `fits`. Read the line, find the matching label. That is the
   "finding the right answer" the author felt.
3. **So the only live decision is hours.** With the answer handed over, the
   forty-hour bar is the one thing the player has to think about. That is
   the "keep under 40 hrs" the author felt.
4. **The gate enforces it.** The module gate passes when "nothing beats
   balanced", and balanced is the pattern plus some tuning. The gate has been
   certifying the problem for eleven betas.

The breadth check of 2026-11-05 (`FRAME-coach.md`) said "no module is a
stub" and "depth is even". That measured the content (causes, lines,
sentences), not the decisions. The content is even; the decisions are
shallow everywhere in the same way. That verdict was incomplete.

## Where it already works

The five modules the pattern loses are the five where something comes after
the fix: *It looked great for a week* (22%: the fix dies without an owner
and an audit), *The other side* (42%: go back and check it held), *Nobody
upstairs* (66%: whose call is it, not what is the cause), *The week* (68%:
what to refuse), *Round two* (76%: read the next round). Follow-through and
judgement, not matching. That is the lead for the fix.

## The options

| | Change | What it fixes | Cost |
|---|---|---|---|
| A | **How you ask matters.** "Find out" becomes two or three ways to ask (at the bench, in the office, through the crew), and what you hear depends on how you asked and how much they trust you: the true cause, part of it, or the story they tell a boss. The told line becomes evidence to weigh, not a key. | Causes 1 and 2: finding out becomes the skill | A new mechanic: kill gate first, then every module's ask re-done |
| B | **Follow-through on every fix.** Every fix needs the step the five working modules have: check it held, give it an owner, hear back. A fix nobody checks slides back. | Moves the decision from "which button" to "did it stick" | Engine change on all types; re-gate all 17 |
| C | **Same month, other ways.** At the end, replay the same seed with three other approaches and show what each got and why: "If you had done it all yourself... If you had asked first..." | Every run shows a consequence chain the player did not take | No mechanic change; the bots and seeds exist |
| D | **Wrong moves say why.** Rewrite the 35 lines that only say "not that" to say why that approach fails with that cause. | A wrong pick teaches the principle | Content only |
| E | **Hours in the background.** The hour bar stops being the loudest thing on screen. | Cause 3, partly | Screen change |
| F | **A new gate condition: the pattern bot must lose.** Every module must beat a two-rule bot by a clear margin. | Stops the gate certifying the problem | A test; makes A or B necessary |

## Recommendation

A and F together, proven on one module first, *The late one* (its area is
"finds out why", the purest case). Then C and D, which are cheap and make
every run carry information even before A reaches the other modules. B
after A, if A alone does not move the pattern bot. E with whichever screen
work comes next.

No new modules until the loop is fixed. Seventeen modules on a loop that
does not teach is the thing the author warned against on 2026-11-05:
covering everything and showing nothing properly.

## What was done

Beta 15 (2026-11-06), after the author's "go with your recommendations. Fix
this.": A and F on *The late one*, kill gate first (`KILLGATE-ask.md`); C
(the end screen replays the same month five ways and says what the cause
was) and D (33 wrong-move lines rewritten with reasons) for every module; E
in part (the week's explainer leads with finding out). Beta 16 took A to
every other module and enforces F everywhere but *Rush week*, which needs a
new mechanic (`KILLGATE-ask.md`, "Beta 16: every module"). Average gap
between the tuned style and the pattern: 12 points before, 33 after.

## What it does not change

The catalogue, the seats, the coach's side and the group sessions stand.
The group sessions carry information that the solo loop does not, because
the room argues before it taps; that is evidence for option A, not against
the sessions.
