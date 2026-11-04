# Frame: the readability pass

The author, 2026-11-04, on first playing beta 9: "Getting into it, it is very
reading heavy... I think more readability, visualization, concise wording,
etc would help the flow."

This is the calibration gate's verdict (workflow stage 5) and the playtest
protocol's third class: a design disagreement, not a bug. The engine does not
change. The screens do.

## The problem, measured

Screen height at 390 px, in phone screens of 844 px, and the words on the
screen, on the path a new tester walks (`tools/_heights.mjs`, a scratch
script, beta 9):

| Screen | Before | Words |
|---|---|---|
| Profile | 8.1 screens | 1,044 |
| Track | 8.9 | 1,193 |
| Brief | 3.1 | 398 |
| Week 1 (with the explainer) | 5.6 | 714 |
| Week 2 | 5.0 | 602 |
| Friday | 0.7 | |
| End report | 2.9 | 424 |

A tester reads two thousand words before the first week starts. The author
was right.

## The design rule

Every screen says what it is for in its first screenful. Words a tester
needs now are visible; words they might want are one tap away; words they
never asked for are gone. Numbers a person should feel get a shape, not a
sentence.

## What changed

| Screen | Change |
|---|---|
| Profile | Seats, departments, tied departments and the 23 areas are chips in a grid; the one-line description shows only for what is picked. The intro is one sentence. |
| Track | Open modules show title, purpose, focus; locked ones are a line. The "not in this seat" list is one folded line. The path explainer is one sentence. |
| Brief | Purpose under the title, first paragraph visible, the rest under "Read the rest of the brief". Trains, goal and lose-by on three lines. The crew folded under their names. |
| Week | The explainer is three sentences. The floor's hour list is folded, with the biggest item named on the fold. The floor walk, the booth and the hour with someone are one card of chips ("Your time") instead of three cards of radio lists. A bar chart of paint's weeks under the bay once there is a week. Meters for Kev's capability (manager's seat) and the 5S event (lean module) instead of sentences. |
| End report | Each read is a three-segment meter beside the word. Made and missed lists show three with the rest folded. "Also on the floor" is one folded line. |
| Content | Thirty-nine option labels shortened (the longest from 81 characters to 58; most under 45). Meaning kept, clauses cut. Nothing the bots read changed; they pick by id. |

## After

| Screen | Before | After | Words after |
|---|---|---|---|
| Profile | 8.1 | 2.7 | 231 |
| Track | 8.9 | 2.6 | 217 |
| Brief | 3.1 | 1.3 | 177 |
| Week 1 (with the explainer) | 5.6 | 3.8 | 399 |
| Week 2 | 5.0 | 3.2 | 321 |
| Friday | 0.7 | 0.5 | |
| End report | 2.9 | 2.2 | 260 |

The week is the floor: a problem ticket with seven options, a request, the
standing week and your time is what the game is. Below three screens it
would be hiding the choices.

## What was measured

The module gate at 60 seeds (every module, every seat) after the pass:
identical, as it must be; the bots choose by id and nothing in the engine
moved. Smoke at 390 px clean.

## What it does not do

The voice is unchanged: the Friday report still says what happened in a
person's sentences, because that is the thing the author approved and the
thing a tester will believe or not. The brief's second and third paragraphs
are a tap away, not gone. If the author's next note is that the folds hide
too much, the fold is one line to remove.
