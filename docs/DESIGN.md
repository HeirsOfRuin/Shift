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
| 2026-11-04 | **Beta 10: the readability pass.** The author: "very reading heavy". Screen heights measured at 390 px before and after (`FRAME-readability.md`): profile 8.1 to 2.7 screens, track 8.9 to 2.6, brief 3.1 to 1.3, week 5.0 to 3.2, end 2.9 to 2.2. Chips for every pick on the profile; locked rungs as lines; the brief's second and third paragraphs and the crew folded; a three-sentence explainer; the floor list folded with the biggest item on the fold; the floor walk, the booth and the hour with someone as one card of chips; a bar chart of paint's weeks; meters for Kev's capability, the 5S event and each read; made and missed lists capped at three. Thirty-nine option labels shortened. The gate is unchanged (the bots pick by id); smoke clean. |
| 2026-11-04 | **Beta 9: lean tools, the purpose line, the testers' screen.** The decay loop proved as numbers first (`prototypes/lean/run.mjs`, `KILLGATE-lean.md`: eventer 16%, auditor 18%, delegator 10%, leaver 10%, balanced 81%). The module `greatweek` with `dept.lean`, a Friday audit that appears in the standing week once set up (`needsFlag` on a routine item), the floor item for what has died, a pending root fix and an end check at 0.55. Every module has a `purpose` sentence. `src/ui/feedback.js`: notes kept on the device under their own storage key, sent to the page's shared store through `claude.use('db')` when that resolves and copied as text otherwise. Gate: `greatweek` 80% balanced / 14% ignorer after one change (see the kill gate doc). |
| 2026-11-04 | **Beta 8: internal customers, hidden rework, the system.** Three problem types (`customer`, `infowork`, `erp`), three catalogue areas (E4, B5, B6), three modules; `dept.walkupsCut` so the walk-up hours on the bar drop when the answers live where people find them; the `erp` type uses the existing scheduler-surprise mechanic for what the system tells Jess; the system's name is a profile field carried as `roles.erp` and a `{erp}` token. Gate at 100 seeds: all five tables pass first run (balanced 73 / 80 / 80%, ignorer 14 / 14 / 13%). The employer's name appears nowhere but the author's quoted words. |
| 2026-11-04 | **Beta 7: The other side.** The author's note made a module, not a floor: the player stays in the welding bay and covers paint for four weeks (`setup.meetings` with a label and a banner), and paint's kickback tickets on their own crew's bodies are the problem (`otherside`: the new wire, Tyler rushing, no written standard, or paint's careful new hire, which passes). Seven actions including sending your own bodies back to your own crew and having paint sand it like Theresa does; a fix stops the tickets and a check from paint's side settles it. Gate at 100 seeds: passes first run, balanced 74%, ignorer 8%. The third C3 move (check it held) was added after the first reads showed two decisions on the balanced path. |
| 2026-11-04 | **Beta 6: the operations manager's seat.** The loop was proved as numbers first (`prototypes/manager/run.mjs`, `KILLGATE-manager.md`: rescuer 0%, director 0%, coacher 89%, leaver 7%, balanced 93%). Built: `dept.supCap`; the four moves (`managerMove`) and Kev acting every week (`supervisorActs`) through a muted kernel so the types' lines stay in the player's voice; Dale at fit-up; the manager's floor and standing week; a manager's inbox (Russ's page, Hal borrowing a welder, Corey's date); `card.<type>.body.manager` for the problem as it reaches her; the Kev-no-worse check; A4 as the seat's area. Gate at 100 seeds, manager seat: six modules pass. Kev's start went 0.40 to 0.30 to 0.25 and his own plans became right only at capability + 0.25, because at 0.40 the ignorer won 55 to 76%: a supervisor who settles everything alone leaves the manager nothing to learn. |
| 2026-11-04 | **Beta 5: the lead hand's seat.** From `FRAME-departments.md` decision 2 ("1 and then 2"). The seat changes what the player can do and what their hours are for, never the bay. Built: `PLAYER_LEAD` at fit-up in Kev's spot, Kev as supervisor (`ROLES`, `{sup}` and `{senior}` tokens); a lead's standing week (no production meeting, no timecards, ten minutes with Kev); `tableFor`: the tickets come off the lead's table (22 h) unless they stay past forty, and the table is their fit-up output; problem actions with `needs: 'supervisor'` replaced by *Take it to Kev with what you know*, landing next week with Kev acting on the cause if the lead brought one; scripted signatures become *Ask Kev* at 70%; the seat's E1 area read beside the module's focus when something was taken up; modules carry `seats`, three are supervisor-only and the track says why. Gate at 100 seeds, both seats: all pass; supervisor seat identical to beta 4. What the build taught is in `FRAME-seats.md`. The manager's seat is framed, not built. |
| 2026-11-04 | **Beta 4: three modules for the brief's missing topics.** The author: "1 and then 2. keep this project moving." Three problem types built into the engine (`constraint`, `huddle`, `newhand`), each with a passing cause; `week_.stationMul` so a problem can make one station the constraint and `dept.improved` so a fix sticks; `setup.swap` so a module can put a new hire in a regular's spot. The numbers-only prototype was skipped and said so (`FRAME-three-modules.md`): the engine is numbers-only in Node and the module gate is the kill gate on the same bots. Gate at 100 seeds: all three pass; balanced 87 / 76 / 74%, ignorer 15 / 7 / 14%; the original eight identical to the run before. |
| 2026-11-04 | **Beta 3: the focus-area catalogue, a profile and a path.** The author: "I don't want this whole thing to revolve around EI or LBA, It needs to cover a wide array of different topics and focus points, with modules designed to focus on one or two at a time." Then, to the review's six decisions: "yes to all, go ahead with the catalogue and scoring." And: "make it more customizable. when you start your shift game up, you 'log in' or 'create a profile' that determines your position, which departments are directly tied to you, and what your self-determined strengths and weaknesses are ... so a paint supervisor isn't forced to use the same screen as the welder lead or metal fab manager screen." Built: (1) `focus.data.js`, twenty areas in six families, each with its moves and its LBA and Five Principles lookups (`CATALOGUE.md`); `tags.data.js` deleted. (2) Every module names one or two focus areas; every scored decision was re-tagged to an area by what it tests; the end report reads only the module's focus, three levels (Solid at 60% of possible points, Getting there at 25%, Not yet), no read under three decisions, no overall number; other areas shown unrated. *The week* now scores prioritisation from the inbox's optional requests; *Pulled off the floor* lost a padding point that rode beside every real move. Module gate re-run at 100 seeds: every win rate identical to the run before (the mechanics did not change). (3) A profile: seat, department, tied departments, up to three areas to work on, up to three strengths. (4) The path (`path.js`): work areas first, the seat's leanings, the rest, strengths last as a check; unlocking follows it; the coach's open-all switch stands. (5) Briefs and the track say plainly when the trainee's seat or department is not the welding supervisor's; the People tab puts their own corner of the plant first. Department-specific floors are not built; `FRAME-departments.md` costs them and recommends seats before departments. Save v3 with a migration and fixture. |
| 2026-11-03 | **Beta 2: pressure, an honest score, who's who.** The author, after playing beta 1: "It didn't portray everything it was supposed to well. You never felt under pressure much, especially because it made it feel abnormal to work overtime. If a job can't be done in your scheduled time, something is wrong." / "The final report felt poor, because the score was only based on the 2 seen domains, making it a false low score." / "It definitely needs more depth and more explanation. You had no clue who anyone was beyond the people on your screen." Changes: (1) the floor's hours are itemised, open problems add 3 h each (was 2) and are named as fallout, things you push off come back as floor hours, and the base floor drops to 22 h, so a clean week leaves about 8 h and a festering one goes past forty: the balanced bot now averages 32 to 42 h, the firefighter 41 to 52 h; (2) a fatigue meter: weeks over forty wear you down, and run down, fixes work 18% less often; Friday names what pushed you past forty; (3) no domain score without three decisions behind it and no overall without all four; every module now scores self-awareness (finding out before acting, acting on what you found, changing course, reading the forecast, seeing what only you hold); the right move scores +2, not +1, after the first look showed doing it right every time capped a domain at 12.5; each domain is explained with the decisions behind it; (4) a People tab with the plant, the line, the vehicles and eleven people beyond the bay, and a first-week explainer. Save v2 with a migration; beta saves load and play on. Module gate re-run, 100 seeds per style: all eight pass. |
| 2026-11-03 | **The problem comes first in the inbox.** The first look at the built week screen (390 px) had the six standing items above the module's problem; the problem now leads and the standing week folds to one line. Module gate re-run: identical numbers. |
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

## 12. As built (beta 1, 2026-11-03)

Where this section differs from the plan above it, this section wins.

**What exists.** The Supervisor track: eight modules, eight problem types,
seventeen scripted cards, eleven requests, 343 text keys (458 lines, about
11,400 words with the module text), seven crew and a named cast of eleven.
About 3,600 lines of engine, data, UI and bots. Shape B as planned, bundled to
one file (257 KB) and an installable site. Published as a private artifact for
the beta (`BETA.md`).

**Differences from the plan.**
- The week's inbox leads with the module's problem, then requests, then the
  standing week folded to one line. The first look at the built screen had six
  routine items above the problem, which pushed it below the fold on a phone.
- Web fonts (Big Shoulders Display, Atkinson Hyperlegible, IBM Plex Mono) with
  system fallbacks, instead of system fonts only: the published page allows
  Google Fonts, and offline play falls back cleanly.
- Both themes: dark first (a lit bay at shift start) and a concrete-daylight
  light theme, every colour a token. The pixel bay keeps its own palette in
  both.
- No `prompt()`, `confirm()` or `print()`: the host refuses them. Confirmations
  happen on the page; the debrief copies as text.
- *Pulled off the floor* needed a stronger absence than planned (run 1 of the
  module gate: the styles barely differed and doing nothing won 57%). While you
  are away the floor slows unless Kev is ready, his strain grows with what you
  did not hand over, the background problem lands the week you leave, and "Kev
  buckled" is its own failure.
- The firefighter bot covers when the forecast is under demand plus about a
  body (it had stopped covering once the forecast read 6.5 at full strength,
  and so stopped being the style that ships the most).

**Instruments.**

| Tool | Result |
|---|---|
| `node --test` (16 tests) | All pass: modules end and the clock moves; record hours equal the plan screen's; no NaN; the gone stay gone; Friday's number is the record's; same seed, same module; the profile stays on 0 to 25; no hidden cause on screen before it is told; no raw token anywhere across every module and bot; every text key exists; the v1 save fixture plays on; save codes round-trip; modules open in order |
| `sim/gate.js --runs=100` | All eight modules pass the five conditions (tables below) |
| `tools/check-bundle.mjs` | The single file plays six weeks from `file://`; the site installs, its worker activates with the build id, and it plays a week offline |
| `tools/smoke.mjs` | Four weeks through the UI at 390 px, every tab renders, no overflow, no raw tokens, the save survives a reload |
| Screenshots | Looked at in both themes: title, track, brief, week, Friday, end, debrief |

**What the instruments found and fixed.**
- A two-derivations bug (F1): Friday rounded the raw number while the record
  kept a rounded one, so 6.45 bodies read as 6 on Friday and 7 later. One
  derivation now (`record.bodies`).
- The scaffold's bundler dropped every re-exported name, so the engine's facade
  bundled to an empty object: the source build worked and the single file did
  not. Fixed here and in the workshop kit.
- The scaffold's bundle check clicked only the first start step, so a game
  with a three-click start never reached a turn offline. Fixed here and in the
  kit.

**Known gaps carried forward.** In `BETA.md`: two modules separate the styles
weakly (*The week*, *Pulled off the floor*); every number is a first guess;
text repeats on replays; the subdomain mapping awaits the author; saves are
per device; sign-off is honour system; one track of six.

### The module gate, 100 seeds per style

### The week (`the-week`), 100 seeds per style

| Style | Win | Schedule | Kept everyone | Problem settled | Paint starved | Bottleneck | Shipped / asked | Hours a week | Morale | Trust | Practice score |
|---|---|---|---|---|---|---|---|---|---|---|---|
| firefighter | 70% ±5 | 87% ±3 | 70% ±5 | 87% ±3 | 8% ±3 | 2% ±1 | 107% | 48.9 | 0.67 | 0.55 | 8 |
| documenter | 77% ±4 | 85% ±4 | 77% ±4 | 86% ±3 | 18% ±4 | 0% ±1 | 102% | 40.1 | 0.66 | 0.54 | 15 |
| coach | 73% ±4 | 78% ±4 | 73% ±4 | 79% ±4 | 25% ±4 | 0% ±1 | 100% | 41.8 | 0.70 | 0.58 | 55 |
| ignorer | 15% ±4 | 31% ±5 | 15% ±4 | 15% ±4 | 81% ±4 | 0% ±1 | 93% | 39.3 | 0.67 | 0.52 | 0 |
| balanced | 88% ±3 | 93% ±3 | 90% ±3 | 98% ±1 | 6% ±2 | 0% ±1 | 104% | 43.1 | 0.70 | 0.61 | 63 |

- PASS styles diverge (spread 73 points)
- PASS no style best on every axis
- PASS balanced wins most, not all (88% ±3, want 50-90%)
- PASS ignoring loses most, not all (15% ±4, want 3-40%)
- PASS nothing beats balanced beyond the noise (best other: none)

### The late one (`late-one`), 100 seeds per style

| Style | Win | Schedule | Kept everyone | Problem settled | Paint starved | Bottleneck | Shipped / asked | Hours a week | Morale | Trust | Practice score |
|---|---|---|---|---|---|---|---|---|---|---|---|
| firefighter | 26% ±4 | 94% ±2 | 75% ±4 | 32% ±5 | 5% ±2 | 3% ±2 | 107% | 48.5 | 0.67 | 0.52 | 0 |
| documenter | 45% ±5 | 50% ±5 | 48% ±5 | 58% ±5 | 30% ±5 | 0% ±1 | 96% | 40.2 | 0.64 | 0.51 | 2 |
| coach | 61% ±5 | 92% ±3 | 86% ±3 | 73% ±4 | 7% ±3 | 0% ±1 | 102% | 42.1 | 0.68 | 0.61 | 61 |
| ignorer | 23% ±4 | 75% ±4 | 61% ±5 | 32% ±5 | 21% ±4 | 0% ±1 | 98% | 39.6 | 0.64 | 0.53 | 0 |
| balanced | 83% ±4 | 95% ±2 | 83% ±4 | 100% ±1 | 8% ±3 | 0% ±1 | 103% | 41.7 | 0.69 | 0.59 | 62 |

- PASS styles diverge (spread 60 points)
- PASS no style best on every axis
- PASS balanced wins most, not all (83% ±4, want 50-90%)
- PASS ignoring loses most, not all (23% ±4, want 3-40%)
- PASS nothing beats balanced beyond the noise (best other: none)

### The loop (`loop`), 100 seeds per style

| Style | Win | Schedule | Kept everyone | Problem settled | Paint starved | Bottleneck | Shipped / asked | Hours a week | Morale | Trust | Practice score |
|---|---|---|---|---|---|---|---|---|---|---|---|
| firefighter | 0% ±1 | 90% ±3 | 37% ±5 | 0% ±1 | 9% ±3 | 3% ±2 | 106% | 48.9 | 0.63 | 0.49 | 0 |
| documenter | 0% ±1 | 83% ±4 | 41% ±5 | 0% ±1 | 13% ±3 | 0% ±1 | 100% | 40.0 | 0.60 | 0.47 | 4 |
| coach | 60% ±5 | 89% ±3 | 80% ±4 | 68% ±5 | 11% ±3 | 0% ±1 | 102% | 42.3 | 0.68 | 0.60 | 57 |
| ignorer | 12% ±3 | 58% ±5 | 42% ±5 | 16% ±4 | 46% ±5 | 0% ±1 | 97% | 39.2 | 0.62 | 0.52 | 0 |
| balanced | 82% ±4 | 91% ±3 | 82% ±4 | 97% ±2 | 9% ±3 | 0% ±1 | 103% | 41.9 | 0.69 | 0.58 | 60 |

- PASS styles diverge (spread 82 points)
- PASS no style best on every axis
- PASS balanced wins most, not all (82% ±4, want 50-90%)
- PASS ignoring loses most, not all (12% ±3, want 3-40%)
- PASS nothing beats balanced beyond the noise (best other: none)

### Firefighting (`firefighting`), 100 seeds per style

| Style | Win | Schedule | Kept everyone | Problem settled | Paint starved | Bottleneck | Shipped / asked | Hours a week | Morale | Trust | Practice score |
|---|---|---|---|---|---|---|---|---|---|---|---|
| firefighter | 13% ±3 | 86% ±3 | 62% ±5 | 16% ±4 | 18% ±4 | 20% ±4 | 106% | 52.3 | 0.67 | 0.52 | 0 |
| documenter | 38% ±5 | 94% ±2 | 72% ±4 | 50% ±5 | 9% ±3 | 0% ±1 | 103% | 40.9 | 0.65 | 0.51 | 1 |
| coach | 86% ±3 | 94% ±2 | 86% ±3 | 99% ±1 | 7% ±3 | 0% ±1 | 103% | 42.2 | 0.69 | 0.58 | 61 |
| ignorer | 11% ±3 | 91% ±3 | 66% ±5 | 16% ±4 | 8% ±3 | 0% ±1 | 102% | 41.8 | 0.65 | 0.52 | 0 |
| balanced | 85% ±4 | 94% ±2 | 85% ±4 | 99% ±1 | 7% ±3 | 0% ±1 | 104% | 42.5 | 0.69 | 0.58 | 59 |

- PASS styles diverge (spread 75 points)
- PASS no style best on every axis
- PASS balanced wins most, not all (85% ±4, want 50-90%)
- PASS ignoring loses most, not all (11% ±3, want 3-40%)
- PASS nothing beats balanced beyond the noise (best other: coach)

### Pulled off the floor (`pulled`), 100 seeds per style

| Style | Win | Schedule | Kept everyone | Problem settled | Paint starved | Bottleneck | Shipped / asked | Hours a week | Morale | Trust | Practice score |
|---|---|---|---|---|---|---|---|---|---|---|---|
| firefighter | 64% ±5 | 92% ±3 | 81% ±4 | 68% ±5 | 7% ±3 | 0% ±1 | 104% | 44.0 | 0.68 | 0.53 | 0 |
| documenter | 62% ±5 | 89% ±3 | 65% ±5 | 67% ±5 | 8% ±3 | 0% ±1 | 100% | 38.6 | 0.65 | 0.51 | 2 |
| coach | 83% ±4 | 94% ±2 | 87% ±3 | 87% ±3 | 7% ±3 | 0% ±1 | 103% | 36.7 | 0.70 | 0.56 | 70 |
| ignorer | 45% ±5 | 85% ±4 | 55% ±5 | 52% ±5 | 8% ±3 | 0% ±1 | 99% | 38.3 | 0.66 | 0.53 | 0 |
| balanced | 83% ±4 | 94% ±2 | 86% ±3 | 87% ±3 | 7% ±3 | 0% ±1 | 104% | 36.9 | 0.70 | 0.56 | 70 |

- PASS styles diverge (spread 38 points)
- PASS no style best on every axis
- PASS balanced wins most, not all (83% ±4, want 50-90%)
- PASS ignoring loses most, not all (45% ±5, want 3-40%)
- PASS nothing beats balanced beyond the noise (best other: coach)

### Nobody upstairs (`upstairs`), 100 seeds per style

| Style | Win | Schedule | Kept everyone | Problem settled | Paint starved | Bottleneck | Shipped / asked | Hours a week | Morale | Trust | Practice score |
|---|---|---|---|---|---|---|---|---|---|---|---|
| firefighter | 35% ±5 | 95% ±2 | 80% ±4 | 42% ±5 | 7% ±3 | 0% ±1 | 112% | 47.6 | 0.67 | 0.52 | 0 |
| documenter | 36% ±5 | 95% ±2 | 81% ±4 | 44% ±5 | 7% ±3 | 0% ±1 | 104% | 40.3 | 0.66 | 0.51 | 15 |
| coach | 39% ±5 | 94% ±2 | 87% ±3 | 44% ±5 | 7% ±3 | 0% ±1 | 104% | 43.0 | 0.69 | 0.58 | 40 |
| ignorer | 6% ±2 | 92% ±3 | 74% ±4 | 8% ±3 | 7% ±3 | 0% ±1 | 102% | 40.4 | 0.66 | 0.52 | 25 |
| balanced | 86% ±3 | 95% ±2 | 86% ±3 | 100% ±1 | 8% ±3 | 0% ±1 | 105% | 42.0 | 0.70 | 0.58 | 58 |

- PASS styles diverge (spread 80 points)
- PASS no style best on every axis
- PASS balanced wins most, not all (86% ±3, want 50-90%)
- PASS ignoring loses most, not all (6% ±2, want 3-40%)
- PASS nothing beats balanced beyond the noise (best other: none)

### Rush week (`rush`), 100 seeds per style

| Style | Win | Schedule | Kept everyone | Problem settled | Paint starved | Bottleneck | Shipped / asked | Hours a week | Morale | Trust | Practice score |
|---|---|---|---|---|---|---|---|---|---|---|---|
| firefighter | 0% ±1 | 53% ±5 | 37% ±5 | 0% ±1 | 42% ±5 | 100% ±1 | 91% | 54.4 | 0.58 | 0.52 | 0 |
| documenter | 53% ±5 | 55% ±5 | 87% ±3 | 87% ±3 | 7% ±3 | 0% ±1 | 89% | 40.8 | 0.67 | 0.51 | 79 |
| coach | 0% ±1 | 21% ±4 | 52% ±5 | 0% ±1 | 40% ±5 | 0% ±1 | 83% | 40.2 | 0.68 | 0.57 | 29 |
| ignorer | 12% ±3 | 12% ±3 | 67% ±5 | 67% ±5 | 29% ±5 | 0% ±1 | 83% | 37.4 | 0.68 | 0.52 | 32 |
| balanced | 77% ±4 | 81% ±4 | 87% ±3 | 87% ±3 | 6% ±2 | 0% ±1 | 92% | 43.7 | 0.65 | 0.58 | 68 |

- PASS styles diverge (spread 77 points)
- PASS no style best on every axis
- PASS balanced wins most, not all (77% ±4, want 50-90%)
- PASS ignoring loses most, not all (12% ±3, want 3-40%)
- PASS nothing beats balanced beyond the noise (best other: none)

### Across (`across`), 100 seeds per style

| Style | Win | Schedule | Kept everyone | Problem settled | Paint starved | Bottleneck | Shipped / asked | Hours a week | Morale | Trust | Practice score |
|---|---|---|---|---|---|---|---|---|---|---|---|
| firefighter | 6% ±2 | 93% ±3 | 72% ±4 | 6% ±2 | 10% ±3 | 5% ±2 | 108% | 48.9 | 0.68 | 0.52 | 0 |
| documenter | 31% ±5 | 93% ±3 | 74% ±4 | 42% ±5 | 8% ±3 | 0% ±1 | 103% | 42.5 | 0.66 | 0.52 | 0 |
| coach | 59% ±5 | 95% ±2 | 86% ±3 | 65% ±5 | 7% ±3 | 0% ±1 | 103% | 42.8 | 0.69 | 0.58 | 63 |
| ignorer | 6% ±2 | 92% ±3 | 72% ±4 | 8% ±3 | 8% ±3 | 0% ±1 | 102% | 41.2 | 0.66 | 0.53 | 0 |
| balanced | 73% ±4 | 94% ±2 | 85% ±4 | 85% ±4 | 7% ±3 | 0% ±1 | 104% | 42.5 | 0.70 | 0.58 | 62 |

- PASS styles diverge (spread 67 points)
- PASS no style best on every axis
- PASS balanced wins most, not all (73% ±4, want 50-90%)
- PASS ignoring loses most, not all (6% ±2, want 3-40%)
- PASS nothing beats balanced beyond the noise (best other: none)

Module gate: PASS
