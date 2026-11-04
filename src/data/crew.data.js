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

// The lead hand's seat: the player works fit-up in Kev's old spot, and Kev is
// the supervisor. Problems never land on the player.
export const PLAYER_LEAD = { id: 'you', name: 'You', full: 'You', pronoun: 'he', station: 'fit', slot: 0, skill: 0.85, morale: 0.7, trust: 1, lead: true, player: true,
  look: { skin: 1, hair: 'short', hairColour: 1, beard: false, build: 'medium' },
  about: 'Lead hand, fit-up. Kev\'s old spot. The first person everyone asks.' };

// Who holds which role around the player, by seat. {sup} and {senior} in text
// resolve through these: the supervisor seat reports to Dana and leans on Kev;
// the lead seat reports to Kev and leans on Lyle.
export const ROLES = {
  supervisor: { sup: { name: 'Dana', full: 'Dana Fiorino', pronoun: 'she' }, senior: { name: 'Kev', full: 'Kev Dueck', pronoun: 'he' } },
  lead: { sup: { name: 'Kev', full: 'Kev Dueck', pronoun: 'he' }, senior: { name: 'Lyle', full: 'Lyle Cardinal', pronoun: 'he' } },
  // the operations manager's seat: the player is Dana; Kev is the welding
  // supervisor she works through; Russ is above her
  manager: { sup: { name: 'Russ', full: 'Russ Penner', pronoun: 'he' }, senior: { name: 'Kev', full: 'Kev Dueck', pronoun: 'he' } },
};

// Fit-up's lead in the seats where Kev is the supervisor and the player is not
// at the table (the manager's seat).
export const DALE = { id: 'dale', name: 'Dale', full: 'Dale Harder', pronoun: 'he', station: 'fit', slot: 0, skill: 0.8, morale: 0.7, trust: 0.55, lead: true,
  look: { skin: 0, hair: 'cap', hairColour: 3, beard: true, build: 'broad' },
  about: 'Lead hand, fit-up. Took the lead job when Kev went up. Steady, says what he thinks once, quietly.' };

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

// Who is who beyond the bay (docs/ORG.md), for the People tab. The author on
// beta 1: "You had no clue who anyone was beyond the people on your screen."
export const PLANT = {
  name: 'Northern Motors',
  about: 'Ninety-two people in one plant, building three vehicle lines with a variant each from raw steel to drive-away, about six vehicles a week. Tires and glass are the only finished parts bought in. It grew from a twelve-person fabrication shop, and most of the people who ran it at twelve still run it at ninety-two.',
  flow: ['Fabrication', 'Machining', 'Welding (you)', 'Paint', 'Electrical', 'Interior', 'Assembly'],
  vehicles: [
    { name: 'Drayman and Drayman Crew', what: 'Work truck, flat deck; the Crew has a four-door cab and more welding' },
    { name: 'Hauler and Hauler 9', what: 'Cargo van and nine-seat passenger van; heavy on interior and electrical' },
    { name: 'Surveyor and Surveyor Rescue', what: '4x4 field vehicle and the fire and EMS fit-out; the longest build in the plant' },
  ],
  groups: [
    { title: 'Your chain', ids: ['dana', 'russ', 'irene', 'glen'] },
    { title: 'Your peers on the floor', ids: ['raymond', 'theresa'] },
    { title: 'People your week depends on', ids: ['jess', 'val', 'simone', 'corey', 'marion'] },
  ],
};
export const CAST_ABOUT = {
  dana: 'Your manager. Runs the Metal side: fabrication, machining, welding, paint. Fair, busy, hates surprises more than bad news.',
  russ: 'Plant manager. Came up through assembly and is still on the floor more than in his office. Answers email on Fridays.',
  irene: 'COO, hired three years ago to put structure in. Half the plant still routes around her to Glen.',
  glen: 'CEO and founder. Started it as a twelve-person fab shop. Walks the floor most mornings and still gives supervisors direct instructions, which nobody upstairs has told him to stop.',
  raymond: 'Fabrication supervisor, upstream of you. Good at his job, quiet about problems until someone brings him a part.',
  theresa: 'Paint supervisor, downstream of you. Always behind, always on the phone. You have never once sat down with her about anything.',
  jess: 'Production scheduler. The one person who knows how the schedule actually gets built. When she is away the plant runs on last week.',
  val: 'QC lead. Reports to the plant manager, not to engineering, which is why a recurring defect is a production problem first.',
  simone: 'Product manager, on the engineering side. Owns what each vehicle is and what sales may promise. Outnumbered.',
  corey: 'Sales manager. Sells on relationships and lead time. His promise of a date is how most rush orders reach your floor.',
  marion: 'Controller. HR goes through her office, and discipline paperwork goes past her desk; she is careful about it.',
};

export const PRONOUNS = {
  he: { he: 'he', him: 'him', his: 'his', He: 'He', His: 'His', Him: 'Him', hes: "he's", Hes: "He's" },
  she: { he: 'she', him: 'her', his: 'her', He: 'She', His: 'Her', Him: 'Her', hes: "she's", Hes: "She's" },
  it: { he: 'it', him: 'it', his: 'its', He: 'It', His: 'Its', Him: 'It', hes: "it's", Hes: "It's" },
};
