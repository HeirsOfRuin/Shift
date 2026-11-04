// The trainee's path: the track's modules in the order their profile suggests,
// with the reason for each. Pure. The coach can override it by opening every
// module; the path is a recommendation, never a gate on a person.
//
// Order: modules that train something the trainee said they want to work on,
// then modules on what their seat leans on, then the rest in the written order,
// and last the modules that only train what they called a strength (played as
// a check, not skipped: a self-rating is a claim).

import { MODULES, TRACK } from '../data/modules.data.js';
import { AREAS } from '../data/focus.data.js';
import { SEATS } from '../data/departments.data.js';

export function pathFor(profile) {
  const work = profile?.work || [];
  const strengths = profile?.strengths || [];
  const leans = SEATS[profile?.seat]?.leans || [];
  const label = (a) => AREAS[a].label.toLowerCase();
  const scored = TRACK.modules.map((id, i) => {
    const focus = MODULES[id].focus;
    const onWork = focus.filter((a) => work.includes(a));
    const onLean = focus.filter((a) => leans.includes(a));
    const onlyStrength = focus.length > 0 && focus.every((a) => strengths.includes(a));
    let rank;
    let why;
    if (onWork.length) { rank = 0; why = `You said you want to work on ${onWork.map(label).join(' and ')}.`; }
    else if (onlyStrength) { rank = 3; why = `You called ${focus.map(label).join(' and ')} a strength. Played last, as a check.`; }
    else if (onLean.length) { rank = 1; why = `${SEATS[profile.seat].label}s lean on ${onLean.map(label).join(' and ')}.`; }
    else { rank = 2; why = `Rounds out the track: ${focus.map(label).join(' and ')}.`; }
    return { id, rank, hits: onWork.length, i, why };
  });
  return scored.sort((a, b) => a.rank - b.rank || b.hits - a.hits || a.i - b.i).map(({ id, why }) => ({ id, why }));
}
