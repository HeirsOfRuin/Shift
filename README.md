# Shift

A leadership simulator for the shop floor. One fictional car plant, a week per
turn, forty hours to spend, problems whose causes are hidden, and consequences
that land weeks after the decision. A trainee runs a role in the plant for a
simulated season; a coach runs the debrief. It is a training tool with game
mechanics, not a video game about work.

**Status (2026-11-03):** plan and the Supervisor-track spec written; nothing
built. Next is the kill gate: a numbers-only simulation that has to prove the
loop produces different outcomes for different policies before any interface
or art exists.

| Document | Holds |
|---|---|
| `docs/CONCEPT.md` | Read first. The handoff: what Shift is, why, the sources, every decision in the author's words, the frameworks it measures against, what was set aside, status and next steps |
| `docs/PLAN.md` | The design plan: the plant, the week engine, six tracks, voice, art, measurement, build order, the author's decisions |
| `docs/ORG.md` | Tamarack Motor Works: the full org chart with a named cast, the welding crew, the six vehicles and how the mix moves the bottleneck |
| `docs/SPEC.md` | The one-page spec for the Supervisor track, the first thing built |

## What it is trying to be

- Practice, not a quiz. Every action costs hours and the result arrives later,
  so the only way to look good is to run the department well.
- Practice, not an assessment. Output is a practice profile beside the
  trainee's self-assessment and their coach's observation; the gap is the
  coaching conversation.
- Phone first, offline, installable, no server, no accounts. Runs live on the
  trainee's phone and leave as a printable summary.

## Rules the build follows

Built with the HeirsOfRuin game-building skills (`Game-Workshop/skills/`):
a pure deterministic engine, one derivation per number, nothing declared is
decoration, every harness proves progress, saves are contracts, and everything
is written down. The workshop's backlog (`Game-Workshop/docs/game-backlog.md`)
holds the entry; what this build teaches goes back there.

## Content

The plant, its crew and every scenario are fiction written for this tool. No
character is a real person and no order is a real order.
