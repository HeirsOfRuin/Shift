// The facade the UI, the bots and the tests use. Nothing else in src/engine is
// imported from outside the engine.

export { newSave, setProfile, order, startRun, playWeek, endRun, saveDebrief, signOff, setOpenAll, markSeen, unlocked, SAVE_KEY, serialize, deserialize, toCode, fromCode, migrate, SAVE_VERSION } from './state.js';
export { newModule, advance, hoursFor } from './week.js';
export { trackView, briefView, weekView, floorView, crewView, demoFloor, crewStrip, peopleView, profileView, MODULES, TRACK } from './view.js';
export { pathFor } from './path.js';
export { AREAS, FAMILIES } from '../data/focus.data.js';
export { SEATS, DEPARTMENTS, GROUPS, WRITTEN_BAY } from '../data/departments.data.js';
