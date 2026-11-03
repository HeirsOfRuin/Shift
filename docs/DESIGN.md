# Shift: design (stage 3)

Written 2026-11-03, after the kill gate passed (`KILLGATE.md`). Inputs:
`CONCEPT.md`, `PLAN.md`, `ORG.md`, `SPEC.md`. The author approved going
through to a beta without stopping at each gate ("Continue as you see fit.
With until you have a testable beta"), so this document is the plan the beta
was built to, and section 12 is what was actually built. Where section 12
differs from the plan above it, section 12 wins.

## 1. Decisions log (newest first)

| Date | Decision |
|---|---|
| 2026-11-03 | **Shape B, not C.** `PLAN.md` said shape C (Vite, Preact, TS, YAML). The kill gate showed Shift is a simulation with written event cards, not a scene graph: the engine is the product and content hangs off it. Shape B runs the engine in Node with no build for the bots and tests, has no dependencies, and bundles to one HTML file, which is what a phone beta needs (it can be opened from a link or a downloads folder). Content lives in logic-free `src/data/*.data.js` tables. If the text volume outgrows JS tables, YAML can be added later without touching the engine. |
| 2026-11-03 | **The kill gate's mechanics carry into the engine unchanged in shape:** interruptions that grow with open problems; a passing cause per problem type; cover stories; fixes that work most of the time; noticing (timecards, QC, the floor walk, escalation); tolerance that spreads; the main-problem win; the price of holding the line. |
| 2026-11-03 | **Five measurement bots** (firefighter, documenter, coach, ignorer, balanced) play every module; a module ships only if it passes the kill gate's five conditions. |
| 2026-11-03 | **The Pages workflow runs by hand only.** On every push it would build, test and then fail at the deploy step, because Pages is off for a private repository; that is a red run and an email per push. Switch `push:` back on when Pages is on. The beta ships as one file instead. |
| 2026-11-03 | **Beta unlocks.** Modules unlock on coach sign-off, as planned; the beta adds a menu switch that opens every module, so the author can test any of them (the workshop checklist's "sandbox start to reach new content fast"). |

## 2. Stack

| Choice | Decision | Why |
|---|---|---|
| Shape | Vanilla ES modules, no build step, bundled to one file | Section 1 |
| Saves | Guarded localStorage, key `shift.save.v1` (never renamed), `v` in the payload, migrations, a fixture per shipped version, text export `SHFT1.` | Every past build's contract |
| Randomness | Named streams from (seed, week, label); stream state never reused across systems | Kill gate; workshop rule |
| Tests | `npm run check`: invariants, save contract, bot batch per module, bundle, phone smoke at 390 px | Workshop standard |
| Deploy | One-file build for the beta link; Pages workflow kept for later (a private repo needs a paid plan for Pages) | Repo is private for the pilot |
| Dependencies | None at runtime; Playwright (preinstalled) for smoke and icons | |

## 3. Architecture

```
src/data/            logic-free tables
  crew.data.js         the welding crew, the plant cast, pronouns
  problems.data.js     problem types: causes, stories, actions, costs, odds
  text.data.js         the narrator: every line the player reads, by key
  modules.data.js      the Supervisor track: briefs, setups, scripted cards, debriefs
  tags.data.js         LBA subdomains and Northbound branches, scoring
src/engine/          pure: (state, input) -> state. No DOM, no Date, no Math.random
  rng.js               named streams (from the scaffold)
  state.js             newGame, save contract, migrations, save codes
  text.js              token resolution, once, from state (rule 8)
  problems.js          each problem type's week and its actions, by cause
  cards.js             builds the week's inbox from routine, problems, module and events
  week.js              the week pipeline, written order, one record out
  outcome.js           win, ways to lose, the trace, the practice profile
  view.js              everything the UI shows, including why things are locked
src/ui/              reads the engine, computes nothing
  app.js               screens and input
  floor.js             the pixel floor: canvas, sprites, animation
  sprites.js           palette and sprite grids
sim/                 the five bots, the adapter, the measurement kit
test/                invariants, save contract, text
tools/               bundle, checks, smoke, icons, contact sheet (scaffold)
prototypes/killgate/ the gate, kept as the reference model
```
Import direction: `ui → engine → data`. Nothing in `engine` imports `ui`.

## 4. The week (one turn), in written order

1. **Monday (plan).** The inbox is built: routine items, a card for every
   problem you have noticed, the module's scripted cards for the week, random
   requests, the weld-coverage card and the floor-walk card. The floor's
   interruptions are already counted against your hours and shown as a fixed
   block. You pick one option per card. The hours bar shows the total and what
   it means (over 45 tired; over 55 you are the bottleneck).
2. **Arrivals.** Problems scripted or drawn for this week appear, unseen.
3. **Your actions** resolve, in card order: hours spent, causes told, fixes
   tried, odds rolled from the outcomes stream.
4. **Floor events:** sick days, the press, a rush, an engineering change.
5. **Problems run their week:** lateness, rework, stress, friction, spread.
6. **The cell runs:** fit-up, body weld (the bottleneck), finish; defects
   found and escaped; bodies to paint.
7. **Incidents** (base rate small; fatigue, safety debt and rushing raise it).
8. **Consequences land** from the queue: resignations, leave, spread, blow-ups.
9. **Morale drifts**; low morale for two weeks starts a resignation.
10. **What you know on Monday:** timecards, QC, the floor walk, escalation.
11. **Friday report:** one record, from which the report text is built. The
    report cannot disagree with what happened because it is read off it.
12. **End check:** paint starved two weeks running ends the module; otherwise
    the module ends after its last week.

## 5. Content schema

**A problem type** (`problems.data.js`): causes with weights; one passing
cause; stories (what a cause is told as, with odds); actions, each with hours,
a label, a kind the bots read, and per-cause results (works with odds on the
first and later tries, or fails with a cost); how it is noticed; what it does
each week while open; its consequences and their lags.

**A card** (built by `cards.js`): `{ id, kind, title, body, who, problem?,
options: [{ id, label, hours, kind, note? }], pick }`. Every option says what
it costs. A "leave it" option is always there and costs nothing now.

**A module** (`modules.data.js`): id, title, handbook module, tags, weeks,
brief (narrated), goal and ways to lose (plain), setup (crew changes,
absences, meeting hours, demand by week, manager away), the main problem (type,
who, cause weights), the secondary draw, scripted cards by week (options with
effects in a small effect language: hours, morale, trust, standard, bench,
demand, queue a consequence, set a flag), debrief questions (from the
handbook, paraphrased in the author's voice) and the commitment prompt.

**Effects** are data, applied by one function, so a module never needs new
engine code unless it needs a new kind of problem.

## 6. The Supervisor track (eight modules)

| # | Module | Weeks | Main problem | Special mechanic | Handbook |
|---|---|---|---|---|---|
| 1 | The week | 6 | A safety signal buried in a full inbox (the fume extractor) | Requests with hidden importance; refusing is a skill | 2 |
| 2 | The late one | 8 | Brent's lateness: childcare, a ride, or attitude | Cover stories; tolerance spreads | 7 |
| 3 | The loop | 8 | Marisol and Donna: workload, personal, roles, or a bad week | Warnings suppress and return worse | 7 |
| 4 | Firefighting | 8 | The body-weld jig keeps drifting | Fixing it yourself works every week and fixes nothing | 1 |
| 5 | Pulled off the floor | 8 | Weeks 3 to 5 you lose 18 hours a week to an audit | The bench: what you delegated to Kev before you left | 6 |
| 6 | Nobody upstairs | 8 | Dana is away; decisions pile up that may or may not be yours | Decision rights: decide, ask, wait, or go around | 4, 8 |
| 7 | Rush week | 8 | A Surveyor Rescue rush; shortcuts offered every week | The standard meter: what you allow now is the rule later | 7 |
| 8 | Across | 8 | Paint kicks back bodies on a standard you do not share | Peer trust; going up before going across costs | 8 |

Each module also draws one background problem of another type, mid-module,
per seed, as in the kill gate.

## 7. Measurement and the practice profile

- **Bots:** the kill gate's five policies, reading cards and option kinds.
  `node sim/run.js --by=policy,module` gives every module's table; the check
  runs the gate's five conditions per module.
- **Practice profile:** every decision is scored against what the player knew
  when they made it (not against the hidden cause): asking before acting,
  acting on what you were told, holding a standard when it was attitude,
  leaving a visible signal for two weeks, and so on. Scores are +2, +1, 0, -1
  on one or more LBA subdomains, pooled with the LBA's own arithmetic into four
  domains on 0 to 25. Labelled practice, never assessment.
- **The trace:** every consequence carries the decision (or the absence of
  one) that queued it. The end report lists outcome ← cause lines.

## 8. Screens (phone first, 390 px)

| Screen | What it does |
|---|---|
| Title | Continue, new run, load a save code; says when this browser will not keep anything |
| Track | The Supervisor ladder: eight modules, locked, open, played, signed off; the beta switch |
| Brief | The module's brief in the narrator's voice; the goal; the ways to lose; who is on the crew |
| Week | HUD (week, hours, bodies); the pixel floor; the inbox of cards with option chips; the hours bar with the limiting line; Run the week |
| Friday | The week's report: what happened, what you heard, the numbers |
| Crew | One card per person: station, what you have seen, what they told you, what you did |
| Log | Every week so far |
| End | Outcome and why; the goal checklist; the trace; the practice profile; what is carried over |
| Debrief | The handbook's coaching questions with space to answer, one commitment with a 90-day date, print, coach sign-off |
| Menu | Save code, beta switch, back to the track |

## 9. Visual identity

- **Palette (tokens in `styles.css`, the same tokens drive the canvas):**
  steel night `#15171c` and `#1f232b` for ground; concrete `#8b8f96` and
  `#5d626b`; safety orange `#d9822b` for the accent and the primary button;
  hi-vis yellow `#e8c547` for warnings and floor lines; arc white-blue
  `#cfefff` for sparks; coverall navy `#2f4470`; paint-booth teal `#3c8c8a`;
  alarm red `#c4473a`. Nothing like Vikingr's runestone or Knight of Adalia's
  manuscript.
- **Type:** system sans for everything a person reads (legibility wins);
  headings in the same font, bold, letter-spaced caps like plant signage. No
  web fonts (offline).
- **Pixel art:** drawn in code from palette-indexed grids, scaled by whole
  numbers, `image-rendering: pixelated`. The floor is a side-on cutaway of the
  welding bay: fit-up jigs, three weld booths with curtains, the finish bench,
  the paint door. Each crew member has a sprite in five states: working
  (animated), idle, talking, frustrated, absent (an empty station). Sparks,
  the clock and a body moving to paint are animated in code.
- **The rule:** art carries mechanics or it is cut. A frustrated sprite is a
  signal the player can act on before the numbers show it.

## 10. Instruments

| Tool | Question it answers | Must assert |
|---|---|---|
| `test/invariants.test.js` | What can never be true? | Hours add up; no NaN; the report matches the record; a quit person never works again; bots make progress |
| `test/save-contract.test.js` | Does every old save load and play on? | One fixture per save version |
| `test/text.test.js` | Does every line resolve? | No raw tokens across bot runs of every module; every text key used exists |
| `sim/run.js` + `sim/gate.js` | Does each module pass the kill gate's conditions? | The five conditions per module, 100 seeds |
| `tools/smoke.mjs` | Does the real page work at 390 px? | The week advances through the UI; tabs render; save survives a reload |
| `tools/contact-sheet.mjs` | Do the sprites read at true size? | Looked at, not asserted |

## 11. Risks

| Risk | Holding it off |
|---|---|
| Text volume: eight modules of a human narrator | Lines keyed by event and cause, two to four variants each; the module's own cards carry the specific writing |
| The bots' numbers move once content is real | Every module measured; the gate is re-run per module, not assumed from the prototype |
| Phone legibility of pixel art | Whole-number scale, contact sheet, smoke screenshots looked at |
| A beta that only the author can judge | The beta report says what was measured and what was not; the pilot questions stand |

## 12. As built

Filled in when the beta ships.
