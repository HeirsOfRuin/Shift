# Frame: the coach's side, and the breadth check

The author, 2026-11-05: "We have to be very careful not to try cover
everything and not show anything properly. help me make sure, we aren't
doing that. I also want it to be usable as a way for coaches to assign
certain modules to their employees. lets start building it as a system that
you log in to and you are either assigned a coach or trainee profile and the
coach profile allows you to see which trainees are assigned to you and what
modules they can access. I also want to outline the group learning modules
that coaches can present and work a group through. like the lego plane thing,
working through difficult scenarios, etc. use my northbound material to get
ideas, if we dont have any outlined yet"

Three asks. The first decides the shape of the other two.

## 1. Are we covering everything and showing nothing properly?

Measured on beta 11 (`tools/_audit.mjs`, a scratch script): what each module
has behind it, and what the gate says about it.

| Module | Problem type | Causes | Actions | Text lines | Variants | Cards | Seats | Brief and debrief, words | Balanced wins | Doing nothing wins |
|---|---|---|---|---|---|---|---|---|---|---|
| The week | hazard | 4 | 5 | 29 | 37 | 0 | 2 | 221 | 88% | 20% |
| The late one | late | 3 | 5 | 29 | 43 | 0 | 3 | 198 | 82% | 22% |
| The loop | friction | 4 | 5 | 26 | 39 | 0 | 3 | 196 | 82% | 15% |
| Firefighting | recurring | 4 | 7 | 32 | 40 | 0 | 3 | 196 | 82% | 13% |
| Pulled off the floor | scripted | 0 | 0 | 0 | 0 | 5 | 1 | 187 | 82% | 40% |
| Nobody upstairs | escalation | 4 | 5 | 32 | 34 | 3 | 1 | 209 | 83% | 8% |
| Rush week | scripted | 0 | 0 | 0 | 0 | 9 | 2 | 192 | 83% | 15% |
| Across | standards | 4 | 6 | 28 | 30 | 0 | 2 | 180 | 70% | 8% |
| Where it waits | constraint | 4 | 5 | 27 | 42 | 0 | 3 | 235 | 85% | 18% |
| Monday, 7:00 | huddle | 4 | 6 | 29 | 43 | 6 | 2 | 220 | 73% | 10% |
| The new hand | newhand | 4 | 7 | 30 | 46 | 0 | 3 | 216 | 73% | 18% |
| The other side | otherside | 4 | 8 | 37 | 57 | 2 | 1 | 272 | 72% | 12% |
| Who you work for | customer | 4 | 6 | 28 | 42 | 2 | 1 | 246 | 70% | 17% |
| Say it once | infowork | 4 | 6 | 29 | 43 | 2 | 2 | 216 | 78% | 17% |
| What the system sees | erp | 4 | 6 | 29 | 44 | 2 | 2 | 278 | 78% | 15% |
| It looked great for a week | lean | 4 | 6 | 33 | 52 | 2 | 2 | 219 | 78% | 17% |
| Round two | flow | 4 | 5 | 30 | 49 | 2 | 2 | 242 | 75% | 20% |

"Causes" is the hidden-cause draw; "actions" the options on the problem
ticket; "text lines" the keys of module-specific text and "variants" the
sentences behind them (a key with three variants reads differently on a
replay). The two win rates are from the module gate at 100 seeds.

What it says:

- **No module is a stub.** Every typed module has four causes (one has
  three), five to eight actions, about thirty text lines and thirty to sixty
  sentences. The two scripted modules (*Pulled off the floor*, *Rush week*)
  carry five and nine cards instead. The brief-plus-debrief length is 180 to
  280 words everywhere. Depth is even; nothing was built thin to get the
  count up.
- **One module is weaker than the rest.** *Pulled off the floor*: doing
  nothing wins 40%, the top of the gate's allowed band, and it is scripted
  with no hidden cause. It passes, but it is the module most likely to feel
  like a quiz to a tester. It is the first candidate for a rebuild on the
  problem-type pattern, not for a new module.
- **The catalogue is wider than the modules.** Twenty-four areas; nineteen
  have a module. Three are listed with none (B4 Metrics, C2 Safety, E3
  Leading change) and two are "scored in every module, unrated" (A3
  Planning, F2 Self-management). That is where "cover everything" would
  start: the catalogue names things the game does not yet show.
- **One module per area.** Except E2, every area has exactly one module.
  One module is one hidden-cause draw of four. A replay draws another, and
  the debrief carries the rest; but a person who plays an area once has seen
  one week of it.

**Correction, 2026-11-06.** This table measured content, not decisions.
The author's playtest found the decisions shallow in every module in the
same way, and a two-rule bot confirmed it (`REVIEW-loop.md`). "Depth is
even" is true of the writing and false of the play.

The verdict, and what beta 12 does about it:

1. **Freeze the catalogue at 24 and build no new area until the leads'
   playtest is read.** The three unbuilt areas stay listed as "none yet" on
   the catalogue page, visibly, rather than being built to fill the row.
2. **Depth now comes from the room and the path, not from new mechanics.**
   The six group sessions below are each built on a module that exists and
   is gated. None needs a new mechanic. They add what a module alone cannot:
   the same seed on eight phones, a flip chart that shows who did what, and a
   facilitator who asks and does not answer.
3. **A trainee should see three to five modules, not seventeen.** The track
   already orders by profile; the assignment narrows it to what the coach
   chose. The coach's form warns at six. Seventeen on a shelf is fine; seventeen
   in front of one person is the thing the author is warning about.
4. **The next build after this one is a rebuild, not an addition:** *Pulled
   off the floor* onto the problem-type pattern with a hidden cause (why the
   lead is not ready: never shown, never trusted, never told, or not the right
   person), gated like the rest. Done as beta 14 (`FRAME-pulled.md`).

## 2. The coach's side

What was built. The constraint is the same as every beta: no server
(`PLAN.md`, shape B). A save lives on one phone. So "log in" is a role on the
save, and what crosses between coach and trainee is text.

| Piece | What it is |
|---|---|
| **Role** | A save is a trainee's or a coach's (`save.role`). The title screen offers both: *Start: who are you here?* (trainee) and *I am a coach: set up my trainees*. |
| **Coach profile** | Name and department. The name goes on the codes, so a trainee sees who assigned them. Nothing else about the coach is stored. |
| **Roster** | On the coach's save: each trainee's name, seat, department, the modules assigned in the coach's order, whether they open in order (each on the sign-off of the one before, as the track does) or all at once, and a note. |
| **Assignment code** | `SHFTA1.` plus the roster row, about 200 characters: fits a text message. The trainee pastes it on the title screen. Their profile is made or changed to the assigned seat and department (they still add what they want to work on); their track shows only the assigned modules, in the coach's order, with "Assigned by R. Okafor" at the top. The seat and department chips are locked while an assignment stands. |
| **Progress code** | `SHFTP1.`, from *Progress code, for your coach* on the track: per assigned module, plays, wins, the last read on each focus area, the commitment and its date, the sign-off. About 300 characters. Not the save, and not the debrief answers; those stay on the trainee's phone. The coach pastes it on the trainee's roster card and sees each module as not started, played, got through, debriefed or signed off. |
| **The page's store** | When the page is open on claude.ai and the trainee is signed in, *Send from this page* writes the same progress to the store under the testers'-thoughts rule (each writes their own; the owner reads). The coach's *Fetch progress sent from the page* reads them all and matches by trainee id. The code is the route that always works; the store is the one-tap route when both are on claude.ai. |
| **Group sessions** | A third tab on the coach's screen: the six sessions, each with its module, size, minutes, the plan by block, the debrief questions, the reveal (folded: "For you, not the room") and the commitment card. *Run it on this screen* starts the module as a session (section 3); *Notes to print* is the facilitator's page. |

What was measured. The save contract test loads a v4 fixture (an assigned
trainee mid-run) and the three older ones; the coach test round-trips an
assignment code and a progress code and checks that the debrief answers are
not in the progress code. A scripted walk of the built page at 390 px
(`tools/_coachwalk.mjs`, scratch) runs coach to trainee to coach with no
page errors. The module gate is unchanged: no mechanic moved.

What it is not. There is no account, no password and no list of who is
coaching whom anywhere but on the coach's phone. A trainee can drop an
assignment (start over) and play the whole track; the assignment is a path,
not a lock, which is the rule from `path.js`: "a recommendation, never a gate
on a person". If the author wants it to be a lock, that is one line, and a
decision to log first.

## 3. The group sessions

Redirected the same day. The first draft had everyone in the room playing
on their own phone with the same seed. The author: "I want the group event
to be a facilitator using one screen to work through problems or theories
with the group watching, conversing, participating, etc. the facilitator
would have printed out notes to go off of, or something like that."

So a session is **one run of one module on one screen**, driven by the
facilitator, with the room deciding out loud. Built in beta 13:

- *Run it on this screen* on the coach's sessions tab starts the module as
  an ordinary run (the engine does not know about the room) and marks the
  save with the session. On a screen wider than 900 px the page widens and
  the type grows for a projector.
- A facilitator's strip above the week: what to say before the brief, the
  line for this particular week where the session has one (the Saturday
  call, Theresa's note, the week the tack check comes back), and the standing
  rule for every week folded under it. The room sees the ticket and the
  options; the facilitator takes hands and taps what the room picks.
- The end screen in a session shows the close, the debrief questions for the
  room, the reveal folded until the room has answered, the commitment card,
  and *End the session*.
- *Notes to print*: a page laid out for the browser's print with the buttons
  off the paper; the same notes for all six are `GROUPS.md`. The page cannot
  call print itself (framed hosts refuse it), so the facilitator prints from
  the browser menu.

The "same seed on every phone" gap from the first draft is gone with the
draft: one screen is one seed.

Outlined from the author's own material: the cohort session shape (ninety
minutes: open on last time's commitment, the teachable, pairs, a
self-rating, the commitments, one pattern named at the close), the
systems-thinking simulation kit (a scenario the room thinks through, a
facilitator layer it does not see until the debrief, the five task
questions, the predictable failure modes, a commitment each), the
leading-at-every-level kit ("Whose job is it?", the peer-alignment check),
and the plane exercise as the rounds. `PLAN.md` section 5 listed six
leadership-team modules for a later group mode with a shared plant; those
need a mechanic that does not exist (several players on one plant). These
six do not: the room runs one module on one screen, and the room is the
mechanic.

| Session | Built on | Minutes | From |
|---|---|---|---|
| The round board | Round two | 90 | The plane exercise; Handbook 2 |
| Why it lands in paint | The other side | 120 | The systems-thinking simulation; Handbook 7, 4, 1 |
| Whose call is it | Nobody upstairs | 90 | "Whose job is it?"; Handbook 4, 8 |
| Same floor, different rules | Rush week | 90 | The peer-alignment check; Handbook 7 |
| The same fire | Firefighting | 90 | Handbook 1 |
| Where the week went | The week | 90 | Handbook 2 |

The full plans are in `src/data/groups.data.js` (the source of truth, shown
on the coach's screen and on the screen while a session runs) and
`GROUPS.md` (the facilitator's copy for printing).

## What the author should decide

- Whether an assignment is a path or a lock (see section 2).
- Whether the three unbuilt areas stay listed or come off the catalogue
  page until built.
- Whether the first rebuild is *Pulled off the floor*, as recommended.
