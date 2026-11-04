// The numbers the week runs on. Logic-free. Every value is a first guess carried
// from the kill gate (docs/KILLGATE.md, run 7), not a fact; each module may
// override some of them in its setup.

export const CONFIG = {
  hoursCeiling: 40,          // a normal week; anything over is your own time
  tiredAt: 45,               // over this, the narrator notices
  fatigueAt: 50,             // over this, incident risk rises
  bottleneckAt: 55,          // over this, the crew starts waiting for you
  bottleneckWeeks: 3,        // that many weeks in a row and you are the bottleneck

  demand: 6,                 // bodies a week paint expects
  starveBelow: 4.75,         // a week under this counts toward paint starving
  starveWeeks: 2,            // two in a row ends the module
  scheduleShare: 0.95,       // shipped over demanded, at the end, to count as met

  rate: { fit: 3.9, weld: 2.35, finish: 3.8 },  // bodies a week per person at skill 0.6, morale 0.7, five days
  coverPerDay: 0.42,         // bodies a day when you weld a booth yourself
  weldContent: 1.1,          // welding work per body for the usual mix (Drayman = 1.0)
  baseDefect: 0.06,
  reworkCost: 0.5,           // finish capacity a defect found at finish costs
  escapeShare: 0.3,          // share of defects finish misses and paint finds
  fitRack: 4,                // fit-up stops when the rack holds this many

  // The standing week. `seats` says who has it; a lead hand has no production
  // meeting, no timecards and no capacity numbers (those are the supervisor's),
  // and ten minutes with the supervisor at the end of each day instead.
  routine: [
    { id: 'meeting', label: 'Production meeting', hours: 2, why: 'Dana runs it Tuesdays. Skip it and she hears about your week from someone else.', seats: ['supervisor'] },
    { id: 'scheduler', label: "Jess's capacity numbers", hours: 1, why: 'Jess builds next week from them. Skip it and next week holds a surprise.', seats: ['supervisor'] },
    { id: 'safety', label: 'Safety walk', hours: 1, why: 'Thursday, with the checklist. Skip it and nobody looks.', seats: ['supervisor', 'lead'] },
    { id: 'timecards', label: 'Timecards', hours: 1.5, why: 'Payroll needs them by Friday, and they are where lateness shows up.', seats: ['supervisor'] },
    { id: 'paint', label: 'Paint handoff', hours: 0.5, why: 'Ten minutes a day at the paint door. Skip it and more of your rework goes over.', seats: ['supervisor', 'lead'] },
    { id: 'huddles', label: 'Morning huddles', hours: 2.5, why: 'Five minutes a day with the crew. Skip them and the day starts without a plan.', seats: ['supervisor', 'lead'] },
    { id: 'handover', label: 'Ten minutes with Kev', hours: 1, why: 'End of each day, at his door. Skip it and he hears about your week from someone else.', seats: ['lead'] },
  ],
  // The lead hand's seat: the floor is the table. Leading comes off the table
  // unless the lead stays past forty to make it up (FRAME-seats.md).
  lead: { table: 22, floorLoad: [
    { id: 'table', label: 'At the table: your own fit-up work', hours: 22 },
    { id: 'walkups', label: 'Walk-ups: the crew asks you first', hours: 3 },
  ] },

  interrupts: { base: 22, perProblem: 3, perSeverity: 1.5, newHand: 1, leadOut: 6, leadStrained: 2 },
  // A clean week (no open problems) leaves about eight hours after the floor
  // and the standing week; every open problem eats three or more of them, so a
  // well-run department fits in forty and a festering one does not (beta 2).
  // What the floor's base hours are made of, so the week shows where the time
  // goes (the author on beta 1: "You never felt under pressure much"; a grey
  // block of 30 hours was nothing to push against). Sums to interrupts.base.
  floorLoad: [
    { id: 'walkups', label: 'Walk-ups: questions, a missing part, where does this go', hours: 7 },
    { id: 'chasing', label: 'Chasing fabrication and stores for parts', hours: 6 },
    { id: 'calls', label: 'Paint and QC calls about bodies already gone', hours: 4 },
    { id: 'office', label: 'Email, the phone, the office', hours: 5 },
  ],
  // Over forty is a symptom (the author: "If a job can't be done in your
  // scheduled time, something is wrong"). Weeks over forty build fatigue;
  // weeks under it let it recover. Run down, your fixes work less often.
  tiredPerHour: 1 / 8, tiredRecover: 0.6, tiredSlips: 1, tiredHome: 1.6, tiredOdds: 0.82,
  walkHours: 2,
  coverMax: 3,

  incidentBase: 0.0012,      // per person per week
  sickChance: 0.05, pressChance: 0.08, rushChance: 0.1, changeChance: 0.06,
  quitMorale: 0.22,
  moraleHome: 0.68,
  standardHome: 0.7,         // the department's standard: what is actually held
};
