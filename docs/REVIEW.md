# Shift: design review, 2026-11-04

Written after beta 2, at the author's request: "completely review the overall
design vision for this and determine next steps. I don't want this whole thing
to revolve around EI or LBA, It needs to cover a wide array of different topics
and focus points, with modules designed to focus on one or two at a time."

This document is the proposal. Nothing in the code has changed yet. Section 7
lists the decisions the author needs to make before any of it is built.

---

## 1. Verdict

The engine is sound. The content is too narrow. The narrowness comes from the
scoring frame, not from the scenarios.

- **What works and stays.** The week as a turn, the 40-hour budget, hidden
  causes, delayed consequences, the trace from each outcome back to its
  decision, the bots and the module gate, the plant and its cast, the voice,
  and the rule that the output is practice and never an assessment.
- **What is wrong.** The Leadership Behaviour Assessment (LBA) is the
  backbone of the whole design. Its four emotional-intelligence (EI) domains
  score every module. That has pulled all eight modules toward one family of
  topics (people problems) and has forced each module to touch topics it is
  not about.
- **The fix.** Shift gets its own catalogue of focus areas, covering the full
  range of the author's original brief. Each module trains one or two of them
  and scores only those. The LBA and the Northbound Five Principles become
  lookup tables that point at the catalogue, not the frame the catalogue sits
  in.

## 2. What the evidence says

### 2.1 The original brief versus what was built

The author's brief on 2026-11-02 named eight things to train: "leadership
skills, understanding systems, lean tools, facilitating meetings, time
management, prioritization, multi-tasking, and personal/employee development."

| Topic in the brief | Covered in beta 2 | Where |
|---|---|---|
| Leadership skills (people) | Yes, heavily | The late one, The loop, Across, Nobody upstairs |
| Time management | Yes | The week |
| Prioritization | Yes | The week |
| Multi-tasking | Partly | Interruptions in every module; nothing trains it directly |
| Personal/employee development | Partly | Pulled off the floor (the bench); coaching inside other modules |
| Understanding systems | **No** | The engine has a three-station cell with a bottleneck, but no module is about it |
| Lean tools | **No** | Planned in a later CI/Lean track; nothing built |
| Facilitating meetings | **No** | Planned as a hybrid track; nothing built |

Three of the eight topics have no module at all, and two more have only part
of one. The Supervisor track was the right first seat. But it was filled with
the topics the LBA scores, because the LBA was the measuring stick.

### 2.2 Where the scoring points land

There are 78 scored decisions across the eight modules and the engine. Sorted
by LBA subdomain:

| Subdomain | Scored decisions |
|---|---|
| Accountability Management | 19 |
| Emotional Awareness | 11 |
| Basic Empathy | 11 |
| Recurring Conflict Resolution | 8 |
| Cross-Functional Awareness | 7 |
| Early Coaching & Guidance | 5 |
| Culture & Organizational Influence | 5 |
| Respect & Professionalism | 4 |
| Tone-Setting | 3 |
| Openness to Improvement | 3 |
| Peer Conflict Prevention | 1 |
| Impulse Control | 1 |

Three subdomains carry 41 of the 78 (53%). Nothing scores flow, lean tools,
problem-solving method, safety, quality, planning or running a meeting,
because the LBA has no column for them. A topic the scoring cannot see
does not get written.

### 2.3 The four-domain profile works against focus

Beta 1's end report gave a "false low score" (the author's words) because a
module had touched only two of the four domains. Beta 2 fixed the symptom: no
domain score without three decisions behind it, and "every module now scores
self-awareness." That second change made every module carry self-awareness
decisions whether or not the module is about self-awareness.

This is the trap. A fixed four-domain profile on every module means every
module must feed all four domains, or the report looks broken. The author's
new rule, one or two focus areas per module, fixes the cause: a module
reports on what it trains and is silent on the rest.

### 2.4 Tracks by role lock topics behind roles

`PLAN.md` organises modules into six tracks by role: Supervisor, Lead,
Manager, CI/Lean, Facilitator and Leadership team. Topics cut across roles. A
lead and a manager both need prioritisation. A supervisor needs to find a
bottleneck as much as a CI coordinator does. Under the current plan, lean
tools wait for a CI track and facilitation waits for a Facilitator track.
Both are behind the Supervisor track and a pilot, so in practice they are a
year away.

### 2.5 An overall number invites misuse

The practice profile copies the LBA's arithmetic: 0 to 25 per domain, a
weighted overall, a low-domain penalty and bands from "Development priority"
to "Exceptional." It is labelled "practice," but a single weighted number on
an assessment scale is exactly what gets put in a spreadsheet and compared
across people. That breaks the LBA's own rule against ranking people, and
Shift's rule that its output is never a readiness input. The label does not
hold off the number.

## 3. The revised vision

### 3.1 In one paragraph

Shift is a library of short practice scenarios set in one fictional plant.
Each module puts the trainee in a seat (lead, supervisor, manager) and trains
one or two focus areas from a fixed catalogue: prioritisation, finding the
bottleneck, running a huddle, holding a standard, coaching a new hire,
solving a problem at the root, and so on. The end report shows how the
trainee handled those one or two areas: which moves they made, which signals
they missed, and the trace from each outcome back to its cause. A coach
assigns modules by focus area and seat. Tracks are reading lists drawn from
the library, not separate products.

### 3.2 What changes, part by part

| Part | Was | Becomes |
|---|---|---|
| Backbone | LBA: 4 EI domains, 13 subdomains | Shift's own catalogue: about 20 focus areas in 6 families (section 4) |
| A module trains | Whatever the LBA tags its decisions with, across all four domains | One or two focus areas, named on the brief |
| End report | 0 to 25 per domain, a weighted overall, bands | Per focus area: the moves made and missed, with the week and the evidence, a three-level read, and the trace. No overall. |
| What isn't scored | Forced into the profile anyway | Still happens on the floor (the background problem, the inbox), shown in the trace, not scored |
| Organisation | Six role tracks, built one after another | One library, tagged by focus area and seat; tracks are curated lists |
| LBA | The measuring stick | A lookup table from focus areas to subdomains, for the pilot's comparison with self-report and observer ratings |
| Five Principles | The tags the remake would switch to | A second lookup table; the Northbound remake changes the lookup, not the catalogue |
| Seat | One track per role | A module setting: the same bay, harder knobs, different authority |

### 3.3 What stays exactly as it is

- The engine loop, hours, hidden causes, consequence lag and the trace.
- The kill gate's five conditions per module, run by the bots. Every module
  still has to pass the gate.
- The plant, the cast, the welding bay, the voice and the art list.
- Practice, not assessment. Phone-local saves. No points, badges or ranking.
- The welding supervisor as the first seat. The library grows in that seat
  first, because the crew, art and engine are built for it.

## 4. The focus-area catalogue (first cut, for the author to edit)

Six families, 20 focus areas. Each area is defined by **moves**: observable
decisions a module can count. A move only scores when the signal was in
front of the trainee. Scoring is against what they knew, never the hidden
cause (the rule `outcome.js` already follows).

The "Engine" column says whether the current engine can run a module on this
area today (**ready**), needs a small addition (**small**), or needs a new
mechanic (**new**).

### A. Running the work

| Focus area | Moves (what good looks like) | Engine |
|---|---|---|
| A1 Prioritisation | Spends hours on what moves the goal; refuses low-value work out loud; protects time for the non-urgent important thing | ready |
| A2 Time and interruptions | Keeps the week inside its limit; batches interruptions; notices what pushed the week over and changes it | ready |
| A3 Planning and capacity | Gives the scheduler honest numbers; reads the forecast before committing; flags a shortfall before it lands | small |
| A4 Delegation | Hands off real work with the authority to do it; does not take it back at the first wobble; checks in without hovering | ready |

### B. Flow and systems

| Focus area | Moves | Engine |
|---|---|---|
| B1 Finding the bottleneck | Looks at where work waits before acting; spends improvement hours only on the constraint; rechecks after the constraint moves | small (cell exists; needs visible queues and an improve action per station) |
| B2 Lean tools | Picks the tool that fits the problem (5S, standard work, changeover, visual management); builds it with the crew; sets up the audit that keeps it alive | new (decay of an improvement without an owner) |
| B3 Root-cause problem solving | Investigates before fixing; tests the fix; does not stop at the first cause; closes the loop when it recurs | ready |
| B4 Metrics and data | Reads leading signals, not just the Friday number; spots a measure being gamed; changes the measure, not just the people | new |

### C. Quality and safety

| Focus area | Moves | Engine |
|---|---|---|
| C1 Holding the standard under pressure | Keeps the standard when the number is short; names the shortcut out loud; trades schedule for standard knowingly, never by drift | ready |
| C2 Safety | Acts on the first report, not the third; stops the job when it should stop; closes actions instead of carrying them | ready (safety debt exists) |
| C3 Quality at the source | Finds defects where they are made, not where they are found; feeds back upstream; does not let rework hide the cause | small |

### D. People

| Focus area | Moves | Engine |
|---|---|---|
| D1 Coaching and development | Coaches early, at the bench; builds the bench before it is needed; matches the coaching to the gap | ready |
| D2 Accountability | Finds out why before acting; fits the response to the cause; documents; follows through | ready |
| D3 Conflict | Steps in early; separates people from the problem; resets the working agreement; checks it held | ready |
| D4 Training and onboarding | Teaches the task and the reason; lets a safe mistake happen; checks understanding, not attendance | small |

### E. Up and across

| Focus area | Moves | Engine |
|---|---|---|
| E1 Leading up | Brings the problem early with the facts and an option; knows whose decision it is; does not blindside | ready |
| E2 Working across | Goes to the peer before going up; fixes the handoff, not the blame; agrees one standard at the interface | ready |
| E3 Leading change | Explains the why before the what; involves the sceptics; keeps the change alive after week two | new (crew buy-in as a tracked quantity) |

### F. Meetings and self

| Focus area | Moves | Engine |
|---|---|---|
| F1 Running a huddle | Starts on time; every action gets an owner; parks problems instead of solving them standing up; handles the derailer | new (a huddle phase with interjections; the live-observer half stays as planned) |
| F2 Self-management under pressure | Notices own load and fatigue; does not make the big call at hour 55; recovers the week instead of grinding | ready (fatigue exists) |

Emotional intelligence has not disappeared. It is now one area (F2), plus the
reading-people moves inside D1 to D3 and E1 to E2. It is no longer the frame
everything else has to fit into.

## 5. The library: the eight modules re-tagged, and the gaps

### 5.1 The eight built modules, re-tagged to one or two areas each

| Module | Focus areas | Change needed |
|---|---|---|
| The week | A1 Prioritisation, A2 Time and interruptions | Drop the self-awareness padding; the extractor stays as the floor problem |
| The late one | D2 Accountability | None beyond the re-tag |
| The loop | D3 Conflict | None |
| Firefighting | B3 Root-cause problem solving | None |
| Pulled off the floor | A4 Delegation, D1 Coaching and development | Doing nothing still wins 45%; needs the tuning it was already due |
| Nobody upstairs | E1 Leading up | None |
| Rush week | C1 Holding the standard | None |
| Across | E2 Working across | None |

Mechanics do not change, so the bots' win rates should not change either.
Only what the end report counts changes. The gate re-runs anyway, as
`CLAUDE.md` requires.

### 5.2 Gaps, and the next modules to build

All of these are in the welding supervisor's seat, in the same bay. They are
ordered by value to the brief, then by engine cost.

| # | Module (working title) | Focus areas | Engine | Why this one |
|---|---|---|---|---|
| 1 | Where it waits | B1 Finding the bottleneck | small | "Understanding systems" is in the brief and has nothing. The cell already exists. The cheapest way to cover a whole missing family. |
| 2 | Monday, 7:00 | F1 Running a huddle | new | "Facilitating meetings" is in the brief and has nothing. Supervisors run a huddle every day. |
| 3 | The new hand | D4 Training and onboarding | small | Every supervisor onboards. It is the most-asked-for topic in trades training. |
| 4 | It looked great for a week | B2 Lean tools (5S, standard work) | new | "Lean tools" is in the brief. The decay mechanic makes the lesson: a tool without an owner dies. |
| 5 | The near miss | C2 Safety | ready | Engine already tracks safety debt; cheap to write. |
| 6 | The number on the board | B4 Metrics and data | new | Teaches leading versus lagging measures, and gamed targets. |
| 7 | Nobody asked for this | E3 Leading change | new | The plant is about to change a process; bring the crew with it. |

Modules 1 to 3 are the recommended next build. Together they cover the three
missing topics from the brief (systems, meetings, development) at the lowest
engine cost.

### 5.3 Seats later, from the same library

A Lead seat and a Manager seat reuse the same focus areas with different
authority and knobs (the lead cannot discipline; the manager cannot weld).
`PLAN.md`'s Lead, Manager and CI module ideas move into the library, tagged by
focus area. Group mode stays last.

## 6. Risks of the revised vision

| Risk | Why it is real | What holds it off |
|---|---|---|
| Catalogue sprawl | Twenty areas times three seats is sixty possible modules | The catalogue is fixed in one file. Modules are built in the order of section 5.2, three at a time, each through the gate. |
| A module about one area is a quiz | Narrow focus makes the right move easy to spot | Hidden causes and the background problem stay in every module. The floor never stops, so the trainee still has to find the focus area's problem among the noise. |
| The pilot loses its comparison | The pilot planned to set Shift's profile beside the LBA self-report and the observer rating | The LBA lookup table keeps that comparison possible, at subdomain level, as a secondary screen for the coach |
| New mechanics break the engine | Huddle, decay and metrics are new | Each new mechanic gets a numbers-only kill gate in `prototypes/` before content, as the first gate did |
| The author's hours | A plant, a firm, a family | Same rule as before: one seat, three modules at a time, beta before pilot |

## 7. Decisions the author needs to make

Each has a recommendation. Reply with yes, no or a change.

1. **The direction.** Shift's own focus-area catalogue becomes the backbone.
   The LBA and the Five Principles become lookup tables. *Recommend: yes.*
2. **The catalogue.** Cut, add or rename areas in section 4. *Recommend:
   accept as a first cut; it can change module by module.*
3. **The end report.** Moves made and missed per focus area, a three-level
   read ("not yet," "getting there," "solid") with at least three decisions
   behind it, the trace, and no overall number. *Recommend: yes. The overall
   number is the part most likely to be misused.*
4. **The LBA comparison in the pilot.** Keep it as a secondary coach screen,
   or drop it. *Recommend: keep it. It costs one table, and the
   self-report-versus-practice gap is still the best debrief opener.*
5. **The next three modules.** Where it waits, Monday 7:00 and The new hand.
   *Recommend: yes, in that order.*
6. **Tracks.** Role tracks become curated lists from one library. *Recommend:
   yes.*

## 8. Next steps, in order, with the gates

| Step | Work | Who | Gate |
|---|---|---|---|
| 0 | Answer section 7 | Author | Decisions logged in `CONCEPT.md` with his words |
| 1 | Play beta 2 for pressure, voice and length only; ignore its score screen, which is being replaced | Author | Notes in the decisions log |
| 2 | Write `docs/CATALOGUE.md`: the agreed areas, their moves, the LBA and Five Principles lookups | Agent | Author accepts |
| 3 | Scoring refactor: focus areas replace domains in `tags.data.js` and `outcome.js`; re-tag the eight modules; remove padding decisions; new end report; save v3 with migration | Agent | `npm run gate` unchanged win rates; `npm run check` green |
| 4 | Kill gate for the bottleneck and huddle mechanics, numbers only | Agent | Policies diverge, none dominates, ignoring loses most seeds but not all |
| 5 | Build Where it waits, Monday 7:00 and The new hand | Agent | Each passes the module gate |
| 6 | Beta 3 published to the same link | Agent | Author plays one new module and the new end report |
| 7 | Pilot with three to five willing leads and supervisors | Author | The pilot questions in `PLAN.md` section 12 |

Steps 2 and 3 can start as soon as decisions 1 and 3 are answered. They do
not wait on the rest.
