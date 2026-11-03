# Shift: a leadership simulator for the shop floor

Design plan, written 2026-11-03 in the Game-Workshop backlog and moved here the
same day with the author's first decisions. Status: plan and Supervisor spec
(`SPEC.md`), nothing built. Owner: the author.

Shift is a turn-based, pixel-art simulator of one fictional car plant. A trainee
runs a role in it for a simulated season, a week per turn, with limited hours,
problems whose causes are hidden, and consequences that land weeks after the
decision. Each module is a set of scenarios with a goal, ways to fail, and a
debrief. It trains leads, supervisors, managers, CI/Lean coordinators and huddle
facilitators one at a time, and a leadership group together.

It is a training tool with game mechanics, not a game that happens to be about
work. The debrief conversation is the product; the simulator exists to give that
conversation something real to talk about.

## Decisions (the author's words)

| Date | Decision |
|---|---|
| 2026-11-03 | **The plant.** "A car manufacturer, but they build every aspect of the vehicle. They have a welding, painting, fabricating, machining, electrical, interior, and assembly departments, tires and windows are the only finished parts they buy. Each department has anywhere between 5 and 10 employees, including the supervisor." |
| 2026-11-03 | **The pipeline is content.** "Some scenarios can include sections that have managers missing from the plant, supervisors who are gone, etc to also show how a pipeline is important." |
| 2026-11-03 | **First track.** "Let's start with the supervisor level of modules, for individual sessions." Group mode waits. |
| 2026-11-03 | **Replays** before sign-off: "Yes." |
| 2026-11-03 | **Voice.** "Plain, dry, but with some life, like a good narrator, not like a robot." |
| 2026-11-03 | **Its own repository**, `HeirsOfRuin/Shift`, private for the pilot. |
| open | The plant's name. `Tamarack Motor Works` is a placeholder until the author replaces it. |
| open | The vehicle: a light utility vehicle, about six a week, is the working assumption. |

---

## 1. What it is not

- Not a quiz. A quiz scores the decision when it is made, so people pick the
  answer they think is wanted. Here every action costs hours, and the result
  arrives later, so the only way to look good is to run the department well.
- Not an assessment. The author's Leadership Behaviour Assessment (LBA) measures
  what a person says they would do; the observer rating measures what the coach
  has seen. Shift measures what they do under pressure with trade-offs. Its
  output is labelled practice and is never a readiness input on its own.
- Not a video game first. No points, badges, leaderboards or streaks. Progress
  is a ladder of modules, unlocked by a coach sign-off after the debrief, not by
  a score. Ranking people against each other is exactly what the LBA standard
  forbids, and the simulator keeps that rule.

## 2. The world: one plant, shared by every track

**Tamarack Motor Works** (placeholder name). About sixty people. It builds a
light utility vehicle from raw steel to drive-away, roughly six a week when
everything works. Seven departments, in the order the vehicle moves:

| Department | People | Feeds | What can go wrong here |
|---|---|---|---|
| Fabrication | 5 to 10 | Machining, welding | Cut and formed parts late or out of spec; the first place a schedule slips |
| Machining | 5 to 10 | Welding, assembly | One machine, one operator who knows it; the classic single point of failure |
| Welding | 5 to 10 | Paint | Body and frame; the bottleneck when fully staffed, worse when not |
| Paint | 5 to 10 | Electrical | Booth time is fixed; rework from welding shows up here first |
| Electrical | 5 to 10 | Interior | Harness faults found late cost the most |
| Interior | 5 to 10 | Assembly | Waits on everyone upstream |
| Assembly | 5 to 10 | Shipping | Tires and windows bought in; the only place the whole vehicle exists |

Above the departments: a plant manager, two operations managers (each covering
three or four departments), a scheduler and a QC lead. Each department's
supervisor is a named character; so are a few leads.

**The pipeline is a mechanic.** Supervisors and managers can be on leave, quit,
get promoted or be covering two departments at once, mid-module. Escalations
then have nowhere to go, decisions wait or get made by whoever is standing
there, and the department's bench either holds or it does not. Scenarios use
this on purpose: a module where your manager is gone for a month teaches
decision rights and leading up faster than any one with a manager in the chair.

About forty named crew members in total across the seven departments, each with
visible traits (skill by station, tenure, pace) and hidden ones (a concern, a
trigger, growth potential, how much they trust you). Hidden traits surface
through behaviour on the floor: the sprite at the station shows frustrated,
idle or absent before anyone tells you why. Reading the floor is a skill the
simulator teaches by making the floor readable.

The plant lives whether or not the player acts: orders arrive, the press goes
down, someone calls in sick, a rush order lands in the busiest week. Rivals, in
this game, are the other departments and the schedule.

Why one world: every track and the group mode use the same plant, so content
compounds. A crew member a trainee coached as a lead is the same one they
discipline as a supervisor. The facilitator can say "remember Dale from Module
3." The product is deliberately not the author's day job's product, so no
order, character or department reads as a real person.

## 3. The engine under every module

The same engine runs every module. A module is content, never new code.

**The week.** One turn is one week, resolved in fixed phases: plan, Monday
huddle, events, work, Friday report. One record out per week; the report is
read off that record, so it cannot disagree with what happened.

**Hours.** The player has 40 hours a week. Every action spends some: a coaching
conversation 1 hour, a documented accountability meeting 1.5, a root-cause
investigation 3, a 5S event 6, covering a station yourself 8 a day.
Interruptions eat hours mid-week. The planner always names what is limiting you
this week and the one lever that would change it (a screen that is silent
about why is broken; the workshop learned that three times).

**The cell.** Stations, work in progress, a bottleneck, yield and a rework loop.
Improving anything but the bottleneck does nothing to throughput. The player is
not told where the bottleneck is; they find it from the floor and the numbers.
This cell model is the first thing built and the kill gate (section 11).

**People.** Skill, morale, load, trust in the player, and the hidden concern. A
coaching conversation raises skill slowly; skipping one when the signs are there
turns into a quit, a defect or a safety near-miss some weeks later.

**Consequence lag.** Every decision has a landing week. The skipped conversation
in week 2 becomes the resignation in week 9. The end report traces each outcome
back to the decision that caused it. This lag is the mechanic the whole tool
rests on: it is what a lecture cannot do and a quiz cannot do.

**Hidden causes.** Each problem draws its cause from a weighted pool. The late
employee is late because of childcare, a ride, or attitude; the right action
depends on which, and finding out costs an hour. Replaying a module with a
different draw is the point, not cheating. No action is best everywhere.

**Tags.** Every decision carries tags: the LBA domain and subdomain it exercises,
the Northbound pillar and branch, the handbook module, and the direction (down,
up, across). The play log is the measurement. Nothing is scored by a judge; the
tags and the outcomes do it.

## 4. Module anatomy

| Part | What it is | Length |
|---|---|---|
| Brief | Who you are this season, what the plant needs, what counts as done | one screen |
| Goal and fail states | Explicit and visible all module long, with the limiting factor named | on the planner |
| The run | 6 to 10 weeks of play, with 3 to 5 designed decision points and random floor events | 15 to 25 minutes |
| End report | Outcomes, and the trace from each outcome back to its cause | one screen |
| Debrief page | The handbook module's coaching questions, written answers, one action commitment with a 90-day date | with the coach |
| Sign-off | The coach marks the debrief done; the next module unlocks | |

Difficulty is four knobs per module: hours pressure, event density, cause
ambiguity, crew volatility. A trainee's first module runs them low. The same
module at high settings is a different experience, which is how a Manager-track
module can reuse a Supervisor scenario. Modules can be replayed before sign-off;
a replay redraws the hidden causes.

## 5. The tracks

Each track is a role in the same plant. The modules below are the first cut; the
author will cut and reorder them. The handbook reference is the Northbound
Leadership Mentorship Handbook; the LBA reference is the subdomain exercised.

**Build order: Supervisor track first, for individual sessions.** The others
are listed so the engine is built for them.

### Supervisor track (people execution), first

The player is the welding supervisor: seven welders and fitters, fed by
fabrication and machining, waited on by paint. Scarce resource: 40 hours against
a floor that would take 80. Full spec in `SPEC.md`.

| Module | The situation | Trains |
|---|---|---|
| The week | Inbox of ten, hours for five; interruptions; what you refuse | Time, prioritisation, multi-tasking |
| The late one | Third late arrival; private meeting, document, the discipline process, or let it go; hidden cause | Accountability management (handbook 7) |
| The loop | Two people with friction every few days; separate talks, joint reset, or warnings | Recurring conflict resolution |
| Firefighting | Every fire you put out yourself returns; the root cause costs three hours now | Handbook 1 |
| Pulled off the floor | Two weeks of meetings; the crew runs on whatever bench you built | Handbook 6 |
| Nobody upstairs | Your manager is gone for a month and the plant manager is covering; escalations go nowhere; decide what you can decide | Decision rights, leading up (handbook 4, 8) |
| Rush week | Behind schedule; every shortcut you allow is the new standard | Handbook 7 |
| Across | The paint supervisor holds a different standard; operators found the gap | Leading horizontally |

### Lead track (coordinates work, no formal authority)

Scarce resource: the crew's trust in you while you have no authority over them.

| Module | The situation | Trains |
|---|---|---|
| Shift start | The crew arrives tired; set the pace and the plan without a speech | Tone-setting |
| The new hire | Teach a task: how to and how not to; let them make a safe mistake | Early coaching |
| The third mistake | Same error, third time this week; fix it, correct it, or find the cause | Early coaching, basic empathy |
| Quiet tension | Two teammates working in silence; step in early or wait | Peer conflict prevention |
| Leading up | Your supervisor is about to be blindsided; what you tell them and when | Leading up (handbook 8) |
| Acting supervisor | The supervisor is out for three weeks and you are it; what you own, what you leave | The pipeline |
| The board | Bring an idea to the CI board; back a better one that replaces yours | Openness to improvement |

### Manager track (systems and leaders)

Scarce resource: the supervisors' capability, which grows only when you stop
solving their problems.

| Module | The situation | Trains |
|---|---|---|
| Stop rescuing | A floor problem you could fix in ten minutes; your supervisor would take a day | Handbook 5, 6 |
| The handoff | A weekly fight between welding and paint; patch, blame, or build a shared process | Cross-functional awareness |
| Decision rights | You hand out accountability; without decision rights, people stop deciding | Handbook 4 |
| Hidden load | Your best supervisor is quietly carrying three jobs; name it or lose them in week 8 | Handbook 3 |
| Patch or solve | A problem back for the fourth time; the structural fix costs a month | Strategic problem-solving |
| The empty chair | The paint supervisor quits; nobody was being developed; run the department while you find out why | The pipeline (handbook 6) |
| Context is layered | Translate an executive decision down and a floor problem up without losing either | Leadership context (the author's teachable) |

### CI/Lean coordinator track

Scarce resource: an improvement budget in hours, against decay. An improvement
nobody owns decays; an audit costs hours; a tool dropped into a broken leadership
environment produces a well-organised broken environment (Northbound's own line,
and the module that proves it).

| Module | The situation | Trains |
|---|---|---|
| Find the bottleneck | Improve the wrong station and nothing changes; find the right one | Systems thinking, theory of constraints |
| 5S that sticks | Run the event; then watch it decay unless ownership and audit exist | Lean tools, ownership |
| Standard work | Write it with the crew or for the crew; the audit shows which | Lean tools, delegation |
| The changeover | SMED on the press; the time saved only matters if the press is the bottleneck | Lean tools, systems |
| The A3 | The problem statement is wrong; everything downstream is wrong with it | Root-cause thinking |
| The sceptical crew | A kaizen event with people who have seen three programs die | Constructive influence, culture |
| The metric | A target that gets gamed; leading versus lagging measures | Learning systems |

### Facilitator track (huddles and meetings)

A human running a meeting cannot be simulated, so this track is a hybrid. The
simulator teaches structure; a live observer scores delivery.

- **In the simulator:** a huddle builder (agenda, time boxes, the board, the
  parking lot, action owners) and a timed huddle with crew interjections: the
  derailer, the silent one, the problem-dumper, the one with a safety concern.
  The player chooses how to handle each in the time left.
- **Live:** the trainee runs the simulator's huddle out loud with real people
  (the coach and two others). An observer scores a rubric card in the app:
  started on time, every action has an owner, the derailer handled without
  losing the room, problems parked not solved, ended on time.

| Module | The situation |
|---|---|
| The five-minute huddle | Agenda, board, owners, done |
| The derailer | One person turns the huddle into a complaint session |
| Problems are not actions | Everything raised gets an owner or a parking spot, nothing gets solved standing up |
| Should this be a meeting | Decide whether to hold it at all |
| The tier board review | Read the board, ask the three questions, escalate one thing |
| The disagreement | Two leads disagree in front of the crew; facilitate it, do not settle it |

### Leadership team track (group mode), later

One shared plant on one screen. Three to seven players each run a department; a
facilitator runs the session and the debrief. The plant-level number is the
only one that matters, and each player can see only their own department's.

| Module | The situation | Trains |
|---|---|---|
| Local optimisation | Every department hits its number; the plant misses shipping | Systems thinking |
| The handoff war | Two departments blame each other; nobody owns the interface | Cross-functional communication |
| The shared bottleneck | One station limits everyone; whose hours fix it | Systems alignment |
| The absent owner | A problem that belongs to no department, so it belongs to no one | Role clarity, ownership |
| One budget | One improvement budget, seven departments, one meeting | Decision quality, horizontal leadership |
| The standards gap | Seven sets of rules; the operators already found the gaps | Behavioural norms |

Group mode is measured at two levels: plant outcomes against department
outcomes, and the count of cross-department decisions made. The debrief uses the
Five Principles pillars as its headings.

## 6. Progression, goals and the game-like interface

Screens, phone first (390 px), the same build in facilitator mode on a laptop:

- **Plant map.** Top-down pixel art of the seven departments in flow order. Tap
  one to see its stations, its crew sprites in their current state, and its
  numbers.
- **Week planner.** Hours as blocks you drag onto actions; the inbox beside it;
  the limiting-factor line underneath.
- **Crew cards.** Visible traits, your notes, the history of what you did with
  them. Hidden traits stay hidden until behaviour reveals them.
- **Friday report.** What happened, in the plant's voice, with numbers.
- **Run history.** Every week of the module, and the trace lines from outcomes
  back to decisions.
- **Debrief page.** The coaching questions and the commitment, printable.

Goals are explicit and visible from the first screen of a module. Progress is
the track ladder; the next module unlocks on sign-off. Replays are allowed and
encouraged: a second run draws different hidden causes.

Tutorials teach by doing: the first module's first week is the tutorial, as
steps completed by the actions themselves, with one dismissible hint per screen
and a way to bring hints back. Progress lives in the save.

## 7. Voice

Plain, dry, with some life: a good narrator, not a robot. The report tells you
what happened the way a straight colleague would, with a little weight on the
detail that matters and no speech about it. A sample to calibrate against, for
the author to accept or strike:

> Paint got five bodies. They wanted six. Dale's station sat empty from
> Thursday noon; nobody told you where he went until Friday, and the person who
> told you was not Dale.

Calibration happens on the first polished module (section 11, stage 5): two or
three Friday reports and one brief at full polish, the author's verdict, then
the rest is written to match.

## 8. Art and animation

Pixel art, one master palette, the pipeline the workshop already runs: fine
scenes from supplied sources converted to the palette, animated in code.

The fixed asset list, decided before any art is made and not grown:

- One floor tileset: stations, aisles, racking, the booth, the press, the
  board, the office.
- About forty crew sprites across the seven departments, each in five states:
  working, idle, talking, frustrated, absent (an empty station is information
  too). The Supervisor track needs the welding seven and the neighbours first.
- A handful of code animations: welding sparks, the paint booth, a forklift,
  the clock, a press cycling and a press down, a body moving to the next
  department.
- Pixel UI frames with text that is legible on a phone. Legibility wins every
  argument with style.

Art carries mechanics or it is cut. A frustrated sprite at a station is what
the Social Awareness subdomain looks like on screen; the player who notices it
early has an option the player who did not notice has lost. A sprite that only
looks nice is decoration, and the workshop's second rule deletes decoration.

Art is the second-largest cost after scenario writing. A contact sheet of every
sprite state is part of the check, looked at at real size on a phone.

## 9. Measurement and the debrief

- The play log becomes a practice profile: 0 to 25 per domain and subdomain,
  the same arithmetic as the LBA, labelled practice.
- The profile sits beside the LBA self-report and the observer rating. The gap
  between them is the coaching conversation. Someone who scores high on
  accountability on paper and never documents anything in the simulator has
  something to talk about.
- The trace is the other half of the report: "the week-9 resignation traces to
  the coaching skipped in week 3." Outcomes without causes are a lecture.
- Nothing is stored centrally. Runs live on the trainee's phone, with a save
  code and a printable summary they bring to the debrief. In group mode the
  facilitator's device holds the run. This matches the confidentiality rules
  the LBA standard already sets.
- The tool proves its own claims with the measurement kit before anyone plays
  it: bots with written policies (the rescuer, the documenter, the ignorer, the
  firefighter) run every module across seeds. A module ships only if the
  policies produce different outcomes and none dominates. A module where
  "always document" wins everything is a quiz with graphics.

## 10. Architecture

Shape C from the scaffold: Vite, Preact, TypeScript strict, YAML content, Zod,
Vitest. Modules are authored content, so the content shape wins: scenarios,
choices, conditions and effects in YAML, validated at build time, with the
narrative kit's style lint, render scan and continuity checks. The week engine
is pure, `(state, input, content) -> state`, with named RNG streams in the
save, so the bots, the tests and the phone run the same code.

Offline-installable PWA; one build with an individual mode and a facilitator
mode. No server, no accounts, no API key. Saves are versioned with migrations
from day one, because a trainee's half-finished track must survive an update.

This repository is private for the pilot. The plant, the crew and the scenarios
are the author's own writing and never name real people.

## 11. What makes it versatile later

The Northbound remake changes content and tags, not the engine:

- The measurement backbone switches from the LBA's 13 subdomains to the Five
  Principles' 15 branches, with the four tiers and three directions.
- A client's values become a table the facilitator fills in, mapped onto the
  branches, the way the LBA already maps four company values onto the domains.
  The same module then reports in the client's language.
- Modules are assignable by tier and by assessed gap, individually or in a
  group, from one screen. That assignment screen is the Northbound product; the
  modules are its content.

## 12. Build order and gates

The workshop's stages, applied. Skipping one is allowed; skipping it silently
is not.

| Stage | Output | Gate |
|---|---|---|
| 1 Spec | `SPEC.md`: loop, scarce resource, the per-week decision, three ways to lose, one way to win, for the Supervisor track | The author approves |
| 2 Kill gate | Numbers-only week sim in `prototypes/killgate/`: the cell, hours, people, lag; five bot policies across 50 seeds; no interface | Policies diverge; no policy dominates; a good season is reachable and not trivial; ignoring loses most seeds, not all |
| 3 Design | `DESIGN.md`: stack, schema, the asset list, scope pushback, decisions log | The author approves |
| 4 Engine | Scaffold, pure engine, bots, invariants, saves, check | Bots play full modules; check green; installs on a phone |
| 5 Calibration | One module at full polish: The late one, with art and debrief | The author plays it and gives a verdict on voice, look, length |
| 6 Slice | The Supervisor track, all eight modules, debrief and export | The author wants to run the next track |
| 7 Pilot | Three to five people on the lead and supervisor path, six weeks, a lessons log from day one | The pilot questions below are answered |
| 8 Second track | The Lead or CI track, then the facilitator hybrid, then group mode | Each proven on real people before the next |
| 9 Remake | The Northbound system on the Five Principles | A client-shaped values table reports correctly |

The pilot has to answer: do people finish a module without being chased; does
the debrief produce talk or nods; do simulator choices differ from LBA answers
(if never, the simulator adds nothing); which scenarios feel fake to people who
work the floor; is 20 minutes right; individual first or group first.

Effort, as guesses and nothing more: the engine and first module are weeks of
sessions, not days; each further module is two to four evenings of scenario
writing plus measurement; the art set is a one-time cost if the list holds.

## 13. Risks

| Risk | Why it is real | What holds it off |
|---|---|---|
| Preachy | Serious games die when the right answer always wins | Hidden causes; costs for the right action; bots prove no policy dominates |
| Spreadsheet feel | A sim of numbers is a budget exercise | Bad news arrives mid-week in the crew's voice, on the floor, not in a table |
| Art scope creep | Art is the cost that grows quietly | The asset list is fixed in `DESIGN.md` and additions need a frame |
| Facilitation faked | A sim cannot run a meeting | The hybrid: structure in-app, delivery scored live |
| Confidentiality | Practice data about named employees is sensitive | Phone-local; nothing central; practice never a readiness input |
| Gaming the sim | A trainee learns the module instead of the skill | Hidden causes redraw; replay is encouraged, not punished |
| Nothing official yet | The LBA and this tool are the author's work, not the day job's system | Pilot with willing people as development practice; written approval before any result is used for anything |
| The author's hours | A third child, a plant to run, a firm to build | One track before six; the plan says so and the backlog holds the rest |

## 14. Next actions

1. The author approves `SPEC.md` or marks it up.
2. Build the kill-gate simulation and report the numbers.
3. Paper-test The late one with one lead before any interface: half an hour,
   cards and a sheet of numbers.
