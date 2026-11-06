// The facade the UI, the bots and the tests use. Nothing else in src/engine is
// imported from outside the engine.

export { newSave, setProfile, order, seatFor, supports, startRun, playWeek, endRun, saveDebrief, signOff, setOpenAll, markSeen, unlocked, SAVE_KEY, serialize, deserialize, toCode, fromCode, migrate, SAVE_VERSION } from './state.js';
export { newModule, advance, hoursFor, tableFor, routineFor, crewFor } from './week.js';
export { trackView, briefView, weekView, floorView, crewView, demoFloor, crewStrip, peopleView, profileView, MODULES, TRACK } from './view.js';
export { pathFor } from './path.js';
export { otherWays, truthOf, WAYS } from './replay.js';
export { decide, POLICIES } from './bots.js';
export { becomeCoach, becomeTrainee, setTrainee, removeTrainee, assignmentCode, kindOf, readAssignment, takeAssignment, dropAssignment, progressOf, progressCode, readProgress, recordProgress, rosterView, assignable, startSession, endSession, roomView, ASSIGN_PREFIX, PROGRESS_PREFIX } from './coach.js';
export { GROUPS as GROUP_SESSIONS, GROUP_ORDER } from '../data/groups.data.js';
export { SEAT_AREA } from './outcome.js';
export { AREAS, FAMILIES } from '../data/focus.data.js';
export { SEATS, DEPARTMENTS, GROUPS, WRITTEN_BAY } from '../data/departments.data.js';
