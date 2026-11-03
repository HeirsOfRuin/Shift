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

  routine: [
    { id: 'meeting', label: 'Production meeting', hours: 2, why: 'Dana runs it Tuesdays. Skip it and she hears about your week from someone else.' },
    { id: 'scheduler', label: "Jess's capacity numbers", hours: 1, why: 'Jess builds next week from them. Skip it and next week holds a surprise.' },
    { id: 'safety', label: 'Safety walk', hours: 1, why: 'Thursday, with the checklist. Skip it and nobody looks.' },
    { id: 'timecards', label: 'Timecards', hours: 1.5, why: 'Payroll needs them by Friday, and they are where lateness shows up.' },
    { id: 'paint', label: 'Paint handoff', hours: 0.5, why: 'Ten minutes a day at the paint door. Skip it and more of your rework goes over.' },
    { id: 'huddles', label: 'Morning huddles', hours: 2.5, why: 'Five minutes a day with the crew. Skip them and the day starts without a plan.' },
  ],

  interrupts: { base: 27, perProblem: 2, perSeverity: 1, newHand: 1, leadOut: 6, leadStrained: 2 },
  walkHours: 2,
  coverMax: 3,

  incidentBase: 0.0012,      // per person per week
  sickChance: 0.05, pressChance: 0.08, rushChance: 0.1, changeChance: 0.06,
  quitMorale: 0.22,
  moraleHome: 0.68,
  standardHome: 0.7,         // the department's standard: what is actually held
};
