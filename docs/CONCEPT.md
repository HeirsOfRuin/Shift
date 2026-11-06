# Shift: the concept, for a reader who was not there

Written 2026-11-03 as the handoff for any new session. Read this first, then
`CATALOGUE.md` (what it trains, 2026-11-04), `REVIEW.md` (why), then `PLAN.md` (the full design), `ORG.md` (the company, the cast, the vehicles)
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

| 2026-11-04 | Not built around EI or the LBA: "I don't want this whole thing to revolve around EI or LBA, It needs to cover a wide array of different topics and focus points, with modules designed to focus on one or two at a time." The review and proposal are in `REVIEW.md`. |
| 2026-11-04 | The review's six decisions: "yes to all, go ahead with the catalogue and scoring." Built the same day (`CATALOGUE.md`). Sections 7 and 8 below are now history: the LBA is a lookup table on each focus area, not the frame. |
| 2026-11-04 | A profile and a path: "make it more customizable. when you start your shift game up, you 'log in' or 'create a profile' that determines your position, which departments are directly tied to you, and what your self-determined strengths and weaknesses are. this will allow the simulator to determine the best path to help the coach in the users mentorship, as well as personalize the worker screens shown to you so a paint supervisor isn't forced to use the same screen as the welder lead or metal fab manager screen." The profile, the path and the framing are built; the department-specific floors are costed in `FRAME-departments.md`. |
| 2026-11-04 | Three more topics: "More I want this to cover is helping people explain the idea of internal customers, rework being beyond parts (like have to have the same conversation multiple times or causing people to search for information they should have had), how ERPs work and how much more work there is beyond the interface production staff can see and manipulate (this one should be aimed at Epicor and how PhiBer uses it)". Built as beta 8 (`FRAME-three-more.md`): three catalogue areas and three modules. The ERP module uses Epicor's structure and vocabulary in the fictional plant and takes the system's name from the trainee's profile; how the author's plant uses it stays out of the repository (`CLAUDE.md`) and belongs to the coach at the debrief. The author has not yet confirmed that reading of the rule. |
| 2026-11-04 | Lean tools and a standing rule: "Keep going with the lean tools module, kill gate first. I want every module for the weld department view point well developed and and clear in its purpose." Built as beta 9: `KILLGATE-lean.md`, the module *It looked great for a week*, and a one-sentence purpose on every module, shown on the brief and the track. |
| 2026-11-04 | Testers: "help me set this up so I can send the link to my leads to play test this and get their thoughts on it". Beta 9 adds *Your thoughts, for the coach* (a send when the page is open on claude.ai and the viewer is signed in; copy-as-text always), a card for testers on the title screen, and `PLAYTEST.md`, the note to send with the link. The page declares the shared store with suggestion-box rules: each tester writes their own, only the owner reads. |
| 2026-11-04 | First playtest of the whole: "Getting into it, it is very reading heavy... I think more readability, visualization, concise wording, etc would help the flow." Beta 10 is the readability pass (`FRAME-readability.md`): measured at 390 px, the profile went from 8.1 screens to 2.7, the track from 8.9 to 2.6, the brief from 3.1 to 1.3, a week from 5.0 to 3.2; chips, folds, meters, a paint chart, 39 option labels shortened. The engine and the voice did not change. |
| 2026-11-06 | Beta 16, the rest of "Fix this": every problem type finds out three ways; the pattern trails the tuned style by 17 to 68 points in every module but *Rush week*, which is exempt by name until it has a hidden reason behind its shortcuts (beta 17, kill gate first). Ten changes on the way, each with its reason, in `KILLGATE-ask.md`. |
| 2026-11-06 | "go with your recommendations. Fix this." Beta 15: the how-you-ask kill gate (`KILLGATE-ask.md`, the pattern trails a player who reads the person by 22 points), built on *The late one* (three ways to find out, Brent's trust drawn per run, a find-out row and a do row on the ticket); a sixth gate condition that the pattern trails the balanced style by 15 points; the end screen shows what the cause was and the same month worked five other ways; 33 wrong-move lines rewritten to say why. Beta 16 takes the ways to every module. |
| 2026-11-06 | Playtest verdict on the core loop: "I don't actually feel like it imparts any information. It just feels like finding or following the right answer while attempting to keep under 40 hrs." Measured and confirmed (`REVIEW-loop.md`): a bot with two rules and no leadership knowledge wins 76% against the tuned bot's 88%, within three points in eleven of seventeen modules; 25 of 44 wrong-move lines say only "not that". Recommended: make how you ask matter (kill gate first, on *The late one*) and add a gate condition that the pattern bot must lose. No new modules until the loop teaches. Awaiting the author's direction. |
| 2026-11-05 | Two answers. On the three catalogue areas with no module staying visible as "none yet": "Yes." On path or lock: "I don't know what you mean by locked", so the question was badly put and is withdrawn; today an assignment sets what the track shows and a trainee who starts over can play anything, which stays as it is unless the author says otherwise. And "How do I access the coach screen?": it was hidden once a device had a save; now it is a button on the track and on the title screen, and one save holds both the track and the roster. |
| 2026-11-05 | Beta 14, from "Then start the next beta": the rebuild the breadth check recommended. *Pulled off the floor* gets a hidden cause (`FRAME-pulled.md`); nothing else in the module moves. |
| 2026-11-05 | The group event, redirected: "I want the group event to be a facilitator using one screen to work through problems or theories with the group watching, conversing, participating, etc. the facilitator would have printed out notes to go off of, or something like that. Fix what you need fixed. Then start the next beta". Beta 13: a session is one run of one module on one screen, started from the coach's sessions tab, with the facilitator's lines above the week and the debrief and reveal at the end; the notes print from a page of their own and from `GROUPS.md`. The first draft's "same seed on every phone" and its seed-field gap are gone with it. Then beta 14 begins: *Pulled off the floor* rebuilt on the problem-type pattern. |
| 2026-11-05 | The breadth check and the coach's side: "We have to be very careful not to try cover everything and not show anything properly. help me make sure, we aren't doing that. I also want it to be usable as a way for coaches to assign certain modules to their employees. lets start building it as a system that you log in to and you are either assigned a coach or trainee profile and the coach profile allows you to see which trainees are assigned to you and what modules they can access. I also want to outline the group learning modules that coaches can present and work a group through. like the lego plane thing, working through difficult scenarios, etc. use my northbound material to get ideas, if we dont have any outlined yet". Beta 12 (`FRAME-coach.md`): the audit of the seventeen modules (even depth; *Pulled off the floor* the weakest; the catalogue wider than the modules), the verdict (freeze the catalogue at 24, depth from the room and the path, a trainee sees three to five modules), the coach and trainee roles with assignment and progress codes (no server, so the code is the login), and six group sessions from the author's cohort shape and his two workshop kits, each built on a module that exists (`GROUPS.md`). Open for the author: is an assignment a path or a lock. |
| 2026-11-04 | The plane exercise: "It'd be really nice to have some sort of inspiration from the Lego Plane lean exercise". Built as beta 11: a kill gate first (`KILLGATE-flow.md`), a new catalogue area (B7 Flow) and the module *Round two*, with a round-results board on the week screen. The exercise's brand and pieces stay out of the content: in the game it is Priya's flow rounds in the welding bay. |
| 2026-11-04 | The order of build, and a new module idea: "1 and then 2. keep this project moving. I think forcing some people to see the other departments pov from time to time would actually be a really good training tool as well!" The three new modules first (built the same day as beta 4: *Where it waits*, *Monday, 7:00*, *The new hand*), then the three seats. The other-department point of view goes in the catalogue as a module (*The other side*), not as a gap. |

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

**Update (2026-11-06, beta 16):** every module but *Rush week* now finds
out three ways, and the gate enforces that the two-rule pattern loses
(average gap 33 points, was 12). **Next:** beta 17, *Rush week* given a
hidden reason behind the crew's shortcuts, kill gate first; then the leads'
notes.

**Update (2026-11-06, beta 15):** the fix begins. *The late one* finds out
three ways (`KILLGATE-ask.md`); the gate now requires the two-rule pattern
to lose (it trails by 24 points as supervisor, 38 as lead hand); every end
screen says what the cause was and replays the same month five other ways;
wrong moves say why. **Next:** beta 16, the ways in every module.

**Update (2026-11-06):** the author's playtest verdict on the loop, measured
in `REVIEW-loop.md`. The loop is a key: ask, read the cause, press the
matching label, watch the hours. Six options and a recommendation are
there. The author: "go with your recommendations. Fix this."

**Update (2026-11-05, beta 14):** *Pulled off the floor* rebuilt on the
problem-type pattern (`FRAME-pulled.md`): why Kev is not ready is a hidden
cause with four answers, and the one you do not find lands on him while you
are away. Gate: doing nothing fell from 40% to 13%, balanced 76%. **Next:**
the leads' notes; no new catalogue area until they are read.

**Update (2026-11-05, beta 13):** group sessions on one screen
(`FRAME-coach.md` section 3): the facilitator runs the module, the room
decides out loud, the facilitator's lines sit above the week, the debrief
and the reveal end it, and the notes print. **Next:** beta 14, *Pulled off
the floor* rebuilt with a hidden cause; then the leads' notes.

**Update (2026-11-05, beta 12):** the coach's side and the breadth check
(`FRAME-coach.md`). A save is a coach's or a trainee's; the coach keeps a
roster, assigns modules in an order, hands over an assignment code; the
trainee's track shows only those and hands back a progress code (or sends it
from the page); six group sessions on the coach's screen (`GROUPS.md`). The
audit found even depth across the seventeen modules and one weak one. No
mechanic changed; the gate is identical. **Next, in order:** rebuild *Pulled
off the floor* on the problem-type pattern with a hidden cause; then the
leads' notes. No new
catalogue area until those are read.

**Update (2026-11-04, beta 11):** *Round two*, from the plane exercise:
the bay run as rounds with three rules (batch, push or pull, where you
check), the numbers on a board every Friday, one rule at a time. Seventeen
modules, 24 focus areas. **Next:** the author's and the leads' notes.

**Update (2026-11-04, beta 10):** the readability pass from the author's
first note on the whole ("very reading heavy"). Screens cut to a third of
their height with the words a tester needs now visible and the rest a tap
away; see `FRAME-readability.md` for the before and after. **Next:** the
author's and the leads' notes.

**Update (2026-11-04, beta 9):** *It looked great for a week* (B2 Lean
tools), kill gate first (`KILLGATE-lean.md`); a purpose line on all sixteen
modules; the testers' feedback screen and `PLAYTEST.md`. Sixteen modules,
three seats. **Next:** the author sends the link to his leads; their thoughts
arrive in the page's store (read with the ArtifactData tool, collection
`feedback`) or as messages; those notes become the lessons log the pilot
needs (`PLAN.md` section 12).

**Update (2026-11-04, beta 8):** three modules from the author's evening
note: *Who you work for* (E4 Internal customers), *Say it once* (B5 Hidden
rework), *What the system sees* (B6 The system, with the ERP's name from the
profile). Fifteen modules, 23 focus areas, three seats, all through the gate.
**Decision needed from the author:** the ERP module's reading of the
employer rule (Epicor's structure and vocabulary, the plant's name and
practice kept out).

**Update (2026-11-04, beta 7):** *The other side* (`FRAME-other-side.md`),
from the author's point-of-view note: the welding supervisor covers paint for
four weeks and their own department's spatter lands on their desk. Twelve
modules, three seats. **Next:** the author's verdict on betas 5 to 7, then
*It looked great for a week* (B2 Lean tools), which needs a decay mechanic
and its own kill gate.

**Update (2026-11-04, beta 6):** the operations manager's seat
(`FRAME-seats.md`, `KILLGATE-manager.md`): the player is Dana, Kev runs
welding, and every problem reaches her through him; her four moves are ask,
tell, go down, leave; Kev's capability is the resource and the end report
checks he is no worse than she found him. Six modules play from the seat and
pass the gate. All three seats are built. **Next:** beta 7, *The other side*.

**Update (2026-11-04, beta 5):** beta 5 adds the lead hand's seat on the
welding bay (`FRAME-seats.md`): the player works fit-up in Kev's old spot
with Kev as supervisor; what needs a signature goes to Kev with whatever the
lead found out; every ticket comes off the table. Eight of eleven modules
play from the seat and pass the gate; the supervisor seat is unchanged. The
operations manager's seat is framed, not built, and needs a kill gate for the
supervisor-capability loop first. **The next step:** the author plays beta 5
as a lead hand, then the manager's seat kill gate, then *The other side*.

**Update (2026-11-04, later):** beta 4 adds the three modules that cover the
brief's missing topics: *Where it waits* (finding the bottleneck), *Monday,
7:00* (running a huddle), *The new hand* (onboarding). Eleven modules, all
through the gate (`FRAME-three-modules.md` has the numbers). **The next step**
is the three seats (lead hand, supervisor, operations manager on the welding
bay: `FRAME-departments.md`), then *The other side*. The author has beta 4 to
play meanwhile.

**Update (2026-11-04):** beta 2 (pressure, fatigue, a fairer score, a People
tab) and then beta 3 are built and gated. Beta 3 replaced the LBA backbone
with Shift's own focus-area catalogue (`CATALOGUE.md`), one or two areas per
module, three-level reads and no overall number; and added the trainee
profile (seat, department, tied departments, strengths, areas to work on),
which builds their path through the modules. `REVIEW.md` is the reasoning;
`FRAME-departments.md` is what the per-department screens would cost and the
recommended order. **The next step:** the author plays beta 3 (the profile,
one module, the new end report), decides modules-first or seats-first
(`FRAME-departments.md`, last section), and then the three new modules get
built: *Where it waits*, *Monday 7:00*, *The new hand*. The list below is
history.

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
