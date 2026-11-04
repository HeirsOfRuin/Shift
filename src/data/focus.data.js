// The focus-area catalogue: what Shift trains. Logic-free.
//
// The author, 2026-11-04: "I don't want this whole thing to revolve around EI
// or LBA, It needs to cover a wide array of different topics and focus points,
// with modules designed to focus on one or two at a time." docs/CATALOGUE.md
// is the readable version of this file and docs/REVIEW.md the reasoning.
//
// Each area is defined by its moves: decisions a module can count. A module
// names one or two areas in `focus`; its end report reads only those. Moves in
// other areas are still recorded and shown, unrated.
//
// `lba` and `principles` are lookups, not the frame: the pilot can line Shift's
// practice up against the author's Leadership Behaviour Assessment, and the
// Northbound remake against the Five Principles. No LBA item text is here
// (CLAUDE.md); names only.

export const FAMILIES = {
  A: 'Running the work',
  B: 'Flow and systems',
  C: 'Quality and safety',
  D: 'People',
  E: 'Up and across',
  F: 'Meetings and self',
};

export const AREAS = {
  A1: { family: 'A', label: 'Prioritisation', about: 'Spending hours on what moves the goal, and saying no to what does not.',
    moves: ['Spends hours on what moves the goal', 'Refuses low-value work out loud', 'Protects time for the important thing that is not urgent'],
    lba: ['Impulse Control'], principles: ['Decision Quality', 'Execution Discipline'] },
  A2: { family: 'A', label: 'Time and interruptions', about: 'Keeping the week inside its limit while the floor keeps asking for it.',
    moves: ['Keeps the week inside forty and still acts', 'Notices what pushed the week over and changes it', 'Does not let the floor take the whole week'],
    lba: ['Impulse Control'], principles: ['Execution Discipline'] },
  A3: { family: 'A', label: 'Planning and capacity', about: 'Knowing what next week holds before it arrives.',
    moves: ['Reads the forecast before committing', 'Covers a gap that is coming, not one that is imagined', 'Gives the scheduler honest numbers'],
    lba: ['Cross-Functional Awareness'], principles: ['Execution Discipline', 'Systems Alignment'] },
  A4: { family: 'A', label: 'Delegation', about: 'Handing off real work, with the authority to do it.',
    moves: ['Sees what only they are holding', 'Hands over a real piece of the job, not an errand', 'Does not take it back at the first wobble'],
    lba: ['Culture & Organizational Influence', 'Early Coaching & Guidance'], principles: ['People Development', 'Role Clarity'] },

  B1: { family: 'B', label: 'Finding the bottleneck', about: 'Improving the one station that limits everything, and only that one.',
    moves: ['Looks at where work waits before acting', 'Spends improvement hours on the constraint', 'Rechecks when the constraint moves'],
    lba: ['Openness to Improvement'], principles: ['Root-Cause Thinking', 'Systems Alignment'] },
  B2: { family: 'B', label: 'Lean tools', about: 'Picking the tool that fits, building it with the crew, and keeping it alive.',
    moves: ['Picks the tool that fits the problem', 'Builds it with the crew, not for them', 'Sets up the audit that keeps it alive'],
    lba: ['Openness to Improvement'], principles: ['Learning Systems', 'Execution Discipline'] },
  B3: { family: 'B', label: 'Root-cause problem solving', about: 'Going after why it keeps happening instead of fixing it again.',
    moves: ['Investigates before fixing', 'Fixes the cause, not the symptom', 'Changes course when a fix does not hold'],
    lba: ['Openness to Improvement'], principles: ['Root-Cause Thinking'] },
  B5: { family: 'B', label: 'Hidden rework', about: 'Rework that is not parts: the same conversation three times, an hour spent looking for what should have been to hand.',
    moves: ['Counts the rework nobody counts', 'Puts the answer where they would find it', 'Does not do the rework faster'],
    lba: ['Openness to Improvement'], principles: ['Learning Systems', 'Feedback Loops'] },
  B6: { family: 'B', label: 'The system', about: 'Knowing what the system does with what the floor enters, and what it cannot do with what the floor does not.',
    moves: ['Traces a job past the screen they use', 'Fixes the entry where it happens, not the report', 'Does not keep a second system'],
    lba: ['Cross-Functional Awareness'], principles: ['Systems Alignment', 'Execution Discipline'] },
  B4: { family: 'B', label: 'Metrics and data', about: 'Reading the signal before the Friday number, and spotting a measure being gamed.',
    moves: ['Reads leading signals, not just the result', 'Spots a measure being gamed', 'Changes the measure, not just the people'],
    lba: ['Openness to Improvement'], principles: ['Feedback Loops', 'Learning Systems'] },

  C1: { family: 'C', label: 'Holding the standard', about: 'Keeping the standard when the number is short, and saying so out loud.',
    moves: ['Keeps the standard when the number is short', 'Makes an exception visible and temporary', 'Takes the exception back when the pressure ends'],
    lba: ['Accountability Management', 'Tone-Setting', 'Respect & Professionalism'], principles: ['Values in Action', 'Behavioral Norms'] },
  C2: { family: 'C', label: 'Safety', about: 'Acting on the first report, not the third.',
    moves: ['Goes and looks when someone raises safety', 'Makes it safe before it is fixed', 'Closes the action instead of carrying it'],
    lba: ['Accountability Management', 'Basic Empathy'], principles: ['Values in Action', 'Behavioral Norms'] },
  C3: { family: 'C', label: 'Quality at the source', about: 'Finding defects where they are made, not where they are found.',
    moves: ['Traces a defect to where it was made', 'Feeds back upstream', 'Does not let rework hide the cause'],
    lba: ['Openness to Improvement'], principles: ['Root-Cause Thinking', 'Feedback Loops'] },

  D1: { family: 'D', label: 'Coaching and development', about: 'Coaching early, at the bench, and building people before they are needed.',
    moves: ['Coaches early, at the bench', 'Asks before acting on someone', 'Fits the help to the reason'],
    lba: ['Early Coaching & Guidance', 'Basic Empathy'], principles: ['People Development'] },
  D2: { family: 'D', label: 'Accountability', about: 'Finding out why, fitting the response to the cause, and following through.',
    moves: ['Finds out why before acting', 'Fits the response to the cause', 'Holds the line when it is a choice'],
    lba: ['Accountability Management', 'Basic Empathy'], principles: ['Influence & Accountability'] },
  D3: { family: 'D', label: 'Conflict', about: 'Getting to the bottom of friction that flares and goes quiet.',
    moves: ['Hears both sides first', 'Fixes the work or the gap, not just the flare', 'Sets out how people treat each other when that is the problem'],
    lba: ['Recurring Conflict Resolution', 'Peer Conflict Prevention'], principles: ['Feedback Loops', 'Behavioral Norms'] },
  D4: { family: 'D', label: 'Training and onboarding', about: 'Teaching the task and the reason, and checking it landed.',
    moves: ['Answers a new hand at the bench', 'Teaches the reason, not just the steps', 'Checks understanding, not attendance'],
    lba: ['Early Coaching & Guidance'], principles: ['People Development'] },

  E1: { family: 'E', label: 'Leading up and decision rights', about: 'Knowing whose call it is, and bringing problems up early with the facts.',
    moves: ['Finds out whose call it is', 'Makes the calls that are theirs', 'Uses the chain instead of going around it'],
    lba: ['Cross-Functional Awareness', 'Emotional Awareness'], principles: ['Role Clarity', 'Vertical Communication'] },
  E2: { family: 'E', label: 'Working across', about: 'Going to the peer before going up, and fixing the handoff instead of the blame.',
    moves: ['Goes across before going up', 'Fixes the handoff, not the blame', 'Agrees one standard at the interface'],
    lba: ['Cross-Functional Awareness', 'Peer Conflict Prevention'], principles: ['Cross-Functional Communication', 'Systems Alignment'] },
  E4: { family: 'E', label: 'Internal customers', about: 'Knowing who receives your work and what they need from it, which is not always what they asked for.',
    moves: ['Asks the receiver what they need', 'Delivers what was needed, not what was asked for', 'Measures by the receiver\'s week, not their own'],
    lba: ['Cross-Functional Awareness'], principles: ['Cross-Functional Communication', 'Systems Alignment'] },
  E3: { family: 'E', label: 'Leading change', about: 'Explaining why before what, and keeping a change alive past week two.',
    moves: ['Explains the why before the what', 'Involves the sceptics', 'Keeps the change alive after the launch'],
    lba: ['Constructive Influence', 'Culture & Organizational Influence'], principles: ['Engagement & Ownership', 'Influence & Accountability'] },

  F1: { family: 'F', label: 'Running a huddle', about: 'Five minutes, every action with an owner, problems parked not solved.',
    moves: ['Starts on time and keeps it short', 'Gives every action an owner', 'Handles the derailer without losing the room'],
    lba: ['Tone-Setting', 'Constructive Influence'], principles: ['Vertical Communication', 'Feedback Loops'] },
  F2: { family: 'F', label: 'Self-management under pressure', about: 'Noticing your own load before it makes your decisions for you.',
    moves: ['Notices their own load and pulls back', 'Does not grind past the point of being useful', 'Recovers the week instead of carrying it'],
    lba: ['Emotional Awareness', 'Impulse Control'], principles: ['Decision Quality'] },
};

// The three-level read for a focus area in one run. Points: a good move scores
// +2, a mixed one 0 or +1, a miss -1, so a run of all good moves reads 1.0.
// Calibrated on the bots (DESIGN.md decisions log, 2026-11-04).
export const READ = {
  minDecisions: 3,
  levels: [
    { min: 0.6, id: 'solid', label: 'Solid' },
    { min: 0.25, id: 'getting', label: 'Getting there' },
    { min: -Infinity, id: 'notyet', label: 'Not yet' },
  ],
  thin: 'Not enough seen',
};

// The self-rating a profile gives each area.
export const SELF = { strength: 'Strength', work: 'Want to work on' };
export const SELF_LIMIT = 3;
