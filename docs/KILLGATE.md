# Kill gate: does the week loop teach anything?

Stage 2 of the workshop workflow, run 2026-11-03. **Result: pass**, on the
seventh version of the model. Code: `prototypes/killgate/` (`model.mjs`,
`policies.mjs`, `run.mjs`). Reproduce with
`node prototypes/killgate/run.mjs --runs=100`; trace one run with
`--trace=SEED --policy=NAME --scenario=NAME`.

## The question

Before any screen or sprite: if the welding department is reduced to numbers
(the cell, your hours, the crew, hidden causes, consequences that land weeks
later), do different leadership styles get different results, with no style
winning everything, a thoughtful style winning most modules but not all, and
doing nothing winning sometimes but rarely? If not, no art would fix it.

## The model in one paragraph

Seven crew at three stations (fit-up 2, body weld 3, finish 2); body weld is
the bottleneck; paint wants six bodies a week. You have a week of hours. The
floor takes its share first (interruptions that grow with every unresolved
problem, every new hand and an absent or strained lead), then the routine
(production meeting, scheduler numbers, safety walk, timecards, the paint
handoff, five huddles), then whatever you choose: talk, document, accommodate,
coach, investigate, fix it yourself, cover a weld station (8 hours a day), walk
the floor (2 hours, to see what the numbers will not show you). Problems
arrive with a hidden cause drawn per run; people sometimes give you a cover
story; the right action usually works, not always; one cause per problem type
sorts itself out, where acting costs hours and heavy action does harm.
Consequences queue and land weeks later: lateness tolerated for two weeks
spreads to someone else; a childcare problem left alone becomes a resignation;
a lead carrying everything goes off on stress leave.

## The five styles (bots with written policies, `policies.mjs`)

| Style | What it does | Hours it will work |
|---|---|---|
| Firefighter | Covers stations, fixes rework himself, carries the lead's load himself, tells people to knock it off | up to 60 |
| Documenter | Writes up lateness and rework, warns on friction, asks the lead once how he is doing | up to 46 |
| Coach | Talks to everyone, coaches three people a week, walks the floor, never writes anyone up, never covers | up to 48 |
| Ignorer | Does the routine and lets the floor sort itself out | up to 45 |
| Balanced | Walks the floor, asks first, does what the answer needs, tries a fix twice before escalating, watches passing things instead of acting, covers only to keep paint fed | up to 50 |

The bots see only what a player would: problems they have noticed, what people
told them, what they tried and what did not work. Never the hidden cause.

## The pass conditions

From `SPEC.md`, made checkable in `run.mjs`:

1. **Styles diverge:** the spread of win rates is beyond the noise floor.
2. **No style is best on every axis** (win, schedule, kept everyone, shipped,
   morale, trust).
3. **Balanced wins most modules, not all:** 50 to 90%.
4. **Ignoring loses most modules, not all:** 3 to 40% (0 to 25% for the season).
5. **Nothing beats balanced** beyond the noise floor.

Two decisions about the conditions, made during the run and stated here so
they are not hidden:

- **The gate is run on module-shaped scenarios, not single problems.** A
  module carries its main problem from week 1 and a second problem of another
  type arriving in week 3, 4 or 5, drawn per seed (`late+`, `rework+`, `load+`,
  `friction+`), plus `season`, which carries all four. Single-problem runs are
  kept as a reference. Reason: the plan's modules have "3 to 5 designed
  decision points and random floor events"; one problem alone is thinner than
  any module will be. The win asks for the module's main problem settled, the
  crew intact, the schedule met; a background problem still open at the end is
  carried over, not a loss, unless it cost a person (SPEC: "the module's
  problem solved at the root").
- **Bounds are read with the workshop's noise rule:** a rate breaks a bound
  only when it is past it by more than two standard errors. `rework+` reads
  91% ±3 against the 90% line; that is not distinguishable from 90%.

## Results (100 seeds per style per scenario, 8 weeks; ± is one standard error)

### `late+`: Brent is late (childcare, a ride, or attitude), plus one more problem mid-module

| Style | Win | Schedule met | Main problem settled | Kept everyone | Paint starved | You the bottleneck | Shipped / demanded | Hours a week (peak) | Morale | Trust |
|---|---|---|---|---|---|---|---|---|---|---|
| firefighter | 23% ±4 | 96% ±2 | 25% ±4 | 82% ±4 | 5% ±2 | 3% ±2 | 108.2% | 49.5 (57) | 0.67 | 0.52 |
| documenter | 45% ±5 | 71% ±5 | 57% ±5 | 61% ±5 | 13% ±3 | 0% ±1 | 98.8% | 40.1 (43) | 0.64 | 0.50 |
| coach | 47% ±5 | 98% ±1 | 50% ±5 | 97% ±2 | 3% ±2 | 0% ±1 | 104.9% | 44.7 (47) | 0.70 | 0.68 |
| ignorer | 19% ±4 | 87% ±3 | 24% ±4 | 67% ±5 | 18% ±4 | 0% ±1 | 99.4% | 39.9 (42) | 0.64 | 0.53 |
| balanced | 84% ±4 | 90% ±3 | 99% ±1 | 85% ±4 | 10% ±3 | 0% ±1 | 102.7% | 42.4 (46) | 0.69 | 0.58 |

### `rework+`: Tyler's rework (untrained, rushing, a bad fixture, or a new jig), plus one more

| Style | Win | Schedule met | Main problem settled | Kept everyone | Paint starved | You the bottleneck | Shipped / demanded | Hours a week (peak) | Morale | Trust |
|---|---|---|---|---|---|---|---|---|---|---|
| firefighter | 24% ±4 | 98% ±1 | 25% ±4 | 87% ±3 | 3% ±2 | 2% ±1 | 108.8% | 48.0 (54) | 0.67 | 0.52 |
| documenter | 41% ±5 | 94% ±2 | 41% ±5 | 84% ±4 | 6% ±2 | 0% ±1 | 102.8% | 39.8 (42) | 0.63 | 0.49 |
| coach | 95% ±2 | 99% ±1 | 97% ±2 | 96% ±2 | 4% ±2 | 0% ±1 | 108.4% | 43.8 (46) | 0.72 | 0.66 |
| ignorer | 23% ±4 | 96% ±2 | 25% ±4 | 80% ±4 | 5% ±2 | 0% ±1 | 103.6% | 39.4 (41) | 0.65 | 0.53 |
| balanced | 91% ±3 | 97% ±2 | 97% ±2 | 91% ±3 | 6% ±2 | 0% ±1 | 105.3% | 42.3 (46) | 0.69 | 0.58 |

### `load+`: Kev carrying more than his share (unowned work, something at home, or a crunch), plus one more

| Style | Win | Schedule met | Main problem settled | Kept everyone | Paint starved | You the bottleneck | Shipped / demanded | Hours a week (peak) | Morale | Trust |
|---|---|---|---|---|---|---|---|---|---|---|
| firefighter | 6% ±2 | 97% ±2 | 6% ±2 | 76% ±4 | 7% ±3 | 3% ±2 | 108.9% | 51.0 (56) | 0.67 | 0.52 |
| documenter | 28% ±4 | 95% ±2 | 30% ±5 | 70% ±5 | 4% ±2 | 0% ±1 | 102.2% | 41.0 (45) | 0.61 | 0.51 |
| coach | 81% ±4 | 98% ±1 | 83% ±4 | 81% ±4 | 4% ±2 | 0% ±1 | 107.0% | 44.0 (46) | 0.71 | 0.66 |
| ignorer | 28% ±4 | 96% ±2 | 30% ±5 | 69% ±5 | 3% ±2 | 0% ±1 | 102.4% | 40.8 (44) | 0.61 | 0.53 |
| balanced | 90% ±3 | 96% ±2 | 97% ±2 | 91% ±3 | 4% ±2 | 0% ±1 | 104.0% | 42.2 (46) | 0.68 | 0.58 |

### `friction+`: Marisol and Donna (workload, personal, unclear roles, or a bad week), plus one more

| Style | Win | Schedule met | Main problem settled | Kept everyone | Paint starved | You the bottleneck | Shipped / demanded | Hours a week (peak) | Morale | Trust |
|---|---|---|---|---|---|---|---|---|---|---|
| firefighter | 9% ±3 | 89% ±3 | 9% ±3 | 53% ±5 | 11% ±3 | 3% ±2 | 107.7% | 49.1 (55) | 0.63 | 0.50 |
| documenter | 17% ±4 | 75% ±4 | 18% ±4 | 53% ±5 | 32% ±5 | 0% ±1 | 99.3% | 39.4 (42) | 0.62 | 0.50 |
| coach | 63% ±5 | 98% ±1 | 66% ±5 | 96% ±2 | 4% ±2 | 0% ±1 | 106.8% | 44.2 (47) | 0.70 | 0.67 |
| ignorer | 23% ±4 | 65% ±5 | 24% ±4 | 51% ±5 | 46% ±5 | 0% ±1 | 98.1% | 39.1 (40) | 0.63 | 0.53 |
| balanced | 87% ±3 | 93% ±3 | 96% ±2 | 89% ±3 | 9% ±3 | 0% ±1 | 103.6% | 42.1 (46) | 0.68 | 0.58 |

### `season`: all four problems, one a week from week 1

| Style | Win | Schedule met | Problems settled | Kept everyone | Paint starved | You the bottleneck | Shipped / demanded | Hours a week (peak) | Morale | Trust |
|---|---|---|---|---|---|---|---|---|---|---|
| firefighter | 0% ±1 | 92% ±3 | 0% ±1 | 64% ±5 | 20% ±4 | 47% ±5 | 103.9% | 53.4 (59) | 0.64 | 0.51 |
| documenter | 0% ±1 | 80% ±4 | 0% ±1 | 14% ±3 | 13% ±3 | 0% ±1 | 98.4% | 43.4 (47) | 0.54 | 0.47 |
| coach | 30% ±5 | 96% ±2 | 31% ±5 | 76% ±4 | 6% ±2 | 0% ±1 | 104.1% | 46.5 (50) | 0.64 | 0.65 |
| ignorer | 0% ±1 | 82% ±4 | 0% ±1 | 11% ±3 | 20% ±4 | 0% ±1 | 98.6% | 43.3 (46) | 0.55 | 0.52 |
| balanced | 61% ±5 | 85% ±4 | 68% ±5 | 78% ±4 | 14% ±3 | 0% ±1 | 102.1% | 45.2 (50) | 0.66 | 0.59 |

Every gated condition passes in all five scenarios (25 of 25).

### Reference: single problems (not gated)

| Scenario | Balanced | Coach | Ignorer |
|---|---|---|---|
| `late` | 86% ±3 | 47% ±5 | 24% ±4 |
| `rework` | 96% ±2 | 96% ±2 | 25% ±4 |
| `load` | 92% ±3 | 82% ±4 | 30% ±5 |
| `friction` | 91% ±3 | 64% ±5 | 24% ±4 |

Alone, a problem is easy to read; the second problem and the season are what
make it a module.

## What the numbers say, in plain words

- **The firefighter ships the most and wins the least.** 104 to 109% of
  demand in every scenario, and the highest hours; in the season he works 53
  a week and becomes the bottleneck in 47% of runs. He never fixes anything at
  the root, so he wins only when the problem would have passed anyway.
- **Every style is right somewhere.** The coach wins 95% of rework modules
  (the cause is usually skill) and 47% of lateness modules (he will not write
  anyone up, and a third of lateness is attitude). The documenter wins 45% of
  lateness modules and 17% of friction ones. Doing nothing wins about one
  module in five, when the problem was a truck in the shop or a bad week.
- **The thoughtful style loses one module in ten, and four in ten in the
  season.** Its losses come from its own decisions as often as from bad luck:
  the cover story it believed for a week, the write-up a person walked out
  over, the second fix that also did not hold, the cover it did not do in the
  week two welders were off sick.
- **Hours bind.** A good week runs 40 to 46 hours. Covering a station costs a
  day of your people work.

## How the model got here (seven runs)

Each run taught something; the changes are in the model's header comment.

| Run | What it showed | What changed |
|---|---|---|
| 1 | Hours were not scarce: nobody worked 40. Ignoring could never win. | Interruptions added: the floor takes hours first, more for each open problem. |
| 2 | Even full strength could not make schedule; capacity was 90% of demand. | Weld capacity raised so a full, healthy crew makes about 6.4 a week (the SPEC: six when everything works). |
| 3 | Too easy: right actions always worked; weeks ran 30 hours. | Baseline interruptions raised; each problem type got a passing cause; people give cover stories; right fixes work most of the time, a second try more often. |
| 4 | The balanced style still won 92%; its losses were all random injuries. | Single problems moved to reference; module-shaped scenarios gated; tolerated lateness now spreads when no standard is held for two weeks. |
| 5 | The win demanded every background problem settled; ignoring won 2%. | The win asks for the module's main problem, as the SPEC says; write-ups and warnings can make a person walk. |
| 6 | One module in five lost someone to a random injury. | Base injury rate cut; fatigue, skipped safety walks and rushing carry the risk now. Baseline week raised to about 38 hours. |
| 7 | The bots saw every problem the moment it started. | Problems must be noticed: timecards show lateness, QC shows rework, a floor walk (2 hours) shows the rest, or they get loud enough. |

## What the gate does not prove

- **That it is fun or that it teaches.** Only people can say that. The beta
  and the pilot answer it.
- **That the numbers are right.** Every parameter is a first guess; the gate
  shows the loop has the right shape, not the right calibration. The engine
  measures each module again with the same bots.
- **That humans play like the bots.** The balanced bot is a disciplined
  diagnostician. A trainee will notice later, believe more stories and cover
  more; their win rate should sit below the bot's, and that gap is the
  coaching conversation.

## Carried into the engine

The engine keeps the model's shape and these specific mechanics, because each
one was needed to pass: interruptions that grow with open problems; a passing
cause per problem type; cover stories; fixes that work most of the time;
noticing (timecards, QC, the floor walk, escalation); tolerance that spreads;
the main-problem win; the price of holding the line. The five policies become
the engine's measurement bots, and every module must pass the same five
conditions before it ships.
