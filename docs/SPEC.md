# Shift, Supervisor track: one-page spec

Stage 1 of the workshop workflow. The author approves this before the kill gate
is built. Numbers here are first guesses and become parameters of the prototype.

## Setting

Northern Motors, ninety-two people, builds three
vehicle lines with a variant each (a work truck, a van, a 4x4 field vehicle)
from raw steel to drive-away. Seven production departments in flow order:
fabrication, machining, welding, paint, electrical, interior, assembly. Tires
and windows are the only finished parts bought in. Six vehicles a week when
everything works, which it rarely does, and the mix of the six decides which
department is the bottleneck. The people and the vehicles are in `ORG.md`.

You are the welding supervisor: seven welders and fitters, a department fed by
fabrication and machining and waited on by paint. Your manager is one of two
operations managers; the plant manager is above them. Any of these people can
be absent, quit or get promoted mid-module.

Why a game: a supervisor's week is a scheduling problem with people in it, and
the cost of each decision arrives late. A simulation can show the lag; a
lecture can only describe it.

## Core loop (one week)

1. **Monday.** Read the floor (crew sprites, numbers, an inbox of eight to ten
   items). Put your 40 hours on actions. What you refuse stays visible.
2. **Huddle.** Five minutes with the crew: what you raise, what you park, who
   owns what.
3. **Events.** Interruptions land mid-week and take hours from the plan. A
   problem may surface; its cause is drawn hidden.
4. **Work.** The cell runs: stations, work in progress, the bottleneck, yield,
   rework. Bodies go to paint, or they do not.
5. **Friday.** The report, in the plant's voice, with the numbers. Consequences
   queued in earlier weeks land. The planner names what limited you this week
   and the one lever that would change it.

## The scarce resource

Your hours: forty against a floor that would take eighty. Every game the
workshop has built makes money the constraint; Shift has no money. The second
resource is the crew's trust in you, which spends down fast and builds back
slowly.

## The per-week decision

Which inbox items you do, which you refuse, and whom you spend time on. Each
hour goes to one of six kinds of action: cover a station yourself (fast, and
nothing changes), coach (slow, compounding), document and hold a standard
(costly now, cheap later), investigate (hours for information), improve (hours
now, throughput later), or let it ride (free until it is not). The right mix
depends on causes you cannot see yet.

## The ways to lose

1. **Paint starves.** Throughput under the floor two weeks running. The plant
   misses builds and your manager takes the schedule out of your hands.
2. **You lose a person.** A quit, a serious incident, or a discipline case that
   collapses because nothing was written down. The report traces it to the
   signal you skipped.
3. **You become the bottleneck.** Three weeks over 55 hours. The crew routes
   everything through you and the floor shows them waiting.

## The one way to win

End the module with the schedule met, the crew intact, and the module's problem
solved at the root rather than tolerated or blown up. That holds for every
module and every seed: ship, keep your people, fix the cause. Different
policies can win; none wins every seed.

## What carries over

Within a track: crew traits, trust, your notes and the consequence queue carry
from module to module; the practice profile accumulates. Across tracks: the
plant and the crew. Redrawn every run: hidden causes. Reset every week: hours.

## Kill gate

A numbers-only simulation in `prototypes/killgate/`: the cell, hours, people,
lag; no interface. Five bot policies (firefighter, documenter, coach, ignorer,
balanced), 50 seeds each, eight weeks. Distributions of throughput, quits,
incidents and hours worked.

Pass when: the policies' outcomes differ beyond the noise floor; no policy wins
on every axis; the balanced policy reaches the win in most seeds but not all;
the ignorer loses most seeds but not all. The last condition matters most: if
ignoring always loses, the tool preaches, and nobody who works a floor
believes a tool that preaches.

## First numbers

| Parameter | First guess |
|---|---|
| Crew | 7: two fitters, three body welders, two finish and inspect |
| Stations | Fit-up (2), body weld (3), finish (2); body weld is the bottleneck at 6 a week fully staffed, about 4.5 with one absent |
| Demand | 6 bodies a week to paint; floor is 5 |
| Hour costs | Coaching 1; documented accountability meeting 1.5; investigation 3; huddle prep 0.5; standard-work write-up 4; covering a station 8 a day |
| Lags | Skipped coaching: 4 to 7 weeks to a quit or a defect. Tolerated lateness: 2 to 3 weeks to spread. Documented case: 1 week to resolution or escalation, by cause |
| Hidden causes for a late arrival | Childcare 40%, ride 30%, attitude 30%; the right action differs for each |
