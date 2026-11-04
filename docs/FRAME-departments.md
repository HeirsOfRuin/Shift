# Frame: a profile, a path, and screens that know whose they are

Written 2026-11-04. Status: the profile, the path and the framing are built
(beta 3); the department-specific floors are not, and this frame says what
that takes.

## The request, in the author's words

"Make it more customizable. when you start your shift game up, you 'log in'
or 'create a profile' that determines your position, which departments are
directly tied to you, and what your self-determined strengths and weaknesses
are. this will allow the simulator to determine the best path to help the
coach in the users mentorship, as well as personalize the worker screens
shown to you so a paint supervisor isn't forced to use the same screen as the
welder lead or metal fab manager screen"

## The problem

Beta 2 had one trainee: the welding supervisor. The track was one fixed order.
Nothing about the person holding the phone changed anything on it, so a coach
had nothing to assign and a trainee in paint read "your crew of seven welders"
on every screen.

## The design rule

The profile is the trainee's own claim about themselves. It shapes the order
and the framing; it never gates them, never scores them, and the floor gets a
vote on every claim (a self-rated strength is played last, as a check, not
skipped). The coach can open any module at any time.

## What is built (beta 3)

| Part | Where | What it does |
|---|---|---|
| Profile screen | `app.js` `profileScreen`, `view.js` `profileView` | Name (optional), seat (lead hand, supervisor, operations manager), department (the seven), departments tied to you (the ones on the line are automatic; the rest are a checklist), up to three areas to work on, up to three strengths. Validated in `state.js` `setProfile`. |
| The path | `engine/path.js` `pathFor` | Orders the eight modules: want-to-work-on first, the seat's leanings next, the rest in written order, strengths last. Each rung says why it is where it is. Unlocking follows the path. |
| Framing | `view.js` `seatNote`, `whoView` | The track screen is headed by the seat and department. A brief for a trainee outside the welding supervisor's seat says so plainly: "This module puts you in the welding supervisor's chair. You run Paint; this module is written in the welding bay, two doors down, and the lessons travel." |
| The People tab | `view.js` `peopleView` | The trainee's own department and the departments tied to it come first, with their supervisor, head count, stations and what goes wrong there. |
| Save v3 | `state.js` MIGRATIONS[2], `test/fixtures/v3-save.json` | `profile` on the save; old saves load and are asked for a profile before the track. |

## What is not built, and what it costs

The author's example is a paint supervisor on a paint screen. Every module's
floor, crew, problems and text are welding. Making a department its own
screen needs, per department:

| Need | Size | Notes |
|---|---|---|
| A crew of five to ten with looks, traits, hidden concerns | half an evening | `crew.data.js` is the template; fiction, no real person |
| Stations and a cell model | small | `departments.data.js` already names three stations each; the week engine's fit/weld/finish cell needs to become `stations[]` with the department's capacity numbers |
| The problem types re-voiced | an evening each | A late arrival is the same mechanic in paint; the text, the cover stories and the names are not (`text.data.js`, `problems.data.js`) |
| The pixel bay | one evening per department | `floor.js` draws fit-up, booths and finish; a paint bay needs a booth, prep and cure. The asset list (`DESIGN.md` section 9) grows by one tileset row per department: that needs the author's yes |
| The eight module briefs and cards | two evenings per department | Each brief names welding people and welding problems |
| The gate, per department | automatic | Five styles, 100 seeds, every module, every department |

Seven departments at that cost is months. The recommendation is **not** to
do it department by department. Instead:

1. **Seat before department.** A lead hand's and an operations manager's
   screens differ in what they can do (no discipline; no welding yourself),
   not in which bay they stand in. Building the three seats on the welding
   bay first changes the options on every card for a third of the cost of
   one new department, and it is what the Lead and Manager tracks in
   `PLAN.md` already need.
2. **Then the neighbours.** Paint and fabrication are the two bays every
   welding module already talks to (Theresa, Raymond). Build those two
   floors next; the trainee in electrical, interior or assembly plays in
   the nearest written bay and the brief says so.
3. **Then the rest, if the pilot asks for them.** The pilot's lessons log
   will say whether a trainee in assembly minded playing in paint. If they
   did not, the remaining four bays are not worth their evenings.

## What will be measured

- The path: for every combination of seat and work areas, the first module
  trains a work area when one is chosen (`test/save-contract.test.js`).
- The reads: every module's focus areas get at least three decisions from
  some style, so a read is possible (`test/invariants.test.js`).
- The seats, when built: the gate per seat; the lead's options must not let
  the lead do a supervisor's job, and the ignorer must still lose most seeds
  in every seat.

## Decision needed from the author

Order of the next build: the three new modules first (*Where it waits*,
*Monday 7:00*, *The new hand*, as agreed), or the three seats first (the
customisation he asked for today)? Recommendation: the modules first. The
pilot's trainees are leads and supervisors in several departments, and a
module about the huddle serves all of them; a lead-hand seat serves half.
