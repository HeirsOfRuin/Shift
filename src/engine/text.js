// The narrator. Every line the player reads comes from a key in text.data.js
// (or a module's own template) and has its tokens resolved here, once, from
// state (rule 8: words derive from state). An unknown key or token throws, so
// the text test catches it before a player sees "{a.him}" on screen.
//
// Tokens: {a} {b} {c} the people in play (a, b from the problem; c from vars),
// with .he .him .his .He .His .hes .Hes .full; cast names {dana} {russ} ...;
// and plain values {n} {asked} {weld} {demand}.

import { TEXT } from '../data/text.data.js';
import { CAST, CREW, PRONOUNS } from '../data/crew.data.js';
import { hashString } from './rng.js';

const CREW_BY_ID = Object.fromEntries(CREW.map((c) => [c.id, c]));

function who(s, vars, slot) {
  if (vars[slot] && typeof vars[slot] === 'object') return vars[slot];
  if (vars.p && (slot === 'a' || slot === 'b')) {
    const id = vars.p.who?.[slot === 'a' ? 0 : 1];
    if (id) return s?.crew?.find((c) => c.id === id) || CREW_BY_ID[id];
  }
  return null;
}

export function fill(s, template, vars = {}) {
  return template.replace(/\{([a-zA-Z]+)(?:\.([a-zA-Z]+))?\}/g, (m, base, part) => {
    const person = who(s, vars, base) || CAST[base] || null;
    if (person) {
      if (!part || part === 'name') return person.name;
      if (part === 'full') return person.full;
      const pr = PRONOUNS[person.pronoun]?.[part];
      if (pr) return pr;
      throw new Error(`unknown token ${m}`);
    }
    if (!part && vars[base] !== undefined && typeof vars[base] !== 'object') return String(vars[base]);
    throw new Error(`unknown token ${m}`);
  });
}

/** say(s, key, vars): one line, one variant chosen deterministically. */
export function say(s, key, vars = {}) {
  const entry = TEXT[key];
  if (entry === undefined) throw new Error(`no text for ${key}`);
  const variants = Array.isArray(entry) ? entry : [entry];
  const salt = vars.p?.id ?? vars.c?.id ?? vars.i ?? '';
  const i = hashString(`${s?.seed ?? 0}|${s?.week ?? 0}|${key}|${salt}`) % variants.length;
  return fill(s, variants[i], vars);
}

export const hasText = (key) => TEXT[key] !== undefined;
