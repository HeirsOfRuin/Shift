// Numbers more than one module needs: one derivation per number (rule 1).
import { CONFIG as C } from '../data/config.data.js';

export const clamp = (x, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, x));
export const round1 = (x) => Math.round(x * 10) / 10;
export const active = (c) => c.status === 'active';
export const person = (s, id) => s.crew.find((c) => c.id === id);

/** Bodies a week a person makes at their station, as they are this week. */
export function capacity(c) {
  if (!active(c)) return 0;
  const avail = clamp((5 - c.daysOut - c.lateness) / 5, 0, 1);
  const skillF = (0.6 + 0.5 * c.skill) / 0.9;
  const moraleF = (0.85 + 0.25 * c.morale) / 1.025;
  return C.rate[c.station] * skillF * moraleF * avail * (c.cramped ? 0.85 : 1);
}

/** What the booths look good for on Monday, before the week happens. */
export function weldForecast(s) {
  const weld = s.crew.filter((c) => c.station === 'weld').reduce((a, c) => a + capacity(c), 0) / s.monday.weldContent;
  return round1(weld);
}

/** A word for a number the player should feel, not read. */
export function moodWord(m) {
  if (m >= 0.72) return 'good';
  if (m >= 0.6) return 'fine';
  if (m >= 0.45) return 'flat';
  if (m >= 0.3) return 'low';
  return 'done in';
}
export function standardWord(x) {
  if (x >= 0.72) return 'held';
  if (x >= 0.62) return 'mostly held';
  if (x >= 0.5) return 'slipping';
  return 'whatever gets it out the door';
}
export function trustWord(x) {
  if (x >= 0.7) return 'trusts you';
  if (x >= 0.5) return 'gives you the benefit of the doubt';
  if (x >= 0.35) return 'wary';
  return 'has stopped telling you things';
}
