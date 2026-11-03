# Shift beta 1: the Supervisor track

Published 2026-11-03 as a private page:
**https://claude.ai/artifact/4c5QqYTmZdn5iKcutCPZJx**
(only the author can open it until he shares it from the page's Share menu).
Built from commit `6ad35b4` plus the layout fix that followed; rebuild with
`npm run build` and republish `dist/shift.embed.html` to the same link.

This is the calibration gate (workflow stage 5) and the vertical slice (stage
6) at once: the author's verdict on voice, look and length happens on this
build.

## What is in it

- The Supervisor track: eight modules, 6 to 8 simulated weeks each, about 15
  to 25 minutes a module.
- The week screen: the pixel bay (tap a person to see how they look), the
  hours bar against a forty-hour week, and the inbox as work tickets: the
  module's problem first, requests, your standing week, an hour with someone,
  welding a booth yourself, walking the floor. Every option shows its hours.
- The Friday report, the crew, the log, the end report (what you met, what
  came from what, what is still open, the practice profile), the debrief with
  coach sign-off, and save codes.
- The beta switch on the track screen opens every module at once. Without it,
  each module opens when the one before it is debriefed and signed off.

## How to test it

1. Open the link on your phone. Start the Supervisor track. Play **The week**
   honestly, the way you would run your own week.
2. Read the end report. Then play it again: a replay draws new hidden causes,
   so the same choices do not give the same week.
3. Do the debrief as if you were the trainee, and sign it off as the coach.
4. Turn on the beta switch and play **The late one** and **Rush week**.
5. Write down, as you go, anything from this list:

| Look for | Why it matters |
|---|---|
| A line that does not sound like a person | The voice is the thing a trainee will believe or not |
| A scenario that would never happen on a real floor | The pilot's first question: which scenarios feel fake |
| An option you wanted that is not there | Missing levers make it a quiz |
| A result that felt unfair, not just bad | The difference between a lesson and a dice roll |
| A screen where you did not know what to do | Rule 6: every state says why and what changes it |
| How long a module took | The plan guesses 15 to 25 minutes |
| Whether the debrief questions would start a real conversation | The debrief is the product |

Notes can go anywhere. Comments on the artifact page sent to Claude reach the
session that published it while that session is alive; a new session should
read this file and `CONCEPT.md` first.

## What was measured before you saw it

Every module passed the kill gate's five conditions with the engine's own
bots, 100 seeds per style (`node sim/gate.js --runs=100`; full tables in
`DESIGN.md` section 12). Win rates:

| Module | Balanced | Coach | Documenter | Firefighter | Doing nothing |
|---|---|---|---|---|---|
| The week | 88% ±3 | 73% ±4 | 77% ±4 | 70% ±5 | 15% ±4 |
| The late one | 83% ±4 | 61% ±5 | 45% ±5 | 26% ±4 | 23% ±4 |
| The loop | 82% ±4 | 60% ±5 | 0% ±1 | 0% ±1 | 12% ±3 |
| Firefighting | 85% ±4 | 86% ±3 | 38% ±5 | 13% ±3 | 11% ±3 |
| Pulled off the floor | 83% ±4 | 83% ±4 | 62% ±5 | 64% ±5 | 45% ±5 |
| Nobody upstairs | 86% ±3 | 39% ±5 | 36% ±5 | 35% ±5 | 6% ±2 |
| Rush week | 77% ±4 | 0% ±1 | 53% ±5 | 0% ±1 | 12% ±3 |
| Across | 73% ±4 | 59% ±5 | 31% ±5 | 6% ±2 | 6% ±2 |

The bots are disciplined diagnosticians with no hunches. A person will notice
later, believe more stories and cover more; expect to win less often than the
balanced bot, and expect that gap to be the coaching conversation.

## Known gaps, stated plainly

- **Two modules separate the styles weakly.** In *The week*, a work order
  fixes most extractor causes, so most styles get through; the lesson lives in
  the hours and the refusals more than in the win. In *Pulled off the floor*,
  doing nothing still gets through 45% of the time. Both pass the gate; both
  are first candidates for tuning after your verdict.
- **Every number is a first guess** carried from the kill gate: capacity,
  hours, odds, lags. The gate shows the loop has the right shape, not the
  right calibration.
- **Text repeats on replays.** About 460 lines, two or three variants for the
  frequent ones. The voice has not had your verdict yet.
- **The practice profile's subdomain-to-domain mapping is the agent's
  reading** of your LBA standard (`src/data/tags.data.js`). Confirm or correct
  it; nothing else changes if you do.
- **Saves live on one device.** The artifact page and an installed copy keep
  separate saves. A save code moves progress anywhere.
- **Coach sign-off is honour system.** Anyone holding the phone can sign.
  Fine for a pilot with willing people; not for anything official.
- **Only the Supervisor track.** Lead, Manager, CI/Lean, Facilitator and the
  leadership group are planned (`PLAN.md`), not built.
- **No Pages site** while the repository is private; the beta ships as one
  file.

## What happens next

1. The author plays the beta and gives a verdict on voice, look, length and
   the scenarios that feel fake.
2. Those notes go into `DESIGN.md`'s decisions log in his words, and each
   change is framed, built, measured with the gate and re-published to the
   same link.
3. Then the pilot (`PLAN.md` section 12, stage 7): three to five people,
   six weeks, a lessons log from day one.
