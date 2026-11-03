// The welding department and the people around it (docs/ORG.md). Fiction: no
// one here is a real person. Logic-free.

export const CREW = [
  { id: 'kev', name: 'Kev', full: 'Kev Dueck', pronoun: 'he', station: 'fit', slot: 0, skill: 0.85, morale: 0.7, trust: 0.6, lead: true,
    look: { skin: 1, hair: 'short', hairColour: 2, beard: true, build: 'broad' },
    about: 'Lead. Fourteen years. Steady and fast, carries more than his share. The crew asks him before they ask you.' },
  { id: 'lyle', name: 'Lyle', full: 'Lyle Cardinal', pronoun: 'he', station: 'fit', slot: 1, skill: 0.8, morale: 0.65, trust: 0.5,
    look: { skin: 3, hair: 'cap', hairColour: 0, beard: false, build: 'lean' },
    about: 'Fit-up. Six years. Careful and quiet; the best jig man in the plant. Says little in huddles.' },
  { id: 'brent', name: 'Brent', full: 'Brent Olafson', pronoun: 'he', station: 'weld', slot: 0, skill: 0.75, morale: 0.7, trust: 0.5,
    look: { skin: 0, hair: 'messy', hairColour: 3, beard: false, build: 'broad' },
    about: 'Body weld. Four years. A strong welder and a loud one. The crew likes him. Late sometimes.' },
  { id: 'marisol', name: 'Marisol', full: 'Marisol Reyes', pronoun: 'she', station: 'weld', slot: 1, skill: 0.62, morale: 0.7, trust: 0.55,
    look: { skin: 2, hair: 'bun', hairColour: 0, beard: false, build: 'lean' },
    about: 'Body weld. Two years. Precise, improving fast, asks good questions. Hard on herself.' },
  { id: 'tyler', name: 'Tyler', full: 'Tyler Wiebe', pronoun: 'he', station: 'weld', slot: 2, skill: 0.5, morale: 0.7, trust: 0.5,
    look: { skin: 0, hair: 'short', hairColour: 1, beard: false, build: 'lean' },
    about: 'Body weld. Nine months. Quick hands, quick to rush. Three small rework tickets last month.' },
  { id: 'donna', name: 'Donna', full: 'Donna Kirkpatrick', pronoun: 'she', station: 'finish', slot: 0, skill: 0.85, morale: 0.68, trust: 0.55,
    look: { skin: 0, hair: 'long', hairColour: 4, beard: false, build: 'medium' },
    about: "Finish and inspect. Eleven years. Sees everything and tells you most of it. Kev's peer, not always his friend." },
  { id: 'joel', name: 'Joel', full: 'Joel Nguyen', pronoun: 'he', station: 'finish', slot: 1, skill: 0.4, morale: 0.75, trust: 0.5,
    look: { skin: 2, hair: 'short', hairColour: 0, beard: false, build: 'lean' },
    about: 'Finish and inspect. Three months. New, keen, hesitates. Trained by Donna, watched by everyone.' },
];

export const STATIONS = {
  fit: { label: 'Fit-up', seats: 2 },
  weld: { label: 'Body weld', seats: 3 },
  finish: { label: 'Finish and inspect', seats: 2 },
};

// The people around you, for text and for the modules that need them.
export const CAST = {
  dana: { name: 'Dana', full: 'Dana Fiorino', pronoun: 'she', role: 'Operations Manager, Metal: your manager' },
  russ: { name: 'Russ', full: 'Russ Penner', pronoun: 'he', role: 'Plant Manager' },
  irene: { name: 'Irene', full: 'Irene Kowalski', pronoun: 'she', role: 'COO' },
  glen: { name: 'Glen', full: 'Glen Marchand', pronoun: 'he', role: 'CEO and founder' },
  theresa: { name: 'Theresa', full: 'Theresa Boucher', pronoun: 'she', role: 'Paint supervisor' },
  raymond: { name: 'Raymond', full: 'Raymond Bergen', pronoun: 'he', role: 'Fabrication supervisor' },
  jess: { name: 'Jess', full: 'Jess Friesen', pronoun: 'she', role: 'Production scheduler' },
  val: { name: 'Val', full: 'Val Petrov', pronoun: 'she', role: 'QC lead' },
  simone: { name: 'Simone', full: 'Simone Lavoie', pronoun: 'she', role: 'Product Manager' },
  corey: { name: 'Corey', full: 'Corey Lund', pronoun: 'he', role: 'Sales Manager' },
  marion: { name: 'Marion', full: 'Marion Dyck', pronoun: 'she', role: 'Controller (HR goes through her office)' },
};

export const PRONOUNS = {
  he: { he: 'he', him: 'him', his: 'his', He: 'He', His: 'His', Him: 'Him', hes: "he's", Hes: "He's" },
  she: { he: 'she', him: 'her', his: 'her', He: 'She', His: 'Her', Him: 'Her', hes: "she's", Hes: "She's" },
};
