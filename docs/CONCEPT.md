# Shift: the concept, for a reader who was not there

Written 2026-11-03 as the handoff for any new session. Read this first, then
`REVIEW.md` (the 2026-11-04 redirect), then `PLAN.md` (the full design), `ORG.md` (the company, the cast, the vehicles)
and `SPEC.md` (the Supervisor track, one page).
Everything here was agreed with the author in conversation; his words are
quoted where they decided something. Where this document and `PLAN.md`
disagree, `PLAN.md` is more detailed and this one is more current only if its
date is later.

## 1. What Shift is, in one paragraph

A leadership simulator for the shop floor. One fictional car plant, drawn in
pixel art. A trainee runs a role in it (first: a welding supervisor) for a
simulated season, one week per turn, with 40 hours to spend, a crew whose
problems have hidden causes, and consequences that land weeks after the
decision that caused them. Each module is a scenario set with a visible goal,
ways to fail, an end report that traces every outcome back to its cause, and a
debrief page the trainee works through with a coach. It trains leads,
supervisors, managers, CI/Lean coordinators and huddle facilitators
individually, and a leadership team as a group. It is a training tool with
game mechanics, not a video game about work. The debrief conversation is the
product.

## 2. Why it exists

The author (Josh) is a welding and fabrication supervisor at a rural Manitoba
manufacturer, with 18 direct reports across three departments, and co-founder
of Northbound Leadership & Operations, a consulting firm for Stage Two
manufacturers (60 to 120 people, where informal systems stop working). He has
also shipped fourteen browser games with the HeirsOfRuin game-building skills.

The problem Shift answers: leadership training is lectures and quizzes. A quiz
scores a decision the moment it is made, so people pick the answer they think
is wanted, and nothing teaches the thing every supervisor actually learns the
hard way: that the coaching conversation skipped in week 2 is the resignation
in week 9. A simulation can show that lag. A lecture can only describe it.

Why the author, and not a training company: he runs a floor, he has written
the frameworks the tool measures against, and he can build the tool. The
Northbound service structure already sells a "Systems Thinking Simulation"
workshop with nothing behind the name. Shift fills it.

## 3. The two-stage strategy

The author's words: "I want to make a PhiBer version of this, that I can use
as a playtest sort of project, then take what I learn and remake it into a
Northbound system that is larger and more versatile."

1. **The pilot version.** Built on the author's own Leadership Behaviour
   Assessment (LBA v2) as its measurement backbone, piloted with three to five
   willing leads and supervisors at his day job. None of the author's
   assessment system is official there: "None of my EI system has been made
   official or used at PhiBer. The LBA v2 was improved and made more official
   looking, but it still is only in my docs." So the tool, the LBA and this
   repository are the author's property. The pilot runs as development
   practice with willing people, and any use of results for anything needs
   written approval first.
2. **The Northbound version.** Rebuilt on the Northbound frameworks (the Five
   Principles, the four tiers, the three directions), with a client's values as
   a fill-in table, group mode, a facilitator guide and a module-assignment
   screen. Same engine, different content and tags.

A lessons log kept from day one of the pilot is the brief for stage 2.

## 4. The sources, and where they live

All in the author's Google Drive, all his own writing. A new session with the
Drive connector can search these titles. None of their content is in this
repository except as design references.

| Document | What it gives Shift |
|---|---|
| `Northbound_Ideas_Overview.pdf` ("When Leadership Is the Constraint") | The thesis: Stage Two manufacturers fail on leadership systems, not effort. Five areas where plants break. Four tiers (operator, lead hand, supervisor, manager) with a failure mode each. Three directions (down, up, horizontal). Adult learning: relevance first, practice over exposure. |
| `The 5 Principles` | The Northbound measurement backbone: five pillars, three branches each (listed in section 8). Note: the document still says "The Leadership Co.", an older name. |
| `Northbound_Leadership_Mentorship_Handbook.docx` | Eight coaching modules, each with a teachable, coaching questions, a self-assessment and action commitments. Each becomes a Shift scenario; its questions become the debrief; its commitments become the homework. |
| `Northbound_Service_Structure_v2` | The service ladder (Diagnostic, Stabilization, System Build, Executive Partnership) and add-ons, including the unbuilt "Systems Thinking Simulation" half-day workshop. Prices and terms are internal. |
| `Northbound_Diagnostic_Field_Protocol.docx` | How the firm investigates a plant: executive claims as hypotheses, cross-verified against supervisor interviews and floor observation. Shift's hidden-cause mechanic is this principle made playable. |
| `EI Assessment Structure` (v1) and `Leadership Context Is Layered.docx` | The v1 assessment logic (superseded by the LBA) and a short teachable on why each tier misreads the others. The latter is a Manager-track module. |
| Folder `v2 - Leadership Behaviour Assessment - PhiBer`: `LBA_Standard_and_Procedure_Rev0.docx`, five tier forms, `LBA_Scoring_Workbook_v2.xlsx` | The pilot's measurement backbone. See section 7. The item bank (92 scenario items with scored options) stays out of this repository. |

Known inconsistencies in the Drive, for whoever updates it: the diagnostic is
described as three options in the field protocol and two in the service
structure; the material is spread over several folders with Word, PDF and
Google Doc copies of the same things.

## 5. Decisions made, in the author's words

| Date | Decision |
|---|---|
| 2026-11-02 | A training tool, not a video game: "not a game to be a videogame, but a training tool that is more fun than a lecture." Trains "leadership skills, understanding systems, lean tools, facilitating meetings, time management, prioritization, multi-tasking, and personal/employee development." |
| 2026-11-02 | Tied to Northbound: "one system that ties all of that and more together so I can assign different people different modules in the simulator, both group and individual." |
| 2026-11-02 | Pilot first, remake second (quoted in section 3). |
| 2026-11-03 | The plant: "a car manufacturer, but they build every aspect of the vehicle. They have a welding, painting, fabricating, machining, electrical, interior, and assembly departments, tires and windows are the only finished parts they buy. Each department has anywhere between 5 and 10 employees, including the supervisor." |
| 2026-11-03 | The pipeline is content: "Some scenarios can include sections that have managers missing from the plant, supervisors who are gone, etc to also show how a pipeline is important." |
| 2026-11-03 | First track: "Let's start with the supervisor level of modules, for individual sessions." |
| 2026-11-03 | Replays before sign-off: "Yes." |
| 2026-11-03 | Voice: "Plain, dry, but with some life, like a good narrator, not like a robot." |
| 2026-11-03 | Its own repository: "all of this should be moved to its own repo. It is called Shift." |
| 2026-11-03 | The organisation: "Make a complete org chart, with a CEO, a COO, a product manager (on the engineer side), also include service, engineer (design, manufacturing, software), and sales departments." Built in `ORG.md`. |
| 2026-11-03 | The vehicles: "The company makes 6 different vehicles, 3 are specific vehicles, each with a variation model." Built in `ORG.md`. |
| 2026-11-03 | Voice, second pass: "Make the narrative a bit more realistically human." `PLAN.md` section 7 rewritten with three samples. |
| 2026-11-03 | The name: "The name is Northern Motors." The cast and vehicles: "The names look good." |
| 2026-11-03 | Through to a beta: "Continue as you see fit. With until you have a testable beta." The agent runs the gates without stopping for sign-off and reports each gate's numbers with the beta. |

| 2026-11-04 | Not built around EI or the LBA: "I don't want this whole thing to revolve around EI or LBA, It needs to cover a wide array of different topics and focus points, with modules designed to focus on one or two at a time." The review and proposal are in `REVIEW.md`; its section 7 lists what the author still has to decide. Until he does, sections 7 and 8 below describe the current build, not the agreed direction. |

Decisions the agent made and the author has not yet confirmed or struck: the
work-content table in `ORG.md`; the player runs welding first; the extra
pipeline-gap modules (Nobody upstairs, Acting supervisor, The empty chair);
the three voice samples in `PLAN.md` section 7. Everything decided while
building the beta is in `DESIGN.md`'s decisions log.

## 6. The design in brief

Detail is in `PLAN.md`; this is the shape.

- **The world.** Northern Motors, ninety-two people, three vehicle lines
  with a variant each (Drayman work truck, Hauler van, Surveyor 4x4), six
  vehicles a week. Seven production departments in flow order: fabrication,
  machining, welding, paint, electrical, interior, assembly, under a plant
  manager and two operations managers; beside them engineering (a product
  manager, design, manufacturing, software), sales, service, finance, a CEO
  and a COO. The product mix moves the bottleneck. The full chart, the named
  cast and the welding crew are in `ORG.md`. Crew have visible traits and
  hidden ones (a concern, a trigger, growth potential, trust in you). Managers
  and supervisors can be absent, quit or promoted mid-module; the bench holds
  or it does not.
- **The engine.** A week per turn in fixed phases: plan, huddle, events, work,
  Friday report. 40 hours a week, every action costs some. A cell model with a
  real bottleneck the player must find. A people model with slow-compounding
  coaching. A consequence queue with landing weeks. Hidden causes drawn per
  run. Every decision tagged to the measurement backbone. One record per week;
  everything shown derives from it.
- **A module.** Brief, visible goal and fail states, 6 to 10 weeks of play (15
  to 25 minutes), end report with the trace, debrief page with the handbook's
  coaching questions and one action commitment, coach sign-off to unlock the
  next. Four difficulty knobs. Replayable; a replay redraws causes.
- **Six tracks.** Supervisor (first, eight modules, welding department), Lead,
  Manager, CI/Lean coordinator, Facilitator (a hybrid: structure in-app,
  delivery scored live by an observer), Leadership team (group mode, one
  screen, each player a department, only the plant number counts).
- **Interface.** Phone first at 390 px; facilitator mode on a laptop. Plant
  map, week planner with hours as blocks, crew cards, Friday report, run
  history with trace lines, debrief page. Tutorials by doing. No points,
  badges or leaderboards: the LBA standard forbids ranking people, and the tool
  keeps that rule.
- **Art.** Pixel art, one master palette, a fixed asset list (one tileset,
  about forty sprites in five states, a few code animations). Art carries
  mechanics (a frustrated sprite is Social Awareness on screen) or it is cut.
- **Measurement.** The play log becomes a practice profile on the LBA's 0 to
  25 scale, labelled practice, shown beside the self-report and the observer
  rating; the gap is the coaching conversation. Nothing stored centrally: runs
  live on the phone, leave as a save code and a printable summary.
- **Architecture.** Shape C from the workshop scaffold: Vite, Preact,
  TypeScript strict, YAML content with Zod, Vitest; a pure deterministic engine
  with named RNG streams; versioned saves with migrations; offline PWA; no
  server. The narrative kit's schema and text tools for scenarios.

## 7. The pilot's measurement backbone: the LBA v2

The author's Leadership Behaviour Assessment, revision 0, October 2026,
replacing his EI Assessment v1. What Shift uses from it:

- **Four domains**, scored 0 to 25: Self-Awareness (SA), Self-Management (SM),
  Social Awareness (SOC), Relationship Management (RM).
- **Thirteen subdomains** ("behaviour signals"), each tied to a company value
  and a handbook responsibility: Emotional Awareness, Impulse Control, Basic
  Empathy, Respect & Professionalism, Openness to Improvement (module 1);
  Constructive Influence, Peer Conflict Prevention (module 2); Tone-Setting,
  Early Coaching & Guidance (module 3); Accountability Management, Recurring
  Conflict Resolution (module 4); Cross-Functional Awareness, Culture &
  Organizational Influence (module 5).
- **Five tiers** matching a role ladder, each taking a battery of modules:
  Employee (1), Coordinator/Lead Candidate (1+2), Line Lead (1+2+3),
  Supervisor (1+3+4), Manager (1+4+5). Domain weights differ by tier;
  Supervisor weights RM 40%, SOC 30%.
- **Scoring rules** Shift copies for the practice profile: domain = points
  earned over points possible times 25; overall = weighted domains times 4; a
  low-domain penalty (lowest domain under 8, 6 or 4 cuts 10, 15 or 20
  percent); profile types by rule (Inconsistent Under Pressure, Role-Misaligned,
  Unbalanced, Stable); readiness by rule (Ready: overall 80, both critical
  domains 17, nothing under 12).
- **An observer rating**: the direct supervisor rates the same four domains
  1 to 5 from three months of observation; a gap of 6 or more from the
  self-score is flagged. Shift's practice profile is the third column beside
  these two.
- **Its own rules Shift inherits**: not a personality test, not pass/fail,
  never a pay input, no ranking in front of others, confidential, a
  development conversation within ten working days, a plan with a 90-day
  follow-up.

## 8. The tag backbone: how the three frameworks line up

Every decision in a module carries all of these tags. The pilot reports on the
LBA columns; the Northbound remake reports on the Five Principles columns.
Nothing else changes.

**Northbound Five Principles** (pillar: branches):
1. Leadership Capability: Decision Quality; People Development; Influence &
   Accountability.
2. Organizational Structure: Role Clarity; Span of Control; Systems Alignment.
3. Communication Flow: Vertical Communication; Cross-Functional Communication;
   Feedback Loops.
4. Strategic Problem-Solving: Root-Cause Thinking; Execution Discipline;
   Learning Systems.
5. Company Culture: Values in Action; Engagement & Ownership; Behavioral Norms.

**Handbook modules**: 1 Firefighting is a leadership failure; 2 When
everything is urgent nothing is strategic; 3 Structure protects good people;
4 Ownership without authority creates friction; 5 Delegation beats direction;
6 Leaders build leaders; 7 Culture is what you tolerate under pressure;
8 Leading at every level (down, up, horizontally).

**The Supervisor track, tagged** (first cut; the author will adjust):

| Shift module | LBA subdomain | Northbound branch | Handbook | Direction |
|---|---|---|---|---|
| The week | Impulse Control; Accountability Management | Decision Quality; Execution Discipline | 2 | down |
| The late one | Accountability Management; Basic Empathy | Influence & Accountability; Values in Action | 7 | down |
| The loop | Recurring Conflict Resolution | Behavioral Norms; Feedback Loops | 7 | down |
| Firefighting | Early Coaching & Guidance; Openness to Improvement | Root-Cause Thinking; People Development | 1 | down |
| Pulled off the floor | Early Coaching & Guidance; Tone-Setting | People Development; Role Clarity | 6 | down |
| Nobody upstairs | Cross-Functional Awareness; Emotional Awareness | Role Clarity; Vertical Communication | 4, 8 | up |
| Rush week | Respect & Professionalism; Tone-Setting | Values in Action; Behavioral Norms | 7 | down |
| Across | Cross-Functional Awareness; Peer Conflict Prevention | Cross-Functional Communication; Systems Alignment | 8 | across |

## 9. What was considered and set aside

- **Another historical game.** The author has fourteen game repos; one more
  teaches less per hour than this does, and historical sims compete with
  studios on their own ground.
- **The Workshop (an armourer's shop, 1470s) as a dry run for the loop.** The
  original backlog plan. Dropped on 2026-11-02 when Shift became a training
  tool; the kill gate is now a numbers-only sim and a paper test with real
  supervisors, which is cheaper than a whole game.
- **GM Table and the Age of Chivalry work.** The author's TTRPG; a separate
  track with different constraints. Not part of Shift.
- **Points, badges, leaderboards.** Rejected: they make it a game first, they
  rank people, and the audience (tradespeople who have seen programs come and
  go) distrusts them.
- **Central storage of results.** Rejected for the pilot: employee practice
  data is sensitive; phone-local with export matches the LBA's confidentiality
  rules. Revisit only after the pilot proves the tool is worth a platform.
- **Simulating facilitation.** A sim cannot run a meeting; the Facilitator
  track is a hybrid with a live observer.
- **An AI game master or live model calls.** Outside the shape: offline, no
  API key, no server.

## 10. Status and the exact next steps

**Update (2026-11-04):** beta 2 is built, gated and committed (`f02736d`):
pressure from open problems, fatigue, a fairer score and a People tab, all
from the author's beta 1 notes. Then the author redirected the design away
from the LBA as the backbone. `REVIEW.md` is the current proposal and the
next-steps list; read it before the list below, which is now history.

**Done (2026-11-03):** the design plan, the organisation and product line,
the Supervisor spec, the kill gate (`KILLGATE.md`, passed), the stage 3 design
(`DESIGN.md`), and beta 1 of the Supervisor track: engine, eight modules,
narrator, bots, tests, screens, pixel bay, published as a private artifact
(`BETA.md` has the link and the test guide). The repository is
`HeirsOfRuin/Shift` on GitHub, private, branch `main`. The Game-Workshop
backlog entry points here.

**The next step is the author's**, not the agent's: play the beta and give a
verdict on voice, look, length and which scenarios feel fake. Then frame,
build, measure and republish each change (the workshop's feature loop), and
then the pilot. The ordered list below is the original plan; steps 1 to 5 are
done.

**Next, in order, with the workshop's gates:**
1. The author approves `SPEC.md` or marks it up.
2. **Kill gate.** `prototypes/killgate/`: the cell, hours, people and lag as
   numbers only, no interface. Five bot policies (firefighter, documenter,
   coach, ignorer, balanced), 50 seeds, eight weeks. Pass conditions are in
   `SPEC.md`; the one that matters most is that the ignorer loses most seeds
   but not all, because a tool where ignoring always loses preaches.
3. A paper test of The late one with one real lead: half an hour, cards and a
   sheet of numbers, before any interface.
4. `DESIGN.md` (stack, schema, the fixed asset list, scope pushback, a
   decisions log), then the scaffold (`init.mjs --shape=C`), the engine, bots,
   saves and check.
5. One module at full polish (The late one) for the author's verdict on voice,
   look and length; then the full Supervisor track; then the pilot.

**Do not:**
- Change a module's mechanics without re-running `npm run gate` and putting
  the numbers in the commit and the decisions log.
- Put any LBA item text, the scoring workbook, or anything identifying the
  author's employer into this repository's content. Design references only.
- Name a real person. The plant, crew and scenarios are fiction.
- Grow the art asset list without a frame document.
- Make the repository public, or open a pull request, without the author
  asking.
- Treat Shift's output as an assessment or readiness input. It is practice.

## 11. Working with the author

- Direct, plain, structured. No motivational language, no emojis, no
  overexplaining. Push back when the logic is weak; say what is uncertain.
- Give a recommendation, not a survey. Ask only when the answer changes the
  work; otherwise make the reasonable assumption and say so.
- He is reading on a phone between other things: outcome first, short
  sections, the decision he needs to make stated plainly.
- Log his words. Every decision goes into a table with the date and the quote;
  chat does not survive the session.
- He has an energy budget, not just a time budget: a third child in 2026, a
  plant to run, a firm to build. The plan says one track before six; keep it
  that way.

## 12. The process this build follows

The HeirsOfRuin game-building skills, source in `Game-Workshop/skills/`,
packaged in `Game-Workshop/packages/`. Read `game-building/SKILL.md` before
writing game logic; then `game-scaffold` (shape C), `game-measure` (the kill
gate and every balance claim), `game-narrative` (the content schema and text
tools), `game-release` (Pages and itch, later).

The stages and gates: backlog, one-page spec (author approves), kill gate
(policies diverge, none dominant), design doc (author approves), engine and
instruments (bots play full runs, check green, installs on a phone),
calibration (the author's verdict on two or three pieces at full polish),
vertical slice (the author wants the next one), feature loop (frame, approve,
build, measure, playtest, log), release. Skipping a stage is allowed; skipping
it silently is not.

The ten rules, in short: one derivation per number; nothing declared is
decoration; every harness proves progress; every number carries its noise
floor; look at it on a phone; silent states are broken; the world plays by the
player's rules; words derive from state; saves are contracts; write it down.

## 13. Glossary

- **LBA.** Leadership Behaviour Assessment, the author's v2 assessment: four
  domains, thirteen subdomains, five tiers, rule-based scoring.
- **Five Principles.** Northbound's five pillars and fifteen branches.
- **Handbook.** The Northbound Leadership Mentorship Handbook, eight modules.
- **Tier.** A role on the ladder: employee, coordinator/lead candidate, line
  lead, supervisor, manager (LBA); operator, lead hand, supervisor, manager
  (Northbound).
- **Direction.** Down (your people), up (your manager), across (your peers).
- **Module.** One scenario set, 6 to 10 simulated weeks, with a debrief.
- **Track.** A role's sequence of modules.
- **Practice profile.** Shift's output on the LBA scale, labelled practice.
- **Trace.** The end report's line from an outcome back to the decision that
  caused it.
- **Hidden cause.** The reason behind a problem, drawn per run from a weighted
  pool, found only by spending hours.
- **Kill gate.** The numbers-only prototype that must prove the loop before
  anything else is built.
- **Stage Two.** Northbound's term for a 60 to 120 person manufacturer whose
  informal systems have stopped working.
